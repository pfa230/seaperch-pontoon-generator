# Spec Delta

## MODIFIED Requirements

### Requirement: Parameter form
The page SHALL present a form with these inputs and defaults: outer diameter (32 mm), length (180 mm), wall thickness chosen from 0.8, 1.2 or 1.6 mm (default 1.2 mm), mount type ("inside pipe" or "into fitting", default "inside pipe"), mount angle chosen from 0°, 30°, 45°, 60° or 90° (default 0°) and filament (PLA, PETG or ASA/ABS, default ASA/ABS). Mount length, fit clearance, screw hole diameter and screw hole position SHALL NOT be form inputs; the page SHALL use their fixed build settings.

#### Scenario: Page opens with defaults
- **WHEN** a user opens the page
- **THEN** the form shows every input above with its default value, with filament set to ASA/ABS, and shows no mount length, fit clearance, screw hole or density input

#### Scenario: Fixed choices
- **WHEN** a user opens the wall thickness or mount angle input
- **THEN** it offers exactly the listed values and accepts no other value

### Requirement: File downloads
For valid inputs, the page SHALL offer a STEP download and an STL download of the same pontoon in millimetres. Each file name SHALL encode the outer diameter, length, mount type and mount angle.

#### Scenario: STEP download
- **WHEN** the user downloads STEP with the default parameters
- **THEN** the browser saves `pontoon_d32_l180_pipe_a0.step`, which opens in a CAD program as a single solid

#### Scenario: STL download
- **WHEN** the user downloads STL with the mount type "into fitting" and angle 30°
- **THEN** the browser saves `pontoon_d32_l180_fitting_a30.stl`

### Requirement: Form validation rules
The page SHALL reject: a non-numeric outer diameter or length; a zero or negative outer diameter or length; a mount diameter above D × cos 35°; a length too short to fit both ends.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the length is 30 mm
- **THEN** the page marks the length input with an error stating the minimum length for this diameter, about 37.1 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because 21.14 mm exceeds 24 × cos 35° ≈ 19.66 mm

## ADDED Requirements

### Requirement: Invalid input marking
While any input breaks a validation rule, the page SHALL mark that input with a message saying why, and SHALL offer no download.

#### Scenario: Length out of range
- **WHEN** the user enters a length of 0 mm
- **THEN** the page marks the length input with an error and disables both downloads

## REMOVED Requirements

### Requirement: Input validation
**Reason**: Its only scenario enters a mount angle of 50°, which the mount angle dropdown no longer allows.
**Migration**: The same behavior moves unchanged to "Invalid input marking", whose scenario uses an invalid length.
