# Spec Delta

## MODIFIED Requirements

### Requirement: Sealed thin wall
The body SHALL be hollow with a wall thickness of at least t everywhere and exactly t on its sides, domes and rear floor, and a single closed internal cavity with no opening to the outside. The cavity's top SHALL be a cone with a 35° half-angle on the body axis whose point lies one wall thickness t below the screw hole's lowest point, or the inward offset of the body's cone if that is lower.

#### Scenario: Cavity is closed
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the exported model is one closed solid whose internal cavity does not reach any outer surface

#### Scenario: Cavity stops below the default pipe-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type "inside pipe" and angle 0°
- **THEN** the cavity's highest point is at z = 168.86 + 10 − 1.6 − 1.2 ≈ 176.06 mm

#### Scenario: Cavity stops below the fitting-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type "into fitting" and angle 0°
- **THEN** the cavity's highest point is at z = 164.90 + 10 − 1.6 − 1.2 ≈ 172.10 mm

### Requirement: Mount type
The nose SHALL carry a solid cylindrical mount whose outer diameter is set by the selected mount type: 15.80 mm minus the fit clearance for insertion inside 1/2" Schedule 40 PVC pipe, or 21.34 mm minus the fit clearance for insertion into a 1/2" PVC fitting socket. The fit clearance SHALL be a fixed build setting on the diameter, 0.2 mm by default.

#### Scenario: Pipe mount
- **WHEN** mount type is "inside pipe" with the default clearance setting
- **THEN** the mount's outer diameter is 15.60 mm

#### Scenario: Fitting mount
- **WHEN** mount type is "into fitting" with the default clearance setting
- **THEN** the mount's outer diameter is 21.14 mm

### Requirement: Screw hole
The mount SHALL have one cylindrical through-hole for an M3 screw, 3.2 mm in diameter, perpendicular to the mount axis and to the plane containing the body and mount axes. Its axis SHALL cross the mount axis 10 mm from the mount's start point, where the edge of the pipe or fitting comes to rest. The diameter and distance SHALL be fixed build settings.

#### Scenario: Hole position
- **WHEN** a pontoon is generated with the default settings
- **THEN** the mount has a 3.2 mm through-hole whose axis crosses the mount axis 10 mm from the mount's start point

#### Scenario: Hole does not breach the cavity
- **WHEN** a pontoon is generated with any valid parameters, including mount angle 45° and either mount type
- **THEN** the screw hole does not connect to the internal cavity
