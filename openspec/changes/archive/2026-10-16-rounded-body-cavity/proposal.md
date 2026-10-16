# Proposal

## Why

The extra cavity-roof cone narrows the hollow nose and produces a thick band in the cross-section. The cavity must follow the pontoon body without its mount, including the tangent nose sphere, at the selected wall thickness.

## What Changes

- Replace the separate cavity-roof cone with an inward offset of the existing sphere–cone–sphere body.
- Keep sphere centres fixed and reduce each radius by the selected wall thickness, so the inner cone stays tangent to both front spheres.
- Preserve the hollow-through-45° lower mount, solid 60°/90° lower mount, sealed cavity and solid insertion peg.
- Verify thickness locally across the nose profile instead of relying on one minimum gap; update material-volume expectations.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: rounded body cavity and the inner spherical-cap overhang exception.

## Impact

`src/model.ts`, its existing geometry tests and the geometry spec. Outer geometry, seating, form controls and export interfaces remain the same. Material mass and net lift change because the unnecessary solid band is removed.
