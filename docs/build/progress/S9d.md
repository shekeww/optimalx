# S9d: the starter bundle stops being a product, 2026-09-24

Batch: owner brief 2026-09-24 — "remove حزمة البداية - اوبتيمال اكس from
products, it should be a bundle that includes the products in the package:
واي بروتين وكرياتين وملتي فيتامين". Read first: `app/content/bundles.ts`,
`app/components/product/BelowFold/{Bundle,BundleMembers,FrequentlyBought}.tsx`,
`app/components/product/lib/{productType,variant}.ts`, `ProductPage.tsx`,
`app/components/home/{OxProducts,OxProductsSecondary,OxCategoryRail}.tsx`,
`app/components/listing/{ListingPage,ProductGrid,useNextPage}.tsx`,
`app/components/brands/BrandPage.tsx`, `app/components/product/OxProductCard.tsx`,
`fixtures/store/{products,product-details}.json`, `scripts/serve-store.mjs`,
`docs/build/owner-checklist.md` item 17, `S8g.md`, `S8i.md`.

Written first per the brief's own instruction, then filled in step by step as
each one landed.

---

## 1. The starter bundle: sample → real

`app/content/bundles.ts` already modelled exactly this bundle as
`SAMPLE_BUNDLES[0]` (OX-041, members OX-001/OX-015/OX-028, no discount) —
built earlier so the two below-fold surfaces could be seen working
(`docs/build/progress/S8g.md` item 3). This batch moves that one entry into
`REAL_BUNDLES` verbatim and empties `SAMPLE_BUNDLES`, so it ships with
`SHOW_SAMPLE_BUNDLES` still `false`: `bundlesForProduct`/`companionsForProduct`
already read `REAL_BUNDLES` unconditionally (the `sample` flag only ever
ADDED the sample pool on top), so the starter bundle now offers itself on the
OX-001/OX-015/OX-028 product pages with no flag needed — it is real, not a
preview. `REAL_COMPANION_SETS` stays empty; the brief did not ask for the
"frequently bought" sets to change and none of the owner's three products has
a real companion set defined today.

A new exported lookup, `bundleOfProduct(productId)`, answers the bundle a
product IS (the mirror of `bundlesForProduct`, which answers what a product
may OFFER and deliberately excludes the bundle's own page). It exists for
step 3 below.

**Files.** `app/content/bundles.ts`.

---

## 2. Bundles are not products in a rail or a grid

**The one predicate.** `isBundleProduct` (already private in
`lib/productType.ts`, the same check `productTypeOf`'s bundle branch already
ran: `type === 'group_products'` OR the name's first word is
حزمة/باقة/bundle) is now exported and is the ONLY thing every surface below
filters on — no second, ad-hoc "is this a bundle" test anywhere in this
batch's diff.

**Where it is wired in, and where it is deliberately not:**

| surface | file | excluded? |
|---|---|---|
| "أحدث المنتجات" (home) | `OxProducts.tsx` → `ProductsGridWrapper` (`excludeBundles`, new prop) | yes |
| "العروض" (home, second grid) | `OxProductsSecondary.tsx` | **no** — this is the offers grid |
| category rail (home) | `OxCategoryRail.tsx` | yes |
| category / goal / search / static listings | `ListingPage.tsx` (`displayProducts`) | yes, except `source.type === 'offers'` |
| the offers ROUTE (`/offers`) | `ListingPage.tsx` (`isOffers`) | **no** |
| brand pages | `BrandPage.tsx` (`displayProducts`, always) | yes |
| the PDP's related rail | `Alternatives.tsx` → `ProductsSliderWrapper` (`excludeBundles`, new prop) | yes |
| the bundle PDP itself | `ProductPage.tsx` | n/a — that page IS the bundle |
| the member PDP's bundle card | `Bundle.tsx`/`FrequentlyBought.tsx` | n/a — this is the one surface that MUST show it |

`ProductsGridWrapper` and `ProductsSliderWrapper` both gained one optional,
off-by-default `excludeBundles?: boolean` prop rather than a hard-coded
filter, so every OTHER existing caller (`NotFound.tsx`, `ZeroResults.tsx`,
`KitchenSink.tsx`, `OxProductsSecondary.tsx`) is byte-for-byte unchanged and
keeps offering a bundle exactly as before — only the two callers this batch
touched (`OxProducts.tsx`, `Alternatives.tsx`) turn the flag on.

**The listing count counts what is shown.** `useNextPage` (the "عرض N منتج"
line's own data source) gained the same `{ excludeBundles }` option: it
filters both the loader's FIRST page (`data.products`) and every page `load`
fetches after it, before `loadedCount` is incremented — so a bundle mixed
into a category page's raw API results is never counted as one of the "N"
products shown. `ListingPage.tsx` and `BrandPage.tsx` both pass the same
`excludeBundles` value to `useNextPage` that they use to build the array the
grid actually renders (`displayProducts`), so the two can never disagree.

**Files.** `app/components/product/lib/productType.ts` (`isBundleProduct`
exported), `app/components/blocks/{ProductsGridWrapper,ProductsSliderWrapper}.tsx`,
`app/components/home/{OxProducts,OxCategoryRail}.tsx`,
`app/components/listing/{ListingPage,useNextPage}.tsx`,
`app/components/brands/BrandPage.tsx`, `app/components/product/BelowFold/Alternatives.tsx`.
`OxProductCard.tsx` was READ, not changed: its bundle badge/single-buy-link
branch (S8g item 3) already presents a bundle as a bundle wherever the
predicate lets one through (the offers grid, the offers page, the member's
own bundle card), so it needed no edit.

---

## 3. The bundle PDP's own members: live API first, content map otherwise

`ProductPage.tsx` used to read only `bundleMembers(product)` (the API's own
`consisted_products`, `lib/variant.ts`) for the "what's inside" block. That
field is empty on the live store today (owner-checklist item 17: the create
API could not attach bundle members) and was empty in both fixture files —
so the bundle's own page rendered no member list at all until now.

A new hook, `lib/bundleFallback.ts`'s `useBundleMembers(product, isBundle)`,
tries the API list first and, ONLY when it comes back empty, resolves
`bundleOfProduct(product.id)` from the content map and fetches its
`memberSkus` live through `useCatalogueProducts` (the exact same "selected"
source `Bundle.tsx`'s member card already uses) — so the member list is
always real catalogue data, on the live store today and once the owner
attaches `consisted_products` in the dashboard tomorrow, with no second code
path to keep in sync. `ProductPage.tsx` now calls `useBundleMembers` in place
of the bare function call; nothing else about the bundle composition
(`isService` gating, the supply-calculator exclusion, `BundleMembers.tsx`
itself) changed.

**Files.** `app/content/bundles.ts` (`bundleOfProduct`, new),
`app/components/product/lib/bundleFallback.ts` (new),
`app/components/product/ProductPage.tsx`.

---

## 4. The offline fixture

`fixtures/store/product-details.json`'s entry for `1141798217` gained a
`consisted_products` array shaped the way `lib/variant.ts`'s `bundleMembers`
(and its own unit test, `tests/product/variant.test.ts`) already reads one:
`id`, `name`, `url`, `image: { url }`, `quantity: 1`, one row each for
OX-001, OX-015 and OX-028 — their real id/name/url/image, read straight out
of `fixtures/store/products.json` rather than invented. `products.json`'s own
entry is untouched: it stays a plain `type: "group_products"` product, which
is what `scripts/serve-store.mjs`'s `selected`/`categories`/`latest` sources
already serve verbatim and what `productType.ts`'s bundle check reads.
`scripts/serve-store.mjs` needed no change: `products/{id}/details` already
serves the fixture object verbatim (`ok(found)`), so a field added to the
fixture is a field the route answers with no code change.

**Files.** `fixtures/store/product-details.json`.

---

## Tests (new/changed)

- `tests/product/productType.test.ts` — unchanged; its existing "bundle kind"
  describe block already covers `isBundleProduct`'s two conditions through
  `productTypeOf`, so exporting the function needed no new assertions there.
- `tests/product/bundles.test.tsx` — rewritten where the contract changed:
  `REAL_BUNDLES` now equals the starter bundle (was `[]`); a new
  `REAL_BUNDLES resolves its own productSku and every memberSku to a real
  catalogue id` test (`idForSku` on every SKU); `bundlesForProduct` offers the
  real bundle on its three member pages with the gate SHUT (no `sample`
  needed) and nowhere else across the whole SKU map; the `Bundle` component's
  own describe block: absent for an unrelated product (SHAKER), present for a
  member (WHEY, `OX-001`) with **no `sample` prop** — this is the "the member
  PDP renders the bundle card" case — and the add button still fires the
  bundle's own id, once.
- `tests/product/ProductPage.test.tsx` — new: reads
  `fixtures/store/product-details.json`'s real `1141798217` entry, renders
  `ProductPage` with its own `consisted_products`, and asserts three
  `.ox-bundle__row`s carrying the three real member names — "the bundle PDP
  renders three members from the fixture".
- `tests/home/blocks.test.tsx` (`OxProducts`) — new: a `latest` page mixing an
  ordinary product, the bundle and another ordinary product renders exactly
  the two ordinary cards.
- `tests/home/OxCategoryRail.test.tsx` — new: a bundle mixed into a four-item
  page is dropped and the three ordinary cards remain; a bundle plus ONE
  ordinary product (two raw items, one real product once filtered) hides the
  rail entirely, proving the exclusion runs before the "at least two" gate.
- `tests/listing/ListingPage.test.tsx` — new: a category listing drops the
  bundle from the grid AND the "عرض N منتج" line reads the post-filter count;
  the offers-source listing KEEPS a bundle among its products — "the
  predicate: excluded from rails and grids, included on /offers".
- `tests/brands/BrandPage.test.tsx` — new: a bundle mixed into a brand's
  products is dropped from both the grid and the featured rail.
- `tests/blocks/ProductsSliderWrapper.test.tsx` — new: `excludeBundles` drops
  a bundle from the results and treats a bundle-only page as empty (falls
  through the chain), which is what the PDP's related rail now asks for.

```
$ pnpm vitest run tests/product tests/home tests/listing tests/content
 Test Files  1 failed | 55 passed (56)
      Tests  1 failed | 774 passed (775)
```

The one failure, `ListingPage.test.tsx > ... > every poster is the
unavailable placeholder today`, is **pre-existing and unrelated**: `git log
-- app/content/posters.ts` shows `available: true` on all six entries was
already committed at this session's own starting HEAD (`750f9e5`, "the
owner's six ad covers fill the poster slots as placeholders"), before this
batch touched anything, and this batch's diff never reads or writes
`posters.ts`/`PosterCard.tsx`. Confirmed by re-running the file in isolation
before this batch's own edits existed in scope — same failure, same cause.

## Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean)

$ node scripts/check-strings.mjs
check-strings: 346 file(s), 0 problem(s)

$ node scripts/check-claims.mjs
check-claims: 52 file(s), 0 problem(s), 4 allowlisted
```

## Live preview — what curl could and could not show

`http://localhost:3210` was already running (a `preview-offline.mjs` process
tree: the store-api mock on 5178 as one child, `vite dev` on 3210 as the
other; killing either child's OS process makes the parent's own `exit`
handler `taskkill` BOTH, per that script's own `shutdown()`) and this batch
did not start or stop it, per the brief's own constraint.

- **`/ar` (home) and `/ar/offers`**, both 200. Grepping the served HTML for
  `حزمة البداية` inside `.ox-card-product`: zero occurrences on `/ar` — but
  `/ar` renders ZERO `.ox-card-product` elements at all in its SSR output
  (the home grid's `ProductsGridWrapper` is a client-side `useQuery`, not
  loader-fed; the same pre-existing fact `docs/build/progress/S8g.md`
  recorded for this exact page). So this curl check is honestly satisfied
  (the bundle is absent) but does not, by itself, exercise the exclusion
  code through SSR; `tests/home/blocks.test.tsx`'s new case is what actually
  proves the filter runs. The one hit for `حزمة البداية` on `/ar/offers` is
  prose inside the SHAKER product's OWN description ("...ومدرج ضمن حزمة
  البداية"), not the bundle's card — the bundle itself is not on `/ar/offers`
  today because its `is_on_sale` is `false` in the fixture (the `offers`
  source filters on that flag; `scripts/serve-store.mjs`), a pre-existing
  data fact this batch did not create and should not paper over by inventing
  a sale flag. `tests/listing/ListingPage.test.tsx`'s new "keeps a real
  bundle among the offers listing's own products" case is the deterministic
  proof that the PREDICATE (as opposed to the sale flag) never excludes one
  there.
- **`/ar/p1141798217`**, 200, `.ox-pdp--bundle` present, `.ox-bundle` (the
  member list) absent. The running store-api process loaded
  `product-details.json` into memory at boot, before this batch's fixture
  edit; it does not re-read the file per request, so the SSR render still
  sees an empty `consisted_products` and takes this batch's own fallback path
  (`useCatalogueProducts`, a client-side `useQuery`) — which a plain `curl`
  cannot observe, only a browser after hydration can. Restarting the mock API
  to pick up the new fixture would restart the same process tree as 3210 (see
  above), which the brief forbids. `tests/product/ProductPage.test.tsx`'s new
  case is the substitute proof: it renders the SAME component with the ACTUAL
  fixture object (`consisted_products` included) and asserts the three real
  member names appear as three `.ox-bundle__row`s.

Flagged rather than silently worked around: **the next process that is
allowed to restart the offline preview (or the owner's own dashboard step,
checklist item 17) is what turns this from "proven in tests and correct by
construction" into "also visible in a plain curl".**

## Deviations

1. `SAMPLE_BUNDLES` is emptied rather than deleted as a type/array (see file
   1): kept the exact shape `bundlesForProduct`'s existing code already
   branches on, so that function's own body needed zero lines changed.
2. The curl-based member-count check could not be run against the live
   preview without restarting the forbidden process; substituted with a
   fixture-driven component test (see "Live preview" above).
3. The curl-based offers-page check found the bundle absent for a reason
   this batch did not create (`is_on_sale: false`) rather than the reason the
   brief may have assumed (an exclusion bug); substituted with a
   predicate-only component test that isolates the actual behaviour this
   batch owns.

## Files (all steps)

| file | step |
|---|---|
| `app/content/bundles.ts` | 1, 3 |
| `app/components/product/lib/productType.ts` | 2 (`isBundleProduct` exported) |
| `app/components/product/lib/bundleFallback.ts` (new) | 3 |
| `app/components/product/ProductPage.tsx` | 3 |
| `app/components/blocks/ProductsGridWrapper.tsx` | 2 |
| `app/components/blocks/ProductsSliderWrapper.tsx` | 2 |
| `app/components/home/OxProducts.tsx` | 2 |
| `app/components/home/OxCategoryRail.tsx` | 2 |
| `app/components/listing/ListingPage.tsx` | 2 |
| `app/components/listing/useNextPage.ts` | 2 |
| `app/components/brands/BrandPage.tsx` | 2 |
| `app/components/product/BelowFold/Alternatives.tsx` | 2 |
| `fixtures/store/product-details.json` | 4 |
| `docs/build/owner-checklist.md` (item 17 reworded) | — |
| `tests/product/{bundles.test.tsx,ProductPage.test.tsx}` | 1, 3, 4 |
| `tests/home/{blocks.test.tsx,OxCategoryRail.test.tsx}` | 2 |
| `tests/listing/ListingPage.test.tsx` | 2 |
| `tests/brands/BrandPage.test.tsx` | 2 |
| `tests/blocks/ProductsSliderWrapper.test.tsx` | 2 |
| `docs/build/progress/S9d.md` | this file |

Not edited: `app/components/product/OxProductCard.tsx` (read only — already
correct, S8g item 3); `app/components/product/BelowFold/{Bundle,
BundleMembers,FrequentlyBought}.tsx` (read only — `Bundle.tsx`/
`FrequentlyBought.tsx` already the right surface for the member's own page
and unaffected by this batch); `app/components/home/OxProductsSecondary.tsx`
(read only — deliberately NOT given `excludeBundles`, it is the offers grid);
`scripts/serve-store.mjs` (read only — no field-shape change needed);
`fixtures/store/products.json` (read only — already the correct
`group_products` entry). No git add/commit/push/stash/checkout/reset/clean.
No server started or stopped.
