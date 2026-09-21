# Conductor context — ship program, 2026-09-21

Read this whole file before any work. It is the single source of state for every agent in this program. Your brief names your batch; everything else here is binding context.

## 1. Mandate (owner, verbatim intent)

The website must be absolutely finished and deployment ready within this session: every planned section, page, cover, component, category and content, on desktop and mobile, to the intended and referenced designs (references/, docs/design-target/, docs/build/DIRECTION.md). Plus a global enhancement of content, SEO, AEO and GEO for a persona that matches the Saudi audience, search-optimised on the most searched and most used words, especially those used by top global brands in Saudi Arabia.

## 2. Verified state (2026-09-21 01:00 Cairo)

- Branch `main` (the only branch since 2026-09-21 22:40; the work branch was merged and deleted), pushed. Owner tooling auto-commits staged work with the message `commit_editmsg`; agents never stage or commit.
- Theme: React/Twilight (`@salla.sa/twilight-theme-engine` 1.0.47, TanStack Router). 37 routes, ~175 components, nine stylesheet layers under `app/styles/06-ox/`. 930 tests, five checks (`pnpm check:all`: copy, jsonld, rtl, motion, strings), typecheck and build all green at HEAD.
- Store 1888890798 (optimalx.com.sa): 47 mock products live (ids in `docs/build/salla-ids.json` and the `salla_id` column of `docs/build/research/optimalx-catalogue.csv`), 0 categories, 0 brands, single language (`is_multilingual: false`, Arabic at root, no `/ar` prefix). The live domain runs the Raed theme with an injected skin; the React theme replaces it after Partners review (theme id 1938498306 (Partners; the older 10165682 in docs is stale), `docs/DEPLOY.md`).
- Merchant API write path: none in this session. Partner app 755989931 has `settings: read` only, zero installs, no webhook. Batch S5 builds the token path. `api.salla.dev` answers this machine with a Cloudflare challenge; never call it from this machine for storefront reads; the offline preview exists for that.
- Offline preview: `pnpm preview:offline` serves the theme at http://localhost:3210 over the fixture snapshot (`fixtures/store/*`). **Every direct URL needs `?storeId=1888890798`** on localhost; without it the engine reads the first ASCII path segment as a store username and renders the home for every path. Client-side navigation is unaffected. Both processes are running now; do not restart them.
- Owner-approved binding design: `docs/design-target/pdp-target.png` (PDP identity target), `references/*.png` (page mockups, covers, categories, PDP, about, account, booking, experts, FAQ, navigation, nutrition, shakers), `docs/build/DIRECTION.md` (design system 1 to 10 with amendments), `docs/build/design-constraints.md`.
- Owner's newest imagery: `docs/design-target/Firefly_gpt-image_on category cards, replace the shakers with relevant mockup product of the title, gen 571157.png` (category cards direction) and `docs/design-target/Optimum-Nutrition-Micronized-Creatine-Powder-300-g-ifit-04.webp`. The owner will generate background imagery for the shop-by-brand and CTA/newsletter sections on request; build them so a background image is a one-line swap.
- Open owner-side items are in `docs/build/owner-checklist.md`; content gaps in `docs/content/gaps.md`; the 2026-09-16 audit ledger in `docs/audit-2026-09-16-build-spec.md` (P0 3 catalogue is done; P0 1 locale is Arabic-at-root by the store's own setting).

## 3. Doctrine that binds this program

Claims (GOV-013): the claims source is `docs/build/research/FINAL-claims-source.md`. No customer-facing sentence may state a fact that file does not support. Banned outright: invented statistics (customer counts, satisfaction rates, "number one", "most sold", years in business), health outcomes, disease, treatment, cure, dosage advice beyond the label, professional titles, "official distributor", shipping thresholds as literals (use `{{threshold}}`), payment method names in copy, reply-time promises. The owner's own commit `9d8a70e` rewrote `ox.content.categories.protein.faq_3_a` to "ليس مضراً" (a health-outcome claim): batch S4 proposes a compliant rewrite and reports it; it does not silently revert the owner.

Arabic (SEO-ENG-008): Modern Standard Arabic on every surface; no dialect (never يشتغل، ما فيه، شوي، لازم، مو، تقدر، الإيميل); no diacritics anywhere (`pnpm check:copy` fails on them); Arabic queries researched natively (`docs/build/research/keywords-ar.md`, never a translation table); no English keywords transliterated into copy unless the research shows Saudi buyers use the transliteration (e.g. ماس جينر, بري ورك اوت as a search tag); Arabic-Indic numerals only in editorial copy, Latin in technical/price contexts (the store already uses Latin).

E-commerce search (SEO-ENG-009): category page = unique opening copy that frames the category, stable clean URL, links to top products and child categories, breadcrumb aligned with the taxonomy; Product schema minimum = Product (name, image, description) + Offer (price, priceCurrency, availability) + BreadcrumbList; AggregateRating only where genuine reviews exist; facets `noindex,follow` and canonical to the clean category; pagination self-canonical, never to page 1; internal search results noindex; out-of-stock stays live with `OutOfStock`; category pages that are grids with no words are a defect.

Platform (CLAUDE.md): Salla native components before anything custom; checkout, cart logic and search stay Salla's; Arabic first, all strings in `locales/` (base `locales/ar.json` + `locales/en.json`, batch partials under `locales/partials/`, merged by `pnpm i18n:merge`; `tests/i18n.test.ts` forbids a partial redefining a base value); read back and compare after any MCP write.

Motion (mastermind-motion): compositor-only properties, native-first, reduced-motion honoured; `pnpm check:motion` enforces.

## 4. The taxonomy (owner, 2026-09-21; identical to research/FINAL-catalogue.md section A)

Type categories (root, one per product): بروتين `protein` (parent) · كرياتين `creatine` · ما قبل التمرين `pre-workout` · الأحماض الأمينية `amino-acids` · اوميغا 3 والزيوت `omega-3` · الفيتامينات والمعادن `vitamins-minerals` · الكولاجين والجمال `collagen-beauty` · الصحة اليومية `daily-health` · سناكات وبروتين بار `snacks-bars` · الإكسسوارات `accessories`.

Protein subcategories (under protein): واي بروتين `whey-protein` · واي بروتين ايزوليت `whey-isolate` · بروتين كازين `casein` · بروتين نباتي `plant-protein` · ماس جينر `mass-gainer`.

Utility (root): الحزم `bundles` · الاستشارات والخدمات `services` · المكتبة الرقمية `digital-library` · بطاقات الهدايا `gift-cards`.

Goal collections (secondary, many-to-many): الطاقة `goal-energy` · الصحة العامة `goal-general-health` · الأداء `goal-performance` · التعافي `goal-recovery` · الشعر والبشرة `goal-hair-skin` · الوزن المثالي `goal-ideal-weight` (copy never states an amount or rate of change).

Product membership: the `categories` column per SKU in `docs/build/research/optimalx-catalogue.csv` (and per item in `research/batch-0*.md`). Salla category SEO URL = the slug.

## 5. Batches

The executable plan with file maps, contracts and acceptance criteria is `docs/build/PLAN-ship-2026-09-21.md`. This table is the summary.

| Id | Goal | Owns (files) | Gate |
|---|---|---|---|
| S1 Taxonomy in theme | One content map of the 25 taxonomy nodes (10 type roots, 5 protein children, 4 utility, 6 goals) with AR/EN names, slugs, parents, scopes, per-category SEO title/description/opening copy/FAQ (from keywords-ar.md, claims-bound); runtime resolution slug → Salla category via the engine's categories query with the existing search-link fallback; header menu and mobile drawer built from it (type categories with protein children, goals, utility); category listing renders the opening copy above the grid and its breadcrumb; tests | `app/content/taxonomy*`, `app/components/listing/**`, `app/components/layout/{Header,Drawer,MegaMenu}*`, `locales/partials/tax.*.json`, `tests/listing/**`, `tests/content/**` | G3, G1 (if any user input) |
| S2 Home sections | Shop-by-brand section, CTA + newsletter section, category cards to the owner's new imagery, goal section, icon system: to the designer's direction (G2 brief output), desktop and mobile | `app/components/home/**` (except register parity tests owned jointly), `app/styles/06-ox/_b2-home.scss`, `locales/partials/b2.*.json`, `public/assets/images/**` new files only | G2, G3 |
| S3 SEO/AEO/GEO | Per-route head (title/description with the researched Saudi vocabulary), JSON-LD completeness and correctness (Organization/LocalBusiness with the Medina branch, WebSite + SearchAction, Product + Offer + BreadcrumbList, CollectionPage + ItemList on listings, FAQPage with real Arabic questions per page), robots for facets/search/pagination, canonical audit, alt-text discipline, answer-first blocks for AEO, entity consistency for GEO (sameAs, address, phone +966553524524) | `app/components/seo/**`, `app/components/listing/head.ts`, `tests/seo/**`, `tests/fixtures/jsonld/**`, `locales/partials/seo.*.json` | G3 |
| S4 Content persona | Full sweep of `locales/` for MSA, diacritics, dialect, claims; integrate the researched top-searched terms where they read naturally; brand vocabulary of top global brands as Saudi buyers write them (from research/competitors-*.md and keywords-ar.md); compliant rewrite proposal for the owner's `faq_3_a`; every change listed in `docs/content/changes-2026-09-21.md` for the owner | `locales/**` only (coordinate: S1/S2/S3 add NEW keys in their own partials; S4 edits EXISTING values) | G3 (copy), claims check |
| S5 Store data pipeline | `scripts/salla-auth.mjs` (Custom-Mode OAuth callback on localhost, exchanges code for token with the app's client id/secret from env, stores token in `.salla-token.json` which is gitignored); `scripts/salla-categories.mjs` (creates the tree with SEO slugs, brands from research section B, assigns products by SKU map, idempotent by slug, read-back, appends to `docs/build/store-write-log.md`); runnable from a Vercel sandbox if `api.salla.dev/admin/v2` challenges this IP; runbook `docs/build/store-data-runbook.md` including the dashboard alternative | `scripts/salla-*.mjs`, `docs/build/store-data-runbook.md`, `.gitignore` (one line) | G1 (token handling), G3 |
| S6 Pages completeness | Every route in BUILD.md §5 themed to the references on desktop and mobile: about, contact, services, branch, tools/converter, blog index and article, brands index and brand page, account pages, cart, thank-you, offers, testimonials, tags, search, 404, kitchen-sink hidden in production; fix raw keys, English fallbacks, empty states | `app/components/pages/**`, `app/components/commerce/**`, `app/components/blog/**`, `app/routes/**` (additive), `app/styles/06-ox/_b5-*.scss`, `_b6-*.scss`, `locales/partials/b5.*.json`, `b6.*.json` | G2, G3 |
| S7 Deployment readiness | Conductor + verifier: gates, `docs/DEPLOY.md` walk, twilight.json defaults, build artefact, Partners record, push | all, read-only until the end | G4 |

Ownership is exclusive. If you need a change in a file another batch owns, write the exact change you need into your progress file under "Requests to other batches" and continue; the conductor routes it.

## 6. Working rules for every agent

1. Write progress to `docs/build/progress/<batch>.md` every meaningful step (files touched, decisions, deviations, requests, verification run). It is what survives a session cut.
2. Never `git add`, `git commit`, `git stash`, `git checkout --`, or touch another batch's files.
3. Strings only in `locales/`; new keys go in your partial for both `ar` and `en` AND identically into `locales/ar.json` / `locales/en.json`, inserted once at the end of your batch as a single edit per file. Only the conductor runs `pnpm i18n:merge`. Read `PLAN-ship-2026-09-21.md` §0 for the full rule.
4. While working: targeted suites only (`pnpm vitest run tests/<dir>`); `pnpm typecheck` when a type surface changes. Before reporting done, once: `pnpm test`, `pnpm check:all`, `pnpm build`. Paste the tail of each into the progress file. Six builders share this laptop and one vite server: never start a second preview, never run the full suite in a loop.
5. Verify in the browser where the work is visual: fetch `http://localhost:3210/<path>?storeId=1888890798` (SSR html via curl is acceptable for structure; measurements need a browser: ask the conductor for screenshots if you have no browser tool).
6. No new dependencies. Salla native components first (`@salla.sa/twilight-components-react`, 132 elements; the engine's route exports and hooks).
7. Mobile first: 390 wide is the first viewport, 1440 the second; no horizontal scroll at 390; tap targets 44px; logical CSS properties only.
8. Match the codebase's voice: long-form explanatory comments that say why, measured numbers where a number was measured, tokens from `app/styles/tokens.css` (spacing scale 1,2,3,4,6,8,12,16,24; there is no `--ox-5`).
9. Report in the mastermind-delegation envelope: summary, files, verified-by (commands and results), deviations, requests, open risks, confidence.
