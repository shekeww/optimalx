# S8a: seven owner items, 2026-09-24

Batch: owner items 2026-09-24 (goal strap, arrow size, carousel copy, the
mixed-content carousel, the product type on the card, scrollbars, preview
verification). Base HEAD a5049de, tree clean at start. Written item by item,
appended after each one.

---

## 1. Goal cards: the orange strap removed

**What changed.** `.ox-goal__slash` is gone from the markup
(`GoalCard.tsx`, the one `<span className="ox-goal__slash">`) and from the
stylesheet (`_b2-home.scss`: the base rule, its `[dir='ltr']` twin, and the
two per-tier overrides at 640 and 1280 with their own `[dir='ltr']` twins,
six rule blocks in all). The diagonal cuts (the three `clip-path` tiers,
lean 40/56/64) and `border-radius: 0` are untouched. `ox-strap-inset()`/
`ox-strap-width()` and the strap-geometry comment above them stay, re-scoped
by a four-line note: `.ox-pcard__slash` (the poster carousel's own strap) is
still built from them.

**Files.** `app/components/home/GoalCard.tsx`, `app/styles/06-ox/_b2-home.scss`,
`tests/home/OxGoals.test.tsx`.

**Tests.** Red first: the old "one accent slash" test now asserts zero
`.ox-goal__slash` elements; a new test reads `_b2-home.scss` and asserts no
`.ox-goal__slash` selector remains while the base `.ox-goal` rule still
carries `border-radius: 0` and its lean-40 diagonal `clip-path`. Failed
(2 of 11) before the edit, 11/11 after:

```
$ pnpm vitest run tests/home/OxGoals.test.tsx
 Test Files  1 passed (1)
      Tests  11 passed (11)
```

`grep -rn goal__slash app scripts` → no hits.

**Deviations.** None.

---

## 2. The angled arrow back to 24 (box 24, glyph 16, lean 8)

**What the enlargement actually was.** The shared rule never grew: git
history shows `.ox-iconbtn--angled` at `inline-size`/`block-size: 24px`
with the lean-8 corner cut since it was created (578d36a). What grew was
the GLYPH. The S6b sprite swap (7753223) replaced a `sicon-*` font glyph
(`font-size: 18px`, a small chevron inside the 24 box) with
`<Icon name="chevron-end" size={24} className="ox-iconbtn--angled" />` at
four sites, so the svg IS the box and its 24-unit chevron (path spans y 3
to 21 of the 24 viewBox) was drawn edge to edge: an 18px-tall chevron where
the five span-wrapped faces (`<span class="... ox-iconbtn--angled"><Icon
size={16} /></span>`) draw a 12px one. S6b's own note (§1) records why it
chose 24 there: a smaller `size` prop is overridden by the class's 24px box.

**The consumer audit (every `ox-iconbtn--angled` in `app/components`):**

| consumer | construction | before | after |
|---|---|---|---|
| `GoalCard.tsx` (goal cards) | class on a 24px `Icon` | glyph 24 | glyph 16 |
| `CategoryTile.tsx` (home type tiles) | class on a 24px `Icon` | glyph 24 | glyph 16 |
| `CategoriesIndex.tsx` (`/categories` type cards) | class on a 24px `Icon` | glyph 24 | glyph 16 |
| `FeaturedRail.tsx` cover CTA (rail cards) | class on a 24px `Icon` | glyph 24 | glyph 16 |
| `FeaturedRail.tsx`, `OxBrands.tsx`, `OxCategoryRail.tsx`, `OxPosters.tsx`, `RelatedRail.tsx` nav faces | span + 16px `Icon` | glyph 16 | unchanged |
| `PlanCard.tsx` (plan cards) | none since S7c (the card's action is now a button) | n/a | n/a |

No compiled rule other than the primitive itself sets a size on any
selector containing `.ox-iconbtn--angled` (checked on the compiled CSS, not
the source). Two per-site `font-size: 18px` leftovers from the font-glyph
era, on `.ox-tile__arrow` (`_b2-home.scss`) and `.ox-cat-card__arrow`
(`_b4-listing.scss`), were dead for an svg but still read as an enlargement
override; removed, with a one-line note each.

**The fix, one rule in `_primitives.scss`** (no consumer markup touched, so
none of the three unnamed files, `CategoryTile.tsx`, `CategoriesIndex.tsx`,
`FeaturedRail.tsx`, had to be edited):

```scss
.ox-icon.ox-iconbtn--angled {
  box-sizing: border-box;
  padding: 3px;
  --ox-icon-stroke: 2.25px;
}
```

The outer svg's viewport is its content box, so 24 - 2 x 1px border -
2 x 3px padding = a 16px glyph, and the 16 step's heavier stroke (2.25 units,
the sprite's own `.ox-icon--16` value, S6a deviation 6) comes with it: the
direct construction now paints the same arrow as the span-wrapped one. The
box stays 24 and the corner cut stays lean 8 (`clip-path: polygon(0 8px,
5.39px 0, ...)`). `chevron-end`/`chevron-start` ship no `-s` twin
(`OX_SIMPLIFIED_ICON_NAMES`), so "glyph 16" is the standard drawing at 16,
exactly what `<Icon size={16}>` draws on the wrapped faces.

**Files.** `app/styles/06-ox/_primitives.scss`, `app/styles/06-ox/_b2-home.scss`,
`app/styles/06-ox/_b4-listing.scss`, `tests/helpers/compiledCss.ts` (new: the
theme stylesheet compiled once with the build's own `sass`, split into flat
rules, every nesting level resolved; shared with item 6),
`tests/common/iconbtnAngled.test.ts` (new).

**Tests** (`tests/common/iconbtnAngled.test.ts`, node environment, 5 tests):
the primitive's compiled box (24/24) and lean-8 clip; the direct-Icon rule
(border-box, padding 3px, stroke 2.25px): red before the rule existed,
green after; no other compiled rule sizing the class; every span face
wraps a 16px `Icon`; the consumer inventory pinned (4 direct, 5 wrapped;
6 wrapped once item 4 adds the content card's arrow), so a new consumer is
a visible test change.

```
$ pnpm vitest run tests/common/iconbtnAngled.test.ts tests/home/OxGoals.test.tsx
 Test Files  2 passed (2)
      Tests  16 passed (16)
```

**Deviations.** Fixed in the primitive rather than by rewrapping the four
direct sites in a span: same rendered result, one rule instead of four
markup edits, three of which sit in files outside this batch's list. The
dead `font-size: 18px` removals are the only consumer-side edits.

---

## 3. Home carousel copy

| key | ar | en |
|---|---|---|
| `ox.home.posters_title` | اكتشف أكثر (was ابدأ من هنا) | Discover more (was Start here) |
| `ox.home.posters_lead` | عروض ومنتجات وخدمات مختارة تساعدك على الوصول إلى هدفك. (was أبواب مختصرة إلى الأهداف والأنواع والخدمات.) | Selected offers, products and services that help you reach your goal. (was Short doors into goals, types and services.) |

The owner's "تساعدك توصل لهدفك" ships as the MSA form the brief gives
(voice-ksa §3.3 and §6.2: no dialect on any surface): same meaning, the
allowed "يساعد" family, no outcome promised (FINAL-claims-source §3, voice
§6: nothing quantified, no timeframe, no guarantee). No combining marks, no
em-dash; "اكتشف أكثر" is not the banned "اكتشف قوة" construction (§3.5).

**Where.** The owning partial is `locales/partials/s7d.{ar,en}.json` (S7d
introduced both keys); edited there, then `pnpm i18n:merge` →
`0 added, 2 updated` per locale. `git diff` on `locales/ar.json`/`en.json`
shows exactly those four lines and nothing else. The subline renders now
(`SectionHeader.tsx` destructures and prints `subline` since S7d; S7a §8's
finding is closed upstream).

```
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 40 file(s), 0 problem(s), 4 allowlisted
```

**Files.** `locales/partials/s7d.ar.json`, `locales/partials/s7d.en.json`,
`locales/ar.json`, `locales/en.json`.

**Deviations.** None.

---

## 4. The mixed-content carousel: five content cards back, alternating with the six offers

**Order** (`HOME_CAROUSEL` in `app/content/posters.ts`, built by
`interleave(POSTER_CARDS, CONTENT_CARDS)`): offer, content, offer, content,
starting with the InBody offer, offers at both ends, eleven slides:

| # | slug | kind | destination |
|---|---|---|---|
| 1 | `inbody-consult` | offer | `/p1051830221` (S7a) |
| 2 | `snacks` | content | `snacks-bars` taxonomy link (live category, else menu, else search) |
| 3 | `weekly-picks` | offer | `/offers` |
| 4 | `strength` | content | `goal-performance` taxonomy link |
| 5 | `bundle-her` | offer | `/p1141798217` |
| 6 | `cardio` | content | `goal-energy` taxonomy link |
| 7 | `bundle-him` | offer | `/p1141798217` |
| 8 | `advisory` | content | `/services` (its line names the branch visit: "استشارة مكتوبة أو مرئية أو زيارة للفرع.") |
| 9 | `weight-subscription` | offer | `/services#plans` |
| 10 | `branch` | content | `/about` |
| 11 | `bigramy-creatine` | offer | live `creatine` category, else `/offers` |

**Content cards** (restored from 4657b89: same five ids, same photographs,
same order, same copy): photograph + scrim + title + line + the angled
arrow, as the brief names the composition. New `ContentPosterCard` export in
`PosterCard.tsx` (`.ox-pcard ox-pcard--content`, `data-kind="content"`); the
arrow is the shared span face (`<span class="ox-pcard__arrow
ox-iconbtn--angled"><Icon size={16}></span>`, box 24, glyph 16, the item 2
size). The old eyebrow + icon row and the "عرض الكل" text CTA are not
restored: the brief's composition list is photo, title, line, arrow, and
the angled arrow replaces the text CTA. The photograph renders through
`BandPhoto` as `.ox-pcard__frame` (a new class, so S7a's
`.ox-pcard__photo`/placeholder assertions for the offers stay exact); a
failed load leaves the finished dark card. Intrinsic sizes re-measured with
Pillow, not copied: `services-band.jpg` is 1580x600 on disk today (4657b89
recorded 1440x560); the other four match.

**Offer cards**: S7a's `PosterCard` unchanged except `data-kind="offer"` on
the link (poster when `available`, else the placeholder with the alt
caption). The merchant fields keep their meaning: `image_N`/`link_N`/`alt_N`
address the Nth OFFER (`offerNumber`, 1-6), not the Nth slide, which is
what `twilight.json`'s own labels already say ("صورة الملصق 1: استشارة
وقياس InBody"). The `/offers` poster grid (`ListingPage.tsx`) still shows
the six offers only, untouched.

**Shape.** Both kinds share `.ox-pcard`'s 4:5 box, sharp corners and the
S7a strap (`.ox-pcard__slash`, 90px, lean-40 geometry), so the alternating
row reads as one set. The content card gets the diagonal cuts back (lean 40,
`ox-run(40px)` = 27px, the tier the strap is built from): S7a dropped them
only for artwork nobody has inspected, and these photographs are the
theme's own. 27 / 309.2 = 8.7% of the narrowest card, inside the 24%
budget. The offer poster stays uncut.

**Reserved height, re-measured for the mixed row.** The row is as tall as
its tallest card. Offer: the 4:5 box, 309.2 x 1.25 = 386.5px at the 390
probe, 312.0 x 1.25 = 390.0px at 1440 (S7a §3). Content: the same 4:5 box
by construction (no rule on `.ox-pcard--content` sets any height or ratio,
tested on the compiled CSS); its own content needs at most 24 padding +
50 title (2 x 25) + 8 gap + 65 line (3 x 21.7, the longest, the English
snacks line) + 8 gap + 8 margin + 24 arrow + 24 padding = 211px at the
narrowest 309.2px card, well under 386.5. So the offer box sets the row and
`HOME_BLOCK_HEIGHTS['ox-posters']` stays `{ mobile: 456, desktop: 477 }`
(no edit to `defaults.ts`); `HomeSkeleton`'s four placeholder blocks still
match the widest tier.

**Locale keys.** The ten restored keys (`ox.home.poster.{snacks,strength,
cardio,advisory,branch}_{title,line}`) had no partial at 4657b89 (they
lived only in the base locales, and S7a deleted them there); they now live
in a new `locales/partials/s8a.{ar,en}.json`, values copied verbatim from
`git show 4657b89:locales/{ar,en}.json`, merged (`pnpm i18n:merge` → 10
added per locale). The five eyebrow keys are not restored (not rendered).

**Files.** `app/content/posters.ts` (`ContentCardContent`, `CONTENT_CARDS`,
`contentHref()`, `CarouselEntry`, `interleave()`, `HOME_CAROUSEL`),
`app/components/home/PosterCard.tsx` (`ContentPosterCard`, `data-kind`),
`app/components/home/OxPosters.tsx` (renders `HOME_CAROUSEL`; the card
resolution moved into a local `useCarouselCards()` hook so the component
did not grow), `app/styles/06-ox/_b2-home.scss` (`.ox-pcard--content` and its
`__frame`/`__scrim`/`__body`/`__title`/`__line`/`__arrow`),
`locales/partials/s8a.{ar,en}.json` (new), `locales/{ar,en}.json`,
`tests/home/OxPosters.test.tsx`, `tests/home/posterRow.test.ts` (new),
`tests/common/iconbtnAngled.test.ts` (the inventory gains `PosterCard.tsx`).

**Tests.** `tests/home/OxPosters.test.tsx`, 17 tests: the exact
eleven-slug order and the alternating `kind` in the content map; the same
order and `data-kind` on the rendered rail; every content card's frame src,
scrim, title and line text from the Arabic dictionary, and its 16px-glyph
angled arrow face; no placeholder on a content card; the advisory card's
branch-visit copy and `/services`, the branch card's `/about`; the
snacks/strength/cardio search fallback, then the snacks card on a live
category; the reserved height; the six offers still the placeholder with
their alt captions; eleven straps, all `aria-hidden`, no nested control;
eleven slides labelled "البطاقة 1 من 11"; eager loading on slides 1-2 only
(so `image_2`, the second OFFER, sits on slide 3 and is lazy now).
`tests/home/posterRow.test.ts` (node env, compiled CSS, 4 tests): `.ox-pcard`
4:5 with `border-radius: 0`; no height/ratio on any `.ox-pcard--content`
rule; the content clip-path at lean 40 (27px run) and no clip on the offer;
the reserved height.

```
$ pnpm vitest run tests/home/OxPosters.test.tsx tests/listing/ListingPage.test.tsx
 Test Files  2 passed (2)
      Tests  50 passed (50)
$ pnpm vitest run tests/home/posterRow.test.ts
 Test Files  1 passed (1)
      Tests  4 passed (4)
$ pnpm typecheck
$ tsc --noEmit
(clean)
```

**Deviations.**
1. The strap stays on both kinds, content cards included. The brief lists
   the content composition as photo, title, line, arrow; the strap was part
   of those cards at 4657b89 and is on every offer beside them, so dropping
   it on alternate slides would make one row read as two sets. If the
   goal-card strap removal (item 1) was meant for these too, it is one
   `<span className="ox-pcard__slash">` in each of the two card functions.
2. Tests were written before the implementation but the rail tests were
   not run red in between (the new imports would only have failed on
   `undefined`); the item 1 and item 2 tests were run red first.

---

## 5. The product type on the card's facts line

**What changed.** The card's line 1 is now "<type> | <servings or size>":
the product's root TYPE, then ONE fact (the servings, else the pack size,
else the dosage form), joined by the theme's existing hair-space divider.
The type is one of the ten taxonomy roots, printed as a short card label
`ox.card.type.<key>` (new, `locales/partials/s8a.*`), the brief's own list
corrected in three places:

| key | ar | en | vs the brief's list |
|---|---|---|---|
| protein | بروتين | Protein | brief "بروتين واي": whey is wrong for the casein, plant and mass-gainer products the root also holds |
| creatine | كرياتين | Creatine | same |
| pre_workout | ما قبل التمرين | Pre-workout | same |
| amino_acids | أحماض أمينية | Amino acids | same |
| omega_3 | أوميغا 3 | Omega-3 | same |
| vitamins_minerals | فيتامينات ومعادن | Vitamins & minerals | same |
| collagen_beauty | كولاجين وجمال | Collagen & beauty | brief "كولاجين": wrong for the biotin capsules the root also holds |
| daily_health | الصحة اليومية | Daily health | same |
| snacks_bars | سناكات وبارات | Snacks & bars | brief "سناكس": the store's own plural is "سناكات" (`ox.tax.snacks_bars.name`) |
| accessories | إكسسوارات | Accessories | same |

Why a card label and not `ox.tax.<key>.name` verbatim (the first pass
shipped that): measured on the running preview at 390 (headless Chromium
screenshot, two-up grid), the taxonomy names "الفيتامينات والمعادن"، "أوميغا
3 والزيوت"، "الكولاجين والجمال"، "سناكات وبروتين بار" pushed the servings
behind the row's `nowrap` ellipsis ("الفيتامينات والمعادن|0..."). With the
card labels every one of those lines reads whole at 390 ("فيتامينات
ومعادن | 60 حصة", "أوميغا 3 | 90 حصة", "كولاجين وجمال | 90 حصة", "سناكات
وبارات | 33 حصة"); a test caps every Arabic label at 16 characters.

**`productTypeOf(product, context)`** (new,
`app/components/product/lib/productType.ts`) returns a root type key or
null; the first source that answers wins:

1. `typeFromCategory(product.category)`: each path segment of the API
   category's URL through `nodeBySlug`, a protein child mapped to its root,
   a goal or utility node to nothing; else the category's name through the
   keyword table (4).
2. `typeFromListing(context.categorySlug)`: the category listing the card
   renders in. `ListingPage` wraps its grid in
   `<ListingCategoryContext.Provider value={node?.slug ?? null}>` (the
   taxonomy node it already resolves); the card reads it with `useContext`.
   The engine renders the card through its own `product:card` registry, so
   a React context is the one way to "pass it down" without a prop the
   engine does not forward. Null on every other surface.
3. `typeFromMembership(product)`: the product's SKU, else the SKU its id
   maps to in `salla-ids.ts`, in a root type's `skus` list
   (`taxonomy.json`; the ten roots share no SKU, tested). This is the
   theme's own copy of the owner's taxonomy, so it works on the live store
   and in the preview alike; `fixtures/store/overlay/membership.json` (the
   preview's category-to-product map) holds the same assignment and is not
   imported into app code, since fixtures never ship.
4. `typeFromName(product.name)`: the keyword table below, answering only
   when exactly one type matches.

**The keyword table** (written naturally, normalised once: lower case, no
marks or tatweel, أ/إ/آ to ا, ة to ه, ى to ي; a keyword matches whole words
only, with an attached ال/و/وال/بال/لل allowed in front of its first word):

| type | Arabic | English |
|---|---|---|
| protein | واي، بروتين، كازين، ايزوليت، ماس جينر، جينر | whey, protein, casein, isolate, mass gainer, gainer |
| creatine | كرياتين | creatine |
| pre_workout | ما قبل التمرين، بري ورك، بري وورك، بري وركاوت، بري ووركاوت | pre workout (matches "pre-workout"), preworkout |
| amino_acids | امينو، أحماض أمينية، أرجينين، جلوتامين | amino, bcaa, eaa, arginine, glutamine |
| omega_3 | أوميغا، أوميجا، زيت السمك | omega, fish oil |
| vitamins_minerals | فيتامين، فيتامينات، معادن، زنك، مغنيسيوم، ماغنيسيوم | zma, multivitamin, vitamin(s), mineral(s), zinc, magnesium |
| collagen_beauty | كولاجين، بيوتين | collagen, biotin |
| daily_health | بروبيوتيك، إلكتروليت، كلوروفيل | probiotic(s), electrolyte(s), chlorophyll |
| snacks_bars | سناك، سناكس، سناكات، بار، بروتين بار، تشيبس، بروتين تشيبس، زبدة، شوفان | snack(s), bar(s), protein bar(s), chips, protein chips, butter, peanut butter, oats |
| accessories | شيكر، إكسسوار، إكسسوارات | shaker, accessory, accessories |
| (veto: no answer) | حزمة، باقة، انرجي | bundle, energy |

Four rules keep it from ever printing a wrong type:
- **The brand is not the name.** Everything after the last " - " is cut
  first (the catalogue's "product - brand" convention): "نيتشرز واي"
  (Nature's Way) would otherwise vote "whey", and "ماي بروتين" (Myprotein)
  would vote protein on an oats pack.
- **An add-in is not the type.** Everything after "مع"/"with" is cut:
  "كولاجين ببتيدات مع فيتامين ج وبيوتين" is collagen, not vitamins.
- **A phrase swallows the words inside it.** A match strictly inside a
  longer match is dropped: "بروتين بار"/"بروتين تشيبس" are snacks and the
  "بروتين" inside them does not vote.
- **Two types, a veto word, or none: nothing.** "بروتين + كرياتين" prints
  no type; a bundle ("حزمة البداية") prints none; "امينو انرجي" (an
  amino-acid energy drink the owner files under pre-workout) prints none
  rather than "amino acids".

Run over the whole fixture catalogue, the name table answers for 39 of the
40 physical products and agrees with the membership on every one of them;
the 40th ("امينو انرجي") and all seven bundle/service/digital/gift entries
stay silent (tested).

**Files.** `app/components/product/lib/productType.ts` (new),
`app/components/product/lib/cardSpec.ts` (`cardSpecLine(product, spec, t,
typeName)`: the type replaces `product.category.name`, one fact instead of
two), `app/components/product/OxProductCard.tsx` (reads the context,
resolves the type, passes `t('ox.card.type.<key>')`),
`locales/partials/s8a.{ar,en}.json` (the ten labels; `pnpm i18n:merge` →
10 added per locale), `locales/{ar,en}.json`,
`app/components/listing/ListingPage.tsx` (the provider around the grid; not
in the brief's file list, named by the brief's own "pass it down from
ListingPage"), `tests/product/productType.test.ts` (new, 23 tests),
`tests/product/OxProductCard.test.tsx`, `tests/listing/ListingPage.test.tsx`
(the engine-card stand-in reports the context it receives).

**Tests.**
- `tests/product/productType.test.ts` (23): the ten roots equal the
  taxonomy's type roots; every root has an `ox.card.type.<key>` label in
  both locales, the Arabic one at most 16 characters; no SKU in two roots;
  TEN real catalogue names from
  `fixtures/store/products.json`, one per type (whey, creatine, pre-workout,
  BCAA, fish oil, magnesium, the collagen-with-vitamin-C name, the Nature's
  Way chlorophyll, the protein chips, the shaker); five that must stay
  silent (bundle, branch visit, gift card, PDF guide, Amino Energy) and
  "بروتين + كرياتين"; five English names; the whole-catalogue "never wrong"
  sweep; membership by SKU and by id; listing and category mapping (a
  protein child to its root, a goal and a utility to nothing, a URL slug
  before a name); the four-source order.
- `tests/product/OxProductCard.test.tsx`: the line is exactly
  "بروتين | 30 حصة" for the OX-001 fixture; the API category outranks the
  membership ("كرياتين | 30 حصة"); the listing context types an otherwise
  untyped product ("أوميغا 3 | 30 حصة"); a name types one, an
  ambiguous one prints the fact alone; servings win over the pack size, the
  pack size alone, the form alone; an untyped product with no spec keeps
  the row reserved and empty.
- `tests/listing/ListingPage.test.tsx`: every card on `whey-protein`
  receives `whey-protein`; a search listing passes nothing.

```
$ pnpm vitest run tests/product
 Test Files  21 passed (21)
      Tests  312 passed (312)
$ pnpm vitest run tests/listing/ListingPage.test.tsx
 Test Files  1 passed (1)
      Tests  35 passed (35)
$ pnpm typecheck
$ tsc --noEmit
(clean)
```

**Live, `/ar/protein/c9001`** (the running preview, curl): all 14 cards'
facts lines now carry the type: "بروتين | 16 حصة", "بروتين | 20 حصة", ...
"بروتين | 81 حصة" (14 distinct lines; before this batch they read "28 حصة",
"16 حصة" and so on with no type, per S5b §4.1).

**Deviations.**
1. **The labels are new short card keys, not `ox.tax.<key>.name`.** The
   brief names both a list and the taxonomy key as the source; they
   disagree, and the taxonomy names truncate the fact on a phone (measured
   above). Shipped: the brief's list, corrected where it would print a wrong
   type ("بروتين واي", "كولاجين") or a non-MSA plural ("سناكس"). New copy,
   MSA, no marks, no em-dash, `check-copy` and `check-claims` clean.
2. **One fact, not two.** "<servings or size>" read literally: servings,
   else the pack size. Before, the line printed both; with the type in
   front, "بروتين | 28 حصة | 2.27 كجم" runs past a two-up phone card's
   `nowrap` line into the ellipsis. The test that pinned both facts was
   rewritten to pin the new rule.
3. **The divider stays the theme's own hair-space "|"** (`DIVIDER`), not
   the "·" the brief typed; the brief's character reads as notation for "a
   separator", and changing the divider is a visual call no item asks for.

---

## 6. Scrollbars: no horizontal scroller shows a native bar

**The sweep**, on the COMPILED stylesheet (every `@media`, every nested
block resolved), cross-checked against a source grep of `overflow-x` in
`app/styles/06-ox/*.scss` (14 source hits, 14 compiled rules, the same
set):

| scroller (compiled selector) | what it is | before | after |
|---|---|---|---|
| `.ox-rail__track` | every carousel on the rail primitive (posters, brands, category rail, featured rail, related) | hidden | unchanged |
| `.ox-tabs .s-tabs-header`, `.ox-tabs__list` | the tabs | hidden | unchanged |
| `.ox-util__trust--scroller` | the trust row under the header (`UtilityTrust`, scroller variant) | hidden | unchanged |
| `.ox-trust__row` | a trust row (no current consumer in `app/components`) | hidden | unchanged |
| `.ox-thumbs__list` | the PDP thumb rail | hidden | unchanged |
| `.ox-bband__badges` | the band badge rows (`Band`, the PDP `BrandBand`) | hidden | unchanged |
| `.ox-strip__list` | the PDP and pages anchor strip | hidden | unchanged |
| `.ox-add-also__items` | the add-also row | hidden | unchanged |
| `.ox-crumbs .s-breadcrumb-wrapper`, `nav.breadcrumbs ...` | breadcrumbs | hidden | unchanged |
| `.ox-listing__chips-row` | the listing chip row | hidden | unchanged |
| `.ox-explore__list` | the explore links | hidden | unchanged |
| `.ox-acct-nav` (below 1024) | the account tabs | hidden | unchanged |
| `.ox-table-wrap` | every `Table` (hours, nutrition, totals) | **visible** | hidden |
| `.ox-compare__scroller` | the services comparison table | **visible, `thin`** | hidden |

Plus two scrollers the compiled Sass cannot see: the base theme's engine
blocks "tabs products" and "special products" scroll their `.tabs` row
through Tailwind's `@apply ... overflow-x-auto`
(`04-components/home-blocks.scss`, the engine's file, resolved after Sass).
Hidden from `_b2-home.scss` (new §20) rather than by editing the engine's
file; a merchant can still add either block.

Plus three more found only in the stylesheet the preview SERVES (Salla's
own web-component CSS loads beside ours, so neither the Sass nor a source
grep can see it; found by scanning the served CSS, item 7): the header row
of every `salla-tabs` (`.s-tabs-header`, which also covers the loyalty
drawer's copy of it), the offer modal's product row
(`.s-offer-modal-body`, a flex row of product cards), and Tailwind's
`.overflow-x-auto` utility. Hidden from `_primitives.scss`, next to
`.ox-table-wrap`. Four `overflow: auto` (both axes) rules in that CSS stay
as they are: `.overflow-auto` and three vertical panes (the size guide's
`max-height: 60vh` tab content, the offer drawer's accordion body, the
option content), none of them a sideways row.

Three surfaces the brief named are not horizontal scrollers at all, checked
rather than assumed: the brands letter rail (`.ox-brandhub__letters-list`
is `flex-wrap: wrap`), the mega panel (no `overflow-x` anywhere under
`.ox-mega`), and the category tiles on mobile (a grid, or
`.ox-rail__track` on `OxCategoryRail`). Vertical scrollers (drawers,
sheets, `overflow-y: auto`) keep their bars; the item is about carousels
and horizontal scrollers only.

**The compare table: hidden, not allowlisted.** The brief allowed a visible
bar there only if argued. The argument does not hold: the table scrolls
only below the width its 640px minimum fits (a phone; from 768 the 720px
container holds it), where the platform's overlay bar is hidden at rest
anyway, and the pinned 132px question column beside a cut-off second
service column already shows there is more that way, the same peek the
rails use. `VISIBLE_BAR_ALLOWED` in the test is therefore empty, and it is
where any future exception has to be argued.

Construction everywhere: `scrollbar-width: none` (Firefox; Chromium 121+)
plus `&::-webkit-scrollbar { display: none; }` (Safari, older Chromium),
the `_rail.scss` pattern. Scrolling itself is untouched (touch, trackpad,
wheel, the rails' own arrows).

**Files.** `app/styles/06-ox/_primitives.scss` (`.ox-table-wrap`),
`app/styles/06-ox/_b5-pages.scss` (`.ox-compare__scroller`: `thin` to
`none`, plus the WebKit rule), `app/styles/06-ox/_b2-home.scss` (§20, the
engine tab rows), `app/styles/06-ox/_primitives.scss` again (Salla's
`.s-tabs-header`, `.s-offer-modal-body`, `.overflow-x-auto`),
`tests/common/scrollers.test.ts` (extended; now `@vitest-environment node`
for the compiler).

**Tests** (`tests/common/scrollers.test.ts`, 5 new next to the 3 existing
containing-block tests): every compiled rule whose `overflow-x` (or
`overflow`'s x value) is `auto`/`scroll` declares `scrollbar-width: none`
unless every selector in it is in `VISIBLE_BAR_ALLOWED` (empty, argued in
the file); every one of those selectors has a `::-webkit-scrollbar` rule
with `display: none`; the count of Tailwind `@apply ... overflow(-x)-auto`
sites in the source equals the two known engine rows, each with both hide
rules in the compiled CSS; the three Salla component scrollers covered the
same way; a floor of 14 gated scrollers so a broken parse cannot pass
vacuously. Red before the fix (`.ox-table-wrap (scrollbar-width:
unset)`, `.ox-compare__scroller (scrollbar-width: thin)`, both missing the
WebKit rule, the engine rows unhidden), green after:

```
$ pnpm vitest run tests/common/scrollers.test.ts
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

**Deviations.** None beyond the argued compare-table call above.

---

## 7. Verified on the preview (http://localhost:3210)

No server started or stopped; the running preview served every request
first time (no 20-second retry was needed). curl for the server-rendered
HTML and the served stylesheet; the one block the engine mounts only on the
client (the home carousel renders a skeleton in SSR, the same condition
S7a §12 recorded) was read from a headless Chromium DOM dump
(`chrome-headless-shell --dump-dom`, Playwright's installed binary, a
client only), plus screenshots at 1440 and 390 for the visual checks.

```
/ar                  -> HTTP 200
/ar/protein/c9001    -> HTTP 200
/ar/x/p1673105563    -> HTTP 200 (title: شيكر اوبتيمال اكس V2 سعة 820 مل - بلندر بوتل)
```

**The carousel, eleven cards alternating** (`/ar`, rendered DOM, in order):

```
inbody-consult offer -> /ar/p1051830221
snacks         content -> /ar/snacks-bars/c9009
weekly-picks   offer -> /ar/offers
strength       content -> /ar/goal-performance/c9022
bundle-her     offer -> /ar/p1141798217
cardio         content -> /ar/goal-energy/c9020
bundle-him     offer -> /ar/p1141798217
advisory       content -> /ar/services
weight-subscription offer -> /ar/services#plans
branch         content -> /ar/about
bigramy-creatine offer -> /ar/creatine/c9002
```

Section title "اكتشف أكثر", subline "عروض ومنتجات وخدمات مختارة تساعدك على
الوصول إلى هدفك."; 11 slides labelled "البطاقة 1 من 11" onward; 6 offer
placeholders (no poster file yet, S7a's state); 5 content titles (سناكات
وبروتين بار، الأداء وبناء الجسم، الطاقة والتحمل، اسأل قبل أن تشتري، زرنا
في المدينة المنورة); 5 content arrows, every one a 16px glyph in the span
face; 11 straps. The three taxonomy-linked content cards resolve to the
preview's live categories (no search fallback on the preview). Reserved
block height in the SSR HTML: `min-height: clamp(456px, calc(448.2px +
2vw), 477px)`, unchanged. The 1440 screenshot shows both kinds at one
height: the offer plate with its caption and strap beside the content card
with its photograph, lean-40 cuts, strap, title, line and the small angled
arrow.

**The goal cards** (`/ar`, SSR and rendered DOM): 6 cards, 0
`ox-goal__slash`. Screenshot: diagonal cuts and sharp corners kept, no
strap, the arrow a 24 box with a 16 glyph.

**The card facts line on the protein listing** (`/ar/protein/c9001`, SSR):
14 cards, 14 typed: "بروتين | 28 حصة", "بروتين | 16 حصة", "بروتين | 24
حصة", "بروتين | 20 حصة", ... Home rails (rendered DOM): 41 cards, 40 typed;
the one untyped card is the starter bundle (`1141798217`, a utility, no
type by design). The shaker PDP's related rail (rendered DOM): 7 cards,
typed except the same bundle. At 390 (screenshot) every long label reads
whole: "فيتامينات ومعادن | 60 حصة", "أوميغا 3 | 90 حصة", "كولاجين وجمال |
90 حصة", "سناكات وبارات | 33 حصة".

**The served stylesheet** (`/@tanstack-start/styles.css?...`, 3.49 MB,
26,076 rules, the dev server concatenating our CSS with Salla's component
CSS and Swiper's): 22 distinct selectors scroll sideways
(`overflow-x: auto|scroll`); all 22 have both `scrollbar-width: none` and a
`::-webkit-scrollbar { display: none }` rule. The only `auto` overflow left
without them is 4 both-axes `overflow: auto` rules, none a sideways row
(item 6). The allowlist is empty.

---

## Files (all items)

| file | item |
|---|---|
| `app/components/home/GoalCard.tsx` | 1 |
| `app/styles/06-ox/_b2-home.scss` | 1, 2, 4, 6 |
| `app/styles/06-ox/_primitives.scss` | 2, 6 |
| `app/styles/06-ox/_b4-listing.scss` | 2 |
| `app/styles/06-ox/_b5-pages.scss` | 6 |
| `locales/partials/s7d.{ar,en}.json` | 3 |
| `locales/partials/s8a.{ar,en}.json` (new) | 4, 5 |
| `locales/{ar,en}.json` (merged) | 3, 4, 5 |
| `app/content/posters.ts` | 4 |
| `app/components/home/PosterCard.tsx` | 4 |
| `app/components/home/OxPosters.tsx` | 4 |
| `app/components/product/lib/productType.ts` (new) | 5 |
| `app/components/product/lib/cardSpec.ts` | 5 |
| `app/components/product/OxProductCard.tsx` | 5 |
| `app/components/listing/ListingPage.tsx` | 5 |
| `tests/helpers/compiledCss.ts` (new) | 2, 4, 6 |
| `tests/common/iconbtnAngled.test.ts` (new) | 2, 4 |
| `tests/common/scrollers.test.ts` | 6 |
| `tests/home/OxGoals.test.tsx` | 1 |
| `tests/home/OxPosters.test.tsx` | 4 |
| `tests/home/posterRow.test.ts` (new) | 4 |
| `tests/product/productType.test.ts` (new) | 5 |
| `tests/product/OxProductCard.test.tsx` | 5 |
| `tests/listing/ListingPage.test.tsx` | 5 |
| `docs/build/progress/S8a.md` | this file |

Not touched: the sprite, `Icon.tsx`, the header, `OxServices.tsx`/
`PlanCard.tsx`, `tokens.css`, `defaults.ts`, `twilight.json`. No git
stash/checkout/reset/clean/add/commit/push.

## Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean)

$ pnpm vitest run
 Test Files  108 passed (108)
      Tests  1386 passed (1386)
   Duration  70.06s

$ pnpm check:all
check-copy: 44 file(s), 0 problem(s)
check-jsonld: 11 file(s), 0 problem(s)
check-rtl: 331 file(s), 0 problem(s)
check-motion: 331 file(s), 0 problem(s)
check-strings: 335 file(s), 0 problem(s)
check-claims: 44 file(s), 0 problem(s), 4 allowlisted
check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
check-identity: 331 file(s), 0 problem(s)

$ node scripts/i18n-merge.mjs --check
i18n-merge: locales\ar.json: 1425 partial key(s), 0 added, 0 updated
i18n-merge: locales\en.json: 1425 partial key(s), 0 added, 0 updated
```

## Cross-batch notes (flagged, not acted on)

1. Concurrent batches were writing the tree during this one (the sprite,
   `Icon.tsx`, `ProductPage.tsx`, `_index.scss`, a new `_b7-advisory.scss`,
   `locales/partials/s8c.*`). Midway, `tests/common/sprite.test.ts` failed
   7 tests on the sprite's in-progress state (94 symbols against 92
   expected); the final whole-suite run above is green, so that batch
   landed. None of those files was edited here.
2. The base locales are shared, and the conductor's S8c commit (17560da)
   swept in this batch's item 3 and item 4 base-locale lines (the two
   `ox.home.posters_*` updates and the ten restored `ox.home.poster.*`
   keys) while their owning partials (`s7d.*` edits, `s8a.*`) were still
   uncommitted here. The tree is consistent (`i18n-merge --check`: 0 added,
   0 updated); committing this batch's partials closes the gap. Still
   uncommitted in `locales/{ar,en}.json` from this batch: the ten
   `ox.card.type.*` labels (item 5).
3. On the card, the theme's hair-space divider sits tight against a digit:
   "أوميغا 3|90 حصة" can read as "3|90" at 13px. Pre-existing divider, not
   changed (item 5 deviation 3); a spaced divider is a one-constant change
   in `cardSpec.ts` if the owner wants it.

## Deviations, consolidated

1. Item 2: fixed in the primitive (`.ox-icon.ox-iconbtn--angled`, padding
   3px) rather than rewrapping four direct sites in spans; same result, no
   edit to three files outside the list.
2. Item 4: the strap stays on the content cards (one rail, one set); the
   eyebrow row and the "عرض الكل" text CTA are not restored (the brief's
   composition list); the content cards get the lean-40 diagonal cuts back
   (theme-owned photographs); the rail tests were written before the code
   but not run red in between.
3. Item 5: short card labels `ox.card.type.<key>` (the brief's list with
   three corrections) instead of `ox.tax.<key>.name`, because the taxonomy
   names truncated the fact on a phone, measured; one fact (servings, else
   size) instead of two; the theme's own divider kept.
4. Item 5: `ListingPage.tsx` edited (the brief's own "pass it down from
   ListingPage"), via a React context because the engine renders the card.
5. Item 6: the compare table hides its bar too (argued, allowlist empty);
   the scope widened past `06-ox` source to the engine's Tailwind tab rows
   and Salla's own component scrollers, both hidden from `06-ox` files,
   since the owner's rule is "anywhere".
