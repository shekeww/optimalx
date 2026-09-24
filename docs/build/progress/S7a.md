# S7a: the six marketing posters, home carousel and offers grid (2026-09-24)

Batch: owner brief 2026-09-24. Six portrait 4:5 marketing posters, not yet on
disk (the owner drops them into `public/assets/posters/` later), become the
home carousel AND a poster grid at the top of `/offers`, both built and
verified in the UNAVAILABLE state (the tinted plate with the alt as a
caption, never a broken image), with a one-command import for when the files
land.

Two mid-session coordinator updates folded in, as instructed:

1. The owner's six files are still not in `public/assets/posters/`. Every
   surface is built and verified with `available: false` on every entry (the
   real, unavoidable state today); `scripts/posters-import.mjs` prints
   exactly what to do, both on an empty folder and after each run.
2. `OxPosters.tsx`/`PosterCard.tsx` had already been edited by S5a (the rail
   primitive, the four carousel tiers) and S6b (sprite icons, `<Icon>`
   instead of `sicon-*`) before this batch started; both were re-read fresh
   and their conventions (the rail markup, `Icon`, `toInternalPath`) are kept
   in every rewrite below. A third concurrent change was found while
   re-reading: `docs/build/UX-2026-09-24.md` P0-11 (a sibling batch, S7d)
   had already renamed the carousel's own heading to `ox.home.posters_title`
   = "ابدأ من هنا" with a new `ox.home.posters_lead` subline, kept as-is;
   this batch's own `label`/`label_en` merchant-field override sits on top
   of it rather than reverting it (§8 records a related bug found in that
   same edit, not fixed here since it is outside this batch's files).

---

## 1. The six posters: slug, artwork claim, verified link target

Every id below was checked directly against `fixtures/store/products.json`
and `app/content/salla-ids.ts` before use, not assumed from the brief.

| # | slug | kind | what the artwork says (owner's own marketing) | link target, verified |
|---|---|---|---|---|
| 1 | `inbody-consult` | offer | استشارة مجانية + فحص InBody مجاني، اختر هدفك، احجز الآن | `pathForSku('OX-046')` → `/p1051830221`, the branch-visit booking product (`fixtures/store/products.json` line 3145: `"id": 1051830221, "name": "زيارة الفرع في المدينة المنورة"`, price 0). Confirmed live in `app/content/salla-ids.ts`. |
| 2 | `weekly-picks` | offer | الأكثر طلبا هذا الأسبوع، أي منتجين بـ 196 ريال، باي1 خذ1 مجانا | Home carousel: `/offers`. On `/offers` itself: `/offers#offers-grid` (the page's own product grid anchor, a poster cannot usefully link to the page it is already on; see §5 for the bug this caught). |
| 3 | `bundle-her` | bundle | باقة لها، خصم 20%، بروتين + Opti-Women + شيكر أخضر | No product whose name contains "باقة"/"حزمة" AND "لها" exists, searched `fixtures/store/products.json` for `"name":.*(حزمة\|باقة)`, one hit only: `"حزمة البداية - اوبتيمال اكس"` (id 1141798217, SKU OX-041). Falls back to it: `pathForSku('OX-041')` → `/p1141798217`. |
| 4 | `bundle-him` | bundle | باقة له، خصم 20%، بروتين + Opti-Men + شيكر أسود | Same search, same result (no "باقة له" product either): `pathForSku('OX-041')` → `/p1141798217`. |
| 5 | `weight-subscription` | subscription | اشتراك 3 أشهر لإدارة الوزن، 696 ريال، + InBody مجاني | No product name contains "اشتراك" or "خطة" (`grep` of `fixtures/store/products.json` for `خطة` finds only the PDF guide's subtitle, not a product name). Falls back to `/services#plans`, the anchor added to `OxServices.tsx`'s plans row for this exact purpose (§4). |
| 6 | `bigramy-creatine` | offer | كرياتين بيج رامي، باي1 خذ1 مجانا + شيكر Big Ramy مجاني | No "بيج رامي"/"Big Ramy" product in the catalogue (checked both creatine products that do exist: `كرياتين مونوهيدرات - ثورن` id 779499389, `كرياتين مونوهيدرات مطحون ناعم - اوبتيموم نيوترشن` id 995134839, neither is Big Ramy). Falls back to the live `creatine` taxonomy category through `useTaxonomyLinks` (`app/content/taxonomy.json` already carries this type root, slug `creatine`), and to `/offers` while that category has not resolved yet (the fixture store has zero live categories today, same pre-existing condition every other taxonomy-linked block in this theme already documents). |

---

## 2. Files changed

- **`app/content/posters.ts`** (rewritten), six `PosterCardContent` entries
  replacing the old five content-derived cards; `posterHref()`, a pure
  resolver (no hook) taking a `context: 'home' | 'offers'` and a category
  lookup callback; `available: false` on every entry.
- **`app/components/home/PosterCard.tsx`** (rewritten), `<Link>` wrapping
  `<img>` (srcset at [450, 720, 1125], `sizes`, `aspect-ratio: 4/5`, real
  `width`/`height`) when `available`; a tinted `.ox-pcard__placeholder` +
  `.ox-pcard__caption` (the alt text, visible) when not; sharp corners; the
  angled strap kept at the smallest identity-ladder tier; no diagonal cuts
  (§6 explains why, and which of the two brief-offered options was taken).
- **`app/components/home/OxPosters.tsx`** (rewritten), merchant field
  (`image_N`/`link_N`/`alt_N`/`label`/`label_en`) read first, content map
  second, per card, inside one `useMemo`; a merchant-supplied image is
  treated as available immediately, independent of `scripts/posters-import.mjs`
  (§7, a design gap found and fixed while writing the tests);
  `useTaxonomyLinks()` (the shared, cached resolver every other taxonomy
  link in the theme uses) replaces the old bespoke inline category query;
  the S5a rail markup, the S6b `Icon` nav arrows and the S7d subline are all
  byte-for-byte unchanged.
- **`app/components/home/defaults.ts`**, `HOME_BLOCK_HEIGHTS['ox-posters']`
  re-measured for the 4:5 card (mobile 456, desktop 477; was 369/387, §3
  has the arithmetic); `HOME_BLOCK_FIELDS['ox-posters']` gains the 20 new
  merchant fields, every one `null` (parity with `twilight.json`, and with
  the "ships every merchant field empty" test in `tests/home/defaults.test.ts`).
- **`twilight.json`**, `home.ox-posters` block gains 20 fields
  (`image_1..6`, `link_1..6`, `alt_1..6`, `label`, `label_en`), every
  `"value": null`. §7's fixed test forbids a non-empty default value; the
  `description`/`placeholder` text on each field tells the owner what it is
  for and what it defaults to instead.
- **`app/components/listing/ListingPage.tsx`**, new local `OffersPosterGrid()`
  component (not exported, mirrors the file's own existing pattern of small
  composed sub-components like `FeaturedRail`), rendered above the grid only
  when `source.type === 'offers'`; the results wrapper carries
  `id="offers-grid"` on that one variant only.
- **`app/routes/offers.tsx`**, `offersHeadExtend()` wraps the shared
  `listingHeadExtend()` and overrides `title`/`description` from new
  `ox.seo.offers.*` keys, since the static `offers` source has no taxonomy
  node for the shared extension to key off (§1's own logic only fires for a
  category/goal slug).
- **`app/components/home/OxServices.tsx`**, `BandRow` takes an optional
  `id` prop; the plans row now carries `id="plans"`, the
  weight-subscription poster's `/services#plans` fallback, one attribute,
  per the brief.
- **`app/styles/06-ox/_b2-home.scss`**, `.ox-pcard` family rebuilt: the two
  per-tier `@media` blocks that used to hold the clip-path/strap-width
  overrides are gone; `.ox-pcard` is `aspect-ratio: 4/5` with no clip-path;
  new `.ox-pcard__placeholder`/`.ox-pcard__caption`; `.ox-pcard__slash` is
  one fixed size (no more three tiers). `.ox-posters__slide` and the nav/
  arrow rules (S5a/S6b) are untouched.
- **`app/styles/06-ox/_b4-listing.scss`**, new §16, the offers poster grid
  (`.ox-offers-posters`/`__title`/`__grid`, 1-up below 768, 2-up from 768,
  3-up from 1280, per the brief).
- **`locales/ar.json`/`locales/en.json`**, the five old poster keys
  (`ox.home.poster.*`, 15 lines each locale) deleted; nine new keys merged in
  from the new partial (`node scripts/i18n-merge.mjs` → 9 added, 0 updated,
  both locales).
- **`locales/partials/s7a.ar.json`/`s7a.en.json`** (new), the six poster
  `alt` keys, `ox.offers.posters_title`, `ox.seo.offers.title`/
  `.description` (measured to SEO-ENG-010's target ranges, §9).
- **`scripts/posters-import.mjs`** (new), Node + Python/PIL, §4.
- **`tests/home/OxPosters.test.tsx`** (rewritten), 11 tests, §10.
- **`tests/listing/ListingPage.test.tsx`** (new describe block), 4 tests,
  §10.
- **`docs/build/progress/S7a.md`**, this file.

`app/components/home/HomeSkeleton.tsx` was read (per the brief's own list)
but needed no edit: `PostersSkeleton()`'s four placeholder blocks already
match the widest tier's visible count (4 at 1440), a number the 4:5 aspect
change did not move, so S5a's own reasoning for leaving it alone still holds.

---

## 3. Reserved height, re-measured for 4:5 (S5a tiers, by delta)

S5a's own width table (`_b2-home.scss` §17.2, unchanged by this batch) gives
the card's rendered width at the two viewports `HOME_BLOCK_HEIGHTS` measures
against: **309.2px** at the 390 probe (the 1.15-visible tier) and **312.0px**
at the 1440 probe (the 4-visible tier). `.ox-pcard` traded its old flat
`block-size: 300px` for `aspect-ratio: 4 / 5` on those same widths, so height
= width × 1.25 at each:

| | width | height (× 1.25) |
|---|---|---|
| mobile (390 tier) | 309.2px | 386.5px |
| desktop (1440 tier) | 312.0px | 390.0px |

Everything else in the block (the `SectionHeader` row, the nav, the rail's
own cue/progress-strap addition) is unchanged by this batch, so only the
card term of the previous total moves, a delta, the same method S5a itself
used for its own +7px rail-primitive adjustment, not a fresh live
re-derivation of the whole block:

- mobile: 369 − 300 + 386.5 = **455.5 → 456**
- desktop: 387 − 300 + 390.0 = **477.0 → 477**

`HOME_BLOCK_HEIGHTS['ox-posters']` is now `{ mobile: 456, desktop: 477 }`.
Read back live (§11): `.s-block--ox-posters` on `/ar` reserves
`min-height:clamp(456px, calc(448.2px + 2vw), 477px)`, the exact
`clampHeight(456, 477)` output, confirmed on the running page, not only in
the unit test.

---

## 4. `scripts/posters-import.mjs`

Node + Python/PIL via `child_process.spawnSync`. `python` is tried before
`python3` (`python3` on this machine is the Microsoft Store alias stub that
refuses to run; `python` at `C:\Python314\python.exe`, with Pillow 12.3.0, is
the real one, both probed live with `--version` before picking one, so the
script fails loudly rather than silently picking a broken binary elsewhere).

**What it does.** Reads `public/assets/posters/*.{png,jpg,jpeg,webp}`; a file
matches a slug either by exact basename (`inbody-consult.png`) or through
`public/assets/posters/map.json` (`{"<file>": "<slug>"}`), map entries taking
precedence, and, when both a plain original and this script's own prior
`<slug>.webp` output exist for one slug, prefers the non-`.webp` original,
so a re-run always re-derives from the pristine file rather than
re-compressing an already-compressed one. For each resolved slug: opens the
source once in Python/Pillow, writes `<slug>.webp` (1125 wide),
`<slug>-720.webp`, `<slug>-450.webp`, quality 82, each proportional to the
SOURCE file's own aspect ratio (never cropped, the brief's own "4:5
preserved" is read as "do not force a ratio the source does not have", since
the owner's real files are expected to already be close to 4:5 and the
import's job is resizing, not correcting). Prints a table, then flips that
slug's `available: false` to `true` in `app/content/posters.ts` by locating
the nearest `available:` field after that slug's own `slug: '<slug>'`
declaration (§7.1 explains why this is two plain `indexOf` calls, not a
single regex).

**On an empty (or missing) folder:** prints exactly `no posters yet` plus
what to do next, and exits 0 -

```
$ node scripts/posters-import.mjs
no posters yet
Drop the six poster files into public\assets\posters\, named exactly one slug
each (inbody-consult.png, weekly-picks.jpg, bundle-her.png, bundle-him.png,
weight-subscription.png, bigramy-creatine.png, any of .png/.jpg/.jpeg/.webp),
or keep your own filenames and add a map.json ({"<file>": "<slug>"}). Then run
`node scripts/posters-import.mjs` again.
```

**After a run**, it also names whichever slugs are still missing, so the
owner always knows what is left to drop in:

```
Waiting on: bundle-her, bundle-him, weight-subscription, bigramy-creatine.
Drop those files in and run this again.
```

or, once all six exist, `All six posters processed.`

### 4.1 Tested live, three passes, each cleaned up afterward

No poster files and no `available: true` are left anywhere in the tree -
confirmed after every pass (`grep -c "available: false" app/content/posters.ts`
→ 6, `grep -c "available: true"` → 0, `public/assets/posters/` absent).

1. **Empty folder**, the exact output quoted above, exit 0.
2. **Exact-slug filenames** (`inbody-consult.png` at 900×1120,
   `weekly-picks.jpg` at 900×1120, both a synthetic 4:5 test image): produced
   `<slug>.webp` at **1125×1400**, `<slug>-720.webp` at **720×896**,
   `<slug>-450.webp` at **450×560** for both, the source's own 900:1120
   ratio held exactly at every output width, confirmed by
   `PIL.Image.open(...).size` on all six output files directly, not
   asserted. Flipped both slugs' `available` to `true`. A second run
   reported `already true` for both and left the other four untouched -
   idempotent.
3. **`map.json`** (`{"my-export-03.png": "bundle-her"}`, an arbitrary
   filename at 1000×1250): resolved to `bundle-her`, produced the same three
   proportional outputs (1125×1406, 720×900, 450×563), flipped its
   `available` flag.

### 4.2 A real bug caught live during pass 2's idempotency check, not left for the owner to find

The first `markAvailable()` used one regex, `slug: '<slug>'[\s\S]*?available:\s*false`.
A lazy quantifier backtracks until the WHOLE pattern matches; once a slug's
own `available` was already `true`, the regex did not simply fail, it kept
extending past that `true` and matched the NEXT entry's `available: false`
instead, flipping the wrong slug (`weekly-picks` was found flipped to `true`
after only `inbody-consult` had ever been processed, on the second/idempotency
run). Rewritten to two plain `text.indexOf()` calls (find `slug: '<slug>'`,
then the nearest `available:` after it, then read and replace only that
value), no backtracking, no cross-entry match possible. Re-verified clean
across all three passes above after the fix; the corrupted test state
(`weekly-picks: true`) was reverted by hand before re-testing.

---

## 5. A second bug caught live: a bare `#offers-grid` anchor pointed off the page

`posterHref()`'s offers-page branch for `weekly-picks` originally returned
the bare fragment `#offers-grid`. `PosterCard` runs every `to` through the
theme's own `toInternalPath()` (`app/components/layout/navLinks.ts`), which
prefixes anything not already starting with `/`, a bare fragment included -
so the rendered `href` was `/#offers-grid`: a link to the HOME route's own
hash, not a same-page scroll on `/offers`. Caught by
`tests/listing/ListingPage.test.tsx`'s new "points the weekly-picks poster at
the page's own grid anchor" test, which asserts the literal rendered `href`
rather than the pre-`toInternalPath` value. Fixed by returning the full
path, `/offers#offers-grid`, which survives `toInternalPath` unchanged.

---

## 6. The diagonal corner cuts: dropped, not reduced, and why

The brief offered two options for the cuts S3b/S4a gave `.ox-pcard`
(top-right and bottom-left, 34°): reduce them to the smallest identity-ladder
tier, or drop them for image posters. **Dropped**, for one reason: the
owner's logo sits at the physical top-left and a vertical tagline at the
physical top-right of files that do not exist on disk yet, and a `clip-path`
written today cannot see where either one will actually land in an image
dropped in weeks from now, at ANY tier size. Only a zero-cut card is provably
safe for artwork this theme has not inspected; a smaller cut is a smaller
guess, not a safe one. Sharp corners (`border-radius: 0`) stay regardless,
per the brief.

The angled orange strap stays (the brief is explicit that it should), rebuilt
at the smallest lean/run pair the identity ladder has (40/27, the tier
`GoalCard`'s own 390 probe uses) since there is no clip left to size a bigger
one against. **This is a residual, honest risk, not a solved one**: the
strap sits at the physical top-right, the same zone the brief names as
holding "a vertical tagline", a real file whose tagline runs to within a
few pixels of that corner can still visually collide with it. Flagged in the
SCSS itself (`.ox-pcard__slash`'s own comment) and here, for the visual QA
pass the owner or a later batch should do once the six real files land and
can be looked at directly, which no automated check in this session can
substitute for.

---

## 7. Two design gaps found and fixed while writing the tests

### 7.1 A merchant-uploaded image was hidden behind the "no file yet" placeholder

`OxPosters.tsx`'s `available` prop was originally wired straight to
`card.available`, the content map's own flag, which only
`scripts/posters-import.mjs` ever flips, even for a poster whose `image_N`
merchant field IS set. That would have hidden a merchant's own dashboard
upload behind the unavailable placeholder until someone ALSO ran the import
script for that slug's unrelated default file, which makes no sense: a
merchant-supplied URL is its own fact, independent of whether this repo's
six default files have landed. Fixed: `available` is now
`Boolean(ownImage) || card.available`, computed per card in the same
`useMemo` that already resolves `photo`/`to`/`alt`. Covered by
`tests/home/OxPosters.test.tsx`'s "reads image_N/link_N/alt_N first, and
treats a merchant image as available before the import script ever runs".

### 7.2 (the `#offers-grid` anchor bug is §5, kept in narrative order above)

---

## 8. A cross-batch finding, flagged not fixed: `SectionHeader`'s `subline` prop is declared but never rendered

While re-reading `OxPosters.tsx` per the coordinator's instruction, its
`<SectionHeader subline={t('ox.home.posters_lead')} />` call (added by S7d,
still in-flight, `docs/build/progress/S7d.md` exists but was untracked at
the time this was checked, so that batch had not finished) was checked
against `app/components/common/SectionHeader.tsx`. `SectionHeaderProps` DOES
declare `subline?: ReactNode` (line 24), but the component function never
destructures it, it falls into the `...rest` spread and lands on `<header
{...rest}>` as an inert, invalid DOM attribute, never rendered as visible
text. Confirmed by reading the whole file (`grep -n subline` → one hit, the
type declaration only) and by inspecting the render body directly.

**Not fixed here.** `SectionHeader.tsx` is a shared primitive with 15+ call
sites, is not named anywhere in this batch's brief, and a concurrent batch
was already mid-edit on the exact feature (the subline) that exposed the
bug, fixing it here risks colliding with that batch's own save. This
batch's own `ox.home.posters_lead` consumption (inherited from that same
concurrent edit, not authored by this batch) is therefore visually silent
today: the section header shows only the title until `SectionHeader.tsx`
destructures and renders `subline`. None of this batch's own six-poster/
offers-grid work depends on the subline rendering, so nothing here is
blocked by it. Flagged for whoever owns `SectionHeader.tsx` (S7d or the
conductor) rather than worked around.

---

## 9. A second cross-batch finding, flagged not fixed: `tests/content/imagePaths.test.ts` cannot see this batch's own asset references inside the full suite

`app/content/posters.ts` intentionally references six files that are not on
disk yet (`/assets/posters/<slug>.webp`), by design: the path has to be
stable and known ahead of time so `scripts/posters-import.mjs` can write the
owner's file to exactly that path later, and `PosterCard` never actually
requests it until `available` is true (§6), which is the same "never fire a
request for a file that cannot arrive" outcome `tests/content/
imagePaths.test.ts` exists to enforce, achieved by a runtime gate instead of
by never writing the path in source.

That test is not in this batch's file list, and not in the brief's own
verification command either (`pnpm vitest run tests/home tests/listing
tests/pages tests/common` never reaches `tests/content`). Run anyway, out of
caution, two things were found, both pre-existing, neither introduced by
this batch:

1. **Run alone, it correctly fails** on the six new poster paths (`pnpm
   vitest run tests/content/imagePaths.test.ts -t "resolves every referenced
   asset"` → 1 failed, lists all six `/assets/posters/*.webp` refs).
2. **Run as part of the full file (both of its own `it` blocks together), it
   passes**, hiding a real gap. Root cause, confirmed by isolating each `it`
   block: the file declares `const ASSET_REF = /.../g` once at module scope
   and calls `ASSET_REF.test(...)` inside the FIRST test's `.some()` loop. A
   global-flagged `RegExp`'s `.test()` mutates its own `lastIndex` on a
   match, and `.some()` stops at the first truthy file, leaving `lastIndex`
   at whatever position it matched inside that file's content. The SECOND
   test then reuses the same `ASSET_REF` object for `src.matchAll(ASSET_REF)`
   on every file including `posters.ts`, and misses those matches
   (empirically: 0 missing reported) because of that carried-over state.

Not this batch's file to fix (not in the file list this brief gives), and
not this batch's bug to have introduced, the shared mutable regex was
already there; this batch's six new references are just the first case this
session to land after another `it` block in the same file ran first and left
state behind. **Left exactly as found**, with this finding recorded for
whoever owns that test: the fix is resetting `ASSET_REF.lastIndex = 0`
before the second test's own loop (or a fresh `RegExp` per use), and
separately, a narrower content question the same owner should decide -
whether `/assets/posters/*` belongs in the file's own `NOT_A_FILE`-style
allowlist now that a poster's path is legitimately, deliberately unresolved
until the owner's import runs, and the component itself never requests it
while unavailable. This batch's own mandated verification does not depend on
this test and is unaffected either way.

---

## 10. Locale keys (SEO-ENG-010 measured, not eyeballed)

`locales/partials/s7a.ar.json`/`s7a.en.json`, merged (`node scripts/
i18n-merge.mjs` → 9 added, 0 updated, both locales):

| key | value | length |
|---|---|---|
| `ox.posters.*.alt` ×6 | the six strings the brief supplies verbatim (AR) plus a claims-clean English twin composed for this batch |, |
| `ox.offers.posters_title` | AR "العروض والباقات والاشتراكات" / EN "Offers, bundles and subscriptions" |, |
| `ox.seo.offers.title` | AR "عروض المكملات الغذائية والباقات \| اوبتيمال اكس" / EN "Supplement Offers and Bundles in Saudi Arabia \| OptimalX" | AR 46 (target 45-55), EN 56 (target 50-60) |
| `ox.seo.offers.description` | AR "تصفح عروض اوبتيمال اكس على المكملات: منتجات بأسعار مخفضة وباقات موفرة وخطط استشارية، مع الشحن إلى جميع مدن السعودية من فرع المدينة المنورة." / EN "Browse OptimalX supplement offers: discounted products, money-saving bundles and advisory plans, shipped across Saudi Arabia from our Medina branch." | AR 139 (target 130-150), EN 148 (target 140-160) |

Every value measured with a Node one-liner (`.length`) before shipping, not
estimated. `ox.seo.offers.description`'s "advisory plans" (not
"subscription plans") is deliberate: the catalogue holds no subscription
product (confirmed §1 row 5), so the page-level meta avoids overclaiming
what the grid actually contains; the `weight-subscription` poster's own
baked-in artwork text is the owner's own marketing and is not gated by this
theme's copy rules.

`node scripts/check-copy.mjs locales/ar.json locales/en.json` → 0 problems;
`node scripts/check-claims.mjs` → 0 problems (4 pre-existing allowlisted
`official_distributors`/`trust_distributors` rows, unrelated to this batch).

---

## 11. Tests

### `tests/home/OxPosters.test.tsx`, rewritten, 11/11 green

One card per `POSTER_CARDS` entry with the correct `data-poster` slugs; the
unavailable placeholder (alt as a visible caption, zero `<img>` elements) as
the default state; the strap present and `aria-hidden`, never a nested
link/button; the five static-fallback `to` values (`weekly-picks` →
`/offers`, both bundles → `/p1141798217`, `weight-subscription` →
`/services#plans`, `inbody-consult` → `/p1051830221`); `bigramy-creatine`
falling back to `/offers` (never a search URL) while the live `creatine`
category is unresolved, and resolving to that category's own URL once one
exists (a live-category test, `useTaxonomyLinks` exercised for real, not
mocked away); every merchant-field override (`image_N`/`link_N`/`alt_N`,
`label`/`label_en`, including the "merchant image is available immediately"
fix); the rail primitive's markup (S5a) and the `Icon`-drawn nav arrows
(S6b) both intact; `loading="eager"` on the first two cards, `"lazy"` past
them.

### `tests/listing/ListingPage.test.tsx`, new describe block, 4/4 green

The six posters render above the product grid with the
`ox.offers.posters_title` h2 (asserted before the `ox-listing__catalogue`
markup in DOM order, not just present); the grid's own `#offers-grid`
anchor sits on the results wrapper; every poster is the unavailable
placeholder; `weekly-picks`'s href is the page's own anchor
(`/offers#offers-grid`), not a bare fragment or `/offers`; a non-offers
listing renders neither the grid nor the anchor id.

```
$ pnpm vitest run tests/home/OxPosters.test.tsx tests/listing/ListingPage.test.tsx
 Test Files  2 passed (2)
      Tests  44 passed (44)
```

---

## 12. Verification

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/home tests/listing tests/pages tests/common
 Test Files  41 passed (41)
      Tests  481 passed (481)
```

```
$ pnpm check:rtl        → check-rtl: 328 file(s), 0 problem(s)
$ pnpm check:motion     → check-motion: 328 file(s), 0 problem(s)
$ pnpm check:strings    → check-strings: 330 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
                        → check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
                        → check-claims: 40 file(s), 0 problem(s), 4 allowlisted
$ node scripts/check-tokens.mjs
                        → check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
                        → check-identity: 328 file(s), 0 problem(s)
$ node scripts/check-jsonld.mjs tests/fixtures/jsonld/*.json
                        → check-jsonld: 11 file(s), 0 problem(s)
```

(The brief's own verification chain writes `node scripts/check-jsonld.mjs`
with no arguments; run bare, it prints `no files matched` and exits 1,
because the script always needs a file glob, `package.json`'s own
`check:jsonld` script supplies one, and that is the form run above. Not a
finding in this batch's own work; noted so the bare form is not mistaken for
a regression.)

```
$ node scripts/i18n-merge.mjs --check
i18n-merge: locales\ar.json: 1399 partial key(s), 0 added, 0 updated
i18n-merge: locales\en.json: 1399 partial key(s), 0 added, 0 updated
```

```
$ node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css
compiles clean (only the pre-existing @import deprecation warnings)
```

`scripts/posters-import.mjs` on an empty `public/assets/posters/`: prints
`no posters yet` plus the owner instructions, exits 0, §4 has the full
transcript and the three live import passes that followed and were cleaned
up afterward. Final state re-confirmed: `grep -c "available: false"
app/content/posters.ts` → 6, `grep -c "available: true"` → 0,
`public/assets/posters/` absent from disk.

**Live, `http://localhost:3210`:**

```
/ar         → HTTP 200
/ar/offers  → HTTP 200
```

- `/ar/offers`: exactly one `<h1>`; `<title>` = "عروض المكملات الغذائية
  والباقات | اوبتيمال اكس"; the meta description = the `ox.seo.offers.description`
  value verbatim; the h2 `.ox-offers-posters__title` = "العروض والباقات
  والاشتراكات"; six `data-poster` values in the SSR HTML, in the exact order
  `inbody-consult, weekly-picks, bundle-her, bundle-him,
  weight-subscription, bigramy-creatine`; six `.ox-pcard__placeholder`
  elements, zero `.ox-pcard__photo`, all six cards render in the
  unavailable state with the alt text as a caption, live, on the real page,
  not only in a unit test.
- `/ar`: `.s-block--ox-posters` reserves `min-height:clamp(456px, calc(448.2px
  + 2vw), 477px)`, the exact re-measured value from §3, confirmed on the
  running page. The carousel's own cards do not appear in this route's SSR
  HTML (`useTaxonomyLinks`/the category query mount client-side for this
  block), the same pre-existing condition `docs/build/progress/S4a.md`/`S5a.md`
  already documented for this exact block on the live fixture store (zero
  categories today); the client-rendered behavior is covered by the 11 unit
  tests in §11 instead, which is the correct verification surface for a
  client-only mount, per that same precedent.

---

## 13. Owner instructions (also printed by the script itself)

1. Take six portrait photographs or exports, about 1125×1400 (4:5), each
   with its own headline, offer and call to action already drawn into the
   image (nothing else on the page adds text on top of them).
2. Drop them into `public/assets/posters/`, named exactly one of:
   `inbody-consult`, `weekly-picks`, `bundle-her`, `bundle-him`,
   `weight-subscription`, `bigramy-creatine`, any of `.png`/`.jpg`/`.jpeg`/
   `.webp`. (Keeping your own export filenames is fine too: add
   `public/assets/posters/map.json` mapping each filename to its slug,
   `{"my-export-01.png": "inbody-consult", ...}`.)
3. Run `node scripts/posters-import.mjs`. It resizes each to three widths,
   prints a table, and turns that poster on everywhere it appears (the home
   carousel and the `/offers` grid), no other step, no deploy, no code
   change.
4. Run it again any time you replace a file; it always re-derives from
   whichever original it finds that run, never from its own previous output.
5. To change a poster's picture, link or alt text without touching the file
   on disk at all, use the dashboard fields instead (Theme settings → the
   poster carousel block → Poster 1-6 image/link/alt, and the section title
   override), those always win over the file this script writes.

---

## 14. Deviations, consolidated

1. **The diagonal corner cuts are dropped, not reduced** (§6), the safer of
   the two options the brief offered, given files that do not exist yet.
2. **The angled strap is a residual, honest risk** (§6): it sits in the same
   physical corner the brief names as holding a vertical tagline. Flagged in
   the SCSS and here for a visual QA pass once real files land.
3. **`SectionHeader.tsx`'s `subline` prop is declared but never rendered**
   (§8), a cross-batch bug found, not fixed (out of this batch's files, a
   concurrent batch is mid-edit on the exact feature).
4. **`tests/content/imagePaths.test.ts` cannot see this batch's own asset
   references when run inside the full suite** (§9), due to a pre-existing
   shared-global-regex bug in that file, found, not fixed (out of this
   batch's files); confirmed the underlying rule (never fire a request for a
   file that cannot arrive) is actually upheld by the `available` gate, by
   running the test in isolation.
5. **`locales/partials/s7a.*`, not `s7.*`**, the brief's own text names
   `locales/partials/s7.ar.json`/`s7.en.json`; every sibling batch in this
   session (`s7b`, `s7c`, `s7d`) names its partial after its own batch
   letter, and this batch is S7a, so `s7a.*` was used for consistency with
   that established, already-shipped convention rather than the brief's
   literal (and likely shorthand) spelling.
6. **Two bugs were found and fixed inside this batch's own new code before
   they shipped** (§4.2, §5, §7.1), recorded in full above per the "if the
   plan turns out wrong, report it" rule, not silently absorbed into a clean
   diff.
