## MODIFIED Requirements

### Requirement: Sealed thin wall
The body SHALL be hollow with a wall thickness of at least t everywhere, and a single closed internal cavity with no opening to the outside. The cavity SHALL be the inward offset of the body by t, with its floor at height t, intersected with a cone with a 35° half-angle on the body axis whose point lies one wall thickness t below the lower of the screw hole's lowest point and the rounded body tip. The wall SHALL be exactly t on the sides, domes and rear floor wherever the cavity follows the inward offset, and thicker where the cone replaces it.

#### Scenario: Cavity is closed
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the exported model is one closed solid whose internal cavity does not reach any outer surface

#### Scenario: Cavity stops below the default pipe-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type "inside pipe" and angle 0°
- **THEN** the cavity's highest point is at z = 166.40 + 7.80 − 1.2 ≈ 173.00 mm, limited by the rounded nose

#### Scenario: Cavity stops below the fitting-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type "into fitting" and angle 0°
- **THEN** the cavity's highest point is at z = 161.57 + 10.57 − 1.2 ≈ 170.94 mm, limited by the rounded nose

### Requirement: Mount root
The mount's start point SHALL be the centre of the mount-sized sphere tangent to the front cone: z = L − r / sin 35°, where r is the mount radius. The body's spherical cap SHALL round the joint, with no separately added ball or pointed cone inside it. The mount SHALL be a cylinder of radius r that starts at this centre and runs along the mount axis. Its base disc SHALL lie inside the body at every mount angle, so no part of it is exposed. The mount length SHALL be measured from the start point along the mount axis, and SHALL be one fixed build setting for both mount types, 25 mm by default, never less than the fitting mount's radius.

#### Scenario: Coaxial mount on default body
- **WHEN** D = 32 mm, L = 180 mm, mount type "inside pipe", default clearance, angle 0° and the default 25 mm mount length setting
- **THEN** the mount starts at z = 180 − 7.80 / sin 35° ≈ 166.40 mm and ends at z ≈ 191.40 mm, with the spherical cap contained inside the mount cylinder and the visible cylinder-to-cone join at z ≈ 168.86 mm

#### Scenario: Tangent spherical cap for both mounts
- **WHEN** either mount type is selected with the default clearance
- **THEN** the cap's sphere diameter is 15.60 mm for the pipe mount or 21.14 mm for the fitting mount, and its cone join has no change in surface slope

### Requirement: Mount angle
The mount axis SHALL pivot about its start point, tilted from the body axis by a user-set angle of 0°, 30°, 45°, 60° or 90°. The overhang limit does not apply to the mount: its side leans from vertical by the mount angle.

#### Scenario: Tilted mount
- **WHEN** the mount angle is 45°
- **THEN** the angle between the mount's axis and the body axis is 45°, the mount cylinder's base disc lies inside the body, and the spherical cap rounds over the joint on the side away from the tilt

#### Scenario: Sideways mount
- **WHEN** the mount angle is 90° with either mount type
- **THEN** the mount's axis is perpendicular to the body axis, the mount cylinder's base disc lies inside the body, and the pontoon is one closed solid

### Requirement: Screw hole
The mount SHALL have one cylindrical through-hole for an M3 screw, 3.2 mm in diameter, perpendicular to the mount axis and to the plane containing the body and mount axes. Its axis SHALL cross the mount axis at a distance of 10 mm plus r × (1 / sin 35° − 1 / tan 35°) from the mount's start point along the mount axis. This preserves the hole's 10 mm spacing from the nominal cone-to-mount flush reference, which at 0° is where the cone radius equals the mount radius r. The reference SHALL tilt with the mount; it does not track actual pipe seating at each tilt. The diameter and distance SHALL be fixed build settings.

#### Scenario: Hole position
- **WHEN** a pontoon is generated with the default settings
- **THEN** the mount has a 3.2 mm through-hole centred at z ≈ 178.86 mm, about 10.14 mm above the pipe edge's seating height z ≈ 168.72 mm with default clearance

#### Scenario: Fitting hole position
- **WHEN** D = 32 mm, L = 180 mm, mount type "into fitting", angle 0° and the default clearance
- **THEN** the hole is centred at z ≈ 174.90 mm, about 10.14 mm above the fitting edge's seating height z ≈ 164.76 mm

#### Scenario: Hole does not breach the cavity
- **WHEN** a pontoon is generated with any valid parameters, including mount angle 90° and either mount type
- **THEN** the screw hole does not connect to the internal cavity
