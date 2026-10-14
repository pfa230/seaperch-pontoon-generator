# Proposal

## Why

The team trims each ROV to neutral buoyancy by adding printed pontoons sized from an underwater weighing, as in "N grams heavy, add N mL of pontoon". Today each pontoon is modelled by hand in CAD. A web page that turns a few parameters into a print-ready pontoon, and reports its lift, lets students size and print pontoons themselves.

## What Changes

- Add a static web page with a form for pontoon parameters: outer diameter, body length, wall thickness, mount type, mount angle, mount length, screw hole diameter and position, and filament density.
- Generate a sealed, thin-walled pontoon: a cylinder with a spherical rear end cut flat for the print bed and a spherical front end that tapers to a cone. No wall leans more than 35° from vertical when printed standing on the flat.
- Add a mount on the nose, coaxial with the body or tilted up to 45°, that fits either inside a 1/2" Schedule 40 PVC pipe or into a 1/2" PVC fitting socket, with a transverse screw hole.
- Show displaced volume, estimated print mass and net lift for the current parameters.
- Download the pontoon as STEP, and as STL.
- Add the project's build and test commands to the openspec-loop checks.

Out of scope: hosting the page, a 3D preview, pontoon shapes other than the one above, and mass estimates for partial infill.

## Capabilities

### New Capabilities

- `pontoon-geometry`: the shape of a generated pontoon, including its body, print-bed flat, overhang limit, mount and screw hole.
- `pontoon-generator-page`: the web page's parameter form, input validation, buoyancy readout and file downloads.

### Modified Capabilities

None.

## Impact

- New Vite and TypeScript web app at the repository root, with dependencies on `replicad` and `replicad-opencascadejs` (OpenCascade compiled to WebAssembly) and `vitest` for tests.
- `openspec/loop.yaml` checks gain `npm ci`, `npm test` and `npm run build`.
- README gains run and build instructions.
