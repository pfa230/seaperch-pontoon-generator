# Proposal

## Why

The current mount is a single solid cylinder with a screw hole positioned from a nominal cone reference, so neither the insertion length nor the hole spacing follows where the pipe or fitting actually seats at each angle. A wider lower section and a distinct insertion peg provide the requested seating shoulder and predictable fastening dimensions.

## What Changes

- Select d from the pipe bore for an inside-pipe mount or the fitting socket bore for an into-fitting mount, retaining the existing fit clearance; use d for a 20 mm solid insertion peg with its M3 hole centred 10 mm from the seating shoulder.
- Connect the shoulder to the pontoon with a cylinder of diameter d + 4 mm, and enlarge the nose sphere tangent to the cone to that same diameter.
- Calculate the closest noncolliding shoulder position using 2D profile geometry and trigonometry with the selected pipe or fitting dimensions; perform no 3D collision queries during generation.
- Continue the sealed body cavity into the wider section at 0°, 30° and 45° using the selected wall thickness; keep that section solid at 60° and 90°.
- **BREAKING**: replace the 25 mm pivot-to-tip mount length and nominal screw-hole reference, and validate body size against the larger nose diameter. Some previously accepted narrow bodies become invalid, and exported geometry and buoyancy values change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: stepped mount, enlarged tangent nose sphere, angle-dependent hollowing, collision-derived seating and shoulder-relative screw hole.
- `pontoon-generator-page`: validate the enlarged nose against the existing body-size limit.

## Impact

Update geometry and dimensions in `src/model.ts`, `src/profile.ts` and `src/settings.ts`, the existing size check in `src/validate.ts`, their tests and the build-setting description in `README.md`. Reuse the current CAD kernel, browser worker, mesh, volume and export paths. No new dependencies or form inputs are needed. The design records the reference pipe/socket collision geometry and its dimensional assumptions.
