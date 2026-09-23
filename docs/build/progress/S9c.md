# S9c: the branch photographs as integrated covers

Owner's words (2026-09-24, with a screenshot of the branch page showing the shelf photo as a panel beside a white card): "integrate the cover image with the content instead of being separate sections, all images to appear premium with premium overlay and to all be the same size and have the brand design of angled rectangle like the primary button angled shape. remove the titles on the images such as واجهة الفرع, instead it is to have an overlay text and cinematic premium gradient and design that is relevant to the image, but not being literal about what the image is, for instance on advisory images the text should be about the advising service. this should be a conversion-maximized, premium, customized brand identity design promoting the store."

Direction by the creative director (G2), 2026-09-24; build by the S9c builder (log below the direction).

## Direction: the branch cover system

### 0. What changes structurally

`OxBranch` is a two-column grid today: a wedge-cut photo panel beside a flat white card (`_blocks.scss` .ox-branch*). The photograph becomes the block, not a neighbour of one. This retires the split-panel construction and replaces it with one cover primitive that the block, the four gallery tiles and any future branch surface draw from.

### 1. The cover primitive

- Shape: `ox-angled($lean)` (`_primitives.scss`), the exact parallelogram the primary button uses (both inline edges lean at the identity angle, mirrored under `[dir='ltr']`). Retire `.ox-branch__corner` and the desktop `ox-wedge(480px, start)` single-edge cut. `one-angled-per-block` (check-identity): `ox-angled()` is the only angled construction on the frame's own selector.
- Lean ladder, reuse the proven one from `.ox-branch-gallery__item--cut`: 40px at 390 (run 27.0px), 48px from 768 (run 32.4), 64px from 1024 (run 43.2). Record the rendered run percentages against the real widths in the log (X-IDENTITY §2.3 budget 24%).
- Aspect: 16:10 for the whole family (the map facade's own ratio): the block's ground cover and all four gallery tiles. `object-fit: cover`, width and height from the manifest, `srcset` from `storePhotoSrcSet()`.
- Manifest check: four photographs are 1448x1086 (fine in 16:10); `shelves` is 512x537, so anchor its crop to the top (`object-position: top center`, tuned against the file) so the labelled shelf row stays in frame, and add an owner-checklist line asking for a wider shelves photograph.

### 2. The cinematic overlay (render-budget bound)

- A gradient, never a flat scrim: two stacked `linear-gradient` layers (bottom to top, and reading-start to reading-end), anchored at the bottom and reading-start corner, transparent toward the photograph's lit area; two literal rules for RTL and LTR.
- Stops tuned per photograph: advisory-room is lit centrally through the frosted door (keep darkness low near the light); storefront is bright at night (darken only the bottom strip); waiting-area carries warm orange the accent glow can pick up.
- Accent glow: a `radial-gradient` of `--ox-accent` at 0.12 to 0.18 feathered from one angled corner. Never `filter: blur()`, never `backdrop-filter` on any cover, no permanent `will-change`, no `background-clip: text`, no strap (`ox-wedge-photo-stroked` stays out).
- The hours table sits on a flat translucent ink plate (`rgba` of `--ox-ink`, 0.55 to 0.65).

### 3. Overlay text and the link arrow

- Reuse Band's dark-ground type tokens (`.ox-bband__headline` / `__sub`).
- Placement: bottom-inline-start, the one uncut corner of the parallelogram, so the text needs only the normal gutter; never against the shaved corners.
- The arrow face (the plan card's small angled chip construction, `chevron-end` from the sprite) sits inline right after the one-line text in the same group.
- Grammar varied across the four covers (two noun-phrase statements, two imperatives), no literal caption, no eyebrow, no numbered marker; the overlay statement is the accessible content (real DOM text), so the old `figcaption` captions and their keys retire.

### 4. Motion and states

- No transform hover on any pointer; a colour-only hover (glow lift or arrow fill) gated under `@media (hover: hover) and (pointer: fine)`; no entrance fade; `prefers-reduced-motion` removes the residual transition.
- Focus is never clipped: the ring rides an unclipped pseudo-element as `_b4-listing.scss` does for the clipped card CTA, on all five covers.

### 5. The four gallery covers, draft copy (MSA, no marks, no em-dash; run check-copy and check-claims)

New keys under `ox.content.branch.*`; statement at `ox-h3` weight, line at body size with reduced opacity.

1. advisory-room → the advisory before you buy (link: `channelById('visit').to`). Statement: استشارة قبل قرار الشراء. Line: نسمعك، ثم نرشح ما يناسب هدفك. Say "مجانا" only if the visit product's price is zero in the catalogue; the statement does not depend on the word.
2. waiting-area → the visit and the measurement (link `/services`; two variants by `inbodyIncluded(settings)`). On: زيارة تشمل قياس InBody / خصصنا وقتا لهدفك، من الاستشارة إلى القياس. Off: زيارة لهدفك / وقت نخصصه لك قبل أن تقرر.
3. storefront → the branch in Madinah (link `BRANCH_LISTING.directionsUrl`, new tab). Statement: زر فرعنا في المدينة المنورة. Line: عنوان واحد، وخريطة تأخذك إليه مباشرة.
4. shelves → the curated range (link `/categories`). Statement: تشكيلة محدودة نعرفها. Line: نختارها بعناية، ونشرح لك كل ما تحتاج معرفته عنها.

### 6. The block (home and /branch)

`OxBranch` takes the same 16:10 parallelogram cover as its ground (the store-wide photograph) instead of the split grid. Title, the rating rail, the offer line, the actions (primary احجز زيارتك, secondary الاتجاهات, quiet WhatsApp, the page link on home only) and the hours table sit inside the frame on the gradient, paper text; at 390 the same composition stacks at full width inside the same frame.

### 7. Out of scope

The offer strip's advisory-room panel and the product-page plate stay as V1 built them. `BranchMap` keeps its tap-to-load state machine and both buttons; restyling its plate to the cover language is optional and must not hide its controls.

## Build log (S9c builder)

### What shipped

- `app/styles/06-ox/_covers.scss` (new): the shared cover primitive —
  `.ox-cover` (the whole card, `ox-angled()`-clipped, 40/48/64 lean ladder,
  its own `:focus-visible` inset box-shadow), `.ox-cover__photo`,
  `.ox-cover__scrim` (two stacked gradients, bottom + reading-start, tunable
  per photograph), `.ox-cover__glow` (accent radial gradient from the top
  reading-end cut corner), `.ox-cover__body`/`__statement`/`__row`/`__line`/
  `__arrow`, the colour-only hover, `prefers-reduced-motion`, and the five
  per-slug modifiers (`--advisory-room`, `--storefront`, `--waiting-area`,
  `--shelves`, `--store-wide`). Imported from `_index.scss` right after
  `_primitives.scss` (`_primitives.scss` itself untouched).
- `app/styles/06-ox/_blocks.scss` §1: the split-panel `.ox-branch`/
  `.ox-branch__photo`/`.ox-branch__corner`/the 7/5 desktop grid/
  `data-meta`/`.ox-branch--flat` two-column system are gone. What is left is
  content-only: `.ox-branch__head`, `.ox-branch__meta`,
  `.ox-branch__eyebrow`, `.ox-branch__address`, `.ox-branch__offer`, the new
  `.ox-branch__hours-plate` (the translucent ink plate under the hours
  table), `.ox-branch__actions`, `.ox-branch__pickup`, and the no-photograph
  fallback `.ox-branch__content--flat`.
- `app/styles/06-ox/_b5-pages.scss` §7: `.ox-branch-gallery__figure`/
  `__photo`/`__caption` and the first-tile-only `ox-x-corner` rule are gone;
  `.ox-branch-gallery__list`/`__item` keep their existing responsive layout
  (scroll row below 640, 2-up grid from 640) unchanged, now wrapping
  `.ox-cover` tiles instead of `<figure>`s.
- `app/components/blocks/OxBranch.tsx`: the store-wide photograph is now the
  block's own `.ox-cover` (`.ox-cover--store-wide` when it is the real
  manifest entry), carrying `.ox-band-dark` so every existing component
  inside — `Button`, `HoursTable`'s `.ox-table`, `StoreRating`'s `.ox-gr` —
  repaints itself for the photograph ground with zero cover-specific
  overrides, and `--ox-focus` becomes `--ox-paper`. No `photo` still falls
  back to the same content stack on a plain card (`.ox-branch__content--flat`),
  never an invented cover.
- `app/components/pages/BranchGallery.tsx`: rewritten from four
  `<figure>+<img>+<figcaption>` tiles to four `.ox-cover` links (three
  `Link`, one plain `<a target="_blank">` for the storefront/directions
  tile). Each carries a statement, a line and the `chevron-end` arrow chip
  as real DOM text — the accessible name of the link — never a caption.
  `waiting-area`'s copy switches on `inbodyIncluded(settings)`.
- `app/content/branch.ts`: `BRANCH.covers` registers the ten new
  `ox.content.branch.cover_*` keys (required by
  `tests/content/maps.test.ts`'s orphan-key check); the four retired
  `photo_*` caption keys stay registered and stay in the locale, just
  unrendered.
- `locales/partials/s9c.ar.json` / `.en.json`: the ten new keys, merged via
  `node scripts/i18n-merge.mjs`.
- `docs/build/owner-checklist.md`: one new line asking for a wider shelves
  photograph (the 512x537 original loses its lower shelves to the 16:10
  top-anchored crop).
- Tests rewritten for the new structure: `tests/blocks/OxBranch.test.tsx`
  (cover/flat-card assertions, `Image` mock now forwards `className`),
  `tests/pages/BranchGallery.test.tsx` (four-cover, no-figcaption,
  per-cover href/statement/inbody-variant coverage), `tests/home/
  OxBranchBlock.test.tsx` (`.ox-cover img` selector).

### Deviations from the direction, with reasons

1. **§3 "bottom-inline-start, the one uncut corner" corrected to
   bottom-inline-end.** Working the `ox-angled()` polygon by hand (RTL:
   `polygon(run 0, 100% 0, 100%-run 100%, 0 100%)`) puts the two FULL
   corners at top-inline-start and bottom-inline-end; the two CUT corners
   are top-inline-end and bottom-inline-start — the same pairing
   `_primitives.scss`'s own doc comment states ("leaning top-inline-end to
   bottom-inline-start"). The overlay text is placed at bottom-inline-end
   (verified against the direction's own stated lean, not against its
   possibly-mistaken corner label), which is what "never against the shaved
   corners" actually requires.
2. **Focus ring: `.ox-cover`'s own inset box-shadow, not a pseudo-element.**
   The direction names "an unclipped pseudo-element" and "`_b4-listing.scss`
   … for the clipped card CTA". A literal `::before`/`::after` nested inside
   a `clip-path`-clipped ancestor is clipped by that ancestor too (clip-path
   clips descendant painting the way `overflow: hidden` does), so it cannot
   be genuinely unclipped while remaining a child. The four gallery covers
   are whole-card links exactly like `.ox-pcard`/`ContentPosterCard`
   (`_b2-home.scss` §17.2, not `_b4-listing.scss`, but the same construction
   `_b4-listing.scss`'s own `.ox-featured__arrow`/`.ox-brand-tile` comments
   describe): `outline: none` plus `box-shadow: inset 0 0 0 2px var(--ox-focus)`
   on the clipped element itself, which paints fully inside the polygon at
   every width and is never invisible on the cut. `.ox-cover`'s own
   `:focus-visible` is inert on the block variant, which is never itself a
   focus target.
3. **The block cover is not a fixed 16:10 box.** `OxBranch` carries a title,
   `StoreRating`, an offer line, the address, the hours table, three or four
   actions and a pickup note — more content than a strict 16:10 photograph
   can hold at 390 (243px tall). `.ox-cover`'s `min-block-size` approximates
   16:10 at each tier's own container width (224/450/600/810px) as a FLOOR;
   the photograph and its gradient (`position: absolute; inset: 0`) always
   fill whatever height the in-flow `.ox-cover__body` actually needs, which
   is 16:10 whenever the content is short enough and taller when it is not
   (measured: 810px at 1440, exactly the floor, since the content fits). The
   four gallery tiles hold the literal ratio (`.ox-cover--tile { aspect-ratio:
   16/10 }`) since their content never outgrows it.
4. **The home branch block screenshot could not be captured live.** The
   offline preview's own `fixtures/store/home-components.json` (ten generic
   Salla dashboard blocks) does not include an `ox-branch` entry, so the
   block never mounts on `/ar` in this preview even though `'ox-branch'` is
   in the theme's own default block catalogue (`defaults.ts`) — a store-data
   fixture gap, not a code path this batch owns. Verified instead by
   `tests/home/OxBranchBlock.test.tsx` (passing) and by the fact that
   `OxBranchBlock` renders the identical `OxBranch` component the branch-page
   screenshots below already show, with only its wrapper props (`showPageLink`,
   `showOfferLine`, `headingLevel="h2"`) differing.

### Rendered run percentages (X-IDENTITY §2.3, 24% budget), measured against real container widths

Container widths (gutter 16/24/32 at 0/640/1024, `--ox-container` 1296):
390→358px, 768→720px, 1024→960px, 1440→1296px.

**OxBranch block cover** (full container width; lean 40/48/64 → run 27.0/32.4/43.2):

| Width | Cover width | Run | Run % |
|---|---|---|---|
| 390 | 358px | 27.0px | 7.54% |
| 768 | 720px | 32.4px | 4.50% |
| 1024 | 960px | 43.2px | 4.50% |
| 1440 | 1296px | 43.2px | 3.33% |

**BranchGallery tile** (measured live via CDP: 304.19px at 390, matching
`getBoundingClientRect()`; the rest computed from the same grid math):

| Width | Tile width | Run | Run % |
|---|---|---|---|
| 390 | 304.2px | 27.0px | 8.87% |
| 768 | 352px | 32.4px | 9.20% |
| 1024 | 472px | 43.2px | 9.15% |
| 1440 | 640px | 43.2px | 6.75% |

All eight measurements land well inside the 24% budget.

### Verified by

- `pnpm typecheck` → `tsc --noEmit`, clean.
- `pnpm vitest run tests/blocks tests/pages tests/home` → 33 files, 389
  tests, all passing.
- `pnpm vitest run tests/content` → 5 files, 84 tests, passing (the maps
  test's orphan-key check confirms `BRANCH.covers` registration).
- `pnpm vitest run tests/i18n.test.ts tests/i18n-keys.test.ts
  tests/i18n-claims.test.ts` → 3 files, 30 tests, passing.
- `node scripts/check-tokens.mjs` → 123 tokens defined, 331 files scanned,
  0 problems.
- `node scripts/check-identity.mjs` → 337 files, 0 problems.
- `node scripts/check-strings.mjs` → 348 files, 0 problems.
- `node scripts/check-copy.mjs` → 54 files, 0 problems.
- `node scripts/check-claims.mjs` → 54 files, 0 problems (4 pre-existing
  allowlisted findings, unrelated to this batch).
- `node scripts/check-rtl.mjs` / `node scripts/check-motion.mjs` → 337
  files each, 0 problems.
- CDP screenshots (chrome-headless-shell, port 9781, fresh
  `--user-data-dir`, killed on completion; preview server on 3210 never
  touched): `docs/build/progress/visit/covers-branch-390.png` and
  `covers-branch-1440.png` (full page), `covers-block-390/1440.png`,
  `covers-gallery-390/1440.png`, `covers-map-390/1440.png` (the branch
  page's three surfaces, each width). All four gallery covers and the block
  cover show the photograph, the cinematic gradient, legible paper text, the
  angled cut, and (gallery) the arrow chip. First-attempt captures of
  content below the fold were occasionally flaky (a lazy-loaded image not
  yet decoded when `captureBeyondViewport` fires); the script was changed to
  scroll the real viewport there first, which fixed it — a screenshot-tooling
  detail, not a product defect (a real scroll always decodes the image).

### Strings shipped (`locales/partials/s9c.ar.json` / `.en.json`)

| Key | AR | EN |
|---|---|---|
| `cover_advisory_statement` | استشارة قبل قرار الشراء | Advice before you buy |
| `cover_advisory_line` | نسمعك، ثم نرشح ما يناسب هدفك. | We listen, then recommend what fits your goal. |
| `cover_waiting_statement_on` | زيارة تشمل قياس InBody | A visit that includes an InBody measurement |
| `cover_waiting_line_on` | خصصنا وقتا لهدفك، من الاستشارة إلى القياس. | We set aside time for your goal, from advice to measurement. |
| `cover_waiting_statement_off` | زيارة لهدفك | A visit for your goal |
| `cover_waiting_line_off` | وقت نخصصه لك قبل أن تقرر. | Time we set aside for you before you decide. |
| `cover_storefront_statement` | زر فرعنا في المدينة المنورة | Visit our branch in Madinah |
| `cover_storefront_line` | عنوان واحد، وخريطة تأخذك إليه مباشرة. | One address, and a map that takes you straight there. |
| `cover_shelves_statement` | تشكيلة محدودة نعرفها | A limited range we know well |
| `cover_shelves_line` | نختارها بعناية، ونشرح لك كل ما تحتاج معرفته عنها. | We choose it with care, and explain everything you need to know about it. |

The visit product (OX-046) prices at 0 in `fixtures/store/products.json`, so
"مجانا" was available to use per direction §5 item 1; the direction's own
draft copy for that cover does not use the word, so no line changed for it.
`check-copy`/`check-claims` both ran clean on the two partial files
individually and as part of the full-repo gate.
