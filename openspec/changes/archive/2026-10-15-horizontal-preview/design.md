# Design

## Context

See proposal.md for why. The model's body axis is +z, flat at z = 0, nose and mount toward +z, and a mount angle tilts the mount toward +x. `src/preview.ts` sets `camera.up` to +z, places the camera from `VIEW_DIRECTION = (0, 1, 0.4)`, so on screen +z is up and +x is left. The hemisphere light's sky side is +y, which faces the camera. `fit()` sizes the view to the mesh's bounding sphere.

Mockup with real renders of each option, built from `main` in a scratch copy: https://claude.ai/artifact/NSjmsoT7JvuwXbPLf9JCAT

## Goals / Non-Goals

**Non-Goals:**

- Changing the preview pane's size or aspect ratio on any screen.
- Re-framing when a new pontoon arrives; the user's view still survives updates.

## Decisions

### Turn the geometry, not the camera

`show()` turns each new geometry with `rotateY(-π/2)` then `rotateZ(π)`: the body axis goes to +x (screen left), and the tilt direction goes to +z (screen up). The camera, its up vector, `VIEW_DIRECTION`, the lights and `OrbitControls` stay as they are, so dragging still spins the pontoon about the screen's vertical axis and keeps it horizontal.

Alternatives: viewing from −y with a single `rotateY(-π/2)` puts the mount left too, but the visible side then faces the hemisphere light's ground colour and renders visibly darker (seen in the mockup renders). Setting `camera.up` to x makes horizontal drags tumble the pontoon end over end. Rotating the `Mesh` object instead of its geometry would make `fit()` read model-space bounds and need a world-space transform.

### Frame by bounding box

`fit()` uses the geometry's bounding box: the camera distance is the larger of the distance at which the box's length fills the horizontal field of view and the distance at which its cross-section (half the diagonal of its y–z extent) fills the vertical one, plus that cross-section radius so the near side stays in view. Target and camera direction are as today. In the 1280 × 650 render the default pontoon spans about 90% of the pane's width; on a 360 px phone the square pane is width-limited, so the result matches the sphere fit.

Alternative: keeping the sphere fit is one line shorter, but leaves the horizontal pontoon at about 55% of the laptop pane's width, the same size it has standing up.

## Risks / Trade-offs

- [After a tight fit, turning the pontoon end-on brings the near end closer and can push it past the pane's edge] → Zoom out or press "Reset view"; the spec only promises a whole pontoon from the starting direction.
- [The orientation lives in viewer code with no browser test] → Checked by hand in the dev server against the spec scenarios, as for the original preview.
