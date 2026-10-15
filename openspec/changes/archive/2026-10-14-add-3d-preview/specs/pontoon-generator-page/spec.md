# Spec Delta

## ADDED Requirements

### Requirement: 3D preview
For valid inputs, the page SHALL show a shaded 3D view of the generated pontoon standing on its flat with the nose up. The user SHALL be able to rotate the view by dragging and zoom by mouse wheel or pinch. A "Reset view" button SHALL frame the whole current pontoon from the starting direction. A new pontoon SHALL replace the shown one without changing the user's rotation or zoom.

#### Scenario: Preview on open
- **WHEN** a user opens the page and the default pontoon has been generated
- **THEN** the preview shows the whole pontoon standing upright with its mount at the top

#### Scenario: Rotate and zoom
- **WHEN** the user drags across the preview and then scrolls the mouse wheel over it
- **THEN** the pontoon turns to follow the drag, and the view moves closer or farther without the page scrolling

#### Scenario: Reset view
- **WHEN** the user changes the body length from 180 mm to 300 mm, rotates and zooms the preview, then presses "Reset view"
- **THEN** the preview shows the whole 300 mm pontoon from the starting direction

#### Scenario: Preview follows the inputs
- **WHEN** the user rotates the view and then changes the mount angle from 0° to 30°
- **THEN** the preview shows the mount tilted by 30° from the viewpoint the user left it at

### Requirement: Preview availability
The preview SHALL show a pontoon exactly when the buoyancy readout shows values; while any input is invalid, while a new pontoon is generating, and after generation fails, it SHALL show none. If the browser cannot render 3D, the preview area SHALL say that the preview is unavailable, and the rest of the page SHALL work as it does without the preview.

#### Scenario: Invalid input empties the preview
- **WHEN** the user enters a mount angle of 50°
- **THEN** the preview shows no pontoon until the inputs are valid again and the new pontoon has been generated

#### Scenario: No WebGL
- **WHEN** the page opens in a browser with WebGL disabled
- **THEN** the preview area says the preview is unavailable, and the readout and both downloads still work
