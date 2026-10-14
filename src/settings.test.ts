import { expect, test } from "vitest";
import { MOUNT_BASE_DIAMETER } from "./profile";
import { MOUNT_LENGTH } from "./settings";

test("mount length is at least the fitting mount's largest radius", () => {
  expect(MOUNT_LENGTH).toBeGreaterThanOrEqual(MOUNT_BASE_DIAMETER.fitting / 2);
});
