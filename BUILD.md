# OptimalX — Build Specification

**For the implementing model.** This is reference and context, not a cage. It carries the business facts, constraints, decisions already made and the reasoning behind them. Where you see a better structure, better component boundaries, better interaction design or better code than what is described here, build that instead — and say what you changed and why. The parts that are genuinely fixed are marked **HARD**; everything else is a considered starting point.

---

## 0. Verification status — read before building

This spec was written **before** the React theme scaffold and its packages were inspected. Two hard sources have since surfaced and are now authoritative over anything below that contradicts them:

- **`@salla.sa/twilight-theme-engine`** — fully typed surface (336 `.d.ts`), a `HookName` enum of 24 named extension points, 14 typed hooks (`useStore`, `useTheme`, `useUser`, `useMoney`, `useProduct`, `useWishlist`, `useCoupon`, `useGtm`, …), pre-built route exports for product / cart / listing / blog / brands / account / loyalty / thank-you, a component registry for swapping registered components by name, a Vite plugin with virtual modules, and `/tanstack` and `/nextjs` adapters. Its own framing: *a theme is a small app, not a fork of a storefront.*
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
| Brand | OptimalX (اوبتيمال اكس) — Saudi sports nutrition and supplements |
| Store ID | `1888890798` · Salla **Pro** plan · SAR |
| Domain | `salla.sa/optimal-x` (no custom domain yet) |
| Branch | One warehouse + retail store, الخالدية، المدينة المنورة · pickup enabled · COD currently disabled |
| Stack | Salla React theme (SSR + hot reload), pnpm, Salla CLI |
| Market | Saudi Arabia, nationwide shipping, both genders |
| Team | Two owners. One handles nutrition and curation, one handles sales. An operations hire is planned, not present. |

**Services offered:** free selection help (written and remote), a paid monthly nutrition-plan subscription, and in-store help at the branch.

**Positioning:** the store that explains things properly. Narrow curated range, real information, no overselling. Competing against iHerb (trusted, soulless) and local Salla stores (prettier, thinner).

### The constraint that shapes everything

Two people. Any feature costing human minutes per customer does not scale past a few dozen orders a week. **Favour what runs without a person.** Product content, goal navigation, curation and native commerce carry the national business; the humans carry Medina.

The physical store is the underrated asset — a retail space in a city of ~1.5M plus continuous year-round Umrah traffic. The site has two jobs: **drive footfall locally, sell curated products nationally with zero human involvement.**

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
| Health claims in copy | **High** | SFDA regulates supplement claims. Claims vocabulary locked in §5. No outcome promises anywhere, including in imagery. |
| Single point of failure | **High** | One person is advisory, curation and content. Build nothing that assumes daily availability. |
| Fulfilment before ops | **High** | Soft launch, capped catalogue, no paid marketing until the ops hire. Early bad reviews are very hard to undo. |
| Subscription load | Medium | Every subscriber is recurring monthly work for one person. Hard cap the seat count and show it as scarcity. |
| Inventory and expiry | Medium | Narrow range. Near-expiry clearance section turns a liability into a feature. |
| Over-building | Medium | Two non-developers maintain this. Stay close to Salla native. |

---

## 3. Design system

### 3.1 Tokens

`src/styles/tokens.css` is the single source of truth, mapped onto Salla's Twilight CSS variables so native components inherit the brand. Reference by name everywhere else.

**Brand colour is owned by the merchant dashboard, not by CSS.** Verified 2026-09-16 on the live scaffold: Salla writes the merchant's theme settings as an **inline style on `<html>`** — 17 custom properties. Inline styles beat every stylesheet rule, so a `tokens.css` declaration of `--color-primary` loses silently. The orange that renders is the dashboard's, not the file's.

Set the primary colour in **store branding** (`store_branding_get` / `store_branding_update`, section `identity`, field `brand_color`) — *not* theme settings. Verified 2026-09-16: the theme-settings surface carries layout and behaviour only. No colour, no font. One field, it reaches surfaces the theme does not control, and it survives platform changes. A CSS override would need `!important` on five variables maintained indefinitely against a platform that can add a sixth — the wrong trade for a two-person team.

**The theme maps five primary variables, not two:** `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-reverse`, plus `--color-primary-rgb`. An earlier draft of this spec named three and left two undefined.

**Known platform trap — the rgb desync.** Salla's inline style emits the five colour variables but **not** `--color-primary-rgb`. Override brand colour from CSS and the rgb channels survive while the hex is replaced, so the two disagree. `twilight-tailwind-theme/utilities.json` composes `rgba(var(--color-primary-rgb), 0.1)` for `.s-product-options-grid-mode input:checked + div` — the selected-variant highlight then renders a different orange from the button above it. Owning colour in the dashboard avoids this entirely.

**Second trap — `--font-ar`.** `app/styles/app.css` sets `[dir="rtl"] { --font-main: var(--font-ar); }`, and `--font-ar` ships undefined. An undefined `var()` invalidates the whole declaration, so Arabic pages fall back to the browser default font — the normal case, not an edge case. Salla's inline `--font-main` masks it until you override from CSS, at which point the trapdoor opens. **Define `--font-ar`.**

**Verified platform defect — `store_branding_update` mutates fields you did not pass.** 2026-09-16: an update passing **only** `brand_color` silently re-escaped `font_name` from `'Cairo'` to `''Cairo''`, producing an invalid CSS `font-family` and breaking the storefront font. The call returned success (`تم حفظ البيانات بنجاح`); the damage was visible only on read-back. The tool's own description states omitted fields are preserved — they are not; the section is round-tripped and re-serialised.

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

**Radius — adopt the theme's scale.** This spec originally proposed 6 / 10 / 14 / pill. The theme's Tailwind config defines `tiny: 3px`, `DEFAULT: 16px`, `large: 22px`, `big: 40px`, and all 132 native components are built against it. **Use the theme's values.** Overriding them means every native component beside a custom one renders a different corner, and the mismatch appears on pages nobody thought to check. The hierarchy principle survives intact — `tiny` for badges and inputs, `DEFAULT` for cards, `large` for panels, pill for primary actions — only the numbers change.

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

Tighten tracking as size grows — Cairo Bold reads soft at display sizes without it, and with 800 unavailable, tracking is the only lever left. Weight 800 is reserved for a single hero line per page. **HARD:** Arabic body text never below 15px or below weight 400.

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

Custom set, one inline SVG sprite. Derived from the mark: `stroke-linejoin: miter`, `stroke-linecap: square`, 1.8px stroke, one orange fill element per icon. No rounded terminals — that is the generic-wellness tell.

Required: protein · vitamin · mineral · creatine · omega · pre-workout · beauty · daily health · authenticity · shipping · payment · expiry · chat · plan · store · search · account · wishlist · cart · filter · sort · compare · points · gift · referral.

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

---

## 5. Pages

> **Many of these already exist as engine routes.** The scaffold's production build emits routes for cart, loyalty, account (profile, settings, wallet, wishlist, orders, notifications), thankyou, brands, blog (single, tag, category, author), search, offers, tags, testimonials and product listing. Before treating any row below as work, check `app/routes` and mark it **exists / needs theming / needs building**. The list was written before the scaffold was inspected and almost certainly overstates the build.

### V1 — launch

| Page | Notes |
|---|---|
| Home | Three entry paths (goal, category, brand), trust strip, bestsellers, services, brands, guides, branch, newsletter |
| Goal landing ×6 | الطاقة · الصحة العامة · الأداء · التعافي · الشعر والبشرة · الوزن المثالي. Editorial intro, curated products, related guides |
| Category listing | Filters, sort, compare, pagination. **Show a filter group only when ≥5 products sit behind it** |
| Brand page | Brand story, full catalogue for that brand |
| Product detail | §6 |
| Search results | AR/EN synonyms, typo tolerance, zero-result recovery offering categories and the selection service |
| Cart | Free-shipping progress bar, cross-sell, pickup toggle |
| Checkout | **HARD: Salla native. Theme only.** |
| Thank-you | Order summary plus a short "how to start using it" — reduces returns and builds the reorder habit |
| Account: orders | One-tap reorder |
| Account: wishlist | Saved items with restock alerts |
| Branch page | Photography of the space, map, hours, pickup explainer, what to expect |
| Services hub + ×3 | Selection help · nutrition plan · branch visit |
| **Booking page** | §7 |
| Tools hub + ×3 | §8 |
| Guides index + 8 articles | Evergreen, expert-attributed. A fixed set, not a publishing schedule |
| Compare | Up to 4 side by side from listing |
| Policies ×4 | Shipping, returns, privacy (PDPL-aware), terms |
| About | Who you actually are. No invented numbers |
| Contact | Form, WhatsApp, branch |
| 404 and empty states | Designed, in Arabic, with a route out |

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

**Buy zone** — gallery (sticky on desktop, thumbnails, zoom) beside: brand and distributor line · title AR + EN · rating linking to reviews · badges (halal status, bestseller) · price with was-price and savings percentage · servings, amount per serving, expiry · tabby split · size selector updating price · flavour selector with colour swatches · **supply calculator** (scoops per day → days of supply → run-out date) · **delivery estimate with city selector**, showing a named day and pickup availability · quantity · add to cart · buy now · wishlist and share · trust grid.

**Below** — frequently bought together with a real combined saving · goal fit (routing, never a negative verdict — a goal that doesn't fit routes to what does) · why this product · nutrition facts with a **third column explaining what each number means in plain Arabic** · timing · pre-purchase information (allergens, medical referral, framed as information not exclusion) · reviews with photo filter and verified badges · FAQ · alternatives · sticky add-to-cart bar carrying the selected variant.

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

| Tool | Behaviour |
|---|---|
| <span dir="rtl">حاسبة مدة العبوة</span> | Servings ÷ daily dose → days and a run-out date. Lives standalone and inside every PDP |
| <span dir="rtl">محوّل الوحدات</span> | Scoop↔gram, oz↔kg, lb↔kg |
| <span dir="rtl">مقارنة المنتجات</span> | Up to 4: servings, amount per serving, ingredients, price, expiry |
| <span dir="rtl">كم باقي للشحن المجاني</span> | Live in cart against the 299 SAR threshold |

**Deferred:** a daily-protein calculator using published general ranges (1.6–2.2 g/kg), presented as a range with a visible "starting point, not a plan."

**HARD — never build:** BMI, body fat, or any body-composition calculator. Health metrics with a real pathway to reinforcing disordered eating, and no commercial upside. Also no meal-plan generator — that is software performing individualised dietary prescription.

---

## 9. منتجاتك الموصى بها (audited My Plan)

Per §2.1 this is a **recommended product list**, not a health document.

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

- Account panel listing purchased consumables
- For each: purchase date, daily dose the customer sets themselves, estimated remaining, approximate run-out date
- A reorder button that becomes prominent as the estimate approaches zero
- The customer sets the dose. The store never infers it from anything health-related
- Editable and dismissible per item

---

## 11. Loyalty

Salla-native where possible. Design it as purely commercial.

**Earning**

| Action | Points |
|---|---|
| Purchase | 1 per SAR spent |
| First order | 100 bonus |
| Review with photo | 50 |
| Review without photo | 20 |
| Referral, on their first order | 200 |
| Birthday | 100 |

**Redemption:** 100 points = 5 SAR at checkout, minimum 200 points. Points expire after 12 months of account inactivity, shown clearly in the account.

**Tiers** — defer past launch. With a small customer base tiers mostly create an interface promising depth the numbers can't back.

**HARD — the ethical line:** points are earned for **commercial** actions only. Never award points for consuming a product, for streaks, for daily logging, or for any behaviour that ties a reward to how much of a supplement someone takes. Gamifying consumption in this category is how a loyalty programme becomes a harm vector.

**Interface:** balance visible in the account header · earning history · a clear redemption control at checkout · progress to the next redemption threshold, not to a tier.

---

## 12. Trainer referral portal

Distribution at near-zero acquisition cost. Trainers already tell clients what to buy.

- Application form: name, gym, city, contact
- On approval: a unique code, a shareable link, and a simple dashboard showing uses, order value and commission owed
- Commission paid manually at first — do not build payouts before there is volume to justify it
- Codes give the customer a real discount, so the trainer is offering something rather than just tracking
- **HARD:** trainers may not be presented as giving nutrition advice on OptimalX's behalf. They are a referral channel, not practitioners.

---

## 13. Components

Built once in a kitchen-sink route, in every state: default, hover, focus, loading, empty, error, and with the longest Arabic product name in the catalogue.

**Product** — card · price block · servings badge · stock state · expiry line · wishlist toggle · compare checkbox · variant pills · quantity stepper · add-to-cart · supply calculator · delivery estimator · bundle row

**Navigation** — header · mega panel · mobile drawer · breadcrumb · pagination · sticky action bar · skip link · filter group · sort select · active filter chips

**Content** — section header · goal card · category tile · brand plate · article card · trust strip · facts table · FAQ accordion · timeline row · info list

**Social** — review summary · rating bars · review card · photo strip · verified badge

**Service** — service card · booking channel card · slot picker · intake field · confirmation panel · recommendation row · points balance · referral code block

**System** — button set · form field · select · toast · modal · skeleton · empty state · error state · pill · tag

---

## 14. Quality bar

Measured on a mid-range Android over 4G.

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| JS on first load, gzipped | ~180–200 KB of a 356 KB route-split total (measured) — hold, don't grow |
| Render-blocking CSS, gzipped | ~94 KB — platform cost, see note |
| LCP | < 2.5s — **measured 7,459 ms**, see note |
| CLS | < 0.1 — **measured 0.29**, see note |
| Third-party origins | ≤ 2 — **measured 7** |
| Webfont files | 4 (Cairo, subset) |
| Third-party scripts | ≤ 2 |
| Hero image | < 120KB |

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

---

## 16. Build order

**Blocked externally, not by us:** commercial registration, tax number, Maroof; written legal confirmation of advisory scope and who may deliver the nutrition plans.

1. **Foundation** — `tokens.css`, kitchen sink, the full component set, icon sprite
2. **Commerce spine** — PDP, listing, search, cart, account, thank-you
3. **Discovery** — home, goals, categories, brands, guides
4. **Services** — services hub, booking page, branch page, tools
5. **V2** — recommended products, supply tracker, loyalty, trainer portal
6. **Polish** — empty states, 404, policies, QA at 390px and 1440px in RTL on a real device

---

## 17. Working notes

- Screenshot at 390px and 1440px, in RTL, before calling anything done
- **Measure Core Web Vitals against a production build only.** Dev-mode timing reported CLS 0.00 where production measured 0.29 — tuning against `pnpm dev` ships a broken score invisibly
- If the SSR runner starts crashing after a `vite.config.ts` edit, clear `node_modules/.vite` before investigating anything else
- Fill every component with real Arabic content — placeholder text hides RTL bugs
- Prefer deleting code over adding it; two non-developers maintain this after launch
- When a change would touch checkout, cart internals or search, stop and ask
- Reference mockups exist as static HTML build guides. Copy the patterns and the reasoning, not the markup — they use placeholder product graphics and are deliberately simple
- Trust, price and delivery move this business more than design does. A beautiful storefront behind slow fulfilment loses to a plain one that ships on time

---

## 18. Where to improve on this

This spec was written without seeing the React scaffold, so §15 is the weakest part — replace it with what the scaffold actually provides. The component boundaries in §13 are a reasonable first cut, not a schema. The motion table in §3.4 describes intent; if there is a better way to express "confirms what changed without competing for attention," build that.

What should not drift: the items marked **HARD**, the risk mitigations in §2, the accessibility floor in §14, and the principle that this store's advantage is being the one that explains things properly rather than the one that sells hardest.
