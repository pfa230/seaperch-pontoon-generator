# Design

## Context

See `proposal.md` for motivation and the delta specs for the geometry contract. `src/profile.ts` currently uses the same diameter for the peg and tangent nose sphere. `src/model.ts` fuses a 25 mm cylinder at that sphere's centre, positions the screw hole from an old nominal cone reference, and caps the body cavity below the hole or nose tip. There is no pipe/socket collision envelope in the project. Existing tests cover both mount types, all offered angles, cavity separation, CAD validity, mesh bounds and closed STL exports.

## Goals / Non-Goals

**Goals:** Keep geometry derived from the existing parameters and build settings, use one shoulder position for construction and fastening, and preserve the existing preview, measurement and export pipeline.

**Non-Goals:** New form controls, arbitrary fitting families, changes to PVC fit clearance, and modelling remote elbows, branches or internal socket stops. The collision check concerns the pipe or socket wall adjacent to the mount.

## Decisions

### Separate peg diameter from the wider joint

Let d be the existing fit-adjusted peg diameter and R = (d + 4) / 2. Keep the current sphere–cone–sphere body profile, enlarging only the small nose sphere tangent to the cone, not the D-sized front body sphere. Its centre and mount pivot become c = L − R / sin 35°. Both cylinders share direction u = (sin angle, 0, cos angle). The lower cylinder runs from the pivot to the shoulder; the peg runs from the shoulder to shoulder + 20u; the hole centre is shoulder + 10u.

Select all dimensions from the existing mount type: pipe uses d = 15.80 − clearance and fitting uses d = 21.34 − clearance. Derive that type's lower cylinder, tangent sphere and pivot from its own d, and use that same type's hardware bore/outside diameter in the seating calculation. Never build a fitting mount from the pipe diameter or vice versa.

Use the existing fixed mount-length setting for the 20 mm peg length and the existing hole-distance setting for the 10 mm shoulder offset, updating their names/comments where needed to make their references clear. Remove the old 25 mm pivot-length constraint and nominal cone-reference correction. Do not add duplicate dimensions or a new persisted settings object. The existing size validator must compare 2R with D × cos 35°; testing only d would accept a nose that cannot join the specified cone.

### Calculate seating with 2D trigonometry

Pipe uses its existing nominal 15.80 mm bore and 21.34 mm outside diameter. For the fitting mode, use a reference socket wall with the existing nominal 21.34 mm bore and a 27.78 mm outside diameter. The latter is the M dimension listed for the 1/2-inch Spears 429-005B socket coupling in the [manufacturer's dimensional data](https://parts.spearsmfg.com/ProductDetails.aspx?pid=210).

[Assumption] A straight 27.78 mm hub represents the mating end of the unspecified fitting; it is not a claim that all fitting bodies have that diameter. Keep the existing nominal cylindrical bore convention for fit compatibility. Actual sockets can taper; [Charlotte Pipe's socket table](https://www.charlottepipe.com/uploads/documents/technical/FO-SUB-PVC-40.pdf) documents that distinction. Changing bore fit or checking a particular fitting's stop, elbow or branch is outside this change.

Work in the plane containing the body and mount axes, using the mirrored meridian of the existing body profile. Relative to the pivot, rotate a profile point (x, z) into mount coordinates:

```
axial      = x sin(angle) + (z − c) cos(angle)
transverse = x cos(angle) − (z − c) sin(angle)
```

The hardware walls occupy the two bands b ≤ |transverse| ≤ a, where b and a are the selected hardware's bore and outside radii. The seating distance s is the largest axial coordinate of the body profile inside those bands. Axisymmetry reduces the limiting contact to this meridian; include both sides, since the limiting side changes with tilt.

Calculate that maximum from the existing profile's line segments and circular arcs. Candidates are segment/arc endpoints, intersections with transverse = ±b or ±a, and arc tangencies perpendicular to the mount axis that lie in the wall bands. Lines need linear intersections; a circle with mount-coordinate centre (s0, q0) and radius r intersects transverse = q at axial = s0 ± sqrt(r² − (q − q0)²). Keep only points on the actual profile segment or arc. This handles the cone, cylinder and spheres with elementary formulas, including the 0° and 90° limits, without a sampled search or a general geometry abstraction.

Keep this calculation in `src/profile.ts` with the existing dimensional helpers. It creates no 3D shapes and calls no CAD collision, intersection or distance operations. `src/model.ts` consumes s to build the two cylinders and hole. No runtime collision pass, solver configuration or cache is needed. The hardware extends outward from s; it is not limited to a short end-face sample. Contact at the shoulder is intentional. Numerical tolerances only handle floating-point boundary cases, not a new manufacturing-clearance setting.

At 0°, the pipe's bore edge meets the enlarged spherical cap: s = sqrt(R² − (15.80 / 2)²). The fitting's bore edge still meets the cone: shoulder z = L − (21.34 / 2) / tan 35°. Use these independent formulas to verify the general 2D calculation.

### Hollow only the lower-angle joint

Retain the existing inward-offset body cavity and its 35° roof away from the joint, updating the nose radius. At 0°, 30° and 45°, connect that cavity to a cylindrical void of radius R − t inside the wider cylinder. Close the void at least t before the shoulder and trim the entire cavity there, so the old body cavity cannot intrude into the insertion peg through the rounded nose. The mount's inner surfaces share its existing exemption from the body overhang limit.

At 60° and 90°, omit that void and exclude both mount cylinders from the body cavity. This makes the lower mount solid without filling unrelated portions of the pontoon body. Do not merely stop adding a bore: the existing body cavity could otherwise cut into the embedded mount. In both cases preserve one connected sealed cavity, t of separation from the exterior and hole, and the full 20 mm solid peg apart from its through-hole. Thicker material at the joint and cavity closure is expected.

### Extend the existing verification

Revise the current profile/validation tests for the enlarged sphere and diameter threshold. Add pure 2D seating tests for both dimension selections and all offered angles, including the coaxial reference formulas and tangent/join boundaries. Replace the nominal hole-height and 25 mm tip expectations with shoulder-relative dimensions. Extend the existing model-test matrix to verify actual hardware clearance and minimality, lower-mount hollowing at 45° versus solid material at 60°/90°, cavity continuity/separation and peg length. CAD collision checks are permitted in tests as an independent check of the analytic result, never in the generation path. Include offered wall thicknesses and valid narrow/minimum-length cases; update the old narrow-body fixtures that become invalid. Preserve the existing valid-solid, volume, mesh and closed-export coverage instead of adding a separate test runner or manual approval gate.

## Risks / Trade-offs

- [Reference socket dimensions] A different fitting may have a wider or differently shaped hub. Record the reference dimensions beside the constants and tests; scope collision guarantees to that mating wall envelope.
- [Profile joins and limiting angles] Analytic candidates must belong to the actual arc/segment, and formulas must remain defined at 0°/90°. Verify these boundaries in pure profile tests and cross-check hardware clearance in model tests; no runtime 3D collision queries are needed.
- [Cavity continuity and sealing] Simply extending the old cavity or clipping it at an arbitrary global height can breach a tilted shoulder or leave an isolated void. Verify one connected cavity and minimum separation from the completed exterior and screw hole across the offered angles.
- [Existing outputs change] Numeric volume, mesh bounds, hole heights and narrow-body acceptance change with the geometry. Update those expectations from the new dimensions and actual model rather than retaining stale snapshots.

## Cut pass

Contract references below mean `openspec/specs/pontoon-geometry/spec.md` (G) or `openspec/specs/pontoon-generator-page/spec.md` (P), as amended by this change. This audit serves the repository's explicit cut-pass instruction.

Cut from the plan: runtime 3D collision shapes/intersections (the user requires 2D trigonometry); the old nominal screw-reference correction (it gives the wrong shoulder spacing); the old 25 mm pivot-length constraint (it does not provide a fixed 20 mm peg). No new inputs, persisted state, caches, dependencies, solver settings or separate verification workflow are introduced.

| Kept item | Contract or explicit request | Simpler version and its concrete failure |
| --- | --- | --- |
| Per-type diameter selection | G: Mount type; user's second correction | One shared diameter makes either the pipe or fitting mount the wrong size. |
| Derived lower-cylinder/nose radius R | G: Body shape, Mount root | Keeping the old radius omits the requested 4 mm increase. |
| Derived tangent-sphere pivot c | G: Mount root | Keeping the old pivot breaks tangency with the enlarged sphere. |
| Derived seating distance s | G: Pipe and fitting seating | A fixed distance leaves interference or unnecessary spacing at some angles. |
| 2D line/arc contact formulas | User's first correction; G: Pipe and fitting seating | Checking just the cone misses sphere contacts and profile transitions. |
| Both mirrored profile sides and wall radii | G: Pipe and fitting seating | One side or just the bore misses the limiting wall contact at tilted angles. |
| Reference fitting outside diameter record | G: Pipe and fitting seating | A bore-only hardware record cannot describe the socket wall. |
| Lower cylinder and 20 mm peg | G: Mount type, Mount root | One cylinder cannot provide both the wider shoulder and insertion diameter. |
| Shoulder-relative 10 mm hole setting | G: Screw hole | Reusing the old nominal reference loses the specified 10 mm spacing. |
| Hollow continuation at 0°/30°/45° | G: Sealed thin wall; user's corrected cutoff | A solid lower cylinder adds material where the user requires hollowing. |
| Solid lower cylinder at 60°/90° | G: Sealed thin wall; user's corrected cutoff | Always hollowing violates the requested cutoff. |
| Cavity closure and peg exclusion | G: Sealed thin wall, Screw hole | Merely extending the old cavity can hollow the peg or expose the cavity. |
| Enlarged-nose size validation | P: Form validation rules | Checking only the peg accepts an oversized nose. |
| Analytic dimension/contact tests | G: Body shape, Mount root, Pipe and fitting seating | Checking only 0° misses angle-dependent contacts and diameter selection. |
| Independent CAD contact checks in tests | G: Pipe and fitting seating | Reusing only the placement formula as its own oracle can conceal a geometric error. |
| Cavity thickness/connectivity checks | G: Sealed thin wall, Screw hole | Checking one solid alone does not establish a sealed connected cavity or wall thickness. |
| Existing validity/export/mesh checks | G: Print orientation and units; P: File downloads, 3D preview | Numeric dimension checks alone do not establish usable geometry and exports. |
| Existing volume/build checks | P: Buoyancy readout, Runs in the browser alone | Geometry checks alone miss inconsistent reported mass or a broken browser build. |
| Task 1.1 | G: Body shape, Mount type, Mount root; P: Form validation rules | Reuse the current helpers/tests; separate dimension infrastructure adds no required behavior. |
| Task 2.1 | G: Pipe and fitting seating; user's 2D correction | Put direct formulas in the existing profile module; a general collision solver adds no required behavior. |
| Task 2.2 | G: Mount root, Screw hole; request's 20 mm/10 mm dimensions | Reuse the existing settings and model construction; duplicate settings can disagree. |
| Task 3.1 | G: Sealed thin wall | Extend the existing cavity; a separate cavity subsystem adds no required behavior. |
| Task 3.2 | G: Sealed thin wall, Mount angle | Use the existing angle selection and model-test matrix; a new mount mode duplicates that selection. |
| Task 3.3 | P: Buoyancy readout, File downloads, 3D preview | Reuse `npm test` and `npm run build`; an extra integration runner duplicates existing coverage. |
