# S8b — the owner's icon system, applied globally

Builder S8b, 2026-09-24. The owner delivered the official Optimal X icon
system in `optimal-x-icons/` (`README.md`, `icons.json`, `sprite.svg`,
`svg/*.svg`, `ox-icons.css`, `shopify/snippets/ox-icon.liquid`) with the
instruction: **"apply it globally."** It is read-only input — nothing in it
is redrawn or "improved" — and becomes the sprite of record for the 47 names
it covers. This batch built the generator that imports it,
`scripts/import-owner-icons.mjs`, ran it, and updated everything that reads
the sprite's contract.

---

## 1. What changed, in one paragraph

`app/assets/ox-sprite.svg` went from 108 symbols (92 standard + 16 simplified
twins, all ours) to 95 (94 standard + 1 twin): the owner's 47 drawings, 4
aliases that copy one of those 47 under a name our components already call,
and 43 symbols the owner's set does not cover, carried forward unchanged. The
file shrank — 41,588 → 33,266 bytes — mostly because 15 of the 16 old twins
went away (the owner ships one drawing per icon; only `whatsapp` still has a
simplified twin). `Icon.tsx`'s public API (`Icon`, `OxIconName`, `size`,
`label`) did not change; no component was touched.

---

## 2. The generator

`scripts/import-owner-icons.mjs` (Node only, `export`-ed pure functions,
tested in `tests/scripts/import-owner-icons.test.ts`). Run it whenever the
owner updates `optimal-x-icons/`:

```
node scripts/import-owner-icons.mjs
```

Per owner SVG (`optimal-x-icons/icons.json` drives the loop):

1. **Strip.** The `<metadata><c2pa:manifest>…</c2pa:manifest></metadata>`
   blob (hundreds of KB of base64 per file) and the `xmlns:c2pa` attribute
   are removed entirely. Verified: `grep -c "<metadata"` and `grep -c "c2pa"`
   on the built sprite both return 0.
2. **Take the children.** The root `<svg>`'s attributes are discarded; only
   its child elements survive, wrapped in our own `<symbol>` shell:
   `<symbol id="ox-{name}" viewBox="0 0 24 24" class="ox-sym" fill="none"
   stroke="currentColor" stroke-width="2" stroke-linecap="square"
   stroke-linejoin="miter" stroke-miterlimit="4">…</symbol>`.
3. **Convert the accent.** The owner's two inline-style accent forms become
   our classes:
   - `style="stroke:var(--ox-accent,#FF4A1A)"` → `class="ox-icon__accent
     ox-icon__accent--stroke"`.
   - `style="fill:var(--ox-accent,#FF4A1A);stroke:none"` **and**
     `style="fill:var(--ox-accent,#FF4A1A)"` (two files, `goal-energy` and
     `points`, omit the explicit `;stroke:none` but mean the same thing — the
     element's whole paint is the accent) both become `class="ox-icon__accent"
     stroke="none"`. `_primitives.scss`'s `.ox-icon__accent` already sets
     `stroke: none`, so the explicit attribute is redundant with the
     stylesheet and correct before it loads either way. **This is the one
     place the generator reads two source forms as one case rather than
     verbatim per the brief's two named patterns** — flagged in §7.
   - Any other inline style is converted to presentation attributes
     (`prop:value` → `prop="value"`); none occurred in the 47 files (only the
     three forms above exist — verified by grepping every `style="…"` in
     `optimal-x-icons/svg/*.svg`), so this path is defensive, exercised only
     by its unit test.
   - The generator **throws** rather than ship a literal colour: every
     rendered symbol is scanned for `#[0-9a-fA-F]{3,6}` before it is written.
4. **Self-close.** The owner writes empty elements as `<path d="…"></path>`;
   our sprite convention, and `scripts/gen-icon-mask.mjs`'s `<path…/>`
   matcher, both expect `<path…/>`. `<path>`, `<circle>` and `<rect>` are
   self-closed; `<g transform="…">` (three icons: `omega-3`,
   `vitamins-minerals`, `snacks-bars`) is left alone since it has children.
   Geometry is untouched — this is a tag-syntax normalisation only.
5. **Mirror.** `data-mirror="1"` is added when `icons.json`'s `rtlFlip` is
   `true` for that icon (or, for an alias, for its source icon).

**`<circle>`, `<rect>` and `<g transform>` are kept exactly as the owner drew
them** — nothing in this pipeline touches geometry, only metadata, style
syntax and tag closing.

**The four aliases** (`ALIASES` in the script) are a byte-for-byte copy of an
owner symbol under a name our components already call:

| our id | copies owner's | verified against |
|---|---|---|
| `ox-heart` | `wishlist` | `heart` callers are wishlist/favourite actions (`MainBar`, `WishlistShare`, `OxProductCard`, `PdpGallery`) — same concept as the owner's `wishlist` |
| `ox-headset` | `help` | the owner's `help` SVG is a headset drawing (two ear cups, a curved band); our `headset` callers (`KitchenSink`, `ZeroResults`, `ContactPage`) are all "talk to support" |
| `ox-truck` | `shipping` | the owner's `shipping` SVG is a box truck; `truck` callers (`UtilityTrust`, `TrustGrid`, `DeliveryPromise`) all mean "we ship" |
| `ox-shield-check` | `authentic` | **checked, not assumed**: both `shield-check` call sites (`Header/UtilityTrust.tsx:26`, `product/BuyZone/TrustGrid.tsx:70`) key the trust item `'authentic'` with label `ox.trust.authentic_short` — they mean authenticity/genuineness, not a generic "verified/secure" badge, so `authentic`'s 14-point seal + accent check is the right source |

**Carry-forward.** Every symbol the sprite already on disk declares, whose
base name (strip `ox-` and a trailing `-s`) is neither one of the owner's 47
names nor one of the four alias ids, is copied verbatim — full
`<symbol>…</symbol>` markup, byte for byte — into the new file. This is what
makes two runs idempotent without a second input file: the owner-derived
symbols are a pure function of `optimal-x-icons/svg/*.svg` (untouched,
read-only), and the carried-forward symbols are copied from whatever the
previous run wrote, so nothing drifts. Verified in
`tests/scripts/import-owner-icons.test.ts` by running `generate()` twice and
diffing bytes, and by hand:

```
$ node scripts/import-owner-icons.mjs   # wrote 33266 bytes
$ node scripts/import-owner-icons.mjs   # ran again
$ diff <run 1 output> <run 2 output>    # identical
```

---

## 3. The mapping table

### 3.1 Product categories (10) — the owner's newest delivery supersedes the pre-redraw restoration

All ten replace the S6a/S10 "restored verbatim, no `class=ox-sym`" originals
(git `3f952b3`). They now carry the full stroke contract like every other
symbol — that old exemption is retired (`tests/common/sprite.test.ts` no
longer has an `OWNER_APPROVED_ORIGINALS` allowlist).

| owner name | our id | consumers (S6a count, 2026-09-23, not re-counted) |
|---|---|---|
| `protein` | `ox-protein` | 26 — taxonomy, type tiles, `OxCategories`, `MegaPanel`, `ShopSheet` |
| `creatine` | `ox-creatine` | 12 |
| `pre-workout` | `ox-pre-workout` | 9 |
| `amino-acids` | `ox-amino-acids` | 6 |
| `omega-3` | `ox-omega-3` | 6 |
| `vitamins-minerals` | `ox-vitamins-minerals` | 7 |
| `collagen-beauty` | `ox-collagen-beauty` | 5 |
| `daily-health` | `ox-daily-health` | 6 |
| `snacks-bars` | `ox-snacks-bars` | 6, + `content/posters.ts` |
| `accessories` | `ox-accessories` | 5 |

### 3.2 Goals and benefits (10)

| owner name | our id | consumers |
|---|---|---|
| `goal-energy` | `ox-goal-energy` | 6 — `content/goals.ts`, `OxGoals`, `MegaPanel`, posters |
| `goal-performance` | `ox-goal-performance` | 10 |
| `goal-recovery` | `ox-goal-recovery` | 4 |
| `goal-ideal-weight` | `ox-goal-ideal-weight` | 5 |
| `goal-general-health` | `ox-goal-general-health` | 4 |
| `goal-hair-skin` | `ox-goal-hair-skin` | 4 |
| `endurance` | `ox-endurance` | drawn, no caller yet (S6a fidelity pass) |
| `immunity` | `ox-immunity` | drawn, no caller yet |
| `wellness` | `ox-wellness` | drawn, no caller yet |
| `better-sleep` | `ox-better-sleep` | drawn, no caller yet |

### 3.3 Shop and UX (14)

| owner name | our id | consumers |
|---|---|---|
| `cart` | `ox-cart` | 9, + `--ox-cart-glyph` mask (`gen-icon-mask.mjs`) |
| `wishlist` | `ox-wishlist` (new) | none yet — `heart` already covers wishlist actions; the owner's own drawing ships under its own id for a future caller |
| `user` | `ox-user` | chrome, not yet wired (S6a §5 swap list) |
| `search` | `ox-search` | chrome, not yet wired |
| `menu` | `ox-menu` | chrome, not yet wired |
| `home` | `ox-home` | chrome, not yet wired |
| `store` | `ox-store` | 1, `Header/UtilityBar` |
| `branch-visit` | `ox-branch-visit` | 9 |
| `help` | `ox-help` | 1, legacy (`ZeroResults`, `account.notifications`) |
| `written-question` | `ox-written-question` | 7 |
| `video-consult` | `ox-video-consult` | 4 |
| `offers` | `ox-offers` (new) | none yet — **follow-up**: the nav item العروض (`NavBar`/`MegaPanel`) and the offers page heading are candidates, not edited by this batch |
| `gift` | `ox-gift` | 4 |
| `points` | `ox-points` | 4 |

### 3.4 Service and trust (13)

| owner name | our id | consumers |
|---|---|---|
| `shipping` | `ox-shipping` | 7, legacy |
| `secure-payment` | `ox-secure-payment` | 3 |
| `authentic` | `ox-authentic` | 4, legacy |
| `expiry` | `ox-expiry` | 8 |
| `training` | `ox-training` | drawn, no caller yet |
| `servings` | `ox-servings` | 9 |
| `serving-size` | `ox-serving-size` | 4 |
| `plan` | `ox-plan` | 8 |
| `digital-library` | `ox-digital-library` | 2 |
| `phone` | `ox-phone` | chrome, not yet wired |
| `mail` | `ox-mail` | chrome, not yet wired |
| `map-pin` | `ox-map-pin` | chrome, not yet wired |
| `lock` | `ox-lock` | drawn, no caller yet |

### 3.5 The four aliases

See §2's table above (`ox-heart`, `ox-headset`, `ox-truck`, `ox-shield-check`).
Confirmed via a fresh grep: `headset` renders through `KitchenSink.tsx`,
`ZeroResults.tsx`, `ContactPage.tsx` (as an `icon:` prop, not a literal JSX
attribute — hence "consumers" above cites S6a's counts, which walked the same
indirection); `shield-check` through `UtilityTrust.tsx` and `TrustGrid.tsx`.

---

## 4. The symbols still ours, and why

43 ids the owner's 47 do not cover, carried forward from the sprite at git
`a5049de`, governed by `docs/build/progress/S6a.md` / `S6d.md`, exempt from
nothing in the test suite (full stroke contract, lattice, live-area, accent
share — all still enforced):

`chevron-down`, `chevron-up`, `chevron-start`, `chevron-end`, `arrow`,
`close`, `check`, `plus`, `minus`, `filter`, `sort`, `grid`, `list`, `play`,
`pause`, `external`, `expand`, `info`, `warning`, `globe`, `rotate`,
`document`, `archive`, `check-circle`, `clock`, `calendar`, `star`,
`registry`, `badge`, `referral`, `bundles`, `form`, `scoop-cup`, `shaker`,
`shaker-straw`, `vegan-leaf`, `low-sugar`, `gluten-free`, `whatsapp`, `tick`,
`bolt`, `cart-add`, `mark`.

`whatsapp` is the only symbol left with a simplified twin (`ox-whatsapp-s`).
`mark` is exempt from the stroke contract on separate grounds (it is the logo
mark, not drawn to the icon grid, pinned byte-for-byte by
`scripts/check-identity.mjs`'s `mark-drift` rule) — unaffected by this batch,
verified unchanged (`check-identity: 331 file(s), 0 problem(s)`).

A grep across `app/**` for `<Icon name=` and `href="#ox-` turned up no id
beyond these 43 plus the owner's 47 and the 4 aliases — nothing is missing.

---

## 5. RTL

`OX_MIRRORED_ICON_NAMES` (`Icon.tsx`) grew from 5 to 9:

- **Unchanged, ours:** `chevron-start`, `chevron-end`, `arrow`, `external`,
  `play`.
- **New, from the owner's manifest (`rtlFlip: true`):** `cart`, `shipping`,
  `written-question` — the same three the owner's own `ox-icons.css` mirrors
  (`[dir="rtl"] .ox-icon--cart, .ox-icon--shipping,
  .ox-icon--written-question { transform: scaleX(-1) }`), so our
  `data-mirror`/`.ox-mirror` mechanism now agrees with the owner's own CSS by
  construction.
- **New, alias-inherited:** `truck` (copies `shipping`, which mirrors).
  `heart` (wishlist), `headset` (help) and `shield-check` (authentic) do
  **not** mirror, because their sources don't.

`ox-mark` never mirrors (unaffected, still asserted in
`tests/common/sprite.test.ts`).

---

## 6. The accent colour note

Unchanged finding, restated because it now applies to the shipped file
directly rather than a redraw: the owner's SVGs default to **`#FF4A1A`**
(`style="…var(--ox-accent,#FF4A1A)…"`), but the theme's live token is
`--ox-accent` → `--color-primary` → **`#EE4D22`** in `tokens.css` (the Salla
dashboard is the source of truth for that value). The generator never emits
the owner's `#FF4A1A` fallback — it strips the whole `style` attribute and
relies on the CSS class, so **the token wins**, exactly as `_primitives.scss`
already defines it. No sprite or stylesheet change was needed for this; flagged
for the owner in case `#FF4A1A` (rather than the dashboard's `#EE4D22`) was the
intended brand orange — that is a dashboard + `tokens.css` decision, not a
sprite one.

---

## 7. Deviations, and why

1. **Two accent-fill style forms treated as one case.** The brief names two
   exact conversions (`…;stroke:none` → class+attr; the bare stroke form →
   class). Two files, `goal-energy.svg` and `points.svg`, use a third,
   unnamed form — `style="fill:var(--ox-accent,#FF4A1A)"` with no
   `;stroke:none` — for a symbol whose entire body is one accent-filled path.
   Since `.ox-icon__accent` already sets `stroke: none` in `_primitives.scss`,
   and the alternative (leaving it unconverted) would ship a literal colour,
   the generator treats this as the same case as the `;stroke:none` form:
   `class="ox-icon__accent" stroke="none"`. Verified: both `goal-energy` and
   `points` render correctly in the kitchen sink, mono-free of any leftover
   colour or style attribute.
2. **The ten product-category symbols lose their pre-redraw exemption.** The
   owner's newest delivery includes official redraws of `protein` through
   `accessories`, so the S6a/§10 "restored verbatim, no `class=ox-sym`"
   allowlist (`OWNER_APPROVED_ORIGINALS`) is retired; they now carry the same
   full stroke contract as every other symbol. This is the brief's own
   instruction ("the owner's 47 names as they are … including … "), not an
   independent call — flagged because it reverses a decision from two batches
   ago.
3. **`OWNER_EXEMPT` (the test's exemption set) covers the 4 aliases too, not
   only the 47 named in the brief.** The aliases are byte-for-byte copies of
   owner geometry (a 14-point seal, circles for wheels, etc.), so they would
   fail the same lattice/primitive-shape/live-area assertions the 47 are
   explicitly exempted from, for the same reason. Excluding them from
   `OWNER_EXEMPT` would fail tests over geometry this batch did not draw and
   is not allowed to redraw. `tests/common/sprite.test.ts` imports `ALIASES`
   from the generator so the two sets can never drift apart.
4. **`gen-icon-mask.mjs`'s `--ox-cart-glyph` mask now omits the cart's
   wheels.** The owner draws the cart's two wheels as `<circle>` elements
   (the accent); `gen-icon-mask.mjs`'s `maskDataUri` only ever matched
   `<path>` elements (pre-existing, out of this batch's edit scope — not in
   the constraints list). Running it (§8) produced a mask with the basket
   outline only, no wheels — a real, visible regression in the sticky buy bar
   and the card's native add-button glyph versus the previous own-drawn cart
   (whose wheels were `<path>` pill shapes). Flagged as a follow-up for
   whoever owns `scripts/gen-icon-mask.mjs`: it needs to also match
   `<circle>`/`<rect>` (fill them the same way an accent `<path>` is filled)
   now that the sprite's source symbols can contain them.
5. **File-size ceiling raised 52 KB → 64 KB** (per the brief) and the
   monochrome/accent-share, lattice, primitive-shape and live-area tests were
   rescoped from "all symbols minus mark" to "all symbols minus mark minus
   `OWNER_EXEMPT`", per the brief's exemption list. Nothing here changed a
   number the brief didn't already ask for; the mechanics needed splitting
   into more tests than existed before (e.g. "no primitive shape" used to be
   one `SOURCE`-wide regex; it is now scoped to `nonOwnerDrawn`).
6. **`tests/product/productType.test.ts` fails** ("Cannot find module
   `../../app/components/product/lib/productType`") — both that test file and
   the module it imports are untracked (`git status`), mid-write by the
   concurrent S8a builder on product components. Unrelated to this batch,
   not touched, confirmed pre-existing by `git status`.

---

## 8. Verification

```
$ node scripts/gen-icon-mask.mjs
gen-icon-mask: wrote --ox-cart-glyph from #ox-cart to app\styles\tokens.css
# (the cart's wheels are missing from the mask — deviation 4 above; the
# generated token's basket outline is otherwise correct and matches #ox-cart)

$ pnpm typecheck
$ tsc --noEmit
(no output — no errors)

$ pnpm vitest run tests/common tests/scripts tests/home tests/layout tests/product
 ✓ tests/common/sprite.test.ts (22 tests)
 ✓ tests/scripts/import-owner-icons.test.ts (12 tests)
 ✓ tests/scripts/gen-icon-mask.test.ts (6 tests)
 ...
 Test Files  1 failed | 52 passed (53)
      Tests  705 passed (705)
 FAIL tests/product/productType.test.ts — pre-existing, unrelated (§7.6)

$ node scripts/check-identity.mjs
check-identity: 331 file(s), 0 problem(s)

$ pnpm check:tokens
check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)

$ curl -s http://localhost:3210/ar/kitchen-sink
http=200
symbol defs in html: 95
owner symbol defs missing from html: 0
total <use> refs rendered: 1325
owner ids never referenced by <use>: 0
size ladder inlined: true
round caps/joins present: false
ox-mirror instances: 153
c2pa/metadata present: false
ox-icon--16 instances: 368   ox-icon--20: 192   ox-icon--24: 171
ox-icon--32: 177             ox-icon--36: 170
both ground labels ("light ground #F7F8F6", "dark ground #0B0D0F"): present
```

Sprite size: **41,588 → 33,266 bytes** (95 symbols vs. the previous 108 —
fewer bytes despite new geometry, mostly from dropping 15 of 16 simplified
twins the owner's one-drawing-per-icon delivery makes unnecessary).

---

## 9. Files touched

| file | why |
|---|---|
| `scripts/import-owner-icons.mjs` (new) | the generator (§2) |
| `app/assets/ox-sprite.svg` (generated) | 95 symbols: 47 owner + 4 aliases + 43 carried forward + 1 twin |
| `app/components/common/Icon.tsx` | `wishlist`, `offers` added to `OX_BRAND_ICON_NAMES`; `OX_SIMPLIFIED_ICON_NAMES` cut to `['whatsapp']`; `OX_MIRRORED_ICON_NAMES` grew to 9; the legacy-trio doc comment updated to describe the alias direction reversal |
| `tests/common/sprite.test.ts` | `OWNER_APPROVED_ORIGINALS` replaced by manifest-driven `OWNER_EXEMPT` (47 + 4 aliases); counts updated (94/1/95); drawing-language assertions rescoped to `nonOwnerDrawn`; new `class="ox-sym"` and no-`<metadata>` tests; ceiling raised to 64 KB |
| `tests/scripts/import-owner-icons.test.ts` (new) | unit tests for the generator's pure functions, idempotency, and `OX_ICON_NAMES` ⊆ sprite |
| `app/styles/tokens.css` | regenerated `--ox-cart-glyph` via `gen-icon-mask.mjs` only (§7.4) |
| `docs/build/ICONS-2026-09-24.md` | top note: the owner's set is the source of truth from 2026-09-24 for the 47 (+4 aliases); the document now governs only the remaining ~43 |
| `docs/build/progress/S8b.md` | this file |
