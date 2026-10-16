# Spec Delta

## ADDED Requirements

### Requirement: Cross-section preview
The page SHALL offer an initially unchecked "Show cross-section" checkbox beside the preview controls. When checked, the 3D preview SHALL show half of the hollow pontoon, cut lengthwise through the body axis in the plane of mount rotation. The cut SHALL expose the cavity and solid wall faces, with the opening facing the starting viewpoint. The plane SHALL stay fixed to the model during view rotation. Unchecking SHALL restore the complete exterior view.

#### Scenario: Default exterior view
- **WHEN** the page opens and the default pontoon has generated
- **THEN** "Show cross-section" is unchecked and the preview shows the complete exterior

#### Scenario: Lengthwise section through the mount
- **WHEN** the user checks "Show cross-section" for a valid pontoon at any offered mount angle, including 0° and 90°
- **THEN** the cut plane contains the body axis and mount axis, and the preview exposes the hollow interior and solid material around it
- **AND** the cavity remains visibly empty rather than covered by a filled section face

#### Scenario: Inspect the cutaway
- **WHEN** the user checks the checkbox from the starting viewpoint and then orbits the preview
- **THEN** the opening initially faces the user and the same retained half rotates with the model

#### Scenario: Restore exterior
- **WHEN** the user unchecks "Show cross-section"
- **THEN** the preview shows the complete exterior again

### Requirement: Cross-section view state
Toggling the cross-section SHALL change only the preview, without starting model generation, moving the camera, changing readout values or altering complete-pontoon downloads. The checkbox selection SHALL survive parameter changes and "Reset view" within the page session. It SHALL obey the existing preview availability rules, including while loading, after invalid input or failure, and when 3D rendering is unavailable.

#### Scenario: Toggle without regenerating
- **WHEN** the user rotates and zooms a generated pontoon and toggles "Show cross-section"
- **THEN** the camera retains its rotation and zoom, no generating state starts, the readout values stay the same, and downloads remain available

#### Scenario: Regenerate with section selected
- **WHEN** "Show cross-section" is checked and the user changes a model parameter
- **THEN** the preview clears during generation and shows the new pontoon in cross-section when its readout values appear, preserving the user's viewpoint

#### Scenario: Reset with section selected
- **WHEN** "Show cross-section" is checked and the user presses "Reset view"
- **THEN** the checkbox stays checked and the cutaway is shown from the starting direction, framed using the complete pontoon's extent

#### Scenario: Download with section selected
- **WHEN** the user downloads STEP or STL with "Show cross-section" checked
- **THEN** the file contains the same complete hollow pontoon that would be downloaded with the checkbox unchecked

#### Scenario: Toggle while no model is available
- **WHEN** the user toggles the checkbox during generation, while an input is invalid or after generation fails
- **THEN** the preview remains empty until a valid model and its readout are available, and that model uses the current checkbox selection

#### Scenario: No WebGL
- **WHEN** the page opens without 3D rendering and the user toggles the checkbox
- **THEN** the preview-unavailable message remains and valid readouts and downloads continue to work

## MODIFIED Requirements

### Requirement: Page layout
In a browser viewport 1280 px wide and 650 px tall or larger, the page SHALL show every form input, the 3D preview, the "Reset view" button, the "Show cross-section" checkbox, the buoyancy readout and both download buttons at once, without scrolling. In a viewport 360 px wide, the page SHALL lay these out in one column that needs no sideways scrolling, with the preview as wide as the column.

#### Scenario: Laptop screen
- **WHEN** a user opens the page in a 1280 × 650 px viewport and the default pontoon has been generated
- **THEN** every input, the preview showing the pontoon, "Reset view", "Show cross-section", the three readout values and both download buttons are visible without scrolling

#### Scenario: Phone screen
- **WHEN** a user opens the page in a 360 px wide viewport
- **THEN** the page does not scroll sideways, the preview spans the column width, and scrolling down reaches every input, "Show cross-section", the readout and both download buttons
