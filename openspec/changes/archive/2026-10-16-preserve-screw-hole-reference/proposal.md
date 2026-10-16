# Proposal

## Why

The rounded nose moved the mount pivot rearward, carrying the screw hole with it. The pipe or fitting still stops at the cone, so the hole is now only 7.68 mm or 6.81 mm from its edge at 0°, breaking the previous approximately 10 mm spacing.

## What Changes

- Keep the tangent sphere and its pivot, but place the screw hole relative to the previous cone-to-mount flush reference.
- Correct the mount scenarios to describe the spherical cap and its concealment inside a coaxial mount.
- Update the fitting cavity height and add regression checks for physical edge spacing and mount containment.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: screw-hole datum, dependent cavity height, and mount scenario wording.

## Impact

Only screw-hole placement and the cavity cap it controls change. The sphere–cone–sphere body, mount pivot, mount length, form and downloads retain their existing definitions.
