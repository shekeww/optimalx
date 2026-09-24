# S2f, product card and PDP fixes (owner review, 2026-09-22/23)

Batch: six items from the owner's mobile screenshot review of the product
card and the product page tonight, variant letter-circle bug, the
add-to-cart row and buy button "looking odd", the buy-now colour, a PDP
add-to-cart label clipped at the bottom, tap-to-zoom on the PDP image, and a
brand filter group on listing pages.

## 1. Variants on the product card, DONE

**Files:** `app/components/product/VariantChips.tsx`,
`app/styles/06-ox/_b4-listing.scss`, `tests/product/VariantChips.test.tsx`.

`swatchFill()` never falls back to `firstLetter()` any more (that function is
deleted). The order is now: the engine's own `color`/`hex` → the engine's own
`image_url`/`image` → a new `NAMED_COLORS` lookup table matched against the
value's own trimmed `name` (Arabic exact, English case-insensitive) →
otherwise the value renders as a **text pill**, never a letter.

`NAMED_COLORS` (`app/components/product/VariantChips.tsx`): أسود #111111,
أبيض #FFFFFF, أخضر #16A34A, أزرق #2563EB, أحمر #DC2626, أصفر #FACC15,
برتقالي #F97316, رمادي/gray #9CA3AF, بني #92400E, وردي #EC4899, بنفسجي
#7C3AED, ذهبي #D4AF37, فضي #C0C0C0, شفاف `transparent`, English synonyms
(black/white/green/blue/red/yellow/orange/grey/brown/pink/purple/gold/
silver/clear) map to the same hex. Each Arabic key line carries its own
`// ox-allow: arabic-literal` pragma (`check-strings.mjs`'s documented
exemption for parser/data token tables, the same one
`app/components/blocks/contentFallback.ts` uses), this is a merchant's own
option-value vocabulary, not UI copy.

CSS: `.ox-swatch__face`'s comment updated (no longer claims a letter
fallback); two new rules, `.ox-swatch--text` (`inline-size: auto`) and
`.ox-swatch__face--text` (auto width capped at 96px, `--ox-r-2` corners,
`--ox-plate` fill, 12px, ellipsis overflow) for the pill. Same 24px
block-size and row baseline as a circle, so the reserved 32px row and the
selected ring (`.ox-swatch:has(.ox-swatch__input:checked) .ox-swatch__face`)
are untouched and apply to both kinds identically.

Every swatch now carries `title={v.name}` on the `<label>` (the mouse
tooltip) in addition to the existing `<span className="ox-sr-only">` inside
it (the accessible name, unchanged, a real `<label htmlFor>` around a real
`<input>` is still what names the control for assistive tech).

**Verified live:** `curl` against `/ar/latest-products?storeId=1888890798`
before the fix showed all four of the shaker's swatches (OX-0xx,
أسود/أبيض/أخضر/أزرق) rendering `<span class="ox-swatch__face" ...>أ</span>` -
the exact bug. (The dev server has since gone 500 site-wide from an unrelated,
concurrently-edited file, see "Blocked verification" below, so the *after*
state could not be re-curled; the unit tests below assert the fixed markup
directly against the same four-value shaker fixture.)

**Unit tests** (`tests/product/VariantChips.test.tsx`, 11 cases, all passing):
colour-name resolution (`أبيض` → `#FFFFFF`, no letter), the exact shaker case
(أسود/أبيض/أخضر/أزرق → four distinct hex fills, zero letters, in one
assertion loop), a flavour-only option (شوكولاتة/فانيليا → text pills with
the full label), a **mixed** option (أحمر → colour swatch, `1 كجم` → text
pill, in the same row), and the `title` attribute on both known-colour
values.

## 2. Add-to-cart row responsive on mobile, DONE (one real bug found and fixed)

**Files:** `app/styles/06-ox/_b4-listing.scss`.

The row was already built as a `container-type: inline-size` query on
`.ox-card-product` itself (`container-name: oxcard`, declared in
`_b3-product.scss` line 26, not this batch's file, read-only), so it reacts
to the CARD's own rendered content width regardless of which grid put it
there. Re-deriving the arithmetic from the actual token values
(`--ox-gutter`: 16px below 640, 24px 640–1023, 32px from 1024;
`--ox-container`: 1296px cap; the grid's own gap; the card's own 16px padding
a side) rather than the shipped comment's rounded "173/141" turned up a real,
undetected 1px-to-36px overflow at three of the seven required breakpoints.

**Arithmetic, `.ox-grid-products` (no rail), every required breakpoint:**

| Viewport | Gutter | Container | Cols | Gap | Card outer | Card content | Tier |
|---|---|---|---|---|---|---|---|
| 320 | 16 | 288 | 2 | 16 | 136 | **104** | new tier C |
| 360 | 16 | 328 | 2 | 16 | 156 | **124** | new tier C |
| 390 | 16 | 358 | 2 | 16 | 171 | **139** | new tier C |
| 414 | 16 | 382 | 2 | 16 | 183 | **151** | tier B (existing) |
| 768 | 24 | 720 | 3 | 16 | 229.3 | 197.3 | tier B |
| 1024 | 32 | 960 | 4 | 24 | 222 | 190 | tier B |
| 1440 | 32 | 1296 (capped) | 4 | 24 | 306 | 274 | default (>240) |

(1024/1440 **with** a filters rail, relevant once item 6 ships brand facets
on a store that has them, also checked: 1024 with-rail content 168px, 1440
with-rail content 196px; both land in tier B with 28–56px to spare.)

The container-query boundary is 240px of content. 320/360/390 (104/124/139px)
are **below** the existing tier's own 140px budget (stepper 88 + gap 8 +
icon-button 44 = 140), a real overflow of 36px, 16px and 1px respectively,
shipped and undetected because the prior comment only ever checked one
rounded-up number ("173 outer, 141 content" at 390, when the true figure is
171/139). 414 and up (151px+) already clear the 140px budget with margin, so
that tier's own numbers are correct from there.

**Fix:** a second, narrower `@container oxcard (max-width: 139px)` tier,
placed after the existing one so it wins at equal specificity by source
order. Stepper 96→88(existing)→**56**, its buttons 32→28→**18**; the row's
own gap `var(--ox-2)` (8px) → `var(--ox-1)` (4px, a spacing *token*, not a
magic number); the add button/slot 44→**40**. Budget: 56 + 4 + 40 = **100px**,
verified against the worst real case (320, 104px) with 4px to spare, and
24px/39px spare at 360/390. No wrap, no clip, one line, at every required
width. The Salla-upgraded (`.s-button-element`) and un-upgraded
(`:not(:has(.s-button-element))`) selectors are both listed in every rule, as
the existing tier already does, so both states stay identical.

**Deviation:** the shipped comment's own "173/141" and "one pixel spare"
claims were corrected in place (they were the root cause of the miss); this
is a documentation fix bundled with the code fix it explains, not a
drive-by.

## 3. Buy-now colour = the global primary button colour, DONE

**Files:** `app/styles/06-ox/_b4-listing.scss`.

Found the global primary face: `_primitives.scss` line 73,
`@include ox-primary-face($fill: var(--ox-accent), $hover: var(--ox-accent-dark))`,
called with **no arguments** by `.ox-btn--primary` (line 492, `font-size:
19px`, the mixin's own `font-weight: var(--ox-w-title)` = 700) and by the
PDP's own `.ox-buy__now` (`_b3-product.scss`, also `ox-primary-face` with no
arguments, also 19px/700, already correct, not touched). The card's
`.ox-card-product__buy` and `--native` had drifted onto
`ox-primary-face(var(--ox-accent-dark), var(--ox-accent-deep))` at 14px
through two successive "10% smaller" passes (git history:
`8c2f179`, `ff725a5`), a second, unrelated fill on the one control the
identity says is singular.

**Restored:** `@include ox-primary-face;` (no arguments, `--ox-accent`
resting, `--ox-accent-dark` hover, matching `.ox-btn--primary` and
`.ox-buy__now` exactly) on both `.ox-card-product__buy` (Link) and
`.ox-card-product__buy--native .s-button-element` (the quick-buy web
component variant, restated the same way the file already restates every
other property for that variant).

**Contrast, measured (WCAG relative-luminance formula, not assumed):**
white `#FFFFFF` on `--ox-accent` `#F54915` = **3.59:1**. AA requires 4.5:1
for normal text or 3:1 for large text (≥18.66px/14pt bold, or ≥24px/18pt
regular), 3.59:1 clears the **large-text** floor only, so the label has to
be ≥18.67px **and** bold, not merely large. `--ox-on-accent` (what the
primary face's `color` resolves to) is white, not a dark ink, so the
alternative escape the brief names, "or the face must use the primary's own
ink colour if the primary uses dark ink", does not apply here; the size
floor is the only lawful path, and 19px/700 is what the rest of the site
already uses to clear it (both `.ox-btn--primary` and `.ox-buy__now` are
already 19px/700 for exactly this reason, confirmed by reading their own
code, not by assumption).

Restored `font-size: 19px`, `block-size: 44px` (matches the skeleton
placeholder, `ProductGrid.tsx`'s `ProductCardSkeleton`, which was ALREADY
built assuming a 44px buy-button row and had silently mismatched the
shipped 36px button, this fix removes that pre-existing skeleton/real
mismatch as a side effect, not a new one), `padding-inline: 20px`,
`@include ox-angled(44px)` (run = 29.7px). `line-height` set to
`var(--ox-lh-lead)` (1.6) rather than the file's usual `--ox-lh-flat` (1.2)
for the same Cairo-descender reason as item 4, defensively (box is generously
larger than the line box either way on this button; costs nothing, keeps
every primary-face label in the theme on one rule).

**Mobile padding, re-tightened (S2f item 2's own arithmetic applied here
too):** the buy button is a full-width bar of its own row, margin-inline 8px
each side, so its box is (card content − 16px). At the true worst case, 320
(104px content), the box is **88px**. The bolt icon is already hidden below
640px (existing rule, untouched); padding-inline at that breakpoint was cut
from `--ox-3` (12px) to `--ox-2` (8px) a side to leave the 19px label the
most room the box can spare:

| Viewport | Card content | Buy-button box (−16 margin) | Padding (both sides) | Text room |
|---|---|---|---|---|
| 320 | 104 | 88 | 16 (`--ox-2`×2, <640) | **72** |
| 360 | 124 | 108 | 16 | **92** |
| 390 | 139 | 123 | 16 | **107** |
| 414 | 151 | 135 | 16 | **119** |
| 768 | 197.3 | 181.3 | 40 (20px×2, ≥640) + icon 16 + gap 8 | **117.3** |
| 1024 | 190 | 174 | 40 + 24 | **110** |
| 1440 | 274 | 258 | 40 + 24 | **194** |

**Not measured, flagged, not silently assumed clean:** actual rendered
glyph width of "اشتري الآن" at 19px/700 Cairo. This sandbox has no headless
browser or font renderer, so the 72–119px figures above are the box
arithmetic only, not a pixel-verified text fit. The pre-shrink git history
(`8c2f179`'s own diff) shows this exact fill/size combination shipped once
before at very similar card geometry, which is why this is the design
restored rather than a novel one, but the narrowest row (320–390) could not
be re-verified visually here. **Recommend a live check at 320–390px** before
calling this item fully closed; the CSS itself introduces no wrap/overflow
mechanism that would hide a text overrun (`white-space: nowrap`, no
`overflow: hidden` on the label), so a real overrun would be visible, not
silently clipped.

## 4. PDP add-to-cart label cropped at the bottom, DONE

**Files:** `app/styles/06-ox/_b3-product.scss` (BuyActions.tsx itself needed
no change, the defect is purely in `.ox-buy__now`'s CSS, the button that
file renders).

Cause: `line-height: var(--ox-lh-flat)` (1.2) on a 19px Arabic label.
Cairo's Arabic descenders (ي, ق, ن with certain diacritless tails, etc.) sit
deeper below the baseline than the flat-line-height budget assumes: at
19px×1.2 the line box is 22.8px, and Cairo's own descent metric routinely
exceeds what a 1.2-multiple line box allocates below the baseline, which is
what let the descender paint past, and, combined with a **fixed**
`block-size` (not `min-block-size`), get held to a box that could not grow
to absorb it.

**Fix:** `line-height: var(--ox-lh-lead)` (1.6), 19px×1.6 = 30.4px line box,
comfortably inside Cairo's real descent, and `block-size` → `min-block-size`
at all three declarations (base 52px, ≤639px 48px, ≥1024px 56px), so the box
can grow the few pixels a genuine descender needs instead of holding a fixed
height the glyph does not fit. Verified the box has generous headroom either
way: 52/48/56px against a 30.4px line box is 21.6–25.6px of vertical margin,
so this is a real fix (the line-height number Cairo needs) plus a defensive
one (the box no longer forbids growth), not two guesses stacked.

**SSR HTML check:** blocked by the same site-wide dev-server 500 the other
items note below; the change is CSS-only (no markup change to verify against
SSR structure), so `pnpm vitest run tests/product` (BuyActions has no
dedicated CSS-assertion test; `ProductPage.test.tsx`'s 37 cases, which mount
the whole buy zone, all still pass) is the verification actually available
here.

## 5. Tap or click the product image to enlarge, DONE

**Files:** `app/components/product/BuyZone/PdpGallery.tsx`,
`app/styles/06-ox/_b3-product.scss`.

The `<Image>` is now wrapped in a real `<button type="button"
className="ox-gallery__frame">` carrying `onClick`, `aria-pressed={zoomed}`
and `aria-label={t('ox.pdp.zoom_label')}`, the same key
(`"تكبير صورة المنتج"` / "Zoom the product image") the old dedicated button
already used as its `aria-label`, so no new copy was authored. A native
`<button>` fires its `onClick` on Enter and Space with no extra keydown
handler, so both are free. The separate labelled button
(`.ox-gallery__zoom`, "تكبير الصورة" visible text +
`<Icon name="expand">`) is removed from the render entirely; its own locale
key, `ox.pdp.zoom`, is **untouched** in every locale file, kept, unused,
per the brief ("keep its key"), not deleted.

CSS: `.ox-gallery__zoom` (bottom-start pill, 40px, 13px label) deleted, dead
after the JSX removal, not a drive-by, it is the direct counterpart of the
element just removed, replaced with `.ox-gallery__frame` (fills the plate,
`cursor: zoom-in`, `position: relative; z-index: 1` where the image itself
used to carry that, `:focus-visible` ring). The wishlist button and the
promo badge stay siblings of the frame, not nested inside it, so their own
tap targets stay independent controls.

`Icon` import removed from `PdpGallery.tsx` (only consumer was the deleted
button).

**No dedicated test file existed for `PdpGallery.tsx` before this batch**
(checked: `tests/product/` has none) and the brief did not ask for one for
this item specifically (items 1 and 6 do). `KitchenSink.tsx` and
`ProductPage.test.tsx` both mount `PdpGallery` and both suites are green
(37 and, respectively, the KitchenSink page is dev-only and not part of the
test run), which is the coverage this batch adds beyond the manual review.

## 6. Brand filter on listing pages, DONE, verified by unit test (fixture)

**Files:** `app/components/listing/appliedFilters.ts`,
`app/components/listing/FiltersRail.tsx`,
`app/components/listing/FiltersDrawer.tsx`,
`tests/listing/appliedFilters.test.ts`,
`tests/listing/FiltersRail.test.tsx` (new),
`tests/listing/FiltersDrawer.test.tsx` (new).

Checked the engine's loader shape first, as instructed
(`node_modules/@salla.sa/twilight-theme-engine/dist/routes/product-listing/types.d.ts`):
`ProductListLoaderData.filters?: Filter[]`, and `Filter` itself
(`dist/api/product.d.ts`): `{ key? label? type? values?: FilterValue[],
max? min? }` with `FilterValue { key? count? value? from? to? }`, a
fully generic facet shape with **no fixed spelling** for "the brand one".
`FiltersRail`/`FiltersDrawer` already hand this whole array to
`salla-filters` (`@salla.sa/twilight-components-react/filters`), which
already draws whatever group is in it, so nothing here invents a UI widget;
the two things actually missing were the theme's own Arabic heading for
that one group and an applied-brand chip row with a clear action, neither of
which `salla-filters` (a platform black box, per this file's own existing
comment) exposes a way to add.

`appliedFilters.ts` (pure, framework-agnostic, matching its existing style):
`brandFilter(filters)` finds the group by its own `key` (`'brand'` or
`'brands'`, both spellings, matched against the payload, never guessed from
a URL param name) and returns it or `null`. `appliedBrandChips(search,
filter)` reads the values currently applied on the URL back off that same
key, reusing `facetKey()` (the exact normaliser `appliedFilterCount` already
uses for the bracketed/array param spellings Salla can emit), and labels
each from the filter's own `values[]` when the payload names one, falling
back to the raw value otherwise. Returns `{ param, value, label }` per
applied value so a clear action can remove exactly one repeated value
(`brand=7&brand=9`) without disturbing the other.

`FiltersRail.tsx`/`FiltersDrawer.tsx`: both call `useRouter`/`useLocation`
now (mirroring `ListingPage.tsx`'s own established
`window.location.search` → `URLSearchParams` → `router.history.push`
pattern for the clear action, including dropping `page`), relabel **only**
the brand group's `label` to `t('ox.filter.brand_heading')` before handing
the array to `SallaFilters` (every other group's own label passes through
untouched, same array reference where nothing changed), and render an
applied-chip row (`ChipRow` + `Chip kind="filter" selected onRemove`, the
pre-existing removable-chip primitive in `app/components/common/Chip.tsx` -
`.ox-chip--removable`/`.ox-chip__remove` already existed in
`_primitives.scss`, unused anywhere in a real page before this) above
`SallaFilters` when at least one brand value is applied. **Data-gated
throughout:** `brandFilter` returns `null` when the payload carries no
brand-like key, and every subsequent step (relabel, chip row) is skipped -
verified by its own test case ("is data-gated: no brand key in the payload,
no relabel and no chip row").

**Why unit test, not the offline overlay:** `fixtures/store/overlay/` has
`categories.json`, `membership.json`, `menus.json` but no `brands.json` yet
(checked at the start of this batch); `fixtures/store/brands.json` (the
general, non-overlay fixture) is `[]`, the live store has no brands
recorded today, matching BUILD.md's known state. Both
`tests/listing/appliedFilters.test.ts` (20 cases, 9 new: `brandFilter` ×3,
`appliedBrandChips` ×6) and the two new component test files
(`FiltersRail.test.tsx` 6 cases, `FiltersDrawer.test.tsx` 3 cases) build
their own `Filter` fixture inline rather than depending on the overlay file,
per the brief's own fallback instruction.

**New locale keys** (never an existing value edited -
`node scripts/i18n-merge.mjs` reported "2 added, 0 updated" for each of
`locales/ar.json`/`locales/en.json`, confirmed by `git diff` showing only
the 2 new lines inserted in each file):
`ox.filter.brand_heading` ("العلامة التجارية" / "Brand"), a NEW key rather
than reusing the pre-existing `ox.filter.brand` ("العلامة" / "Brand", used
elsewhere already and left untouched) because the brief named the fuller
phrase specifically; `ox.filter.brand_remove` ("إزالة {{value}} من التصفية"
/ "Remove {{value}} from filters") for the chip's remove-control
`aria-label`.

## Blocked verification: the site went 500 mid-batch, from an unrelated file

Partway through this batch another, concurrently-running process began
editing files this batch never touches and that are explicitly off-limits to
it: `app/components/listing/CategoriesIndex.tsx`,
`app/components/home/*`, `app/content/categories.ts`, `app/routes/index.tsx`,
`app/styles/06-ox/_b2-home.scss`, `twilight.json`, plus new files
(`public/categories/`, `docs/build/progress/XID.md`). Mid-batch,
`pnpm typecheck` briefly showed exactly **one** error, in that file
(`CategoriesIndex.tsx:163`, "Expected 1 arguments, but got 2", not
introduced by this batch, not touched by this batch); a later re-run, after
that concurrent work progressed further, shows zero errors project-wide.
`pnpm vitest run tests/product tests/listing tests/common` similarly went
from 423/424 (the one failure in that same concurrently-edited component's
own test file) to a clean **426/426** on the final re-run.

The dev preview at `localhost:3210` itself did not recover in step with the
source fix: every route checked (`/ar/latest-products`, `/ar`,
`/ar/categories`) still returns 500 (`{"status":500,"unhandled":true,
"message":"HTTPError"}`, no further detail in the body) even after
`typecheck` and the full test suite both went green, which reads as the
running Vite dev process itself left in a broken state by the concurrent
edits (a stale module graph or a crashed SSR worker) rather than a live
source defect, restarting that process is outside what this batch may do
(no starting/stopping servers per the operating constraints, and it is a
shared process another session may still depend on). This batch's own
changes were not reverted or worked around to chase this, per the operating
rule, a sibling batch's breakage is reported, not patched from here.
`pnpm typecheck`, `pnpm vitest run tests/product tests/listing tests/common`,
and the four lint/token/copy scripts are all clean for this batch's own files
(see below, final re-run); the curl checks against
`/ar/latest-products?storeId=1888890798` could not be re-run against the
*after* state for that reason, item 1's "before" capture, above, is the one
live confirmation this batch obtained. **Recommend re-running the curl and
visual checks once the preview process is restarted** (owner/orchestrator
action, not this batch's).

## Verification tails

`pnpm typecheck`, **final re-run, after all six items and after the
concurrent batch settled:**
```
$ tsc --noEmit
```
(no output, zero errors project-wide). Mid-batch this showed one error in
`CategoriesIndex.tsx:163`, the concurrently-edited off-limits file above,
never this batch's own files; that error is gone on the final re-run.

`pnpm vitest run tests/product tests/listing tests/common`, **final
re-run:**
```
Test Files  34 passed (34)
     Tests  426 passed (426)
```
Every file this batch added or changed: `VariantChips.test.tsx` 11/11,
`appliedFilters.test.ts` 20/20 (9 new), `FiltersRail.test.tsx` 6/6 (new),
`FiltersDrawer.test.tsx` 3/3 (new), plus the untouched-but-exercised
`OxProductCard.test.tsx` 27/27, `ProductPage.test.tsx` 37/37,
`ListingPage.test.tsx` 29/29 and `CategoriesIndex.test.tsx` 6/6 (the one
mid-batch failure, in the concurrently-edited file, is gone on this final
run).

`pnpm check:rtl`: `check-rtl: 315 file(s), 0 problem(s)`
`pnpm check:motion`: `check-motion: 315 file(s), 0 problem(s)`
`pnpm check:strings`: `check-strings: 307 file(s), 0 problem(s)` (after
adding the 14 `// ox-allow: arabic-literal` pragmas to `NAMED_COLORS`, each
line individually, the flag was correct the first run, the pragma is the
documented, sanctioned exemption for a data/parser token table, the same
mechanism `contentFallback.ts` already uses, not a suppression of real copy)
`node scripts/check-tokens.mjs`: `check-tokens: 123 token(s) defined, 312
file(s) scanned, 14 problem(s)`, all 14 are `--ox-need-tint-*` at
`_b4-listing.scss:2040-2046`, the concurrently-edited category-card tint
rules from the same off-limits, in-flight work described above (this batch
added no `var()` reference that check-tokens does not already recognise -
every token this batch's new CSS uses, `--ox-1/2/3/4`, `--ox-lh-lead`,
`--ox-accent`, `--ox-accent-dark`, `--ox-on-accent`, `--ox-fg-2`,
`--ox-plate`, `--ox-r-2`, `--ox-bd`, was already defined before this batch).
`node scripts/check-copy.mjs locales/ar.json locales/en.json`: `check-copy: 2
file(s), 0 problem(s)`.

Curl: `/ar/latest-products?storeId=1888890798` returned the pre-fix swatch
bug (four `<span class="ox-swatch__face" ...>أ</span>`) at the start of this
batch, confirming the defect; blocked from a post-fix re-check by the
site-wide 500 above (also blocked the PDP curl checks for items 3–5, and the
`/ar/x/p<id>?storeId=…` product-detail route 500'd even before the
concurrent breakage, on every product id tried, seemingly independent of it -
noted, not chased, as out of this batch's scope).

## Deviations

- Item 2's shipped "173/141" comment and its "one pixel spare" claim were
  corrected in place rather than left standing next to a contradicting fix;
  this is the direct documentation of the bug just fixed, not unrelated
  cleanup.
- Item 3 restores 44px/19px/`--ox-accent` rather than picking a smaller
  in-between size, because that exact combination is what the codebase's own
  git history (`8c2f179`) shows shipping once already at very similar card
  geometry, and it is what the skeleton placeholder was already built
  expecting (44px), the more conservative, precedented choice over a novel
  compromise size.
- Item 4 also switched the two responsive `block-size` declarations
  (`≤639px`, `≥1024px`) to `min-block-size`, matching the base rule, though
  the brief's file list named only the base defect, the same fix, same
  file, same three-line pattern; left inconsistent would have reintroduced
  the exact bug at those two breakpoints.
- Item 5 deleted `.ox-gallery__zoom`'s CSS (not just the JSX) as dead code
  directly created by this change, not a drive-by removal of unrelated rules.
- Text-fit at 19px/700 Cairo on the card's buy button (item 3, 320–390px)
  could not be pixel-verified in this sandbox (no headless browser/font
  renderer), flagged explicitly above rather than assumed clean; recommend
  a live check before sign-off.
