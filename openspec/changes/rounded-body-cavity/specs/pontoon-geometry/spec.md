# Spec Delta

## MODIFIED Requirements

### Requirement: Overhang limit
No outer or inner surface of the body SHALL lean more than 35° from vertical, measured with the model standing on its flat, except the outer and inner rear sphere surfaces more than 35° below the rear sphere's equator and the outer spherical cap of diameter d + 4 mm and its concentric inner cap above their cone tangents. The rear sphere SHALL be cut at the latitude where its outer surface makes 35° with the print bed, which is 55° from vertical, and the front cone SHALL have a 35° half-angle.

#### Scenario: Rear flat size
- **WHEN** D = 32 mm
- **THEN** the rear flat is a disc of diameter 32 × sin 35° ≈ 18.35 mm, and the rear sphere's centre is at z = 16 × cos 35° ≈ 13.11 mm

#### Scenario: Front cone
- **WHEN** D = 32 mm
- **THEN** the front sphere meets the cone at a polar angle of 55° from the axis, where its surface leans 35° from vertical, and the cone keeps that slope until it meets the spherical cap of diameter d + 4 mm tangentially

### Requirement: Sealed thin wall
The body SHALL have one closed internal cavity with its floor at height t and at least t of material separating it from the exterior and screw hole. Before applying mount closures, the body cavity SHALL be the inward offset by t of the pontoon without its mount, including a concentric tangent nose sphere of radius R − t, where R = (d + 4 mm) / 2. Body walls SHALL be exactly t where the cavity follows this offset. No additional cavity-roof cone SHALL narrow it. At 0°, 30° and 45° the cavity SHALL continue into the wider lower mount, with cylindrical wall thickness t and a closure at least t thick before the seating shoulder. At 60° and 90° the wider lower mount SHALL be solid. The entire 20 mm insertion peg SHALL be solid apart from its screw hole.

#### Scenario: Cavity is closed
- **WHEN** a pontoon is generated with any valid parameters
- **THEN** the exported model is one closed solid with one connected internal cavity that does not reach any outer surface or the screw hole

#### Scenario: Cavity stops below the default pipe-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "inside pipe" and angle is 0°
- **THEN** the cavity continues into the wider lower mount and closes at least 1.2 mm before the shoulder at z ≈ 168.71 mm, leaving the peg and its hole at z ≈ 178.71 mm isolated from the cavity

#### Scenario: Cavity stops below the fitting-mount hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "into fitting" and angle is 0°
- **THEN** the cavity continues into the wider lower mount and closes at least 1.2 mm before the shoulder at z ≈ 164.76 mm, leaving the peg and its hole at z ≈ 174.76 mm isolated from the cavity

#### Scenario: Hollow lower mount through 45 degrees
- **WHEN** either mount type is generated at 0°, 30° or 45° with any offered wall thickness
- **THEN** the lower cylinder contains a hollow continuation of the body cavity, with wall thickness t on its exposed cylindrical sides and at least t of material closing it before the shoulder
- **AND** the cavity does not enter the insertion peg

#### Scenario: Solid lower mount at 60 and 90 degrees
- **WHEN** either mount type is generated at 60° or 90°
- **THEN** the entire wider lower cylinder is solid, the body remains hollow and its cavity does not enter either mount cylinder

#### Scenario: Body roof reference is independent of the sideways screw hole
- **WHEN** D = 32 mm, L = 180 mm, t = 1.2 mm, mount type is "inside pipe", angle is 90° and clearance is 0.2 mm
- **THEN** the inner nose is a spherical cap concentric with the outer nose, of radius 8.60 mm and top at z = c + R − t ≈ 171.51 mm, while both mount cylinders remain solid apart from the peg's screw hole
- **AND** screw-hole height does not change the body cavity profile

#### Scenario: Uniform front dome and cone
- **WHEN** either mount type is generated with any offered wall thickness
- **THEN** the cavity follows the front body sphere and its tangent cone at normal distance t wherever those surfaces are away from the mount closure
- **AND** the cross-section has no extra solid band caused by an independent roof cone

#### Scenario: Tangent inner nose sphere
- **WHEN** either mount type is generated at 90° with any offered wall thickness
- **THEN** the inner nose sphere has the same centre as the outer nose sphere, radius R − t, and a tangent join to the inner cone on the side clear of the solid mount
