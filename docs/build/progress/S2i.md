# S2i, correcting the `/categories` art type card (three defects from S2h, 2026-09-23)

Batch: fix three measured defects on the six art-photograph type cards at
`/ar/categories` (S2h shipped these six cards with a broken layout) without
touching the home tile, tokens, the motif file or locales.

## Files

- `app/styles/06-ox/_b4-listing.scss`, section "14b. The art type card"
  rewritten (`.ox-cat-card--art`, a new `.ox-cat-card--art .ox-cat-card__link`
  rule, `.ox-cat-card__art`'s clip-path and its `[dir='ltr']` mirror, the
  `@media (min-width: 1024px)` corner-cut upgrade) and `.ox-cat-card__children`
  gets one new declaration (`margin-block-start: auto`). No other section
  touched.
- `tests/listing/CategoriesIndex.test.tsx`, one new test locking in the
  positioning-scope fix (§ below): the art card's `__body` (and its foot)
  sits inside the SAME `.ox-cat-card__link` the artwork does, and `__desc`
  stays a sibling outside it, same as the tinted card.
- `app/components/listing/CategoriesIndex.tsx`, **not touched.** All three
  defects were CSS-only; the JSX already put `__desc`/`__children` outside
  `.ox-cat-card__link` (same place for both variants), so no structural
  change was needed to fix any of them. Read, not written.

## The three defects, root cause, and the fix

### 1. The description collides with the count + arrow foot

`.ox-cat-card__body` (icon/name/line/foot) is `position: absolute;
inset-block: var(--ox-3)`. S2h's `.ox-cat-card__link` carried no `position`
of its own, so the browser resolved `__body`'s containing block up to the
nearest positioned ancestor, `.ox-cat-card` itself (`position: relative`),
whose flow height is the SUM of the artwork + `__desc` + `__children`, not
just the artwork. `inset-block`'s bottom offset therefore measured from the
card's true bottom (past the description), not from the bottom of the
photograph, so the foot (count + arrow) rendered down inside/behind the
description paragraph instead of at the photograph's own foot.

**Fix:** `.ox-cat-card--art .ox-cat-card__link { position: relative; }`.
`.ox-cat-card__link` wraps only the artwork + `__body` in the JSX (for both
variants, `__desc`/`__children` are siblings after it), so this scopes
`__body`'s containing block to exactly the photograph, matching the home
tile's own `.ox-tile` (which has no separate desc/children sibling to worry
about, so never needed this). New test:
`tests/listing/CategoriesIndex.test.tsx`, "scopes the art card body to its
own link…" asserts `link.contains(art)`, `link.contains(body)`, and
`link.contains(desc) === false`.

**Deviation, accepted:** `.ox-cat-card__link::after` (the stretched
pseudo-element that makes the whole tinted card clickable, not only the
link's own box, relies on the same "no position on `__link`" mechanism,
escalating to `.ox-cat-card`) is now scoped to just the artwork block for
ART cards specifically, since `.ox-cat-card--art .ox-cat-card__link` is now
positioned. Previously the empty space over `__desc`/`__children` on an art
card was also part of the click target; now only the photograph and the
chips (each their own link) are. Chose the narrower, single-selector fix
over moving `::after` from `.ox-cat-card__link` to `.ox-cat-card` (which
would have kept the old click area but touches shared code every one of the
four tinted, non-art cards also depends on), out of scope for three CSS-only
defects on six cards.

### 2. Ragged row heights (dropped frame, `align-self: start`)

`.ox-cat-card--art` set `align-self: start; block-size: auto;` (opting out
of `.ox-cat-index__grid`'s `align-items: stretch`) and `border: 0; background:
none;` (dropping the tinted card's own 1px frame). A row could mix a 509px
tinted card (protein: link 200 + desc 67 + children 200, the tallest sibling)
with 426px art cards top-aligned beside it.

**Fix:** removed `align-self`, `block-size`, `border` and `background` from
`.ox-cat-card--art` entirely, so the base `.ox-cat-card` rule's own
`block-size: 100%` (stretch to the row) and `border: 1px solid
var(--ox-line-3)` / `background: var(--ox-fill)` (or the live tint class,
e.g. `.ox-cat-card--ash`, `.ox-cat-card--sand`) apply unmodified, the art
card is now styled by exactly the same base rule the tinted card is, with
only `padding: 0` (so the artwork runs edge to edge) and `border-radius: 0`
(reasoning in defect 3) as its own additions. `.ox-cat-card__children` gets
`margin-block-start: auto` so that WHEN a card's own content is shorter than
its row's tallest sibling, the chips block (the last item in the column)
absorbs the difference instead of leaving a gap between `__desc` and the
card's bottom edge, the "chips region takes the slack" requirement. (Today
only `protein`, a tinted card, ever renders `__children`, none of the six
art slugs carry taxonomy children, so this rule is presently inert for art
cards themselves and defensive for future data; it is not a hypothetical
for `protein`, which is what sets the row height other art cards stretch
to match.)

### 3. No edge against the cream page (white-ground artwork)

Caused by the same `border: 0; background: none;` as defect 2, removing
them (fix above) restores the tinted card's own 1px `var(--ox-line-3)` frame
around the art card, visible against the page regardless of how light the
photograph's own edge pixels are. (The batch brief's own prose says "1px
`--ox-line` frame"; the token actually in use by the tinted card and by the
home tile's own `::before` is `--ox-line-3` (`#86868A`), `--ox-line` itself
is `#ECECEB`, nearly the same value as `--ox-fill`/the page ground, and would
not produce a visible edge at all. Matched the tinted card's real, already-
shipped border colour rather than the lighter token the literal name
suggests, per "the SAME outer structure as the tinted card.")

## The notch / corner cut on the artwork itself

`.ox-cat-card` never carried an X-IDENTITY angled gesture before this batch
- it uses `border-radius: var(--ox-r-2)` (8px) for its corners, unlike the
home tile's `.ox-tile` (no `border-radius` anywhere, corners are square or
notched/cut only). Per "clipped with the card's own notch or corner cut
exactly as the home tile shares its clip with `::before`," added a clip-path
to `.ox-cat-card__art` alone (the outer `.ox-cat-card` frame keeps its plain
rounded rect, "the SAME outer structure as the tinted card", so the two
were never merged into one shared clip the way `.ox-tile::before`/
`.ox-tile__art` are, since a rounded outer frame and a `polygon()`-clipped
inner artwork cannot both stay each other's exact shape).

- **Below 1024 (390 2-up, 173×259.5, and 640 3-up): the notch**, `t 4px /
  j 12px`, the exact values `_b2-home.scss`'s own `.ox-tile` already ships
  (not X-IDENTITY §3.3's own flagged-but-unresolved `t4/j14.0`, which that
  document itself says needs an owner call before any card is moved to it -
  matching the home tile's shipped number, not re-opening that open question
  here).
- **From 1024 (1440 5-up, 234×351): the corner cut**, `lean 64px / run
  43.2px`, the exact values `_b2-home.scss`'s `.ox-tile` uses at its own
  4-up (1280+) tier. `/categories`'s own grid upgrades to 5 columns at 1024,
  not 1280 (a different rhythm than the home grid, per S2h's own prior
  deviation note on this page's floor), so the corner-cut upgrade is placed
  in the grid's own existing `@media (min-width: 1024px)` block rather than
  adding a new 1280px breakpoint the page does not otherwise have. This is
  an instruction from the batch brief ("use the notch, not the corner cut,
  at 2-up") applied at the page's own breakpoints, not a re-derivation of
  where the 158px law itself would bite (`.ox-cat-card__art`'s own
  `min-block-size: 260px` floor keeps every measured checkpoint well above
  158px at every width this grid renders, so `check-identity`'s static
  `small-angle` rule does not flag either tier, the notch/corner-cut split
  here is the brief's own design direction, not a lint requirement).
- `border-radius` removed from `.ox-cat-card__art` (dead once `clip-path` is
  set, a `polygon()` clip fully determines the box's rendered shape,
  `border-radius` no longer has any clipping effect once it is present).
  `.ox-cat-card--art`'s own `border-radius: 0` (not left at `--ox-r-2`)
  keeps the outer frame's un-clipped corners square too, so the frame edge
  and the artwork's own straight/notched edge align exactly at all three
  non-notched corners, an `overflow: hidden` trick to force-round the
  artwork down to a curved outer frame was considered and rejected: it would
  also clip `.ox-cat-card__link`'s own `:focus-visible` outline
  (`@include ox-focus(2px)`, `outline-offset: 2px`), which extends past the
  link's own box at exactly the boundary `overflow: hidden` would cut -
  X-IDENTITY §3.4's own `focus-clipped` warning, applied here even though
  the static checker does not reach this exact combination.

## Measurements derived

- **390, 2-up:** `.ox-page`'s content width = `390 − 2×16(--ox-gutter) =
  358`; grid gap `var(--ox-3) = 12`; card width `(358−12)/2 = 173`; art
  height at 2:3 = `173 × 1.5 = 259.5`, inside the existing `min-block-size:
  260px` floor (unchanged by this batch). Notch tier.
- **1440, 5-up:** `.ox-page`'s `max-inline-size: var(--ox-container) =
  1296px` binds (viewport > 1296); content width `1296 − 2×32(--ox-gutter at
  1024+) = 1232`; grid gap `var(--ox-4) = 16` (set at the 640 breakpoint,
  unchanged through 1024+); card width `(1232 − 4×16)/5 = 1168/5 = 233.6 ≈
  234px`, matches the batch brief's own measured "cards 234px wide."
  Art height `234 × 1.5 = 351px`. Corner-cut tier; run 43.2px is 18.5% of
  234px, inside X-IDENTITY §2.3's 24% budget.

## Deviations

- **`.ox-cat-card__link::after`'s stretched click target narrows for art
  cards** (defect 1 fix), see "Deviation, accepted" above.
- **`--ox-line-3`, not the literally-named `--ox-line`, for the frame**, see
  defect 3 above.
- **Notch `t4/j12`, not X-IDENTITY §3.3's own `t4/j14.0`**, matched the
  already-shipped home tile value, not the document's own flagged-open
  question, for the reason given above.
- **Corner-cut upgrade placed at this grid's existing 1024px breakpoint**,
  not a new 1280px one, this page's own rhythm, not the home grid's.
- **`app/components/listing/CategoriesIndex.tsx` left untouched** despite
  being in the batch's editable file list, all three defects were CSS-only
  once traced; no JSX change was needed to fix any of them (see "Files").

## Verification

`pnpm typecheck`:
```
$ tsc --noEmit
```
(no output, zero errors.)

`pnpm vitest run tests/listing tests/home`:
```
Test Files  26 passed (26)
     Tests  277 passed (277)
```
Includes `tests/listing/CategoriesIndex.test.tsx` (10/10, 1 new).

`pnpm check:rtl`: `check-rtl: 315 file(s), 0 problem(s)`
`pnpm check:motion`: `check-motion: 315 file(s), 0 problem(s)`
`pnpm check:strings`: `check-strings: 307 file(s), 0 problem(s)`
`node scripts/check-tokens.mjs`: `check-tokens: 123 token(s) defined, 312 file(s) scanned, 0 problem(s)`
`node scripts/check-identity.mjs`: `check-identity: 315 file(s), 0 problem(s)`

**Curl, `http://localhost:3210/ar/categories` (no `storeId` query needed -
preview already up):**
```
$ curl -s "http://localhost:3210/ar/categories" -o /tmp/cat.html
$ grep -a -o 'ox-cat-card--art' /tmp/cat.html | wc -l
6
```
(A naive `grep -a -c "ox-cat-card--art"`, counting matching LINES, not
occurrences, returns 1, since the SSR response is largely one line; the
brief's own literal command is the line-count form, but the occurrence count
is what the requirement means and is confirmed as 6 with `-o | wc -l`.)

Frame/desc/children classes on a live art card (creatine), confirmed in the
same response:
```html
<div class="ox-cat-card ox-cat-card--ash ox-cat-card--art" data-testid="ox-type-card"
     data-resolved="false" data-tone="ash" data-category="creatine">
  <a class="ox-cat-card__link" href="/ar/search?q=...">
    <img class="ox-cat-card__art" src="/categories/creatine.webp" .../>
    <span class="ox-cat-card__body">...<span class="ox-cat-card__foot">...</span></span>
  </a>
  <p class="ox-cat-card__desc ox-small">...</p>
</div>
```
`ox-cat-card` (the frame-bearing base class) and `ox-cat-card__desc` are both
present, outside `__link`, exactly as required. `ox-cat-card__children` does
not appear on ANY of the six art cards in this response, a pre-existing
taxonomy fact (only `protein`, not an art slug, carries children today), not
a regression; the selector and the new `margin-block-start: auto` rule exist
in the compiled CSS and will apply the moment an art slug gains children.

**Compiled CSS, fetched from the running dev server** (confirms the preview
process picked up the source edit live, not a stale bundle, the failure
mode `docs/build/progress/S2h.md` flagged for the home route):
```
$ curl -s "http://localhost:3210/@tanstack-start/styles.css?routes=..." -o /tmp/cat.css
$ sed -n '45994,46003p' /tmp/cat.css
.ox-cat-card--art {
  padding: 0;
  border-radius: 0;
  color: var(--ox-fg);
  --ox-cat-notch-t: 4px;
  --ox-cat-notch-j: 12px;
}
.ox-cat-card--art .ox-cat-card__link {
  position: relative;
}
```
Base `.ox-cat-card` rule confirmed still carrying `block-size: 100%;
background: var(--ox-fill); border: 1px solid var(--ox-line-3); border-
radius: var(--ox-r-2);` unmodified; the 1024px media block confirmed
carrying the `--ox-cat-lean: 64px; --ox-cat-run: 43.2px;` corner-cut upgrade;
`.ox-cat-card__children` confirmed carrying `margin-block-start: auto;`.
