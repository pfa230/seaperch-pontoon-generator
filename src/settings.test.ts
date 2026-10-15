import { expect, test } from "vitest";
import { MOUNT_BASE_DIAMETER } from "./profile";
import { HOLE_DIAMETER, HOLE_FROM_START, MOUNT_LENGTH } from "./settings";

test("mount length is at least the fitting mount's largest radius", () => {
  expect(MOUNT_LENGTH).toBeGreaterThanOrEqual(MOUNT_BASE_DIAMETER.fitting / 2);
});

test("screw hole lies fully inside the mount", () => {
  expect(HOLE_FROM_START - HOLE_DIAMETER / 2).toBeGreaterThan(0);
  expect(HOLE_FROM_START + HOLE_DIAMETER / 2).toBeLessThan(MOUNT_LENGTH);
});
