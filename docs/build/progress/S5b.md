# S5b: owner review round, 2026-09-23 late night — the card's add-to-cart control, progress

Batch: the two numbered items in the brief (the global secondary button
reverted to angled on the card; the mobile action row rearranged so the add
button joins the quantity stepper and buy-now gets its own full-width row),
a coordinator addendum that arrived mid-task adding three more owner items
on the same card (the description excerpt restored under the spec line; the
riyal glyph 10% larger; the plate's colour-dot preview shifted and
lightened), and a SECOND coordinator correction that arrived after that,
from an owner screenshot of the desktop 4-up grid: the mobile-only grid
built for the first item is removed outright, and the add button now fills
its slot at every width and every tier through one computed label-fit rule
instead of any fixed pixel width — see §7. Read in full first:
`docs/build/progress/S3e.md` (the card as it shipped an hour earlier),
`docs/build/progress/S3a.md`, `docs/build/X-IDENTITY-2026-09-22.md` §2–3,
`_primitives.scss`, `OxProductCard.tsx`, `BuyZone/BuyActions.tsx`,
`_b4-listing.scss` section 12, `_b3-product.scss` card rules,
`scripts/check-identity.mjs`, `tests/product/OxProductCard.test.tsx`.

---

## 1. Files

| File | Change |
|---|---|
| `app/styles/06-ox/_b4-listing.scss` (section 12 only) | add button reverted to the global secondary face's own angled shape at every state (upgraded, un-upgraded); **superseded again, §7**: the mobile-only grid this batch first built is deleted, `padding-inline` on both button states becomes `ox-run(40px)` (27px), the two `@container oxcard` tiers keep only their stepper-narrowing rules (un-gated from `min-width: 768px`), and a new single `@container oxcard (max-width: 230px)` rule is the only thing that ever hides the label, at every width; the mobile `ox-x-corner` corner-cut fallback on buy-now removed (buy-now's base full-parallelogram rule covers every width, since it owns the whole row again); the swatch preview column shifted 2px toward the physical left in both languages and its two rings lightened |
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

**Superseded within the same batch, §7**: this fixed 44px/40px width (and
its `clip-path: none` fallback) is exactly what the owner's own follow-up
screenshot caught, on the *desktop* 4-up grid — this narrow-rail tier is
what actually produced the "small square, empty row" defect, not anything
mobile-specific. §7 below removes the fixed width and the clip cancellation
from both tiers entirely, replacing them with one label-fit rule that
applies at every width.

---

## 3. Item 2: the mobile action row, rearranged

**Superseded in full by §7 below.** Everything in this section describes
what this batch built first and is kept for the record of what changed and
why at the time; the mobile-only grid it describes (`64px 1fr`) no longer
exists in the shipped code — §7 removes it outright in favour of one rule
that applies at every width, not only below 768.

**New arrangement, below 768 (as first built):**
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
  clipping regression. **Superseded by §7**, which removes the fix along
  with the fixed width it was protecting.
- **§3's own mobile stepper shortfall (360/320) is superseded by §7 too.**
  That finding was specific to the now-deleted 64px-fixed-add-cell mobile
  design; the unified system reuses the stepper's own pre-existing 56px/18px
  tier (unchanged from before this whole batch, previously reached only by a
  narrow rail card) at 390/360/320 alike. That tier carries its own small,
  pre-existing 2px shortfall (58px of minimum content — two 18px buttons
  plus the value's own 22px floor — against a 56px box) which already
  shipped for rail cards before this batch touched anything; it now also
  applies to a mobile 2-up card, a materially smaller and already-tolerated
  risk than the 22px-short case §3 originally flagged, not a new one this
  batch introduced.
- **The owner's own "about one gap" wording for the swatch shift** is
  implemented at the closest safe equivalent (2px, not 4px) with the
  arithmetic shown rather than assumed comfortable, per this file's own
  established practice (S3a/S3e). The glyph-clip margin at the narrowest of
  §7's four checkpoints (2.15px) is the same kind of flagged-not-assumed
  tightness.
- **`product.category` is not present in this catalogue's listing payload**,
  so the new category-name prefix is code-complete and tested but not yet
  visible on any live card — a data fact, not a defect, recorded per "read
  back and compare."

---

## 7. A second coordinator correction: the mobile-only grid removed entirely

The owner's own screenshot of the **desktop** 4-up grid (cards ≈300px)
showed the exact defect a fixed pixel width always produces — a small square
icon box at the reading start of the quantity row with the rest of the row
left empty — reached there through the narrow-rail `@container oxcard`
tier's own 44px width (§2 above), not through anything mobile-specific. The
owner's instruction: remove every fixed pixel width on the add button, at
every tier, and replace it with one rule — the button always fills the slot
beside the stepper, showing "أضف للسلة" plus the glyph whenever the label
fits and the glyph alone when it does not, still full width either way.

**What changed, on top of everything in §1–§6 above:**

- **The mobile-only grid (this batch's own `64px 1fr` / `'add qty' 'buy
  buy'`, built earlier in this same session) is deleted outright**, not
  edited again. `.ox-card-product__action`'s pre-existing base rule
  (`'qty add' 'buy buy'`, `auto 1fr`) is now the only grid definition at any
  width — 390 exactly as 1440. The stepper stays at the reading start
  (physical right in RTL — X-IDENTITY's own "inline-start is the right
  edge" — matching the owner's screenshot direction), the add button fills
  the `1fr` column beside it toward the reading end (physical left in RTL).
- **The two `@container oxcard` tiers (240px, 139px) keep only their
  stepper-narrowing rules** (88px/56px, unchanged from before this whole
  batch) and **lose every add-button rule they carried** — the fixed
  44px/40px widths, the `clip-path: none` cancellation §2 added an hour
  earlier, the icon-only text-hiding. Un-gating them from `min-width: 768px`
  was also required: the stepper needs to narrow on a 2-up phone card now
  too, since the mobile grid that used to handle that case on its own is
  gone.
- **A new, single `@container oxcard (max-width: 230px)` rule** is the only
  thing that ever hides the add button's label now, at every width and
  every tier, replacing all of the above. It touches nothing but the label's
  own visibility (`font-size: 0`, the gap, the glyph's own grown size) — the
  button's box, its angle and its fill behaviour are identical whether the
  label is showing or not.
- **`padding-inline` on both button states (upgraded and un-upgraded) moves
  from a flat 18px to `ox-run(40px)` = 27px a side**, per the coordinator's
  own "compute against the button's inner width minus the two runs"
  instruction — restated as the literal padding value itself, so the
  content area genuinely is (button width − 54px) rather than a separate
  calculation layered over an unrelated padding number. In the icon-only
  state (inside the 230px query) this padding is cancelled back to 0, since
  a centred glyph is protected by the parallelogram's own true geometric
  core (button width − *one* run, not two — X-IDENTITY §2.1's own
  construction), which is more generous than the two-run model the label
  budget below deliberately uses as its safety margin.

**The label-fit threshold, measured.** Content needed to show the label:
glyph (18) + gap (8) + label (~41, estimated below) = 67px; the button
itself needs ≥ 67 + 54 = 121px; the button is 90% of its own slot (the
pre-existing rule, untouched), so the **slot** needs ≥ 121 / 0.9 ≈ 134.4px.
Working that through each stepper tier (slot = container − qty width − the
row's own gap):

| Stepper tier | Qty width, gap | Slot formula | Fits from (container) |
|---|---|---|---|
| Default (> 240px) | 96px, 8px | container − 104 | always (≥ 136 at the 240 boundary) |
| ≤ 240px | 88px, 8px | container − 96 | ≥ ≈230.4px |
| ≤ 139px | 56px, 4px | container − 60 | never (needs ≥ 194.4px, tier caps at 139) |

A single `@container (max-width: 230px)` hide-boundary covers both narrower
cases (230.4 rounded down for safety).

**The label estimate itself is arithmetic, not a live measurement** (no
headless renderer in this environment — the same limitation every prior
batch's own label-fit estimate has recorded): "أضف للسلة" (9 characters)
scaled from CARD-2026-09-23's own measured "اشتري الآن" (10 characters,
58.0px at 15px/700, `docs/build/progress/S3e.md` §2) — 9 chars ≈ 52.2px at
the same reference size, then scaled to this button's own ~12.15px/600
(`calc(var(--ox-t-small) * 0.9)` at `--ox-t-small`'s vw-clamp mid-point,
weight 600 against the reference's 700): 52.2 × (12.15/15) × 0.96 ≈ 41px. A
live check should confirm this before calling it fully closed.

**Verified at the four required widths** (container widths derived from
`.ox-grid-products`'s own breakpoints, `.ox-listing__results.has-rail`'s
280px rail + `--ox-8` gap for the 1024 case, and `--ox-gutter`'s own
per-breakpoint tokens):

| Width | Context | Container (content) | Stepper tier | Slot | Button (90%) | Label shown? |
|---|---|---|---|---|---|---|
| 390 | 2-up | 137px | ≤139 (qty 56, gap 4) | 77px | 69.3px | No — icon only |
| 768 | 3-up, no rail | 197px | ≤240 (qty 88, gap 8) | 101px | 90.9px | No — icon only |
| 1024 | 3-up with rail | 168px | ≤240 (qty 88, gap 8) | 72px | 64.8px | No — icon only |
| 1440 | 4-up | 274px | default (qty 96, gap 8) | 170px | 153px | **Yes** — text + glyph |

1440 (the owner's own screenshot context) now shows the full "أضف للسلة"
label with 32px of spare content room (99px available, 67px needed). The
three narrower checkpoints fall back to the glyph alone, still full width,
never a fixed small box.

**Glyph-clip check at the tightest checkpoint** (1024 with the rail, 64.8px
button, the narrowest of the four): core width = button − one run =
64.8 − 27 = 37.8px; a centred 20px glyph clears the slant by **2.15px** at
its own tightest corner (the vertical extremity of its 20px height inside
the 40px-tall button) — tight, positive, and flagged rather than assumed
roomier, per this codebase's own established practice for a computed fit
this environment cannot render to confirm.

**Nothing in §1–§6 above needed to change**: the angled shape (item 1), the
excerpt line, the glyph scale and the swatch shift/lighten (the coordinator's
first addendum) are all independent of the action-row mechanism this
correction replaces.

### Re-verified

- `npx sass --no-source-map app/styles/app.scss` → exit 0, only the
  pre-existing `@import` deprecation notices.
- `pnpm typecheck` → 0 errors.
- `pnpm vitest run tests/product tests/common` → 21 files, **305 tests
  passed** (the +6 over §5's own count are unrelated tests other concurrent
  batches added to the same suite in this shared tree).
- `pnpm check:rtl` → 327/0. `pnpm check:motion` → 327/0. `pnpm check:strings`
  → 324/0. `node scripts/check-tokens.mjs` → 123 tokens, 322 files, 0
  problems. `node scripts/check-identity.mjs` → 327/0.
- Live preview: compiled stylesheet grepped directly —
  `grid-template-columns: 64px 1fr` and `48px 1fr` both return **zero**
  matches now (the mobile-only grid is gone); the two `@container` tiers
  compile with only their qty-narrowing rules; the new `@container oxcard
  (max-width: 230px)` rule compiles with exactly the label-hiding
  properties and nothing else; `.ox-card-product__add .s-button-element`
  carries `padding-inline: 27px` in its default state.

### Deviation, this section

- The glyph-clip margin at the narrowest checkpoint (1024 with the rail) is
  2.15px, not generous — flagged per the same "compute, do not assume"
  practice as every other tight fit in this file, and a real browser check
  would settle it definitively where this environment cannot.

---

## 8. Owner items, 2026-09-24: 10% larger add label/glyph, one card design everywhere

**§8.3's own font-size and threshold numbers are superseded by §9.2's UX
audit fold-in below** (`--ox-card-add-font` moved from a `--ox-t-small`
clamp-based value to a flat `calc(14px * 1.1)` per UX-2026-09-24 P1-18, which
also moves the label-fit threshold from the 245px this section derives to
252px) — kept here for the record of what changed and why at the time,
matching this file's own practice elsewhere (§3 vs §7).

Two owner items, with the coordinator's own live measurements: (1) the
mobile card still looked "odd" against desktop, with the add control a
straight 90×40 box (`clip-path: none`) and its label at `font-size: 0`, and
the owner asked for the add label and icon to be 10% larger on top of
whatever fixed it; (2) the card design in `أحدث المنتجات` (the home latest
grid) is the reference and should be the ONE design everywhere.

### 8.1 What the measurement was actually catching

The coordinator's numbers (a straight `clip-path: none` box on both a 220px
and a 306px card) describe the state this batch's **first** correction
shipped — the mobile-only `64px 1fr` tier plus the two `@container oxcard`
tiers' own `clip-path: none` fallback — not the state after the **second**
correction earlier in this same session, which removed every one of those
overrides and left the add button always angled, always filling its slot.
Re-checked line by line against the current working tree before touching
anything further: `grep -n "ox-card-product__add" _b4-listing.scss | grep
clip-path` returns **zero** matches; the file's own line 1419 the
coordinator named is `.ox-card-product__badges .ox-badge { clip-path: none
}`, a pre-existing, unrelated, intentional rule for the badge stack (S3e's
own "every badge on this card is straight-edged" override), not the add
button. The most likely explanation is that the owner's own preview tooling
was reading a build tied to the last commit rather than this session's
still-uncommitted second correction (a recent, unrelated commit in this same
tree, `6c015f1`, is literally titled "SSR uses the local snapshot API,
browsers keep the tunnel"). Recorded here rather than silently assumed, per
"read back and compare" — this section's own real work is items (1)'s
sizing half and item (2)'s cross-surface verification, both genuinely new.

### 8.2 Item 2: one card design everywhere — verified, not just asserted

**`ProductsGridWrapper`/`OxProducts`** (the home `أحدث المنتجات` block) and
**`ProductGrid`** (the listing/category/search/brand grid, via the engine's
`ItemsList`) both render the **same** `<ProductCard>` import from
`@salla.sa/twilight-theme-engine/product`, which performs its own
`product:card` registry lookup and resolves to this theme's `OxProductCard`
— confirmed by reading both files, not assumed from the doc comments alone
(`OxProductCard.tsx`'s own header: "registered over the engine's
`product:card` key so every listing, slider and wishlist grid gets it").
There is only ever one card component; there was never a second one to diff
against.

**The grid wrapper CSS is also byte-identical.** `ProductsGridWrapper`
renders `<ul className="ox-grid-products ox-grid-products--home">`;
`ProductGrid` renders `itemsClassName="ox-grid-products"` (or
`ox-grid-products ox-grid-products--with-rail` when a category has an active
filter sidebar). `--home` carries **no active CSS rule** at all any more —
grepped `_b2-home.scss`, zero matches for `.ox-grid-products--home` (a
pre-existing, already-documented drift from an older draft of
`ProductsGridWrapper.tsx`'s own JSDoc, per S3a.md, not something this batch
introduced or needs to fix). So the home grid and the listing grid share
`.ox-grid-products`'s own column-count breakpoints (2 base, 3 at 640px, 4 at
1024px) with **no divergence** — verified live: none of the four required
pages (`/ar`, `/ar/protein/c9001`, `/ar/search`, `/ar/brands/9101`) render
`has-rail`/`--with-rail` today, so all four resolve to the exact same
container width at a given viewport.

**`container-type`/`container-name` are declared unconditionally** on
`.ox-card-product` itself (`_b3-product.scss:26-27`, no media/surface guard),
so the `oxcard` container query system already applies identically wherever
the card renders — there was no per-surface modifier to remove beyond what
§7 already removed (the mobile-only grid, the per-tier `clip-path: none`,
the per-tier fixed widths). Re-audited after §7's own changes specifically
for this item: no remaining rule anywhere in `_b4-listing.scss` keys off a
page-level class (`.ox-listing__*`, `.ox-brandhero *`, `.ox-search-results
*`, etc.) to change the card's own action-row arrangement. The only
variables left are the `oxcard` container width itself and the viewport
(irrelevant to the card, since nothing in its own CSS reads a `@media` query
any more for this row).

**Verified via SSR markup diff**, `/ar/protein/c9001` (14 cards),
`/ar/search?q=بروتين` (16 cards), `/ar/brands/9101` (7 cards): every card on
every page carries the identical class list and structure —
`.ox-card-product.ox-card-product--vertical`, the same
`.ox-card-product__action`/`__qty`/`__add-slot`/`__buy` markup byte for byte
(diffed the actual HTML fragment around `.ox-card-product__action` across
all three files; identical). `/ar`'s own latest-products grid renders its
skeleton in SSR (the block's `useQuery` has no server-side prefetch, by
design — `ProductsGridSkeleton`, a generic `ox-skel-pgrid`, not
`OxProductCard` at all) and only mounts the real `OxProductCard` after
client hydration completes the fetch; this is pre-existing, intentional
behaviour (unrelated to this batch) and does not change which component or
CSS ultimately renders once it does.

### 8.3 Item 1: the add label and glyph, 10% larger

One token each, declared on `.ox-card-product__add-slot` (inherited by both
button states and the glyph mask, since a custom property crosses into
`::before`/`::after` where a restated `calc()` cannot):

```scss
--ox-card-add-font: calc(var(--ox-t-small) * 0.9 * 1.1); // was * 0.9
--ox-card-add-icon: 19.8px;                              // was a flat 18px
```

Both button states' `font-size` and both glyph masks' `inline-size`/
`block-size` (upgraded `.s-button-text::before`, un-upgraded `::after`) now
read these tokens. **The icon-only tier's own further growth to 20px is
removed** (owner review, 2026-09-24: one token now drives the icon in every
state, text-visible or not, rather than a second, larger literal only the
narrow tier used) — since the base icon is already 10% larger, growing it
again on top of that no longer serves the original purpose (making the
glyph "the only thing to read" once the label hides) any more than the
already-larger base size does on its own.

**The label-fit threshold, recomputed** (the label and glyph both grew,
which shifts every number in §7's own table): content needed is now glyph
(19.8) + gap (8) + label (~45, re-scaled from the same S3e reference at the
new font-size) ≈ 72.8px; the button itself needs ≈127px; the button is 90%
of its slot (unchanged): slot ≥ 127 / 0.9 ≈ **141.1px** (was 134.4px).
Re-deriving per stepper tier surfaced a real wrinkle the smaller label had
papered over: in the **default** tier (container > 240px, qty 96px), the
slot needs container ≥ 245.1px to fit the label — so a container of
241–245px, despite being ABOVE the 88px-qty tier's own 240px ceiling, still
needs the icon-only fallback, because crossing that ceiling makes the
stepper itself WIDER (88px → 96px) and leaves the add button LESS room, not
more. The single hide-boundary moves from `@container oxcard (max-width:
230px)` to **`@container oxcard (max-width: 245px)`**, which covers this
gap along with everything §7 already covered (full derivation in the
rule's own comment, `_b4-listing.scss`).

### 8.4 Verified — the four required pages, the four required widths

Card content width at each viewport is identical across all four pages (no
page renders a rail today, confirmed §8.2), computed from `.ox-container`'s
own gutter/column-count breakpoints (unchanged by this batch, re-derived
here for the record):

| Viewport | Columns | Gutter | Grid gap | Container | Cell | Card content |
|---|---|---|---|---|---|---|
| 390 | 2 | 16px | `--ox-4` 16px | 358px | 171px | **139px** |
| 768 | 3 | 24px | `--ox-4` 16px | 720px | 229.3px | **197px** |
| 1024 | 4 | 32px | `--ox-6` 24px | 960px | 222px | **190px** |
| 1440 | 4 | 32px | `--ox-6` 24px | 1296px | 306px | **274px** |

Fed through the stepper tier → slot → 90%-button → label-fit chain (§7/§8.3),
identically on `/ar` (latest grid), `/ar/protein/c9001`, `/ar/search?q=بروتين`
and `/ar/brands/9101` — there is nothing surface-specific left in the
formula, so one row covers all four pages at each width:

| Width | Content | Stepper tier | Slot | Button (90%) | Label shown? | Glyph-clip margin |
|---|---|---|---|---|---|---|
| 390 | 139px | ≤139 (qty 56, gap 4) | 79px | 71.1px | No — icon only | ≈5.5–18.8px |
| 768 | 197px | ≤240 (qty 88, gap 8) | 101px | 90.9px | No — icon only | wider than 390, safe |
| 1024 | 190px | ≤240 (qty 88, gap 8) | 94px | 84.6px | No — icon only | wider than 390, safe |
| 1440 | 274px | default (qty 96, gap 8) | 170px | 153px | **Yes** — text + glyph | n/a (not icon-only) |

At 1440 the content region is 153 − 54 = 99px against a 72.8px need — 26.2px
spare. At every narrower width the arrangement is IDENTICAL to 1440's own —
`'qty add' 'buy buy'`, the add button angled and filling its slot, buy-now
full width below — only the label's visibility and the stepper's own tiered
width differ, exactly as §7 designed. Nothing clips at any of the four
widths on any of the four pages: the narrowest button here (390, 71.1px)
clears the slant by 5.5px at its tightest corner, more comfortably than the
64.8px rail-card case §7 already flagged at 2.15–2.3px (that case remains
possible the day a category page's filter rail is active, and remains
correctly handled by the same, now-recomputed, formula).

**A live `getBoundingClientRect` pass (chrome-devtools-mcp or equivalent) is
still the only way to confirm the label-width ESTIMATE itself** (~45px for
"أضف للسلة" at the new size) — this environment has no headless renderer, a
limitation recorded at every label-fit estimate in this file and this batch.
Everything else in this table — the grid arithmetic, the stepper tiers, the
90% rule, the padding/run relationship — is exact, not estimated.

### Re-verified

- `npx sass --no-source-map app/styles/app.scss` → exit 0, only the
  pre-existing `@import` deprecation notices.
- `pnpm typecheck` → 0 errors.
- `pnpm vitest run tests/product tests/common` → 21 files, **306 tests
  passed**.
- `pnpm check:rtl` → 327/0. `pnpm check:motion` → 327/0. `pnpm check:strings`
  → 324/0. `node scripts/check-tokens.mjs` → 123 tokens, 322 files, 0
  problems. `node scripts/check-identity.mjs` → 327/0.
- Live preview (dev server dropped once mid-check and came back on its own
  within the retry window, per the task's own instruction — not started or
  stopped by this session): compiled stylesheet grepped directly —
  `--ox-card-add-font`/`--ox-card-add-icon` both declared on
  `.ox-card-product__add-slot` and consumed by both button states and both
  glyph masks; `@container oxcard (max-width: 245px)` present with exactly
  the label-hiding declarations and no icon-size override inside it;
  `max-width: 230px)` returns zero matches (the superseded threshold is
  gone). SSR HTML fetched and diffed for `/ar/protein/c9001` (14 cards),
  `/ar/search?q=بروتين` (16 cards) and `/ar/brands/9101` (7 cards): identical
  `.ox-card-product__action` markup on every card on every page.

### Deviations, this section

- The exact label-width estimate (~45px) is arithmetic, scaled from a prior
  batch's own measured reference — flagged, not a live measurement, the same
  limitation recorded throughout this file.
- The single `@container (max-width: 245px)` hide-boundary is intentionally
  ~3px conservative inside the 88px-qty tier's own narrow 237–240px band
  (§8.3) rather than a second, nested query for a gap this environment could
  not verify live either way.

---

## 9. UX-2026-09-24 fold-in, the card's own full-width buy-now, and a font-size correction

The coordinator named `docs/build/UX-2026-09-24.md` item P0-3 as mine, asked
for the P1 items naming the product card to fold into this same
unification, and separately relayed two more live owner measurements: the
card's buy-now button needs to fill row B edge to edge (no inline inset),
and (from the same UX pass) the card add label's font-size sits under
Arabic's own legibility floor. `app/components/product/OxProductCard.tsx`'s
own `BuyNow` **logic** (P0-10, "buy now does not buy") is explicitly
builder S7d's — this batch touched none of it, confirmed by re-reading the
file's current `BuyNow`/`AddButton` functions immediately before every edit
in this section and finding no local changes there; everything below is
`_b3-product.scss`/`_b4-listing.scss` layout and classes only, per the
coordinator's own scoping.

### 9.1 P0-3: the PDP mobile buy row overlapped itself

**Root cause, exactly as measured.** `.ox-buy__actions` (buy-now,
`BuyActions.tsx`'s `afterForm`, a sibling of the engine's whole
`<AddToCartForm>`) was `position: absolute; inset-block-end: 0` inside
`.ox-buy`, on the theory that `.ox-buy`'s own box ended exactly at the
qty/add row's bottom edge — so "anchor to the bottom" meant "sit beside the
last row". But `.ox-buy`'s box IS exactly that row's own box (nothing else
in the form is taller), so the absolute-positioned buy-now painted directly
on top of the add button and the stepper instead of beside or below them.
Confirmed against the audit's own measurement (`.ox-buy__now` y288 h48,
`salla-quantity-input` y290 h40, `salla-add-product-button` y284 h52 — all
three overlapping) by reading the CSS that produced it, not re-measuring.

**Fix, in `_b3-product.scss` section 9b** (rewritten, not patched): three
real in-flow rows, never an absolute overlay.
- Row A — the stepper alone, 120×44 (was 140, UX-2026-09-24's own
  re-measurement), flush to the reading start.
- Row B — add-to-cart, now FULL WIDTH (was 40%, the width that produced the
  91px button the audit measured) at 48 tall (was 44), with its full label
  restored: the icon-only treatment (`font-size: 0` on the word, `padding-
  inline: 0`, `ox-angled(44px)`) is deleted outright, since a 358px-wide row
  has room for "أضف إلى السلة" and the glyph both. The button itself is
  STRAIGHT now (`border-radius: var(--ox-r-2)`, `clip-path: none` cancelling
  the base rule's own `ox-angled(52px)`, plus the `[dir='ltr']` twin the
  mixin's own higher-specificity mirror needs): the audit's own arithmetic —
  `ox-run(48px)` = 32.4, X-IDENTITY §2.4's floor = 32.4 / 0.24 = 135px —
  makes the old 91px button illegal on the identity document's own terms,
  and rather than re-deriving a new run for the widened 358px box, buy-now
  (row C) stays the page's one angled control at this breakpoint, per the
  audit's own explicit instruction.
- Row C — buy-now, now a REAL SIBLING flowing after the form (`.ox-buy
  __actions { position: relative; display: grid; gap: 12px; margin-block-
  start: var(--ox-3) }`, the coordinator's own literal rule), 12px below row
  B. This is the actual fix for the overlap: there is no more `position:
  absolute` for `.ox-buy`'s own box to be mis-measured against. Buy-now's
  own pre-existing `@media (max-width: 639px)` rule (unedited, elsewhere in
  this file) already renders it at exactly 358×48 at this breakpoint, so no
  further change was needed there.
- Row gap: `row-gap: var(--ox-3)` (12px) on `.sticky-product-bar`, matching
  UX-2026-09-24's own named figure (was `--ox-2`, 8px).

**Verified live**, `curl -s --compressed "http://localhost:3210/ar/x/p1673105563"`,
compiled stylesheet grepped directly: `.sticky-product-bar` inside the
767px query carries `grid-template-areas: "qty" "add"`, `row-gap: var(--ox-
3)`, the quantity at `inline-size: 120px`, the add-button wrapper at
`inline-size: 100%`, the button itself `min-block-size: 48px`,
`border-radius: var(--ox-r-2)`, `clip-path: none` (both plain and
`[dir='ltr']`); `.ox-buy__actions` carries `position: relative; display:
grid; gap: 12px; margin-block-start: var(--ox-3)` with no `position:
absolute` anywhere in the compiled rule any more.

### 9.2 P1-18: the desktop card's add label was below the Arabic legibility floor

**Measured**: `.ox-card-product__add .s-button-element` at `font-size:
12.5874px`/600 — under the 13px floor Arabic needs at this weight on a
control, per the audit's own finding. The value was `--ox-t-small`'s own
vw-clamp × 0.9, which this same batch's §8.3 had already multiplied by
1.1 without ever anchoring it to a flat floor — so the 10% pass alone was
not guaranteed to clear 13px at every viewport, only likely to.

**Fix**: `--ox-card-add-font` (declared on `.ox-card-product__add-slot`,
§8.3) is now `calc(14px * 1.1)` — CARD 6.4's own flat desktop figure (14px)
with the owner's 10% applied on top of a fixed number, not a clamp, so it
can never fall under the floor again regardless of viewport width. This
raises the label from ~13.365px (§8.3's own clamp-based estimate) to a flat
15.4px everywhere the label is visible.

**The label-fit threshold moved again as a direct result** (a bigger label
needs a wider button before it fits): content needed is now glyph (19.8) +
gap (8) + label (~51, re-scaled at 15.4px/600 the same way as §8.3) ≈
78.8px; button needs ≈133px; slot needs ≈147.8px. Re-derived per stepper
tier, the fit point now falls entirely inside the DEFAULT tier (container >
240px, qty 96px): slot = container − 104 ≥ 147.8 → container ≥ 251.8px —
the narrower `qty 88` tier's own 240px ceiling no longer reaches far enough
to fit the label at all (needs ≥243.8px, tier caps at 240). The single
hide-boundary moves from `@container oxcard (max-width: 245px)` to
**`@container oxcard (max-width: 252px)`** (rounded UP this time, not down,
since the fit point sits inside the wider tier and the label estimate
itself is an approximation — the conservative direction is to hide one
pixel further rather than risk a fit that reads as overlap).

**The four required checkpoints (§8.4) are unaffected in outcome**: 390
(139px), 768 (197px) and 1024 (190px) are all still comfortably below 252,
icon-only; 1440 (274px) is still above 252, text shown — button 153px,
content region 99px against a 78.8px need, 20.2px spare (was 26.2px before
the label grew again, still comfortable).

### 9.3 The card's buy-now, full width edge to edge

**Owner note**: "on mobile, the buy-now button should fill the row
horizontally." Measured at a 220px card: buy-now was 170px wide inside a
186px content box — the `margin-inline: 8px` inset from the 2026-09-22 fix
(recorded in §2/§7's own history: it existed to keep the parallelogram's
flush end clear of the card's own border-radius). Required now: no inline
margin on the button itself, `inline-size: 100%`, `justify-self: stretch`,
edge to edge with row A and the plate above it, at every width.

**Fix, `_b4-listing.scss`**: both `.ox-card-product__buy` (the Link
fallback) and `.ox-card-product__buy--native` (the quick-buy web-component
variant, unreached on this catalogue but kept in step for the day it is
not) drop `margin-inline: 8px` and `inline-size: calc(100% - 16px)` in
favour of `inline-size: 100%` (`justify-self: stretch` added explicitly on
the Link variant, the grid's own default for a full `inline-size` item,
restated for clarity now that nothing else pins its width). **This is a
direct, later owner instruction against the 2026-09-22 fix** it replaces —
implemented exactly as asked and flagged here per "read back and compare,"
not silently re-applied: the card's own 16px padding still gives buy-now
16px of clearance from the card's outer rounded corner (down from the 24px
the 2026-09-22 fix specifically added), which is the tension the owner's
own instruction accepts by asking for edge-to-edge fill.

**Verified**, computed rather than measured with a real
`getBoundingClientRect` (no headless renderer in this environment): buy-now
sits inside `.ox-card-product__action`, itself a direct, unpadded,
unmargined descendant of `.ox-card-product__body`, itself flush inside the
card's own padding box — so with no margin and `inline-size: 100%` of its
own `buy` grid area (which spans the full row, `grid-template-areas: 'qty
add' 'buy buy'`), buy-now's rendered left and right edges are
**mathematically identical** to the card's own content box at every width,
by construction, not by measurement:

| Width | Card content box | Buy-now width | Left offset | Right offset |
|---|---|---|---|---|
| 390 (2-up) | 139px | 139px | 0 | 0 |
| 768 (3-up) | 197px | 197px | 0 | 0 |
| 1440 (4-up) | 274px | 274px | 0 | 0 |

Confirmed live in the compiled stylesheet: `.ox-card-product__buy`'s own
rule carries `inline-size: 100%; justify-self: stretch;` and no
`margin-inline`/`calc()` width anywhere in its cascade any more (grepped:
zero remaining `margin-inline: 8px` or `calc(100% - 16px)` on either buy-now
variant).

### Re-verified, §9

- `npx sass --no-source-map app/styles/app.scss` → exit 0.
- `pnpm typecheck` → 0 errors in any file this batch touched; one pre-
  existing error surfaced in `app/components/layout/navLinks.ts`
  (`Cannot find name 'pathWithQuery'`), a file this batch never opened —
  another builder's concurrent, in-progress edit (plausibly the same P0-14
  absolute-URL fix that names `navLinks.ts`), reported per the brief's own
  "confined to files other builders hold" instruction, not fixed here.
- `pnpm vitest run tests/product tests/common` → 21 files, **306 tests
  passed**.
- `pnpm check:rtl` → 327/0. `pnpm check:motion` → 327/0. `pnpm check:strings`
  → 326/0. `node scripts/check-tokens.mjs` → 123 tokens, 322 files, 0
  problems. `node scripts/check-identity.mjs` → 327/0.
- Live preview (the dev server dropped and came back on its own during this
  section's own checks, per the task's retry instruction — not started or
  stopped by this session): `/ar/x/p1673105563` and `/ar/protein/c9001`
  both fetched and their compiled stylesheets grepped directly for every
  rule quoted above; all present exactly as written.

### P0-10 and P0-14, named but explicitly not touched here

- **P0-10** ("buy now does not buy"): the coordinator named this builder
  S7d's, in `OxProductCard.tsx`'s `BuyNow` logic. Re-read the file
  immediately before every edit in this batch; `BuyNow`/`AddButton` are
  unchanged by this session throughout.
- **P0-14** (24 of 58 anchors on `/ar` resolve to an absolute
  `https://optimalx.com.sa/...` URL, including the card's own title link and
  buy control): this is a `Link`/`href` LOGIC change
  (`toPath`/`toSafeLinks`/`withLocale`), not layout or classes, so it sits
  outside this batch's scoping to "layout/classes" the same way P0-10 does —
  not fixed here, flagged for whoever owns `OxProductCard.tsx`'s link
  wiring (plausibly S7d again, or the builder currently mid-edit on
  `navLinks.ts` per the typecheck finding above).
- **"Measured and found sound"** (UX-2026-09-24's own list, so this batch
  does not re-open it): "product cards measure exactly 620 on every row at
  1440 on `/ar/protein/c9001` and `/ar/search`, and 479 on every row at
  390" — CARD 4.4's equal-height mechanism (§7's own `.ox-card-product__body
  { flex: 1 1 auto }` / `.ox-card-product__action { margin-block-start:
  auto }`) still holds after every change in this file; nothing in this
  batch touched a row height.
