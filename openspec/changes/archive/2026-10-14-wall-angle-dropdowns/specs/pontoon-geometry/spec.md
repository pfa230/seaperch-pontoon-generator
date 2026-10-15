# Spec Delta

## MODIFIED Requirements

### Requirement: Mount angle
The mount axis SHALL pivot about its start point, tilted from the body axis by a user-set angle of 0°, 30°, 45°, 60° or 90°. The overhang limit does not apply to the mount: its side leans from vertical by the mount angle.

#### Scenario: Tilted mount
- **WHEN** the mount angle is 45°
- **THEN** the angle between the mount's axis and the body axis is 45°, the mount cylinder's base disc lies inside the ball joint, and the ball joint's upper half rounds over the joint on the side away from the tilt

#### Scenario: Sideways mount
- **WHEN** the mount angle is 90° with either mount type
- **THEN** the mount's axis is perpendicular to the body axis, the mount cylinder's base disc lies inside the ball joint, and the pontoon is one closed solid

### Requirement: Screw hole
The mount SHALL have one cylindrical through-hole for an M3 screw, 3.2 mm in diameter, perpendicular to the mount axis and to the plane containing the body and mount axes. Its axis SHALL cross the mount axis 10 mm from the mount's start point, where the edge of the pipe or fitting comes to rest. The diameter and distance SHALL be fixed build settings.

#### Scenario: Hole position
- **WHEN** a pontoon is generated with the default settings
- **THEN** the mount has a 3.2 mm through-hole whose axis crosses the mount axis 10 mm from the mount's start point

#### Scenario: Hole does not breach the cavity
- **WHEN** a pontoon is generated with any valid parameters, including mount angle 90° and either mount type
- **THEN** the screw hole does not connect to the internal cavity
