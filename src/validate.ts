import {
  OVERHANG,
  minLength,
  mountDiameter,
  type Params,
} from "./profile";

export type Errors = Partial<Record<keyof Params, string>>;

const POSITIVE = ["diameter", "length", "wall"] as const;

const NUMERIC = [...POSITIVE, "angle"] as const;

const mm = (value: number) => `${value.toFixed(2)} mm`;

export function validate(p: Params): Errors {
  const errors: Errors = {};
  const ok = (key: keyof Params) => !(key in errors);

  for (const key of NUMERIC) {
    if (!Number.isFinite(p[key])) errors[key] = "Enter a number.";
  }
  for (const key of POSITIVE) {
    if (ok(key) && p[key] <= 0) errors[key] = "Must be greater than 0.";
  }
  if (ok("angle") && (p.angle < 0 || p.angle > 45)) {
    errors.angle = "Must be from 0° to 45°.";
  }

  if (ok("diameter")) {
    const mount = mountDiameter(p.mountType);
    if (ok("wall") && p.wall >= p.diameter / 4) {
      errors.wall = `Must be less than ${mm(p.diameter / 4)} (D/4).`;
    }
    if (mount > p.diameter * Math.cos(OVERHANG)) {
      errors.mountType = `Mount diameter ${mm(mount)} exceeds ${mm(p.diameter * Math.cos(OVERHANG))} (D × cos 35°).`;
    }
    if (ok("length") && p.length < minLength(p.diameter)) {
      errors.length = `Must be at least ${minLength(p.diameter).toFixed(1)} mm for this diameter.`;
    }
  }

  return errors;
}
