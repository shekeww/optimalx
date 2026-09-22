# S2a: icon system — progress (2026-09-22)

Batch: S2a (icon system, OX-24 with the judges' changes), from `docs/build/brief-S2-2026-09-22.md`.

## Mid-task correction applied

The conductor corrected the brief's "22° rule" mid-task: the logo's X bars measure
34° from vertical (not 22°), from `public/assets/brand/optimalx-mark-512.png`
(34.2°, 34.3°, 33.9°, 34.1° across four edges). Every mention of the angle in this
batch's work — the sprite header comment, the `BUILD.md` §3.5 sentence, `ox-bolt`
and `ox-shield-check`'s structural diagonals, the sprite test comment — uses 34°
(equivalently 56° from horizontal), never the 22° the brief originally specified.
`--ox-angle` in `app/styles/tokens.css` (22deg) and the `ox-angled()` mixin were
**not** touched, per the correction: that is the band/CTA wedge system, a separate
identity workflow re-derives it.

## Files changed

- `app/assets/ox-sprite.svg` — rewrite: 9 new/redrawn brand symbols with a fleck
  (`truck`, `shield-check`, `bolt`, `cart`, `plus`, `minus`, `bundles`,
  `digital-library`, plus `headset` replacing `help`'s old geometry); removed the
  14 per-symbol `stroke-width="1.5"` overrides (root's 1.8 now governs every
  symbol); deleted `ox-chevron-fwd`, `ox-chevron-double`, `ox-star-half` (zero
  callers each after this batch's repoints); kept `ox-authentic`, `ox-shipping`,
  `ox-help`, `ox-chevron-down` unchanged as documented legacy exceptions (see
  "Requests to other batches"); header comment rewritten for symbol count, the
  weight law, the 34° rule and the legacy list.
- `app/components/common/Icon.tsx` — `OX_BRAND_ICON_NAMES`/`OX_UI_ICON_NAMES`
  updated to match (removed `star-half`, `chevron-fwd`, `chevron-double`; renamed
  `help`→`headset` in the type while keeping `help` as an additional legacy
  member; added `shield-check`, `truck`, `bolt`, `cart`, `plus`, `minus`,
  `bundles`, `digital-library`); doc comments explain the legacy trio.
- `app/components/product/PdpIcon.tsx` — trimmed to a one-glyph (`cart`) legacy
  shim; **not deleted** (see "Deviations").
- `app/components/icons.tsx` — deleted (zero importers, confirmed by grep).
- `app/styles/06-ox/_primitives.scss` — `.ox-icon` rule (~361-384 before this
  batch): added `vector-effect: non-scaling-stroke` so the 1.8 stroke reads the
  same at 16 and 44.
- `app/styles/06-ox/_b3-product.scss` (~1348-1391 region) — comments updated off
  `PdpIcon`/stroke-1.5 onto the sprite's `ox-cart` symbol/stroke-1.8; removed the
  hand-copied `:root { --ox-cart-glyph: ... }` block, now generated into
  `tokens.css` instead.
- `app/styles/tokens.css` — new generated block (markers, not hand-edited) with
  `--ox-cart-glyph`, written by `scripts/gen-icon-mask.mjs`.
- `scripts/gen-icon-mask.mjs` (new) — reads `ox-cart` out of the sprite, emits
  the `--ox-cart-glyph` data-URI mask, splices it into `tokens.css`; `--check`
  mode for CI.
- `scripts/check-tokens.mjs` (new) — the sixth gate: collects `--ox-*`
  definitions from `tokens.css` (+ any `_generated-*.scss`), collects every
  `var(--ox-*)` use under `app/styles/**` and `app/**/*.tsx`, fails on a use
  with no definition and no fallback.
- `package.json` — added `check:tokens`, appended it to `check:all`; added
  `gen:icon-mask`.
- `tests/common/sprite.test.ts` — hardcoded the real symbol count (53, not
  derived from `OX_ICON_NAMES.length`); added "stroke-width only on the root
  svg, never on a symbol"; added a new `describe` block scanning all of `app/`
  for an inline `<path d=` outside `ox-sprite.svg`/`Icon.tsx`/`PdpIcon.tsx`
  (the last one documented as the legacy-shim exception).
- `tests/scripts/gen-icon-mask.test.ts` (new) — unit tests for the generator's
  pure functions, plus the load-bearing one: the committed `tokens.css` token
  equals what the generator would write from the current sprite.
- `locales/partials/s2.ar.json`, `locales/partials/s2.en.json` (new) —
  `ox.trust.authentic_short`, `ox.trust.authentic_expiry` (values identical to
  the keys they stand in for; see "Deviations").
- `locales/ar.json`, `locales/en.json` — same two keys added, identically.
- `BUILD.md` — one sentence added to §3.5: the 34° structural-diagonal rule.
  §3.3 (the logo chevron's own 22° claim) was **not** touched — separate claim,
  per the correction.
- Call-site repoints, `PdpIcon` → `Icon` (sprite) or `sallaicons`, all within
  files this batch could reach:
  - `app/components/product/BuyZone/PdpGallery.tsx` — `expand`.
  - `app/components/product/BuyZone/PdpThumbRail.tsx` — `chevron-up` →
    `sicon-keyboard_arrow_up` (vertical, no mirror needed); `chevron-down` →
    `Icon` (sprite legacy id, consistent with its other live callers).
  - `app/components/product/BelowFold/NutritionTable.tsx` — `chevron-down`,
    `minus`/`plus`.
  - `app/components/product/BelowFold/RelatedRail.tsx` — both `chevron-end` →
    `sicon-keyboard_arrow_left` (the button's own `transform: rotate(...)`,
    untouched, still does the RTL work).
  - `app/components/product/BuyZone/DeliveryPromise.tsx` — `chevron-end` →
    `sicon-keyboard_arrow_left`; four `shipping` → `truck`.
  - `app/components/product/BelowFold/BrandBand.tsx` — `badge.glyph` (dietary
    UI icons, unchanged names).
  - `app/components/product/BuyZone/StatCards.tsx` — `cell.glyph`.
  - `app/components/product/BelowFold/HowToUse.tsx` — the three step glyphs.
  - `app/components/product/RatingRow.tsx` — `star`, both rows; the fill row
    gets `style={{ fill: 'currentColor' }}` inline (RatingRow's own file,
    mirrors `StoreRating`'s CSS-based version without touching CSS I do not
    own).
  - `app/components/product/BelowFold/Bundle.tsx` — `plus`, `cart`.
  - `app/components/product/BelowFold/FrequentlyBought.tsx` — `plus`.
  - `app/components/product/OxProductCard.tsx` — `minus`/`plus`; `BoltGlyph`
    function deleted, both call sites now `<Icon name="bolt">`.
  - `app/components/product/BuyZone/BuyActions.tsx` — **not in the brief's file
    list**; found by the new "no inline path" test. A third hand-copied bolt
    (identical comment lineage to `OxProductCard`'s), now `<Icon name="bolt">`.
  - `app/components/cart/AddProductToast.tsx` (the brief names
    `product/AddProductToast.tsx`; only one file exists, at `cart/`) — the two
    raw vendor SVGs (~345, ~377) replaced: "Complete Order" → `secure-payment`
    (padlock, semantically "secure checkout"; no dedicated new symbol was
    listed for this one, so I reused the nearest existing brand symbol rather
    than invent an unlisted tenth); "View Cart" → `cart` (the new bag).
- Icon-rename repoints (`shipping`→`truck`, `authentic`→`shield-check`,
  `help`→`headset`), every reachable, non-restricted caller:
  - `app/components/product/BuyZone/TrustGrid.tsx` — both.
  - `app/components/common/KitchenSink.tsx` — `shipping`.
  - `app/components/pages/ErrorState.tsx`, `app/components/pages/NotFound.tsx`
    — `help`.
  - `app/components/pages/ContactPage.tsx` — `help` → `headset` on the phone
    contact row (semantically closer: a headset for a phone line).
- `app/components/layout/Footer/FooterBottom.tsx` — the double chevron
  (`ox-chevron-double`) replaced with `sicon-keyboard_arrow_right`, no
  `ox-mirror`: this line is always `dir="ltr"` (an English tagline), so the
  fix is to never mirror it, which is the actual bug the brief flagged
  ("points away from the reading direction in RTL" — the old sprite glyph
  mirrored with the whole page even though its own text never did). Accent
  colour moved inline (`style={{ color: 'var(--ox-accent)' }}`) since the CSS
  rule that painted it targets `.ox-icon` in `_b1-layout.scss`, which this
  batch cannot edit.
- `app/components/home/CategoryTile.tsx` — icon size 44 → 36 (line 54 only).

## Decisions: done / not done

1. **One family, two delivery paths.** Done, with one exception. `icons.tsx`
   deleted. The nine duplicates folded into the sprite (existing sprite art,
   never redrawn — `vegan-leaf`/`low-sugar`/`gluten-free`/`expand`/`scoop-cup`/
   `shaker`/`shaker-straw`/`star`/`chevron-down` had zero live callers through
   `<Icon>` before this batch; PdpIcon was drawing its own, different-looking
   versions of the first eight). `chevron-up`/`chevron-end` retired to
   `sallaicons`, never added to the sprite. `cart`/`plus`/`minus` moved to the
   sprite as new brand symbols (with a fleck — see decision 6).
   `PdpIcon.tsx` **not deleted**: `MainBar.tsx:124` and `MobileHeader.tsx:69`
   (both `app/components/layout/Header/**`) still import it and this batch
   cannot edit that path. Trimmed to the one glyph (`cart`, the trolley,
   pixel-identical to before) those two sites still use.
2. **Weight law.** Done. Root `stroke-width="1.8"` now governs every symbol;
   the 14 per-symbol overrides (all on the old UI set) removed.
   `vector-effect: non-scaling-stroke` added to `.ox-icon`. `overflow: visible`
   was already there (no change needed).
3. **Orange fleck.** Done. Every brand symbol — old and new — carries exactly
   one `.ox-icon__accent` (`sprite.test.ts` asserts it, unchanged assertion
   still passes). `--ox-icon-mono` is documented in `Icon.tsx`'s comment
   history from the brief but not wired anywhere yet — no caller exists; that
   is S2c's advisory band.
4. **34° rule** (corrected from 22° mid-task). Done. Sprite header comment and
   `BUILD.md` §3.5 both say 34°/56°. `ox-bolt`'s zigzag and `ox-shield-check`'s
   taper are the two symbols with an actual structural diagonal in this
   batch's new work; both calibrated to `dx:dy = tan(34°) = 0.6745`. `truck`,
   `headset`, `bundles` have no diagonal at all (rectilinear/arc geometry) —
   vacuously compliant. `digital-library`'s bookmark accent has a shallow
   decorative diagonal, left organic (same treatment as the existing
   `authentic` ribbon tails and `goal-energy`'s bolt-in-a-circle accent,
   neither of which the brief holds to this rule); not a structural edge.
5. **ox-mark kept, unchanged. ox-star/ox-star-half.** Done: `star` kept (live
   callers: `StoreRating`, `RatingRow`); `star-half` removed (zero callers,
   confirmed by grep before deleting). Recorded, not decided, per the brief:
   `StoreRating` is a live rating surface pending the owner's initials on the
   claims source.
6. **New symbols.** Done: `truck`, `shield-check`, `headset`, `bolt`, `cart`
   (the bag), `plus`, `minus`, `bundles`, `digital-library` — each with a
   fleck, 1.8 stroke, 24 grid. No `flame` (confirmed no caller anywhere).
7. **`--ox-cart-glyph` generator.** Done. `scripts/gen-icon-mask.mjs` reads
   `ox-cart` from the sprite, writes the mask into `app/styles/tokens.css`
   (marked, generated block; the old hand-copied version in `_b3-product.scss`
   removed). `pnpm gen:icon-mask` wired. `tests/scripts/gen-icon-mask.test.ts`
   asserts the committed token equals the generator's output (passing).
8. **FooterBottom double chevron.** Done: `sicon-keyboard_arrow_right`, no
   mirror (see file list above for the actual bug). `ox-chevron-fwd` and
   `ox-chevron-double` deleted from the sprite.
9. **CategoryTile icon size 44 → 36.** Done, one line. Breaks a test in a
   file S2b owns — see "Requests to other batches".
10. **Sixth gate, `check-tokens.mjs`.** Done, wired into `check:all`. See
    "check-tokens findings" below — it surfaced real, pre-existing findings,
    none of them fixed by this batch (all outside my owned files).
11. **Tests.** Done: real count hardcoded (53), stroke-1.8-only assertion,
    accent/square/miter assertions kept, new "no inline path outside the
    sprite" test (which caught a third bolt copy, `BuyActions.tsx`, not named
    in the brief — fixed once found).
12. **Trust strip rename.** Adapted, not literal. See "Deviations" below —
    both `ox.trust.authentic_100` and `ox.trust.authentic_guaranteed` are
    still in `locales/ar.json`/`en.json`/`b1.*.json` unchanged; the new keys
    (`authentic_short`, `authentic_expiry`) were added alongside rather than
    replacing them. Values are byte-identical to what they stand in for. The
    four trust-strip strings themselves were never touched (rule 4: never
    edit an existing value).

## New symbols list

`truck`, `shield-check`, `headset`, `bolt`, `cart`, `plus`, `minus`, `bundles`,
`digital-library` — 9 new or redrawn brand symbols, each with one
`ox-icon__accent` fill element, 1.8 stroke, 24×24 viewBox.

Retired: `ox-chevron-fwd`, `ox-chevron-double`, `ox-star-half` (all zero
callers once this batch's repoints landed).

Kept unchanged as legacy (superseded, but still read by a file this batch
could not edit): `ox-authentic`, `ox-shipping`, `ox-help`, `ox-chevron-down`.

Sprite total: 53 symbols (40 brand incl. the 3 legacy + `ox-chevron-down`'s
UI-family legacy, 12 UI — see `tests/common/sprite.test.ts`), 14174 bytes
(under the 16 KB ceiling).

## check-tokens findings

`node scripts/check-tokens.mjs` (and therefore `pnpm check:all`, now that it
is appended) currently exits 1: 41 findings collapsing to 8 unique tokens,
none of them the `--ox-5`-style typo the gate exists to catch — these are all
real, intentionally component-scoped custom properties, just not centralised
in `tokens.css` and read without an inline fallback:

- `--ox-cta-run` — `_b2-home.scss:132` (set on `.ox-btn`, read by its own
  `clip-path`; S2b-adjacent file).
- `--ox-shaker-blue`/`-blue-edge`/`-green`/`-green-edge`/`-white`/
  `-white-edge`/`-black`/`-black-edge` — `_b2-home.scss:990-1000`, set once
  and read by the four `.ox-tile--*` tone rules just below (S2b owns this
  file: `CategoryTile`/the shaker-colour system).
- `--ox-tooltip-bg`/`-fg` — `_primitives.scss:1186-1187`, set and read in the
  same block.
- `--ox-skel-card` — set in `_b2-home.scss:2118/2123`, read in
  `HomeSkeleton.tsx:111` (S2b owns both).

None are mine to fix (outside this batch's owned files; three of the four
groups are `_b2-home.scss`/`HomeSkeleton.tsx`, which S2b owns). Recommending
to the conductor: either widen the gate's definition sources beyond
`tokens.css` to `app/styles/06-ox/*.scss` generally, or give each of these
reads an inline fallback per the codebase's existing convention (e.g.
`var(--ox-icon-size, 24px)`), or centralise them into `tokens.css`. Until one
of those happens, `pnpm check:all` will exit 1 on every run — this batch has
not silenced or narrowed the gate to avoid that, since the brief's whole point
was to stop hiding this class of bug.

## Measured numbers (390/320/1440)

Not applicable to this batch in the way S2b/S2c report them: S2a changed no
responsive layout. The one size change (`CategoryTile` 44px → 36px) is a
fixed icon-pixel value, not a viewport-dependent measurement.

## Requests to other batches

- **Header owner** (`app/components/layout/Header/**`, restricted to this
  batch): repoint `MainBar.tsx:124` and `MobileHeader.tsx:69` from
  `<PdpIcon name="cart">` to `<Icon name="cart">` (the sprite's bag, matching
  the live Raed skin — the old `PdpIcon` shim still draws the trolley, so
  these two render unchanged until repointed); repoint
  `UtilityTrust.tsx`'s `icon: 'authentic'` → `'shield-check'`,
  `icon: 'shipping'` → `'truck'`, and `labelKey: 'ox.trust.authentic_100'` →
  `'ox.trust.authentic_short'` (identical value). Once all three land, the
  conductor can delete `PdpIcon.tsx`, `ox-authentic`, `ox-shipping`, and the
  two now-unused base keys (`ox.trust.authentic_100`,
  `ox.trust.authentic_guaranteed` — the second already has zero readers
  today).
- **`app/components/listing/ZeroResults.tsx`** (restricted): `icon="help"` →
  `icon="headset"`.
- **`app/routes/account.notifications.tsx`** (restricted): `icon="help"` →
  `icon="headset"`.
- **S2b** (owns `tests/home/**`, `CategoryTile.tsx`/`OxCategories.tsx`
  broadly): `tests/home/OxCategories.test.tsx`'s "draws the 44px glyph on a
  coloured tile exactly as on a neutral one" now fails — it asserts `width`
  `'44'`, actual is `'36'` per this batch's mandated `CategoryTile.tsx:54`
  edit. Likely moot once `OxCategories`/`CategoryTile` are replaced by
  `OxNeeds`/`NeedCard`, but flagging in case that lands later than this.
  Also see the `--ox-shaker-*`/`--ox-cta-run`/`--ox-skel-card` findings above.
- **Whoever can edit `app/content/`** (locked to builders per the brief):
  `app/content/taxonomy.ts`'s `UTILITY_ICON` map can now point `bundles` at
  `'bundles'` and `digital_library` at `'digital-library'` instead of the
  `'form'`/`'plan'` placeholders its own comment already anticipated ("a
  request for a dedicated symbol goes through S2"). `app/content/about.ts`'s
  `glyph: 'shipping'` could move to `'truck'` for consistency; not urgent,
  still renders correctly today (the legacy symbol is unchanged art).
- **Conductor**: the `check-tokens` findings above need a policy call.
  `StoreRating`/`ox-star` claims-source question recorded per the brief, not
  decided. Pre-existing, unrelated failures observed during verification
  (none caused by this batch, none touched by it): `app/routes/categories.tsx`
  fails `pnpm typecheck` (route-tree typing, restricted path);
  `tests/home/blocks.test.tsx`, `tests/layout/MobileDrawer.test.tsx`,
  `tests/layout/NavBar.test.tsx` (×2) fail on Arabic copy mismatches that
  trace to the in-progress locale voice sweep on `b1`/`b6` partials, not this
  batch's `s2.*` additions (which pass `check:copy` cleanly, verified in
  isolation).

## Deviations

- **`PdpIcon.tsx` not deleted**, trimmed to a one-glyph shim instead — see
  decision 1 and the Header request above.
- **Trust-key rename adapted to an add, not an in-place rename** — the brief's
  literal instruction ("do the rename... in base + declaring partial") would
  have deleted `ox.trust.authentic_100`, which `UtilityTrust.tsx` (restricted)
  still reads; deleting it would have shown a raw key on the live trust strip
  today. Added `ox.trust.authentic_short`/`authentic_expiry` as new keys with
  byte-identical values instead, left the old two in place, and listed them
  above as retirement candidates once the Header owner migrates. This follows
  the brief's own general locale rule (new keys only, list the retired one)
  rather than its specific rename wording, because the two conflict for this
  one key and the general rule is the one that cannot break a live surface.
- **`ox-help` kept as a legacy symbol**, not fully removed as the brief's
  "nine duplicates plus five unique" accounting implied. Discovered via
  `pnpm typecheck`, not the initial `grep -rn "PdpIcon"` sweep the brief
  suggested (these callers use `<Icon name="help">` directly, never
  `PdpIcon`): `ZeroResults.tsx` (`app/components/listing/**`, restricted) and
  `account.notifications.tsx` (`app/routes/**`, restricted) both still need
  the exact old id. A handful of other, non-restricted `help` callers
  (`app/components/commerce/KitchenSink.tsx` ×2,
  `app/components/common/KitchenSink.tsx:315`) were left unchanged rather than
  edited without a specific reason, once `help` had to stay anyway.
- **`AddProductToast.tsx`'s "Complete Order" icon** mapped to the existing
  `secure-payment` symbol, not a new one — the brief's owned-files list named
  this file and said "the two toast paths become sprite symbols" but the
  9-symbol new list has no checkout/card glyph. Reused the nearest existing
  brand symbol (a padlock, semantically "secure checkout") rather than invent
  a tenth symbol the brief never asked for.
- **`BuyActions.tsx` edited though not named in the brief's file list** — a
  third hand-copied bolt SVG, same comment lineage as `OxProductCard`'s
  (both said "so it can move into the sprite unchanged"), found by this
  batch's own new "no inline path" test. In scope: not owned by any other
  batch, and it is the exact defect this batch exists to remove.
- **`FooterBottom.tsx`'s accent colour is now inline `style`**, not a CSS
  rule, because the rule that used to paint it (`.ox-footer__en .ox-icon`)
  lives in `_b1-layout.scss`, which this batch cannot edit.
- Two file paths in the brief did not match the tree: `AddProductToast.tsx`
  is at `app/components/cart/`, not `product/`; `OxProductCard.tsx`'s
  `BoltGlyph` was at line ~525, not ~458-476 (both edited at their real
  location; noted here since the brief's line numbers may be stale
  elsewhere too).

## Verification tails

`pnpm typecheck` — clean except one pre-existing, unrelated failure:
```
app/routes/categories.tsx(21,38): error TS2345: Argument of type '"/{-$locale}/categories"' is not assignable to parameter of type 'keyof FileRoutesByPath | undefined'.
```

`pnpm vitest run tests/common tests/home tests/product tests/layout`:
```
Test Files  4 failed | 29 passed (33)
     Tests  5 failed | 436 passed (441)
```
Failures: `tests/home/OxCategories.test.tsx` (44→36, attributable, flagged
above); `tests/home/blocks.test.tsx`, `tests/layout/MobileDrawer.test.tsx`,
`tests/layout/NavBar.test.tsx` ×2 (all pre-existing Arabic-copy drift from the
concurrent voice sweep, unrelated to icons — verified by inspection, none of
the failing assertions touch anything this batch edited).

`tests/common/sprite.test.ts` in isolation — 11/11 passing:
```
✓ tests/common/sprite.test.ts (11 tests) 78ms
```

`tests/scripts/gen-icon-mask.test.ts` — 6/6 passing:
```
✓ tests/scripts/gen-icon-mask.test.ts (6 tests) 22ms
```

`pnpm check:rtl`:
```
check-rtl: 311 file(s), 0 problem(s)
```

`pnpm check:motion`:
```
check-motion: 311 file(s), 0 problem(s)
```

`pnpm check:strings`:
```
check-strings: 303 file(s), 0 problem(s)
```

`pnpm check:copy` — 151 pre-existing findings, all in files this batch never
touched (the concurrent voice sweep); confirmed zero findings against my own
new keys in isolation:
```
check-copy: 26 file(s), 151 problem(s)
```
```
$ node scripts/check-copy.mjs locales/partials/s2.ar.json locales/partials/s2.en.json
check-copy: 2 file(s), 0 problem(s)
```

`node scripts/check-tokens.mjs` (new gate) — see "check-tokens findings":
```
check-tokens: 116 token(s) defined, 307 file(s) scanned, 41 problem(s)
```

`node scripts/gen-icon-mask.mjs --check`:
```
gen-icon-mask: app\styles\tokens.css up to date with #ox-cart
```

`curl -s "http://localhost:3210/?storeId=1888890798" | grep -c "ox-sprite\|#ox-"`
→ renders (3 on the bare grep -c line count; decompressed inspection shows
`ox-sprite` plus 15 live `#ox-*` references including `#ox-authentic` and
`#ox-shipping` from the restricted `UtilityTrust.tsx` trust strip — confirming
those two legacy symbols are load-bearing on the live home page today, not a
theoretical concern); zero raw `"ox.` keys found in the same response.
