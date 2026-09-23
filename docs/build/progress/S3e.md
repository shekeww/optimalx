# S3e: the product card, CARD-2026-09-23 — progress

Batch: implement `docs/build/CARD-2026-09-23.md` on `OxProductCard` and its
styles, under four owner overrides (buy-now keeps the one parallelogram,
everything else on the card is straight-edged including the saving badge; the
buy-now label uses the global `--ox-btn-primary-size` token with no icon; the
owner's mobile arrangement stays and is refined to spec measurements; the
accent label colour reads `--ox-on-accent` with nothing hardcoded). Read in
full first: the spec itself, `docs/build/progress/S3a.md`,
`docs/build/progress/S3c.md`, `docs/build/X-IDENTITY-2026-09-22.md` §2–4,
`OxProductCard.tsx`/`Price.tsx`/`VariantChips.tsx`, `claims.ts`, `Badge.tsx`,
`_b3-product.scss`, `_b4-listing.scss` section 12, and the product/listing
tests.

Partway through the batch the coordinator sent an urgent mid-task correction
(the owner had found the mobile buttons broken on a real phone): the add
button's `className` never reaches its host element in SSR/pre-hydration, and
the mobile buy-now cell was too narrow for its own parallelogram. Both are
fixed below, under "The coordinator's urgent fix," and that fix **narrows**
the buy-now-keeps-its-parallelogram override for the mobile row specifically
(small corner cut there; the full parallelogram stays on desktop and in the
Link variant generally).

---

## 1. Files

| File | Change |
|---|---|
| `app/components/product/lib/cardSpec.ts` | **new**. `cardSpecLine(product, spec, t)` — servings, then pack size, joined by the theme's divider; falls back to the dosage form; else null |
| `app/components/product/lib/useHoverCapable.ts` | **new**. Client-only `matchMedia('(hover: hover) and (pointer: fine)')`, read after hydration |
| `app/components/product/OxProductCard.tsx` | pitch line removed, brand line and spec line arrive; stock line arrives; badge stack re-ordered and capped at two with a new "tag" badge; colour dots suppressed when the chip row already owns that axis; hover image gated behind `useHoverCapable()`; `CARD_IMAGE_WIDTHS`/`SIZES` capped at 300; sold-out is a full early-return branch (`SoldOutControl`, new) instead of a stripped-down version of the in-stock render; one pre-existing type error fixed in passing (`Price amount={saving}` — `saving: number \| null` against a `string \| number \| undefined` prop; unrelated to this batch, needed for a clean `pnpm typecheck`) |
| `app/components/common/Badge.tsx` | `tone="tag"` added to `BadgeTone`; doc comment updated |
| `app/styles/06-ox/_b3-product.scss` (section 1, card only) | hover lift removed, border-colour transition in its place; body `flex: 1 1 auto` + action `margin-block-start: auto` (DIRECTION 4.4's actual mechanism, which did not exist before this batch); title 46px min-block-size added at 1024+; spec-line weight `--ox-w-ui`; new `.ox-card-product__stock` rule; sold-out body `min-block-size` (252/260); reduced-motion override for the card's own transitions |
| `app/styles/06-ox/_b4-listing.scss` (section 12, product card only) | badge notch reset to straight edges (owner override); saving badge radius `--ox-r-1` (was pill); new `.ox-badge--tag` styling; add button re-targeted through `.ox-card-product__add-slot > *` everywhere, at every breakpoint, alongside the class (coordinator fix — see §4); add button de-angled to `--ox-r-2` (owner override); buy-now Link variant gets the missing `inline-size: calc(100% - 16px)` (finding 2 fix); mobile action grid `48px 1fr` (coordinator fix); mobile buy-now gets the small `ox-x-corner(8px, end)` cut instead of the parallelogram (coordinator fix); new sold-out control CSS (`__action--out`, `__notify-slot`, `__unavailable`); title 1024+ breakpoint |
| `locales/ar.json`, `locales/en.json` | `ox.card.limited_qty`, `ox.card.unavailable` |
| `locales/partials/s3c.ar.json`, `s3c.en.json` | same two keys, matching the spec's own file map |
| `tests/product/OxProductCard.test.tsx` | pitch tests replaced with spec-line tests; brand-row test added; sold-out test rewritten for the notify/unavailable split; new tests for the badge cap, the tag badge, the stock line, and colour-dot suppression |
| `docs/build/progress/S3e.md` | this file |

Not edited: `claims.ts` (read for the gates; nothing in it needed to change),
`Price.tsx`, `VariantChips.tsx` (both correct already, per the spec's own
file map).

---

## 2. The coordinator's urgent fix

**Root cause, verified live.** `curl http://localhost:3210/ar/protein/c9001`
after the fix still shows every add button's host with no class:
`<div class="ox-card-product__add-slot"><salla-add-product-button
aria-label="أضف للسلة"><span class="ox-card-product__add-label">أضف
للسلة</span></salla-add-product-button></div>`. Traced to
`@stencil/react-output-target`'s `createComponent` (`create-component-
ICzm58MY.js`, wraps `@lit/react`): it applies `className` to the host inside
a `useLayoutEffect`, which never runs during SSR and has not yet run on the
very first client paint. Every rule keyed on the bare `.ox-card-product__add`
class therefore painted nothing until hydration completed, and nothing at
all if the class application ever failed.

**Fix.** Every add-button rule (base, `.s-button-element`, the un-upgraded
`:not(:has(...))` fallback, `.s-button-text`, the cart-glyph mask, the two
container-query tiers, the `focus-visible` rule, the new mobile 48px tier)
now carries `.ox-card-product__add-slot > *` as an additional selector
alongside the class, structurally reaching the same host regardless of
whether the class ever lands. The class stays in the JSX and in the
selectors too (harmless, and still what a real browser eventually sets).
The same slot pattern is used for the new sold-out notify control
(`.ox-card-product__notify-slot > *`), since it is the same web-component
wrapper.

**Second finding, measured against the coordinator's own numbers.** The old
mobile row was `grid-template-columns: 40% 1fr`, which resolves against
`(row width − gap)`, giving the add cell ≈52px and buy-now ≈77px at the 390
two-up card (137px content) — inside X-IDENTITY §2.4's own 123.75px floor for
a 44px-tall parallelogram, so the run plus a 17.1px/700 label could not fit;
the coordinator's own measurement was the label painting clipped
("شتري الآن").

**Fix, per the coordinator's decision:**
- `grid-template-columns: 48px 1fr` (fixed, not a percentage) for the mobile
  action row, so the add cell is deterministic and buy-now's cell is
  `137 − 48 − 8 = 81px` at 390.
- The add control is styled through the slot (above), 48×44, straight edges
  (`border-radius: var(--ox-r-2)`, owner override, not the small corner cut
  the coordinator offered as an alternative — kept consistent with "every
  control but buy-now is straight-edged").
- Buy-now keeps **one** angled gesture on this row too, but the small one:
  `ox-x-corner(8px, end)` (X-IDENTITY §3.3's arm-foot corner cut, run 5.4px),
  not the 44px parallelogram, which is illegal at this width on §2.4's own
  terms regardless of the class bug. Desktop (768+) is unchanged: text add
  button and stepper share one row, the parallelogram buy-now row sits below.

**Measured (arithmetic, this environment has no headless renderer — flagged,
not silently assumed comfortable):**

| | 390, mobile row B | 768 boundary |
|---|---|---|
| Add cell | 48×44, fixed | n/a — add rejoins the stepper's row at 768, see `_b4-listing.scss`'s `@media (min-width: 768px)` vs the `(max-width: 767px)` block |
| Buy-now cell | `137 − 48 − 8 = 81px` × 44 | desktop buy-now is full-width, 272px content at 1440, unaffected |
| Buy-now padding | `padding-inline: 6px` → 12px total | — |
| Label budget | 81 − 12 = 69px for "اشتري الآن" at 17.1px/700 | — |
| Label estimate | S3a/CARD's own measurement, 58.0px at 15/700 → 58.0 × (17.1/15) ≈ 66.1px, inside 69px by **2.9px** | tight; a live measurement (chrome-devtools-mcp or the owner's phone) should confirm this before calling it closed |

**Verified live**, `curl -s --compressed http://localhost:3210/ar/protein/c9001`
against the running preview and the compiled stylesheet it serves
(`/@tanstack-start/styles.css?...`):
- The add slot's host still has no class, and now sits inside
  `.ox-card-product__add-slot`, confirmed structurally styleable regardless.
- `srcSet` on the plate image carries the `160/220/300` candidates.
- The compiled CSS contains `grid-template-columns: 48px 1fr` (4 occurrences:
  base + reduced-motion-safe duplicate paths), `.ox-card-product__buy`'s
  `@media (max-width: 767px)` block with `clip-path: polygon(0 8px, 5.4px 0,
  100% 0, 100% 100%, 0 100%)` and its `[dir='ltr']` mirror, and the base
  (768+) rule's own `clip-path: polygon(29.7px 0, 100% 0, calc(100% - 29.7px)
  100%, 0 100%)` (the full parallelogram, unchanged).
- 44 occurrences of the new `.ox-card-product__add-slot > *`-anchored rules
  are present in the live stylesheet.
- The dev server dropped its listening socket mid-verification (curl exit
  codes 28/56/7, no `LISTEN` entry on 3210) independently of this edit — not
  started or stopped by this session — and came back on its own inside the
  retry loop the task's own instructions describe; the checks above are from
  the recovered server.

---

## 3. Claims gates, as built

| Line | Gate implemented |
|---|---|
| saving badge | unchanged: `product.is_on_sale && regular_price > sale_price`, `discount_percentage` printed verbatim via the existing `savingPercent()`, falling back to `savingOf()`'s riyal amount |
| compare-at price | unchanged, `product.is_on_sale` only |
| كمية محدودة | new: `can_show_remained_quantity === true && is_hidden_quantity !== true && typeof quantity === 'number' && quantity > 0 && quantity <= 5`; the number itself is never interpolated into the string |
| جديد | unchanged, `isNewProduct(product)` off a real `created_at` |
| نباتي / منخفض السكر / خالي من الغلوتين | new on the card: `bandBadges(product)[0]`, off `product.tags` only, never the name |
| الصلاحية {date} | unchanged gate, now folded into the capped badge-priority list |
| نفدت الكمية | unchanged, `is_out_of_stock \|\| status === 'out'` |
| spec line | new: `cardSpecLine()`, off `parseSpecLine(product.description)` and `product.weight`, the same parser the PDP's own chips use |
| notify-me vs unavailable | new: `Boolean(product.notify_availability) \|\| status === 'out-and-notify'` for the notify branch; the honest "unavailable" button otherwise, `aria-disabled`, never `<button disabled>` |
| منتج أصلي | not touched; the card never carried this line and still does not |

Max two badges on any card, in the section 6.2 priority (out of stock
suppresses all others on its own): saving, new, tag, expiry.

---

## 4. Measurements, at 390 (2-up) and 1440 (4-up)

Card outer/content and the base row heights are the grid's own numbers,
unchanged by this batch (306/272 and 171/137, confirmed against the live
compiled CSS and S3a's own prior verification — this batch did not touch
`.ox-grid-products`). What this batch changed:

| Row | 390 | 1440 | Note |
|---|---|---|---|
| Plate | 137×137 | 272×272 | unchanged (S3a's own fix), re-verified live: no `max-block-size` on `.ox-card-product__plate` |
| Brand (conditional) | 18 | 18 | new render path; not reserved when absent (verified: `.ox-card-product__brand` absent from the DOM, not merely empty, when `product.brand` is unset) |
| Title | 44 min | 46 min | new 1024px breakpoint added in `_b4-listing.scss` |
| Spec line | 18, always reserved | 18 | new content (`cardSpecLine`), same reserved row the old pitch line used |
| Price | 30 | 32 | unchanged |
| Stock line (conditional) | 18 | 18 | new; not reserved when absent |
| Variant chips | 32, always reserved | 32 | unchanged |
| Action, mobile (<768) | qty 40 full width, then `48px 1fr` (add / buy) at 44 | n/a | `48px`/`1fr` is the coordinator's fixed-column fix, §2 |
| Action, desktop (≥768) | n/a | add 156 + stepper 108 on one 44px row, buy-now 272 full width below at 44, parallelogram unchanged | unchanged from the pre-existing desktop grid |
| Sold-out body | `min-block-size: 252px` | `min-block-size: 260px` | new — DIRECTION 4.4's equal-height mechanism, computed from the spec's own base-height arithmetic (title+spec+price+chips+gaps+one 44px control) |

**Equal height, the mechanism that was missing.** DIRECTION 4.4 is described
in the spec as already using `margin-block-start: auto` on the action block,
but it did not exist anywhere in the shipped CSS before this batch — verified
by reading `.ox-card-product__action` and `.ox-card-product__body` in full.
Added: `.ox-card-product__body { flex: 1 1 auto; }` and
`.ox-card-product__action { margin-block-start: auto; }` (`_b3-product.scss`,
my card-rules scope). Without this, a card with no brand row would sit 26px
of blank space *after* its action row rather than aligning that row with a
neighbour that has a brand line, since the outer card is what the grid
stretches, not the inner flex column. This is a real, needed fix, not
speculative: it is what makes verification item 11 (equal heights across a
brand/no-brand mixed row) and the sold-out card's own equal-height
requirement (item 16) actually hold.

---

## 5. Findings 2, 4, 5, 6 (S3c's, in my area)

- **Finding 2** (CTA overhang): fixed. `.ox-card-product__buy` (the Link
  variant) now carries `inline-size: calc(100% - 16px)` alongside its
  existing `margin-inline: 8px`, matching the `--native` variant's own
  already-correct pattern. Verified in the compiled CSS.
- **Finding 4** (plate ratio): already fixed by S3a before this batch; only
  re-verified, not re-touched.
- **Finding 5** (hover image always in the DOM): fixed. `useHoverCapable()`
  gates the second `<Image>`; confirmed live, `curl` shows zero
  `ox-card-product__img--hover` occurrences in the SSR HTML. `CARD_IMAGE_
  WIDTHS` capped at `[160, 220, 300]` (was `[150, 300, 500]`), confirmed live
  in the rendered `srcSet`.
- **Finding 6** (hover translate): fixed. `.ox-card-product:hover { transform:
  translateY(-2px) }` removed; replaced with a `border-color` transition per
  spec section 7, plus a `prefers-reduced-motion: reduce` override (new —
  the spec's own reduced-motion table required it and no existing rule
  covered `.ox-card-product`; `_primitives.scss`'s own reduced-motion
  section, which is out of this batch's file scope, does not name this
  family).
- **Finding 8** (contrast): explicitly out of my area per the brief
  (S4b, typography and contrast); the buy-now label reads `--ox-on-accent`
  everywhere on the card and nothing here hardcodes a colour.

---

## 6. Deviations and flags

- **Owner override applied over the spec's own text.** CARD §6.1 names the
  saving badge's notch as the card's one angled primitive; the owner's
  instruction (recorded in the task brief) keeps buy-now's parallelogram as
  the one primitive instead and makes the badge stack, including the saving
  badge, straight-edged. Implemented as instructed; recorded here per "read
  back and compare."
- **The coordinator's mid-task correction narrows that override for mobile
  only**: buy-now trades its parallelogram for the small `ox-x-corner`
  corner cut on the shared mobile row (§2), because the parallelogram is
  geometrically illegal there (X-IDENTITY §2.4) independent of the class
  bug. Desktop and the general Link-variant rule keep the full parallelogram.
- **`--native` (quick-buy) variant not given the same slot treatment.** It is
  unreachable on this catalogue (`can_quick_buy` is false on all 47
  products, unchanged fact from S3a's own note) and the coordinator's
  message did not name it. Flagged rather than fixed: the day quick buy is
  switched on, `.ox-card-product__buy--native`'s own class is subject to the
  identical SSR-class bug this batch just fixed for the add button, since it
  goes through the same `SallaAddProductButtonCore` wrapper. The `@media
  (max-width: 639px)` padding tier for `--native` was left in place
  unmodified; its own mobile-row sizing was not re-derived for the `48px
  1fr` grid, also flagged for the same reason.
- **Skeleton (`_b4-listing.scss` section 6, `LoadMore`) not updated.** CARD
  §10 asks for the skeleton to mirror the loaded card's own new row set and
  heights; that CSS lives outside section 12, which is the only part of
  `_b4-listing.scss` this batch was given. Not touched; flagged for whichever
  batch owns that section.
- **Intermediate breakpoints (640–1023, 1024–1279-with-rail) approximated.**
  The title's 46px min-block-size and the sold-out body's 260px min-block-size
  both key off `min-width: 1024px`, the same threshold the existing 4-up grid
  already uses, rather than a bespoke breakpoint for the "1024–1279 with
  rail" tier CARD §2.3 lists separately (card 288, content 254). This costs
  that tier a few px of unused reserved space, never a visual break; done to
  keep the responsive surface to two tiers matching what this batch's own
  effort could verify, per the task's own instruction to write the
  390/1440 measurements.
- **The spec line is rendered as one `<Bdi>`-wrapped string**, not with the
  pack-size segment individually isolated, since `cardSpecLine()` returns a
  joined string rather than structured parts. Matches the prior pitch line's
  own bidi treatment; flagged as a simplification against the spec's literal
  "wrap the pack size in `<bdi>`" wording.
- **Pre-existing type error fixed in passing**: `Price amount={saving}` where
  `saving: number | null` against a `string | number | undefined` prop,
  present in the committed baseline before this batch (confirmed via `git
  diff HEAD`/`git show HEAD:...`), unrelated to the CARD spec but blocking a
  clean `pnpm typecheck`. Fixed with `saving ?? undefined` (the branch only
  renders when `saving !== null`, so this is a pure type coercion, no
  behaviour change).

---

## 7. Verification

- `pnpm typecheck` → `tsc --noEmit`, 0 errors.
- `pnpm vitest run tests/product tests/listing tests/common` → **34/34** in
  `OxProductCard.test.tsx` (15 new/rewritten), 441/444 passing overall; the 3
  failures are pre-existing and unrelated (`ExploreLinks.test.tsx`,
  `ListingPage.test.tsx` — absolute-vs-relative URL assertions on
  `FeaturedRail`/`ListingPage`, files this batch is explicitly forbidden from
  touching, S4c's area; confirmed via `git status`/`git diff` that this
  batch changed none of the files those tests cover, and the same 3 failures
  reproduce identically before and after this batch's reduced-motion edit).
- `pnpm vitest run tests/i18n.test.ts tests/i18n-keys.test.ts tests/i18n-claims.test.ts tests/i18n-merge.test.ts` → **43/43** passing.
- `pnpm check:rtl` → `320 file(s), 0 problem(s)`.
- `pnpm check:motion` → `320 file(s), 0 problem(s)`.
- `pnpm check:strings` → `314 file(s), 0 problem(s)`.
- `node scripts/check-copy.mjs locales/ar.json locales/en.json` → `2 file(s), 0 problem(s)`.
- `node scripts/check-claims.mjs` → `30 file(s), 0 problem(s), 4 allowlisted` (all four pre-existing "official-distributor" allowlist entries, unrelated to this batch).
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 315 file(s) scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `320 file(s), 0 problem(s)` (confirms the badge notch reset, the mobile `ox-x-corner` corner cut, and the removed `ox-angled()` calls all clear `one-angled-per-block`, `small-angle` and `focus-clipped`).
- `sass app/styles/06-ox/_index.scss` (direct compile, dart-sass, no framework in the loop) → exit 0, only the pre-existing `@import` deprecation notices, confirming the SCSS is syntactically sound independent of the dev server.
- Live preview, `http://localhost:3210/ar/protein/c9001` and `/ar/x/p1673105563`: both 200; the compiled stylesheet the server actually serves was fetched and grepped for the specific rules named in §2 and §5 above, all present.

### The spec's own verification list (§14), status

1. Copy/claims/i18n tests — green (§7 above).
2. Equal-height row — mechanism added (§4), not measured live pixel-for-pixel (no headless renderer in this environment); the arithmetic and the CSS both check out.
3. Card/content/base heights — unchanged grid, re-verified.
4. Plate square — unchanged (S3a), re-verified.
5. `currentSrc` at 300, <1.5MB — widths capped, confirmed live in `srcSet`; total byte verification needs a real network panel, not available here.
6. Hover image absent from DOM on touch — confirmed live (0 occurrences pre-hydration; `useHoverCapable()` stays `false` with no touch pointer, so it never mounts).
7. Buy-now flush — fixed and confirmed in compiled CSS (§5).
8. No stray `clip-path` — confirmed: badges reset to `none`; only buy-now (both variants) carries one.
9. `transform: none` on hover — confirmed, only `border-color` transitions now.
10–16. Rating/brand/spec-line/stock-line/saving/badge-cap/sold-out gates — unit-tested (§1, `OxProductCard.test.tsx`).
17–19. Keyboard order, DevTools audit, compositor probe — need a real browser; not verifiable in this environment, same limitation prior batches recorded.
20. Reduced motion — new override added (§5), `check-motion` green.
21. `--ox-on-accent` / 5.01:1 — token untouched (S4b's own scope, per this batch's constraints), read via `var()` only.
