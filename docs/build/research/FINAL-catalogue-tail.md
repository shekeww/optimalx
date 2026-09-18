# OptimalX FINAL catalogue, tail (sections D to G)

Continues FINAL-catalogue.md (sections A, B and the C header). Section C's items are the fenced JSON objects in batch-01.md to batch-08.md (OX-001 to OX-047). This file was generated from those eight files on 2026-09-18 by build-tail.py; sections E, F and G are read from the data, and section D's SKU and price columns are read from the data while its anchor and rule columns quote each item's price_basis and price_source_url.

## D. Price-band rationale per category

Every figure below is copied from the `price_basis` and `price_source_url` fields of the items named in the row; nothing new was fetched for this section. Captures are dated 2026-09-17. OptimalX prices are SAR, VAT inclusive, rounded to a shelf price (ending in 5 or 9 where the anchor allows). Status tells the owner which rows must be re-read before publishing.

| Category (slug) | OptimalX list prices (SAR) | Anchor retailer and captured figures (see each item's price_source_url) | Rule applied | Status |
|---|---|---|---|---|
| whey-protein | OX-001 349, OX-002 355, OX-003 399, OX-004 369 (sale 299) | Nahdi PDPs and protein PLP (OX-001 4.53 kg tub SAR 518.06 sale / 690.74 list, a SAR 57 to 76 per lb band; OX-004 5 lb SAR 300.00 / 399.99) and the Sporter KSA best-selling whey page (OX-002 5 lb SAR 357.89; OX-003 4 lb SAR 403.08, 2 lb SAR 208.09). | Sporter items at or just under the captured figure; Nahdi items inside the sale-to-list band. OX-001 is anchored on the per-lb band of a bigger tub because the 5 lb price was not captured. | verified (OX-001 per-lb anchor) |
| whey-isolate | OX-005 489, OX-006 379, OX-007 409, OX-008 349 (sale 279) | Nahdi protein PLP (OX-006 1.36 kg SAR 346.37 / 432.96; OX-007 2.27 kg SAR 388.16 / 466.55; OX-008 2.27 kg SAR 277.00 / 469.00). OX-005 only has the iHerb SA pre-discount list (SAR 648 to 878 for 5 lb) as an upper bound. | Nahdi items inside the sale-to-list band. OX-005 set below the iHerb ceiling and above every other 2.27 kg isolate captured. | OX-005 FLAGGED: verify on Sporter's ISO100 page before publishing |
| casein | OX-009 239, OX-010 379 | Sporter KSA casein category (Gold Standard Casein 2 lb SAR 228.52 to 253.91, 4 lb SAR 408.93 to 430.46; Dymatize Elite Casein 4 lb SAR 369.29 to 388.71). | Inside the Sporter band for the same size. | verified |
| plant-protein | OX-011 209, OX-012 199 | Sporter KSA plant-based protein category (Gold Standard Plant 20 servings SAR 195.58 to 214.27; Ghost Vegan 2 lb SAR 152.95 to 281.75 by flavour). | Inside the Sporter band; OX-012 placed mid-band because flavours differ widely. | verified |
| mass-gainer | OX-013 339, OX-014 329 (sale 269) | Nahdi protein PLP (Serious Mass 5.44 kg SAR 291.83 / 389.11; BSN True-Mass 4.65 kg SAR 265.08 / 353.44). | Inside the Nahdi sale-to-list band; OX-014 carries a launch sale inside the same band. | verified |
| creatine | OX-015 149, OX-016 169 | iHerb SA Sports best sellers (ON Micronized Creatine 600 g SAR 155.54; Thorne Creatine 450 g SAR 166.65). | At the iHerb figure, rounded to a shelf price. | verified |
| pre-workout | OX-017 129, OX-018 165 | Sporter KSA energy-endurance category (Amino Energy 30 servings SAR 118.89 to 153.77 by flavour, 65 servings SAR 222.33 to 234.04; Olimp Knockout 2.0 305 g SAR 168.27). | Inside the Sporter band; the 65-serving variant of OX-017 priced inside its own band. | verified |
| amino-acids | OX-019 159, OX-020 109, OX-021 99 | Sporter KSA aminos-recovery category (Amino Build 40 servings SAR 163.43; Superior Amino 2222 160 tablets SAR 107.01, 320 tablets SAR 184.94; NOW L-Arginine 120 tablets SAR 123.21) and iHerb SA (NOW L-Arginine SAR 85.93). | At the Sporter figure; OX-021 set inside the SAR 86 to 123 two-retailer band. | verified |
| omega-3 | OX-022 149, OX-023 79 | iHerb SA Sports best sellers (Sports Research Alaskan Omega-3 90 softgels SAR 144.49, 180 softgels SAR 283.92) and Sporter KSA vitamins best sellers (NOW Super Omega 3-6-9 90 softgels SAR 77.64). | At the captured figure, rounded to a shelf price. | verified |
| vitamins-minerals | OX-024 85, OX-025 75, OX-026 115, OX-027 105, OX-028 56 | Sporter KSA vitamins best sellers (NOW Magnesium 400 mg 180 caps SAR 84.73; NOW D-3 5000 IU 120 softgels SAR 72.63; NOW ZMA 90 caps SAR 117.43; Centrum Men 30 tablets SAR 55.71) and iHerb SA (Sports Research D3 + K2 60 softgels SAR 101.79). | At the captured figure, rounded to a shelf price. | verified |
| collagen-beauty | OX-029 139, OX-030 179, OX-031 105, OX-032 69 | iHerb SA collagen best sellers (Vital Proteins 284 g SAR 132.19, 567 g SAR 230.61; Sports Research 454 g SAR 174.23; NeoCell 270 tablets SAR 97.63). OX-032 has no captured NOW price; Noon's GNC KSA store lists GNC Biotin 10,000 mcg 100 tablets at SAR 68. | At the iHerb figure; OX-032 set level with the comparable-size GNC figure. | OX-032 COMPARABLE-SIZE ANCHOR: verify before publishing |
| daily-health | OX-033 75, OX-034 32, OX-035 65 | iHerb SA best sellers (NOW Probiotic-10 50 caps SAR 72.38; Nuun Sport 10 tablets SAR 31.28 to 31.30; Nature's Way Chlorofresh 480 ml SAR 61.39, band to SAR 88.32 for NOW liquid chlorophyll). | At the iHerb figure, rounded to a shelf price. | verified |
| accessories | OX-036 59 | None captured. price_source_url is an Amazon.sa search page for the owner to check, not a captured price. | Estimate. | OX-036 UNVERIFIED |
| snacks-bars | OX-037 175, OX-038 125, OX-039 65, OX-040 55 | None captured: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403 and two Sporter KSA catalogsearch pages rendered the default result set. The price_source_url of each item is the page the owner should read. | Estimates placed at the level of mid-range imported snacks and single-ingredient staples. | OX-037 to OX-040 UNVERIFIED |
| bundles | OX-041 509 | Internal: sum of the members at list price (OX-001 SAR 349 + OX-015 SAR 149 + OX-028 SAR 56 = SAR 554). | 8.1% below the sum (saving SAR 45); each member keeps its own verification status. | verified against the catalogue |
| digital-library | OX-042 29 | None needed; price fixed by the brief. | Low fixed ticket under the cheapest physical item (OX-034 SAR 32). | fixed by brief |
| gift-cards | OX-043 100 | None needed; face value. | Each value option priced at par (100, 200, 500). | fixed by brief |
| services | OX-044 0, OX-045 50, OX-046 0, OX-047 150 | OX-044, OX-045 and OX-046 fixed by the brief. OX-047 has no price page; its price_basis reasons from the per-session cost of gym personal-training packages in Saudi cities and Medina's smaller market. | Ladder: free written question, SAR 50 consultation returned as a first-order code, free branch visit, SAR 150 training session. | OX-047 ESTIMATE: confirm against two Medina gyms |

Rules used across the catalogue:
- Single-source items (one retailer figure captured) are set at that figure or just under it, rounded to a shelf price; the price_basis of each item names the retailer, the page and the figure.
- Nahdi items are set inside the captured sale-to-list band, never above the list price.
- Two-source items (OX-021) are set inside the band between the two retailers.
- Sale prices (OX-004, OX-008, OX-014) stay inside the same band as the list price, so a launch sale never undercuts the anchor retailer's own sale.
- Variants named in `options` carry their own price stated in price_basis (OX-001 4.54 kg SAR 599, OX-002 3.63 kg SAR 449, OX-003 907 g SAR 205, OX-009 1.81 kg SAR 419, OX-017 65 servings SAR 229, OX-020 320 tablets SAR 179, OX-022 180 softgels SAR 285, OX-029 567 g SAR 235, OX-040 2.5 kg SAR 119, OX-043 SAR 200 and 500).

Items that need a price check before publishing: OX-005 (FLAGGED, iHerb upper bound only), OX-032 (COMPARABLE-SIZE ANCHOR), OX-036 (UNVERIFIED), OX-037, OX-038, OX-039, OX-040 (UNVERIFIED), OX-047 (ESTIMATE). Everything else carries a captured Saudi figure in price_basis.

## E. All 47 items (CSV)

Columns: sku, product_type, name_ar, name_en, brand, price, sale_price, weight_kg, quantity, primary_category_slug, goal_slugs, servings, serving_size, expiry, image_url. primary_category_slug is the first entry of each item's `categories` (its type or utility category); goal_slugs joins the goal-* entries with `|`. Empty cells are null in the JSON (no sale, no servings, no expiry or no captured image). Non-physical items (OX-042 to OX-047) have quantity 999 with unlimited_quantity true in their JSON. UTF-8, comma separated, RFC 4180 quoting.

```csv
sku,product_type,name_ar,name_en,brand,price,sale_price,weight_kg,quantity,primary_category_slug,goal_slugs,servings,serving_size,expiry,image_url
OX-001,product,جولد ستاندرد 100% واي بروتين - اوبتيموم نيوترشن,Gold Standard 100% Whey Protein - Optimum Nutrition,Optimum Nutrition,349,,2.5,24,whey-protein,goal-performance|goal-recovery,73,31 جم (مغرفة واحدة),2028-03,https://ecombe.nahdionline.com/media/catalog/product/1/0/103128277_ac32955b69a70e82a.jpg
OX-002,product,نيترو تك 100% واي جولد - مسل تك,Nitro-Tech 100% Whey Gold - MuscleTech,MuscleTech,355,,2.5,18,whey-protein,goal-performance|goal-recovery,69,33 جم (مغرفة واحدة),2028-01,https://ecombe.nahdionline.com/media/catalog/product/1/0/103139742_a9c1d1ff7bdef4f68.jpg
OX-003,product,نيترو تك بيرفورمانس سيريز واي بروتين - مسل تك,Nitro-Tech Performance Series Whey Protein - MuscleTech,MuscleTech,399,,2.0,12,whey-protein,goal-performance,40,44 جم (مغرفة واحدة),2027-12,
OX-004,product,ستاكد بروتين - ايفليوشن نيوترشن,Stacked Protein - EVLution Nutrition,EVLution Nutrition,369,299,2.5,14,whey-protein,goal-recovery|goal-ideal-weight,60,38 جم (مغرفة واحدة),2027-11,https://ecombe.nahdionline.com/media/catalog/product/e/v/evl-stacked-protein-5-lbs-chocolate-decadence-0kjpg.jpg
OX-005,product,ايزو 100 واي ايزوليت محلل مائيا - ديماتيز,ISO100 Hydrolyzed Whey Protein Isolate - Dymatize,Dymatize,489,,2.6,10,whey-isolate,goal-performance|goal-ideal-weight,71,32 جم (مغرفة واحدة),2028-05,
OX-006,product,ايزوبيور لو كارب واي ايزوليت - ايزوبيور,Isopure Low Carb Whey Protein Isolate - Isopure,Isopure,379,,1.55,10,whey-isolate,goal-ideal-weight|goal-general-health,44,31 جم (مغرفة واحدة),2028-02,https://ecombe.nahdionline.com/media/catalog/product/1/0/101043835_a725f783c57ffaa67_25861.png
OX-007,product,واي بروتين ايزوليت بدون نكهة - ناو سبورتس,Whey Protein Isolate Unflavored - NOW Sports,NOW Foods,409,,2.5,9,whey-isolate,goal-general-health|goal-ideal-weight,81,28 جم (مغرفة واحدة),2028-04,https://ecombe.nahdionline.com/media/catalog/product/1/0/102820296_66609dc0b3d077e64.jpg
OX-008,product,واي بروتين ايزوليت - سبورتس ريسيرش,Whey Protein Isolate - Sports Research,Sports Research,349,279,2.5,11,whey-isolate,goal-performance|goal-recovery,65,35 جم (مغرفة واحدة),2027-10,https://ecombe.nahdionline.com/media/catalog/product/s/p/sports-research-whey-protein-isolate-dutch-choco-5-lbs-0hjpg.jpg
OX-009,product,جولد ستاندرد 100% كازين - اوبتيموم نيوترشن,Gold Standard 100% Casein - Optimum Nutrition,Optimum Nutrition,239,,1.05,12,casein,goal-recovery,26,35 جم (مغرفة واحدة),2028-06,https://www.sporter.com/media/catalog/product/u/s/us_gs_casein_2lb_chocsupreme_1.jpg
OX-010,product,ايليت كازين - ديماتيز,Elite Casein - Dymatize,Dymatize,379,,2.0,8,casein,goal-recovery,55,33 جم (مغرفة واحدة),2028-07,https://www.sporter.com/media/catalog/product/d/y/dymatize-elite-casein-4lb-rich-chocolate_1.jpg
OX-011,product,جولد ستاندرد 100% بروتين نباتي - اوبتيموم نيوترشن,Gold Standard 100% Plant-Based Protein - Optimum Nutrition,Optimum Nutrition,209,,0.9,10,plant-protein,goal-general-health|goal-recovery,20,37 جم (مغرفة واحدة),2027-09,https://www.sporter.com/media/catalog/product/1/1/112999-1.jpg
OX-012,product,جوست بروتين نباتي - جوست,Ghost Vegan Protein - Ghost,Ghost,199,,1.05,8,plant-protein,goal-general-health,24,37 جم (مغرفة واحدة),2027-08,https://www.sporter.com/media/catalog/product/g/h/ghost-pancake-butter-2lbs_2.jpg
OX-013,product,سيريس ماس ماس جينر - اوبتيموم نيوترشن,Serious Mass Weight Gainer - Optimum Nutrition,Optimum Nutrition,339,,5.8,8,mass-gainer,goal-ideal-weight,16,334 جم (مغرفتان ممتلئتان),2027-12,https://ecombe.nahdionline.com/media/catalog/product/1/0/101112634_aaf85dd70e8343ac1.jpg
OX-014,product,ترو ماس ماس جينر - بي اس ان,True-Mass Weight Gainer - BSN,BSN,329,269,5.0,7,mass-gainer,goal-ideal-weight|goal-recovery,28,165 جم (3 مغارف),2027-11,https://ecombe.nahdionline.com/media/catalog/product/1/0/103138803_a3b1ae942a893d265_1.jpg
OX-015,product,كرياتين مونوهيدرات مطحون ناعم - اوبتيموم نيوترشن,Micronized Creatine Monohydrate Powder - Optimum Nutrition,Optimum Nutrition,149,,0.75,30,creatine,goal-performance,120,5 جم (ملعقة صغيرة ممتلئة),2028-09,
OX-016,product,كرياتين مونوهيدرات - ثورن,Creatine Monohydrate - Thorne,Thorne,169,,0.6,15,creatine,goal-performance,90,5 جم (مغرفة واحدة),2028-08,
OX-017,product,امينو انرجي - اوبتيموم نيوترشن,Essential Amino Energy - Optimum Nutrition,Optimum Nutrition,129,,0.4,20,pre-workout,goal-energy|goal-performance,30,9 جم (مغرفتان),2028-02,https://www.sporter.com/media/catalog/product/o/p/optimum-amino-energy---blue-raspberry---30-servings.jpg
OX-018,product,بلاك سيريس نوك اوت 2.0 ما قبل التمرين - اوليمب,Black Series Knockout 2.0 Pre-Workout - Olimp Sport Nutrition,Olimp Sport Nutrition,165,,0.42,12,pre-workout,goal-energy|goal-performance,25,12.2 جم (مغرفة واحدة),2027-10,https://www.sporter.com/media/catalog/product/k/n/knokout-olimp-new-2022_2.jpg
OX-019,product,امينو بيلد BCAA - مسل تك,Amino Build BCAA - MuscleTech,MuscleTech,159,,0.5,15,amino-acids,goal-recovery|goal-performance,40,9.9 جم (مغرفة واحدة),2028-01,https://www.sporter.com/media/catalog/product/1/1/113599.jpg
OX-020,product,سوبيريور امينو 2222 أقراص - اوبتيموم نيوترشن,Superior Amino 2222 Tablets - Optimum Nutrition,Optimum Nutrition,109,,0.35,20,amino-acids,goal-recovery,80,قرصان,2028-05,https://www.sporter.com/media/catalog/product/1/6/160kkssla.jpg
OX-021,product,ال-أرجينين 1000 ملجم أقراص - ناو فودز,L-Arginine 1000 mg Tablets - NOW Foods,NOW Foods,99,,0.25,25,amino-acids,goal-performance|goal-energy,60,قرصان,2028-06,https://www.sporter.com/media/catalog/product/n/o/now-l-arginine-n22_1.jpg
OX-022,product,زيت السمك اوميغا 3 الاسكي 1250 ملجم - سبورتس ريسيرش,Alaskan Omega-3 Fish Oil 1250 mg - Sports Research,Sports Research,149,,0.3,22,omega-3,goal-general-health,90,كبسولة هلامية واحدة,2028-04,
OX-023,product,سوبر اوميغا 3-6-9 1200 ملجم - ناو فودز,Super Omega 3-6-9 1200 mg - NOW Foods,NOW Foods,79,,0.25,30,omega-3,goal-general-health,45,كبسولتان هلاميتان,2028-03,
OX-024,product,مغنيسيوم 400 ملجم كبسولات - ناو فودز,Magnesium 400 mg Capsules - NOW Foods,NOW Foods,85,,0.3,35,vitamins-minerals,goal-recovery|goal-general-health,180,كبسولة واحدة,2028-10,
OX-025,product,فيتامين د3 5000 وحدة دولية - ناو فودز,Vitamin D-3 5000 IU High Potency - NOW Foods,NOW Foods,75,,0.12,40,vitamins-minerals,goal-general-health,120,كبسولة هلامية واحدة,2028-11,
OX-026,product,زد ام ايه ZMA - ناو فودز,ZMA Zinc Magnesium B6 - NOW Foods,NOW Foods,115,,0.2,25,vitamins-minerals,goal-recovery,30,3 كبسولات,2028-08,
OX-027,product,فيتامين د3 مع ك2 - سبورتس ريسيرش,Vitamin D3 + K2 - Sports Research,Sports Research,105,,0.1,30,vitamins-minerals,goal-general-health,60,كبسولة هلامية واحدة,2028-09,
OX-028,product,سنتروم للرجال ملتي فيتامين - سنتروم,Centrum Men Multivitamin - Centrum,Centrum,56,,0.1,40,vitamins-minerals,goal-general-health|goal-energy,30,قرص واحد,2028-02,
OX-029,product,كولاجين ببتيدات - فيتال بروتينز,Collagen Peptides - Vital Proteins,Vital Proteins,139,,0.4,18,collagen-beauty,goal-hair-skin|goal-general-health,14,20 جم (مغرفتان),2028-03,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/vtp/vtp00509/u/69.jpg"
OX-030,product,كولاجين ببتيدات من أبقار مرعية - سبورتس ريسيرش,Grass-Fed Collagen Peptides - Sports Research,Sports Research,179,,0.55,16,collagen-beauty,goal-hair-skin,41,11 جم (مغرفة واحدة),2028-05,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/sre/sre01018/u/86.jpg"
OX-031,product,كولاجين ببتيدات مع فيتامين ج وبيوتين أقراص - نيوسيل,Collagen Peptides + Vitamin C and Biotin Tablets - NeoCell,NeoCell,105,,0.45,20,collagen-beauty,goal-hair-skin,90,3 أقراص,2028-04,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nel/nel13262/u/72.jpg"
OX-032,product,بيوتين 10000 ميكروجرام كبسولات - ناو فودز,"Biotin 10,000 mcg Extra Strength Capsules - NOW Foods",NOW Foods,69,,0.1,30,collagen-beauty,goal-hair-skin,120,كبسولة واحدة,2028-07,
OX-033,product,بروبيوتيك-10 25 مليار - ناو فودز,Probiotic-10 25 Billion - NOW Foods,NOW Foods,75,,0.08,25,daily-health,goal-general-health,50,كبسولة واحدة,2027-09,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now02926/u/50.jpg"
OX-034,product,نون سبورت أقراص إلكتروليت فوارة - نون هايدريشن,Nuun Sport Effervescent Electrolyte Tablets - Nuun,Nuun,32,,0.07,40,daily-health,goal-energy|goal-recovery,10,قرص فوار واحد في 470 مل ماء,2027-08,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nuu/nuu02045/u/26.jpg"
OX-035,product,كلوروفريش كلوروفيل سائل بالنعناع - نيتشرز واي,Chlorofresh Liquid Chlorophyll Mint - Nature's Way,Nature's Way,65,,0.6,20,daily-health,goal-general-health,16,30 مل (ملعقتان كبيرتان),2027-07,"https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nwy/nwy03501/u/82.jpg"
OX-036,product,شيكر كلاسيك V2 سعة 820 مل - بلندر بوتل,Classic V2 Shaker Bottle 820 ml - BlenderBottle,BlenderBottle,59,,0.2,40,accessories,goal-performance,1,820 مل,2028-12,
OX-037,food,كارب كيلا بروتين بار علبة 12 - جرينيد,Carb Killa Protein Bar Box of 12 - Grenade,Grenade,175,,0.85,20,snacks-bars,goal-ideal-weight|goal-recovery,12,بار واحد (60 جم),2027-08,
OX-038,food,بروتين تشيبس بنمط التورتيا علبة 8 - كويست,Tortilla Style Protein Chips Box of 8 - Quest Nutrition,Quest Nutrition,125,,0.35,15,snacks-bars,goal-ideal-weight,8,كيس واحد (32 جم),2027-07,
OX-039,food,زبدة الفول السوداني الطبيعية 1 كجم - ماي بروتين,All-Natural Peanut Butter 1 kg - Myprotein,Myprotein,65,,1.15,15,snacks-bars,goal-ideal-weight|goal-general-health,33,30 جم (ملعقة كبيرة ممتلئة),2027-09,
OX-040,food,شوفان سريع التحضير 1 كجم - ماي بروتين,Instant Oats 1 kg - Myprotein,Myprotein,55,,1.1,15,snacks-bars,goal-energy|goal-ideal-weight,20,50 جم (مغرفتان),2027-10,
OX-041,group_products,حزمة البداية - اوبتيمال اكس,Starter Bundle - OptimalX,OptimalX,509,,3.35,10,bundles,goal-performance|goal-general-health,30,حصة من كل منتج يوميا,2028-02,
OX-042,digital,دليل المبتدئين للمكملات الغذائية (PDF),Beginner's Guide to Sports Supplements (PDF),OptimalX,29,,0,999,digital-library,goal-general-health,,,,
OX-043,codes,بطاقة هدية اوبتيمال اكس,OptimalX Gift Card,OptimalX,100,,0,999,gift-cards,,,,,
OX-044,service,سؤال مكتوب لفريق اوبتيمال اكس,Written Question to the OptimalX Team,OptimalX,0,,0,999,services,,,,,
OX-045,booking,استشارة مرئية 20 دقيقة,20-Minute Video Consultation,OptimalX,50,,0,999,services,,,,,
OX-046,booking,زيارة الفرع في المدينة المنورة,Branch Visit in Medina,OptimalX,0,,0,999,services,,,,,
OX-047,booking,جلسة تدريب شخصي 60 دقيقة,60-Minute Personal Training Session,OptimalX,150,,0,999,services,goal-performance,,,,
```

Price status flags for the rows above (the CSV keeps the fixed column set, so the flags sit here): UNVERIFIED OX-036, OX-037, OX-038, OX-039, OX-040; FLAGGED (upper bound only) OX-005; COMPARABLE-SIZE ANCHOR OX-032; ESTIMATE OX-047. All other rows carry a captured Saudi retail figure in their price_basis.

## F. Counts per product_type

| product_type | count | SKUs |
|---|---|---|
| product | 36 | OX-001 to OX-036 |
| food | 4 | OX-037 to OX-040 |
| group_products | 1 | OX-041 |
| digital | 1 | OX-042 |
| codes | 1 | OX-043 |
| service | 1 | OX-044 |
| booking | 3 | OX-045 to OX-047 |
| total | 47 | OX-001 to OX-047 |

Shippable items (require_shipping true): 41. Non-shippable: 6. Items with a sale_price: 3 (OX-004, OX-008, OX-014). Items with options: 42.

## G. Image URLs by source

Upload via URL is possible for the 23 items under nahdi, sporter and iherb (retailer CDN URLs of the exact product unless the note says otherwise). The 18 not-captured items have no URL: the owner saves the image from the page in image_ref and uploads the file. The 6 owner-to-generate items are own-brand services with no retailer image: the owner produces a branded graphic for each. No image is claimed as an official manufacturer asset.

### G.1 nahdi (ecombe.nahdionline.com): 8 items, upload by URL

- OX-001 Gold Standard 100% Whey Protein - Optimum Nutrition: https://ecombe.nahdionline.com/media/catalog/product/1/0/103128277_ac32955b69a70e82a.jpg (4.54 kg tub art, same label design; replace with the 2.27 kg tub image from the brand page)
- OX-002 Nitro-Tech 100% Whey Gold - MuscleTech: https://ecombe.nahdionline.com/media/catalog/product/1/0/103139742_a9c1d1ff7bdef4f68.jpg (3.63 kg tub art, same label design)
- OX-004 Stacked Protein - EVLution Nutrition: https://ecombe.nahdionline.com/media/catalog/product/e/v/evl-stacked-protein-5-lbs-chocolate-decadence-0kjpg.jpg
- OX-006 Isopure Low Carb Whey Protein Isolate - Isopure: https://ecombe.nahdionline.com/media/catalog/product/1/0/101043835_a725f783c57ffaa67_25861.png
- OX-007 Whey Protein Isolate Unflavored - NOW Sports: https://ecombe.nahdionline.com/media/catalog/product/1/0/102820296_66609dc0b3d077e64.jpg
- OX-008 Whey Protein Isolate - Sports Research: https://ecombe.nahdionline.com/media/catalog/product/s/p/sports-research-whey-protein-isolate-dutch-choco-5-lbs-0hjpg.jpg
- OX-013 Serious Mass Weight Gainer - Optimum Nutrition: https://ecombe.nahdionline.com/media/catalog/product/1/0/101112634_aaf85dd70e8343ac1.jpg
- OX-014 True-Mass Weight Gainer - BSN: https://ecombe.nahdionline.com/media/catalog/product/1/0/103138803_a3b1ae942a893d265_1.jpg

### G.2 sporter (www.sporter.com/media/catalog): 9 items, upload by URL

- OX-009 Gold Standard 100% Casein - Optimum Nutrition: https://www.sporter.com/media/catalog/product/u/s/us_gs_casein_2lb_chocsupreme_1.jpg
- OX-010 Elite Casein - Dymatize: https://www.sporter.com/media/catalog/product/d/y/dymatize-elite-casein-4lb-rich-chocolate_1.jpg
- OX-011 Gold Standard 100% Plant-Based Protein - Optimum Nutrition: https://www.sporter.com/media/catalog/product/1/1/112999-1.jpg
- OX-012 Ghost Vegan Protein - Ghost: https://www.sporter.com/media/catalog/product/g/h/ghost-pancake-butter-2lbs_2.jpg
- OX-017 Essential Amino Energy - Optimum Nutrition: https://www.sporter.com/media/catalog/product/o/p/optimum-amino-energy---blue-raspberry---30-servings.jpg
- OX-018 Black Series Knockout 2.0 Pre-Workout - Olimp Sport Nutrition: https://www.sporter.com/media/catalog/product/k/n/knokout-olimp-new-2022_2.jpg
- OX-019 Amino Build BCAA - MuscleTech: https://www.sporter.com/media/catalog/product/1/1/113599.jpg
- OX-020 Superior Amino 2222 Tablets - Optimum Nutrition: https://www.sporter.com/media/catalog/product/1/6/160kkssla.jpg
- OX-021 L-Arginine 1000 mg Tablets - NOW Foods: https://www.sporter.com/media/catalog/product/n/o/now-l-arginine-n22_1.jpg

### G.3 iherb (cloudinary.images-iherb.com): 6 items, upload by URL

- OX-029 Collagen Peptides - Vital Proteins: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/vtp/vtp00509/u/69.jpg
- OX-030 Grass-Fed Collagen Peptides - Sports Research: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/sre/sre01018/u/86.jpg
- OX-031 Collagen Peptides + Vitamin C and Biotin Tablets - NeoCell: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nel/nel13262/u/72.jpg
- OX-033 Probiotic-10 25 Billion - NOW Foods: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now02926/u/50.jpg
- OX-034 Nuun Sport Effervescent Electrolyte Tablets - Nuun: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nuu/nuu02045/u/26.jpg
- OX-035 Chlorofresh Liquid Chlorophyll Mint - Nature's Way: https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nwy/nwy03501/u/82.jpg

### G.4 not-captured: 18 items, owner saves the image from image_ref and uploads the file

- OX-003 Nitro-Tech Performance Series Whey Protein - MuscleTech: image_ref https://www.sporter.com/en-sa/muscletech-nitro-tech-performance-series/
- OX-005 ISO100 Hydrolyzed Whey Protein Isolate - Dymatize: image_ref https://www.sporter.com/en-sa/dymatize-iso-100/
- OX-015 Micronized Creatine Monohydrate Powder - Optimum Nutrition: image_ref https://sa.iherb.com/c/sports?sr=2
- OX-016 Creatine Monohydrate - Thorne: image_ref https://sa.iherb.com/c/sports?sr=2
- OX-022 Alaskan Omega-3 Fish Oil 1250 mg - Sports Research: image_ref https://sa.iherb.com/c/sports?sr=2
- OX-023 Super Omega 3-6-9 1200 mg - NOW Foods: image_ref https://www.sporter.com/en-sa/vitamins/featured/best-sellers/
- OX-024 Magnesium 400 mg Capsules - NOW Foods: image_ref https://www.sporter.com/en-sa/vitamins/minerals/magnesium/
- OX-025 Vitamin D-3 5000 IU High Potency - NOW Foods: image_ref https://www.sporter.com/en-sa/vitamins/essential-vitamins/vitamin-d/
- OX-026 ZMA Zinc Magnesium B6 - NOW Foods: image_ref https://www.sporter.com/en-sa/now-zma/
- OX-027 Vitamin D3 + K2 - Sports Research: image_ref https://sa.iherb.com/c/sports?sr=2
- OX-028 Centrum Men Multivitamin - Centrum: image_ref https://www.sporter.com/en-sa/centrum-men-multivitamin/
- OX-032 Biotin 10,000 mcg Extra Strength Capsules - NOW Foods: image_ref https://www.sporter.com/en-sa/vitamins/beauty/hair-skin-nails/
- OX-036 Classic V2 Shaker Bottle 820 ml - BlenderBottle: image_ref https://www.blenderbottle.com
- OX-037 Carb Killa Protein Bar Box of 12 - Grenade: image_ref https://www.grenade.com/collections/protein-bars
- OX-038 Tortilla Style Protein Chips Box of 8 - Quest Nutrition: image_ref https://www.questnutrition.com/collections/chips
- OX-039 All-Natural Peanut Butter 1 kg - Myprotein: image_ref https://www.myprotein.com/c/nutrition/healthy-food-drinks/spreads/
- OX-040 Instant Oats 1 kg - Myprotein: image_ref https://www.myprotein.com/c/nutrition/healthy-food-drinks/cereal-granola/
- OX-041 Starter Bundle - OptimalX: image_ref composite of the three members: OX-001 (nahdi image in batch-01), OX-015 and OX-028 (not captured); the owner shoots one bundle photo

### G.5 owner-to-generate: 6 items, branded graphic to produce

- OX-042 Beginner's Guide to Sports Supplements (PDF) (digital)
- OX-043 OptimalX Gift Card (codes)
- OX-044 Written Question to the OptimalX Team (service)
- OX-045 20-Minute Video Consultation (booking)
- OX-046 Branch Visit in Medina (booking)
- OX-047 60-Minute Personal Training Session (booking)
