# S2d, category pages (owner amendment 2026-09-22)

Batch: "New: S2d, category pages" from `docs/build/brief-S2-2026-09-22.md`
(owner amendments section). Built the featured-products rail and the
internal-linking "explore" block on every type and goal category listing.

## Files

- `app/components/listing/FeaturedRail.tsx` (new), the first row of a
  category/goal listing: a horizontal snap scroller of featured products,
  each a cover tile with name, `Price` and one link to the PDP. Exports the
  pure `featuredProducts()` (flagged-or-fallback selection) and
  `featuredCoverImage()` for testing and for the day a real cover source
  exists.
- `app/components/listing/ExploreLinks.tsx` (new), the compact "explore"
  block after the grid: sibling categories, the goal(s) that include this
  type or the types inside this goal, one guide link when the content map
  has one, and the advisory CTA to `/services`. Exports `siblingSlugsOf()`,
  `goalsIncluding()`, `typesOf()` and `exploreGuide()` as pure, tested
  helpers.
- `app/components/listing/ListingPage.tsx`, wired both in: `FeaturedRail`
  as the first child of `.ox-listing__body` (gated on
  `variant === 'category' || variant === 'goal'`), `ExploreLinks` right
  after `.ox-listing__catalogue` and before `CategoryFaq`/`RelatedGuides`,
  fed the already-resolved `node`. No other line in this file changed.
- `app/styles/06-ox/_b4-listing.scss`, appended section 15 (`.ox-featured*`,
  `.ox-explore*`) at the end of the file. Reuses `.ox-chip`/`.ox-chip--filter`
  and `.ox-listing__guide-row` verbatim for the explore block's chips and
  foot row rather than redeclaring them.
- `locales/partials/s2.ar.json` / `s2.en.json`, six new flat `ox.listing.*`
  keys (both already existed from S2a; only appended to them).
- `locales/ar.json` / `locales/en.json`, the same six keys mirrored in,
  next to the existing `ox.listing.*` cluster. No existing value touched;
  `node scripts/i18n-merge.mjs --check` reports 0 pending changes, so the
  partials and the base files agree exactly.
- `tests/listing/FeaturedRail.test.tsx` (new), `tests/listing/ExploreLinks.test.tsx`
  (new).
- `tests/listing/ListingPage.test.tsx`, added a `useMoney` mock (`Price`,
  used by the new `FeaturedRail`, reads it; the file had none). No assertion
  in the file changed; all 29 pre-existing cases still pass unmodified.

## Decisions and how the brief's open points were read

- **Featured selection.** The engine's `Product` type (`@salla.sa/twilight-theme-engine/types`,
  checked 2026-09-22) declares neither `is_featured` nor `featured`, and
  neither field is present on the live listing payload, so the merchant-flag
  path is implemented defensively (`isMerchantFeatured` reads the two field
  names off the raw object) and, on this store, always falls through to the
  documented fallback: the first 4 to 6 products of the listing's own
  default sort (`featuredProducts()`, capped at 6, never more than the list
  actually has).
- **Cover image.** Same story: no `featured_cover_<sku>` field and no
  equivalent theme setting exist in the engine type or the listing payload
  today. `featuredCoverImage()` resolves the product's own first image,
  which is what the brief names as today's render, and is the one function
  that changes the day a later batch wires a real per-SKU cover source.
- **No loader change.** `ListingPage` already received `products` (the
  loader's own first page) as a prop; that is enough data for the featured
  selection, so `app/routes/$slug.c$id.tsx`'s loader was not touched.
  `ExploreLinks` resolves every link through `useTaxonomyLinks`, the same
  hook `ChildChips` already uses; no new query or loader dependency was
  introduced.
- **Sibling categories.** A child node's siblings are its parent's other
  children (protein's five children see each other, not the ten roots); a
  root node's siblings are the other roots of its own scope (type/goal/
  utility), read off `app/content/taxonomy.ts`'s existing `MENU` groups.
- **Goal/type membership** is an exact `categorySlug` match against
  `GOALS`'s `subNeeds` (its anchored groups included), deduplicated. This is
  a literal reading of "the goal(s) that include this type": a parent
  category like `protein` itself shows zero goal memberships today because
  every `subNeed.categorySlug` in `app/content/goals.ts` names a specific
  child (`whey-protein`, `mass-gainer`, …), never the parent. Recorded as a
  reading, not a deviation the code needed to guess around.
- **Guide link.** No `app/content/guides` directory exists yet and no
  `ox.content.guides.*.title` key resolves in either locale file today (the
  same state `RelatedGuides` already documents and already renders empty
  for). `exploreGuide()` is wired and tested against the pure helper level,
  but on this store's current content it renders nothing on every page,
  matching `RelatedGuides`'s own present-day empty state rather than a new
  regression.
- **SSR/client consistency.** `ExploreLinks` does not read `useTaxonomyLinks`'
  query directly; it renders `bySlug()`'s result, whose pending state already
  falls back to the node's own static `nameKey` label plus a `/search?q=`
  URL, the same fallback `ChildChips` has shipped and been tested against
  (`tests/listing/ListingPage.test.tsx`, "links a child chip to its live
  category…"). No new client-only branch was added.

## Measured numbers

Card math for the rail (`.ox-featured__item`), gap `var(--ox-3)` = 12px,
solved as `flex-basis: calc((100% + gap) / N - gap)`:

| Viewport | Container | N (visible) | Card width |
| --- | --- | --- | --- |
| 320 | 288px (16px gutter × 2) | 2.2 | 124.4px |
| 390 | 358px (16px gutter × 2) | 2.2 | 156.2px |
| 1440 | 1296px (`--ox-container` cap) | 4.0 | 315.0px |

The same `calc()` rule holds the 2.2 ratio at every width up to the
`min-width: 1024px` breakpoint, where `flex-basis` switches to the N = 4
form; 1440 already sits past 1024, so it inherits that value directly
(computed above, verified `(1296+12)/(315+12) = 4.00`).

Curl against the running preview (`http://localhost:3210`, `storeId=1888890798`):

```
$ curl -s "http://localhost:3210/ar/protein/c9001?storeId=1888890798" | grep -a -c "ox-featured"
1
$ grep -a -o 'ox-featured__item' protein.html | wc -l
6
$ grep -a -o 'ox-featured__cta">[^<]*' protein.html | head -1
ox-featured__cta">عرض المنتج
$ grep -a -o 'ox-explore__nav' protein.html | wc -l
1   # protein is a parent category: 0 exact goal-membership matches (see
    # "goal/type membership" above), so only the siblings nav renders
$ grep -a -o 'ox-chip ox-chip--filter ox-chip--link' protein.html | wc -l
14  # 9 explore siblings + 5 existing ChildChips (protein's own children)
$ grep -a -o 'href="/ar/services"' protein.html | wc -l   # via ox-listing__guide-row
1
$ grep -a -o '>ox\.[a-z_.]*<' protein.html   # no raw key leaks
(none)

$ curl -s "http://localhost:3210/ar/goal-energy/c9020?storeId=1888890798" | grep -a -o 'ox-featured__item' | wc -l
6
$ grep -a -o 'ox-explore__nav' goal-energy.html | wc -l
2   # goal-energy has both other-goal siblings and type-membership rows
$ grep -a -o 'أنواع ضمن هذا الهدف' goal-energy.html | wc -l
1
```

## Verification tails

`pnpm typecheck`:
```
$ tsc --noEmit
(clean, no output)
```

`pnpm vitest run tests/listing tests/content`:
```
 Test Files  16 passed (16)
      Tests  206 passed (206)
```
(includes the two new files: `FeaturedRail.test.tsx` 8 tests, `ExploreLinks.test.tsx`
9 tests; the pre-existing 189 keep passing unmodified in behaviour.)

`pnpm check:rtl && pnpm check:motion && pnpm check:strings`:
```
check-rtl: 311 file(s), 0 problem(s)
check-motion: 311 file(s), 0 problem(s)
check-strings: 304 file(s), 0 problem(s)
```

`node scripts/check-copy.mjs locales/ar.json locales/en.json locales/partials/s2.ar.json locales/partials/s2.en.json`:
```
check-copy: 4 file(s), 0 problem(s)
```

`node scripts/check-claims.mjs`:
```
check-claims: 26 file(s), 0 problem(s), 4 allowlisted
```
(the 4 allowlisted findings are the pre-existing `official-distributor` rows
in `ox.pdp.official_distributors`/`ox.home.trust_distributors`; none are
this batch's keys.)

`node scripts/check-tokens.mjs`:
```
check-tokens: 117 token(s) defined, 307 file(s) scanned, 0 problem(s)
```

`node scripts/i18n-merge.mjs --check` (sanity, not in the required list):
```
i18n-merge: locales\ar.json: 1321 partial key(s), 0 added, 0 updated
i18n-merge: locales\en.json: 1321 partial key(s), 0 added, 0 updated
```

`curl -s "http://localhost:3210/ar/protein/c9001?storeId=1888890798" | grep -a -c "ox-featured"`: `1` (≥ 1, required gate).

Also ran `npx sass --no-source-map app/styles/app.scss` against the whole
sheet to confirm the appended SCSS compiles cleanly (only the pre-existing
`@import` deprecation warnings, no errors; `ox-featured`/`ox-explore`
selectors present in the output).

## Requests / open items for other batches

- No live product in the fixture store carries `is_featured`/`featured`
  today, so the merchant-flag path is untested against real data (only unit
  tests exercise it). Whichever batch wires real merchant-flagged products
  or a `featured_cover_<sku>` field should also update
  `featuredCoverImage()`/`isMerchantFeatured()` in `FeaturedRail.tsx`.
- `exploreGuide()` will start rendering real guide links the day
  `ox.content.guides.*.title` keys exist (FINAL-content 7.1), same
  dependency `RelatedGuides` already carries; no action needed here, just
  noting it renders empty today by design, not by omission.

## Deviations

- Only reasoned deviation: `ExploreLinks`/`FeaturedRail` are gated on
  `variant === 'category' || variant === 'goal'` rather than on `node`
  alone, so an owner-made category outside the 25-node taxonomy still gets
  the data-only `FeaturedRail` (it needs nothing but `products`) but not
  `ExploreLinks` (which needs a resolved taxonomy node for its sibling/
  membership logic), the same graceful-absence contract
  `CategoryIntro`/`ChildChips`/`CategoryFaq` already use for that case.
- The shared preview server threw a transient 500 ("Failed to load store
  settings. Make sure VITE_STORE_DOMAIN is set.", from the `[offline-api]`
  layer) a few times during verification, on `/ar/goal-energy/c9020` and
  once on `/`; every time, an immediate retry against the same already-running
  server succeeded and rendered correctly (the final required gate curl,
  run last, returned `1`). Not reproducible on demand and not related to any
  file this batch touched, no route, loader, or env config here, most
  likely the store-settings fetch racing with the other builders' concurrent
  activity on the same shared server. Recorded for visibility, not treated
  as a defect of this batch.
