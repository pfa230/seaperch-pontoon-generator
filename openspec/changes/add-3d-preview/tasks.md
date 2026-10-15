# Tasks

## 1. Mesh from the worker

- [ ] 1.1 Change `measure` in `src/model.ts` to build the outer solid once, cut the cavity from it, and return `{ displaced, material, mesh }` with the outer solid meshed at 0.1 mm / 0.1 rad as typed arrays, as in design.md. Add a model test that the default pontoon's mesh has vertex z values from 0 to about 193.86 mm, a triangle count divisible by 3 and no index past the vertex count, and verify the existing volume tests still pass with `npm test`
- [ ] 1.2 In `src/worker.ts`, replace the `volumes` response with `{ type: "model"; id; displaced; material; mesh }`, and update the `volumes` case in `src/main.ts` to `model`; verify `npm run build` type-checks

## 2. Viewer

- [ ] 2.1 Add `three@^0.186.1` to dependencies and `@types/three@^0.186.0` to dev dependencies with `npm install`; verify `npm ci` succeeds from the updated lockfile
- [ ] 2.2 Write `src/preview.ts` with `createPreview(container)` returning `show(mesh)` and `clear()`, the on-demand rendering, `fit()` and the no-WebGL message, as in design.md; verify `npm run build` type-checks
- [ ] 2.3 Add the `#preview` container and "Reset view" button to `index.html`, its styles to `src/style.css`, and the `show`/`clear`/reset calls to `src/main.ts`. Verify in the dev server each scenario in the spec delta: the default pontoon appears upright and whole, drag rotates, the wheel zooms without scrolling the page, changing the angle to 30° keeps the view, "Reset view" frames a 300 mm pontoon, a 50° angle empties the preview, and with WebGL disabled (Chrome `--disable-webgl`) the unavailable message shows while both downloads still work

## 3. Integration

- [ ] 3.1 Run `npm test`, `npm run build` and `openspec validate --all --strict --no-interactive`; verify all pass, and note the size of the built JavaScript in `dist/assets` before and after the change in the implementation summary
