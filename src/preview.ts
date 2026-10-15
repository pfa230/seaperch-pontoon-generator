import {
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { ModelMesh } from "./model";

// Direction from the pontoon's centre to the camera on reset: in front and
// slightly above, so the mount shows against the body.
const VIEW_DIRECTION = new Vector3(0, 1, 0.4).normalize();

export interface Preview {
  show(mesh: ModelMesh): void;
  clear(): void;
}

export function createPreview(container: HTMLElement): Preview {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true });
  } catch {
    container.textContent = "3D preview unavailable in this browser.";
    return { show: () => {}, clear: () => {} };
  }

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.domElement.style.touchAction = "none";
  container.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 10000);
  camera.up.set(0, 0, 1);

  // A fixed sky/ground fill plus a light on the camera, so the side facing the
  // user is always lit.
  scene.add(new HemisphereLight(0xffffff, 0x444444, 2));
  const light = new DirectionalLight(0xffffff, 2);
  light.position.set(0, 0, 1);
  const lightTarget = new Object3D();
  light.target = lightTarget;
  camera.add(light, lightTarget);
  scene.add(camera);

  const material = new MeshStandardMaterial({ color: 0x9aa7b0 });
  const object = new Mesh(new BufferGeometry(), material);
  object.visible = false;
  scene.add(object);

  const controls = new OrbitControls(camera, renderer.domElement);

  const render = () => renderer.render(scene, camera);
  controls.addEventListener("change", render);

  function fit() {
    object.geometry.computeBoundingSphere();
    const sphere = object.geometry.boundingSphere;
    if (!sphere || sphere.radius === 0) return;
    const halfFov = (camera.fov * Math.PI) / 360;
    const halfWidthFov = Math.atan(Math.tan(halfFov) * camera.aspect);
    const distance = sphere.radius / Math.sin(Math.min(halfFov, halfWidthFov));
    controls.target.copy(sphere.center);
    camera.position
      .copy(sphere.center)
      .addScaledVector(VIEW_DIRECTION, distance);
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 10 + sphere.radius;
    camera.updateProjectionMatrix();
    controls.update();
    render();
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = container;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(container);

  let framed = false;
  function show(mesh: ModelMesh) {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(mesh.vertices, 3));
    geometry.setAttribute("normal", new BufferAttribute(mesh.normals, 3));
    geometry.setIndex(new BufferAttribute(mesh.triangles, 1));
    object.geometry.dispose();
    object.geometry = geometry;
    object.visible = true;
    if (!framed) {
      framed = true;
      fit();
    } else {
      render();
    }
  }

  function clear() {
    object.visible = false;
    render();
  }

  document
    .querySelector<HTMLButtonElement>("#reset-view")
    ?.addEventListener("click", fit);

  return { show, clear };
}
