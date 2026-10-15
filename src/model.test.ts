import init from "replicad-opencascadejs";
import { getOC, measureVolume, setOC, type Shape3D } from "replicad";
import { beforeAll, describe, expect, test } from "vitest";
import {
  buildBody,
  buildCavity,
  buildPontoon,
  exportPontoon,
  measure,
  screwHole,
} from "./model";
import {
  DEFAULTS,
  FILAMENT_DENSITY,
  minLength,
  type MountType,
  type Params,
} from "./profile";

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

describe("default pontoon", () => {
  test("stands on z = 0 with the body point at z = 180", () => {
    const [low, high] = buildBody(DEFAULTS).boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(180, 6);
  });

  test("is one solid whose mount ends at about z = 193.86", () => {
    const pontoon = buildPontoon(DEFAULTS);
    expect(pontoon.solids).toHaveLength(1);
    const [low, high] = pontoon.boundingBox.bounds;
    expect(low[2]).toBeCloseTo(0, 6);
    expect(high[2]).toBeCloseTo(193.86, 2);
  });

  // Material is the 24.2 cm³ of t-thick walls plus the 1.1 cm³ of nose the
  // cavity cap leaves solid below the screw hole.
  test("displaces 135.4 mL with 25.3 cm³ of material", () => {
    const { displaced, material } = measure(DEFAULTS);
    expect(Math.abs(displaced / 135.4 - 1)).toBeLessThan(0.01);
    expect(Math.abs(material / 25.3 - 1)).toBeLessThan(0.01);
    expect(Math.abs((material * FILAMENT_DENSITY.asa) / 27.1 - 1)).toBeLessThan(0.01);
  });
});

describe.each(["pipe", "fitting"] as MountType[])("%s mount at 45°", (mountType) => {
  test("is one solid with no exposed mount base", () => {
    const pontoon = buildPontoon(params({ mountType, angle: 45 }));
    expect(pontoon.solids).toHaveLength(1);
    const a = Math.SQRT1_2;
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
    expect(end?.normal[0]).toBeCloseTo(a, 6);
    expect(end?.normal[2]).toBeCloseTo(a, 6);
  });

  test("screw hole does not reach the cavity", () => {
    const p = params({ mountType, angle: 45 });
    expect(measureVolume(screwHole(p).intersect(buildCavity(p)))).toBe(0);
  });
});

describe.each([
  ["pipe", 176.06],
  ["fitting", 172.1],
] as [MountType, number][])("%s mount at 0°", (mountType, top) => {
  test(`cavity stops at about z = ${top}, below the screw hole`, () => {
    const [, high] = buildCavity(params({ mountType })).boundingBox.bounds;
    expect(high[2]).toBeCloseTo(top, 2);
  });
});

describe.each([
  ["pipe at 0°", { mountType: "pipe", angle: 0 }],
  ["pipe at 45°", { mountType: "pipe", angle: 45 }],
  ["fitting at 0°", { mountType: "fitting", angle: 0 }],
  ["fitting at 45°", { mountType: "fitting", angle: 45 }],
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
  ["pipe mount at 45°", params({ mountType: "pipe", angle: 45 })],
  ["fitting mount at 45°", params({ mountType: "fitting", angle: 45 })],
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
