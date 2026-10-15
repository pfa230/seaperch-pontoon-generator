## MODIFIED Requirements

### Requirement: 3D preview
For valid inputs, the page SHALL show a shaded 3D view of the generated pontoon lying horizontally, with the mount on the left and a tilted mount pointing up. The user SHALL be able to rotate the view by dragging and zoom by mouse wheel or pinch. A "Reset view" button SHALL frame the whole current pontoon from the starting direction, as large as it fits in the preview. A new pontoon SHALL replace the shown one without changing the user's rotation or zoom.

#### Scenario: Preview on open
- **WHEN** a user opens the page in a 1280 × 650 px viewport and the default pontoon has been generated
- **THEN** the preview shows the whole pontoon lying horizontally with its mount at the left, spanning at least 80% of the preview's width

#### Scenario: Rotate and zoom
- **WHEN** the user drags across the preview and then scrolls the mouse wheel over it
- **THEN** the pontoon turns to follow the drag, and the view moves closer or farther without the page scrolling

#### Scenario: Reset view
- **WHEN** the user changes the body length from 180 mm to 300 mm, rotates and zooms the preview, then presses "Reset view"
- **THEN** the preview shows the whole 300 mm pontoon from the starting direction

#### Scenario: Preview follows the inputs
- **WHEN** the user rotates the view and then changes the mount angle from 0° to 30°
- **THEN** the preview shows the mount tilted by 30° from the viewpoint the user left it at
