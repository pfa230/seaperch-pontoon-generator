## MODIFIED Requirements

### Requirement: Overhang limit
No outer or inner surface of the body SHALL lean more than 35° from vertical, measured with the model standing on its flat, except the outer and inner rear sphere surfaces more than 35° below the rear sphere's equator. The rear sphere SHALL be cut at the latitude where its outer surface makes 35° with the print bed, which is 55° from vertical, and the front cone SHALL have a 35° half-angle.

#### Scenario: Rear flat size
- **WHEN** D = 32 mm
- **THEN** the rear flat is a disc of diameter 32 × sin 35° ≈ 18.35 mm, and the rear sphere's centre is at z = 16 × cos 35° ≈ 13.11 mm

#### Scenario: Front cone
- **WHEN** D = 32 mm
- **THEN** the front sphere meets the cone where its surface leans 35° from vertical, and the cone's walls lean 35° from vertical up to its point
