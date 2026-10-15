# Proposal

## Why

The form asks students for values they cannot sensibly choose: fit clearance, screw hole size and position, and a filament density in g/cm³. Fixing the mount details to what the team actually uses (an M3 screw 10 mm from the pipe or fitting edge) and choosing filament by name makes the page usable without explanation.

## What Changes

- Replace the filament density input with a filament dropdown: PLA, PETG and ASA/ABS, defaulting to ASA/ABS.
- Remove the note "Mass assumes solid walls (100% infill). Lift assumes fresh water, 1.0 g/mL."
- Remove the fit clearance input. The clearance becomes a fixed build setting, 0.2 mm.
- Remove the screw hole diameter input. The hole is fixed at 3.2 mm, for an M3 screw.
- Remove the screw hole distance input. The hole is fixed 10 mm along the mount from the mount's start point, which is where the pipe or fitting edge comes to rest.
- End the internal cavity one wall thickness below the screw hole, so the hole can never reach the cavity. The validation rule and the kernel check for hole-to-cavity clearance go away.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-geometry`: fixed fit clearance; fixed screw hole size and position measured from the mount's start point; the cavity's top ends below the screw hole.
- `pontoon-generator-page`: the form drops three inputs and replaces density with a filament choice; validation drops the clearance and screw hole rules; the readout drops its note.

## Impact

- `index.html`, `src/main.ts`, `src/profile.ts`, `src/validate.ts`, `src/model.ts`, `src/worker.ts`, `src/settings.ts` and their tests.
- With the default ASA/ABS filament, net lift drops by about 1.2 g (pipe mount at 0°) to 6.2 g (fitting mount at 45°), because the solid nose grows by about 1.11 to 5.82 cm³.
