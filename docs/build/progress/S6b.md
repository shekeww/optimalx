# S6b, retiring `sicon-*` for the OptimalX sprite

Builder S6b, 2026-09-23. Executes the hand-off in `docs/build/progress/S6a.md`
§5: every `sicon-*` glyph in `app/**` swapped for `<Icon name="…" size={n} />`
from the theme's own sprite, plus S6a's deviations 6 and 7.

---

## 1. The size rule, as applied

Per the brief: **20** in the header main bar and utility strip and the bottom
tab bar; **16** in chips, accordions, section-header arrows and inline text
arrows; **24** elsewhere unless the surrounding CSS rule sizes the glyph, in
which case that literal value is used instead of the 24 default. The three
named buckets (20/20/16) are unconditional, they do not defer to a legacy
`font-size` the icon-font glyph happened to carry.

One mechanical rule cut across almost every row: **the swap target is
decided by the original glyph's own name**, not by what "should" visually
read as forward or backward in a given context, `sicon-keyboard_arrow_left`
is always `chevron-start`, `sicon-keyboard_arrow_right` is always
`chevron-end`, exactly as §5 states. A few call sites (`RelatedRail`,
`FeaturedRail` rail-nav pairs, `DeliveryPromise`) share **one** glyph between
two opposite meanings through a hand-written CSS `transform: rotate(...)`
keyed off `--direction-factor`; for those the correct swap is the *semantic*
icon (`chevron-start` for the prev/backward instance, `chevron-end` for the
next/forward one) with the rotation deleted, per the brief's explicit
instruction to remove hand-written RTL rotation on directional arrows.

A second mechanical finding drove several `size={24}` choices that look like
they ignore an old smaller `font-size`: where `.ox-iconbtn--angled` (or
`PlanCard`'s own copy of that construction, `.ox-plan__arrow`) sits **directly
on the swapped element** (not on a wrapping `<span>`), that class's own
`inline-size: 24px; block-size: 24px` is a single-class selector declared
**after** `.ox-icon--16`/`--20` in the same stylesheet, so it always wins the
cascade regardless of the `size` prop passed to `Icon`. Asking for 16 there
would request a 16-unit drawing inside a box CSS still renders at 24, so
`size={24}` is the only choice that avoids a mismatch. Where the angled face
is a **separate wrapping `<span>`** (`ox-featured__arrow-face`,
`ox-related__arrow-face`, `ox-brands__arrow-face`, `ox-posters__arrow-face`,
`ox-cat-rail__arrow-face`, all `font-size: 16px`), there is no such conflict
and the icon itself takes the wrapper's own value.

---

## 2. The swap table, as executed

| `sicon-*` | swapped to | size | file:site |
|---|---|---|---|
| `keyboard_arrow_down` | `chevron-down` | 16 | `common/Accordion.tsx` (accordion chevron) |
| `keyboard_arrow_down` | `chevron-down` | 16 | `layout/Header/MobileDrawer.tsx` (drawer group disclosure, expand/collapse rotation kept, it is not RTL-related) |
| `keyboard_arrow_up` | `chevron-up` | 16 | `product/BuyZone/PdpThumbRail.tsx` (matches the sibling `chevron-down` already wired there) |
| `keyboard_arrow_right` | `chevron-end` | 16 | `common/SectionHeader.tsx` (section-header arrow) |
| `keyboard_arrow_right` | `chevron-end` | 16 | `layout/Header/MegaPromo.tsx`, `home/OxBanner.tsx`, `home/PosterCard.tsx`, `home/Poster.tsx` (inline text arrows, `.ox-*-chevron`/no size class) |
| `keyboard_arrow_right` | `chevron-end` | 24 | `home/GoalCard.tsx`, `home/CategoryTile.tsx`, `listing/CategoriesIndex.tsx` (foot arrow, `ox-iconbtn--angled` direct on the icon) |
| `keyboard_arrow_right` | `chevron-end` | 24 | `home/OxHero.tsx` (Button `iconEnd`, no sizing rule) |
| `keyboard_arrow_right` (paired w/ `_left` on the same next button) | `chevron-end` | 16 | `home/OxBrands.tsx`, `home/OxPosters.tsx`, `home/OxCategoryRail.tsx` "next" rail arrow (`.ox-*-arrow-face { font-size:16px }`, `ox-mirror` dropped, Icon.tsx now mirrors on its own) |
| `keyboard_arrow_left` | `chevron-start` | 16 | `brands/BrandExplore.tsx`, `listing/RelatedGuides.tsx`, `listing/ExploreLinks.tsx` (×2), `listing/GoalLanding/SubNeeds.tsx` (inline text arrows) |
| `keyboard_arrow_left` (paired "prev") | `chevron-start` | 16 | `home/OxBrands.tsx`, `home/OxPosters.tsx`, `home/OxCategoryRail.tsx` |
| `keyboard_arrow_left` (one glyph, rotated to serve BOTH prev and next) | `chevron-start` (prev) / `chevron-end` (next) | 16 | `product/BelowFold/RelatedRail.tsx`, `listing/FeaturedRail.tsx` rail-nav pair, `.ox-related__arrow-icon`/`.ox-featured__arrow-icon` rotate rules deleted from `_b3-product.scss`/`_b4-listing.scss` |
| `keyboard_arrow_left` (`ox-iconbtn--angled` direct, inline cta) | `chevron-start` | 24 | `listing/FeaturedRail.tsx` (`ox-featured__cta`) |
| `keyboard_arrow_left` (hand-rotated to point forward) | `chevron-end` | 16 | `product/BuyZone/DeliveryPromise.tsx`, the `transform: rotate(...)` line removed from `.ox-delivery__chev`, its layout/colour declarations kept |
| `keyboard_arrow_right` (never mirrors, LTR-pinned tagline) | `chevron-end` | 14 | `layout/Footer/FooterBottom.tsx`, see deviation 1 below |
| `heart` | `heart` | 20 | `layout/Header/MainBar.tsx`, `product/BuyZone/PdpGallery.tsx` (`.ox-gallery__wish{font-size:20px}`), `product/OxProductCard.tsx` (`.ox-card-product__wish{font-size:20px}`, edited last) |
| `heart` | `heart` | 20 | `product/BuyZone/WishlistShare.tsx` (matches the sibling `referral` icon two lines below in the same file) |
| `heart` | `heart` | 24 | `layout/Header/MobileDrawer.tsx` account row (matches the sibling goal-row `Icon` two rows up) |
| `cancel` | `close` | 16 | `common/Chip.tsx` (chip remove control) |
| `cancel` | `close` | 22 | `layout/Header/ShopSheet.tsx`, `layout/Header/MobileDrawer.tsx`, `layout/Header/MobileHeader.tsx` (`.ox-iconbtn{font-size:22px}`) |
| `cancel` | `close` | 24 | `cart/AddProductToast.tsx` (`.s-add-product-toast__close`, Salla's own class, no sizing rule in our stylesheets) |
| `menu` | `menu` | 20 | `layout/Header/MobileHeader.tsx` (header main bar) |
| `whatsapp` | `whatsapp` | 24 | `layout/Header/MobileDrawer.tsx` contact row |
| `whatsapp` | `whatsapp` | 20 | `blocks/OxBranch.tsx`, `pages/ContactRow.tsx` (Button `iconStart`, matches `OxBranch`'s own sibling `branch-visit` `iconStart`) |
| `user` | `user` | 20 | `layout/BottomTabBar.tsx` (tab bar) |
| `user` | `user` | 24 | `layout/Header/MobileDrawer.tsx` account row |
| `search` / `home` / `grid` | `search` / `home` / `grid` | 20 | `layout/BottomTabBar.tsx` (tab bar) |
| `store` | `store` | 20 | `layout/Header/UtilityBar.tsx` (utility strip) |
| `globe` | `globe` | 20 | `layout/Header/LocalizationButton.tsx` (utility strip) |
| `filter` | `filter` | 20 | `listing/ListingToolbar.tsx` (Button `iconStart`) |
| `phone` | `phone` | 24 | `layout/Header/MobileDrawer.tsx` contact row |
| `play` / `pause` | `play` / `pause` | 24 | `home/OxHero.tsx` (no sizing rule) |
| `rotate` / `page` / `file-archive` / `calendar` | `rotate` / `document` / `archive` / `calendar` | 24 | `product/DigitalFilesSettings.tsx` (no sizing rule) |
| `check-circle` | `check-circle` | 18 | `product/DigitalFilesSettings.tsx` (its own `text-lg` Tailwind utility, ≈18px, dropped as dead once the SVG's own `size` carries it) |
| `sar` | *(kept)* |, | `common/Price.tsx`, `_b3-product.scss`, `_b4-listing.scss`, `_primitives.scss`, `header.scss`, S6a §5 last row, untouched |

**`OxProductCard.tsx` was edited last**, re-read immediately beforehand
(S5b's own concurrent work had already landed and settled by then, see §4):
one line, `<i className="sicon-heart" ...>` → `<Icon name="heart" size={20} />`.

---

## 3. Deviations 6 and 7

**Deviation 6** (move the 16px stroke bump from the sprite's inline
`<style>` into `_primitives.scss`'s `.ox-icon--16` rule): done on the
`_primitives.scss` side -

```scss
&--16 { inline-size: 16px; block-size: 16px; --ox-icon-stroke: 2.25px; }
```

`app/assets/ox-sprite.svg` was under **active, concurrent revision by another
batch** for the entire session (the owner's 2026-09-24 "restore the ten
product-category icons verbatim" pass, a different, later change than S6a's
own redraw). Two attempts to remove the now-duplicate
`.ox-icon--16{--ox-icon-stroke:2.25px}` from the sprite's own `<style>` were
both silently overwritten by that batch's own saves before I could verify
they had landed. Per the standing instruction not to fight a concurrently
edited file, the sprite keeps its own copy of the rule; `_primitives.scss`
now **also** carries it. Both declarations set the same custom property to
the same value, so nothing is visually wrong, it just is not a full "move,"
only a "copy," until whoever finishes that sprite batch removes the sprite's
now-redundant copy. `tests/common/sprite.test.ts` was extended (not
replaced) with an additive assertion against `_primitives.scss` for this,
alongside the pre-existing sprite-side assertion, so the test stays
meaningful for both files regardless of which one is authoritative when the
sprite batch lands.

**Deviation 7** (delete the dead `vector-effect: non-scaling-stroke` on
`.ox-icon`): done, along with the stale explanatory comment above it (the
comment specifically described *why* that now-deleted line existed; leaving
it would have been actively misleading, so it went with the line it
explained).

---

## 4. CSS cleanup

Confirmed (`grep -rn "\.sicon-" app/styles/06-ox`) that **no** `.sicon-*`
selector in `app/styles/06-ox` ever styled a swapped glyph, the only
`.sicon-*` rules anywhere in that directory are the `sicon-sar` currency-mark
rules S6a's own table says to leave. `03-elements/buttons.scss`,
`04-components/header.scss` and `02-generic/ltr.scss` (all outside
`06-ox`) were not touched, per the brief.

Three hand-written RTL/direction rotations were deleted as dead once their
call sites moved to a semantically-correct, self-mirroring icon name:
`.ox-related__arrow-icon` / `.ox-related__arrow--next .ox-related__arrow-icon`
(`_b3-product.scss`), `.ox-featured__arrow-icon` /
`.ox-featured__arrow--next .ox-featured__arrow-icon` (`_b4-listing.scss`),
and the `transform: rotate(...)` declaration inside `.ox-delivery__chev`
(`_b3-product.scss`, its `flex`/`margin-inline-start`/`color` declarations
kept, they are layout, not direction).

---

## 5. Deviations, call-site level

1. **`layout/Footer/FooterBottom.tsx`'s tagline chevron never mirrors, by
   design** (comment already in the file: the row is permanently
   `dir="ltr"`, an English tagline, and the old sprite glyph's own bug was
   that it mirrored anyway). `chevron-end` is one of Icon.tsx's five
   auto-mirrored names, so swapping to it verbatim would have reintroduced
   exactly that bug. Fixed with `style={{ transform: 'none' }}` on the
   `Icon`: an inline style always outranks `.ox-mirror`'s
   `[dir='rtl']`-scoped class rule (which carries no `!important`), so this
   one call site stays un-mirrored while every other `chevron-end` in the
   theme still flips normally. `_b1-layout.scss`'s existing
   `.ox-footer__en .ox-icon { color: var(--ox-accent) }` already paints the
   accent through the class `Icon` carries, so the old inline `color` style
   was dropped as redundant along with the old inline `fontSize`.
2. **`home/OxServices.tsx` and `home/PlanCard.tsx`**: both were mid-edit by a
   separate, concurrent "owner brief 2026-09-24 / UX audit" batch that
   replaced the exact markup this batch's swap targeted (`.ox-channel-door__cta`'s
   and `.ox-plan__arrow`'s chevron-plus-text rows) with a plain full-width
   `<Button>`, no chevron at all. My swap edits to both files were made,
   then silently superseded when that batch's own save landed. Re-verified
   with `grep -n "sicon-\|chevron-end" app/components/home/OxServices.tsx
   app/components/home/PlanCard.tsx` → no matches in either file: nothing
   left to swap, no `sicon-*` residue, no action needed.
3. **`tests/layout/MainBar.test.tsx`** asserted the literal presence of
   `.sicon-heart` (`it('renders the wishlist link with its own sallaicons
   glyph')`), exactly the behaviour this batch retires. Updated to assert
   the drawn `#ox-heart` `<use>` and the absence of `.sicon-heart`, matching
   the pattern the file's own next-door cart-icon test already used.
4. Two other test failures surfaced mid-session and resolved themselves
   without my intervention once their owning concurrent batches finished
   saving: `tests/listing/CategoriesIndex.test.tsx`
   ("resolves a card to the live category…") and
   `tests/product/OxProductCard.test.tsx` ("renders the buy CTA as a
   link…", superseded by a "buy CTA is now a button" redesign, UX-2026-09-24
   P0-10). Neither touched icons; both are green in the final run (§6).

---

## 6. Verification

```
$ grep -rn "sicon-" app --include=*.tsx --include=*.ts --include=*.scss | grep -v sicon-sar
app/components/common/Icon.tsx:69,101,102        (prose comments only)
app/components/layout/BottomTabBar.tsx:128       (comment: "not sicon-shopping-bag")
app/components/layout/Header/MainBar.tsx:119     (same comment)
app/components/layout/Header/MobileHeader.tsx:64 (same comment)
app/styles/02-generic/ltr.scss:6-7               (Salla's own RTL rule, outside 06-ox)
app/styles/03-elements/buttons.scss:98           (Salla's, explicitly left)
app/styles/04-components/header.scss:208         (Salla's, explicitly left)
```

```
$ pnpm typecheck
$ tsc --noEmit
(no output, 0 errors)
```

```
$ pnpm vitest run tests/layout tests/home tests/product tests/listing tests/common tests/blocks tests/pages
 Test Files  71 passed (71)
      Tests  871 passed (871)
```

```
$ pnpm check:rtl && pnpm check:motion && pnpm check:strings && node scripts/check-tokens.mjs && node scripts/check-identity.mjs
check-rtl: 328 file(s), 0 problem(s)
check-motion: 328 file(s), 0 problem(s)
check-strings: 326 file(s), 0 problem(s)
check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
check-identity: 328 file(s), 0 problem(s)
```

```
$ curl -s http://localhost:3210/ar            → http=200, sicon- occurrences: none
$ curl -s http://localhost:3210/ar/protein/c9001 → http=200, sicon- occurrences: sicon-sar ×23 only
$ curl -s http://localhost:3210/ar/x/p1673105563 → http=200, sicon- occurrences: sicon-sar ×7,
                                                    sicon-luggage-cart ×1 (Salla's own add-to-cart
                                                    web component, not in app/**, out of scope)
```

Header, tab bar and chip icons confirmed drawn in the fetched HTML, e.g.:

```
<svg class="ox-icon ox-icon--20" ... style="--ox-icon-size:20px" ...><use href="#ox-store"></use></svg>
<svg class="ox-icon ox-icon--20" ... style="--ox-icon-size:20px" ...><use href="#ox-heart"></use></svg>
<svg class="ox-icon ox-icon--20" ... style="--ox-icon-size:20px" ...><use href="#ox-menu"></use></svg>
5 × <svg class="ox-icon ox-icon--20" ...> in .ox-tab (home, shop, search, cart, account)
<svg class="ox-icon ox-icon--16" ...><use href="#ox-chevron-down"></use></svg>
```

```
$ pnpm vitest run tests/common
 ✓ tests/common/xmark.test.ts (6 tests)
 ✓ tests/common/sprite.test.ts (18 tests)
 ✓ tests/common/primitives.test.tsx (14 tests)
 Test Files  3 passed (3)
      Tests  38 passed (38)
```

---

## 7. Files changed

**Components (`sicon-*` swapped, `Icon` imported where it was not already):**
`common/Accordion.tsx`, `common/SectionHeader.tsx`, `common/Chip.tsx`,
`layout/BottomTabBar.tsx`, `layout/Header/MobileHeader.tsx`,
`layout/Header/MainBar.tsx`, `layout/Header/UtilityBar.tsx`,
`layout/Header/LocalizationButton.tsx`, `layout/Header/ShopSheet.tsx`,
`layout/Header/MobileDrawer.tsx`, `layout/Header/MegaPromo.tsx`,
`layout/Footer/FooterBottom.tsx`, `brands/BrandExplore.tsx`,
`product/BelowFold/RelatedRail.tsx`, `listing/FeaturedRail.tsx`,
`product/BuyZone/DeliveryPromise.tsx`, `home/GoalCard.tsx`,
`home/CategoryTile.tsx`, `listing/CategoriesIndex.tsx`, `home/OxServices.tsx`
(edit superseded, §5.2), `home/PlanCard.tsx` (edit superseded, §5.2),
`home/OxBrands.tsx`, `home/OxPosters.tsx`, `home/OxCategoryRail.tsx`,
`home/OxBanner.tsx`, `listing/RelatedGuides.tsx`, `listing/ExploreLinks.tsx`,
`listing/GoalLanding/SubNeeds.tsx`, `home/PosterCard.tsx`, `home/Poster.tsx`,
`product/BuyZone/PdpThumbRail.tsx`, `home/OxHero.tsx`,
`listing/ListingToolbar.tsx`, `blocks/OxBranch.tsx`, `pages/ContactRow.tsx`,
`product/DigitalFilesSettings.tsx`, `product/BuyZone/PdpGallery.tsx`,
`product/BuyZone/WishlistShare.tsx`, `cart/AddProductToast.tsx`,
`product/OxProductCard.tsx` (last).

**Styles:** `06-ox/_primitives.scss` (deviations 6 and 7),
`06-ox/_b3-product.scss` (rotation cleanup ×2),
`06-ox/_b4-listing.scss` (rotation cleanup ×1).

**Sprite:** `app/assets/ox-sprite.svg`, edit attempted, superseded by a
concurrent batch; not re-fought (§3).

**Tests:** `tests/common/sprite.test.ts` (additive assertion for deviation
6), `tests/layout/MainBar.test.tsx` (updated an assertion this batch's own
retirement made obsolete).

Not touched, per the brief: `app/components/common/Icon.tsx`,
`app/components/common/KitchenSink.tsx`, `app/styles/03-elements/buttons.scss`,
`app/styles/04-components/header.scss`.
