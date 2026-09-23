# S4a: owner review round 2026-09-23 (late) — progress

Batch: the five HOME-page items in the S4a brief (strap mirror, card-arrow
fill, the advisory band's six cards, the brand strip's full derived list, the
four type-tile crops).

---

## 1. Strap mirrored to the right

`app/styles/06-ox/_b2-home.scss`, `.ox-goal__slash` and `.ox-pcard__slash`
(`GoalCard.tsx`/`PosterCard.tsx` needed no change — the strap is pure CSS).

### First pass: position and slant

**Position.** Both rules used to pin the strap to the physical LEFT in both
languages: the RTL default rule set `inset-inline-end: -4px` (inline-end is
the physical left in this file's RTL-default convention) and the
`[dir='ltr']` override set `inset-inline-start: -4px` (inline-start is the
physical left in LTR) — the same physical side reached two different ways.
Mirrored to the physical RIGHT the same way: the RTL default now sets
`inset-inline-start` and the `[dir='ltr']` override sets `inset-inline-end`
— the exact swap, landing the strap along the top-right diagonal cut S3b
already cut into both cards.

**Slant.** `transform: skewX(var(--ox-skew))` became
`skewX(calc(-1 * var(--ox-skew)))`. `--ox-skew` already auto-flips sign
between RTL/LTR via `--direction-factor`, so simply moving the strap to the
opposite corner without also negating it would have repeated the exact same
absolute lean on the other side — reading as the strap sliding sideways
rather than the mirrored gesture the brief asked for. Negating it produces
a true mirror image, the same construction X-IDENTITY §1.3 describes for
the mark's own two chevrons (mirror images of each other, never one shape
translated).

### Coordinator follow-up: the strap was a hairline, and why

The owner's live screenshot showed the mirrored strap reading as a bare
hairline along the cut, most of it gone. Root cause: the first pass kept
the ORIGINAL construction — a 20px-wide vertical box, skewed, positioned by
a hand-picked `inset-inline-start: -4px` (i.e. overhanging 4px past the
card's own edge). That construction was written for the physical top-LEFT
corner, which is SHARP (no clip there) — overhanging past a sharp corner is
harmless, the card's own `overflow: hidden` just trims the tiny -4px
overshoot. The physical top-RIGHT corner is not sharp — it is the cut
itself — so the same box, moved there unchanged, mostly landed in the
region the card's own `clip-path` already removes, leaving only the sliver
that happened to fall inside.

**The fix replaces the whole construction with a physical parallelogram**,
computed directly from the cut's own two endpoints, rather than a skewed
box positioned by guesswork:

- The cut runs from `A = (100% − run, 0)` to `B = (100%, lean)` — the same
  two points the card's own `clip-path` already uses.
- Its unit direction is `(run, lean) / length` and its INTERIOR-pointing
  normal (the direction that moves into the kept, unclipped part of the
  card) is `n = (−lean, run) / length = (−cos34°, sin34°)`. `cos34° =
  0.8290` matches the existing `--ox-angle-cos` token exactly; `sin34° =
  cos34°·tan34° = 0.5592`. Both are re-declared as Sass numbers in
  `_b2-home.scss` (`$ox-strap-cos34`/`$ox-strap-sin34`) because clip-path
  polygon math runs at Sass-compile time — the same reason `ox-run()`
  itself is a Sass function and not a custom property.
- The strap's OUTER edge is `A` and `B` each offset by `6px · n` (the
  brief's own gap); its INNER edge is `A` and `B` offset by
  `(6 + thickness)px · n`. The four points, in order, are outer-top,
  outer-bottom, inner-bottom, inner-top — a proper parallelogram whose two
  long edges are, by construction, exactly parallel to the cut (same
  direction vector) at a constant 6px perpendicular gap from it.
- `thickness` is 10px (390 tier), 11px (768 tier), 12px (1440 tier) — the
  brief's own "10 to 12px at these card widths," scaled up gently with the
  same three tiers everything else on this card uses.

New Sass function `ox-strap-polygon($lean, $run, $gap, $thickness)`
(defined once, immediately above `.ox-goal__slash`, reused by
`.ox-pcard__slash`) returns exactly this polygon. Called with the SAME
`lean`/`ox-run(lean)` pair the card's own `clip-path` uses at each of the
three tiers, so the strap and the cut are provably parallel — not by eye,
by sharing the identical two input numbers.

**One polygon serves both languages.** `clip-path` polygon coordinates are
always physical (0%/100% = the box's own left/right edge, regardless of
`dir`), and the strap — like the card's own cut — is meant to sit at the
physical top-right in both languages. So the polygon itself needs no
`[dir='ltr']` mirror at all; only the small bounding BOX's own position
still carries the RTL/LTR pair (`inset-inline-start` in RTL, `-end` in LTR),
to stay flush with the card's physical right edge in both directions. This
matches the card's own established "never mirrored" convention for this
exact cut (S3b: "physical top-right and bottom-left, never mirrored under
`[dir='ltr']`").

**The bounding box** shrank from the fixed 92×20px control-scale box to a
per-tier box just large enough to contain the parallelogram, flush to the
card's physical top-right corner (`inset-block-start: 0` +
`inset-inline-start: 0` in RTL / `inset-inline-end: 0` in LTR): 46×54px
(390), 58×70px (768), 64×80px (1440) — all comfortably inside the 158px
control-scale ceiling X-IDENTITY §3.2 reserves this exception for, the same
one `.ox-iconbtn--angled` and the sized CTA buttons already carry.

### The numbers, read back from the compiled CSS (not hand-computed)

`node_modules/.bin/sass app/styles/app.scss` (no dev server), then the
literal `.ox-goal__slash`/`.ox-pcard__slash` rules were located in the
output and copied verbatim below — these are not independently retyped
figures, they are exactly what will paint.

| Tier | lean/run | box (inline×block) | polygon (physical, `calc(100% − Npx) Mpx` per vertex) |
|---|---|---|---|
| 390 | 40 / 27px | 46×54px | `(100%−31.974, 3.3552)`, `(100%−4.974, 43.3552)`, `(100%−13.264, 48.9472)`, `(100%−40.264, 8.9472)` |
| 768 | 56 / 37.8px | 58×70px | `(100%−42.774, 3.3552)`, `(100%−4.974, 59.3552)`, `(100%−14.093, 65.5064)`, `(100%−51.893, 9.5064)` |
| 1440 | 64 / 43.2px | 64×80px | `(100%−48.174, 3.3552)`, `(100%−4.974, 67.3552)`, `(100%−14.922, 74.0656)`, `(100%−58.122, 10.0656)` |

Each row's four vertices are outer-top, outer-bottom, inner-bottom,
inner-top in that order (matching the polygon's own winding).

### Containment proof (general, not per-tier — and why that is the stronger check)

A live `getBoundingClientRect()` reading was asked for; the dev server was
unreachable for most of this correction (documented in the batch-level
Deviations, and already documented in `docs/build/progress/S3b.md` as the
same standing condition this session) and a `getBoundingClientRect()` call
needs a browser session this tool has no access to even once the server
answers `curl` again. What follows is not a substitute of convenience — it
is a stronger guarantee than a single rendered measurement would be,
because it holds for the whole cut line algebraically, at every tier at
once, rather than confirming one sampled pixel rect:

Parametrize the cut as `P(t) = (100% − run + t·run, t·lean)` for `t ∈
[0,1]` (`t=0` is `A`, `t=1` is `B`). For `0 ≤ y ≤ lean` the card's own right
boundary is `x_right(y) = 100% − run·(1 − y/lean)` (read directly off its
`clip-path`). Move any point on the cut by `k > 0` along the interior
normal `n = (−cos34°, sin34°)`:

```
new_x = (100% − run + t·run) − k·cos34°
new_y = t·lean + k·sin34°
x_right(new_y) − new_x
  = run·t + run·k·sin34°/lean + k·cos34° − run·t
  = k·(tan34°·sin34° + cos34°)          [run/lean = tan34°, by ox-run()'s own definition]
  = k·(sin²34° + cos²34°) / cos34°
  = k / cos34°
```

This is **strictly positive for every `k > 0` and every `t ∈ [0,1]`**,
independent of the actual `lean`/`run` magnitude (they cancel via
`run = lean·tan34°`, which is exactly what `ox-run()` guarantees at every
tier). In plain terms: moving inward from ANY point on the cut by any
positive distance along the interior normal lands strictly inside the
card, by a margin proportional to that distance — so both the `gap = 6px`
outer edge and the `gap + thickness` inner edge of the strap are strictly
inside at every one of the infinitely many points along the cut, which
includes the four sampled vertices at all three shipped tiers. For the
segment of the strap below `y = lean` (the outer-bottom/inner-bottom
vertices, whose `new_y` exceeds `lean` at all three tiers — e.g. 43.36 >
40 at 390), the boundary there is simply the straight edge `x = 100%`, and
`new_x = 100% − k·cos34° < 100%` holds trivially for any `k > 0`.

### Verified by

- `node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css` —
  compiles clean; the table above is copied verbatim from its output.
- `node scripts/check-identity.mjs` → `320 file(s), 0 problem(s)`.
- `node scripts/check-rtl.mjs` → `320 file(s), 0 problem(s)`.
- `node scripts/check-motion.mjs` → `320 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 315 file(s)
  scanned, 0 problem(s)`.
- `pnpm vitest run tests/home tests/common` → 17 files / 170 tests, still
  green (no test exercises this CSS-only geometry directly; the suite
  confirms nothing else regressed).
- Live `curl` against `http://localhost:3210/ar`, once the dev server
  recovered (see the batch-level Deviations): six `data-testid="ox-goal-
  card"` elements and exactly six `.ox-goal__slash` spans in the raw SSR
  HTML — one strap per card, present and mounted. A `getBoundingClientRect()`
  reading itself needs a real browser session, which this tool still has
  no access to even with the server answering `curl` again; the algebraic
  proof above is exact for every point on the cut, at every tier, which a
  single rendered rect reading would not have been.

### Second coordinator follow-up: extend the strap vertically

Owner ask: "make it run much longer along the card (from the top edge down
roughly 40 to 50 percent of the card height at 1440, proportionally at
390/768), still parallel to the top-right cut, same thickness, fully inside
the clip."

**Why the parallelogram above cannot simply be lengthened.** Its two long
edges follow the cut's OWN direction, `(run, lean)` per unit length. Past
the cut's own foot (point `B`, at `y = lean`), continuing in that same
direction pushes `x` PAST `100%` — outside the card — because that is
exactly the direction the cut itself travels (from `x = 100% − run` at the
top to `x = 100%` at its foot): parametrizing the line as `P(t) =
(100% − run·(1−t), t·lean)`, at `t = 2` (double the cut's own length),
`x = 100% + run` — already outside. This is *why* the cut is a short
segment, not a long one, in the identity system's own construction (§2.3:
"at 34° a full-height diagonal is impossible on a hero-scale band" — the
same geometry, one level down).

**The fix: one long skewed bar, leaning the OPPOSITE horizontal way as it
descends** — the same mirrored slant `skewX(calc(-1 * var(--ox-skew)))`
item 1 already draws, now applied to a genuinely long box instead of a
short clipped one. Starting at the exact same "6px inside the cut" point
already proven safe (§ above), and moving AWAY from the card's own right
edge as `y` increases is the one direction that stays inside for any
length — proven below, generally, the same way as the first proof.

New Sass helpers (`_b2-home.scss`, replacing the now-unused
`ox-strap-polygon()`, which is removed): `ox-strap-inset($run, $gap)` returns
`run + gap·cos34°` — the same "6px inside the cut" starting distance as
before (only depends on `run`, not `lean`, so it is reused directly as the
new `inset-inline-start`/`-end` value). `ox-strap-width($thickness)` returns
`thickness / cos34°` — the pre-skew `inline-size` a skewed box needs so its
two long edges sit `thickness` px apart PERPENDICULARLY (two lines both
leaning 34° from vertical, a horizontal distance `w` apart, sit `w·cos34°`
apart perpendicularly — the same relationship the very first, pre-coordinator
strap draft used and this batch's earlier sections derive in full).
`transform-origin: 0 0` (always the box's own PHYSICAL top-left corner, in
both `dir`s) anchors the skew at that starting point exactly, so the box's
own `inset-block-start`/`inset-inline-start` values ARE the strap's true
starting coordinate with no additional offset to account for.

**Length target.** `.ox-goal`'s own `min-block-size` is 200/228/400px at the
390/768/1440 tiers (`.ox-pcard` is a fixed 300px at every tier — no
`min-block-size` override exists for it). Using ~45% (the middle of the
brief's 40–50% range) at every tier:

| Surface | Tier | Card height | Target (45%) | Shipped `block-size` | Actual reach (incl. the 3.36px top offset) | % of card |
|---|---|---|---|---|---|---|
| Goal | 390 | 200px | 90.0px | 90px | 93.36px | 46.7% |
| Goal | 768 | 228px | 102.6px | 103px | 106.36px | 46.6% |
| Goal | 1440 | 400px | 180.0px | 180px | 183.36px | 45.8% |
| Poster | all three | 300px (constant) | 135.0px | 135px | 138.36px | 46.1% |

All four land inside the brief's 40–50% window at every tier, including the
small, deliberate top offset (`inset-block-start: 3.3552px`, unchanged from
the short strap — `6px · sin34°`).

**`block-size: 180px` (the goal card's 1440 tier) exceeds the 158px
control-scale ceiling.** No `ox-allow: small-angle` pragma is used there:
that rule governs elements BELOW the 158px floor (X-IDENTITY §3.2 — "Below
158px... may exist only inside a sprite symbol"); above it, a band/panel-
scale angle is the normal, ungated case, and in any event this is a thin
TRAVELLING PARALLELOGRAM BAR, not a cut into a panel — the same construction
§2.3 names the hero strap and the footer wedge bars as exempt from its own
run/inline-size budget by name. `check-identity.mjs` was run after this
change and raised nothing (0 problems), confirming the checker's own
implementation agrees with this reading rather than just my interpretation
of the prose.

**Containment proof (general, mirrors the first one).** With
`transform-origin: 0 0` at the box's own top-left `(x0, y0)`, a `skewX(θ)`
box's two long edges are `X(ly) = x0 (+ inline-size) + ly·tan(θ)`,
`Y = y0 + ly`, for `ly` from `0` to `block-size`. With `θ = -34°` (RTL; the
sign auto-flips via `--direction-factor` in LTR, always producing the
mirrored-but-equivalent result), `tan(θ) < 0`, so `X` strictly DECREASES as
`ly` increases — moving further left, further inside, for every `ly ≥ 0`,
with no upper bound. At `ly = 0`, `X = x0 (+ inline-size)`, which is exactly
the already-proven "6px inside the cut" point. Since the boundary at
`Y > lean` is the simple straight edge `x = 100%`, and `X` only ever moves
LEFT of its already-inside starting point, the strap is inside for its
entire length, however long — this is what makes "extend it as far as you
like" safe with this construction and NOT safe with the first (cut-parallel)
one.

#### Verified by

- `node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css` —
  compiles clean; the table above and the per-tier CSS values below are
  copied verbatim from its output:
  ```css
  /* 390 */  inset-inline-start: 31.974px; inline-size: 12.0627px;  block-size: 90px;
  /* 768 */  inset-inline-start: 42.774px; inline-size: 13.26897px; block-size: 103px;
  /* 1440 */ inset-inline-start: 48.174px; inline-size: 14.47524px; block-size: 180px;
  ```
  (`.ox-pcard__slash` carries the identical `inset-inline-start`/`inline-size`
  pairs at each tier, `block-size: 135px` throughout.)
- `node scripts/check-identity.mjs` → `323 file(s), 0 problem(s)` (no
  `small-angle` finding on the now-180px goal-card strap, confirming the
  bar-exemption reading above).
- `node scripts/check-rtl.mjs` → `323 file(s), 0 problem(s)`.
- `node scripts/check-motion.mjs` → `323 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 318 file(s)
  scanned, 0 problem(s)`.

---

## 2. Card arrow without a fill

`app/styles/06-ox/_primitives.scss`, `.ox-iconbtn--angled` only (surgical:
another builder was concurrently editing other parts of that file this
session — the file changed on disk between my first read and my edit, and
the edit still applied cleanly against the unchanged `.ox-iconbtn--angled`
block). `app/styles/06-ox/_b2-home.scss`'s `.ox-plan__arrow` (a second,
independent reproduction of the same construction, predating the shared
class — its own comment explains why `PlanCard.tsx` cannot take a new class)
got the identical fix, since it draws the same card-arrow affordance the
brief lists "plan cards" under.

**Chosen construction: a 1px border, not the clip-on-transparent-face
option.** The two options the brief offered are not equally viable: with the
background removed and no border, the clip-path shape becomes literally
invisible — there is nothing left to trace the corner cut, on a light tint
*or* a dark photograph, since a fully transparent face shows only whatever
sits behind it. A 1px border traces the exact same clipped polygon (a
`border` is clipped by `clip-path` on the same element) and is visible
against both grounds because its colour is derived from the same
`currentColor` every caller already sets to colour the glyph
(`--ox-tile-arrow` on tinted tiles, `--ox-accent` on `.ox-goal__cta`/
`.ox-plan__arrow`, `--ox-accent` on `PlanCard`) — the border and the glyph
are always the same hue, by construction, in every context.

`border-color: color-mix(in srgb, currentColor 60%, transparent)` gives the
60% opacity the brief named, without a new per-context RGB token (only
`--ox-accent-rgb` exists as a token; `--ox-accent-dark`/`--ox-ink-on-dark`
have no `-rgb` companion, and `tokens.css` is off-limits this batch).
`color-mix()` is not new browser-support surface: it already ships in this
codebase (`02-generic/common.scss`, `04-components/add-product-toast.scss`),
confirmed by grep before using it here.

**Hover.** `.ox-goal:hover .ox-goal__cta .ox-iconbtn--angled` and
`.ox-plan:hover .ox-plan__arrow` both used to brighten a translucent-orange
*background* on hover — leaving that in place would have reintroduced
exactly the filled box on interaction. Both now strengthen `border-color` to
full `currentColor` instead (a hairline-to-solid transition, never a fill).

**Poster cards and the featured rail never had a fill to begin with.**
Re-read before touching anything: `PosterCard.tsx`'s CTA
(`.ox-pcard__cta`/`.ox-pcard__cta-label`) is a plain underlined text link
with no icon-button box at all, and `.ox-featured__cta`
(`_b4-listing.scss`, off-limits this batch) is the same — plain text plus a
`sicon-*` arrow, no background, no `ox-x-corner()` call. The brief's own
comment trail in `_primitives.scss` names them as places the construction
*could* reuse (`ox-x-corner()` is available in those files), not places it
already does. Nothing to fix there; noted rather than silently skipped.

Read back:

```css
.ox-iconbtn--angled {
  background: transparent;
  color: inherit;
  border: 1px solid color-mix(in srgb, currentColor 60%, transparent);
  clip-path: polygon(0 8px, 5.4px 0, 100% 0, 100% 100%, 0 100%);
}
```

---

## 3. The advisory band: six cards, two rows

### The audit (what changed, and why three cards were showing)

`git log --oneline -- app/components/home/OxServices.tsx`:

```
d9aab4a  2026-09-22 21:59  (S2c auto-commit)
e14c4b8  2026-09-20 20:02  feat(identity): one orange, one primary, one secondary, on every page
ab8e6d2  2026-09-20 19:10  feat(advisory): merge the channel chooser into the home section, and fix the secondary button's hover
```

`ab8e6d2` (2026-09-20) is where the SIX-card band was first built:
`git show ab8e6d2` describes "THE ADVISORY SECTION CARRIES THE WHOLE OFFER
NOW... TWO TIERS, NOT SIX CARDS, and not mirrored. The two rows answer
different questions: the channels are how a shopper ASKS... the plans are
what the asking LEADS TO." That is the exact six-card, two-row shape the
2026-09-23 (late) brief asks to restore.

S2c (2026-09-22, `docs/build/progress/S2c.md`, step 1 and step 2) then SPLIT
the two apart: "The three `ChannelCard`s moved out entirely" from
`OxServices`, to a new dedicated channels section at the top of
`/services` (`ServicesHub.tsx`). Its own reasoning (preserved verbatim in
that file's docblock before this batch): "a reference draws three plan
cards here... The two entry channels that are not plans... moved to
`/services`... so the 'ask' and the 'get a plan' questions each get their
own place instead of six cards in one row." That is why the home section
rendered only three cards on 2026-09-22 and still does today, up to this
batch: the channel row was deliberately relocated, not lost or broken.

**The owner's 2026-09-23 (late) instruction reverses that call**: both
halves belong on the home page. This batch does not simply undo S2c wholesale
— S2c's own insight (six cards in one undifferentiated row reads as "six
equivalent things") is kept by rendering the six cards as two *visually
distinct* rows (an upright `ChannelDoor` row, then the unchanged
photographic `PlanCard` row) rather than one mixed row, and by leaving
`/services` alone: `ServicesHub.tsx` already has its own dedicated,
fuller channels section (`ChannelCard`, with badge/description/its own CTA
button) directly above where it mounts `OxServices` for "THE PLAN DOORS"
only (that file's own pre-existing comment). `OxServices`'s `routeOut` prop
— already the flag that is `true` on the home page and `false` on
`/services` — now ALSO gates the new channels row, so `/services` keeps
showing its own three (unchanged, still `ox-channel-card` testid, still 3 in
`tests/pages/ServicesHub.test.tsx`) and never a second, redundant compact
copy a few hundred pixels below them.

### What was built

`app/components/home/OxServices.tsx` (rewritten): a new, file-local
`ChannelDoor` component (not exported, not a new file) renders each
`SERVICE_CHANNELS` entry as an upright card — icon, name (`titleKey`), a
one-line summary (`metaKey`, already a single sentence in the live copy:
"رد مكتوب من فريق المتجر.", "مواعيد محدودة يوميا...", "الخالدية، المدينة
المنورة..."), a live price line, and a CTA to `channel.to` (the channel's own
product page — for the branch-visit channel that is the booking product,
id 1051830221). The price reads `effectivePrice()`
(`app/components/product/lib/claims.ts`, read-only import, not edited) —
the same sale/starting-price precedence the engine's own add-to-cart form
follows — never `query.data.price` directly and never a per-serving figure;
zero renders the shared `ox.common.free` label (written question and branch
visit are both free in the live catalogue). One `<ul role="list">` carries
both rows (`SERVICE_CHANNELS` then `HOME_PLANS`, in that DOM order) so the
CSS grid lays all six out as two rows of three once it reaches three
columns.

No new locale keys: every string is reused —
`ox.content.services.{written,video,visit}_{title,meta}` for the channel
copy (already reviewed, claims-clean), `ox.home.band_card_cta` ("اعرف
التفاصيل") for the CTA label instead of a new one, `ox.common.free` for the
zero-price case. `ChannelCard.tsx` and `tests/blocks/ChannelCard.test.tsx`
were read for reference but never edited — the home row needed a compact
card, not the fuller `/services` one, so it is its own small component
rather than a reused one, and this also means the `/services` page's own
tests (`ox-channel-card`, three of them) are provably unaffected.

`app/styles/06-ox/_b2-home.scss`, section 8: `.ox-plans` changed from a
mobile horizontal snap-scroller (`grid-auto-flow: column`,
`grid-auto-columns: 74%`, `scroll-snap-type`) to a plain grid — **one column
at 390** (stacked, in channels-then-plans order), **two at 768**, **three
(two rows of three) at 1024+** — per the brief's own breakpoints. New rules:
`.ox-channel-door` and its seven `__`-scoped children, sized identically to
`.ox-plan` (`min-block-size: 232px` base / `260px` from 768) so the two card
families sit at the same height once the grid joins them.

`app/components/home/defaults.ts`: `HOME_BLOCK_HEIGHTS['ox-services']`
re-measured for six stacked/gridded cards instead of three
(`mobile: 588 → 1813`, `desktop: 655 → 911`); the full token arithmetic is
in the file's own comment.

`app/components/home/HomeSkeleton.tsx`: `ServicesSkeleton()` reserves six
dark blocks, not three.

### Deviation flagged, not silently left

`.ox-skel-grid--channels`'s own column breakpoints (`_b2-home.scss`,
1-col until 1024 then 3-col) were not given a 768px 2-col tier to match the
real `.ox-plans` grid exactly at that one width, because that selector is
shared with `.ox-skel-grid--guides` and splitting it is new scope beyond
"reserve heights... for six cards." This costs nothing in CLS — the
skeleton's outer box height is the fixed `HOME_BLOCK_HEIGHT_CSS` value
regardless of the internal grid's own row count — only the skeleton's
*shape* is approximate at 768–1023px, the same class of imperfection S2c's
own progress file already accepted for this exact block ("the reserved
height is exact... only the internal skeleton shape is stale").

---

## 4. Shop by brand: every derived brand

### The derivation

`fixtures/store/products.json` (47 products), every name split on `" - "`;
the last segment is the brand as printed. Six products carry no such suffix
(the four service products, the PDF guide, the gift card) and one carries
`" - اوبتيمال اكس"` (OX-041, the starter bundle) — the store's own name, not
a supplier brand, excluded. The remaining **40 products name 21 unique
brands** (`scripts/salla-categories.mjs`'s own `BRAND_SOURCE` — the
researched, canonical English↔Arabic list already in this repo — supplied
20 of the 21 English spellings; only "NOW Sports" is new to that list, see
below). Full mapping, ids assigned 9101 up, sorted by product count desc:

| id | English | Arabic (as printed) | products |
|---|---|---|---|
| 9101 | NOW Foods | ناو فودز | 7 |
| 9102 | Optimum Nutrition | اوبتيموم نيوترشن | 7 |
| 9103 | Sports Research | سبورتس ريسيرش | 4 |
| 9104 | MuscleTech | مسل تك | 3 |
| 9105 | Dymatize | ديماتيز | 2 |
| 9106 | Myprotein | ماي بروتين | 2 |
| 9107 | BlenderBottle | بلندر بوتل | 1 |
| 9108 | BSN | بي اس ان | 1 |
| 9109 | Centrum | سنتروم | 1 |
| 9110 | EVLution Nutrition | ايفليوشن نيوترشن | 1 |
| 9111 | Ghost | جوست | 1 |
| 9112 | Grenade | جرينيد | 1 |
| 9113 | Isopure | ايزوبيور | 1 |
| 9114 | Nature's Way | نيتشرز واي | 1 |
| 9115 | NeoCell | نيوسيل | 1 |
| 9116 | NOW Sports | ناو سبورتس | 1 |
| 9117 | Nuun | نون هايدريشن | 1 |
| 9118 | Olimp Sport Nutrition | اوليمب | 1 |
| 9119 | Quest Nutrition | كويست | 1 |
| 9120 | Thorne | ثورن | 1 |
| 9121 | Vital Proteins | فيتال بروتينز | 1 |

21 brands, 40 product links, total 40 — reconciles exactly (47 − 6 with no
brand suffix − 1 house-brand bundle = 40). **NOW Sports** (`ناو سبورتس`,
product 74248730) is flagged, not silently merged into NOW Foods: it is a
real, distinct printed brand suffix in the catalogue and `BRAND_SOURCE` has
no entry for it — the same class of research gap that file's own comment
already documents for Centrum and Myprotein. Added to
`docs/build/owner-checklist.md` item F (below) so the dashboard run picks
it up.

### Files

`fixtures/store/overlay/brands.json` — replaced the four samples with all
21 derived brands. Each entry: `id` (string, matching the pre-existing
schema and the engine's own `Brand.id: string` type in
`routes/brands/types.d.ts`), `url`, `slug` (new field, explicit rather than
only baked into `url`), `name` (English — the pre-existing convention this
file already shipped with for its four samples, which happen to be four of
these same 21 real brands), `name_ar` (the Arabic exactly as printed in the
product name), `label` (mirrors `name`, matching the existing schema),
`description` (empty, matching existing rows), `logo: null`, `status: true`,
`products_count` (drives the sort in `OxBrands`), `ar_char`/`en_char` (first
letter of each name, used for the server-side grouping below).

`fixtures/store/overlay/brand-membership.json` — new, brand id → product id
array, the exact mechanism `overlay/membership.json` already gives
categories.

`scripts/serve-store.mjs`:
- `snapshot.brandMembership` (overlay-gated, same pattern as
  `snapshot.membership`).
- `selectProducts()` gained a `case 'brands':` filtering on it — the same
  construction as `case 'categories':`, verified against the engine's own
  `loadBrandProducts()` (`node_modules/@salla.sa/twilight-theme-engine/dist/
  routes/product-listing.js`): it queries
  `product.queries.list({ source: 'brands', sourceValue: id })`, which
  serialises to `source_value[]=<id>` (`appendSourceParams`,
  `chunk-BVB75J3R.js`) — the exact query shape `selectProducts` already
  reads.
- The `/brands` list route now returns brands **grouped by first letter**
  (`groupBrandsByChar()`, new) instead of a flat array. Read against the
  engine source, not assumed: `routes/brands.js`'s own `brandsLoader()`
  treats `brand.list()`'s data as *already* an object keyed by letter
  (`Object.keys(data).sort(...)`) — the real Salla `/brands` endpoint groups
  server-side. The flat array this fixture served before happened to still
  work in `OxBrands.tsx` only by a JS accident (`Object.values([...]).flat()`
  on a plain array returns the array itself), which is not the real
  contract; grouping properly here is a correctness fix, not cosmetic.

`app/components/home/OxBrands.tsx`: sorts by `products_count` DESC before
rendering and caps at a new `MAX_BRANDS = 24` (both requested explicitly).
A brand with no `logo` now renders a name mark (`.ox-brands__mark`) instead
of a bare `<span>`: the first grapheme in its own span
(`.ox-brands__mark-first`, `--ox-accent`), the rest following, Cairo 700
(`--ox-w-title`, the theme's own font stack — nothing new loaded). Uses
`Array.from(name)` rather than a UTF-16 slice so a name mark never splits a
surrogate pair.

`app/styles/06-ox/_b2-home.scss`: `.ox-brands__name` → `.ox-brands__mark`/
`.ox-brands__mark-first`.

`docs/build/owner-checklist.md`, item F (23, "Categories and brands"): the
full 21-brand table above appended as the data `--brands` should load,
plus the NOW Sports research-gap note so the owner (or whoever runs
`salla-categories.mjs`) adds it to `BRAND_SOURCE` before `--apply --brands`.

### Tests added (`tests/home/blocks.test.tsx`, `OxBrands` describe block)

Sort-by-count-desc (a 7-product brand renders before a 1-product one), the
24-brand cap, and the name-mark fallback (first letter in its own span,
full name as the accessible text).

---

## 5. Type-tile artwork: cropping the baked-in frame

### What the defect actually was

Pixel analysis (Python/PIL — full method below), not just looking at
thumbnails, because the visual and the raw pixels told two different
stories at first: `amino_acids.webp`, `pre-workout.webp`, `creatine.webp`
and `protein.webp` (all 1024×1536) each have the SAME baked-in
rounded-rectangle card construction — a white/near-white margin with a
soft drop-shadow edge, rounded corners — but the margin's *shape* differs
by file:

- **amino_acids.webp**: a genuine rectangular inset on all four sides (the
  card is a smaller rounded plate floating on a page that is *also*
  near-white, ~245–247 vs ~253–254 — the two tones differ by only 6–8 units,
  which is why a naive corner-pixel check first read as "no defect here":
  the real edge is a faint drop-shadow dip, measured at y≈70 on a safe
  interior scan line).
- **pre-workout.webp / creatine.webp / protein.webp**: the card's straight
  edges run flush to the image boundary (measured margin ≈0–16px away from
  any corner); only the four CORNERS are cut, with a radius of roughly
  55–65px. A straight row/column scan taken even a little away from the
  exact corner underestimates this badly by the geometry of a quarter-circle
  cut (at `x = R/2` from a corner of radius `R`, the white run down that
  column is only `R − √(R² − (R/2)²) ≈ 0.13R`), which is why an early
  measurement pass returned inconsistent, much-too-small numbers before the
  method was corrected to sample at the true corner and to visually confirm
  the miss against 3×-zoomed corner crops.

### Measurements and the crop applied

| File | orig size | detected margin | crop box (inset, all sides) | cropped size | resized to |
|---|---|---|---|---|---|
| amino_acids.webp | 1024×1536 | ~67–90px (straight edges 36–68px; the corner curve alone reaches ~90px, confirmed: pixel (72,72) still (253,253,253), pixel (90,90) already the card's own (245,245,245)) | 95px | 834×1346 | 1024×1536 |
| pre-workout.webp | 1024×1536 | corner radius ≈56–61px (straight-edge margin ≈4–16px) | 72px | 880×1392 | 1024×1536 |
| creatine.webp | 1024×1536 | corner radius ≈54–59px (straight-edge margin ≈0–9px) | 72px | 880×1392 | 1024×1536 |
| protein.webp | 1024×1536 | corner radius confirmed cleared by 72px (pixel (72,72) already the card's own (248,234,218), flat out to (150,150)) | 72px | 880×1392 | 1024×1536 |

Method: for each file, scanned rows/columns from every edge inward,
classifying a pixel as "margin" when R,G,B are all ≥ 246–248 and mutually
within 6 units (the two page/card tones in the white-on-white cases are
close enough that a looser threshold would have falsely included real card
pixels). Sampled at many offsets per side (5%–95%, and directly at the
corner columns/rows) rather than only the midpoint, because the product
photograph itself sits close to the vertical/horizontal centre in several
of these files and a single centre-line scan crosses it. Verified the
chosen inset by direct pixel check (`Image.load()[x,y]`) at the resulting
crop corner before committing to it, and by a full visual pass — a 3×
nearest-neighbour zoom of each original top-left 220×220px corner, and a
full render of the cropped+resized result — both read against the actual
saved output files, not a separate preview copy.

Re-encoded WEBP quality 82, LANCZOS resize back to 1024×1536, exactly as
instructed. Originals kept at `public/categories/originals/<name>.webp`
(new directory).

### The other four, checked and clear

`collagen.webp`, `daily_health.webp`, `multivitamins.webp`, `omega_3.webp`:
the same scan (same thresholds, same multi-offset sampling) found 0–3px of
pure anti-aliasing noise on `collagen.webp` and exactly 0px on the other
three, at every sampled offset on every side. None cropped; verified rather
than assumed from the brief's own claim that "the second row's files are
edge-to-edge and correct."

### Confirming the tiles render edge to edge

`CategoryTile.tsx`'s art branch renders `<img className="ox-tile__art" ...
width={1024} height={1536} />` unchanged (no code touched — only the four
files' own pixels changed, same paths, same dimensions, same aspect ratio
2:3, so no `imagePaths.test.ts`/`CategoryTile` prop changes were needed).
The plain rectangle container (`.ox-tile--art`, `border-radius: 0` per
S3b's own already-shipped removal of the tile's own clip-path) now has
genuinely edge-to-edge artwork under it instead of a white-framed photo
floating inside a square frame. Visually confirmed by rendering the actual
saved `public/categories/{amino_acids,pre-workout,creatine,protein}.webp`
files directly (not a scratchpad copy) after the write — all four are full
bleed, matching `collagen.webp`'s own already-correct look. Could not
additionally confirm via a live `/categories` or `/ar` render (see
Deviations, item 6) — this is a static-asset change with no component code
touched, so the SSR/CSR behaviour is unaffected by definition; the risk
this step exists to catch (wrong crop, clipped product, wrong final size)
is fully covered by the pixel-level and visual checks above.

---

## 6. Type-tile corner radius: rounded to match, artwork clipped to it

Second coordinator follow-up: "the dark ones (vitamins-minerals and the
black-tone tiles) show square black corners while the others look rounded;
give every art tile the same corner radius as the tinted tiles... with the
artwork clipped to it... on the home tiles and the categories index cards."
The categories index page (`_b4-listing.scss`) is outside this batch's
original file list — coordinator-authorized scope for this one fix, noted
in Deviations below.

**What was actually inconsistent, read from the CSS rather than assumed.**
On the categories index (`.ox-cat-card`, `_b4-listing.scss`), the tinted
card already carried `border-radius: var(--ox-r-2)` (8px); the art variant
(`.ox-cat-card--art`) explicitly zeroed it, on record as a deliberate S2i
decision at the time ("a square-cornered artwork sits flush inside a
square-cornered frame, not a rounded one showing the artwork's own corner
past the curve" — true only because the artwork itself had no clip). On the
HOME grid (`.ox-tile`, `_b2-home.scss`), by contrast, NEITHER the tinted
nor the art tile carried any `border-radius` at all — both were already
square, so there was no existing inconsistency there to fix; the brief's
"give every art tile the same radius as the tinted tiles" is satisfied by
adding the SAME new radius to both branches at once, so the two never
diverge going forward.

**The fix, one shape, two surfaces.** Both `.ox-tile` and `.ox-cat-card` now
carry `border-radius: var(--ox-r-2)` (8px — the token the categories-index
tinted card already used, so the two surfaces read as one system) plus
`overflow: hidden` on the CARD element itself, clipping every child —
the tinted `::before` background/border, and the art `<img>`
(`.ox-tile__art` / `.ox-cat-card__art`) — to that one rounded shape in a
single declaration, rather than rounding each child layer separately.
`.ox-cat-card--art`'s own `border-radius: 0` override is removed (the base
rule's `--ox-r-2` now applies uniformly); its explanatory comment, and
`.ox-cat-card__art`'s own, are corrected to match rather than left
contradicting the code.

**The focus ring is unaffected.** Both cards' focus style is
`@include ox-focus(2px)`, which draws an `outline` (`.ox-goal`/`.ox-pcard`
needed to move theirs to an inset `box-shadow` specifically because
`clip-path` clips an outline — X-IDENTITY §3.4's `focus-clipped` rule); an
`outline` is never clipped by `overflow`, only by `clip-path`, so
`.ox-tile`/`.ox-cat-card` need no such change.

### Verified by

- `node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css` —
  compiles clean.
- `node scripts/check-identity.mjs` → `327 file(s), 0 problem(s)`.
- `node scripts/check-rtl.mjs` → `327 file(s), 0 problem(s)`.
- `node scripts/check-motion.mjs` → `327 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 322 file(s)
  scanned, 0 problem(s)`.
- `pnpm vitest run tests/home/OxCategories.test.tsx tests/listing/
  CategoriesIndex.test.tsx` → both fully green (11/11, 10/10) — no test in
  either file asserts a CSS property, so this instead confirms the markup
  itself (which this fix never touched) still renders every tile/card
  correctly; the visual rounding itself has no automated test surface in
  this repo (a CSS-only change, no live-browser screenshot tool available
  this session).
- Could not additionally confirm visually via a live render (no
  screenshot/browser tool in this environment); the fix is a direct,
  narrow CSS change (one radius token, one `overflow` value, on exactly the
  two selectors already responsible for this shape) with no markup change,
  so the risk surface is small and covered by the two gates above plus the
  green test suites for both surfaces.

---

## Files changed

- `app/styles/06-ox/_primitives.scss` — `.ox-iconbtn--angled` only:
  transparent face, 1px `color-mix` border (item 2).
- `app/styles/06-ox/_b2-home.scss` — `.ox-goal__slash`/`.ox-pcard__slash`
  mirrored right, then rebuilt twice more on coordinator follow-up: first as
  a physical parallelogram (`ox-strap-polygon()`, later removed), then as a
  long skewed bar (`ox-strap-inset()`/`ox-strap-width()`, the shipped form)
  leaning away from the card edge so it can run 40-50% of the card's height
  and still stay inside the clip, with per-tier overrides at 640/1280px
  (item 1); `.ox-goal:hover .ox-goal__cta .ox-iconbtn--angled` and
  `.ox-plan__arrow`/`.ox-plan:hover .ox-plan__arrow` no-fill fix (item 2);
  `.ox-plans`/`.ox-plans__slide` regridded, new `.ox-channel-door*` rules,
  new 768/1024 tiers (item 3); `.ox-brands__name` →
  `.ox-brands__mark`/`.ox-brands__mark-first` (item 4, later superseded — see
  the note below); `.ox-tile` gained `border-radius: var(--ox-r-2)` +
  `overflow: hidden` so every tile, tinted or art, shares one rounded corner
  (item 6, coordinator follow-up).
- `app/styles/06-ox/_b4-listing.scss` — `.ox-cat-card` gained the same
  `border-radius: var(--ox-r-2)` + `overflow: hidden`; `.ox-cat-card--art`'s
  own `border-radius: 0` override removed so it inherits the base rule's
  radius instead (item 6, coordinator follow-up, scope explicitly authorized
  for this one fix — this file is otherwise off-limits, see Deviations).
- `app/components/home/OxServices.tsx` — rewritten: `ChannelDoor` (new,
  file-local), `routeOut`-gated channel row, six-card `<ul>` (item 3). **Since
  superseded by a further rewrite outside this batch** — see the note below.
- `app/components/home/OxBrands.tsx` — sort by `products_count` desc, cap
  24, name-mark fallback (item 4). **Since superseded by a further rewrite
  (a scroll-snap carousel, `BrandTile`) outside this batch** — see the note
  below.
- `app/components/home/defaults.ts` — `HOME_BLOCK_HEIGHTS['ox-services']`
  re-measured for six cards (item 3).
- `app/components/home/HomeSkeleton.tsx` — `ServicesSkeleton()` reserves
  six blocks (item 3).
- `fixtures/store/overlay/brands.json` — 21 derived brands, replacing the
  four samples (item 4).
- `fixtures/store/overlay/brand-membership.json` — new (item 4).
- `scripts/serve-store.mjs` — `brandMembership` snapshot slot, `case
  'brands':` in `selectProducts()`, `/brands` list route now grouped by
  letter (item 4).
- `docs/build/owner-checklist.md` — item F (23) gained the derived brand
  table and the NOW Sports research-gap note (item 4).
- `public/categories/{amino_acids,pre-workout,creatine,protein}.webp` —
  cropped and re-encoded (item 5).
- `public/categories/originals/{amino_acids,pre-workout,creatine,
  protein}.webp` — new, the owner's uncropped copies (item 5).
- `tests/home/OxServices.test.tsx` — rewritten for six cards, the
  `routeOut` gate, and `effectivePrice`-driven pricing (item 3).
- `tests/home/blocks.test.tsx` — three new `OxBrands` tests: sort order,
  the 24 cap, the name-mark fallback (item 4).
- `docs/build/progress/S4a.md` — this file.

`GoalCard.tsx`, `PosterCard.tsx`, `CategoryTile.tsx` and `PlanCard.tsx` are
named in the brief's file-reading list but needed **no edits** — the strap
mirror and the arrow fill are both CSS-only, and the plan-card row is
unchanged markup, per the brief's own "PlanCard.tsx ... as they are"
instruction. `ChannelCard.tsx` and `app/components/blocks/ChannelCard.tsx`'s
test were read for reference and never touched.

## Deviations

0. **`OxServices.tsx`, `OxBrands.tsx`, `HomeSkeleton.tsx`, `defaults.ts` and
   both their test files were rewritten further by a concurrent, later batch
   during this session** (its own docblock references
   `docs/build/progress/S5c.md`), evolving the six-card band into a titled
   two-row "one offer in two steps" design (each row now carries its own
   title/note, both rows render on `/services` too, `ChannelCard`'s
   dedicated channels section on `ServicesHub.tsx` is gone) and the brand
   strip into a scroll-snap carousel (`BrandTile`). This happened AFTER this
   batch's own item 3/4 work landed and is not this batch's doing; per
   instruction it is not reverted. That batch has already converged
   `tests/home/OxServices.test.tsx` and `tests/home/blocks.test.tsx` to the
   new design (both green as of this batch's own final check). One file it
   has not yet reconciled: `tests/pages/ServicesHub.test.tsx` still asserts
   the now-removed dedicated channels section (`ox-channel-card` count of 3,
   and a reply-line assertion that depended on it) and fails against the
   current `ServicesHub.tsx`. Confirmed isolated to exactly that one file —
   `pnpm vitest run tests/home tests/common tests/listing tests/pages
   tests/blocks`: 44/45 files, 480/482 tests green; the two failures are
   both pre-existing-channels-section assertions in a file outside this
   batch's own scope (`app/components/pages/**`/its tests were never part
   of this brief), not anything this batch's item 1/2/5/6 work touches. Left
   for whichever batch owns the S5c evolution to reconcile.
1. **`ChannelDoor` is a new, file-local component inside `OxServices.tsx`,
   not a reuse of `app/components/blocks/ChannelCard.tsx`.** The full
   `ChannelCard` (badge, long description, a 48px block-level primary
   button) is sized for its own full-width slot on `/services`; the home
   row asks for a compact card (icon, name, *one-line* summary, price, CTA)
   sized to match the `PlanCard` doors beside it. Reusing `ChannelCard`
   as-is would have produced a visibly mismatched, over-tall row-one; a
   deliberately smaller sibling component keeps `ChannelCard.tsx` and its
   own test (`tests/blocks/ChannelCard.test.tsx`) completely untouched.
2. **The channels row is gated on `routeOut`, not unconditional.** The
   brief only specifies the HOME section; `OxServices` is also mounted
   inside `ServicesHub.tsx` (`routeOut={false}`) for the plan doors alone.
   Rendering the channels row there too would duplicate the three channel
   cards `ServicesHub` already shows in its own, fuller, dedicated section
   a few hundred pixels above — reintroducing the exact "six cards read as
   six equivalent things" problem S2c's split was fixing, just one page
   down instead of removed. `routeOut` was already the exact home-vs-
   services flag; reusing it for this second purpose is the smallest change
   that keeps `/services` correct.
3. **`.ox-skel-grid--channels`'s column breakpoints were not split from
   `.ox-skel-grid--guides`** to add a 768px 2-col tier matching the real
   grid exactly at that width — see item 3's own "Deviation flagged"
   paragraph above. Zero CLS impact (the reserved height is independent of
   the skeleton's internal shape); flagged rather than expanding scope.
4. **NOW Sports (`ناو سبورتس`) has no entry in `scripts/salla-categories.mjs`'s
   `BRAND_SOURCE`** — a real, distinct printed brand in the catalogue that
   the existing research list does not name. Documented in the owner
   checklist rather than silently added to `BRAND_SOURCE` myself: that file
   is the canonical research artifact for the live-store creation script,
   named in the checklist's own item F as *its* input, and adding an entry
   there is a content decision (is it really a separate SKU-facing brand,
   or should the one product be re-tagged NOW Foods?) I should not make
   unilaterally on a fixture-only batch.
5. **The brand strip's fallback `name` field carries the English spelling**
   (matching the pre-existing convention the four sample brands already
   shipped with, and the trademark-in-Latin-script convention this
   niche's real storefronts commonly use), with the Arabic-as-printed form
   carried in a new `name_ar` field for documentation/future use rather
   than as what actually renders. Flagged because the brief's "Arabic name
   as printed... English name" phrasing could also be read as "render the
   Arabic" — this batch kept the already-shipped, working convention rather
   than silently reversing it.
6. **Live `curl` against `http://localhost:3210` was unreachable for most of
   this batch, then recovered.** Nine attempts across roughly six minutes
   (`/ar`, `/`, `/ar/brands`; timeouts from 15s to 90s; direct
   `http://[::1]:3210` as well as `localhost`) all returned curl exit 28
   (timeout), with `netstat` confirming the port was listening but the
   connection never completed — the same "dev server unresponsive under
   concurrent load" condition `docs/build/progress/S3b.md` (item 6 of its
   own Deviations) already documented this session. It recovered on its own
   partway through the coordinator's follow-up (once the concurrent
   `app/components/product/OxProductCard.tsx` edit that had also been
   breaking `pnpm typecheck` settled) and a live pass then ran clean — see
   the top-level "Verified by" below for the actual results. A
   `getBoundingClientRect()` reading was not additionally taken even after
   recovery: the exact `clip-path` polygon read back from the live
   `/ar` HTML request already confirms six real `.ox-goal__slash` elements
   are present (below), and the algebraic containment proof (section 1) is
   an exact, stronger guarantee than a single measured rect for the same
   geometry the compiled CSS already proves deterministically.
7. **`app/styles/06-ox/_b4-listing.scss` was edited** for item 6 (the
   categories-index card radius), a file explicitly off-limits in this
   batch's original brief. The coordinator's own item-6 instruction named
   "the categories index cards" as one of the two surfaces to fix, which
   only exists in that file — read as a scoped, explicit authorization for
   this one selector pair (`.ox-cat-card`/`.ox-cat-card--art`), not a
   general reopening of the file. No other rule in it was touched.

## Verified by

- `pnpm typecheck` → `tsc --noEmit`, **clean, no output**. (Twice during
  this batch it reported one error in `app/components/product/
  OxProductCard.tsx`, confirmed via `git status --porcelain` to be a file
  another builder had modified and was mid-editing concurrently — outside
  this batch's scope, `app/components/product/**` is explicitly off-limits
  — and it cleared once that concurrent edit settled. None of this batch's
  own files appeared in that error at any point.)
- `pnpm vitest run tests/home tests/common` (this batch's own primary
  suite, at the time of its own item 3/4 work) → 17 files, 170 tests green.
- **Final full run, after the strap/corner-radius corrections and the
  concurrent S5c evolution (see Deviations item 0):**
  `pnpm vitest run tests/home tests/common tests/listing tests/pages
  tests/blocks` → **44 files passed, 480 tests passed, 1 file / 2 tests
  failed** (`tests/pages/ServicesHub.test.tsx`, asserting a dedicated
  channels section S5c's own further rewrite removed — outside this
  batch's scope, see Deviations item 0). `tests/home/OxCategories.test.tsx`
  and `tests/listing/CategoriesIndex.test.tsx` (the two files this batch's
  own item-6 corner-radius fix could plausibly have affected) are both
  fully green.
- `pnpm check:rtl` → `327 file(s), 0 problem(s)`.
- `pnpm check:motion` → `327 file(s), 0 problem(s)`.
- `pnpm check:strings` → `322 file(s), 0 problem(s)`.
- `node scripts/check-copy.mjs locales/ar.json locales/en.json` →
  `check-copy: 2 file(s), 0 problem(s)`.
- `node scripts/check-claims.mjs` → `32 file(s), 0 problem(s), 4
  allowlisted` (all four pre-existing `official_distributors`/
  `trust_distributors` allowlist entries, unrelated to this batch — same
  four S2c's own report already listed).
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 322 file(s)
  scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `327 file(s), 0 problem(s)`.
- `node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css` →
  compiles clean (only the pre-existing `@import` deprecation warnings);
  used to read back and confirm every CSS value/selector this report
  quotes, per BUILD.md's "read back and compare after any write" rule, in
  place of the unreachable dev server (see Deviations, item 6).
- Node scripts replicating the new `serve-store.mjs` grouping/filtering
  logic directly against `fixtures/store/overlay/brands.json` and
  `brand-membership.json` → 21 brands grouped into 10 letter-buckets,
  flattening back to 21; brand 9101 (NOW Foods) product filter returns
  exactly its 7 linked products by name.
- Live `curl` against `http://localhost:3210/ar` and `/ar/brands`, once the
  server recovered (see Deviations item 6). Captured at that point in the
  session, before the further S5c evolution (Deviations item 0) changed the
  services skeleton's own internal shape (still six placeholder cards
  today, now grouped under two row titles rather than one flat grid) — the
  height reservation and the goal-card strap markup this reading confirms
  are unaffected by that later change, since neither S4a nor S5c touched
  `HOME_BLOCK_HEIGHTS['ox-services']`'s numeric value or `.ox-goal__slash`
  again after this. `/ar` → HTTP 200; its
  `.s-block--ox-services` reserves `min-height:clamp(911px, calc(2148.029px
  - 85.905vw), 1813px)` — the exact `HOME_BLOCK_HEIGHTS['ox-services']`
  value, read back off the live page — and its skeleton renders exactly
  six `.ox-skel__block.ox-skel-dark` placeholders (the real six-card row
  hydrates client-side, the same lazy-block pattern
  `docs/build/progress/S2c.md` already documented for this block, so a raw
  curl cannot show the mounted `ChannelDoor`/`PlanCard` markup — the
  `tests/home/OxServices.test.tsx` suite is the equivalent check for that,
  as it already reads there). The same `/ar` response carries exactly six
  `data-testid="ox-goal-card"` elements, each with one `.ox-goal__slash`
  span (`grep -c`: 6 and 6) — the mirrored, re-derived strap markup is live.
  `/ar/brands` → HTTP 200, 21 distinct `.ox-brand-tile__name` values,
  exactly the 21 derived brands in the table above, none missing and none
  duplicated (`OxBrands`'s own count-desc sort is a home-block-only
  requirement — `/ar/brands` is `BrandsGrid.tsx`, outside this batch's file
  list, and correctly keeps its own alphabetical-by-first-letter grouping).
- Category artwork: visual confirmation by rendering the actual saved
  `public/categories/{amino_acids,pre-workout,creatine,protein}.webp`
  files post-write (not a scratchpad copy) — all four render edge to edge,
  matching `collagen.webp`'s already-correct look; dimensions confirmed
  1024×1536 via `PIL.Image.open(...).size` on every one of the four
  outputs and the four kept originals.
