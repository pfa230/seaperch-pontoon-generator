# Design

## Context

The shared body outline already offsets the rear sphere, body cylinder and front sphere correctly. `buildCavity` then intersects it with an independent cone, which narrows the nose. See `proposal.md` for the requested correction.

## Goals / Non-Goals

Use the same rounded body profile for the exterior and its inward offset. Keep the existing mount geometry, angle cutoff and solid peg.

## Decisions

Share the existing revolved body construction through one private helper taking an inset. The sphere centres remain those of the outer body; reduce both the large sphere radius and the nose sphere radius by t. Their radius difference is unchanged, so the joining cone remains tangent at the same 35° slope. Move the cavity floor to t. Remove the extra clipping cone rather than moving its apex.

Apply the existing mount-cavity continuation and solid-mount exclusions after constructing this rounded body cavity. These enforce the previously requested solid peg and 60°/90° lower mount; the body offset itself has no separate roof cone. The requested tangent inner sphere requires an exception to the previous inner-surface overhang limit. Unlike the upward-facing outer cap, this cap forms a downward-facing ceiling inside the sealed cavity. At 90° its exposed surface reaches horizontal at the pole; printability has not been verified with a slicer or test print.

For the hollow lower mount, clip the body cavity at the closure plane first and then fuse a bore that ends at that plane. Cutting the fused rounded body and bore left a spherical sliver past the closure in the 45° pipe case; the existing peg-separation and cross-section tests detect it. Keep those checks. Measure cylindrical wall thickness only at points on the actual exposed exterior, since a hypothetical cylinder point buried inside the body is not an exterior wall.

Add direct thickness probes on the exposed front dome and cone, and verify the concentric inner nose sphere and its tangent join at 90°, where it remains visible beside the solid mount. Use the existing validity, sealing, mount, cross-section and export tests for integration coverage. Update the old roof-cone test and material-volume expectation.

## Risks / Trade-offs

- The spherical inner cap has steeper surfaces near its pole, matching the requested body profile; it replaces the previous 35° cavity roof that enforced the inner overhang limit.
- Material volume changes; measure it from the resulting solid while checking that outer displaced volume remains unchanged.

## Cut pass

Contract references mean `openspec/specs/pontoon-geometry/spec.md`, as amended by this change.

Removed: the independent cavity-roof cone and its intersection, the duplicated inner cone outline, the stale cone-tip comment, duplicate roof-reference scenario, redundant prohibition of a second roof cone and temporary diagnostic test. They either contradicted the requested rounded cavity or duplicated the shared body profile.

| Kept item | Contract or request | Simpler version and concrete failure |
| --- | --- | --- |
| One private rounded-body helper with an inset | Sealed thin wall; user's tangent-sphere cavity request | Reuse the outer profile with inset radii; separate inner construction duplicates the same geometry. |
| Fixed sphere centres and radii reduced by t | Sealed thin wall | Recomputing the nose centre from the smaller radius moves the inner sphere and loses uniform thickness. |
| Existing mount cutoff and shoulder closure | Sealed thin wall, Screw hole | An untrimmed body cavity enters the solid peg. |
| Clip body before fusing the shortened bore | Sealed thin wall; cross-section remains usable | Clipping the fused cavity retained a spherical sliver in the 45° pipe case, with zero peg clearance and an incorrect section. |
| Inner nose cap overhang exception and its ceiling trade-off | Overhang limit; user's tangent-sphere request | Keeping the 35° roof cone recreates the thick band; equating inner and outer caps hides the unsupported inner ceiling. |
| Direct dome/cone thickness probes | Sealed thin wall | A single minimum gap passed while the nose wall was too thick. |
| Inner sphere radius/centre/tangent checks | Sealed thin wall | Checking only the tip height also passes for the wrong conical roof. |
| Exposed-face filtering in the existing cylinder-wall test | Sealed thin wall | Distance to the solid also selects buried cylinder points, which are not exterior walls. |
| Updated material-volume expectation | Existing buoyancy readout contract | The old expected mass includes the removed thick band. |
| Completed-cavity tip-height assertion | Sealed thin wall | Radius/centre checks on a supporting sphere do not establish the final trimmed cavity's maximum height. |
| Task 1.1: rounded offset and regression probes | User's tangent-sphere request; Sealed thin wall | Only retaining minimum-gap coverage missed the thick band. |
| Task 1.2: mount, section and export verification | Sealed thin wall; existing section/export contracts | Profile-only checks miss Boolean closure and export regressions. |
| Proposal record | User's cavity correction; repository OpenSpec workflow | Omitting the motivation loses the reason the roof requirement changes. |
| Design and cut-pass record | Repository cut-before-presenting rule | Omitting the Boolean-order evidence obscures the concrete kernel failure. |
| Geometry delta and synced main spec | Overhang limit; Sealed thin wall | Leaving the old roof contract would contradict the requested cavity. |
| Tasks record | Repository OpenSpec workflow | Without it completion cannot be established before archival. |
| Schema/date metadata and archive | Repository local-until-archived rule | Omitting archival prevents authorized delivery under the repository workflow. |
