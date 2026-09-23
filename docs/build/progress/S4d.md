# S4d — shop by brand: the carousel, the index and the brand page (2026-09-23)

Batch: the owner item "complete the design of shop by brand section, carousel
and page, reflected by the premium energetic kinetic identity and ui/ux of
optimal x", plus three mid-batch coordinator items (the shared rail cue and
progress strap; the real brand logos; `logo_ground` for the two white-only
marks).

Read first, in full: `X-IDENTITY-2026-09-22.md` (§§1–7), `DIRECTION.md` 2, 5,
6.14, 10, `progress/S4a.md` §4 (the 21 derived brands, shipped an hour
earlier), `progress/S4c.md` (the two-up cover carousel this batch reuses),
`progress/S3c.md` finding 6 (no hover translate), and every file the brief
named.

---

## 1. Design decisions, written before the code

### 1.1 The three surfaces, and what makes them one family

A brand is drawn by **one tile** everywhere (`app/components/brands/
BrandTile.tsx`, styled once in `_b4-listing.scss` §11): a plate carrying the
mark's own **arm-foot corner cut**, the brand's artwork when the API has one
(in a fixed 3:2 field on the ground that asset asks for — §4's
`logo_ground`), its **name mark** when it does not (first grapheme in
`--ox-accent-deep`, Cairo 700), and one **live count**. The home carousel, the `/brands` grid and
the brand banner therefore read as the same object at three sizes rather than
as three designs of the same idea.

### 1.2 The kinetic layer, and what it deliberately is not

Three moving things ship, and only three:

1. **The strap sweep.** The section eyebrow's accent rule — the one accent
   element `SectionHeader` already draws, widened to 40px — opens from its
   inline-start edge once, when the block reveals. `transform` only.
2. **The rail cue pulse.** The accent chevron at the reading end of the rail
   pulses once on the same reveal (transform + opacity).
3. **The progress strap.** A 3px accent segment that tracks scroll position
   on a `--ox-line` track. It moves because the visitor moves it; it has no
   animation of its own.

There is **no hover lift anywhere** (BUILD 3.4, `S3c.md` finding 6): the
brand tile's old `transform: translateY(-2px)` on hover is deleted, replaced
by a plate value step and a hairline step, and colour never transitions
(X-IDENTITY §5). No `clip-path` animates. Every horizontal translate in the
keyframes is `calc(var(--direction-factor) * Npx)`.

`useSectionReveal` never arms an element already on screen at hydration and
returns before observing under `prefers-reduced-motion`, so the SSR html and
the first client paint are identical, CLS from the reveal is 0, and a visitor
who asked for no motion gets the strap at full width and the cue static.

### 1.3 Two identity rules this batch overrides, on the owner's instruction

- **X-IDENTITY §6, Brands row**: "brand plates are straight … Forbidden: a
  corner cut on a brand plate." The 2026-09-23 (late) owner brief asks for the
  opposite in item 1 ("each tile a plate with the identity's arm-foot corner
  cut") and item 3 ("the identity plate, corner cut per §3.3 tier"). The
  later, explicit instruction wins; the tile and the banner carry the cut, and
  the override is written into `_b4-listing.scss` §11's own header so nobody
  reads the stylesheet and the matrix and assumes one of them is a mistake.
- **X-IDENTITY §5.1**: "Posters, guides, **brands** — nothing" (no reveal).
  The brief's item 1 asks for "the strap sweep on reveal … once". Same
  resolution: the owner's later instruction wins, and what ships is one strap
  and one cue pulse, not a staggered content reveal — the cards themselves
  never move, so BUILD 3.4's "one signature moment" (the goal grid) is still
  the only block that reveals its content.

### 1.4 Why the brand page is its own component

`ListingPage.tsx` is another batch's file this session and read-only for me.
The brand page now differs from a category listing in its head region (a
banner, not the masthead band), in carrying the featured rail (which
`ListingPage` gates to type and goal listings), and in hiding one facet. So
`app/components/brands/BrandPage.tsx` composes the same parts —
`FeaturedRail` **reused verbatim**, `ListingToolbar`, `FiltersRail`,
`FiltersDrawer`, `ProductGrid`, `LoadMore`, `useNextPage`, `sortOptions`,
`appliedFilters` — and adds nothing to them.

**The brand facet is hidden on a brand's own page**: every product there is
already that brand's, so the group would be a control with one option and no
effect. It is filtered out of the payload handed to the rail and the drawer
(`brandFilter()` finds it by its own key, never by guessing a URL param), and
never out of the URL contract: `salla-filters` still writes what it writes and
`appliedFilterCount` still counts it.

### 1.5 Claims

No surface in this batch says "موزع رسمي", "وكيل", "حصري" or "أصلي". The
tiles state a count and a name; the banner states a name and a count; the
index intro states that these are the brands the store stocks. The brand
page's meta no longer says "{{brand}} أصلي" — see §6.

---

## 2. Measurements

Container: `min(1296px, 100% - 2 × gutter)`, gutter 16 / 24 / 32 below 640 /
640–1023 / 1024+. Probes: **390 → 358**, 768 → 720, 1024 → 960, **1440 →
1296**. Gap is `--ox-4` = 16px everywhere in this batch (the brief's figure).

### 2.1 Home carousel, tile width

| probe | visible | formula | tile |
|---|---|---|---|
| 390 | 2.4 (peek) | `(358 − 1.4 × 16) / 2.4` | **139.8** |
| 768 | 4 | `(720 − 3 × 16) / 4` | 168.0 |
| 1024 | 4 | `(960 − 3 × 16) / 4` | 228.0 |
| 1440 | 6 | `(1296 − 5 × 16) / 6` | **202.7** |

The 6-up tier starts at **1280, not 1024**: at 1024 six tiles are 146.7 wide
and the 1440 corner tier (lean 64 / run 43.2) would be **29.5 %** of the
tile — over X-IDENTITY §2.3's 24 % budget. At 1280 the container is 1216, the
tile is 189.3 and the same run is 22.8 %, inside it. The brief's three probes
still land exactly: 2.4 at 390, 4 at 768, 6 at 1440.

### 2.2 `/brands` index grid, tile width (2 / 3 / 6-up as briefed)

| probe | columns | tile | run as % of tile |
|---|---|---|---|
| 390 | 2 | **171.0** | 27.0 / 171 = 15.8 % |
| 768 | 3 | 229.3 | 32.4 / 229.3 = 14.1 % |
| 1024 | 6 | 146.7 | 32.4 / 146.7 = 22.1 % |
| 1440 | 6 | **202.7** | 43.2 / 202.7 = 21.3 % |

6-up can start at 1024 here (unlike the carousel) because the middle corner
tier (lean 48) still holds it inside the budget at that width; the 64 tier
waits for 1280 on both surfaces.

### 2.3 The corner cut, one ladder for every brand surface

| breakpoint | lean | run (`ox-run`, tan 0.6745) | ledge `t` / jog `j` |
|---|---|---|---|
| base (< 768) | 40 | **27.0** | n/a (plain two-edge cut) |
| 768–1279 | 48 | **32.4** | n/a |
| ≥ 1280 | 64 | **43.2** | n/a |

Read back from the compiled CSS: `polygon(0 40px, 27px 0, …)`,
`(0 48px, 32.4px 0, …)`, `(0 64px, 43.2px 0, …)`, each with its `[dir='ltr']`
mirror.

Plate block-size: **158px** base, **176px** from 1280 — never below 158, which
is what makes a panel-scale angle legal on it at all (§3.2's 158px law; the
gate's own test is `< 158`, and 158 is not below 158). The clip sits on
`.ox-brand-tile__plate`, never on the `<a>`, because `clip-path` clips its
element's outline (§7.1 `focus-clipped`).

### 2.4 The brand banner

| probe | min-block-size | lean / run | run as % of container |
|---|---|---|---|
| 390 | **200** | 40 / 27.0 | 7.5 % of 358 |
| 768 | 220 | 48 / 32.4 | 4.5 % of 720 |
| 1440 | **240** | 64 / 43.2 | 3.3 % of 1296 |

### 2.5 The watermark (X-IDENTITY §4.1)

240 × 212.1 at 390, 420 × 371.2 at 1440, `--ox-ink` at **0.06**, `aria-hidden`,
`pointer-events: none`, never animated, drawn as `<svg><use href="#ox-mark"/>`
from the already-inlined sprite — never a `url()` request, never an `<img>`.
The svg's viewBox is the mark's own bounding box (`0 1.393 24 21.214`), so the
figure fills the reserved box at its true 1.1314 aspect. One per page, over the
page head only. The band clips it (`overflow: hidden`), so the −8 % / −10 %
offsets never reach the page edges.

### 2.6 Reserved height for the home block — NOT changed, and why

Measured, for whoever flips it: **mobile 284** (head 126 = eyebrow 20 + gap 8 +
h2 ~30 + view-all row 44 + margin-end 24, plus a 158 tile row) and **desktop
276** (head 100 + a 176 tile row).

`HOME_BLOCK_HEIGHTS['ox-brands']` and `BrandsSkeleton()` are left at **0 / null**
anyway. `tests/home/optionalBlocks.test.ts` asserts that every data-gated block
reserves nothing and draws no placeholder, with a written reason: the live
store has **zero** brands (`fixtures/store/brands.json` is `[]`; the 21 are an
offline overlay), so `OxBrands` renders null there and a reserved 284px box
would be 284px of blank space above the footer on the real storefront — the
exact defect that test was written for. That test file is outside this batch's
write scope. **Flagged as a deviation** (§7, item 1) with the numbers above, so
the day the owner creates the brands in the dashboard it is a two-line change.

---

## 3. The shared rail primitive (coordinator item)

New: `app/styles/06-ox/_rail.scss` (imported from `_index.scss` immediately
after `x-motif`) and `app/components/common/hooks/useRailProgress.ts`.

Markup contract, so the conductor can hang it on the product rails, the
featured covers and the posters:

```
<div class="ox-rail" ref={useRailProgress(trackRef)}>
  <ul class="ox-rail__track" ref={trackRef}>…</ul>
  <button class="ox-rail__cue">two .ox-rail__cue-arm spans</button>
  <div class="ox-rail__progress"></div>
</div>
```

- **No native scrollbar**: `scrollbar-width: none` plus the
  `::-webkit-scrollbar { display: none }` reset on `.ox-rail__track`, which
  also owns the gap, the snap type and `overscroll-behavior-inline: contain`.
  Keyboard and swipe are untouched: the track still scrolls, every tile is
  still a focusable link, and Tab still brings the next tile into view.
- **The cue** is the mark's own chevron: two thin accent parallelogram bars,
  `skewX(var(--ox-skew))` and `skewX(calc(-1 * var(--ox-skew)))`. `--ox-skew`
  is `calc(var(--direction-factor) * var(--ox-angle))`, so the chevron is 34°
  by construction, mirrors itself between RTL and LTR, and always points at
  the reading end. The arms carry **no block-size of their own** (they are
  sized by `inset-block`), which is what keeps the 158px law's target off a
  44px control, and §2.3's bar exemption covers their run. The 44px box is the
  button; the arms are inside it, so the focus ring is never clipped.
- **The progress strap** reads two custom properties the hook writes:
  `inline-size: calc(var(--ox-rail-visible) * 100%)` and
  `inset-inline-start: calc(var(--ox-rail-progress) * (100% - …))`. The track
  is always drawn; the accent segment appears only once there is something to
  scroll.
- **`data-rail`** (`scroll` / `end` / absent) gates both: a rail that fits
  draws no affordance at all, and the server-rendered html never promises one.
- **The hook writes to the DOM, not to state.** A scroll handler that calls
  `setState` re-renders the rail on every frame of a swipe; this sets three
  properties inside one `requestAnimationFrame`, so a swipe costs no React
  render. A `ResizeObserver` and a `MutationObserver` (the brand list arrives
  with a query, after mount) keep it honest without giving the hook a
  dependency to be called with.
- RTL: `Math.abs(scrollLeft)`; Safari 14's legacy reversed convention would
  read the strap full at rest — a decoration, never a control (documented in
  the hook).

---

## 4. The brand logos (coordinator item)

**All 21 brands now carry their own artwork.** Fourteen were fetched in this
batch (below); the remaining seven were fetched by the coordinator with a
browser-grade scraper after this batch reported them as blocked, and landed
in the same directory under the same slugs while the batch was still open.

Conversion, for the fourteen: PIL (RGBA, transparent border trimmed, 512px on
the long side, WEBP q85 with a step-down loop to stay under 40 KB); SVG kept
byte-for-byte as served. All 21 are pointed at from
`fixtures/store/overlay/brands.json`'s `logo` field.

**These are third-party trademarks, reproduced unaltered and used
nominatively to identify products the store sells (the owner confirms).** No
mark is recoloured, inverted, cropped, redrawn or composited anywhere in this
theme; the tile and the banner contain it in a fixed 3:2 field and never fill
it. Where a mark is drawn in white, the FIELD changes, not the mark — see
`logo_ground` below.

| brand | file | bytes | source |
|---|---|---|---|
| Sports Research | sports-research.webp | 10188 | `cdn.shopify.com/s/files/1/1813/6377/files/srlogo.png` (sportsresearch.com header) |
| MuscleTech | muscletech.webp | 3450 | `www.muscletech.com/cdn/shop/files/mt-logo-muscletech-com.png` |
| BlenderBottle | blenderbottle.webp | 15710 | `www.blenderbottle.com/cdn/shop/files/All_Logos_BB_WW-06.png` |
| Centrum | centrum.webp | 5812 | `i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/bp-wellness-centrum/en_US/global/logo/centrum-Logo.webp` |
| Ghost | ghost.webp | 5368 | `www.ghostlifestyle.com/cdn/shop/t/1423/assets/logo.png` |
| Grenade | grenade.webp | 32936 | `www.grenade.com/cdn/shop/files/2022Grenade_Logo_6dabc005….webp` |
| Isopure | isopure.svg | 2566 | `www.theisopurecompany.com/cdn/shop/files/isopure-logo-black.svg` |
| Myprotein | myprotein.webp | 7242 | `upload.wikimedia.org/wikipedia/commons/5/5b/Myprotein-logo.jpg` (Commons) |
| Nature's Way | natures-way.webp | 25390 | `naturesway.com/cdn/shop/files/new_logo_1200_x_628.png` |
| Nuun | nuun.webp | 9470 | `nuunlife.com/cdn/shop/files/nuun-logo-2022_1200x1200.png` |
| Olimp Sport Nutrition | olimp-sport-nutrition.svg | 10664 | `olimpsport.com/assets/images/logo.svg` |
| Quest Nutrition | quest-nutrition.webp | 1784 | `www.questnutrition.com/cdn/shop/files/quest_logo3_8e44de11….png` |
| Thorne | thorne.svg | 2361 | `d1vo8zfysxy97v.cloudfront.net/images/layout/thorne-logo.svg` |
| Vital Proteins | vital-proteins.webp | 6758 | `cdn.shopify.com/s/files/1/2074/9385/files/vital_proteins_logo_horizontal_fad23378….png` |

Every one of the fourteen was **opened and looked at** after conversion, not
just downloaded: three candidates were fetched, inspected and **rejected**
rather than shipped — an iHerb storefront logo served in EVLution's place, a
120×14 privacy-popup sprite served in NeoCell's, and two unrelated Wikimedia
files (a CPC International logo returned for "NOW Foods", a government press
photo for "Optimum Nutrition").

### The seven the coordinator supplied

| brand | file | bytes | source | ground |
|---|---|---|---|---|
| NOW Foods | now-foods.svg | 4030 | `nowfoods.com/themes/_custom/sd/logo.svg` | light |
| NOW Sports | now-sports.svg | 4030 | same NOW mark | light |
| Optimum Nutrition | optimum-nutrition.svg | 11435 | `optimumnutrition.com` `on-logo-white.svg` | **dark** |
| Dymatize | dymatize.svg | 2911 | `dymatize.com`, inline header SVG | **dark** |
| BSN | bsn.svg | 10991 | `gobsn.com` `Group_259.svg` | light |
| EVLution Nutrition | evlution-nutrition.webp | 4930 | `evlnutrition.com` `logo.png` | light |
| NeoCell | neocell.svg | 2669 | `neocell.com` `neocell-logo-black` svg | light |

Same nominative-use note applies to all seven. Read back from the files
themselves rather than taken on trust: `now-foods.svg` is the gradient NOW
mark (`#FAE200` → `#F36C21`), `optimum-nutrition.svg` and `dymatize.svg` are
**white-only** (`fill:#ffffff` ×23 and `fill="#fff"` ×12 respectively),
`bsn.svg` is the `#BA0C2F` hexagon with white letters on it, and
`neocell.svg` is `#1b1718` black — which is exactly the split the two
`logo_ground` rows encode.

For the record, why this batch's own fetch could not get these seven:
`nowfoods.com` answers **403** to any non-browser request at the apex and at
`www`; `optimumnutrition.com` publishes only the white mark and the three
black variants probed on the same CDN path all 404; `dymatize.com`'s only
structured-data logo is its parent company's (`bellring.png`);
`bsnsupplements.com` (the domain in the brief) **does not resolve** from this
environment, while the real one is `gobsn.com`; `evlnutrition.com` and
`neocell.com` both serve iHerb-operated storefronts whose header images are
not the brand's own. `logo.clearbit.com` does not resolve here at all, so the
brief's middle fallback was unavailable.

### `logo_ground`, and why the field changes rather than the mark

Two of the seven publish **white-only** artwork, which is invisible on the
light plate. Recolouring or inverting someone else's trademark is not an
option, and dropping the asset would leave the store's two biggest brands as
text. So the overlay row carries a fact about the ASSET —
`"logo_ground": "dark"` — and the theme changes the FIELD under it:

- `BrandTile`/`BrandBanner` read `logo_ground` through one helper,
  `logoBoxClass()`, so the same brand gets the same ground on the home
  carousel, the index grid and its own banner;
- `.ox-brand-tile__logobox--dark` / `.ox-brandhero__logobox--dark` swap
  `--ox-paper` for `--ox-ink` and change nothing else: same box, same
  padding, same 3:2 field, same `object-fit: contain`;
- the value is typed on `BrandWithCount` (`'dark' | 'light'`, optional) beside
  `products_count`, with the same note: it is not part of the engine's typed
  `Brand`, so it is read defensively and defaults to the light ground.

The alternative — sampling a logo's pixels at render time to guess its
ground — would be a paint-time cost on every tile and a guess that is wrong
for any mark with both light and dark parts. A fact recorded once beside the
asset is cheaper and cannot be wrong.

---

## 5. What the three surfaces render

### 5.1 Home, `OxBrands`

Eyebrow (`ox.home.brands_label`) + h2 (`ox.home.brands_title`) + "عرض الكل" to
`/brands`; a snap carousel of tiles inside the rail primitive;
`aria-roledescription` carousel on the row and slide on every item, each with
"العلامة 2 من 21"; the prev/next pair in `SectionHeader`'s `actions` slot,
which is `display: none` below 1024 and `flex` from there up, so the arrows
exist at 1024+ with no media query of their own. Sorted by `products_count`
DESC, capped at 24, shown from one brand up — all three unchanged from S4a.

The arrows are 44px buttons whose **unfilled angled face** is the shipped
`.ox-iconbtn--angled` span inside them (transparent, 1px `color-mix`
hairline), so the 44 hit area and the drawn 24 mark are separate boxes and the
focus ring is never clipped. Stepping is 4 tiles — the number visible at 1024,
the width the arrows first appear at. `goTo()` scrolls with
`scrollIntoView({ inline: 'start' })`, never a hand-computed `scrollLeft`
delta, so RTL needs no sign flip (S4c's finding, reused).

### 5.2 `/brands`

Masthead band (the listing's own, so `/brands` and a brand's products open
identically) + the watermark; one h1; the intro line; a letter rail at 1024+
(`scroll-margin-block-start: calc(var(--ox-h-bar) + var(--ox-4))`); the API's
own letter groups, each an `aria-labelledby` section with a visible letter and
an `ox-sr-only` sentence in its h2; the 2/3/6-up grid; the empty state with a
route out.

**The groups are the API's, not ours.** Salla's `/brands` answers with an
object keyed by first letter and the engine's own loader sorts `Object.keys`;
regrouping client-side would let the rail and the API disagree. Group ids are
positional (`brand-letter-3`) so a fragment never carries a percent-encoded
Arabic letter, and they are numbered off the API's own sorted key list so that
dropping an empty letter cannot renumber the groups that survive it.

**Two live defects fixed here**, both verified by curl before the rewrite:
the h1 and the `<title>` printed the raw platform key `common.titles.brands`
(the engine head does not resolve platform keys and the page passed
`page.title` through untested), and the description was the store-wide one.

### 5.3 `/brands/<id>`

Breadcrumb → banner (eyebrow, artwork when present, the name mark as the one
h1, the live count, the merchant's description **as text**) → `FeaturedRail`
(S4c's carousel, reused verbatim) → toolbar → filters rail/drawer without the
brand facet → grid → explore chips (other brands, then the root types, then
"كل العلامات التجارية") → empty state.

The engine's own brand header is still never rendered: it prints the
merchant's description through `dangerouslySetInnerHTML`.

---

## 6. SEO

| page | AR title | AR desc | EN title | EN desc |
|---|---|---|---|---|
| `/brands` | **50** | **135** | **53** | **149** |
| `/brands/9101` | **50** | **137** | (pattern, 42–60) | (pattern, 137–155) |

All inside SEO-ENG-010 (AR 45–55 / 130–150, EN 50–60 / 140–160, ceilings 60 /
160), measured on the **shipped html**, not on the keys.

**Two brand-title patterns, not one, because one cannot fit.** The catalogue's
brand names run from 3 characters ("BSN") to 21 ("Olimp Sport Nutrition"): a
single fixed wrapper cannot clear the 45-character target for the short name
and the 60-character ceiling for the long one (the arithmetic:
`F + 3 ≥ 45` needs `F ≥ 42`, `F + 21 ≤ 60` needs `F ≤ 39`). So
`brandHeadExtend` uses `ox.seo.brand.title_qualified` whenever the result fits
and falls back to `ox.seo.brand.title_compact` when it would breach. Measured
across all 21 brands: **AR 43–59, EN 42–60, nothing over the ceiling.**

**The old title key is no longer read, and here is why it matters.**
`ox.seo.brand.title_pattern` is `"{{brand}} أصلي | اوبتيمال اكس"` — a
per-brand **authenticity claim**, which the brief's claims law forbids on a
brand surface ("beyond the store-wide approved originality line already gated
in claims.ts"), and 29 characters with a 9-character brand name, well under
the target. It is **left in the dictionary untouched** (it is S3's researched
keyword artifact, keywords-ar.md B01–B05, and this batch does not edit another
batch's locale values) and simply no longer read. **Owner call needed**:
delete the key, or restore the claim deliberately with the gate updated to
match. Flagged, not silently resolved.

JSON-LD: `/brands` publishes `CollectionPage` + `ItemList` of the 21 brand
URLs + `BreadcrumbList` in one `@graph` (it published none at all before);
`/brands/<id>` keeps `listingHeadExtend`'s `CollectionPage` + `ItemList` +
`BreadcrumbList`. **No `Brand` or `Organization` node is emitted for a
supplier brand anywhere** — publishing one would be a structured claim about a
relationship the store does not have.

---

## 7. Deviations, every one flagged

1. **`HOME_BLOCK_HEIGHTS['ox-brands']` and `BrandsSkeleton()` stay at 0 /
   null**, against the brief's "reserved height (HOME_BLOCK_HEIGHTS +
   skeleton)". Reason and the measured replacement numbers: §2.6. Reserving
   284px for a block that renders null on the live store (zero brands today)
   re-creates the exact CLS defect `tests/home/optionalBlocks.test.ts` locks
   in, and that test is outside this batch's write scope.
2. **The tile count reads "منتجات: 7", not "7 منتجات"** (`ox.brands.
   products_count`). Arabic counted-noun agreement changes with the number —
   1 منتج، 2 منتجان، 3–10 منتجات، 11+ منتجا — and the live counts include 1
   and 2, so the brief's literal form would print "1 منتجات" on nine of the
   21 tiles. The colon form is correct at every count and matches the house
   pattern `ox.cart.items_count` ("المنتجات في السلة: {{count}}"). i18next
   plural suffixes were not used: this dictionary has none, and suffixed keys
   would break the ar/en key-parity test.
3. **6-up starts at 1280 on the home carousel**, not 1024, for the corner-cut
   budget (§2.1). The brief's own three probes still land exactly.
4. **`app/components/listing/BrandsGrid.tsx` is now unused** — no route
   renders it, and the `.ox-brands__grid` rules it depended on are gone (the
   index grid is `.ox-brandhub__grid`). Its own test still passes, so nothing
   is red; it and `tests/listing/BrandsGrid.test.tsx` want deleting in a
   follow-up. Not deleted here: `app/components/listing/**` is another
   batch's surface this session.
5. **`app/styles/06-ox/_index.scss` gained a line** (`@import 'rail';`) even
   though its header says "Nobody edits this file after P0". A new shared
   partial cannot load otherwise, and the coordinator's brief names the file
   and the position.
6. **`fixtures/store/overlay/brands.json` was edited** (the `logo` field on 21
   rows). Outside the brief's original file list; the coordinator's logo item
   requires it.
7. **`node scripts/i18n-merge.mjs` merged every partial**, not only mine, into
   `locales/{ar,en}.json` — including another batch's `s5.*.json`, which
   appeared mid-session. The merge is additive and idempotent (`--check`
   reports 0 pending afterwards), so the other builder's own run is a no-op,
   but they should know the keys are already in the base files.
8. **The three brand-tile logo candidates that were fetched and rejected**
   (iHerb for EVLution, a privacy-popup sprite for NeoCell, a white-only SVG
   for Optimum Nutrition) and the two Commons mismatches are listed in §4
   rather than quietly dropped. The seven this batch could not reach were
   supplied by the coordinator mid-batch and are in §4's second table, with
   the colours read back from the files themselves.
9. **`ox.seo.brand.title_pattern` left in place but unread** — §6. Owner call.
10. **One transient preview flake, not a code defect**: the first curl of
    `/ar/brands` returned a canonical and `@id` of
    `https://optimalx.com.sa/ar/protein/c9001` — a stale `ctx.location` from a
    previous request under concurrent load. The identical request 40 seconds
    later returned `https://optimalx.com.sa/ar/brands` for both, and the other
    three pages were correct on every attempt. Recorded because it will look
    alarming in a log, and because it is the same class of dev-server
    unreliability `S3b.md` and `S4a.md` already documented.
11. **RESOLVED — the logos are live.** `scripts/serve-store.mjs` reads the
    overlay once at boot, so for most of this batch the preview answered
    `logo: null` and every tile rendered the name mark; restarting the server
    is forbidden by the brief. The coordinator restarted it with the seven
    supplied assets, and `/ar/brands` now serves **21 distinct
    `/assets/brands/*` files, 0 name marks, and exactly 2 tiles on the dark
    ground** (§9). No code changed between the two states.

---

## 8. Files changed

**Components**
- `app/components/brands/BrandTile.tsx` — new. The one brand tile: plate,
  corner cut, logo box or name mark, API-only count. Owns `logo_ground` and
  the `logoBoxClass()` helper both brand surfaces read.
- `app/components/brands/BrandsIndex.tsx` — new. The `/brands` composition:
  band, watermark, letter rail, API letter groups, grid, empty state.
- `app/components/brands/BrandBanner.tsx` — new. The brand page's identity
  plate: eyebrow, artwork in the same logo field (same `logo_ground`), the
  name mark as the one h1, the live count.
- `app/components/brands/BrandExplore.tsx` — new. Other-brand chips and root
  type chips, the latter through `useTaxonomyLinks`.
- `app/components/brands/BrandPage.tsx` — new. The brand listing composition.
- `app/components/home/OxBrands.tsx` — rebuilt as the carousel on the rail
  primitive, with the eyebrow strap and the arrow pair.
- `app/components/common/hooks/useRailProgress.ts` — new. The rail's scroll
  state, written to the DOM, never to React state.

**Routes**
- `app/routes/brands.tsx` — renders `BrandsIndex`; head is
  `brandsIndexHeadExtend()`.
- `app/routes/brands.$id.tsx` — renders `BrandPage`.
- `app/routes/$slug.brand-$id.tsx` — **no change needed**: it is the
  auto-generated SEO redirect into `/brands/$id`, which is exactly where the
  new page lives. Read, left alone.

**SEO**
- `app/components/seo/routeHeads.ts` — `brandHeadExtend` rebuilt (two title
  patterns + a description, no authenticity claim); `brandsIndexHeadExtend`
  added (title, description, CollectionPage + ItemList + BreadcrumbList).
- `app/components/seo/jsonld.ts` — `urlItemList()` added, for an index whose
  members are pages rather than products.

**Styles**
- `app/styles/06-ox/_rail.scss` — new. `.ox-rail`, `__track`, `__cue`,
  `__cue-arm`, `__progress`, the one pulse keyframe.
- `app/styles/06-ox/_index.scss` — `@import 'rail';` after `x-motif`.
- `app/styles/06-ox/_b2-home.scss` — section 7 only: the carousel layout, the
  tile-width tiers, the strap sweep, the arrow pair.
- `app/styles/06-ox/_b4-listing.scss` — section 11 rewritten (the shared tile,
  its logo field and the `--dark` ground, `.ox-brandhub*`, `.ox-brandhero*`
  and its own logo field); section 13 lost its two now-dead `.ox-brand-tile`
  reduced-motion lines.

**Data and copy**
- `fixtures/store/overlay/brands.json` — `logo` set on all 21 rows (14 by
  this batch, 7 by the coordinator), `logo_ground: "dark"` on two.
- `public/assets/brands/*` — 21 logo files, 14 of them this batch's (§4).
- `locales/partials/s4.{ar,en}.json` + `locales/{ar,en}.json` — 15 new keys,
  mirrored identically, merged with `i18n-merge`.

**Tests**
- `tests/brands/BrandsIndex.test.tsx` — new, 10 cases (including the dark
  ground and that the artwork itself is untouched).
- `tests/brands/BrandPage.test.tsx` — new, 10 cases (including the banner's
  own ground, light and dark).
- `tests/home/blocks.test.tsx` — the `OxBrands` block: two cases retargeted at
  the new classes, four added (count-from-API-only, carousel semantics, the
  rail cue, the arrow pair and its unfilled angled face).

---

## 9. Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/home tests/brands tests/listing tests/common
 Test Files  32 passed (32)
      Tests  350 passed (350)
```

(348 before the `logo_ground` follow-up; the two added cases are the dark
ground on the tile and on the banner.)

(An intermediate run had three failures: two were the `OxBrands` cases this
batch retargeted, and one was `tests/home/OxServices.test.tsx > skips row one
on /services`, a concurrent batch's in-flight edit of `OxServices.tsx` —
green by the final run, with no change from this batch.)

```
$ pnpm check:rtl        → check-rtl: 327 file(s), 0 problem(s)
$ pnpm check:motion     → check-motion: 327 file(s), 0 problem(s)
$ pnpm check:strings    → check-strings: 322 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
                        → check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
                        → check-claims: 32 file(s), 0 problem(s), 4 allowlisted
                          (the four pre-existing official_distributors rows)
$ node scripts/check-tokens.mjs
                        → 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
                        → check-identity: 327 file(s), 0 problem(s)
$ pnpm check:jsonld     → check-jsonld: 11 file(s), 0 problem(s)
$ node scripts/i18n-merge.mjs
                        → locales\ar.json: 1369 partial key(s), 15 added, 0 updated
                          locales\en.json: 1369 partial key(s), 15 added, 0 updated
```

Compiled CSS read back with `npx sass --no-source-map app/styles/app.scss`
(clean, only the pre-existing `@import` deprecations): the three corner tiers
and both `[dir='ltr']` mirrors, the cue arms' `skewX(var(--ox-skew))` pair,
the progress segment's two custom properties.

Live curl, `http://localhost:3210`:

```
/ar               200  92710
/ar/brands        200  74105
/ar/brands/9101   200 125643
/en/brands        200  72514

/ar/brands        title=50  desc=135   h1=1
/ar/brands/9101   title=50  desc=137   h1=1
/en/brands        title=53  desc=149   h1=1
/ar               title=53  desc=142   (unchanged)

/ar/brands   <h1 class="ox-h1">العلامات التجارية   (was the raw key)
             10 letter groups, 10 letter links, 21 tiles,
             ids brand-letter-0 … brand-letter-9,
             1 .ox-x-watermark
             ld+json graph: CollectionPage(#webpage) ->
               ItemList(21, first https://optimalx.com.sa/brands/optimum-nutrition)
               BreadcrumbList[/ar/, /ar/brands]
             canonical https://optimalx.com.sa/ar/brands

/ar/brands/9101  .ox-brandhero 1 (+ its children), .ox-brandhero__mark-first 1,
                 .ox-featured__item 6, .ox-explore__list 1
                 canonical https://optimalx.com.sa/ar/brands/9101
                 graph: CollectionPage + ItemList + BreadcrumbList

/assets/brands/thorne.svg   200 image/svg+xml  2361
/assets/brands/grenade.webp 200 image/webp    32936
```

`/ar`'s brand section is an empty `s-block--ox-brands` shell in the SSR html
and mounts on the client (pre-existing: the block renders from a query, which
is also why it reserves no height — §2.6), so the carousel's markup is covered
by unit tests rather than by curl.

### After the `logo_ground` follow-up (the coordinator's restarted server)

```
/ar/brands       200  77786
/ar/brands/9102  200 127167          (Optimum Nutrition: the dark-ground case)

/ar/brands   21 x src="/assets/brands/<slug>.<svg|webp>", one per brand,
             19 x class="ox-brand-tile__logobox"
              2 x class="ox-brand-tile__logobox ox-brand-tile__logobox--dark"
              0 x class="ox-brand-tile__mark"        (no fallback left)

/ar/brands/9102
             class="ox-brandhero__logobox ox-brandhero__logobox--dark"
             <img src="/assets/brands/optimum-nutrition.svg"
                  alt="Optimum Nutrition" class="ox-brandhero__logo object-contain"
                  width="160" height="107" loading="lazy" decoding="async">
             h1 = 1, canonical https://optimalx.com.sa/ar/brands/9102
             title=58 desc=145   (the 17-character brand name: inside the 60
                                  ceiling, above the 55 target, as §6 predicts)
```

Compiled CSS read back again after the follow-up:
`.ox-brand-tile__logobox{…background:var(--ox-paper)}`,
`.ox-brand-tile__logobox--dark{background:var(--ox-ink)}`, and the same pair
for `.ox-brandhero__logobox`.

Every gate re-run after the follow-up, all unchanged and at 0 problems
(`check-rtl` 327, `check-motion` 327, `check-strings` 322, `check-copy` 2,
`check-claims` 32 / 4 allowlisted, `check-tokens` 123 / 322,
`check-identity` 327, `check-jsonld` 11), `pnpm typecheck` clean.

### 4.1 Owner ruling, 2026-09-24: no dark plate behind logos

"Remove the dark background fill behind brand logos." `logo_ground` is no
longer set on any overlay row, so no tile or banner renders the `--dark`
modifier (the CSS stays, inert). The two single-colour marks that only
existed as white (Optimum Nutrition, Dymatize) now ship as their ink
variant (`#12171E` in place of white, the mono usage the brands' own
guidelines provide; no shape, proportion or composition changed), so they
read on the light plate like every other logo.
