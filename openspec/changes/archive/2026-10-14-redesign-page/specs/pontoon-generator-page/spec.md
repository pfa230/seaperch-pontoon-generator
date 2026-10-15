# Spec Delta

## ADDED Requirements

### Requirement: Page layout
In a browser viewport 1280 px wide and 650 px tall or larger, the page SHALL show every form input, the 3D preview, the "Reset view" button, the buoyancy readout and both download buttons at once, without scrolling. In a viewport 360 px wide, the page SHALL lay these out in one column that needs no sideways scrolling, with the preview as wide as the column.

#### Scenario: Laptop screen
- **WHEN** a user opens the page in a 1280 × 650 px viewport and the default pontoon has been generated
- **THEN** every input, the preview showing the pontoon, "Reset view", the three readout values and both download buttons are visible without scrolling

#### Scenario: Phone screen
- **WHEN** a user opens the page in a 360 px wide viewport
- **THEN** the page does not scroll sideways, the preview spans the column width, and scrolling down reaches every input, the readout and both download buttons

### Requirement: Visible keyboard focus
Every input, select and button SHALL show a visible focus indicator when reached with the keyboard.

#### Scenario: Tabbing through the page
- **WHEN** the user presses Tab repeatedly from the top of the page
- **THEN** each input, select and enabled button shows a focus indicator in turn
