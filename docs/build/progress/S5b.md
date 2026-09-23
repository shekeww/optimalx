# S5b: owner review round, 2026-09-23 late night — the card's add-to-cart control, progress

Batch: the two numbered items in the brief (the global secondary button
reverted to angled on the card; the mobile action row rearranged so the add
button joins the quantity stepper and buy-now gets its own full-width row),
plus a coordinator addendum that arrived mid-task adding three more owner
items on the same card (the description excerpt restored under the spec
line; the riyal glyph 10% larger; the plate's colour-dot preview shifted and
lightened). Read in full first: `docs/build/progress/S3e.md` (the card as it
shipped an hour earlier), `docs/build/progress/S3a.md`,
`docs/build/X-IDENTITY-2026-09-22.md` §2–3, `_primitives.scss`,
`OxProductCard.tsx`, `BuyZone/BuyActions.tsx`, `_b4-listing.scss` section 12,
`_b3-product.scss` card rules, `scripts/check-identity.mjs`,
`tests/product/OxProductCard.test.tsx`.

---

## 1. Files

| File | Change |
|---|---|
| `app/styles/06-ox/_b4-listing.scss` (section 12 only) | add button reverted to the global secondary face's own angled shape at every state (upgraded, un-upgraded, mobile icon-only); the mobile `48px 1fr`/`qty qty`/`add buy` grid replaced with `64px 1fr`/`add qty`/`buy buy`; the mobile `ox-x-corner` corner-cut fallback on buy-now removed (buy-now's base full-parallelogram rule now covers mobile too, since it owns the whole row again); the two `@container oxcard` narrow-rail tiers (768+) explicitly kept straight (`clip-path: none`, both `dir`s) since they sit well under X-IDENTITY §2.4's `run / 0.24` floor; the swatch preview column shifted 2px toward the physical left in both languages and its two rings lightened |
| `app/styles/06-ox/_b3-product.scss` (card rules only) | new `.ox-card-product__excerpt` rule (coordinator addendum) |
| `app/components/product/OxProductCard.tsx` | second meta line wired in (`descriptionExcerpt`); top-of-file doc comment updated for both meta lines |
| `app/components/product/lib/cardSpec.ts` | `cardSpecLine` now prepends `product.category?.name`; new `descriptionExcerpt()`, `paragraphTexts()`, `firstSentence()` (coordinator addendum) |
| `app/components/common/Price.tsx` | the SAR glyph now carries an inline `font-size: 1.1em` (coordinator addendum) |
| `tests/product/OxProductCard.test.tsx` | `.ox-card-product__excerpt` added to the fixed-height-rows list; four new tests (category prefix, excerpt-from-second-paragraph, excerpt-from-a-non-spec first paragraph, excerpt reserved-and-empty) |
| `tests/common/primitives.test.tsx` | one new assertion on the SAR glyph's inline `font-size` |
| `docs/build/progress/S5b.md` | this file |

Not edited, checked and confirmed unnecessary:
- `app/styles/06-ox/_primitives.scss` — `.ox-btn--secondary`/`ox-secondary-face`/`ox-angled` already form the one global definition the brief asks for; the card's add button was the only place that had drifted from it (in `_b4-listing.scss`, S3e's own "owner override, section 12 preamble").
- `app/components/product/BuyZone/BuyActions.tsx` and the PDP add button's own CSS (`_b3-product.scss`, `.sticky-product-bar salla-add-product-button .s-button-element`) — read and confirmed the PDP add button never lost its angled shape (`@include ox-angled(52px)` is still there, both states), so the brief's conditional edit ("only if the PDP add button lost the secondary shape too") does not apply.

---

## 2. Item 1: the card's add button, reverted to angled

**Root cause.** S3e's own "owner override, section 12 preamble" gave the add
button (upgraded `.s-button-element`, the un-upgraded host fallback, and the
old 48px mobile tier) a plain `border-radius: var(--ox-r-2)` in place of
`ox-angled(40px)`/`ox-angled(44px)`, plus a redundant local `&::before` block
that restated `border-radius: inherit` over the mixin's own
`clip-path: inherit`. That is the "rounded rectangle" the owner is calling
odd against the rest of the identity.

**Fix.** Every one of those selectors now carries `@include ox-angled($h)`
again (40px on desktop/un-upgraded, 44px on the new mobile icon-only tier),
and the redundant local `&::before` blocks are deleted — `ox-secondary-face`
already emits the correct `clip-path: inherit` fill pseudo, which is exactly
what the hero's own "اسأل قبل أن تشتري" (`.ox-btn--secondary` + a sized
`.ox-btn--s44`) already draws. Verified live: the compiled stylesheet's
`.ox-card-product__add .s-button-element` rule now reads
`clip-path: polygon(27px 0, 100% 0, calc(100% - 27px) 100%, 0 100%)` (run
27.0, `ox-run(40px)`), with the `[dir='ltr']` mirror alongside it.

**The card's two angled primitives, and `check-identity`.** The card now
carries buy-now's filled parallelogram AND the add button's outlined one —
an explicit owner override of X-IDENTITY §3.3 ("one angled gesture per
component") for this card, recorded here per the brief. `node
scripts/check-identity.mjs` was run after the change and reports **0
problems**, so **no `ox-allow` pragma was needed**: `one-angled-per-block`
only inspects a single selector's own declarations for more than one *kind*
of angled construction mixed together (its own doc comment: "two `ox-angled()`
calls in sibling *modifier* selectors... are not what this rule is for... it
counts kinds within one selector's own body, not selectors across a BEM
family"), and the add button and buy-now are two different selectors, each
carrying exactly one `ox-angled()` call. The override is real and is written
down here anyway, since the brief asks for that regardless of whether the
linter itself objects.

**The two narrow-rail container tiers (768px and up, `@container oxcard
(max-width: 240px|139px)`), a side effect flagged and fixed.** These are
unrelated to the mobile row (they only ever apply on a desktop viewport with
a narrow card, e.g. a related-products rail) and were not named in the
brief, but reverting the shared selectors to `ox-angled(40px)` reactivated
their clip-path too, at 44px and 40px wide against the same 27px run — a
17px and 13px constant core, respectively, both further under X-IDENTITY
§2.4's `run / 0.24` floor than even the new mobile icon button is. Left
alone, the already-shipped 20px glyph at these tiers would clip against the
slant. Fixed by explicitly cancelling the clip (`clip-path: none`, plus a
`[dir='ltr'] &` twin — the mixin's own LTR mirror carries an extra attribute
selector, which outranks a plain same-specificity override regardless of
source order) on both tiers, keeping them exactly as straight as they were
before this batch. This is the direct, necessary consequence of item 1's own
revert and is recorded here as a deviation from "surgical, only what the
plan asked for," because leaving it unfixed would have shipped a visible
clipping regression nobody asked for.

---

## 3. Item 2: the mobile action row, rearranged

**New arrangement, below 768:**
- Row A: the icon-only add button (angled, same shape as desktop, 64px wide
  × 44px tall) at the reading start, then the quantity stepper filling the
  rest of the row.
- Row B: buy-now, full width, the filled parallelogram, unchanged from
  desktop.

`grid-template-columns: 64px 1fr; grid-template-areas: 'add qty' 'buy buy';`
replaces the coordinator's own hour-old `48px 1fr` / `'qty qty' 'add buy'`.
Buy-now needed **no mobile override at all** any more: its base,
always-applied rule (`calc(100% - 16px)`, the 8px corner clearance,
`ox-angled(44px)`) already does exactly what row B now needs, because
buy-now owns the whole row again instead of sharing an 81px cell with the
add button — the entire reason the earlier `ox-x-corner` corner-cut existed.
That whole block (and its long explanatory comment) is deleted, not merely
edited.

**The icon-only add button, 64×44, measured.** `ox-run(44px)` = 29.7px.
X-IDENTITY §2.1's own construction (two parallel 34° edges shifted by the
run, not a taper) means the shape's cross-section width is constant at every
height: `64 − 29.7 = 34.3px`. That core is centred at `(93.7 −
59.4·y/44)/2` for a point at height `y` (0 at top), so the safe window
shifts from a centre of 46.85 at the top to 17.15 at the bottom.

- **The glyph, 18px** (kept at its base size, not grown to 20px): its own
  vertical extent is `y ∈ [13, 31]`. At `y=13` the safe range is
  `[20.9, 55.2]` against the glyph's own `[23, 41]` box (2.1px clear each
  side); at `y=31` it is `[8.8, 42.4]` against `[23, 41]` (0.6px / 1.4px
  clear). **Margins of 0.6–6.2px at every height, never negative — it
  clears the slant, computed, not assumed.**
- The same arithmetic at 20px (the size the old 48px tier used) gives
  margins as low as **0.4px** at the two extreme corners — kept at 18px
  instead, deliberately, for this reason.
- **64px sits under X-IDENTITY §2.4's own 123.75px `run / 0.24` floor**,
  which governs a *labelled* control losing its parallelogram below that
  width. This control carries no label, only a centred glyph, and the owner
  named this exact width in the brief ("about 64px wide... so the
  parallelogram's run still reads") — implemented as instructed and flagged
  here per "read back and compare," the same way S3a flagged an
  accessibility tension it was told to ship anyway.

**The quantity stepper, and a real fit problem found and partly fixed.**
Filling the rest of row A meant overriding the stepper's own fixed 96px
width (`inline-size: auto`, `flex: 1 1 auto`, matching the grid's own default
stretch). Measuring what the stepper's own **pre-existing** minimum content
needs against what row A actually has at each of the three required widths
turned up a real shortfall this batch did not invent but also could not
leave unaddressed:

| Content width | Row A gap | Add cell | Qty available | Qty minimum (18+18+22) | Spare |
|---|---|---|---|---|---|
| 390 (137px) | 4px (`--ox-1`) | 64px | 69px | 58px | **+11px** |
| 360 (124px) | 4px | 64px | 56px | 58px | **−2px** |
| 320 (104px) | 4px | 64px | 36px | 58px | **−22px** |

The row's own `column-gap` was brought down from `--ox-2` (8px) to `--ox-1`
(4px) — row-gap between row A and row B is untouched — and the stepper's own
buttons shrink to 18px (this file's own narrowest container-query tier
already ships that exact value; `ox-hit-area` keeps the tap target at 44px
regardless of the painted size, so nothing is lost there). That closes the
gap at **390**, the width CARD-2026-09-23 itself measures against and the
one this task's own brief asks for. **360 and 320 are still short — 2px and
22px respectively — because the value cell's own 22px floor and the button's
own 18px floor are both pre-existing minimums this batch did not set and was
not asked to redesign.** Flagged rather than silently shipped or silently
"fixed" by shrinking a value floor another builder chose: narrowing the 64px
add cell further, or the stepper's own floor, needs an owner call, the same
way S3a flagged a similarly tight 320px case on the old mechanism rather
than assume it away.

**Skeleton (section 6, `ProductCardSkeleton`/`LoadMore`).** Checked, not
changed: `ProductCardSkeleton` (`app/components/listing/ProductGrid.tsx`) is
a flat flex column of generic bars and two 44px `SkeletonBlock`s, not a
grid — it never encoded which control sits in which row at any breakpoint,
before or after this batch, so the row swap changes nothing it needs to
reserve (still two 44px blocks, same total height). The coordinator's own
new excerpt line is a separate finding, below.

---

## 4. The coordinator's addendum

### 4.1 The description excerpt, restored

**What changed and why.** S3e's own CARD-2026-09-23 rebuild replaced the
merchant's free-text pitch (`product.subtitle`, one line, ellipsised) with
the parsed spec line (servings, pack size). The owner's complaint: the card
now shows only a fact fragment ("20 حصة") where a shopper used to see real,
conversion-relevant prose. The fix keeps the fact line **and** restores a
second line under it, both real, both off fields the API actually carries:

- **Line 1** (`cardSpecLine`, extended): the product's own root category
  name (`product.category?.name` — the same field `ProductPage.tsx` already
  reads for the PDP's breadcrumb/FAQ gates), then the existing
  servings/pack-size facts, joined by the theme's own divider. Category
  first, since it is "the product type" the addendum asks for; the facts
  follow exactly as before. **Not observed live on this catalogue**: `curl`
  against `/ar/protein/c9001` shows every card's line 1 as the fact alone
  ("28 حصة", "16 حصة", …) with no category prefix — the listing payload this
  route serves does not carry `product.category` on any of these products.
  This is a data-availability fact, not a code defect: `cardSpecLine` reads
  the field exactly where the rest of the codebase already reads it, and
  prints it the moment the catalogue supplies it. Nothing is invented in its
  place.
- **Line 2** (`descriptionExcerpt`, new): the first sentence of the
  description's own prose paragraph — the paragraph AFTER the spec line when
  the first paragraph actually parses as one (`parseSpecLineText`), or the
  first paragraph directly when it does not. "First sentence" is found by
  scanning for the first `.`/`؟`/`!` (no regular expressions, matching
  `specLine.ts`'s and `sanitizeHtml.ts`'s own convention) and cutting there;
  the whole trimmed paragraph when none of those appear. `-webkit-line-clamp:
  2` is the visual safety net for a sentence that still runs long. Verified
  live: `/ar/protein/c9001` renders real excerpts, e.g. "ترو ماس من بي اس ان
  بودرة غنية بالسعرات بنسبة كربوهيدرات إلى بروتين تقارب 2 إلى 1، مع مزيج
  بروتينات متعدد المصادر يحتوي على 46 جم بروتين و700 سعرة في الحصة." — a real
  first sentence, not the spec line's own label/value pairs and not a
  second, unrelated sentence.
- **Reserved, not collapsed, when absent**: `.ox-card-product__excerpt`
  carries `min-block-size: 36px` (2 lines at 13/18) and is always rendered,
  matching `.ox-card-product__chips`'s own always-reserved treatment rather
  than the rating/brand rows' "not reserved when absent" pattern — a call
  made because the restored line is a direct descendant of the OLD pitch
  line, which was set on all 47 products and always rendered.

### 4.2 The riyal glyph, 10% larger

`Price.tsx`'s `<i className="sicon-sar">` now carries an inline
`style={{ fontSize: '1.1em' }}` (a named constant, `SAR_GLYPH_SCALE`). An
inline style was used rather than a `_primitives.scss` edit because the
mixin's own `.ox-price__mark .sicon-sar { font-size: inherit }` lives in
section 8 of that file, outside this batch's "button rules only" scope for
`_primitives.scss`; an inline style always outranks an external stylesheet
rule regardless of that rule's own specificity, so this reaches the glyph
correctly without touching a file another builder owns. Only the glyph
scales — the digits, the sr-only text and the shared baseline are untouched,
since font-size on an inline icon-font glyph scales around its own baseline
with no vertical-align correction needed. Verified live: every `sicon-sar`
on `/ar/protein/c9001` (five cards checked) and `/en/protein/c9001` both
carry `style="font-size:1.1em"`.

### 4.3 The plate's colour-dot preview, shifted and lightened

**Shift.** `inset-inline-end: 0` (the row's own resting position, physical
left in RTL, physical right in LTR — an existing asymmetry between the two
languages) becomes `inset-inline-end: -2px`, with a `[dir='ltr'] &` override
now pinning the SAME physical corner (`inset-inline-start: -2px`) in
English. **-2px is the full safe budget, not the ~4px `--ox-1` "one gap" the
ask named**: the selected dot's own ring needs exactly 4px of clearance (2px
outline + 2px offset) from the plate's own `overflow: hidden` edge; the
row's existing 6px `padding-inline` already gives it 4px of that, leaving
exactly 2px of margin S3a deliberately built in. Shifting the full 4px
(reading "one gap" literally) would clip 2px off the selected ring on every
card whose default colour swatch renders — the same defect S3a's own item 3
fixed an hour earlier. Flagged and the smaller, safe number shipped instead,
rather than silently reintroducing a known bug.

**Colour.** The dot's own fill (`background: var(--ox-swatch, ...)`, the
product's real hex) is untouched, exactly as asked. The unselected ring
(previously a plain `border: 1px solid var(--ox-bd-2)`) is now `border: 1px
solid color-mix(in srgb, var(--ox-line-3) 50%, transparent)`; the selected
ring's `outline-color` moves from `--ox-accent` to `--ox-accent-light`.
Verified live in the compiled stylesheet, both rules present exactly as
written.

---

## 5. Verification

- `pnpm typecheck` → `tsc --noEmit`, **0 errors**.
- `pnpm vitest run tests/product tests/common` → **21 files, 299 tests
  passed** (`OxProductCard.test.tsx` 38/38, up from 34, with the four new
  tests for the category prefix and the excerpt; `primitives.test.tsx`
  14/14, with the new glyph-scale assertion).
- `pnpm check:rtl` → `327 file(s), 0 problem(s)`.
- `pnpm check:motion` → `327 file(s), 0 problem(s)`.
- `pnpm check:strings` → `322 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 322 file(s)
  scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `327 file(s), 0 problem(s)` — confirms
  no `one-angled-per-block`/`small-angle`/`focus-clipped` finding from the
  card's two angled primitives or the new mobile icon button; no pragma was
  needed (§2 above explains why).
- `npx sass --no-source-map app/styles/app.scss` (direct compile, no
  framework in the loop) → exit 0, only the pre-existing `@import`
  deprecation notices.
- Live preview, `http://localhost:3210` (came up after one 20-second retry,
  per the task's own instruction — not started or stopped by this session):
  - `curl -s --compressed "http://localhost:3210/ar/protein/c9001"` → 200;
    `.ox-card-product__excerpt` present on every card with real sentence
    text; every `sicon-sar` carries `style="font-size:1.1em"`.
  - `curl -s --compressed "http://localhost:3210/en/protein/c9001"` → 200;
    same excerpt/glyph behaviour, confirming the English mirror.
  - The compiled stylesheet (`/@tanstack-start/styles.css?routes=…`) fetched
    and grepped directly: `.ox-card-product__add .s-button-element` carries
    `clip-path: polygon(27px 0, 100% 0, calc(100% - 27px) 100%, 0 100%)`
    (run 27.0, `ox-angled(40px)`) with its `[dir='ltr']` mirror; the mobile
    `@media (max-width: 767px)` block carries
    `grid-template-areas: "add qty" "buy buy"`, `column-gap: var(--ox-1)`,
    `.ox-card-product__qty-btn{inline-size:18px}`, and the add button's own
    `clip-path: polygon(29.7px 0, 100% 0, calc(100% - 29.7px) 100%, 0 100%)`
    (run 29.7, `ox-angled(44px)`); `.ox-card-product__buy` carries no
    mobile-specific rule at all any more, only the base
    `calc(100% - 16px)`/`ox-angled(44px)` rule, confirmed present and
    unduplicated; the two `@container oxcard` tiers both carry
    `clip-path: none` (plain and `[dir='ltr']`); `.ox-card-product__swatches`
    carries `inset-inline-end: -2px` with its `[dir='ltr']` twin, and
    `.ox-card-product__swatch`'s border/outline read the lightened tokens;
    `.ox-card-product__excerpt` carries `-webkit-line-clamp: 2` and
    `min-block-size: 36px`.

## 6. Deviations, summarised

- **The two narrow-rail container tiers** (§2) needed an unplanned fix
  (`clip-path: none`) as a direct consequence of item 1's revert — not
  requested in the brief, but left broken it would have shipped a real
  clipping regression.
- **The mobile stepper is still short at 360 and 320** (§3) even after the
  column-gap and button-size fixes this batch made; 390 and up (the widths
  this task itself was asked to verify) fit with margin. Flagged for an
  owner call rather than resolved by shrinking a floor another builder set.
- **The icon-only add button's 64px width and the owner's own "about one
  gap" wording for the swatch shift** are both implemented at the literal
  numbers the respective asks named or the closest safe equivalent, each
  with the arithmetic shown rather than assumed comfortable, per this
  file's own established practice (S3a/S3e).
- **`product.category` is not present in this catalogue's listing payload**,
  so the new category-name prefix is code-complete and tested but not yet
  visible on any live card — a data fact, not a defect, recorded per "read
  back and compare."
