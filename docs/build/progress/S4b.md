# S4b — weight floor and ink-on-accent (2026-09-23)

Scope: two global items only. Item 1, raise the minimum font weight so no
text renders too light to read, especially on dark grounds. Item 2, put ink
(not white) on every accent-filled control so the label clears WCAG AA
regardless of size. Constraints held: only `app/styles/tokens.css`,
`app/styles/06-ox/*.scss` weight/colour declarations, and this file were
touched; `.ox-iconbtn--angled` in `_primitives.scss` (a sibling builder's
region) was read but not edited; no layout/geometry rule was changed.

---

## Item 1 — weight floor

### What was already true on entry

`app/styles/tokens.css`'s `--ox-w-*` ladder was **already** at the floor this
batch was asked to establish — its own comments record two earlier raises
(2026-09-20: 350→400, then 400→500) that predate this batch. No token value
needed to change:

| Role | Token | Root (paper) | `.ox-band-dark` | Used for |
|---|---|---|---|---|
| Open | `--ox-w-open` | 500 | 550 | lead role (`.ox-lead`), hero sub-line |
| Read | `--ox-w-read` | 550 | 600 | body/small role (`.ox-body`, `.ox-small`), running copy |
| Quiet | `--ox-w-quiet` | 550 | 550 (not redeclared — already clears 450) | captions, meta, was-price, table heads |
| UI | `--ox-w-ui` | 600 | 600 | buttons, labels, chips, nav, form labels |
| Title | `--ox-w-title` | 700 | 700 | headings, prices, product/card names, primary button labels |
| Statement | `--ox-w-stmt` | 800 | 800 | display headline |
| Figure | `--ox-w-figure` | 900 | 900 | prices, counts, ratings |

Both stated floors hold structurally: every role is ≥500, and every role a
`.ox-band-dark` redeclares lands at ≥550, comfortably over the 450 dark-ground
floor. There is no 300-weight role in the ladder today (lightest is 500), so
the brief's "raise 300→400" sub-instruction has nothing left to raise.
`tailwind.config.cjs`'s `fontWeight.{open,read,quiet,ui,title,stmt,figure}`
all read `var(--ox-w-*)` (not literals), so no drift is possible there either.

A full grep of every `font-weight:` declaration in `app/styles/06-ox/*.scss`
(160+ call sites) found **zero literal `300` or `400`** — every declared
weight already reads a `--ox-w-*` token or is 600/700/800 direct. The actual
defect (the owner's screenshot: dark-band card sublines and a footer line
reading thin) was never a stray literal; it was four rules that set a muted
colour and **no `font-weight` at all**, so the browser's UA default (400)
rendered silently. Each was found by cross-referencing every `06-ox` rule that
paints `--ox-fg-2`/`--ox-fg-3`/`--ox-ink-*-on-dark` against its own component
TSX, to separate "text with no weight because a role class supplies it in
markup" (fine) from "text with no weight anywhere" (the bug).

### The four fixes

| Selector | File | Before | After | Why it was live |
|---|---|---|---|---|
| `.ox-services__subline` | `_b2-home.scss` | no `font-weight` (renders 400) | `font-weight: var(--ox-w-read)` → 600 (section carries `.ox-band-dark`) | The advisory band's own sub-line (`OxHero`'s sibling on `/`) carries no `.ox-*` role class in `OxServices.tsx`; every other text node in that component (`ox-h2`, `ox-small`) does. This is the "dark services band" text the screenshot shows. |
| `.ox-tile__line` | `_b2-home.scss` | no `font-weight` (renders 400) at `--ox-t-micro` (11.5–12px, <16px) | `font-weight: var(--ox-w-read)` → 550 | The home `CategoryTile` subline. Shared by every tint **and** by `.ox-tile--black` and the `vitamins-minerals` art card's dark-ink override — so the same rule was rendering too-light text on both light tints and near-black tiles. No role class in `CategoryTile.tsx`. |
| `.ox-cat-card__line` | `_b4-listing.scss` | same defect, same micro size | `font-weight: var(--ox-w-read)` → 550 | Exact duplicate of the tile bug on `/categories`' art-card variant (`CategoriesIndex.tsx`), including the same `vitamins-minerals` dark override. |
| `.ox-footer__numbers li` | `_b1-layout.scss` | no `font-weight` (renders 400) at 13px, footer (`.ox-band-dark`) | `font-weight: var(--ox-w-read)` → 600 | The footer's CR/VAT registration line (`RegistrationBlock.tsx`) — a plain `<li><span>`, no role class, on the footer's near-black band. Best match for "the disclaimer line" in the brief. |

Two look-alikes were checked and are **not** bugs (already correct, left
untouched): `.ox-plan__line` and `.ox-services__note` both carry `.ox-small`
in their TSX (`PlanCard.tsx`, `OxServices.tsx`), which resolves through
`.ox-band-dark` to 600; `.ox-cat-card__desc` carries `.ox-small` too
(`CategoriesIndex.tsx`); `.ox-certs__legal` carries `.ox-small` and its band
is a verify-green tint at 550, also clear of the floor.

---

## Item 2 — ink on accent

### The token

`app/styles/tokens.css`:

```diff
- --ox-on-accent: #FFFFFF;
+ --ox-on-accent: var(--ox-ink);   /* #12171E */
```

Computed (WCAG relative luminance, sRGB):

| Pairing | Contrast | Passes 4.5:1 (normal text)? | Passes at 18.66px+/700 (large text)? |
|---|---|---|---|
| `#FFFFFF` on `#F54915` (previous) | 3.59:1 | No | Yes |
| `#12171E` on `#F54915` (new) | **5.01:1** | **Yes** | Yes |

The previous fix attempt (a prior batch's `--ox-btn-primary-size: calc(19px *
0.9)` = 17.1px) still sits under the 18.66px large-text carve-out white would
have needed, so the global primary label was still failing AA on entry. Ink
clears AA outright, at any size or weight, so no size floor is needed to keep
the pairing legal — the fix is in the colour, not the geometry, matching the
"never touch layout/geometry" constraint.

### Contrast per accent-filled control, at its real size and weight

| Control | Selector(s) | Size | Weight | Colour | Contrast | AA? |
|---|---|---|---|---|---|---|
| Hero CTA, PDP/sticky buy-now, card buy-now (Link + native quick-buy), mobile checkout-bar button, add-to-cart toast primary — all `ox-primary-face` | `.ox-btn--primary`, `.ox-buy__now`, `.ox-card-product__buy`, `.ox-card-product__buy--native .s-button-element`, `.ox-checkout-bar__btn`, `.s-add-product-toast__button--primary` | 17.1px (`--ox-btn-primary-size` = 19px × 0.9) | 700 (`--ox-w-title`) | ink `#12171E` | **5.01:1** | Yes |
| Cart count pill / count-bump pill | `.s-cart-summary-count`, `.ox-count` | 12px | 900 (`--ox-w-figure`) | ink | **5.01:1** | Yes (previously 3.59:1 at a size nowhere near the large-text exemption — this was the worst offender before the fix) |
| Nutrition "show more" dot | `.ox-nutrition__more-icon` | icon only, no label | n/a | ink | **5.01:1** | Yes (graphical-object floor is 3:1; comfortably clear) |
| Native Salla checkout button | `#cart-submit` / `salla-button` (`.s-button-element` the engine renders) | Salla's own default | Salla's own default | Salla's own `--color-primary-reverse` (dashboard-controlled) | not ours to compute | **Deliberately untouched — see Deviations** |
| Arrow icon-buttons on cards (not text) | `.ox-tile__arrow`, `.ox-cat-card__arrow`, `.ox-plan__arrow` | icon glyph | n/a | `--ox-tile-arrow` (accent-dark on tints, accent on black/dark tiles) or `--ox-accent-dark` | unaffected | Verified: none reference `--ox-on-accent` |
| Accent straps, wedges, rules, watermarks | `.ox-hero__edge`, `.ox-hero__wedge`, `.ox-services__motif`, `.ox-footer__wedge*`, `.ox-poster__rule`, etc. | decorative, no label | n/a | `--ox-accent` fill, no text | unaffected | Verified: none reference `--ox-on-accent`; confirmed by a full-file grep of every `background: var(--ox-accent)` call site |

No control still fails 4.5:1: ink on `#F54915` is 5.01:1 regardless of the
label's point size or weight, so every consumer of `--ox-on-accent` is fixed
by the one token change. The single control this table does **not** bring
under our contrast control is the native Salla checkout button — see below.

Stale comments describing the old "white label, 19px/700 size-floor"
reasoning were corrected in place wherever they sat next to code this batch
touched (`tokens.css`, `_primitives.scss`'s `ox-primary-face`/`.ox-btn--primary`,
`_b4-listing.scss`'s card buy button and native quick-buy variant,
`_b3-product.scss`'s sticky bar and buy-now sections, `_b6-commerce.scss`'s
add-to-cart toast, `_b2-home.scss`'s campaign CTA), so the documentation
matches the new mechanism rather than describing a size floor that no longer
governs the pairing.

---

## Deviations

1. **Native Salla checkout (`#cart-submit` / `salla-button`) is deliberately
   not restyled.** CLAUDE.md: "Checkout, cart logic and search stay Salla's."
   `_b6-commerce.scss`'s cart section only sizes this control
   (`.cart-submit-wrap salla-button, #cart-submit { inline-size: 100%; }`); it
   never repaints its fill or label, so it renders in Salla's own
   `--color-primary-reverse` (dashboard-controlled), not `--ox-on-accent`.
   Bringing it under our ink fix would mean styling a native checkout control,
   which the project rule forbids. The mobile `.ox-checkout-bar__btn` (our own
   sticky bar, not the native form button) **is** covered, via
   `.ox-btn--primary`.
2. **No accent-filled chip exists today.** The brief's control list names
   "chips" among the surfaces needing ink; the current chip system
   (`.ox-chip`, `.ox-badge`, filter chip `is-selected`) fills with `--ox-ink`,
   `--ox-go-soft`, `--ox-note-soft`, `--ox-stop-soft`, or `--ox-plate` — never
   a solid `--ox-accent`. Nothing to fix; the token change future-proofs one
   if it is ever added.
3. **`--ox-btn-primary-size` (0.9 × 19px) was left unchanged.** Item 2 is
   implemented through colour, per the brief ("Implement it through
   `--ox-on-accent`"); the sizing ratio is a separate, already-shipped owner
   instruction unrelated to contrast now that ink clears AA at any size, and
   changing it would be a geometry edit outside this batch's constraints.
4. **Three `font-weight: 400` declarations remain in the compiled CSS**
   (verified by compiling `app/styles/app.scss` directly and grepping the
   output): a `body` reset and an `h5.subtitle` rule in the inherited
   `02-generic`/`03-elements` Salla scaffold, and `.virtooal--details--desc`
   in a `04-components` Salla quick-view widget. All three sit in the layers
   `check-identity.mjs`'s own `ALLOWLIST` names as "inherited Raed scaffolding
   only... not ours to rewrite," and are outside this batch's file scope
   (`tokens.css` and `06-ox` only). No `font-weight: 300` exists anywhere in
   the compiled output.

---

## Verification tails

`pnpm typecheck`:
```
$ tsc --noEmit
(clean exit)
```

`pnpm vitest run tests/common tests/layout tests/home tests/product`:
```
 Test Files  39 passed (39)
      Tests  482 passed (482)
```

`pnpm check:rtl`:
```
check-rtl: 315 file(s), 0 problem(s)
```

`pnpm check:motion`:
```
check-motion: 315 file(s), 0 problem(s)
```

`pnpm check:strings`:
```
check-strings: 309 file(s), 0 problem(s)
```

`node scripts/check-tokens.mjs`:
```
check-tokens: 123 token(s) defined, 312 file(s) scanned, 0 problem(s)
```

`node scripts/check-identity.mjs`:
```
check-identity: 315 file(s), 0 problem(s)
```

`npx sass app/styles/app.scss` (direct compile, no build wrapper):
```
(compiles clean — only Dart Sass's own @import deprecation warnings, no errors)
```

`grep -nE "font-weight:\s*(300|400)\b"` on the compiled output:
```
body { font-weight: 400; }                       -- 02-generic (Salla scaffold, allowlisted)
h5.subtitle { font-weight: 400; }                 -- 03-elements (Salla scaffold, allowlisted)
.virtooal--details--desc { font-weight: 400; }    -- 04-components (Salla scaffold, allowlisted)
```
(three hits, all outside `06-ox`/`app/components`; zero `font-weight: 300`
anywhere; zero hits inside `06-ox`.)

---

## Files changed

- `app/styles/tokens.css` — `--ox-on-accent` from `#FFFFFF` to `var(--ox-ink)`; rewrote the adjacent contrast comment.
- `app/styles/06-ox/_primitives.scss` — updated `ox-primary-face`/`.ox-btn--primary` comments to describe ink, not a white size-floor (no code changes to the mixin body besides the comments; `.ox-iconbtn--angled` untouched, per constraint).
- `app/styles/06-ox/_b2-home.scss` — `.ox-services__subline` and `.ox-tile__line` gain `font-weight: var(--ox-w-read)`; stale white-on-accent comment on `.ox-campaign__cta` corrected.
- `app/styles/06-ox/_b4-listing.scss` — `.ox-cat-card__line` gains `font-weight: var(--ox-w-read)`; stale white-on-accent comments corrected on the card buy button and its native quick-buy variant.
- `app/styles/06-ox/_b1-layout.scss` — `.ox-footer__numbers li` gains `font-weight: var(--ox-w-read)`.
- `app/styles/06-ox/_b3-product.scss` — stale white-on-accent comments corrected on the sticky bar's add-to-cart button and the buy-now section.
- `app/styles/06-ox/_b6-commerce.scss` — stale white-on-accent comment corrected on the add-to-cart toast's button pair.
- `docs/build/progress/S4b.md` — this report.
