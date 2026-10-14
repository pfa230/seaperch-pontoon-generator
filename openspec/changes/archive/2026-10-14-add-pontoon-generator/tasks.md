# Tasks

## 1. Scaffold

- [x] 1.1 Create a Vite vanilla TypeScript app at the repository root with `vitest`, `replicad` and `replicad-opencascadejs`, and `npm test` and `npm run build` scripts; verify `npm ci && npm test && npm run build` succeeds, with `dist/` and `node_modules/` git-ignored
- [x] 1.2 Set `openspec/loop.yaml` checks to `npm ci`, `npm test`, `npm run build` and `openspec validate --all --strict --no-interactive`; verify each command exits 0

## 2. Profile math and validation

- [x] 2.1 Add `src/settings.ts` with the fixed mount length, 25 mm; verify with a unit test that it is at least the fitting mount's largest radius, 21.34 / 2 mm (zero clearance)
- [x] 2.2 Implement `src/profile.ts` for the derived numbers in design.md (sphere centres, flat radius, cone apex, minimum length, mount radius and start point); verify with unit tests for the spec values: 26.2 mm flat at D = 32, about 37.1 mm minimum length at D = 32, 15.60 and 21.14 mm mount diameters, and mount start at about z = 168.86 for the default pipe mount
- [x] 2.3 Implement `src/validate.ts` for every arithmetic validation rule in the page spec, reading mount length from `src/settings.ts`, returning errors keyed by input; verify with one passing and one failing unit test per rule, including the body-too-short, mount-too-wide, clearance-leaves-no-mount (15.80 mm on an inside-pipe mount) and screw-hole-severs-the-mount (20 mm hole 12 mm from the end of the 25 mm mount) scenarios

## 3. Solid model

- [x] 3.1 Implement `src/model.ts` to build the body, mount, cavity and screw hole in the order given in design.md; verify with Node tests that the defaults produce one solid whose lowest point is z = 0, whose highest body point is z = 180 before the mount, and whose mount ends at about z = 193.86; and that both mount types at 45° produce one solid with the mount cylinder's base disc inside the ball joint
- [x] 3.2 Add the screw-hole clearance check and the displaced and material volume measurements; verify the default pontoon displaces 135.4 mL and has 24.2 cm³ of material (30.0 g at 1.24 g/cm³), each within 1% of these hand-computed values, and that a hole placed over the cavity is rejected
- [x] 3.3 Add STEP and STL export; verify with tests that both mount types at 0° and 45°, and the minimum body length, produce non-empty STEP and STL output without kernel errors

## 4. Page

- [x] 4.1 Implement `src/worker.ts`, which loads the kernel once, builds models and answers volume, validation and export requests, letting newer requests supersede older ones; verify in the dev server that editing the form during generation stays responsive
- [x] 4.2 Build the form with spec defaults and no mount length input, per-input error messages, the buoyancy readout with its solid-walls and fresh-water note, and STEP and STL download buttons with the spec file names, disabled while inputs are invalid; verify in the dev server that the defaults download `pontoon_d32_l180_pipe_a0.step` and `.stl`, that a 50° angle disables both, and that the form has no mount length input
- [x] 4.3 Add run and build instructions to README.md; verify the documented commands work from a clean clone

## 5. Integration

- [x] 5.1 Import the default STEP into FreeCAD or another STEP reader and the default STL into a slicer; verify both show one closed solid standing on its flat, with the mount and screw hole in place and the expected dimensions
