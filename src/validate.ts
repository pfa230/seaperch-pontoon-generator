import {
  OVERHANG,
  minLength,
  mountDiameter,
  type Params,
} from "./profile";
import { MOUNT_LENGTH } from "./settings";

export type Errors = Partial<Record<keyof Params, string>>;

const POSITIVE = [
  "diameter",
  "length",
  "wall",
  "holeDiameter",
  "holeDistance",
  "density",
] as const;

const NUMERIC = [...POSITIVE, "angle", "clearance"] as const;

const mm = (value: number) => `${value.toFixed(2)} mm`;

// Arithmetic rules only. The screw hole's clearance from the cavity needs the
// solid and is checked by the model.
export function validate(p: Params): Errors {
  const errors: Errors = {};
  const ok = (key: keyof Params) => !(key in errors);

  for (const key of NUMERIC) {
    if (!Number.isFinite(p[key])) errors[key] = "Enter a number.";
  }
  for (const key of POSITIVE) {
    if (ok(key) && p[key] <= 0) errors[key] = "Must be greater than 0.";
  }
  if (ok("clearance") && p.clearance < 0) {
    errors.clearance = "Must not be negative.";
  }
  if (ok("angle") && (p.angle < 0 || p.angle > 45)) {
    errors.angle = "Must be from 0° to 45°.";
  }

  const mount = mountDiameter(p.mountType, p.clearance);
  if (ok("clearance") && mount <= 0) {
    errors.clearance = `Leaves a mount diameter of ${mm(mount)}.`;
  }

  if (ok("diameter")) {
    if (ok("wall") && p.wall >= p.diameter / 4) {
      errors.wall = `Must be less than ${mm(p.diameter / 4)} (D/4).`;
    }
    if (ok("clearance") && mount > p.diameter * Math.cos(OVERHANG)) {
      errors.mountType = `Mount diameter ${mm(mount)} exceeds ${mm(p.diameter * Math.cos(OVERHANG))} (D × cos 35°).`;
    }
    if (ok("length") && p.length < minLength(p.diameter)) {
      errors.length = `Must be at least ${minLength(p.diameter).toFixed(1)} mm for this diameter.`;
    }
  }

  if (ok("clearance") && ok("holeDiameter") && p.holeDiameter >= mount) {
    errors.holeDiameter = `Must be smaller than the ${mm(mount)} mount diameter.`;
  }
  if (
    ok("holeDiameter") &&
    ok("holeDistance") &&
    (p.holeDistance - p.holeDiameter / 2 < 0 ||
      p.holeDistance + p.holeDiameter / 2 > MOUNT_LENGTH)
  ) {
    errors.holeDistance = `The hole must lie within the ${MOUNT_LENGTH} mm mount.`;
  }

  return errors;
}
