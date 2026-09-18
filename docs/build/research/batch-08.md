### Batch 8 (OX-042 to OX-047): non-physical items (product_type digital, codes, service, booking)

Notes on this batch:
- Format differences from the physical items: one extra key, unlimited_quantity (true), placed after quantity; weight_kg 0, quantity 999, require_shipping false; servings, serving_size, expiry, image_url, image_ref and price_source_url are null; options is {} except on the gift card; there is no nutrition table (the table lists scope, contents or terms instead); image_source is owner-to-generate because no retailer image exists for an own-brand service, so the owner produces a branded graphic for each.
- The facts line replaces the spec line: services and bookings use <p>المدة: ... | القناة: ... | الرد خلال: ... | الشكل: خدمة</p>, the guide uses <p>الصفحات: 40 | الصيغة: PDF | الشكل: ملف رقمي</p>, and the gift card uses <p>القيمة: 100 أو 200 أو 500 ريال | الصلاحية: 12 شهرا | الشكل: بطاقة رقمية</p>.
- The line "للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك." appears verbatim in OX-044, OX-045, OX-046 and OX-047, and in the guide's notice. No professional title is used anywhere: the copy says "فريق اوبتيمال اكس" and "عضو فريق التدريب". No health outcome, treatment or weight promise, no statistic.
- Owner policies written into the copy that Salla must be configured to honour: OX-043 code is single-use on one order of equal or greater value (fixed-amount coupon behaviour; relax that sentence if a balance-carrying gift card app is installed) and each value option needs its own price equal to face value; OX-045 credit is a SAR 50 code valid 30 days, reschedule up to 12 hours before the slot; OX-047 reschedule up to 24 hours before, written programme within two working days; OX-046 address and hours are sent in the booking confirmation (they were not in the brief, so the copy does not state them); OX-044 captures the question in the order notes (a Salla text-input option named سؤالك can replace that).
- Prices: OX-042, OX-043, OX-044, OX-045 and OX-046 are fixed by the brief. OX-047 is an ESTIMATE reasoned in price_basis and flagged in the CSV (FINAL-catalogue-tail.md, section E).

```json
{
  "sku": "OX-042",
  "product_type": "digital",
  "name_ar": "دليل المبتدئين للمكملات الغذائية (PDF)",
  "name_en": "Beginner's Guide to Sports Supplements (PDF)",
  "brand": "OptimalX",
  "subtitle_ar": "دليل رقمي من 40 صفحة يشرح أنواع المكملات وقراءة الملصق وبناء خطة أسبوعية بسيطة",
  "subtitle_en": "A 40-page digital guide to supplement types, label reading and a simple weekly plan",
  "price": 29,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["digital-library", "goal-general-health"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "Fixed by the brief at SAR 29. Reasoning kept for the record: a digital file has no unit cost, so the price is a low fixed ticket that a first-time visitor buys without comparison; it is priced rather than free so it carries value, and it sits under the cheapest physical item in the catalogue (OX-034 Nuun tablets, SAR 32). No Saudi retail comparable was fetched.",
  "description_html_ar": "<p>الصفحات: 40 | الصيغة: PDF | الشكل: ملف رقمي</p><p>دليل المبتدئين للمكملات الغذائية ملف PDF من 40 صفحة أعده فريق اوبتيمال اكس بلغة عربية واضحة لمن يدخل عالم المكملات لأول مرة. يشرح الفرق بين واي بروتين والايزوليت والكازين والبروتين النباتي، ومتى يستخدم الكرياتين وما قبل التمرين، وكيف تقرأ ملصق الحقائق الغذائية وتحسب تكلفة الحصة الواحدة قبل الشراء. مناسب لمن يريد أن يفهم ما يشتريه بدل الاعتماد على النصائح المتناقلة في النادي.</p><table><tr><th>محتويات الدليل</th><th>الصفحات</th></tr><tr><td>كيف تقرأ ملصق المكمل وتحسب تكلفة الحصة</td><td>6</td></tr><tr><td>البروتين: الأنواع والفروق بينها</td><td>8</td></tr><tr><td>الكرياتين وما قبل التمرين والأحماض الأمينية</td><td>6</td></tr><tr><td>الفيتامينات والمعادن والأوميغا 3</td><td>6</td></tr><tr><td>بناء خطة أسبوعية بسيطة حسب هدفك</td><td>6</td></tr><tr><td>أخطاء شائعة وأسئلة متكررة</td><td>5</td></tr><tr><td>مسرد المصطلحات وقائمة تحقق قبل الشراء</td><td>3</td></tr></table><p>طريقة الاستخدام: يصلك رابط التحميل في حسابك وعلى بريدك الإلكتروني فور إتمام الدفع. الملف يفتح على الجوال والحاسوب ويمكن طباعته.</p><p>تنبيه: الدليل مادة تعليمية عامة ولا يغني عن قراءة ملصق كل منتج. للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.</p>",
  "description_html_en": "<p>Pages: 40 | Format: PDF | Form: digital file</p><p>The Beginner's Guide to Sports Supplements is a 40-page Arabic PDF written by the OptimalX team for anyone entering the world of supplements for the first time. It explains the difference between whey, isolate, casein and plant protein, where creatine and pre-workout fit in, and how to read a nutrition label and work out the cost per serving before buying. It suits people who want to understand what they buy instead of relying on gym hearsay.</p><table><tr><th>Guide contents</th><th>Pages</th></tr><tr><td>How to read a supplement label and cost a serving</td><td>6</td></tr><tr><td>Protein: the types and how they differ</td><td>8</td></tr><tr><td>Creatine, pre-workout and amino acids</td><td>6</td></tr><tr><td>Vitamins, minerals and omega-3</td><td>6</td></tr><tr><td>Building a simple weekly plan for your goal</td><td>6</td></tr><tr><td>Common mistakes and frequent questions</td><td>5</td></tr><tr><td>Glossary and a pre-purchase checklist</td><td>3</td></tr></table><p>Directions: the download link appears in your account and arrives by email as soon as payment is complete. The file opens on phone and computer and can be printed.</p><p>Notice: the guide is general educational material and does not replace reading each product's label. For medical conditions or medication questions, consult your doctor.</p>",
  "metadata_title_ar": "دليل المبتدئين للمكملات الغذائية PDF | اوبتيمال اكس",
  "metadata_description_ar": "دليل المبتدئين للمكملات الغذائية من اوبتيمال اكس: ملف PDF من 40 صفحة يشرح أنواع البروتين والكرياتين والفيتامينات وطريقة قراءة الملصق وبناء خطة أسبوعية بسيطة، يصلك فور الدفع.",
  "metadata_title_en": "Beginner's Guide to Sports Supplements PDF | OptimalX",
  "metadata_description_en": "Download the OptimalX Beginner's Guide to Sports Supplements: a 40-page Arabic PDF on protein types, creatine, vitamins, label reading and a simple weekly plan.",
  "goal_fit": ["الصحة العامة"],
  "tags": ["دليل رقمي", "المكملات الغذائية للمبتدئين", "PDF", "كتاب إلكتروني", "اوبتيمال اكس"]
}
```

```json
{
  "sku": "OX-043",
  "product_type": "codes",
  "name_ar": "بطاقة هدية اوبتيمال اكس",
  "name_en": "OptimalX Gift Card",
  "brand": "OptimalX",
  "subtitle_ar": "بطاقة هدية رقمية بقيمة 100 أو 200 أو 500 ريال تصل برمز يستخدم على أي طلب",
  "subtitle_en": "Digital gift card of SAR 100, 200 or 500, delivered as a code for any order",
  "price": 100,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["gift-cards"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {"القيمة": ["100 ريال", "200 ريال", "500 ريال"]},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "Face value. The listed price SAR 100 is the lowest option; in Salla each value option must carry its own price equal to its face value (100, 200, 500). The card sells at par with no fee, because a gift card sold above its value would not be bought. The 12-month validity is an owner policy written into the copy.",
  "description_html_ar": "<p>القيمة: 100 أو 200 أو 500 ريال | الصلاحية: 12 شهرا | الشكل: بطاقة رقمية</p><p>بطاقة هدية اوبتيمال اكس طريقة بسيطة لإهداء من يتدرب حرية اختيار منتجاته بنفسه. تختار القيمة، وتكتب اسم المستلم ورسالة قصيرة في ملاحظات الطلب، ويصل رمز البطاقة إلى بريدك الإلكتروني فور إتمام الدفع لترسله بنفسك أو نرسله نيابة عنك. يستخدم الرمز عند إتمام أي طلب في المتجر على كامل المنتجات والخدمات.</p><table><tr><th>تفاصيل البطاقة</th><th>القيمة</th></tr><tr><td>القيم المتاحة</td><td>100 أو 200 أو 500 ريال</td></tr><tr><td>مدة الصلاحية</td><td>12 شهرا من تاريخ الشراء</td></tr><tr><td>طريقة التسليم</td><td>رمز رقمي بالبريد الإلكتروني</td></tr><tr><td>مكان الاستخدام</td><td>المتجر الإلكتروني عند إتمام الطلب</td></tr><tr><td>شروط الاستخدام</td><td>طلب واحد بقيمة تساوي البطاقة أو تزيد عنها، ويدفع الفرق عند إتمام الطلب</td></tr></table><p>طريقة الاستخدام: يدخل المستلم الرمز في خانة كود الخصم عند إتمام الطلب فتخصم قيمة البطاقة من الإجمالي.</p><p>تنبيه: البطاقة لا تستبدل بالنقد ولا تسترد قيمتها، ويحفظ الرمز ولا يشارك علنا.</p>",
  "description_html_en": "<p>Value: SAR 100, 200 or 500 | Validity: 12 months | Form: digital card</p><p>The OptimalX gift card is a simple way to give someone who trains the freedom to choose their own products. Pick the value, add the recipient's name and a short message in the order notes, and the card code arrives in your email as soon as payment is complete, to forward yourself or for us to send on your behalf. The code is used at checkout on any order in the store, across all products and services.</p><table><tr><th>Card details</th><th>Value</th></tr><tr><td>Available values</td><td>SAR 100, 200 or 500</td></tr><tr><td>Validity</td><td>12 months from the purchase date</td></tr><tr><td>Delivery</td><td>Digital code by email</td></tr><tr><td>Where to use</td><td>Online store, at checkout</td></tr><tr><td>Terms of use</td><td>One order of equal or greater value; any difference is paid at checkout</td></tr></table><p>Directions: the recipient enters the code in the discount code field at checkout and the card value is deducted from the total.</p><p>Notice: the card cannot be exchanged for cash or refunded, and the code should be kept private.</p>",
  "metadata_title_ar": "بطاقة هدية رقمية 100 أو 200 أو 500 ريال | اوبتيمال اكس",
  "metadata_description_ar": "بطاقة هدية اوبتيمال اكس الرقمية بقيمة 100 أو 200 أو 500 ريال: يصل الرمز إلى بريدك فور الدفع، صالحة 12 شهرا، وتستخدم على أي طلب مكملات غذائية في المتجر.",
  "metadata_title_en": "Digital Gift Card SAR 100, 200 or 500 Riyals | OptimalX",
  "metadata_description_en": "Give an OptimalX digital gift card worth SAR 100, 200 or 500: the code arrives by email right after payment, is valid for 12 months and works on any order in the store.",
  "goal_fit": [],
  "tags": ["بطاقة هدية", "هدية", "بطاقة رقمية", "اوبتيمال اكس"]
}
```

```json
{
  "sku": "OX-044",
  "product_type": "service",
  "name_ar": "سؤال مكتوب لفريق اوبتيمال اكس",
  "name_en": "Written Question to the OptimalX Team",
  "brand": "OptimalX",
  "subtitle_ar": "خدمة مجانية: رد مكتوب خلال 24 ساعة عمل على سؤالك عن اختيار المنتج أو استخدامه",
  "subtitle_en": "Free: a written reply within 24 working hours on choosing or using a product",
  "price": 0,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["services"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "Free by the brief. A zero-price service product lets the question be captured in the order notes and tracked as an order in Salla, so the 24-working-hour reply commitment can be measured; the only cost is team time.",
  "description_html_ar": "<p>المدة: سؤال واحد ورد واحد | القناة: ملاحظات الطلب والبريد الإلكتروني | الرد خلال: 24 ساعة عمل | الشكل: خدمة</p><p>سؤال مكتوب لفريق اوبتيمال اكس خدمة مجانية لمن يريد رأيا واضحا قبل الشراء أو بعده دون حجز موعد. اكتب سؤالك في خانة الملاحظات عند إتمام هذا الطلب المجاني، ويرد عليك فريق المتجر كتابيا على بريدك الإلكتروني خلال 24 ساعة عمل. نجيب عن اختيار المنتج المناسب لهدفك وميزانيتك، والفرق بين منتجين، وطريقة استخدام منتج اشتريته وتوقيته مع التمرين، وحفظه، وأي سؤال عن الطلب والتوصيل.</p><table><tr><th>نطاق الخدمة</th><th>التفاصيل</th></tr><tr><td>نجيب عن</td><td>اختيار المنتج، الفرق بين المنتجات، طريقة الاستخدام والتوقيت، الحفظ، الطلب والتوصيل</td></tr><tr><td>لا نجيب عن</td><td>الحالات المرضية، الأدوية، الحمل والرضاعة، جرعات تخالف الملصق</td></tr><tr><td>عدد الأسئلة</td><td>سؤال واحد لكل طلب، ويمكن تكرار الطلب</td></tr><tr><td>وقت الرد</td><td>خلال 24 ساعة عمل</td></tr></table><p>طريقة الاستخدام: أضف الخدمة إلى السلة وأتمم الطلب بقيمة صفر، واكتب سؤالك وهدفك ومستواك في التدريب في خانة الملاحظات ليكون الرد أدق.</p><p>تنبيه: الرد رأي عام من فريق المتجر لمساعدتك على الاختيار وليس استشارة صحية. للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.</p>",
  "description_html_en": "<p>Duration: one question, one reply | Channel: order notes and email | Reply within: 24 working hours | Form: service</p><p>A written question to the OptimalX team is a free service for anyone who wants a clear opinion before or after buying, without booking an appointment. Write your question in the notes field when you complete this free order and the store team replies in writing to your email within 24 working hours. We answer on choosing the right product for your goal and budget, the difference between two products, how and when to use a product you bought around training, how to store it, and anything about orders and delivery.</p><table><tr><th>Scope</th><th>Details</th></tr><tr><td>We answer</td><td>Product choice, differences between products, directions and timing, storage, orders and delivery</td></tr><tr><td>We do not answer</td><td>Medical conditions, medications, pregnancy and breastfeeding, doses beyond the label</td></tr><tr><td>Questions</td><td>One question per order; the order can be repeated</td></tr><tr><td>Reply time</td><td>Within 24 working hours</td></tr></table><p>Directions: add the service to the cart and complete the zero-value order, then write your question, your goal and your training level in the notes field so the reply is precise.</p><p>Notice: the reply is a general opinion from the store team to help you choose, not health advice. For medical conditions or medication questions, consult your doctor.</p>",
  "metadata_title_ar": "سؤال مكتوب مجاني، رد خلال 24 ساعة عمل | اوبتيمال اكس",
  "metadata_description_ar": "أرسل سؤالك المكتوب مجانا إلى فريق اوبتيمال اكس عن اختيار المكمل المناسب لهدفك أو طريقة استخدامه أو توقيته مع التمرين، ويصلك رد مكتوب على بريدك خلال 24 ساعة عمل.",
  "metadata_title_en": "Free Written Question, Reply in 24 Working Hours | OptimalX",
  "metadata_description_en": "Send the OptimalX team a free written question about choosing a supplement for your goal, how to use it or when to take it, and get a written reply within 24 working hours.",
  "goal_fit": [],
  "tags": ["خدمة مجانية", "سؤال", "استشارة مكتوبة", "اختيار المكمل", "اوبتيمال اكس"]
}
```

```json
{
  "sku": "OX-045",
  "product_type": "booking",
  "name_ar": "استشارة مرئية 20 دقيقة",
  "name_en": "20-Minute Video Consultation",
  "brand": "OptimalX",
  "subtitle_ar": "مكالمة مرئية 20 دقيقة مع فريق اوبتيمال اكس، وقيمتها 50 ريالا تخصم من طلبك الأول",
  "subtitle_en": "20-minute video call with the OptimalX team, SAR 50 credited to your first order",
  "price": 50,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["services"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "SAR 50 is set by the brief as a commitment fee, not a revenue line: the full amount returns to the customer as a SAR 50 code on the first order, so the consultation costs nothing to anyone who buys and only filters no-show bookings. It sits above the free written question (OX-044) and well below the training session (OX-047), so the three services read as a ladder.",
  "description_html_ar": "<p>المدة: 20 دقيقة | القناة: مكالمة مرئية عبر Google Meet أو واتساب | الرد خلال: 24 ساعة عمل لتأكيد الموعد | الشكل: خدمة</p><p>استشارة مرئية 20 دقيقة مكالمة مباشرة مع أحد أعضاء فريق اوبتيمال اكس لمن يريد خطة شراء واضحة بدل التخمين. نراجع معك هدفك وجدول تمرينك الأسبوعي وميزانيتك، ونشرح الفرق بين أنواع البروتين والكرياتين وما قبل التمرين، ونقترح عليك قائمة قصيرة من المنتجات بترتيب الأولوية مع طريقة الاستخدام والتوقيت. قيمة الاستشارة 50 ريالا تعود إليك كرمز خصم بالقيمة نفسها على طلبك الأول.</p><table><tr><th>تفاصيل الاستشارة</th><th>القيمة</th></tr><tr><td>ما تغطيه</td><td>اختيار المنتجات حسب الهدف والميزانية، طريقة الاستخدام والتوقيت مع التمرين، قراءة الملصق</td></tr><tr><td>ما لا تغطيه</td><td>الحالات المرضية، الأدوية، خطط الوجبات، جرعات تخالف الملصق</td></tr><tr><td>ما تحضره</td><td>هدفك، عدد أيام التمرين، المكملات التي تستخدمها حاليا، أي حساسية غذائية</td></tr><tr><td>المخرج</td><td>قائمة مكتوبة بالمنتجات المقترحة ترسل بعد المكالمة</td></tr><tr><td>رصيد الطلب الأول</td><td>رمز خصم بقيمة 50 ريالا صالح 30 يوما</td></tr></table><p>طريقة الاستخدام: اختر الموعد المناسب عند إتمام الطلب، ويصلك تأكيد الموعد ورابط المكالمة على بريدك خلال 24 ساعة عمل. يمكن تغيير الموعد قبل 12 ساعة من بدايته.</p><p>تنبيه: الاستشارة تساعدك على اختيار المنتجات وليست استشارة صحية أو غذائية. للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.</p>",
  "description_html_en": "<p>Duration: 20 minutes | Channel: video call on Google Meet or WhatsApp | Reply within: 24 working hours to confirm the slot | Form: service</p><p>The 20-minute video consultation is a live call with a member of the OptimalX team for anyone who wants a clear buying plan instead of guesswork. We go through your goal, your weekly training schedule and your budget, explain the difference between protein types, creatine and pre-workout, and suggest a short list of products in order of priority with directions and timing. The SAR 50 fee comes back to you as a discount code of the same value on your first order.</p><table><tr><th>Consultation details</th><th>Value</th></tr><tr><td>What it covers</td><td>Product choice by goal and budget, directions and timing around training, label reading</td></tr><tr><td>What it does not cover</td><td>Medical conditions, medications, meal plans, doses beyond the label</td></tr><tr><td>What to prepare</td><td>Your goal, training days per week, supplements you use now, any food allergy</td></tr><tr><td>Outcome</td><td>A written list of suggested products sent after the call</td></tr><tr><td>First-order credit</td><td>SAR 50 discount code valid for 30 days</td></tr></table><p>Directions: choose a slot when you complete the order; the confirmation and call link arrive by email within 24 working hours. The slot can be changed up to 12 hours before it starts.</p><p>Notice: the consultation helps you choose products and is not health or dietary advice. For medical conditions or medication questions, consult your doctor.</p>",
  "metadata_title_ar": "استشارة مرئية 20 دقيقة لاختيار المكملات | اوبتيمال اكس",
  "metadata_description_ar": "احجز استشارة مرئية 20 دقيقة مع فريق اوبتيمال اكس لاختيار المكملات المناسبة لهدفك وجدول تمرينك وميزانيتك، وقيمتها 50 ريالا تعود إليك كرمز خصم على طلبك الأول.",
  "metadata_title_en": "20-Minute Video Consultation, SAR 50 Credited | OptimalX",
  "metadata_description_en": "Book a 20-minute video consultation with the OptimalX team to choose supplements for your goal, training week and budget; the SAR 50 comes back as a code on your first order.",
  "goal_fit": [],
  "tags": ["استشارة", "استشارة مرئية", "اختيار المكملات", "حجز", "اوبتيمال اكس"]
}
```

```json
{
  "sku": "OX-046",
  "product_type": "booking",
  "name_ar": "زيارة الفرع في المدينة المنورة",
  "name_en": "Branch Visit in Medina",
  "brand": "OptimalX",
  "subtitle_ar": "حجز مجاني لاستلام طلبك من الفرع أو للحصول على مساعدة في اختيار المنتجات حضوريا",
  "subtitle_en": "Free booking to collect an order or get in-person help at the Medina branch",
  "price": 0,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["services"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "Free by the brief. Branch pickup and in-store help carry no incremental cost, and a paid booking would discourage the visit; the zero-price booking exists so the branch can prepare the order and staff the slot.",
  "description_html_ar": "<p>المدة: 15 دقيقة | القناة: حضوري في فرع المدينة المنورة | الرد خلال: 24 ساعة عمل | الشكل: خدمة</p><p>زيارة الفرع حجز مجاني لمن يفضل التعامل حضوريا في فرع اوبتيمال اكس بالمدينة المنورة. تناسب حالتين: استلام طلب أتممته في المتجر الإلكتروني واخترت له خيار الاستلام من الفرع، أو زيارة للاطلاع على المنتجات ومقارنة الأحجام والنكهات والحصول على مساعدة فريق الفرع في الاختيار ثم الشراء مباشرة. الحجز يضمن أن يكون طلبك جاهزا وأحد أعضاء الفريق متفرغا لك في الوقت الذي اخترته.</p><table><tr><th>تفاصيل الزيارة</th><th>القيمة</th></tr><tr><td>استلام الطلبات</td><td>اختر الاستلام من الفرع عند إتمام الطلب ثم احجز وقتا هنا وأحضر رقم الطلب</td></tr><tr><td>المساعدة في الفرع</td><td>مقارنة المنتجات والأحجام والنكهات، وشرح طريقة الاستخدام، والدفع في الفرع</td></tr><tr><td>مدة الزيارة</td><td>15 دقيقة تقريبا لكل حجز</td></tr><tr><td>العنوان وساعات العمل</td><td>تصلك في رسالة تأكيد الحجز</td></tr></table><p>طريقة الاستخدام: اختر اليوم والوقت عند إتمام هذا الحجز المجاني، واكتب رقم الطلب إن كانت الزيارة للاستلام، ويصلك التأكيد خلال 24 ساعة عمل.</p><p>تنبيه: فريق الفرع يساعدك على اختيار المنتجات وقراءة الملصقات فقط. للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.</p>",
  "description_html_en": "<p>Duration: 15 minutes | Channel: in person at the Medina branch | Reply within: 24 working hours | Form: service</p><p>The branch visit is a free booking for anyone who prefers to deal in person at the OptimalX branch in Medina. It covers two cases: collecting an order you completed online with branch pickup selected, or a visit to see the products, compare sizes and flavours, get help from the branch team in choosing, and buy on the spot. Booking makes sure your order is ready and a team member is free for you at the time you chose.</p><table><tr><th>Visit details</th><th>Value</th></tr><tr><td>Order pickup</td><td>Select branch pickup at checkout, book a time here and bring your order number</td></tr><tr><td>In-branch help</td><td>Comparing products, sizes and flavours, directions for use, and payment at the branch</td></tr><tr><td>Visit length</td><td>About 15 minutes per booking</td></tr><tr><td>Address and hours</td><td>Sent in the booking confirmation</td></tr></table><p>Directions: choose the day and time when you complete this free booking, add your order number if the visit is for pickup, and the confirmation arrives within 24 working hours.</p><p>Notice: the branch team helps with choosing products and reading labels only. For medical conditions or medication questions, consult your doctor.</p>",
  "metadata_title_ar": "زيارة فرع المدينة المنورة: حجز مجاني | اوبتيمال اكس",
  "metadata_description_ar": "احجز زيارة مجانية لفرع اوبتيمال اكس في المدينة المنورة لاستلام طلبك الإلكتروني أو لمقارنة المنتجات والحصول على مساعدة فريق الفرع في الاختيار والشراء مباشرة.",
  "metadata_title_en": "Free Branch Visit in Medina: Pickup and Help | OptimalX",
  "metadata_description_en": "Book a free visit to the OptimalX branch in Medina to collect your online order or to compare products in person and get help from the branch team before you buy.",
  "goal_fit": [],
  "tags": ["زيارة الفرع", "المدينة المنورة", "استلام من الفرع", "حجز مجاني", "اوبتيمال اكس"]
}
```

```json
{
  "sku": "OX-047",
  "product_type": "booking",
  "name_ar": "جلسة تدريب شخصي 60 دقيقة",
  "name_en": "60-Minute Personal Training Session",
  "brand": "OptimalX",
  "subtitle_ar": "60 دقيقة لمراجعة تقنية التمارين وبناء برنامج أسبوعي، حضوريا في المدينة أو عن بعد",
  "subtitle_en": "60 minutes on exercise technique and weekly programming, in person or by video",
  "price": 150,
  "sale_price": null,
  "weight_kg": 0,
  "quantity": 999,
  "unlimited_quantity": true,
  "require_shipping": false,
  "categories": ["services", "goal-performance"],
  "servings": null,
  "serving_size": null,
  "expiry": null,
  "options": {},
  "image_url": null,
  "image_source": "owner-to-generate",
  "image_ref": null,
  "price_source_url": null,
  "price_basis": "ESTIMATE, no price page fetched (the brief asks for a reasoned Medina price). Reasoning from general market knowledge, not a captured figure: in Saudi commercial gyms a single personal-training session is normally sold inside a package, and the per-session cost of those packages in the large cities lands roughly between SAR 100 and 250, with Riyadh and Jeddah at the top of that range; Medina is a smaller market, and this is one session bought alone with a written programme delivered afterwards and an in-person option that costs travel time. SAR 150 sits in the lower middle of that range: clearly above the SAR 50 consultation (OX-045) so the two are not confused, and below the SAR 200-and-up level that needs a package to justify. The owner should confirm against the single-session rate of two Medina gyms before publishing; flagged ESTIMATE in the CSV.",
  "description_html_ar": "<p>المدة: 60 دقيقة | القناة: حضوري في المدينة المنورة أو مكالمة مرئية | الرد خلال: 24 ساعة عمل لتأكيد الموعد | الشكل: خدمة</p><p>جلسة تدريب شخصي 60 دقيقة مع أحد أعضاء فريق التدريب في اوبتيمال اكس، تركز على شيئين فقط: تقنية أداء التمارين وبناء البرنامج. نراجع معك حركاتك الأساسية مثل القرفصاء والرفعة الميتة والضغط والسحب، ونصحح وضع الجسم والتنفس ومدى الحركة، ثم نبني معك برنامجا أسبوعيا يناسب عدد الأيام المتاحة لديك ومستواك الحالي مع طريقة التدرج وتسجيل الأوزان. تناسب المبتدئ الذي يريد أساسا صحيحا ومن يتدرب منذ فترة ويريد مراجعة برنامجه.</p><table><tr><th>تفاصيل الجلسة</th><th>القيمة</th></tr><tr><td>ما تغطيه</td><td>تقنية التمارين الأساسية، الإحماء، ترتيب التمارين، التدرج في الأوزان، تسجيل التقدم</td></tr><tr><td>ما لا تغطيه</td><td>وصف أنظمة غذائية أو جرعات مكملات، التعامل مع الإصابات</td></tr><tr><td>مكان الجلسة</td><td>حضوريا في النادي الذي تختاره داخل المدينة المنورة أو عبر مكالمة مرئية</td></tr><tr><td>ما تحضره</td><td>ملابس تمرين، عدد أيام التدريب المتاحة، برنامجك الحالي إن وجد</td></tr><tr><td>المخرج</td><td>برنامج أسبوعي مكتوب يرسل خلال يومي عمل بعد الجلسة</td></tr></table><p>طريقة الاستخدام: اختر الموعد ونوع الجلسة (حضوري أو عن بعد) عند إتمام الحجز، ويصلك التأكيد خلال 24 ساعة عمل. يمكن تغيير الموعد قبل 24 ساعة من بدايته.</p><p>تنبيه: الجلسة تدريبية وليست خدمة صحية أو غذائية. للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك.</p>",
  "description_html_en": "<p>Duration: 60 minutes | Channel: in person in Medina or by video call | Reply within: 24 working hours to confirm the slot | Form: service</p><p>The 60-minute personal training session with a member of the OptimalX training team focuses on two things only: exercise technique and programming. We review your main movements such as the squat, deadlift, press and pull, correct body position, breathing and range of motion, then build a weekly programme around the days you have and your current level, with a progression method and a way to log your weights. It suits beginners who want a sound base and anyone who has trained for a while and wants their programme reviewed.</p><table><tr><th>Session details</th><th>Value</th></tr><tr><td>What it covers</td><td>Technique on the main lifts, warm-up, exercise order, load progression, logging progress</td></tr><tr><td>What it does not cover</td><td>Diet or supplement prescriptions, injury management</td></tr><tr><td>Location</td><td>In person at a gym you choose in Medina, or by video call</td></tr><tr><td>What to bring</td><td>Training clothes, your available training days, your current programme if any</td></tr><tr><td>Outcome</td><td>A written weekly programme sent within two working days after the session</td></tr></table><p>Directions: choose the slot and session type (in person or remote) when you complete the booking; confirmation arrives within 24 working hours. The slot can be changed up to 24 hours before it starts.</p><p>Notice: this is a training session, not a health or dietary service. For medical conditions or medication questions, consult your doctor.</p>",
  "metadata_title_ar": "جلسة تدريب شخصي 60 دقيقة، تقنية وبرنامج | اوبتيمال اكس",
  "metadata_description_ar": "احجز جلسة تدريب شخصي 60 دقيقة مع فريق اوبتيمال اكس في المدينة المنورة أو عن بعد لمراجعة تقنية التمارين الأساسية وبناء برنامج أسبوعي يناسب أيامك ومستواك.",
  "metadata_title_en": "60-Minute Personal Training Session in Medina | OptimalX",
  "metadata_description_en": "Book a 60-minute personal training session with the OptimalX team in Medina or by video: exercise technique review and a weekly programme built for your days and level.",
  "goal_fit": ["الأداء"],
  "tags": ["تدريب شخصي", "جلسة تدريب", "تقنية التمارين", "برنامج تدريبي", "المدينة المنورة"]
}
```
