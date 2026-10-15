# Proposal

## Why

The 3D preview stands the pontoon upright on its flat, so in the wide laptop pane a 180 mm pontoon fills the height and about a tenth of the width. Laid horizontally, the way it sits on the ROV, it can fill the pane and show its shape and mount at a readable size.

## What Changes

- The preview shows the pontoon lying horizontally, with the mount on the left and a tilted mount pointing up.
- "Reset view" (and the first framing) fits the pontoon's length to the pane's width and its girth to the pane's height, whichever is tighter, instead of fitting a sphere around it.
- Rotating, zooming, keeping the view across updates, and preview availability stay as they are.

Mockup with real renders: https://claude.ai/artifact/NSjmsoT7JvuwXbPLf9JCAT

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-generator-page`: the "3D preview" requirement changes the pontoon's on-screen orientation from upright to horizontal with the mount on the left.

## Impact

- `src/preview.ts`: the mesh is turned as it arrives, and `fit()` frames by bounding box.
- No change to the model, worker, downloads, layout or dependencies.
