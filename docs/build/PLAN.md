# OptimalX final build: architecture plan (conductor draft v1, 2026-09-17)

Goal: ship the deployment-ready OptimalX Salla React theme (Arabic-first, light mode, premium Saudi sports-nutrition identity), the mock catalogue and bookings in the live store, the SEO/AEO/GEO layer, the content, and a clean dependency set. This draft is the conductor's; the planner reviews it against the code and turns it into gated batches.

Inputs: scratchpad/engine-surface.md (2137 lines, all facts cited), scratchpad/design-constraints.md, scratchpad/DIRECTION.md (designer, pending), scratchpad/research/keywords-ar.md, FINAL-catalogue.md + batch-0*.md, FINAL-content.md (pending), BUILD.md.

## 1. Decisions that shape everything

| # | Decision | Why |
|---|---|---|
| D1 | Own layout. Pass `layout={OptimalXLayout}` to `TwilightProvider`; the layout re-composes the engine's tiny MasterLayout tree (Header, main, Footer, SallaOfferModal, SallaLoginModal when logged out, SallaScopes when store.scope) with our Header and Footer. | Header/Footer are not registry keys (engine §10.1); the seam is documented (`chunk-DTWFNS3F.js:1089`). |
| D2 | Keep every engine route; own only the ones we theme (remove the `// @auto-generated` first line). Custom routes added via `app/routes.ts`. | Engine rewrites auto-generated files on every build (§15.5). |
| D3 | Product-type categories are canonical; goal collections are secondary Salla categories; a goal category renders the GoalLanding variant of the listing route, detected by a slug map. No duplicate goal URLs. | SEO-SEM-003 one home per concept; Salla category URLs are the indexable ones. |
| D4 | Locale: whatever `is_multilingual` says. Canonical always equals the served URL (prefix-aware) and self-references; hreflang cluster only when multilingual; x-default = ar. | Engine canonical points at a redirecting URL (§8.7); ENG-005 forbids redirected canonicals. |
| D5 | Home = registered `home:ox-*` blocks with twilight.json defaults, plus a DefaultHome fallback composition when the loader returns no blocks. | Merchant composes the home in the dashboard; a fresh install must still render a full home (deployment-ready). |
| D6 | PDP is ours: a custom ProductPage composed from engine product primitives and salla-* web components, keeping the engine's page config, GTM, hook slots and JSON-LD behaviours. | The conversion page; the engine PDP cannot express the buy zone and the third-column nutrition table. |
| D7 | Product card: `registry.override('product:card', OxProductCard)` before first render (router.tsx). | Registry contract §2.3 (override, resolved once in useMemo). |
| D8 | All new UI strings live in `locales/*.json` under the `ox.` prefix; engine keys are never shadowed (defaultNS is `app`). | §12.3. |
| D9 | Product data convention: parse the spec line `الحصص: N | حجم الحصة: X | الصلاحية: YYYY-MM | الشكل: ...` from `product.description` (first `<p>`), and the first `<table>` as the nutrition table. Never render the raw description HTML unsanitised: sanitize with an allowlist. | P0 #4 decision; description is untrusted UGC per the MCP docs. |
| D10 | Money in JSX via `useMoney().format()`; money in attributes/JSON-LD via raw numbers + "SAR". | §13.3 returns JSX for SAR. |
| D11 | Fonts: self-host Cairo variable (already in public/assets/fonts); tokens define --font-main/--font-ar; the owner switches the dashboard font to custom so the Google link stops (documented in the owner checklist). | BUILD 3.1: never run both. |
| D12 | Dark mode: none. `darkMode` config left as is; dark bands are components with their own tokens. | Owner brief. |
| D13 | Sentry id `optimalx`, single `registerThemeHooks()` call, devtools gated on DEV, twilight.json name/repository/description corrected. | §15.6, §15.7, §15.8. |

## 2. Route map (app/routes)

| URL (locale prefix implied) | File | Status | Notes |
|---|---|---|---|
| `/` | index.tsx | own | Home: engine `Home.loader`; component renders blocks or DefaultHome fallback; head extend: canonical fix, Organization/WebSite/LocalBusiness JSON-LD via head:end hook (site-wide) |
| `/$slug/p$id` | $slug.p$id.tsx | own | ProductPage (ours) with variants: physical, food, digital, codes, group_products, service, booking; head extend: canonical, Service JSON-LD for booking/service, FAQPage when FAQ present |
| `/$slug/c$id` | $slug.c$id.tsx | own | Listing (engine component wrapped): category intro + FAQ from content map; GoalLanding variant when slug in goal map; ItemList + FAQPage JSON-LD; canonical fix |
| `/search` | search.tsx | own | wrapper adds zero-result state; robots noindex |
| `/offers`, `/latest-products`, `/most-sales-products`, `/tags/$id`, `/$slug/tag-$id`, `/brands/$id`, `/$slug/brand-$id` | keep | keep | styled by the same listing CSS; card override applies |
| `/brands` | brands.tsx | keep | styled |
| `/cart` | cart.tsx | own | wraps engine CartPage; trust rows via cart hook slots; canonical noindex |
| `/thankyou/$orderId` | thankyou.$orderId.tsx | own | wraps engine ThankYou with "how to start" block and services nudge; noindex |
| `/account/*` | keep | keep | CustomerLayout styled; noindex |
| `/loyalty`, `/testimonials`, `/pending-orders` | keep | keep | styled |
| `/blog`, `/blog/$slug/a-$id`, categories, tags, author | keep | keep | styled as "guides"; Article JSON-LD via head extend on the single route (own that file) |
| `/$slug/page-$id` | keep | keep | Salla static pages (policies), styled |
| `/services` | services.tsx | new | Services hub: three channel cards linking to the booking/service products; scope panel; FAQ |
| `/branch` | branch.tsx | new | Medina branch page: photo, address, hours (theme settings), map (static image or salla-map), WhatsApp CTA, pickup notes; LocalBusiness JSON-LD |
| `/about` | about.tsx | new | About copy from content (locales) |
| `/contact` | contact.tsx | new | Contact: WhatsApp, phone, email, branch, `salla-contacts` |
| `/tools/converter` | tools.converter.tsx | new | unit converter (client only) |
| `/kitchen-sink` | kitchen-sink.tsx | own | dev only, every component in every state |
| 404 | __root.tsx notFoundComponent | own | designed 404 with routes out |

## 3. Component map (app/components)

- `layout/`: OptimalXLayout, Header (AnnouncementBar, UtilityBar with delivery promise + language/currency button + SallaLocalizationModal, MainBar with logo/search/account/wishlist/cart, NavBar with goals mega menu and categories from `menu.queries.header()` plus theme config), MobileHeader (compact), MobileDrawer, BottomTabBar, Footer (FooterColumns, TrustLine, PaymentMarks via SallaPayments, SallaSocial, SallaContacts, SallaAppsIcons, VAT block, copyright hook slot), SkipLink.
- `home/`: OxHero, OxTrustStrip, OxGoals, OxCategories, OxProducts (SallaProductsSlider + card), OxServices, OxGuides, OxBranch, OxNewsletter, OxBrands (existing), OxBanner; `register.ts` (registerHomeComponents + registerHomeComponentConfig heights); `DefaultHome.tsx` (fallback composition from twilight.json defaults).
- `product/`: OxProductCard (override), ProductPage, BuyZone (gallery, title block, price, badges, spec chips, options, SupplyCalculator, DeliveryPromise, quantity, add to cart, buy now, wishlist/share, trust grid), BelowFold (BoughtTogether, GoalFit, WhyThis, NutritionTable with plain-Arabic column, HowToUse, PrePurchaseInfo, Reviews, Faq, Alternatives), StickyBar, variants (BookingProduct, ServiceProduct, DigitalProduct, GiftCardProduct, BundleProduct), `specLine.ts` (parser), `sanitizeHtml.ts`.
- `listing/`: ListingPage wrapper, CategoryIntro, CategoryFaq, GoalLanding (hero, sub-needs, product grid, FAQ, need-help CTA), ZeroResults, FiltersDrawer styling hooks.
- `pages/`: ServicesHub, ChannelCard, BranchPage, HoursTable, AboutPage, ContactPage, UnitConverter, NotFound, ErrorState, EmptyState.
- `common/`: SectionHeader, Wedge (clip-path band), Icon (sprite), Badge, Chip, Price (JSX money), RiyalIcon, Skeletons per block, Toast styling.
- `seo/`: `jsonld.ts` (organization, website, localBusiness, itemList, faqPage, article, service builders with stable @id), `head.ts` (canonical/hreflang/robots helpers used by withHead extends), `registerHeadHooks.ts` (head:end site-wide JSON-LD).
- `content/`: `goals.ts` (slug map: intro, sub-needs, FAQ keys), `categories.ts` (intro/FAQ keys by slug), `services.ts`, `branch.ts` (from theme settings with fallbacks).

## 4. Styles

- `app/styles/tokens.css`: full --ox-* sheet from DIRECTION (ground, ink, lines, accent + rgb, semantic, graphite band, plate, focus, shadows, radii, spacing, container, z, motion, wedge angle) and --font-main/--font-ar.
- `tailwind.config.cjs`: extend colors with `ox.*` mapped to vars, fontFamily Cairo, keyframes for the motion table, container 1280; keep engine content globs and safelist.
- `app/styles/04-components/*.scss`: header, footer, home-blocks, product (card + PDP), listing/filters, cart, account, blog, pages, forms, buttons, badges, skeletons; each keyed to s-* classes where the engine renders.
- Fonts: `01-settings/fonts.scss` keeps the three Cairo variable subsets; preload the Arabic subset in the root head (links via head hook).

## 5. twilight.json

- Meta: name {ar: اوبتيمال اكس, en: OptimalX}, repository (the owner's GitHub URL placeholder), author_email, description, features aligned with what the theme really offers.
- Settings (new): announcement_text, free_shipping_threshold (default 299), delivery_promise_line, whatsapp_number, branch_hours (textarea), branch_address, cr_number, vat_number, maroof_url, show_bottom_tabbar, show_goal_nav, hero defaults; keep the existing behaviour switches that the engine reads (header_is_sticky, topnav_is_dark=false, footer_is_dark=true, sticky_add_to_cart, show_tags, product_show_breadcrumbs, enable_add_product_toast, slider_background_size) and drop the dead scaffold ones the engine never reads.
- Components: ox-hero, ox-trust-strip, ox-goals, ox-categories, ox-products, ox-services, ox-guides, ox-branch, ox-newsletter, ox-banner, brands; each with is_default true and `value` defaults carrying the mock content (Arabic + English multilanguage where the field allows).

## 6. Data and store writes (conductor, sequential, read-back after each)

1. products_create for OX-001..OX-036 (product), OX-037..040 (food), bundle (group_products), digital, codes, service, 3 bookings; then product_image_add per item (public URLs from the catalogue; flagged for owner replacement); then products_update_propose/apply for metadata_title/description if create ignores them; read back with products_list and compare name/price/type.
2. Categories and brands cannot be created via MCP: hand the owner the exact tree (FINAL-catalogue A) and the CSV; after they exist, assign via products_update (categories ids). Document in docs/owner-checklist.md.
3. Menus: add header menu items (goals, categories, services, guides, branch, about) via menu_items_edit only after categories exist (needs ids); until then the theme nav falls back to its own config links.
4. No branding writes via MCP (font_name corruption); owner repairs in the dashboard.

## 7. SEO/AEO/GEO layer

- Titles/descriptions: engine per route + our extends for custom routes; measured lengths (AR 45-55 / 130-150; EN 50-60 / 140-155) enforced by a test over the content map.
- JSON-LD: Organization (+sameAs instagram), WebSite (+SearchAction to /search?q={q}), Store/LocalBusiness (Medina branch, geo 24.46276125,39.653138015, address, openingHours from settings) site-wide at head:end; Product (engine) + our BreadcrumbList when engine breadcrumb absent; ItemList on listings; FAQPage on category, goal, guide and PDP FAQ; Article on blog single; Service on booking/service PDPs; every node with stable @id, single declaration per property (build-time duplicate-key check script).
- robots meta: noindex on search, cart, thankyou, account, kitchen-sink, tags, tools; index everything else.
- `public/llms.txt` describing the store, categories, guides; note that robots.txt and sitemap.xml are platform-served on the custom domain (owner: connect a domain).
- Internal linking: every category page links its children and the three most relevant guides; every guide links two categories and one goal; goal pages link their sub-need categories.

## 8. Quality gates and checks (scripts)

- `pnpm typecheck`, `pnpm test` (vitest: components, spec parser, jsonld builders, i18n key parity ar/en, copy lint: no diacritics U+064B..U+0652, no dialect list, no em-dash across locales and content maps; snippet lengths), `pnpm build`, `pnpm check:jsonld` (token-level duplicate key scan over emitted JSON-LD fixtures).
- G4 drives the built app: `pnpm build && pnpm preview` then chrome-devtools: routes render (home, a PDP, a category, search zero-results, cart, services, branch, 404), 390px and 1440px in RTL, console errors attributable to theme = 0, render-budget probe from mobile-render-budget.md §4 on home + PDP + listing.

## 9. Batches (draft; planner finalises)

| Batch | Scope | Files (owner) | Parallel-safe |
|---|---|---|---|
| B0 Foundation | tokens, tailwind, fonts, fixes (D13), layout seam with engine Header/Footer passthrough, seo utilities + head hook, register stubs, i18n scaffolding, deps, scripts, tests infra | tokens.css, tailwind.config.cjs, app/styles/01-*, app/router.tsx, app/routes/__root.tsx, app/server.ts, app/client.tsx, app/hooks/index.tsx, app/components/layout/OptimalXLayout.tsx, app/components/seo/*, app/components/home/register.ts, app/components/product/register.ts, package.json, vitest, tests/setup, twilight.json (meta + settings) | no (first) |
| B1 Header/Footer | all layout components + SCSS | app/components/layout/*, app/styles/04-components/header.scss, footer.scss, locales ox.header.*, ox.footer.* | yes |
| B2 Home | ox blocks, DefaultHome, twilight.json components, home route | app/components/home/*, app/routes/index.tsx, twilight.json components[], home-blocks.scss, locales ox.home.* | yes |
| B3 PDP | ProductPage + variants + card override | app/components/product/*, app/routes/$slug.p$id.tsx, product.scss, locales ox.pdp.*, ox.card.* | yes |
| B4 Listing/Goals/Search | wrappers, goal landing, zero results, content maps | app/components/listing/*, app/components/content/*, app/routes/$slug.c$id.tsx, search.tsx, filters.scss, locales ox.listing.*, ox.goal.* | yes |
| B5 Pages | services, branch, about, contact, converter, 404 | app/routes/services.tsx, branch.tsx, about.tsx, contact.tsx, tools.converter.tsx, app/routes.ts, app/components/pages/*, pages.scss, locales ox.pages.* | yes |
| B6 Commerce theming | cart, thank-you, account, blog, static pages SCSS + wrappers | app/routes/cart.tsx, thankyou.$orderId.tsx, blog_.$slug.a-$id.tsx, SCSS files | yes |
| B7 Content | full locales from FINAL-content, guides HTML for the dashboard, category/goal content maps filled | locales/ar.json, locales/en.json, docs/content/* | after B1-B6 (merges keys) |
| B8 Store writes | catalogue + bookings + images via MCP with read-back | none (live store) | conductor |
| B9 Docs | BUILD.md v2, README, deployment runbook, owner checklist, import CSV/XLSX, asset brief | docs/*, BUILD.md, README.md | yes |

Gate mapping: G1 on B0 (deps, sanitizer), B3 (description HTML), B5 (forms); G2 on B1-B6; G3 on all; G4 whole.
