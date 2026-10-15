# Proposal

## Why

Today the page shows the pontoon only as numbers, so a student cannot see what a mount type or mount angle does until they open the downloaded file in a slicer. A 3D preview they can rotate and zoom shows the shape before they download.

## What Changes

- Add a 3D view of the generated pontoon to the page, between the form and the buoyancy readout.
- Dragging rotates the view around the pontoon, the mouse wheel or a pinch zooms, and a "Reset view" button frames the whole pontoon from the starting direction.
- A new pontoon replaces the shown one without resetting the user's rotation or zoom. The preview shows a pontoon exactly when the readout shows numbers, so it is empty while the inputs are invalid, while a new pontoon generates, and after generation fails.
- The worker returns a display mesh of the pontoon with each set of volumes.
- Add `three` as a runtime dependency for rendering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-generator-page`: adds requirements for a rotatable, zoomable 3D preview of the current pontoon and for when it shows nothing.

## Impact

- `index.html`, `src/style.css`, `src/main.ts`, `src/worker.ts`, `src/model.ts`, `src/model.test.ts`, and a new `src/preview.ts`.
- New dependencies: `three` (runtime) and `@types/three` (development).
- The preview needs WebGL. Without it the preview area says the preview is unavailable, and the form, readout and downloads work as before.
