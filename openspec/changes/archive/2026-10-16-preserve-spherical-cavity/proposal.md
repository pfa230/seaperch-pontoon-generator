# Proposal

## Why

The final cavity still loses its spherical nose: at 0°–45° a shoulder-plane cut and cylindrical bore reshape it, and at 60°–90° the solid mount removes part of it. The user wants the cavity shaped like the pontoon without its mount, and clarified that overlap with the nominal mount is acceptable when enough wall remains for watertightness.

## What Changes

- Form the complete solid body and stepped mount, then subtract the unchanged inward-offset body cavity, including the entire tangent nose cap, at every offered angle.
- Keep the existing mount pivot, analytically calculated pipe/fitting seating, diameters, 20 mm peg length and screw-hole location.
- **Geometry contract change:** allow the body cavity to overlap either nominal mount cylinder. Material outside that cavity remains solid apart from the screw hole. Replace the old pre-shoulder closure, separate mount bore and whole-cylinder exclusion rules; they must not flatten or truncate the body cavity.
- Require at least the selected wall thickness between the cavity and the actual exterior and screw hole. Overlap with a construction cylinder is not a leak or a reason to move the shoulder.
- Verify the final cavity and cross-section on both sides of the nose for all angles, both mount types and offered walls. Replace assertions that require the observed defects.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: final body-cavity shape, permitted mount overlap and watertight separation from actual openings.

## Impact

The eventual implementation is confined to cavity construction in `src/model.ts` and the existing geometry tests in `src/model.test.ts`. The current body-profile helper, seating calculation, section renderer and exporters can be reused. Material volume, mass and lift change with the corrected void. No new dependencies, controls or runtime collision checks are required.
