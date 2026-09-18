# OptimalX (اوبتيمال اكس) FINAL mock catalogue for the Salla merchant API

Prepared 2026-09-17. Currency SAR, all prices VAT inclusive (15%). One branch, Medina. Written incrementally: category tree and brands first, then products in batches of six, then price-band rationale and the CSV table.

Reading rules for this file
- Every product is one fenced JSON object, ready to paste. Field names are stable across all items.
- `price_source_url` is the page where the Saudi retail price was read on 2026-09-17. `price_basis` says how the OptimalX price was derived from it.
- `image_url` is a retailer CDN URL of the exact product unless `image_source` says otherwise. No brand press kit was fetched this session (fetch budget was spent on prices), so no image is claimed as "official manufacturer". `image_source` values: `sporter` (www.sporter.com/media/catalog), `nahdi` (ecombe.nahdionline.com), `iherb` (cloudinary.images-iherb.com), `not-captured` (owner saves the image from the retailer or brand page linked in `image_ref`).
- Arabic is MSA, no diacritics, no dialect, no em-dashes. No treatment, cure, fat-burning, weight-loss or outcome promises. Verbs used: يدعم، يساهم، مناسب لـ، يحتوي على.
- The spec line at the top of every `description_html_ar` follows exactly: `<p>الحصص: N | حجم الحصة: X | الصلاحية: YYYY-MM | الشكل: ...</p>` with الشكل in {بودرة, كبسولات, أقراص, سائل, بار, عبوة}.
- Fetch budget used this session: 12 page fetches (Sporter home nav, Sporter energy-endurance, aminos-recovery, casein, plant-based, protein-bars, spreads; iHerb SA collagen, probiotics, electrolytes, greens-superfoods; Nahdi protein PLP). Prices from the earlier logs in products-trending.md are reused with their URLs.
- Two gaps stayed open: no Saudi retail price was captured for peanut butter (Sporter's spreads page lists only hazelnut protein spreads) or for a shaker bottle. The shaker (OX-036) is included with an estimate and is flagged UNVERIFIED in `price_basis` and in the CSV. No peanut butter item is included.

## A. Category tree

Slugs are Latin, lowercase, hyphenated, and are what the API `categories` field references in every product below. "Type" categories are the canonical home of a product (one per product). "Goal" collections are secondary and a product can belong to several.

### A.1 Type categories

| # | Arabic name (MSA) | English name | Slug | Parent | Label evidence on Saudi retailers (2026-09-17) |
|---|---|---|---|---|---|
| 1 | بروتين | Protein | protein | (root) | Sporter ar-sa "بروتين باودر"; Dr. Nutrition "واى بروتين" as a footer section. MSA form kept short: بروتين. |
| 1.1 | واي بروتين | Whey Protein | whey-protein | protein | Sporter ar-sa third-level label "واي بروتين" (verbatim). |
| 1.2 | واي بروتين ايزوليت | Whey Protein Isolate | whey-isolate | protein | Sporter ar-sa "واي بروتين ايزوليت" (verbatim); Nahdi en "Iso Whey Protein". |
| 1.3 | بروتين كازين | Casein Protein | casein | protein | Sporter ar-sa "بروتين كازين" (verbatim); Nahdi "Casein Protein". |
| 1.4 | بروتين نباتي | Plant Protein | plant-protein | protein | Sporter ar-sa "بروتين نباتي" (verbatim); Nahdi "Vegan Protein". |
| 1.5 | ماس جينر | Mass Gainer | mass-gainer | protein | Sporter ar-sa category is "بروتين زيادة الوزن" but product names and buyers use the transliteration "ماس جينر" (Sporter house product "سبورتر - ماس جينر"); Nahdi "Mass Gainer". |
| 2 | كرياتين | Creatine | creatine | (root) | Sporter ar-sa "كرياتين" (verbatim); Salla stores Supplement Planet and Power Mode both have a كرياتين category. |
| 3 | ما قبل التمرين | Pre-Workout | pre-workout | (root) | Sporter ar-sa uses the transliteration "بري ورك اوت, مكملات تعزيز الطاقة"; MSA label used here, transliteration kept as a tag for search. |
| 4 | الأحماض الأمينية | Amino Acids (BCAA, EAA, Glutamine) | amino-acids | (root) | Sporter ar-sa "احماض امينية, استشفاء عضلي" (hamza normalised to MSA here); sub-labels seen: BCAA, EAA, جلوتامين, الأرجينين, السيترولين. |
| 5 | اوميغا 3 والزيوت | Omega-3 & Oils | omega-3 | (root) | Sporter ar-sa "زيت السمك و الأوميجا ٣"; the brief's label kept for consistency with store copy. |
| 6 | الفيتامينات والمعادن | Vitamins & Minerals | vitamins-minerals | (root) | Sporter ar-sa top level "الفيتامينات والصحة" with children "ملتي فيتامين", "المعادن", "فيتامينات أساسية"; Dr. Nutrition "مالتي فيتامين". |
| 7 | الكولاجين والجمال | Collagen & Beauty | collagen-beauty | (root) | Sporter ar-sa "الجمال" with children "كولاجين", "الشعر والبشرة والأظافر"; Dr. Nutrition "الجمال والعناية". |
| 8 | الصحة اليومية | Daily Health (probiotics, greens, electrolytes) | daily-health | (root) | Sporter ar-sa "الهضم والبروبيوتيك", "منتجات صحية", "الكترولايتس وترطيب"; Dr. Nutrition "الصحة والعافية". |
| 9 | سناكات وبروتين بار | Snacks & Protein Bars | snacks-bars | (root) | Sporter ar-sa top level "الأغذية الصحية"; Sporter en "Protein Bars", "Healthy Snacks"; Dr. Nutrition "الأغذية الصحية". |
| 10 | الإكسسوارات | Accessories | accessories | (root) | Dr. Nutrition "إكسسوارات وملابس رياضية", "معدات رياضية"; bodybuilding.com "Shakers & Gear". |

### A.2 Utility categories (needed for the non-physical product types)

| # | Arabic name (MSA) | English name | Slug | Parent | Holds |
|---|---|---|---|---|---|
| 11 | الحزم | Bundles | bundles | (root) | product_type group_products |
| 12 | الاستشارات والخدمات | Consultations & Services | services | (root) | product_type service and booking |
| 13 | المكتبة الرقمية | Digital Library | digital-library | (root) | product_type digital |
| 14 | بطاقات الهدايا | Gift Cards | gift-cards | (root) | product_type codes |

### A.3 Goal collections (secondary, many-to-many)

| # | Arabic name (MSA) | English name | Slug | Scope note (claims-safe) |
|---|---|---|---|---|
| G1 | الطاقة | Energy | goal-energy | Pre-workouts, caffeinated aminos, B vitamins, electrolytes. Sporter women's goal menu uses "الطاقة والتحمل". |
| G2 | الصحة العامة | General Health | goal-general-health | Multivitamins, omega-3, vitamin D, probiotics, greens. Sporter women's goal menu uses "الصحة العامة" (verbatim). |
| G3 | الأداء | Performance | goal-performance | Creatine, pre-workout, whey, EAA. |
| G4 | التعافي | Recovery | goal-recovery | Casein, glutamine, BCAA, magnesium, ZMA, electrolytes. Sporter ar-sa pairs aminos with "استشفاء عضلي". |
| G5 | الشعر والبشرة | Hair & Skin | goal-hair-skin | Collagen, biotin, marine collagen. Sporter women's goal menu uses "الشعر والبشرة والأظافر". |
| G6 | الوزن المثالي | Ideal Weight | goal-ideal-weight | Both directions, without outcome promises: mass gainers and calorie-dense shakes for people who want to add weight within a planned diet, and high-protein low-sugar snacks or isolates for people managing intake. Copy never states an amount or rate of change. |

## B. Brand list

Official sites are given from brand knowledge and were NOT fetched this session (the 12-fetch budget went to prices), so treat them as "verify before creating the brand in Salla". No press kit or official image page was located this session; column kept so the owner can fill it.

| Brand (API name) | Arabic transliteration used in names | Country | Official site | Official product-image page / press kit |
|---|---|---|---|---|
| Optimum Nutrition | اوبتيموم نيوترشن | USA (Glanbia Performance Nutrition) | https://www.optimumnutrition.com | not located this session |
| MuscleTech | مسل تك | Canada / USA (Iovate Health Sciences) | https://www.muscletech.com | not located this session |
| EVLution Nutrition | ايفليوشن نيوترشن | USA | https://www.evlnutrition.com | not located this session |
| Dymatize | ديماتيز | USA | https://www.dymatize.com | not located this session |
| Isopure | ايزوبيور | USA (Glanbia) | https://www.theisopurecompany.com | not located this session |
| NOW Foods (NOW Sports) | ناو فودز | USA | https://www.nowfoods.com | not located this session |
| Sports Research | سبورتس ريسيرش | USA | https://www.sportsresearch.com | not located this session |
| Ghost | جوست | USA | https://www.ghostlifestyle.com | not located this session |
| BSN | بي اس ان | USA (Glanbia) | https://www.gobsn.com | not located this session |
| Thorne | ثورن | USA | https://www.thorne.com | not located this session |
| Olimp Sport Nutrition | اوليمب | Poland | https://www.olimpsport.com | not located this session |
| Vital Proteins | فيتال بروتينز | USA (Nestle Health Science) | https://www.vitalproteins.com | not located this session |
| NeoCell | نيوسيل | USA | https://www.neocell.com | not located this session |
| Nuun | نون هايدريشن | USA (Nestle Health Science) | https://nuunlife.com | not located this session |
| Nature's Way | نيتشرز واي | USA | https://www.naturesway.com | not located this session |
| BlenderBottle | بلندر بوتل | USA | https://www.blenderbottle.com | not located this session |
| Quest Nutrition | كويست | USA (Simply Good Foods) | https://www.questnutrition.com | not located this session |
| Grenade | جرينيد | UK | https://www.grenade.com | not located this session |
| Born Winner | بورن وينر | Bulgaria (unverified) | unverified; product seen on Nahdi Online | not located this session |
| BombBar | بومبار | Russia (unverified) | unverified; product seen on Sporter KSA | not located this session |
| OptimalX (own) | اوبتيمال اكس | Saudi Arabia (Medina) | store domain | n/a (bundle, digital guide, gift card, services) |

## C. Items

Field order in every JSON object: sku, product_type, name_ar, name_en, brand, subtitle_ar, subtitle_en, price, sale_price, weight_kg, quantity, require_shipping, categories, servings, serving_size, expiry, options, image_url, image_source, image_ref, price_source_url, price_basis, description_html_ar, description_html_en, metadata_title_ar, metadata_description_ar, metadata_title_en, metadata_description_en, goal_fit, tags.

