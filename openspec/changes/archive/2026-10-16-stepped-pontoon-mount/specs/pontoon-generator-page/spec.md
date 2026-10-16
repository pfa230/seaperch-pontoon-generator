# Spec Delta

## MODIFIED Requirements

### Requirement: Form validation rules
The page SHALL reject: a non-numeric outer diameter or length; a zero or negative outer diameter or length; a lower mount and nose sphere diameter d + 4 mm above D × cos 35°, where d is the fit-adjusted insertion peg diameter; a length too short to fit both ends.

#### Scenario: Body too short
- **WHEN** D = 32 mm and the length is 30 mm
- **THEN** the page marks the length input with an error stating the minimum length for this diameter, about 41.0 mm

#### Scenario: Mount too wide for the body
- **WHEN** D = 24 mm and mount type is "into fitting"
- **THEN** the page marks the mount type input with an error, because the 25.14 mm lower mount and nose diameter exceeds 24 × cos 35° ≈ 19.66 mm

#### Scenario: Previously valid narrow body needs the larger nose check
- **WHEN** D = 26 mm and mount type is "into fitting"
- **THEN** the page rejects the mount type because 25.14 mm exceeds 26 × cos 35° ≈ 21.30 mm, even though its 21.14 mm insertion peg alone would fit

#### Scenario: Default body still accepts either mount
- **WHEN** D = 32 mm and the other inputs are valid
- **THEN** either mount type passes the size check, since both 19.60 mm and 25.14 mm are below 32 × cos 35° ≈ 26.21 mm
