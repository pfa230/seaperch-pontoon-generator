import { FIT_CLEARANCE } from "./settings";

export type MountType = "pipe" | "fitting";
export type Filament = "pla" | "petg" | "asa";

export interface Params {
  diameter: number;
  length: number;
  wall: number;
  mountType: MountType;
  angle: number;
  filament: Filament;
}

export const DEFAULTS: Params = {
  diameter: 32,
  length: 180,
  wall: 1.2,
  mountType: "pipe",
  angle: 0,
  filament: "asa",
};

// Density in g/cm³. ASA/ABS uses ASA's; ABS is about 1.04.
export const FILAMENT_DENSITY: Record<Filament, number> = {
  pla: 1.24,
  petg: 1.27,
  asa: 1.07,
};

// 1/2" Schedule 40 PVC: nominal inside diameter (0.622") for a mount inside
// the pipe, outside diameter (0.840") for a mount in a fitting socket.
export const MOUNT_BASE_DIAMETER: Record<MountType, number> = {
  pipe: 15.8,
  fitting: 21.34,
};

export const OVERHANG = (35 * Math.PI) / 180;
const REAR_CUT = (55 * Math.PI) / 180;
const SIN = Math.sin(OVERHANG);
const TAN = Math.tan(OVERHANG);
const REAR_SIN = Math.sin(REAR_CUT);
const REAR_COS = Math.cos(REAR_CUT);

export const flatRadius = (diameter: number) => (diameter / 2) * REAR_COS;

export const rearCentre = (diameter: number) => (diameter / 2) * REAR_SIN;

export const frontCentre = (diameter: number, length: number) =>
  length - diameter / 2 / SIN;

export const minLength = (diameter: number) =>
  (diameter / 2) * (REAR_SIN + 1 / SIN);

export const mountDiameter = (mountType: MountType) =>
  MOUNT_BASE_DIAMETER[mountType] - FIT_CLEARANCE;

// Height on the body axis where the cone's radius equals the mount radius.
export const mountStart = (length: number, mountRadius: number) =>
  length - mountRadius / TAN;
