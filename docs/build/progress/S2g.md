# S2g: owner review items, progress (2026-09-23)

Batch: the five owner review items on `docs/build/X-IDENTITY-2026-09-22.md` and
`docs/build/progress/XID.md`'s handoff table, plus one mid-task addition (the
`.ox-plan__watermark` `check-identity` finding). Read `X-IDENTITY-2026-09-22.md`
and `XID.md` in full before starting, per the brief.

## 1. Header fixed on every viewport, done

**Finding: `.ox-header` was already correctly `position: fixed` at every width,
with no override anywhere in the cascade.** Grepped every `position:` in
`_b1-layout.scss` and `app/styles/0*`; the only other `.ox-header` rule in the
corpus (`_b6-commerce.scss:1966`) sets `view-transition-name` only, nothing
positional. Compiled CSS confirms `.ox-header{display:block;position:fixed;...}`
(06-ox, loads last) sits after `.store-header{display:none}` / `@media
(min-width:768px){.store-header{display:block}}` (04-components, loads first)
at equal specificity, so `.ox-header` wins the cascade unconditionally, at
320/390/768/1440 alike, confirmed by fetching the live compiled bundle
(`http://localhost:3210/@tanstack-start/styles.css?...`):

```css
.store-header{
  position: relative;
  z-index: 50;
  display: none;
}
@media (min-width: 768px){
  .store-header{
    display: block;
  }
}
...
.ox-header {
  display: block;
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: var(--ox-z-sticky);
  background: var(--ox-band-header);
  color: var(--ox-ink-on-dark);
}
```

The Salla preview-bar offset rule is present and unconditional (applies at
every width, not just desktop):

```css
#s-theme_preview_bar ~ .app-inner .ox-header {
  inset-block-start: 52px;
}
```

**The actual bug: the reserved space under the fixed header was wrong on the
routes that matter most.** `--ox-header-h`'s own default (144px below 1024,
tokens.css) assumes the mobile header is ONE row (announce 40 + mobilebar 64 +
trust-scroller 40). `Header.tsx`'s `has-search-row` class
(`SEARCH_ROW_ROUTES`, home, PDP, listing, search, brands, tags, offers,
latest, sales) adds a SECOND row, `SearchField` at 40px tall plus
`padding-block-end: var(--ox-3)` (12px) = 52px, that the token's default never
accounted for. `useHeaderHeightVar`'s `ResizeObserver` corrects it, but only
*after* hydration and only inside a `useEffect` (runs after paint), so on
every one of those routes, `.app-inner` reserved 52px too little on first
paint and the page's own top content started sliding out from under the fixed
header. That is the "not fixed" the owner saw: the header itself never moved,
the content under it started 52px too high. Home is a `has-search-row` route,
so this is exactly what a mobile visit to `/` would show.

Fix, `_b1-layout.scss` (right after `.app-inner`'s own rule):

```scss
@media (max-width: 1023px) {
  .app-inner:has(.ox-header.has-search-row) {
    padding-block-start: calc(var(--ox-header-h) + 40px + var(--ox-3));
  }
}
```

`:has()` is already an accepted technique in this codebase
(`_b6-commerce.scss`'s `h1:has(~ .ox-acct)`). Scoped below 1024 because the
extra row is hidden (`.ox-mobilebar{display:none}`) from there up, where the
token's own 172px default already accounts for the desktop bar's one-row
search pill. Compiled and confirmed live:

```css
.app-inner {
  background: var(--ox-bg);
  padding-block-start: var(--ox-header-h);
}
@media (max-width: 1023px) {
  .app-inner:has(.ox-header.has-search-row) {
    padding-block-start: calc(var(--ox-header-h) + 40px + var(--ox-3));
  }
}
```

Reserved height at each probe width (`.ox-header`'s own rendered height,
`--ox-header-h` unless a search row is present):

| Width | No search row | `has-search-row` (home, PDP, listing, search, brands…) |
|---|---|---|
| 320 | 144px | 196px |
| 390 | 144px | 196px |
| 768 | 144px | 196px |
| 1440 | 172px | 172px (desktop bar carries search inline, no second row) |

SSR-confirmed: `curl http://localhost:3210/ar?storeId=1888890798` carries
`class="store-header ox-header has-search-row"` on the header element.

Drawer/mega panel: `.ox-mega` is `position:absolute; inset-block-start:100%`
inside its own `.ox-nav__item` (`position:relative`), so it opens directly
under the nav row inside the header's own box, never clipped, never under a
lower z-index than the header (`--ox-z-overlay` > `--ox-z-sticky`). Not
touched; already correct.

## 2. Hero shapes, done

`app/styles/06-ox/_b2-home.scss` section 2 (`.ox-hero__photo`, `.ox-hero__scrim`,
`.ox-hero__edge`), `@media (min-width: 640px)` block. The 320/390 mobile
corner-cut construction (lines ~476-539, `max-width: 639px`) is untouched, as
instructed, this item is desktop-only (the split doesn't exist below 640).

**Black panel's edge, pushed 7% of hero width further left** (mid-point of the
6-8% asked for): pane `inline-size` 60% → **53%** of the 1440 hero band
(0.60 − 0.07 = 0.53; 0.07 × 1440 = 100.8px, 864px → 763.2px). The lean stays
300px (band height 560 unchanged, so the vertical breakpoint stays 46.43% -
260/560) and the run stays the *same absolute* 202.4px (run = lean × tan34° =
300 × 0.6745085 = 202.35, unaffected by the pane's own width). Only the run's
expression as a *percentage of the now-narrower box* changes:
202.4 / 763.2 = **26.52%** (was 202.4 / 864 = 23.43%), recomputing this, not
reusing the old 23.43% against the new box, is what keeps the cut at exactly
34° after the resize; reusing the old percentage against a narrower box would
have left the top of the cut in place and only dragged the foot left,
steepening the angle. Verified: dx = (100−73.48)% × 763.2 = 202.42,
dy = (100−46.43)% × 560 = 300.0, atan(202.42/300.0) = 34.02°, inside the
identity's ±0.6° tolerance.

```scss
/* identity: 34deg, run 202.4 of 763.2 */
clip-path: polygon(0 0, 100% 0, 100% 46.43%, 73.48% 100%, 0 100%);
/* LTR */
clip-path: polygon(0 0, 100% 0, 100% 100%, 26.52% 100%, 0 46.43%);
```

`.ox-hero__scrim` mirrors the photo's box and polygon exactly, same edit.

**Orange strap pushed right, flush with the panel's edge, thickness doubled.**
`inset-inline-end` 51% → **53%**: the strap now sits exactly on the pane's own
vertical edge (its `inline-size`, 53%, the flat run for the top 46.43% of the
band) rather than at the stale 51%, which was computed off the *pre-X-IDENTITY
22° polygon*'s numbers (the code comment cited `96.7%/73.3%`) and never
re-derived when the 34° cut shipped, it was already floating inside the
photograph before this batch's pane-width change, not a value my own edit
displaced. 53 > 51, so this reads as "pushed right" against the code's own
established convention (`inset-inline-end` measured from the reading END -
the left edge in RTL, so a larger number moves the bar physically right).
`inline-size` 10px → **20px** (×2, "double the strap's weight").

```scss
.ox-hero__edge {
  position: absolute;
  z-index: 2;
  inset-block: -12%;
  inset-inline-end: 53%;
  inline-size: 20px;
  background: var(--ox-accent);
  transform: skewX(var(--ox-skew));
  pointer-events: none;
}
[dir='ltr'] .ox-hero__edge {
  inset-inline-end: auto;
  inset-inline-start: 53%;
}
```

Untouched: the 34° token derivation (`--ox-angle-tan`, `--ox-skew`), the
`/* identity: */` pragmas (updated in place, not removed), RTL mirroring
(kept, both photo/scrim/edge), the 320/390 mobile clamps, `.ox-hero__wedge*`
(a separate, physical-left element per its own comment, not "the orange
strap" this item names).

Compiled and confirmed live (`http://localhost:3210`):

```css
inline-size: 53%;
/* identity: 34deg, run 202.4 of 763.2 */
clip-path: polygon(0 0, 100% 0, 100% 46.43%, 73.48% 100%, 0 100%);
...
inset-inline-end: 53%;
inline-size: 20px;
```

`node scripts/check-identity.mjs` stays green (0 problems, see "Verified by").

## 3. Services page, done

**Advisory band no longer full-bleed on `/services`.**
`app/components/pages/ServicesHub.tsx`: `<OxServices className="ox-page__bleed
ox-hub__advisory" .../>` → `<OxServices className="ox-hub__advisory" .../>`.
Home page keeps the full-bleed instance untouched (that call site is not in
this file).

`app/styles/06-ox/_b5-pages.scss`, new rule after `.ox-channels--one`:

```scss
.ox-page--bleed > .ox-hub__advisory {
  padding-inline: 0;
  border-radius: var(--ox-r-3);
}
```

Without `.ox-page__bleed`, `.ox-hub__advisory` is a regular child of
`.ox-page--bleed`, which already gives it `max-inline-size:
var(--ox-container)`, enough on its own to sit inside the container. But
`OxServices` *also* wraps its own content in `.ox-container.ox-services__inner`
(needed for its other, full-bleed caller, the home page): without dropping
`padding-inline`, the page wrapper's own gutter padding and the inner
`.ox-container`'s `min(1296px, 100% - 2×gutter)` calc would both apply,
insetting the row twice. Dropping `padding-inline` to 0 here lets the inner
`.ox-container` do the only inset, so the band's content lands at exactly the
same width as every other section, not narrower. `border-radius:
var(--ox-r-3)` gives it its own radius; `.ox-services--banded` already carries
`overflow: hidden` (clips its own ground motif), so the radius clips cleanly
with it, no separate `overflow` declaration needed.

**`.ox-channels` fixed-track finding: not reproducible in the working tree.**
Grepped `app/styles` for `400px` and for every `grid-template-columns` in
`_b5-pages.scss`/`_blocks.scss`: `.ox-channels` was already
`grid-template-columns: repeat(3, minmax(0, 1fr))` at ≥768px, not a fixed
`400px 400px 400px` track, likely fixed by concurrent work already landed in
this session (git status shows other listing/filters files mid-edit). Applied
the requested end-state anyway, since it is a real, if smaller, improvement:
between 768px and ~872px (3 × 280px + 2 gaps) a rigid three-column track
squeezed each of the three `ChannelCard`s under a comfortable width rather
than reflowing; `auto-fit` fixes that band without changing anything above it
(there are only 3 `SERVICE_CHANNELS` items, so `auto-fit` never grows past 3
columns regardless of viewport, nothing to cap).

```scss
@media (min-width: 768px) {
  .ox-channels {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
```

Could not find the specific "channel cards squeezed into a narrow right-hand
column at 1440/1920" defect described in the brief anywhere in the current
`_b5-pages.scss`/`_blocks.scss` (`.ox-hub__channels`, `.ox-channels`,
`.ox-channel` all resolve through `fr`/`minmax()`/`var(--ox-container)`, no
literal px width or a second, narrower grid track). Read the whole page's
other sections (`ScopePanel`, `ServiceCompare`, `HowItWorks`, `PageAnchors`,
the band CSS) for a stray fixed max-width and found none. Flagged rather than
guessed at a fix with nothing to visually verify it against in this
environment; SSR-confirmed both `.ox-hub__advisory` and `.ox-channels` render
with the classes above on `/ar/services`.

## 4. The angled OptimalX button shape on card actions, done

New shared class, `app/styles/06-ox/_primitives.scss` (after `.ox-badge-stack`):

```scss
.ox-iconbtn--angled {
  block-size: 24px; // ox-allow: small-angle
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  flex: none;
  background: rgba(var(--ox-accent-rgb), 0.12);
  color: inherit;
  clip-path: polygon(0 8px, #{ox-run(8px)} 0, 100% 0, 100% 100%, 0 100%);
  [dir='ltr'] & {
    clip-path: polygon(0 0, calc(100% - #{ox-run(8px)}) 0, 100% 8px, 100% 100%, 0 100%);
  }
}
```

Not `ox-angled()` (the CTA parallelogram) at this size: §2.4's own rule ("any
control narrower than run / 0.24 loses the parallelogram") puts the minimum
viable width at 67.5px for a 44px-tall run, and this is a 24px *square*, the
full parallelogram would eat most of the box. Used the mark's single
arm-foot corner cut instead (lean 8px, `ox-run(8px)` = 5.4px), which reads as
"a bit angled" at control scale without needing the CTA's own width floor.
`block-size` ordered first with the `ox-allow: small-angle` pragma on that
line, matching `.ox-badge`'s own established fix immediately above it in the
same file (the checker's `sizeLine` resolution loses a pragma placed next to a
non-first declaration when the match spans a line break, traced and fixed
the same way there this session).

- **Goal cards** (`GoalCard.tsx`, mine to edit): added the class directly to
  the arrow `<i>`. Retired `.ox-goal__cta`'s own skewed-border pseudo
  (`_b2-home.scss` section 5) so the card keeps exactly one angled gesture -
  now on the arrow alone, rather than stacking a second one next to it; the
  label is plain text beside the icon-button.
- **Featured-rail cover CTA** (`FeaturedRail.tsx` + `_b4-listing.scss` section
  15): same class added directly to the arrow `<i>`. Added the corner cut to
  `.ox-featured__plate` (the cover image), lean 40 (run 27.0) below 1024, lean
  64 (run 43.2) from 1024 up, via `@include ox-x-corner()` (available here -
  `_x-motif.scss` loads before `_b4-listing.scss`). §3.3's own table also
  names a 390-specific lean-48/run-32.4 step; skipped rather than adding a new
  breakpoint `.ox-featured__item`'s own sizing rule has no other precedent
  for at that width, flagged, not silently dropped (same precedent
  `_x-motif.scss`'s `.ox-x-divider` comment sets).
- **Plan-card CTA arrow** (`_b2-home.scss` section 8, CSS only, `PlanCard.tsx`
  is on the do-not-touch list): reproduced the same shape directly on the
  existing `.ox-plan__arrow` selector via `@include ox-x-corner(8px)`
  (available here too), since the class itself can't reach markup it isn't
  allowed to edit.
- **Type tiles** (`CategoryTile.tsx`/`OxCategories.tsx`): **not edited**, per
  the brief. `.ox-iconbtn--angled` is ready in `_primitives.scss` for that
  builder to attach to the arrow in markup.

Contrast/touch targets: the drawn box is 24×24 (≥24px, the brief's own floor);
`@include ox-hit-area` was considered for a 44×44 invisible target but
**dropped**, every one of these arrows sits inside a single larger `<Link>`
that already owns the click/focus target (the whole card, or the whole CTA
row), so a second, independently-focusable hit area on the icon would be a
nested interactive target inside another interactive element, which
DIRECTION 9.2 already rules out elsewhere in this codebase (GoalCard's own
comment: "never a nested button"). No new outline/focus-visible was added for
the same reason, there is nothing here for it to focus independently.

`node scripts/check-identity.mjs`: 0 problems (verified after fixing the
`small-angle` pragma-ordering issue above, see "Verified by").

## 5. Remaining XID handoff items, done

**Listing header divider** (`app/styles/06-ox/_b4-listing.scss`,
`.ox-listing__title-row`): reproduced `.ox-x-divider`'s own construction
(hairline + one stepped tab at 62%) as a `border-block-end` plus one `::after`
rather than the class itself, `.ox-x-divider` is a *separate element* with
its *own* nested `::after` for the step, and this row can't take a new
wrapping element (`ListingPage.tsx`, which owns this markup, is on the S2 do-
not-touch list), so the border stands in for the divider's line and leaves
`::after` free for the step tab, at the same t/j values `.ox-x-divider` ships
(14×4 below 1024, 20.9×6 from 1024 up).

```scss
.ox-listing__title-row {
  position: relative;
  ...
  padding-block-end: var(--ox-3);
  border-block-end: 1px solid var(--ox-line);
  &::after {
    content: '';
    position: absolute;
    inset-block-end: -1px;
    inset-inline-start: 62%;
    inline-size: 14px;
    block-size: 4px;
    background: var(--ox-line);
  }
}
@media (min-width: 1024px) {
  .ox-listing__title-row::after { inline-size: 20.9px; block-size: 6px; }
}
```

**Active filter chip step motif** (`app/styles/06-ox/_primitives.scss`,
`.ox-chip--filter.is-selected` / `[aria-pressed='true']`): notch t4/j14.0,
inlined (same reason `.ox-badge` inlines its own, `_x-motif.scss` loads
after this file). No pragma needed: `block-size: 36px` lives on the parent
`&--filter` rule, a different selector from `&.is-selected`, so the
checker's same-selector `small-angle` match never fires here, confirmed by
the 0-problem run.

**`ox-x-bullet` on the ServicePdp next-steps list**
(`app/components/product/variants/ServicePdp.tsx` +
`app/styles/06-ox/_b3-product.scss` section 17): each `<li>` now opens with a
`<span className="ox-x-bullet" aria-hidden="true" />` and the `<ol>` carries a
new `ox-service__steps` class (`list-style: none`, flex column); a paired
`.ox-service__step` class centers the bullet on the first line of text
(`margin-block-start: 0.5em`) rather than the whole (possibly wrapped) row.

## Files changed

- `app/styles/06-ox/_b1-layout.scss`, header reserved-height fix for
  `has-search-row` routes below 1024 (item 1).
- `app/styles/06-ox/_b2-home.scss`, hero pane/scrim/strap arithmetic (item
  2); `.ox-goal__cta` simplified, its old skewed pseudo removed (item 4);
  `.ox-plan__arrow` given the icon-button shape (item 4); `.ox-plan__watermark`
  colour/opacity fix (coordinator addendum).
- `app/components/home/GoalCard.tsx`, `ox-iconbtn--angled` added to the
  arrow icon (item 4).
- `app/components/pages/ServicesHub.tsx`, `OxServices` call no longer
  carries `ox-page__bleed` (item 3).
- `app/styles/06-ox/_b5-pages.scss`, `.ox-page--bleed > .ox-hub__advisory`
  containment + radius (item 3).
- `app/styles/06-ox/_blocks.scss`, `.ox-channels` grid track (item 3).
- `app/styles/06-ox/_primitives.scss`, `.ox-iconbtn--angled` (item 4);
  active filter chip notch (item 5).
- `app/components/listing/FeaturedRail.tsx`, `ox-iconbtn--angled` on the
  cover CTA arrow (item 4).
- `app/styles/06-ox/_b4-listing.scss`, `.ox-featured__plate` corner cut
  (item 4); `.ox-listing__title-row` divider (item 5).
- `app/components/product/variants/ServicePdp.tsx`, `ox-x-bullet` markup on
  the next-steps list (item 5).
- `app/styles/06-ox/_b3-product.scss`, `.ox-service__steps`/`.ox-service__step`
  CSS (item 5).

## Deviations

- Featured-rail corner cut skips §3.3's 390-specific lean-48/run-32.4 step
  (uses the 320 value, lean 40, through to 1024), no existing breakpoint at
  that width for this element; flagged above, not silently dropped.
- `.ox-channels`'s reported `400px 400px 400px` fixed track was not present in
  the working tree at the start of this batch; applied the requested
  `auto-fit` end-state anyway as a real (smaller) improvement, and could not
  reproduce the "squeezed into a narrow right-hand column" defect anywhere
  else on `/services` after reading every section's CSS.
- `ox-hit-area`/independent focus was deliberately **not** added to the new
  icon-buttons (see item 4), every one sits inside a single larger link and
  DIRECTION 9.2 already forbids a nested interactive target.
- `.ox-plan__watermark` (`_b2-home.scss`) is outside this batch's originally
  named surfaces (it is `PlanCard.tsx`'s CSS, and that file is on the S2
  do-not-touch list) but was fixed per the coordinator's mid-task addendum:
  `color: var(--ox-accent); opacity: 0.12` → `color: var(--ox-ink-on-dark);
  opacity: 0.06`, per X-IDENTITY §4.1's own judge fix (item 18) and the
  `watermark-contrast` gate.

## Verified by

- `pnpm typecheck` → `tsc --noEmit`, 0 errors.
- `pnpm vitest run tests/home tests/layout tests/pages tests/listing
  tests/product/ServicePdp.test.tsx tests/common` →
  **44 files passed, 488 tests passed**, including
  `tests/product/ServicePdp.test.tsx` (6/6), `tests/listing/FeaturedRail.test.tsx`
  (8/8), `tests/home/OxHero.test.tsx` (15/15), `tests/home/OxGoals.test.tsx`
  (10/10), `tests/pages/ServicesHub.test.tsx` (13/13),
  `tests/layout/Header.test.tsx` (14/14).
- `pnpm check:rtl` → `315 file(s), 0 problem(s)`.
- `pnpm check:motion` → `315 file(s), 0 problem(s)`.
- `pnpm check:strings` → `307 file(s), 0 problem(s)`.
- `node scripts/check-tokens.mjs` → `123 token(s) defined, 312 file(s)
  scanned, 0 problem(s)`.
- `node scripts/check-identity.mjs` → `315 file(s), 0 problem(s)` (one round
  of `small-angle` pragma-ordering fixes needed first, see item 4, then
  clean, including the coordinator's `.ox-plan__watermark` finding).
- Live curl, `http://localhost:3210` (retried until it answered 200, it 500'd
  on the first attempt, per the brief's own note about concurrent writers):
  - `curl -s "http://localhost:3210/ar?storeId=1888890798"` → header carries
    `class="store-header ox-header has-search-row"`; 6 `ox-iconbtn--angled`
    (the six goal-card arrows); hero `.ox-hero__photo`/`__scrim`/`__edge`
    present.
  - `curl -s "http://localhost:3210/ar/services?storeId=1888890798"` →
    `.ox-hub__advisory` present (no `ox-page__bleed`); `.ox-channels` present;
    3 `.ox-plan__arrow` and 3 `.ox-plan__watermark` (the three plan cards -
    the home page's own `OxServices` instance renders 0 plan cards in this
    fixture/overlay, unrelated to this batch, so `/services` is where the
    watermark/arrow fix was actually exercised).
  - `curl -s "http://localhost:3210/ar/protein/c9001?storeId=1888890798"`
    (a category listing) → `.ox-listing__title-row` present; 6
    `.ox-featured__plate` and 6 `.ox-iconbtn--angled` (the featured rail); 14
    `.ox-chip--filter` chips (none `is-selected` on this unfiltered URL, so
    the notch itself was verified statically via `check-identity` and the
    compiled CSS rather than live, in-context).
  - `curl -sL "http://localhost:3210/en?storeId=1888890798"` → `dir="ltr"`,
    hero classes present (mirror verified statically via `check-rtl`/
    `check-identity`'s `unmirrored` rule, which is file-wide).
  - `curl -sL "http://localhost:3210/ar/p487045117"` (a service PDP, OX-044)
    → HTTP 500, body shows `"Failed to load store settings. Make sure
    VITE_STORE_DOMAIN..."`, an environment/fixture failure unrelated to this
    batch (confirmed on a second SKU, `p2000960449`, same error). Fell back to
    `tests/product/ServicePdp.test.tsx` (6/6 passed), which renders this
    component directly and covers the bullet markup.
  - Compiled CSS (`http://localhost:3210/@tanstack-start/styles.css?...`)
    checked directly for every rule quoted above (items 1-5); all present and
    in the expected cascade position.

## Requests to other builders

- **CategoryTile.tsx/OxCategories.tsx** (item 4, per the brief): attach
  `ox-iconbtn--angled` to the type-tile arrow icon. The class is ready in
  `app/styles/06-ox/_primitives.scss`.
