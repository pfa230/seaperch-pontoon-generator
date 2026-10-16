# Tasks

## 1. Joint dimensions and accepted body sizes

- [ ] 1.1 Separate the selected pipe/fitting peg diameter from its d + 4 mm lower mount/nose diameter in `src/profile.ts`, update the tangent-sphere pivot and the existing size check in `src/validate.ts`, and revise their tests and narrow-body fixtures; verify that switching mount type selects its own peg/lower-cylinder/sphere diameters and pivot, and verify the D = 26 mm fitting rejection while both default D = 32 mm mounts remain valid.

## 2. Seating and stepped outer mount

- [ ] 2.1 Add the documented pipe/reference-socket dimensions beside the existing dimension definitions and calculate seating in `src/profile.ts` with 2D rotations and line/circle intersections, without runtime CAD collision queries; add pure profile tests for both hardware selections, coaxial seat heights, profile joins and all offered angles, then cross-check no penetration at seating and penetration after an inward shift in model tests only.
- [ ] 2.2 Build the d + 4 mm lower cylinder to the shoulder and the 20 mm solid peg beyond it, place the M3 hole 10 mm from the shoulder, and remove the old nominal-reference correction and pivot-length constraint; update `src/settings.ts`, its test and the build-setting description in `README.md`, and verify peg/hole dimensions, enlarged tangent sphere, hidden base and mesh bounds in the existing tests.

## 3. Sealed cavity and resulting model

- [ ] 3.1 Continue the cavity into the lower cylinder at 0°/30°/45° using the selected wall thickness and close it before the shoulder; extend model tests to verify one connected cavity, t of wall/closure thickness and no cavity in the 20 mm peg for both mount types and all offered wall thicknesses.
- [ ] 3.2 Keep both mount cylinders solid at 60°/90° by excluding them from the body cavity, and use the body-roof reference c + R − t independently of screw-hole height at every angle; extend the existing angle matrix to verify the 45°/60° hollow-to-solid boundary, the default sideways pipe roof reference z ≈ 171.51 mm, a hollow body, separation from the screw hole, one valid solid and closed STEP/STL results, including updated valid narrow-body and minimum-length fixtures.
- [ ] 3.3 Refresh changed volume/material expectations from the resulting model and run `npm test` and `npm run build`; verify the existing measurement, preview-mesh and export checks all use the same stepped geometry and the revised buoyancy arithmetic remains consistent with its material volume.
