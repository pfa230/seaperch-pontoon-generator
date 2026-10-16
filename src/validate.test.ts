import { describe, expect, test } from "vitest";
import { DEFAULTS, type Params } from "./profile";
import { validate } from "./validate";

const check = (overrides: Partial<Params>) =>
  validate({ ...DEFAULTS, ...overrides });

test("defaults are valid", () => {
  expect(check({})).toEqual({});
});

const rules: [string, keyof Params, Partial<Params>, Partial<Params>][] = [
  ["non-numeric value", "diameter", { diameter: 32 }, { diameter: NaN }],
  ["zero or negative value", "length", { length: 41.1 }, { length: 0 }],
  [
    "mount too wide for the body",
    "mountType",
    { diameter: 24, mountType: "pipe" },
    { diameter: 24, mountType: "fitting" },
  ],
  ["body too short", "length", { length: 41.1 }, { length: 30 }],
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
  expect(check({ length: 30 }).length).toContain("41.0 mm");
});

test("fitting mount on D = 24 is rejected on the mount type", () => {
  expect(check({ diameter: 24, mountType: "fitting" }).mountType).toContain("19.66 mm");
});

test("a narrow D = 26 body rejects the fitting mount on the enlarged nose", () => {
  // 21.14 mm peg alone would fit, but the 25.14 mm lower mount and nose do not.
  expect(check({ diameter: 26, mountType: "fitting" }).mountType).toContain("21.30 mm");
});

test("the default D = 32 body accepts either mount", () => {
  expect(check({ diameter: 32, mountType: "pipe" })).toEqual({});
  expect(check({ diameter: 32, mountType: "fitting" })).toEqual({});
});

