# S9a-V2 — the branch visit, part 2: `/branch`, the footer chip, structured data

Builder S9a-V2, 2026-09-24. Direction: `docs/build/VISIT-2026-09-24.md` §3,
§4.4-§4.6. Concurrent with S9a-V1 (`OxBranch.tsx`, `OxBranchBlock.tsx`,
`defaults.ts`, `OxServices.tsx`, `AdvisoryCta.tsx`, `posters.ts`, `_blocks.scss`,
`_b2-home.scss`, `_b7-advisory.scss` — not touched here).

Mid-batch addition from the conductor (owner photograph of the lit orange X
mark on the ribbed wall, slug `mark-wall`, not yet on disk): a masthead band
on `/branch`, gated on the manifest entry, in the S7b contained-band style.
Folded in below.

Progress logged after every step.

## Plan

1. `/branch`: conditional masthead `Band` (S7b style) when
   `STORE_PHOTOS['mark-wall']` exists, else the plain header exactly as
   today; `StoreRating` rail under the lead; `OxBranch` gets the `store-wide`
   photo; new `BranchGallery` (the other four photos); `BranchMap` becomes a
   click-to-load facade; a mobile `VisitStickyBar` on `/branch` and
   `/services`.
2. Footer contact column: the address line plus the `StoreRating` inline
   chip.
3. Structured data: `hasMap` gets a third fallback to `BRANCH_LISTING.listingUrl`;
   a test asserting the graph never carries `aggregateRating`.
4. `Band.tsx`: one additive optional `alt` prop (default `''`, unchanged for
   every existing caller) so the new masthead's photo carries real alt text
   instead of every Band photo being forced decorative.

## Sandbox question (VISIT §4.4 item 3)

Tested with `chrome-headless-shell` over raw CDP (S8f's method): a local HTML
page with
`<iframe sandbox="allow-scripts allow-same-origin allow-popups" src="https://maps.google.com/maps?q=...&output=embed">`
renders the full interactive map (tiles, Arabic POI labels) — screenshot at
`docs/build/progress/visit/branch-map-sandbox-check.png`. The embed's final
document (after its own 301 to `google.com/maps/embed`) carries no
`X-Frame-Options` and no `frame-ancestors` CSP directive, so nothing blocks
framing. **Answer: the sandbox works as specified; kept as-is.**

## Steps

1. Read the brief's cited files plus `Band.tsx`, `Icon.tsx`, `Button.tsx`,
   `content/nav.ts`, `content/services.ts`, `BottomTabBar.tsx` (the
   `STICKY_BODY_CLASS`/`HIDING_BODY_CLASSES` convention), `_rail.scss`,
   `_x-motif.scss`, `PosterCard.tsx`/`BandPhoto.tsx` (the local `<img>`
   srcset pattern this codebase already uses instead of the engine's
   `Image` for manifest photos), `tests/product/StickyBar.test.tsx` (the
   IntersectionObserver test convention).
2. Ran the sandbox test (see above) before writing `BranchMap`, so the
   component ships the answer rather than a guess.
3. `BranchGallery.tsx` (new): the four photos, two-up grid from 640px, a
   plain scroll-snap rail below it (`.ox-rail` declined — its chevron cue
   and progress strap are carousel machinery four static tiles do not need,
   and the brief names the plain fallback explicitly), `<figure>`/
   `<figcaption>` per tile (empty `alt`, the caption is the accessible
   label), the first tile's `<figure>` carries `ox-x-corner` at the usual
   40/48/64px ladder.
4. `BranchMap.tsx`: rewritten to the click-to-load facade (VISIT §4.4 item
   3) — the storefront photo, the address, the landmark and "عرض الخريطة"
   in the no-key state; a tap swaps it for the sandboxed embed iframe; two
   links always render underneath (`BRANCH_LISTING.directionsUrl`, and
   `google_place_url` -> `branch_map_url` -> `BRANCH_LISTING.listingUrl`).
   The old "neither setting, render nothing" branch is retired: both link
   targets are now always resolvable, so the section never disappears.
5. `VisitStickyBar.tsx` (new): the PDP `StickyBar`'s own
   IntersectionObserver-and-body-class contract, driven by a
   `document.querySelector(anchorSelector)` string rather than a `ref`
   (its anchor lives in a sibling component on `/branch`, and inside a
   different builder's file, `OxServices.tsx`'s `OfferStrip`, on
   `/services`; querying by the existing `data-testid` avoids new wrapper
   divs that would have broken `.ox-page--bleed`'s direct-child selectors
   on the services page — see Deviation 2). Gated on
   `pathForSku(visit.sku)` resolving a real product, not the channel's own
   `'/services'` fallback (a sticky "book a visit" bar has nothing to do if
   that product does not exist).
6. `BranchPage.tsx`: `OxBranch` now receives `photo={STORE_PHOTOS['store-wide'].photo}`;
   `BranchGallery` mounted between `OxBranch` and `BranchMap`; `VisitStickyBar`
   mounted at the end, anchored on `OxBranch`'s own `data-testid="ox-branch"`
   root (its actions row is the page's first visit-booking control). Did
   NOT add a second `<StoreRating>` under the lead — see Deviation 1.
7. Conductor addendum: the masthead. `BranchPage.tsx` now reads
   `(STORE_PHOTOS as Partial<Record<string, StorePhoto>>)['mark-wall']` and
   renders the S7b-style `Band` (photo + scrim + the page's own h1/lead)
   only when it resolves, else the plain header exactly as before — one h1
   either way, verified both ways by test (a mocked, mutable copy of the
   manifest, "stubbing the manifest" per the brief). `Band.tsx` gained the
   additive `alt` prop (Deviation 3) and `_b5-pages.scss` §2 gained
   `.ox-page--branch__band` alongside the services/about/FAQ selectors it
   already carries (same "contained, not bleed" box, since `.ox-page--branch`
   is not `.ox-page--bleed` either).
8. `ServicesHub.tsx`: mounted `VisitStickyBar`, anchored on
   `[data-testid="ox-services-offer"]` (`OxServices`'s own offer strip,
   which carries this page's own "احجز زيارتك" button).
9. `FooterColumns.tsx`: the "customer service" column gained `.ox-footer__contact`
   (the gated `branch_address` line, then the `StoreRating` inline chip)
   after its link list; `_b1-layout.scss` styles it and re-points
   `--ox-ink-4` (the rating's count/stamp colour, not one of the tokens a
   dark band re-declares) to `--ox-ink-3-on-dark`, scoped to the footer only.
10. `registerHeadHooks.tsx`: `branchFromSettings`'s `mapUrl` gained the third
    fallback to `BRANCH_LISTING.listingUrl`; the fixture test
    (`tests/fixtures/jsonld/b5-site-branch.json`) is unaffected since its
    settings already carry `branch_map_url`.
11. Registered the nine new `ox.content.branch.*` keys on the `BRANCH`
    object in `content/branch.ts` (Deviation 4) after `pnpm vitest run
    tests/content` failed `maps.test.ts`'s orphan-key gate: every
    `ox.content.*` key must be reachable from a content map, and my new
    keys were not (the pre-existing `map_alt` key is registered the same
    way as `mapAltKey`). Purely additive: no existing field touched.
12. `locales/partials/s9a-v2.ar.json`/`.en.json`: the nine new keys (four
    gallery captions, the gallery's own label, three map-facade button
    labels, the masthead alt text); "خرائط جوجل" (the transliteration),
    matching `ox.proof.source`/`ox.proof.store_label`, not the direction's
    literal Latin "Google" (Deviation 5). `node scripts/i18n-merge.mjs` run;
    idempotent on a second run.
13. Wrote/extended tests: `BranchGallery.test.tsx` (new), `VisitStickyBar.test.tsx`
    (new, `MockObserver` convention from `tests/product/StickyBar.test.tsx`,
    plus a `vi.doMock`+`resetModules` case for the "gated on the product
    existing" rule), `BranchPage.test.tsx` (the map facade rewritten, the
    masthead band both states via a mutable manifest mock, the gallery/photo/
    sticky-bar smoke tests), `ServicesHub.test.tsx` (+1), `chrome.test.tsx`
    (+1, the footer contact column), `jsonld.test.ts` (+2: the third `hasMap`
    fallback, and the `aggregateRating` assertion the brief named).
14. `tests/common/scrollers.test.ts` (project-wide, not batch-scoped) flagged
    `.ox-branch-gallery__list` (`overflow-x: auto` with no positioned
    containing block, G2/DIRECTION 10.1). Fixed with `position: relative` on
    the rule itself rather than allow-listing the selector — its own
    preferred remedy for a new scroller.

## Verification (final run)

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)

$ pnpm vitest run tests/pages tests/seo tests/layout tests/content
 Test Files  29 passed (29)
      Tests  374 passed (374)

$ pnpm vitest run   (whole suite, one pass)
 Test Files  111 passed (111) *
      Tests  1466 passed (1466) *
* first full-suite run showed 3 failures (2 timeouts, 1 real: the scrollers
  gate above); the two timeouts (tests/common/scrollers.test.ts's "sanity
  floor" test and tests/home/posterRow.test.ts) reproduced as passes in
  isolation immediately after (2.03s and 1.95s respectively) — parallel-run
  load, not a regression. Re-run in isolation confirmed clean; the scrollers
  fix (step 14) was applied and re-verified before this final combined run.

$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 327 file(s) scanned, 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 334 file(s), 0 problem(s)

$ node scripts/check-strings.mjs
check-strings: 346 file(s), 0 problem(s)

$ node scripts/check-copy.mjs
check-copy: 52 file(s), 0 problem(s)

$ node scripts/check-jsonld.mjs tests/fixtures/jsonld/*.json
check-jsonld: 11 file(s), 0 problem(s)

$ node scripts/check-claims.mjs / check-rtl.mjs / check-motion.mjs
all clean (the 4 check-claims "allowlisted" findings are pre-existing,
unrelated to this batch)

$ node scripts/i18n-merge.mjs --check
locales\ar.json: 1447 partial key(s), 0 added, 0 updated
locales\en.json: 1447 partial key(s), 0 added, 0 updated

$ curl -s -o /dev/null -w "http=%{http_code}\n" http://localhost:3210/ar/branch
http=200
(HTML carries "ox-store-rating": 0 — correct, the connected store has none of
 the four google_* settings filled yet, and the gate refuses to render
 without all four; "ox-branch-gallery": 1; "ox-branch-map": 1;
 "ox-visit-sticky": 1; all four gallery captions and both map-button labels
 present in the served text; data-testid="ox-band" absent — correct, no
 mark-wall entry on disk yet)

$ curl -s -o /dev/null -w "http=%{http_code}\n" http://localhost:3210/ar/services
http=200 ("ox-visit-sticky": 1)
```

Screenshots (chrome-headless-shell over raw CDP, S8f's method): `/ar/branch`
at 390 and 1440, `docs/build/progress/visit/branch-390.png` and
`branch-1440.png`. Both read as intended: the gallery's 2-up grid at 1440
with the storefront tile's corner cut visible top-inline-end of the grid
(RTL: physically top-right, matching `ox-x-corner`'s own documented RTL
mapping for its default `$side: end`); the map facade (storefront photo,
"عرض الخريطة", then "الاتجاهات"/"افتح في خرائط جوجل"); no store rating or
masthead band anywhere (both correctly ungated on this store). Headless
shell processes killed after each capture.

## Deviations

1. **No second `<StoreRating>` under the `/branch` lead**, though the brief's
   item 1 names it. V1's `OxBranch.tsx` landed mid-batch already carrying
   `<StoreRating variant="rail" />` unconditionally under its own title
   (VISIT §4.1, shared by home and `/branch`) — rendered immediately below
   the lead/band either way. Adding a second one would have put the
   identical figure on screen twice within one scroll on `/branch` alone.
   Documented in `BranchPage.tsx`'s own doc comment; flagged for the
   conductor to reconcile the two briefs.
2. **`VisitStickyBar` takes a CSS selector, not a `ref`.** A `ref`-based
   anchor (the PDP `StickyBar`'s own contract) would have needed a new
   wrapping element around `OxServices`/`OxBranch` in the mounting pages;
   on `/services` that wrapper would have sat inside `.ox-page--bleed`,
   between it and `.ox-hub__advisory`, breaking the `.ox-page--bleed > *`
   direct-child selectors S7b's own file documents. The selector queries an
   already-rendered, already-tested `data-testid` instead, in a `useEffect`
   that runs after the whole tree commits.
3. **`Band.tsx` gained an additive `alt` prop**, outside this batch's
   original file list. Required by the conductor's masthead addendum ("alt
   text... from a new key"); default `''` keeps every existing caller
   (About, FAQ, Services, KitchenSink) byte-identical.
4. **`content/branch.ts` gained nine new key registrations** on the `BRANCH`
   object, outside this batch's file list. Forced by
   `tests/content/maps.test.ts`'s orphan-key gate, which the verification
   command (`pnpm vitest run tests/pages tests/seo tests/layout tests/content`)
   exercises directly; purely additive, no existing field changed.
5. **"افتح في خرائط جوجل"**, not the brief's literal "افتح في خرائط Google":
   every existing rating string in this theme (`ox.proof.store_label`,
   `.source`, `.lead`, `.cta`, `.aria`) transliterates "جوجل" rather than
   mixing scripts; matched that house convention for the new key.

## Shopify

Not ported this batch (VISIT §7: after the Salla batch lands, W7-D).
