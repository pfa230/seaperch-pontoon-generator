# Tasks

## 1. Settings and parameters

- [x] 1.1 Add `FIT_CLEARANCE`, `HOLE_DIAMETER` and `HOLE_FROM_START` to `src/settings.ts` as in design.md; verify with a unit test in `src/settings.test.ts` that the hole lies fully inside the mount, failing when `HOLE_FROM_START` is moved past `MOUNT_LENGTH`
- [x] 1.2 In `src/profile.ts`, remove `clearance`, `holeDiameter`, `holeDistance` and `density` from the parameters and defaults, add `filament` defaulting to `asa` with the density map from design.md, and read the clearance from settings; verify the existing profile tests pass with the 15.60 and 21.14 mm mount diameters unchanged
- [x] 1.3 In `src/validate.ts`, delete the clearance and screw hole rules and keep the rest; verify `src/validate.test.ts` has no tests for removed rules and still covers the body-too-short and mount-too-wide scenarios

## 2. Geometry

- [x] 2.1 In `src/model.ts`, place the 3.2 mm hole 10 mm from the mount's start point and cap the cavity with the 35° cone whose point is t below the hole's lowest point, as in design.md; delete `holeClearsCavity`. Verify with model tests that the cavity's highest point is about 176.06 mm for the default pipe mount at 0° and about 172.10 mm for the fitting mount at 0°, that both mount types at 45° produce one closed solid whose hole does not reach the cavity, and that the default pontoon displaces 135.4 mL within 1%
- [x] 2.2 Update the default material-volume test to the new geometry: measure it, record the figure in the test with the hand check that the increase over the previous 24.2 cm³ is about 1.1 cm³, and verify the test passes

## 3. Page

- [x] 3.1 In `index.html` and `src/main.ts`, remove the fit clearance, screw hole diameter, screw hole distance and density inputs and the readout note, add the filament dropdown defaulting to ASA/ABS, and compute mass from the selected filament; in `src/worker.ts`, remove the hole-check error. Verify in the dev server that the defaults show ASA/ABS, that switching to PLA raises the mass by the ratio 1.24/1.07, that no removed input or the note appears, and that both downloads still work
- [x] 3.2 Update README.md if it mentions any removed input or build setting; verify with `rg -n -i 'clearance|hole|density' README.md` that what remains is correct
