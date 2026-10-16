import {
  draw,
  makeCylinder,
  measureVolume,
  type Drawing,
  type Shape3D,
} from "replicad";
import {
  OVERHANG,
  frontCentre,
  mountDiameter,
  mountStart,
  rearCentre,
  type Params,
} from "./profile";
import { HOLE_DIAMETER, HOLE_FROM_START, MOUNT_LENGTH } from "./settings";

type Vec = [number, number, number];

const SIN = Math.sin(OVERHANG);
const COS = Math.cos(OVERHANG);
const TAN = Math.tan(OVERHANG);

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

function mountAxis(p: Params) {
  const r = mountDiameter(p.mountType) / 2;
  const a = (p.angle * Math.PI) / 180;
  return {
    radius: r,
    start: [0, 0, mountStart(p.length, r)] as Vec,
    direction: [Math.sin(a), 0, Math.cos(a)] as Vec,
  };
}

// Point where the screw hole's axis crosses the mount axis.
function holeCentre(p: Params): Vec {
  const { start, direction } = mountAxis(p);
  return [
    start[0] + HOLE_FROM_START * direction[0],
    0,
    start[2] + HOLE_FROM_START * direction[2],
  ];
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

export function buildBody(p: Params): Shape3D {
  const r = mountDiameter(p.mountType) / 2;
  const centre = mountStart(p.length, r);
  const mid = (OVERHANG + Math.PI / 2) / 2;
  return revolve(
    outline(p, p.diameter / 2, 0)
      .lineTo([r * COS, centre + r * SIN])
      .threePointsArcTo(
        [0, centre + r],
        [r * Math.cos(mid), centre + r * Math.sin(mid)],
      )
      .close(),
  );
}

// The inward offset of the body, capped by a 35° cone on the body axis whose
// point is t below the screw hole's lowest point or the rounded nose tip,
// whichever is lower. This keeps the cavity roof at 35° rather than following
// the steeper end of the spherical cap. Cut the cap from the outline before
// revolving, because the kernel's solid intersection of the two returns nothing.
export function buildCavity(p: Params): Shape3D {
  const r = mountDiameter(p.mountType) / 2;
  const tip = Math.min(
    holeCentre(p)[2] - HOLE_DIAMETER / 2,
    mountStart(p.length, r) + r,
  ) - p.wall;
  const cap = draw([-tip * TAN, 0])
    .hLineTo(tip * TAN)
    .lineTo([0, tip])
    .close();
  const radius = p.diameter / 2 - p.wall;
  const offset = outline(p, radius, p.wall)
    .lineTo([0, frontCentre(p.diameter, p.length) + radius / SIN])
    .close();
  return revolve(offset.intersect(cap));
}

// Body and mount with the screw hole, before hollowing.
function buildOuter(p: Params): Shape3D {
  const { radius, start, direction } = mountAxis(p);
  const mount = makeCylinder(radius, MOUNT_LENGTH, start, direction);
  return buildBody(p).fuse(mount).cut(screwHole(p));
}

export function buildPontoon(p: Params): Shape3D {
  return buildOuter(p).cut(buildCavity(p));
}

export interface ModelMesh {
  vertices: Float32Array;
  normals: Float32Array;
  triangles: Uint32Array;
}

// Displaced volume in mL, material volume in cm³ and the outer solid as a
// display mesh. The outer solid is built once and reused for both the volume
// and the mesh; replicad's booleans leave their inputs intact.
export function measure(p: Params) {
  const outer = buildOuter(p);
  const { vertices, normals, triangles } = outer.mesh({
    tolerance: 0.1,
    angularTolerance: 0.1,
  });
  return {
    displaced: measureVolume(outer) / 1000,
    material: measureVolume(outer.cut(buildCavity(p))) / 1000,
    mesh: {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      triangles: new Uint32Array(triangles),
    } satisfies ModelMesh,
  };
}

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// Binary STL. The mesher closes the cavity's cone tip with a zero-area
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
