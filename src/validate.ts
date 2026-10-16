import {
  OVERHANG,
  jointDiameter,
  minLength,
  type Params,
} from "./profile";

export type Errors = Partial<Record<keyof Params, string>>;

const CHECKED = ["diameter", "length"] as const;

const mm = (value: number) => `${value.toFixed(2)} mm`;

export function validate(p: Params): Errors {
  const errors: Errors = {};
  const ok = (key: keyof Params) => !(key in errors);

  for (const key of CHECKED) {
    if (!Number.isFinite(p[key])) errors[key] = "Enter a number.";
  }
  for (const key of CHECKED) {
    if (ok(key) && p[key] <= 0) errors[key] = "Must be greater than 0.";
  }

  if (ok("diameter")) {
    const joint = jointDiameter(p.mountType);
    if (joint > p.diameter * Math.cos(OVERHANG)) {
      errors.mountType = `Mount and nose diameter ${mm(joint)} exceeds ${mm(p.diameter * Math.cos(OVERHANG))} (D × cos 35°).`;
    }
    if (ok("length") && p.length < minLength(p.diameter)) {
      errors.length = `Must be at least ${minLength(p.diameter).toFixed(1)} mm for this diameter.`;
    }
  }

  return errors;
}
