# Spec Delta

## Purpose

Defines the shape of a generated SeaPerch pontoon: a sealed, thin-walled body that prints standing on a flat rear end without support, with a nose mount that fits 1/2" PVC pipe or fittings.

## ADDED Requirements

### Requirement: Print orientation and units
All geometry SHALL be in millimetres in a single coordinate frame where the pontoon axis is vertical, the rear flat lies in the plane z = 0, and the nose points toward +z.

#### Scenario: Exported model stands on its flat
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the lowest point of the model is at z = 0 and the rear flat lies in that plane

### Requirement: Body shape
The body SHALL be a solid of revolution of outer diameter D: a cylinder joined to a rear sphere and a front sphere of radius D/2, with the front sphere continuing into a tangent cone that ends in a point. The body length L SHALL be the distance from the rear flat to the cone's point.

#### Scenario: Default body
- **WHEN** D = 32 mm and L = 180 mm
- **THEN** the body's maximum diameter is 32 mm and its highest point on the axis, before the mount is added, is at z = 180 mm

### Requirement: Overhang limit
No outer or inner surface of the body SHALL lean more than 35° from vertical, measured with the model standing on its flat. The rear sphere SHALL be cut at the latitude where its surface reaches 35° from vertical, and the front cone SHALL have a 35° half-angle.

#### Scenario: Rear flat size
- **WHEN** D = 32 mm
- **THEN** the rear flat is a disc of diameter 32 × cos 35° ≈ 26.2 mm

#### Scenario: Front cone
- **WHEN** D = 32 mm
- **THEN** the front sphere meets the cone where its surface leans 35° from vertical, and the cone's walls lean 35° from vertical up to its point

### Requirement: Sealed thin wall
The body SHALL be hollow with a uniform wall thickness t on its sides, domes and cone, a solid rear floor of thickness t, and a single closed internal cavity with no opening to the outside.

#### Scenario: Cavity is closed
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the exported model is one closed solid whose internal cavity does not reach any outer surface

### Requirement: Mount type
The nose SHALL carry a solid cylindrical mount whose outer diameter is set by the selected mount type: 15.80 mm minus the fit clearance for insertion inside 1/2" Schedule 40 PVC pipe, or 21.34 mm minus the fit clearance for insertion into a 1/2" PVC fitting socket. The fit clearance SHALL default to 0.2 mm on the diameter.

#### Scenario: Pipe mount
- **WHEN** mount type is "inside pipe" with the default clearance
- **THEN** the mount's outer diameter is 15.60 mm

#### Scenario: Fitting mount
- **WHEN** mount type is "into fitting" with the default clearance
- **THEN** the mount's outer diameter is 21.14 mm

### Requirement: Mount root
The mount's start point SHALL be the point on the body axis where the cone's radius equals the mount's radius r, so a coaxial mount meets the cone flush. The mount SHALL be a cylinder of radius r that starts at the start point and runs along the mount axis, joined to the body by a ball joint: a sphere of radius r centred on the start point. The cylinder's base disc SHALL lie inside the ball joint at every mount angle, so no part of it is exposed. The mount length SHALL be measured from the start point along the mount axis, and SHALL be one fixed build setting for both mount types, 25 mm by default, never less than the fitting mount's radius.

#### Scenario: Coaxial mount on default body
- **WHEN** D = 32 mm, L = 180 mm, mount type "inside pipe", default clearance, angle 0° and the default 25 mm mount length setting
- **THEN** the mount starts at z = 180 − 7.80 / tan 35° ≈ 168.86 mm and ends at z ≈ 193.86 mm, and the ball joint adds no material outside the mount cylinder and the cone

### Requirement: Mount angle
The mount axis SHALL pivot about its start point, tilted from the body axis by a user-set angle from 0° to 45° inclusive. The overhang limit does not apply to the mount: its side leans from vertical by the mount angle.

#### Scenario: Tilted mount
- **WHEN** the mount angle is 45°
- **THEN** the angle between the mount's axis and the body axis is 45°, the mount cylinder's base disc lies inside the ball joint, and the ball joint's upper half rounds over the joint on the side away from the tilt

### Requirement: Screw hole
The mount SHALL have one cylindrical through-hole for a screw, perpendicular to the mount axis and to the plane containing the body and mount axes, centred on the mount axis at a user-set distance from the mount's free end. The hole SHALL keep at least the wall thickness t of material between itself and the internal cavity.

#### Scenario: Hole position
- **WHEN** the screw hole diameter is 2.5 mm and its distance from the mount end is 8 mm
- **THEN** the mount has a 2.5 mm through-hole whose axis crosses the mount axis 8 mm from the mount's free end

#### Scenario: Hole does not breach the cavity
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the screw hole does not connect to the internal cavity
