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
  ["zero or negative value", "length", { length: 37.1 }, { length: 0 }],
  ["mount angle out of range", "angle", { angle: 45 }, { angle: 50 }],
  ["wall of D/4 or more", "wall", { wall: 7.9 }, { wall: 8 }],
  [
    "mount too wide for the body",
    "mountType",
    { diameter: 24, mountType: "pipe" },
    { diameter: 24, mountType: "fitting" },
  ],
  ["body too short", "length", { length: 37.1 }, { length: 30 }],
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
