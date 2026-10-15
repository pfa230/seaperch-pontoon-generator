import { expect, test } from "vitest";
import {
  flatRadius,
  frontCentre,
  minLength,
  mountDiameter,
  mountStart,
  rearCentre,
} from "./profile";

test("rear flat is 26.2 mm across at D = 32", () => {
  expect(2 * flatRadius(32)).toBeCloseTo(26.21, 2);
});

test("sphere centres at D = 32, L = 180", () => {
  expect(rearCentre(32)).toBeCloseTo(9.18, 2);
  expect(frontCentre(32, 180)).toBeCloseTo(152.1, 1);
});

test("minimum length is about 37.1 mm at D = 32", () => {
  expect(minLength(32)).toBeCloseTo(37.07, 2);
  expect(frontCentre(32, minLength(32))).toBeCloseTo(rearCentre(32), 9);
});

test("mount diameters with the default clearance", () => {
  expect(mountDiameter("pipe")).toBeCloseTo(15.6, 9);
  expect(mountDiameter("fitting")).toBeCloseTo(21.14, 9);
});

test("default pipe mount starts at about z = 168.86", () => {
  expect(mountStart(180, mountDiameter("pipe") / 2)).toBeCloseTo(168.86, 2);
});
