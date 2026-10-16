# Spec Delta

## MODIFIED Requirements

### Requirement: Sealed thin wall
The finished pontoon SHALL have one closed internal cavity equal to the inward offset by t of the body without its mount, with floor at height t and the complete concentric tangent nose cap of radius R − t, where R = (d + 4 mm) / 2. Its shape SHALL be independent of mount angle. At least t of material SHALL separate it from the actual exterior and screw hole. Cavity overlap with either nominal mount cylinder SHALL be allowed; all mount material outside this cavity SHALL remain solid apart from the screw hole.

#### Scenario: Cavity is closed
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the exported model is one closed solid with one connected internal cavity that does not reach any outer surface or the screw hole

#### Scenario: Cavity stops below the default pipe-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "inside pipe" and angle is 0°
- **THEN** the cavity ends at its spherical tip at z ≈ 171.51 mm, beyond the shoulder at z ≈ 168.71 mm, and remains at least 1.2 mm from the actual exterior and the screw hole centred at z ≈ 178.71 mm
- **AND** the shoulder and 20 mm peg are not moved to avoid nominal cavity/peg overlap

#### Scenario: Cavity stops below the fitting-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "into fitting" and angle is 0°
- **THEN** the cavity ends at its spherical tip at z ≈ 169.46 mm, beyond the shoulder at z ≈ 164.76 mm, and remains at least 1.2 mm from the actual exterior and the screw hole centred at z ≈ 174.76 mm
- **AND** the shoulder and 20 mm peg are not moved to avoid nominal cavity/peg overlap

#### Scenario: Hollow lower mount through 45 degrees
- **WHEN** either mount type is generated at 0°, 30° or 45° with any offered wall thickness
- **THEN** the body cavity remains intact through its overlap with the mount, including any overlap with the nominal peg
- **AND** there is no additional cylindrical mount void or shoulder-plane closure reshaping the body cavity; its boundary remains the body's offset surface
- **AND** at least t of material separates the cavity from actual outer mount surfaces and the screw hole

#### Scenario: Solid lower mount at 60 and 90 degrees
- **WHEN** either mount type is generated at 60° or 90°
- **THEN** the lower cylinder and peg contain solid material wherever they lie outside the body cavity, apart from the screw hole
- **AND** their overlap with the body cavity stays hollow, without a flat mount base, shelf or cylindrical intrusion replacing the spherical boundary

#### Scenario: Uniform front dome and cone
- **WHEN** either mount type is generated at any offered angle and wall thickness
- **THEN** the cavity follows the front body sphere, tangent cone and entire tangent nose cap at normal offset t from the body without its mount
- **AND** the final lengthwise cross-section shows this continuous profile on both sides of the nose, including where the mount overlaps it
- **AND** the mount can add material outside the body, but cannot change the cavity boundary

#### Scenario: Tangent inner nose sphere
- **WHEN** either mount type is generated at 0°, 30°, 45°, 60° or 90° with any offered wall thickness
- **THEN** the complete inner nose cap has the same centre as the outer nose sphere, radius R − t, and an uninterrupted tangent join around the inner cone
- **AND** the cap extends from its cone tangent to its pole around the full circumference, including the side beneath the mount
- **AND** for the default pipe body at t = 1.2 mm the cavity tip is at z = c + R − t ≈ 171.51 mm at every angle

### Requirement: Mount type
The nose SHALL carry a stepped cylindrical mount. Its insertion peg SHALL have diameter d: 15.80 mm minus the fit clearance for insertion inside 1/2" Schedule 40 PVC pipe, or 21.34 mm minus the fit clearance for insertion into a 1/2" PVC fitting socket. The lower cylinder SHALL have diameter d + 4 mm. The fit clearance SHALL remain a fixed build setting on the diameter, 0.2 mm by default. The Sealed thin wall requirement SHALL determine material remaining where the mount overlaps the body cavity.

#### Scenario: Pipe mount
- **WHEN** mount type is "inside pipe" with the default clearance setting
- **THEN** the insertion peg's outer diameter is 15.60 mm and the lower cylinder's outer diameter is 19.60 mm

#### Scenario: Fitting mount
- **WHEN** mount type is "into fitting" with the default clearance setting
- **THEN** the insertion peg's outer diameter is 21.14 mm and the lower cylinder's outer diameter is 25.14 mm

#### Scenario: Diameter selection follows mount type
- **WHEN** the mount type changes between "inside pipe" and "into fitting"
- **THEN** the peg diameter, lower cylinder diameter, tangent sphere diameter, pivot and seating geometry all use the selected pipe or fitting dimensions
