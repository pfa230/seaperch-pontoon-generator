import {
  draw,
  makeBox,
  makeCylinder,
  measureVolume,
  type Drawing,
  type Shape3D,
} from "replicad";
import {
  OVERHANG,
  frontCentre,
  jointDiameter,
  mountDiameter,
  mountStart,
  rearCentre,
  seating,
  type Params,
} from "./profile";
import { HOLE_DIAMETER, HOLE_FROM_SHOULDER, PEG_LENGTH } from "./settings";

type Vec = [number, number, number];

const SIN = Math.sin(OVERHANG);
const COS = Math.cos(OVERHANG);

// Shortest cylinder in mm the outline draws. Shorter ones, such as rounding
// error at the minimum body length, become sliver faces that split the solid.
const MIN_SEGMENT = 1e-3;

// Common outline through the floor, rear sphere, cylinder and front sphere.
// The cavity shares the outer sphere centres, with radius reduced by the wall.
function outline(p: Params, radius: number, floor: number) {
  const z1 = rearCentre(p.diameter);
  const front = frontCentre(p.diameter, p.length);
  const z2 = front - z1 < MIN_SEGMENT ? z1 : front;
  const floorRadius = Math.sqrt(radius ** 2 - (z1 - floor) ** 2);
  const rearMid = Math.atan2(floor - z1, floorRadius) / 2;
  const frontMid = OVERHANG / 2;

  let pen = draw([0, floor])
    .hLineTo(floorRadius)
    .threePointsArcTo(
      [radius, z1],
      [radius * Math.cos(rearMid), z1 + radius * Math.sin(rearMid)],
    );
  if (z2 !== z1) pen = pen.vLineTo(z2);
  return pen.threePointsArcTo(
    [radius * COS, z2 + radius * SIN],
    [radius * Math.cos(frontMid), z2 + radius * Math.sin(frontMid)],
  );
}

const revolve = (drawing: Drawing) =>
  drawing.sketchOnPlane("XZ").revolve() as Shape3D;

const along = (start: Vec, direction: Vec, distance: number): Vec => [
  start[0] + distance * direction[0],
  start[1] + distance * direction[1],
  start[2] + distance * direction[2],
];

// The mount pivot is the enlarged nose sphere's centre; its axis tilts from
// the body axis by the mount angle.
function mountAxis(p: Params) {
  const a = (p.angle * Math.PI) / 180;
  return {
    radius: jointDiameter(p.mountType) / 2,
    start: [0, 0, mountStart(p.length, jointDiameter(p.mountType) / 2)] as Vec,
    direction: [Math.sin(a), 0, Math.cos(a)] as Vec,
  };
}

// Point where the screw hole's axis crosses the mount axis, 10 mm along the
// mount from the seating shoulder toward the peg's free end.
function holeCentre(p: Params): Vec {
  const { start, direction } = mountAxis(p);
  return along(start, direction, seating(p) + HOLE_FROM_SHOULDER);
}

export function screwHole(p: Params): Shape3D {
  const [x, , z] = holeCentre(p);
  const halfLength = p.diameter / 2 + 1;
  return makeCylinder(
    HOLE_DIAMETER / 2,
    2 * halfLength,
    [x, -halfLength, z],
    [0, 1, 0],
  );
}

// Outer body or its inward offset. Keep the sphere centres fixed while
// reducing their radii so the connecting cone stays tangent to both spheres.
function roundedBody(p: Params, inset: number): Shape3D {
  const outerRadius = jointDiameter(p.mountType) / 2;
  const r = outerRadius - inset;
  const centre = mountStart(p.length, outerRadius);
  const mid = (OVERHANG + Math.PI / 2) / 2;
  return revolve(
    outline(p, p.diameter / 2 - inset, inset)
      .lineTo([r * COS, centre + r * SIN])
      .threePointsArcTo(
        [0, centre + r],
        [r * Math.cos(mid), centre + r * Math.sin(mid)],
      )
      .close(),
  );
}

export function buildBody(p: Params): Shape3D {
  return roundedBody(p, 0);
}

// Wider lower cylinder from the pivot to the seating shoulder, then the solid
// insertion peg.
function buildMount(p: Params): Shape3D {
  const { radius, start, direction } = mountAxis(p);
  const shoulder = along(start, direction, seating(p));
  const peg = mountDiameter(p.mountType) / 2;
  return makeCylinder(radius, seating(p), start, direction).fuse(
    makeCylinder(peg, PEG_LENGTH, shoulder, direction),
  );
}

// The inward offset of the rounded body is the sole cavity, including its
// tangent nose cap. Its shape does not depend on the mount angle. The final
// subtraction from the body/mount union leaves all mount material outside this
// cavity solid, so the cavity may overlap either nominal mount cylinder; at
// least one wall still separates it from the actual exterior and screw hole.
export function buildCavity(p: Params): Shape3D {
  return roundedBody(p, p.wall);
}

// Body and mount with the screw hole, before hollowing.
function buildOuter(p: Params): Shape3D {
  return buildBody(p).fuse(buildMount(p)).cut(screwHole(p));
}

export function buildPontoon(p: Params): Shape3D {
  return buildOuter(p).cut(buildCavity(p));
}

export interface ModelMesh {
  vertices: Float32Array;
  normals: Float32Array;
  triangles: Uint32Array;
}

function toMesh(shape: Shape3D): ModelMesh {
  const { vertices, normals, triangles } = shape.mesh({
    tolerance: 0.1,
    angularTolerance: 0.1,
  });
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    triangles: new Uint32Array(triangles),
  };
}

// The Y >= 0 half of a hollow pontoon, cut lengthwise through the body and
// mount axes. The cutter is sized from the solid's bounds so it removes the
// full Y < 0 half at every mount angle while leaving the section face at Y = 0.
export function cutAwayHalf(pontoon: Shape3D): Shape3D {
  const [low, high] = pontoon.boundingBox.bounds;
  const margin = 1;
  return pontoon.cut(
    makeBox(
      [low[0] - margin, low[1] - margin, low[2] - margin],
      [high[0] + margin, 0, high[2] + margin],
    ),
  );
}

// Displaced volume in mL, material volume in cm³ and the outer solid as a
// display mesh. The outer solid is built once and reused for both the volume
// and the mesh; replicad's booleans leave their inputs intact. The hollow
// solid is reused for material volume and the lengthwise half-section.
export function measure(p: Params) {
  const outer = buildOuter(p);
  const hollow = outer.cut(buildCavity(p));
  return {
    displaced: measureVolume(outer) / 1000,
    material: measureVolume(hollow) / 1000,
    mesh: toMesh(outer),
    sectionMesh: toMesh(cutAwayHalf(hollow)),
  };
}

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// Binary STL. The mesher can close a revolution pole with a zero-area
// triangle, which slicers report as an open edge, so triangles with
// coincident corners are left out.
function toSTL(shape: Shape3D): Blob {
  const { vertices, triangles } = shape.mesh({ tolerance: 0.01, angularTolerance: 0.1 });
  const corner = (i: number) => vertices.slice(3 * i, 3 * i + 3) as Vec;
  const facets: Vec[][] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => corner(triangles[i + k]));
    const distinct = [sub(a, b), sub(b, c), sub(c, a)].every((d) => d.some((v) => v !== 0));
    if (distinct) facets.push([a, b, c]);
  }
  const view = new DataView(new ArrayBuffer(84 + 50 * facets.length));
  view.setUint32(80, facets.length, true);
  facets.forEach(([a, b, c], n) => {
    const [u, v] = [sub(b, a), sub(c, a)];
    const normal: Vec = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...normal) || 1;
    [normal.map((x) => x / length), a, b, c].flat().forEach((x, k) => {
      view.setFloat32(84 + 50 * n + 4 * k, x, true);
    });
  });
  return new Blob([view.buffer], { type: "model/stl" });
}

export function exportPontoon(p: Params, format: "step" | "stl"): Blob {
  const pontoon = buildPontoon(p);
  return format === "step" ? pontoon.blobSTEP() : toSTL(pontoon);
}
