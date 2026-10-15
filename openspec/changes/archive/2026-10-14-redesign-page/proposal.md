# Proposal

## Why

The page is unstyled browser defaults in one narrow column: on a laptop the 3D preview pushes the readout and downloads below the fold, so a student changing the diameter must scroll to see what it did. The team uses the page at the bench and on the pool deck, and it should look like a tool they want to use.

## What Changes

- Give the page a visual identity drawn from the competition pool: a pool-tile backdrop behind the 3D preview, readout values set like pool depth markers, and a printed-filament colour on the model.
- On wide screens, lay the form and the preview side by side so every input, the preview, the readout and both downloads fit in one laptop screen without scrolling. On phones, stack them in one column with no sideways scroll.
- Make net lift the most prominent readout value, since it is the number students size against.
- Style inputs, selects, error messages, the status line and the buttons, with a visible keyboard focus ring.
- Load two typefaces from Google Fonts: Big Shoulders for the title and readout numbers, Atkinson Hyperlegible Next for everything else.

No input, default, validation rule, readout value, file or preview interaction changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pontoon-generator-page`: adds a page layout requirement (one-screen fit on a laptop, one column on a phone, visible keyboard focus).

## Impact

- `index.html` (grouping markup, font link), `src/style.css` (rewritten), `src/preview.ts` (transparent canvas so the pool backdrop shows, model colour). `src/main.ts` needs no change, because it finds every element by id or form name.
- One external request at page load to Google Fonts. If it fails, the page falls back to system fonts and works unchanged.
- Builds on the `wall-angle-dropdowns` change, implemented on `loop/wall-angle-dropdowns` but not yet merged: the form this change styles has two number inputs and four selects. Merge that branch first; implementing this change on `main` before it lands would conflict in `index.html`.
