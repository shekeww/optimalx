# S3b: owner review round 2026-09-23 — progress

Batch: the three screenshot items in the S3b brief (hero diagonal, goal-card
corner cuts, poster-card corner cuts), **plus a mid-task coordinator addendum**
that (1) revised items 2/3's corner placement and card corners, and (2) handed
this builder a fourth surface, the "تصفح حسب النوع" type tiles
(`CategoryTile`/`OxCategories`/`CategoriesIndex`). Both are folded in below,
in the order they were done.

---

## 1. Hero (640 and up): the photo's cut aligned with the strap

`app/styles/06-ox/_b2-home.scss`, `.ox-hero__photo` / `.ox-hero__scrim`, the
`@media (min-width: 640px)` blocks plus a new override inside the existing
`@media (min-width: 1024px)` block. Mobile (below 640) untouched, as
instructed — confirmed by diff, lines ~495-558 never touched.

**The construction.** The vertical-then-lean edge (X-IDENTITY §2.3's
full-height-diagonal budget) is replaced by one straight 34deg diagonal over
the FULL band height H, parallel to the strap (`.ox-hero__edge`, unchanged:
`inset-inline-end: 53%`, `inline-size: 20px`, `skewX(var(--ox-skew))`,
`inset-block: -12%`) and 16px inside its near edge at every height.

**Where 16px comes from, corrected against the brief's own derivation.** The
brief's text computed the strap's near edge as `53% − 10px`, treating
`inset-inline-end: 53%` as the strap's *centre*. That is not what the
property does: `inset-inline-end` pins the element's own inline-end edge
(physical left, this file's RTL default) at that offset, and `inline-size:
20px` extends the box from there toward inline-start — so **53% already is
the strap's near edge**, not its centre (confirmed against this file's own
prior comment, S2g: "the strap now sits exactly on the pane's own vertical
edge" — flush, zero gap, which only holds if 53% is the edge, not the
centre 10px away from it). Deriving the photo cut from the brief's `53% −
26px` would have produced a 26px gap, not the requested 16px — verified by
compiling both and measuring (see the arithmetic below). **Built with `53% −
16px`,** which lands the cut exactly 16px inside the strap's real near edge;
noted here per the "if the plan is wrong, report it" rule rather than
implemented literally against a derivation that contradicts this file's own
prior, shipped documentation.

**The formula.** `H` is the block-size `.ox-hero`'s own `min-block-size` sets
per breakpoint (520px from 640, 560px from 1024 — both plain px, not a
clamp): half-run `= H × 0.33725` (half of `tan(34deg) = 0.6745`, since the
diagonal recedes symmetrically about the band's own mid-height, where the
strap's `skewX` transform-origin sits unskewed); pane `inline-size = calc(53%
− 16px + half-run)`; polygon (RTL) `polygon(0 0, 100% 0, calc(100% − run)
100%, 0 100%)`, mirrored for `[dir='ltr']` as `polygon(0 0, 100% 0, 100%
100%, run 100%)`. `run = ox-run(H)` (the codebase's own 0.1px-rounded
function, `_primitives.scss`), reused rather than hand-rounded.

```scss
/* H 520 (640-1023) */
inline-size: calc(53% - 16px + 175.37px);
/* identity: 34deg, run 350.7 of 520 */
clip-path: polygon(0 0, 100% 0, calc(100% - 350.7px) 100%, 0 100%);

/* H 560 (>= 1024) */
inline-size: calc(53% - 16px + 188.86px);
/* identity: 34deg, run 377.7 of 560 */
clip-path: polygon(0 0, 100% 0, calc(100% - 377.7px) 100%, 0 100%);
```

The scrim shares the exact same box and polygon at both tiers (declared
alongside the photo, same file, same two `@media` blocks).

**Verification table**, 1024 / 1280 / 1440 / 1920 (all inside the `H = 560`
tier — `.ox-hero`'s `min-block-size` does not change again above 1024, so
`run` and `H` are the same fixed px pair at all four widths; only the pane's
own *width* in px changes with the viewport, and the diagonal's slope depends
only on `run`/`H`, not on the pane's width):

| Width | H | run | gap at mid-height | angle | tolerance |
|---|---|---|---|---|---|
| 1024 | 560 | 377.7 | 16.00px (by construction) | 33.998° | 34° ± 0.6, gap 16px ± 1 — pass |
| 1280 | 560 | 377.7 | 16.00px | 33.998° | pass |
| 1440 | 560 | 377.7 | 16.00px | 33.998° | pass |
| 1920 | 560 | 377.7 | 16.00px | 33.998° | pass |

Angle: `atan(377.7 / 560) = 33.998°`, 0.002° off the exact `tan(34deg) =
0.6745085` (run is rounded to 0.1px by `ox-run()`), inside `± 0.6`. Gap: exact
16.00px at mid-height by construction (`cut_x(H/2) = paneWidth − half-run =
53%·W − 16px`, `strap_near(H/2) = 53%·W`); the gap drifts by at most ~0.02px
toward the band's top/bottom edges (the rounding difference between
`ox-run()`'s 0.1px step and the unrounded `tan(34deg)`), far inside `± 1px`.
The 640-1023 tier (`H 520`, run 350.7) was not in the four requested probe
widths but is built and verified the same way: angle `33.997°`, gap 16.00px
± 0.02px.

`polygon-slope` needs no allow-pragma: `checkPolygonSlope` only requires the
`/* identity: */` pragma for a *literal* percentage away from `0%`/`100%`;
every percent token in these polygons is exactly `0%` or `100%` (the run is a
px offset via `calc()`), so the check resolves them statically. Kept the
pragma anyway for the same documentation reason the rest of the file does.

Compiled and confirmed (direct `sass` CLI, see "Verified by" — the dev
server was unreachable this session, see Deviations):

```css
@media (min-width: 640px) {
  .ox-hero__photo, .ox-hero__scrim {
    inline-size: calc(53% - 16px + 175.37px);
    clip-path: polygon(0 0, 100% 0, calc(100% - 350.7px) 100%, 0 100%);
  }
}
@media (min-width: 1024px) {
  .ox-hero__photo, .ox-hero__scrim {
    inline-size: calc(53% - 16px + 188.86px);
    clip-path: polygon(0 0, 100% 0, calc(100% - 377.7px) 100%, 0 100%);
  }
}
```

---

## 2. Goal cards: angled cuts and an angled strap

`app/styles/06-ox/_b2-home.scss`, `.ox-goal` / `.ox-goal__slash`.
`GoalCard.tsx` needed no change (`.ox-iconbtn--angled` on the arrow already
shipped in S2g).

**First pass (brief's own item 2): both cuts on the physical left.** Built a
6-point clip-path cutting the physical top-left AND bottom-left corners at
34deg, never mirrored under `[dir='ltr']` (matching the art tiles), with the
strap re-angled (`skewX(var(--ox-skew))`) and pinned physically at the top-
left so its slant and the cut read as one gesture. Moved the focus ring off
`ox-focus`'s clipped outline onto an inset `box-shadow` (§7.1's second legal
mechanism, the same one `.ox-btn--s40/s44/s48` already ships).

**Revised by the coordinator's addendum (same day): diagonal corners
instead.** The two cuts move to the physical top-right and bottom-left
corners; the card's corners are sharp everywhere (`border-radius: 0`, was
`var(--ox-r-3)`); the strap stays at the top-left but is no longer described
as "inside" a cut (top-left is sharp now) — it is its own independent 34deg
band. This is what shipped; the "both cuts on the left" construction above
was live only inside this session, replaced before being reported as done.

**Tiers, same at both passes** (390/768/1440 probes, the card's own rendered
width at each, not the identity doc's generic 320/390/1440 rows, since
`.ox-goal`'s own grid breakpoints are 640/1280 not 390/1280):

| Probe | Grid | Container | Card width | lean/run | run as % of card |
|---|---|---|---|---|---|
| 390 | 2-col, gap 12 | 358 | (358−12)/2 = 173px | 40 / 27.0 | 15.6% |
| 768 | 3-col, gap 16 | 720 (gutter 24) | (720−32)/3 = 229.3px | 56 / 37.8 | 16.5% |
| 1440 | 6-col, gap 24 | 1296 (capped) | (1296−120)/6 = 196px | 64 / 43.2 | 22.0% |

All three pairs are named ladder rungs (X-IDENTITY §2.2/§3.3), `run =
ox-run(lean)`; all three sit inside the 24% budget (§2.3). The 1440 tier is
closer to the ceiling than the other two (22.0% vs 15.6%/16.5%) because the
6-up track narrows the card more than a "1440" tier elsewhere in the theme
assumes — flagged, not silently sized down to a smaller pair.

```scss
/* base (390 probe) */
clip-path: polygon(0 0, calc(100% - 27px) 0, 100% 40px, 100% 100%, 27px 100%, 0 calc(100% - 40px));
/* >= 640 (768 probe) */
clip-path: polygon(0 0, calc(100% - 37.8px) 0, 100% 56px, 100% 100%, 37.8px 100%, 0 calc(100% - 56px));
/* >= 1280 (1440 probe) */
clip-path: polygon(0 0, calc(100% - 43.2px) 0, 100% 64px, 100% 100%, 43.2px 100%, 0 calc(100% - 64px));
```

`.ox-goal__slash`: `block-size: 92px` (control-scale, X-IDENTITY §3.2's named
exception list, same one `.ox-iconbtn--angled` carries), `inline-size: 20px`
(≥ the brief's 8px floor), `skewX(var(--ox-skew))`, physically pinned left in
both directions (`inset-inline-end: -4px` base/RTL, `[dir='ltr'] { …
inset-inline-start: -4px }`). Size/offsets unchanged from the pre-existing
(unangled) bar — only the transform and the LTR pin are new — since the
owner's screenshot already showed it in roughly the right visual position.

`check-identity`'s `one-angled-per-block` did **not** fire between `.ox-goal`
(the clip-path) and `.ox-goal__slash` (the skew): re-read the rule's actual
implementation (`checkBlockScopedRules` in `scripts/check-identity.mjs`) —
it counts angled *kinds* within one selector's own declaration body, not
across sibling selectors in the same BEM family (the `familyAngledCounts` map
it also builds is computed but never consulted for a finding). No allow-
pragma was needed; confirmed by the 0-problem `check-identity` run rather
than assumed.

---

## 3. The "تصفح المزيد" posters section (`OxPosters`/`PosterCard`)

`app/components/home/PosterCard.tsx` (added the `.ox-pcard__slash` span,
fixed a stale "22 degrees" doc comment), `app/styles/06-ox/_b2-home.scss`
(`.ox-pcard` / `.ox-pcard__slash`, section 17.2). `OxPosters.tsx` needed no
change.

Same treatment as `GoalCard` (diagonal top-right/bottom-left cuts,
`border-radius: 0`, independent top-left strap), reusing the identical
lean/run tiers so the two card families read as one system. `.ox-pcard` had
no explicit `:focus-visible` style before this batch (only the global
`a:focus{outline:none}` reset in `02-generic/reset.scss`); adding the clip
also closed that pre-existing gap with the same inset-`box-shadow` mechanism
`.ox-goal` uses, rather than trading one ring for another.

| Probe | Track column | Row width (est.) | Card width | lean/run | run as % of card |
|---|---|---|---|---|---|
| 390 | 74% | ~374 (358 container + 16 start padding) | 276.8px | 40 / 27.0 | 9.8% |
| 768 | 46% | ~744 (768 − 24 start padding) | 342.2px | 56 / 37.8 | 11.0% |
| 1440 | 27% | ~1408 (1440 − 32 start padding) | 380.2px | 64 / 43.2 | 11.4% |

Row width is an estimate (the track has no `.ox-container` ancestor and no
`padding-inline-start` rule was found in this file to read exactly, per its
own comment "its own start padding puts the first card on the container's
inline start" — not literally present in the corpus I could find); the
budget check is comfortably inside 24% even if that estimate is off by a
double-digit percentage, so the tier choice is not sensitive to the
imprecision. Flagged, not silently presented as measured.

---

## 4. Coordinator addendum, part 2: the type tiles

New scope, files: `app/components/home/{CategoryTile,OxCategories}.tsx`,
`app/components/listing/CategoriesIndex.tsx`, `app/styles/06-ox/_b2-home.scss`
section 4/4b, `app/styles/06-ox/_b4-listing.scss` sections 14/14b,
`tests/home/{OxCategories,blocks}.test.tsx`,
`tests/listing/CategoriesIndex.test.tsx`. `OxCategories.tsx` needed no
change (it still passes `count` down; `CategoryTile` simply stops reading
it).

### (a) No products count, on either surface

`CategoryTile.tsx`: `foot` no longer renders `.ox-tile__count`, only the
arrow `<i>`. `count` stays on `CategoryTileProps` (the taxonomy/merchant
plumbing that resolves it for other consumers is undisturbed) but is no
longer destructured or read. Removed the now-unused `useTranslation`/`t`
import along with it.

`CategoriesIndex.tsx`'s `TypeCard`: both branches (`--art` and plain) no
longer render `.ox-cat-card__count`; the art branch's foot keeps the arrow
only, matching `CategoryTile`.

**Flagged, not fixed:** the plain (non-art) branch of `TypeCard` never had an
arrow element at all (only a bare count, now removed) — a pre-existing
asymmetry against the art branch and against `CategoryTile`'s own two
branches (which both share one `foot`/arrow). The addendum's own wording
("no `__count` rendered; the foot keeps the angled arrow only") describes
removing the count from an existing foot, not inventing a new arrow element
on a branch that never had one; adding one would need new `.ox-cat-card__arrow`
positioning for a bare (non-`.ox-cat-card__body`) layout, which is new scope
beyond "remove the count." Left as-is and named here rather than silently
left unaddressed.

Removed as dead code once the count was gone, in both SCSS files:
`.ox-tile__count` (base, `.ox-tile--black` and `.ox-tile--art` overrides),
`.ox-cat-card__count` (base, `.ox-cat-card--black`, `.ox-cat-card--art` and
the `vitamins-minerals` overrides) — every one was declared only to style
the span this item removes.

### (b) No clip-path on the art tiles, at any tier

`app/styles/06-ox/_b2-home.scss`: removed `clip-path` from `.ox-tile::before`
/ `.ox-tile__art` (and their `[dir='ltr']` mirrors) at both the base tier
(the notch, `--ox-tile-notch-t`/`-j`) and the `≥ 1280` tier (the corner cut,
`--ox-tile-lean`/`-run`) — both custom-property pairs removed with their sole
consumer.

`app/styles/06-ox/_b4-listing.scss`: same removal for `.ox-cat-card__art`
(and its `[dir='ltr']` mirror) at both tiers, `--ox-cat-notch-t`/`-j` and
`--ox-cat-lean`/`-run` removed with them.

Both are now plain rectangles: neither selector ever had its own
`border-radius`, so removing the clip-path leaves the card's own square
corners (`.ox-tile`) or its explicit `border-radius: 0` (`.ox-cat-card--art`,
kept — the frame around the artwork stays square either way, now for a
plainer reason than "the clip already overrides the rounding").

### (c) Text position — unchanged, per the brief

`.ox-tile__body` / `.ox-cat-card__body` both already carry `justify-content:
flex-end` (bottom-aligned) and the physical-left `[dir]` pin. Verified, not
touched.

### Tests

`tests/home/OxCategories.test.tsx`: the one test this batch's own count
removal broke (`prints the count only on a live, positive products_count`,
which asserted `.ox-tile__count` textContent) rewritten to `never prints a
count, even on a live, positive products_count`, asserting `.ox-tile__count`
is null and `.ox-tile__arrow` is present on every tile, live category or not.
Docblock's own contract list (item 4) updated to match.

`tests/home/blocks.test.tsx`: one stale comment fixed ("the count gate" →
"the no-count foot"); no assertion changes needed (it never asserted the
count).

`tests/listing/CategoriesIndex.test.tsx`: the resolved-category test's count
assertion (`.ox-cat-card__count` textContent contains '14') replaced with a
null assertion; the "prints no count while unresolved" test broadened and
renamed to "never prints a count, resolved or not," checking every rendered
type card rather than only the unresolved ones.

**`tests/home/OxCategories.test.tsx` and `tests/home/blocks.test.tsx` were
seen failing (5 tests, unrelated titles) in an earlier run this session,
before the coordinator's addendum arrived.** Traced to a concurrent
builder's in-progress, uncommitted edits to `app/content/categories.ts` and
`app/styles/06-ox/_b4-listing.scss` (visible in `git status` at the time,
neither file touched by this batch) — re-running the same two files after
that concurrent work settled showed only the one count-related failure this
addendum itself explains; both files are green now.

---

## Files changed

- `app/styles/06-ox/_b2-home.scss` — hero photo/scrim full-height diagonal
  (item 1, both tiers); `.ox-goal`/`.ox-goal__slash` diagonal corner cuts +
  angled strap + focus-shadow (item 2, three breakpoint tiers);
  `.ox-pcard`/`.ox-pcard__slash` same treatment (item 3, three tiers);
  `.ox-tile`/`.ox-tile__art`/`.ox-tile__count` — count and art clip-path
  removed at both tiers (addendum item 2a/2b).
- `app/styles/06-ox/_b4-listing.scss` — `.ox-cat-card__art`/`__count` — same
  two removals, both tiers (addendum item 2a/2b).
- `app/components/home/CategoryTile.tsx` — count no longer read/rendered;
  unused `useTranslation` import dropped; docblock updated (addendum 2a/2b).
- `app/components/home/PosterCard.tsx` — `.ox-pcard__slash` markup added;
  stale "22 degrees" doc comment fixed to 34 (item 3).
- `app/components/listing/CategoriesIndex.tsx` — `TypeCard`'s two branches
  stop rendering `.ox-cat-card__count`; docblock updated (addendum 2a).
- `tests/home/OxPosters.test.tsx` — new, structural coverage for the new
  `.ox-pcard__slash` markup (item 3; no test surface existed before).
- `tests/home/OxCategories.test.tsx` — count test rewritten to assert no
  count ever prints; docblock contract updated (addendum 2a).
- `tests/home/blocks.test.tsx` — one stale comment fixed (addendum 2a).
- `tests/listing/CategoriesIndex.test.tsx` — two count assertions inverted
  to null-checks; one test broadened/renamed (addendum 2a).

`GoalCard.tsx` and `OxGoals.tsx`/`OxPosters.tsx`/`OxCategories.tsx` are
listed in the brief/addendum's file scopes but needed **no edits** — the
work landed entirely in `_b2-home.scss`/`_b4-listing.scss` (CSS-only) or,
for `PosterCard`/`CategoryTile`/`CategoriesIndex`, in markup these three
files already owned.

## Deviations

1. **Hero gap constant corrected from the brief's `53% − 26px` to `53% −
   16px`.** The brief's own derivation read `inset-inline-end: 53%` as the
   strap's centre; per CSS semantics (and this file's own prior S2g comment,
   "the strap … sits exactly on the pane's own vertical edge") it is the
   strap's near *edge*. Implementing the brief's literal `26px` would have
   produced a 26px gap, failing this same batch's own "verify the gap is
   16px ± 1" requirement — corrected rather than shipped-and-flagged, with
   the full arithmetic recorded above and in the SCSS comments at the edit
   site.
2. **Items 2/3's corner placement changed mid-task** by the coordinator's
   addendum (physical top-left+bottom-left → top-right+bottom-left,
   diagonal), landed as the addendum specifies; the intermediate "both cuts
   on the left" construction is not what shipped.
3. **GoalCard's 1440 tier (lean 64/run 43.2) sits at 22.0% of its own card
   width** — inside the 24% budget but the closest of the three tiers to the
   ceiling, because the 6-up grid at this breakpoint narrows the card more
   than a "1440" tier elsewhere in the theme assumes. Not resized to a
   smaller pair; named here per the brief's own "every measurement written
   down" instruction.
4. **`CategoriesIndex.tsx`'s plain (non-art) `TypeCard` branch has no arrow**
   even after this batch — a pre-existing gap against the art branch and
   against `CategoryTile`, out of the addendum's literal "remove the count"
   scope (adding one is new markup/positioning, not a removal). Flagged, not
   silently left unmentioned.
5. **PosterCard's row-width estimates (390/768/1440) are approximate**, not
   measured against a `padding-inline-start` rule this file's own comment
   claims exists but I could not find in the corpus. The budget check is
   comfortably inside 24% regardless.
6. **Live `curl` verification against `http://localhost:3210` could not be
   completed.** Every attempt at `/` and `/ar` timed out (20s to 150s,
   repeated across the session) after this batch's edits landed; the root
   route itself (a bare 307 redirect) also stopped answering by the end of
   the session, so this reads as the dev server itself becoming
   unresponsive under the concurrent load this session's other builders were
   also generating, not a defect in this batch's own code. Verified instead
   by compiling the exact same `app/styles/app.scss` entry point directly
   with the project's own `sass` CLI (no dev server involved) and reading
   the compiled CSS byte-for-byte at every selector this report cites, which
   is the same toolchain the dev server's own bundler runs on top of.

## Verified by

- `pnpm typecheck` → `tsc --noEmit`, 0 errors (run twice: after the three
  screenshot items, and again after the addendum).
- `pnpm vitest run tests/home tests/common tests/listing` → **30 files
  passed, 309 tests passed**, including `tests/home/OxHero.test.tsx` (15/15),
  `tests/home/OxGoals.test.tsx` (10/10), `tests/home/OxPosters.test.tsx`
  (1/1, new), `tests/home/OxCategories.test.tsx` (11/11),
  `tests/home/blocks.test.tsx` (16/16), `tests/listing/CategoriesIndex.test.tsx`
  (10/10).
- `pnpm check:rtl` → `315 file(s), 0 problem(s)`.
- `pnpm check:motion` → `315 file(s), 0 problem(s)`.
- `pnpm check:strings` → `307 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 312 file(s)
  scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `315 file(s), 0 problem(s)` (checked
  after every edit round; no allow-pragma was needed anywhere in this batch).
- `node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css` →
  compiles clean (only the expected `@import` deprecation warnings, pre-
  existing throughout the codebase, not from this batch's own lines); used
  to read back and confirm every clip-path/calc() value quoted in this
  report directly from the compiled output, per BUILD.md's "read back and
  compare after any write" rule, in place of the unreachable dev server.
- Live curl against `http://localhost:3210` — **could not complete**, see
  Deviations item 6.

## Requests to other builders

None — every file this batch needed was already inside S3b's or the
addendum's own scope.
