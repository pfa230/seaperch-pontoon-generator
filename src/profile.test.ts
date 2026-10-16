import { expect, test } from "vitest";
import {
  DEFAULTS,
  HARDWARE,
  OVERHANG,
  flatRadius,
  frontCentre,
  jointDiameter,
  minLength,
  mountDiameter,
  mountStart,
  rearCentre,
  seating,
  type MountType,
  type Params,
} from "./profile";

const params = (overrides: Partial<Params>) => ({ ...DEFAULTS, ...overrides });

test("rear flat is 18.35 mm across at D = 32", () => {
  expect(2 * flatRadius(32)).toBeCloseTo(18.35, 2);
});

test("sphere centres at D = 32, L = 180", () => {
  expect(rearCentre(32)).toBeCloseTo(13.11, 2);
  expect(frontCentre(32, 180)).toBeCloseTo(152.1, 1);
});

test("minimum length is about 41.0 mm at D = 32", () => {
  expect(minLength(32)).toBeCloseTo(41.0, 2);
  expect(frontCentre(32, minLength(32))).toBeCloseTo(rearCentre(32), 9);
});

test("peg diameters with the default clearance", () => {
  expect(mountDiameter("pipe")).toBeCloseTo(15.6, 9);
  expect(mountDiameter("fitting")).toBeCloseTo(21.14, 9);
});

test("lower cylinder and nose add 4 mm to the peg", () => {
  expect(jointDiameter("pipe")).toBeCloseTo(19.6, 9);
  expect(jointDiameter("fitting")).toBeCloseTo(25.14, 9);
});

test("default pipe mount starts at about z = 162.91", () => {
  expect(mountStart(180, jointDiameter("pipe") / 2)).toBeCloseTo(162.91, 2);
});

test("coaxial pipe seat meets the enlarged spherical cap at the bore edge", () => {
  const R = jointDiameter("pipe") / 2;
  expect(seating(params({ mountType: "pipe", angle: 0 }))).toBeCloseTo(
    Math.sqrt(R ** 2 - (15.8 / 2) ** 2),
    6,
  );
});

test("coaxial fitting seat meets the cone at the socket bore edge", () => {
  const R = jointDiameter("fitting") / 2;
  const expected = R / Math.sin(OVERHANG) - (21.34 / 2) / Math.tan(OVERHANG);
  expect(seating(params({ mountType: "fitting", angle: 0 }))).toBeCloseTo(
    expected,
    6,
  );
});

type Vec2 = [number, number];

const OFFERED_ANGLES = [0, 30, 45, 60, 90];

// Independent analytic contact for seating(): the largest axial coordinate,
// relative to the mount pivot, of the mirrored body meridian that lies inside
// the selected hardware's bore-to-outside wall band. Built from the elementary
// segment and circle formulas as an oracle for src/profile.ts; each contact is
// an endpoint, a band-edge intersection or an arc tangency perpendicular to the
// mount axis, and both meridian sides are evaluated by mirroring the angle.
function analyticSeating(p: Params): { seat: number; feature: string } {
  const R = jointDiameter(p.mountType) / 2;
  const c = mountStart(p.length, R);
  const Rd = p.diameter / 2;
  const z1 = rearCentre(p.diameter);
  const z2 = frontCentre(p.diameter, p.length);
  const b = HARDWARE[p.mountType].bore / 2;
  const outer = HARDWARE[p.mountType].outside / 2;
  const tol = 1e-9;

  const meridian = (angle: number) => {
    const a = (angle * Math.PI) / 180;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    const axial = (x: number, z: number) => x * sinA + (z - c) * cosA;
    const transverse = (x: number, z: number) => x * cosA - (z - c) * sinA;
    let best = -Infinity;
    let feature = "";
    const consider = (x: number, z: number, name: string) => {
      const q = Math.abs(transverse(x, z));
      if (q >= b - tol && q <= outer + tol && axial(x, z) > best) {
        best = axial(x, z);
        feature = name;
      }
    };
    const segment = (from: Vec2, to: Vec2, name: string) => {
      consider(from[0], from[1], name);
      consider(to[0], to[1], name);
      const t0 = transverse(from[0], from[1]);
      const t1 = transverse(to[0], to[1]);
      for (const Q of [b, -b, outer, -outer]) {
        const t = (Q - t0) / (t1 - t0);
        if (t > 0 && t < 1) {
          consider(
            from[0] + t * (to[0] - from[0]),
            from[1] + t * (to[1] - from[1]),
            name,
          );
        }
      }
    };
    const sphere = (name: string, cz: number, r: number, phiMin: number) => {
      const at = (phi: number) => {
        if (phi < phiMin - 1e-9 || phi > Math.PI / 2 + 1e-9) return;
        consider(r * Math.cos(phi), cz + r * Math.sin(phi), name);
      };
      at(phiMin);
      at(Math.PI / 2);
      for (const Q of [b, -b, outer, -outer]) {
        const K = (Q + (cz - c) * sinA) / r;
        if (Math.abs(K) > 1) continue;
        const delta = Math.acos(K);
        at(-a + delta);
        at(-a - delta);
      }
      at(Math.PI / 2 - a);
    };
    segment([Rd, z1], [Rd, z2], "cylinder");
    segment(
      [Rd * Math.cos(OVERHANG), z2 + Rd * Math.sin(OVERHANG)],
      [R * Math.cos(OVERHANG), c + R * Math.sin(OVERHANG)],
      "cone",
    );
    sphere("front", z2, Rd, 0);
    sphere("nose", c, R, OVERHANG);
    return { best, feature };
  };

  const right = meridian(p.angle);
  const mirror = meridian(-p.angle);
  return right.best >= mirror.best
    ? { seat: right.best, feature: right.feature }
    : { seat: mirror.best, feature: mirror.feature };
}

test.each(["pipe", "fitting"] as MountType[])(
  "the %s seat matches the analytic contact at every offered angle",
  (mountType) => {
    const expectedFeature: Record<number, string> =
      mountType === "pipe"
        ? { 0: "nose", 30: "cone", 45: "cone", 60: "front", 90: "front" }
        : { 0: "cone", 30: "front", 45: "front", 60: "front", 90: "cylinder" };
    for (const angle of OFFERED_ANGLES) {
      const oracle = analyticSeating(params({ mountType, angle }));
      expect(oracle.feature).toBe(expectedFeature[angle]);
      expect(seating(params({ mountType, angle }))).toBeCloseTo(oracle.seat, 6);
    }
  },
);

test("the pipe seat stays on the nose sphere up to the tangent join", () => {
  const R = jointDiameter("pipe") / 2;
  const b = HARDWARE.pipe.bore / 2;
  const join = ((Math.acos(b / R) - OVERHANG) * 180) / Math.PI;
  const expected = Math.sqrt(R ** 2 - b ** 2);

  for (const angle of [0, join / 2]) {
    expect(analyticSeating(params({ mountType: "pipe", angle })).feature).toBe("nose");
    expect(seating(params({ mountType: "pipe", angle }))).toBeCloseTo(expected, 6);
  }

  // The contact crosses the cone/nose tangent join here.
  expect(analyticSeating(params({ mountType: "pipe", angle: join - 0.5 })).feature).toBe("nose");
  expect(analyticSeating(params({ mountType: "pipe", angle: join + 0.5 })).feature).toBe("cone");
  expect(seating(params({ mountType: "pipe", angle: join }))).toBeCloseTo(expected, 6);
  expect(seating(params({ mountType: "pipe", angle: join + 2 }))).toBeGreaterThan(expected);
});

test("the fitting seat hands over at both profile joins", () => {
  const R = jointDiameter("fitting") / 2;
  const Rd = DEFAULTS.diameter / 2;
  const c = mountStart(DEFAULTS.length, R);
  const z2 = frontCentre(DEFAULTS.diameter, DEFAULTS.length);
  const b = HARDWARE.fitting.bore / 2;
  const rad = (angle: number) => (angle * Math.PI) / 180;
  const coneJoinTransverse = (angle: number) =>
    Rd * Math.cos(rad(angle) + OVERHANG) + (c - z2) * Math.sin(rad(angle));
  const cylinderJoinTransverse = (angle: number) =>
    Rd * Math.cos(rad(angle)) + (c - z2) * Math.sin(rad(angle));
  const bisect = (f: (angle: number) => number) => {
    let lo = 0;
    let hi = 90;
    while (hi - lo > 1e-9) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  // The cone/front join becomes the contact where its transverse reaches the bore.
  const coneJoin = bisect((angle) => coneJoinTransverse(angle) - b);
  expect(analyticSeating(params({ mountType: "fitting", angle: coneJoin - 0.5 })).feature).toBe("cone");
  expect(analyticSeating(params({ mountType: "fitting", angle: coneJoin + 0.5 })).feature).toBe("front");
  expect(seating(params({ mountType: "fitting", angle: coneJoin }))).toBeCloseTo(
    Rd * Math.sin(rad(coneJoin) + OVERHANG) + (z2 - c) * Math.cos(rad(coneJoin)),
    6,
  );

  // The front/cylinder join takes over where its transverse reaches the bore.
  const cylinderJoin = bisect((angle) => cylinderJoinTransverse(angle) - b);
  expect(analyticSeating(params({ mountType: "fitting", angle: cylinderJoin - 0.5 })).feature).toBe("front");
  expect(analyticSeating(params({ mountType: "fitting", angle: cylinderJoin + 0.5 })).feature).toBe("cylinder");
  expect(seating(params({ mountType: "fitting", angle: cylinderJoin }))).toBeCloseTo(
    Rd * Math.sin(rad(cylinderJoin)) + (z2 - c) * Math.cos(rad(cylinderJoin)),
    6,
  );
});
