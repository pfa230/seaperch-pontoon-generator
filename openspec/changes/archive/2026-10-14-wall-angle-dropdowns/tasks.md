# Tasks

## 1. Validation

- [x] 1.1 In `src/validate.ts`, limit the non-numeric and non-positive checks to outer diameter and length, and delete the mount angle range rule and the wall-of-D/4 rule. In `src/validate.test.ts`, drop the "mount angle out of range" and "wall of D/4 or more" rows and move the non-numeric row from wall to diameter. Verify `npm test` passes and the length-too-short and mount-too-wide tests are unchanged

## 2. Geometry at steep angles

- [x] 2.1 In `src/model.test.ts`, run the "mount at 45°" checks for 90° as well, with the free end's normal at (sin a, 0, cos a), and add the pipe and fitting mounts at 90° to the export and closed-STL lists. `src/model.ts` should need no change. Verify `npm test` passes; if the kernel fails at 90°, stop and report the failing case instead of changing the geometry rules

## 3. Form

- [x] 3.1 In `index.html`, replace the wall thickness input with a select of options `0.8`, `1.2` and `1.6`, replace the mount angle input with a select of options `0`, `30`, `45`, `60` and `90` labelled with a degree sign, and relabel "Body length (mm)" as "Length (mm)". The option values must match `String(DEFAULTS[key])` so `src/main.ts` sets the defaults unchanged. Verify in the dev server that the form opens with 1.2 mm and 0°, that each select offers exactly its listed values, that choosing 90° updates the readout and enables both downloads, and that STL with "into fitting" at 30° saves `pontoon_d32_l180_fitting_a30.stl`
- [x] 3.2 Run `npm run build` and `openspec validate --all --strict --no-interactive`; verify both succeed
