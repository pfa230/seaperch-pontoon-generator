# Tasks

## 1. Rear cut

- [x] 1.1 In `src/profile.ts`, add a `REAR_CUT` constant, the rear sphere's cut latitude below its equator, 55° (where the surface makes 35° with the bed), and use it in place of `OVERHANG` in `flatRadius` (`cos`), `rearCentre` (`sin`) and the rear term of `minLength`; the front term of `minLength` keeps `OVERHANG`. Verify `npm run build` type-checks
- [x] 1.2 Update `src/profile.test.ts` to the new numbers: flat 18.35 mm across and rear centre z ≈ 13.11 mm (spec delta), front centre unchanged at ≈ 152.1 mm, minimum length 16 × (cos 35° + 1 / sin 35°) ≈ 41.00 mm with both centres equal; verify `npx vitest run src/profile.test.ts` passes
- [x] 1.3 In `src/validate.test.ts`, change the two passing length fixtures from 37.1 to 41.1 (above the new ≈ 41.002 mm minimum) and the body-too-short message assertion from "37.1 mm" to "41.0 mm"; verify `npx vitest run src/validate.test.ts` passes
- [x] 1.4 Re-measure the default pontoon in `src/model.test.ts` and update the "displaces … with … of material" test, its name and its comment to the new values (expected about 133.9 mL, 25.0 cm³ and 26.7 g ASA); verify `npx vitest run src/model.test.ts` passes, including the minimum-length export and closed-STL cases

## 2. Integration

- [x] 2.1 Run `npm test`, `npm run build` and `openspec validate --all --strict --no-interactive`; verify all pass
