# Design

## Context

The page is `index.html` with one 32rem column of unstyled controls, styled by 51 lines of `src/style.css`. `src/main.ts` finds every element by id (`#form`, `#preview`, `#status`, `#displaced`, `#mass`, `#lift`, `#step`, `#stl`) or by form field name, and appends each error message as a `small.error` inside the input's `<label>`. `src/preview.ts` creates an opaque three.js canvas inside `#preview`, sizes it with a `ResizeObserver`, wires `#reset-view` by id, and writes "3D preview unavailable in this browser." into `#preview` when WebGL fails. This change starts from the form after `wall-angle-dropdowns`: diameter and length are number inputs; wall, mount type, mount angle and filament are selects.

A mockup of this design, with the real default pontoon mesh and switchable ready, invalid and generating states, is published at https://claude.ai/artifact/FSEUFD6A4bH485kQx9ASZc. This document is the contract; the mockup illustrates it.

Users are middle-school students on the ExoAquanauts team, on school laptops at the bench and phones on the pool deck. The page has one job: pick a pontoon, read its net lift, download the file.

## Goals / Non-Goals

**Goals:**
- One memorable element, the preview set in a pool, with everything around it quiet.
- The layouts in `specs/pontoon-generator-page/spec.md`, with no change to `src/main.ts`.

**Non-Goals:**
- Dark mode. One light theme; the pool backdrop is the identity.
- Animation. Nothing on the page moves except the model under the user's drag.
- Colouring negative net lift or any other new readout behaviour.
- Self-hosted fonts or any new npm dependency.

## Decisions

### Direction: the competition pool

SeaPerch is judged in a pool, so the page borrows from one: light aqua tile with grout lines behind the model, and depth markers (dark numerals on white tile at the pool edge) for the readout. The model is printed-filament yellow, like a buoy, so it stands out against the water.

Considered and rejected: an ocean look with deep-blue gradients and wave shapes, the default for anything underwater, and a blueprint look, the default for anything engineered. Both would fit any marine or CAD tool; the pool tile fits only this one.

### Tokens

Colours, defined once on `:root` in `src/style.css`:

| Token | Hex | Use |
|---|---|---|
| `--deck` | `#EEF3F2` | Page background, like pool-deck concrete |
| `--lane` | `#123E5A` | Text, input borders (mixed 60% with white), focus ring |
| `--tile` | `#BFE7EF` | Preview backdrop |
| `--grout` | `#9DD6E3` | Grout lines in the backdrop |
| `--float` | `#FFB000` | Model colour in `preview.ts`, download buttons |
| `--alarm` | `#C2272D` | Error text and the invalid input's border |

Readout tiles and inputs are white. Every text colour on its background meets WCAG AA: `--lane` is 6.2:1 on `--float` and 8.5:1 on `--tile`, `--alarm` is 5.2:1 on `--deck`, and the mixed input border is 3.6:1 on white.

Type, on a 1.25 modular scale from a 16px base:

| Role | Face | Size / weight |
|---|---|---|
| Title | Big Shoulders | 2.441rem / 800 |
| Readout values | Big Shoulders | 1.953rem / 700; net lift 3.052rem |
| Labels, field names, readout names | Atkinson Hyperlegible Next | 0.875rem / 600 |
| Error messages | Atkinson Hyperlegible Next | 0.875rem / 400 |
| Inputs, buttons, status | Atkinson Hyperlegible Next | 1rem / 400; buttons 600 |

Big Shoulders is a condensed gothic like the stencilled numerals on pool walls; Atkinson Hyperlegible Next was drawn for legibility, which suits students reading numbers on a bright deck. Both load in one Google Fonts `<link>` with `display=swap`, with `"Arial Narrow", sans-serif` and `system-ui, sans-serif` behind them. Sentence case throughout; no all-caps labels.

Shape: controls and buttons have a 6px radius, the pool panel 10px, readout tiles 4px. No shadows and no gradients other than the grout lines.

### Layout

Wide (56rem and up): a two-column grid filling the viewport height. The left column (22rem) holds the title and the form, its fields in two columns. The right column holds the pool panel, which takes all the height left over, and under it the result strip: three depth-marker tiles and the two download buttons.

```
┌───────────────────────────┬──────────────────────────────────────────┐
│ SeaPerch                  │ Generating…                   [Reset view]│
│ Pontoon Generator         │ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│                           │ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│ Outer diameter  Length    │ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│ [32       ]     [180    ] │ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│ Wall thickness  Mount type│ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│ [1.2      ▾]    [Inside ▾]│ ┼──┼──┼──┼──┼──┼──┼─ ▐▌ ──┼──┼──┼──┼──┼── │
│ Mount angle     Filament  │ ┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼── │
│ [0°       ▾]    [ASA/ABS▾]├──────────────────────────────────────────┤
│                           │ 135.0 mL │ 25.7 g │ 109.3 g │ STEP │ STL  │
│                           │ Displaced│ Mass   │ Net lift│      │      │
└───────────────────────────┴──────────────────────────────────────────┘
```

Narrow (below 56rem): one column in DOM order, so tab order matches what the user sees: title, form, pool panel (square, full column width), result strip. The form keeps its two columns at every width. In the result strip the tiles wrap with a 6rem minimum width, so on a 360px phone displaced volume and mass share a row and net lift takes the next row whole; the download buttons sit side by side under them. On wide screens the two buttons stack in a column at the end of the strip.

Content is left-aligned. Readout tiles centre their value over their name, as a depth marker does.

### Markup

`index.html` gains a font `<link>` and two groupings, and keeps every id and name:

- `.pool` wraps `#preview`, `#status` and `#reset-view`. It carries the tile backdrop. `#preview` fills the panel; the status line sits top-left on a `--deck` chip, `Reset view` top-right.
- In the result `<section>`, each `<dt>`/`<dd>` pair sits in its own `<div>` inside the `<dl>` (valid HTML), laid out with `flex-direction: column-reverse` so the value shows above its name. The section's `<p id="status">` moves into `.pool`.

The backdrop lives on `.pool`, not `#preview`, because `preview.ts` replaces the content of `#preview` with the fallback text when WebGL is unavailable; the text then sits on the tile like any status.

### Preview

Two edits in `src/preview.ts`: create the renderer with `alpha: true`, which clears to transparent so the backdrop shows through, and set the material to `0xffb000`. Lighting, framing and controls stay as they are.

## Risks / Trade-offs

- [Google Fonts unreachable, for example on a filtered school network] → The fallback stacks render the page in system fonts; layout and behaviour are unchanged.
- [Long error messages, such as the minimum body length, widen a form cell] → Errors wrap within their cell; the fit-on-a-laptop scenario is checked with default, valid inputs.
- [`wall-angle-dropdowns` is not merged yet] → Task 1.1 checks the form before any edit and stops if the selects are missing.

## Migration Plan

Merging to `main` deploys the new page; rolling back is the existing Worker rollback in the README.
