### Batch 7 (OX-037 to OX-041): snacks (product_type food) and the starter bundle (product_type group_products)

Notes on this batch:
- Prices of OX-037 to OX-040 are UNVERIFIED. Four price checks were attempted on 2026-09-17 and none returned a usable Saudi figure: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403; two Sporter KSA catalogsearch URLs rendered the default result set ("Search results for 'any'", eight unrelated out-of-stock items) instead of the query. Each price_basis states the estimate and the page the owner should read before publishing, and the four rows are flagged UNVERIFIED in the CSV (FINAL-catalogue-tail.md, section E), like OX-036.
- Nutrition rows are transcribed from the brands' standard labels and must be checked against the physical pack; bar and chip values vary by flavour.
- Myprotein is a new brand for section B: Arabic transliteration ماي بروتين, UK, https://www.myprotein.com (the captured Myprotein page is the UK storefront in GBP, so it gives no Saudi price), sold in Saudi Arabia through Noon KSA (brand store seen in products-trending.md Log 3).
- OX-041 adds one key, bundle_items, listing the member SKUs; every other key mirrors the physical-product format. Bundle price SAR 509 = 8.1% below the SAR 554 sum of OX-001, OX-015 and OX-028. Its spec line keeps the four fields with الشكل: عبوة and the earliest member expiry; its table lists contents instead of nutrition.
- Open point for the owner: the OX-036 (shaker) copy in batch-06 says the shaker is included in the starter bundle, but the brief fixes the bundle at three members. Either add OX-036 as a fourth member (sum SAR 613, 8% below = SAR 564) or remove that sentence from OX-036.

```json
{
  "sku": "OX-037",
  "product_type": "food",
  "name_ar": "كارب كيلا بروتين بار علبة 12 - جرينيد",
  "name_en": "Carb Killa Protein Bar Box of 12 - Grenade",
  "brand": "Grenade",
  "subtitle_ar": "20 جم بروتين و1.5 جم سكر في كل بار 60 جم، علبة 12 بار",
  "subtitle_en": "20 g protein and 1.5 g sugar per 60 g bar, box of 12 bars",
  "price": 175,
  "sale_price": null,
  "weight_kg": 0.85,
  "quantity": 20,
  "require_shipping": true,
  "categories": ["snacks-bars", "goal-ideal-weight", "goal-recovery"],
  "servings": 12,
  "serving_size": "بار واحد (60 جم)",
  "expiry": "2027-08",
  "options": {"النكهة": ["كوكيز الشوكولاتة البيضاء", "كراميل كاوس", "كوكيز وكريمة", "عجينة الكوكيز"]},
  "image_url": "",
  "image_source": "not-captured",
  "image_ref": "https://www.grenade.com/collections/protein-bars",
  "price_source_url": "https://www.sporter.com/en-sa/catalogsearch/result/?q=grenade+barebells+quest+chips",
  "price_basis": "UNVERIFIED. Four price checks were attempted on 2026-09-17 and none returned a usable Saudi figure: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403, and two Sporter KSA catalogsearch pages rendered the default result set (\"Search results for 'any'\", eight unrelated out-of-stock items) instead of the query. SAR 175 for a box of 12 (about SAR 14.60 per bar) is an estimate placed at the level of a mid-range imported protein bar and must be replaced with the Grenade box price read on Sporter KSA (search 'grenade' on the site) or Nahdi Online before publishing.",
  "description_html_ar": "<p>الحصص: 12 | حجم الحصة: 60 جم | الصلاحية: 2027-08 | الشكل: بار</p><p>كارب كيلا من جرينيد بار بروتين بطبقات مقرمشة وغطاء شوكولاتة، يحتوي كل بار على 20 جم بروتين و1.5 جم سكر فقط. مناسب لمن يريد وجبة خفيفة عالية البروتين في العمل أو بعد التمرين بدل الحلويات، ولمن يتابع مدخول السكر ضمن نظام غذائي مخطط. العلبة تحتوي على 12 بارا من نكهة واحدة.</p><table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr><tr><td>السعرات الحرارية</td><td>219</td></tr><tr><td>البروتين</td><td>20 جم</td></tr><tr><td>الكربوهيدرات</td><td>13 جم</td></tr><tr><td>السكريات</td><td>1.5 جم</td></tr><tr><td>الدهون</td><td>8 جم</td></tr><tr><td>الألياف</td><td>5 جم</td></tr></table><p>طريقة الاستخدام: بار واحد كوجبة خفيفة بين الوجبات أو بعد التمرين. يحفظ في مكان بارد وجاف بعيدا عن الشمس.</p><p>تنبيه: يحتوي على الحليب والصويا وقد يحتوي على آثار من المكسرات. القيم الغذائية تختلف قليلا بين النكهات، راجع الملصق.</p>",
  "description_html_en": "<p>Servings: 12 | Serving size: 60 g | Expiry: 2027-08 | Form: bar</p><p>Grenade Carb Killa is a layered protein bar with a crispy centre and a chocolate coating, giving 20 g of protein and only 1.5 g of sugar per bar. It suits anyone who wants a high-protein snack at work or after training instead of sweets, and people who track sugar intake inside a planned diet. The box holds 12 bars of one flavour.</p><table><tr><th>Nutrition facts</th><th>Per serving</th></tr><tr><td>Calories</td><td>219</td></tr><tr><td>Protein</td><td>20 g</td></tr><tr><td>Carbohydrates</td><td>13 g</td></tr><tr><td>Sugars</td><td>1.5 g</td></tr><tr><td>Fat</td><td>8 g</td></tr><tr><td>Fibre</td><td>5 g</td></tr></table><p>Directions: one bar as a snack between meals or after training. Store in a cool, dry place away from sunlight.</p><p>Notice: contains milk and soy and may contain traces of nuts. Values vary slightly between flavours; check the label.</p>",
  "metadata_title_ar": "كارب كيلا بروتين بار علبة 12 من جرينيد | اوبتيمال اكس",
  "metadata_description_ar": "كارب كيلا بروتين بار من جرينيد بعلبة 12 بار: 20 جم بروتين و1.5 جم سكر في كل بار 60 جم بطبقات مقرمشة وغطاء شوكولاتة، أربع نكهات، سعر شامل الضريبة وتوصيل سريع.",
  "metadata_title_en": "Grenade Carb Killa Protein Bar Box of 12 | OptimalX",
  "metadata_description_en": "Buy Grenade Carb Killa protein bars in Saudi Arabia: 20 g protein and 1.5 g sugar per 60 g bar, crispy layers with a chocolate coating, box of 12, four flavours.",
  "goal_fit": ["الوزن المثالي", "التعافي"],
  "tags": ["بروتين بار", "جرينيد", "كارب كيلا", "سناك بروتين", "وجبة خفيفة"]
}
```

```json
{
  "sku": "OX-038",
  "product_type": "food",
  "name_ar": "بروتين تشيبس بنمط التورتيا علبة 8 - كويست",
  "name_en": "Tortilla Style Protein Chips Box of 8 - Quest Nutrition",
  "brand": "Quest Nutrition",
  "subtitle_ar": "19 جم بروتين و4 جم كربوهيدرات في كل كيس 32 جم، علبة 8 أكياس",
  "subtitle_en": "19 g protein and 4 g carbohydrates per 32 g bag, box of 8 bags",
  "price": 125,
  "sale_price": null,
  "weight_kg": 0.35,
  "quantity": 15,
  "require_shipping": true,
  "categories": ["snacks-bars", "goal-ideal-weight"],
  "servings": 8,
  "serving_size": "كيس واحد (32 جم)",
  "expiry": "2027-07",
  "options": {"النكهة": ["ناتشو تشيز", "رانش", "تشيلي لايم"]},
  "image_url": "",
  "image_source": "not-captured",
  "image_ref": "https://www.questnutrition.com/collections/chips",
  "price_source_url": "https://sa.iherb.com/c/quest-nutrition?sr=2",
  "price_basis": "UNVERIFIED. Four price checks were attempted on 2026-09-17 and none returned a usable Saudi figure: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403, and two Sporter KSA catalogsearch pages rendered the default result set (\"Search results for 'any'\", eight unrelated out-of-stock items) instead of the query. SAR 125 for a box of 8 bags (about SAR 15.60 per bag) is an estimate and must be replaced with the figure read on the iHerb SA Quest brand page (the URL above, opened in a browser) or on Sporter KSA before publishing.",
  "description_html_ar": "<p>الحصص: 8 | حجم الحصة: 32 جم | الصلاحية: 2027-07 | الشكل: عبوة</p><p>بروتين تشيبس من كويست رقائق بنمط التورتيا مصنوعة من بروتين الحليب بدل الذرة، يحتوي كل كيس على 19 جم بروتين و4 جم كربوهيدرات فقط. مناسبة لمن يشتهي وجبة مالحة مقرمشة أثناء مشاهدة مباراة أو في السيارة دون التخلي عن هدف البروتين اليومي. العلبة تحتوي على 8 أكياس من نكهة واحدة.</p><table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr><tr><td>السعرات الحرارية</td><td>140</td></tr><tr><td>البروتين</td><td>19 جم</td></tr><tr><td>الكربوهيدرات</td><td>4 جم</td></tr><tr><td>السكريات</td><td>أقل من 1 جم</td></tr><tr><td>الدهون</td><td>4.5 جم</td></tr><tr><td>الألياف</td><td>1 جم</td></tr></table><p>طريقة الاستخدام: كيس واحد كوجبة خفيفة في أي وقت. يفتح الكيس ويؤكل مباشرة ولا يحتاج إلى تحضير.</p><p>تنبيه: يحتوي على الحليب وقد يحتوي على آثار من الصويا. يحفظ بعيدا عن الحرارة والرطوبة.</p>",
  "description_html_en": "<p>Servings: 8 | Serving size: 32 g | Expiry: 2027-07 | Form: pack</p><p>Quest Protein Chips are tortilla-style crisps made from milk protein instead of corn, with 19 g of protein and only 4 g of carbohydrates per bag. They suit anyone craving a salty, crunchy snack while watching a match or on the road without giving up the daily protein target. The box holds 8 bags of one flavour.</p><table><tr><th>Nutrition facts</th><th>Per serving</th></tr><tr><td>Calories</td><td>140</td></tr><tr><td>Protein</td><td>19 g</td></tr><tr><td>Carbohydrates</td><td>4 g</td></tr><tr><td>Sugars</td><td>under 1 g</td></tr><tr><td>Fat</td><td>4.5 g</td></tr><tr><td>Fibre</td><td>1 g</td></tr></table><p>Directions: one bag as a snack at any time. Open and eat straight from the bag, no preparation needed.</p><p>Notice: contains milk and may contain traces of soy. Store away from heat and humidity.</p>",
  "metadata_title_ar": "كويست بروتين تشيبس تورتيا علبة 8 أكياس | اوبتيمال اكس",
  "metadata_description_ar": "بروتين تشيبس بنمط التورتيا من كويست بعلبة 8 أكياس: 19 جم بروتين و4 جم كربوهيدرات في كل كيس 32 جم، ثلاث نكهات مالحة مقرمشة، سعر شامل الضريبة وتوصيل سريع.",
  "metadata_title_en": "Quest Tortilla Style Protein Chips Box of 8 | OptimalX",
  "metadata_description_en": "Order Quest Nutrition tortilla style protein chips in Saudi Arabia: 19 g protein and 4 g carbs per 32 g bag, box of 8 bags, nacho cheese, ranch and chili lime.",
  "goal_fit": ["الوزن المثالي"],
  "tags": ["بروتين تشيبس", "كويست", "سناك مالح", "وجبة خفيفة عالية البروتين"]
}
```

```json
{
  "sku": "OX-039",
  "product_type": "food",
  "name_ar": "زبدة الفول السوداني الطبيعية 1 كجم - ماي بروتين",
  "name_en": "All-Natural Peanut Butter 1 kg - Myprotein",
  "brand": "Myprotein",
  "subtitle_ar": "فول سوداني محمص 100% بلا سكر أو ملح مضاف، ناعمة أو مقرمشة، عبوة 1 كجم",
  "subtitle_en": "100% roasted peanuts with no added sugar or salt, smooth or crunchy, 1 kg tub",
  "price": 65,
  "sale_price": null,
  "weight_kg": 1.15,
  "quantity": 15,
  "require_shipping": true,
  "categories": ["snacks-bars", "goal-ideal-weight", "goal-general-health"],
  "servings": 33,
  "serving_size": "30 جم (ملعقة كبيرة ممتلئة)",
  "expiry": "2027-09",
  "options": {"القوام": ["ناعمة", "مقرمشة"]},
  "image_url": "",
  "image_source": "not-captured",
  "image_ref": "https://www.myprotein.com/c/nutrition/healthy-food-drinks/spreads/",
  "price_source_url": "https://www.noon.com/saudi-en/health/sports-nutrition/protein/",
  "price_basis": "UNVERIFIED. Four price checks were attempted on 2026-09-17 and none returned a usable Saudi figure: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403, and two Sporter KSA catalogsearch pages rendered the default result set (\"Search results for 'any'\", eight unrelated out-of-stock items) instead of the query. The Noon KSA URL is the discovery page from products-trending.md Log 3 where the Myprotein brand store was seen, not a captured price. SAR 65 for 1 kg is an estimate in the band of single-ingredient peanut butters sold on Noon KSA and must be replaced with the Myprotein or Sporter house-brand figure before publishing.",
  "description_html_ar": "<p>الحصص: 33 | حجم الحصة: 30 جم | الصلاحية: 2027-09 | الشكل: عبوة</p><p>زبدة الفول السوداني الطبيعية من ماي بروتين مصنوعة من الفول السوداني المحمص فقط، بلا سكر أو ملح أو زيت نخيل مضاف، وقد تنفصل طبقة زيت في الأعلى وهذا طبيعي في المنتج بمكون واحد. مناسبة لمن يريد مصدر بروتين ودهون من مكون واحد على الخبز أو في الشوفان أو مشروب الواي، ولمن يحتاج سعرات إضافية ضمن نظام غذائي مخطط.</p><table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr><tr><td>السعرات الحرارية</td><td>180</td></tr><tr><td>البروتين</td><td>9 جم</td></tr><tr><td>الكربوهيدرات</td><td>4 جم</td></tr><tr><td>السكريات</td><td>2 جم</td></tr><tr><td>الدهون</td><td>14 جم</td></tr><tr><td>الألياف</td><td>2.5 جم</td></tr></table><p>طريقة الاستخدام: ملعقة كبيرة ممتلئة على الخبز أو مع الشوفان أو في الشيكر مع الحليب. تقلب جيدا قبل الاستخدام الأول وتحفظ مغلقة.</p><p>تنبيه: يحتوي على الفول السوداني وقد يحتوي على آثار من مكسرات أخرى. غير مناسب لمن لديه حساسية من الفول السوداني.</p>",
  "description_html_en": "<p>Servings: 33 | Serving size: 30 g | Expiry: 2027-09 | Form: tub</p><p>Myprotein All-Natural Peanut Butter is made from roasted peanuts only, with no added sugar, salt or palm oil, so a layer of oil may separate on top, which is normal for a single-ingredient product. It suits anyone who wants protein and fat from one ingredient on bread, in oats or in a whey shake, and people who need extra calories inside a planned diet.</p><table><tr><th>Nutrition facts</th><th>Per serving</th></tr><tr><td>Calories</td><td>180</td></tr><tr><td>Protein</td><td>9 g</td></tr><tr><td>Carbohydrates</td><td>4 g</td></tr><tr><td>Sugars</td><td>2 g</td></tr><tr><td>Fat</td><td>14 g</td></tr><tr><td>Fibre</td><td>2.5 g</td></tr></table><p>Directions: one heaped tablespoon on bread, in oats or in a shaker with milk. Stir well before first use and keep the lid closed.</p><p>Notice: contains peanuts and may contain traces of other nuts. Not suitable for anyone with a peanut allergy.</p>",
  "metadata_title_ar": "زبدة الفول السوداني الطبيعية 1 كجم ماي بروتين | اوبتيمال اكس",
  "metadata_description_ar": "زبدة الفول السوداني الطبيعية من ماي بروتين بعبوة 1 كجم: فول سوداني محمص 100% بلا سكر أو ملح أو زيت نخيل مضاف، ناعمة أو مقرمشة، 33 حصة، سعر شامل الضريبة.",
  "metadata_title_en": "Myprotein All-Natural Peanut Butter 1 kg Tub | OptimalX",
  "metadata_description_en": "Shop Myprotein All-Natural Peanut Butter in Saudi Arabia: 100% roasted peanuts with no added sugar, salt or palm oil, smooth or crunchy, 1 kg tub, 33 servings.",
  "goal_fit": ["الوزن المثالي", "الصحة العامة"],
  "tags": ["زبدة الفول السوداني", "ماي بروتين", "بينت بتر", "مكون واحد", "وجبة خفيفة"]
}
```

```json
{
  "sku": "OX-040",
  "product_type": "food",
  "name_ar": "شوفان سريع التحضير 1 كجم - ماي بروتين",
  "name_en": "Instant Oats 1 kg - Myprotein",
  "brand": "Myprotein",
  "subtitle_ar": "شوفان كامل مطحون ناعما يخلط في الشيكر، 20 حصة من 50 جم، بدون نكهة",
  "subtitle_en": "Finely milled whole oats that mix in a shaker, 20 servings of 50 g, unflavoured",
  "price": 55,
  "sale_price": null,
  "weight_kg": 1.1,
  "quantity": 15,
  "require_shipping": true,
  "categories": ["snacks-bars", "goal-energy", "goal-ideal-weight"],
  "servings": 20,
  "serving_size": "50 جم (مغرفتان)",
  "expiry": "2027-10",
  "options": {"الحجم": ["1 كجم", "2.5 كجم"]},
  "image_url": "",
  "image_source": "not-captured",
  "image_ref": "https://www.myprotein.com/c/nutrition/healthy-food-drinks/cereal-granola/",
  "price_source_url": "https://www.noon.com/saudi-en/health/sports-nutrition/protein/",
  "price_basis": "UNVERIFIED. Four price checks were attempted on 2026-09-17 and none returned a usable Saudi figure: iHerb SA /c/peanut-butter and /c/quest-nutrition answered HTTP 403, and two Sporter KSA catalogsearch pages rendered the default result set (\"Search results for 'any'\", eight unrelated out-of-stock items) instead of the query. The Noon KSA URL is the discovery page from products-trending.md Log 3 where the Myprotein brand store was seen, not a captured price. SAR 55 for 1 kg and SAR 119 for the 2.5 kg variant are estimates and must be replaced with the Myprotein figure on Noon KSA or a Sporter house-brand oats figure before publishing.",
  "description_html_ar": "<p>الحصص: 20 | حجم الحصة: 50 جم | الصلاحية: 2027-10 | الشكل: بودرة</p><p>شوفان سريع التحضير من ماي بروتين شوفان كامل مطحون ناعما حتى يمكن خلطه في الشيكر مع الحليب أو الماء دون طبخ، بمكون واحد ودون نكهة أو سكر مضاف. مصدر كربوهيدرات يناسب وجبة الإفطار أو ما قبل التمرين، ويناسب من يضيفه إلى مشروب الواي لتحويله إلى وجبة كاملة. عبوة 1 كجم تكفي 20 حصة.</p><table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr><tr><td>السعرات الحرارية</td><td>185</td></tr><tr><td>البروتين</td><td>5.5 جم</td></tr><tr><td>الكربوهيدرات</td><td>30 جم</td></tr><tr><td>السكريات</td><td>0.5 جم</td></tr><tr><td>الدهون</td><td>4 جم</td></tr><tr><td>الألياف</td><td>5 جم</td></tr></table><p>طريقة الاستخدام: تخلط مغرفتان (50 جم) مع 300 مل من الماء أو الحليب في الشيكر، أو تطبخ كعصيدة مع الماء الساخن.</p><p>تنبيه: يحتوي على الجلوتين (شوفان) وقد يحتوي على آثار من الحليب والصويا. يحفظ مغلقا في مكان جاف.</p>",
  "description_html_en": "<p>Servings: 20 | Serving size: 50 g | Expiry: 2027-10 | Form: powder</p><p>Myprotein Instant Oats are whole oats milled finely enough to mix in a shaker with milk or water without cooking, with one ingredient and no added flavour or sugar. They are a carbohydrate source that suits breakfast or the pre-training meal, and anyone who adds them to a whey shake to turn it into a full meal. The 1 kg tub gives 20 servings.</p><table><tr><th>Nutrition facts</th><th>Per serving</th></tr><tr><td>Calories</td><td>185</td></tr><tr><td>Protein</td><td>5.5 g</td></tr><tr><td>Carbohydrates</td><td>30 g</td></tr><tr><td>Sugars</td><td>0.5 g</td></tr><tr><td>Fat</td><td>4 g</td></tr><tr><td>Fibre</td><td>5 g</td></tr></table><p>Directions: mix two scoops (50 g) with 300 ml of water or milk in a shaker, or cook as porridge with hot water.</p><p>Notice: contains gluten (oats) and may contain traces of milk and soy. Keep sealed in a dry place.</p>",
  "metadata_title_ar": "شوفان سريع التحضير 1 كجم من ماي بروتين | اوبتيمال اكس",
  "metadata_description_ar": "شوفان سريع التحضير من ماي بروتين بعبوة 1 كجم و20 حصة: شوفان كامل مطحون ناعما يخلط في الشيكر دون طبخ، بمكون واحد وبدون سكر مضاف، سعر شامل الضريبة وتوصيل سريع.",
  "metadata_title_en": "Myprotein Instant Oats 1 kg Finely Milled Oats | OptimalX",
  "metadata_description_en": "Buy Myprotein Instant Oats in Saudi Arabia: finely milled whole oats that mix in a shaker without cooking, single ingredient, no added sugar, 1 kg tub with 20 servings.",
  "goal_fit": ["الطاقة", "الوزن المثالي"],
  "tags": ["شوفان", "ماي بروتين", "شوفان سريع التحضير", "كربوهيدرات", "إفطار"]
}
```

```json
{
  "sku": "OX-041",
  "product_type": "group_products",
  "name_ar": "حزمة البداية - اوبتيمال اكس",
  "name_en": "Starter Bundle - OptimalX",
  "brand": "OptimalX",
  "subtitle_ar": "واي بروتين وكرياتين وملتي فيتامين في حزمة واحدة بسعر أقل من مجموعها",
  "subtitle_en": "Whey protein, creatine and a multivitamin in one bundle, priced below their sum",
  "price": 509,
  "sale_price": null,
  "weight_kg": 3.35,
  "quantity": 10,
  "require_shipping": true,
  "categories": ["bundles", "goal-performance", "goal-general-health"],
  "bundle_items": ["OX-001", "OX-015", "OX-028"],
  "servings": 30,
  "serving_size": "حصة من كل منتج يوميا",
  "expiry": "2028-02",
  "options": {"نكهة الواي": ["شوكولاتة غنية مزدوجة", "فانيلا آيس كريم", "كوكيز وكريمة"]},
  "image_url": "",
  "image_source": "not-captured",
  "image_ref": "composite of the three members: OX-001 (nahdi image in batch-01), OX-015 and OX-028 (not captured); the owner shoots one bundle photo",
  "price_source_url": "internal: OX-001 (batch-01), OX-015 (batch-03), OX-028 (batch-05)",
  "price_basis": "Sum of the members at list price: OX-001 SAR 349 + OX-015 SAR 149 + OX-028 SAR 56 = SAR 554. Bundle SAR 509 is 8.1% below that sum (saving SAR 45). Each member keeps its own verification status: OX-001 is anchored on the Nahdi per-lb band, OX-015 on iHerb SA, OX-028 on Sporter KSA. The whey flavour option is the only variant; the 2.27 kg size is fixed.",
  "description_html_ar": "<p>الحصص: 30 يوما | حجم الحصة: حصة من كل منتج | الصلاحية: 2028-02 | الشكل: عبوة</p><p>حزمة البداية تجمع ثلاثة منتجات أساسية للمبتدئين: جولد ستاندرد واي بروتين 2.27 كجم من اوبتيموم نيوترشن، وكرياتين مونوهيدرات 600 جم من اوبتيموم نيوترشن، وسنتروم للرجال ملتي فيتامين 30 قرصا. مناسبة لمن يشترك في النادي لأول مرة ويريد أساسا بسيطا دون مقارنة عشرات المنتجات، بسعر أقل بنحو 8% من شراء المنتجات منفردة.</p><table><tr><th>محتويات الحزمة</th><th>التفاصيل</th></tr><tr><td>واي بروتين (OX-001)</td><td>2.27 كجم، 73 حصة، 349 ريال منفردا</td></tr><tr><td>كرياتين (OX-015)</td><td>600 جم، 120 حصة، 149 ريال منفردا</td></tr><tr><td>ملتي فيتامين (OX-028)</td><td>30 قرصا، 56 ريال منفردا</td></tr><tr><td>مجموع الأسعار منفردة</td><td>554 ريال</td></tr><tr><td>سعر الحزمة</td><td>509 ريال</td></tr><tr><td>التوفير</td><td>45 ريال</td></tr></table><p>طريقة الاستخدام: مغرفة واي بعد التمرين أو بين الوجبات، و5 جم كرياتين يوميا مع أي مشروب، وقرص ملتي فيتامين واحد مع الطعام.</p><p>تنبيه: المكملات الغذائية لا تغني عن الغذاء المتوازن. الواي يحتوي على الحليب والصويا. الصلاحية المذكورة هي أقرب صلاحية بين المنتجات الثلاثة.</p>",
  "description_html_en": "<p>Servings: 30 days | Serving size: one serving of each product | Expiry: 2028-02 | Form: bundle</p><p>The Starter Bundle brings together three basics for beginners: Optimum Nutrition Gold Standard 100% Whey 2.27 kg, Optimum Nutrition Micronized Creatine 600 g and Centrum Men multivitamin 30 tablets. It suits anyone joining a gym for the first time who wants a simple base without comparing dozens of products, at about 8% less than buying the three separately.</p><table><tr><th>Bundle contents</th><th>Details</th></tr><tr><td>Whey protein (OX-001)</td><td>2.27 kg, 73 servings, SAR 349 alone</td></tr><tr><td>Creatine (OX-015)</td><td>600 g, 120 servings, SAR 149 alone</td></tr><tr><td>Multivitamin (OX-028)</td><td>30 tablets, SAR 56 alone</td></tr><tr><td>Sum of separate prices</td><td>SAR 554</td></tr><tr><td>Bundle price</td><td>SAR 509</td></tr><tr><td>Saving</td><td>SAR 45</td></tr></table><p>Directions: one scoop of whey after training or between meals, 5 g of creatine daily in any drink, and one multivitamin tablet with food.</p><p>Notice: food supplements do not replace a balanced diet. The whey contains milk and soy. The expiry shown is the earliest of the three products.</p>",
  "metadata_title_ar": "حزمة البداية واي وكرياتين وملتي فيتامين | اوبتيمال اكس",
  "metadata_description_ar": "حزمة البداية من اوبتيمال اكس تجمع جولد ستاندرد واي بروتين 2.27 كجم وكرياتين مونوهيدرات 600 جم وسنتروم للرجال 30 قرصا بسعر 509 ريال بدل 554 ريال، شامل الضريبة.",
  "metadata_title_en": "Starter Bundle Whey Creatine and Multivitamin | OptimalX",
  "metadata_description_en": "OptimalX Starter Bundle in Saudi Arabia: Gold Standard whey 2.27 kg, Optimum Nutrition creatine 600 g and Centrum Men 30 tablets for SAR 509 instead of SAR 554.",
  "goal_fit": ["الأداء", "الصحة العامة"],
  "tags": ["حزمة", "حزمة البداية", "واي بروتين", "كرياتين", "ملتي فيتامين", "عرض"]
}
```
