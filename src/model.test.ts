import init from "replicad-opencascadejs";
import { getOC, measureDistanceBetween, measureVolume, setOC, type Shape3D } from "replicad";
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
  MOUNT_BASE_DIAMETER,
  minLength,
  mountDiameter,
  mountStart,
  type MountType,
  type Params,
} from "./profile";
import { MOUNT_LENGTH } from "./settings";

beforeAll(async () => {
  setOC(await init({ print: () => {} }));
});

const params = (overrides: Partial<Params>) => ({ ...DEFAULTS, ...overrides });

const planarFaces = (shape: Shape3D) =>
  shape.faces
    .filter((face) => face.geomType === "PLANE")
    .map((face) => ({
      centre: face.center.toTuple(),
      normal: face.normalAt().toTuple(),
    }));

// Planar faces lying in the Y = 0 plane left by the lengthwise section cut.
const sectionFaces = (shape: Shape3D) =>
  shape.faces.filter(
    (face) =>
      face.geomType === "PLANE" &&
      Math.abs(face.center.y) < 1e-6 &&
      Math.abs(Math.abs(face.normalAt().y) - 1) < 1e-6,
  );

describe.each(["pipe", "fitting"] as MountType[])("%s rounded nose", (mountType) => {
  test("has body sphere, tangent cone and mount-sized spherical sector", () => {
    const body = buildBody(params({ mountType }));
    const spheres = body.faces.filter((face) => face.geomType === "SPHERE")
      .sort((a, b) => a.center.z - b.center.z);
    expect(spheres).toHaveLength(3);
    const front = spheres[1];
    const nose = spheres[2];
    const cone = body.faces.find((face) => face.geomType === "CONE")!;
    expect(cone).toBeDefined();
    const r = mountDiameter(mountType) / 2;
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

  test("keeps the screw hole about 10 mm from the seated edge at 0°", () => {
    const p = params({ mountType });
    const [low, high] = screwHole(p).boundingBox.bounds;
    const holeHeight = (low[2] + high[2]) / 2;
    const edgeHeight = p.length - MOUNT_BASE_DIAMETER[mountType] / 2 / Math.tan(35 * Math.PI / 180);
    // Diametral fit clearance places the actual edge about 0.14 mm below
    // the nominal cone-to-mount flush reference used by the hole setting.
    expect(holeHeight - edgeHeight).toBeCloseTo(10.14, 2);
    const start = mountStart(p.length, mountDiameter(mountType) / 2);
    expect(low[2]).toBeGreaterThan(start);
    expect(high[2]).toBeLessThan(start + MOUNT_LENGTH);
  });

  test.each([
    ["defaults", {}],
    ["narrow body with thick walls", { diameter: mountType === "pipe" ? 20 : 26, wall: 1.6 }],
    ["minimum length with thin walls", { length: minLength(DEFAULTS.diameter), wall: 0.8 }],
  ] as [string, Partial<Params>][])("keeps the wall thickness around the cavity: %s", (_name, overrides) => {
    const p = params({ mountType, ...overrides });
    const body = buildBody(p);
    const cavity = buildCavity(p);
    const gap = Math.min(...body.faces.map((face) => measureDistanceBetween(cavity, face)));
    expect(gap).toBeCloseTo(p.wall, 6);
  });
});

describe("default pontoon", () => {
  test("stands on z = 0 with the rounded body tip at about z = 174.20", () => {
    const [low, high] = buildBody(DEFAULTS).boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(174.20, 2);
  });

  test("is one solid whose mount ends at about z = 191.40", () => {
    const pontoon = buildPontoon(DEFAULTS);
    expect(pontoon.solids).toHaveLength(1);
    const [low, high] = pontoon.boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(191.40, 2);
  });

  // Includes the solid nose below the screw hole and rounded tip.
  test("displaces 133.4 mL with 26.6 cm³ of material", () => {
    const { displaced, material } = measure(DEFAULTS);
    expect(displaced).toBeCloseTo(133.4, 1);
    expect(Math.abs(material / 26.6 - 1)).toBeLessThan(0.01);
    expect(Math.abs((material * FILAMENT_DENSITY.asa) / 28.5 - 1)).toBeLessThan(0.01);
  });

  test("meshes the whole outer solid from z = 0 to about z = 191.40", () => {
    const { mesh } = measure(DEFAULTS);
    const vertexCount = mesh.vertices.length / 3;
    expect(mesh.triangles.length % 3).toBe(0);
    expect(Math.max(...mesh.triangles)).toBeLessThan(vertexCount);
    const zs = Array.from({ length: vertexCount }, (_, i) => mesh.vertices[3 * i + 2]);
    expect(Math.min(...zs)).toBeCloseTo(0, 2);
    expect(Math.max(...zs)).toBeCloseTo(191.40, 2);
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
  const a = (angle * Math.PI) / 180;
  describe.each(["pipe", "fitting"] as MountType[])("%s", (mountType) => {
    test("is one solid with no exposed mount base", () => {
      const pontoon = buildPontoon(params({ mountType, angle }));
      expect(pontoon.solids).toHaveLength(1);
      // Only the rear flat, the cavity floor and the mount's free end are flat.
      const planes = planarFaces(pontoon);
      expect(planes).toHaveLength(3);
      for (const [z, normal] of [
        [0, [0, 0, -1]],
        [DEFAULTS.wall, [0, 0, 1]],
      ] as const) {
        const plane = planes.find((f) => Math.abs(f.centre[2] - z) < 1e-6);
        expect(plane?.normal.map((n) => n + 0)).toEqual(normal);
      }
      const end = planes.find((f) => f.centre[2] > 100);
      expect(end?.normal[0]).toBeCloseTo(Math.sin(a), 6);
      expect(end?.normal[2]).toBeCloseTo(Math.cos(a), 6);
    });

    test("screw hole stays at least one wall thickness from the cavity", () => {
      const p = params({ mountType, angle });
      expect(measureDistanceBetween(screwHole(p), buildCavity(p))).toBeGreaterThanOrEqual(p.wall - 1e-6);
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
      // survives the cut with its cavity still open.
      expect(measureVolume(half) / measureVolume(pontoon)).toBeCloseTo(0.5, 5);
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
      expect(measureVolume(half) / measureVolume(pontoon)).toBeCloseTo(0.5, 5);
      const sections = sectionFaces(half);
      expect(sections.some((face) => face.innerWires().length > 0)).toBe(true);
    });
  });
});

describe.each([
  ["pipe", 173.00],
  ["fitting", 170.94],
] as [MountType, number][])("%s mount at 0°", (mountType, top) => {
  test(`cavity stops at about z = ${top}, below the screw hole`, () => {
    const [, high] = buildCavity(params({ mountType })).boundingBox.bounds;
    expect(high[2]).toBeCloseTo(top, 2);
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
