# S3a: owner review round, 2026-09-23, progress

Batch: the four numbered items in the brief, plus two coordinator addenda that
arrived mid-task (icon removal on every "buy now" control; then copy, a
global 10%-primary-label token, and a card image-crop fix). Read
`X-IDENTITY-2026-09-22.md` §2/§3.4 and `docs/build/progress/S2g.md` in full
before starting, per the brief.

## A file-scope finding, upfront

The brief's own permitted-file list named `_b3-product.scss`, `_b6-commerce.scss`,
`_primitives.scss` and `_b1-layout.scss` for this batch, and did **not** name
`app/styles/06-ox/_b4-listing.scss`, but nearly all of the product card's own
buy-zone CSS (`.ox-card-product__action`, `__qty`, `__add`, `__buy`,
`__swatches`, `.ox-swatch*`) lives in that file, not in `_b3-product.scss`
(confirmed live: `_b3-product.scss` carries only two skeletal card rules,
`.ox-card-product__action{min-block-size}` and
`.ox-card-product__add{inline-size:90%}`; everything else is in `_b4-listing.scss`,
which loads after `_b3-product.scss` and wins at equal specificity, an override
from the permitted file could not have reached the card at all). So item 1's
"card buy-now button" and item 2's "on the card" clause were initially not
achievable without either touching a file outside the brief's list or fighting
the cascade from outside it, neither of which this role does without asking.

The coordinator's second addendum then explicitly granted `_b4-listing.scss`'s
product-card section (`.ox-card-product__*`, excluding sections 14/14b, the
category cards) "yours to edit for the card only" for the image-crop item -
and named "card buy-now" as one of the global font-token's own targets. Taken
together this resolved the earlier gap, so the card-side halves of items 1, 2
and 3 below are implemented, not just flagged. Recorded here because the
brief and the addendum genuinely disagreed about the file boundary, and that
is the kind of thing this role is told to write down rather than silently
paper over.

## Item 1 + both addenda: the primary button label

**Copy** (coordinator addendum): `ox.pdp.buy_now` and `ox.card.buy_now` in
`locales/ar.json`, and `ox.pdp.buy_now` in `locales/partials/b3.ar.json` (the
only partial that carries either key, `ox.card.buy_now` has no partial),
changed from "اشتر الآن" to "اشتري الآن". English (`locales/en.json`,
`locales/partials/b3.en.json`) untouched, as instructed. The decision is
already recorded at `docs/brand/voice-ksa.md:407` ("Owner-initialed on
2026-09-23... the form with the final ya is the Saudi retail convention for
this button... §5 (P5) is not engaged"), so no new copy-gate exemption was
needed, `check-copy`/`check-strings` both still report 0 problems.

**The 10% shrink, made global** (coordinator's second addendum superseded the
brief's original three-surface scope): one token, `--ox-btn-primary-size:
calc(19px * 0.9)`, now lives inside the `ox-primary-face` mixin itself
(`_primitives.scss`), which sets `font-size: var(--ox-btn-primary-size)`.
Every consumer that used to restate its own literal `font-size: 19px` after
`@include ox-primary-face` had that literal removed, so the mixin's value
(the later declaration in the same rule) is what actually paints:

- `.ox-btn--primary` (`_primitives.scss`), the shared primary face itself.
  This is also how the **hero CTA** gets the token with zero edits to
  `OxHero.tsx` or `_b2-home.scss`: `Button.tsx` (`app/components/common/Button.tsx`,
  a shared component, not the hero's own file) always adds `ox-btn--primary`
  for `variant="primary"`, confirmed live -
  `curl http://localhost:3210/ar` renders the hero's primary anchor as
  `class="ox-btn ox-btn--primary ox-btn--s48 ox-cta-wedge"`.
- `.ox-buy__now` (PDP buy-now, `_b3-product.scss`).
- `.ox-card-product__buy` (card buy-now, the Link fallback, `_b4-listing.scss`).
- `.ox-card-product__buy--native .s-button-element` (card buy-now, the native
  quick-buy variant), this one never includes the mixin at all (it is a
  Salla web component's own light DOM, never a descendant of an
  `ox-primary-face` element, so it cannot inherit the custom property); it
  reads the same value directly, `font-size: var(--ox-btn-primary-size,
  calc(19px * 0.9))`, with a matching fallback.
- `.ox-sticky__add`, no literal of its own; it already carries
  `ox-btn ox-btn--primary` in its own JSX (`StickyBar.tsx`), so it inherits
  from `.ox-btn--primary` with no separate rule. `StickyBar.tsx` itself was
  **not edited**, verified there is nothing to add.
- The add-product toast's own primary button
  (`.s-add-product-toast__button--primary`, `_b6-commerce.scss`), already
  `@include ox-primary-face` with no literal override; verified in the
  compiled CSS that its rule (later in source than the shared
  `.s-add-product-toast__button{font-size:19px}` base) correctly wins, so
  this is the "cart checkout"/toast pairing the addendum named, fixed with
  no edit. Its **outline** sibling (`--outline`) does not include the mixin
  and correctly keeps 19px, only primary faces shrink.
- `.ox-campaign__cta` (`_b2-home.scss`, a home "campaign" band CTA, not
  GoalCard, PosterCard or OxHero) also picked up the token automatically:
  it declares its own `font-size: 19px` **before** `@include ox-primary-face`
  in the same rule, so the mixin's later declaration wins. This was not a
  direct edit to `_b2-home.scss` (only the shared mixin changed), but it is
  a real, live side effect on a file otherwise off-limits this batch, so it
  is recorded here for transparency rather than left for someone else to
  discover.

**Icon removal** (first coordinator addendum): the bolt is gone from every
"buy now" control.
- `BuyActions.tsx` (PDP), removed the `<Icon name="bolt">` and the now-unused
  `Icon` import; the dead `.ox-buy__now-icon` CSS rule removed from
  `_b3-product.scss`.
- `OxProductCard.tsx` (card), removed `<Icon name="bolt">` from both
  `BuyNow` branches (the native quick-buy web component and the Link
  fallback); the dead `.ox-card-product__buy-icon` CSS removed from
  `_b4-listing.scss` (both the standalone rule and the `@media
  (max-width:639px){ display:none }` rule that used to hide it there).
- `StickyBar.tsx`, checked and never carried a bolt or the "اشتر الآن" text
  in the first place (its label is `ox.pdp.sticky_add`, "أضف للسلة"); no
  change needed, verified rather than assumed.

**A flagged tension, not silently resolved either way**: white text on
`--ox-accent` measures 3.59:1, which clears WCAG AA only under the large-text
exemption (≥18.67px bold), this is the mixin's own documented floor, sitting
two lines above the change. At `calc(19px * 0.9)` = 17.1px the label no
longer qualifies as large text, so the same 3.59:1 now sits under the
4.5:1 normal-text floor. This was implemented exactly as instructed, twice,
once in the owner's original review item and again in the coordinator's own
explicit global-token addendum, but it is a real accessibility regression on
every primary button site-wide and is recorded here per "read back and
compare," not fixed unilaterally.

Verified live: `curl http://localhost:3210/ar/x/p1673105563` →
`<button type="button" class="ox-buy__now">اشتري الآن` (no icon, new label);
`curl http://localhost:3210/ar/protein/c9001` → card buy-now anchors render
`اشتري الآن` with no icon; `curl http://localhost:3210/en/x/p1673105563` →
`>Buy now<` (English untouched). Compiled CSS
(`/@tanstack-start/styles.css?...`) confirmed for every selector above.

## Item 2: the mobile buy zone below 768

Both the PDP and the card follow the same rule (stepper on its own row,
compact, at the reading start; the next row holds the add button as an
icon-only control, the cart glyph already paints as a mask on
`.s-button-text::before`/the un-upgraded state's `::after`, so this only
hides the word via `font-size: 0`, which leaves the text node in the
accessibility tree regardless of its painted size, at 40% of the row,
beside buy-now for the remainder) but the two needed different mechanisms,
because only one of them is markup this batch owns.

**PDP** (`_b3-product.scss`, new `@media (max-width: 767px)` block): the
stepper (`.sticky-product-bar__quantity`) and the add button live inside the
engine's own `<form>` (`AddToCartForm`); buy-now (`.ox-buy__actions`) is a
sibling of that form, added via `BuyForm.tsx`'s `afterForm` slot. Since
`AddToCartForm` is the engine's markup, this batch cannot restructure it to
make all three siblings of one grid without a `display: contents` flatten
that would also expose the form's other sections (weight, bundle, size
guide, attachments, all product-type-dependent, none of them this batch's
to redesign) as uncontrolled grid items. Used `position: absolute` instead:
`.ox-buy` gets `position: relative`, `.sticky-product-bar` becomes a
single-column, two-row grid (`qty` / `add`, the add cell 40% via the
existing `> *:not(.sticky-product-bar__quantity)` selector), and
`.ox-buy__actions` is pinned `inset-block-end: 0` inside `.ox-buy`, flush
with the (in-flow) add row's own bottom, since the form's last-section
margin is already 0 (the pre-existing rule right above section 9's engine-form
block).

**Card** (`OxProductCard.tsx` + `_b4-listing.scss`): this markup is ours, so
it got the more direct fix. `BuyNow` moved from a sibling of
`.ox-card-product__action` to a third child inside it, and
`.ox-card-product__action` became a CSS grid: `grid-template-areas: "qty add"
"buy buy"` at 768 and up (visually identical to the old flex row + separate
buy-now bar), `"qty qty" / "add buy"` below it. The two existing
container-query tiers (`@container oxcard (max-width: 240px|139px)`, which
used to squeeze the stepper and the add button onto one line at any
viewport) are now wrapped in `@media (min-width: 768px)`, below that the
stepper has left this row entirely, so their job (a one-row squeeze for a
narrow **container**, not a narrow **viewport**) is only ever needed again on
a wide viewport with a narrow card, e.g. the related-products rail.

**Measurements derived** (the card content-width figures are the file's own,
re-derived and confirmed against the existing "320 → 104px, 390 → 139px"
comment):

| Context | Width | Stepper row | Add (40%) | Buy-now (remainder) |
|---|---|---|---|---|
| PDP buy column | 320 (288 content) | full row, ~96px stepper own width | 115.2px | 288 − 115.2 − 12 gap = 160.8px box (144.8px visible inside its 8px×2 margin) |
| PDP buy column | 390 (358 content) | same | 143.2px | 358 − 143.2 − 12 = 202.8px box (186.8px visible) |
| Card, 2-up grid | 320 (104 content) | 96px stepper, 8px spare | 41.6px | 104 − 41.6 − 8 gap = 54.4px box (38.4px visible inside its 8px×2 margin), **tight**, flagged below |
| Card, 2-up grid | 390 (139 content) | same | 55.6px | 139 − 55.6 − 8 = 75.4px box (59.4px visible) |

The PDP row has real room at both widths. The card's own 320px case is
genuinely tight (38.4px of visible buy-now box), narrower than anywhere
else this row has had to fit an Arabic label before, but it is an icon-only
control on one side and a short two-word label ("اشتري الآن") on the other,
and the same file's own pre-existing comments already accept similarly tight
fits at this exact breakpoint for the unrelated add-button label. Flagged
rather than silently assumed comfortable; a live check at 320 would confirm
it, which this environment cannot do (no headless renderer, per the
S2f/S2g precedent this file already notes elsewhere).

Both keep their angled shapes: the add button's cut was re-run at
`ox-angled(44px)` inside the new mobile block (the base rule's own
`ox-angled(40px)` would otherwise cut the new 44px-tall box at the wrong
run); buy-now keeps its own existing cut at whatever height its own
breakpoint already gives it (48/52/56, unrelated to this change).

Verified live: `curl http://localhost:3210/ar/protein/c9001` → card anchors
show `ox-card-product__action` with the grid CSS confirmed compiled
(`grid-template-areas: "qty add" "buy buy"` at rest, `"qty qty" "add buy"`
inside the new `@media (max-width: 767px)` block, both present in
`/@tanstack-start/styles.css?...`). `pnpm typecheck` and the full
`tests/product tests/layout tests/common tests/listing` run (492 tests) both
stayed green through the JSX restructuring.

## Item 3: variant colour swatches

**What Salla exposes**, read from `fixtures/store/product-details.json` for
product 1673105563's "اللون" option and cross-checked against the live SSR
payload (identical): four `details[]`, each carrying a real merchant hex -
أسود `#252123`, أبيض `#fef7fa`, أخضر `#bceb0e`, أزرق `#00a9ff`, plus an empty
`image: ""` and the value's own Arabic `name`. Salla always supplies the real
colour for this product; the name-derivation path exists for the case it
does not (the listing endpoint's `option.values[]`, which carries a name and
no colour at all, unchanged, existing behaviour in `VariantChips.tsx`'s
`swatchFill`). "The colours don't match" (أخضر rendering as a yellow-green
rather than what the owner would call green) is the merchant's own hex,
verbatim, not a derivation bug, this theme already prefers the real colour
over a name-guess by design, and #bceb0e is what the merchant set.

**The PDP's swatches are Salla's own `salla-product-options` web component**,
confirmed light DOM (`docs/build/engine-surface.md` §15.1's own audit: "every
`salla-*` element renders into the light DOM" except two named shadow
components, neither this one) and confirmed by reading the component's own
source (`@salla.sa/twilight-components/.../salla-product-options.js`,
`colorOption()`): `<fieldset class="s-product-options-colors-wrapper">` of
`<div class="s-product-options-colors-item">` → `<input type="radio">` +
`<label><span style="background-color: {detail.color}">…`. No custom class
of ours reaches this row today (grepped, confirmed absent before this
batch), so all three CSS fixes are new, in `_b3-product.scss`:

- **Crop**: `padding-inline: 6px` (ring width, 2px outline + 2px offset, plus
  2px) and `overflow: visible` on `.s-product-options-colors-wrapper`.
- **Selected ring**: `--ox-accent`, added on `input:checked + label span`
  (Salla's own selected cue is a small inner dot on `span::after`, kept;
  this adds the ring BUILD 3.1 reserves for the state that is genuinely
  selected).
- **Light swatches never vanish**: `border-color: var(--ox-line-3)`
  (`border-width: 1px`) on every swatch, not only white/cream/yellow.
  **Deviation from the literal wording**: the brief names light values by
  name, but the merchant's colour is an inline style on Salla's own markup -
  this theme has no CSS-only way to single out "the light ones" among
  arbitrary future merchant hexes on a component we do not render. Salla's
  own default border is white, which is exactly the case that disappears;
  `--ox-line-3` on every swatch is the safe superset that satisfies "never
  vanish" without needing per-value luminance we cannot compute here.
- **Order**: unchanged, `option.details.map()` renders in the array's own
  order; nothing here reorders it.

**The card's own preview dots** (`.ox-card-product__swatches`/
`.ox-card-product__swatch`, the plate's trailing-edge column, the surface
the screenshot's "sits at the reading end... last dot is cropped" most
directly matches) got the same two structural fixes, in `_b4-listing.scss`:
`padding-inline: 6px` + `overflow: visible` on the row (the plate itself
keeps its own `overflow: hidden`, needed for the packshot), and the selected
ring recoloured from `--ox-fg` to `--ox-accent`.

**The card's own chooser chips** (`.ox-swatch`/`VariantChips.tsx`, the row
under the title) already used `--ox-accent` for its selected ring, no
change needed there. `NAMED_COLORS` is now `export`ed (with `namedColor`),
and extended with the hamza-free common variants a merchant is likely to
type (اسود، ابيض، احمر، ازرق, the four canonical names that carry an
opening hamza) mapped to the same hex as their canonical spelling. All
thirteen names the brief lists (أزرق، أخضر، أبيض، أسود، أحمر، وردي، رمادي،
بنفسجي، برتقالي، أصفر، بني، ذهبي، فضي) were already present before this
batch; the new unit test in `tests/product/VariantChips.test.tsx` asserts
that explicitly, walks every Arabic key the table holds (a script check via
`/[؀-ۿ]/`, not a fixed list, so a future addition is covered
automatically), and confirms the hamza-free variants resolve to the same
colour as their canonical spelling.

**Not touched, evaluated and left alone**: `.ox-card-product__variants` (the
chooser row's own container) carries a deliberate, pre-existing
`overflow-x: hidden`, documented in its own comment as "one row… a second
row or a scrollbar would either grow the card or hide values behind a
gesture a grid does not invite." The owner's screenshot describes the
*preview dots* at the plate's trailing edge, not this row, so it was left as
designed rather than reworked on spec.

Verified live: `curl http://localhost:3210/ar/protein/c9001` shows
`.ox-card-product__swatches` compiled with the new padding/overflow; the
PDP's own swatches never reach SSR HTML at all (confirmed: `salla-product-
options` mounts client-side only, same pattern as `salla-add-product-button`
elsewhere in this codebase), so that half is **verified by reasoning over
the CSS and the SSR-absent markup**, per the brief's own instruction for this
item, the compiled CSS rules were confirmed present and correctly ordered
in `/@tanstack-start/styles.css?...` (`.s-product-options-colors-wrapper{
padding-inline:6px; overflow:visible }`, the border-color rule, and the
`:checked` ring rule, all found and printed).

## Item 3 (coordinator addendum): product card images cropped

**Root cause, in the CSS alone**: `.ox-card-product__plate` carried both
`aspect-ratio: 1/1` and `max-block-size: var(--ox-card-plate-max, 132px)`.
The two fight once the plate's own width exceeds the cap, a home/listing
grid cell at 1024+ is 306px wide (274px of card content once the card's own
16px×2 padding is out), and the grid raised the cap to only 184px, so the
plate rendered as a 274×184 **rectangle**, not the square `aspect-ratio`
asked for. A second, independent issue: the engine's own `<Image>`
(`Image.tsx`, `objectFit`/`aspectRatio` props) wraps the `<img>` in its own
`position: relative` div carrying its own `aspect-ratio: 1/1` inline style
and `overflow: hidden`, as a flex child with no explicit size that div sizes
to its own content, so its square could independently disagree with the
plate's, and (through that same `overflow: hidden`) clip whatever the
mismatch cut off.

**Fix** (`_b3-product.scss`, `_b4-listing.scss`, card section only, sections
14/14b, the category cards, untouched):
- `.ox-card-product__plate`'s `max-block-size` removed entirely.
  `aspect-ratio: 1/1` alone already reserves the correct square space before
  the image loads (the cap was never load-bearing for CLS, only a stand-in
  for it).
- `--ox-card-plate-max: 184px` removed from `.ox-grid-products` at
  `min-width: 1024px`, and the matching `max-block-size` removed from
  `.ox-card-skeleton__plate` (the skeleton box, kept in step with the loaded
  card so the swap still shifts nothing).
- `.ox-card-product__plate > :has(> .ox-card-product__img) { position:
  absolute; inset: 0; }` pins the Image component's own wrapper flush to the
  plate. `:has()` reaches that specific wrapper (it carries no class of its
  own, only Tailwind's `relative overflow-hidden`) without touching the
  plate's *other* direct children (the badge stack, the wishlist button, the
  swatch column), which are already `position: absolute` in their own right.
  A useful second effect: the hover image's own wrapper now lands exactly
  over the resting one instead of beside it in the flex row, which the old,
  un-sized wrapper div would not have guaranteed either.

**Measured plate sizes, before and after**:

| Context | Cell | Card content (= plate) | Before | After |
|---|---|---|---|---|
| 390, 2-up grid | (358−16)/2 = 171 | 171−32 = 139px | 139 × 132 (8px short) | 139 × 139 (true square) |
| 1440, 4-up grid + rails (same rule) | (1296−3×24)/4 = 306 | 306−32 = 274px | 274 × 184 (90px short, the dramatic case) | 274 × 274 (true square) |

A stale reference: `app/components/blocks/ProductsGridWrapper.tsx`'s own
JSDoc (lines 55–57) describes `_b2-home.scss` raising `--ox-card-plate-max`
on `.ox-grid-products--home`, grepped, that declaration does not exist
anywhere in `_b2-home.scss` today (a pre-existing doc/code drift, not
something this batch introduced) and is now doubly moot since the plate no
longer reads that property at all. Not edited, the file is outside this
batch's scope, flagged here instead.

Verified live: compiled CSS confirmed
(`.ox-card-product__plate{position:relative;display:flex;align-items:center;
justify-content:center;aspect-ratio:1/1;overflow:hidden}` with no
`max-block-size`, plus the new `> :has(...)` rule immediately after it) and
via the full `tests/product`/`tests/listing` run (492 tests, unchanged pass
count before and after).

## Item 4: header search

**Root cause**: the icon (`.s-search-icon-wrap`/`.s-search-icon`, Salla's own
`salla-search` component, confirmed light DOM the same way as item 3's
options component) sits at the **reading start** by Salla's own default
(`:where([dir="rtl"]){right:1rem}` in the component's compiled stylesheet -
the same side Arabic text starts from). This theme's own rule instead set
`inset-inline-end: 25px` (the *opposite* logical side) on the same elements,
and separately gave the input only `padding-inline: 20px …` on the actual
icon side, 20px against an icon that needs roughly 41px of clearance (a
16px SVG, Salla's own fixed `.s-search-icon svg{width:1rem}`, plus whatever
offset governs its position). The mismatch is what put "بحث" and the glyph
on top of each other at the reading start, on both the desktop pill and the
mobile search row, the two share the same `SearchField`/`.ox-search`
markup and CSS (`app/components/layout/Header/MainBar.tsx`'s `SearchField`,
consumed by both `MainBar.tsx` and `MobileHeader.tsx`), so one fix reaches
both; there is no separate mobile-specific override to also change.

**Fix** (`_b1-layout.scss`): the icon rule now reads `inset-inline-start:
25px` (matching Salla's own side, rather than fighting it from the opposite
one), and the input's `padding-inline` is `calc(25px + 16px + var(--ox-2))
20px`, the icon's own offset, plus its fixed 16px size, plus one spacing
token (`--ox-2`, 8px) as the gap, on the icon's side; 20px kept on the far
side. `MainBar.tsx`/`MobileHeader.tsx` were read for the search markup but
not edited, the fix is CSS-only.

Verified live: compiled CSS confirmed
(`.ox-search .s-search-icon-wrap, .ox-search .s-search-icon{inset-inline-
start:25px; …}` and `padding-inline:calc(41px + var(--ox-2)) 20px`, Sass
pre-folded the two literal terms of the calc at build time, the `var()`
untouched). `curl http://localhost:3210/en?storeId=1888890798`-style mirror
check not re-run manually; `check-rtl` (0 problems) covers the
logical-property requirement directly, and `check-identity`'s `unmirrored`
rule is file-wide.

## Files changed

- `app/components/product/BuyZone/BuyActions.tsx`, bolt icon and its now-
  unused `Icon` import removed (item 1 addendum).
- `app/components/product/OxProductCard.tsx`, bolt icon removed from both
  `BuyNow` branches (item 1 addendum); `controls` restructured into one grid
  container so buy-now is a grid item beside the stepper/add row (item 2).
- `app/components/product/VariantChips.tsx`, `NAMED_COLORS`/`namedColor`
  exported; four hamza-free common variants added (item 3).
- `app/styles/06-ox/_primitives.scss`, `ox-primary-face` mixin now owns
  `--ox-btn-primary-size`/font-size; `.ox-btn--primary`'s own literal
  removed (item 1/2 addendum).
- `app/styles/06-ox/_b3-product.scss`, `.ox-card-product__plate`/`__img`
  crop fix (item 3 addendum); `.ox-buy__now` font-size literal removed,
  `.ox-buy__now-icon` removed; `.ox-sticky__add` note only (no literal
  needed); new PDP mobile buy-zone block (item 2); new PDP swatch CSS
  (item 3).
- `app/styles/06-ox/_b4-listing.scss`, card buy-now font-size
  literal/native fallback (item 1/2 addendum); dead `.ox-card-product__buy-
  icon` CSS removed (item 1 addendum); `--ox-card-plate-max` removed from
  the 1024+ grid rule and the skeleton rule (item 3 addendum);
  `.ox-card-product__action` converted to a CSS grid plus new
  `@media (max-width: 767px)` block, the two container-query tiers rescoped
  to `@media (min-width: 768px)` (item 2); `.ox-card-product__swatches`/
  `__swatch` crop padding and accent ring (item 3).
- `app/styles/06-ox/_b1-layout.scss`, search icon side and input padding
  fixed (item 4).
- `locales/ar.json`, `locales/partials/b3.ar.json`, buy-now label copy
  (item 1 addendum).
- `tests/product/VariantChips.test.tsx`, new `NAMED_COLORS` test suite
  (item 3).

Read, not edited (verified no change needed): `app/components/product/
BuyZone/StickyBar.tsx`, `app/components/layout/Header/MainBar.tsx`,
`app/components/layout/Header/MobileHeader.tsx`, `app/components/common/
Price.tsx`, `app/components/common/Button.tsx`, `app/components/home/
OxHero.tsx`, `app/styles/06-ox/_b6-commerce.scss` (its one `ox-primary-face`
consumer already resolves correctly through the shared mixin).

## Deviations

- The white-on-accent contrast floor (see item 1's own section above), 
  implemented exactly as instructed twice over, flagged rather than
  unilaterally fixed.
- Light-swatch ring (item 3) applied to every PDP swatch rather than only
  white/cream/yellow, since the merchant's colour is an inline style on
  Salla's own markup this theme cannot read back at CSS time.
- `.ox-card-product__variants`'s own `overflow-x: hidden` left untouched -
  a separate, pre-existing, documented design constraint, not the surface
  the screenshot showed.
- `.ox-campaign__cta` (`_b2-home.scss`) picked up the new font token as a
  side effect of the shared mixin, with no direct edit to that file.
- The stale `--ox-card-plate-max` reference in `ProductsGridWrapper.tsx`'s
  JSDoc, and the file-scope gap between the original brief and the
  coordinator's addendum, both recorded above rather than silently
  resolved.
- PDP mobile buy-zone uses `position: absolute` rather than a shared CSS
  grid (unlike the card), because buy-now sits outside markup this batch
  owns (`AddToCartForm` is the engine's).

## Verified by

- `pnpm typecheck` → `tsc --noEmit`, 0 errors (run after every batch of
  edits, clean throughout).
- `pnpm vitest run tests/product tests/layout tests/common tests/listing` →
  **38 files passed, 492 tests passed**, unchanged pass count before and
  after the JSX/CSS restructuring, including `tests/product/VariantChips.
  test.tsx` (15/15, with the new `NAMED_COLORS` suite),
  `tests/product/OxProductCard.test.tsx` (27/27),
  `tests/product/StickyBar.test.tsx` (6/6), `tests/layout/Header.test.tsx`
  (14/14), `tests/listing/FeaturedRail.test.tsx` (8/8).
- `pnpm check:rtl` → `315 file(s), 0 problem(s)`.
- `pnpm check:motion` → `315 file(s), 0 problem(s)`.
- `pnpm check:strings` → `307 file(s), 0 problem(s)`.
- `node scripts/check-copy.mjs locales/ar.json locales/en.json` →
  `2 file(s), 0 problem(s)`.
- `node scripts/check-claims.mjs` → `26 file(s), 0 problem(s), 4 allowlisted`
  (all four allowlisted findings pre-exist this batch, "official-distributor").
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 312 file(s)
  scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `315 file(s), 0 problem(s)`.
- Live curl against the running preview (`http://localhost:3210`, picked up
  every edit without a restart):
  - `curl -s --compressed "http://localhost:3210/ar/x/p1673105563"` → buy-now
    renders `<button type="button" class="ox-buy__now">اشتري الآن` (no icon);
    sticky bar class `ox-sticky` present.
  - `curl -s --compressed "http://localhost:3210/ar/protein/c9001"` → card
    anchors render `class="ox-btn ox-btn--primary ox-btn--block ox-card-
    product__buy" …>اشتري الآن`; `ox-card-product__action` and
    `ox-card-product__plate` present.
  - `curl -s --compressed "http://localhost:3210/ar"` → hero primary CTA
    renders `class="ox-btn ox-btn--primary ox-btn--s48 ox-cta-wedge"`,
    confirming the shared-mixin side effect without touching `OxHero.tsx`.
  - `curl -s --compressed "http://localhost:3210/en/x/p1673105563"` →
    `>Buy now<`, English label unchanged.
  - Compiled CSS (`/@tanstack-start/styles.css?routes=…`) fetched and
    grepped directly for every rule quoted above: the
    `--ox-btn-primary-size` token and its two `var()` call sites, the
    `.ox-card-product__plate`/`> :has(...)` pair, the
    `.s-product-options-colors-wrapper` trio, the `.ox-card-product__action`
    grid at both tiers, the `.ox-search` icon/padding pair, and the toast's
    `--primary`/`--outline` ordering, all present and in the expected
    cascade position.
