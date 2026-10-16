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

// 1/2" Schedule 40 PVC nominal diameters in mm. A mount inside the pipe needs
// the pipe's bore; a mount into a fitting socket needs the socket's bore and
// outside wall. 15.80/21.34 mm are the pipe bore and outside diameter.
// 21.34/27.78 mm are the reference socket bore and the hub outside diameter of
// a 1/2-inch Spears 429-005B socket coupling.
export const HARDWARE: Record<MountType, { bore: number; outside: number }> = {
  pipe: { bore: 15.8, outside: 21.34 },
  fitting: { bore: 21.34, outside: 27.78 },
};

// Nominal insertion peg diameter per mount type, before fit clearance.
export const MOUNT_BASE_DIAMETER: Record<MountType, number> = {
  pipe: HARDWARE.pipe.bore,
  fitting: HARDWARE.fitting.bore,
};

export const OVERHANG = (35 * Math.PI) / 180;
const REAR_CUT = (55 * Math.PI) / 180;
const SIN = Math.sin(OVERHANG);
const COS = Math.cos(OVERHANG);
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

// Diameter of the wider lower cylinder and the tangent nose sphere: 4 mm
// larger than the insertion peg.
export const jointDiameter = (mountType: MountType) =>
  mountDiameter(mountType) + 4;

// Centre of the nose sphere tangent to the front cone and the mount pivot.
export const mountStart = (length: number, mountRadius: number) =>
  length - mountRadius / SIN;

type Pt = [number, number];

interface Seg {
  kind: "seg";
  from: Pt;
  to: Pt;
}

interface Arc {
  kind: "arc";
  cz: number;
  r: number;
  from: number;
  to: number;
}

type Edge = Seg | Arc;

// The body's outer meridian, from the rear flat to the enlarged nose tip.
function profileEdges(p: Params, R: number, c: number): Edge[] {
  const Rd = p.diameter / 2;
  const z1 = rearCentre(p.diameter);
  const z2 = frontCentre(p.diameter, p.length);
  return [
    { kind: "arc", cz: z1, r: Rd, from: -REAR_CUT, to: 0 },
    { kind: "seg", from: [Rd, z1], to: [Rd, z2] },
    { kind: "arc", cz: z2, r: Rd, from: 0, to: OVERHANG },
    { kind: "seg", from: [Rd * COS, z2 + Rd * SIN], to: [R * COS, c + R * SIN] },
    { kind: "arc", cz: c, r: R, from: OVERHANG, to: Math.PI / 2 },
  ];
}

// The seating distance s is the largest axial coordinate of the body profile
// inside the selected hardware's wall band [bore radius, outside radius],
// relative to the mount pivot. The hardware sits from this shoulder outward,
// so s is the closest noncolliding seat. Computed with 2D trigonometry from
// the meridian's segments and arcs; no 3D collision shapes are built.
export function seating(p: Params): number {
  const a = (p.angle * Math.PI) / 180;
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const R = jointDiameter(p.mountType) / 2;
  const c = mountStart(p.length, R);
  const b = HARDWARE[p.mountType].bore / 2;
  const outer = HARDWARE[p.mountType].outside / 2;
  const tol = 1e-9;

  const axial = (x: number, z: number) => x * sinA + (z - c) * cosA;
  const transverse = (x: number, z: number) => x * cosA - (z - c) * sinA;

  let best = -Infinity;
  const consider = (x: number, z: number) => {
    for (const sx of [x, -x]) {
      const q = Math.abs(transverse(sx, z));
      if (q >= b - tol && q <= outer + tol) {
        best = Math.max(best, axial(sx, z));
      }
    }
  };

  const segment = (from: Pt, to: Pt) => {
    consider(from[0], from[1]);
    consider(to[0], to[1]);
    const q0 = transverse(from[0], from[1]);
    const q1 = transverse(to[0], to[1]);
    if (q0 === q1) return;
    for (const Q of [b, -b, outer, -outer]) {
      const t = (Q - q0) / (q1 - q0);
      if (t > 0 && t < 1) {
        consider(from[0] + t * (to[0] - from[0]), from[1] + t * (to[1] - from[1]));
      }
    }
  };

  // Arc with centre on the axis. sign selects the +x or mirrored meridian.
  const arc = (sign: number, cz: number, r: number, from: number, to: number) => {
    const base = -(cz - c) * sinA;
    const at = (phi: number) =>
      consider(sign * r * Math.cos(phi), cz + r * Math.sin(phi));
    const onArc = (phi: number) => {
      for (const k of [-1, 0, 1]) {
        const candidate = phi + k * 2 * Math.PI;
        if (candidate >= from - 1e-9 && candidate <= to + 1e-9) at(candidate);
      }
    };
    at(from);
    at(to);
    for (const Q of [b, -b, outer, -outer]) {
      const K = (Q - base) / (sign * r);
      if (Math.abs(K) > 1) continue;
      const delta = Math.acos(K);
      for (const s of [1, -1]) onArc(-sign * a + s * delta);
    }
    // Axial extremum, where the arc turns perpendicular to the mount axis.
    onArc(Math.PI / 2 - sign * a);
  };

  for (const edge of profileEdges(p, R, c)) {
    if (edge.kind === "seg") {
      segment(edge.from, edge.to);
      segment([-edge.from[0], edge.from[1]], [-edge.to[0], edge.to[1]]);
    } else {
      arc(1, edge.cz, edge.r, edge.from, edge.to);
      arc(-1, edge.cz, edge.r, edge.from, edge.to);
    }
  }

  return best;
}
