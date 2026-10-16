# Tasks

## 1. Generate the section mesh

- [x] 1.1 In `src/model.ts`, reuse the completed hollow solid for material volume and cut it to a Y >= 0 half-solid, then mesh that half (with its true section faces) using the existing preview tolerances; add `sectionMesh` to the worker model response. Extend `src/model.test.ts` to verify the retained half, cut faces, cavity and half-material volume for both mounts and all offered angles, including representative thin/thick walls; verify existing full-model volume, mesh and export tests still pass with `npm test`.

## 2. Connect the preview control

- [x] 2.1 Extend `src/preview.ts` to accept both meshes, switch the object's geometry using one cross-section selection, dispose replaced geometries, frame against the complete model, and preserve the existing clear/no-WebGL behavior. Verify `npm run build` and inspect the 0° and 90° cutaways from the starting and rotated viewpoints, with camera rotation/zoom unchanged by toggling.
- [x] 2.2 Add the labelled, unchecked "Show cross-section" checkbox outside `#form` in `index.html`, wire it in `src/main.ts`, and scope its layout in `src/style.css`. Verify mouse and keyboard toggles, no generation on toggle, selection across parameter changes and Reset view, and visible controls without overlap or sideways scrolling at 1280 × 650 and 360 px widths.

## 3. Verify the integrated behavior

- [x] 3.1 Run `npm test` and `npm run build`; exercise toggles while generating, during invalid inputs and after generation failure, plus the no-WebGL path. Verify readouts remain those of the complete model and STEP/STL downloads contain the complete hollow pontoon with either checkbox setting.
