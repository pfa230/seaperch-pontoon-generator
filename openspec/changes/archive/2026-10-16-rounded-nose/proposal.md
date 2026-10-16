# Proposal

## Why

The front currently combines a pointed cone with an overlapping ball that is not tangent to the cone. The requested front is a sphere to 55° from the axis, a cone, then a spherical sector with the mount diameter.

## What Changes

- Keep the body-sized front sphere and its 55° polar transition to the 35° cone.
- End the cone tangentially on a sphere whose diameter equals the selected mount diameter.
- Pivot the mount at that sphere's centre; remove the redundant overlapping ball.
- Keep L referenced to the cone's virtual point, preserving cylinder length and minimum-length validation.
- Cap the cavity below both the screw hole and the rounded nose tip to retain the wall and 35° cavity roof.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: body shape, front overhang exception, cavity cap and mount root.

## Impact

Geometry, volume estimates and exports change together through the existing model builder. Mount and screw-hole heights move down; form inputs and validation stay the same.
