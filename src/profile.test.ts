import { expect, test } from "vitest";
import {
  DEFAULTS,
  OVERHANG,
  flatRadius,
  frontCentre,
  jointDiameter,
  minLength,
  mountDiameter,
  mountStart,
  rearCentre,
  seating,
  type MountType,
  type Params,
} from "./profile";

const params = (overrides: Partial<Params>) => ({ ...DEFAULTS, ...overrides });

test("rear flat is 18.35 mm across at D = 32", () => {
  expect(2 * flatRadius(32)).toBeCloseTo(18.35, 2);
});

test("sphere centres at D = 32, L = 180", () => {
  expect(rearCentre(32)).toBeCloseTo(13.11, 2);
  expect(frontCentre(32, 180)).toBeCloseTo(152.1, 1);
});

test("minimum length is about 41.0 mm at D = 32", () => {
  expect(minLength(32)).toBeCloseTo(41.0, 2);
  expect(frontCentre(32, minLength(32))).toBeCloseTo(rearCentre(32), 9);
});

test("peg diameters with the default clearance", () => {
  expect(mountDiameter("pipe")).toBeCloseTo(15.6, 9);
  expect(mountDiameter("fitting")).toBeCloseTo(21.14, 9);
});

test("lower cylinder and nose add 4 mm to the peg", () => {
  expect(jointDiameter("pipe")).toBeCloseTo(19.6, 9);
  expect(jointDiameter("fitting")).toBeCloseTo(25.14, 9);
});

test("default pipe mount starts at about z = 162.91", () => {
  expect(mountStart(180, jointDiameter("pipe") / 2)).toBeCloseTo(162.91, 2);
});

test("coaxial pipe seat meets the enlarged spherical cap at the bore edge", () => {
  const R = jointDiameter("pipe") / 2;
  expect(seating(params({ mountType: "pipe", angle: 0 }))).toBeCloseTo(
    Math.sqrt(R ** 2 - (15.8 / 2) ** 2),
    6,
  );
});

test("coaxial fitting seat meets the cone at the socket bore edge", () => {
  const R = jointDiameter("fitting") / 2;
  const expected = R / Math.sin(OVERHANG) - (21.34 / 2) / Math.tan(OVERHANG);
  expect(seating(params({ mountType: "fitting", angle: 0 }))).toBeCloseTo(
    expected,
    6,
  );
});

test.each(["pipe", "fitting"] as MountType[])(
  "the %s seat is positive and finite at every offered angle",
  (mountType) => {
    for (const angle of [0, 30, 45, 60, 90]) {
      const s = seating(params({ mountType, angle }));
      expect(Number.isFinite(s)).toBe(true);
      expect(s).toBeGreaterThan(0);
    }
  },
);
