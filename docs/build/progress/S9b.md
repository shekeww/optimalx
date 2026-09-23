# S9b — every filled grey plate takes the primary CTA's shape

Builder S9b, 2026-09-24. Owner ruling, with a screenshot of the contact
page's grey branch panel: "components such as this gray rectangle in image,
to all have the shape of the primary CTA shape, being angled."

Mid-batch, the conductor removed the branch surfaces from this batch (S9c is
redesigning them as photo covers): `.ox-branch--flat`/`.ox-branch__card`
(`_blocks.scss`), `.ox-branch-map__plate` and the gallery (`_b5-pages.scss`
§7) are not touched here, and `BranchPage.tsx`, `BranchGallery.tsx`,
`BranchMap.tsx`, `OxBranch.tsx` are not edited. Rows below are marked
**handed to S9c**.

Concurrent with V4 (the product card): `_primitives.scss` and the card
region of `_b3-product.scss`/`_b4-listing.scss §12`/`OxProductCard.tsx` are
not touched here either. The shared shape primitive lives in a new partial,
`_plates.scss`, imported right after `_primitives` in `_index.scss`.

## Audit: every filled-neutral-plate-with-rounded-corners rule in `06-ox/*.scss`

Grep run: `background:\s*var\(--ox-(plate|bg-2|paper-2|graphite)` and
`border-radius` across `app/styles/06-ox/*.scss`, cross-checked line by line
for a rounded-corner filled neutral rule (no `--ox-bg-2`/`--ox-paper-2`
literal hits in this corpus; every real match reads `--ox-plate`,
`--ox-plate-2` or `--ox-graphite-*`).

| Selector | File | Renders on | Decision | Reason |
|---|---|---|---|---|
| `.ox-panel--plate` | `_b5-pages.scss` §0 | Contact branch panel (**the screenshot**), ScopePanel, PickupSteps, AboutPage registration panel, ServiceSection scope panel, KitchenSink | **Convert** | Filled `--ox-plate`, no border, `--ox-r-4` radius, no interactive descendant escapes its padding box |
| `.ox-facts` | `_b3-product.scss` §6 | PDP `SpecFacts` (digital/gift-card/service spec) | **Convert** | Filled `--ox-plate`, no border, `--ox-r-3` radius |
| `.ox-listing__empty` | `_b4-listing.scss` §5 | Category/listing zero-products state | **Convert** | Filled `--ox-plate`, no border, `--ox-r-4` radius; wraps `EmptyState`, normal flow |
| `.ox-zero__state` | `_b4-listing.scss` §8 | Search zero-results state | **Convert** | Same as above |
| `.ox-needhelp` | `_b4-listing.scss` §9 | Goal-landing closing panel | **Convert** | Filled `--ox-plate`, `--ox-r-4` radius; the 1px `--ox-plate-2` border is a tint definition edge, not a card hairline (same combination `.ox-brand-tile__plate` already ships, keep-as-is row below), and it does not except the panel from the ruling |
| `.ox-converter__result` | `_b5-pages.scss` §11 | Unit converter result | **Convert** | Filled `--ox-plate`, no border, `--ox-r-4` radius; not named in the brief's own list but matches the audit criterion exactly, no exception applies |
| `.ox-branch--flat` / `.ox-branch__card` | `_blocks.scss` §1 | `/branch`, home branch block, `/contact` | **Handed to S9c** | Coordinator: branch surfaces are being redesigned as photo covers |
| `.ox-branch-map__plate` | `_b5-pages.scss` §7 | `/branch` map facade | **Handed to S9c** | Same |
| `.ox-branch-gallery__figure` (and the rest of §7) | `_b5-pages.scss` §7 | `/branch` gallery | **Handed to S9c** | Same |
| `.ox-panel` (default, `tone="card"`) | `_b3-product.scss` §14 | PDP details/how-to-use/nutrition panel shells | Keep-as-is | `background: var(--ox-surface)` + 1px `--ox-bd` hairline — the brief's own "cards with hairline borders stay rectangular" exception; none of the three PDP panels calls `tone="plate"` (verified in `DetailsPanel.tsx`/`HowToUse.tsx`/`NutritionTable.tsx`) |
| `.ox-nutrition__card` | `_b3-product.scss` §14 | Nutrition table's own inner frame | Keep-as-is | No fill at all (transparent), 1px `--ox-bd` border only — a table cell, not a plate |
| `.ox-service__inbody` | `_b3-product.scss` §17 | Services buy zone, the InBody measurement line | Keep-as-is | A single-line highlighted note (`--ox-r-2`, 8px), reads as a callout strip at chip/badge scale, not a bounded panel |
| `.ox-service__scope` | `_b3-product.scss` §17 | Services buy zone, the mandated medical line | Keep-as-is | Same — a one-paragraph disclosure strip, not a panel |
| `.ox-bundle__thumb` | `_b3-product.scss` §16 | Bundle member row thumbnail | Keep-as-is | A 56×56 image slot (form-field/table-cell scale), not a content plate |
| `.ox-fbt__thumb` / `.ox-bundle-offer__thumb` | `_b3-product.scss` §18 | Frequently-bought-together thumbnails | Keep-as-is | Same, 80×80 image slot |
| `.ox-thumbs__btn` | `_b3-product.scss` §3 | PDP gallery thumbnail rail | Keep-as-is | An interactive control ("buttons keep their faces") |
| `.ox-gallery--empty` | `_b3-product.scss` §3 | PDP gallery, zero images | Keep-as-is | A photo-panel substitute for `.ox-gallery__plate`'s own band/mark construction, not a content plate |
| `.ox-cat-card` (all tint/`--black` variants) | `_b4-listing.scss` §11b | Category index tiles | Keep-as-is | 1px `--ox-line-3`/`--ox-graphite` hairline border on every variant — "cards with hairline borders stay rectangular" |
| `.ox-brand-tile__plate` | `_b4-listing.scss` §11 | Brand carousel/`/brands` grid tiles | Keep-as-is | Already carries its own owner-approved arm-foot corner cut (`ox-x-corner`, S4d 2026-09-23), a prior explicit override of X-IDENTITY's "brand plates are straight" rule; a second, different angled treatment on top of that one is a redesign decision this batch was not asked to make |
| `.ox-brandhero` | `_b4-listing.scss` §11 | A brand's own page banner | Keep-as-is | Same as `.ox-brand-tile__plate` |
| `.ox-featured__plate` | `_b4-listing.scss` §12 note | Featured rail cover tile | Keep-as-is | Same corner-cut family (X-IDENTITY §3.4 table names this tile explicitly); also inside `_b4-listing.scss §12`'s card region V4 owns concurrently |
| `.ox-swatch__face--text` | `_b4-listing.scss` §12 | PDP text-swatch variant chip | Keep-as-is | A chip, and inside V4's concurrent card-region edits |
| `.ox-brandhub__letter` | `_b4-listing.scss` §11 | `/brands` letter rail | Keep-as-is | A 44×44 nav link, not a content plate; no radius set at all |
| `.ox-pcard` / `.ox-pcard__placeholder` | `_b2-home.scss` §17 | Poster rail (offer + content cards), the "photo not yet uploaded" state | Keep-as-is | `.ox-pcard` already carries its own owner-approved two-corner diagonal clip (S8i, 2026-09-24 — "all cards to share the same cuts"), no `border-radius` at all; a different, already-adjudicated shape. Converting it to the CTA parallelogram would directly contradict yesterday's ruling on this exact rail — flagged for the conductor if the owner wants the two rulings reconciled |
| `.ox-newsletter` | `_blocks.scss` §5 | Newsletter band (home + `/services`?) | Keep-as-is | Full-bleed band (`padding-block` only, no `border-radius`, spans the frame) — not a bounded rectangle; matches the brief's own "if it is a flat rectangle today" conditional negatively |
| `.ox-listing__band` | `_b4-listing.scss` §2 | Listing/category masthead | Keep-as-is | Same — full-bleed band, no `border-radius` |
| `.ox-skel-dark`, `.ox-skel__block`, `.ox-branch-map__skeleton` | `_primitives.scss` §9, `_b2-home.scss` | Loading skeletons | Keep-as-is | Loading placeholders stand in for whatever the real element becomes; not named in the brief, and reshaping them risks mismatching the content they precede |
| `.ox-advisory__plate` | `_b7-advisory.scss` | PDP foot advisory CTA | Keep-as-is | Already angled (`ox-x-corner`, `--ox-graphite-3`) per this file's own S8c ruling, explicitly reusing the offer strip's identity plate; not a bare rounded rectangle, and not named in the brief's "Apply it to" list |
| `.ox-mega__promo-image` | `_b1-layout.scss` | Header mega menu promoted tile | Keep-as-is | A photo slot (the fallback fill behind an `<img>`); `_b1-layout.scss`/header chrome is not in this batch's read list |
| `_b6-commerce.scss` (`.ox-cart-trust__marks`, `.ox-checkout-progress__lines`, `.ox-keypoints`, the blog `&__intro`, `.ox-wallet .s-wallet-table-balance-container`, and the rest — 20+ further `--ox-plate`/`--ox-graphite` hits, mostly image thumbnails, chips and pills) | `_b6-commerce.scss` | Cart, checkout, account, wallet, blog | Keep-as-is (out of batch) | Commerce/account/blog surfaces, not in this batch's read list or the brief's target list. The five named above are genuine filled-plate-with-radius candidates for a future batch; the rest are image slots, pills or chips and stay exempt regardless |

## The shape

`app/styles/06-ox/_plates.scss` (new, imported right after `primitives` in
`_index.scss`): a SHAPE-ONLY mixin, `ox-plate($h, $pad: true)` — no fill, no
border, matching how `ox-angled()`/`ox-x-corner()` never set a background
either, so it composes with whatever fill a caller already carries.

- **Sharp corners**: `border-radius: 0`.
- **The parallelogram**: the identical `clip-path` construction
  `ox-angled()` draws (both vertical edges lean, mirrored under
  `[dir='ltr']`), but the run comes from a DAMPENED lean rather than the
  plate's own full block-size — a button's whole box IS its lean, a
  300px-tall, 1200px-wide panel is not. `ox-plate-lean($h)` is 20% of $h,
  capped at 40px (`$ox-plate-lean-max`): 24px at a 120px-tall plate (exact),
  capped at 40px from roughly 200px up — the brief's own "a full-width 300px
  panel leans about 40px" example, exactly. `ox-run()` (the identity's own
  tangent, `_primitives.scss`) turns that lean into the run, so the two
  constructions share one trig function and cannot drift apart: 27.0px at
  the 40px cap, comfortably inside X-IDENTITY §2.3's 24% run/inline-size
  budget on anything wider than 112.5px — every plate this ships on.
- **Padding-inline** grows to `run + var(--ox-4)` (the button convention:
  run + 16px breathing room) when `$pad` is true (the default). Because the
  cut boundary at any block position never sits farther than `run` from its
  own edge, content inset by `run + 16px` — including a `:focus-visible`
  ring growing 2px past its own control (X-IDENTITY §7.1 `focus-clipped`,
  the pattern `.ox-cat-rail__arrow` documents for a control) — clears the
  diagonal at every height, as long as nothing escapes the padding box.
  Verified for every converted row: `ContactPage`'s branch link, `ScopePanel`'s
  list, `PickupSteps`'s list, `EmptyState`'s actions, `NeedHelp`'s button all
  render in normal flow inside their panel's padding, none absolutely
  positioned.

Applied via `@include ox-plate($h)` at each converted selector's own rule
(no markup changes): `.ox-panel--plate` (200px), `.ox-facts` (120px),
`.ox-listing__empty` (300px), `.ox-zero__state` (300px), `.ox-needhelp`
(150px), `.ox-converter__result` (100px). `$h` is a design-time reference
height (the same contract `ox-angled($h)`/`ox-wedge($h)` already use), not a
live DOM measurement.

## Verification

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)

$ pnpm vitest run tests/pages tests/product tests/home tests/common tests/styles
 Test Files  55 passed (55)   (tests/styles: no matching path, 0 files — not
                                created by any batch yet)
      Tests  731 passed (731)

$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 329 file(s) scanned, 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 335 file(s), 0 problem(s)
(the new `ox-plate()` mixin is not a name `check-identity.mjs` recognises —
verified by reading the script: its angled-primitive detection is a fixed
list of mixin names, `ox-angled`/`ox-wedge*`/`ox-x-corner`/`ox-x-step`/
`ox-lean-corner`, and a raw `clip-path: polygon(...)` only at the point it is
written. `ox-plate()`'s own `clip-path: polygon(...)` lives once, inside
`_plates.scss`'s mixin body — where it has no `family` match and sets no
`block-size` of its own, so none of `small-angle`/`one-angled-per-block`/
`focus-clipped` fire there either — and the file carries its own
`[dir='ltr']` mirror, clearing `unmirrored`. No `ox-allow` pragma needed
anywhere)

$ node scripts/check-strings.mjs
check-strings: 346 file(s), 0 problem(s)
```

Screenshots (chrome-headless-shell over raw CDP, S8f's method; port 9653, a
fresh `--user-data-dir`; full page height, not just the first viewport, so
the below-the-fold plates are in frame): `docs/build/progress/visit/`
`plates-contact-{390,1440}.png`, `plates-branch-{390,1440}.png` (unchanged —
handed to S9c, captured to confirm this batch left it alone),
`plates-product-panels-{390,1440}.png` (`/p662137586`, the digital gift-card
product — its own `.ox-facts` plate, compiled with the clip-path confirmed
directly in the compiled CSS below), `plates-search-empty-{390,1440}.png`
(`/ar/search?q=zzzz`). The contact page's branch panel — the owner's own
screenshot — reads with both corners cut, the address and the "فرع المدينة
المنورة" link both clear of the diagonal at both widths; the search
zero-state plate reads the same way, icon/title/body/actions/chips all clear
of the cut. Headless shell processes killed after capture (an extra
zoomed-crop pass hit the dev server's own documented concurrent-browser
stall — `PDP-ADD-DIAG-2026-09-24.md` — so it was abandoned rather than
retried against a shared server; the four full-page pairs above are the
batch's real evidence and were captured cleanly before that pass).

Compiled CSS, read directly to confirm the maths (`sass` CLI against
`_index.scss`, discarded after): `.ox-facts{border-radius:0;clip-path:polygon(16.2px 0, 100% 0, calc(100% - 16.2px) 100%, 0 100%)}`
(120px input, lean 24, run 16.2 — exact), `.ox-panel--plate`/`.ox-listing__empty`/`.ox-zero__state`
all `run 27px` (200px/300px input, both past the 200px cap), `.ox-needhelp`
`run 20.2px` (150px input, lean 30), `.ox-converter__result` `run 13.5px`
(100px input, lean 20) — every selector also carries its `[dir='ltr']`
mirror and the `padding-inline: calc(<run> + var(--ox-4))` growth.

## Deviations

1. **`.ox-converter__result` converted though not named in the brief's own
   "Apply it to" list.** It matches the audit criterion exactly (filled
   `--ox-plate`, `--ox-r-4` radius, no border, no interactive descendant,
   no card/chip/badge/table/photo exception applies) and the brief's own
   audit-first instruction is to convert every row that qualifies, not only
   the named examples.
2. **Branch surfaces excluded mid-batch** (contact page's own branch panel
   is not one of them — see the audit table's own note). Recorded per the
   coordinator's message, not a change I originated.
3. **Zoomed per-element crop screenshots abandoned.** Not a required
   deliverable (the brief asks for the four full-page pairs); the attempt
   to add them ran a second concurrent headless-shell session against the
   dev server and hit its own documented stall. No project file was
   affected — the crop script lived in the scratchpad, and the two
   mis-captured crop images this produced were deleted before this report.

## Shopify

Not ported this batch (the theme's own CSS layer only; the mirror lands
after the Salla batch, per the project's usual W-series completeness pass).
