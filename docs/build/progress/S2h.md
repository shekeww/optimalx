# S2h, card-as-artwork background photographs for six type tiles (owner assets, 2026-09-23)

Batch: the owner's six `public/categories/*.webp` card-background photographs
(1024x1536, portrait 2:3) wired onto the matching root categories, on the
home "browse by type" grid and the `/categories` index, per the reference
composition in `public/categories/references/*-ref.png`.

## Files

- `app/content/categories.ts`, `CategoryContent.backgroundImage?: string`
  added; set on the six slugs (`creatine`, `pre-workout`, `amino-acids`,
  `omega-3`, `vitamins-minerals`, `collagen-beauty`) to `/categories/<file>.webp`
  per the owner's mapping. New export `ART_CATEGORY_SLUGS` (the six slugs, read
  off `backgroundImage`, never hand-duplicated in a test or a component).
- `app/components/home/CategoryTile.tsx`, new `art?: string` prop. When set,
  the tile renders `<img class="ox-tile__art">` (the whole card) plus a
  `.ox-tile__body` content column (icon/name/line/foot), instead of the
  tinted-ground + small background-image-slot card. The footer arrow now
  carries `_primitives.scss`'s `.ox-iconbtn--angled` (S2g) in BOTH the art and
  the tinted variant (coordinator addendum, see Deviations).
- `app/components/home/OxCategories.tsx`, `TileVM.art`, threaded from
  `CATEGORIES.find(...).backgroundImage` in both `buildSelectedTiles` and
  `buildDefaultTiles`, passed to `<CategoryTile art={tile.art} />`.
- `app/components/listing/CategoriesIndex.tsx`, `TypeCard` gets the same
  art/no-art split, reading `ART_BY_SLUG`/`LINE_BY_SLUG` (two module-level
  maps built off `CATEGORIES`, the same pattern `OxCategories.tsx` already
  uses for `TYPE_LINE_KEY`, `useTaxonomyLinks`/`TaxonomyLink` is NOT
  extended, since it is shared by the header and this batch owns neither).
  `data-category={link.slug}` added to the card root (new, needed for the
  CSS dark-ground selector below, the home tile already carried this
  attribute).
- `app/styles/06-ox/_b2-home.scss` (section 4, and a new section "4b"), the
  art tile's CSS: `.ox-tile--art`, `.ox-tile__art`, `.ox-tile__body`, the
  `[dir]` physical-left positioning, the insurance scrim, the
  `vitamins-minerals` dark-ground override, and the `--ox-tile-notch-t/-j`
  and `--ox-tile-lean/-run` custom properties promoted from `::before` to
  `.ox-tile` itself so `.ox-tile__art` can share the exact same clip-path
  (added to the existing selector lists, never a second, duplicated set of
  magic numbers) at both the notch tier and the 1280+ corner-cut tier.
- `app/styles/06-ox/_b4-listing.scss` (new "14b"), the same composition
  mirrored for `.ox-cat-card`/`TypeCard`: `.ox-cat-card--art`,
  `.ox-cat-card__art`, `.ox-cat-card__body`, `__line`, `__foot`, `__arrow`,
  the `vitamins-minerals` override, and the reset rules needed because
  `collagen-beauty` carries BOTH `--art` and the pre-existing `--black` tone
  (see "The collagen-beauty conflict" below).
- `tests/content/imagePaths.test.ts`, `ASSET_REF` now also matches
  `/categories/...` paths (was `/assets/...` only), so the six new refs are
  checked against `public/`.
- `tests/home/OxCategories.test.tsx`, the pre-existing "falls back to the
  theme custom property" test moved from `creatine` (index 1, which now
  always carries curated art) to `daily-health` (index 7, still tinted); new
  test asserts the `<img class="ox-tile__art">` attributes for `creatine` and
  its absence for `protein`.
- `tests/listing/CategoriesIndex.test.tsx`, the pre-existing "links every
  card to a search" test's blanket `querySelector('img')` toBeNull assertion
  is now branched on `ART_CATEGORY_SLUGS`; new test asserts the same `<img>`
  attributes for the `creatine` type card and its absence for `protein`.

I did not touch `useTaxonomyLinks.ts` (shared by the header/drawer, outside
this batch's file list) to carry `art`/`cardLineKey`, `CategoriesIndex.tsx`
reads `content/categories.ts` directly instead, the same pattern it already
used for `HOME_TILE_TONES`.

## The composition

Both the home tile and the `/categories` type card now render, for the six
art slugs: `<img>` filling the whole card (`object-fit: cover`,
`aspect-ratio: 2 / 3`, `min-block-size` as a floor, never a fixed
`block-size`), clipped to the SAME notch/corner-cut polygon `::before`
already draws for every card (shared selector, not a duplicate). A content
column (`.ox-tile__body`/`.ox-cat-card__body`) overlays the card's PHYSICAL
LEFT in both languages, `[dir='rtl'] { inset-inline-end }` /
`[dir='ltr'] { inset-inline-start }`, never a single logical property that
would flip sides under LTR, per the brief. Inside: the 36px outline sprite
icon, the bold title, the two-line `cardLineKey` subline (clamped, never the
reference's outcome line), then a footer with the live count at the column's
own start and the angled arrow at its end. Arabic text in the column is
`text-align: end` under RTL / `start` under LTR, so it hugs the column's own
left edge as in the reference, not the reading-direction default.

## Contrast, measured

`sharp` is not in `node_modules` (checked: `require.resolve('sharp')`
throws). Python 3.14 + Pillow 12.3 IS available in this environment, so
pixel sampling was done with that instead of hand-reading the reference PNGs
- a 20x20px average at (15,15)-(35,35) on each `public/categories/*.webp`
(avoiding the rounded-corner edge), then the WCAG relative-luminance
contrast formula against `--ox-fg` (`--ox-ink` `#12171E`) and, for the one
exception, `--ox-ink-on-dark` (`#F7F4EE`):

| Slug | File | Sampled top-left | vs `--ox-fg` raw | vs `--ox-fg` + 0.35 white scrim |
|---|---|---|---|---|
| amino-acids | amino_acids.webp | `#FEFEFE` | 17.84:1 | 17.84:1 |
| collagen-beauty | collagen.webp | `#DDFCD3` | 16.23:1 | 16.81:1 |
| creatine | creatine.webp | `#EEFCEC` | 16.94:1 | 17.30:1 |
| omega-3 | omega_3.webp | `#F9B791` | 10.46:1 | 12.70:1 |
| pre-workout | pre-workout.webp | `#F1F9FD` | 16.89:1 | 17.26:1 |
| vitamins-minerals | multivitamins.webp | **`#0F0F0F`** | **1.07:1** | **3.00:1** |

**Finding: the brief's "the upper-left area of each file is a flat pastel" is
false for one of the six.** `multivitamins.webp` (OPTI-MEN, a black bottle on
a black ground) is near-black at the top-left, not pastel, `--ox-fg` ink is
essentially invisible on it raw (1.07:1) and still fails the 4.5:1 text floor
even with the full 0.35 white scrim (3.00:1, the graphical/large-text floor
only). The other five are genuinely light and already clear 4.5:1 by a wide
margin unaided; the scrim is true insurance for those five, not the primary
contrast strategy.

**Fix:** for `vitamins-minerals` only, light ink (`--ox-ink-on-dark`) instead
of the scrim, `[data-category='vitamins-minerals']` selector, the exact same
swap `.ox-tile--black`/`.ox-cat-card--black` already make for the
pre-existing black emphasis card (`collagen-beauty`), and the same measured
margin: `#F7F4EE` on `#0F0F0F` = 17.46:1. The insurance scrim is switched off
for this one card (`background: none` on its own `::before`) rather than left
stacked uselessly behind text it can no longer help.

## The collagen-beauty conflict (found while wiring the dark-ground override)

`collagen-beauty` carries BOTH the pre-existing `tone: 'black'` (shaker-era,
`.ox-tile--black`/`.ox-cat-card--black`, graphite fill + light ink) and the
new `backgroundImage` (a pastel-green photograph, `#DDFCD3` measured, wants
DARK ink). Both classes land on the same element. `.ox-tile--black
.ox-tile__name` and the new `.ox-tile--art .ox-tile__name` are equal
specificity (two classes each), so declaring `--art`'s rules AFTER `--black`'s
in the file makes `--art` win by source order, verified this resolves
correctly for `collagen-beauty` (dark ink, transparent `::before`, normal
`--ox-tile-arrow`) while `vitamins-minerals`'s own, more specific
`[data-category=...]` selector (three selectors, not two) still wins over
`--art`'s reset regardless of order, for that one slug only. Same fix
mirrored in `_b4-listing.scss` for `.ox-cat-card__desc`/`__count`, which sit
OUTSIDE the card's own photograph (never painted over it) and so always take
the normal-ink reset regardless of which specific art slug they belong to.

## Deviations

- **Coordinator addendum, addressed:** `.ox-iconbtn--angled` (S2g,
  `_primitives.scss`) is now on the type-tile arrow `<i>` in BOTH
  `CategoryTile.tsx` variants (art and tinted), matching `GoalCard.tsx`'s own
  `sicon-keyboard_arrow_right ox-mirror ox-iconbtn--angled` markup exactly.
  Simplified the original plan (a separate wrapper `<span>` only for art
  tiles) down to one shared `foot` JSX fragment used by both branches, since
  the class applies directly to the `<i>` either way. Mirrored on
  `CategoriesIndex.tsx`'s new art-card arrow too, for the same reason my own
  brief already asked for the shared class there; the four NON-art type cards
  on `/categories` still carry no arrow at all (introducing one there for all
  ten cards was outside both briefs' scope).
- **`vitamins-minerals` light ink instead of the white scrim**, see
  "Contrast, measured" above. Reasoned, measured, and precedented (the exact
  swap `.ox-tile--black` already makes), not a silent deviation.
- **`_b4-listing.scss`'s art card carries only one `min-block-size` floor
  (260px), not a second, larger one at a breakpoint**, the home grid's own
  2-up/4-up rhythm gave the brief's two explicit measured checkpoints (173x260
  at 390, 306x459 at 1280+, both now in code); `/categories`' own grid is
  2/3/5-up, a different rhythm the brief did not give checkpoints for. Scope
  kept to the one shared, defensive floor (`aspect-ratio` does the real
  sizing at any of its three breakpoints); flagged here rather than silently
  matched to numbers that were never asked for.
- **Measured 306x459 at the home grid's 1280+ tier, not the brief's own
  "~312x468"**, the brief's own figure already carries a `~`. Recomputed
  from the actual token values (`--ox-container: 1296px` cap, `--ox-6` 24px
  gap, four columns): `(1296 - 3×24) / 4 = 306`, `×1.5 = 459`. Used the
  measured number in the code and the comment rather than the brief's
  approximation.
- **`app/content/categories.ts` gained one export beyond what the brief
  named** (`ART_CATEGORY_SLUGS`), needed so `CategoriesIndex.tsx` and both
  test files never hand-duplicate the same six slugs a second time; read-only,
  additive, no existing export touched.

## Verification

`pnpm typecheck`:
```
$ tsc --noEmit
```
(no output, zero errors project-wide.)

`pnpm vitest run tests/home tests/listing tests/content`:
```
Test Files  31 passed (31)
     Tests  360 passed (360)
```
Includes `tests/home/OxCategories.test.tsx` (11/11, 1 new + 1 moved),
`tests/listing/CategoriesIndex.test.tsx` (9/9, 1 new), `tests/content/imagePaths.test.ts` (2/2).

`pnpm check:rtl`: `check-rtl: 315 file(s), 0 problem(s)`
`pnpm check:motion`: `check-motion: 315 file(s), 0 problem(s)`
`pnpm check:strings`: `check-strings: 307 file(s), 0 problem(s)`
`node scripts/check-tokens.mjs`: `check-tokens: 123 token(s) defined, 312 file(s) scanned, 0 problem(s)`
`node scripts/check-identity.mjs` (not in the required list, run anyway given the clip-path/notch work): `check-identity: 315 file(s), 0 problem(s)`

**Curl, `/ar/categories?storeId=1888890798` (the surface this batch could
fully verify live):**
```
$ curl -s ".../ar/categories?storeId=1888890798" | grep -a -o "categories/creatine.webp" | wc -l
1
$ grep -a -o 'data-testid="ox-type-card"' | wc -l   → 10
$ grep -a -o 'ox-cat-card--art' | wc -l              → 6
```
All six `/categories/*.webp` paths present in the live SSR HTML; the
`vitamins-minerals` card confirmed carrying `data-category="vitamins-minerals"`,
`.ox-cat-card--art`, a 36px icon, and the light-ink markup targets correctly.

**Curl, `/ar?storeId=1888890798` (the home route, the brief's own literal
check), BLOCKED, reported not silently passed:**
```
$ curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -c "categories/creatine.webp"
0
```
Ran three times (identical 129817-byte response each time), once with a
cache-busting query param + `Cache-Control: no-cache`, once with
`--max-time 20` (returned in 0.69s, not a timeout), all identical. The
`ox-categories` block renders ONLY its loading skeleton
(`ox-skel-grid--tiles`, 8 placeholder blocks) in the SSR HTML; no tile, no
`<img>`, for ANY of the eight home types, not just the six with art.

This is not this batch's component logic: `pnpm vitest run tests/home`
mounts and asserts real `CategoryTile`/`OxCategories` output directly (11/11
green, including the two new art-presence assertions); `tsc --noEmit` is
clean; and the *sibling* surface using nearly identical code
(`CategoriesIndex.tsx`'s `TypeCard`) serves fully correct live HTML on
`/categories` right now (evidence above). The SAME home response's `ox-goals`
block, reading the identical `useTaxonomyLinks()` data, rendered fully
resolved (`goal-energy` → `https://optimalx.com.sa/goal-energy/c9020`, a real
category id from the dehydrated query cache, `status:"success"`). The
dehydrated cache in that same HTML shows the full 25-node taxonomy resolved
successfully server-side, so the data itself is not the problem. A second,
completely untouched block on the same page,
`s-block--ox-category-rail` (×8, one per type, a component this batch is
explicitly forbidden from editing), is ALSO empty on this same response right
now. Given a forbidden, untouched component shows an analogous "not
rendering on the home page right now" symptom at the same moment, and this
matches the exact class of problem `docs/build/progress/S2f.md` already
documented this session ("the running Vite dev process itself left in a
broken state by the concurrent edits... restarting that process is outside
what this batch may do"), this reads as a shared dev-server/module-graph
state issue rather than a defect in this batch's diff, but it is flagged
here, not silently assumed clean. **Recommend re-running exactly this curl
check once the shared preview process is restarted** (owner/orchestrator
action, per the same operating constraint that blocked S2f's own re-check).

## Not measured / flagged

- The subline's two-line fit at exactly 320px width was checked by
  arithmetic (`--ox-t-micro`, the same clamp the tinted card already used at
  this size, inside a ~62%-of-173px ≈ 107px-wide column) and by the
  `-webkit-line-clamp: 2` safety net, not by a pixel-rendered screenshot -
  this sandbox has no headless browser/font renderer (the same limitation
  `docs/build/progress/S2f.md` already flagged for a different control).
