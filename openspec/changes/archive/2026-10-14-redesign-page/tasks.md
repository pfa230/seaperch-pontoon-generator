# Tasks

## 1. Markup and fonts

- [x] 1.1 Confirm `index.html` has selects named `wall` and `angle` and a "Length (mm)" label, from the merged `wall-angle-dropdowns` change. If not, stop and report that the change must merge first
- [x] 1.2 In `index.html`, add a Google Fonts stylesheet link for Atkinson Hyperlegible Next (400, 600) and Big Shoulders (700, 800) with `display=swap`; wrap `#preview`, `#status` and `#reset-view` in a `div.pool`, moving `#status` out of the result section; wrap each `<dt>`/`<dd>` pair in its own `<div>`. Keep every id, field name and label text. Verify `curl -s` of the stylesheet URL returns `@font-face` rules for both families, and `npm test` passes

## 2. Styles and preview

- [x] 2.1 Rewrite `src/style.css` to the tokens, type scale, shapes and layouts in design.md: the six colour tokens on `:root`, the 56rem breakpoint between the two layouts, the tile backdrop on `.pool`, depth-marker readout tiles with net lift largest, styled inputs, selects, errors and buttons, and a 3px `--lane` focus outline on every input, select and button. Verify in the dev server that at 1280 × 650 every input, the preview, "Reset view", the readout and both downloads show without scrolling, and that at 360 px wide the page does not scroll sideways
- [x] 2.2 In `src/preview.ts`, create the renderer with `alpha: true` and set the material colour to `0xffb000`. Verify in the dev server that the yellow pontoon stands out against the tile backdrop at the default diameter and at 24 mm, and that rotate, zoom and "Reset view" still work

## 3. Integration checks

- [x] 3.1 In the dev server, verify: Tab from the top of the page shows a focus ring on each input, select and enabled button in turn; length 30 mm shows its error in red under the field with both downloads disabled; with WebGL disabled the unavailable message shows on the tile backdrop and both downloads still work
- [x] 3.2 Run `npm test`, `npm run build` and `openspec validate --all --strict --no-interactive`; verify all three succeed
