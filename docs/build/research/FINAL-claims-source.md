# OptimalX claims source (GOV-013) for owner sign-off

Status: draft prepared 2026-09-18 from the live store record, BUILD.md section 4, SFDA "General Rules for Products Claim" (2021, S1 in research/regulatory.md) and the owner's brief. It becomes binding when the owner initials each row. Copy that contradicts a signed row is wrong copy. Where a row says "needs a lawyer", the copy ships only after that review.

## 1. Who the business is, in one sentence

اوبتيمال اكس (OptimalX) is a new Saudi sports-nutrition and supplements shop with one branch in Al-Khalidiyah, Medina (شارع جبار بن صخر), run by two owners, selling a curated range online across Saudi Arabia and explaining products plainly before selling them.

## 2. What the store may truthfully claim today

| # | Claim (Arabic form used in copy) | Evidence | Owner initial |
|---|---|---|---|
| 1 | متجر جديد من المدينة المنورة | store_context_get: branch الرئيسي, Medina, Al-Khalidiyah | |
| 2 | فرع واحد في الخالدية، استلام من الفرع | branch pickable: true | |
| 3 | نشحن إلى كل مدن السعودية | branch shippable: true; carriers to be named once confirmed (P0) | |
| 4 | الأسعار شاملة ضريبة القيمة المضافة | only true once VAT registration exists; until then the line is hidden | |
| 5 | كل منتج يحمل عدد حصصه وحجم الحصة وتاريخ صلاحيته | the spec-line convention in every description; owner keeps it current | |
| 6 | نجيب على سؤالك المكتوب خلال 24 ساعة عمل | only once the written-question service is staffed | |
| 7 | الاستشارة المرئية 50 ريالا تحسم من أول طلب | only once the coupon mechanism exists in the dashboard | |
| 8 | منتجات أصلية من موزعين رسميين | only once distributor invoices exist; until then "منتجات أصلية" with the definition sentence and no "رسميين" | |
| 9 | Nutrition figures per serving | label data transcribed from the product; never a statistic | |
| 10 | قياس تكوين الجسم (InBody) مجانا في الفرع مع الاشتراك | owner statement 2026-09-23: the branch holds the device and the measurement is included with the advisory services and the subscriptions | owner 2026-09-23 |

Row 10 in detail, because it is the one row that touches a body and therefore
the one most easily written into a health claim. What is approved is a
**service fact**: a measurement, its price (free), its place (the branch) and
what it comes with (the advisory services and the subscriptions). What is NOT
approved, and what the copy may never say: تشخيص، فحص طبي، تحليل، قراءة نتائج،
تفسير، and any outcome attached to the measurement (fat loss, muscle gain, a
target number, a timeframe). The device name stays in Latin ("InBody") because
that is the name on the machine and the term people search. The line is gated
on the `inbody_included` theme setting, which DEFAULTS TO ON because the device
is at the branch today; the owner switches it off and every surface drops the
line the same hour. Shipped in `ox.home.band_inbody_plans` (the plans row) and
`ox.content.services.visit_inbody` (the branch-visit door), 2026-09-23.

## 3. What the store may not claim

- Treatment, cure, prevention, protection, disease or symptom language: يعالج، يشفي، يقي من، يحمي من، يقضي على، يخفف أعراض (SFDA S1 sections 2.2.1 and 2.2.2).
- Outcome promises and numbers: "lose X kg", "98% saw results", "guaranteed", "in 4 weeks", weight-loss and fat-burning and muscle-gain promises attached to any product (S1 2.2.1 item 1; BUILD.md section 4).
- "clinically proven", "100% safe", "no side effects", "natural therefore safe" (S1 2.1 and 2.2.3).
- Recommendations attributed to doctors or health professionals, and any professional title for the owners or staff (أخصائي، صيدلي، طبيب، مدرب معتمد) until classification documents exist (S1 2.2.1 item 2; SCFHS).
- Diagnosis, interpretation of tests, individualised prescription, meal plans, BMI or body-fat calculators.
- Invented statistics: customer counts, satisfaction rates, years in business, "number one", "the best in Saudi Arabia", "the most sold" until real order data exists.
- Competitor names in customer-facing copy.
- Claims about fertility, love life, children's products, or exclusive nutrition ("all nutrients you need") (S1 2.2.1 items 5, 6, 11; 2.2.3).

## 4. The lexicon

| Allowed | Conditional (needs the named evidence) | Banned |
|---|---|---|
| يدعم، يساهم في، مناسب لمن، يحتوي على، يساعدك على اختيار، مصدر بروتين، يستخدم عادة، الجرعة المطبوعة على الملصق | موزعون رسميون (invoices) · شحن خلال يومين (carrier SLA) · معتمد من SFDA (registration number shown) · حلال (certificate) · الأكثر طلبا (real orders) · تقييم العملاء (real reviews) | يعالج، يشفي، يقي، يحرق الدهون، يزيد العضلات، مضمون، نتائج خلال، آمن 100%، بدون آثار جانبية، مثبت سريريا، أفضل في السعودية، رقم 1، أخصائي، صيدلي، طبيب، مدرب معتمد |

## 5. Pricing truth

Prices are in SAR and are the displayed price. VAT is not yet configured in the store (products return with_tax false); the "prices include VAT" line and the VAT number render only after registration. Mock catalogue prices sit inside the Saudi retail range recorded per item in research/batch-0*.md (price_basis and price_source_url); they are placeholders until the owner's sheet import. No per-serving price is shown anywhere (owner decision in BUILD.md section 6). Sale prices appear on at most eight mock items and always show the regular price struck through with the saving in riyals, never a percentage claim.

## 6. Named proof the store can stand behind today

- A physical branch with a public address and coordinates (24.46276125, 39.653138015).
- Salla Pro store with a custom domain (optimalx.com.sa) and Salla's checkout, payments and shipping.
- Product data discipline: servings, serving size, expiry and form on every product; a nutrition table with a plain-Arabic explanation column.
- Nothing else yet. No reviews, no order counts, no certifications. The About page says the store is new.
- Addendum 2026-09-24 (conductor, from the public Google Business Profile, checked 2026-09-24; the owner initials the row like any other): the listing "optimal X" (vitamin and supplements store) at شارع جبار بن صخر، حي الخالدية، المدينة المنورة 42317 shows a 5.0 rating from 80 reviews, hours السبت إلى الخميس 9:00 إلى 24:00 and الجمعة 16:00 إلى 24:00, phone +966 55 352 4524, plus code FM73+68, pin 24.4630382, 39.6533422, listing id (cid) 2204940348214661233. This meets the condition on row 52's "تقييم العملاء (real reviews)": the aggregate may render through the four google_* theme settings with its source link and date (app/content/social-proof.ts). Individual reviews stay unquoted until the owner exports them from the Business Profile; the three visible on the public page today each carry a title or a superlative that the quote filter excludes. The "no reviews" sentence above is superseded for the Google listing only; Salla's own review system still holds zero reviews and every product-level gate stays shut. Photographs of the branch (docs/build/VISIT-2026-09-24.md §2) are the owner's own and may be captioned as the branch.
- Addendum 2026-09-25 (owner ruling, recorded by the conductor; supersedes the "individual reviews stay unquoted" sentence of the 2026-09-24 addendum): the owner asked for the Google reviews to be "shown visually on the website as trust signal as well as interacting with visitors by showing the experience of our customers and visitors". Individual Google Maps reviews may be quoted on the storefront on these terms: verbatim (the reviewer's own words, dialect and spelling untouched, never paraphrased, translated or trimmed except by a visible "more" expander), attributed to the reviewer's public display name and the review date text as Google shows it, labelled as a review on Google Maps with a link to the listing, and only reviews that exist on the listing (the three loaded on 2026-09-25: Ahmed Elsaay, Hamid al sayed, M K, all 5 stars). A superlative or a staff compliment inside a quoted review is the customer's statement, not the store's claim, so it never moves into the store's own headings, taglines or product copy. The aggregate (5.0 from 85 on 2026-09-25) renders only through the gated google_* settings with its source link; no aggregateRating or Review structured data is emitted, because the reviews are about the store on a third-party platform, not first-party product reviews. The store's own copy around the reviews states commitments (the welcome, guidance before and after the purchase, WhatsApp replies within the configured window, follow-up after the sale), never outcomes.

## 7. Regulatory lanes to close before launch (owner)

1. Commercial registration, VAT number, Maroof listing (Ministry of Commerce e-commerce requirements). 2. SFDA position on selling supplements online and whether the products need SFDA registration display (regulatory.md section 5 pending). 3. PDPL: consent wording for the intake form and the privacy policy (needs a lawyer). 4. SCFHS: no nutrition advice presented as clinical practice; the written-question channel answers product-selection questions only. 5. Halal wording only where a certificate exists.

Signed: ____________________ (owner) Date: __________
