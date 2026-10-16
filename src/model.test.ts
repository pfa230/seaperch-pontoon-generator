import init from "replicad-opencascadejs";
import {
  getOC,
  makeCylinder,
  makeSphere,
  makeVertex,
  measureDistanceBetween,
  measureVolume,
  setOC,
  type Shape3D,
} from "replicad";
import { beforeAll, describe, expect, test } from "vitest";
import {
  buildBody,
  buildCavity,
  buildPontoon,
  cutAwayHalf,
  exportPontoon,
  measure,
  screwHole,
} from "./model";
import {
  DEFAULTS,
  FILAMENT_DENSITY,
  HARDWARE,
  jointDiameter,
  minLength,
  mountDiameter,
  mountStart,
  seating,
  type MountType,
  type Params,
} from "./profile";
import { PEG_LENGTH } from "./settings";

beforeAll(async () => {
  setOC(await init({ print: () => {} }));
});

type Vec = [number, number, number];

const params = (overrides: Partial<Params>) => ({ ...DEFAULTS, ...overrides });

const along = (start: Vec, direction: Vec, distance: number): Vec => [
  start[0] + distance * direction[0],
  start[1] + distance * direction[1],
  start[2] + distance * direction[2],
];

// The pivot, axis, joint radius and peg radius the model uses for a mount.
const axis = (p: Params) => {
  const a = (p.angle * Math.PI) / 180;
  const joint = jointDiameter(p.mountType) / 2;
  return {
    joint,
    peg: mountDiameter(p.mountType) / 2,
    pivot: [0, 0, mountStart(p.length, joint)] as Vec,
    direction: [Math.sin(a), 0, Math.cos(a)] as Vec,
  };
};

const shoulderOf = (p: Params): Vec => {
  const { pivot, direction } = axis(p);
  return along(pivot, direction, seating(p));
};

const lowerSolid = (p: Params): Shape3D => {
  const { joint, pivot, direction } = axis(p);
  return makeCylinder(joint, seating(p), pivot, direction);
};

const pegSolid = (p: Params): Shape3D => {
  const { peg, direction } = axis(p);
  return makeCylinder(peg, PEG_LENGTH, shoulderOf(p), direction);
};

const mountSolid = (p: Params): Shape3D => lowerSolid(p).fuse(pegSolid(p));

// The selected hardware's wall, extended outward from the shoulder along the
// mount axis: an annulus between the bore and the outside diameter.
const hardwareWall = (p: Params, inward = 0): Shape3D => {
  const { direction } = axis(p);
  const start = along(shoulderOf(p), direction, -inward);
  const { bore, outside } = HARDWARE[p.mountType];
  return makeCylinder(outside / 2, 200, start, direction).cut(
    makeCylinder(bore / 2, 200, start, direction),
  );
};

const planarFaces = (shape: Shape3D) =>
  shape.faces
    .filter((face) => face.geomType === "PLANE")
    .map((face) => ({
      centre: face.center.toTuple() as Vec,
      normal: face.normalAt().toTuple() as Vec,
    }));

// Planar faces lying in the Y = 0 plane left by the lengthwise section cut.
const sectionFaces = (shape: Shape3D) =>
  shape.faces.filter(
    (face) =>
      face.geomType === "PLANE" &&
      Math.abs(face.center.y) < 1e-6 &&
      Math.abs(Math.abs(face.normalAt().y) - 1) < 1e-6,
  );

// Probes for the inner nose cap in the section plane Y = 0 through the pivot,
// from the 55° cone tangent join on one side, over the pole, to the join on the
// other. The cavity surface is the sphere of radius r about the pivot. After
// the half-section cut, any material in that plane lies on the half's
// boundary, so a void point PROBE_OFFSET inside the sphere is exactly that far
// from the half and a wall point PROBE_OFFSET outside it is on the half, even
// at the thinnest offered wall (0.8 mm).
const PROBE_OFFSET = 0.2;

const distanceTo = (shape: Shape3D, point: Vec) => measureDistanceBetween(makeVertex(point), shape);

const noseProbes = (p: Params, r: number) => {
  const c: Vec = [0, 0, mountStart(p.length, jointDiameter(p.mountType) / 2)];
  const directions = [-55, -52, -30, -8, 0, 8, 30, 52, 55].map((degrees): Vec => {
    const theta = (degrees * Math.PI) / 180;
    return [Math.sin(theta), 0, Math.cos(theta)];
  });
  return {
    void: directions.map((unit) => along(c, unit, r - PROBE_OFFSET)),
    wall: directions.map((unit) => along(c, unit, r + PROBE_OFFSET)),
  };
};

describe.each(["pipe", "fitting"] as MountType[])("%s rounded nose", (mountType) => {
  test("has body sphere, tangent cone and enlarged spherical sector", () => {
    const body = buildBody(params({ mountType }));
    const spheres = body.faces
      .filter((face) => face.geomType === "SPHERE")
      .sort((a, b) => a.center.z - b.center.z);
    expect(spheres).toHaveLength(3);
    const front = spheres[1];
    const nose = spheres[2];
    const cone = body.faces.find((face) => face.geomType === "CONE")!;
    expect(cone).toBeDefined();
    const r = jointDiameter(mountType) / 2;
    const noseTop = body.boundingBox.bounds[1][2];
    const centre = noseTop - r;
    for (const u of [0.1, 0.5, 0.9]) {
      const [x, y, z] = nose.pointOnSurface(u, 0.5).toTuple();
      expect(Math.hypot(x, y, z - centre)).toBeCloseTo(r, 6);
    }
    for (const sphere of [front, nose]) {
      // The lowest nose latitude and highest front latitude bound the cone.
      const v = sphere === front ? 1 : 0;
      const point = sphere.pointOnSurface(0.5, v);
      const sphereNormal = sphere.normalAt(point).normalize().toTuple();
      const coneNormal = cone.normalAt(point).normalize().toTuple();
      expect(Math.acos(sphereNormal[2]) * 180 / Math.PI).toBeCloseTo(55, 6);
      sphereNormal.forEach((n, i) => expect(n).toBeCloseTo(coneNormal[i], 6));
    }
  });

  test("places the hole 10 mm from the seating shoulder at 0°", () => {
    const p = params({ mountType });
    const [low, high] = screwHole(p).boundingBox.bounds;
    const holeHeight = (low[2] + high[2]) / 2;
    const shoulder = mountStart(p.length, jointDiameter(mountType) / 2) + seating(p);
    expect(holeHeight - shoulder).toBeCloseTo(10, 6);
    expect(low[2]).toBeGreaterThan(shoulder);
    expect(high[2]).toBeLessThan(shoulder + PEG_LENGTH);
  });

  test.each([
    ["defaults", {}],
    ["narrow body with thick walls", { diameter: mountType === "pipe" ? 24 : 31, wall: 1.6 }],
    ["minimum length with thin walls", { length: minLength(DEFAULTS.diameter), wall: 0.8 }],
  ] as [string, Partial<Params>][])("keeps at least one wall around the cavity: %s", (_name, overrides) => {
    const p = params({ mountType, ...overrides });
    const outer = buildBody(p).fuse(mountSolid(p));
    const cavity = buildCavity(p);
    const gap = Math.min(...outer.faces.map((face) => measureDistanceBetween(cavity, face)));
    expect(gap).toBeGreaterThanOrEqual(p.wall - 1e-6);
    expect(measureDistanceBetween(screwHole(p), cavity)).toBeGreaterThanOrEqual(p.wall - 1e-6);
  });

  test.each([0.8, 1.2, 1.6])("has uniform front-dome and cone walls at t = %s", (wall) => {
    const p = params({ mountType, wall });
    const cavity = buildCavity(p);
    const front = p.length - p.diameter / 2 / Math.sin(35 * Math.PI / 180);
    const bodyRadius = p.diameter / 2;

    // Probe several normals on the exposed dome, including near its cone join.
    for (const degrees of [5, 20, 34]) {
      const phi = degrees * Math.PI / 180;
      const point: Vec = [bodyRadius * Math.cos(phi), 0, front + bodyRadius * Math.sin(phi)];
      expect(measureDistanceBetween(makeVertex(point), cavity)).toBeCloseTo(wall, 5);
    }

    // Midway along the exposed cone, before the wider lower cylinder covers it.
    const slope = Math.tan(35 * Math.PI / 180);
    const coneStart = front + bodyRadius * Math.sin(35 * Math.PI / 180);
    const jointStart = p.length - jointDiameter(mountType) / 2 / slope;
    const z = (coneStart + jointStart) / 2;
    const point: Vec = [(p.length - z) * slope, 0, z];
    expect(measureDistanceBetween(makeVertex(point), cavity)).toBeCloseTo(wall, 5);
  });

  test.each([0.8, 1.2, 1.6])("has a complete tangent inner nose cap at every angle, t = %s", (wall) => {
    const R = jointDiameter(mountType) / 2;
    const r = R - wall;
    const tangentTheta = (55 * Math.PI) / 180;
    // The mount tilts toward +x, so phi = 0 lies beneath the mount.
    const azimuths = [0, 90, 180, 270];

    for (const angle of [0, 30, 45, 60, 90]) {
      const p = params({ mountType, angle, wall });
      const cavity = buildCavity(p);
      const c = mountStart(p.length, R);

      // The cap reaches its pole at the analytic inner tip c + R − t.
      expect(cavity.boundingBox.bounds[1][2]).toBeCloseTo(c + r, 2);

      // Sample the full cap from near its pole to just before its cone
      // tangent, on both sides and beneath the mount. A point on the nominal
      // sphere is on the cavity boundary; a point just outside it is solid.
      for (const thetaDeg of [5, 25, 50]) {
        const theta = (thetaDeg * Math.PI) / 180;
        for (const phiDeg of azimuths) {
          const phi = (phiDeg * Math.PI) / 180;
          const unit: Vec = [
            Math.sin(theta) * Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
            Math.cos(theta),
          ];
          expect(measureDistanceBetween(makeVertex(along([0, 0, c], unit, r)), cavity))
            .toBeLessThan(1e-3);
          expect(measureDistanceBetween(makeVertex(along([0, 0, c], unit, r + 0.2)), cavity))
            .toBeCloseTo(0.2, 1);
        }
      }

      // The cap keeps an uninterrupted tangent join to the inner cone.
      const spheres = cavity.faces
        .filter((face) => face.geomType === "SPHERE")
        .sort((a, b) => a.center.z - b.center.z);
      expect(spheres).toHaveLength(3);
      const nose = spheres[2];
      const cone = cavity.faces.find((face) => face.geomType === "CONE")!;
      expect(cone).toBeDefined();
      for (const phiDeg of azimuths) {
        const phi = (phiDeg * Math.PI) / 180;
        const tangent: Vec = [
          r * Math.sin(tangentTheta) * Math.cos(phi),
          r * Math.sin(tangentTheta) * Math.sin(phi),
          c + r * Math.cos(tangentTheta),
        ];
        const sphereNormal = nose.normalAt(tangent).normalize().toTuple();
        const coneNormal = cone.normalAt(tangent).normalize().toTuple();
        sphereNormal.forEach((component, i) => expect(component).toBeCloseTo(coneNormal[i], 6));
      }
    }
  });
});

describe("default pontoon", () => {
  test("stands on z = 0 with the rounded body tip at about z = 172.71", () => {
    const [low, high] = buildBody(DEFAULTS).boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(172.71, 2);
  });

  test("is one solid whose mount ends at about z = 188.71", () => {
    const pontoon = buildPontoon(DEFAULTS);
    expect(pontoon.solids).toHaveLength(1);
    const [low, high] = pontoon.boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(188.71, 2);
  });

  // Includes the solid mount material left outside the full spherical cavity.
  test("displaces 133.0 mL with 23.3 cm³ of material", () => {
    const { displaced, material } = measure(DEFAULTS);
    expect(displaced).toBeCloseTo(133.0, 1);
    expect(Math.abs(material / 23.3 - 1)).toBeLessThan(0.01);
    expect(Math.abs((material * FILAMENT_DENSITY.asa) / 24.9 - 1)).toBeLessThan(0.01);
  });

  test("meshes the whole outer solid from z = 0 to about z = 188.71", () => {
    const { mesh } = measure(DEFAULTS);
    const vertexCount = mesh.vertices.length / 3;
    expect(mesh.triangles.length % 3).toBe(0);
    expect(Math.max(...mesh.triangles)).toBeLessThan(vertexCount);
    const zs = Array.from({ length: vertexCount }, (_, i) => mesh.vertices[3 * i + 2]);
    expect(Math.min(...zs)).toBeCloseTo(0, 2);
    expect(Math.max(...zs)).toBeCloseTo(188.71, 2);
  });

  test("returns a section mesh of the retained Y >= 0 half", () => {
    const { sectionMesh } = measure(DEFAULTS);
    const vertexCount = sectionMesh.vertices.length / 3;
    expect(sectionMesh.triangles.length % 3).toBe(0);
    expect(Math.max(...sectionMesh.triangles)).toBeLessThan(vertexCount);
    const ys = Array.from({ length: vertexCount }, (_, i) => sectionMesh.vertices[3 * i + 1]);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1e-3);
  });
});

describe.each([0, 30, 45, 60, 90] as number[])("%s° mount", (angle) => {
  describe.each(["pipe", "fitting"] as MountType[])("%s", (mountType) => {
    const p = params({ mountType, angle });
    const a = (angle * Math.PI) / 180;

    test("is one solid with a hidden base and a stepped peg end", () => {
      const pontoon = buildPontoon(p);
      expect(pontoon.solids).toHaveLength(1);

      // The peg's free end is a flat disc on the mount axis, one peg length
      // beyond the shoulder.
      const end = along(shoulderOf(p), axis(p).direction, PEG_LENGTH);
      const { joint, pivot } = axis(p);
      const endFace = planarFaces(pontoon).find(
        (f) =>
          Math.hypot(...(f.centre.map((c, i) => c - end[i]) as Vec)) < 1e-6 &&
          Math.abs(f.normal[0] - Math.sin(a)) < 1e-6 &&
          Math.abs(f.normal[2] - Math.cos(a)) < 1e-6,
      );
      expect(endFace).toBeDefined();

      // The lower cylinder's base disc stays inside the body.
      const body = buildBody(p);
      const v: Vec = [Math.cos(a), 0, -Math.sin(a)];
      for (let i = 0; i < 8; i++) {
        const t = (i * Math.PI) / 4;
        const point = along(along(pivot, v, joint * Math.cos(t)), [0, 1, 0], joint * Math.sin(t));
        expect(measureDistanceBetween(makeSphere(0.05).translate(point), body)).toBeLessThan(1e-6);
      }
    });

    test("seats the hardware without penetration and interferes when moved inward", () => {
      const pontoon = buildPontoon(p);
      expect(measureVolume(hardwareWall(p).intersect(pontoon))).toBeLessThan(1e-6);
      expect(measureVolume(hardwareWall(p, 0.5).intersect(pontoon))).toBeGreaterThan(0.1);
    });

    test.each([0.8, 1.2, 1.6])("screw hole stays at least one wall thickness from the cavity, t = %s", (wall) => {
      const q = params({ mountType, angle, wall });
      expect(measureDistanceBetween(screwHole(q), buildCavity(q))).toBeGreaterThanOrEqual(q.wall - 1e-6);
    });

    test.each([0.8, 1.2, 1.6])("keeps at least one wall thickness from the actual exterior, t = %s", (wall) => {
      const q = params({ mountType, angle, wall });
      const cavity = buildCavity(q);
      const outer = buildBody(q).fuse(mountSolid(q));
      const gap = Math.min(...outer.faces.map((face) => measureDistanceBetween(cavity, face)));
      expect(gap).toBeGreaterThanOrEqual(q.wall - 1e-6);
    });
  });
});

describe.each([0, 30, 45, 60, 90] as number[])("%s° cross-section", (angle) => {
  describe.each(["pipe", "fitting"] as MountType[])("%s", (mountType) => {
    test("retains the Y >= 0 half with a section face through the axes", () => {
      const p = params({ mountType, angle });
      const pontoon = buildPontoon(p);
      const half = cutAwayHalf(pontoon);
      expect(half.solids).toHaveLength(1);
      const [low, high] = half.boundingBox.bounds;
      expect(low[1]).toBeGreaterThanOrEqual(-1e-6);
      expect(high[1]).toBeCloseTo(pontoon.boundingBox.bounds[1][1], 6);
      // The hollow pontoon is symmetric about Y = 0, so half the material
      // survives the cut with its cavity still open. Default CAD volume
      // integration varies slightly when the cut splits curved faces.
      expect(measureVolume(half) / measureVolume(pontoon)).toBeCloseTo(0.5, 4);
      const sections = sectionFaces(half);
      expect(sections.length).toBeGreaterThan(0);
      expect(sections.some((face) => face.innerWires().length > 0)).toBe(true);
    });

    test.each([
      ["thin walls", { wall: 0.8 }],
      ["thick walls", { wall: 1.6 }],
    ] as [string, Partial<Params>][])("keeps the cavity open: %s", (_name, overrides) => {
      const p = params({ mountType, angle, ...overrides });
      const pontoon = buildPontoon(p);
      const half = cutAwayHalf(pontoon);
      expect(measureVolume(half) / measureVolume(pontoon)).toBeCloseTo(0.5, 4);
      const sections = sectionFaces(half);
      expect(sections.some((face) => face.innerWires().length > 0)).toBe(true);
    });

    test.each([0.8, 1.2, 1.6])("shows the whole inner nose cap around the finished nose, t = %s", (wall) => {
      const q = params({ mountType, angle, wall });
      const pontoon = buildPontoon(q);
      const r = jointDiameter(mountType) / 2 - wall;
      const probes = noseProbes(q, r);
      // Unturned, the section holds the side beneath the mount and the side
      // opposite it; turned 90° about the body axis, it holds the two flanks.
      for (const turn of [0, -90]) {
        const half = cutAwayHalf(pontoon.clone().rotate(turn, [0, 0, 0], [0, 0, 1]));
        for (const point of probes.void) expect(distanceTo(half, point)).toBeCloseTo(PROBE_OFFSET, 6);
        for (const point of probes.wall) expect(distanceTo(half, point)).toBeLessThan(1e-6);
      }
    });
  });
});

describe.each(["pipe", "fitting"] as MountType[])("%s cavity", (mountType) => {
  test.each([0.8, 1.2, 1.6])("is one connected cavity of the same volume at every angle, t = %s", (wall) => {
    const volumes: number[] = [];
    for (const angle of [0, 30, 45, 60, 90]) {
      const p = params({ mountType, angle, wall });
      const cavity = buildCavity(p);
      expect(cavity.solids).toHaveLength(1);
      volumes.push(measureVolume(cavity));
    }
    for (const volume of volumes) {
      expect(Math.abs(volume / volumes[0] - 1)).toBeLessThan(1e-6);
    }
  });
});

describe.each([
  ["pipe at 0°", { mountType: "pipe", angle: 0 }],
  ["pipe at 45°", { mountType: "pipe", angle: 45 }],
  ["pipe at 90°", { mountType: "pipe", angle: 90 }],
  ["fitting at 0°", { mountType: "fitting", angle: 0 }],
  ["fitting at 45°", { mountType: "fitting", angle: 45 }],
  ["fitting at 90°", { mountType: "fitting", angle: 90 }],
  ["minimum body length", { length: minLength(DEFAULTS.diameter) }],
  ["narrow pipe body", { diameter: 24, mountType: "pipe" }],
  ["narrow fitting body", { diameter: 31, mountType: "fitting" }],
] as [string, Partial<Params>][])("export, %s", (_name, overrides) => {
  test.each(["step", "stl"] as const)("%s is non-empty", (format) => {
    expect(exportPontoon(params(overrides), format).size).toBeGreaterThan(0);
  });
});

const isClosed = async (stl: Blob) => {
  const view = new DataView(await stl.arrayBuffer());
  const edges = new Map<string, number>();
  for (let n = 0; n < view.getUint32(80, true); n++) {
    const corners = [1, 2, 3].map((v) =>
      [0, 1, 2].map((k) => view.getFloat32(84 + 50 * n + 12 * v + 4 * k, true)).join(),
    );
    for (let k = 0; k < 3; k++) {
      const edge = [corners[k], corners[(k + 1) % 3]].sort().join("|");
      edges.set(edge, (edges.get(edge) ?? 0) + 1);
    }
  }
  return [...edges.values()].every((count) => count === 2);
};

describe.each([
  ["default", DEFAULTS],
  ["minimum body length", params({ length: minLength(DEFAULTS.diameter) })],
  ["narrow pipe body", params({ diameter: 24, mountType: "pipe" })],
  ["narrow fitting body", params({ diameter: 31, mountType: "fitting" })],
  ["pipe mount at 30°", params({ mountType: "pipe", angle: 30 })],
  ["pipe mount at 45°", params({ mountType: "pipe", angle: 45 })],
  ["pipe mount at 60°", params({ mountType: "pipe", angle: 60 })],
  ["fitting mount at 0°", params({ mountType: "fitting", angle: 0 })],
  ["fitting mount at 30°", params({ mountType: "fitting", angle: 30 })],
  ["fitting mount at 60°", params({ mountType: "fitting", angle: 60 })],
  ["fitting mount at 45°", params({ mountType: "fitting", angle: 45 })],
  ["pipe mount at 90°", params({ mountType: "pipe", angle: 90 })],
  ["fitting mount at 90°", params({ mountType: "fitting", angle: 90 })],
] as [string, Params][])("%s pontoon", (_name, p) => {
  test("is one valid hollow solid", () => {
    const pontoon = buildPontoon(p);
    expect(pontoon.solids).toHaveLength(1);
    const oc = getOC();
    expect(new oc.BRepCheck_Analyzer(pontoon.wrapped, true, false, false).IsValid(pontoon.wrapped)).toBe(true);
    const { displaced, material } = measure(p);
    expect(material).toBeGreaterThan(0);
    expect(material).toBeLessThan(displaced);
  });

  test("STL is closed: every edge joins exactly two facets", async () => {
    expect(await isClosed(exportPontoon(p, "stl"))).toBe(true);
  });
});
