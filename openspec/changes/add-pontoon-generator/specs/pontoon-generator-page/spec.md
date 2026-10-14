# Spec Delta

## Purpose

A static web page where a user sets pontoon parameters, sees the resulting buoyancy, and downloads the pontoon as STEP or STL for printing.

## ADDED Requirements

### Requirement: Parameter form
The page SHALL present a form with these inputs and defaults: outer diameter (32 mm), body length (180 mm), wall thickness (1.2 mm), mount type ("inside pipe" or "into fitting", default "inside pipe"), mount angle (0°), fit clearance (0.2 mm), screw hole diameter (2.5 mm), screw hole distance from mount end (8 mm) and filament density (1.24 g/cm³). Mount length SHALL NOT be a form input; the page SHALL use the fixed mount length build setting, 25 mm by default.

#### Scenario: Page opens with defaults
- **WHEN** a user opens the page
- **THEN** the form shows every input above with its default value, and no mount length input

### Requirement: Input validation
While any input breaks a validation rule, the page SHALL mark that input with a message saying why, and SHALL offer no download.

#### Scenario: Angle out of range
- **WHEN** the user enters a mount angle of 50°
- **THEN** the page marks the mount angle input with an error and disables both downloads

### Requirement: Validation rules
The page SHALL reject: a non-numeric value; a zero or negative value for any input except mount angle and fit clearance; a negative fit clearance; a fit clearance that leaves a mount diameter of zero or less; a mount angle outside 0° to 45°; a wall thickness of D/4 or more; a mount diameter above D × cos 35°; a body length too short to fit both ends; a screw hole within t of the cavity; a screw hole not fully between the mount's start point and free end; a screw hole diameter equal to or larger than the mount diameter.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the body length is 30 mm
- **THEN** the page marks the body length input with an error stating the minimum length for this diameter, about 37.1 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because 21.14 mm exceeds 24 × cos 35° ≈ 19.66 mm

#### Scenario: Clearance leaves no mount
- **WHEN** mount type is "inside pipe" and the fit clearance is 15.80 mm
- **THEN** the page marks the fit clearance input with an error, because the mount diameter would be 0 mm

#### Scenario: Screw hole severs the mount
- **WHEN** D = 32 mm, mount type is "inside pipe" with the default clearance, the mount length setting is its 25 mm default, screw hole diameter is 20 mm and its distance from the mount end is 12 mm
- **THEN** the page marks the screw hole diameter input with an error, because 20 mm is not smaller than the 15.60 mm mount diameter

### Requirement: Buoyancy readout
For valid inputs, the page SHALL show the pontoon's displaced volume in mL, its estimated mass in g as solid material volume times filament density, and its net lift in g as displaced volume times 1.0 g/mL minus mass. The readout SHALL state that the mass assumes solid walls and fresh water.

#### Scenario: Readout updates
- **WHEN** the user changes the outer diameter to a valid value
- **THEN** the displayed volume, mass and net lift update to match the new pontoon

#### Scenario: Lift arithmetic
- **WHEN** the generated pontoon displaces 135.0 mL and its material volume is 23.4 cm³ at 1.24 g/cm³
- **THEN** the page shows mass 29.0 g and net lift 106.0 g

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
