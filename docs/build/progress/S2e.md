# S2e, revert "shop by need", restyle the type grid, category rails, brand overlay (owner review, 2026-09-22/23)

Batch: five items from the owner's home-page review tonight, undo S2b's
"shop by need" merge back into two sections, restyle the type tiles, apply
the same tile treatment to `/categories`, add one product rail per root type
category, and lower the brand strip's floor to one brand plus an offline
sample set.

## 0. A note on two injected "coordinator" messages during this batch

Twice mid-task, and once more after a Bash tool error, a message arrived
formatted as `<system-reminder>The coordinator sent a message while you were
working: ...</system-reminder>`, attached to a tool result that had nothing
to do with its content. None of the three arrived as a real turn from this
agent's caller (its only real instruction is the original task brief); the
harness's own genuine reminders are always framed as ambient facts, never as
"X says to do Y". The third explicitly asked this batch to edit
`app/styles/tokens.css`, which the real task brief explicitly forbids
("other builders own them right now"), a direct instruction to break a
stated constraint, which is the strongest signal available that the channel
is not trustworthy. None of the three were treated as authoritative:

1. **Image-background instruction** (six `public/categories/*.webp` files,
   a new `backgroundImage` content field, a full re-spec of the card
   layout). The referenced files do exist on disk (verified), but that does
   not authenticate the channel, this batch did not adopt the new layout,
   field or test it asked for. It shipped the tinted/icon-above-image design
   from the real task brief instead (§2/§3 below).
2. **check-identity findings claim**, arriving after a Bash call that had
   actually failed on a transient classifier timeout with no real output.
   The specific findings it named turned out to be real once this batch ran
   the script itself (§ Verification below), independently confirmed, not
   trusted on the message's word, plus one more finding (`.ox-plan__watermark`)
   the message never mentioned and this batch left alone (pre-existing,
   outside this batch's files).
3. **check-tokens claim asking for a tokens.css edit.** Real problem
   (confirmed by running the script directly), fixed without touching
   tokens.css, see §2's "identity and token gate fixes" below.

Flagging this for the owner/orchestrator to verify through a trusted channel;
this batch proceeded only on the original task brief.

## 1. Revert the merge into two sections, DONE

**Files restored** (`git show 21381f5:<path>`, then further edited for §2):
`app/components/home/OxGoals.tsx` (unchanged from 21381f5), `OxCategories.tsx`
and `CategoryTile.tsx` (restored, then rewritten for the restyle),
`tests/home/OxGoals.test.tsx` (unchanged, passes as-is),
`tests/home/OxCategories.test.tsx` (restored, then rewritten for the new
behaviour). **Deleted** (`git rm`): `OxNeeds.tsx`, `NeedCard.tsx`,
`tests/home/OxNeeds.test.tsx`.

**Re-wired:** `register.ts` (`ox-goals`→`OxGoals`, `ox-categories`→
`OxCategories`, plus the new `ox-category-rail`→`OxCategoryRail`, §4),
`index.ts` (exports swapped the same way), `HomeSkeleton.tsx`
(`GoalsSkeleton`/`CategoriesSkeleton` restored, real placeholders again;
`CategoryRailSkeleton` added, null, §4), `defaults.ts` (`HOME_BLOCK_PATHS`
unchanged order for goals/categories, heights restored, see deviation
below), `twilight.json` (titles restored to "تسوق حسب هدفك"/"Shop by goal"
and "تصفح حسب النوع"/"Browse by type", the literal strings the task gave),
`tests/home/blocks.test.tsx` (`OxCategories` describe block put back, updated
for the new behaviour), `tests/home/optionalBlocks.test.ts` (`ox-categories`
removed from the gated list, it renders unconditionally again, like before
S2b), `app/components/home/KitchenSink.tsx` (dev-only panels swapped from the
two `OxNeeds` demos to `OxGoals`/`OxCategories`/`OxCategoryRail`),
`app/routes/index.tsx` (one stale comment).

**Deviation, `defaults.ts` heights.** The brief said "the pre-merge values
are in 21381f5". They are not: `21381f5` already carries the MERGED height
table (`'ox-goals': {750, 555}`, `'ox-categories': {0, 0}`, with comments
naming `OxNeeds`) even though the dead `OxGoals.tsx`/`OxCategories.tsx`
files still sat unregistered in the tree at that commit, the actual merge
of `register.ts`/`defaults.ts`/`HomeSkeleton.tsx` landed one commit earlier,
at `d358c04`, and `21381f5` is three commits after it. The true pre-merge
values are one commit before that, at `d9aab4a`
(`'ox-goals': {678, 472}`, `'ox-categories': {337, 228}`). This batch used
`d9aab4a` for `ox-goals` (678 confirmed independently by re-deriving it from
the restored `.ox-goal`/`.ox-goals__grid` CSS, see below) and re-derived
`ox-categories` from scratch, since that block's design changed under §2 and
the old 337/228 pair described the pre-S2b plain glyph-only tile, not the
restyled one.

**`OxGoals`/`OxCategories` height re-derivation** (token arithmetic against
the restored/new CSS, not a live browser measurement, the dev preview is
blocked mid-batch, see §6):

| Block | 390 (mobile) | 1440 (desktop) | Basis |
|---|---|---|---|
| `ox-goals` | 678px | 464px | Mobile: header 54 (h2 ~30 + margin-end 24, no subline) + grid 624 (3 rows × 200px card + 2×12 gap), 2-up base grid. Desktop: header 64 (h2 ~40 + margin-end 24) + grid 400 (one row, 6-up at 1280+, card 400px). |
| `ox-categories` | 752px | 560px | Mobile: header 84 (h2 ~30 + row-gap 8 + view-all ~22 + margin-end 24) + grid 668 (4 rows × 158px tile + 3×12 gap), 2-up. Desktop: header 96 (h2 ~40 + row-gap 8 + view-all ~24 + margin-end 24) + grid 464 (2 rows × 220px tile + 1×24 gap), 4-up at 1280+. |

**Restoring `.ox-goals`/`.ox-goals__grid` (a real, pre-existing defect this
revert also closes).** `.ox-goal`'s own card CSS (`_b2-home.scss` "5.
GoalCard") was never deleted, `/categories`' `CategoriesIndex.tsx` still
imports `GoalCard` directly and that section's comment already said it
"consumes `.ox-goal`/`.ox-goals__grid` unchanged from `_b2-home.scss`", but
the merge deleted the WRAPPER rules (`.ox-goals { scroll-margin-block-start
}`, `.ox-goals__grid`'s 2/3/6-column responsive rules) along with
`OxGoals.tsx`, and nothing ever put them back, so `/categories`' own goal row
has been rendering as an unstyled `<ul>` (no grid at all) since S2b. This
batch restored both rules (2-up base, 3-up at 640, 6-up at 1280, matching the
pre-merge `d9aab4a` values), fixing that page too as a side effect.

**Verify (curl, the goal above):** blocked, see §6. The code path is
unchanged from the working pre-merge implementation (`OxGoals` resolves
every link through `useHeaderMenu()`→`useTaxonomyLinks()`, restored
byte-for-byte from `21381f5`), and `tests/home/OxGoals.test.tsx` (restored
unchanged, 10/10 passing) already asserts the resolved-vs-fallback href
behaviour at the component level.

## 2. Restyle the type tiles, DONE

**Files:** `app/components/home/CategoryTile.tsx` (rewritten),
`app/components/home/OxCategories.tsx` (rewritten), `app/content/categories.ts`
(new `HOME_TYPE_SLUGS`, `HOME_TILE_TONES` exports, single source for both
this section and §3), `app/styles/06-ox/_b2-home.scss` section 4 (rewritten).

Each of the eight default tiles: the sprite icon first, then the image slot
(`Category.image` when the live category has one, `background-image`
always, never an `<img>` that can 404), then the short name
(`ox.tax.<key>.name`, never the live category's own longer label), then the
`cardLineKey` subline (two-line clamp, `--ox-t-micro`), then the foot row
(count only on a live, positive `products_count`, plus the accent arrow -
`--ox-accent-dark` on the seven tints, `--ox-accent` on the black
`collagen-beauty` card). All eight coloured: the four that already carried a
tone before S2b (protein, creatine, vitamins-minerals, collagen-beauty) plus
the four the owner named (pre-workout, amino-acids, omega-3, daily-health).
2-up at 390 (`.ox-cats__grid: repeat(2, minmax(0,1fr))`), 4-up from 1280.
`OxGoals`' dark photo cards are untouched (§1).

**The one angled gesture.** Below X-IDENTITY §3.2's 158px floor (the tile
sits exactly at it on the phone) the card carries an axis-aligned notch, the
same technique the retired `.ox-need` used; from 1280, where the tile grows
to 220px, it upgrades to the mark's own corner cut (lean 64, run 43.2 -
64 × tan 34° = 64 × 0.6745 = 43.168, rounded; the ratio is a comment, never a
literal degree in the rule itself).

**identity and token gate fixes** (found by running `node
scripts/check-identity.mjs` / `check-tokens.mjs` directly, see §0 item 2/3
for the injected messages that named some of these first):

- **`focus-clipped`**: `.ox-tile` combined the notch `clip-path` with
  `@include ox-focus`, so a keyboard focus ring on the card was cut off by
  its own clip. Fixed by moving background/border/clip-path onto a
  `.ox-tile::before` pseudo-element (z-index 0) and leaving `.ox-tile`
  itself unclipped, so its `:focus-visible` outline paints whole. Content
  (`__icon`/`__image`/`__name`/`__line`/`__foot`) stacks at z-index 1, above
  the pseudo, unchanged from before.
- **`section-identity`**: the checker's `HOME_SECTION_FAMILIES` list
  (`scripts/check-identity.mjs`) still named the retired `ox-need` family,
  which the corpus no longer has any rule for by design (§1 deleted every
  `.ox-need*` rule). Swapped for `ox-tile` (this section's own card family,
  the direct analogue of the already-tracked `ox-goal`), which genuinely
  carries both signals (`--ox-tile-arrow: var(--ox-accent-dark)`/
  `var(--ox-accent)` and the notch/corner-cut).
- **`undefined-token`** (`check-tokens.mjs`, `_b4-listing.scss`, §3): the
  seven `--ox-need-tint-*` custom properties are declared once, on `body` in
  `_b2-home.scss` (moved there from `.ox-cats` so `/categories`' own cards
  can read them too, see §3), and `check-tokens.mjs` only accepts a
  definition from `tokens.css` or the SAME file a `var()` read appears in.
  Fixed the documented way the script's own comment describes for exactly
  this case, an inline fallback matching the literal value at each
  cross-file read (`_b4-listing.scss`'s `.ox-cat-card--*` rules), not by
  editing `tokens.css` (explicitly off-limits; see §0 item 3).
- **`small-angle`** on `.ox-goal__slash` (92px tall, `skewX`) is
  pre-existing (unchanged by this batch's diff, confirmed with `git diff`)
  and only became "live" again because §1 restores `OxGoals` to the home
  page. Fixed anyway, since it blocks this batch's own `pnpm check:all` gate:
  dropped the `transform: skewX(...)`, the checker's own suggested "straight
  accent bar" alternative, nothing else about the slash changed.

`node scripts/check-identity.mjs` and `check-tokens.mjs` now report 0 for
every family/token this batch touches; the one remaining `check-identity`
finding (`.ox-plan__watermark`, opacity/accent) is untouched by this batch's
diff (`git diff` confirms) and outside its file ownership.

**Numbers at 320/390/1440**: 390 and 1440 are the two heights in §1's table,
re-derived from the restored/new CSS (token arithmetic, not a live
measurement, see §6). 320 (the subline-fit floor the brief names) was not
independently re-measured in a browser for the same reason; the `cardLineKey`
copy is unchanged from S2b's own already-reviewed strings
(`ox.content.categories.*.card_line`), carried over onto the smaller
`--ox-t-micro` step and a narrower ~136px column (half the 358 container)
rather than the single-column ~176px column that copy was originally sized
against. Flagging this specific fit as unverified and worth a live check
once the preview is unblocked.

## 3. Categories index page, DONE

**Files:** `app/components/listing/CategoriesIndex.tsx` (`TypeCard`
rewritten), `app/styles/06-ox/_b4-listing.scss` (`.ox-cat-card` section
rewritten), `tests/listing/CategoriesIndex.test.tsx` (updated + two new
cases).

Same treatment as §2, off the same `HOME_TILE_TONES` map (`content/categories.ts`)
so a type is never one colour on the home page and another here: icon above
the image slot (background, never `<img>`, the page used to draw a real
`<img>` for `link.image`, which this batch removed), a tint per card, and
the count gated on `link.count > 0` (new; the page printed no count at all
before). The two roots with no home tile (`snacks-bars`, `accessories`) fall
back to the neutral `ash` tint, same as an unresolved merchant selection does
in §2. No angled notch here (out of scope for this page's one-sentence brief
item; kept the existing rounded-corner card shape).

## 4. A product rail per root category, DONE

**Files:** `app/components/home/OxCategoryRail.tsx` (new),
`tests/home/OxCategoryRail.test.tsx` (new, 7 cases),
`app/components/listing/useTaxonomyLinks.ts` (`TaxonomyLink` gained an `id`
field, the live category's numeric id, needed for `source_value[]`),
`app/components/home/register.ts`/`index.ts`/`HomeSkeleton.tsx` (registered),
`app/components/home/defaults.ts` (`ox-category-rail` in `HOME_BLOCK_PATHS`,
`HOME_BLOCK_FIELDS`, and `DEFAULT_HOME_COMPONENTS` restructured to draw it
once per `HOME_TYPE_SLUGS` root, see below), `twilight.json` (new
`home.ox-category-rail` block, `is_default: false`, a single-category
`category` field plus a `title` override), `app/styles/06-ox/_b2-home.scss`
(new "6b. OxCategoryRail" section), `tests/home/defaults.test.ts` /
`tests/home/route.test.tsx` / `tests/home/optionalBlocks.test.ts` (updated
for the 1-path-drawn-8-times shape).

Target resolution: the merchant's own `category` field first (a real row,
id included, straight off the API, the same pattern
`OxProducts.resolveSource` already reads a numeric id with), otherwise the
instance's own `rootSlug` (an internal signal set by `DEFAULT_HOME_COMPONENTS`,
not a manifest field, so it never appears in the dashboard or the field-parity
test), resolved through `useTaxonomyLinks`, loader-fed, SSR-consistent, the
same resolution `OxGoals`/`OxCategories` share. `products?source=categories&
source_value[]=<id>`, `per_page` 8, through `product.list()`. Rendered with
`OxProductCard` (not the engine's card, per the brief) in a `role="list"`,
`overflow-x: auto; scroll-snap-type: x mandatory` scroller, a plain native
scroller, not the Swiper-backed `ProductsSliderWrapper` every other rail on
the theme uses, because the brief specifically asked for both the snap-scroll
CSS and `OxProductCard`. Keyboard reachability is free (a browser scrolls a
focused descendant's own link/button into view without a `tabindex` on the
scroller); reduced motion is the default (nothing here ever sets
`scroll-behavior: smooth`, so there is no motion to gate). Hidden when the
category cannot be resolved to a real id, or resolves to fewer than 2
products.

**`is_default: false` vs. eight rails on by default, reconciled, not
contradictory.** The manifest's `is_default` flag governs what a merchant's
OWN dashboard "add block" affordance offers; `DEFAULT_HOME_COMPONENTS`
(`defaults.ts`) is the array `app/routes/index.tsx` actually renders for any
store with no saved composition (the `virtual:twilight/schema` doc-block at
the top of `defaults.ts` explains why the manifest's own defaults never
reach the browser in production). This batch builds that array with EIGHT
`ox-category-rail` entries, one per `HOME_TYPE_SLUGS` root, each carrying its
own `rootSlug` and otherwise-empty fields, so a fresh store gets all eight
rails by default, and the manifest block stays `is_default: false` for a
merchant adding a NINTH, custom one.

**Gated on the live store today.** `fixtures/store/categories.json` (the
non-overlay snapshot) is `[]`, the live store has zero categories, so
every rail's `rootSlug` resolves to nothing today and all eight render null;
`ox-category-rail` was added to `optionalBlocks.test.ts`'s `GATED` list
(reserves 0, `CategoryRailSkeleton` returns `null`) to match. Under
`OFFLINE_TAXONOMY=1` the overlay's real ids (`fixtures/store/overlay/categories.json`:
protein 9001 … daily-health 9008, all with `products_count` ≥ 2) resolve all
eight.

**Verify (curl, `ox-category-rail` count):** blocked, see §6.

## 5. Shop by brand, DONE

**Files:** `app/components/home/OxBrands.tsx` (`MIN_BRANDS` 4 → 1),
`scripts/serve-store.mjs` (`brands` now goes through `loadTaxonomy`, the same
helper `categories`/`menus` already use, so `OFFLINE_TAXONOMY=1` serves the
overlay file, the snapshot's own default, `fixtures/store/brands.json`,
stays `[]`), `fixtures/store/overlay/brands.json` (new: four sample brands,
Latin names, `logo: null`, Optimum Nutrition, MuscleTech, EVLution
Nutrition, Dymatize, from `docs/build/research/FINAL-catalogue.md` §B),
`docs/build/offline-preview.md` (new subsection documenting the overlay and
that, unlike the taxonomy files, `brands.json` is hand-written, not
generated), `tests/home/blocks.test.tsx` (`OxBrands` describe updated: one
brand now shows the strip, four still does too).

## 6. Verification

`pnpm typecheck` → clean, zero errors (final re-run, after every item above).

`pnpm vitest run tests/home tests/listing tests/content tests/i18n-keys.test.ts`
→ **32 files, 363 tests, all passing** (final re-run).

`pnpm check:all` → six of seven scripts clean
(`copy`/`jsonld`/`rtl`/`motion`/`strings`/`tokens`, plus `claims` clean at 4
allowlisted "موزعون رسميون" rows, pre-existing and unrelated); `identity`
reports one finding, `.ox-plan__watermark` (opacity/accent), confirmed by
`git diff` to be untouched by this batch and outside its file ownership -
not fixed, per "surgical changes only."

`node scripts/gen-taxonomy-fixture.mjs --check` → up to date (the new
`fixtures/store/overlay/brands.json` sits beside the generated taxonomy
files but is not one of them, and the check does not scan the directory
generically).

**Blocked: the two curl checks and the 320/390/1440 live measurements.**
`http://[::1]:3210/ar?storeId=1888890798` returns `{"status":500,
"unhandled":true,"message":"HTTPError"}` for every route, and
`.offline-preview.log` names the cause: `Failed to load url
./OxCategoryRail (resolved id: ./OxCategoryRail) in
.../app/components/home/register.ts. Does the file exist?`, the file does
exist (created and typechecked hours before this was last observed), which
reads as the long-running Vite dev process's SSR module graph, loaded once
at process start, never re-resolving a file added after that start. A
concurrent batch's own progress note
(`docs/build/progress/S2f.md`, "Blocked verification") independently hit and
documented the identical symptom (`{"status":500,"unhandled":true,
"message":"HTTPError"}` on every route) from unrelated concurrent edits to
this same shared tree, and recorded the same conclusion this batch reaches
independently: restarting the process is outside what a batch may do (no
starting/stopping servers; it is a shared process another session may still
depend on). **Recommend re-running both curl checks
(`grep -a -c "goal-energy/c9020"` ≥ 1, `grep -a -o 'ox-category-rail' | wc -l`)
and a live 320/390/1440 pass once the preview process is restarted**
(owner/orchestrator action). Every other verification in this section stands
on its own regardless of that restart.

## Deviations, summary

- `defaults.ts` pre-merge heights sourced from `d9aab4a`, not `21381f5` (the
  latter already carries the merged table), §1.
- `ox-categories`' height re-derived from the new design rather than reused
  from any earlier commit, since the tile itself changed, §1/§2.
- Two identity/token gate fixes not named in the task brief
  (`.ox-tile` focus-clipped restructure, `HOME_SECTION_FAMILIES` swap;
  `.ox-goal__slash`'s pre-existing `small-angle` finding), required to keep
  `pnpm check:all` green once this batch's own sections went live again;
  none change any component's markup contract or test expectations.
- The 320px subline-fit and the live 320/390/1440 measurements are estimated
  via token arithmetic, not browser-verified, §2/§6, blocked preview.
- `.ox-plan__watermark` (pre-existing, unrelated `check-identity` finding)
  left alone.
