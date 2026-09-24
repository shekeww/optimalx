# S9h, the branch cover becomes the storefront photo, and brands moves to the hero

Builder S9h, 2026-09-24. Two owner items from screenshots of 2026-09-24
(conductor brief, batch S9h).

## Item 1: the branch cover takes the storefront photograph

The block cover (`OxBranch`, shared by the home page and `/branch`) carried
`STORE_PHOTOS['store-wide']` (the shelf wall). The owner wants the lit
facade at night (`STORE_PHOTOS.storefront`) instead, with a premium
cinematic integration, and the mobile contrast fixed: at 390 the title, the
InBody line, the address and the WhatsApp link sat over a busy shelf photo
with too light a gradient behind the text.

Read: `docs/build/progress/S9c.md` (the cover primitive, the per-slug
modifiers, the placement/focus deviations), `app/components/blocks/
OxBranch.tsx`, `app/components/home/OxBranchBlock.tsx`, `app/components/
pages/BranchPage.tsx`, `app/content/store-photos.ts`,
`app/components/pages/BranchGallery.tsx`, `app/styles/06-ox/_covers.scss`.

`STORE_PHOTOS.storefront` is 1448x1086, the lit "optimal x / NUTRITION AND
WELLNESS" sign roughly 30%-40% down the frame, centred horizontally; the
red/green accent lighting runs along the top awning; the glass entrance and
shelves sit below the sign; the bottom third is pavement/parking. Viewed the
file directly (`public/assets/store/storefront.webp`) to confirm this before
tuning `object-position`.

### Build log

**Object choice and `object-position`.** `OxBranch.tsx`'s `BRANCH_PHOTO`
constant switches from `STORE_PHOTOS['store-wide']` to
`STORE_PHOTOS.storefront`; `OxBranchBlock.tsx` and `BranchPage.tsx` now pass
`STORE_PHOTOS.storefront.photo`. `--ox-cover-position: top` (a new
`.ox-cover--storefront-block` modifier in `_covers.scss`, replacing the now
unused `.ox-cover--store-wide`): since the cover's `min-block-size` floor is
always exactly 16:10 of its own container width and the photo is a fixed
1448x1086 (4:3), a top-aligned crop shows a CONSTANT top fraction of the
image regardless of tier, `0.625 * 1448 / 1086 = 83.3%`, well past the
sign (measured by eye at roughly 30%-40% down the frame) with margin before
the crop line, and a taller box (content-driven, S9c deviation 3) only
reveals more of the image above that floor, never less. Verified live
(§ below): the sign is fully in frame with room to spare at 390 (where the
box is much taller than the floor, so the WHOLE image height shows,
uncropped) and at 1440 (where the box sits exactly on the floor).

**Gradient tuning, `.ox-cover--storefront-block`.** Built a purpose-made
measurement tool rather than eyeballing screenshots or hand-deriving the
composited colour: a raw CDP script (`chrome-headless-shell`, Node's global
`WebSocket`/`fetch`) that navigates to the real running page, reads the
cover's and the text elements' `getBoundingClientRect()`s, draws the
ACTUAL loaded `<img>` to an in-page `<canvas>` to sample real photo pixels
at the exact point behind each text element (replicating the browser's own
`object-fit: cover` + `object-position` math to find the source pixel), reads
`.ox-cover__scrim`'s live resolved `background-image` (so `color-mix()` is
whatever the engine actually computed, not a hand copy), parses its two
gradient layers' stops, composites photo-under-scrim with a proper
Porter-Duff "over" (alpha tracked through the stack, correct paint order -
the FIRST-listed gradient, the bottom/`b0`-`b1` one, paints topmost, over
the second-listed reading-start/`s0`-`s1` one, over the photo), and computes
the WCAG contrast ratio against the text's own `getComputedStyle().color`.
Two bugs found and fixed while building it: (1) Chrome 149 serialises a
resolved `color-mix()` stop as the CSS Color 4 `color(srgb r g b / a)`
function, not `rgba()`, the parser matched nothing and silently treated
every stop as transparent black, so the first two tuning passes measured
nothing real; (2) the first alpha-compositing pass always forced the
result's own alpha to 1 after one layer, which produced a always-fully-opaque
scrim once the colour parser was fixed instead. Both fixed and cross-checked
against a second signal (the DOM screenshots themselves, read back visually,
§ below) before trusting the numbers.

Method stated per the brief's own two options: this is the "sample the
rendered pixel" method, done via canvas pixel reads of the real loaded
photograph rather than a screenshot-PNG crop (no PNG decoder was available
in this environment; the canvas route reads the identical pixels a
screenshot would, from the same live render).

First pass (`b0: 90%, b1: 62%, s0: 88%, s1: 18%`) measured the REAL defect:
the address line at 390 sat between 1.47:1 and 1.73:1 across its own row -
worse than the owner's screenshot even suggested, because this cover's
content is longer than any other (title, rating, offer/eyebrow, address,
hours, three-to-five actions, pickup note) and sits well past the base
gradient's 45% stop, which every OTHER cover (one short statement + one
line) never reaches. Raised `b1`/`s1` substantially so the mid-to-lower
two-thirds of the frame, where this block's own text actually lives -
stays consistently dark, rather than fading early the way a one-line cover
can afford to. Final values:

```
.ox-cover--storefront-block {
  --ox-cover-position: top;
  --ox-cover-b0: 92%;
  --ox-cover-b1: 85%;
  --ox-cover-s0: 90%;
  --ox-cover-s1: 35%;
  --ox-cover-glow: 0.14;
}
```

**Contrast, measured live** (worst of three horizontal samples per element -
reading-start edge, centre, reading-end edge, against the target 4.5:1):

| Surface | Width | Title | Address |
|---|---|---|---|
| `/ar/branch` | 390 | 8.90–16.57 | 5.88–8.45 |
| `/ar/branch` | 1440 | 14.55–16.25 | 8.30–8.87 |
| `/ar` (home block, taller: eyebrow+offer+page-link) | 390 | 12.14–13.81 | 7.15–8.83 |
| `/ar` (home block) | 1440 | 14.16–16.36 | 7.99–8.87 |

Every sampled point clears 4.5:1 with margin (worst case 5.88:1). A
vertical brightness profile at the cover's own horizontal centre (390,
`/ar/branch`) confirms the gradient is genuinely a gradient, not a flat
scrim: at 2% from the top (over the sky above the awning) the composited
colour is `[16,22,30]`, essentially unchanged from the raw photo `[15,22,31]`
- transparent, as the direction asks; by 20% down it is already fully
dark (`[17,19,21]`), and stays dark through the text zone. The screenshots
(§ below) show the lit sign and its red/green accent lighting clearly at
1440, and a legible ghost of it behind the rating row at 390.

**The gallery's duplicate photograph.** `OxBranch`'s cover now shows the
storefront photograph, and `BranchGallery`'s own fourth tile already showed
the same photograph (`.ox-cover--storefront`, unchanged). Decision: drop the
gallery's storefront tile specifically on `/branch` (`BranchGallery`'s new
`showStorefront?: boolean` prop, default `true` for any future caller that
does not sit under a storefront cover; `BranchPage` passes `false`), leaving
three tiles (advisory-room, waiting-area, shelves) in the scroll rail below
640px and a new three-up grid (`.ox-branch-gallery__list--3`,
`_b5-pages.scss` §7) from 640px up, instead of two-up-plus-orphan. The
gallery's own `.ox-cover--storefront` modifier is untouched, it is a
different selector tuned for a 16:10 TILE, not the content-heavy block, and
stays available for whichever future surface renders all four.

**The alt text.** `ox.blocks.branch.photo_wide_alt` described "the shelves
inside the branch", no longer true once the photo is the storefront.
Updated the VALUE in place in `locales/partials/s9a-v1.{ar,en}.json` (the
partial that first defined it, editing only the base locale would be
reverted by the next `i18n-merge` run, same reasoning `S8d.md` §4 item 1
already recorded) to describe the lit facade instead. A factual correction
to an existing accessibility string, not new marketing copy; ran
`check-copy`/`check-claims` clean on the result.

**The fixture, considered and left alone.** The brief invited adding an
`ox-branch` entry to `fixtures/store/home-components.json` (ten generic,
non-`ox-*` Salla blocks) so the home block renders in the offline preview
without a live-server workaround. Investigated and NOT done: `hasOxBlock()`
(`defaults.ts`) is a single boolean gate over the WHOLE list, adding even
one `home.ox-branch` entry would flip `configured` to `true` in
`app/routes/index.tsx` and swap the ENTIRE home page from
`DEFAULT_HOME_COMPONENTS` (the theme's real sixteen blocks, which is what
every other concurrent batch and the live store actually renders) to just
these ten generic stub blocks plus the one added entry, hiding the hero,
goals, products, brands, categories and every other block from local preview
for every builder who loads `/ar` afterward. That is a bigger, riskier,
cross-cutting regression than the gap itself, on a file explicitly flagged
as shared infrastructure (`S8d.md` §4 item 5 already declined to touch it
for the same reason). Verified the real component instead: the actual
running dev server already renders `DEFAULT_HOME_COMPONENTS` (confirmed by
curl, `hasOxBlock` is `false` against the fixture's ten generic paths, so
the fallback fires), and a real headless browser DOES mount the lazy
`OxBranchBlock` once scrolled into view (screenshots and the contrast table
above are both taken this way, live, on port 3210, never restarted).

**Screenshots** (chrome-headless-shell, ports 9861/9863, fresh
`--user-data-dir` per run, killed on completion; preview server on 3210
never touched): `docs/build/progress/visit/s9h-branch-390.png`,
`s9h-branch-1440.png` (the block cover on `/branch`), `s9h-home-390.png`,
`s9h-home-1440.png` (the home block, scrolled into view), `s9h-gallery-390.png`,
`s9h-gallery-1440.png` (the three-tile gallery grid below the cover, storefront
tile absent, `BranchMap`'s own separate facade still shows the storefront
photograph a third time further down the page, a different component,
outside this batch's scope, not a duplicate this item is about).

## Item 2: shop by brand moves to directly after the hero

`HOME_BLOCK_PATHS` (`defaults.ts`) and `twilight.json`'s `components[]`
reordered in lockstep: `ox-brands` moves from directly after `ox-categories`
to directly after `ox-hero`, before `ox-goals`. Same mechanism S8d's own
item 1(d) move used (move the one JSON object, edit nothing inside it).

**Done first, verified green**: `pnpm vitest run tests/home/defaults.test.ts`
→ 12/12 passing (manifest order test, parity test, default-composition
test). `OxBrands.tsx`'s HIERARCHY docblock paragraph updated; `defaults.ts`'s
`ox-brands` height-entry comment updated (value unchanged, still 0/0, the
live store still ships zero brands).

Files: `app/components/home/defaults.ts`, `twilight.json`,
`app/components/home/OxBrands.tsx` (docblock only).

---

## Files changed (both items)

- `app/components/blocks/OxBranch.tsx`, `BRANCH_PHOTO` reads
  `STORE_PHOTOS.storefront`; the cover carries `ox-cover--storefront-block`;
  docblocks updated.
- `app/components/home/OxBranchBlock.tsx`, passes
  `STORE_PHOTOS.storefront.photo`; docblock updated.
- `app/components/pages/BranchPage.tsx`, passes
  `STORE_PHOTOS.storefront.photo` to `OxBranch`; passes
  `showStorefront={false}` to `BranchGallery`; docblock note added.
- `app/components/pages/BranchGallery.tsx`, new `showStorefront?: boolean`
  prop (default `true`), filters the storefront cover out when `false`, adds
  the `ox-branch-gallery__list--3` grid modifier class at three tiles;
  docblock updated.
- `app/content/branch.ts`, one docblock comment corrected (`store-wide` →
  `storefront`, notes the `showStorefront` drop).
- `app/components/home/defaults.ts`, `HOME_BLOCK_PATHS`: `ox-brands` moved
  to directly after `ox-hero`; two comments updated (the move, and the
  `ox-branch` height entry's photo-swap note, numbers unchanged).
- `app/components/home/OxBrands.tsx`, HIERARCHY docblock paragraph updated
  for the new position.
- `app/styles/06-ox/_covers.scss`, `.ox-cover--store-wide` replaced by
  `.ox-cover--storefront-block` (new tuning, see above); section doc comment
  updated.
- `app/styles/06-ox/_b5-pages.scss` §7, `.ox-branch-gallery__list--3`
  (three-up from 640px).
- `app/styles/06-ox/_blocks.scss`, one section-1 doc comment updated.
- `twilight.json`, `home.ox-brands` component object moved to directly
  after `home.ox-hero` (no field edited, only moved).
- `locales/partials/s9a-v1.{ar,en}.json` + merged `locales/{ar,en}.json` -
  `ox.blocks.branch.photo_wide_alt` value corrected for the new photo.
- `tests/blocks/OxBranch.test.tsx`, storefront photo/modifier assertions.
- `tests/home/OxBranchBlock.test.tsx`, storefront photo assertion; docblock.
- `tests/pages/BranchGallery.test.tsx`, two new tests (`showStorefront`
  false drops the tile and grids three-up; default keeps four, no modifier).
- `tests/pages/BranchPage.test.tsx`, storefront photo assertion; gallery
  test rewritten for three tiles, storefront absent.
- `docs/build/progress/S9h.md`, this file.
- `docs/build/progress/visit/s9h-branch-390.png`, `s9h-branch-1440.png`,
  `s9h-home-390.png`, `s9h-home-1440.png`, `s9h-gallery-390.png`,
  `s9h-gallery-1440.png`, new screenshots.

Not touched: `fixtures/store/home-components.json` (considered, declined,
reasoning above); any file named as another builder's own
(`_b2-home.scss` §8, `_b5-pages.scss` §2a, the header files).

## Verified by

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/blocks tests/pages tests/home tests/content \
    tests/i18n.test.ts tests/i18n-keys.test.ts tests/i18n-claims.test.ts
 Test Files  1 failed | 40 passed (41)
      Tests  1 failed | 504 passed (505)
```
The one failure, `tests/home/posterRow.test.ts` (CSS-rule parsing against
the compiled stylesheet, unrelated to this batch, it never touches
`OxBranch`/`BranchGallery`/`OxBrands`/`defaults.ts`), is a timeout under
this batch's own full-suite parallel load, not a real failure: run alone it
passes in ~1s, twice, both before and after every change in this batch.

```
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 331 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
check-identity: 337 file(s), 0 problem(s)
$ node scripts/check-strings.mjs
check-strings: 350 file(s), 0 problem(s)
$ node scripts/i18n-merge.mjs --check
locales\ar.json: 1461 partial key(s), 0 added, 0 updated
locales\en.json: 1461 partial key(s), 0 added, 0 updated
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 56 file(s), 0 problem(s), 4 allowlisted (pre-existing
  official_distributors rows, unrelated to this batch)
```

Compiled CSS read back clean (`npx sass --no-source-map app/styles/app.scss`,
only the pre-existing `@import` deprecations); `.ox-cover--storefront-block`
and `.ox-branch-gallery__list--3` both present in the output.

Live curl (`/ar`, fresh, dev server on 3210 never restarted): SSR block
order is `ox-hero, ox-brands, ox-goals, ox-products, ox-poster, ox-posters,
ox-products-secondary, ox-categories, ox-category-rail ×8, ox-services,
ox-branch, ox-guides, ox-certifications, ox-faq, ox-newsletter, ox-banner`
- `ox-brands` directly after `ox-hero`, exactly as specified (item 2).

Screenshots (contrast table and method above): `docs/build/progress/visit/
s9h-branch-390.png`, `s9h-branch-1440.png`, `s9h-home-390.png`,
`s9h-home-1440.png`, `s9h-gallery-390.png`, `s9h-gallery-1440.png`.

## Deviations

1. **`fixtures/store/home-components.json` not touched**, investigated,
   would flip the whole home page off `DEFAULT_HOME_COMPONENTS` for every
   concurrent builder's local preview (reasoning above). Verified the real
   component behaviour live instead (dev server + headless browser).
2. **`ox.blocks.branch.photo_wide_alt`'s value edited**, a locale-key VALUE
   change rather than a new key, required because the photo it describes
   changed; a factual accessibility correction, not new marketing copy (ran
   `check-copy`/`check-claims` clean). Edited in place in
   `locales/partials/s9a-v1.{ar,en}.json`, the partial that first defined
   it, per the `i18n-merge` conflict reasoning `S8d.md` §4 item 1 already
   recorded (editing only the base locale would be silently reverted by the
   next merge run).
3. **`.ox-cover--store-wide` removed rather than left inert.** Unlike S8d's
   `--dark` precedent (kept inert "in case a future asset needs it"), this
   modifier had zero remaining callers anywhere in the app after this
   batch's photo swap (`store-wide` is not one of the four gallery slugs
   either), so keeping it would be dead CSS with no plausible near-term use,
   not a hedge against a known future asset.
