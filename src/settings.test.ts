import { expect, test } from "vitest";
import { HOLE_DIAMETER, HOLE_FROM_SHOULDER, PEG_LENGTH } from "./settings";

test("screw hole lies inside the insertion peg", () => {
  expect(HOLE_FROM_SHOULDER - HOLE_DIAMETER / 2).toBeGreaterThan(0);
  expect(HOLE_FROM_SHOULDER + HOLE_DIAMETER / 2).toBeLessThan(PEG_LENGTH);
});
