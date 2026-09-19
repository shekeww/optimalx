# Copy written by the build, not by FINAL-content

Every line below was authored during B7 because `research/FINAL-content.md`
carries no wording for the key. The owner approves or rewrites each one; the
value in `locales/` is the working version until then.

Rules each line was written against: no shipping threshold number (the figure
is always `{{threshold}}`), no payment method names, no reply-time promise, no
"official distributors", no popularity or bestseller claim, no health outcome,
disease, treatment or dosage advice beyond what a product label prints, no
professional titles, no dialect, no diacritics, no tatweel, no em-dashes.

Verified after writing: `node scripts/check-copy.mjs` reports 0 problems and 0
TODO-copy placeholders across all 20 locale files.

## 1. Microcopy (the nine TODO-copy keys)

Each value is written identically into `locales/<lang>.json` and into the
batch partial that declares the key, because `tests/i18n.test.ts` forbids a
partial from redefining a base value.

### ox.content.faq.price_a
Surface: the PDP FAQ and the home FAQ, answering `ox.content.faq.price_q`
("لماذا قد تجد سعرا أقل في مكان آخر؟"). Names no other store, states no VAT
position, and sends the shopper to the per serving comparison the page already
prints.

- AR: السعر المعروض على الصفحة هو السعر النهائي الذي تدفعه. ومعه نكتب عدد الحصص وحجم الحصة، فاقسم السعر على عدد الحصص لتعرف تكلفة الحصة الواحدة، فهي المقارنة الصحيحة بين عبوتين. العبوات تختلف في وزن السكوب وفي عدد الحصص، فالعبوة الأقل سعرا قد تكون الأعلى تكلفة في الحصة. وإن كان الفرق على المنتج نفسه، فقارن الحجم والنكهة وتاريخ الصلاحية قبل أن تقارن الرقم وحده.
- EN: The price on the page is the final price you pay. Next to it we print the number of servings and the serving size, so divide the price by the servings to get the cost per serving, which is the comparison that actually holds between two packs. Packs differ in scoop weight and in how many servings they hold, so the cheaper tub can be the more expensive one per serving. If the difference is on the same product, compare the size, the flavour and the expiry date before you compare the number on its own.

### ox.content.faq.pdp_allergens_a
Surface: the PDP pre-purchase rows, under `ox.content.faq.pdp_allergens_q`.
Points at the تنبيه heading the product copy already uses and hands the final
word to the physical label.

- AR: مسببات الحساسية المذكورة على الملصق مكتوبة في كل منتج تحت عنوان تنبيه، مثل الحليب أو الصويا أو القمح أو المكسرات. التركيبة قد تتغير بين دفعة وأخرى، والملصق على العبوة هو المرجع الأخير، فاقرأه قبل أول استخدام. وإن كان سؤالك عن مكون بعينه فأرسله لنا قبل الشراء.
- EN: The allergens printed on the label are written into every product under the heading Note: milk, soy, wheat or nuts, for example. A formula can change between batches and the label on the pack is the final reference, so read it before the first use. If your question is about one specific ingredient, send it to us before you buy.

### ox.newsletter.invalid
Surface: the newsletter block, when the typed value is not an address at all.

- AR: تحقق من صيغة البريد الإلكتروني. نحتاج عنوانا كاملا على هيئة name@example.com.
- EN: Check the format of the email address. We need a complete address in the form name@example.com.

### ox.newsletter.error
Surface: the same block, when the address is well formed but the submission
failed. Says the address was not saved, promises no reply time.

- AR: لم يكتمل الاشتراك من جهتنا، ولم يحفظ بريدك. أعد المحاولة بعد قليل.
- EN: The subscription did not go through on our side, and your email was not saved. Try again in a moment.

### ox.listing.empty and ox.listing.empty_body
Surface: any category, goal or brand listing that returns nothing. The primary
button is `ox.nav.goals`, so the body sends the shopper the same way. Gives the
two honest reasons and claims nothing about restock timing.

- AR (title): لا منتجات في هذا القسم الآن
- EN (title): No products in this section right now
- AR (body): إما أن الكمية نفدت، أو أننا ما زلنا نضيف إلى التشكيلة. ابدأ من هدفك، أو تصفح حسب النوع.
- EN (body): Either the stock has run out, or we are still adding to the range. Start from your goal, or browse by type.

### ox.goal.hero_cta
Surface: the goal landing hero. The button is an in page anchor to the product
grid further down, so the label says what the jump does rather than promising a
recommendation.

- AR: اعرض منتجات هذا الهدف
- EN: Show the products for this goal

### ox.brands.intro
Surface: the brands index, under the h1. Says only that these are the brands
the store carries: no distributor claim, no popularity claim.

- AR: العلامات المعروضة هنا هي التي نوفرها في المتجر. اختر علامة لترى منتجاتها، أو ابدأ من هدفك إن لم تكن قد استقريت على علامة بعد.
- EN: These are the brands we stock. Pick one to see its products, or start from your goal if you have not settled on a brand yet.

### ox.brands.empty
Surface: the brands index with nothing to list. The button is the existing
`ox.brands.empty_cta` ("تصفح أحدث المنتجات").

- AR: لا علامات لعرضها الآن
- EN: No brands to show right now

## 2. Nutrition glossary: the eleven label nutrients

`app/content/glossary.ts` recorded these label rows as uncovered, which left
the nutrition table's third column empty on nearly every product. Each
definition is a statement about the number on the label, what it counts and
what it is compared against. None of them says what the nutrient does in the
body, and none carries a dose. Keys: `ox.content.glossary.<id>.{term,aliases,def}`.

| id | AR term | AR definition | EN definition |
|---|---|---|---|
| calories | سعرات حرارية | طاقة الحصة الواحدة، وتحسب ضمن مجموع سعرات يومك لا فوقه. | The energy in one serving, counted within your day's total rather than on top of it. |
| protein | بروتين | غرامات البروتين في الحصة الواحدة، وهو الرقم الذي تقارن به مسحوقا بآخر. | The grams of protein in one serving, the number you compare one powder with another by. |
| carbohydrates | كربوهيدرات | غرامات الكربوهيدرات في الحصة، وتشمل السكريات والنشويات والألياف. | The grams of carbohydrate in one serving, sugars, starches and fibre included. |
| sugars | سكريات | غرامات السكر في الحصة، وتشمل السكر المضاف والسكر الموجود أصلا في المكونات. | The grams of sugar in one serving, both the added sugar and the sugar already in the ingredients. |
| fibre | ألياف | غرامات الألياف الغذائية في الحصة، وهي جزء من الكربوهيدرات لا يهضمه الجسم. | The grams of dietary fibre in one serving, the part of the carbohydrate the body does not digest. |
| fat | دهون | غرامات الدهون في الحصة الواحدة، وتحسب ضمن سعرات اليوم مثل البروتين والكربوهيدرات. | The grams of fat in one serving, counted within the day's calories like protein and carbohydrate. |
| saturated_fat | دهون مشبعة | الجزء المشبع من دهون الحصة، ويذكر على الملصق في سطر منفصل تحت إجمالي الدهون. | The saturated part of the fat in a serving, printed on its own line under total fat. |
| sodium | صوديوم | ملغرامات الصوديوم في الحصة، وهو رقم الملح على الملصق، ويرتفع في مشروبات الالكتروليت. | The milligrams of sodium in one serving, the salt figure on the label, higher in electrolyte drinks. |
| caffeine | كافيين | ملغرامات الكافيين في الحصة الواحدة، وهو الرقم الذي تجمعه مع قهوة يومك. | The milligrams of caffeine in one serving, the number you add to the coffee in your day. |
| zinc | زنك | ملغرامات الزنك في الحصة، ويذكر معها على الملصق نسبتها من الاحتياج اليومي المرجعي. | The milligrams of zinc in one serving, listed on the label with its share of the daily reference intake. |
| vitamin_c | فيتامين سي | ملغرامات فيتامين سي في الحصة، ويذكر معها على الملصق نسبتها من الاحتياج اليومي المرجعي. | The milligrams of vitamin C in one serving, listed on the label with its share of the daily reference intake. |

Magnesium was already in the FINAL-content 8 set and already matched the label
row, so it was left as written.

Aliases were chosen so the longest match wins: "الدهون المشبعة" resolves to
`saturated_fat` rather than `fat`, and "واي بروتين" still resolves to `whey`
rather than `protein`.

Still uncovered on purpose, rendering an empty third cell:
potassium, calcium, cholesterol, iron.
