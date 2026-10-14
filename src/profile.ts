export type MountType = "pipe" | "fitting";

export interface Params {
  diameter: number;
  length: number;
  wall: number;
  mountType: MountType;
  angle: number;
  clearance: number;
  holeDiameter: number;
  holeDistance: number;
  density: number;
}

export const DEFAULTS: Params = {
  diameter: 32,
  length: 180,
  wall: 1.2,
  mountType: "pipe",
  angle: 0,
  clearance: 0.2,
  holeDiameter: 2.5,
  holeDistance: 8,
  density: 1.24,
};

// 1/2" Schedule 40 PVC: nominal inside diameter (0.622") for a mount inside
// the pipe, outside diameter (0.840") for a mount in a fitting socket.
export const MOUNT_BASE_DIAMETER: Record<MountType, number> = {
  pipe: 15.8,
  fitting: 21.34,
};

export const OVERHANG = (35 * Math.PI) / 180;
const SIN = Math.sin(OVERHANG);
const COS = Math.cos(OVERHANG);
const TAN = Math.tan(OVERHANG);

export const flatRadius = (diameter: number) => (diameter / 2) * COS;

export const rearCentre = (diameter: number) => (diameter / 2) * SIN;

export const frontCentre = (diameter: number, length: number) =>
  length - diameter / 2 / SIN;

export const minLength = (diameter: number) =>
  (diameter / 2) * (SIN + 1 / SIN);

export const mountDiameter = (mountType: MountType, clearance: number) =>
  MOUNT_BASE_DIAMETER[mountType] - clearance;

// Height on the body axis where the cone's radius equals the mount radius.
export const mountStart = (length: number, mountRadius: number) =>
  length - mountRadius / TAN;
