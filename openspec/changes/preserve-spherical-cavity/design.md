# Design

## Context

See `proposal.md` for motivation. `src/model.ts` already constructs the body and mount as solids in `buildOuter`, then subtracts `buildCavity` in `buildPontoon`; `measure` uses the same solid for the readout and section. The defect is the cavity passed into that final subtraction. `buildCavity` changes the rounded body offset with a shoulder-plane cut plus cylindrical bore at low angles, or subtracts the whole mount at high angles.

The current tests also encode those changes: they demand zero cavity overlap with the nominal peg, require a low-angle flat closure, and inspect only a surviving nose patch on the side away from the 90° mount. Those assertions cannot establish the final cavity shape the user requested.

## Goals / Non-Goals

Use the existing rounded-body offset as the only cavity definition and keep the current generation/export pipeline. Mount placement and hardware selection remain governed by the existing 2D seating calculation; this change adds no new control, helper layer, collision solver or independent mount cavity.

## Decisions

### Subtract the body cavity after the complete solid union

Let B be the solid rounded body, M the solid stepped mount, C the inward offset of B, and H the screw-hole tool. The finished model is `(B ∪ M) − (C ∪ H)`. C depends on body dimensions, mount type and wall thickness, but not mount angle. Reuse `roundedBody(p, p.wall)` as C and the current final subtraction; delete the angle-dependent cavity modifications. The existing earlier screw-hole subtraction is equivalent and does not need rearranging.

The alternatives have already caused the observed failures: clipping C at a shoulder plane gives the flat cap; excluding M from C gives the sideways shelf; adding a cylindrical void changes the spherical cap. Recreating C through a second independently maintained profile is unnecessary because the shared inset construction already fixes its sphere centres and tangencies.

### Preserve the shell, not the nominal construction cylinders

The user's clarification permits C to overlap M. Do not move the shoulder or fill the overlap to enforce the old whole-cylinder solidity assertions. Material outside C remains solid, and C must stay at least t from actual exterior faces and H. The body alone encloses its inward offset, and unioning M adds material; drilling H is the remaining opening that must be checked for separation.

This intentionally replaces the old distinction between adding a hollow mount bore through 45° and excluding the entire mount at 60°/90°. At every angle, mount material outside C remains solid and overlap with C remains hollow. At low angles C may extend beyond the shoulder into the nominal peg. A separate t-thick flat closure before the shoulder is neither required for watertightness nor compatible with the requested spherical end. The delta updates the affected existing scenarios and the mount description explicitly rather than leaving contradictory solidity language.

### Test the finished geometry on the mount side too

Extend existing geometry tests across both mount types, all five angles and the three offered wall thicknesses. Verify the complete cap from its cone tangent to its pole, including both sides of the section and the region covered by the mount. Use analytically expected cap points and material/void membership or distance to trimmed boundary faces; querying only the supporting spherical surface can pass when half the cap is missing. Check matching cavity volume across angles as an additional guard against material added or removed elsewhere.

Replace peg-clearance and exact cylindrical-neck/flat-closure assertions with at-least-t distance to the actual outer union's exposed faces and screw-hole faces. Keep connectivity, valid-solid, closed-STL, section and hardware-seating coverage. Only reference the actual exterior before cavity subtraction; including the new internal cavity faces in an exterior-distance measurement would produce a meaningless zero.

Use the existing half-section and exporter paths to verify the result; do not add another representation or a new rendering option. Inspect 0° and 90° cutaways for both mount types with the finished solid, and keep automated cap/section checks so a screenshot is not the only evidence. Recalculate material-volume expectations from the corrected solid; outer dimensions and displacement should remain unchanged.

## Risks / Trade-offs

- The old tests require a non-overlapping solid peg and a shelf at high angles. Replace those conflicting assertions, but retain full wall and screw-hole separation checks against real openings.
- A remaining spherical face is not proof of a complete cap. Check the final trimmed boundary and section on both sides, not just its supporting surface type, radius or pole height.
- Tangent booleans can produce invalid or open meshes. Reuse the existing validity and closed-STL checks with the corrected cavity, including the existing narrow/minimum-length cases.
- The inner spherical ceiling exceeds 35° near its pole. The existing inner-cap exception remains applicable; this proposal makes no new claim that a slicer or physical print has verified it.

## Migration Plan

Implement locally only after an explicit apply request. Run the focused failing regressions, complete the existing test/build checks, then sync and archive before any separately authorized delivery. This is generated geometry without persisted model migration; reverting the eventual code/spec change restores the prior geometry.

## Cut pass

Each contract reference below means `openspec/specs/pontoon-geometry/spec.md`, as amended by this delta, unless another path or the explicit user request is named.

Cut from the proposed solution: shoulder relocation, nominal-cylinder exclusion checks, low-angle closure cutters, the separate mount bore, angle-dependent cavity rules and a second profile implementation. The first solves overlap rather than leakage; the others recreate the reported geometry or duplicate the existing body offset. No new option, state field, dependency or diagnostic subsystem remains.

| Kept item | Contract or explicit request | Simpler version and concrete failure |
| --- | --- | --- |
| Existing body/mount union followed by cavity subtraction | User: generate solid body with mount, then cut cavity | Keep the existing pipeline; another construction layer adds no required behavior. |
| Existing inset rounded-body profile as the sole cavity | Sealed thin wall: full body offset and tangent nose cap | Keep this simplest definition; clipping it recreates the flat end and shelf. |
| Permitted cavity overlap with either nominal mount cylinder | Sealed thin wall; user's watertightness clarification | Excluding a construction cylinder fills the required cavity despite adequate real wall. |
| Actual exterior and screw-hole separation checks | Sealed thin wall; Screw hole | Closed topology alone can still admit walls thinner than t or an isolated-but-too-close screw hole. |
| Full final cap and tangent checks on the mount side | Sealed thin wall: Tangent inner nose sphere | Checking a supporting spherical face passes with a truncated cap. |
| Angle-independent cavity-volume check | Sealed thin wall: angle-independent cavity | Local cap samples alone can miss an added cylindrical void elsewhere. |
| Existing validity, connectivity, STL and section checks | Sealed thin wall: Cavity is closed; pontoon-generator-page: Cross-section preview | Surface probes do not establish valid, connected, exportable solids or a usable section. |
| Existing hardware-seating and outer-size assertions | Pipe and fitting seating; Mount root | Checking the void alone misses accidental changes to shoulder position or outer geometry. |
| Revised material-volume expectation | pontoon-generator-page: Buoyancy readout | Keeping the previous snapshot asserts the material removed by the defect. |
| Four finished-model cutaway inspections | User's 0° and 90° screenshots; pontoon-generator-page: Cross-section preview | Automated CAD checks alone do not demonstrate how these reported defects look in the existing preview. |
| Task 1.1 | Sealed thin wall: complete cap and watertightness | Only preserving current tests leaves assertions that require the defects. |
| Task 1.2 | User's construction order; Sealed thin wall | A speculative new geometry mechanism duplicates the already available offset and final subtraction. |
| Task 1.3 | Sealed thin wall; pontoon-generator-page: Cross-section preview, File downloads, Buoyancy readout | Focused cavity checks do not cover downstream exports, readout and preview integration. |
| Proposal record | Explicit openspec-propose request | Omitting it loses the correction's scope and the reason for changing the solidity contract. |
| Delta spec record | Explicit openspec-propose request; Sealed thin wall; Mount type | Leaving the prior whole-cylinder requirements contradicts the permitted overlap. |
| Design and cut-pass record | Explicit openspec-propose request; repository cut-pass rule | Omitting the geometry decision makes it easy to reintroduce nominal-cylinder exclusion. |
| Tasks record | Explicit openspec-propose request | Untracked prose cannot show implementation progress in the selected schema. |
| Schema/date metadata | Explicit openspec-propose request using the configured schema | Keep only the CLI-created metadata; no added planning state is needed. |
