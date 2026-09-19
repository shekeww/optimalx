# Live store write log (store 1888890798, optimalx.com.sa)

Every write, in order, with read-back status. Never delete anything listed here without the owner.

| When (UTC) | Action | Product | Salla id | Read-back |
|---|---|---|---|---|
| 2026-09-17 21:36 | products_create | OX-001 جولد ستاندرد 100% واي بروتين | 1996831868 | products_list keyword OX-001: name, price 349, sku, subtitle, description, metadata all intact |
| 2026-09-17 21:37 | product_image_add (Nahdi URL) | OX-001 | 1996831868 | FAILED alert.invalid_fields (retailer host) |
| 2026-09-17 21:38 | product_image_add (Salla CDN URL, mechanism test) | OX-001 | 1996831868 | OK image id 993869989 (placeholder whey image from the owner's original product; replace with the real tub photo) |
| 2026-09-17 21:40 | products_create | OX-009 جولد ستاندرد 100% كازين | 1193355662 | create response intact; list read-back pending |
| 2026-09-17 21:40 | products_create | OX-029 كولاجين ببتيدات فيتال بروتينز | 1659590536 | create response intact; list read-back pending |
| 2026-09-17 21:41 | product_image_add (Sporter URL) | OX-009 | 1193355662 | OK image id 58135402, 1000x1000 |
| 2026-09-17 21:41 | product_image_add (iHerb cloudinary URL) | OX-029 | 1659590536 | OK image id 932357759, 1000x1000 (low-res source; owner replaces) |
| 2026-09-17 21:43 | products_create | OX-002 نيترو تك 100% واي جولد | 1057022406 | create response intact: name, price 355, sku, subtitle, description, metadata, weight 2.5, qty 18 |
| 2026-09-18 05:24 | products_create (digital) | OX-042 دليل المبتدئين PDF | 702549495 | create response intact; digital_settings default; owner uploads the PDF file in the dashboard |
| 2026-09-18 05:24 | products_create (codes) | OX-043 بطاقة هدية | 662137586 | create response intact; owner adds the code values (100/200/500) in the dashboard |
| 2026-09-18 05:25 | products_create (service) | OX-044 سؤال مكتوب | 487045117 | create response intact, price 0 accepted |
| 2026-09-18 05:25 | products_create (booking) | OX-045, OX-046, OX-047 | none | REJECTED 422: booking_details required; the merchant MCP does not expose that field. Recreated as product_type service (below); owner converts to booking products with schedules in the dashboard |
| 2026-09-18 05:26 | products_create (service, booking placeholder) | OX-045 استشارة مرئية 20 دقيقة | 2000960449 | create response intact, price 50 |
| 2026-09-18 05:26 | products_create (service, booking placeholder) | OX-046 زيارة الفرع | 1051830221 | create response intact, price 0 |
| 2026-09-18 05:26 | products_create (service, booking placeholder) | OX-047 جلسة تدريب شخصي | 103621577 | create response intact, price 150 |
| 2026-09-18 05:30 | products_create | OX-003 نيترو تك بيرفورمانس | 8232454 | create response intact, price 399 |
| 2026-09-18 05:30 | products_create | OX-004 ستاكد بروتين | 290277404 | intact, price 369 sale 299 |
| 2026-09-18 05:30 | products_create | OX-005 ايزو 100 | 1663719197 | intact, price 489 |
| 2026-09-18 05:30 | products_create | OX-006 ايزوبيور | 1488630808 | intact, price 379 |
| 2026-09-18 05:30 | products_create | OX-007 ناو واي ايزوليت | 74248730 | intact, price 409 |
| 2026-09-18 05:31 | products_create | OX-008 سبورتس ريسيرش ايزوليت | 1339588198 | intact, price 349 sale 279 |
| 2026-09-18 05:31 | products_create | OX-010 ايليت كازين | 214189933 | intact, price 379 |
| 2026-09-18 05:31 | products_create | OX-011 بروتين نباتي اوبتيموم | 680494447 | intact, price 209 |
| 2026-09-18 05:31 | products_create | OX-012 جوست نباتي | 2052367464 | intact, price 199 |
| 2026-09-18 05:31 | products_create | OX-013 سيريس ماس | 1412547433 | intact, price 339 |
| 2026-09-18 05:32 | products_create | OX-014 ترو ماس | 1945829739 | intact, price 329 sale 269 |
| 2026-09-18 05:32 | products_create | OX-015 كرياتين اوبتيموم | 995134839 | intact, price 149 |
| 2026-09-18 05:33 | copy fix before create | OX-021 | - | removed "من أكثر منتجات ناو مبيعا في السعودية" and "من الأكثر مبيعا في السعودية" (unverifiable bestseller claim); catalogue JSON to be corrected too |
| 2026-09-18 05:32 | products_create | OX-016 كرياتين ثورن | 779499389 | intact, price 169 |
| 2026-09-18 05:33 | products_create | OX-017 امينو انرجي | 1836761674 | intact, price 129 |
| 2026-09-18 05:33 | products_create | OX-018 نوك اوت 2.0 | 153878612 | intact, price 165 |
| 2026-09-18 05:33 | products_create | OX-019 امينو بيلد | 1527328597 | intact, price 159 |
| 2026-09-18 05:33 | products_create | OX-020 سوبيريور امينو 2222 | 886459990 | intact, price 109 |
| 2026-09-18 05:33 | products_create | OX-021 ال-أرجينين ناو | 577153873 | intact, price 99, claim phrase removed |
| 2026-09-18 05:35 | copy fix before create | OX-023, OX-025, OX-026 | - | removed competitor-name bestseller claims (سبورتر) and "الأكثر طلبا في السعودية" |
| 2026-09-18 05:35 | products_create | OX-022 اوميغا 3 سبورتس ريسيرش | 684106154 | intact, price 149 |
| 2026-09-18 05:36 | products_create | OX-023 سوبر اوميغا 3-6-9 | 2057552043 | intact, price 79, competitor claim removed |
| 2026-09-18 05:36 | products_create | OX-024 مغنيسيوم ناو | 643108533 | intact, price 85 |
| 2026-09-18 05:36 | products_create | OX-025 فيتامين د3 ناو | 1882336694 | intact, price 75, popularity claim removed |
| 2026-09-18 05:36 | products_create | OX-026 ZMA ناو | 535063472 | intact, price 115, competitor claim removed |
| 2026-09-18 05:36 | products_create | OX-027 د3 مع ك2 | 1001367986 | intact, price 105 |
| 2026-09-18 05:38 | copy fix before create | OX-032 | - | removed "من الأكثر بحثا في السعودية" popularity claim |
| 2026-09-18 05:38 | products_create | OX-028 سنتروم للرجال | 1390995085 | intact, price 56 |
| 2026-09-18 05:38 | products_create | OX-030 كولاجين سبورتس ريسيرش | 750060942 | intact, price 179 |
| 2026-09-18 05:38 | products_create | OX-031 كولاجين نيوسيل | 1216299912 | intact, price 105 |
| 2026-09-18 05:38 | products_create | OX-032 بيوتين ناو | 1175429259 | intact, price 69, popularity claim removed |
| 2026-09-18 05:39 | products_create | OX-033 بروبيوتيك-10 | 159067287 | intact, price 75 |
| 2026-09-18 05:39 | products_create | OX-034 نون سبورت | 892168849 | intact, price 32 |
| 2026-09-18 05:40 | copy fix before create | OX-035, OX-036 | - | removed competitor bestseller claim (آيهيرب); shaker spec line expiry set to غير منطبق and the odd notice sentence removed |
| 2026-09-18 05:40 | products_create | OX-035 كلوروفريش | 299069850 | intact, price 65, claims removed before create |
| 2026-09-18 05:40 | products_create | OX-036 شيكر بلندر بوتل | 1673105563 | intact, price 59 |
| 2026-09-18 05:40 | products_create (food) | OX-037 كارب كيلا | 1497955814 | intact, price 175 |
| 2026-09-18 05:40 | products_create (food) | OX-038 كويست تشيبس | 82983904 | intact, price 125 |
| 2026-09-18 05:40 | products_create (food) | OX-039 زبدة الفول السوداني | 547650018 | intact, price 65 |
| 2026-09-18 05:40 | products_create (food) | OX-040 شوفان | 1746003438 | intact, price 55 |
| 2026-09-18 15:43 | products_create (group_products) | OX-041 حزمة البداية | 1141798217 | intact, price 509; bundle.products empty (API cannot attach members; owner adds OX-001/015/028 in dashboard) |
| 2026-09-18 15:50 | product_image_add x13 (main, no alt) | OX-010,011,012,017,018,019,020,021 (sporter) OX-030,031,033,034,035 (iherb) | image ids 1319129897,262945840,1461303356,1286079807,1750221625,977232442,1642242052,869256965,2067483393,478008846,60592148,617954065,200598815 | all 201, stored on cdn.salla.sa 1000x1000. Finding: passing `alt` (or `sort`) makes the API return alert.invalid_fields regardless of host; the earlier Nahdi failure carried alt. Alt text must be set in the dashboard. |
| 2026-09-18 15:52 | product_image_add x5 (main, no alt) | OX-002 900126063, OX-006 1325363316, OX-007 1464911231, OX-013 1290216058, OX-014 1755930692 (nahdi host) | all 201 | Corrects the earlier record: ecombe.nahdionline.com is accepted; the earlier rejection was caused by the alt field. OX-002/006/014 sources are portrait (826x1000, 694x1000, 704x1000), the PDP gallery must letterbox on a white plate. |
| 2026-09-18 15:53 | product_image_add x2 (main, no alt) | OX-004 1652585902, OX-008 905834922 (nahdi host) | 201 | 1000x1000 |
| 2026-09-18 16:25 | product_image_add x16 (main, no alt) | OX-003 743352570, OX-005 2116794363, OX-026 1099379655, OX-028 1349008335, OX-023 1025393360, OX-024 251355601, OX-025 1489076434, OX-032 76271324, OX-041 640007724 (reuses the OX-001 whey shot), OX-015 358316074, OX-016 606887986, OX-022 498912573, OX-027 922052666, OX-036 2012295425, OX-037 1105088514, OX-038 331054851 | all 201, 1000x1000 on cdn.salla.sa | Sources verified by the image-research agent (research/image-urls.json). OX-003 and OX-005 are the Sporter line hero shots (flavour on the shot not confirmed), OX-037 flavour not confirmed. OX-039 and OX-040 (Myprotein) have no image on the accepted hosts. |
| 2026-09-18 16:30 | product_image_add x2 (main, no alt) | OX-039 302770808, OX-040 752669248 (static.thcdn.com, Myprotein's own CDN, 1600x1600) | 201 | Fourth accepted host. Every physical and food item now has a photo; OX-042..047 (digital, codes, service placeholders) wait for the owner's generated artwork per DIRECTION.md section 8. |

## Live Raed home composition (theme version 499745075), 2026-09-19
Backup of the composition before any change: 10 blocks, order 1..100:
415756255 custom_component صور متحركة (محسنة) hero | 906554936 fixed_products title "الأكثر مبيعا" type most_sales | 2132346943 featured_products title "مجموعة منتجات فقط" | 303875307 custom_component منتجات متحركة مع خلفية | 195240438 custom_component صور مربعة (محسنة) | 692876762 custom_component منتجات متحركة مع خلفية | 791947048 photos_slider | 309059894 bundle_component title "Products on Your Taste" | 1815085111 featured_products title "مجموعة منتجات فقط" | 1929931795 featured_products title "مجموعة منتجات فقط"

| when | call | target | result | note |
|---|---|---|---|---|
| 2026-09-19 07:40 | homepage_component_edit settings | 906554936 fixed_products | read back: title {"ar":"أحدث المنتجات"}, type latest_products | Removes a popularity claim the store cannot support: the title said "الأكثر مبيعا" and the source was most_sales on a store with no orders. FINAL-content 1.4 defers bestsellers until real order data exists. |
| 2026-09-19 07:42 | homepage_component_edit settings | 2132346943 featured_products | read back: tab "بروتين وواي", six chosen products resolved by name | was an untitled tab sourced from most_sales |
| 2026-09-19 07:43 | homepage_component_edit settings | 1815085111 featured_products | tab "فيتامينات ومعادن", six chosen products | same |
| 2026-09-19 07:43 | homepage_component_edit settings | 1929931795 featured_products | tab "سناكس ومستلزمات", six chosen products | same |
| 2026-09-19 07:44 | homepage_component_edit add + settings | 1144282907 store_features (new) | three items: منتجات أصلية / شحن من المدينة المنورة / مساعدة في الاختيار | wording from locales ox.trust.*; no payment names, no reply-time promise, no distributor claim |
| 2026-09-19 07:45 | homepage_component_edit add + settings | 1677696357 custom_component روابط سريعة (new) | title "تصفح حسب النوع", six links to /search for بروتين كرياتين فيتامين اوميغا كولاجين امينو | search verified live: "أكثر من 15 منتج" for بروتين. Repoint to categories once the owner creates them. |
| 2026-09-19 07:46 | homepage_component_edit reorder | all 12 | hero, type links, trust, latest, protein, dark band, vitamins, banner, snacks | verified in the rendered DOM |
| 2026-09-19 07:47 | homepage_component_edit visibility false | 692876762 duplicate dark band | hidden, not deleted | recoverable |
| 2026-09-19 07:47 | homepage_component_edit settings + visibility false | 309059894 bundle | retitled "اختيارات تناسبك", hidden | it personalises on purchase history and the store has no orders |
| 2026-09-19 07:48 | homepage_component_edit visibility false | 195240438 صور مربعة | hidden, not deleted | it rendered as six empty grey boxes; unhide once the owner uploads the tile images |

## 2026-09-19 ~14:55 The OptimalX skin went live on optimalx.com.sa
The owner pasted `docs/live-theme/optimalx-raed.min.css` and `optimalx-raed.min.js` into the Raed customizer's custom code boxes. Salla now serves both from its own CDN:
- https://cdn.assets.salla.network/themes/customization/1888890798/1298199463/499745075.css
- https://cdn.assets.salla.network/themes/customization/1888890798/1298199463/499745075.js

Verified against the live store, no injection, cache busted, at 1440 and 390 in Arabic on home, product, search and cart: body ground #F7F7F8 on all eight, Cairo, `--ox-paper` resolving, the script flag set on every page, one h1 per page, document width 1425 at 1440 and 375 at 390 so no horizontal scroll, and zero uncaught page errors on all eight. On the product page: 15 spec chip elements, the supply calculator rendering "تكفي نحو 24 يوما", and the nutrition table carrying its third column.

Note: `custom_css_enabled` still reads false in the theme-versions API while the stylesheet is demonstrably being served, so that flag is not a reliable signal.
| 2026-09-19 15:05 | homepage_component_edit settings + visibility true | 195240438 صور مربعة | five tiles: بروتين وواي، كرياتين، فيتامينات ومعادن، كولاجين وجمال، سناكس وبارات، each with a distinct product photograph from the store's own CDN and a working search link | The block previously held four images, two of them wide hero banners repeated, with placeholder titles and no links, which is why it rendered as grey boxes. Verified live: block height 432, zero broken images. |
| 2026-09-19 15:06 | theme_settings_update | vertical_fixed_products true | the أحدث المنتجات grid now uses vertical cards like every other rail | was horizontal, which made the first grid inconsistent with the rest of the page |
| 2026-09-19 15:15 | homepage_component_edit settings | 415756255 hero | replaced a two-slide hero with one clean photographic slide plus live Arabic text | REASON, serious: slide one published the brand's own name misspelled as "optimat" on both shaker bottles, a competitor's Gold Standard Whey, Opti-Men and Opti-Women packaging, and a burnt-in headline in dialect ("خل الباقي علينا", "نساعدك توصل"). It was the first thing every visitor saw. Slide two is clean photography with an empty graphite field, no legible third-party branding and no burnt-in text, so the headline now comes from the approved MSA copy (ox.home.hero_headline and hero_subline) as real, selectable, translatable text over the image. |
| 2026-09-19 15:25 | homepage_component_edit settings | 791947048 photos_slider | replaced the repeated hero art with the stocked-brands band, linked to a brand search | The band is cropped below the shaker bottles so the misspelled wordmark is out of frame while the Optimum Nutrition range the store resells stays in. Correction to an earlier entry: supplier brands are not competitors, the store is a reseller and curator, so their packaging is a signal of what is stocked. |
| 2026-09-19 15:27 | homepage_component_edit settings | 303875307 products with background | background set to the OptimalX shaker band, title "مختارات فريق اوبتيمال اكس", description added | The section had an empty title and no description, so it rendered as an unexplained product strip. The copy states only what is verifiably true of the catalogue: every product carries its servings, serving size and expiry, and the nutrition table has an explanation column. |
| 2026-09-19 15:20 | git | docs/assets published to the public repository | brands-band, shakers-tile, shakers-band, nutrition-bowl, athlete-back, all serving 200 image/jpeg from raw.githubusercontent.com | The repository went public, which makes it a usable image host for the storefront. These are extracted from the reference board: the shaker still life is a genuine OptimalX asset with the wordmark spelled correctly; the food and athlete frames were cropped out of a mockup whose text carried invented statistics that can never be published. |

## 2026-09-19 16:05 The rebalanced skin is live
The owner pasted `optimalx-raed.min.css` (64090 characters) and `optimalx-raed.min.js` (64621) into the theme's custom code boxes. Salla serves the stylesheet byte-identical and wraps the script in its own loader, which is why the served script reads 72450.

Verified WITHOUT a browser, which was unavailable: the exact script Salla serves was run against freshly fetched live HTML for the product page and the home page inside jsdom, twice each to prove idempotence.
- Product page: no exception; builds the supply calculator (10 elements), the tab strip (9), the trust items (18) and the accordions (26).
- Home page: no exception; builds the goal grid (26), trust (12), services (6), branch (6), the FAQ and 11 section headers; injects exactly one style element.
- Fabricated-claim scan clean on both: no bestseller phrase, no invented rating, no invented review count.

Not yet built, and honestly outstanding against the owner's target product page: the four statistic cards and the three information panels.
