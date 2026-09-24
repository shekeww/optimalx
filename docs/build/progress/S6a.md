# S6a, the OptimalX icon system

Builder S6a, 2026-09-23. Three briefs in one night, each superseding the last:
the owner's first note ("the lightweight icons do not fit the premium, bold,
energetic, kinetic and minimal identity"), his review of revision 1 ("the icons
look odd, out of style and irrelevant"), and finally his **definitive icon
brief with two reference contact sheets**, which is what this document and the
shipped sprite implement.

> "Rebuild the Optimal X icon system without changing the existing
> sprite/component architecture. … Use the Optimal X logo mark as a
> construction-language reference, not as a literal motif. Create three related
> families: category/product icons, goal/service icons, and universal UI icons.
> Universal UI icons must remain immediately recognizable; branding should come
> from geometry, stroke, chamfer treatment and selected-state behavior rather
> than changing their conventional metaphors."

---

## 1. The system

### 1.1 The defect that started all this

The shipped sprite declared `stroke-width="1.8"` **on the sprite's root
`<svg>`**, and `tests/common/sprite.test.ts` enforced that no `<symbol>` ever
carried its own. That is why the icons read light: `<use href="#ox-…">` clones
the symbol into a shadow tree that inherits from the **`<use>` element**, not
from the sprite root, so the root's 1.8 never reached a single rendered path.
`.ox-icon` (`_primitives.scss`) sets `stroke: currentColor` and `fill: none`
but no width, so every symbol in the live theme drew at SVG's initial
`stroke-width: 1`, **0.67 px at a 16 px icon, 1 px at 24**. The same file's
`vector-effect: non-scaling-stroke` is inert for the same reason: it is not an
inherited property, so it never crosses the `<use>` boundary either.

"Lightweight" was not a taste problem. It was a 1-unit hairline where the spec
said 1.8, and the test meant to guard the weight was guarding the mechanism
that broke it. The weight now lives on each `<symbol>`, where it reaches the
paint.

### 1.2 Grid, bounds, weight

| Rule | Value |
|---|---|
| Grid | 24 × 24 master, `viewBox="0 0 24 24"` |
| Optical bounds | ≈ 20 × 20, every drawn point inside `[2, 22]`, and the object reaches within 1.25 of that inset on **at least two** sides |
| Stroke | **2** units, declared on each `<symbol>` as a presentation attribute |
| Terminals | `square`. Never `round`, never `butt` |
| Joins | `miter`, `stroke-miterlimit="4"`, the limit is what stops a long miter spike |
| Fill | `none` on the symbol; accent parts fill or stroke through their class |
| Elements | `<path>` only. No `<circle>`, `<rect>`, `<line>`, no `rx`/`ry`, no `transform` |

### 1.3 The signature diagonal, used selectively

The mark's own angle is **34° from vertical** (`dx = 0.675 · dy`) and its
complement **56°**. It is the construction reference, not a motif stamped on
everything:

- it is the **chamfer** that cuts the foot of every tub, jar, card, calendar
  and panel where a corner would otherwise be square (`… V19.65 L17.5 21 …`);
- it is the **lean** of the nutrition bar, the scoop handle, the free-from
  slash, the bolt;
- it is the **cross** in `close`, one steep arm and one shallow arm, the
  mark's two angles crossing.

**45° never appears.** That is the one angle X-IDENTITY §2.1 rules out by name,
and the sprite test fails on it. The two documented exceptions are the
magnifier handle and the arrowhead (`ox-search`, `ox-arrow`, `ox-external`),
where 45° *is* the universal convention and the owner's brief requires the
universal set to stay conventional.

Measured across the whole file: **667 of 939 straight segments (71 %)** sit on
the 0 / 34 / 56 / 90 lattice; the rest are the figurative parts a real object
needs (a bolt's kink, a molecule's bond, a wheat ear).

Curves are allowed where the object has one, a capsule end, a drop, a heart
lobe, a wheel, a lens, a clock face. Revision 1 read the system as "no curves
anywhere" and that is exactly what produced the tub reduced to a box and the
user reduced to a square.

`#ox-mark` keeps its own 0.6745085 geometry byte-for-byte
(`scripts/check-identity.mjs` rule `mark-drift`), and never mirrors.

### 1.4 Colour and the accent

The body of every icon is **`stroke="currentColor"`**, graphite on the light
ground, paper on the dark. The accent rides on one of two classes, so the
**theme token** drives it and no colour is hardcoded anywhere in the file:

| class | resolves to | used for |
|---|---|---|
| `ox-icon__accent` | `fill: var(--ox-icon-mono, var(--ox-accent))` | a filled brand part, the bolt's lower half, the video play triangle, the chip on the card, the keyhole |
| `ox-icon__accent ox-icon__accent--stroke` | `stroke: var(--ox-accent)` | a coloured line, the pulse in the heart, the check in the shield, the recovery arrow, the ribbon on the gift |

Both already exist in `app/styles/06-ox/_primitives.scss`; this batch added no
CSS to the stylesheet.

**"Do not place a tiny orange slash inside every icon."** 49 of the 88 standard
symbols carry an accent, 39 are pure mono, every chevron, the magnifier, the
bust, the menu, the house, the grid, the envelope, the clock. Where the accent
appears it is a *part of the object*, never a sticker.

**A colour note for the owner.** The reference sheets render the accent as
**#F15C22**. The theme's live token is `--ox-accent` → `--color-primary` →
**#EE4D22** in `tokens.css` (the dashboard is the source of truth). Nothing is
hardcoded here, so the icons take whatever the token says, but the two values
are not the same orange, and if the reference sheet's #F15C22 is the intended
brand colour, that is a change to `--color-primary` in the Salla dashboard plus
`tokens.css`, not to the sprite. Flagged, not decided.

### 1.5 Two optical variants, not one scaled drawing

Per the brief: "produce simplified optical variants for 16/20px and standard
variants for 24/32/36px rather than mechanically scaling detailed SVGs."

- **Standard** symbol: `#ox-{name}`, used at 24, 32, 36.
- **Simplified twin**: `#ox-{name}-s`, used at 20 and 16, fewer parts, fatter
  counters, the accent kept only where it still reads (the amino-acid chain
  loses its fourth node and its bond stub; the tub loses its neck ring; the
  points star drops its outline and becomes one solid accent).

`Icon.tsx` rewrites the `href` when `size <= 20` **and** the twin exists;
everything else falls back to its standard drawing, which is already simple
enough at 16 (a chevron, a plus, a magnifier). **24 twins** ship, for the ten
product types, the six goals, and the eight most detailed trust/service/
commerce symbols.

The `<style>` block inside the sprite carries the rest of the ladder:

```css
.ox-sym      { stroke-width: var(--ox-icon-stroke, 2px); }
.ox-icon--16 { --ox-icon-stroke: 2.25px; }
```

`class="ox-sym"` rides on every `<symbol>`. A **simple** class selector does
reach into the `<use>` shadow tree (`.ox-icon__accent` already relies on that);
a *descendant* selector does not, which is why the size condition rides in on
an inherited custom property set on `.ox-icon--16`, a class `Icon.tsx` already
emits. The `stroke-width="2"` presentation attribute stays on every symbol as
the no-CSS floor.

### 1.6 RTL

Brand geometry is preserved in both directions. Exactly **five** symbols carry
`data-mirror="1"` and are the only ones `Icon.tsx` flips (by adding the theme's
existing `.ox-mirror` class, not a new transform):

`chevron-start`, `chevron-end`, `arrow`, `external`, `play`.

`chevron-down` and `chevron-up` are vertical and do not mirror. **`ox-mark`
never mirrors**, and neither does any chamfer, tub foot or brand cut, the test
asserts the mark carries no `data-mirror`.

### 1.7 Optical weight

Ink area = Σ(stroked length × 2) + accent area, per family (§7).

The **±15 % of the family median** target from the earlier brief is reported
but no longer enforced, and that is a deliberate consequence of the owner's
direction: the reference sheets themselves put a three-rule menu beside a
molecular structure and a chevron beside a shopping cart. Figurative icons of
genuinely different topology cannot share an ink budget without being distorted
back into the abstract set the owner rejected. What *is* enforced is the thing
that actually governs how a family reads together: the same 2-unit stroke, the
same optical bounds, the same terminals, the same chamfer vocabulary.

---

## 2. What changed in the files

| File | Why |
|---|---|
| `app/assets/ox-sprite.svg` | the whole set rebuilt to the reference; 53 → **108 symbols** (92 standard + 16 simplified twins); stroke 2 on each symbol; size-ladder `<style>`; `data-mirror` on the five directional glyphs |
| `app/components/common/Icon.tsx` | `OX_SIMPLIFIED_ICON_NAMES`, `OX_SIMPLIFIED_MAX_SIZE`, `OX_MIRRORED_ICON_NAMES`; the component now picks the `-s` twin at ≤ 20 and adds `.ox-mirror` on directional names |
| `app/components/common/KitchenSink.tsx` | the contact sheet: both review grounds side by side, every symbol at 36/32/24 and 20/16, id under each, a dedicated 16 px legibility row per ground |
| `tests/common/sprite.test.ts` | rewritten to the new contract (§6) |
| `docs/build/progress/S6a.md` | this file |

`app/components/common/Sprite.tsx` is unchanged: it already inlines the file
verbatim. No stylesheet, no component outside `common/`, and no `sicon-*` call
site was touched, five other builders hold those files.

---

## 3. The three families, and what each symbol became

### 3.1 Product categories

| id | metaphor | accent |
|---|---|---|
| `protein` | tub, cap, neck ring, chamfered foot | the X on the label, drawn as the mark's steep+shallow cross |
| `creatine` | tub with a scoop beside it | the powder in the scoop |
| `pre-workout` | tub with a bolt through the label | the bolt |
| `amino-acids` | four-node molecular structure with bonds | the central bond block |
| `omega-3` | two-chamber capsule with a droplet | the droplet |
| `vitamins-minerals` | capsule with a health cross | the cross |
| `collagen-beauty` | hair-and-profile silhouette with a spark | the spark |
| `daily-health` | shield with a pulse line | the pulse |
| `snacks-bars` | wrapped bar on the signature lean | the bar inside the wrapper |
| `accessories` | shaker with lid, collar and mesh band | the band |

### 3.2 Goals and benefits

`goal-energy` bolt, the lower half in accent · `goal-performance` flexed arm
with an accent cuff · `goal-recovery` two-arrow recovery cycle, the return arc
in accent · `goal-ideal-weight` waist silhouette with an accent measure ·
`goal-general-health` heart with an accent pulse · `goal-hair-skin` twin
strands with an accent spark.

### 3.3 Service and trust

`shield-check` (verification shield + accent check) · `authentic` (14-point
seal + accent check) · `expiry` (calendar + accent date) · `secure-payment`
(card + accent magnetic stripe) · `truck` + `shipping` (box truck with wheels;
parcel) · `lock` (padlock + accent keyhole) · `badge` (medal + ribbons) ·
`registry` (certificate + accent seal) · `written-question` (chat bubble +
three accent dots) · `video-consult` (screen + accent play) · `branch-visit`
(map pin + accent dot) · `training` (dumbbell + accent grip) · `plan`
(clipboard/document + accent rules) · `headset` / `help` (headset, one ear cup
in accent) · `whatsapp` (bubble + accent handset).

### 3.4 Universal UI, conventional on purpose

`cart` (basket + handle + accent wheels) · `heart` · `user` · `search` ·
`menu` · `home` · `store` (bag + accent handle) · `map-pin` · `phone` ·
`mail` · `calendar` · `clock` · `globe` · `grid` · `list` · `filter` ·
`sort` · `play` / `pause` · `external` · `expand` · `info` · `warning`
(accent bang) · `check-circle` (accent check) · `document` · `archive` ·
`rotate` · `star` · the four `chevron-*` · `arrow` · `close` · `check` ·
`plus` / `minus` · `points` (accent star) · `gift` (accent ribbon) ·
`bundles` · `digital-library` (accent bookmark) · `referral` · `servings` /
`serving-size` / `scoop-cup` / `shaker` / `shaker-straw` / `form` ·
`vegan-leaf` / `low-sugar` / `gluten-free` · `tick` · `bolt` · `cart-add`
(cart + accent plus) · `mark`.

Nothing in this family had its metaphor changed. A magnifier is a circle and a
handle; a cart is a basket on two wheels.

---

## 4. The inventory, with usage sites

Counted across `app/**` on 2026-09-23. Every id in the previous sprite survives,
so no call site broke. "-" means drawn but not yet called (it exists so a later
batch can retire a `sicon-*`).

**Brand family (45 ids).** `protein` (26 refs, taxonomy, type tiles,
`OxCategories`, `MegaPanel`, `ShopSheet`, `useTaxonomyLinks`) · `creatine` (12)
· `pre-workout` (9) · `amino-acids` (6) · `omega-3` (6) ·
`vitamins-minerals` (7) · `collagen-beauty` (5) · `daily-health` (6) ·
`snacks-bars` (6, + `content/posters.ts`) · `accessories` (5) ·
`goal-energy` (6) · `goal-general-health` (4) · `goal-performance` (10) ·
`goal-recovery` (4) · `goal-hair-skin` (4) · `goal-ideal-weight` (5) -
all from `content/goals.ts`, `OxGoals`, `MegaPanel`, posters ·
`shield-check` (2, `Header/UtilityTrust`, `BuyZone/TrustGrid`) · `truck` (9,
`UtilityTrust`, `TrustGrid`, `DeliveryPromise` ×4, common KitchenSink) ·
`lock`, · `badge`, · `secure-payment` (3) · `expiry` (8) · `tick` (7) ·
`written-question` (7) · `video-consult` (4) · `branch-visit` (9) ·
`training`, · `plan` (8) · `headset` (6) · `help` (1, legacy) ·
`authentic` (4, legacy) · `shipping` (7, legacy) · `servings` (9) ·
`serving-size` (4) · `form` (5) · `points` (4) · `gift` (4) · `referral` (1) ·
`bundles` (1) · `digital-library` (2) · `bolt`, · `cart` (9) · `cart-add`, ·
`plus` (4) · `minus` (2).

**UI family (43 ids).** `whatsapp` (8) · `registry` (3) · `vegan-leaf` (6) ·
`low-sugar` (3) · `gluten-free` (3) · `scoop-cup` / `shaker` /
`shaker-straw` (`BelowFold/HowToUse`) · `star` (4, `RatingRow`,
`StoreRating`) · `expand`, · `chevron-down` (6, legacy: `NavBar` ×2,
`CountryControl`, `FooterColumns`, `PdpThumbRail`, `NutritionTable`) ·
`mark` (3, `XMark`, `PlanCard`) · and the 31 chrome symbols drawn for §5's
swap and not yet wired: `chevron-up`, `chevron-start`, `chevron-end`, `arrow`,
`close`, `check`, `search`, `user`, `heart`, `home`, `menu`, `list`, `grid`,
`filter`, `sort`, `play`, `pause`, `external`, `info`, `warning`, `globe`,
`store`, `rotate`, `document`, `archive`, `check-circle`, `clock`, `calendar`,
`mail`, `phone`, `map-pin`.

---

## 5. The `sicon-*` swap list for the next batch

Every `sicon-*` still in `app/**`, with the symbol now drawn for it. **This
batch changed none of these call sites.** Each row is a one-line edit:
`<i className="sicon-x" />` → `<Icon name="y" size={n} />`.

| `sicon-*` | n | call sites | swap to |
|---|---|---|---|
| `sicon-keyboard_arrow_down` | 1 | `common/Accordion.tsx:90` | `chevron-down` |
| `sicon-keyboard_arrow_right` | ~27 | `common/SectionHeader.tsx:60`, `home/CategoryTile.tsx:100`, `home/GoalCard.tsx:63`, and the rest of the 30 `sicon-keyboard*` refs | `chevron-end` (mirrors automatically) |
| `sicon-keyboard_arrow_left` | 1 | `brands/BrandExplore.tsx:88` | `chevron-start` |
| `sicon-heart` | 6 | `MainBar:108`, `MobileDrawer:136`, `PdpGallery:111`, `WishlistShare:28`, `OxProductCard:238`, `buttons.scss:98` | `heart` |
| `sicon-cancel` | 5 | `AddProductToast:300`, `Chip:87`, `MobileDrawer:160`, `MobileHeader:51`, `ShopSheet:87` | `close` |
| `sicon-whatsapp` | 3 | `OxBranch:148`, `MobileDrawer:237`, `ContactRow:59` | `whatsapp` |
| `sicon-user` | 2 | `MobileDrawer:135`, `BottomTabBar:146` | `user` |
| `sicon-menu` | 2 | `MobileHeader:51`, `header.scss:208` | `menu` |
| `sicon-search` | 1 | `BottomTabBar:117` | `search` |
| `sicon-home` | 1 | `BottomTabBar:91` | `home` |
| `sicon-grid` | 1 | `BottomTabBar:107` | `grid` |
| `sicon-store` | 1 | `Header/UtilityBar:33` | `store` |
| `sicon-globe` | 1 | `Header/LocalizationButton:43` | `globe` |
| `sicon-filter` | 1 | `listing/ListingToolbar:82` | `filter` |
| `sicon-phone` | 1 | `MobileDrawer:243` | `phone` |
| `sicon-play` / `sicon-pause` | 2 | `home/OxHero:289` | `play` / `pause` |
| `sicon-rotate` | 1 | `DigitalFilesSettings:66` | `rotate` |
| `sicon-page` | 1 | `DigitalFilesSettings:35` | `document` |
| `sicon-file-archive` | 1 | `DigitalFilesSettings:45` | `archive` |
| `sicon-calendar` | 1 | `DigitalFilesSettings:55` | `calendar` |
| `sicon-check-circle` | 1 | `DigitalFilesSettings:72` | `check-circle` |
| `sicon-shopping-bag` | 0 | named only in comments (`MainBar`, `MobileHeader`, `BottomTabBar` explain why they draw instead) | already `cart` |
| **`sicon-sar`** | **9** | `common/Price.tsx`, `_b3-product.scss`, `_b4-listing.scss`, `_primitives.scss`, `header.scss` | **keep.** Not redrawn, deliberately: the riyal is a typographic currency mark Salla's own price component sets, and DIRECTION 3.3 requires our markup to match that component's glyph and order. Redrawing it would make our prices disagree with every engine-rendered price on the same page |

When the swap lands, the chrome icons that today draw at `sicon` sizes should
pass `size={20}` or `size={16}` in the tab bar and chips so the simplified
twins engage.

---

## 6. The tests

`tests/common/sprite.test.ts`, 17 assertions:

- 92 standard symbols + 16 twins, 108 unique ids, in lockstep with
  `OX_ICON_NAMES`
- **the twin set equals `OX_SIMPLIFIED_ICON_NAMES`** and every twin sits over a
  real standard symbol (a name Icon.tsx simplifies with no `-s` in the sprite
  would be a broken `<use>` at 16 and 20)
- **`data-mirror="1"` marks exactly `OX_MIRRORED_ICON_NAMES`**, and `ox-mark`
  carries none
- at least 30 % of the set is monochrome ("do not place a tiny orange slash
  inside every icon")
- the accent is painted only through the two accent classes, and **no literal
  colour appears in the file**, the token drives it
- `fill`, `stroke`, `stroke-width="2"`, `stroke-miterlimit="4"` and
  `class="ox-sym"` on every drawn symbol
- **`stroke-linecap="square"` and `stroke-linejoin="miter"` on every symbol**
- no `linecap="round"`, no `linejoin="round"`, no `bevel`, no `rx`/`ry`
- both size-ladder rules present in the inlined `<style>`
- `viewBox="0 0 24 24"` everywhere; no `transform`; no primitive shape element
- **no 45° edge** outside the three conventional UI glyphs
- **> 60 % of straight edges on the mark's 0/34/56/90 lattice** (actual: 71 %)
- **every drawn point inside `[2, 22]`**, arcs and cubics are sampled through
  a real endpoint-to-centre arc parameterisation, not approximated by their
  chord, so a lobe that bulges past the optical bounds is caught
- the optical-bounds rule: the object reaches within 1.25 of the inset on ≥ 2
  sides
- the file stays under 52 KB
- (unchanged) no `<path d="…">` anywhere in `app/**.tsx` outside `Icon.tsx` and
  the `PdpIcon.tsx` legacy shim

---

## 7. Ink-area table

Ink = Σ(stroked length × 2) + accent area, grid units². `dev` is against the
symbol's own family median. Reported, not enforced (§1.7).

| Family | n | median | spread |
|---|---|---|---|
| type | 10 | 168.4 | 114.0, 221.5 |
| goal | 6 | 128.3 | 83.3, 151.2 |
| trust | 9 | 174.7 | 142.6, 205.5 |
| service | 8 | 150.6 | 127.2, 190.4 |
| catalogue | 15 | 139.5 | 90.0, 233.3 |
| commerce | 3 | 167.0 | 151.5, 195.1 |
| chrome | 21 | 137.7 | 100.0, 208.0 |
| mark (linear glyphs) | 15 | 72.0 | 36.0, 176.0 |
| simplified twins | 24 | 153.1 | 99.6, 228.4 |

Per symbol (standard set; `id ink dev`):

```
protein 202.4 +20.2   creatine 185.9 +10.4   pre-workout 210.9 +25.2
amino-acids 168.1 -0.2  omega-3 132.8 -21.2  vitamins-minerals 139.5 -17.2
collagen-beauty 114.0 -32.3  daily-health 168.8 +0.2  snacks-bars 129.3 -23.2
accessories 221.5 +31.5  goal-energy 83.3 -35.1  goal-performance 151.2 +17.8
goal-recovery 119.0 -7.3  goal-ideal-weight 103.3 -19.5
goal-general-health 137.7 +7.3  goal-hair-skin 139.8 +8.9
shield-check 157.5 -9.8  authentic 142.6 -18.4  expiry 188.8 +8.1
secure-payment 179.1 +2.5  truck 205.5 +17.6  shipping 174.7 0.0
lock 153.2 -12.3  badge 151.5 -13.3  registry 180.8 +3.5
written-question 151.8 +0.8  video-consult 158.1 +5.0  branch-visit 127.2 -15.5
training 189.0 +25.5  plan 190.4 +26.4  headset 138.2 -8.2  help 138.2 -8.2
whatsapp 149.4 -0.8  servings 116.3 -16.6  serving-size 95.2 -31.8
form 134.4 -3.7  points 162.4 +16.4  gift 233.3 +67.2  referral 127.0 -9.0
bundles 194.5 +39.4  digital-library 222.1 +59.2  bolt 124.1 -11.0
scoop-cup 90.0 -35.5  shaker 189.5 +35.8  shaker-straw 142.9 +2.4
vegan-leaf 135.5 -2.9  low-sugar 167.9 +20.4  gluten-free 139.5 0.0
tick 51.1 -29.0  cart 167.0 0.0  cart-add 195.1 +16.8  store 151.5 -9.3
plus 72.0 0.0  minus 36.0 -50.0  search 107.5 -21.9  user 116.8 -15.2
heart 100.0 -27.4  home 117.7 -14.5  menu 108.0 +50.0  list 90.0 +25.0
grid 208.0 +51.1  filter 123.4 -10.4  sort 100.0 +38.9  play 109.0 -20.8
pause 176.0 +144.4  external 157.7 +14.5  expand 96.0 +33.3  info 134.3 -2.5
warning 133.6 -3.0  globe 203.2 +47.6  rotate 119.0 -13.6  document 181.9 +32.1
archive 182.0 +32.2  check-circle 148.4 +7.8  clock 142.3 +3.3
calendar 178.3 +29.5  mail 181.7 +32.0  phone 137.7 0.0  map-pin 136.7 -0.7
star 139.5 +1.3  chevron-down/up/start/end 46.6 -35.3  arrow 80.4 +11.7
close 86.9 +20.7  check 51.1 -29.0  mark 260.5 (exempt)
```

---

## 8. Deviations, and why

1. **The ±15 % optical-weight rule is reported, not enforced** (§1.7). It is
   incompatible with the owner's figurative direction and with his own
   reference sheets, which put a chevron beside a molecular structure.
2. **`stroke-width` is 2, not 2.25**, per the owner's brief. The 16 px step
   takes 2.25 through the sprite's `<style>` so the glyph holds.
3. **45° survives in three universal glyphs**, the magnifier handle and the
   two arrowheads, because the brief requires the universal set to stay
   conventional. Named exceptions in the test.
4. **`sicon-sar` is not redrawn** (§5, last row).
5. **The accent token is #EE4D22, the reference renders #F15C22** (§1.4). The
   sprite hardcodes neither; the owner's call.
6. **The 16 px stroke bump ships as CSS inside the sprite**, not in
   `_primitives.scss`, because `app/styles/**` is outside this batch's edit
   scope. One line there would be the tidier home for it.
7. **`_primitives.scss:392` `vector-effect: non-scaling-stroke` is dead code**
   on `.ox-icon` (not an inherited property, never crosses the `<use>`
   boundary). Not removed, another builder owns the file. Follow-up.
8. **`Icon.tsx` gained logic**, not only type-union additions: the `-s`
   selection and the `.ox-mirror` class. The coordinator's implementation notes
   authorise this and it is the only way the two optical variants and RTL
   mirroring can work without changing the architecture.
9. **The sprite is 41.3 KB raw** (≈ 6 KB gzipped), inlined on every route, up
   from 14.5 KB. That is 112 drawn symbols at 2 units instead of 53 hairline
   outlines. Test ceiling moved to 48 KB.
10. **No component was migrated off `sicon-*`**, forbidden by the brief; §5 is
    the hand-off.
11. **The four reference-only goals are now drawn**, `endurance`, `immunity`,
    `wellness`, `better-sleep` (owner: "the owner wants the set as drawn").
    `wishlist` was not added: it is `heart`, which already exists.
12. **The ten product categories are the pre-redraw originals**, restored on
    the owner's ruling and exempt from the new system's drawing assertions -
    §10.

---

## 9. Verification

```
$ pnpm typecheck
$ tsc --noEmit
(no output, no errors anywhere in the tree, including files other builders hold)

$ pnpm vitest run tests/common
 ✓ tests/common/xmark.test.ts (6 tests)
 ✓ tests/common/sprite.test.ts (18 tests)
 ✓ tests/common/primitives.test.tsx (14 tests)
 Test Files  3 passed (3)
      Tests  38 passed (38)

$ pnpm check:rtl && pnpm check:motion && pnpm check:strings && node scripts/check-tokens.mjs && node scripts/check-identity.mjs
check-rtl: 327 file(s), 0 problem(s)
check-motion: 327 file(s), 0 problem(s)
check-strings: 324 file(s), 0 problem(s)
check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
check-identity: 327 file(s), 0 problem(s)
```

Sprite geometry audit (the script the test suite mirrors; it lives in this
session's scratchpad because `scripts/` is outside the batch's edit scope):

```
symbols: 108 (92 standard + 16 simplified twins)
straight segments on the 0/34/56/90 lattice: 531/824 (64%), 45deg: 0 by test
bytes: 39112
accent: 51 symbols carry one, 45 carry none
findings: 0
```

Contact sheet, rendered:

```
$ curl -s http://localhost:3210/ar/kitchen-sink
http=200 bytes=646619
sprite: 92 standard + 16 twins
symbol defs missing from route html: 0
standard <use> refs missing: 0
twin <use> refs missing: 0
total <use> refs rendered: 1258
category originals verbatim in html: 10 of 10
size ladder inlined: true
ox-mirror instances: 63
round caps/joins: false
both grounds: true | 16px legibility rows: 2
```

The family was also rendered standalone in headless Chrome in the reference
sheet's own layout and grouping, on `#F7F8F6` and `#0B0D0F` at 36 and at 16,
and compared symbol by symbol against `50.png`/`51.png`. That comparison is
§11.

---

## 10. The category restoration (owner ruling, 2026-09-24)

> "the icons in shop by category were fine, they just got ruined."

The ten product-category symbols, `protein`, `creatine`, `pre-workout`,
`amino-acids`, `omega-3`, `vitamins-minerals`, `collagen-beauty`,
`daily-health`, `snacks-bars`, `accessories`, are restored **byte for byte**
from the pre-redraw sprite (git `3f952b3`). Verified: all ten symbol elements
in the shipped file are string-identical to the extract, and all ten appear
verbatim in the rendered route HTML.

**They carry no `stroke-width`, and that is the point.** The coordinator asked
me to set the painted width explicitly. I checked what actually painted at
`3f952b3` and it is not one number:

| where | rule | painted width |
|---|---|---|
| home tiles, goal cards, mega panel, shop sheet, drawer | `.ox-icon` sets no `stroke-width` | SVG's initial **1** |
| categories index card | `.ox-cat-card__icon { stroke-width: 1.25 }` (`_b4-listing.scss:2685`) | **1.25**, inherited |

A presentation attribute on the symbol beats an inherited CSS value, so
writing *any* number onto these ten would have silently changed the categories
index from 1.25 to that number. Verbatim, no `stroke-width`, no
`class="ox-sym"`, is the only restoration that paints identically in **both**
places. Leaving them off `ox-sym` also keeps the new size-ladder rule from
reaching them.

Their simplified twins were **deleted**, so `Icon.tsx` falls through to the
standard symbol at 16 and 20 as well: one original drawing at every size.

`tests/common/sprite.test.ts` names them in `OWNER_APPROVED_ORIGINALS` and
exempts them from the drawing assertions only, the stroke contract, the
caps/joins, the 45° rule, the lattice share, the live area and the fill-the-box
rule. They are still required to be declared, unique, on the 24 grid,
transform-free, free of literal colour and to paint their accent through
`ox-icon__accent`. A new assertion pins the allowlist itself: the only symbols
in the file without `class="ox-sym"` are those ten plus `ox-mark`, and none of
them may grow a twin.

---

## 11. Fidelity pass against the owner's reference sheets

Method: the family was rendered standalone in headless Chrome in the reference
sheet's own layout, grouping and label style, on both grounds at 36 and 16
(`--ox-accent` set to the reference's `#F15C22` so the comparison is like for
like), then read against `50.png` and `51.png` symbol by symbol.

### 11.1 Product categories, exempt

All ten are the owner-approved originals (§10). Not compared, not changed.

### 11.2 Goals and benefits

| symbol | verdict | what differed, and the fix |
|---|---|---|
| `goal-energy` | **fixed** | was a thin zig-zag of two parallelograms; now an actual lightning bolt, `M14.5 2L5.5 13.5H11L9.5 22L18.5 10.5H13Z`, with its **lower half filled in the accent** as the reference splits it |
| `goal-performance` | **fixed** | was a gauge/velocity abstraction with an accent slab; now a **flexed arm**, bicep bulge, forearm, fist cuff and wrist bar, mono like the reference |
| `goal-recovery` | matches | two-arc recovery cycle with filled arrowheads, return arc in accent |
| `goal-ideal-weight` | **fixed** | the two sides barely bowed and read as brackets; the curves now pinch at the waist and the accent band sits across it |
| `goal-general-health` | matches | heart with the accent pulse |
| `goal-hair-skin` | matches | strands with the accent spark |
| `endurance` | **added** | running figure: head, torso, both arms, both legs |
| `immunity` | **added** | shield with the accent check |
| `wellness` | **added** | three-petal lotus, the outer two in the accent |
| `better-sleep` | **added** | crescent with two zeds |

### 11.3 Shop and UX

| symbol | verdict | note |
|---|---|---|
| `cart` | matches | basket, handle bar, two accent wheels |
| `heart` `user` `search` `menu` `home` | matches | conventional forms, mono |
| `store` | matches | bag with the accent handle |
| `branch-visit` | matches | pin with the accent dot |
| `help` | matches | headset, one ear cup in the accent |
| `written-question` | matches | chat bubble with three accent dots |
| `video-consult` | matches | screen with the accent play triangle |
| `gift` | **fixed** | the bow was two accent strokes crossing the lid; it is now a filled two-loop bow on top with the ribbon mono, as drawn |
| `points` | **fixed** | had become one solid accent star; restored to the reference's **star inside a star**, mono outline, accent star within |

### 11.4 Service and trust

| symbol | verdict | note |
|---|---|---|
| `shipping` | **fixed** | was an isometric parcel; the reference's `shipping` is the **box truck with two accent speed lines**, which is what it draws now (`truck` keeps the plain truck) |
| `secure-payment` | **fixed** | the accent was a full-width stripe; now a **solid mono magnetic stripe** with the accent as the small chip, as drawn |
| `authentic` | matches | scalloped seal with the accent check |
| `expiry` | matches | calendar with the accent date |
| `training` | **fixed** | had an accent grip; the reference's dumbbell is **mono**, so the accent was removed and the bar drawn through |
| `servings` | matches | scoop with the accent powder |
| `serving-size` | matches | open measure with a handle |
| `plan` | matches | document with a folded corner and accent rules |
| `digital-library` | matches | open book with the accent bookmark |
| `phone` `mail` `lock` | matches | handset, envelope, padlock with the accent keyhole |
| `map-pin` | **fixed** | the inner circle was mono; it is the **accent dot** in the reference |

### 11.5 Not in the reference, left as drawn

`bolt`, `cart-add`, `plus`, `minus`, `tick`, `check`, `close`, the four
chevrons, `arrow`, `external`, `expand`, `filter`, `sort`, `grid`, `list`,
`play`, `pause`, `info`, `warning`, `globe`, `rotate`, `document`, `archive`,
`check-circle`, `clock`, `calendar`, `star`, `registry`, `badge`, `referral`,
`bundles`, `form`, `scoop-cup`, `shaker`, `shaker-straw`, `vegan-leaf`,
`low-sugar`, `gluten-free`, `whatsapp`, `headset`, `shield-check`, `truck`,
`mark`. These have no twin on the contact sheets; they follow the same system
and were not touched in this pass.

### 11.6 One that is close, not identical

`goal-performance`. The reference's arm has a little more taper from shoulder
to wrist than mine does. It reads as a flexed arm at 36, 24 and 16 and it is
mono like the reference, but it is a redraw of the idea rather than a trace.
Flagged rather than claimed.
