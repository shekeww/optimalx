# S9j — the Google rating's five stars, filled (2026-09-25)

Owner: "the 5 stars reviews on google maps are appearing empty, they should
be full filled stars."

## 1. Root cause (confirmed before touching anything)

`StoreRating.tsx`'s `Stars` draws two rows of `<Icon name="star">`: a base
row (the empty outline, in the border colour) and an accent "fill" row
clipped to the rating's percentage width, meant to sit over the base row and
read as a solid gold star. `_primitives.scss`'s `.ox-gr__row--fill .ox-icon {
fill: currentColor }` was supposed to paint that second row solid.

It never could. `<use href="#ox-star">` clones `ox-sprite.svg`'s
`<symbol id="ox-star">` into a shadow tree that inherits CSS from the `<use>`
element — but `fill="none"` on the `<symbol>` itself is a **presentation
attribute**, not an inherited value, and a presentation attribute on the
referenced element always wins inside that shadow tree over a value the
outer document's stylesheet tries to inherit in. So `fill: currentColor` on
`.ox-icon` never reached the star's path; both rows always rendered as plain
outlines, and the "fill" row's only visible effect was its `color:
var(--ox-accent)` painting the (invisible) stroke, not a fill.

## 2. The fix: a generated solid twin, not a CSS rule

CSS cannot win this fight from outside the `<use>` boundary, so the fill has
to be a presentation attribute on the symbol itself — a second star symbol,
`ox-star-fill`, with `fill="currentColor"` baked in. Per the standing rule for
this sprite, nothing is hand-added to `ox-sprite.svg`: it goes through
`scripts/import-owner-icons.mjs`, generated.

`star` is not one of the owner's 47 delivered icons (checked
`optimal-x-icons/icons.json` — no `star` entry), so the existing `ALIASES`
map (owner-manifest-name -> our id) could not source it as-is. The alias
mechanism now supports two things it did not before:

- **An alias can source from an existing sprite symbol, not only an owner
  manifest icon.** `generate()` tries the manifest first (`iconByName`, the
  four existing aliases); when an alias's source name isn't there, it falls
  back to whatever `ox-{name}` already exists in the sprite on disk
  (`existingSymbolsById`) and renders through the new `renderSpriteAlias()`,
  which wraps that symbol's own body in a synthetic root (carrying its own
  viewBox) and feeds it through the same `renderOwnerSymbol()` pipeline —
  so both alias paths get the same shell guarantees.
- **An alias can carry attribute overrides.** `renderOwnerSymbol()` took a
  hardcoded `fill="none" stroke="currentColor"` before; those two are now
  `PAINT_DEFAULTS`, overridable by a new last-merged `attrOverrides` param.
  `ALIAS_ATTRS = { 'star-fill': { fill: 'currentColor' } }` is the only
  entry today.

`ALIASES` gained one entry: `'star-fill': 'star'`. Because `OWNER_EXEMPT` in
`tests/common/sprite.test.ts` is built from `ALIASES`' keys already, adding
this one entry is what puts `ox-star-fill` into that exemption set — no
other exemption logic changed.

`star` itself is untouched and still carried forward unchanged every run
(it is not an `ALIASES` key, only a value), so `star-fill` re-derives from
the same source on every regeneration — verified idempotent (§4).

## 3. Files changed

- `scripts/import-owner-icons.mjs` — `ALIAS_ATTRS` (new); `ALIASES` gained
  `star-fill: star`; `renderOwnerSymbol()` takes a 5th `attrOverrides` param,
  `PAINT_DEFAULTS` replaces the hardcoded `fill`/`stroke` literals;
  `renderSpriteAlias()` (new) — the existing-sprite-symbol alias path;
  `generate()` rewired so `existingSymbolsById` is read once, before the
  alias loop, and the alias loop falls back to it when a source isn't in the
  manifest; header/module comments updated to describe the fifth alias.
- `app/assets/ox-sprite.svg` — regenerated (`node
  scripts/import-owner-icons.mjs`): adds `<symbol id="ox-star-fill"
  fill="currentColor" stroke="currentColor" …>` with `star`'s exact path,
  no `data-mirror` (never mirrors). 34215 bytes, still under the 64 KB
  ceiling.
- `app/components/common/Icon.tsx` — `star-fill` added to
  `OX_UI_ICON_NAMES`, next to `star`; not added to
  `OX_MIRRORED_ICON_NAMES`.
- `app/components/common/StoreRating.tsx` — `Stars`' fill row now renders
  `<Icon name="star-fill">`; the base row is unchanged (`name="star"`).
- `app/styles/06-ox/_primitives.scss` — `.ox-gr__row--fill .ox-icon { fill:
  currentColor }` removed (it never worked and never could); `color:
  var(--ox-accent)` kept, with a comment on why the fill now lives on the
  symbol instead.
- `tests/common/sprite.test.ts` — symbol-count assertions updated (94→95
  standard, 95→96 total distinct ids, `OX_ICON_NAMES` 94→95); the "stroke
  contract" test gets one precise, named exemption
  (`FILL_OVERRIDDEN = new Set(['ox-star-fill'])`) asserting that id's fill is
  `currentColor` rather than the shared `none` default — every other
  assertion in the file (accent-share, angle, live-area, primitive-shape,
  caps/joins) already excludes `star-fill` for free through the existing
  `OWNER_EXEMPT` set, since it is now one of `ALIASES`' keys.
- `tests/scripts/import-owner-icons.test.ts` — imports `ALIAS_ATTRS` and
  `renderSpriteAlias`; three new unit tests: `renderOwnerSymbol` honours an
  attribute override (and leaves `fill="none"` alone when none is given),
  `renderSpriteAlias` copies an existing symbol's body with the override
  applied, and a `generate()`-level check that the committed sprite's
  `ox-star-fill` is `fill="currentColor"` with `star`'s exact path data.
- `tests/content/social-proof.test.tsx` — one new `StoreRating` test:
  the base row's five `<use>` elements point at `#ox-star`, the fill row's
  five point at `#ox-star-fill`.
- `docs/build/progress/visit/s9j-rating-1440.png` (new) — screenshot, §5.

## 4. Verification (paste of real output)

```
$ node scripts/import-owner-icons.mjs
import-owner-icons: wrote app\assets\ox-sprite.svg (34215 bytes)

$ node scripts/gen-icon-mask.mjs
gen-icon-mask: wrote --ox-cart-glyph from #ox-cart to app\styles\tokens.css
# (no diff: ox-cart untouched by this batch)

$ pnpm typecheck
$ tsc --noEmit
(clean, no output)

$ pnpm vitest run tests/common tests/scripts tests/product tests/pages
 Test Files  47 passed (47)
      Tests  699 passed (699)

$ pnpm vitest run tests/content
 Test Files  5 passed (5)
      Tests  85 passed (85)

$ node scripts/check-identity.mjs
check-identity: 337 file(s), 0 problem(s)

$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 331 file(s) scanned, 0 problem(s)
```

`curl http://localhost:3210/ar/branch` (preview not restarted — `curl
http://localhost:3210/ar` returned 200 in 0.21s afterward, same process):

- `ox-star-fill` appears 3 times total: once as the generated `<symbol
  id="ox-star-fill" viewBox="0 0 24 24" class="ox-sym" fill="currentColor"
  stroke="currentColor" stroke-width="2" stroke-linecap="square"
  stroke-linejoin="miter" stroke-miterlimit="4">` in the inlined sprite, and
  once per `StoreRating` instance on the page as `href="#ox-star-fill"` (the
  branch page renders it twice — a `rail` and an `inline` variant — each
  with 5 `<use href="#ox-star">` in the base row and 5 `<use
  href="#ox-star-fill">` in the fill row: 20 `<use>` elements total, verified
  by exact count).

## 5. Screenshot

`chrome-headless-shell` over raw CDP (a WebSocket client using Node 22's
built-in `fetch`/`WebSocket`, no npm package — the S8f technique), port
9987, fresh `--user-data-dir`, killed after the run (`tasklist` confirmed
clean). Navigated to `/ar/branch` at 1440×1200, waited for the rating's
bounding box to stabilise across repeated reads (images below the fold were
still shifting layout on first read), then captured a full-page PNG and
cropped it locally to the rating's box (`Page.captureScreenshot`'s own
`clip` parameter returned the wrong region in this browser build — captured
a diagonal slice of the hero cover instead of the rating row, at identical
math; cropping a full screenshot in Node instead, verified against the same
box coordinates, was reliable and is what shipped).

`docs/build/progress/visit/s9j-rating-1440.png`: "5.0 ★★★★★ تقييم المتجر على
خرائط جوجل 80 تقييم" — five fully filled orange stars, no outline-only
gaps.

## 6. Deviations from the brief

- The brief's phrasing ("ox-star-fill is the owner's star path") assumes
  `star` is one of the owner's 47 delivered icons. It is not (verified
  against `optimal-x-icons/icons.json` and `optimal-x-icons/svg/`) — `star`
  is one of the sprite's own "remaining symbols," carried forward unchanged
  since before the owner's icon delivery. The alias mechanism was extended
  to source from an existing sprite symbol as a fallback (§2) rather than
  from an owner file, since there is no owner file for a star. The
  functional result is exactly what was asked: a generated, never-hand-
  edited `ox-star-fill` alias with `fill="currentColor"` and `star`'s exact
  stroke.
- `Page.captureScreenshot`'s `clip` parameter did not crop to the requested
  region in this `chrome-headless-shell` build (see §5) — worked around with
  a local, dependency-free PNG crop of a full-page capture rather than
  guessing at CDP flags further; recorded rather than silently retried.
