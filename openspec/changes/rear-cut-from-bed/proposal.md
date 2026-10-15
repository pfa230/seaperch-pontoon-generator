# Proposal

## Why

The rear sphere is cut where its surface leans 35° from the body axis, so the wall rises from the rear flat at 55° to the print bed and the flat is 26.2 mm across at D = 32 mm. The rear should instead be cut where its surface meets the bed at 35°, giving a rounder rear with a smaller flat.

## What Changes

- The rear sphere is cut at the latitude where its surface makes 35° with the print bed (55° from vertical). At D = 32 mm the flat shrinks from 26.2 mm to 18.4 mm across.
- The overhang limit no longer covers the rear sphere's lowest band: the outer surface there leans up to 55° from vertical, at the flat's edge. The front cone, the rest of the body and the cavity keep the 35° limit.
- Body length L is still measured from the flat to the cone's point, so the cylinder shortens by 3.9 mm at D = 32 mm and the minimum length rises from 37.1 mm to 41.0 mm.
- The default pontoon displaces about 1.5 mL less (about 133.9 mL) and uses about 0.3 cm³ less material.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: the "Overhang limit" requirement cuts the rear sphere at 35° from the bed instead of 35° from vertical, and exempts the rear sphere's lowest band from the 35° limit.
- `pontoon-generator-page`: the "Form validation rules" requirement's "Body too short" scenario states the new minimum length, about 41.0 mm at D = 32 mm.

## Impact

- `src/profile.ts`: `flatRadius`, `rearCentre` and `minLength` use the rear cut angle instead of `OVERHANG`.
- `src/profile.test.ts`, `src/model.test.ts`, `src/validate.test.ts`: expected flat size, sphere centre, minimum length, volumes and the minimum-length error message.
- The page's minimum-length error message follows `minLength` with no change of its own.
- No change to the front cone, mount, screw hole, cavity cap, preview or downloads.
