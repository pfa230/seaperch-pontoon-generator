# Proposal

## Why

Students type wall thickness and mount angle as free numbers, though the team uses only a few values of each. Fixed choices remove typos and out-of-range errors, and the angle list adds the 60° and 90° mounts the team wants.

## What Changes

- Replace the wall thickness number input with a dropdown: 0.8, 1.2 and 1.6 mm, default 1.2 mm.
- Replace the mount angle number input with a dropdown: 0°, 30°, 45°, 60° and 90°, default 0°.
- Allow mount angles above 45°: the geometry accepts any angle from the list, up to 90°. The screw hole stays fixed 10 mm along the mount from its start point at every angle.
- Rename the "Body length" input to "Length".
- Drop the validation rules that fixed choices make unreachable: the mount angle range, the non-numeric and non-positive checks on wall thickness and mount angle, and the wall-of-D/4 rule, which never fires without the mount-width rule also firing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-generator-page`: wall thickness and mount angle become fixed choices; "body length" becomes "length"; validation drops the unreachable rules.
- `pontoon-geometry`: the mount angle is one of 0°, 30°, 45°, 60° and 90° instead of a value from 0° to 45°.

## Impact

- `index.html`, `src/validate.ts` and its tests; `src/model.test.ts` gains 90° cases. `src/main.ts` and `src/model.ts` need no change, because `main.ts` already reads every field other than mount type and filament as a number.
- Mounts at 60° and 90° lean past the 35° overhang limit, so they print with supports. The overhang limit already exempts the mount.
- The in-flight `add-3d-preview` change uses "body length" and an invalid mount angle of 50° in its scenarios. Whichever change lands second must update those scenarios.
