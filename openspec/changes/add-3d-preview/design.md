# Design

## Context

See proposal.md for why. The CAD kernel runs in `src/worker.ts`; for each valid parameter set the page sends a request and the worker answers with a `volumes` response built by `measure` in `src/model.ts`, which builds the outer solid (body, ball joint, mount, screw hole) and, separately, the hollowed pontoon. `toSTL` already meshes a shape with replicad's `shape.mesh()`, which returns flat `vertices`, `normals` and `triangles` arrays. `src/main.ts` clears the readout on every input change and fills it when the response arrives. The page has no rendering code and no runtime dependency besides replicad.

## Goals / Non-Goals

**Goals:**

- One new module, `src/preview.ts`, owns everything about drawing; `main.ts` only tells it to show a mesh or clear.
- The worker builds each solid once per request, as today, plus one mesh.

**Non-Goals:**

- Showing the internal cavity, a cut-away, dimensions, a print bed or a grid.
- Remembering the view between visits.
- Panning as a supported feature. The controls allow it by default and nothing depends on it.

## Decisions

### Rendering with three.js

`three` (`^0.186.1`) with its `OrbitControls` addon gives a renderer, camera, lighting, and mouse, wheel and touch handling in a few dozen lines of our code. `@types/three` (`^0.186.0`) goes in dev dependencies.

Alternatives: raw WebGL means writing shaders, matrix maths and pointer and pinch handling ourselves, a few hundred lines to own. `<model-viewer>` needs glTF, which the worker would have to produce, and brings its own styling and loading behaviour.

The library adds a few hundred kB to the bundle, small next to the CAD kernel's WebAssembly file the page already loads. It is imported statically; lazy loading would save little for that cost.

### Mesh from the worker

`measure(p)` builds the outer solid once, measures it, cuts the cavity from it for the material volume, and meshes the outer solid with `tolerance: 0.1` mm and `angularTolerance: 0.1` rad. It returns `{ displaced, material, mesh }`, where `mesh` holds `vertices` and `normals` as `Float32Array` and `triangles` as `Uint32Array`, ready for three's buffer attributes. replicad's booleans leave their inputs intact, so reusing the outer solid is safe.

The outer solid looks the same as the pontoon from outside and has about half the triangles, because it has no cavity surface. The coarser tolerance than the STL's 0.01 mm keeps meshing cheap; the replicad normals keep curved faces smooth and the face edges sharp.

The worker's `volumes` response becomes `{ type: "model"; id; displaced; material; mesh }`. Structured cloning copies the arrays; at this mesh size the copy is not worth a transfer list.

### Viewer module

`src/preview.ts` exports `createPreview(container: HTMLElement)` returning `{ show(mesh), clear() }`:

- A `WebGLRenderer` on a canvas filling the container, a `PerspectiveCamera` with `up` set to +z so the pontoon's print frame stands upright, a hemisphere light, and a directional light attached to the camera so the visible side is always lit.
- One `Mesh` with a `MeshStandardMaterial` in a single colour. `show` swaps in a new `BufferGeometry` and disposes the old one; `clear` hides the mesh.
- `OrbitControls` with default settings. It handles drag, wheel and pinch, prevents the wheel from scrolling the page, and sets `touch-action: none` on the canvas.
- Rendering on demand: on the controls' `change` event, after `show`/`clear`, and when a `ResizeObserver` reports a new container size. No animation loop runs.
- `fit()` points the controls at the centre of the mesh's bounding sphere and places the camera from a fixed direction, slightly above and in front, at the distance where the sphere fills the view. The first `show` calls it; later `show`s do not, so the user's view survives updates. The "Reset view" button calls it.

If creating the renderer throws (no WebGL), `createPreview` writes "3D preview unavailable in this browser." into the container and returns `show`/`clear` that do nothing, so `main.ts` has no second code path.

### Page wiring

`index.html` gets a `<div id="preview">` and a "Reset view" button between the form and the readout section. `style.css` gives the preview `aspect-ratio: 1` at the full width of `main`. In `main.ts`, the same places that clear the readout call `preview.clear()`, and the `model` response calls `preview.show(response.mesh)` next to `showReadout`. A failed response clears it too.

The preview follows the readout exactly, including going empty while a new pontoon generates. Keeping the old pontoon on screen during generation would avoid a brief blank, but it is a second rule for one widget; the user can ask for it after seeing the uniform behaviour.

## Risks / Trade-offs

- [The preview blanks for the generation time on every input change] → Same as the readout today; revisit if it feels jarring in use.
- [A pontoon much longer than the one first framed can overflow the view] → "Reset view" frames the current pontoon.
- [three.js has no browser test here; vitest runs in Node without WebGL] → The mesh is unit tested in `src/model.test.ts`; the viewer is checked by hand in the dev server against the spec scenarios.
