# S9a-V4 — the product card made compact, owner review 2026-09-24

Builder S9a-V4. Direction: `docs/build/CARD-2026-09-23.md` (the card spec),
this batch's own addendum below. Concurrent with V1 (`_b7-advisory.scss`) and
V3 (`_b2-home.scss`, header files) — not touched here. Files owned this
batch: `OxProductCard.tsx`, `lib/cardSpec.ts`, `VariantChips.tsx`,
`_b3-product.scss` (card + gallery-plate regions only), `_b4-listing.scss`
§12, a new shared plate-ground mixin in `_primitives.scss`,
`tests/product/OxProductCard.test.tsx`, `tests/product/VariantChips.test.tsx`.

Owner's words (2026-09-24, screenshot of the "منتجات قد تناسبك" rail at
1905px): vertical size minimal with breathing space; the variant row makes
the card taller — put the chooser on the image instead; remove the free
consultation link, unnecessary and taking space; reproduce the PDP gallery's
grey-plate-plus-orange-shapes ground behind the card's own image; and, from
the header audit the same day, "if anything can't be integrated in Shopify,
delete it" — the wishlist heart.

Progress logged after every step.

## Plan

1. Remove the free-consultation link (component + `_b3-product.scss` rule;
   locale key `ox.card.free_consult` stays unused per the brief).
2. Remove the wishlist heart (component + the base rule in
   `_b3-product.scss` + the corner-swap override in `_b4-listing.scss` §12).
3. Move the interactive variant chooser (`VariantChips`) onto the plate,
   bottom-start, translucent strip only when it actually holds something
   (`:not(:empty)`), 44px hit area via `ox-hit-area`, native `form`
   attribute so the radios still reach the card's own `<form>` although they
   no longer nest inside it; a defensive `valueImageUrl` swap for the plate
   photograph when a chosen value carries one of its own (not observably
   live on this catalogue today — no processed fixture carries a per-value
   image, same category of dormant-but-coded branch the bundle `can_add`
   path already documents).
4. Remove the excerpt line entirely (repeated the title; the facts line
   carries the type) — retires `descriptionExcerpt` from `cardSpec.ts` since
   nothing else reads it.
5. Shared plate-ground mixins (`ox-plate-band`, `ox-plate-mark`) in
   `_primitives.scss`, extracted from the gallery's own band/mark rules and
   reused, unscaled (percentage-based already), on the card's plate. The
   gallery's own render is unchanged; only its two rules become one-line
   `@include`s of the same definition.
6. Measure the card at 390 and 1440 before and after; screenshots.

## Steps

1. Read `CARD-2026-09-23.md`, `progress/S8g.md` (the last round that touched
   `cardSpec.ts`/`OxProductCard.tsx`), `progress/S8i.md` (poster-cut
   convention, unrelated but read for the file-ownership pattern),
   `OxProductCard.tsx`, `lib/cardSpec.ts`, `VariantChips.tsx`,
   `_b3-product.scss` (both the card region and the gallery-plate region:
   `.ox-gallery__band`/`.ox-gallery__mark`), `_b4-listing.scss` §12,
   `BuyZone/PdpGallery.tsx` (read only, not touched), `_primitives.scss`
   (the existing `ox-wedge`/`ox-angled`/`ox-hit-area` mixins, `--ox-skew`),
   `tokens.css` (`--ox-bg`/`--ox-surface`/`--ox-plate`/`--ox-plate-2`/
   `--ox-accent`: `--ox-bg` and `--ox-surface` are BOTH `#FFFFFF` in light
   mode, which is what makes "the plate ground becomes `--ox-bg`" a
   no-visible-difference declaration against the card's own white surface —
   the CARD spec's section 3.1 "no grey plate" departure still holds).

2. **Item 1, the consult link.** Removed the `<Link>` and its
   `showsFreeConsult`/`consultVariant` computation from `OxProductCard.tsx`,
   the `.ox-card-product__consult` rule from `_b3-product.scss`. The locale
   key `ox.card.free_consult` stays in both locale files, unused, per the
   brief. `variantOf` import dropped (its only caller was `consultVariant`).

3. **Item 2, the wishlist heart.** Removed the `<button>`, `useWishlist()`,
   `inWishlist` from `OxProductCard.tsx`; the `.ox-card-product__wish` rule
   from `_b3-product.scss`; the corner-swap override (`inset-inline-start`
   re-point) from `_b4-listing.scss` §12, rewriting its own comment since
   only the badge-column half of "the corners swap" still applies. The PDP
   gallery keeps its own `.ox-gallery__wish`, untouched (V3's own surface,
   not this batch's).

4. **Item 4, the excerpt line.** Removed the `<p className="…__excerpt">`
   row, the `excerpt` `useMemo`, and the `.ox-card-product__excerpt` rule.
   Retired `descriptionExcerpt()` from `cardSpec.ts` along with its two
   private-only helpers (`paragraphTexts`, `firstSentence`) and the
   `sanitizeHtml`/`parseSpecLineText` imports nothing else in that file used
   — confirmed nothing else in the repo imports `descriptionExcerpt`
   (`grep -rn`, one match left, the module's own doc comment, since edited).

5. **Item 3, the variant chooser onto the plate.** The larger change:
   - `option` (`cardOption(product)`, gated `outOfStock || isBundle ? null :
     …`) computed ONCE in `OxProductCard.tsx` now, replacing the old
     duplicate computation (once at the top level as `chipOption` for the
     passive-dot suppression, once again inside `BuyControls` for the
     stepper/chips) — one source, threaded down as a prop.
   - `valueId` state lifted from `BuyControls` to `OxProductCard`, since the
     plate's own `<VariantChips>` and the body's own `<BuyControls>`/`<form>`
     both need it now, as siblings rather than parent/child.
   - `<VariantChips>` renders inside `.ox-card-product__plate` (last child,
     after the passive dot preview), gated `!outOfStock && !isBundle` — a
     bundle's own add path is link-only (`BuyControls`'s existing early
     return), so the plate never offers a chooser that path cannot honour.
   - **The form association problem.** The radios used to be inside the
     card's own `<form>` (`salla.form.onSubmit('cart.addItem', …)` builds
     `new FormData(form)` from it); moved onto the plate, they are no longer
     a descendant of that form in the DOM. Fixed with the standard HTML
     `form="…"` attribute on each radio (`VariantChips.tsx`'s new `formId`
     prop) pointing at the `<form id={formId}>` `BuyControls` still renders
     — the same mechanism a `<button form="…">` uses outside its own form.
     Verified live (CDP, below): `input.getAttribute('form')` equals the
     form's own `id` on the shaker card. No hidden mirror field needed;
     native `checked` radios associated this way are read directly out of
     `FormData` by the browser.
   - **`valueImageUrl` (new, `VariantChips.tsx`).** A chosen value with its
     own `image`/`image_url` swaps the plate's main photograph; a colour
     alone never does (never guesses a packshot from a hex). Not observably
     live on this catalogue today (no processed fixture carries a per-value
     image — confirmed by `swatchFill`'s own comment and a repo-wide grep for
     `image_url` inside `fixtures/store/*.json`, present only in the untouched
     `raw/` snapshot), the same "dormant, coded, tested, honest" category
     `OxProductCard.tsx`'s own bundle `can_add` path already documents.
   - `BuyControls` no longer computes `option`/`valueId` itself and no longer
     renders `variantsRow`; the `!option` branch returns `controls` directly
     (no form needed), the `option` branch's `<form>` carries `id={formId}`
     and only the two hidden fields (`id`, `quantity`) plus `{controls}`.

6. **Item 4 (shared plate ground).** `ox-plate-band`/`ox-plate-mark` added to
   `_primitives.scss`, lifted verbatim from `.ox-gallery__band`/
   `.ox-gallery__mark`'s own rule bodies (percentage insets, `--ox-skew`,
   `--ox-plate-2`/`--ox-accent`), so both are `@include`s of one definition
   now. The gallery's own two rules are now one line each; **the gallery's
   own computed styles are unchanged** (same declarations, just sourced from
   the mixin — confirmed nothing in the gallery's CSS changed by diffing the
   rule bodies before/after). The card's plate gets `background: var(--ox-bg)`
   (a no-visible-difference declaration against `--ox-surface`, both
   `#FFFFFF` — see step 1) plus two new `<span aria-hidden>` elements
   (`.ox-card-product__band`/`.ox-card-product__mark`), rendered before the
   `<Image>` so DOM paint order alone keeps them behind the packshot; the
   image's own positioned wrapper gets an explicit `z-index: 1` so it is
   never ambiguous which element the paint order refers to.

7. **Vertical budget / row removal (item 5).** With the consult link, the
   excerpt paragraph and the in-flow variant row all gone, the body's own row
   list is now: brand (optional) → title → facts line → rating (optional,
   data-gated, still reserves nothing) → price → stock line (optional) →
   action. The body's own `gap` was already `var(--ox-2)` (8px) between every
   row, and the card's own top-level `gap` (plate to body) was already
   `var(--ox-3)` (12px) — both already matched the brief's own "one `--ox-2`
   between rows, `--ox-3` above the action rows" ask before this batch, so no
   gap tokens needed changing; the compaction is entirely from removing whole
   rows, not from tightening the survivors.

8. **The sold-out equal-height reservation, recomputed.** CARD-2026-09-23
   section 5's `.ox-card-product.is-out .ox-card-product__body` reservation
   (`min-block-size`) existed to keep a sold-out card the same height as its
   in-stock neighbours; its own numbers (252/260) were stale even before this
   batch (written against an older row composition). Measured live (CDP,
   below) on the catalogue's own listing: in-stock body **204** at 390, **210**
   at 1440 (both down from the stale 252/260 now that the excerpt/consult
   rows and the in-flow variant row are gone). Updated the rule and its own
   comment to the measured figures, with the sold-out body's own natural
   height (160/162) recorded alongside for the size of the gap the
   reservation is closing (44px/48px, not the old comment's flat "92px").

9. **The live preview's own SSR staleness (flagged for the conductor).**
   Server-rendered `curl` output for `/ar/protein/c9001` kept showing the
   PRE-edit card (wishlist heart, consult link, excerpt paragraph, zero
   `ox-card-product__band` occurrences) for a long stretch after every
   `OxProductCard.tsx`/`VariantChips.tsx`/`cardSpec.ts` save, even though the
   Vite CLIENT hmr log (`.offline-preview.log`) showed those exact files
   updating correctly. Root-caused: `(ssr) hmr update` lines in that log
   only ever named `app.css` (and, alongside it, `virtual:cloudflare/worker-entry`)
   — never an individual component file — so a pure TSX-only edit's SSR-side
   invalidation was not visibly cascading to the worker entry the way a CSS
   edit's was. Working, non-destructive fix used here: touching a CSS file
   already owned by this batch (`_b3-product.scss`) forced the
   `virtual:cloudflare/worker-entry` reload, after which the SSR output
   matched the live TSX immediately (confirmed: 0 → 14
   `ox-card-product__band` occurrences on the very next `curl`). The
   trailing touch comment was removed again once its job was done. No
   server was restarted or stopped for this. Separately, mid-verification,
   **the conductor restarted the preview (3210) and API mock (5178)**
   themselves (unresponsive under several concurrent browsers); this
   batch's own screenshots/measurements below were taken (and, where an
   in-flight request was cut off by that restart, retaken) after polling
   `/ar` back to 200, per the conductor's own instruction, with no server
   action taken by this batch itself.

10. **Live measurement (CDP), the deviation on "before."** All edits landed
    before this step was reached (a sequencing gap in this batch, recorded
    rather than silently passed over): with the working tree already fully
    edited and `git stash`/`checkout` forbidden, no true pre-edit "before"
    screenshot could be captured through the live preview this time. The
    "before" reference for this batch is CARD-2026-09-23.md's and S8g.md's
    own prior prose measurements (the 435/578 base heights, the consult
    link's and excerpt row's own documented presence) rather than a live
    capture; the numbers below are the "after" state, measured live and
    exact.

    Raw CDP client (`chrome-headless-shell`, Node's built-in `fetch`/
    `WebSocket`, S8f's own method), scoped to its own debugging port (9333/
    9334) so as not to collide with any concurrent sibling builder's own
    instance; the spawned process was killed in a `finally` block each run,
    nothing left running (`tasklist` confirmed empty afterward).

    `/ar/protein/c9001` (14 cards, `OxProductCard`, SSR):

    | | 390×844 | 1440×900 |
    |---|---|---|
    | card outer | 171 × **387** | 306 × **528** |
    | plate | 137 × 137 | 272 × 272 |
    | name | 137 × 44 | 272 × 46 |
    | chips (facts line) | 137 × 18 | 272 × 18 |
    | price | 137 × 30 | 272 × 30 |
    | action | 137 × 88 | 272 × 92 |
    | variants (no option) | 0 × 0 (`:empty`, no box painted) | 0 × 0 |
    | `hasWish`/`hasConsult`/`hasExcerpt` | false / false / false | false / false / false |

    `card-s9a-v4-390-after.png`/`card-s9a-v4-1440-after.png` under
    `docs/build/progress/visit/`; full JSON at
    `docs/build/progress/card-measurements.json`. (Named with the batch's own
    prefix, not the plain `card-390-after.png`/`card-1440-after.png` the
    script first wrote: those two filenames already existed, committed, as
    S9a-V3's own screenshots — `git status` caught the collision as a
    modification of tracked files rather than two new ones. Restored V3's
    originals from `HEAD` via `git show` + a plain file copy — no
    `checkout`/`reset` used — confirmed byte-identical to `HEAD` afterward,
    and moved this batch's own captures to the names above.)

    `/ar/accessories/c9010` (the one product in the catalogue with a real
    chippable option, the shaker — `/ar/protein/c9001`'s own 14 carry none):
    the plate's own `.ox-card-product__variants` measured **124 × 32**,
    **8px** above the plate's own bottom edge (`inset-block-end: var(--ox-2)`
    confirmed exactly), its vertical centre **112px** below the plate's own
    centre (nowhere near it), the radio's own `form` attribute equal to the
    card's own `<form id>` (`oxcard-form-1673105563` both sides). Screenshot
    at `docs/build/progress/visit/card-variants-plate-1440.png`: four colour
    swatches (blue/green/white/black) sit as a small ringed row over the
    packshot's own lower third, the selected one (black, this fixture's
    default) carrying its accent ring, the add-to-cart and buy-now controls
    immediately below the price with no gap where the old below-image row
    used to sit.

    The plate ground (band + mark) is visible on every card at both widths
    in the screenshots above — a light grey diagonal lift behind the
    packshot and a small orange sliver near its inline-end edge, low enough
    in contrast that every product photograph (including the darkest,
    Serious Mass's black-and-green bag) still reads clearly, matching the
    gallery's own already-proven "page ground, not a grey box" reasoning
    (step 1).

    One thing recorded, not fixed, per the brief's own instruction: on
    `/ar/protein/c9001` at 390 the add-to-cart control's own visible box was
    absent from one capture (the reserved `.ox-card-product__add-slot` was
    present and correctly sized; `SallaAddProductButtonCore` had not
    upgraded to a real element at the moment of that screenshot) while the
    very same control rendered normally moments later on
    `/ar/accessories/c9010` at 1440 — the documented, pre-existing "may not
    upgrade" preview limitation, unrelated to this batch's own markup and
    not touched here.

## Files

| file | change |
|---|---|
| `app/components/product/OxProductCard.tsx` | wishlist heart, consult link and excerpt row removed; the plate ground (band/mark) and the variant chooser added to the plate; `option`/`valueId`/`formId`/`variantImageUrl` lifted here from `BuyControls` |
| `app/components/product/lib/cardSpec.ts` | `descriptionExcerpt` and its two private helpers retired (nothing else read them) |
| `app/components/product/VariantChips.tsx` | new `formId` prop (`form=` on each radio) and new exported `valueImageUrl()` |
| `app/styles/06-ox/_primitives.scss` | new `ox-plate-band`/`ox-plate-mark` mixins |
| `app/styles/06-ox/_b3-product.scss` | card: `.ox-card-product__wish`/`__consult`/`__excerpt` rules removed, `.ox-card-product__band`/`__mark` added, plate background, sold-out equal-height reservation recomputed (252/260 → 204/210); gallery: `.ox-gallery__band`/`__mark` now `@include` the shared mixins, unchanged output |
| `app/styles/06-ox/_b4-listing.scss` §12 | the wish corner-swap override removed; `.ox-card-product__variants` repositioned onto the plate (`:not(:empty)` gated chrome); `.ox-swatch` gets `ox-hit-area` |
| `tests/product/OxProductCard.test.tsx` | wishlist/consult/excerpt tests replaced with "renders none of these any more" assertions; the variant-row test rewritten for the plate; two new tests (`form` association, `valueImageUrl` swap); the bundle test gains one assertion |
| `tests/product/VariantChips.test.tsx` | two new `describe` blocks (`formId`, `valueImageUrl`) |
| `docs/build/CARD-2026-09-23.md` | 2026-09-24 addendum recording the owner's override |
| `docs/build/progress/S9a-V4.md` | this file |
| `docs/build/progress/card-measurements.json` | raw CDP measurement JSON |
| `docs/build/progress/visit/card-s9a-v4-390-after.png`, `card-s9a-v4-1440-after.png`, `card-variants-plate-1440.png` | live screenshots |

Not touched: `app/components/product/BuyZone/PdpGallery.tsx` (read only — the
gallery's own wishlist stays), `blocks/`, `pages/`, `layout/` (all out of
scope per the brief).

## Verification

```
$ pnpm typecheck
$ tsc --noEmit
(clean)

$ pnpm vitest run tests/product tests/home tests/common
 Test Files  43 passed (43)
      Tests  585 passed (585)
```

Three unrelated test files (`tests/common/iconbtnAngled.test.ts`,
`tests/common/scrollers.test.ts`, `tests/home/posterRow.test.ts`) timed out
intermittently on the first of the three combined runs of the full command
above (`Error: Test timed out in 5000ms`, always on the FIRST test in the
file, always the one calling `rulesFor()` — `tests/helpers/compiledCss.ts`,
a synchronous full-theme `sass.compile()` on first call per test-file
worker) — different files failing on different runs, none of them touching
`OxProductCard`/`VariantChips`/the card or gallery SCSS regions, and every
one of them passing in well under a second when re-run alone or as part of a
clean full run (shown above: 43 passed, 585 passed, zero failures). Cold
Sass-compile time competing against Vitest's 5000ms default under this
session's own concurrent parallel-batch load, not a regression from this
batch.

```
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 327 file(s) scanned, 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 334 file(s), 0 problem(s)

$ node scripts/check-strings.mjs
check-strings: 346 file(s), 0 problem(s)

$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)

$ node scripts/check-rtl.mjs
check-rtl: 334 file(s), 0 problem(s)

$ node scripts/check-motion.mjs
check-motion: 334 file(s), 0 problem(s)
```

No locale keys added or changed (`ox.card.free_consult` stays, unused, per
the brief), so `node scripts/i18n-merge.mjs` was not needed.

No git add/commit/push/stash/checkout/reset/clean. The preview server (3210)
was neither started nor stopped by this batch; it WAS restarted by the
conductor mid-batch (see step 9), and this batch's own measurements were
retaken after polling it back to 200, per the conductor's instruction.
