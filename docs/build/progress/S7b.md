# S7b: the services masthead, contained, plate cut angled (2026-09-24)

Batch: owner item 2026-09-24 (screenshot of `/ar/services` at 1890px), the
hub masthead ("اسأل قبل أن تشتري") ran full bleed with the h1 and the CTA
touching the viewport's right edge; the owner asked for the page gutter back
and for the plate's borders to go angled like the primary CTA.

## 1. The full-bleed bug and its fix

`ServicesHub.tsx` rendered the `Band` with `className="ox-page__bleed
ox-page--services__band"` inside `<div className="ox-page ox-page--bleed
ox-page--services">`. `_b5-pages.scss`'s `.ox-page--bleed > .ox-page__bleed`
rule (`max-inline-size: none; padding-inline: 0`) is exactly what makes a
marked child span the full viewport with zero gutter, the band was marked,
so it bled.

**Fix:** drop `ox-page__bleed` from the `Band`'s own `className`. Nothing
else changes: `.ox-page--bleed`'s *default* rule for an unmarked child
(`max-inline-size: var(--ox-container); padding-inline: var(--ox-gutter);
margin-inline: auto`) already gives every other child of this page, the
intro, the scope panel, the FAQ, its contained box, and now the band gets
the same box. The page wrapper keeps `.ox-page--bleed`: `.ox-hub__advisory`
(the advisory section, S2g/owner-review-2026-09-23 precedent) still declines
the inset via its own dedicated selector (`.ox-page--bleed > .ox-hub__advisory
{ padding-inline: 0; ... }`), independent of the band's class, so it is
unaffected by this change.

Two stale doc comments said the band was "FULL-BLEED" / "full-bleed hero
band" and that two children of `.ox-page--bleed` declined the inset "on
`/services`", both corrected in place (`ServicesHub.tsx`,
`_b5-pages.scss` §1) since they became factually wrong the moment the class
was dropped.

## 2. The plate cut

The masthead's plate (photo + scrim) now cuts like the primary CTA:
`ox-angled()` (X-IDENTITY-2026-09-22.md §2/§3.4), the identity's one
parallelogram primitive, lean equal to the plate's own rendered block-size so
both vertical edges run the full 34° (mirrored under `[dir='ltr']` by the
mixin itself, no hand-rolled mirror needed).

**Where the cut lives.** `Band.tsx` now wraps only the photo and its scrim in
a new `.ox-bband__plate` div, positioned at exactly the box those two
elements already occupied (`inset-block-start:0; inset-inline:0; block-size:
160px` below 1024, `inset-block:0; block-size:100%` at 1024 and up, the same
values `.ox-bband__photo`/`.ox-bband__scrim` already carried in
`_b3-product.scss`, which is why nothing in that file needed to change: the
extra nesting level does not move either element by a pixel). The wash and
the wedge straps stay direct children of `.ox-bband`, unclipped, exactly as
before.

**Why the wash and the wedge stay out.** The plate is the ONE angled
primitive this block carries (§3.3 "one angled gesture per component",
enforced by `scripts/check-identity.mjs`'s `one-angled-per-block` rule, which
scopes to a single selector's own declarations, confirmed by reading the
script, not assumed). Folding the wedge's `skewX` bars into the same clipped
wrapper would not violate that check mechanically (it never aggregates across
sibling selectors), but it would visually clip a small, already-shipped
decoration that sits close to the plate's own cut edge at the mobile tier,
for no requested gain, left alone.

**Why two tiers, not one.** A single lean equal to the *whole* band's height
is what X-IDENTITY §2.3 calls impossible on a hero-scale band: at the mobile
band height (420px) the run would be 283.3px, and two of those (566.6px)
exceed the entire 358px content box at 390px wide, the shape would invert.
The masthead's actual rendered "plate" is smaller than the whole band below
1024 (a 160px photo strip, with the h1/subline/CTA flowing *below* it, not
over it), and equal to the whole band from 1024 up (photo covers 100% of the
block-size there). Leaning each tier's cut off that tier's own real box is
what makes the parallelogram geometrically possible at every width the task
named.

## 3. Tier table (computed, not guessed)

`run = lean × 0.6745085`, rounded to 0.1px by `ox-run()`, verified against
`docs/build/X-IDENTITY-2026-09-22.md` §2.2's ladder method.

| Tier | Checked at | Plate lean (block-size) | run | Safe inset (`run + --ox-6`) | Where the inset lands |
|---|---|---|---|---|---|
| A, below 1024 | 390, 768 | 160px (the photo strip; `.ox-bband__photo`'s own mobile height) | **107.9px** | not additive here, `.ox-bband__inner`/`.ox-bband__lockup` start at `padding-block-start: 184px`, entirely below the 160px strip, so text and the cut never share a row. The page gutter alone governs the box (16px below 640, 24px 640–1023) | `.ox-bband__plate`'s own clip only |
| B, 1024 and up | 1024, 1440, 1920 | 360px (`.ox-page--services__band`/`--about__band`/`--faq__band`'s own `min-block-size`, overriding `_b3-product.scss`'s 252/200) | **242.8px** | **266.8px** | `padding-inline` on the three page-band selectors, replacing `_b3-product.scss`'s shared `40px` (equal specificity, later in the stylesheet, `_b5-pages.scss` imports after `_b3-product.scss` per `_index.scss`) |

Content-row width this leaves for the h1/subline/CTA plus the logo, at each
checked desktop width (container = `min(1296px, 100% − 2×32px gutter)`,
minus `2 × 266.8px` safe inset):

| Viewport | Container | Content row after the safe inset |
|---|---|---|
| 1024 | 960px | 426.4px |
| 1440 | 1296px (capped) | 762.4px |
| 1920 | 1296px (capped) | 762.4px |

1024 is tight (a two-line h1, the subline and a compact CTA in ~426px,
opposite a ~156px-wide lockup) but not broken; 1440/1920 have generous room.
This is the direct cost of the owner's own instruction, a lean equal to the
plate's full height, at 34°, rather than a smaller "corner" lean; flagged
here rather than silently softened.

`.ox-bband`'s own `background` (from `_b3-product.scss`) is left alone below
1024 (mobile text sits on it, not on the photo, removing it would drop the
dark backdrop under the h1). It is overridden to `transparent` only inside
the existing 1024-and-up media query, scoped to the three page-band
selectors: past that width the plate covers the whole box and the opaque
scrim gradient already does the work `.ox-bband`'s own fill used to do, so
the corners the parallelogram cuts away now show the page ground, which is
what makes the cut visible as a cut rather than as a same-colour photo island
on a same-colour rectangle.

## 4. The straps

Opened `public/assets/images/services-band.jpg` directly. The orange
diagonal line the owner's screenshot shows is baked into the photograph
itself (a chevron rendered into the image content), **the photograph's own
graphic, not a CSS primitive.** No folding needed under the task's own
conditional instruction.

The codebase does carry a separate, smaller CSS primitive at the same name
the task warned about, `.ox-bband__wedge` (`_b3-product.scss`, two
`skewX(var(--ox-skew))` bars, `--wide`/`--thin`), pre-existing, out of my
edit scope (`_b3-product.scss` is not in this batch's file list) and visually
distinct from what the owner pointed at (a thin 8–26px bar near the inline
end, versus the bold chevron the photograph itself carries). Left completely
untouched: its own selector, its own declarations, still exactly one `skewX`
call. `check-identity.mjs`'s `one-angled-per-block` rule is scoped to a
single selector's own body (verified by reading `scripts/check-identity.mjs`
lines 20–28, 99–117), so a pre-existing wedge selector sitting beside a new
`.ox-bband__plate` selector is not what that rule polices, confirmed live,
0 findings.

## 5. Every masthead that shares the component

Grepped every `<Band` call site in `app/components`:

- **`/services`** (`ServicesHub.tsx`), the bug's own page. Fixed per §1/§2.
- **`/about`** (`AboutPage.tsx`, `.ox-page--about__band`), was already
  contained (plain `.ox-page ox-page--about`, no `ox-page__bleed` anywhere on
  this page); only §2's plate cut and safe area are new here, inherited for
  free since it shares `.ox-bband`/`Band.tsx` and is already in this batch's
  `_b5-pages.scss` selector group.
- **`/faq`** (`FaqPage.tsx`, `.ox-page--faq__band`), same as About: already
  contained, gets the plate cut and safe area for free.
- **`KitchenSink.tsx`** (dev-only component sink, no route), renders two
  `Band` demos. They get `.ox-bband__plate`'s clip too, but at 1024-and-up
  they carry none of the three page-band classes, so they fall back to
  `_b3-product.scss`'s own `.ox-bband`/`.ox-bband--short` heights (252px /
  200px) while my clip is hardcoded to the page tier's 360px, a small
  lean/box mismatch, cosmetic-only, on a page that ships to no one. Not fixed:
  `KitchenSink.tsx` and `_b3-product.scss` are both outside this batch's file
  list.

**Confirmed NOT the same component, out of scope:**
- **`/branch`** and **`/contact`** carry no dark band at all, by their own
  documented decision (`BranchPage.tsx`: "The page carries no dark band";
  `ContactPage.tsx`: "It carries no dark band on purpose"), nothing to
  contain or cut.
- **`/brands`** (`BrandsIndex.tsx`) uses "the listing masthead band", its own
  docstring's words, which is a different masthead entirely, styled in
  `_b4-listing.scss` (a file another builder has open concurrently per
  today's git status) and never imports `Band`/`common/Band.tsx`. Confirmed
  by grep: no `Band` import anywhere in `app/components/brands/`.

## 6. Verification

```
$ pnpm typecheck
app/components/home/OxServices.tsx(122,13): error TS2339: Property 'inbodyKey' does not exist on type 'ServiceChannel'.
app/components/home/OxServices.tsx(122,73): error TS2339: Property 'inbodyKey' does not exist on type 'ServiceChannel'.
```
Pre-existing/concurrent, not this batch: `app/content/services.ts` and
`OxServices.tsx` are both mid-edit by other work live on the tree right now
(git status shows both modified, neither touched by this batch). Neither file
is in this batch's file list. No error anywhere in `Band.tsx`, `ServicesHub.tsx`
or `_b5-pages.scss`.

```
$ pnpm vitest run tests/pages tests/common
 Test Files  1 failed | 12 passed (13)
      Tests  1 failed | 155 passed (156)
```
The one failure (`ServicesHub.test.tsx`, `ox-services-inbody` test id not
found) traces to the same concurrent "inbody" work above, not to this batch:
every other `ServicesHub` assertion passes, including the one-h1 count and
every medical/claims-gate test this batch could have disturbed.

```
$ pnpm check:rtl
check-rtl: 327 file(s), 0 problem(s)
$ pnpm check:motion
check-motion: 327 file(s), 0 problem(s)
$ pnpm check:strings
check-strings: 326 file(s), 0 problem(s)
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
check-identity: 327 file(s), 0 problem(s)
```

**Not done: the chrome-devtools live check at 390/1440 (screenshots +
measured offsets).** No chrome-devtools tool was exposed in this session's
tool set, and the fallback attempt to reach the preview over HTTP from the
Bash tool failed both ways, `curl http://127.0.0.1:3210/...` returned
"Connection refused", and `curl http://[::1]:3210/...` (where `netstat -ano`
does show the preview listening, heavily loaded with many concurrent
connections, consistent with several builder agents on the tree right now)
timed out / receive-errored after the instructed 20-second retry. The
geometry in §3 is computed directly from the same `ox-run()` formula and
literal tier heights the CSS now uses (not estimated), and every static gate
above is clean, but the owner-requested visual confirmation (nothing clipped,
measured clearances) still needs a session with the chrome-devtools tool
available, or a manual look at `/ar/services` at 390 and 1440.

## Files changed

- `app/components/common/Band.tsx`, new `.ox-bband__plate` wrapper (photo +
  scrim only) and its doc comment.
- `app/components/pages/ServicesHub.tsx`, dropped `ox-page__bleed` from the
  `Band`'s `className`; corrected two comments that described the band as
  full bleed.
- `app/styles/06-ox/_b5-pages.scss`, new §2a (`.ox-bband__plate`, its 1024+
  tier, the three page-band selectors' `background:transparent` and
  `padding-inline` safe area); corrected §1's stale "two children" comment.
- `docs/build/progress/S7b.md`, this file.

## Deviations from the brief

1. Chrome-devtools verification not performed, tool unavailable this
   session; see §6.
2. `.ox-bband__wedge` left untouched rather than folded into the plate's clip
   - the "straps" the task's fold-condition was about turned out to be the
   photograph's own graphic, not this CSS primitive; see §4.
3. KitchenSink's two demo bands carry a minor lean/box mismatch at 1024 and
   up, left unfixed as out of this batch's file list; see §5.
