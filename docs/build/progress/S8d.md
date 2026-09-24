# S8d, shop by brand hierarchy and the default-on newsletter (2026-09-24)

Batch: two owner items. Item 1, SHOP BY BRAND: no eyebrow, one fixed logo box
on every tile, no count on the tile, and the section moves to directly after
`ox-categories`. Item 2, NEWSLETTER ON THE HOMEPAGE: `show_newsletter`
defaults to true, the block becomes the conversion plate at the end of the
home, wired to Salla's own mechanism if one exists (it does not, see §2.1),
with an honest degrade and a privacy-policy link. A same-day coordinator
addendum (received mid-batch) removes the grey fill behind every brand logo.

Read first, in full: `docs/build/progress/S4d.md` §5.1 (the home carousel
this batch reorders and restyles), `app/components/brands/BrandTile.tsx`,
`app/components/home/OxBrands.tsx`, `app/components/home/OxNewsletterBlock.
tsx` → `OxCtaBand.tsx` → `app/components/blocks/OxNewsletter.tsx` (the actual
render chain), `app/components/home/defaults.ts`, `app/components/home/
HomeSkeleton.tsx`, `docs/build/X-IDENTITY-2026-09-22.md` §§2–4,
`docs/brand/voice-ksa.md` §6–7, `tests/home/blocks.test.tsx`,
`tests/brands/**`, `twilight.json`.

---

## 1. Shop by brand

### 1(a) No eyebrow

`OxBrands.tsx` no longer passes `eyebrow={t('ox.home.brands_label')}` to
`SectionHeader`. The header is now title + view-all only, the same shape
`OxCategories`' own header draws (`<SectionHeader title={...}
viewAll={{to:'/categories'}} />`, no eyebrow, no scoped override anywhere in
`_b2-home.scss`). Neither section carries a class that resizes `.ox-sh__title`
differently, so the two headings are byte-for-byte the same size and spacing
once the eyebrow row is gone, no new CSS was needed to make this true.

The strap-sweep motion (S4d §1.2 item 1: the eyebrow's own accent rule
opening once on reveal) is removed with it in `_b2-home.scss` section 7:
there is no longer an element for it to animate. `useSectionReveal`/
`data-reveal` stay, because the rail's chevron cue still pulses off the same
attribute (§1.2 item 2, unchanged).

`ox.home.brands_label` is left in the dictionary, unread (S4d's own
`title_pattern` precedent), deleting a key from a base locale a merge
already published is a bigger, riskier edit than leaving one unread.

### 1(b) One fixed logo box, transparent (coordinator addendum)

The old `.ox-brand-tile__logobox` was `inline-size: 100%; aspect-ratio: 3/2`,
so its height was derived from the TILE's own width, 139.8 to 202.7 across
the carousel's tiers, 171 to 202.7 across the `/brands` grid's, different
numbers at the same breakpoint on the two surfaces. Two brands could sit in
visibly different boxes at the same viewport; that is the defect the brief
names. Fixed with a flat `block-size` per tier, 72px base, 96px from 1280,
the same two-step ladder the plate's own `min-block-size` already uses -
replacing the `aspect-ratio`. `object-fit: contain` on the `<img>` is
unchanged: it is the ONLY scaling the artwork itself gets, and the box never
scales by the logo's own ratio.

**Mid-batch coordinator addendum** (received after the fixed box shipped, same
day): *"remove the grey fill behind brand images. The logo box on every tile,
the index and the banner is transparent … same fixed size as you are
building; the name-mark fallback keeps only its text."* Applied:

- `.ox-brand-tile__logobox` lost `background: var(--ox-paper)`. It never had
  a border of its own (the hairline is the PLATE's, `.ox-brand-tile__plate`,
  unaffected), nothing else changes.
- `.ox-brand-tile__logobox--dark { background: var(--ox-ink) }` stays,
  **inert**, for the reason `docs/build/progress/S4d.md` §4.1 already
  records: no overlay row sets `logo_ground: "dark"` any more (the two
  white-only marks ship in their ink variant instead), so the modifier is
  declared and never matched. Left in place rather than deleted, in case a
  future asset needs it.
- `.ox-brand-tile__mark` (the name-mark fallback) lost the box treatment this
  batch had first given it under the ORIGINAL brief's "the name-mark
  fallback box identical" line (padding, centring, a `min-block-size` floor)
  - the addendum supersedes that with "keeps only its text": typography
  only (`font-size`, `font-weight`, `color`, `text-align`, `text-wrap`), no
  box, no padding. The plate's own `align-items: center` /
  `justify-content: center` still centres it; no name-mark box is left to be
  identical to a now-transparent logo box, so the two brief lines no longer
  conflict, the later, more specific instruction governs (same resolution
  rule S4d §1.3 used for its own two overridden identity rules).
- `.ox-brandhero__logobox` (the brand banner, `BrandBanner.tsx`, not a file
  this batch's constraints name, but the SAME `_b4-listing.scss` section 11
  this batch already owns) gets the identical treatment for consistency: the
  old `aspect-ratio: 3/2` becomes a fixed `block-size: 108px` (close to its
  previous rendered height at the banner's fixed 160px width, so the visual
  footprint does not jump), and `background: var(--ox-paper)` is dropped.
  `.ox-brandhero__mark` already carried no box (`margin: 0` only), so "keeps
  only its text" was already true there.

Verified live (curl, `/ar/brands`, 21 real brands): **21 ×
`class="ox-brand-tile__logobox"`, 0 × any `--dark` modifier, 0 ×
`.ox-brand-tile__mark`** (every catalogue brand has real artwork today, so
the fallback path is exercised only by tests, not by the live 21).

### 1(c) No count on the tile

`BrandTile.tsx`'s count block (`{count !== null ? <span
className="ox-brand-tile__count">...` ) and its `count`/`useTranslation`
plumbing are removed outright; `.ox-brand-tile__count`'s CSS rule is removed
with it. `products_count` stays on the `BrandWithCount` type and
`OxBrands.tsx`'s sort is untouched, the field still drives which brands lead
the carousel, it is simply never printed. `BrandBanner.tsx`'s own
`.ox-brandhero__count` is a different class in a file this batch does not
touch, and keeps its count exactly as the brief asks ("the brand banner keeps
its own count only if the page already shows it").

Verified live (curl, `/ar/brands`): **`ox-brand-tile__count` appears 0
times** across all 21 tiles.

### 1(d) Hierarchy

`ox-brands` moves in `HOME_BLOCK_PATHS` (`defaults.ts`) from directly after
`ox-services` to directly after `ox-categories` and before
`ox-category-rail`. `twilight.json`'s `components[]` array is reordered in
lockstep (the same three JSON objects, `ox-category-rail`, `ox-services`,
`ox-brands`, reassembled as `ox-brands, ox-category-rail, ox-services`, no
object edited, only moved), which is what `tests/home/defaults.test.ts`'s
"declares exactly the DIRECTION 6.2 blocks, in order" assertion requires (it
diffs the manifest's path order against `HOME_BLOCK_PATHS` verbatim).

`HOME_BLOCK_HEIGHTS['ox-brands']` and `BrandsSkeleton()` **stay at 0 / null**.
The reason has not changed with the move: `fixtures/store/brands.json` (the
live store, as opposed to the 21-brand offline overlay S4d built) is still
`[]`, so `OxBrands` still renders `null` on the real storefront. Reserving a
box here would put a blank rectangle directly under "تصفح حسب النوع" instead
of above the footer, a worse position for the exact CLS defect
`tests/home/optionalBlocks.test.ts` exists to catch, not a better one.

Verified live (curl, `/ar`, fresh server): the SSR block order is
`ox-hero, ox-goals, ox-products, ox-poster, ox-posters,
ox-products-secondary, ox-categories, ox-brands, ox-category-rail ×8,
ox-services, ox-guides, ox-branch, ox-certifications, ox-faq, ox-newsletter,
ox-banner`, `ox-brands` directly after `ox-categories`, directly before the
first `ox-category-rail`, exactly as specified. (An earlier curl attempt,
mid-batch, returned the OLD order from a server process that restarted
during this session, see §4 "Deviations", item 7, not a code defect; the
fresh process above answers correctly.)

---

## 2. Newsletter on the homepage

### 2.1 The Salla mechanism does not exist, researched, not assumed

The brief asks to "find the engine or SDK primitive (`salla-newsletter`
component, `salla.newsletter.subscribe`, or the engine's newsletter
route/API) and use it, never a custom endpoint." This batch re-verified
`docs/build/progress/S2c.md`'s own 2026-09-22 finding rather than trusting
it blind:

- `grep -rliE "newsletter|subscribe" node_modules/@salla.sa/
  twilight-theme-engine/dist` (every `.js`): **zero `newsletter` hits at
  all**; the `subscribe` hits are all unrelated (`is-subscribed`/
  `subscribed-options` on `salla-add-product-button`, back-in-stock
  subscriptions, a different feature, and generic event-subscription
  patterns in hooks/context code, not a mailing-list transport).
- `dist/types/salla-sdk.d.ts` (this theme's own hand-maintained
  `window.salla` types, since the npm package's own types are broken) has no
  `salla.newsletter.*` and no ambient `<salla-newsletter>` component in
  `dist/ambient/salla-components.d.ts`'s exhaustive element list.
  `profile.updateSettings(name, value)` is the nearest thing that exists, and
  it is a LOGGED-IN customer's own notification preference (`is_notifiable`),
  not an anonymous email-capture endpoint.
- `docs/live-theme/fixtures/fixture-home.html` and `fixture-pdp.html`, a
  scrape of the live reference (Raed) theme, have **zero** "newsletter"
  occurrences. The reference storefront does not ship this feature either.

Conclusion, matching S2c's own: no native primitive exists anywhere
accessible to this build. Inventing an endpoint would be exactly the "custom
endpoint" the brief forbids, and worse, an unverifiable one. `subscribe`
stays an injectable prop on `OxNewsletter` (`PLAN-final.md`'s own open
question Q1), a one-line wire-up the day a real transport is found, and the
**one thing actually built this batch** is the honest degrade the brief
itself anticipates for exactly this situation: *"In the offline preview the
SDK may not answer: the form must render and degrade (a submit with no SDK
shows the error state, never a crash)."*

That degrade was previously **absent and silently wrong**: `await
subscribe?.(email)` with `subscribe` undefined resolves immediately with no
throw, so the old code set `status = 'success'` on every submission with no
transport wired, a fabricated success line, on the live homepage, the moment
`show_newsletter` went from off to on. Fixed in `OxNewsletter.tsx`: a missing
`subscribe` now sets `status = 'error'` explicitly, and the existing render
logic already distinguishes an invalid address from a transport failure by
re-checking `looksLikeEmail(email)`, so the user sees exactly
`ox.newsletter.error` ("تعذر الاشتراك الآن، حاول مرة أخرى."), never a crash,
never a lie.

### 2.2 `show_newsletter` defaults to true

`twilight.json`'s `show_newsletter` setting: `"value": false` →
`"value": true`; its `description` updated from a stale claim ("يظهر النموذج
في التذييل", the form does not live in the footer) to state what is
actually true today. The merchant switch is untouched, it is still a
`boolean`/`switch` field the dashboard can flip off.

### 2.3 Copy

New/changed keys (owner-specified literal text, shipped verbatim, GOV-013
owner-authored copy):

| key | ar | en |
|---|---|---|
| `ox.newsletter.title` (value changed) | اشترك في نشرة اوبتيمال اكس | Join the OptimalX newsletter |
| `ox.newsletter.line` (new key) | عروض مختارة وأدلة قصيرة تصلك أولا. لا رسائل مزعجة. | Selected offers and short guides, sent to you first. No spam. |
| `ox.newsletter.success` (value changed) | تم الاشتراك. شكرا لك. | Subscribed. Thank you. |
| `ox.newsletter.error` (value changed) | تعذر الاشتراك الآن، حاول مرة أخرى. | Could not subscribe right now, please try again. |

`OxNewsletter.tsx` now reads `ox.newsletter.line` instead of `ox.newsletter.
body`; `ox.newsletter.body` is left in the dictionary, unread (same S4d
precedent as `ox.home.brands_label` above, the old "one fact a week" copy
this key carried is superseded, not deleted). `ox.newsletter.button`
("اشترك"/"Subscribe") and `.privacy`, `.placeholder`, `.invalid` are
untouched; the brief did not ask for new wording there.

Passed `node scripts/check-copy.mjs` (no dialect, no diacritic, no em-dash,
no AI-tell construction) and `node scripts/check-claims.mjs` (no outcome
promise, no count, no banned word), see §5.

### 2.4 The identity plate

`.ox-cta-band__newsletter` (the newsletter's own wrapper inside `OxCtaBand`)
carries a raised ground and the mark's own corner cut: `background:
var(--ox-graphite-3)` (the SAME token `.ox-band-dark .ox-input` already reads
on, two rules above in `_primitives.scss`, no new token) and `@include
ox-x-corner(40/48/64px, start)` across the same three tiers every other
band-scale cut in this theme uses. This is the identical construction
`.ox-services__offer` already carries on its own dark band (`_b2-home.scss`
section on the offer plate), and the two coexist with the band's OWN
`.ox-cta-band__motif` wedge under X-IDENTITY's "one angled gesture per
component" rule for the same reason the services band's motif and its offer
plate already coexist: the band and the plate are two different components.

The 158px law (§3.2) holds: at the narrowest tier the plate's own content
(title, line, 48px form slot, privacy line, `var(--ox-6)` padding) sums well
past 158px, the itemised total is in `defaults.ts`'s own comment (§2.6
below).

### 2.5 The privacy line's link

Resolved in `OxCtaBand.tsx` against the merchant's own footer menu
(`menu.footer()`, `findMenuLink`, the exact mechanism
`UtilityTrust.tsx`/`FooterColumns.tsx` already use for the same kind of
policy-page link), never invented: no match, no link. Passed down as a new
`privacyUrl?: string` prop on `OxNewsletter`, appended after the existing
privacy sentence as `<Link to={privacyUrl}>{t('ox.footer.privacy_policy')}
</Link>` (reusing the footer's own label, "الخصوصية"/"Privacy", no new
key). `blocks/ArticleExtras.tsx` (the blog's own newsletter placement)
passes no `privacyUrl`, so it is unaffected: the plain sentence it always had.

The `useQuery` for `menu.footer()` sits above `OxCtaBand`'s existing early
return (`enabled: visible`), because React's Rules of Hooks forbid a hook
call after a conditional return that already existed in this file.

### 2.6 Reserved height

`show_newsletter` defaulting to true means the CTA band now renders on every
fresh install, so the old `{ mobile: 0, desktop: 0 }` (correct while the
block was gated off) would reproduce the exact CLS defect this file's own
convention exists to prevent, now on every store instead of none.

**No headless-browser tool was available to this batch** (checked:
`package.json` carries no `playwright`/`puppeteer`/`chrome-launcher`
dependency), so the number is computed by token arithmetic against
`_b2-home.scss`'s own spacing scale and the shipped copy's character counts,
the same method several existing entries in `defaults.ts` already use and
label as such (`ox-goals`, `ox-categories`: "token arithmetic … not a live
browser measurement"). The full itemisation is in `defaults.ts`'s own
comment above the `'ox-newsletter'` entry; the total: **mobile 508, desktop
348**.

**Live curl confirms the number reached the page**: `/ar`'s `ox-newsletter`
skeleton root reads `style="min-height:clamp(348px, calc(567.429px -
15.238vw), 508px)"`, the exact `clampHeight(508, 348)` output, and its
inner `.ox-skel-news` (a class declared in `_b2-home.scss` section 12 since
before this batch and never used, because `NewsletterSkeleton()` always
returned `null` until today) draws two bars, a 44px block and a 202px block,
matching `OxCtaBand`'s own stacked shape. **Flagged for a follow-up
re-measurement** once the page can be checked in an actual browser, the
arithmetic is a considered estimate, not a claim of pixel accuracy.

### 2.7 Accessibility

Mostly already correct before this batch and left alone: `<label
className="ox-sr-only" htmlFor={inputId}>`, `autoComplete="email"`,
`inputMode="email"`, `role="status"` on success (implicit `aria-live=
polite`), `role="alert"` on error (implicit `aria-live=assertive`). Nothing
new was needed beyond the privacy link itself, which inherits the paragraph's
own colour and gets a visible underline (no change to focus handling, the
link keeps the browser's/engine's default outline, never suppressed).

---

## 3. Files changed

**Components**
- `app/components/brands/BrandTile.tsx`, count block removed; docblock
  updated for the transparent logo box and text-only name mark.
- `app/components/home/OxBrands.tsx`, `eyebrow` prop dropped; docblock
  updated (no eyebrow, hierarchy, no count).
- `app/components/blocks/OxNewsletter.tsx`, `privacyUrl` prop and its
  rendered link; no-`subscribe` now sets the error state instead of a fake
  success; `ox.newsletter.body` → `ox.newsletter.line`; docblock rewritten
  with the "no native mechanism" research.
- `app/components/home/OxCtaBand.tsx`, `menu.footer()` query
  (`enabled: visible`, above the early return), `findMenuLink` resolution,
  `privacyUrl` passed to `OxNewsletter`; docblock rewritten (this file no
  longer claims `HomeSkeleton.tsx`/`defaults.ts` are "a different batch's
  files it cannot touch", this batch touches both).
- `app/components/home/defaults.ts`, `HOME_BLOCK_PATHS` reordered
  (`ox-brands` moved); `HOME_BLOCK_HEIGHTS['ox-brands']` comment updated (
  value unchanged, 0/0); `HOME_BLOCK_HEIGHTS['ox-newsletter']` given a real,
  itemised reservation (508/348).
- `app/components/home/HomeSkeleton.tsx`, `BrandsSkeleton()` comment
  updated; `NewsletterSkeleton()` rebuilt from `return null` to a real
  placeholder on the pre-existing, previously-unused `.ox-skel-news` class.

**Styles**
- `app/styles/06-ox/_b2-home.scss`, section 7 (OxBrands): docblock, dead
  strap-sweep CSS removed. Section 19 (OxCtaBand): `.ox-cta-band__newsletter`
  rebuilt as the identity plate (corner cut, three tiers), the privacy
  link's own rule.
- `app/styles/06-ox/_b4-listing.scss`, section 11: `.ox-brand-tile__logobox`
  fixed-height, transparent (two tiers); `.ox-brand-tile__mark` reverted to
  text-only; `.ox-brand-tile__count` rule removed;
  `.ox-brandhero__logobox` fixed-height, transparent (coordinator addendum
  extends the same treatment to the banner).

**Data**
- `twilight.json`, `show_newsletter` default `false` → `true`, description
  corrected; `home.ox-brands` component object moved to sit between
  `home.ox-categories` and `home.ox-category-rail` (no field edited, only
  reordered, keeping `components[]` in lockstep with `HOME_BLOCK_PATHS` per
  `tests/home/defaults.test.ts`).

**Locales**
- `locales/partials/p1b.{ar,en}.json`, `ox.newsletter.title`/`.success`/
  `.error` VALUES updated (see §4 "Deviations", item 1 for why this file,
  outside the batch's named locale scope, was touched).
- `locales/partials/s8d.{ar,en}.json`, new files; `ox.newsletter.line`.
- `locales/{ar,en}.json`, merged via `node scripts/i18n-merge.mjs` (1 key
  added, 3 updated, per language); `--check` reports 0 pending afterwards.

**Tests**
- `tests/home/blocks.test.tsx`, the count test rewritten to assert NO count
  ever renders (was: asserts a count renders once); a new test asserting no
  eyebrow.
- `tests/home/OxCtaBand.test.tsx`, `api/menu` mocked (`menu.footer`, so no
  test reaches a real network call); two new tests (the identity plate
  class, the privacy link resolved/absent).
- `tests/home/optionalBlocks.test.ts`, `ox-newsletter` removed from the
  `GATED` list, with a docblock paragraph in the same style the file already
  uses for `ox-categories` leaving the list in 2026-09-22.

---

## 4. Deviations, every one flagged

1. **`locales/partials/p1b.{ar,en}.json` edited**, a file outside this
   batch's named locale scope ("locales/partials/s8d.ar.json + s8d.en.json
   and both base locales"). Reason: `ox.newsletter.title`/`.success`/`.error`
   already existed, declared in `p1b`, and `scripts/i18n-merge.mjs` treats
   two partials disagreeing on the same key as a hard conflict (exit 1), so
   a NEW definition of the same key in `s8d.*.json` was not an option.
   Editing only the base locale files (which the batch IS scoped to) would
   have worked for every gate this batch runs, but would leave a landmine:
   the next `i18n-merge` run would silently revert the base files back to
   `p1b`'s old values. Editing the value in place, in `p1b`, is the only
   change that keeps `--check` at 0 pending (confirmed: it is, after this
   batch's merge). No other `p1b` key was touched.
2. **`tests/home/OxCtaBand.test.tsx` and `tests/home/optionalBlocks.test.ts`
   edited**, neither named in the batch's constraints. Both are inside
   `tests/home/`, which the batch's own verify command runs
   (`pnpm vitest run tests/home tests/brands tests/common`), and both were
   made to fail, unavoidably, by the behaviour the brief asks for
   (`OxCtaBand` now queries `menu.footer()`; `ox-newsletter` now reserves a
   real height and draws a real skeleton). Left red was not an option under
   "never claim success without running it."
3. **`_b4-listing.scss`'s `.ox-brandhero__logobox` edited**, in
   `BrandBanner.tsx`'s own styling surface, a component file this batch's
   constraints do not name. The coordinator's addendum names "the banner"
   explicitly ("The logo box on every tile, the index and the banner is
   transparent … same fixed size"), and the change is CSS-only, inside
   `_b4-listing.scss` section 11, which the batch already owns, no
   `BrandBanner.tsx` line was touched.
4. **`HOME_BLOCK_HEIGHTS['ox-newsletter']`'s 508/348 is a token-arithmetic
   estimate, not a live-browser measurement**, §2.6. No headless-browser
   tool exists in this environment; flagged for a follow-up pass once one
   does.
5. **The offline preview cannot show a real `show_newsletter=true` render.**
   Discovered mid-batch, root-caused: `scripts/serve-store.mjs`'s
   `store/settings` endpoint answers with the STATIC fixture
   `fixtures/store/store-settings.json` verbatim; that fixture's
   `data.theme.settings` object is a fixed list of engine-native settings
   (`show_tags`, `imageZoom`, …) and carries **none** of the custom settings
   `twilight.json` declares, not `show_newsletter`, and, by the same
   mechanism, not `inbody_included`, `reply_sla_hours`,
   `consultation_credit_note` or any other gated custom setting either. This
   predates this batch and is not specific to the newsletter: it is a
   general gap between the offline fixture and what a real Salla store's
   settings API would answer (which does include every custom setting a
   theme declares, at its default or the merchant's saved value). Not fixed
   here, `fixtures/store/store-settings.json` is shared infrastructure
   several concurrent batches read from, outside this batch's scope, and a
   silent edit to it mid-session is a bigger risk than the gap itself.
   Flagged for the coordinator. Consequence for THIS batch's own
   verification: `show_newsletter`'s effect (band renders vs. null) is
   proven by `tests/blocks/OxNewsletter.test.tsx` and
   `tests/home/OxCtaBand.test.tsx` (both explicitly set the setting and
   assert the result), not by a live curl of the rendered form; the parts of
   item 2 that do NOT depend on this fixture, the reserved height, the
   skeleton, the block order, are curl-verified live (§5).
6. **One transient dev-server restart, mid-batch, not a code defect.** A
   curl of `/ar` returned the OLD block order (brands still after
   `ox-services`) at a point where `defaults.ts`/`twilight.json` already
   carried the new order; `.offline-preview.log` shows the server process
   restarted seconds later (`VITE v8.2.2 ready in 62810 ms`), the response
   was in flight from before the edits reached that worker, or from before
   the restart. Every curl after the restart shows the correct order; see
   §5. Same class of dev-server unreliability `S3b.md`/`S4a.md`/`S4d.md`
   §7 item 10 already documented.
7. **`node scripts/i18n-merge.mjs` merged every pending partial, not only
   this batch's**, same reasoning S4d §7 item 7 recorded: additive and
   idempotent, `--check` reports 0 pending afterwards, so a concurrent
   batch's own partial (if any landed) is a no-op on its next run.

---

## 5. Verification

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/home tests/brands tests/common
 Test Files  22 passed (22)
      Tests  257 passed (257)
```

```
$ pnpm vitest run tests/blocks/OxNewsletter.test.tsx tests/content/social-proof.test.tsx
 Test Files  2 passed (2)
      Tests  38 passed (38)
```
(Neither file is in this batch's named scope; run as a sanity check on the
shared `OxNewsletter.tsx` change. Both green, unchanged.)

```
$ pnpm check:rtl        → check-rtl: 331 file(s), 0 problem(s)
$ pnpm check:motion     → check-motion: 331 file(s), 0 problem(s)
$ pnpm check:strings    → check-strings: 337 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
                        → check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
                        → check-claims: 46 file(s), 0 problem(s), 4 allowlisted
                          (the four pre-existing official_distributors rows)
$ node scripts/check-tokens.mjs
                        → 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
                        → check-identity: 331 file(s), 0 problem(s)
$ node scripts/i18n-merge.mjs --check
                        → locales\ar.json: 1426 partial key(s), 0 added, 0 updated
                          locales\en.json: 1426 partial key(s), 0 added, 0 updated
```

Compiled CSS read back (`npx sass --no-source-map app/styles/app.scss`,
clean, only the pre-existing `@import` deprecations): `.ox-cta-band__
newsletter`'s three-tier `clip-path` and its `[dir='ltr']` mirror,
`.ox-brand-tile__logobox`'s fixed `block-size` at both tiers with no
`background`, `.ox-brandhero__logobox`'s fixed `block-size` with no
`background`.

Live curl, `http://localhost:3210` (the dev server restarted mid-batch -
§4 item 6, every result below is from the fresh process):

```
/ar         200  113467B
/ar/brands  200   95619B

/ar block order (s-block--ox-* markers, in document order):
  ox-hero, ox-goals, ox-products, ox-poster, ox-posters,
  ox-products-secondary, ox-categories, ox-brands,
  ox-category-rail ×8, ox-services, ox-guides, ox-branch,
  ox-certifications, ox-faq, ox-newsletter, ox-banner
  → ox-brands directly after ox-categories, directly before the first
    ox-category-rail (item 1(d)).

/ar  s-block--ox-brands style="min-height:0px"           (item 1(d), §2.6 of S4d unchanged)
/ar  s-block--ox-newsletter
     style="min-height:clamp(348px, calc(567.429px - 15.238vw), 508px)"
     → clampHeight(508, 348) reached the page exactly (item 2, §2.6)
     .ox-skel-news: 2 bars, one 44px block, one 202px block

/ar/brands  <h1 class="ox-h1">العلامات التجارية
            21 × class="ox-brand-tile__logobox"   (uniform, no --dark)
             0 × class="ox-brand-tile__mark"      (all 21 brands have artwork)
             0 × ox-brand-tile__count             (item 1(c))
            21 × .ox-brand-tile__plate
```

`/ar`'s `ox-newsletter` block itself is an empty-then-lazy shell in SSR HTML
(same as `ox-brands`, `ox-category-rail`, `ox-services`, `ox-faq`, every
below-the-fold block in this theme is lazy; `HomeSkeleton.tsx`'s own
docblock: "The remaining blocks are lazy and bring their own placeholders
when they scroll into view"), so its rendered FORM content (heading, line,
input, button, privacy link) is covered by `tests/home/OxCtaBand.test.tsx`
and `tests/blocks/OxNewsletter.test.tsx` rather than by curl, the same
reasoning `S4d.md` §9 already recorded for the brand carousel's own markup.
