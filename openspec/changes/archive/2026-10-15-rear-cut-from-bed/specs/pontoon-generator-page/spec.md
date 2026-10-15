## MODIFIED Requirements

### Requirement: Form validation rules
The page SHALL reject: a non-numeric outer diameter or length; a zero or negative outer diameter or length; a mount diameter above D × cos 35°; a length too short to fit both ends.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the length is 30 mm
- **THEN** the page marks the length input with an error stating the minimum length for this diameter, about 41.0 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because 21.14 mm exceeds 24 × cos 35° ≈ 19.66 mm
