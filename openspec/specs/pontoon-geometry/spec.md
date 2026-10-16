# pontoon-geometry Specification

## Purpose
Defines the shape of a generated SeaPerch pontoon: a sealed, thin-walled body that prints standing on a flat rear end without support, with a nose mount that fits 1/2" PVC pipe or fittings.

## Requirements

### Requirement: Print orientation and units
All geometry SHALL be in millimetres in a single coordinate frame where the pontoon axis is vertical, the rear flat lies in the plane z = 0, and the nose points toward +z.

#### Scenario: Exported model stands on its flat
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the lowest point of the model is at z = 0 and the rear flat lies in that plane

### Requirement: Body shape
The body SHALL be a solid of revolution of outer diameter D: a cylinder joined to a rear sphere and a front sphere of radius D/2, continuing into a tangent cone and then a tangent spherical cap of diameter d + 4 mm, where d is the fit-adjusted insertion peg diameter. The front sphere SHALL meet the cone at 55° from the body axis, measured along the sphere's radius. The body length L SHALL remain the distance from the rear flat to the cone's virtual point; the rounded body SHALL end below that point.

#### Scenario: Default body
- **WHEN** D = 32 mm and L = 180 mm
- **THEN** with the default pipe mount the body's maximum diameter is 32 mm, its virtual cone point is at z = 180 mm and its rounded tip before the mount is added is at z ≈ 172.71 mm

### Requirement: Overhang limit
No outer or inner surface of the body SHALL lean more than 35° from vertical, measured with the model standing on its flat, except the outer and inner rear sphere surfaces more than 35° below the rear sphere's equator and the outer spherical cap of diameter d + 4 mm and its concentric inner cap above their cone tangents. The rear sphere SHALL be cut at the latitude where its outer surface makes 35° with the print bed, which is 55° from vertical, and the front cone SHALL have a 35° half-angle.

#### Scenario: Rear flat size
- **WHEN** D = 32 mm
- **THEN** the rear flat is a disc of diameter 32 × sin 35° ≈ 18.35 mm, and the rear sphere's centre is at z = 16 × cos 35° ≈ 13.11 mm

#### Scenario: Front cone
- **WHEN** D = 32 mm
- **THEN** the front sphere meets the cone at a polar angle of 55° from the axis, where its surface leans 35° from vertical, and the cone keeps that slope until it meets the spherical cap of diameter d + 4 mm tangentially

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

### Requirement: Mount root
The mount's start point SHALL be the centre of the nose sphere tangent to the cone: z = L − R / sin 35°, where R = (d + 4 mm) / 2. The lower cylinder SHALL start at this centre and run along the mount axis to the seating shoulder, with its base disc inside the body at every permitted angle. The insertion peg SHALL extend 20 mm along the same axis from that shoulder. The spherical cap SHALL round the joint without a separately added ball or pointed cone inside it.

#### Scenario: Coaxial mount on default body
- **WHEN** D = 32 mm, L = 180 mm, mount type is "inside pipe", clearance is 0.2 mm and angle is 0°
- **THEN** the mount starts at z ≈ 162.91 mm, with its shoulder at z ≈ 168.71 mm and its tip at z ≈ 188.71 mm

#### Scenario: Tangent spherical cap for both mounts
- **WHEN** either mount type is selected with the default clearance
- **THEN** the cap's sphere diameter is 19.60 mm for the pipe mount or 25.14 mm for the fitting mount, matching the lower cylinder, and its cone join has no change in surface slope

#### Scenario: Full insertion length at every angle
- **WHEN** either mount type is generated at any permitted angle
- **THEN** the peg has 20 mm of axial length from the shoulder to its free end, independently of the lower cylinder's length

### Requirement: Mount angle
The mount axis SHALL pivot about its start point, tilted from the body axis by a user-set angle of 0°, 30°, 45°, 60° or 90°. The body's overhang limit SHALL NOT apply to the outer or inner mount surfaces: the cylinders' sides lean from vertical by the mount angle.

#### Scenario: Tilted mount
- **WHEN** the mount angle is 45°
- **THEN** the angle between the mount's axis and the body axis is 45°, the lower cylinder's base disc lies inside the body, and the enlarged spherical cap rounds over the joint on the side away from the tilt

#### Scenario: Sideways mount
- **WHEN** the mount angle is 90° with either mount type
- **THEN** the mount's axis is perpendicular to the body axis, the lower cylinder's base disc lies inside the body, and the pontoon is one closed solid

### Requirement: Screw hole
The insertion peg SHALL have one cylindrical through-hole for an M3 screw, 3.2 mm in diameter, perpendicular to the mount axis and to the plane containing the body and mount axes. Its axis SHALL cross the mount axis exactly 10 mm from the seating shoulder toward the peg's free end. The hole diameter and shoulder-relative distance SHALL be fixed build settings.

#### Scenario: Hole position
- **WHEN** a pontoon is generated with the default settings
- **THEN** the through-hole is centred at z ≈ 178.71 mm, 10 mm along the mount axis from the seated pipe edge and 10 mm from the peg's free end

#### Scenario: Fitting hole position
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "into fitting", angle is 0° and clearance is 0.2 mm
- **THEN** the hole is centred at z ≈ 174.76 mm, exactly 10 mm from the fitting's seating shoulder along the mount axis

#### Scenario: Hole follows seating at tilted angles
- **WHEN** either mount type is generated at 30°, 45°, 60° or 90°
- **THEN** the hole centre is 10 mm along the mount axis from that angle's collision-derived shoulder

#### Scenario: Hole does not breach the cavity
- **WHEN** a pontoon is generated with any valid parameters, including mount angle 90° and either mount type
- **THEN** the screw hole does not connect to the internal cavity and remains at least t from it

### Requirement: Pipe and fitting seating
The shoulder SHALL be the closest nonpenetrating seat along the mount axis, calculated with 2D trigonometry; generation SHALL NOT perform 3D collision queries. Contact SHALL be allowed. Use pipe bore/outside diameters 15.80/21.34 mm or reference socket bore/outside diameters 21.34/27.78 mm, extended outward past the body. Select the matching hardware for each mount type. Fit clearance SHALL reduce only the peg.

#### Scenario: Closest noncolliding seat
- **WHEN** either mount type is generated at any permitted angle
- **THEN** its mating wall envelope at the shoulder has no positive-volume intersection with the pontoon, and shifting its edge toward the root introduces interference within the numerical tolerance used to locate contact

#### Scenario: Check hardware material rather than its bore or axis
- **WHEN** a tilted pipe or fitting has an outer wall that would overlap the rounded body at a proposed shoulder position
- **THEN** the shoulder moves outward until that wall clears, even if the hardware axis and bore would clear at the proposed position

#### Scenario: Coaxial fitting seat
- **WHEN** D = 32 mm, L = 180 mm, mount type is "into fitting", clearance is 0.2 mm and angle is 0°
- **THEN** the shoulder is at z ≈ 164.76 mm and the peg ends at z ≈ 184.76 mm

#### Scenario: Generation calculates seating in two dimensions
- **WHEN** a pontoon is generated or regenerated for either mount type
- **THEN** its shoulder position is derived analytically from the 2D body profile, mount angle and selected hardware diameters without constructing 3D collision shapes or querying 3D collisions
