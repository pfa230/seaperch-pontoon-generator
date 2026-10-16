# Proposal

## Why

The exterior preview hides the pontoon's cavity, wall thickness and mount connection. A lengthwise cross-section lets the user inspect these features in the same 3D view.

## What Changes

- Add an initially unchecked "Show cross-section" checkbox beside the preview controls.
- When checked, show a lengthwise half-model cut through the body axis in the plane of mount rotation, exposing the cavity and solid cut faces.
- Keep the chosen view mode across parameter changes and Reset view, preserving rotation and zoom when toggling.
- Treat the checkbox as a preview control: measurements and STEP/STL downloads continue to represent the complete pontoon.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-generator-page`: Add the cross-section toggle and include it in the existing responsive layout requirements.

## Impact

Changes affect `index.html`, `src/style.css`, `src/main.ts`, `src/preview.ts`, and the mesh returned through `src/model.ts` and `src/worker.ts`. Extend the existing model tests and verify the browser interaction. Reuse the current CAD worker and Three.js renderer; no new dependencies or geometry dimensions are needed.
