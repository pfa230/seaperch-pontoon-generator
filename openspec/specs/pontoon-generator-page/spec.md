# pontoon-generator-page Specification

## Purpose
A static web page where a user sets pontoon parameters, sees the resulting buoyancy, and downloads the pontoon as STEP or STL for printing.

## Requirements

### Requirement: Parameter form
The page SHALL present a form with these inputs and defaults: outer diameter (32 mm), length (180 mm), wall thickness chosen from 0.8, 1.2 or 1.6 mm (default 1.2 mm), mount type ("inside pipe" or "into fitting", default "inside pipe"), mount angle chosen from 0°, 30°, 45°, 60° or 90° (default 0°) and filament (PLA, PETG or ASA/ABS, default ASA/ABS). Mount length, fit clearance, screw hole diameter and screw hole position SHALL NOT be form inputs; the page SHALL use their fixed build settings.

#### Scenario: Page opens with defaults
- **WHEN** a user opens the page
- **THEN** the form shows every input above with its default value, with filament set to ASA/ABS, and shows no mount length, fit clearance, screw hole or density input

#### Scenario: Fixed choices
- **WHEN** a user opens the wall thickness or mount angle input
- **THEN** it offers exactly the listed values and accepts no other value

### Requirement: Buoyancy readout
For valid inputs, the page SHALL show the pontoon's displaced volume in mL, its estimated mass in g as solid material volume times the selected filament's density, and its net lift in g as displaced volume times 1.0 g/mL minus mass. The filament densities SHALL be PLA 1.24, PETG 1.27 and ASA/ABS 1.07 g/cm³. The readout SHALL show no explanatory note.

#### Scenario: Readout updates
- **WHEN** the user changes the outer diameter or the filament to a valid value
- **THEN** the displayed volume, mass and net lift update to match the new pontoon and filament

#### Scenario: Lift arithmetic
- **WHEN** the generated pontoon displaces 135.0 mL, its material volume is 24.0 cm³ and the filament is ASA/ABS
- **THEN** the page shows mass 25.7 g and net lift 109.3 g

### Requirement: File downloads
For valid inputs, the page SHALL offer a STEP download and an STL download of the same pontoon in millimetres. Each file name SHALL encode the outer diameter, length, mount type and mount angle.

#### Scenario: STEP download
- **WHEN** the user downloads STEP with the default parameters
- **THEN** the browser saves `pontoon_d32_l180_pipe_a0.step`, which opens in a CAD program as a single solid

#### Scenario: STL download
- **WHEN** the user downloads STL with the mount type "into fitting" and angle 30°
- **THEN** the browser saves `pontoon_d32_l180_fitting_a30.stl`

### Requirement: Runs in the browser alone
The page SHALL generate geometry and files entirely in the browser, with no server beyond static file hosting, and SHALL keep the form responsive while a model is being generated.

#### Scenario: Generation does not block the form
- **WHEN** a model is being generated
- **THEN** the form still accepts input and the page shows that generation is in progress

### Requirement: Form validation rules
The page SHALL reject: a non-numeric outer diameter or length; a zero or negative outer diameter or length; a lower mount and nose sphere diameter d + 4 mm above D × cos 35°, where d is the fit-adjusted insertion peg diameter; a length too short to fit both ends.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the length is 30 mm
- **THEN** the page marks the length input with an error stating the minimum length for this diameter, about 41.0 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because the 25.14 mm lower mount and nose diameter exceeds 24 × cos 35° ≈ 19.66 mm

#### Scenario: Previously valid narrow body needs the larger nose check
- **WHEN** D = 26 mm and mount type is "into fitting"
- **THEN** the page rejects the mount type because 25.14 mm exceeds 26 × cos 35° ≈ 21.30 mm, even though its 21.14 mm insertion peg alone would fit

#### Scenario: Default body still accepts either mount
- **WHEN** D = 32 mm and the other inputs are valid
- **THEN** either mount type passes the size check, since both 19.60 mm and 25.14 mm are below 32 × cos 35° ≈ 26.21 mm

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

### Requirement: Preview availability
The preview SHALL show a pontoon exactly when the buoyancy readout shows values; while any input is invalid, while a new pontoon is generating, and after generation fails, it SHALL show none. If the browser cannot render 3D, the preview area SHALL say that the preview is unavailable, and the rest of the page SHALL work as it does without the preview.

#### Scenario: Invalid input empties the preview
- **WHEN** the user enters a mount angle of 50°
- **THEN** the preview shows no pontoon until the inputs are valid again and the new pontoon has been generated

#### Scenario: No WebGL
- **WHEN** the page opens in a browser with WebGL disabled
- **THEN** the preview area says the preview is unavailable, and the readout and both downloads still work

### Requirement: Invalid input marking
While any input breaks a validation rule, the page SHALL mark that input with a message saying why, and SHALL offer no download.

#### Scenario: Length out of range
- **WHEN** the user enters a length of 0 mm
- **THEN** the page marks the length input with an error and disables both downloads

### Requirement: Page layout
In a browser viewport 1280 px wide and 650 px tall or larger, the page SHALL show every form input, the 3D preview, the "Reset view" button, the "Show cross-section" checkbox, the buoyancy readout and both download buttons at once, without scrolling. In a viewport 360 px wide, the page SHALL lay these out in one column that needs no sideways scrolling, with the preview as wide as the column.

#### Scenario: Laptop screen
- **WHEN** a user opens the page in a 1280 × 650 px viewport and the default pontoon has been generated
- **THEN** every input, the preview showing the pontoon, "Reset view", "Show cross-section", the three readout values and both download buttons are visible without scrolling

#### Scenario: Phone screen
- **WHEN** a user opens the page in a 360 px wide viewport
- **THEN** the page does not scroll sideways, the preview spans the column width, and scrolling down reaches every input, "Show cross-section", the readout and both download buttons

### Requirement: Visible keyboard focus
Every input, select and button SHALL show a visible focus indicator when reached with the keyboard.

#### Scenario: Tabbing through the page
- **WHEN** the user presses Tab repeatedly from the top of the page
- **THEN** each input, select and enabled button shows a focus indicator in turn

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
