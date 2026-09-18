# OptimalX — Build Specification

**For the implementing model.** This is reference and context, not a cage. It carries the business facts, constraints, decisions already made and the reasoning behind them. Where you see a better structure, better component boundaries, better interaction design or better code than what is described here, build that instead — and say what you changed and why. The parts that are genuinely fixed are marked **HARD**; everything else is a considered starting point.

---

## 0. Verification status — read before building

This spec was written **before** the React theme scaffold and its packages were inspected. Two hard sources have since surfaced and are now authoritative over anything below that contradicts them:

- **`@salla.sa/twilight-theme-engine`** — fully typed surface (336 `.d.ts`), a `HookName` enum of 26 named extension points, 14 typed hooks (`useStore`, `useTheme`, `useUser`, `useMoney`, `useProduct`, `useWishlist`, `useCoupon`, `useGtm`, …), pre-built route exports for product / cart / listing / blog / brands / account / loyalty / thank-you, a component registry for swapping registered components by name, a Vite plugin with virtual modules, and `/tanstack` and `/nextjs` adapters. Its own framing: *a theme is a small app, not a fork of a storefront.*
- **`@salla.sa/twilight-components-react`** — **132** enumerable `salla-*` elements, including ~10 loyalty components plus `salla-booking-field`, `salla-datetime-picker`, `salla-bought-together`, `salla-trust-badges`, `salla-delivery-promise`.

**Sections pending verification.** Each describes something to build that a native component may already provide. Do not build these until each has been checked against the component library on three gates — **(a)** does it exist, **(b)** does it do the *specific* job described here, **(c)** does it accept the token system in §3.1. Existence alone is not fit.

| Section | Check against |
|---|---|
| §6 — frequently bought together | `salla-bought-together` |
| §6 — delivery estimate with city selector | `salla-delivery-promise` — note the job here is **Medina-origin honesty** (24h local, 2–3 days Riyadh/Jeddah). A component assuming generic warehouse logic is the wrong tool even though it is the native one |
| §7 — booking slot picker | `salla-booking-field`, `salla-datetime-picker` — must express prayer-time-aware windows and a 12-slot daily cap |
| §11 — loyalty | the ~10 loyalty components, plus the engine's `loyalty` route export. The ethical constraint in §11 holds regardless of which components are used |
| §3.6 — trust surface | `salla-trust-badges` |

**Known gap, not yet specced:** URL and locale routing. §5 lists 22 pages with no locale structure decided. Arabic is a parallel search system rather than a translation layer, so Arabic pages need their own indexable URLs. This is a routing decision the React theme must make early — settle it before page work begins.

---

## 1. Business context

| | |
|---|---|
| Brand | OptimalX (اوبتيمال اكس) — Saudi sports nutrition and supplements. **Live store disagrees (2026-09-16):** name is "Optimal X" with a space, description reads "اوبتيمال اكس للمنتجات الصحية" (health products), store email is empty, WhatsApp is set on the branch but not the store. P0: align. |
| Store ID | `1888890798` · Salla **Pro** plan · SAR |
| Domain | `salla.sa/optimal-x` (no custom domain yet) |
| Branch | One branch "الرئيسي" — type warehouse with POS · الخالدية، المدينة المنورة · pickup and shipping enabled · COD disabled. **Record incomplete:** building number, additional number, short address and district are null; hours are the 00:00–23:59 × 7 default. `salla-order-branch` and `salla-bullet-delivery` render these as-is. P0. |
| Stack | Salla React theme on `@salla.sa/twilight-theme-engine` 1.0.47, pnpm, Salla CLI 3.2.56. **SSR is present but discarded on every page** by an open engine defect — see §15. Do not read "SSR" here as a working capability. |
| Market | Saudi Arabia (`kyc_country: SA`), shipping enabled on the branch, both genders. **Payment and shipping methods are unverified** — no MCP read exposes them. P0: confirm mada, Apple Pay, tabby/tamara and the carriers before §3.6 or §6 promise them. |
| Team | Two owners. One handles nutrition and curation, one handles sales. An operations hire is planned, not present. |

**Services offered:** free selection help (written and remote), a paid monthly nutrition-plan subscription, and in-store help at the branch.

**Positioning:** the store that explains things properly. Narrow curated range, real information, no overselling. *Internal framing — never customer-facing copy:* competing against iHerb (trusted, soulless) and local Salla stores (prettier, thinner). Today the catalogue is one product with no description; "curated range" is intent, not yet fact.

### The constraint that shapes everything

Two people. Any feature costing human minutes per customer does not scale past a few dozen orders a week. **Favour what runs without a person.** Product content, goal navigation, curation and native commerce carry the national business; the humans carry Medina.

The physical store is the underrated asset — a retail space in Medina with year-round Umrah traffic. *(A "~1.5M" population figure stood here uncited. This document is the project's only claims source, so no number appears in it without a source: cite GASTAT or keep it out of copy.)* The site has two jobs: **drive footfall locally, sell curated products nationally with zero human involvement.**

---

## 2. Risk register

### 2.1 My Plan — full audit

The shoppable plan is the strongest retention idea in this project and also the highest-risk feature. Audit first, then the design that survives it.

| Risk | Severity | Detail |
|---|---|---|
| Regulated practice | **High** | Individualised dietary planning is dietetic practice under SCFHS. The practitioner does not currently hold classification. Storing and displaying the plan does not create this risk, but it does create a durable, timestamped record of it. |
| Health data under PDPL | **High** | Goals, weight, dietary restrictions and eating patterns are personal health data, likely treated as sensitive. That brings consent, purpose limitation, retention limits, deletion rights and security obligations — on a two-person team with no security function. |
| Commercial conflict | **High** | A plan written by the party selling the products, with an add-all-to-cart button attached, is a visible conflict of interest. It is the single fastest way to destroy the trust positioning the whole brand rests on. |
| Liability | Medium | A stored plan is evidence of what was advised. If someone is harmed, the record exists and is attributable. |
| Breach exposure | Medium | Health records in a small store's customer area is a disproportionate target relative to the security capability available. |
| Retention | Medium | What happens to a plan when the subscription lapses? Unanswered by default, and PDPL expects an answer. |
| Cross-border | Medium | Where Salla hosts custom customer data determines whether transfer rules apply. Verify before storing anything. |

#### The design that survives the audit

**Split the plan from the basket.** The store holds a **product list**; the dietary plan itself never enters the store.

```
Practitioner writes the plan  →  delivered outside the store (email/PDF/their own tool)
                              →  product list only is pushed to the customer's account
```

Concretely:

- The page is **"منتجاتك الموصى بها"**, not "خطتك الغذائية". It is a saved basket with notes, not a health document.
- **HARD:** store no weight, no body measurements, no medical conditions, no medication, no eating patterns, no lab values. Not in custom fields, not in order notes, not anywhere in Salla.
- Each line carries: product, quantity, a short non-clinical note (<span dir="rtl">«مع الفطور»</span>), and who recommended it.
- Add-all-to-cart works exactly as designed. The commercial value is fully retained.
- A visible line stating the list was prepared as a recommendation and can be changed or removed at any time, with a one-tap delete that actually deletes.
- The practitioner's identity and scope appear on the page — no professional title unless classification is confirmed.

This keeps roughly all of the retention value, removes the health-data storage problem entirely, and reduces the conflict-of-interest problem to something manageable through disclosure.

**Still required before launch:** written legal confirmation of what the subscription may include, and a decision on whether the plans are delivered by a classified practitioner or a partner.

### 2.2 Everything else

| Risk | Severity | Mitigation |
|---|---|---|
| Store not registered | **High** | CR, tax number, Maroof outstanding on a live store. Resolve before any marketing spend. |
| Health claims in copy | **High** | SFDA regulates supplement claims. The banned-claims list is in §4 (HARD). No outcome promises anywhere, including in imagery. |
| Single point of failure | **High** | One person is advisory, curation and content. Build nothing that assumes daily availability. |
| Fulfilment before ops | **High** | Soft launch, capped catalogue, no paid marketing until the ops hire. Early bad reviews are very hard to undo. |
| Subscription load | Medium | Every subscriber is recurring monthly work for one person. Hard cap the seat count and show it as scarcity. |
| Inventory and expiry | Medium | Narrow range. Near-expiry clearance section turns a liability into a feature. |
| Over-building | Medium | Two non-developers maintain this. Stay close to Salla native. |
| **Empty catalogue** | **High** | One product, zero categories, no descriptions, no brands (audited 2026-09-16). Nothing in §5 beyond the PDP can be built or verified against real data. Listing, goal, brand, compare and bestseller surfaces are deferred until ≥ 15 products across ≥ 3 categories exist. |
| Live-store writes corrupt siblings | Medium | `store_branding_update` re-escapes fields it was not passed (`font_name` is `''Cairo''` today). Every MCP write: diff → confirm → write → read back the whole section. Repair only via the dashboard. |
| Branch record incomplete | Medium | National-address fields null; hours defaulted to 24/7. Native components render whatever is there. Owner completes before the branch page ships. |
| Own-store vs marketplace undecided | Medium | Determines whether theme review, the SAR 250 floor and React acceptance matter at all. One owner decision. |

---

## 3. Design system

### 3.1 Tokens

`src/styles/tokens.css` is the single source of truth, mapped onto Salla's Twilight CSS variables so native components inherit the brand. Reference by name everywhere else.

**Brand colour is owned by the merchant dashboard, not by CSS.** Verified 2026-09-16 on the live scaffold: Salla writes the merchant's theme settings as an **inline style on `<html>`** — 17 custom properties. Inline styles beat every stylesheet rule, so a `tokens.css` declaration of `--color-primary` loses silently. The orange that renders is the dashboard's, not the file's.

Set the primary colour in **store branding** (`store_branding_get` / `store_branding_update`, section `identity`, field `brand_color`) — *not* theme settings. Verified 2026-09-16: the theme-settings surface carries layout and behaviour only. No colour, no font. One field, it reaches surfaces the theme does not control, and it survives platform changes. A CSS override would need `!important` on five variables maintained indefinitely against a platform that can add a sixth — the wrong trade for a two-person team.

**The theme maps five primary variables, not two:** `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-reverse`, plus `--color-primary-rgb`. An earlier draft of this spec named three and left two undefined.

**Known platform trap — the rgb desync.** Salla's inline style emits the five colour variables but **not** `--color-primary-rgb`. Override brand colour from CSS and the rgb channels survive while the hex is replaced, so the two disagree. `twilight-tailwind-theme/utilities.json` composes `rgba(var(--color-primary-rgb), 0.1)` for `.s-product-options-grid-mode input:checked + div` — the selected-variant highlight then renders a different orange from the button above it. Owning colour in the dashboard avoids this entirely.

**Second trap — `--font-ar`.** `app/styles/app.css` sets `[dir="rtl"] { --font-main: var(--font-ar); }`, and `--font-ar` ships undefined. An undefined `var()` invalidates the whole declaration, so Arabic pages fall back to the browser default font — the normal case, not an edge case. Salla's inline `--font-main` masks it until you override from CSS, at which point the trapdoor opens. **Define `--font-ar`.**

**Verified platform defect — `store_branding_update` mutates fields you did not pass.** 2026-09-16: an update passing **only** `brand_color` silently re-escaped `font_name` from `'Cairo'` to `''Cairo''`. The call returned success (`تم حفظ البيانات بنجاح`); the damage was visible only on read-back. The tool's own description states omitted fields are preserved — they are not; the section is round-tripped and re-serialised.

**Corrected 2026-09-16 — the storefront is NOT broken by this, and the field is still corrupt.** `store_branding_get` still returns `font_name: "''Cairo''"`, but the rendered storefront is fine: the inline `--font-main` on `<html>` is `Cairo`, `body` computes to `Cairo`, and `document.fonts.check('16px Cairo')` is true. The theme loads the face from `font_url` (clean) and never consumes `font_name` raw, so the corruption is confined to the branding record. An earlier draft of this note claimed it broke the storefront font; measurement says otherwise.

**The real hazard is compounding, not the current state.** Each branding write re-escapes, so the next unrelated update — a logo swap, a social link — takes it to `'''Cairo'''` and onward. Leave it alone, and when it is eventually repaired through the dashboard, read `font_name` back immediately afterwards.

**Consequence for every write in this project:** show the diff, write, then **read back and compare the whole section**. A success response is not evidence of a correct write. Do not attempt a repair with a second write to the same field — re-escaping may compound. Repair through the dashboard.

**Fonts also live in store branding, and there is no off switch.** `font_type: google` with `font_url` pointing at Google Fonts; a `custom_fonts` array is the route to self-hosting. Adding a local `@font-face` *alongside* the injection produced three font files where one would do, with both Google hosts still on the critical path. Either accept the Google injection, or switch `font_type` to a custom upload — do not run both.

So `tokens.css` owns only what Salla does not emit:

```css
:root{
  /* ground */
  --ox-paper:#F7F7F8;        /* page — neutral light, never warm cream */
  --ox-card:#FFFFFF;
  --ox-ink:#17171A;          /* text, dark bands */
  --ox-ink-2:#5A5A61;        /* secondary — AA on paper */
  --ox-ink-3:#8A8A93;        /* tertiary, meta */
  --ox-line:#E6E6E9;
  --ox-line-2:#D2D2D8;

  /* semantic */
  --ox-go:#0F7B4F;  --ox-go-soft:#E8F4EE;      /* in stock, verified, saving */
  --ox-note:#9A6A12; --ox-note-soft:#FBF2E0;   /* attention, low stock */
  --ox-stop:#B3261E; --ox-stop-soft:#FBEAE8;   /* error only */

  /* space — 4px base */
  --ox-1:4px; --ox-2:8px; --ox-3:12px; --ox-4:16px;
  --ox-6:24px; --ox-8:32px; --ox-12:48px; --ox-16:64px;

  /* RTL font trapdoor — must be defined */
  --font-ar:'Cairo', system-ui, sans-serif;
}
```

**Radius — one lever, decided.** `tailwind.config.cjs` → `borderRadius.DEFAULT` drives every bare `rounded` — 78 uses in `app/` and 196 in the engine's dist, because the content globs scan both. It therefore styles Salla's own components too: verified 2026-09-16, changing it moved `s-product-card` and `s-button-element`, and the product-card image went `16px 16px 0 0` → `8px 8px 0 0`. **Shipped value: `DEFAULT: 8px`** (owner decision 2026-09-16; the scale reads 6 / 8 / pill). The scaffold's `tiny: 3px`, `large: 22px`, `big: 40px` have **zero uses** — dead tokens, not a scale. Measured on the live storefront, only four radii render at all: 6px, 8px, 9999px and the card-image top corners.

**Dark mode is already wired** as `darkMode: 'class'`. Decide whether the storefront ships a dark theme before components are written; retrofitting one across a component set is expensive.

**The ground is neutral, not warm.** A clean light grey lets the orange do all the colour work. **Reserve `--ox-accent` for things people can click** — buttons, links, active states, interactive icons. For non-interactive emphasis use weight, size, or ink on card.

### 3.2 Type

One family: **Cairo**, weights 400/600/700/800, subset to Arabic + Latin basic. Latin companion **Archivo** for brand names, units and the wordmark only — Arabic is the voice.

**Available weights are 300 / 400 / 700 only.** Verified 2026-09-16 via `store_branding_get`: `font_type: google`, `font_url: …family=Cairo:wght@300;400;700`. An earlier draft of this spec specified 400 / 600 / 700 / 800 — **600 and 800 are not loaded and fall back silently**, which is very hard to diagnose from the rendered page. The scale below uses only what ships. To get more weights, change `font_url` in store branding or move to a custom font upload (`custom_fonts`), then re-verify.

| Role | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| display | 32–44 | 700 | −0.035em | 1.05 |
| h2 | 24 | 700 | −0.025em | 1.15 |
| h3 | 17 | 700 | normal | 1.4 |
| body | 15 | 400 | normal | 1.7 |
| small | 13 | 400 | normal | 1.6 |
| micro | 11.5 | 700 | normal | 1.5 |

Tighten tracking as size grows — Cairo Bold reads soft at display sizes without it, and with 800 unavailable, tracking is the only lever left. There is no 800 hero weight until `font_url` is changed in store branding and re-verified. **HARD:** Arabic body text never below 15px or below weight 400.

### 3.3 The angle, calibrated for trust

The chevron in the logo is a system: **22° from vertical**, used structurally.

Playfulness comes from irregularity and movement. Trust comes from consistency and precision. Same angle, different discipline:

| Do | Don't |
|---|---|
| One angled band edge per major section | Angles on small elements — badges, buttons, inputs |
| One wedge per screen, large and quiet | Multiple scattered wedges as texture |
| Equal card heights in every row | Staggered heights — this is the playful tell |
| Borders and dividers dead straight | Angled dividers between text blocks |
| Structural geometry at scale | Rotation on anything containing text |

**Revision from earlier exploration:** goal cards are equal height. The uneven rhythm was the single element making the system read playful rather than premium.

**Browse versus buy — HARD.** Heroes, editorial bands, goal pages, the branch page and campaigns carry the angle system. **Listing grids, product pages, cart, checkout and account are conventional**: white cards, equal heights, square corners, no `clip-path`. A grid is scanned by comparing items at the same eye level; by the time someone reaches one the brand is established and what they need is speed.

### 3.4 Motion

Composition carries the energy. Motion confirms that something happened.

| Interaction | Treatment |
|---|---|
| Add to cart | Label → tick, cart count bumps once, toast. 160ms |
| Variant change | Price cross-fade, image swap. 120ms. No layout shift |
| Accordion, filter | Height ease-out 180ms |
| Sticky bar | Slide up when buy button scrolls past. 280ms |
| Card hover | Border colour only. **No lift** — lifts read playful |
| Loading | Skeletons, never spinners |
| Goal selection | The one signature moment. Wedge sweeps, cards settle. Homepage only |
| Scroll reveals | Not used. Templated-build tell and an LCP cost |

**HARD:** `prefers-reduced-motion` honoured on every one, including the signature moment.

### 3.5 Icons

Salla already loads `sallaicons` from its CDN, and every native component expects `sicon-*` names. **Do not ship a second icon system for UI chrome** — search, account, wishlist, cart, filter, sort, share, chevrons all come from `sallaicons`. A second set doubles the font load and leaves native components on one style and custom ones on another.

The custom sprite is for **category and trust icons only** — the ones `sallaicons` does not have: protein · vitamin · mineral · creatine · omega · pre-workout · beauty · daily health · authenticity · expiry · plan · points · gift · referral. One inline SVG sprite, derived from the mark: `stroke-linejoin: miter`, `stroke-linecap: square`, 1.8px stroke, one orange fill element per icon. No rounded terminals — that is the generic-wellness tell.

### 3.6 Trust surface

The brand claim is credibility, so trust is a design system component, not a footer note.

- Commercial registration and tax number in the footer, as text, once registered
- Maroof badge where Saudi shoppers look for it
- Payment marks: mada, Apple Pay, Visa, tabby
- Named branch with a real address and map
- Authenticity statement repeated at product level, not just site level
- Expiry date on every product
- Real review counts, including low ones — a perfect 5.0 across every product reads as fake
- **HARD:** no invented statistics. No "98% success", no "5K+ happy clients", no fabricated years in business. A new business saying it is new is more credible than one inflating itself.

---

## 4. Identity and voice

**Persona:** a knowledgeable local shop. Measured, specific, unhurried, comfortable saying "that's outside what we do." This is a constraint as well as a tone — a brand built on restraint cannot run flash-sale urgency without contradicting itself.

**Write Arabic first.** Arabic is the source language; English is localised from approved Arabic. All strings in `locales/ar.json` and `locales/en.json`. **HARD:** no hardcoded UI text in components.

- One idea per sentence. Short verbs, plain words.
- Be specific about logistics: which city, which day, which branch.
- Light Saudi familiarity in discovery copy (<span dir="rtl">وش هدفك اليوم؟</span>); neutral precision in product facts, policies and warnings.
- Describe what something is and does. Let the reader conclude.
- Vocabulary to build on: <span dir="rtl">هدف · اختيار · دعم · أداء · روتين · تعافي · الحياة اليومية · ثقة</span>

**HARD — needs owner sign-off before shipping:** any claim about health outcomes, treatment or results; any professional title (<span dir="rtl">صيدلي · أخصائي تغذية</span>) unless classification is confirmed; anything that diagnoses, interprets tests, or promises an outcome.

**HARD — banned in any customer-facing copy, image or alt text** (the list §2.2 refers to; SFDA and SCFHS backing in `salla-saudi-market`):

- Treatment, cure, disease or symptom language — <span dir="rtl">يعالج · يشفي · يقضي على</span> and equivalents
- Outcome promises and percentages — "lose X kg", "98% saw results", "guaranteed"
- Weight-loss, fat-burning or muscle-gain promises attached to a product
- Any professional title — <span dir="rtl">أخصائي · صيدلي · طبيب · مدرب معتمد</span> — without documented classification
- Diagnosis, interpretation of tests, or individualised prescription
- Invented statistics of any kind: customer counts, satisfaction rates, years in business
- Comparative claims naming a competitor

The medical disclaimer in §7 (<span dir="rtl">«للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.»</span>) is a placeholder until a Saudi lawyer confirms its wording.

---

## 5. Pages

> **Many of these already exist as engine routes.** The scaffold's production build emits routes for cart, loyalty, account (profile, settings, wallet, wishlist, orders, notifications), thankyou, brands, blog (single, tag, category, author), search, offers, tags, testimonials and product listing. Before treating any row below as work, check `app/routes` and mark it **exists / needs theming / needs building**. The list was written before the scaffold was inspected and almost certainly overstates the build.

### V1 — launch

**Audited 2026-09-16 against the engine's route exports and the live catalogue (1 product, 0 categories).** Status: **exists** = engine route, theme it · **build** = custom page · **defer** = right idea, no data yet, trigger named.

| Page | Status | Notes |
|---|---|---|
| Home | exists | `routes/home`. Goal/category/brand entry paths **defer** until catalogue ≥ 15 products / 3 categories; trust strip blocked by P0 registration; bestsellers defer |
| Goal landing ×6 | **defer** | الطاقة · الصحة العامة · الأداء · التعافي · الشعر والبشرة · الوزن المثالي. Trigger: catalogue ≥ 15 products across ≥ 3 categories. Nothing to curate before that |
| Category listing | exists | `routes/product-listing`. Filters via `salla-filters`. **Show a filter group only when ≥5 products sit behind it** — today that is zero groups |
| Brand page | exists / **defer** | `routes/brands`. No brand on any product yet |
| Product detail | exists | `routes/product`. §6 — the one page the current data supports |
| Search results | exists | `routes/search`. **Synonyms and typo tolerance are the platform's search engine, not theme work.** The zero-result recovery state is yours |
| Cart | exists | `routes/cart`. Free-shipping progress is native (`FreeShippingBar`); cross-sell via `salla-bought-together` |
| Checkout | exists | **HARD: Salla native. Theme only.** |
| Thank-you | exists | `routes/thank-you`. Add the "how to start using it" block |
| Account: orders | exists | `routes/account/orders`. Reorder is native |
| Account: wishlist | exists | `salla-wishlist-actions`; restock alerts via `notify_availability` |
| Branch page | **build** | Gated on P0: national address fields and real hours are null/default today, and `salla-order-branch` will print whatever is there |
| Services hub + ×3 | **build / defer** | Hub can ship; the three services defer on legal (P0 #9) |
| **Booking page** | **defer** | §7. Booking products exist; slot grid is dashboard config; intake fields gated on legal |
| Tools hub + ×3 | **build / defer** | §8. Unit converter ships; supply calculator and compare gated on the product-data convention (P0 #4) |
| Guides index + 8 articles | exists | `routes/blog`. Content is the work, not the page |
| Compare | **defer** | Trigger: ≥ 2 products with comparable data |
| Policies ×4 | exists | Salla pages (`routes/page`). PDPL-aware privacy text needs legal review |
| About | exists | Salla page. No invented numbers |
| Contact | exists | Salla page + `salla-contacts`. WhatsApp is set on the branch, not the store — P0 |
| 404 and empty states | **build** | Designed, in Arabic, with a route out. Engine ships `ErrorPage`; theme it |

### V2 — this release

| Page | Notes |
|---|---|
| Account: **منتجاتك الموصى بها** | §9 — the audited My Plan |
| Account: supply tracker | §10 |
| Loyalty | §11 |
| Trainer referral portal | §12 |

### Not built

Community forum (unmoderatable at two people) · BMI and body-fat calculators · meal-plan generators · live chat · countdown timers · viewer counts · spin-to-win.

---

## 6. Product detail page

The conversion page. Reference implementation exists; improve it where you can.

**Native first — audited 2026-09-16.** These exist and are composed, not built: `salla-product-options` (size, flavour, swatches) · `salla-quantity-input` · `salla-add-product-button` · `salla-quick-buy` · `salla-installment` (tabby split) · `salla-delivery-promise` (has a city filter and its own API — verify its config expresses Medina-origin timing before promising a named day) · `salla-wishlist-actions` · `salla-social-share` · `salla-rating-stars` · `salla-trust-badges` · `salla-product-size-guide`.

**Data gate — P0 #4.** `Product` carries `calories` and `weight` only. **There is no field for servings, amount per serving, expiry or nutrition facts.** The supply calculator, the expiry line and the nutrition table cannot be built until the owner picks the carrier (tags convention recommended for launch).

**Buy zone** — gallery (sticky on desktop, thumbnails, zoom) beside: brand and distributor line · title AR + EN · rating linking to reviews · badges (halal status, bestseller) · price with was-price and savings percentage · servings, amount per serving, expiry *(P0 #4)* · tabby split *(native)* · size selector updating price *(native)* · flavour selector with colour swatches *(native)* · **supply calculator** *(P0 #4)* · **delivery estimate with city selector** *(native; verify config)* · quantity *(native)* · add to cart *(native)* · buy now *(native)* · wishlist and share *(native)* · trust grid *(P0 #5, #8)*.

**Below** — frequently bought together *(native: `salla-bought-together`)* · goal fit (routing, never a negative verdict — a goal that doesn't fit routes to what does; every word passes the §4 banned-claims list) · why this product · nutrition facts with a **third column explaining what each number means in plain Arabic** *(P0 #4 for the data)* · timing · pre-purchase information (allergens, medical referral, framed as information not exclusion) · reviews with photo filter and verified badges *(native: `salla-reviews`)* · FAQ *(native: `salla-accordion`)* · alternatives · sticky add-to-cart bar carrying the selected variant.

**HARD:** no per-serving pricing anywhere — removed by owner decision. Serving count carries that comparison instead.

---

## 7. Booking page

Dedicated page, and the entry point for all three service channels.

**Structure**

1. **Hero** — what the service is, who it's for, that it's free.
2. **Scope panel** — positive list of what the service covers. One short closing line: <span dir="rtl">«للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.»</span> No list of exclusions.
3. **Channel selection** — three cards:
   - <span dir="rtl">**سؤال مكتوب**</span> — free, nationwide, reply within 24 working hours. *This is the load-bearing channel.* It scales roughly five times better than calls, needs no scheduling, has no no-shows, and lets the answer be reviewed before sending.
   - <span dir="rtl">**مكالمة مرئية**</span> — 20 minutes, limited slots, 50 SAR credited to the first order. The fee exists to stop no-shows destroying a limited day; it costs a genuine customer nothing.
   - <span dir="rtl">**زيارة الفرع**</span> — Medina, walk-in during opening hours, optional booking.
4. **Slot picker** (calls and booked visits only) — 7-day strip, three two-hour windows arranged around prayer times, Friday starting after Asr. **Twelve slots a day maximum**, not the full opening hours. Twelve hours of bookable time is one person's entire working day.
5. **Intake form** — name, phone, goal, training frequency, dietary preferences, current products, optional photo of product labels, and the question. **HARD: no medication field, no health conditions, no body measurements.**
6. **Confirmation** — summary, what happens next, calendar file, cancellation link.

**Implementation:** Salla Booking Products with custom fields. Cap slots at the product level so overselling is impossible.

---

## 8. Tools

Build once, run forever, no human cost. Almost no Arabic-language equivalents exist.

| Tool | Status | Behaviour |
|---|---|---|
| <span dir="rtl">حاسبة مدة العبوة</span> | **P0 #4** | Servings ÷ daily dose → days and a run-out date. Needs a servings field that `Product` does not have. Lives standalone and inside every PDP once the data convention exists |
| <span dir="rtl">محوّل الوحدات</span> | **build** | Scoop↔gram, oz↔kg, lb↔kg. Pure client-side; ships in launch scope |
| <span dir="rtl">مقارنة المنتجات</span> | **defer** | Up to 4: servings, amount per serving, ingredients, price, expiry. Trigger: ≥ 2 products carrying the P0 #4 convention |
| <span dir="rtl">كم باقي للشحن المجاني</span> | **native** | `FreeShippingBar` reads `free_shipping_maximum_amount` from the store's shipping rule. Do not build; set the 299 SAR rule in the dashboard and theme the bar |

**Deferred:** a daily-protein calculator using published general ranges (1.6–2.2 g/kg), presented as a range with a visible "starting point, not a plan."

**HARD — never build:** BMI, body fat, or any body-composition calculator. Health metrics with a real pathway to reinforcing disordered eating, and no commercial upside. Also no meal-plan generator — that is software performing individualised dietary prescription.

---

## 9. منتجاتك الموصى بها (audited My Plan)

Per §2.1 this is a **recommended product list**, not a health document.

> **Audited 2026-09-16 — this is partner-app work, not theme work.** The engine's `User` type exposes identity and preferences only; there is no custom-field or metadata surface for per-customer records, and a theme cannot run the scheduled job that "automatic deletion 12 months after the subscription ends" requires. This section describes an app with its own backend (`salla-partner-apps`), which also answers §2.1's cross-border question: the data lives where *you* host it. The partner account currently owns zero apps; creating one is a write that needs consent. **Deferred** until that decision. The data model and consent rules below stand as the app's requirements.

**Data model — HARD**

```
recommendation {
  id, customer_id, created_at, created_by (name + role, no protected title),
  status: active | superseded | removed,
  note: short, non-clinical, free text
  items[]: { product_id, variant_id, quantity, note, sort_order }
}
```

Nothing else. No weight, no measurements, no conditions, no medication, no lab values, no eating patterns. If a field feels clinical, it does not belong in this record.

**Page**

- Header: title, who prepared it, date, status
- Item list: image, name, the short note, quantity stepper, remove
- **Add all to cart** — the commercial engine, and it hands straight to the native cart
- Each item links to its PDP
- Superseded lists remain viewable, clearly marked
- Footer: a line stating this is a recommendation the customer can change or remove at any time, with a delete control that genuinely deletes

**Consent and retention**

- Explicit opt-in before the first list is created, in plain Arabic
- Deletion on request, honoured immediately and completely
- Automatic deletion 12 months after the subscription ends
- No sharing with any third party
- Verify where Salla stores custom customer data before storing anything

**Practitioner view** — a simple internal screen to compose a list by searching the catalogue and adding items with notes. No customer health data anywhere in this interface either.

---

## 10. Supply tracker

Passive and on-site. **HARD: no outbound messaging about consumption** — that carries privacy exposure with no upside the on-site version doesn't already give.

> **Audited 2026-09-16 — same finding as §9.** Per-customer state (purchase date, a customer-set dose) needs persistence the theme engine does not provide. Partner-app work; deferred with §9.

- Account panel listing purchased consumables
- For each: purchase date, daily dose the customer sets themselves, estimated remaining, approximate run-out date
- A reorder button that becomes prominent as the estimate approaches zero
- The customer sets the dose. The store never infers it from anything health-related
- Editable and dismissible per item

---

## 11. Loyalty

**Salla-native, full stop.** Audited 2026-09-16: Salla ships a loyalty program — fourteen `salla-loyalty*` / `salla-reward*` components, an engine `loyalty` route, and a data model carrying `points`, `prizes`, `cost_points`, `points_validity_by/value` (expiry) and `birthday`. **It is prize-based, not cash-at-checkout.** The economy below was written before that was known; it is now a *configuration wish-list for the dashboard*, kept only for what the native program can express.

**Earning** — configure in the dashboard, do not build:

| Action | Points | Native? |
|---|---|---|
| Purchase | 1 per SAR spent | yes |
| First order | 100 bonus | verify in dashboard |
| Review with photo / without | 50 / 20 | **unverified** — the program may not expose review triggers; do not promise until confirmed |
| Referral, on their first order | 200 | **unverified** — see §12; the affiliate program is the likelier home |
| Birthday | 100 | yes (`birthday` in the model) |

**Redemption:** prizes with `cost_points`, as the native program defines them — not "100 points = 5 SAR". Points validity is a native setting (`points_validity_*`); set it to 12 months and let the native components display it.

**Tiers** — defer past launch. With a small customer base tiers mostly create an interface promising depth the numbers can't back.

**HARD — the ethical line:** points are earned for **commercial** actions only. Never award points for consuming a product, for streaks, for daily logging, or for any behaviour that ties a reward to how much of a supplement someone takes. Gamifying consumption in this category is how a loyalty programme becomes a harm vector.

**Interface:** balance visible in the account header · earning history · a clear redemption control at checkout · progress to the next redemption threshold, not to a tier.

---

## 12. Trainer referral portal

Distribution at near-zero acquisition cost. Trainers already tell clients what to buy.

> **Audited 2026-09-16 — this is Salla's affiliate program.** The merchant surface already exposes marketers, GMV, opportunity orders and performance (`reports_affiliates`, `reports_affiliates_marketers`, `reports_affiliates_summary`). A trainer is an affiliate with a code. The application form, the code, the link and the dashboard are native; the theme adds at most a landing page and the HARD rule below.

- Application: a Salla page with a form, or the native affiliate sign-up — do not build a portal
- On approval: the affiliate code and link Salla issues; the dashboard Salla provides
- Commission paid manually at first — do not build payouts before there is volume to justify it
- Codes give the customer a real discount, so the trainer is offering something rather than just tracking
- **HARD:** trainers may not be presented as giving nutrition advice on OptimalX's behalf. They are a referral channel, not practitioners.

---

## 13. Components

Built once in a kitchen-sink route, in every state: default, hover, focus, loading, empty, error, and with the longest Arabic product name in the catalogue.

**Audited 2026-09-16 against the 132 native elements.** Most of this list already exists. Build only the remainder; the kitchen-sink route (`app/routes/kitchen-sink.tsx`, dev-gated) is where each custom piece is proven in every state.

**Native — compose, do not build:** product card (`salla-product-card`) · price · stock state (`salla-product-availability`) · wishlist (`salla-wishlist-actions`) · variant pills (`salla-product-options`) · quantity (`salla-quantity-input`) · add-to-cart (`salla-add-product-button`) · delivery estimator (`salla-delivery-promise`) · bundle row (`salla-bought-together`) · header, mega panel, mobile drawer (engine `Header`, `MainMenu`, `salla-menu`) · breadcrumb (`salla-breadcrumb`) · filter group and chips (`salla-filters`) · infinite scroll · review summary, rating bars, review card, verified badge (`salla-reviews`, `salla-rating-stars`) · slot picker (`salla-booking-field`) · points balance and history (`salla-loyalty*`) · modal, drawer, tabs, accordion, tooltip, badge, alert, progress bar, skeletons (all native) · button (`SallaButton`).

**Custom — the genuine remainder:** servings badge and expiry line *(P0 #4)* · compare checkbox *(defer)* · supply calculator *(P0 #4)* · sticky action bar · skip link · section header · goal card *(defer)* · category tile *(defer)* · brand plate *(defer)* · article card · trust strip *(P0 #5, #8)* · facts table with the plain-Arabic third column · timeline row · info list · photo strip · service card · booking channel card · intake field *(legal)* · confirmation panel · empty state · error state · unit converter.

---

## 14. Quality bar

Measured on Slow 4G, 4× CPU throttle, 390×844 — production build only.

**Achievable now, from theme code — gate G4 checks these:**

| Metric | Target |
|---|---|
| INP | < 200 ms |
| JS on first load, gzipped | ~180–200 KB of a ~356 KB route-split total — hold, don't grow |
| Render-blocking CSS, gzipped | ~94 KB — platform cost, hold |
| Webfont files | 3 (Cairo variable, one per unicode subset) — single-sourced, never Google *and* self-hosted |
| Hero image | < 120 KB, a real `<img>` with `fetchpriority="high"`, never a CSS background |
| Third-party origins | 7 is the platform floor (four Salla CDNs, api.salla.dev, Google Fonts, GTM). Add none. |

**Capped by Salla — P2, trigger: engine fix shipped and re-measured:**

| Metric | Target | Measured floor today |
|---|---|---|
| LCP | < 2.5 s | 6,582–7,798 ms (four runs; noise ±600 ms) |
| CLS | < 0.1 | 0.29, invariant |

Both are set by engine 1.0.47 discarding the SSR tree on every page and by server markup being skeleton-only (§15). No theme change moves them meaningfully until Salla ships a fix. Quote the measured floor and attribute the gap; never promise the target.

**"Zero issues" — the testable standard, not the hope:** (1) zero console errors *attributable to theme code* — the engine's #418 is documented and disclosed, never hidden by a placebo fix; (2) every page verified at 390 px and 1440 px in RTL with real Arabic content; (3) every HARD rule mechanically checked — no strings outside `locales/`, logical properties only, 44 px targets, one `h1`, dev routes compiled out; (4) no number quoted without a production build and two measured runs; (5) no live-store write without diff → confirm → write → read back.

**Measured 2026-09-16** against the scaffold at engine `1.0.47`, React 19.2.8, Vite 8.2.2, TanStack Start 1.168.54.

An earlier version of this spec set a `< 40KB custom JS` budget. It was written assuming a Twig theme and is off by roughly 5× before a line of project code exists — gating G4 against it would have failed by construction. Withdrawn.

**What the build actually emits.** Client JS totals ~300 KB gzipped across ~150 chunks, but it is route-split and almost none of it loads on any one page — `ProductDetails` is 2.82 KB, `product-listing` 4.12 KB, `CartSummary` 2.71 KB. The weight sits in the shared base: `vendor-react` 57.37, `chunk-WITIL2MK` 35.85, `vendor-router` 29.78, `index.client` 29.01, `index` 26.22. Realistic first load is **~180–200 KB gzipped plus a few KB of route chunk**. Treat that as the baseline to hold, not a target to hit.

**CSS is the largest single asset, and mostly not yours to fix.** `index-*.css` ships at **771.99 KB raw / 95.76 KB gzipped** as one render-blocking stylesheet. Investigated 2026-09-16: an earlier draft of this spec blamed over-broad Tailwind content-globbing. That was wrong. The config scans the engine's built `dist` plus an 87 KB safe-list of `s-*` class names — the internal classes of the `salla-*` components, which live in shadow DOM and cannot be discovered by scanning your own code. Removing either would strip styling from every native component. The output is ~7,266 rules for 132 components plus a full storefront, which is proportionate rather than bloated.

**Treat it as the platform's cost, not a defect.** The one optional test: comment out the `twilight-theme-engine/dist/**/*.js` content line, rebuild, compare. If the gzip figure barely moves, the safe-list already covers it. If it drops, click through product, cart and account in `salla theme dev` before trusting the result — missing styles appear on pages you did not test. Measure real LCP before spending more effort here.

**Measured 2026-09-16** — production build, Slow 4G, 4× CPU throttle, 390×844. LCP **7,459 ms**, CLS **0.29**, FCP 1,896 ms, TTFB 942 ms (local workerd, not a production edge), 113 requests, 7 third-party origins.

**LCP is an ordering failure, not a slow asset.** The image downloads in 3 ms; **6,307 ms of the 7,459 is load delay**. The LCP element is `DIV.overlay-bg.bg-cover` — a CSS `background-image`, invisible to the preload scanner, so it waits on CSS and layout. It also cannot carry `fetchpriority` or a preload without being restructured. **Make the hero a real `<img>` with `fetchpriority="high"`.** Lazy-loading is not the cause; that check passes. The asset is currently `cdn.salla.network/images/themes/wizard/banners/health-and-fitness.png` — Salla's theme-wizard placeholder, not an OptimalX asset.

**CLS comes from two Salla home blocks** rendering late and pushing content: `s-block--fixed-products` (0.216) and `s-block--store-features` (0.076), shifting between 7,310–8,674 ms. Establish whether these accept reserved height — if not, it is an inherited platform constraint rather than a theme defect, and worth recording as such.

**Dev-mode measurement is worthless here.** The dev server reported CLS **0.00** for the same build that produces 0.29 in production — dev timing hides the shifts entirely. Never tune Core Web Vitals against `pnpm dev`.

**Known trap — stale dep-optimizer hash.** Vite serves pre-bundled deps at `deps_ssr/<name>.js?v=<browserHash>`, and editing `vite.config.ts` rotates that hash. A browser recovers by reloading; the **workerd SSR runner cannot** — it keeps the dead URL and dies. Symptom: `Workers runtime crashed unexpectedly, exit 143` on every request, in both `dev` and `preview`. Fix: `rm -rf node_modules/.vite`. The remedy the error message itself suggests (`optimizeDeps.exclude`) **does not work** — the Cloudflare plugin puts the entry into `include`, and include wins.

**Also observed:** `salla-loyalty`, `salla-quantity-input`, `salla-add-product-button`, `salla-gifting`, `salla-comments`, `salla-file-upload` and `salla-slider` each emit as separate lazy chunks. Native components cost nothing on pages that do not use them — which strengthens the native-first rule in §15 rather than trading against it.

Images through Salla's CDN at render size, lazy-loaded below the fold, `font-display: swap` with a real Arabic fallback stack. Icons as one inline sprite.

**Accessibility — WCAG 2.2 AA, HARD**

- 44px minimum tap targets — steppers and filter chips are where this usually breaks
- Visible focus ring on every interactive element
- `--ox-accent` for large text and UI only; body copy uses ink or ink-2
- Logical properties throughout (`margin-inline-start`, never `margin-left`)
- Directional icons mirrored in RTL
- Western numerals for prices — standard in Saudi e-commerce
- One `h1` per page, real headings, labels bound to inputs
- Any product within three taps of home
- Empty and error states designed, in Arabic, saying what to do next
- Skip link, real landmarks with labels, `aria-hidden` on decorative SVG

---

## 15. Architecture

Follow the React scaffold's own conventions. Keep constant:

- `tokens.css` as the styling entry point, referenced by every component
- Arabic source strings in `locales/ar.json`, English localised from them
- Salla's native language state for switching
- **HARD:** search the component library before building anything. `@salla.sa/twilight-components-react` exposes **132** `salla-*` elements — far more than most of this spec assumes. An earlier version of this line named four of them from memory, which invited hand-building the other 128. **Enumerate the library, don't recall it.** Where a native component exists and fits, style it and let it own its behaviour
- **HARD:** use the engine's `HookName` extension points and typed hooks rather than reimplementing store, user, money, asset or cart state. The engine treats a theme as a small app on top of a storefront, not a fork of one — build with that grain
- **HARD:** checkout, cart logic and the search engine stay Salla's. Theme them only
- Salla Booking Products for anything scheduled

### Open engine defect — SSR is discarded on every page (verified 2026-09-16)

**Every page fails hydration in production.** React throws minified error **#418** and discards the entire server-rendered tree, re-rendering client-side. The storefront is therefore not effectively server-rendered, whatever the SSR pipeline suggests.

**Root cause, in Salla's own `dist`:**

`chunk-QVPMWMPP.js:497` — `hydrateTwilightContext()` reads `router.state?.matches?.[0]`, finds it empty, calls `warnHydrationBail("no root match in router state")` and returns **without populating the client twilight context**. Then `chunk-DTWFNS3F.js:130` seeds `const [isReady] = useState(() => !!settingsData)`, which is now `false` on the client and `true` on the server. `chunk-DTWFNS3F.js:1297` renders `!isReady && <div className="loading-overlay">` as a **conditional child** of `MasterLayout`, so the children array changes shape between server and client.

Confirmed against the SSR HTML: `app-inner` appears once outside `<style>`; `loading-overlay` appears **zero** times outside `<style>`. The server rendered the app, the client renders the overlay.

`warnHydrationBail` is gated behind `import.meta.env?.DEV`, so **production fails silently.** The only symptom a merchant sees is a slow site.

**A red herring to avoid.** The dev hydration diff points at `<style id="twilight-loading">` and Stencil's `data-styles` nodes at the top of `<head>`. That is a mis-binding, not the cause — React 19 makes `<head>` a HostSingleton (`react-dom-client.development.js:4922`), skips non-matching siblings, and **disables the leftover-node throw for tag 27** (`:5358`). Foreign head children cannot raise #418. Adding `href` + `precedence` to the engine's head styles removes the dev warning while React keeps discarding the tree — a placebo. Do not ship it and call it fixed.

**No theme-side fix exists.** `hydrateTwilightContext` and `updateTwilightContext` are not exported from `index.d.ts` or `tanstack.d.ts`; `TwilightProvider` has no `layout` prop. Re-running the engine's `router.options.hydrate` fails structurally — TanStack's dehydrated stream is single-read (`ReadableStream ... already locked to a reader`). Salla's own `salla-hydration.plugin` (auto `suppressHydrationWarning` on `salla-*` JSX) covers the **body only**, is already active here, and does not help. Nothing to upgrade either: engine `1.0.47` is `latest`, and `twilight-components-react 3.0.0-beta.1` is the only version ever published.

**Escalate.** Until Salla fixes it, treat SSR as unavailable and do not attribute LCP work to it.

### A second, independent problem: content is not server-rendered

Even with hydration fixed, the page would still paint late. Of **165 KB** of SSR HTML, only **18.7 KB (11%)** is markup; the rest is the serialized hydration payload. `<main>` is **5.2 KB of skeletons** inside React Suspense boundaries (`<!--$-->`). The hero — the LCP element — appears **zero** times in server markup; its image URL exists only inside the script payload.

That is why the LCP image downloads in **3–5 ms** but is discovered **~5.6–6.3 s** in. It is not a bandwidth or preload-scanner problem; the element does not exist until JS renders it. Fixing hydration is necessary but **not sufficient** to reach the < 2.5 s target.

### Measurement harness — the noise band is wide

Four traces of **identical** production code gave LCP **6,582 / 7,390 / 7,459 / 7,798 ms** — a 1,216 ms spread (~16%). **Any LCP claim under ~1.2 s on this harness is noise.** CLS was invariant at **0.29** across all four, so CLS deltas are trustworthy. Always take at least two runs before and after a change, and quote the spread.

---

## 16. Build order

**Re-sequenced 2026-09-16 against the audit.** Every step names the gate that opens it. Nothing in P2 starts before its trigger.

**Owner decisions first (P0, not build work):** locale/URL structure · own-store or marketplace · the product-data convention for servings/expiry/nutrition · dark mode · registration (CR, VAT, Maroof, store email) · branch address and real hours · store description alignment · payment and shipping methods confirmed · legal ×3 (SCFHS status, subscription scope, PDPL status of intake fields) · repair `font_name` via the dashboard.

| Step | Gate |
|---|---|
| 1. **Foundation** — `tokens.css` (what Salla does not emit), kitchen sink in every state, category-icon sprite | locale/URL and dark mode decided |
| 2. **PDP** — theme the engine route; supply calculator, expiry line, nutrition table | product-data convention decided; ≥ 1 product carrying it |
| 3. **Catalogue entry** (owner, in parallel) | — |
| 4. **Commerce spine** — listing, search zero-result state, cart, account, thank-you: theme the engine routes | ≥ 15 products across ≥ 3 categories |
| 5. **Home** — themed engine route; trust strip; entry paths | step 4; registration complete for the trust strip |
| 6. **Branch, About, Contact, Policies** | branch record complete; description aligned; privacy text legally reviewed |
| 7. **Services hub + written-question channel** | legal clears intake fields; a booking or service product configured |
| 8. **Loyalty and affiliates** — dashboard configuration, native components themed | payment methods confirmed |
| 9. **Goal landings, brand pages, compare, bestsellers** | catalogue ≥ 15 / 3 and brands set |
| 10. **Video-call channel, subscription** | legal cleared; a product mechanism exists |
| 11. **§9 recommended products, §10 supply tracker — as an app** | consent to create a partner app; backend chosen; retention job designed |
| 12. **Performance re-measure** | Salla ships the hydration fix |
| 13. **Marketplace submission** | only if P0 says marketplace, and React acceptance is confirmed |

---

## 17. Working notes

- Screenshot at 390px and 1440px, in RTL, before calling anything done
- **Measure Core Web Vitals against a production build only.** Dev-mode timing reported CLS 0.00 where production measured 0.29 — tuning against `pnpm dev` ships a broken score invisibly
- If the SSR runner starts crashing after a `vite.config.ts` edit, clear `node_modules/.vite` before investigating anything else
- Fill every component with real Arabic content — placeholder text hides RTL bugs
- Prefer deleting code over adding it; two non-developers maintain this after launch
- When a change would touch checkout, cart internals or search, stop and ask
- **Any write to the live store through MCP is a stop-and-ask** — show the diff, get a yes to that specific call, write, read back the whole section. Deletes are never autonomous
- Reference mockups exist as static HTML build guides. Copy the patterns and the reasoning, not the markup — they use placeholder product graphics and are deliberately simple
- Trust, price and delivery move this business more than design does. A beautiful storefront behind slow fulfilment loses to a plain one that ships on time

---

## 18. Where to improve on this

This spec was written without seeing the React scaffold. §15 has since been trued up against the engine; the audit ledger at `docs/audit-2026-09-16-build-spec.md` records what was verified, what changed, and the eleven owner decisions that gate a full rewrite. The component boundaries in §13 are a reasonable first cut, not a schema. The motion table in §3.4 describes intent; if there is a better way to express "confirms what changed without competing for attention," build that.

What should not drift: the items marked **HARD**, the risk mitigations in §2, the accessibility floor in §14, and the principle that this store's advantage is being the one that explains things properly rather than the one that sells hardest.
