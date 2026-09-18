---

## 6. Page compositions

How to read this section. Every page is an ordered list of blocks, top to bottom, using the component names from section 5 and the routes from PLAN.md section 2. The two height columns are the reserved height of the block's skeleton at 390 (mobile) and 1440 (desktop), in px, excluding the inter-section gap from 4.2. Kind: F is fixed (the skeleton box equals the final box); C is count-driven (rows times row height, the count known before paint from the page size or the content map, so the final box is still deterministic); U is unknown count (the skeleton reserves the empty-state height and the block sits last in its group so growth pushes nothing that matters). Home block heights are the values register.ts hands to registerHomeComponentConfig. A copy reference such as 1.4 points at FINAL-content.md; "copywriter" plus a key means the line does not exist yet and ships under that locale key. Shared chrome is listed once.

### 6.1 Shared chrome (every route)

| Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|
| AnnouncementBar | 40 | 36 | F | 0 when the setting is empty or the engine advertisement bar is present |
| UtilityBar | 0 | 36 | F | desktop only |
| MainBar / MobileHeader | 56 | 72 | F | 104 on mobile for listing, goal, search and brand routes (the search row) |
| NavBar | 0 | 48 | F | |
| Header total | 96 (144 with the search row) | 192 | | body padding-block-start when the header is sticky |
| BottomTabBar | 56 plus safe area | 0 | F | fixed, out of flow; body padding-block-end 56 below 1024 |
| Footer | 640 | 720 | F | logo 40, columns (4 collapsed groups at 48 / open columns 264), social 48, payments 48, trust badges 48, VAT 56, trust lines 48, copyright 40, padding |
| SkipLink, Toast, Modal, Drawer, StickyBar | 0 | 0 | | out of flow |

### 6.2 Home (/, index.tsx)

The default composition (PLAN D5) when the merchant has configured nothing; the merchant reorders or removes blocks in the dashboard.

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | OxHero | 500 | 560 | F | H1 eyebrow 1.1, headline "ما هدفك اليوم؟", sub-line 1.1, both CTAs 1.1, hero photo 8.1 |
| 2 | OxTrustStrip | 144 | 72 | F | four items 1.3; the panel opens to the definitions and the 1.5 items; zero gap to the hero |
| 3 | OxGoals | 544 | 280 | F | SectionHeader (1.4 Goals) 128 / 120, six GoalCards 2-up in three rows at 128 / 6-up at 160 |
| 4 | OxCategories | 880 | 694 | F | SectionHeader (1.4 Categories); eight CategoryTiles by default (the merchant field accepts 4, 8 or 12 so every row is full) 2-up / 4-up, tile 176 / 275 |
| 5 | OxProducts | 508 | 630 | F | SectionHeader; source latest products with the title "أحدث المنتجات" because 1.4 defers "الأكثر طلبا" until real order data exists; one row of ProductCards at 380 / 510 in the slider |
| 6 | OxBrands | 64 | 80 | F | logo strip on plates, no header; scroller on mobile, eight per row on desktop; hidden under four brands |
| 7 | OxServices | 920 | 480 | F | dark band with the wedge; SectionHeader (1.4 Services) in on-dark roles; three ChannelCards stacked at 220 (icon in the title row on mobile) / in one row |
| 8 | OxGuides | 485 | 556 | C | SectionHeader (1.4 Guides); three GuideCards 355 / 436; hidden when the blog has fewer than three posts |
| 9 | OxBranch | 810 | 480 | F | photo 268 then the address card on mobile; 7/5 split at 480 on desktop; copy 1.4 Branch, hours from settings |
| 10 | OxFaq | 408 | 400 | C | SectionHeader "أسئلة شائعة"; five SallaAccordion rows at 56 including the mandatory price item from section 1; registered as home:ox-faq (the planner adds it to the component map; section 5.4 already depends on it) |
| 11 | OxNewsletter | 320 | 300 | F | plate band, copy 1.4 Newsletter |
| 12 | OxBanner | 0 | 0 | F | optional merchant campaign block, off in the default composition; when on: a 4/3 image at 268 on mobile, a 240 tall full-width band on desktop, one line and one link, straight edges |

Sequence rules: blocks 1 and 2 are the first screen; on mobile block 3 begins at 740 from the top of the page so the goal cards are what the first swipe lands on. Gaps are 48 on mobile and 64 on desktop, except 96 above and below OxServices, above OxBranch and above OxNewsletter (4.2). Mobile page height in the default composition is about 6300 including chrome.

### 6.3 Category listing (/$slug/c$id)

The same composition and CSS serve /offers, /latest-products, /most-sales-products, tag routes and brand routes.

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | 16 under the header |
| 2 | ListingHeader with CategoryIntro | 140 | 120 | F | h1 (the category name), intro paragraph from content/categories.ts (two lines mobile, one desktop), count, sort; the filters trigger on mobile. Brand routes add a 64 logo plate at the start of the title row |
| 3 | Child category chips | 52 | 52 | C | filter-chip scroller of the children (بروتين has five); absent on leaf categories |
| 4 | FiltersRail | drawer | 280 column | F | at the start from 1024; skeleton rows while facets load; the drawer on mobile is out of flow |
| 5 | Product grid | 776 first paint, 380 per row | 894 first paint, 435 per row | C | 24 per page: 12 rows of two / 6 rows of four beside the rail; the skeleton draws two rows and the remaining rows mount at final height as data arrives; the count in block 2 stays blank until the loader answers |
| 6 | LoadMore | 120 | 120 | F | |
| 7 | CategoryFaq | 296 | 288 | C | SectionHeader "أسئلة شائعة" plus three rows from the content map; absent when the map has none |
| 8 | Related guides | 272 | 264 | C | SectionHeader "أدلة ذات صلة" plus three 48 link rows (PLAN 7: every category links three guides); rows rather than cards because listing is a buy page |

Empty category: EmptyState at 320 / 360 in the grid column (copywriter, key ox.listing.empty) with the route out "تسوق حسب هدفك".

### 6.4 Goal landing (/$slug/c$id, slug in the goal map)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | GoalLanding hero | 360 | 420 | F | eyebrow (the goal name), display H1 verbatim from 2.x, the first sentence of the 2.x intro as lead (two lines max), one primary button scrolling to the grid (copywriter, key ox.goal.heroCta); photo 8.2 with the tonal edge |
| 3 | Goal intro | 140 | 96 | F | the full 2.x intro as body in --ox-container-text; the hero carries only its first sentence, so nothing is repeated |
| 4 | Explainer | 300 | 470 | F | goal-performance only: the 2.3 explainer (h2 and two paragraphs) in the text measure; mobile clamps to eight lines with an "اقرأ المزيد" expander while the DOM keeps the full text |
| 5 | SubNeeds row | 600 | 270 | F | SectionHeader "اختر حسب حاجتك" plus the three 2.x cards; goal-ideal-weight renders two rows under H2 A and H2 B with their short intros (anchors #gain and #lean) |
| 6 | Grid header | 96 | 56 | F | h2 row with count and sort, the filters trigger on mobile |
| 7 | FiltersRail and grid | as 6.3 | as 6.3 | C | the goal category's products; one grid on goal-ideal-weight, the two SubNeeds rows link into it with the filter in the query |
| 8 | LoadMore | 120 | 120 | F | |
| 9 | Goal FAQ | 296 | 288 | C | SectionHeader "أسئلة شائعة" plus the three 2.x pairs; FAQPage JSON-LD from the same data |
| 10 | Need-help panel | 160 | 120 | F | plate panel: the 2.x need-help line plus the primary "اسأل مجانا" linking to the written-question service |

### 6.5 PDP, physical (/$slug/p$id; product_type product and food)

Desktop: the gallery column is 7 of 12 at the start and sticky at the header offset (its 632 box fits the viewport; the buy column at about 1200 does not, so the column that sticks is the gallery). The buy column is 5 of 12. Mobile: one column in the order below.

| # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | scroller on mobile |
| 2 | PdpGallery | 382 | 560 | F | mobile 358 square plus 24 for dots; desktop 560 main image with the 72 thumb column at its start |
| 3 | PdpTitleBlock | 172 | 200 | F | brand 20, h1 two lines, rating 24 (removed before paint when the loader's count is 0), badges 24 |
| 4 | PdpPriceBlock | 180 | 180 | F | includes the fixed 48 installment slot |
| 5 | SpecChips | 72 | 40 | F | two rows mobile, one desktop; 0 when the spec line is absent |
| 6 | Options | 272 | 184 | C | two groups at 136 / 92; the skeleton draws one group; 0 for products without options |
| 7 | SupplyCalculator | 144 | 144 | F | 0 without servings |
| 8 | DeliveryPromise | 48 | 48 | F | |
| 9 | BuyRow | 108 | 108 | F | |
| 10 | WishlistShare | 44 | 44 | F | |
| 11 | TrustGrid | 128 | 128 | F | |
| 12 | BoughtTogether | 352 | 344 | U | hidden when the engine returns no group |
| 13 | GoalFit | 240 | 236 | F | |
| 14 | WhyThis | 220 | 220 | F | |
| 15 | NutritionTable | 532 | 524 | C | rows from the parsed table (skeleton six rows); scroller on mobile |
| 16 | HowToUse | 260 | 252 | C | three steps |
| 17 | PrePurchaseInfo | 280 | 280 | F | the medical row open |
| 18 | Reviews | 248 | 248 | U | summary row plus the empty state; grows by 120 per review; last of the text blocks for that reason |
| 19 | Faq | 408 | 400 | C | five rows including the mandatory price item |
| 20 | Alternatives | 508 | 630 | C | one row of ProductCards |
| StickyBar | 64 | 64 | F | fixed, out of flow, from the moment the BuyRow leaves the viewport |

Blocks 13 to 19 sit in --ox-container-narrow (880); 12 and 20 use the full container. Food products (OX-037 to OX-040) share this composition; the SupplyCalculator reads servings the same way.

### 6.6 PDP, booking and service (ServicePdp)

| # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Service image | 268 | 546 | F | 4/3 on plate from 8.3; column 7 of 12 on desktop, not sticky |
| 3 | Title block | 108 | 136 | F | channel eyebrow, h1, no rating row unless reviews exist |
| 4 | Price block | 72 | 72 | F | price (or "مجاني") and the duration line |
| 5 | Channel facts card | 164 | 164 | F | three rows |
| 6 | "ماذا تحضر" list | 120 | 120 | F | three bullets |
| 7 | Checkout note | 24 | 24 | F | "تختار موعدك في صفحة إتمام الطلب" |
| 8 | Book button | 48 | 48 | F | 108 in the no-slot state (disabled button plus the WhatsApp secondary) |
| 9 | Scope line | 54 | 54 | F | |
| 10 | How it works | 260 | 252 | F | three numbered steps |
| 11 | Faq | 352 | 344 | C | four rows from content/services.ts |
| 12 | Other channels | 585 | 384 | F | SectionHeader plus the two remaining ChannelCards |

No StickyBar: the buy zone is short enough to stay within reach. Service JSON-LD from the same data.

### 6.7 PDP, digital, gift card and bundle

| Variant | # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|---|
| Digital | 1 | Breadcrumb | 32 | 32 | F | |
| Digital | 2 | Cover image | 382 | 560 | F | 1:1 on plate; the cover from the product images |
| Digital | 3 | PdpTitleBlock | 172 | 200 | F | |
| Digital | 4 | PdpPriceBlock | 132 | 132 | F | no per-serving line; installment slot kept |
| Digital | 5 | Facts card | 164 | 164 | F | الصيغة, الحجم, التسليم ("رابط تحميل بعد الدفع") |
| Digital | 6 | BuyRow | 108 | 108 | F | quantity hidden (the engine fixes digital items to one) |
| Digital | 7 | WishlistShare | 44 | 44 | F | |
| Digital | 8 | TrustGrid | 128 | 128 | F | the shipping item swaps to instant delivery (copywriter, key ox.pdp.trust.digital) |
| Digital | 9 | Contents list | 260 | 252 | C | "ماذا يوجد داخل الدليل": numbered chapters in the HowToUse styling |
| Digital | 10 | WhyThis | 220 | 220 | F | |
| Digital | 11 | Faq | 352 | 344 | C | |
| Digital | 12 | Alternatives | 508 | 630 | C | other digital-library items |
| Gift card | 1 | Breadcrumb | 32 | 32 | F | |
| Gift card | 2 | Card image | 224 | 350 | F | 16/10 on plate (358 by 224 / 560 by 350) |
| Gift card | 3 | Title block | 172 | 200 | F | |
| Gift card | 4 | Price block | 72 | 72 | F | the selected amount |
| Gift card | 5 | Amount options | 128 | 84 | F | SallaProductOptions as pills |
| Gift card | 6 | Gifting fields | 232 | 232 | F | SallaGifting: recipient name, message, send date (three fields at 72) in our input styling |
| Gift card | 7 | Facts card | 164 | 164 | F | التسليم, الصلاحية, الاستخدام (copywriter, keys ox.pdp.giftcard.*) |
| Gift card | 8 | BuyRow | 108 | 108 | F | |
| Gift card | 9 | How it works | 260 | 252 | F | three steps |
| Gift card | 10 | Faq | 296 | 288 | C | |
| Bundle | 1 | Breadcrumb | 32 | 32 | F | |
| Bundle | 2 | PdpGallery | 382 | 560 | F | the composite image on plate |
| Bundle | 3 | PdpTitleBlock | 172 | 200 | F | |
| Bundle | 4 | PdpPriceBlock | 180 | 180 | F | the saving line reads "توفير N ر.س مقابل الشراء منفردا" from the members' sum when the engine exposes members; otherwise the plain price |
| Bundle | 5 | Members list | 240 | 240 | C | "ما في الحزمة": rows 72 (thumb 56 on plate, name in a bdi, quantity, member price as a link); skeleton three rows |
| Bundle | 6 | DeliveryPromise | 48 | 48 | F | |
| Bundle | 7 | BuyRow | 108 | 108 | F | |
| Bundle | 8 | WishlistShare | 44 | 44 | F | |
| Bundle | 9 | TrustGrid | 128 | 128 | F | |
| Bundle | 10 | GoalFit | 240 | 236 | F | |
| Bundle | 11 | WhyThis | 220 | 220 | F | why these together |
| Bundle | 12 | HowToUse | 260 | 252 | C | the order of use across the members |
| Bundle | 13 | Faq | 408 | 400 | C | |
| Bundle | 14 | Alternatives | 508 | 630 | C | |

The gift card has no TrustGrid (shipping and expiry do not apply); code delivery and redemption are Salla's. The bundle has no SupplyCalculator and no NutritionTable at bundle level; each member's PDP carries its own.

### 6.8 Search results and zero results (/search, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | ListingHeader | 120 | 80 | F | h1 from the engine's search title with the query in a bdi, count line, sort |
| 2 | FiltersRail | drawer | 280 column | F | facets only when the engine returns them; the column collapses to 0 otherwise |
| 3 | Grid | as 6.3 | as 6.3 | C | |
| 4 | LoadMore | 120 | 120 | F | |
| Zero, 2 | ZeroResults | 410 | 360 | F | replaces 2 to 4: mark 48, title, two lines, six goal chips, "اسأل قبل أن تشتري" secondary |
| Zero, 3 | Popular products | 508 | 630 | C | ProductsSliderWrapper titled "أحدث المنتجات" until sales data exists |

### 6.9 Cart (/cart, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Title row | 48 | 56 | F | the engine's cart title with the item count |
| 2 | CartRows | 224 first paint, 112 per row | 192 first paint, 96 per row | C | 7 of 12 on desktop; the count is in the cart store before paint, so the box is deterministic |
| 3 | CartSummary | 560 | 560 | F | full width under the rows on mobile; 5 of 12 sticky at the header offset on desktop |
| 4 | Mobile checkout bar | 64 | 0 | F | fixed, replaces the tab bar, out of flow |

Empty cart: EmptyState at 320 / 360 in place of 2 and 3. No cross-sell slider on the cart; it stays a buy page.

### 6.10 Thank-you (/thankyou/$orderId, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Engine order summary | 480 | 420 | C | styled: status line, order number (dir ltr), item rows 72, totals table, address; --ox-container-narrow |
| 2 | "كيف تبدأ" card | 300 | 290 | C | three numbered steps from the ordered products' HowToUse lines; hidden when the order has no physical product |
| 3 | Services nudge card | 160 | 140 | F | one line and a secondary button to the written question |
| 4 | Pickup note | 96 | 80 | F | pickup orders only: branch address, today's hours, the cut-off, link to /branch |
| 5 | Route out | 108 | 48 | F | primary to orders, secondary "متابعة التسوق" (engine strings) |

### 6.11 Services hub (/services)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Hub hero | 360 | 420 | F | goal-landing construction: eyebrow "الخدمات", display "اسأل قبل أن تشتري", lead from 1.4 Services, no button; photo 8.3 (video consultation) with the tonal edge |
| 3 | ChannelCards | 700 | 264 | F | the three cards on paper, price lines from the products |
| 4 | Scope panel | 140 | 120 | F | plate panel: "نقول ما هو خارج عملنا" and its 1.5 text, plus the no-diagnosis line |
| 5 | How it works | 260 | 252 | F | three steps (copywriter, keys ox.services.steps.*) |
| 6 | Faq | 352 | 344 | C | four rows from content/services.ts |
| 7 | Contact row | 96 | 72 | F | WhatsApp secondary plus the phone line |

### 6.12 Branch (/branch)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | OxBranch | 810 | 480 | F | the home block reused with the h1 in place of the eyebrow; photo 8.4 exterior |
| 3 | Map | 268 | 400 | F | SallaMap when the maps key exists, otherwise the static map image from 8.4 with the "افتح في الخرائط" link |
| 4 | Pickup steps | 260 | 252 | F | "كيف يتم الاستلام من الفرع": three numbered steps (copywriter, keys ox.branch.pickup.*) |
| 5 | Interior photo | 268 | 396 | F | 8.4 interior; 16/9 in eight columns on desktop, 4/3 on mobile |
| 6 | Faq | 296 | 288 | C | three rows (parking, Ramadan hours, paying in store; copywriter) |
| 7 | Contact row | 96 | 72 | F | |

LocalBusiness JSON-LD from content/branch.ts.

### 6.13 Guides index (/blog) and article (/blog/$slug/a-$id)

| Page | # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|---|
| Index | 1 | Breadcrumb | 32 | 32 | F | |
| Index | 2 | Page header | 120 | 112 | F | h1 "أدلة تشرح بلا مبالغة", intro from 1.4 Guides, text measure |
| Index | 3 | Category chips | 52 | 52 | C | blog categories as filter chips |
| Index | 4 | Feature row | 400 | 480 | F | 4.3 rule 5: an 8-column feature card beside a 4-column card at equal height; on mobile the feature card is the first of the stack |
| Index | 5 | Card rows | 1232 first paint, 400 per card | 896 first paint, 436 per row | C | 1-up stacked on mobile, 3-up on desktop; 12 per page |
| Index | 6 | Pagination | 96 | 96 | F | the engine's pagination styled |
| Index | 7 | OxNewsletter | 320 | 300 | F | |
| Article | 1 | Breadcrumb | 32 | 32 | F | |
| Article | 2 | Article header | 140 | 168 | F | category label, h1 two lines, meta row (date, read time; no author title) in --ox-container-text |
| Article | 3 | Hero image | 200 | 405 | F | 16/9 at the text measure |
| Article | 4 | Key points | 160 | 150 | F | plate panel "الخلاصة": three bullets, the answer-first device for AEO |
| Article | 5 | Body | 700 | 720 | U | sanitized dashboard HTML; skeleton six paragraphs; in-body images 16/9, tables per the Table spec |
| Article | 6 | Mentioned products | 508 | 630 | C | ProductsSliderWrapper "المنتجات المذكورة في الدليل" from the article's linked products; hidden when none |
| Article | 7 | Disclaimer line | 72 | 64 | F | the medical line, lawyer gated |
| Article | 8 | Share row | 44 | 44 | F | SallaSocialShare |
| Article | 9 | Related guides | 485 | 556 | C | three GuideCards |
| Article | 10 | OxNewsletter | 320 | 300 | F | |

Article JSON-LD on the single route; the body's U kind is why the products slider sits after it and never above it.

### 6.14 Brands (/brands and brand routes)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Page header | 96 | 88 | F | h1 (engine string) and one line (copywriter, key ox.brands.intro) |
| 3 | Brand grid | 502 first paint, 154 per row | 362 | C | tiles: logo contained on a 3/2 plate with 24 padding, name 40 under it; 2-up / 6-up; the logo is the brand's own artwork, never recoloured or cropped |

A brand route is the 6.3 composition with the logo plate in the ListingHeader and an intro from the content map when one exists.

### 6.15 About (/about)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Header | 160 | 176 | F | eyebrow, h1, lead in the text measure |
| 3 | Why OptimalX | 590 | 324 | F | the four 1.5 items as 2 by 2 plain text cards (title, three lines) |
| 4 | Storefront photo | 200 | 405 | F | 8.4 exterior at 16/9 in the text measure |
| 5 | Story | 330 | 340 | F | three paragraphs (copywriter, keys ox.pages.about.story.*) |
| 6 | Registration panel | 120 | 96 | F | the 1.6 trust line as a plate panel; renders only when {CR}, {VAT} and {MAROOF} are all filled |
| 7 | Route out | 108 | 48 | F | primary to /services, secondary to /branch |

No portraits and no titles (constraint 15); the "فريق من شخصين" line in 1.5 is the whole team section.

### 6.16 Contact (/contact)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Header | 96 | 88 | F | h1 and one line |
| 3 | Channel rows | 250 | 120 | F | WhatsApp (primary), phone, email as 72 rows (3-up cards on desktop); SallaContacts styled; values dir ltr |
| 4 | Written-question card | 140 | 120 | F | "اسأل قبل أن تشتري" with the price line "مجاني" and the button to the service product; no custom form, the written question is a product so it lands in the order flow and the inbox |
| 5 | Branch card | 160 | 140 | F | address, today's hours, "الموقع على الخريطة", link to /branch |
| 6 | HoursTable | 296 | 296 | F | seven rows |

### 6.17 404 and error

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | NotFound | 580 | 600 | F | mark 96 at the top start, display headline, one line, the search field, the route-out row (two rows of buttons on mobile), WhatsApp link |
| 2 | Latest products | 508 | 630 | C | ProductsSliderWrapper "أحدث المنتجات"; not on the error state |

The error state is block 1 alone at 480 / 500 with the retry button and the mark at 64.

### 6.18 Not composed here

Account (the engine CustomerLayout with AccountNav from 5.5 and an EmptyState per surface; list rows 72), policies (engine static page: h1 plus sanitized body in the text measure), the kitchen sink (every component in every state, dev only) and the unit converter (a --ox-container-narrow form: two selects, one input, one result line; 320 / 280). Their skeletons follow the same rule: the outer box equals the final box.
