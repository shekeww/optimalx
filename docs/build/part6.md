## 6. Page compositions

How to read this section. Each page is an ordered list of blocks, top to bottom, with the reserved height of each block's skeleton in px (mobile 390 / desktop 1440 with the 1280 container). The reserved height is the outer box the skeleton occupies and the minimum the loaded block occupies; a block marked "grows" may get taller after load, and every such block is placed where growth never moves a primary action (a buy button, a checkout button, a form submit). Heights come from the component sizes in section 5 and the type scale in section 3, rounded up to the 4px grid; a builder who changes a component size updates the row here. Section gaps are the rhythm in 4.2 and are not counted inside block heights: 48 on mobile between every block; on desktop 64 between paper blocks on home, hubs, guides and brands, 48 inside buy pages, 96 around the services band, the branch block and the newsletter band. The zero-gap pairs in 4.2 hold (hero to trust strip, newsletter to footer, header to breadcrumb 16).

Chrome, counted once and not repeated per page: announcement bar 40 / 36, utility bar 0 / 36, main bar 56 / 72, nav bar 0 / 48; that is 96 / 192 of header. The mobile two-row header on listing, search and goal routes is 104 plus the announcement bar. The bottom tab bar (56 plus safe area) is fixed and out of flow; the body carries the same amount of bottom padding below 1024 so the footer's last line is reachable. The footer is 808 / 888 on every page (5.2 Footer) and is listed once here.

Two blocks are new against PLAN.md section 3 and are flagged for the planner: OxFaq (home, four questions from the content file including the price question, wrapping SallaAccordion; registered as home:ox-faq) and the NeedHelp band on goal landings (a --ox-plate band with the line and the "اسأل مجانا" button from FINAL-content section 2). Both are small, both reuse existing primitives.

### 6.1 Home (/)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | OxHero | 500 | 560 | Dark band, the wedge and the stroke (4.5). The only orange stroke on the site. |
| 2 | OxTrustStrip | 160 | 96 | Zero gap under the hero. Grows by the open definition panel (about 72) below the row, never above. |
| 3 | OxGoals | 528 | 296 | SectionHeader 88 / 104 plus the six GoalCards: 3 rows of 128 on mobile, one row of 160 on desktop. The signature motion moment (section 7). |
| 4 | OxCategories | 872 | 712 | Eight tiles by default (the merchant field allows 4 to 10): 4 rows of 178 on mobile, 2 rows of 276 on desktop. Tile height = 4:3 photo plus the 48 label strip plus borders. |
| 5 | OxProducts (source latest until real sales data exists, then most-sales with the "الأكثر طلبا" title) | 500 | 660 | Header plus one card row: 388 on mobile at 172 wide, 524 on desktop at 302 wide. The bestsellers title is deferred per FINAL-content 1.4; the default composition titles this block "أحدث المنتجات". |
| 6 | OxBrands | 128 | 144 | One scroller row of brand logos on 3:2 plates (see 6.13), 80 / 96 tall plus the header eyebrow only (no title, no descriptor: the row is a signpost, not a section). |
| 7 | OxServices | 1032 | 560 | Dark band with the wedge. Desktop measures 560 with three cards at 282, so --ox-band-h for this band is 560 and the run is 226 (the 480 / 194 row in 4.5 is superseded: polygon(0 0, 100% 0, calc(100% - 226px) 100%, 0 100%), inline-size calc(34% + 226px); LTR polygon(0 0, 100% 0, 100% 100%, 226px 100%)). |
| 8 | OxGuides | 480 | 580 | Header plus one row: a 300 wide scroller card at 368 on mobile, three cards at 444 on desktop. |
| 9 | OxBranch | 768 | 480 | The 7/5 split with the angled photo edge. The hours table groups days into at most three ranges so the address card fits 480 on desktop; this grouping is a content rule, not a layout option. |
| 10 | OxFaq | 336 | 360 | Header plus four accordion rows of 56, all closed; opening one grows the block by its panel. |
| 11 | OxNewsletter | 328 | 288 | On --ox-plate, zero gap into the footer. |
| 12 | Footer | 808 | 888 | |

Merchant-editable blocks not in the default composition: OxBanner (a campaign image band, 4:1 on desktop at 320 tall, 3:2 on mobile at 239, straight edges, no wedge, no text over the image; the merchant writes the text in fields beside it) and a second OxProducts with any engine source. A merchant-composed home that omits blocks keeps the rhythm; a home with no blocks renders exactly the table above (DefaultHome).

### 6.2 Category listing (/$slug/c$id)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | 16 under the header. |
| 2 | CategoryIntro | 128 | 144 | h1, count, one intro paragraph of two lines from content/categories.ts. Grows if the merchant's category description is longer; it sits above the grid, so growth moves only the grid. |
| 3 | ListingHeader controls | 44 | 44 | Sort at the end; the filters trigger on mobile only. |
| 4 | Applied chips row | 0 | 0 | Appears at 44 when a filter is applied; it is rendered from the URL state before the grid, so it is present on first paint and does not shift. |
| 5 | FiltersRail | 0 | side | Desktop: a 280 column beside the grid, sticky. Mobile: the drawer, out of flow. |
| 6 | Product grid | 2 rows: 792 | 2 rows: 920 | Skeleton reserves two rows of cards (388 at 171 wide on mobile; 448 at 226 wide beside the rail on desktop); the loaded grid grows downward to the page size (24 per page). |
| 7 | LoadMore | 128 | 128 | Progress line and the button. |
| 8 | CategoryFaq | 280 | 304 | Header plus three rows of 56, closed. |
| 9 | Related guides | 480 | 580 | Three GuideCards chosen in content/categories.ts. |
| 10 | Footer | 808 | 888 | |

No wedge on this page (a buy page). Brand pages, offers, latest, most-sales and tag routes use this composition without block 2's intro paragraph (they keep the h1 and count) and without blocks 8 and 9.

### 6.3 Goal landing (/$slug/c$id when the slug is in the goal map)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | |
| 2 | GoalLanding hero | 360 | 420 | Dark band with the tonal edge, no stroke (4.5). The h1 is the goal H1 from FINAL-content section 2. |
| 3 | SubNeeds | 600 | 296 | Header plus three sub-need cards: stacked at 152 on mobile, one row at 160 on desktop. |
| 4 | ListingHeader controls and applied chips | 44 | 44 | As the listing. |
| 5 | FiltersRail and product grid | 792 | 920 | As the listing (skeleton reserves two rows). |
| 6 | LoadMore | 128 | 128 | |
| 7 | Faq | 280 | 304 | The three goal FAQ pairs. |
| 8 | NeedHelp band | 192 | 232 | On --ox-plate, container-narrow, the line and the "اسأل مجانا" primary button linking to the written-question product. |
| 9 | Footer | 808 | 888 | |

### 6.4 Product page, physical and food (/$slug/p$id)

Desktop is two columns from 1024: the gallery in columns 1 to 7 (a 737 wide column holding the 80 thumb strip and the 560 main image), the buy column in columns 8 to 12 (519 wide). The buy column measures 1172 against the gallery's 560, so the gallery is sticky at the top offset (header plus 16, z --ox-z-raised) while the buy column scrolls; the alternative, a sticky buy column, would pin the price off the gallery it belongs to. Mobile is a single column in the order below.

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | |
| 2 | PdpGallery | 384 | 560 | Mobile: the 358 square plus 24 of dots. Desktop: the column height; sticky. |
| 3 | PdpTitleBlock | 152 | 180 | Reserves two lines of h1; a one-line name leaves 34 / 48 of air rather than shifting the price. |
| 4 | PdpPriceBlock | 168 | 176 | Includes the fixed 48 installment slot. |
| 5 | SpecChips | 72 | 32 | Two rows on mobile at 358 wide with four chips. |
| 6 | Options | 92 | 92 | Reserved for one group. A product with two groups grows by 92 after load; this is the one tolerated shift on the page, it happens once, and the sticky bar keeps the buy action available while it happens. |
| 7 | SupplyCalculator | 148 | 148 | Hidden (0) when the spec line has no servings; the skeleton reserves it because every physical SKU in the catalogue carries a spec line. |
| 8 | DeliveryPromise | 48 | 48 | |
| 9 | BuyRow | 108 | 108 | The sticky bar's anchor. |
| 10 | WishlistShare | 44 | 44 | |
| 11 | TrustGrid | 144 | 144 | |
| 12 | BoughtTogether | 420 | 428 | Hidden (0) when the engine returns no group; the skeleton reserves it only when the product has related items in the loader data. |
| 13 | GoalFit | 216 | 240 | |
| 14 | WhyThis | 208 | 236 | |
| 15 | NutritionTable | 572 | 596 | Reserved for eight rows (the catalogue median); grows with the row count. |
| 16 | HowToUse | 228 | 252 | Three steps. |
| 17 | PrePurchaseInfo | 364 | 392 | Three rows with the medical row open. |
| 18 | Reviews | 540 | 560 | Header, summary, three review rows; 160 for the empty state. |
| 19 | Faq | 336 | 360 | Four rows including the price question. |
| 20 | Alternatives | 500 | 660 | One card row. |
| 21 | Footer | 808 | 888 | |

The StickyBar (64) is fixed and out of flow; on mobile it replaces the tab bar while visible.

### 6.5 Product page, booking and service

Same column split as 6.4. The image column holds the service photo at 4:3 (737 × 553 on desktop, sticky) instead of a gallery.

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | |
| 2 | Service image | 268 | 556 | On plate, no thumbs. |
| 3 | Title block | 96 | 124 | Channel eyebrow and h1; no rating row unless reviews exist. |
| 4 | Price and duration | 64 | 72 | |
| 5 | Channel facts card | 152 | 152 | Three rows of 40 on --ox-plate. |
| 6 | What to prepare | 128 | 136 | Three bullets. |
| 7 | Checkout note | 24 | 24 | "تختار موعدك في صفحة إتمام الطلب". |
| 8 | Book button | 48 | 48 | SallaAddProductButton with productType booking (or the service type). |
| 9 | Scope line | 48 | 54 | Two lines in --ox-fg-2: what the consultation is not. |
| 10 | How it works | 228 | 252 | Three steps. |
| 11 | Faq | 280 | 304 | Three rows. |
| 12 | Other channels | 656 | 420 | Header plus the two remaining ChannelCards. |
| 13 | Footer | 808 | 888 | |

### 6.6 Product page, digital, gift card and bundle

Digital (productType digital) follows 6.4 with blocks 5, 7, 8, 12, 13, 15 removed and two additions after the price block: a "ما ستستلمه" card (three rows, 152 / 152) and the engine's product-description hook slot where DigitalFilesSettings renders (reserved 96 / 96). HowToUse is retitled "كيف تصل إليك الملفات".

Gift card (productType codes): image on plate at 3:2 (240 / 376, the card design from the asset brief), title block (96 / 124), amount options as pills (the engine options, 92 / 92), the gifting fields from SallaGifting (recipient name, recipient contact, message: three fields at 78 plus the textarea at 120, reserved 360 / 360), BuyRow (108), a "كيف تعمل البطاقة" three-step block (228 / 252), Faq (280 / 304), footer.

Bundle (productType group_products) follows 6.4 with these changes: the price block adds the bundle saving line in --ox-go (the engine exposes the component sum), a "ما في الحزمة" block after the spec chips (header plus rows of 72 per product with a 48 thumb, name and spec chips; reserved for three rows: 328 / 352), the SupplyCalculator is hidden (mixed servings), and the NutritionTable becomes SallaTabs with one tab per component product (48 tab row plus the table: 620 / 644).

### 6.7 Search results and zero results (/search)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Results header | 88 | 96 | h1 "نتائج البحث عن «{q}»" with the query in a bdi, count line. On mobile the header's second row holds the field. |
| 2 | Controls and applied chips | 44 | 44 | |
| 3 | FiltersRail and grid | 792 | 920 | As the listing. |
| 4 | LoadMore | 128 | 128 | |
| 5 | Footer | 808 | 888 | |

Zero results replaces blocks 2 to 4 with ZeroResults (432 / 392) and a popular-products slider (500 / 660, source most-sales when data exists, otherwise latest). The page is noindex either way.

### 6.8 Cart (/cart)

Desktop uses --ox-container-narrow is too tight for rows plus summary, so the cart uses the 12-column container with rows in columns 1 to 7 and the summary sticky in columns 8 to 12.

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Title and count | 64 | 80 | h1 "سلة التسوق", "3 منتجات". |
| 2 | CartRows | 344 | 292 | Reserved for three rows (112 / 96 each with rules); grows with the row count. |
| 3 | Cart hook slot trust row | 56 | 56 | Three mini items (authentic, shipping from Medina, secure payment) through the engine's cart hook slots. |
| 4 | CartSummary | 484 | 500 | Free-shipping bar, coupon, totals, checkout, marks, trust lines. Sticky on desktop. |
| 5 | Footer | 808 | 888 | |

The mobile fixed bottom bar (64) repeats the checkout button and the total; it replaces the tab bar on this route. Empty cart: EmptyState at 320 / 360 in place of blocks 2 to 4.

### 6.9 Thank-you (/thankyou/$orderId)

In --ox-container-narrow. Engine order summary (reserved 480 / 400: the tick line in --ox-go, order number, items, totals, addresses), the "كيف تبدأ" card (200 / 216), the services nudge card (192 / 200), the pickup note (72 / 72, only for pickup orders), footer. Noindex.

### 6.10 Services hub (/services)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | Hub hero | 360 | 420 | Dark band with the tonal edge (4.5), display line "اسأل قبل أن تشتري", the sub-line, no buttons (the cards are the actions). |
| 2 | ChannelCards on paper | 936 | 420 | Header plus three cards on --ox-card (this is a buy page; the dark band belongs to the home). |
| 3 | Scope panel | 280 | 188 | "ما نفعله وما لا نفعله": two lists of three lines on --ox-plate. |
| 4 | How it works | 228 | 252 | |
| 5 | Faq | 336 | 360 | |
| 6 | OxBranch | 768 | 480 | The branch visit is a channel; the block is reused as is. |
| 7 | Footer | 808 | 888 | |

### 6.11 Branch (/branch)

| # | Block | Mobile | Desktop | Note |
|---|---|---|---|---|
| 1 | OxBranch as the page head | 768 | 480 | The address card carries the h1 "فرعنا في المدينة المنورة". The angled photo edge is this page's one wedge. |
| 2 | Map | 204 | 496 | SallaMap when the maps key exists, otherwise a static map image on plate (16:9 in the narrow container); a 44 "افتح في الخرائط" link under it. |
| 3 | Directions | 128 | 136 | Three lines: landmark, parking, entrance. |
| 4 | Pickup how-to | 228 | 252 | Three steps: order online, choose pickup, show the order number. |
| 5 | Faq | 336 | 360 | |
| 6 | Visit channel card | 288 | 300 | The branch-visit ChannelCard alone, header included. |
| 7 | Footer | 808 | 888 | |

### 6.12 Guides index and article (/blog, /blog/$slug/a-$id)

Index: title block (96 / 112), category chips scroller (36 / 36), the feature row (mobile: the first card as a normal GuideCard at 368; desktop: the 8-column feature card at 620 with a 16:9 image beside a 4-column card at the same height, per 4.3), then rows of three (444) or stacked (368); the skeleton reserves the feature row plus one row (1136 / 1088); LoadMore (128); footer.

Article: breadcrumb (32), article header in --ox-container-text (136 / 164: category label, two-line h1, meta line with date and read time; no author title, per the claims rule), hero image 16:9 in the text container (204 / 408), body (the skeleton reserves six paragraph groups, 744 / 744; the loaded body grows), a related-products slider (500 / 660), related guides (480 / 580), the scope line "هذا الدليل يشرح ولا يشخص" (72 / 72), footer. Article JSON-LD from the same fields.

### 6.13 Brands (/brands and the brand page)

Index: title block (96 / 112), an alphabet chip row in a dir ltr scroller (36), the brand tile grid: a logo on a 3:2 plate with a 40 label under it, 2-up on mobile (156 per tile), 6-up on desktop (172 per tile); the skeleton reserves two rows (328 / 368); footer. Brand page: the listing composition (6.2) with the brand logo on a 96 tall plate at the start of the intro block (224 / 240) and without the FAQ and guides blocks.

### 6.14 About (/about)

In --ox-container-text for the copy, the full container for the cards. Title block with the lead (104 / 128), the four "Why OptimalX" items from FINAL-content 1.5 as cards (stacked 800 on mobile, a 2 × 2 grid at 424 on desktop; icon, title, three lines; no photos of people unless the owner supplies real ones, no titles), OxBranch (768 / 480), the registration block (the trust line from 1.6 in a --ox-plate panel, 96 / 96, same all-three-filled rule as the footer), footer.

### 6.15 Contact (/contact)

Title block (96 / 112), three channel cards (WhatsApp, phone, email; each 168 with the value in a dir ltr span; stacked 536 on mobile, one row 172 on desktop), the contact form through SallaContacts styled with the input specs (name, contact, subject select, message; 496 / 496 in --ox-container-narrow), OxBranch (768 / 480), footer.

### 6.16 404 and error

NotFound (680 / 560): the mark, the display headline, one line, the search field, the route-out row (stacked on mobile). Then the full footer, because the footer's columns are the site map the page needs. The error boundary state uses the same block at 560 / 480 without the search field and with the retry button. Neither carries a wedge; the mark is the only decoration.

Account pages are not composed here: they use the engine's CustomerLayout with the AccountNav spec (5.5), the engine page bodies restyled through their s-* classes, and the EmptyState spec for orders, wishlist and notifications.

