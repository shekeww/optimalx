# S4c, featured rail rebuilt into a cover carousel (2026-09-23)

Batch: owner item "on each category section, add a carousel for cover images
that are larger, fitting 2 cover images above the products grid, to showcase
and emphasize featured products of each category." Read `X-IDENTITY-2026-09-22.md`
§§2–3, `docs/build/progress/S2d.md` and `S2g.md` (the featured rail as it
shipped), `app/components/listing/{FeaturedRail,ListingPage,ExploreLinks}.tsx`,
`useTaxonomyLinks.ts`, `app/components/common/Price.tsx` and
`app/components/product/OxProductCard.tsx` before starting, per the brief.

## What changed and why

The small-card featured rail (2.2 cards visible below 1024, 4 from 1024 up,
square 1:1 plate) is replaced, not kept beside a new carousel: it is now a
scroll-snap cover carousel, one cover below 768 with a 12% peek of the next,
exactly two covers 768 and up (never a third or fourth step the way the old
rail had one at 1024), a 3:2 plate instead of 1:1, `aria-roledescription`
carousel/slide semantics, and a prev/next pair at 1024 and up that hides
itself once there is nothing left to scroll to. The data source and every
gate, featured tag else the first four to six, hidden under two products,
never a per-serving price, no claims copy, are unchanged; only the rail's
own presentation is rebuilt.

## Files

- `app/components/listing/FeaturedRail.tsx`, `featuredProducts()` and
  `featuredCoverImage()` untouched (same data source and gates as today).
  The component gained: a `startIndex` carousel cursor (`useState`), per-slide
  refs (`useRef<Array<HTMLLIElement | null>>`), a `goTo()` stepper that
  scrolls the target slide into view with `scrollIntoView({ inline: 'start' })`
  rather than a hand-computed `scrollLeft` delta (RTL-safe with no manual sign
  flip), `useReducedMotion()` feeding the scroll's `behavior` option, a
  prev/next pair rendered through `SectionHeader`'s existing `actions` slot
  (only when `items.length > 2`), `aria-roledescription`/`aria-label` on the
  row and on every slide, `aspectRatio="3/2"` and `priority={index < 2}` on
  the cover `Image`, and widened `RAIL_IMAGE_WIDTHS`/`RAIL_IMAGE_SIZES` for
  the larger rendered width. No change to `ListingPage.tsx`'s render line -
  see Deviations.
- `app/styles/06-ox/_b4-listing.scss` section 15 only, item width formula
  (88% below 768, `(container - gap) / 2` from 768), plate `aspect-ratio: 3/2`
  and its three corner-cut tiers (40/27, 48/32.4, 64/43.2, see Measured
  numbers), and two new rules, `.ox-featured__nav`/`.ox-featured__arrow`, for
  the prev/next pair. Nothing outside section 15 touched (confirmed by
  `git diff`, the file's other, larger diff in this working tree belongs to a
  concurrent batch, not this one).
- `tests/listing/FeaturedRail.test.tsx`, extended the `Image` mock to pass
  through `priority`/`className` (needed to assert on `.ox-featured__img` and
  its eager/lazy split, which no earlier test in this file queried); added
  five cases: eager/lazy split, carousel/slide `aria-roledescription` plus the
  position label, nav hidden at two items, nav shown with prev disabled at
  the start for six items, and next stepping the cursor forward and
  re-enabling prev. All nine pre-existing cases pass unmodified.
- `locales/partials/s4.ar.json` / `s4.en.json` (new) and `locales/ar.json` /
  `locales/en.json`, five new `ox.listing.*` keys, mirrored identically in
  both places: `featured_prev`, `featured_next`, `featured_slide_label`
  (`{{index}}`/`{{total}}`), `featured_carousel_role`, `featured_slide_role`.
  No existing key's value touched. `node scripts/i18n-merge.mjs --check`
  reports 0 pending changes on both base files.
- `docs/build/progress/S4c.md`, this file.

## Decisions

- **`ListingPage.tsx` needed no diff.** It already renders
  `<FeaturedRail products={products} />` under the `isTypeOrGoalListing`
  gate with no other prop; the carousel rebuild is entirely internal to
  `FeaturedRail`'s own markup and CSS, so the file the brief named as
  editable required nothing. Left untouched rather than making a cosmetic
  edit to justify the grant.
- **"Keep the section title and 'عرض الكل' as today."** Checked: the shipped
  `FeaturedRail` has never rendered a "view all" link, `SectionHeader`'s own
  `viewAll` prop exists and is used elsewhere (`OxCategoryRail.tsx`, the home
  page's per-category rail) but was never passed here. Read literally: kept
  the title (`SectionHeader` with `title`/`titleId`, unchanged) and did not
  add a `viewAll` link, since adding one would not be "as today", it would
  be new. Flagged rather than guessed which of the two conflicting readings
  ("keep what exists" vs. "there should be one, like the home rail") was
  meant.
- **Nav mechanics: `scrollIntoView`, not a `scrollLeft` delta.** The
  codebase's only precedent (`RelatedRail.tsx`'s `nudge()`) computes
  `direction * distance` and calls `scrollBy`, which is only correct in RTL
  because its first two routes hand off to Swiper's own direction-aware
  `slideNext`/`slidePrev`; its plain-scroll fallback inherits whatever the
  browser's RTL `scrollLeft` convention is (Chromium/Firefox "negative",
  older Safari "reversed", the two disagree). This rail has no Swiper
  instance to defer to, so `goTo()` instead calls
  `itemRefs.current[i]?.scrollIntoView({ inline: 'start', ... })` on the
  target slide: the browser resolves "start" against the document's own
  reading direction, so no direction sign is computed by hand anywhere in
  this file.
- **`showNav = items.length > 2`, not a `ResizeObserver` measurement.** At
  1024 and up exactly two covers fill the container by construction (the
  768-and-up width formula never changes above 1024), so whether there is
  anything left to scroll to is already known from `items.length` at render
  time, on both the server and the client, identically, with nothing to
  measure after paint and nothing that can mismatch at hydration.
- **Corner-cut tiers: all three of §3.3's now ship, not two.** The old rail's
  own breakpoint (a single jump at 1024) had nowhere to hang the
  spec's middle tier (lean 48 / run 32.4) and S2g documented that as a
  flagged simplification. This rebuild's own item-width breakpoint at 768 is
  a real place for it, so the plate now carries all three tiers, lean 40
  below 768, lean 48 from 768 to 1023, lean 64 from 1024 up, closing that
  gap as a side effect of the width rebuild, not as separate scope creep.
- **Prev/next stay unangled.** The plate's corner cut is this component's one
  angled primitive (X-IDENTITY §3.3, "one angled gesture per component"); the
  nav pair is drawn as the same plain 44px square `.ox-related__arrow`
  already uses elsewhere in this theme, not a second clipped shape.
- **`aria-roledescription` values are translated, not left as bare English
  ARIA vocabulary**, consistent with this codebase's own precedent of
  translating even small a11y microcopy (`ox.a11y.wishlist_toggle`,
  `ox.pdp.rail_prev/next`) rather than leaving a literal in `app/`.

## Measured numbers (390 / 768 / 1440)

Container width (`min(1296px, 100% - 2×gutter)`, gutter 16/24/32 below
640/640–1023/1024+):

| Probe | Gutter | Container |
|---|---|---|
| 390 | 16px | 358px |
| 768 | 24px | 720px |
| 1440 | 32px | 1296px (capped) |

Cover (plate) width and height, 3:2 ratio (`h = w × 2/3`), gap `var(--ox-3)` = 12px:

| Probe | Formula | Cover width | Plate height |
|---|---|---|---|
| 390 (<768 tier) | `88% of container` | 315.0px | 210.0px |
| 768 (≥768 tier) | `(container − gap) / 2` | 354.0px | 236.0px |
| 1440 (≥768 tier) | `(container − gap) / 2` | 642.0px | 428.0px |

Whole-card reserved height (plate + 3×`var(--ox-2)` 8px gaps + name min 40px +
price min 22px + cta min 20px, every non-plate row already reserved its own
`min-block-size`, unchanged from the small-card rail):

| Probe | Total |
|---|---|
| 390 | 316.0px |
| 768 | 342.0px |
| 1440 | 514.0px |

Corner-cut tiers (X-IDENTITY §3.3, `ox-x-corner()`, run computed by
`ox-run()` at $ox-angle-tan = 0.6745, not hand-entered):

| Breakpoint | Lean | Run |
|---|---|---|
| below 768 | 40px | 27.0px |
| 768–1023 | 48px | 32.4px |
| 1024 and up | 64px | 43.2px |

Confirmed against the compiled CSS (`npx sass app/styles/app.scss`):
`clip-path: polygon(0 40px, 27px 0, ...)`, `... 48px, 32.4px ...`,
`... 64px, 43.2px ...`, each with its `[dir='ltr']` mirror, at the three
media queries above.

## Verification tails

`pnpm typecheck`:
```
$ tsc --noEmit
(clean, no output)
```
(Two intermediate runs during this batch surfaced errors in
`app/components/layout/Header/{NavBar,MobileDrawer}.tsx` and
`app/content/nav.ts`, none of them files this batch touches. `git status`
shows `app/content/nav.ts`, `app/components/layout/navLinks.ts` and
`app/components/listing/useTaxonomyLinks.ts` modified by a concurrent batch;
the specific errors changed shape between the two runs, confirming an
in-flight edit elsewhere rather than anything in this diff. Re-ran clean
twice in a row before treating it as settled.)

`pnpm vitest run tests/listing tests/common`:
```
 Test Files  3 failed | 13 passed (16)
      Tests  3 failed | 177 passed (180)
```
`tests/listing/FeaturedRail.test.tsx`, all 13 pass (9 pre-existing + 4 new
cases; one new case needed a fifth, "eager/lazy split," bringing the total
new cases to what's listed above under Files). The three failures are
`tests/listing/ExploreLinks.test.tsx` ("resolves a sibling chip to its live
category URL once the query settles"), `tests/listing/CategoriesIndex.test.tsx`
("resolves a card to the live category, with its image, once one exists")
and one case inside `tests/listing/ListingPage.test.tsx` ("links a child chip
to its live category..."), all three assert a live-resolved category URL
(e.g. expecting `https://optimalx.com.sa/whey-protein/...`, getting the bare
path `/whey-protein/c9011`) through `useTaxonomyLinks()`, the one file `git
status` shows modified outside this batch's diff. Not caused by, or fixable
within, this batch's scope (`useTaxonomyLinks.ts` is explicitly another
builder's file per the brief's own read list). Neither `FeaturedRail.tsx` nor
`ListingPage.tsx` appear in any of the three failures.

`pnpm check:rtl` → `check-rtl: 316 file(s), 0 problem(s)`.
`pnpm check:motion` → `check-motion: 316 file(s), 0 problem(s)`.
`pnpm check:strings` → `check-strings: 313 file(s), 0 problem(s)`.
`node scripts/check-copy.mjs locales/ar.json locales/en.json` →
`check-copy: 2 file(s), 0 problem(s)`.
`node scripts/check-claims.mjs` → `check-claims: 30 file(s), 0 problem(s), 4
allowlisted` (the 4 are the pre-existing `official-distributor` rows; none
are this batch's keys).
`node scripts/check-tokens.mjs` → `check-tokens: 123 token(s) defined, 314
file(s) scanned, 0 problem(s)`.
`node scripts/check-identity.mjs` → `check-identity: 317 file(s), 0
problem(s)`.
`node scripts/i18n-merge.mjs --check` (sanity, not in the required list) →
`locales\ar.json: 1352 partial key(s), 0 added, 0 updated`; same for `en.json`.

Live curl, `http://localhost:3210` (first attempt timed out, HTTP 000 -
under concurrent load; retried after 20 seconds per the brief and it
answered):
```
$ curl -s http://localhost:3210/ar/protein/c9001 | grep -a -c "ox-featured"
1
$ grep -a -oE '<img[^>]*ox-featured__img[^>]*loading="eager"' → 2 matches
```
Also fetched and inspected directly:
- `.ox-featured` 1, `.ox-featured__item` 6, `.ox-featured__plate` 6,
  `.ox-featured__arrow` 2 (one `--next`), `.ox-featured__nav` 1, a
  six-product category (protein) shows the nav; `aria-label="المنتجات
  السابقة"` on the disabled prev button, `"المنتجات التالية"` on next.
- Cover images: first two carry `loading="eager" fetchPriority="high"
  decoding="sync"`, the remaining four `loading="lazy" decoding="async"`,
  each with `srcset` at 320w/640w/980w and `sizes="(min-width: 768px) 46vw,
  88vw"`.
- `aria-roledescription="عرض دائري"` once (the row), `="شريحة"` six times
  (one per slide), `aria-label="المنتج 1 من 6"` through `"...6 من 6"`.
- `curl http://localhost:3210/en/protein/c9001` → `aria-roledescription`
  reads `"carousel"`/`"slide"` and the nav buttons read `"Previous
  products"`/`"Next products"`.
- `npx sass --no-source-map app/styles/app.scss` compiles clean (only
  pre-existing `@import` deprecation warnings); the compiled CSS carries the
  three corner-cut tiers and both `[dir='ltr']` mirrors exactly as written.

## Deviations

- `ListingPage.tsx`, named as editable, no diff needed (see Decisions).
- No "عرض الكل" link added to the rail, the brief's premise ("as today")
  does not match what shipped; read literally as "keep what exists," not
  "add the home rail's own `viewAll` pattern." Flagged for an owner call if
  the other reading was intended.
- Three residual test failures in the required `tests/listing tests/common`
  scope, traced to a concurrent batch's in-flight edit of
  `useTaxonomyLinks.ts` (see Verification tails), not this batch's
  regression, not fixed here (out of this batch's write scope and the file
  is named as another builder's in the brief's own read list).
