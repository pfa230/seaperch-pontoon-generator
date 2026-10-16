# Design

## Context

See `proposal.md` for motivation. In `src/model.ts`, `measure()` meshes the exterior solid and subtracts the cavity only for material volume. `src/worker.ts` returns one mesh alongside those volumes. `src/preview.ts` renders it with one material and preserves the camera after the first model. Its display transforms map the model's longitudinal Z axis to horizontal X. Mount tilt lies in the model's XZ plane, and the screw hole runs along Y.

The checkbox belongs outside `#form`: `src/main.ts` regenerates geometry on every form input event. Current styles give all inputs full width, so the checkbox needs a narrowly scoped layout rule. Existing tests in `src/model.test.ts` already initialize the CAD kernel and exercise model generation and exports.

## Goals / Non-Goals

**Goals:** Extend the existing worker-to-preview pipeline with a real cutaway, keeping toggles local to the renderer and reusing the existing model construction.

**Non-Goals:** Adjustable section planes, a second viewer, camera-following clipping, section file exports, saved preferences or changes to pontoon dimensions.

## Decisions

### Cut the completed hollow solid in its original coordinates

Reuse the hollow solid already needed for material volume in `measure()`. Cut away its Y < 0 half with a box sized from the solid's bounds, extending beyond the other bounds so it covers the complete body and tilted mount. The box boundary at Y = 0 gives a fixed lengthwise XZ section through both axes, including when the mount angle is zero. Retain Y >= 0. After the existing display transforms this becomes the side away from the starting camera, exposing the opening to the user.

Mesh the result with the existing preview tolerances and typed-array representation. The CAD boolean supplies actual material faces at the section, leaving the cavity opening empty. Merely clipping the current exterior mesh cannot reveal its missing interior surfaces; renderer clipping with stencil caps would add rendering machinery for a single fixed plane.

Use the complete exterior for displaced volume and the complete hollow solid for material volume. Keep the existing export path building the complete hollow pontoon. Derive the section from whichever completed geometry is current, including the separately proposed `stepped-pontoon-mount`; this plan introduces no joint formulas or dependency on that change.

### Return both display meshes with each model response

Keep the existing `mesh` field and add `sectionMesh` to the model response. Build both in the CAD worker during ordinary generation. The checkbox then switches the displayed geometry and renders immediately, without another worker request. Rebuilding the model on each toggle would unnecessarily clear the valid preview and readout; a separate section request and response cache would add state and stale-response handling already avoided by returning a pair.

In `src/preview.ts`, retain the two current display geometries and swap the single object's geometry according to one session-local cross-section boolean. Apply the existing transforms to both. Dispose both geometries when replacing them, using the existing material and renderer. Frame against the complete exterior's bounding box so Reset view has the same scale and target in either mode. Toggling changes neither framing nor object visibility: an empty preview must stay empty. Extend the existing no-WebGL return with a no-op toggle method.

### Use a native checkbox beside Reset view

Add a labelled, unchecked checkbox beside the existing preview controls and outside the parameter form. Connect its change event to the preview toggle method; do not add it to `Params`, worker requests or validation. Keep its selection when generation clears/replaces the meshes and when Reset view is pressed. Set the checkbox to unchecked in `src/main.ts` at startup so a page reload starts unchecked. These session defaults and retaining the half away from the starting camera are minor presentation assumptions.

Use scoped CSS for the checkbox and control placement, preserving the native keyboard behavior and existing focus indicator. Check that the controls do not overlap the generation status at laptop and phone widths. No visual redesign or new UI dependency is required.

## Risks / Trade-offs

- [Extra CAD operation and mesh] Generating both meshes adds work and memory per model; reuse the already-built hollow solid and keep the current preview tolerances. Generation stays in the existing worker.
- [Wrong half or coordinate space] Cutting after display transforms can obscure the opening or miss the tilted mount; cut in model coordinates and visually check the default and 90° views.
- [Cut face fills the cavity or misses material] A cut of the exterior alone would hide the hollow structure; verify the half-solid bounds, section faces and half-volume against the complete hollow solid for both mounts and all offered angles.
- [Toggle revives a stale preview] Preserve `clear()` visibility and the existing latest-response guard; check toggles during generation and invalid-input states.

## Verification

Extend the current model tests with the half-solid checks above, including representative thin and thick walls, and keep the existing full-volume, mesh and export assertions. Run `npm test` and `npm run build` during implementation. In the browser verify toggling without regeneration, rotation/zoom, parameter replacement, Reset view, complete downloads, empty/unavailable preview behavior, keyboard operation and the existing 1280 × 650 and 360 px layouts. Use these existing tools and direct browser checks; no additional test framework is needed.

## Cut pass

P below means `openspec/specs/pontoon-generator-page/spec.md`, as amended by this change. This list serves the repository's explicit cut-pass instruction. The planning records are the proposal, this design, the delta spec and tasks required by the user's `$openspec-propose` request; no implementation record or new configuration is added.

Cut from consideration: adjustable planes and saved preferences (no requested behavior); a second viewer (duplicates the existing preview); stencil caps (the CAD boolean already produces section faces); a separate section request/cache (the existing model response can carry both meshes). Reuse existing camera, material, response ordering, validation, focus styling, error handling, test runner and build commands.

| Kept item | Contract served | Simpler version and concrete failure |
| --- | --- | --- |
| Native checkbox outside the parameter form | P: Cross-section preview, Cross-section view state | Putting it in the form triggers CAD regeneration on toggle. |
| Scoped control CSS | P: Page layout, Visible keyboard focus | Current full-width input/column-label styling does not lay out the checkbox beside the preview controls. |
| Fixed XZ cut retaining Y >= 0 | P: Cross-section preview; user's plane clarification | An arbitrary plane misses the mount axis; the opposite retained half hides the opening from the starting camera. |
| Boolean half-cut of the hollow solid | P: Cross-section preview | Clipping the current exterior mesh omits interior surfaces and material cut faces. |
| Bounds-derived cutter extent | P: Cross-section preview | A fixed-size cutter can miss material when body dimensions change. |
| `sectionMesh` response field | P: Cross-section view state | Returning only the exterior requires regeneration on toggle. |
| Pair of current display geometries | P: Cross-section view state | Discarding the inactive geometry requires regeneration to restore it. |
| Session-local cross-section boolean | P: Cross-section view state | Resetting selection on replacement loses the checked mode after parameter changes. |
| Disposal of both replaced geometries | P: 3D preview, Runs in the browser alone | Disposing only the displayed geometry retains unused GPU allocations after each edit. |
| Framing from complete-model bounds | P: Cross-section view state, 3D preview | Framing the half-model shifts the camera target and reset scale. |
| Half-solid bounds/faces/volume checks | P: Cross-section preview | Visual inspection alone can miss a cavity filled by an incorrect cut or an incorrect retained half. |
| Existing full-volume/export checks | P: Buoyancy readout, File downloads | Half-solid checks alone do not establish complete-pontoon measurements and exports. |
| Browser interaction/availability checks | P: Cross-section view state, Preview availability | A successful build cannot show that toggling preserves camera and empty-preview state. |
| Keyboard/layout checks | P: Visible keyboard focus, Page layout | Geometry tests do not detect inaccessible or overlapping controls. |
| Existing test/build commands | P: Runs in the browser alone, 3D preview | Browser inspection alone misses type/protocol errors and geometry regressions. |
| Task 1.1 | P: Cross-section preview, Buoyancy readout | Reuse `measure()` and its worker response; a separate generation pipeline duplicates the model. |
| Task 2.1 | P: Cross-section preview, Cross-section view state | Reuse one mesh object/material; a second scene adds no required behavior. |
| Task 2.2 | P: Cross-section preview, Page layout, Visible keyboard focus | Use a native checkbox and direct handler; a new control framework adds no required behavior. |
| Task 3.1 | P: Cross-section view state, Preview availability, File downloads | Existing checks plus direct integrated interaction suffice; a new test framework adds no required coverage. |
