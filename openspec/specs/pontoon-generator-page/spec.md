# pontoon-generator-page Specification

## Purpose
A static web page where a user sets pontoon parameters, sees the resulting buoyancy, and downloads the pontoon as STEP or STL for printing.

## Requirements

### Requirement: Parameter form
The page SHALL present a form with these inputs and defaults: outer diameter (32 mm), body length (180 mm), wall thickness (1.2 mm), mount type ("inside pipe" or "into fitting", default "inside pipe"), mount angle (0°) and filament (PLA, PETG or ASA/ABS, default ASA/ABS). Mount length, fit clearance, screw hole diameter and screw hole position SHALL NOT be form inputs; the page SHALL use their fixed build settings.

#### Scenario: Page opens with defaults
- **WHEN** a user opens the page
- **THEN** the form shows every input above with its default value, with filament set to ASA/ABS, and shows no mount length, fit clearance, screw hole or density input

### Requirement: Input validation
While any input breaks a validation rule, the page SHALL mark that input with a message saying why, and SHALL offer no download.

#### Scenario: Angle out of range
- **WHEN** the user enters a mount angle of 50°
- **THEN** the page marks the mount angle input with an error and disables both downloads

### Requirement: Buoyancy readout
For valid inputs, the page SHALL show the pontoon's displaced volume in mL, its estimated mass in g as solid material volume times the selected filament's density, and its net lift in g as displaced volume times 1.0 g/mL minus mass. The filament densities SHALL be PLA 1.24, PETG 1.27 and ASA/ABS 1.07 g/cm³. The readout SHALL show no explanatory note.

#### Scenario: Readout updates
- **WHEN** the user changes the outer diameter or the filament to a valid value
- **THEN** the displayed volume, mass and net lift update to match the new pontoon and filament

#### Scenario: Lift arithmetic
- **WHEN** the generated pontoon displaces 135.0 mL, its material volume is 24.0 cm³ and the filament is ASA/ABS
- **THEN** the page shows mass 25.7 g and net lift 109.3 g

### Requirement: File downloads
For valid inputs, the page SHALL offer a STEP download and an STL download of the same pontoon in millimetres. Each file name SHALL encode the outer diameter, body length, mount type and mount angle.

#### Scenario: STEP download
- **WHEN** the user downloads STEP with the default parameters
- **THEN** the browser saves `pontoon_d32_l180_pipe_a0.step`, which opens in a CAD program as a single solid

#### Scenario: STL download
- **WHEN** the user downloads STL with the mount type "into fitting" and angle 15°
- **THEN** the browser saves `pontoon_d32_l180_fitting_a15.stl`

### Requirement: Runs in the browser alone
The page SHALL generate geometry and files entirely in the browser, with no server beyond static file hosting, and SHALL keep the form responsive while a model is being generated.

#### Scenario: Generation does not block the form
- **WHEN** a model is being generated
- **THEN** the form still accepts input and the page shows that generation is in progress

### Requirement: Form validation rules
The page SHALL reject: a non-numeric value; a zero or negative outer diameter, body length or wall thickness; a mount angle outside 0° to 45°; a wall thickness of D/4 or more; a mount diameter above D × cos 35°; a body length too short to fit both ends.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the body length is 30 mm
- **THEN** the page marks the body length input with an error stating the minimum length for this diameter, about 37.1 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because 21.14 mm exceeds 24 × cos 35° ≈ 19.66 mm
