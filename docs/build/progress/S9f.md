# S9f: English product data on /en

Owner (2026-09-24): "in english version, products names and data are appearing in arabic."

Facts established before this batch (conductor brief): the theme itself is correct — the engine sends `accept-language: <locale>` on every storefront API call (`node_modules/@salla.sa/twilight-theme-engine/dist/chunk-3FIWHGCZ.js:93`, confirmed again in this batch at `chunk-O6XXHXC4.js:78/89`, `sharedHeaders()`/`api.hooks.beforeRequest`), and the live Salla API returns a product's translation when the merchant has entered one. Two real gaps:

1. The offline preview's mock (`scripts/serve-store.mjs`) always serves the Arabic snapshot regardless of the request's language, so `/en` in the local preview shows Arabic names/subtitles/descriptions even though the theme asked correctly.
2. The live store (1888890798) has no English product translations entered yet, so even a correctly-configured `/en` shows Arabic there too — Salla is honestly returning "no translation, here is the default".

This batch fixes gap 1 (the preview) and builds, dry-run only, the script that would fix gap 2 (never run with `--apply` in this session).

## Build log

1. Read `scripts/serve-store.mjs`, `scripts/salla-lib.mjs`, `scripts/salla-categories.mjs` (the existing `--apply`/read-back/write-log pattern to copy), `docs/build/owner-checklist.md` items 11/24, `docs/build/offline-preview.md`, `app/content/taxonomy.json`, `locales/en.json` `ox.tax.*`, `docs/build/salla-ids.json`, `docs/build/research/optimalx-catalogue.csv` header and rows, `fixtures/store/products.json` / `product-details.json` / `overlay/categories.json` / `overlay/menus.json` / `overlay/brands.json` shapes, `docs/build/store-write-log.md` (confirms the store has zero categories created so far — `docs/build/taxonomy-ids.json` does not exist).
2. Finding: the brand overlay (`fixtures/store/overlay/brands.json`) already carries only Latin/English brand names (`name`, `label`) — the theme renders `brand.name` in both languages (`app/components/brands/BrandTile.tsx`, `BrandBanner.tsx`, `app/components/listing/BrandsGrid.tsx`). There is no Arabic brand name to overlay away from; `name_ar` exists on the fixture but is never rendered. No brand-overlay code needed; documented instead of built.
3. Finding: CSV quality gate — all 47 SKUs have `name_en`/`subtitle_en`/`description_html_en` (no missing twins). Running `check-copy.mjs`'s rules and `check-claims.mjs`'s rules against every English field found **4** claims-gate failures: OX-021, OX-023, OX-026, OX-035 — each one's `description_html_en` cites a third-party "best-selling"/"best sellers" ranking (NOW/Sporter/iHerb), which trips `check-claims.mjs`'s own `superlative` rule (`best[- ]selling`) even though the claim is about the *supplier's* ranking on another retailer, not a claim OptimalX makes about itself. Per the batch's instruction, these four are excluded from the English overlay/payload (Arabic name kept) rather than editing the CSV's meaning; `gen-products-en.mjs` reports them by SKU every run.
4. Built `scripts/gen-products-en.mjs`, `scripts/lang-overlay.mjs` (pure helpers), `scripts/salla-product-translations.mjs`. Edited `scripts/serve-store.mjs` for the `accept-language`/`?lang=` branch.
5. Tests: `tests/scripts/gen-products-en.test.ts`, `tests/scripts/lang-overlay.test.ts`, `tests/scripts/salla-product-translations.test.ts`.
6. Manual verification: a second `serve-store.mjs` instance on port 5199, curled with and without `accept-language: en` (the running 5178 instance was never restarted).
7. Docs: `docs/build/offline-preview.md` (new "English product data" section), `docs/build/owner-checklist.md` items 11/24 (what is now automated vs. still owner-only).

## Verification (real output, 2026-09-24)

`node scripts/gen-products-en.mjs`:
```
gen-products-en: 47 product(s) in the snapshot, 43 English twin(s) written to fixtures/store/overlay/products.en.json
  excluded by the copy/claims gate (4), Arabic name kept:
    OX-035: [claims:superlative] description: best
    OX-026: [claims:superlative] description: best
    OX-021: [claims:superlative] description: best
    OX-023: [claims:superlative] description: best
```

Second mock instance on port 5199 (the shared 5178/3210 preview was never restarted), `?source=latest`:
- `-H "accept-language: en"` → `"name":"Starter Bundle - OptimalX"`, full English description, subtitle.
- no header / `-H "accept-language: ar"` → unchanged Arabic (`"name":"حزمة البداية - اوبتيمال اكس"`), byte-identical to before this batch.
- `/products/577153873/details -H "accept-language: en"` (OX-021, a gated/excluded SKU) → `"ال-أرجينين 1000 ملجم أقراص - ناو فودز"`, still Arabic, as designed.
- `?source=search&keyword=whey -H "accept-language: en"` → 15 matches, all English names (e.g. `"Gold Standard 100% Whey Protein - Optimum Nutrition"`).
- With `OFFLINE_TAXONOMY=1` on a third instance (port 5198): `/categories` under `accept-language: en` returns all 20 top-level + 5 nested protein-child names in English (`Protein`, `Whey Protein`, …, `Ideal Weight`); `/menus/header` likewise. Arabic unaffected.

`pnpm typecheck` → `tsc --noEmit`, no errors.

`pnpm vitest run` → **113 passed, 1532 passed / 1535 total** on the first pass; the 3 failures (`tests/common/iconbtnAngled.test.ts`, `tests/common/scrollers.test.ts`, `tests/home/posterRow.test.ts`) are unrelated CSS-rule tests that each individually take ~2.6s against a 5s timeout and only fail under full-suite parallel load; re-run in isolation (`pnpm vitest run tests/common/iconbtnAngled.test.ts tests/common/scrollers.test.ts tests/home/posterRow.test.ts`) → **18/18 pass**. None of this batch's files (`lang-overlay.mjs`, `gen-products-en.mjs`, `salla-product-translations.mjs`, `serve-store.mjs`) touch CSS. New suites: `tests/scripts/lang-overlay.test.ts` (16 tests), `tests/scripts/gen-products-en.test.ts` (8 tests), `tests/scripts/salla-product-translations.test.ts` (13 tests) — all pass.

`node scripts/check-copy.mjs fixtures/store/overlay/products.en.json` → `check-copy: 1 file(s), 0 problem(s)`.
`node scripts/check-claims.mjs fixtures/store/overlay/products.en.json` → `check-claims: 1 file(s), 0 problem(s)`.
`node scripts/check-copy.mjs` (default, locale files) → `check-copy: 56 file(s), 0 problem(s)` (unchanged by this batch).
`node scripts/check-claims.mjs` (default) → `check-claims: 56 file(s), 0 problem(s), 4 allowlisted` (the 4 allowlisted findings pre-date this batch).

`node scripts/salla-product-translations.mjs` (dry run, no network call):
```
47 product(s): 43 ready, 0 no CSV twin, 4 gated (copy/claims), 0 no Salla id.
  gated OX-021: [claims:superlative] description: best
  gated OX-023: [claims:superlative] description: best
  gated OX-026: [claims:superlative] description: best
  gated OX-035: [claims:superlative] description: best
Category translations: skipped — docs/build/taxonomy-ids.json not found — the store has not created its categories yet (no category_create entry in docs/build/store-write-log.md); run scripts/salla-categories.mjs --apply first
```
`--apply` was never run this session, per the batch's instruction.

## Deviations

- The exact live Admin API field name for the product's promotional subtitle (`translations.en.subtitle` vs. some other name docs.salla.dev/421122m0 might use) could not be confirmed against that page — this session had no tool access to fetch it. `salla-product-translations.mjs` sends `subtitle`, matching the field name the storefront's own product response already uses (confirmed in `fixtures/store/product-details.json`). Flagged in the script's header comment; verify against the live docs before the conductor ever runs `--apply`.
- Category translations could not be exercised end-to-end against real ids because the store has no categories yet (`docs/build/taxonomy-ids.json` absent); `buildCategoryTranslationPlan`'s "skipped" path is unit-tested with a synthetic ids file instead.
- No brand-overlay code was written (see build log item 2) — the brand names are already language-neutral (Latin), so there was nothing to overlay; this is a finding, not a gap left open.
