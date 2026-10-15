# Design

## Context

See proposal.md for why. Today `src/profile.ts` carries `clearance`, `holeDiameter`, `holeDistance` and `density` as form parameters, `src/validate.ts` has rules for each, and the worker runs a kernel check (`holeClearsCavity` in `src/model.ts`) that intersects the hole, grown by t, with the cavity. `src/settings.ts` holds the one existing build setting, `MOUNT_LENGTH`. The cavity's top is the inward offset of the body's cone, and its point reaches about 9 mm (pipe) to 13 mm (fitting) into the mount above the mount's start point.

## Goals / Non-Goals

**Goals:**

- The removed values become constants in `src/settings.ts`, beside `MOUNT_LENGTH`.
- The hole can never breach the cavity, by construction rather than by validation.

**Non-Goals:**

- Changing the body shape, mount types, mount length or file names.
- Saving or remembering the chosen filament between visits.

## Decisions

### Build settings

`src/settings.ts` gains `FIT_CLEARANCE = 0.2`, `HOLE_DIAMETER = 3.2` and `HOLE_FROM_START = 10`, each with a one-line comment like `MOUNT_LENGTH`'s. A unit test asserts that the hole lies fully inside the mount: `HOLE_FROM_START − HOLE_DIAMETER / 2 > 0` and `HOLE_FROM_START + HOLE_DIAMETER / 2 < MOUNT_LENGTH`. That replaces the per-input rules for hole position and hole size, and the existing mount-length test stays.

### Hole measured from the mount's start point

Decision (user): the hole sits 10 mm from the pipe or fitting edge. The pipe's or fitting's end slides over the mount until its inner edge meets the nose cone, at the mount's start point to within 0.15 mm, because the cone's radius there equals the mount's radius. So the hole's axis crosses the mount axis 10 mm from the start point. `screwHole` in `src/model.ts` changes from measuring `MOUNT_LENGTH − holeDistance` to `HOLE_FROM_START`.

### Cavity top ends below the hole

Decision (user, after weighing a fully solid mount at about 7–9 mL of lift): the cavity ends one wall thickness below the hole. The hole's axis is horizontal (along y), so its lowest point is at z_hole = z_start + HOLE_FROM_START·cos(angle) − HOLE_DIAMETER/2. The cavity's top is a cone with a 35° half-angle on the body axis, pointing up, whose point is at min(inner cone point, z_hole − t). The cavity is the existing inward offset of the body intersected with that cone. Where the lower cone meets the inner sphere or cylinder it leaves a crease, but every surface still leans at most 35° from vertical, so the overhang limit holds.

Where the cone cuts below the inner front dome, the wall there is thicker than t: on the fitting mount at 45° the cone reaches the cylinder, and the side wall is about 2.57 mm thick at z = 150 mm and about 4.05 mm where the cylinder meets the front dome.

The cone removes about 1.11 cm³ of cavity on the default pipe mount at 0° and about 5.82 cm³ on a fitting mount at 45°. With the default ASA/ABS filament (1.07 g/cm³), net lift drops by about 1.2 g and 6.2 g; with PETG, the densest choice, by up to 7.4 g. The larger hole in its new position changes lift by under 0.01 g, because it removes displaced volume and material alike.

Alternative: keeping the cavity and the validation check would make the default fitting mount invalid, because the fixed hole sits over the cavity's point.

### Filament dropdown

A `<select name="filament">` with values `pla`, `petg` and `asa`, labelled "PLA", "PETG" and "ASA/ABS", default `asa`. `src/profile.ts` maps them to 1.24, 1.27 and 1.07 g/cm³ (ASA 1.07; ABS is about 1.04, close enough for a lift estimate). `density` leaves the parameter object and `filament` takes its place. The note paragraph in `index.html` is deleted.

### Removed code

The `clearance`, `holeDiameter`, `holeDistance` and `density` inputs, their defaults and validation rules, `holeClearsCavity`, and the worker's hole-check message go. The worker no longer reports a hole error.

## Risks / Trade-offs

- [The extra solid nose adds mass and lowers lift] → The readout shows the new numbers; the size of the loss is recorded above.
- [The 10 mm position assumes the pipe or fitting seats fully] → A pipe stopped short by the ball joint at large angles moves the hole slightly further from the edge, which still leaves it inside the pipe.
