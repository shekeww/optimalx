# Audit ledger, BUILD.md as an executable spec

**Standard:** GOV-011 (audit is read-only; verdict + phased findings; remediation is separate)
**Object:** `BUILD.md` (580 lines), treated as a proposal
**Truth sources, in precedence:** live store reads via merchant MCP · shipped packages (`twilight-theme-engine 1.0.47`, `twilight-components 3.0.0-beta.1`) · the `mastermind-salla` skills verified 2026-09-16 · the premium-storefront design library
**Lens:** the owner's vision, premium, globally inspired, easy to use and understand, Saudi-focused; deployment-ready
**Date:** 2026-09-16 · **Baseline:** none (first audit)

---

## Verdict

BUILD.md cannot be executed as a deployment-ready spec as it stands. Its regulatory instincts are sound, the split-the-plan design and the HARD no-health-data rule match verified doctrine word for word, and its platform sections were partly trued up this session. But it describes a store that does not yet exist: one product with no description, zero categories, no brands, an unregistered business (no CR, VAT, Maroof or verification), a branch record missing its national-address fields, and opening hours left at a 24/7 default that Salla's own components will print on the branch page. Of its 22 V1 pages, roughly half already exist as engine routes and need theming rather than building; a third cannot be built or verified against the current catalogue; and the four V2 systems assume per-customer persistence the theme engine does not have, two of them are partner-app work, not theme work. Two performance targets are capped by an open Salla engine defect. The document also carries contradictions from partial updates (it says radius `DEFAULT: 16px` when 8px shipped; it reserves weight 800 for hero lines after establishing 800 is not loaded), points its claims-vocabulary rule at a section that has none, and states uncited statistics inside what is the project's only claims source. **Eleven owner decisions gate a correct rewrite. After them, the honest launch scope is about eight surfaces, six of which are theming of engine routes.**

## What "maximum performance, smoothness, zero issues" can honestly mean here

**Performance, two ceilings, neither yours.** Engine 1.0.47 discards the server-rendered tree on every page (React #418, traced to `hydrateTwilightContext` bailing on an empty router match), and separately, server markup is skeleton-only, 11% of the HTML, hero absent. Measured production floor today: **LCP 6,582–7,798 ms, CLS 0.29.** From theme code you can hold first-load JS at ~180–200 KB, single-source the fonts, serve images at render size, reserve accurate heights, and compile dev surfaces out. You cannot reach LCP < 2.5 s or CLS < 0.1 until Salla ships a fix. The spec should say "the platform's measured ceiling, with the gap attributed," not a number it cannot hit.

**Smoothness** is achievable on the client after hydration. The ~6 s skeleton before first content is Salla's, and the "signature moment" animation in §3.4 would play *after* it, which is why it defers.

**Zero issues, as a testable standard, not a hope:**
1. Zero console errors **attributable to theme code**. The engine's #418 is documented and disclosed, never hidden by a placebo fix.
2. Every page verified at 390 px and 1440 px, in RTL, with real Arabic content.
3. Every HARD rule mechanically checked: no hardcoded strings outside `locales/`, logical properties only, 44 px targets, one `h1`, dev routes compiled out.
4. No number quoted without a production build and two measured runs; anything under ~1.2 s of LCP movement is noise.
5. No live-store write without diff → confirm → write → read back the whole section.

That is what this spec can promise. Anything stronger would be the first defect.

---

## P0, owner actions. Each prepared code-side to one step.

| # | Finding | Evidence | Your action |
|---|---|---|---|
| 1 | **Locale/URL structure undecided.** Every page inherits it; retrofitting is a rebuild. | §0 L24; engine routes carry `/{-$locale}/` | Decide: Arabic at root with `/en`, or `/ar` + `/en`. One answer. |
| 2 | **Own store or marketplace?** Determines whether theme review, the SAR 250 floor and React acceptance matter at all. | `salla-theme-review`, `salla-theme-workflow` | Say which. Both paths are documented. |
| 3 | **Catalogue is one product, zero categories.** Nothing in §5 beyond the PDP can be built or verified. | `products_list` → 1 item, description/brand/sku null; `categories_list` → 0 | Enter ≥ 15 products with Arabic names, descriptions, categories, brands, images. |
| 4 | **No data field for servings, serving size, expiry or nutrition facts.** `Product` carries `calories` and `weight` only. Gates the supply calculator (§6, §8), expiry line (§3.6, §6), nutrition table, compare. | `twilight-theme-engine/dist/types/index.d.ts` L372–440 | Choose the carrier: a tags convention (zero infra, launch-safe), structured description, or an app later. Recommendation: tags. |
| 5 | **Store trades unregistered.** CR, VAT, Maroof, verification and store email are all null. Blocks the §3.6 trust footer and any marketing. | `store_context_get`: `licenses.*` null, `social.maroof` null, `verified: false`, `email: ""` | Complete in the dashboard. |
| 6 | **Branch record incomplete; hours defaulted.** `building_number`, `additional_number`, `short_address`, `district` null; hours 00:00–23:59 × 7. `salla-order-branch` and `salla-bullet-delivery` read and render these. | `store_context_get` branches[0]; component typings | Enter the national address and real hours. 20 min. |
| 7 | **Store description says "المنتجات الصحية"** (health products); spec says sports nutrition. | `store_context_get` `description` | Align one to the other. |
| 8 | **Payment and shipping methods unverified.** No MCP read exposes them; §3.6 payment marks and §6 delivery promise rest on assumption. | `store_context_get` settings return only maintenance/activities; `shipments_list` excluded | Confirm mada, Apple Pay, tabby/tamara and the shipping companies. Record in §1. |
| 9 | **Legal.** (a) SCFHS status of the practitioner, gates every title and §9. (b) Written scope of the subscription. (c) Whether "goal", "training frequency", "dietary preferences" in the §7 intake form are health data under PDPL, if yes, they may not be stored in Salla. | §2.1 L60, L88; §7 L322; `salla-saudi-market` | A lawyer's written answer to all three. |
| 10 | **Dark mode.** `darkMode: 'class'` is wired; retrofitting a component set is expensive. | §3.1; `tailwind.config.cjs` | Ship it or don't, before components are written. |
| 11 | **`font_name` is corrupted** to `''Cairo''`; storefront unaffected but the next branding write compounds it. | `store_branding_get`; §3.1 | Repair in the dashboard, not via MCP. Read back. |

## P1, code and content, in order

1. **Correct the contradictions in BUILD.md.** Radius §3.1 says `DEFAULT: 16px`; 8px shipped this session (`tailwind.config.cjs`). §3.2 reserves weight 800 for hero lines after stating only 300/400/700 load. §2.2 L95 says "claims vocabulary locked in §5", §5 has none; point it at §4 and add a HARD banned-claims list (treatment, cure, disease, outcome percentages, weight-loss promises, professional titles). Mark L42 (competitor framing) and L48 ("~1.5M", "Umrah traffic") as internal-only, never copy. Cross-reference the engine defect from §1 L36.
2. **Add the missing risk rows.** Empty catalogue (High). Branding write corrupts siblings (Medium, mitigation in §3.1). Incomplete branch record (Medium). Own-store vs marketplace undecided (Medium).
3. **Annotate every §5 row** as `exists, theme it` / `build` / `defer (trigger)`. Engine routes already exist for home, product, listing, cart, thank-you, account (orders, wishlist, profile, settings, wallet, notifications), brands, blog, search, offers, tags, testimonials, page. Guides = blog. Policies, About, Contact = Salla pages.
4. **Mark native components as compose-not-build** in §6 and §8: `salla-bought-together`, `salla-delivery-promise` (has a city filter), `salla-installment`, `salla-reviews`, `salla-product-size-guide`, `salla-social-share`, `salla-wishlist-actions`, `FreeShippingBar` (§8 tool 4 is already native).
5. **Restate §9 and §10 as partner-app work.** The engine's `User` type has no custom-field or metadata surface; "automatic deletion after 12 months" needs a scheduled job. Neither is theme scope. Note the partner account currently owns zero apps.
6. **Re-base §11 on Salla's native loyalty program.** It carries points, prizes, `cost_points`, validity/expiry and birthday. Express what the dashboard allows; strike the invented economy. Keep the HARD no-consumption-rewards rule.
7. **Re-base §12 on Salla affiliates.** `reports_affiliates` exposes marketers, GMV and opportunity tracking natively. The application form and dashboard are largely not theme work.
8. **Reduce §13** to what is genuinely custom after the 132-element check.
9. **Split §14** into achievable-now and P2-on-engine-fix; replace "0 bugs" with the five-point testable standard above.
10. **§3.5 icons:** custom sprite for the ~10 category icons only; UI icons (search, account, cart, filter, sort…) from `sallaicons`, which native components already load.
11. **Re-sequence §16** with the gates in the build order below.
12. **Build the PDP**, the one page the current data supports, once P0 #4 is answered.

## P2, scheduled, with triggers

| Item | Trigger |
|---|---|
| LCP < 2.5 s, CLS < 0.1 | Salla fixes `hydrateTwilightContext` **and** home blocks render server-side. Re-measure, two runs. |
| Goal landings ×6, category listing filters, brand pages, compare, bestsellers, frequently-bought-together | Catalogue ≥ 15 products across ≥ 3 categories with brands. |
| §7 video-call channel with 50 SAR credit | Legal clears intake fields; booking product configured in the dashboard (the slot grid lives in the product's `Reservation[]`, not the theme); a credit mechanism (coupon) defined. |
| §9 recommended products, §10 supply tracker | Partner app created (a write, needs consent), backend chosen, PDPL retention job designed. |
| Paid subscription | Legal clears scope; a mechanism exists, no native `subscription`/`recurring` product type. |
| §3.4 signature goal-selection animation | Hydration fixed; otherwise it plays after a 6 s skeleton. |
| Marketplace submission | P0 #2 = marketplace **and** React acceptance confirmed with Salla. |
| Dark mode | P0 #10 = yes. |

## Cleared concerns

| Concern | Evidence |
|---|---|
| Store id, plan, currency, domain | `store_context_get`, 1888890798, pro, SAR, salla.sa/optimal-x |
| Store is live; every write needs confirmation | `type: "live"` |
| COD disabled, pickup enabled | branch `is_cod_available: false`, `pickable: true` |
| §2.1 split-the-plan design | matches `salla-saudi-market` §Regulatory and `salla-mcp-safety` health-data ban verbatim |
| Booking products exist; slot config is dashboard-side | `ProductType` includes `'booking'`; `salla-booking-field` reads `Option.details: Reservation[]` |
| Free-shipping progress is native | `FreeShippingBar`, `free_shipping_maximum_amount` |
| Delivery promise has a city filter | `salla-delivery-promise/delivery-promise-city-filter.d.ts` |
| §3.1 platform facts | inline `<html>` style, five primary vars, rgb desync, `--font-ar`, all measured this session |
| HARD rules that hold | no BMI/body-fat; no health data in Salla; no per-serving pricing; checkout/cart/search stay Salla's; no invented statistics; `prefers-reduced-motion` |
| No orders, reviews or carts yet constrain §3.6 | `store_dashboard_card`, `reviews_list`, `reports_dashboard` all empty |

## Section verdicts

| § | Verdict | One line |
|---|---|---|
| 0 | HOLDS | Correctly names the sources; hook-slot count corrected to 26 |
| 1 | MUST-CHANGE | Name spelling, description, branch reality, SSR caveat, methods unverified |
| 2 | MUST-CHANGE | Sound instincts; four risk rows missing; L95 points at nothing |
| 3.1 | MUST-CHANGE | Radius line stale (16 → 8); otherwise the strongest section |
| 3.2 | MUST-CHANGE | Weight-800 contradiction |
| 3.3 | DEFER | Angle system is decorative against premium evidence; prove it in the kitchen sink at 390 px before committing; "browse vs buy" containment holds |
| 3.4 | DEFER (signature moment) / HOLDS (rest) | Animation after a 6 s skeleton is worse than none |
| 3.5 | MUST-CHANGE | Two icon systems; keep category icons only |
| 3.6 | UNVERIFIABLE | Trust footer blocked by P0 #5; expiry has no field; payment marks unconfirmed |
| 4 | MUST-CHANGE | Needs the banned-claims list it is referenced for |
| 5 | MUST-CHANGE | Half exists, a third has no data |
| 6 | HOLDS with P0 #4 | Native components cover most of it; data convention gates the rest |
| 7 | MUST-CHANGE | Right shape, wrong owner: slots are dashboard config; intake fields need legal |
| 8 | MUST-CHANGE | Tool 4 is native; tools 1 and 3 need P0 #4 |
| 9, 10 | MUST-CHANGE | App work, not theme work |
| 11 | MUST-CHANGE | Re-base on the native program |
| 12 | MUST-CHANGE | Re-base on affiliates |
| 13 | MUST-CHANGE | Reduce to the custom remainder |
| 14 | MUST-CHANGE | Split by reachability; testable "zero issues" |
| 15 | HOLDS | Updated this session |
| 16 | MUST-CHANGE | Re-sequence with gates |
| 17 | HOLDS | Add: any live-store write is a stop-and-ask |

## Remediation outline, the shape of BUILD.md v2

**Principle:** build only what the platform provides and the catalogue can verify; everything else waits on a named trigger.

**Launch scope (after P0):** Home (engine route, themed) · PDP (engine route, themed; supply calculator once P0 #4) · Listing (engine route, themed; filters appear when data supports them) · Cart, checkout, account (engine, themed) · Search (engine; theme the zero-result state) · Branch page (custom, after P0 #6) · About, Contact, Policies (Salla pages) · 404 and empty states. Eight surfaces, two custom.

**Dropped:** custom UI icons (use `sallaicons`) · "AR/EN synonyms, typo tolerance" as theme work (the search engine is Salla's; the zero-result state is yours) · §8 free-shipping tool (native) · §9/§10 as *theme* features (they are app features) · the §3.6 promise "expiry on every product" until a field exists.

**Build order with gates:**

| Step | Gate |
|---|---|
| 1. Decisions P0 #1, #2, #4, #10 | none |
| 2. PDP theming + supply calculator | P0 #4 answered; ≥ 1 product with the convention applied |
| 3. Catalogue entry (parallel, owner) |, |
| 4. Listing, home, cart/account theming | ≥ 15 products, ≥ 3 categories |
| 5. Branch page, About, Contact, Policies | P0 #5, #6, #7 |
| 6. Booking (written-question channel first) | P0 #9(c); booking product configured |
| 7. Loyalty and affiliates, native config | P0 #8 (methods live) |
| 8. §9/§10 as an app | consent to create an app; backend; PDPL retention design |
| 9. Performance re-measure | Salla engine fix shipped |

**Unresolved, neither the audit nor the owner can settle alone:** whether Salla accepts React themes into its marketplace · where Salla physically hosts custom customer data (vendor answer; gates §2.1 cross-border) · whether the native loyalty program exposes review-with-photo and referral earning triggers · whether dietary preferences and training frequency are health data under PDPL.

---

## Provenance

Eight audit slices were planned as independent agents with adversarial refutation. **One completed** (`business-risk`: 24 findings, six live MCP calls, unrefuted, its refuter died). The other seven were audited directly by the orchestrator from: the thirteen `mastermind-salla` skills (verified 2026-09-16), live reads this session (`store_context_get`, `products_list`, `categories_list`), and package typings read for this audit (`ProductType`, the `Product` interface, booking `Reservation`, `salla-delivery-promise`, loyalty interfaces, free-shipping symbols). **No second-agent refutation was performed on those seven.** Findings citing a live read or a typing are marked by that; findings resting on the skills inherit the skills' verification date. This is a known weakness of this ledger and the first thing the next audit should do differently.

## System self-audit, one defect tripped over

**A read-only auditor wrote to the working directory.** During the audit run, a subagent created `tr_dev.json` (0 bytes), `tr_latest.json` and `tr_prod.json` (CDN `NoSuchKey` error bodies) in the repo root, `curl -o` against guessed translation-bundle paths on `cdn.assets.salla.network`, at 18:52. The brief said "do not create any file"; nothing enforced it. Files removed; nothing referenced them.

**Finding (P1, system):** read-only audits are enforced by instruction, not by tooling. The next audit should run auditors in a worktree or with a write-restricted agent type, so a rule that must hold cannot depend on a model remembering it. This is exactly the class of gap GOV-011 says an audit must record when it trips over one.

## Remediation applied, 2026-09-16

P1 items 1–11 were applied to `BUILD.md` the same day, as 25 exact-match edits across three passes, each verified against the file: 19 sections intact, no duplicate headings, no malformed tables, every stale string gone, every inserted marker present once, apostrophes normalised to the document's ASCII convention. P1 item 12, building the PDP, is gated on P0 #4 and was not started. **P0 and P2 are untouched; they are the owner's.** The next audit's findings are deltas against this remediated state, not against the original.
