# S2c: advisory band, brand band, CTA band, progress (2026-09-22)

Batch: S2c, from `docs/build/brief-S2-2026-09-22.md` (S2c section + the
2026-09-22 evening owner amendments), extended mid-batch (after a session
interruption at 21:59 whose auto-commit landed part of this work as `605fe59`/
`d9aab4a`) by `docs/build/X-IDENTITY-2026-09-22.md` §§2-4, which corrects the
angle system to 34° and adds the step motif and the mark-as-device rules. This
file reports both phases together as one batch.

**This session ran concurrently with another builder (S2b) actively editing
`SectionHeader.tsx`, `useTaxonomyLinks.ts`, `app/routes/index.tsx`,
`app/routes/$slug.c$id.tsx` and adding `NeedCard.tsx`/`OxNeeds.tsx` in the
same working tree.** None of those files were touched by this batch. The
full-suite run below shows their in-progress state, not a regression this
batch introduced (see "Pre-existing, unrelated failures").

## Steps done

1. **Advisory band rebuilt to one tier.** `OxServices` now renders the eyebrow
   (ink-on-dark + 24×2 accent bar, never orange type), the live
   `ox.services.title` headline, a new `ox.home.band_subline`, the three
   `PlanCard` doors, one filled `ox-angled(44px)` CTA under the row (home
   only, `routeOut`), and the limit-of-our-work line. Ground is flat
   `--ox-graphite` plus one skewed motif (`--ox-skew`), never a per-card
   slash. The three `ChannelCard`s moved out entirely.
2. **Channels moved to the top of `/services`.** `ServicesHub` mounts a new
   channels section (heading `ox.services.channels_title`, the three
   `ChannelCard`s, the `ox.home.services_reply` line gated on
   `reply_sla_hours`) directly after the intro, ahead of the plan-doors band.
3. **Claims retirements.** `OxServices`/`PlanCard` stopped referencing
   `ox.home.plans_title`, `ox.home.plans_tier_title`, `ox.home.plan_cta`.
   New keys: `ox.home.band_eyebrow`, `ox.home.band_subline`,
   `ox.home.band_card_cta`. Verified (grep, both current-session and the
   committed values): `ox.content.services.training_where` still carries
   "داخل المدينة المنورة" and `ox.content.services.video_desc` still carries
   "مكتوبة", the two guardrails in the brief's S2c decisions, untouched by
   this batch, rule 4 (no edits) held throughout.
4. **Brand band.** `OxBrands` gained a section header (`ox.home.brands_title`,
   new key), a manifest `image` field exposed as `--ox-band-image` (painted
   at low opacity behind the strip, fallback `none`), and one accent element.
5. **CTA band.** New `OxCtaBand.tsx`, reusing the `ox-newsletter` registry
   slot (see "Deviations" for why): headline/line (new keys
   `ox.home.cta_headline`/`ox.home.cta_line`), one filled CTA to `/services`,
   an image slot, `OxNewsletter` folded in, the whole band behind
   `show_newsletter`.
6. **Native newsletter subscribe, researched as asked.** `grep -rliE
   "newsletter|subscribe" node_modules/@salla.sa/twilight-theme-engine` (all
   `.js` under `dist/`) returns nothing. No SDK transport exists; the form
   stays gated with no `subscribe` prop wired, exactly as it shipped before
   this batch. Recorded as the open question, not decided.
7. **X-IDENTITY-2026-09-22.md §§2-4 applied**, `_x-motif.scss` confirmed
   absent (`ls`, no such file):
   - §4.5 (faded photographic cards): `.ox-plan__scrim` rewritten to the
     doc's own literal gradient (`236deg` RTL / `124deg` LTR, a
     `linear-gradient()` angle is outside `--ox-angle`/`--ox-skew`'s reach,
     so the doc's own literal values are correct here, not a hand-picked
     degree), the four stops (0.94/0.78/0.60/0.46) and the photo opacity
     (0.55, in the shared `[data-ready]` rule section 5 already declares).
     Because the darkest stop sits at the top-inline-start corner (both
     directions, worked through in `PlanCard`'s docblock), `.ox-plan__body`
     moved from a bottom-aligned stack to `justify-content: flex-start` -
     content now lives in the one zone the doc's measured floor (alpha
     ≥ 0.60 for `--ox-ink-on-dark` over a worst-case white pixel) actually
     clears.
   - §4.6 (dark plan card = watermark, no corner cut): added
     `<Icon name="mark">` at accent/0.12 opacity in the card's opposite
     (bottom-inline-end) corner; confirmed no corner-cut mixin is used
     anywhere on `.ox-plan`.
   - §3.2 (158px law): found and fixed a real violation this batch had
     already introduced, `.ox-brands__accent` was a 20px-tall `skewX`
     rectangle, and 3.2 reserves an angle below 158px block-size for sprite
     symbols only. Removed the `transform`; the bar is accent-coloured, not
     angled, now. See "Requests to other batches", the section's angled
     primitive is a pending item, not invented under time pressure.
   - `.ox-services__motif`/`--hair` and `.ox-cta-band__motif` are unchanged
     (`skewX(var(--ox-skew))` on elements spanning the full band height, well
     over 158px) and will pick up 34° automatically once `tokens.css`'s
     `--ox-angle` is updated by whichever batch owns that file, confirmed
     via `git diff` that this batch never touched `tokens.css`.
   - `--x-motif.scss`'s `ox-lean-corner`/`ox-notch`/`ox-step-edge` mixins:
     **pending**, file does not exist. Nothing in this batch's scope needed
     them once §4.6 ruled dark plan cards take no corner cut.
8. **CLS closed at 320.** `.ox-services__subline` had no line-clamp; at a
   288px container its 56ch max-width doesn't bind and the sentence can wrap
   to 3 lines, undercutting the 390-derived reservation. Clamped to 2 (rule
   2's floor), closing the gap analytically (see "Measured numbers").

## Files changed

- `app/components/home/OxServices.tsx`, rewrite: single tier, eyebrow +
  subline, motif, one CTA, retired-key removal.
- `app/components/home/PlanCard.tsx`, rewrite: faded photo + §4.5 scrim,
  watermark, top-start content, hover ring not lift, `--ox-icon-mono` glyph.
- `app/components/home/OxBrands.tsx`, section header, `image` field,
  accent bar (un-angled per §3.2).
- `app/components/home/OxCtaBand.tsx`, new.
- `app/components/home/OxNewsletterBlock.tsx`, now renders `OxCtaBand`.
- `app/components/home/defaults.ts`, `ox-services` moved directly after
  `ox-categories` (ahead of `ox-brands`); `ox-services` height re-measured
  (588/655, was 796/342); `ox-brands`/`ox-newsletter` gained `image`
  (+`headline`/`line` on newsletter) in `HOME_BLOCK_FIELDS`; heights/gating
  otherwise unchanged.
- `app/components/home/index.ts`, export `OxCtaBand`.
- `app/components/pages/ServicesHub.tsx`, new channels section at the top;
  `OxServices` mount unchanged except the channels no longer live inside it.
- `app/components/pages/ServiceSection.tsx`, faded photo header (light-ground
  variant, see "Deviations").
- `app/content/services.ts`, `HOME_PLANS` gained `photo` (each plan's own
  destination frame) and the training icon changed `form` → `goal-performance`
  (the sprite's dumbbell; `form` drew a wedge, the wrong glyph for a session).
- `app/styles/06-ox/_primitives.scss`, `.ox-icon__accent` gained the
  `--ox-icon-mono` indirection (fallback preserves the other ~50 callers);
  `.ox-icon--mono` added.
- `app/styles/06-ox/_b2-home.scss`, section 7 (OxBrands: image band, header,
  accent), section 8 rewritten (OxServices/PlanCard, single tier, §4.5
  scrim, watermark), dead section 18 (two-tier CSS) deleted, new section 19
  (OxCtaBand); the shared `.ox-plan__photo[data-ready]` opacity (section 5,
  S2b's `OxGoals`/`GoalCard` section, shared selector) updated 0.48 → 0.55
  per §4.5, the one line in that section this batch owns.
- `app/styles/06-ox/_b5-pages.scss`, `.ox-service__head` faded-photo
  treatment (light-ground, `.ox-service__photo`/`__scrim`), new channels
  section reuses the existing `.ox-hub__channel`/`.ox-channels` primitives
  unchanged.
- `twilight.json`, `home.ox-services` moved ahead of `home.ox-brands`;
  `home.ox-brands` gained an `image` field; `home.ox-newsletter` gained
  `image`/`headline`/`line`.
- `locales/partials/s2.ar.json` / `s2.en.json`, `locales/ar.json` /
  `en.json`, six new keys (below), Arabic-first, no existing value touched.
- `tests/home/OxServices.test.tsx`, rewritten for the single-tier band (no
  more channel/slash/reply assertions inside `OxServices`; new assertions
  for the watermark, the one CTA, the retired keys never rendering).
- `tests/pages/ServicesHub.test.tsx`, two new tests for
  `ox.home.services_reply` under the channels section.
- `tests/home/OxCtaBand.test.tsx`, new, 7 tests (gate, headline/line
  fallback and override, CTA href, `--ox-band-image`, the folded-in form,
  claims sweep).

## Measured numbers (390 / 320 / 1440)

Computed from the token arithmetic (spacing scale, line-heights, the
`clamp()` this file's own `clampHeight()` emits) and cross-checked against
the live SSR HTML's `min-height` style, **not measured in a rendered browser
viewport**, this environment has no devtools/screenshot access, only `curl`.
Flagged honestly rather than presented as a live measurement.

**`ox-services` (the advisory band):**
- 390 (container 358): 48 pad-top + head stack 141 (eyebrow row 20 + gap 8 +
  h2 30 + gap 8 + 2-line subline 51, margin-end 24) + plans row 246 (232 card
  floor + 6/8 scroller focus padding) + 24 gap + 44 CTA + 16 gap + 20 note +
  48 pad-bottom = **588**.
- 320 (container 288): same skeleton; the plans row height is unchanged (the
  232px card floor is a `min-block-size`, independent of container width -
  only the cards' own width shrinks, 213px vs 265px). The subline's 56ch cap
  does not bind at 288px, so before this batch's fix it could wrap to 3
  lines (588 + ~25 = ~613), a real under-reservation; clamped to 2 lines
  (see "Steps done" 8) it now holds at **588**, matching the reserved floor.
- 1440 (container 1296): 64 + head stack 135 (eyebrow 20 + gap 8 + h2 40 +
  gap 8 + 1-line subline 27, margin-end 32) + 280 card row (3-up,
  `min-block-size: 260px` + row gap) + 32 gap + 44 CTA + 16 gap + 20 note +
  64 = **655**.
- Verified end to end: the SSR HTML's `.s-block--ox-services` carries
  `style="min-height:clamp(588px, calc(563.114px + 6.381vw), 655px)"` -
  the exact `HOME_BLOCK_HEIGHTS['ox-services']` value, resolved by
  `clampHeight()` and read back off the live page.

**`ox-brands` / `ox-newsletter` (CTA band):** unchanged from the pre-batch
0/0 (both stay fully gated: `ox-brands` on `MIN_BRANDS`, `ox-newsletter` on
`show_newsletter`); the store has 0 brands and the setting is off today, so
neither shift is observable yet. Not re-measured with content, since doing
so risked landing a number `HomeSkeleton.tsx` (S2b's file, see "Deviations")
has no matching skeleton shape for.

## Retired keys

- `ox.home.plans_title`, was the advisory band's section title; superseded
  by the live `ox.services.title`.
- `ox.home.plans_tier_title`, was the second tier's heading; no tier left to
  head once the channels moved out.
- `ox.home.plan_cta`, was the per-card CTA label; superseded by the new
  `ox.home.band_card_cta` (and the band's one CTA, which reads
  `ox.common.view_all`).

None of the three are referenced anywhere in `app/` after this batch (grepped
to confirm); their values in `locales/ar.json`/`en.json` are untouched
(rule 4) and are the conductor's to delete once every other reader is
confirmed clear.

## New keys (added, never edited an existing value)

| Key | ar | en |
|---|---|---|
| `ox.home.band_eyebrow` |  الاستشارة  | Before you buy |
| `ox.home.band_subline` | نشرح المنتج وطريقة استخدامه والجرعة المطبوعة على الملصق. لا نكتب أنظمة غذائية ولا نفسر تحاليل. | We explain the product, how to use it, and the dose printed on the label. We do not write diet plans and we do not interpret lab results. |
| `ox.home.band_card_cta` | اعرف التفاصيل | See the details |
| `ox.home.brands_title` | تسوق حسب العلامة | Shop by brand |
| `ox.home.cta_headline` | لديك سؤال قبل الشراء؟ | Have a question before you buy? |
| `ox.home.cta_line` | فريق المتجر يرد على سؤال مكتوب لمساعدتك على الاختيار. | The store team answers a written question to help you choose. |

Each checked by hand against `FINAL-claims-source.md` §§3-4 and
`docs/brand/voice-ksa.md` §§3.3/3.5 before writing (no outcome promise, no
individualised-prescription language, no banned construction, no dialect
token, no diacritic, no em-dash), then confirmed by the gates below.

## Requests to other batches

- **Whoever owns `_x-motif.scss`/`check-identity.mjs`** (not yet built):
  `OxBrands` currently has ONE accent element (the un-skewed bar) and NO
  angled primitive, X-IDENTITY §3.2's 158px law forbids a CSS angle on an
  element that small, and the brand strip has no other element ≥158px tall to
  carry one. Per §3.2 the compliant device is a sprite symbol with an
  internal 34° diagonal; this batch did not invent one under time pressure.
  Needs either a small angled sprite glyph in the header or an owner call
  that a slim strip is exempt.
- **S2b** (`HomeSkeleton.tsx`, `KitchenSink.tsx`, both restricted to this
  batch): `ServicesSkeleton()`'s placeholder shape
  (`.ox-skel-grid--channels`, three dark blocks under a bar) is now a rough
  approximation of the single-tier band rather than the two-tier one it was
  written for, the reserved *height* is exact (verified against the live
  `clamp()`), only the internal skeleton shape is stale. Not fixed here
  (restricted file). `KitchenSink.tsx` already wires `OxBrands`/`OxServices`/
  `OxNewsletterBlock` generically through `HOME_BLOCK_FIELDS`, so it picked
  up this batch's new fields with no edit needed; it shows one state per
  block (matching the file's pre-existing pattern, e.g. `OxBanner`'s two
  panels), not the full no-data/live-data/merchant-selection/missing-image
  matrix the brief asks for, verified instead through this batch's own
  vitest suite (`tests/home/OxServices.test.tsx`,
  `tests/pages/ServicesHub.test.tsx`), which does cover: no image (default
  band), merchant image, merchant title override, `routeOut` on/off, missing
  photo per card (`BandPhoto`'s null-on-404 path), and the
  `reply_sla_hours` gate.
- **Conductor**: the three retired keys (above) are ready to delete once
  every reader is confirmed clear; `ox.home.services_title`/
  `ox.home.services_intro` were found already orphaned (zero references in
  `app/`) independent of this batch, pre-existing, flagged not fixed.
  Native-newsletter-subscribe question stays open (see "Steps done" 6):
  no SDK transport exists today.

## Deviations

- **`OxCtaBand` reuses the `ox-newsletter` registry slot rather than adding a
  new `HomeBlockPath`.** A new always-on block needs its own
  `BLOCK_SKELETONS` entry and a non-zero `HOME_BLOCK_HEIGHTS` row to stay
  CLS-safe, and both files/tables are split across ownership
  (`HomeSkeleton.tsx` restricted to S2b; `defaults.ts`'s height table is
  this batch's for band/brand/CTA entries, but the skeleton shape is not).
  Reusing the slot means the whole band, headline, line, CTA and the form -
  shares one `show_newsletter` gate and one 0/0 reservation, all already
  correct and already tested (`tests/home/optionalBlocks.test.ts` unchanged,
  still green). Documented at length in `OxCtaBand.tsx`'s own docblock.
- **The five `ServiceSection` panels on `/services` get a LIGHT-ground faded
  photo, not X-IDENTITY §4.5's literal dark-ground formula.** §4.5's own
  title is "(advisory band, /services)", and re-reading the brief's owner
  amendment ("the service cards on /services ('اسأل قبل أن تشتري')") against
  it, the more precise reading is that both phrases describe the SAME
  `OxServices` doors mounted twice (home and `/services`), not the five
  long-form sections further down the page. Since `OxServices`/`PlanCard`
  already carry the exact §4.5 treatment on both mounts, this batch treats
  the `ServiceSection` change as additional, safe polish (a light-ground
  opaque-plate-to-partial-see-through scrim, its own contrast floor by
  construction) rather than a second required §4.5 implementation, and says
  so in the component's own comment.
- **`.ox-plan__photo`'s opacity lives in a section this batch does not own**
  (`_b2-home.scss` section 5, `OxGoals`/`GoalCard`, S2b's), because the
  `[data-ready]` reveal rule was written jointly for `.ox-goal__photo` and
  `.ox-plan__photo` before the two-tier split. Changed exactly one value
  (0.48 → 0.55, §4.5's number) rather than duplicating the whole reveal
  mechanism into a section this batch does own; flagged rather than silently
  touching a shared rule.
- **34° scrim angle is a literal `236deg`/`124deg`, not
  `calc(var(--ox-skew))`.** Every other instruction in this batch's brief
  says "tokens only, never a literal degree", X-IDENTITY §4.5 is the one
  documented exception, because a `linear-gradient()` direction is not
  reachable through `--ox-angle`/`--ox-skew` (those feed `skewX()`/
  `clip-path`, not gradient angles), and the doc itself declares the two
  values as literals ("two rules, never a `rotate`").

## Verification tails

`pnpm typecheck`:
```
$ tsc --noEmit
```
(clean, no output)

`pnpm vitest run tests/home tests/pages tests/blocks tests/content/imagePaths.test.ts`
(after adding `tests/home/OxCtaBand.test.tsx`):
```
 Test Files  28 passed (28)
      Tests  284 passed (284)
```

`pnpm vitest run tests/home/defaults.test.ts` (twilight.json parity):
```
 ✓ tests/home/defaults.test.ts (11 tests)
```
(included in the 284 above)

`pnpm check:all`:
```
$ pnpm check:copy && pnpm check:jsonld && pnpm check:rtl && pnpm check:motion && pnpm check:strings && pnpm check:claims && pnpm check:tokens
check-copy: 26 file(s), 0 problem(s)
check-jsonld: 11 file(s), 0 problem(s)
check-rtl: 314 file(s), 0 problem(s)
check-motion: 314 file(s), 0 problem(s)
check-strings: 307 file(s), 0 problem(s)
check-claims: 26 file(s), 0 problem(s), 4 allowlisted   (all four pre-existing, official_distributors/trust_distributors, unrelated to this batch)
check-tokens: 117 token(s) defined, 310 file(s) scanned, 0 problem(s)
```

`curl -s "http://localhost:3210/ar?storeId=1888890798" | grep -a -c "ox-services"` → `1` (matching line found;
the block is DIRECTION's own lazy-loaded shell, only `ox-hero`/`ox-goals`/
`ox-products`, the three "priority" blocks, render full markup in the raw
SSR HTML, confirmed against `DefaultHome.tsx`'s own docblock: "the same lazy
wrapper... on the first three blocks." `ox-services` renders its real
skeleton with the exact reserved height instead, see "Measured numbers" -
and hydrates to the real cards client-side, which this batch's vitest suite
verifies directly since a raw curl cannot).

`curl` of `/ar/services` (a real route, not a lazy home block, so it renders
in full over SSR):
```
data-testid="ox-channel-card": 3
data-testid="ox-plan-card": 3
ox-plan__watermark: 3
ox-service__photo: 5
ox-services__cta: 0   (routeOut=false correctly suppresses the CTA here)
raw ">ox.<" keys anywhere on the page: 0
```

Zero raw `ox.` keys on either page.

### Pre-existing, unrelated failures (not this batch's, not fixed here)

`pnpm vitest run` (whole suite) currently reports 51 failures, all in
`tests/layout/Header.test.tsx`, `tests/layout/chrome.test.tsx`,
`tests/listing/ListingPage.test.tsx` and `tests/i18n-keys.test.ts`, none of
them files this batch touched. Root cause traced to
`app/components/listing/useTaxonomyLinks.ts:73`
(`TypeError: Cannot read properties of undefined (reading 'matches')` in
`useTaxonomyLoaderData`), a file mid-edit by the concurrently running S2b
batch (confirmed via `git status`: `useTaxonomyLinks.ts`, `SectionHeader.tsx`,
`app/routes/index.tsx`, `app/routes/$slug.c$id.tsx`,
`app/components/home/{NeedCard,OxNeeds}.tsx` all show as modified/untracked
in this same working tree, none of them written by this batch). Re-run of
this batch's own scope in isolation (above) is 284/284 green.

## Kitchen-sink states

`KitchenSink.tsx` is S2b's file (restricted). It already renders `OxBrands`,
`OxServices` and `OxNewsletterBlock` generically through
`block(path) = { path, key, ...HOME_BLOCK_FIELDS[path] }`, so this batch's
new fields (`image` on brands/newsletter, `headline`/`line` on newsletter)
flow through with no edit needed, at their default (empty) state. The
no-data / live-data / merchant-selection / missing-image matrix the brief
asks for is instead exercised by this batch's own tests:
- `OxBrands`: hidden under 4 (`tests/home/blocks.test.tsx`), 4+ live brands,
  a brand with no logo (name-on-plate fallback), all pre-existing coverage,
  untouched by this batch and still green.
- `OxServices`/`PlanCard`: no merchant image (default dark ground), merchant
  image set, merchant title override, `routeOut` true/false, a plan with no
  photo file (`BandPhoto`'s null-on-error path, covered by
  `tests/content/imagePaths.test.ts` for path resolution and by this batch's
  rewritten `OxServices.test.tsx` for the render itself).
- `OxCtaBand`: `tests/home/OxCtaBand.test.tsx` (new, 7 tests, all green) -
  hidden while `show_newsletter` is off, locale-fallback headline/line,
  merchant headline/line override, the one CTA's href, `--ox-band-image` set
  only when a merchant image exists, the newsletter form folding in under
  the same gate, and the claims sweep (no professional title, no outcome
  promise). The embedded form's own states (idle/submitting/success/error)
  are `tests/blocks/OxNewsletter.test.tsx`'s existing, untouched coverage.
