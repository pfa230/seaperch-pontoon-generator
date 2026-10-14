import {
  draw,
  makeCylinder,
  makeSphere,
  measureVolume,
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
import { MOUNT_LENGTH } from "./settings";

type Vec = [number, number, number];

const SIN = Math.sin(OVERHANG);
const COS = Math.cos(OVERHANG);

// Shortest cylinder in mm the outline draws. Shorter ones, such as rounding
// error at the minimum body length, become sliver faces that split the solid.
const MIN_SEGMENT = 1e-3;

// Revolves the body outline: a floor at height `floor`, a rear sphere arc,
// a cylinder, a front sphere arc and a 35° cone. Spheres of radius `radius`
// sit on the outer body's centres, so an inner outline is an inward offset.
function revolveOutline(p: Params, radius: number, floor: number): Shape3D {
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
  return pen
    .threePointsArcTo(
      [radius * COS, z2 + radius * SIN],
      [radius * Math.cos(frontMid), z2 + radius * Math.sin(frontMid)],
    )
    .lineTo([0, z2 + radius / SIN])
    .close()
    .sketchOnPlane("XZ")
    .revolve() as Shape3D;
}

function mountAxis(p: Params) {
  const r = mountDiameter(p.mountType, p.clearance) / 2;
  const a = (p.angle * Math.PI) / 180;
  return {
    radius: r,
    start: [0, 0, mountStart(p.length, r)] as Vec,
    direction: [Math.sin(a), 0, Math.cos(a)] as Vec,
  };
}

function screwHole(p: Params, radius: number): Shape3D {
  const { start, direction } = mountAxis(p);
  const along = MOUNT_LENGTH - p.holeDistance;
  const halfLength = p.diameter / 2 + 1;
  return makeCylinder(
    radius,
    2 * halfLength,
    [
      start[0] + along * direction[0],
      -halfLength,
      start[2] + along * direction[2],
    ],
    [0, 1, 0],
  );
}

export function buildBody(p: Params): Shape3D {
  return revolveOutline(p, p.diameter / 2, 0);
}

function buildCavity(p: Params): Shape3D {
  return revolveOutline(p, p.diameter / 2 - p.wall, p.wall);
}

// Body and mount with the screw hole, before hollowing.
function buildOuter(p: Params): Shape3D {
  const { radius, start, direction } = mountAxis(p);
  const ball = makeSphere(radius).translate(start);
  const mount = makeCylinder(radius, MOUNT_LENGTH, start, direction);
  return buildBody(p).fuse(ball).fuse(mount).cut(screwHole(p, p.holeDiameter / 2));
}

export function buildPontoon(p: Params): Shape3D {
  return buildOuter(p).cut(buildCavity(p));
}

// True when at least t of material separates the screw hole from the cavity.
export function holeClearsCavity(p: Params): boolean {
  const zone = screwHole(p, p.holeDiameter / 2 + p.wall).intersect(buildCavity(p));
  return measureVolume(zone) === 0;
}

// Displaced volume in mL and material volume in cm³.
export function measure(p: Params) {
  return {
    displaced: measureVolume(buildOuter(p)) / 1000,
    material: measureVolume(buildPontoon(p)) / 1000,
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
