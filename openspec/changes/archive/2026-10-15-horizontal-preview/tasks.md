# Tasks

## 1. Viewer

- [x] 1.1 In `show()` in `src/preview.ts`, turn each new geometry with `rotateY(-Math.PI / 2)` then `rotateZ(Math.PI)`, and update the `VIEW_DIRECTION` comment if it no longer matches, as in design.md; verify `npm run build` type-checks
- [x] 1.2 Change `fit()` in `src/preview.ts` to frame by the geometry's bounding box as in design.md, setting `camera.far` from the box instead of the sphere; verify `npm run build` type-checks
- [x] 1.3 Verify in the dev server each scenario of the "3D preview" requirement in the spec delta: in a 1280 × 650 viewport the default pontoon lies horizontally, whole, mount at the left, spanning at least 80% of the preview's width; drag rotates and the wheel zooms without scrolling the page; changing the angle to 30° keeps the view and shows the mount tilted up; "Reset view" frames a 300 mm pontoon whole; and in a 360 px viewport the pontoon fits the square preview

## 2. Integration

- [x] 2.1 Run `npm test`, `npm run build` and `openspec validate --all --strict --no-interactive`; verify all pass
