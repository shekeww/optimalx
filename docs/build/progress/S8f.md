# S8f — per-file attribute honouring + rounded product-category corners

Builder S8f, 2026-09-24. Two owner items on the icon set, both inside
`scripts/import-owner-icons.mjs` (docs/build/progress/S8b.md's generator):

1. honour a source file's own `viewBox`/`stroke-width`/`stroke-linecap`/
   `stroke-linejoin`/`overflow` instead of discarding them for the shell
   default — the immediate case being `goal-ideal-weight`'s override
   (`app/assets/icon-overrides/goal-ideal-weight.svg`), which lost its
   viewBox, 2.3 stroke and round caps when the generator only ever kept the
   owner's child elements, never the root's attributes;
2. round the corners (`stroke-linejoin="round"`, caps stay square) on the
   ten product-category symbols, per the owner's 2026-09-24 note.

Progress logged after every step below.

---

## Step 1 — read the brief's cited files

Read `docs/build/progress/S8b.md`, `scripts/import-owner-icons.mjs`,
`app/assets/icon-overrides/goal-ideal-weight.svg`,
`tests/common/sprite.test.ts`, `tests/scripts/import-owner-icons.test.ts`,
`app/components/common/Icon.tsx`, `optimal-x-icons/icons.json`, three owner
category source files (`protein.svg`, `creatine.svg`, `amino-acids.svg` —
confirmed none carry anything other than the shell's own defaults:
`viewBox="0 0 24 24" stroke-width="2" stroke-linecap="square"
stroke-linejoin="miter"`, so item 1's per-file mechanism is a no-op for them
and item 2 needs its own, separate override path that wins even though the
source already spells out `stroke-linejoin="miter"` itself), the current
sprite's `ox-goal-ideal-weight` and `ox-protein` symbols, `gen-icon-mask.mjs`
(confirmed unaffected: it reads the symbol body's `<path>`/`<circle>`/`<rect>`
elements only, hardcodes its own mask stroke, never reads the symbol's own
`stroke-width`/linecap/linejoin), and `docs/build/ICONS-2026-09-24.md`.

## Step 2 — generator changes

`scripts/import-owner-icons.mjs`:

- Added `ownerSvgRootAttrs(source)`: reads the source `<svg>` root's opening
  tag for exactly the five overridable names (`viewBox`, `stroke-width`,
  `stroke-linecap`, `stroke-linejoin`, `overflow`) and returns only the ones
  present — nothing else on the root (e.g. `width`, `height`, `fill`,
  `stroke`, `xmlns`) is read.
- Added `CATEGORY_ATTRS` — `{ 'product-categories': { 'stroke-linejoin':
  'round' } }` — the owner's per-category ruling, keyed off the manifest's
  own `category` field so nothing here has to list the ten names by hand.
- `renderOwnerSymbol(id, svgSource, mirror, categoryAttrs = {})` now builds
  its opening attributes as `{ ...SHELL_DEFAULTS, ...ownerSvgRootAttrs(svgSource),
  ...categoryAttrs }` — shell default, then the source's own attribute (item
  1) if it declares one, then the category override (item 2) last, so the
  category ruling wins even where the source also spells out the default
  `stroke-linejoin="miter"` itself. `class`, `fill`, `stroke` and
  `stroke-miterlimit` are never in this merge — always the shell's.
  `overflow` is appended to the symbol's opening tag only when present (no
  shell default for it, so it is absent everywhere except the override).
- `generate()` passes `CATEGORY_ATTRS[icon.category]` (`undefined` for every
  non-`product-categories` icon, which the function's own default parameter
  turns into `{}`) for both the 47 owner symbols and the 4 aliases.

Deliberately unchanged: `ownerSvgInner`, `convertAccentStyles`,
`selfCloseEmptyTags`, the carry-forward/idempotency mechanics, `ALIASES`.
Nothing here touches path data — verified by grepping the regenerated
sprite's ten category `<path d="…">` strings against the pre-change file
(step 4 below).

## Step 3 — test changes

`tests/scripts/import-owner-icons.test.ts`: added three unit tests —
`ownerSvgRootAttrs` reads only the five named attributes when present and
returns `{}`-shaped partials when absent; `renderOwnerSymbol` carries a
source's own viewBox/stroke-width/caps/joins/overflow onto the symbol in
place of the shell defaults; `renderOwnerSymbol`'s `categoryAttrs` argument
wins over both the shell default and the source's own value for the
attributes it names. Existing `renderOwnerSymbol` test (shell defaults, no
override in the source) unchanged and still passing — its fixture declares
only `viewBox="0 0 24 24"`, which equals the default, so the merge is a
no-op for it.

`tests/common/sprite.test.ts`: the four universal per-symbol assertions that
the owner's 2026-09-24 rulings now legitimately violate for some symbols were
rescoped from "every drawn symbol" to "every non-owner-exempt symbol"
(`nonOwnerDrawn`, already defined in the file for the drawing-language
assertions) — the owner-exempt set (47 + 4 aliases) is where a per-file or
per-category override is allowed to land:

- `stroke-width`: split out of "sets the stroke contract" into its own test,
  scoped to `nonOwnerDrawn` (the universal test keeps checking
  `fill`/`stroke`/`stroke-miterlimit`/`class="ox-sym"` on every drawn symbol,
  since those four are never in the override merge).
- linecap/linejoin "square"/"miter": rescoped to `nonOwnerDrawn`.
- `viewBox="0 0 24 24"`: rescoped to symbols outside `OWNER_EXEMPT`.
- "no rounded linecap, linejoin ... anywhere in the file": was a raw regex
  over the whole `SOURCE` string, which would now false-positive on every
  intentional round join. Rewritten to walk `SYMBOLS` and flag a `round`
  linecap/linejoin only on a symbol outside `OWNER_EXEMPT`; the "no bevel
  anywhere" half is untouched (nothing uses bevel).

Two new dedicated tests added: `ox-goal-ideal-weight` carries
`viewBox="1 1 22 22" stroke-width="2.3" stroke-linecap="round"
stroke-linejoin="round"`; every product-category symbol (derived from the
manifest's own `category` field, not hardcoded) carries
`stroke-linejoin="round"` **and** `stroke-linecap="square"` — proving caps
were left alone.

## Step 4 — regenerate and verify path data is untouched

```
$ node scripts/import-owner-icons.mjs
import-owner-icons: wrote app\assets\ox-sprite.svg (33721 bytes)
```

(+455 bytes over the committed 33266 — the new header-comment paragraph
documenting the two rulings (~340 bytes), one `viewBox`/`stroke-width`/
`overflow` swap on `ox-goal-ideal-weight`, ten `stroke-linejoin="round"`
swaps on the categories. `git diff --stat app/assets/ox-sprite.svg`: 17
insertions, 11 deletions — the header paragraph plus the 11 changed
`<symbol>` opening tags (10 categories + ideal-weight); every `<path>`/
`<circle>`/`<rect>`/`<g transform>` line in the diff is unchanged except for
its opening `<symbol …>` tag, confirmed by reading the full diff.)

`ox-goal-ideal-weight`'s symbol tag, before vs. after:

```
before: <symbol id="ox-goal-ideal-weight" viewBox="0 0 24 24" class="ox-sym" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4">
after:  <symbol id="ox-goal-ideal-weight" viewBox="1 1 22 22" class="ox-sym" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" overflow="visible">
```

Body (the four `<path>` `d` strings) byte-identical before and after —
confirmed by diffing the symbol's inner markup, only the opening tag's
attributes changed.

`ox-protein`'s symbol tag, before vs. after:

```
before: ... stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4">
after:  ... stroke-linecap="square" stroke-linejoin="round" stroke-miterlimit="4">
```

`d="M8 3h8v4H8zM5 7h14v14H5z"` and the accent path unchanged — confirmed for
all ten category ids (`protein`, `creatine`, `pre-workout`, `amino-acids`,
`omega-3`, `vitamins-minerals`, `collagen-beauty`, `daily-health`,
`snacks-bars`, `accessories`): only `stroke-linejoin` flips `miter` → `round`;
`stroke-linecap` stays `square` on every one; no `d`, `cx`/`cy`/`r`, or `rx`
value differs from the pre-change file.

## Step 5 — the kitchen sink / visual size question

```
$ curl -s -o /dev/null -w "http=%{http_code}\n" http://localhost:3210/ar/kitchen-sink
http=200
```

Downloaded the page and confirmed it is serving the freshly regenerated
sprite (not a stale inline cache): `id="ox-goal-ideal-weight" viewBox="1 1
22 22" ... overflow="visible"` and `id="ox-protein" ... stroke-linejoin=
"round"` are both present in the served HTML's inlined `<symbol>` defs.

**The size question.** Icon.tsx's outer `<svg viewBox="0 0 24 24">` never
changes; only the `<use>`'s referenced `<symbol>`'s own `viewBox` does. A
`<use>` of a `<symbol>` with no explicit width/height (ours never sets one)
gets a generated instance sized to the *referencing* viewport's user units
(24, from the outer svg) — the symbol's own viewBox then maps its unit range
onto that fixed 24-unit box. For the standard 24-unit symbols that mapping
is 1:1; for `goal-ideal-weight`'s 22-unit viewBox it is a uniform 24/22 ≈
1.0909 scale-up.

Verified directly against the live DOM rather than by eye alone: drove the
running preview with `chrome-headless-shell` (Playwright's cached binary,
`C:\Users\Ahmed\AppData\Local\ms-playwright\chromium_headless_shell-1228\...`)
over the DevTools protocol (a raw CDP WebSocket client, Node's built-in
`fetch`/`WebSocket`, no npm package installed) and read `use.getBBox()` —
the rendered content's bounding box in the outer svg's own 24-unit
coordinate system — for the real `<use href="#ox-goal-ideal-weight">` at
`ox-icon--24`, against a synthetic `<use>` of the *same four path `d`
strings* wrapped in a plain `viewBox="0 0 24 24"` symbol, injected into the
same page and measured the same way:

```
liveBBox      (viewBox="1 1 22 22"): { width: 19.636363983154297, height: 19.636363983154297 }
syntheticBBox (viewBox="0 0 24 24"): { width: 18, height: 18 }
19.636363983154297 / 18 = 1.090909... = 24/22 exactly
```

Confirms the analysis: the drawing measures **~9.1% larger** than it would
under the standard 24-unit viewBox, at every nominal size (`24`, `36`, …).
Nothing overflows the safe area either way (the artwork's own coordinates,
~3 to ~21, sit well inside `[1, 23]`), and `overflow="visible"` (now
carried onto the symbol per item 1) has no visible clipping effect here —
it would only matter if the drawing extended past the 22-unit window, which
it does not.

Per the brief, **not compensated for**: the owner's override file ships with
its own viewBox as given, no rescale and no redraw. Documented here and in
`docs/build/ICONS-2026-09-24.md`'s new S8f note for the owner to judge
against the 24-grid siblings it sits next to in the kitchen sink and in
`OX_BRAND_ICON_NAMES`'s goals row.

## Step 6 — headless render of the ten rounded categories

Preview was reachable (step 5), so rendered rather than skipped. Same
`chrome-headless-shell` binary, driven over CDP (`Page.navigate` to the
kitchen sink, `Runtime.evaluate` to find the ten category `<code>` labels
inside each of the light-ground (`#F7F8F6`) and dark-ground (`#0B0D0F`)
contact-sheet grids and union their card `getBoundingClientRect()`s,
`Page.captureScreenshot` with a `clip` over that union). Saved to
`docs/build/progress/icons/categories-rounded.png` (both grounds, one
image; each card shows the 36/32/24 row and the 20/16 row, so 36 and 24 are
both present per the brief). One layout artefact: the ten category cards
are the first ten cells of the sheet's grid and end mid-row (`accessories`
is alone in the fourth row), so the screenshot's bounding rectangle also
catches two adjacent, unrelated cards in that same row (`goal-energy`,
`goal-general-health`, clearly labelled as such) — a side effect of
rectangular cropping over a flowing grid, not a request beyond the ten. All
ten target symbols are fully visible and correctly rounded at the corners
with caps still square, on both grounds.

Headless shell processes were killed after the two captures
(`taskkill /F /IM chrome-headless-shell.exe`) — nothing left running.

## Step 7 — `gen-icon-mask.mjs` + full verification

```
$ node scripts/gen-icon-mask.mjs
gen-icon-mask: wrote --ox-cart-glyph from #ox-cart to app\styles\tokens.css

$ git diff --stat app/styles/tokens.css
(no output — byte-identical; #ox-cart is untouched by both items, so the
mask token does not change)
```

```
$ pnpm typecheck
$ tsc --noEmit
(no output — no errors)

$ pnpm vitest run tests/common tests/scripts
 Test Files  10 passed (10)
      Tests  157 passed (157)
 ✓ tests/common/sprite.test.ts (25 tests)          # was 22 before this batch
 ✓ tests/scripts/import-owner-icons.test.ts (15 tests)  # was 12 before this batch

$ node scripts/check-identity.mjs
check-identity: 331 file(s), 0 problem(s)

$ pnpm check:tokens
check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
```

---

## Files touched

| file | why |
|---|---|
| `scripts/import-owner-icons.mjs` | `ownerSvgRootAttrs` (item 1), `CATEGORY_ATTRS` (item 2), `renderOwnerSymbol`'s attribute merge, `generate()` wiring, header-comment updates |
| `app/assets/ox-sprite.svg` (generated) | regenerated: `ox-goal-ideal-weight`'s own viewBox/stroke-width/caps/joins/overflow; the ten category symbols' `stroke-linejoin="round"`; no path/circle/rect/g data changed |
| `app/styles/tokens.css` | regenerated via `gen-icon-mask.mjs`; byte-identical (`#ox-cart` untouched by either item) |
| `tests/scripts/import-owner-icons.test.ts` | three new unit tests: `ownerSvgRootAttrs`, the per-file override in `renderOwnerSymbol`, the category-attribute override |
| `tests/common/sprite.test.ts` | rescoped stroke-width/caps/joins/viewBox assertions from "every drawn symbol" to "every non-owner symbol"; rewrote the raw-regex "no rounded" test as a per-symbol check; two new dedicated tests pinning `ox-goal-ideal-weight`'s attributes and the ten category ids' rounded joins/square caps |
| `docs/build/ICONS-2026-09-24.md` | new S8f note: the two rulings, the measured size difference, pointer to the render |
| `docs/build/progress/icons/categories-rounded.png` (new) | the ten product categories, both grounds, 36/24 among the sizes shown |
| `docs/build/progress/S8f.md` | this file |

## Deviations

1. **The category-render screenshot includes two extra, clearly-labelled
   cards** (`goal-energy`, `goal-general-health`) beyond the ten requested,
   because the ten sit in an incomplete final grid row and a single
   rectangular clip over that row's height necessarily spans the full row
   width. Not a scope change — every one of the ten is fully visible and
   correctly rounded; flagged so the owner isn't confused by the extra two.
2. **The ideal-weight visual-size question was answered by a live
   `getBBox()` measurement plus a synthetic same-path comparison, not solely
   by eye in a screenshot.** The brief allowed either ("verify the rendered
   size... if a viewBox... renders the drawing larger... note the visual
   size, do not redraw"); a DOM measurement is more precise than judging a
   PNG by eye and is reproducible, so it is what is recorded above. No
   redraw or rescale was made either way, per the brief.
