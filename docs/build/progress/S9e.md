# S9e: the advisory offer photo and the page-band masthead ground

Two owner items from screenshots of 2026-09-24 (conductor brief, batch S9e).

## Item 1: the advisory offer strip's photo, "chemistry with the section"

Owner: "extend the advisory image to have chemistry with the section." The
`advisory-room` photograph in `OxServices`' offer strip (`OfferStrip`,
`_b2-home.scss` §8) was a small rounded thumbnail beside the two facts. The
comment there ("a plain rounded rectangle, never a second cut") is retired by
this item.

Build: the photograph becomes part of the `.ox-services__offer` plate itself.

- Below 768: a full-width top band, ~16:7, sharp corners (the plate's own
  `ox-x-corner` stays the block's one angled gesture at this tier), bleeding
  to the plate's own padded edges via a negative margin on the frame, a
  bottom gradient (`--ox-graphite-3`) into the plate, facts below it.
- From 768: the plate's inline-end panel, `position: absolute`, spanning the
  plate's full block-size (its containing block is the plate's own padding
  box, so `inset-block: 0` reaches the plate's real top/bottom regardless of
  `.ox-services__offer`'s own padding), narrower share than 1024.
- From 1024: same panel, 38% of the plate's width (36-40% band the brief
  named), the panel's own inner edge cut at the identity lean via
  `ox-wedge($h, start)` (`_primitives.scss` - a SECOND, different kind of
  angled construction on a DIFFERENT selector than the plate's own
  `ox-x-corner`, so `check-identity.mjs`'s `one-angled-per-block` rule, which
  only counts kinds within one selector's own body, is clear by construction
  without a pragma), a `--ox-graphite-3` gradient from the inner edge over
  the first third (calm ground for the facts), a faint accent glow
  (`rgba(var(--ox-accent-rgb), 0.14)`) along the cut. `.ox-services__offer`
  reserves the panel's own width plus breathing room via
  `padding-inline-end`, so the facts/actions never sit under the photograph.

`object-position` and the measured panel shares are recorded in the build
log below, after the headless measurement pass.

## Item 2: the page-band masthead's outer ground

Owner (about-page screenshot): "the other grey space caused by the angle is
to be the same colour as the page background, not grey." The parallelogram
plate (`Band.tsx`'s `.ox-bband__plate`, `ox-angled()`) covers only the
photograph; the two triangular corners its diagonal cut leaves inside the
band's own rectangle (`ox-angled()`'s two uncut/cut corners, X-IDENTITY
§2.5) showed the band's OWN fill - not the page.

Root cause, found by sampling the rendered pixel at the triangle
(`rgb(226,226,227)`) and matching it to `rgba(14,17,23,0.12)` (`.ox-bband
__wash`, `_b3-product.scss`) composited over `rgb(255,255,255)` (`body`):
the wash is a flat `inset: 0` tint painted over the WHOLE band box,
independent of the section's own `background`, which the four page-hero
callers (`.ox-page--*__band`) already set to `transparent`, but only from
1024 up.

Fix, `_b5-pages.scss` §2a only: `background: transparent` and the wash
reset move to the base (unconditional) rule for the four page-band
selectors, so the fix applies at every tier, not only >=1024. Below 1024 the
band's headline/sub/badges/lockup sit BELOW the 160px photo strip (`.ox-bband`'s
own `padding-block-start: 184px`), genuinely off the photograph, and now on
the page's own light ground rather than the band's dark rectangle, so the
shipped reversed ("on-dark") ink fails contrast there. A new
`@media (max-width: 1023px)` block scoped to the same four selectors swaps
the headline/sub/badge/ring colours to the page-ink role tokens
(`--ox-fg`/`--ox-fg-2`/`--ox-fg-3`/`--ox-bd`); from 1024 the plate covers the
block's full height, the text sits on the photograph again (on
`.ox-bband__scrim`'s own darkening gradient), and the shipped on-dark ink is
correct and untouched.

The lockup (`Wordmark`, `tone="dark"` loads the reversed cream file, a raster
asset, not `currentColor`, so no CSS filter can retint it without also
wrecking the accent, per `Wordmark.tsx`'s own doc comment) needed a second,
markup-level fix: `Band.tsx` now renders BOTH tones
(`.ox-bband__lockup-mark--dark`/`--light`), and `_b5-pages.scss` §2a toggles
which one paints, per tier, for the four page-band selectors only. PDP's own
brand band (`BrandBand.tsx`, a separate component that only shares the
`.ox-bband` CSS, per `Band.tsx`'s own docblock) is untouched: it never
carries one of the four page-band classes, so it keeps its shipped dark
ground, its wash and its single dark-tone lockup exactly as verified.

Screenshots and before/after are recorded in the build log below.

## Build log

1. Read `OxServices.tsx` (`OfferStrip`), `_b2-home.scss` §8, `store-photos.ts`,
   `_primitives.scss` (`ox-run`, `ox-wedge`, `ox-angled`), `_x-motif.scss`
   (`ox-x-corner`), `_plates.scss` (`ox-plate`), `_covers.scss` (the S9c
   cinematic-gradient/glow precedent this item's own gradients and glow
   follow), `docs/build/progress/S9c.md` §2, `scripts/check-identity.mjs`
   (`one-angled-per-block` counts *kinds* within one selector's own body,
   never across a family, confirmed by a clean run after the edit, no
   pragma needed), `Band.tsx`, `_b5-pages.scss` §2, `_b3-product.scss` §12
   (`.ox-bband`, out of scope, PDP's `BrandBand.tsx` is a separate
   component that only shares this CSS), `Wordmark.tsx`.

2. Item 1. Restructured `OfferStrip` (`OxServices.tsx`): the photo moved out
   of `.ox-offer__top` (retired) into its own `.ox-offer__photo-frame`,
   first child of the plate, with `.ox-offer__photo-scrim` and
   `.ox-offer__photo-glow` decorative siblings of the `<img>`. Rewrote
   `_b2-home.scss` §8's offer-strip photo rules (panel geometry, gradients,
   glow, `padding-inline-end` reservation) across the base/768/1024 tiers.

3. Mid-batch correction (owner feedback via the conductor, a 390
   screenshot): the mobile gradient was too heavy (opaque graphite from 45%
   of the band down, hiding the lower half of the photo). Changed the <768
   `.ox-offer__photo-scrim` to `linear-gradient(to bottom, transparent 60%,
   color-mix(in srgb, var(--ox-graphite-3) 85%, transparent) 100%)` -
   transparent through 60% of the band, then a ramp to 85% graphite (never
   fully opaque) over the last 40%, so the door and the advisor stay visible
   and only the seam into the facts darkens. Re-ran `sass` compile,
   `check-identity.mjs`, `check-tokens.mjs` after the change (all clean).

4. Item 2. Sampled the rendered pixel at the about-page band's triangle
   corner at 1440 (headless, CDP): `rgb(226,226,227)`, which is
   `rgba(14,17,23,0.12)` (`.ox-bband__wash`) composited over `rgb(255,255,255)`
   (`body`), confirmed by `document.elementFromPoint` returning the
   (already-transparent) section itself at that point, so the wash, a flat
   `inset: 0` sibling span, independent of the section's own `background` -
   was the paint source, not the section. Moved `background: transparent`
   and a `.ox-bband__wash { background: transparent; }` reset to the BASE
   (unconditional) rule for the four `.ox-page--*__band` selectors in
   `_b5-pages.scss` §2a (previously only set from 1024); added a new
   `@media (max-width: 1023px)` block swapping the headline/sub/badge/ring
   colours to the page-ink role tokens, since below 1024 that content sits
   below the 160px photo strip, genuinely off the photograph and now on the
   page's own ground. Added the lockup's dual-tone markup to `Band.tsx`
   (`.ox-bband__lockup-mark--dark`/`--light`, both `Wordmark`s always
   render) and the matching CSS toggle in `_b5-pages.scss` §2a (global
   default: dark visible; the four page-band selectors flip it below 1024).
   `PDP`'s own `BrandBand.tsx` never carries one of the four classes, so it
   is provably unaffected, confirmed by grep, it is a separate component
   file that only imports `Wordmark` and `Icon`, not `Band`.

5. Fixed two tests broken by the dual-Wordmark markup
   (`tests/pages/shared-surfaces.test.tsx`, `tests/pages/AboutPage.test.tsx`):
   both queried `getByTestId('ox-wordmark')`, now ambiguous with two marks;
   rewritten to query `.ox-bband__lockup-mark--dark img` (or assert
   `getAllByTestId` length 2), see those files' own diffs for the exact
   assertions.

6. Verification: `pnpm typecheck` (clean), `pnpm vitest run tests/home
   tests/pages` (339 passed, 1 failed, `tests/home/posterRow.test.ts`'s
   "draws every card... sharp corners" test, which touches `.ox-pcard`, a
   selector this batch never edited; it passes standalone
   (`pnpm vitest run tests/home/posterRow.test.ts`, 5/5) and fails only
   inside the full multi-file run, so it is pre-existing cross-file
   flakiness in the suite, not a regression from this batch, reported to
   the conductor rather than "fixed" under this batch's own scope), `node
   scripts/check-tokens.mjs` (0 problems), `node scripts/check-identity.mjs`
   (0 problems, `one-angled-per-block` held: `.ox-services__offer`'s
   `ox-x-corner` and `.ox-offer__photo-frame`'s `ox-wedge` are two different
   selectors, each carrying exactly one kind), `node scripts/check-strings.mjs`
   (0 problems).

7. Screenshots and measurements (chrome-headless-shell over CDP, the S8f
   method; a raw Node `WebSocket` client against the DevTools protocol -
   no `ws`/`playwright` package is installed in this repo, scratch scripts
   in the session scratchpad). NOTE: navigating to the bare `/` (no locale
   prefix) hung indefinitely in the headless browser even though the
   server's own 307 redirect to `/ar` was instant over `curl`; every
   navigation below goes straight to the `/ar/...` path, which loaded
   normally. `/ar/services` was used for the offer-strip measurements
   (`OxServices` renders identically there and on `/ar`).

   **Item 1, panel share of the plate** (`getBoundingClientRect` on
   `.ox-services__offer` and `.ox-offer__photo-frame`):

   | width | plate w×h | frame w×h | share |
   |---|---|---|---|
   | 390 | 358×498 | 358×157 (16:7 top band) | 100% (full width) |
   | 768 | 705×260 | 212×260 | 30.0% |
   | 1024 | 945×235 | 359×235 | 38.0% |
   | 1440 | 1232×238 | 468×238 | 38.0% |

   `object-position: 68% 42%` (chosen and verified against the rendered
   crops at all four tiers): the frosted glass door stays in frame at the
   panel's own left edge and the advisor at the desk stays in frame toward
   the right, at both the tall 30-38%-wide side panel (768/1024/1440) and
   the short 16:7 top band (390).

   Screenshots: `docs/build/progress/visit/s9e-offer-390.png`,
   `s9e-offer-768.png`, `s9e-offer-1024.png`, `s9e-offer-1440.png` (all
   post-fix, i.e. with the reduced mobile gradient from step 3).

   **Item 2**, `/ar/about`: `s9e-about-before-390.png` /
   `s9e-about-before-1440.png` (pre-fix, the 1440 shot shows the two grey
   triangles at the plate's cut corners; sampled `rgb(226,226,227)`) and
   `s9e-about-after-390.png` / `s9e-about-after-1440.png` (post-fix, the
   1440 triangles now sample exact `rgb(255,255,255)`, matching the page
   background pixel-for-pixel; the 390 shot shows the heading/subline/lockup
   now in page ink on the page's own white ground, with the reversed-cream
   lockup swapped for the normal-ink file).

## Deviations from the brief

- The mid-batch gradient correction (step 3) changes the stops named in this
  doc's own Item 1 section above from the original build (45%→opaque) to the
  reduced ramp (60%→85% graphite); the CSS block in `_b2-home.scss` and this
  log's step 3 are the current, correct record.
- `tests/home/posterRow.test.ts` fails inside the full `tests/home
  tests/pages` run but passes standalone; not touched, reported as
  pre-existing flakiness rather than fixed, since its own selector
  (`.ox-pcard`) is outside this batch's file list.
