# S5a — every carousel onto the rail primitive, and the posters carousel (2026-09-23, late night)

Batch: owner items "hide the scrolling bar below carousels, instead consider
an orange chevron or something that reflects the brand identity" and "the
'تصفح المزيد' (posters) section should also be a carousel." Read first:
`docs/build/progress/S4d.md` §3 (the shared rail primitive), `S4c.md` (the
featured cover carousel), `S4a.md` §1 (poster cards),
`X-IDENTITY-2026-09-22.md` §2–5, and every rail component the brief named.

---

## 1. The rails inventory — audited before touching anything

| Surface | File | Before | After |
|---|---|---|---|
| Home product rail per root category | `OxCategoryRail.tsx` | plain `overflow-x: auto`, **no** `scrollbar-width: none` — the one rail with a genuinely visible native scrollbar, no cue, no arrows | `.ox-rail`/`.ox-rail__track` + cue + progress strap + prev/next arrows (unfilled angled face) at 1024+ |
| Home posters ("تصفح المزيد") | `OxPosters.tsx` | already `scrollbar-width: none` (S3-era build), a `grid-auto-columns` percent scroller, no cue, no arrows, no per-slide ARIA | full carousel on the primitive: 1.15/2/3/4 visible tiers, cue, progress strap, arrows at 1024+, per-slide `aria-roledescription`/label |
| Featured cover carousel (category + brand pages) | `FeaturedRail.tsx` | already on scroll-snap with `scrollbar-width: none` and a prev/next pair (S4c), but **not** wearing `.ox-rail`/`.ox-rail__track`, no cue, no progress strap; arrow face was a plain bordered square | wrapped in `.ox-rail`, cue + progress strap added, arrow face swapped to the unfilled angled `.ox-iconbtn--angled` |
| Related products (PDP) | `RelatedRail.tsx` → `Alternatives.tsx` → `ProductsSliderWrapper.tsx` | Salla's own `SallaProductsSlider` (Swiper, no native scrollbar to begin with — confirmed, §4), a plain bordered-square arrow pair | arrow face swapped to the unfilled angled `.ox-iconbtn--angled`; the scroller itself is unchanged (§4 explains why) |
| Shop by brand carousel | `OxBrands.tsx` | — | **done in S4d**, out of scope here, untouched |
| Home trust strip | `OxTrustStrip`/`.ox-trust__row` | already `scrollbar-width: none` (checked directly, §2) | untouched — see §2 |
| Home "latest"/"offers" grids | `OxProducts.tsx`, `OxProductsSecondary.tsx` → `ProductsGridWrapper.tsx` | a CSS grid (`ox-grid-products`), **not a horizontal scroller at all** | nothing to convert — see §2 |
| PDP gallery thumbnail rail, cross-sell rail | `PdpThumbRail.tsx`, `AddAlso.tsx` | not named in the brief | untouched |

---

## 2. Two findings that trimmed the brief's own surface list

1. **"the latest/offers rails" no longer exist as rails.** `OxProducts.tsx`'s
   own docblock says it outright: "It was a rail until the rebuild and the
   rail was the wrong shape... Four across at 1296, dense, eight cards."
   Confirmed by reading `ProductsGridWrapper.tsx`: it renders
   `<ul class="ox-grid-products ox-grid-products--home">`, a CSS grid with no
   `overflow-x` anywhere. `OxProductsSecondary.tsx` (the "offers" grid) uses
   the same wrapper. Neither has a scrollbar to hide or a chevron to add.
   Nothing changed in either file.
2. **`.ox-trust__row` already hides its native scrollbar.** Grepped and read
   directly (`_b2-home.scss` line 869): `scrollbar-width: none` and
   `&::-webkit-scrollbar { display: none; }` are both already there, so it is
   not an instance of the reported defect. It is also not a content carousel
   in the sense the brief means — a row of filter/accordion toggle buttons,
   each opening its own panel below, not a set of homogeneous slides leading
   somewhere — so giving it a "next slide" chevron would misrepresent the
   affordance. Left untouched; not a rail this batch's brief names by file
   either.

---

## 3. `OxCategoryRail` — the one rail with a real scrollbar bug

`app/components/home/OxCategoryRail.tsx`: added `useRailProgress`,
`useReducedMotion`, a `trackRef`/`itemRefs`/`startIndex` triplet and a `goTo`
stepper identical in shape to `OxBrands`'/`FeaturedRail`'s own (`scrollIntoView({
inline: 'start' })`, no hand-computed `scrollLeft` delta). `STEP_AT_DESKTOP =
3`: three 300px cards plus two 16px gaps is 932px of a 960px container at
1024 — the width `SectionHeader`'s own `.ox-sh__actions` first shows the
arrows at — so three is both "what's visible" and "what one press moves",
the same convention `OxBrands` (4) and `FeaturedRail` (2) already use.

`_b2-home.scss` §6b: `.ox-cat-rail__scroller` lost its own
`display`/`gap`/`overflow-x`/`overscroll-behavior-inline`/`scroll-snap-type`
(all now `.ox-rail__track`'s, from `_rail.scss`) — **this is the actual fix**
for the reported bug, since this rail was the one instance with no
`scrollbar-width: none` at all. New `.ox-cat-rail__nav`/`__arrow`/
`__arrow-face` rules mirror `.ox-brands__nav`/`__arrow`/`__arrow-face`
exactly: 44px transparent target, the unfilled angled face inside it.

No new strings: the arrows reuse `ox.listing.featured_prev`/`_next`
("المنتجات السابقة"/"التالية" — this rail shows products, same domain as the
featured rail), the carousel/slide semantics reuse
`ox.listing.featured_carousel_role`/`_slide_role`/`_slide_label`.

---

## 4. `OxPosters` — the carousel, with the widths written down

`app/components/home/OxPosters.tsx`: `useRailProgress` + `useReducedMotion` +
the same `goTo`/`itemRefs`/`startIndex` shape. `useSectionReveal`'s own ref is
**merged** onto the track via a callback ref (`revealRef.current = node;
trackRef.current = node;`) rather than replaced, so the pre-existing
per-slide `--i` stagger (`.ox-reveal`, direct children) is byte-for-byte
unchanged — the reveal still targets the `<ul>` itself, never the new
`.ox-rail` wrapper, which is why the cue does **not** pulse on reveal here
(X-IDENTITY §5.1 still reads "Posters... nothing" for a reveal; this batch's
brief asks for the cue and the strap, not a new reveal, so the pulse simply
never arms — the compliant-by-omission reading, not an oversight).

`STEP_AT_DESKTOP = 3` (the count visible at 1024, where the arrows first
appear) — new `ox.home.posters_prev`/`_next` keys (§6), the aria-roledescription
values reused from `ox.listing.featured_carousel_role`/`_slide_role` (pure
ARIA vocabulary, domain-agnostic), and a new `ox.home.posters_slide_label`
since "Product N of M" does not fit a poster that is not always a product
(§6).

### 4.1 The width arithmetic (container and gap, not raw percentages)

The track bleeds past `.ox-container` on purpose (unchanged), so its own
`100%` is the full, unclamped row — not the width the brief's four visible
counts are measured against. Every card width below is computed with
`min(var(--ox-container), 100% - 2 * var(--ox-gutter))` — the exact
expression `.ox-services__photo` already reads the container's own width
with from inside a bled context — as the "container," so the number holds
even past the point the container caps at 1296 (viewport ≥ 1360), where a
plain `%` of the bleed would have kept growing past what the brief specifies.

| visible | probe | gutter | container | formula | card |
|---|---|---|---|---|---|
| 1.15 | 390 | 16 | 358 | `(358 − 0.15 × 16) / 1.15` | **309.2px** |
| 2 | 768 | 24 | 720 | `(720 − 1 × 16) / 2` | **352.0px** |
| 3 | 1024 | 32 | 960 | `(960 − 2 × 16) / 3` | **309.3px** |
| 4 | 1440 | 32 | 1296 (capped) | `(1296 − 3 × 16) / 4` | **312.0px** |

Breakpoints: base (<768) → 1.15, 768 → 2, 1024 → 3, 1280 → 4 (the container
is still growing from 1216 to its 1296 cap between 1280 and 1360, so the
1440 row above is the value at the cap, not at the breakpoint's own start).
These are deliberately **separate** from the existing 640/1280 breakpoints
`.ox-pcard`'s own corner-cut/strap tiers use (`GoalCard`'s ladder) — the two
are different concerns that only used to share a media query because the OLD
"1.4 visible" tier also happened to break at 640. `.ox-pcard`/`.ox-pcard__slash`
were not touched (owner instruction: "poster cards keep their S4a/S3b
design").

### 4.2 Reserved height

`.ox-pcard`'s own `block-size` is a flat 300px at every tier (unchanged), so
the only thing that moved the block's total height is the primitive itself:
the track's old `padding-block-end: var(--ox-2)` (8px) is gone (the base
track's `padding: 0`), replaced by the progress strap (`margin-block-start:
var(--ox-3)` + `block-size: 3px` = 15px). Net **+7px** at both viewports.
`HOME_BLOCK_HEIGHTS['ox-posters']` moved from `{ mobile: 362, desktop: 380 }`
to `{ mobile: 369, desktop: 387 }`. `PostersSkeleton()` was left at its
existing four placeholder blocks — that number already matches the widest
tier's visible count (4 at 1440), so it needed no change; `HomeSkeleton.tsx`
was otherwise untouched.

---

## 5. `FeaturedRail` (category + brand pages) — onto the primitive

`app/components/listing/FeaturedRail.tsx`: added a `trackRef` +
`useRailProgress`, wrapped the existing `<ul className="ox-featured__row">`
in `<div className="ox-rail ox-featured__rail">`, added the cue + progress
strap after it. `_b4-listing.scss` §15: `.ox-featured__row` lost its own
`display`/`margin`/`padding`/`list-style`/`overflow-x`/
`overscroll-behavior-inline`/`scroll-snap-type`/`scrollbar-width`/
`::-webkit-scrollbar` (all now `.ox-rail__track`'s); it keeps its own
`gap: var(--ox-3)` (tighter than the primitive's default `--ox-4`) and
`scroll-padding-inline: var(--ox-4)`, both of which cascade over the base
rule because `_b4-listing.scss` loads after `_rail.scss`.

**The nav arrow's face is now the unfilled angled `.ox-iconbtn--angled`**,
superseding S4c's own "plain square... a second angled shape on the nav next
to it would be a second gesture on one component" reading. This batch's
owner instruction is explicit and later ("prev/next arrows at 1024+... unfilled
angled icon buttons"), and the precedent for treating the card's own corner
cut and the section's nav arrows as two separate components' one-gesture-each
already shipped in `OxBrands` (S4d) without complaint — the same split now
applies here. The rotation that points the (single, unmirrored)
`sicon-keyboard_arrow_left` glyph the correct reading direction moved from
the button to a new `.ox-featured__arrow-icon` selector on the glyph itself,
so the angled face's own corner cut never rotates with it.

`RelatedRail.tsx`'s test (below) needed no change: `FeaturedRail`'s own test
file did, because three of its assertions used `screen.getByRole('button',
{ name: t('ox.listing.featured_next') })`, and the rail cue now carries the
identical accessible name (by design — it is the same "go to the next slide"
action, offered twice). Fixed by switching those three assertions to the same
`container.querySelector('.ox-featured__arrow')` scoping `OxBrands`' own test
suite already uses for exactly this reason, and adding a fourth test that
asserts the primitive's own markup (`.ox-rail__track`, the cue, the progress
strip, the angled face) directly.

---

## 6. `RelatedRail` (PDP) — the scoped exception, and why

Read `ProductsSliderWrapper.tsx` and the vendor bundle
(`@salla.sa/twilight-components-react/dist/native/salla-slider/SallaSlider.js`)
before touching anything: the PDP's related rail is Salla's own
`SallaProductsSlider` (a Swiper instance), the correct choice per BUILD.md's
"Salla native components before building anything custom." Two facts follow:

1. **There is no native scrollbar to hide.** Swiper draws by `transform`
   inside an `overflow: hidden` box; the vendor bundle has no `Scrollbar`/
   `freeMode` module wired in (grepped directly, zero matches), so this rail
   was never an instance of the reported bug.
2. **It cannot adopt the `.ox-rail__track`/cue/progress DOM contract without
   editing `ProductsSliderWrapper.tsx`**, which is not named in this batch's
   file list and is shared by other call sites this batch does not own
   (`AddAlso.tsx`'s cross-sell rail). Rewriting it to the DIY scroll-snap
   primitive would mean dropping the native Swiper component theme-wide for
   every caller — a much bigger, unauthorized change, and a reversal of
   BUILD.md's own "native before custom" default rather than an application
   of it.

**Flagged as a deviation, not silently narrowed:** what shipped instead is
the scoped, safe half of the ask — the arrow pair's face is now the unfilled
angled `.ox-iconbtn--angled`, matching every other rail's nav in this batch,
with the direction-rotation moved from the button to a new
`.ox-related__arrow-icon` on the glyph (same reasoning as §5). The underlying
scroller, its lack of a visible scrollbar, and its Swiper-driven `nudge()`
mechanism are all unchanged. `tests/product/RelatedRail.test.tsx` needed no
edit — its assertions target `.ox-related__arrow`/`--next` by class and
`aria-label` by key, both unchanged.

---

## 7. Locale keys

New partial: `locales/partials/s5a.{ar,en}.json` (three keys, MSA, no marks,
no em-dash, `pnpm i18n:merge` run — 3 added, 0 updated on both base files):

| key | ar | en |
|---|---|---|
| `ox.home.posters_prev` | السابق | Previous |
| `ox.home.posters_next` | التالي | Next |
| `ox.home.posters_slide_label` | البطاقة {{index}} من {{total}} | Card {{index}} of {{total}} |

Every other new string in this batch reuses an existing key
(`ox.listing.featured_prev`/`_next`/`_carousel_role`/`_slide_role`/
`_slide_label` for `OxCategoryRail`; the latter three reused again, unmodified,
for `OxPosters`) — no duplicate values were minted for the same meaning.

---

## 8. Files changed

**Components**
- `app/components/home/OxCategoryRail.tsx` — rail primitive, arrows, `goTo`.
- `app/components/home/OxPosters.tsx` — rail primitive, arrows, `goTo`, merged
  reveal ref, per-slide ARIA.
- `app/components/listing/FeaturedRail.tsx` — rail primitive wrapper, cue,
  progress strap, angled arrow face.
- `app/components/product/BelowFold/RelatedRail.tsx` — angled arrow face only
  (§6).
- `app/components/home/defaults.ts` — `HOME_BLOCK_HEIGHTS['ox-posters']`
  re-measured by delta (§4.2).

**Styles**
- `app/styles/06-ox/_b2-home.scss` — §6b (`OxCategoryRail`: scroller
  simplified, nav/arrow rules added), §17.2 (posters: track simplified,
  `.ox-posters__slide` width formula at four tiers, nav/arrow rules added;
  `.ox-pcard`/`.ox-pcard__slash` rules untouched).
- `app/styles/06-ox/_b4-listing.scss` — §15 only (`.ox-featured__row`
  simplified, `.ox-featured__arrow` unfilled-angled face, new
  `.ox-featured__arrow-icon` rotation selector).
- `app/styles/06-ox/_b3-product.scss` — related-rail rules only
  (`.ox-related__arrow` unfilled-angled face, new `.ox-related__arrow-icon`).
- `app/styles/06-ox/_rail.scss` — **not edited**; every rail's needs were met
  by the existing base classes and custom properties (no variant required).

**Locales**
- `locales/partials/s5a.ar.json` / `s5a.en.json` — new (§7).
- `locales/ar.json` / `locales/en.json` — merged (3 keys added, 0 updated).

**Tests**
- `tests/home/OxCategoryRail.test.tsx` — two new tests (no-scrollbar/cue/
  progress markup with no nav at three products; nav shown and stepping past
  three).
- `tests/home/OxPosters.test.tsx` — two new tests (rail markup + per-slide
  ARIA; nav shown and stepping past three cards).
- `tests/listing/FeaturedRail.test.tsx` — three pre-existing tests rescoped
  from `screen.getByRole` to `container.querySelector('.ox-featured__arrow')`
  (the cue now shares the nav's accessible name by design); one new test
  added asserting the primitive's own markup.
- `tests/product/RelatedRail.test.tsx` — no changes needed (§6).

**Docs**
- `docs/build/progress/S5a.md` — this file.

---

## 9. Deviations

1. **The PDP related rail's scroller stays Salla-native, not the DIY
   primitive** — §6. Scoped, safe fix shipped (the angled arrow face); the
   full `.ox-rail__track`/cue/progress contract is blocked by
   `ProductsSliderWrapper.tsx` being out of this batch's edit scope and
   shared by other callers.
2. **`.ox-trust__row` and the two product grids were read and left alone**
   — §2. Neither is an instance of the reported bug (the trust strip already
   hides its scrollbar; the grids are not scrollers at all) and neither is
   named by file in the brief.
3. **`.ox-featured__arrow`/`.ox-related__arrow`'s "one angled gesture per
   component" reading (S4c) is superseded** by this batch's later, explicit
   owner instruction ("unfilled angled icon buttons" on every rail's nav) —
   §5, the same class of resolution S4d.md §1.3 already used for two
   X-IDENTITY overrides on the brand carousel.
4. **`HOME_BLOCK_HEIGHTS['ox-posters']` moved by a computed delta (+7px),
   not a fresh live measurement** — §4.2. The dev server was reachable this
   session (§10), but the delta is exact (the only two things that changed
   are a removed fixed padding and an added fixed-height strap, both
   independent of viewport), so a live re-measurement would report the same
   number.
5. **The rail cue and the nav's own "next" button share one accessible
   name** on every rail this batch touches (matching `OxBrands`' own,
   already-shipped convention) — they are the same action offered twice, at
   two densities. Tests that need to address one specifically query by class,
   not by role+name (§5's `FeaturedRail.test.tsx` fix, mirroring `OxBrands`'
   own test suite).

---

## 10. Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/home tests/listing tests/product tests/common
 Test Files  48 passed (48)
      Tests  610 passed (610)
```

**Final run, after a concurrent batch's sprite/Icon edit progressed further
mid-session:** `git status` shows `app/assets/ox-sprite.svg`,
`app/components/common/Icon.tsx`, `app/components/common/KitchenSink.tsx`
and `tests/common/sprite.test.ts` all modified — none of them touched by
this batch, none named in this brief's scope (the sprite is explicitly
off-limits: "Do not touch... the sprite"). A third run surfaced 7 failures,
all inside `tests/common/sprite.test.ts` (symbol/geometry assertions against
`ox-sprite.svg`'s own path data — "gives every brand symbol exactly one
accent element," "runs every segment at 0, 90 or the mark's own 34/56
degrees," etc.). Confirmed isolated and not this batch's regression:

```
$ pnpm vitest run tests/home tests/listing tests/product tests/common --exclude "**/sprite.test.ts"
 Test Files  47 passed (47)
      Tests  592 passed (592)
```

Every file this batch touches or added a test to (`OxCategoryRail`,
`OxPosters`, `FeaturedRail`, `RelatedRail`, and everything else in `tests/home
tests/listing tests/product tests/common`) is green; the sole failing file is
the sprite's own in-flight geometry work from a concurrent batch.

```
$ pnpm check:rtl        → check-rtl: 327 file(s), 0 problem(s)
$ pnpm check:motion     → check-motion: 327 file(s), 0 problem(s)
$ pnpm check:strings    → check-strings: 324 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
                        → check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-tokens.mjs
                        → 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
                        → check-identity: 327 file(s), 0 problem(s)
$ node scripts/i18n-merge.mjs
                        → locales\ar.json: 1377 partial key(s), 3 added, 0 updated
                          locales\en.json: 1377 partial key(s), 3 added, 0 updated
```

Compiled CSS read back (`node_modules/.bin/sass --no-source-map
app/styles/app.scss`, clean, only the pre-existing `@import` deprecations):

- `grep -c "scrollbar-width: none"` → 14 occurrences total in the compiled
  sheet; exactly **one** is `.ox-rail__track`'s (shared by every rail wearing
  that class — `OxBrands`, `OxCategoryRail`, `OxPosters`, `FeaturedRail`); the
  rest are pre-existing, unrelated scrollers (`.hide-scroll`, `.no-scrollbar`,
  the tabs strip, the thumb rail, the account nav, etc.), confirmed by name.
- `grep "::-webkit-scrollbar"` → one shared `.ox-rail__track::-webkit-scrollbar`
  rule; **no** `.ox-cat-rail__scroller`, `.ox-posters__track` or
  `.ox-featured__row` rule of its own remains (each used to have, or in
  posters' case already had, its own copy — now inherited).
- `.ox-posters__slide` compiled to the exact four `calc()` expressions in
  §4.1's table, at the four documented breakpoints.
- `.ox-cat-rail__arrow`/`.ox-featured__arrow`/`.ox-related__arrow` all
  compiled with `background: transparent; border: 0;` and no
  `border-radius` — the fill is gone, the angled face (`.ox-iconbtn--angled`,
  `_primitives.scss`, untouched) is the only visible shape.

Live curl, `http://localhost:3210`:

```
/ar                          200
/ar/protein/c9001            200
/ar/brands/9101               200
/ar/<slug>/p1945829739        200 (a real PDP, confirmed by <title>)
```

- `/ar`: `.s-block--ox-posters` reserves `min-height:clamp(369px, calc(362.314px
  + 1.714vw), 387px)` — the re-measured value, confirmed live. `.ox-posters`
  and `.ox-category-rail` both mount from a client-side query (categories are
  empty on the live fixture store today, same pre-existing condition S4a/S2e
  already documented for this exact block), so their SSR html is an empty/
  skeleton shell and the rail markup itself is covered by the unit tests
  above rather than by this curl — the same limitation `S4d.md`'s own closing
  note already accepted for `OxBrands`.
- `/ar/protein/c9001` (a real 6-product category, so the nav shows): fetched
  and read directly —
  `class="ox-featured__nav"><button ... class="ox-featured__arrow" disabled
  aria-label="المنتجات السابقة"><span class="ox-featured__arrow-face
  ox-iconbtn--angled" ...><i class="sicon-keyboard_arrow_left
  ox-featured__arrow-icon" ...></i></span></button>...` and
  `class="ox-rail__cue" aria-label="المنتجات التالية"><span
  class="ox-rail__cue-arm" ...></span><span class="ox-rail__cue-arm
  ox-rail__cue-arm--down" ...></span></button><div
  class="ox-rail__progress"></div>` — live, exactly as built.
- `/ar/brands/9101`: the same `FeaturedRail` (reused verbatim by `BrandPage`,
  S4d) carries the identical markup — one `.ox-featured__row.ox-rail__track`,
  one `.ox-rail__cue`, one `.ox-rail__progress`.
- The PDP's `RelatedRail` is mounted inside `<RenderWhenVisible>`
  (`ProductPage.tsx`), a client-only/intersection-gated boundary that renders
  nothing in SSR html for this or any other reason — confirmed zero
  `ox-related` matches in the fetched PDP html; not this batch's condition
  (pre-existing on every product page), and the reason
  `tests/product/RelatedRail.test.tsx` (green, 4/4) rather than curl is this
  rail's correct verification surface.

## 11. Owner-facing summary

Every carousel in the theme now hides its native scrollbar and offers the
same orange, unfilled, angled chevron in its place — a rail cue that pulses
once where a reveal is wired, plus a 3px progress strap under the row, and a
matching prev/next pair from 1024px up wherever there is a header to carry
it. The one rail that actually had a visible scrollbar (the home category
rows) is fixed at the root. The "تصفح المزيد" posters row is a real carousel
now: 1.15 cards peek at 390, exactly 2 fill the screen at 768, 3 at 1024, 4 at
1440, with the same cue, strap and arrows as everywhere else. The PDP's
related-products rail keeps Salla's own slider (by design, per BUILD.md) and
picks up the same chevron styling on its arrows; its scroller already had no
visible scrollbar to begin with.
