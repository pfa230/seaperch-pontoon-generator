import { describe, expect, test } from "vitest";
import { DEFAULTS, type Params } from "./profile";
import { validate } from "./validate";

const check = (overrides: Partial<Params>) =>
  validate({ ...DEFAULTS, ...overrides });

test("defaults are valid", () => {
  expect(check({})).toEqual({});
});

const rules: [string, keyof Params, Partial<Params>, Partial<Params>][] = [
  ["non-numeric value", "wall", { wall: 1 }, { wall: NaN }],
  ["zero or negative value", "density", { density: 0.9 }, { density: 0 }],
  ["negative fit clearance", "clearance", { clearance: 0 }, { clearance: -0.1 }],
  [
    "clearance leaves no mount",
    "clearance",
    { clearance: 15.7 },
    { clearance: 15.8, holeDiameter: 0.05 },
  ],
  ["mount angle out of range", "angle", { angle: 45 }, { angle: 50 }],
  ["wall of D/4 or more", "wall", { wall: 7.9 }, { wall: 8 }],
  [
    "mount too wide for the body",
    "mountType",
    { diameter: 24, mountType: "pipe" },
    { diameter: 24, mountType: "fitting" },
  ],
  ["body too short", "length", { length: 37.1 }, { length: 30 }],
  [
    "hole touching the free end",
    "holeDistance",
    { holeDistance: 1.3 },
    { holeDistance: 1.25 },
  ],
  [
    "hole touching the mount start",
    "holeDistance",
    { holeDistance: 23.7 },
    { holeDistance: 23.75 },
  ],
  [
    "hole as wide as the mount",
    "holeDiameter",
    { holeDiameter: 15.5, holeDistance: 12 },
    { holeDiameter: 20, holeDistance: 12 },
  ],
];

describe.each(rules)("%s", (_name, key, passing, failing) => {
  test("passes", () => {
    expect(check(passing)[key]).toBeUndefined();
  });
  test("fails", () => {
    expect(check(failing)[key]).toBeDefined();
  });
});

test("body-too-short error states the minimum length", () => {
  expect(check({ length: 30 }).length).toContain("37.1 mm");
});

test("fitting mount on D = 24 is rejected on the mount type", () => {
  expect(check({ diameter: 24, mountType: "fitting" }).mountType).toContain("19.66 mm");
});

test("screw hole severing the 25 mm mount is rejected on the hole diameter", () => {
  expect(check({ holeDiameter: 20, holeDistance: 12 }).holeDiameter).toContain("15.60 mm");
});
