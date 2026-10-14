# Design

## Context

The repository holds no code yet; see proposal.md for motivation. Pontoon sizing in the team's notes uses straight tubes such as 32 × 180 mm, which displace about 135 cm³ and print at about 29 g. The defaults in the specs reproduce that pontoon. The page must produce STEP, so it needs a B-rep CAD kernel, not just a mesh library.

## Goals / Non-Goals

**Goals:**

- One static page, built with `npm run build`, that a school laptop can open with no install.
- Geometry rules that can be checked by tests without a browser.

**Non-Goals:**

- Hosting or a deploy pipeline. The build output is plain static files; hosting is a later change.
- A 3D preview. Users check the model in their slicer or CAD program.
- Other body shapes, salt water, partial-infill mass, and per-printer tolerance calibration beyond the fit clearance input.

## Decisions

### Kernel: replicad on OpenCascade WebAssembly

`replicad` wraps `replicad-opencascadejs`, a WebAssembly build of OpenCascade, and exports both STEP and STL from the same solid. One kernel gives STEP natively, so the "STL only if STEP is too hard" fallback is not needed; both downloads come from one model.

Alternatives: three.js or Manifold produce meshes only, so STEP would be impossible. A server running CadQuery would need hosting and upkeep, which conflicts with a static page.

### App: Vite, TypeScript, plain DOM

The form has ten inputs and three outputs, so a UI framework would add more than it saves. Vite bundles the WebAssembly file and the worker. Vitest runs the tests.

### Geometry runs in a Web Worker

The kernel takes about a second to load and a fraction of a second per model. Running it in a worker keeps the form responsive, as the spec requires. The main thread posts parameters and receives volumes, validation errors and, on request, a STEP or STL blob. Each new parameter set supersedes any result still in flight.

### Profile math is a pure module

`profile.ts` turns parameters into derived numbers: sphere centres, cone apex, mount start point, mount diameter and minimum body length. `validate.ts` applies the validation rules that need only arithmetic. Neither imports the kernel, so their tests run fast in Node. `model.ts` builds the solid from those numbers with replicad, and `worker.ts` wraps it.

With R = D/2, the axis along z and the flat at z = 0:

- Rear sphere centre: z₁ = R·sin 35°. Cutting there leaves a flat of radius R·cos 35°.
- Cone apex: z = L. Front sphere centre: z₂ = L − R / sin 35°. A cone with a 35° half-angle is tangent to the sphere where its surface leans 35° from vertical.
- Minimum length: z₂ ≥ z₁, so L ≥ R·(sin 35° + 1 / sin 35°) ≈ 2.317·R.
- Mount radius: r = (15.80 or 21.34 − clearance) / 2. Its start point is z = L − r / tan 35°, and it needs r ≤ R·cos 35° so that point lies on the cone.

The pipe and fitting diameters are 1/2" Schedule 40 values: 0.840" outside diameter, which a fitting socket accepts, and 0.622" nominal inside diameter. The fit clearance input absorbs pipe tolerance and printer variation.

### Solid construction order

1. Revolve the outer profile (flat, rear sphere arc, cylinder, front sphere arc, cone) to get the body.
2. Fuse the mount: a cylinder through the start point, tilted about the y axis, extended backward by r·tan(angle) + r so its base is buried in the body.
3. Subtract the cavity, which is the outer profile offset inward by t and revolved: inner spheres of radius R − t on the same centres, a cone with the same half-angle, and a floor at z = t. Every inner surface is parallel to an outer one, so it obeys the same 35° limit.
4. Subtract the screw hole, a cylinder along y.

Subtracting the cavity after the fuse keeps every inner surface a body offset, even where the cavity tip reaches into the mount. The cavity stays sealed because it is at least t inside the body everywhere.

Alternative: fuse the mount after hollowing. That leaves the mount's buried base exposed inside the cavity as a downward-facing face, which breaks the overhang limit.

### Screw-hole clearance is checked on the solid

A tilted mount makes a closed-form distance between the hole and the cavity awkward, and a conservative arithmetic bound rejects valid fitting mounts at large angles. The worker intersects the cavity with the hole cylinder enlarged to radius h + t. A non-zero intersection volume rejects the parameters, with the error shown on the screw hole position input.

### Volumes come from the kernel

Displaced volume is the volume of the solid with the cavity filled: steps 1, 2 and 4, without step 3. Material volume is the volume of the finished solid. Both come from replicad's volume measurement, so the tilted mount and the hole need no hand-written formulas. Mass is material volume × density. Net lift is displaced volume × 1.0 g/mL − mass.

### Checks

`openspec/loop.yaml` checks become `npm ci`, `npm test`, `npm run build` and OpenSpec validation. Kernel tests load the WebAssembly module in Node through Vitest.

## Risks / Trade-offs

- [The WebAssembly bundle is about 10 MB] → It loads once, the browser caches it, and the page shows a loading state until the worker is ready.
- [A mount tilted beyond 35° overhangs on its underside] → The spec states this. The user chose a 0–45° range, and a short 21 mm cylinder usually prints at 45° without support.
- [The inner cone tip is a 35° overhang printed as a closing point] → This is the shape the user chose, and slicers close small cone tips cleanly.
- [Real PVC dimensions vary between makers] → The clearance input is the tuning knob. Defaults come from nominal Schedule 40 values, not measurements.
- [OpenCascade booleans can fail on tangent or coincident faces] → The tilted mount is extended past the surface rather than starting on it, and tests generate the corner cases: angles 0° and 45°, both mount types, and the minimum body length.
