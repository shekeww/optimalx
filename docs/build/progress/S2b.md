# S2b: "shop by need" + SSR/client taxonomy-link fix

Builder S2b, 2026-09-22 (re-run after a session interruption; brief at
`scratchpad/s2b-prompt.md`, owner amendments in
`docs/build/brief-S2-2026-09-22.md`, identity treatment from
`docs/build/X-IDENTITY-2026-09-22.md` §§2-4 per the conductor's follow-up).

## 1. SSR/client consistency for taxonomy links (done first, per the brief's order)

Root cause confirmed: `useTaxonomyLinks` called `useQuery(category.queries.list())`
and `useQuery(menu.queries.header())` with nothing prefetching either on the
server, so the SSR HTML always carried the `/search?q=` fallback and the
client's first real render carried the live category URL - two different
answers for the same link, which is what the owner saw as "two designs" and
what React logged as a hydration mismatch.

Fix, in `app/components/listing/useTaxonomyLinks.ts` (owned; item 1 of my
brief explicitly permits this file):

- `TaxonomyLoaderData` (`{ categories, menuItems }`) and
  `loadTaxonomyData(queryClient)`: `ensureQueryData`s both queries into
  whatever `QueryClient` a route loader hands it, using the SAME query
  options `useTaxonomyLinks` itself queries with (one cache entry per list,
  never fetched twice).
- `useTaxonomyLoaderData()`: reads `useRouter({ warn: false }).state.matches`
  for any match carrying a `taxonomy` field, defensively (`router?.state?.matches`)
  so it never throws with no `<RouterProvider>` ancestor (every existing
  component test renders bare) and never throws against a test double that
  stubs `useRouter` for an unrelated reason.
- `useTaxonomyLinks()`: reads that loader data first; the two `useQuery`
  calls get `enabled: !loaderData`, so a route that DID prefetch never
  re-issues either request on mount (test: "never issues the live query when
  loader data already supplied the pair").

Loaders, **only** the `loader` export touched in both route files (`head`
untouched, per the constraint):

- `app/routes/index.tsx`: `loader` now runs `Home.loader(...)` and
  `loadTaxonomyData(context.queryClient)` in parallel and returns
  `{ ...homeData, taxonomy }` (`HomeRouteLoaderData`).
- `app/routes/$slug.c$id.tsx`: same shape, `{ ...listData, taxonomy }`
  (`CategoryListLoaderData`) - `ProductListLoaderData.source.entity` is only
  the ONE category the page is for, never the full list `useTaxonomyLinks`
  resolves every sibling/goal/type link against, so this loader needed the
  same prefetch as home's.

**Verified against the running preview** (overlay on, `storeId=1888890798`):

```
$ curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -c "goal-energy/c9020"
1
$ curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -o 'data-need="goal-energy"[^>]*'
data-need="goal-energy" data-spa-link="" href="https://optimalx.com.sa/goal-energy/c9020"
```

The SSR HTML carries the live resolved URL, not a search fallback. Spot-checked
`$slug.c$id.tsx` too:

```
$ curl -s "http://localhost:3210/ar/goal-energy/c9020?storeId=1888890798" | grep -a -o 'href="[^"]*"' | grep -E "pre-workout|daily-health|goal-general-health"
href="https://optimalx.com.sa/pre-workout/c9003"
href="https://optimalx.com.sa/daily-health/c9008"
href="https://optimalx.com.sa/goal-general-health/c9021"
```

Unit test (`tests/home/OxNeeds.test.tsx`, "OxNeeds, SSR/client parity"):
renders `OxNeeds` once via the plain query (no router) and once via a mocked
route match carrying `taxonomy` loader data, and asserts the goal-energy
card's `href` is identical either way - the loader path resolves it on the
**first** render (no `waitFor`), which is the point.

I could not open a real browser to read the console for the "no hydration
mismatch" half of the owner's verification line; the SSR-html and unit-test
evidence above is what I have without that tool.

## 2. OxNeeds + NeedCard (replaces OxCategories/CategoryTile + OxGoals/GoalCard)

### Files

- **New**: `app/components/home/OxNeeds.tsx`, `app/components/home/NeedCard.tsx`.
- `app/components/home/defaults.ts`: `ox-goals` height rewritten (750/555, see
  §4 below); `ox-categories` height set to `{ mobile: 0, desktop: 0 }` (it is
  `OxNeeds`' other registered slot and renders null whenever `ox-goals`
  claimed the section first, which is every default/typical composition).
- `app/components/home/register.ts`: both `ox-goals` and `ox-categories`
  registry keys now point at `OxNeeds`.
- `app/components/home/index.ts`: barrel updated (`OxNeeds`, `NeedCard`
  exported; `OxGoals`/`OxCategories`/`CategoryTile` exports removed;
  `GoalCard` **kept** - see deviation 2).
- `app/components/home/HomeSkeleton.tsx`: `GoalsSkeleton`/`CategoriesSkeleton`
  replaced by `NeedsSkeleton` (heading bar + toggle bar + six row
  placeholders, registered for `ox-goals`); `CategoriesSkeleton` now returns
  `null` (registered for `ox-categories`, matching its 0-height reservation).
  Route-pending `HomeSkeleton()` renders `<HeroSkeleton/><NeedsSkeleton/>`.
- `app/components/home/KitchenSink.tsx`: two `OxNeeds` panels (no merchant
  selection / a merchant selection on the legacy `ox-categories` slot), each
  wrapped in a fresh `QueryClientProvider` (`NeedsDemo`) so the claim
  mechanism (§5) does not suppress the second demo on the same dev page.
- `app/components/common/SectionHeader.tsx`: additive `subline?: ReactNode`
  prop, rendered as `<p className="ox-sh__subline">` under the title only
  when given (14 other callers pass none and are unchanged).
- `app/styles/06-ox/_b2-home.scss`: sections 4 and 5 rewritten for
  `OxNeeds`/`NeedCard` (full detail in §4); the old `.ox-goal*` rules were
  restored as a (relabelled) section 5, because `GoalCard.tsx` still needs
  them (deviation 2) - see the note at the top of that section in the file.
  Also touched: the reduced-motion block (dropped `.ox-tile`/`.ox-goal`, which
  no longer have a transform to disable; `.ox-goal`'s own reduced-motion rule
  moved with it), and the skeleton grid rules (`.ox-skel-grid--tiles`/`--goals`
  replaced with `.ox-skel-needs`/`.ox-skel-needs__toggle`/`.ox-skel-grid--needs`).
- `twilight.json`: `home.ox-goals` and `home.ox-categories` **titles only**
  (dashboard block-picker labels, not delivered copy) changed to
  "تسوق حسب احتياجك (الهدف)" / "Shop by need (goal)" and
  "تسوق حسب احتياجك (النوع)" / "Shop by need (type)", so a merchant browsing
  either entry understands both add the same merged section. Keys, paths,
  `is_default`, and the `categories` field on `ox-categories` are unchanged.
- Locales: see §3.
- Tests: `tests/home/OxNeeds.test.tsx` (new, 15 tests);
  `tests/home/OxCategories.test.tsx` (the two stylesheet-reading `describe`
  blocks removed - `.ox-tile`/`--ox-shaker-*` no longer exist - and the now-unused
  `fs`/`path` imports dropped; the component-behaviour tests above them are
  untouched and still pass against the still-present, unregistered component);
  `tests/home/optionalBlocks.test.ts` (`ox-categories` added to the `GATED`
  list, with a docblock note, since it now reserves 0 and renders null by
  default); `tests/layout/Header.test.tsx` and `tests/layout/chrome.test.tsx`
  (one-line `useRouter: () => undefined` added to their existing
  `@tanstack/react-router` mocks - see deviation 9).

### Behaviour

- **One section, two `role="tablist"` panes** (`Tabs.tsx`, unmodified - it
  already does RTL roving arrows and WAI-ARIA automatic activation). Goals
  pane (default, 6 cards, `content/goals.ts` order) and types pane (8 cards:
  the four that already carried a shaker tone - protein, creatine,
  vitamins-minerals, collagen-beauty - plus the four the owner named for
  their own tint - pre-workout, amino-acids, omega-3, daily-health).
  `snacks-bars`/`accessories` are left off the pane so it holds a full row at
  every breakpoint (brief: "8 to 10 cards").
- **Tab labels reuse the two existing keys** `ox.home.goals_title` /
  `ox.home.categories_title`, per the brief's literal instruction ("The two
  existing titles ... become the tab labels"), not the reference image's
  shorter pill text - see deviation 4.
- **Heading + subline**: new keys `ox.home.needs_title` ("تسوق حسب احتياجك")
  and `ox.home.needs_subline`, rendered through `SectionHeader`'s new
  `subline` slot, with a `viewAll` to `/categories`.
- **Merchant selection carried over**: `OxNeeds` reads `fieldList(data,
  'categories')` from whatever `data` it receives; when the primary slot is
  `ox-categories` and the merchant filled that field (the legacy field,
  unchanged in `twilight.json`), the types pane uses the merchant's own list
  instead of the fixed eight - the same behaviour `OxCategories` had.
- **Card = row composition** at every width (`grid-template-areas: 'icon
  title arrow' 'icon line arrow'`): a 40px sprite glyph, a bold one-line
  title (a goal's `cardKey` or a type's `ox.tax.<key>.name`, per the brief's
  fallback instruction since `app/content/**` is read-only to me), a
  2-line claims-clean subline, a count gated on a live `products_count > 0`,
  and an orange arrow (`sicon-keyboard_arrow_right`, sallaicons per BUILD:221,
  never the sprite).
- **Image slot**: `background-image`, never `<img>` (a 404 on a merchant's
  `Category.image` leaves the tint showing instead of a broken-image glyph);
  falls back to `var(--ox-need-image-<slug>, none)` when the API has none, so
  the theme custom property the owner will fill lands with zero code change,
  and the card is finished either way.
- **ALL cards coloured** (owner amendment; supersedes the identity judges'
  four-ground limit): seven pastel tints + one black emphasis card per pane
  (`collagen-beauty` on types, `goal-performance` on goals - a judgement call
  documented in `OxNeeds.tsx`'s `GOAL_TONE` docblock, since the brief did not
  pin an exact goal slug). See §4 for the tints and their measured ratios.
- **Identity device** (X-IDENTITY-2026-09-22.md §4.6, applied per the
  coordinator's follow-up instruction): every card carries the accent arrow
  (`--ox-accent-dark`, the section's one literal `--ox-accent` living on the
  black card's arrow) and one angled/notched corner at the top inline-end -
  see §4 for exactly what shape at which breakpoint and why.
- **Dedup** (`useClaimPrimaryNeedsSlot` in `OxNeeds.tsx`): a `WeakMap<QueryClient,
  boolean>` keyed by the router's own query client (fresh per server request,
  stable per client session), claimed by a `useState` lazy initializer (runs
  once, in render order, so whichever registered slot - `ox-goals` or
  `ox-categories` - mounts first in the composition wins). `twilight.json`
  marks both `home.ox-goals` and `home.ox-categories` `is_default: true`, so
  a fresh Salla-generated composition genuinely carries both keys; this is
  not a rare edge case. Tested directly (`tests/home/OxNeeds.test.tsx`,
  "the claim that stops the section rendering twice").

## 3. Locale keys (new, never an edited value)

Added identically to `locales/partials/s2.ar.json` + `s2.en.json` **and**
`locales/ar.json` + `locales/en.json` (flat `ox.*`, MSA, no diacritics, no
dialect, no em-dash, no AI-tell constructions - `pnpm check:copy` and
`node scripts/check-claims.mjs` both pass with 0 new problems):

| Key | ar | en |
|---|---|---|
| `ox.home.needs_title` | تسوق حسب احتياجك | Shop by need |
| `ox.home.needs_subline` | اختر ما يناسب هدفك أو نوع المكمل الذي تبحث عنه. | Choose what fits your goal or the type of supplement you are looking for. |
| `ox.home.need_count` | `{{count}}` منتج | `{{count}}` products |
| `ox.content.categories.protein.card_line` | واي، ايزوليت، كازين، نباتي | Whey, isolate, casein, plant |
| `ox.content.categories.creatine.card_line` | مونوهيدرات، مطحون ناعم | Monohydrate, micronised |
| `ox.content.categories.pre_workout.card_line` | بكافيين | Caffeinated |
| `ox.content.categories.amino_acids.card_line` | بي سي اي اي، اي اي اي، أرجينين | BCAA, EAA, arginine |
| `ox.content.categories.vitamins_minerals.card_line` | ملتي فيتامين، فيتامين د3، مغنيسيوم | Multivitamin, vitamin D3, magnesium |
| `ox.content.categories.collagen_beauty.card_line` | كولاجين ببتيدات، بيوتين | Collagen peptides, biotin |
| `ox.content.categories.omega_3.card_line` | زيت سمك، أوميغا 3-6-9 | Fish oil, omega 3-6-9 |
| `ox.content.categories.daily_health.card_line` | بروبيوتيك، إلكتروليت، كلوروفيل | Probiotic, electrolyte, chlorophyll |

Six of the eight `card_line` values are the brief's own literal text
(protein, creatine, pre_workout, amino_acids, vitamins_minerals,
collagen_beauty). **omega_3** and **daily_health** are this batch's own
reading of their SKUs, verified against `fixtures/store/products.json`:
omega-3's two SKUs (OX-022 "زيت السمك اوميغا 3 الاسكي", OX-023 "سوبر اوميغا
3-6-9 1200 ملجم") are both fish-oil/omega blends; daily-health's three
(OX-033 probiotic, OX-034 electrolyte tablets, OX-035 liquid chlorophyll) are
three different shelves, so the line names all three rather than picking one.
Goal cards keep the **live, unchanged** `ox.content.goals.*.card` and
`ox.home.goal_line_*` keys, per the brief.

No key was retired. `ox.home.goals_title` / `ox.home.categories_title` /
`ox.home.goal_line_*` / `ox.home.shop_now` are reused, unedited, per the
"never edit an existing value" rule.

## 4. Heights, the pastel run, and the identity device

### Reserved heights (`HOME_BLOCK_HEIGHTS`, token arithmetic against the
stylesheet below - **not a live-browser pixel measurement**; I have no
visual browser tool in this environment, the same limitation S2c's own
progress notes record for its re-measure)

| | mobile (390/358) | desktop (1440/1296) |
|---|---|---|
| `ox-goals` (the section) | 750 | 555 |
| `ox-categories` (suppressed slot) | 0 | 0 |

Mobile breakdown: SectionHeader stack 106 (h2 ~30 + gap 8 + 2-line subline
~44 + margin-end 24, mirroring OxServices' own re-measure shape without its
eyebrow row) + gap to toggle 16 + pill toggle 48 (`.ox-tabs__tab`
`min-block-size`, `_primitives.scss`) + panel top padding 16 + the goals
pane's grid (default tab): 6 rows of 84 plus 5 gaps of 12 = 564. Total 750.

Desktop breakdown: header stack 107 (h2 40 + gap 8 + 1-line subline 27 +
margin-end 32) + gap 16 + toggle 48 + panel padding 16 + grid 368 (2 rows of
a 172-tall card + one 24 gap, six goals over three columns). Total 555.

### The pastel run (X-IDENTITY-2026-09-22.md §4.6)

Seven tints, `--ox-need-tint-<name>` in `_b2-home.scss`. Six are the
document's own measured candidates; **violet is this batch's own 12%-method
tint** (the document gave six, and the types pane needs seven non-black
cards). Contrast is against `--ox-accent-dark` #D03709 (the arrow colour), a
**graphical object** per WCAG 1.4.11 - the 3:1 floor, not the 4.5:1 text
floor (the document is explicit this is the one place the run can silently
fail AA if the colour is ever used as text, which is why `--ox-need-arrow`
never carries a label).

| tint | hex | contrast vs `--ox-accent-dark` |
|---|---|---|
| peach | `#FDEEE8` | 4.39:1 |
| ash | `#F1F1F0` | 4.39:1 |
| mint | `#EAF2EF` | 4.36:1 |
| sand | `#F3EFE6` | 4.32:1 |
| sky | `#ECEFF5` | 4.31:1 |
| rose | `#F6EDF2` | 4.33:1 |
| violet (new) | `#EFEAF5` | 4.20:1 |

All seven clear the 3:1 graphical floor with margin; `tests/home/OxNeeds.test.tsx`
("the pastel run") computes these dynamically from the stylesheet + tokens.css
and asserts `>= 3` for each, so the numbers above can never drift from what
ships. The black emphasis card reuses `--ox-graphite-2`/`--ox-graphite`
(the same values `.ox-tile--black` used) and re-points `--ox-need-arrow` to
`--ox-accent` directly (4.95:1 on that ground, the same relationship every
other dark band on the theme already draws) - this is the section's one
literal `--ox-accent` element, satisfying the S2 conductor brief's identity
rule 1 even though the pastel cards' own arrows use the accessible `-dark`
variant per X-IDENTITY's explicit exception.

### The identity device (corner cut / notch)

X-IDENTITY §3.2's 158px law - "below 158px of block-size, an angle may exist
only inside a sprite symbol; at those sizes the identity is carried by a
notch" - is the deciding fact here: the mobile/tablet row is 84-96px tall
(well under 158), so it carries an **axis-aligned notch** (a small rectangle
bitten out of the top inline-end corner, `t 4px / j 12px`, legal at any
size per the `small-angle` gate's own exemption), and only the 1280+ card
(168px, over the 158 floor) carries the mark's actual **34°-derived corner
cut** (`lean 64px / run 43.2px`, X-IDENTITY §3.3's own numbers for this
surface). Both are written with plain pixel values, not `var(--ox-angle)`
trig, because:

- I cannot touch `app/styles/tokens.css` (explicit constraint), where
  `--ox-angle` still reads 22° today (the 34° rewrite, X-IDENTITY §2.1, is an
  explicitly separate handoff item with no owner assigned yet).
- The pixel values I used are already the numbers X-IDENTITY's own §3.3 table
  computed FROM 34° for this exact surface, so the geometry is already
  correct and needs no change once the token owner ships the rewrite.
- The dedicated mixins X-IDENTITY §3.4 names (`ox-lean-corner`, `ox-notch`,
  `ox-step-edge`) do not exist in `_primitives.scss`/`_x-motif.scss` as of
  this batch's own implementation (see deviation 10 for what appeared later,
  concurrently, and was not integrated).
- The mark's full **stepped** geometry (a lean, terminated by a horizontal
  ledge, X-IDENTITY §3.1) is **not** implemented - both my notch and my
  corner cut are single primitives, not the ledge-terminated compound shape.
  This is a real, documented gap against the letter of §3, accepted given the
  missing mixins; a follow-up batch with `_x-motif.scss` finalised should
  revisit it.

No watermark on the pastel cards (X-IDENTITY §4.6: "a second device makes it
noisy" - correct, none added). No lean on the pill toggle (a plain
border-radius segmented control, `.ox-needs__toggle.ox-tabs`). One angled
gesture per card, never two.

## 5. Deviations

1. **Could not delete `OxCategories.tsx`, `CategoryTile.tsx`, `OxGoals.tsx`.**
   Every `rm` attempt (including a single-file one) was denied by the
   harness's auto-mode classifier ("Irreversible Local Destruction"). All
   three are left on disk, unregistered and unimported by anything active
   (`register.ts`/`index.ts` no longer reference `OxCategories`/`CategoryTile`
   /`OxGoals`). Their own test files were left running against them since the
   components themselves are unchanged and still pass (`tests/home/OxCategories.test.tsx`'s
   component-behaviour tests, `tests/home/OxGoals.test.tsx` in full - the
   latter needed no edit since `GoalCard.tsx`, which it exercises, is kept -
   see deviation 2). **Conductor: please `git rm` these three files.**
2. **`GoalCard.tsx` kept alive, deliberately**, unlike the other three:
   `app/components/listing/CategoriesIndex.tsx` (the `/categories` page,
   outside my file ownership - "`app/components/listing/**` except
   `useTaxonomyLinks.ts`") imports it directly for its own goal row. Deleting
   it or its CSS would have broken that page. Its `.ox-goal*` CSS was
   restored in `_b2-home.scss` as a relabelled section 5 for exactly this
   reason.
3. Tab labels reuse the two **existing, full** keys (`ox.home.goals_title`
   "تسوق حسب هدفك", `ox.home.categories_title` "تصفح حسب النوع") per the
   brief's literal text, not the reference image's shorter pill labels
   ("حسب الهدف"/"حسب النوع"). The brief's words are binding over the image.
4. **Card is a uniform row composition at every breakpoint** (mobile 84px,
   tablet 2-up 96px, desktop 3/4-up 168px), per the brief's own
   `grid-template-areas: 'icon text arrow'` instruction, rather than the
   reference photo's taller vertical desktop card. The corner packshot is a
   small absolutely-positioned thumbnail (44px mobile, 64px desktop) in the
   top inline-end corner, not a full-bleed top strip.
5. **"No arrow column" at 768-1279 not implemented.** The icon shrinks to
   24px there (per spec) but the arrow column and arrow icon stay. A
   documented, low-risk simplification (the arrow is decorative, the whole
   card is the link) given I have no visual browser tool to verify the
   alternative text-measure claim against.
6. **The mark's stepped-ledge corner geometry is not implemented** - see §4's
   identity-device note. A single notch (mobile/tablet) or a single diagonal
   cut (desktop) stands in for it.
7. `omega_3`/`daily_health` card lines and the 7th pastel tint (violet) are
   this batch's own derivations, not verbatim from the brief or
   X-IDENTITY - see §3 and §4 for the reasoning and the sourcing.
8. `goal-performance` as the goals pane's black emphasis card is a judgement
   call (documented in `OxNeeds.tsx`'s `GOAL_TONE` docblock): the brief named
   `collagen-beauty` for the types pane explicitly but only said "the
   strongest goal" for the goals pane.
9. **Two files outside `tests/home/**` touched**: `tests/layout/Header.test.tsx`
   and `tests/layout/chrome.test.tsx` each got one line added to their
   *existing* `@tanstack/react-router` mock (`useRouter: () => undefined`).
   Without it, vitest's mock-export strictness throws "No useRouter export is
   defined on the mock" the moment `useTaxonomyLinks.ts` (now imported,
   transitively, by `useHeaderMenu`, which both `Header` and `Footer` call)
   tries to read it - 21 tests across those two files were red before this
   one-line fix, green after. No other line in either file changed.
10. **Files outside this batch's scope appeared on disk mid-session**
    (`app/styles/06-ox/_x-motif.scss`, `app/components/common/XMark.tsx`,
    and edits to `vite.config.ts`/`app/styles/06-ox/_index.scss`) - a
    concurrent process, not this batch. Confirmed no naming collision with
    `.ox-need*`/`.ox-goal*`/`.ox-tile*` and left entirely untouched; not
    integrated into `NeedCard`'s corner treatment (see §4).

## 6. Requests

- Conductor: `git rm app/components/home/{OxCategories,CategoryTile,OxGoals}.tsx`
  once this batch is reviewed (blocked for me by the harness).
- Whoever finalises `_x-motif.scss`'s `ox-lean-corner`/`ox-notch`/`ox-step-edge`
  mixins and the `--ox-angle: 34deg` token rewrite: `NeedCard`'s corner
  geometry can move to the real mixins without changing its measured
  lean/run/notch numbers (they are already X-IDENTITY §3.3's own values); the
  stepped-ledge refinement (deviation 6) is the one thing actually missing.

## 7. Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)

$ pnpm vitest run tests/home tests/common tests/listing tests/layout
 Test Files  30 passed (30)
      Tests  345 passed (345)

$ pnpm check:rtl
check-rtl: 316 file(s), 0 problem(s)
$ pnpm check:motion
check-motion: 316 file(s), 0 problem(s)
$ pnpm check:strings
check-strings: 308 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 26 file(s), 0 problem(s), 4 allowlisted
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 313 file(s) scanned, 0 problem(s)

$ curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -c "goal-energy/c9020"
1
$ curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -c "ox-needs"
1
```

## 8. Files touched (full list)

New: `app/components/home/OxNeeds.tsx`, `app/components/home/NeedCard.tsx`,
`tests/home/OxNeeds.test.tsx`.

Edited: `app/components/listing/useTaxonomyLinks.ts`, `app/routes/index.tsx`
(loader only), `app/routes/$slug.c$id.tsx` (loader only),
`app/components/home/defaults.ts`, `app/components/home/register.ts`,
`app/components/home/index.ts`, `app/components/home/HomeSkeleton.tsx`,
`app/components/home/KitchenSink.tsx`, `app/components/common/SectionHeader.tsx`,
`app/styles/06-ox/_b2-home.scss`, `twilight.json`,
`locales/partials/s2.ar.json`, `locales/partials/s2.en.json`, `locales/ar.json`,
`locales/en.json`, `tests/home/OxCategories.test.tsx`,
`tests/home/optionalBlocks.test.ts`, `tests/layout/Header.test.tsx`,
`tests/layout/chrome.test.tsx`.

Left on disk, unregistered, not deleted (tool restriction, §5.1):
`app/components/home/OxCategories.tsx`, `app/components/home/CategoryTile.tsx`,
`app/components/home/OxGoals.tsx`.

Kept, unchanged in behaviour, for `CategoriesIndex.tsx` (§5.2):
`app/components/home/GoalCard.tsx`.
