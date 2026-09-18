# OptimalX: Arabic query universe for supplements in Saudi Arabia

Status: COMPLETE for the 2026-09-17 harvest. Written incrementally, section by section. Locale for every autocomplete pull: hl=ar, gl=SA.

Store facts this document assumes (from BUILD.md, read 2026-09-17): brand "اوبتيمال اكس"; one branch in الخالدية، المدينة المنورة; six goal landings (الطاقة، الصحة العامة، الأداء، التعافي، الشعر والبشرة، الوزن المثالي); a guides index with 8 articles; URL and locale routing is still an owner decision (BUILD.md §0), so every slug below is the Latin path segment only and the prefix (/category/, /goal/, /brand/, /product/, /guides/, /branch/, /services/) is a proposal, not a routing decision.

Writing rules applied: no em-dashes; H1 and title text in Modern Standard Arabic without dialect or diacritics; dialect appears only in section 5 (search synonyms); member queries are quoted verbatim from the harvest, including their spelling errors, because that is what the search box and Google will receive.

## 1. Method and source log

| ID | Source | URL | Accessed | Used for |
|---|---|---|---|---|
| S1 | Google autocomplete harvest, Chrome client, Arabic UI, Saudi geolocation | https://www.google.com/complete/search?client=chrome&hl=ar&gl=sa | 2026-09-17 | Every member query in section 2, every exclusion in section 3, every question in section 4, every naming observation in section 7 |
| S2 | BUILD.md (project build spec, local file in the repo) | C:\Users\Ahmed\OneDrive\Desktop\optimalx\BUILD.md | 2026-09-17 | Page types that exist (goal landings, guides, branch page, services hub), branch location, brand name, the URL-routing gap |
| S3 | research/products-trending.md and research/competitors-ksa.md (same session, same scratchpad) | local files beside this one | 2026-09-17 | Cross-check of how Saudi retailers (Sporter, Nahdi, Dr. Nutrition) spell brand and product names in Arabic script; no queries were taken from them |

No additional harvest was run and no web search was used for this document. Every query below is one of the 2,285 suggestions in S1.

### 1.1 What S1 contains

- Input files: ac_all.json (dict of seed to suggestion list), ac_all.txt (same data as text), seeds_all.txt (the seed list). Files are in the same folder as this document.
- 192 unique seeds. 2,285 suggestions in total, 2,168 unique strings (117 suggestions appear under more than one seed, for example "افضل بروتين للتنشيف" is returned for both "افضل بروتين" and "بروتين للتنشيف").
- Seed mix: Arabic product heads (بروتين، كرياتين، اوميغا 3), Arabic modifiers (للتنشيف، للتضخيم، للنساء، للمبتدئين), question stems (متى، كم، كيف، هل، الفرق بين، اضرار، فوائد، سعر), dialect phrasings (وش افضل بروتين، ابي بروتين), Latin-script product and brand names (whey, creatine, iso 100, gold standard, c4), brand transliterations (اوبتيموم نيوتريشن، ديماتيز، ماسل تك), retailer names (النهدي، الدواء، نون، امازون، ايهيرب) and local intent (مكملات المدينة المنورة، محل مكملات).
- Seven seeds returned zero suggestions: بروتين بار قليل السكر، مكملات رياضية اصلية، مكملات تقليد، كرياتين ونتائجه، بروتين لزيادة الوزن للنحاف، فوائد البي سي اي اي، اي اتش ار بي. They are recorded as gaps, not as evidence of zero demand; autocomplete suppresses long or rare strings.
- Two seed pairs returned near-identical lists, which shows Google normalising the spelling before suggesting: اشواجاندا returned exactly the list of اشواغاندا; ديماتايز and دايماتيز both returned the ديماتيز list (the latter with one extra Persian-script item). The store search must normalise the same way (section 5, section 7).
- Autocomplete returns at most 15 suggestions per seed, so member counts below are a floor on breadth, not a volume estimate. No search-volume numbers appear in this document because none were collected.

### 1.2 How the clusters were built

1. Every unique suggestion was read once and tagged with its product or topic, its modifier (audience, goal, form, flavour, size, price, retailer, place) and its intent (transactional, informational, navigational, local).
2. Suggestions were then grouped so that one URL can satisfy the whole group. A group becomes a cluster only if a single page can rank for the head query and the members without contradicting itself.
3. Each cluster was assigned to the most specific page type that can own it: a product page when the queries name one SKU line (ايزو 100, جولد ستاندرد, سيرياس ماس, نيترو تك); a brand page when they name the maker; a category when they name a product type; a goal collection when they name an outcome the store's six goals cover; a guide when the stem is a question or comparison; the branch page for Medina and near-me intent; a services page for authenticity and delivery intent; the homepage for "متجر مكملات" style intent.
4. Anything that fails the store's claim rules, targets an audience the store does not serve, names another country or another retailer, or is a homograph from another domain went to section 3 with a reason.
5. Every member is assigned to exactly one cluster (checked programmatically at the end); where one page would own more than 30 members, the first 30 are listed and the overflow is listed in a compact line under the same page so the count stays honest.

Exclusion group sizes measured on the 2,168 unique strings (regex over S1, 2026-09-17; groups overlap): النهدي 121, hair and keratin 109, medical or clinical modifiers 100, fat-burner and body-shape claim phrases 52, pharmacy intent 43, الدواء 39, ايهيرب 35, kids and infants 34, Egypt 35, other countries 29, Egyptian-market brands 30, Amazon and eBay 27, cars and phones homographs 27, other Saudi cities 23, Persian script 16, animals and plants 15, casino 14, الجزائر 14, الوزن المثالي (retail chain) 12, الكويت 11, الاردن 8, نون 7, other GCC 6, جي ان سي 4.

## 2. Cluster map

Format of every cluster: page type and proposed slug, head query, intent, members quoted verbatim from S1 (with the seeds they came from), then the MSA H1 and the title tag. Title length is counted in characters including spaces and the brand suffix " | اوبتيمال اكس" (15 characters), target 45 to 55. "Overflow" lists further S1 members the same page owns when a cluster exceeds 30.

Cluster IDs: C = type category or product-type page, G = goal collection, A = audience collection, B = brand page, P = product page, U = guide article, L = local page, V = services page, H = homepage.

### 2.1 Type categories: protein family

#### C01. بروتين (parent category)
- Page: type category, slug `/category/protein`
- Head query: بروتين
- Intent: transactional
- Members (n=24, verbatim from S1; seeds بروتين، مكملات بروتين، سعر بروتين، بروتين قبل التمرين، بروتين بعد التمرين): بروتين باودر | بروتين بيف | بروتين شيك | بروتين واي | بروتين وكارب | بروتين فانيلا | مكملات بروتين لكمال الاجسام | مكملات بروتين لزيادة الوزن | مكملات بروتين مصل اللبن | مكملات بروتين وكرياتين | بروتين مكملات غذائية | مكملات واي بروتين | متجر مكملات بروتين | سعر بروتين باودر | سعر بروتين بيف | بروتين باودر للتضخيم | بروتين باودر للتنشيف | بروتين ايزوليت بيف | مشروبات بروتين بعد التمرين | مشروب بروتين بعد التمرين | بروتين شيك بعد التمرين | بروتين شيك قبل التمرين | مشروب بروتين قبل التمرين | بروتين باودر قبل التمرين
- H1: بروتين باودر
- Title: بروتين باودر أصلي بأفضل سعر في السعودية | اوبتيمال اكس

#### C02. واي بروتين
- Page: type category, slug `/category/whey-protein`
- Head query: واي بروتين
- Intent: transactional
- Members (n=24, verbatim from S1; seeds واي بروتين، whey، whey protein، سعر واي بروتين، فوائد واي بروتين): واي بروتين فانيلا | واي بروتين شوكلت | واي بروتين كندر | واي بروتين كونسنتريت | واي بروتين فانيلا ايسكريم | واي بروتين 10 باوند | واي بروتين اوبتيموم | واي بروتين بودي بيلدر | واي بروتين جولد ستاندرد 5 كيلو | whey protein | whey بروتين | whey protein concentrate | whey protein vanilla | whey protein powder | whey concentrate | whey protein ice cream vanilla | whey protein كندر | whey protein chocolate | whey protein فانيلا | whey protein optimum nutrition | whey protein kinder | سعر واي بروتين في السعودية | سعر واي بروتين كونسنتريت | فوائد واي بروتين كونسنتريت
- H1: واي بروتين
- Title: واي بروتين أصلي بأفضل سعر في السعودية | اوبتيمال اكس

#### C03. واي بروتين ايزوليت
- Page: type category, slug `/category/whey-isolate`
- Head query: واي بروتين ايزوليت
- Intent: transactional
- Members (n=30, verbatim from S1; seeds واي بروتين، بروتين ايزو، بروتين ايزوليت، واي ايزوليت، whey، سعر واي بروتين، افضل واي بروتين، فوائد واي بروتين، اضرار واي بروتين، طريقة استخدام واي بروتين، نيترو تك): واي بروتين ايزوليت | بروتين ايزوليت | بروتين ايزو | واي بروتين ايزو | بروتين ايزوليت للنساء | بروتين ايزوليت 100 | بروتين ايزوليت خام | بروتين ايزوليت زيرو | بروتين ايزوليت فانيلا | بروتين ايزوليت سعر | بروتين ايزو فانيلا | بروتين ايزو تريبل زيرو | بروتين ايزو زيرو | بروتين ايزو شوكلت | بروتين ايزو فليكس | بروتين ايزو اكس بي | واي ايزوليت بروتين | واي ايزوليت 100 | كلير واي ايزوليت | واي بروتين ايزوليت خام | سعر واي بروتين ايزوليت | whey protein isolate | whey isolate | whey isolate بروتين | أفضل واي بروتين ايزوليت | فوائد واي بروتين ايزوليت | فوائد ايزو واي بروتين | أضرار واي بروتين ايزوليت | طريقة استخدام واي بروتين ايزوليت | نيترو تك ايزوليت
- H1: واي بروتين ايزوليت
- Title: واي بروتين ايزوليت أصلي بأفضل سعر | اوبتيمال اكس

#### C04. بروتين كازين
- Page: type category, slug `/category/casein`
- Head query: بروتين كازين
- Intent: transactional
- Members (n=14, verbatim from S1; seeds كازين، بروتين كازين، بروتين قبل النوم): كازين بروتين | بروتين كازين بطيء الامتصاص | بروتين كازين جولد ستاندرد | بروتين كازين فوائد | بروتين كازين فانيلا | بروتين كازين ابلايد نيوترشن | بروتين كازين سعر | بروتين كازين كوكي دو | بروتين كازين طبيعي | بروتين كازين كمال اجسام | بروتين كازين ابلايد | بروتين كازين في رمضان | كازين بروتين كوكيز | كازين بروتين قبل النوم
- H1: بروتين كازين
- Title: بروتين كازين بطيء الامتصاص بأفضل سعر | اوبتيمال اكس

#### C05. ماس جينر وبروتين زيادة الوزن
- Page: type category, slug `/category/mass-gainer`
- Head query: ماس جينر
- Intent: transactional
- Members (n=28, verbatim from S1; seeds ماس جينر، بروتين لزيادة الوزن، افضل بروتين لزيادة الوزن، افضل ماس جينر، سعر ماس جينر، بروتين للنحاف، بروتين للتضخيم، سعر بروتين): ماس جينر بروتين | ماس جينر لزيادة الوزن | ماس جينر بيف | ماس جينر بودي بيلدر | ماس جينر ابلايد | ماس جينر ابلايد نيوترشن | ماس جينر لابرادا | ماس جينر ديماتيز | ماس جينر لزيادة الوزن للبنات | ماس جينر الدب الروسي | افضل ماس جينر للتضخيم | أفضل ماس جينر لزيادة الوزن | افضل ماس جينر في العالم | سعر ماس جينر في السعودية | سعر ماس جينر لزيادة الوزن | سعر ماس جينر 5 كيلو | سعر ماس جينر الأمريكي | بروتين لزيادة الوزن والعضلات | بروتين لزيادة الوزن للرجال | بروتين لزيادة الوزن للنساء | بروتين لزيادة الوزن بدون سكر | بروتين لزيادة الوزن طبيعي | افضل بروتين لزيادة الوزن | افضل بروتين لزيادة الوزن والضخامة | افضل بروتين لزيادة الوزن للرجال | أفضل بروتين لزيادة الوزن والكتله العضلية | أفضل مسحوق بروتين لزيادة الوزن | افضل مكمل بروتين لزيادة الوزن
- Overflow (same page, n=12): بروتين للنحافه | افضل بروتين للنحافة | افضل بروتين للنحاف | واي بروتين للنحافه | بروتين ماس للتضخيم | أفضل بروتين لزيادة الوزن للنساء | افضل بروتين لزيادة الوزن للبنات | سعر بروتين الدب الروسي 10000 في السعودية | best mass gainer | best mass gainer protein | best mass gainer for bulking | best mass gainer supplement
- H1: ماس جينر
- Title: ماس جينر لزيادة الوزن أصلي بأفضل سعر | اوبتيمال اكس

#### C06. بروتين نباتي
- Page: type category, slug `/category/plant-protein`
- Head query: بروتين نباتي
- Intent: transactional
- Members (n=12, verbatim from S1; seeds بروتين نباتي، مكملات بروتين، افضل بروتين للنساء، هل البروتين): بروتين نباتي بودر | بروتين نباتي طبيعي | بروتين نباتي عالي | بروتين نباتي للرجيم | بروتين نباتي لكمال الأجسام | بروتين نباتي كامل | بروتين نباتي مكمل | بروتين نباتي ليمتلس | بروتين نباتي خام | مكملات بروتين نباتي | افضل بروتين نباتي للنساء | هل البروتين النباتي يبني العضلات
- H1: بروتين نباتي
- Title: بروتين نباتي بودر أصلي بأفضل سعر | اوبتيمال اكس

#### C07. بروتين بار
- Page: type category, slug `/category/protein-bars`
- Head query: بروتين بار
- Intent: transactional
- Members (n=25, verbatim from S1; seeds بروتين، بروتين بار، افضل بروتين بار، بروتين بار السعودية، اون بروتين، كوكيز بروتين، شوفان بروتين، افضل بروتين لزيادة الوزن): بروتين بار | بروتين بار بدون سكر | بروتين بار اوريو | بروتين بار باربلز | بروتين بار بالفول السوداني | بروتين بار سنيكرز | بروتين بار رخيص | بروتين بار كويست | بروتين بار قرنيد | بروتين بار كوكيز | بروتين بار كيتو | بروتين بار grenade | افضل بروتين بار | افضل بروتين بار صحي | افضل بروتين بار للدايت | best protein bar | best protein bar without sugar | best protein bar brands | best protein bar low calorie | best protein bar barebells | سعر بروتين بار في السعودية | on protein bar | كوكيز بروتين بار | شوفان بروتين بار | أفضل بروتين بار لزيادة الوزن
- H1: بروتين بار
- Title: بروتين بار بدون سكر أصلي بأفضل سعر | اوبتيمال اكس

#### C08. سناكات بروتين (شيبس، كوكيز، شوفان، زبدة فول سوداني)
- Page: type category, slug `/category/protein-snacks`
- Head query: شوفان بروتين
- Intent: transactional
- Members (n=30, verbatim from S1; seeds كوكيز بروتين، شيبس بروتين، شوفان بروتين، زبدة الفول السوداني): كوكيز بروتين باودر | بروتين كوكيز اند كريم | بروتين كوكيز ايزو | cookies protein | cookies protein powder | cookies protein bar | cookies protein shake | cookies protein whey | شيبس بروتين صحي | شيبس بروتين كويست | شيبس بروتين بالانس | شيبس بروتين برولايف | chips protein | chips protein snack | chips protein quest | chips protein puffs | شوفان بروتين بالعسل | شوفان بروتين ولا كارب | شوفان بروتين كويكر | شوفان بروتين oats | شوفان بروتين عالي | شوفان بروتيني | شوفان بروتين شوكولاته | شوفان بروتين سريع التحضير | شوفان بروتين اوتس | زبدة الفول السوداني الصحية | زبدة الفول السوداني بدون سكر | زبدة الفول السوداني العضوية | زبدة الفول السوداني بالعسل | زبدة الفول السوداني الطبيعية
- Overflow (same page, n=3): زبدة الفول السوداني خشنة | زبدة الفول السوداني تزيد الوزن | cookies protein recipe
- H1: سناكات بروتين
- Title: سناكات بروتين: شيبس وكوكيز وشوفان | اوبتيمال اكس

### 2.2 Type categories: performance

#### C09. كرياتين
- Page: type category, slug `/category/creatine`
- Head query: كرياتين
- Intent: transactional
- Members (n=29, verbatim from S1; seeds كرياتين، افضل كرياتين، كرياتين مونوهيدرات، creatine، سعر الكرياتين، gold standard، سعر جولد ستاندرد، نيترو تك): كرياتين مونوهيدرات | كرياتين مكمل | كرياتين كريابيور | كرياتين مونوهيدرات كريابيور | كرياتين بيور | كرياتين ابلايد نيوترشن | كرياتين جولد | كرياتين مونوهايدريت | كرياتين حبوب | كرياتين بودي بيلدر | كرياتين ابلايد | افضل كرياتين للعضلات | افضل كرياتين في السعودية | أفضل كرياتين مونوهيدرات | افضل كرياتين في العالم | افضل كرياتين لبناء العضلات | افضل كرياتين للجيم | افضل كرياتين لكمال الاجسام | كرياتين مونوهيدرات بيسك | كرياتين مونوهيدرات ميكرونيزد | كرياتين مونوهيدرات اوبتيموم نيوتريشن | كرياتين مونوهيدرات قولد | كرياتين مونوهيدرات حبوب | كرياتين مونوهيدرات creapure | creatine monohydrate | creatine creapure | creatine monohydrate creapure | creatine monohydrate micronized | creatine gummies
- Overflow (same page, n=7): سعر الكرياتين في السعوديه | سعر الكرياتين مونوهيدرات | سعر الكرياتين للجيم | gold standard creatine | سعر كرياتين جولد ستاندرد | نيترو تك كرياتين | creatine optimum nutrition
- H1: كرياتين مونوهيدرات
- Title: كرياتين مونوهيدرات أصلي بأفضل سعر | اوبتيمال اكس

#### C10. بري وورك اوت
- Page: type category, slug `/category/pre-workout`
- Head query: بري وورك اوت
- Intent: transactional
- Members (n=22, verbatim from S1; seeds بري وورك اوت، مكمل قبل التمرين، افضل بري وركاوت، c4 بري وورك اوت، gold standard): بري ورك اوت | بري ورك اوت abe | بري ورك اوت بدون كافيين | بري ورك اوت قوست | بري ورك اوت مشروب | بري ورك اوت شوت | بري ورك اوت c4 | بري ورك اوت 400 كافيين | بري ورك اوت توت | بري ورك اوت abe شوت | مكمل قبل التمرين بدون كافيين | مكمل غذائي قبل التمرين | مكمل باور قبل التمرين | أفضل مكمل باور قبل التمرين | افضل مكمل بري ورك اوت | افضل مشروب بري ورك اوت | افضل نكهة بري ورك اوت | افضل بري ورك اوت للنساء | c4 بري ورك اوت | سعر بري ورك اوت c4 | gold standard pre workout | c4 pre workout
- H1: بري وورك اوت (مكملات ما قبل التمرين)
- Title: بري وورك اوت مكمل قبل التمرين بأفضل سعر | اوبتيمال اكس

#### C11. أحماض أمينية (بي سي اي اي و اي اي اي)
- Page: type category, slug `/category/amino-acids`
- Head query: احماض امينية
- Intent: transactional with an informational tail (فوائد، ما هو، شرح)
- Members (n=21, verbatim from S1; seeds احماض امينية، بي سي اي اي، bcaa، ماسل تك): احماض امينية eaa | احماض امينية bcaa | احماض امينية اساسية | بي سي اي اي فوائد | مكمل بي سي اي اي | مشروب بي سي اي اي | bcaa مكمل | bcaa فوائد | bcaas | bcaa ما هو | bcaa xtend | bcaa مشروب | bcaa فوائد وأضرار | bcaa سعر | bcaa powder | bcaa معنى | bcaa eaa | bcaa glutamine | bcaa شرح | امينو ماسل تك | eaa ماسل تك
- H1: أحماض أمينية: بي سي اي اي و اي اي اي
- Title: أحماض أمينية للرياضيين بأفضل سعر | اوبتيمال اكس

#### C12. جلوتامين
- Page: type category, slug `/category/glutamine`
- Head query: جلوتامين
- Intent: transactional with an informational tail (فوائد الجلوتامين)
- Members (n=15, verbatim from S1; seeds جلوتامين، فوائد الجلوتامين، كم سكوب): جلوتامين بودر | جلوتامين حبوب | جلوتامين مكمل غذائي | جلوتامين ماهو | جلوتامين فوائده | كم سكوب جلوتامين في اليوم | فوائد الجلوتامين للرجال | فوائد الجلوتامين للنساء | فوائد الجلوتامين للعضلات | فوائد الجلوتامين للجسم | فوائد الجلوتامين قبل النوم | فوائد الجلوتامين على الريق | فوائد الجلوتامين لكمال الأجسام | فوائد الجلوتامين للرياضيين | فوائد الجلوتامين للمفاصل
- H1: جلوتامين
- Title: جلوتامين بودر وحبوب أصلي بأفضل سعر | اوبتيمال اكس

#### C13. سيترولين ماليت وبيتا الانين
- Page: type category, slug `/category/citrulline-beta-alanine`
- Head query: سيترولين ماليت
- Intent: transactional with an informational tail
- Members (n=20, verbatim from S1; seeds سيترولين، بيتا الانين): سيترولين ماليت | سيترولين مالات | سيترولين مكمل | سيترولين طبيعي | سيترولين ارجنين | سيترولين ماليت فوائد | سيترولين للرجال | سيترولين حبوب | سيترولين فوائد | سيترولين لكمال الاجسام | سيترولين وبيتا الانين | بيتا الانين فوائد | بيتا الانين كبسولات | بيتا الانين قبل التمرين | بيتا الانين لكمال الاجسام | بيتا الانين مكمل غذائي | بيتا الانين و سيترولين | بيتا الانين سعر | بيتا الانين اقراص | بيتا الانين اضرار
- H1: سيترولين ماليت وبيتا الانين
- Title: سيترولين ماليت وبيتا الانين بأفضل سعر | اوبتيمال اكس

#### C14. ال كارنتين وسي ال ايه
- Page: type category, slug `/category/l-carnitine-cla`
- Head query: ال كارنتين
- Intent: transactional
- Claim note: this page sells the ingredients by name. It must not use "حارق دهون" or promise fat loss; those phrases are excluded in section 3 and, for the search box only, mapped as synonyms in section 5.
- Members (n=23, verbatim from S1; seeds كارنتين، ال كارنتين، سي ال ايه): كارنتين شراب | كارنتين 2000 | كارنتين 1000 | كارنتين للرجال | كارنتين حبوب | كارنتين بلس | كارنتين ١٠٠٠ | كارنتين شراب للنساء | كارنتين 3000 | كارنتين للنساء | كارنتين مكمل غذائي | كارنتين 500 | ال كارنتين بلس | ال كارنتين 2000 | ال كارنتين 3000 | ال كارنتين شراب | ال كارنتين 1000 | ال كارنتين للرجال | ال كارنتين حبوب | سي ال ايه والكارنتين | سي ال اي كارنتين | ناو سي ال ايه | فوائد سي ال ايه
- H1: ال كارنتين وسي ال ايه
- Title: ال كارنتين وسي ال ايه أصلي بأفضل سعر | اوبتيمال اكس

### 2.3 Type categories: vitamins, minerals, health

#### C15. أوميغا 3 وزيت السمك
- Page: type category, slug `/category/omega-3`
- Head query: اوميغا 3
- Intent: transactional
- Members (n=12, verbatim from S1; seeds اوميغا 3، زيت السمك، اوبتيمم): اوميغا 3 للرجال | اوميغا 3 سبورتس ريسيرتش | اوميغا 3 فورت | اوميغا 3 مكمل غذائي | اوميغا 3 1000 | اوميغا 3 6 9 | زيت السمك حبوب | زيت السمك اوميجا 3 | زيت السمك النرويجي | اوبتيمم اوميجا ٣ | اوميغا 3 جي بي | زيت السمك للمفاصل
- H1: أوميغا 3 وزيت السمك
- Title: أوميغا 3 وزيت السمك أصلي بأفضل سعر | اوبتيمال اكس

#### C16. فيتامين د3
- Page: type category, slug `/category/vitamin-d`
- Head query: فيتامين د
- Intent: transactional with an informational tail (متى يؤخذ، طريقة استخدام)
- Stock note: 50000 IU strengths are pharmacy items in Saudi Arabia; the page can rank for the query while offering the daily strengths it stocks and explaining the difference.
- Members (n=24, verbatim from S1; seeds فيتامين د، فيتامين د 50000، فيتامين د3، اوبتيمم): فيتامين دال | فيتامين دي | فيتامين د 50000 | فيتامين د الطبيعي | فيتامين د 5000 | فيتامين د مع k2 | فيتامين د٣ | فيتامين دال مع k2 | فيتامين دال ٥٠٠٠٠ | فيتامين دال ٥٠ الف | فيتامين دي 3 | فيتامين د3 مع k2 | فيتامين د3 5000 | فيتامين د3 1000 | فيتامين د3 و ك2 | فيتامين د3 2000 | فيتامين د3 (vitamin d3) | فيتامين د3 50 الف | فيتامين د 50000 مع k2 | فيتامين د 50000 طريقة استخدام | فيتامين د 50000 متى يؤخذ | فيتامين د 50000 مرتين بالاسبوع | فيتامين د 50000 وحده | اوبتيموم د٣
- H1: فيتامين د3
- Title: فيتامين د3 مع k2 بأفضل سعر في السعودية | اوبتيمال اكس

#### C17. فيتامين سي
- Page: type category, slug `/category/vitamin-c`
- Head query: فيتامين سي
- Intent: transactional
- Members (n=14, verbatim from S1; seeds فيتامين سي، فيتامين سي فوار، كولاجين ببتيد): فيتامين سي فوار | فيتامين سي مع زنك | فيتامين سي حبوب | فيتامين سي كومبلكس | فيتامين سي مع زنك فوار | فيتامين سي وزنك | فيتامين سي فوار مع زنك | فيتامين سي فوار فوائده | فيتامين سي فوار متى يشرب | فيتامين سي فوار كم سعره | فيتامين سي فوار ليمون | فيتامين سي فوار برتقال | فيتامين سي فوار بالتوت | كولاجين ببتيدات مع فيتامين سي
- H1: فيتامين سي
- Title: فيتامين سي فوار وحبوب أصلي بأفضل سعر | اوبتيمال اكس

#### C18. زنك
- Page: type category, slug `/category/zinc`
- Head query: زنك
- Intent: transactional
- Members (n=16, verbatim from S1; seeds زنك، زنك للرجال، مكملات للنساء، مكمل قبل التمرين): زنك حبوب | زنك بيكولينات | زنك جلوكونات | زنك كارنوزين | زنك جلايسينيت | فيتامين زنك للرجال | افضل زنك للرجال | فوائد زنك للرجال | حبوب زنك للرجال | زنك جلوكونات للرجال | زنك جلايسينيت للرجال | انواع زنك للرجال | كبسولات زنك للرجال | مكملات الزنك للنساء | مكمل الزنك قبل التمرين | سنتروم زنك للرجال
- H1: زنك
- Title: زنك بيكولينات وجلوكونات بأفضل سعر | اوبتيمال اكس

#### C19. مغنيسيوم جليسينات
- Page: type category, slug `/category/magnesium`
- Head query: مغنيسيوم
- Intent: transactional
- Members (n=28, verbatim from S1; seeds مغنيسيوم، مغنيسيوم جليسينات، مغنيسيوم للنوم): مغنيسيوم جلايسينيت | مغنيسيوم للنوم | مغنيسيوم ستريت | مغنيسيوم جليسينات | مغنيسيوم ماليت | مغنيسيوم كومبلكس | مغنيسيوم جلايسينيت للنوم | مغنيسيوم جلايسينيت 400 | مغنيسيوم بيسجليسينات | مغنيسيوم سترات | مغنيسيوم جليسينات 400 | مغنيسيوم جليسينات للنوم | مغنيسيوم جليسينات (magnesium glycinate) | مغنيسيوم جليسينات دكتور بيست | مغنيسيوم جليسينات 400 ملجم | مغنيسيوم جليسينات ثورن | مغنيسيوم جليسينات فوائد | مغنيسيوم جليسينات سولاري | مغنيسيوم جليسينات ليمتلس | مغنيسيوم جليسينات في السعودية | مغنيسيوم جليسينات ناو | مغنيسيوم للنوم والارق | مغنيسيوم للنوم فوار | مغنيسيوم للنوم والعضلات | مغنيسيوم للنوم العميق | مغنيسيوم للنوم والاسترخاء | مغنيسيوم للنوم جلايسينيت | مغنيسيوم للنوم اي نوع
- Overflow (same page, n=2): مغنيسيوم للنوم باودر | مغنيسيوم جاميسون
- H1: مغنيسيوم جليسينات
- Title: مغنيسيوم جليسينات 400 ملجم بأفضل سعر | اوبتيمال اكس

#### C20. ملتي فيتامين (عام وللرجال)
- Page: type category, slug `/category/multivitamin`
- Head query: ملتي فيتامين
- Intent: transactional
- Members (n=17, verbatim from S1; seeds ملتي فيتامين، ملتي فيتامين للرجال، فيتامينات للرجال، ماسلتك): ملتي فيتامين للرجال | ملتي فيتامين سنتروم | ملتي فيتامين سنتروم للرجال | ملتي فيتامين للرجال سنتروم | ملتي فيتامين للرجال مستورد | ملتي فيتامين للرجال رخيص | ملتي فيتامين للرجال للجيم | ملتي فيتامين للرجال امريكي | ملتي فيتامين للرجال فوار | ملتي فيتامين للرجال الرياضيين | ملتي فيتامين للرجال فوائده | ملتي فيتامين للرجال ليمتلس | ملتي فيتامين للرجال ليمتلس مان | فيتامينات للرجال للجيم | فيتامينات للرجال ليمتلس | ماسلتيك مالتي فيتامين | ماسلتيك بلاتينيوم
- H1: ملتي فيتامين
- Title: ملتي فيتامين للرجال والرياضيين بأفضل سعر | اوبتيمال اكس

#### C21. ملتي فيتامين وفيتامينات للنساء
- Page: type category, slug `/category/multivitamin-women`
- Head query: فيتامينات للنساء
- Intent: transactional
- Members (n=12, verbatim from S1; seeds ملتي فيتامين، ملتي فيتامين للنساء، فيتامينات للنساء، مكملات للنساء): ملتي فيتامين للنساء | ملتي فيتامين للنساء فوق الثلاثين | ملتي فيتامين للنساء سنتروم | ملتي فيتامين للنساء فوق الخمسين | ملتي فيتامين للنساء رخيص | ملتي فيتامين للنساء فوق الأربعين | ملتي فيتامين للنساء مستورد | ملتي فيتامين للنساء امريكي | ملتي فيتامين للنساء جاميز | فيتامينات للنساء سنتروم | فيتامينات للنساء فقط | مكملات سنتروم للنساء
- H1: ملتي فيتامين للنساء
- Title: ملتي فيتامين للنساء أصلي بأفضل سعر | اوبتيمال اكس

#### C22. كولاجين
- Page: type category, slug `/category/collagen`
- Head query: كولاجين
- Intent: transactional
- Members (n=30, verbatim from S1; seeds كولاجين، كولاجين بودر، كولاجين ببتيد، كولاجين للبشرة، هل مكملات): كولاجين بحري | كولاجين بقري | كولاجين طبيعي | كولاجين للمفاصل | كولاجين بيبتايد | كولاجين بودرة | كولاجين حبوب | كولاجين بلس | كولاجين بودرة للشرب | كولاجين بودرة بقري | كولاجين بودرة بحري | كولاجين بودر الماني | كولاجين بودر للمفاصل | كولاجين بودر امريكي | كولاجين بودره للعظام | كولاجين بودرة شركة ناو | كولاجين بودر أكياس | كولاجين ببتيدات | كولاجين ببتيدات بقري | كولاجين ببتيدات بحري | كولاجين ببتيد بودر | كولاجين بيبتيدز | كولاجين ببتيديز | كولاجين ببتيدات شركة بيسيكس | كولاجين ببتيد نيوسيل | ببتيدات كولاجين متحلل | ببتيد كولاجين السمك | سعر كولاجين ببتيد بودر | هل مكملات الكولاجين مفيدة | هل مكملات الكولاجين تزيد الوزن
- Overflow (same page, n=1): ببتيد كولاجين غير متحلل بالماء
- H1: كولاجين ببتيدات
- Title: كولاجين ببتيدات بحري وبقري بأفضل سعر | اوبتيمال اكس

#### C23. بيوتين
- Page: type category, slug `/category/biotin`
- Head query: بيوتين
- Intent: transactional
- Members (n=12, verbatim from S1; seeds بيوتين، بيوتين للشعر): بيوتين للشعر | بيوتين 10000 | بيوتين ١٠٠٠ | بيوتين جاميز | بيوتين للشعر والاظافر | بيوتين للشعر 10000 | بيوتين للشعر 5000 | بيوتين للشعر والاظافر والبشرة | بيوتين للشعر حلاوه | بيوتين للشعر سعره | بيوتين للشعر مستورد | بيوتين للشعر حبوب
- H1: بيوتين
- Title: بيوتين 5000 و10000 ميكروغرام بأفضل سعر | اوبتيمال اكس

#### C24. اشواغاندا
- Page: type category (product type), slug `/category/ashwagandha`
- Head query: اشواغاندا
- Intent: transactional
- Members (n=9, verbatim from S1; seeds اشواغاندا، اشواجاندا): اشواغاندا ksm 66 | اشواغاندا حبوب | اشواغاندا جاميز | اشواغاندا ksm | اشواغاندا فوائد | اشواغاندا حلاوه | اشواغاندا sensoril | اشواغاندا جاميسون | اشواغاندا اشواق
- H1: اشواغاندا
- Title: اشواغاندا KSM 66 أصلية بأفضل سعر | اوبتيمال اكس

#### C25. جلوكوزامين ودعم المفاصل
- Page: type category (product type), slug `/category/joint-support`
- Head query: جلوكوزامين
- Intent: transactional
- Claim note: members that say علاج، التهاب، الام، خشونة are excluded (section 3). The page uses "دعم" wording only.
- Members (n=16, verbatim from S1; seeds مكملات المفاصل، جلوكوزامين، فوائد الجلوتامين): مكملات لتقوية المفاصل والاربطة | مكملات لصحة المفاصل | مكملات لتقوية المفاصل | مكملات دعم المفاصل | مكملات لدعم المفاصل | افضل مكملات المفاصل | جلوكوزامين كوندرويتين | جلوكوزامين ام اس ام | جلوكوزامين سلفات | جلوكوزامين كوندرويتين msm | جلوكوزامين وكوندرويتين | جلوكوزامين بلس | جلوكوزامين هيدروكلوريد | جلوكوزامين للغضاريف | جلوكوزامين للمفاصل | جلوكوزامين + كوندروتن + ميثيل سلفونيل ميثان ، 120 كبسولة
- H1: جلوكوزامين ومكملات دعم المفاصل
- Title: جلوكوزامين ومكملات دعم المفاصل بأفضل سعر | اوبتيمال اكس

#### C26. الكتروليت والترطيب
- Page: type category (product type), slug `/category/electrolytes`
- Head query: الكتروليت
- Intent: transactional
- Members (n=12, verbatim from S1; seeds الكتروليت، مشروب طاقة للرياضيين): الكتروليتات | الكتروليتس | الكتروليت مشروب | الكترولايت فوار | الكتروليتات الجسم | الكتروليت ليمتلس | الكتروليت اقراص | الكتروليت قوي | الكتروليتات ماهي | الكترولايت طبيعي | مشروب طاقة طبيعي للرياضيين | افضل مشروب طاقه للرياضيين
- H1: الكتروليت ومشروبات الترطيب
- Title: الكتروليت ومشروبات الترطيب للرياضيين | اوبتيمال اكس

#### C27. اكسسوارات (شيكر) [below evidence threshold]
- Page: type category, slug `/category/accessories`
- Head query: شيكر بروتين
- Intent: transactional
- Members (n=3, verbatim from S1; seeds بروتين الدواء، ابي بروتين): شيكر بروتين الدواء | ebay protein shaker | ebay protein shaker bottle
- Evidence note: no accessory seed was harvested, so the page is under-evidenced from S1; it is kept because BUILD.md lists اكسسوارات as a category. A follow-up harvest with seeds شيكر، شيكر بروتين، حزام رفع اثقال، قفازات جيم is the gap to close. Two of the three members are eBay navigational and are listed here only as evidence that the product word is "شيكر" or "protein shaker".
- H1: شيكر وأكسسوارات
- Title: شيكر وأكسسوارات المكملات بأفضل سعر | اوبتيمال اكس

### 2.4 Goal collections (the six landings in BUILD.md) and one audience collection

#### G01. الطاقة
- Page: goal collection, slug `/goal/energy`
- Head query: مكمل طاقة قبل التمرين
- Intent: transactional
- Members (n=10, verbatim from S1; seeds كافيين حبوب، مكمل قبل التمرين، كم سكوب، مكملات رياضية، بروتين قبل التمرين): حبوب كافيين 200 | حبوب كافيين بديل القهوة | حبوب كافيين للصيام | حبوب كافيين سعر | مكمل طاقة قبل التمرين | أفضل مكمل طاقة قبل التمرين | مكمل الكارب قبل التمرين | كم سكوب كارب في اليوم | مكملات غذائية تمارين رياضية | بروتين باور قبل التمرين
- Evidence note: the harvest had no seed for "مكملات الطاقة" or "طاقة ونشاط"; the energy landing inherits caffeine, carbohydrate and energy-drink phrasing. Pre-workout product queries stay on C10 and the C4 line on B05.
- H1: مكملات الطاقة
- Title: مكملات الطاقة والتركيز قبل التمرين | اوبتيمال اكس

#### G02. الصحة العامة
- Page: goal collection, slug `/goal/general-health`
- Head query: مكملات غذائية للرجال
- Intent: transactional
- Members (n=21, verbatim from S1; seeds فيتامينات للرجال، فيتامينات للنساء، مكملات غذائية، مكملات للنساء، ملتي فيتامين، مكملات كوم، اوميغا 3): فيتامينات للرجال بعد سن الاربعين | فيتامينات للرجال بعد سن الثلاثين | فيتامينات للرجال بعد الخمسين | فيتامينات للرجال بعد الستين | فيتامينات للرجال والنساء | مكملات غذائية للرجال | مكملات غذائية فيتامينات | مكملات بي كومبلكس | فيتامينات للنساء فوق الاربعين | فيتامينات للنساء فوق الخمسين | فيتامينات للنساء فوق الثلاثين | فيتامينات للنساء بعد الخمسين | فيتامينات للنساء في سن الاربعين | فيتامينات للنساء كبار السن | فيتامينات للنساء فوق الستين | للنساء مكملات غذائية | مكملات غذائية للنساء | مكملات غذائيه للنساء بعد سن الاربعين | مكملات غذائية للنساء بعد الخمسين | مكملات بروبيوتيك للنساء | اوميغا 3 مع فيتامين د
- H1: مكملات الصحة العامة
- Title: مكملات الصحة العامة والفيتامينات اليومية | اوبتيمال اكس

#### G03. الأداء
- Page: goal collection, slug `/goal/performance`
- Head query: مكملات كمال الاجسام
- Intent: transactional with a strong informational tail (اهم، انواع، اسماء، ما هي)
- Members (n=17, verbatim from S1; seeds مكملات كمال الاجسام، مكملات الجيم، مكملات رياضية، مكملات غذائية): اهم مكملات كمال الاجسام | جميع مكملات كمال الاجسام | افضل مكملات كمال الاجسام | انواع مكملات كمال الاجسام | مكملات غذائية كمال الاجسام | اشهر مكملات كمال الاجسام | مكملات يحتاجها لاعب كمال الاجسام | افضل شركة مكملات كمال الاجسام | مكملات غذائية لزيادة الوزن كمال الاجسام | انواع مكملات الجيم | اسماء مكملات الجيم | افضل مكملات الجيم | اهم مكملات الجيم | مكملات غذائية الجيم | ما هي مكملات الجيم | مكملات غذائية رياضية | مكملات غذائية للرجال للجيم
- Editorial note: this landing needs a 150 to 250 word explainer above the grid ("ما هي مكملات الجيم وما الذي يحتاجه المبتدئ") or the informational members will not be satisfied; beginners go to U11.
- H1: مكملات الأداء لكمال الأجسام والجيم
- Title: مكملات الأداء لكمال الأجسام والجيم | اوبتيمال اكس

#### G04. التعافي
- Page: goal collection, slug `/goal/recovery`
- Head query: بروتين بعد التمرين
- Intent: transactional with an informational tail (what to take after training and before sleep)
- Members (n=30, verbatim from S1; seeds بروتين بعد التمرين، بروتين قبل النوم، وش افضل بروتين، فوائد واي بروتين، كم سكوب بروتين، فوائد الكرياتين): بروتين بعد التمرين للنساء | بروتين بعد التمرين لبناء العضلات | افضل بروتين بعد التمرين | وجبات بروتين بعد التمرين | وجبة بروتين بعد التمرين | اكل بروتين بعد التمرين | شرب بروتين بعد التمرين | مصادر بروتين بعد التمرين | بروتين بار بعد التمرين | سكوب بروتين بعد التمرين | افضل بروتين بعد التمرين للنساء | بروتين طبيعي بعد التمرين | وش افضل بروتين بعد التمرين | فوائد واي بروتين بعد التمرين | كم سكوب بروتين بعد التمرين | فوائد الكرياتين بعد التمرين | شرب بروتين قبل النوم | اكل بروتين قبل النوم | افضل بروتين قبل النوم | سكوب بروتين قبل النوم | واي بروتين قبل النوم | وجبة بروتين قبل النوم | حليب بروتين قبل النوم | بروتين بار قبل النوم | بروتين شيك قبل النوم | whey protein قبل النوم | عادي اشرب بروتين قبل النوم | فوائد شرب بروتين قبل النوم | فوائد الواي بروتين قبل النوم | زبادي بروتين قبل النوم؟
- H1: مكملات التعافي
- Title: مكملات التعافي بعد التمرين وقبل النوم | اوبتيمال اكس

#### G05. الشعر والبشرة
- Page: goal collection, slug `/goal/hair-skin`
- Head query: فيتامينات للشعر
- Intent: transactional
- Claim note: hair-treatment products (بروتين الشعر، كيراتين) are a different market and are excluded in section 3. This landing holds ingestible supplements only, with "يساهم في الحفاظ على" wording.
- Members (n=30, verbatim from S1; seeds فيتامينات للشعر، مكملات غذائية، ملتي فيتامين، كولاجين للبشرة، كولاجين، كولاجين بودر، زنك للشعر، اوميغا 3، زيت السمك): فيتامينات للشعر والاظافر | فيتامينات للشعر والبشرة | فيتامينات للشعر والاظافر والبشرة | فيتامينات للشعر رخيصه | مكملات غذائية للشعر | ملتي فيتامين للنساء للشعر | كولاجين للبشرة والشعر | كولاجين للبشرة اكياس | كولاجين للبشرة الجافة | كولاجين للبشرة شراب | كولاجين للبشرة والعظام | كولاجين للبشرة والمفاصل | كولاجين للبشرة الدهنية | كولاجين للبشرة والشعر والاظافر | كولاجين للبشرة طبيعي | كولاجين للبشرة اقراص | كولاجين للبشرة والشعر والمفاصل | كولاجين بودره للبشره | كولاجين للوجة | زنك للشعر حبوب | زنك للشعر والاظافر | زنك للشعر فيتامين | زنك للشعر والبشرة | zinc للشعر | افضل زنك للشعر | فوائد زنك للشعر | كبسولات زنك للشعر | اقراص زنك للشعر | اوميغا 3 للشعر | زيت السمك للشعر
- Overflow (same page, n=4): زيت السمك للبشرة | زيت السمك للوجه | فوائد الجلوتامين للبشرة | فوائد الكرياتين للبشرة
- H1: مكملات الشعر والبشرة والأظافر
- Title: مكملات الشعر والبشرة والأظافر بأفضل سعر | اوبتيمال اكس

#### G06a. الوزن المثالي: زيادة الكتلة (التضخيم)
- Page: goal collection, slug `/goal/ideal-weight` (anchor `#gain`; if the team prefers separate URLs: `/goal/ideal-weight/gain`)
- Head query: بروتين للتضخيم
- Intent: transactional
- Naming note: "الوزن المثالي" is also the trade name of a Saudi supplement retail chain that appears 12 times in S1 as a navigational modifier (كرياتين الوزن المثالي، واي بروتين الوزن المثالي). Keep the goal name in the UI, but do not use "الوزن المثالي" alone as an H1 or title; pair it with the outcome words so the page is not read as the competitor.
- Members (n=21, verbatim from S1; seeds بروتين للتضخيم، واي بروتين للتضخيم، افضل كرياتين، افضل بروتين للنساء، افضل بروتين للتنشيف، بروتين للمبتدئين، افضل بروتين للمبتدئين): بروتين للتضخيم للرجال | بروتين للتضخيم للبنات | بروتين للتضخيم بدون دهون | افضل بروتين للتضخيم | واي بروتين للتضخيم | افضل بروتين للتضخيم وزيادة الوزن | اقوى بروتين للتضخيم | افضل بروتين للتضخيم بدون دهون | كورس بروتين للتضخيم | أفضل بروتين للتضخيم للمبتدئين | افضل بروتين للتضخيم طبيعي | انواع بروتين للتضخيم | واي بروتين ايزوليت للتضخيم | افضل واي بروتين للتضخيم | واي بروتين جولد ستاندرد للتضخيم | افضل كرياتين للتضخيم | أفضل بروتين للتضخيم للنساء | افضل بروتين للتنشيف والتضخيم | بروتين تضخيم للمبتدئين | أفضل بروتين طبيعي لتضخيم العضلات للمبتدئين | أفضل بروتين لزيادة الوزن والضخامة للمبتدئين
- H1: بروتين ومكملات زيادة الكتلة العضلية
- Title: مكملات التضخيم وزيادة الكتلة العضلية | اوبتيمال اكس

#### G06b. الوزن المثالي: التنشيف
- Page: goal collection, slug `/goal/ideal-weight` (anchor `#lean`; or `/goal/ideal-weight/lean`)
- Head query: بروتين للتنشيف
- Intent: transactional
- Claim note: "التنشيف" is a training-phase term and is targetable with "يناسب مرحلة التنشيف" wording. Members with "حرق الدهون", "التنحيف" or "التخسيس" are excluded (section 3) because they read as an outcome promise.
- Members (n=21, verbatim from S1; seeds بروتين للتنشيف، افضل بروتين للتنشيف، واي بروتين للتنشيف، كرياتين للتنشيف، افضل كرياتين، افضل واي بروتين، افضل بروتين بار): بروتين للتنشيف للرجال | بروتين للتنشيف للنساء | افضل بروتين للتنشيف | واي بروتين للتنشيف | بروتين ايزو للتنشيف | افضل بروتين للتنشيف للنساء | بروتين بار للتنشيف | اقوى بروتين للتنشيف | افضل بروتين للتنشيف طبيعي | واي بروتين ايزوليت للتنشيف | افضل واي بروتين للتنشيف | افضل مكمل بروتين للتنشيف | افضل بروتين بار للتنشيف | افضل بروتين باودر للتنشيف | افضل انواع بروتين للتنشيف | creatine للتنشيف | افضل كرياتين للتنشيف | افضل كرياتين للتنشيف وبناء العضلات | كرياتين مونوهيدرات للتنشيف | هل يوجد كرياتين للتنشيف | كم سكوب بروتين في اليوم للتنشيف
- H1: بروتين ومكملات مرحلة التنشيف
- Title: مكملات التنشيف: بروتين ايزوليت وكرياتين | اوبتيمال اكس

#### A01. مكملات وبروتين للنساء (audience collection, proposed addition)
- Page: audience collection, slug `/collection/women`
- Head query: بروتين للنساء
- Intent: transactional
- Why a page: S1 returned 15 suggestions each for بروتين للنساء، بروتين للبنات، افضل بروتين للنساء and مكملات للنساء. That is the deepest audience signal in the harvest and none of the six goals owns it. Sporter also runs a "للنساء فقط" section (S3).
- Members (n=30, verbatim from S1; seeds بروتين للنساء، بروتين للبنات، افضل بروتين للنساء، مكملات للنساء، مكملات رياضية، واي بروتين للبنات، بروتين قبل التمرين): بروتين للنساء لزيادة الوزن | protein للنساء | بروتين باودر للنساء | الواي بروتين للنساء | بروتين للجسم للنساء | أفضل بروتين للنساء لزيادة الوزن | أفضل بروتين للنساء بعد الرياضة | افضل بروتين للنساء | أفضل بروتين للنساء للعضلات | افضل بروتين باودر للنساء | افضل واي بروتين للنساء | افضل بروتين شيك للنساء | افضل شراب بروتين للنساء | أفضل بروتين للجسم للنساء | افضل مكمل بروتين للنساء | مكملات البروتين للنساء | مكملات الكرياتين للنساء | مكملات رياضية للنساء | مكملات غذائية للنساء لزيادة الوزن | بروتين للبنات لزيادة الوزن | بروتين للجسم للبنات | واي بروتين للبنات | افضل بروتين للبنات | ماس بروتين للبنات | بروتين شيك للبنات | سكوب بروتين للبنات | بروتين الجسم للبنات | بروتين طبيعي للبنات | واى بروتين لزيادة الوزن للبنات | بروتين قبل التمرين للنساء
- H1: بروتين ومكملات للنساء
- Title: بروتين للنساء والبنات أصلي بأفضل سعر | اوبتيمال اكس

### 2.5 Brand pages and product pages

#### B01. اوبتيموم نيوتريشن (Optimum Nutrition)
- Page: brand page, slug `/brand/optimum-nutrition`
- Head query: اوبتيموم نيوتريشن
- Intent: navigational to the brand, transactional
- Members (n=26, verbatim from S1; seeds اوبتيموم نيوتريشن، اوبتيمم، اون بروتين، جولد ستاندرد): أوبتيموم نيوتريشن | اوبتيموم نيوتريشن بروتين | اوبتيموم نيوترشن كرياتين | اوبتيموم نيوترشن واي بروتين | اوبتيموم نيوترشن سيرياس ماس فانيلا 6 باوند | اوبتيموم نيوترشن كرياتين ميكرونايزد باودر | اوبتيمم نيوترشن | اوبتيموم | اوبتيمم مكمل غذائي | اوبتيمم نيوترشن كرياتين | اوبتيمم نيوترشن جولد ستاندرد 100 واى | اوبتيموم نيوترشن | اوبتيمم نيوترشن جولد ستاندرد | on protein | on protein powder | on protein whey | on protein isolate | on protein shake | on protein powder isolate | on protein price | on protein powder 1kg | on protein gold standard | on protein 1kg | on protein powder chocolate | 2kg protein | nutrition gold standard
- H1: اوبتيموم نيوتريشن
- Title: اوبتيموم نيوتريشن أصلي بأفضل سعر | اوبتيمال اكس

#### P01. جولد ستاندرد واي بروتين (ON Gold Standard 100% Whey)
- Page: product page, slug `/product/on-gold-standard-100-whey`
- Head query: جولد ستاندرد
- Intent: transactional (price and size variants), navigational
- Members (n=30, verbatim from S1; seeds جولد ستاندرد، gold standard، جولد ستاندرد واي، سعر جولد ستاندرد، فوائد واي بروتين): جولد ستاندرد واي بروتين | جولد ستاندرد واي | جولد ستاندرد بروتين | gold standard whey protein | gold standard | gold standard whey | gold standard protein | gold standard protein powder | gold standard 100 whey | gold standard whey بروتين | gold standard 100 whey (من شركة optimum nutrition) | gold standard 100 | جولد ستاندرد واي بروتين فانيلا | gold standard way | سعر جولد ستاندرد واي بروتين | جولد ستاندرد 100 واي بروتين | مكمل جولد ستاندرد واي بروتين | فوائد جولد ستاندرد واي بروتين | بروتين جولد ستاندرد واي من اوبتيموم نيوتريشن | أوبتيموم نيوتريشن جولد ستاندرد واي | أوبتيموم جولد ستاندرد 100 واي بروتين | اوبتيموم جولد ستاندرد 100 واي | واي جولد ستاندرد 100 5 باوند | سعر بروتين جولد ستاندرد | سعر واي بروتين جولد ستاندرد 5 كيلو | سعر واي بروتين جولد ستاندرد 1 كيلو | سعر واي بروتين جولد ستاندرد 2 كيلو | سعر واي بروتين جولد ستاندرد في السعودية | فوائد واي بروتين جولد ستاندرد | فوائد واي بروتين جولد
- Overflow (same page, n=3): whey protein gold standard | whey gold standard | سعر gold standard whey
- H1: جولد ستاندرد 100% واي بروتين من اوبتيموم نيوتريشن
- Title: جولد ستاندرد واي بروتين أصلي بأفضل سعر | اوبتيمال اكس

#### P02. جولد ستاندرد ايزوليت (ON Gold Standard 100% Isolate)
- Page: product page, slug `/product/on-gold-standard-isolate`
- Head query: جولد ستاندرد ايزوليت
- Intent: transactional
- Members (n=12, verbatim from S1; seeds جولد ستاندرد، gold standard، سعر جولد ستاندرد، بروتين ايزوليت، واي ايزوليت): جولد ستاندرد ايزوليت | gold standard isolate | gold standard 100 isolate | gold standard whey protein isolate | سعر جولد ستاندرد ايزوليت | gold standard isolate سعر | سعر بروتين جولد ستاندرد ايزوليت | بروتين ايزوليت جولد ستاندرد | واي بروتين ايزوليت جولد ستاندرد | واي جولد ستاندرد ايزوليت | بروتين جولد ايزوليت | واي جولد ايزوليت
- H1: جولد ستاندرد 100% ايزوليت
- Title: جولد ستاندرد ايزوليت أصلي بأفضل سعر | اوبتيمال اكس

#### P03. سيرياس ماس (ON Serious Mass)
- Page: product page, slug `/product/on-serious-mass`
- Head query: سيرياس ماس
- Intent: transactional with dose questions
- Members (n=15, verbatim from S1; seeds سيريس ماس، كم سكوب، كم سكوب بروتين، الفرق بين واي بروتين، gold standard): سيرياس ماس | سيرياس ماس بروتين | سيرياس ماس فانيلا | سيرياس ماس 12 باوند | سيرياس ماس لزيادة الوزن | سيرياس ماس 6 باوند | سيرياس ماس فوائد | سيرياس ماس شوكولاته | سيرياس ماس 5 كيلو | كم سكوب سيرياس ماس في اليوم | كم سكوب بروتين سيرياس ماس | كم سكوب بروتين في اليوم سيرياس ماس | الفرق بين واي بروتين و سيرياس ماس | gold standard gainer | gold standard pro gainer
- Naming note: the seed was spelled سيريس ماس; every suggestion came back as سيرياس ماس, so the product name on the store must be سيرياس ماس.
- H1: سيرياس ماس من اوبتيموم نيوتريشن
- Title: سيرياس ماس من اوبتيموم أصلي بأفضل سعر | اوبتيمال اكس

#### B02. ديماتيز (Dymatize)
- Page: brand page, slug `/brand/dymatize`
- Head query: ديماتيز
- Intent: navigational, transactional
- Members (n=9, verbatim from S1; seeds ديماتايز، دايماتيز، بروتين ايزوليت، ايزو 100 دايماتيز): ديماتيز | ديماتيز ايزو | ديماتيز بروتين | ديماتيز نيوتريشن | ديماتيز سوبر ماس جينر | ديماتيز ماس جينر | ديماتيز كرياتين | ايزو ديماتيز | بروتين ايزوليت ديماتيز
- Naming note: both seeds ديماتايز and دايماتيز were normalised by Google to ديماتيز; the brand must be spelled ديماتيز on the store, with the other two spellings as search synonyms (section 5, section 7).
- H1: ديماتيز
- Title: ديماتيز بروتين وكرياتين أصلي بأفضل سعر | اوبتيمال اكس

#### P04. ايزو 100 (Dymatize ISO100)
- Page: product page, slug `/product/dymatize-iso-100`
- Head query: ايزو 100
- Intent: transactional (flavour, size, price), navigational
- Members (n=30, verbatim from S1; seeds ايزو 100، iso 100، ايزو 100 دايماتيز، ديماتايز، بروتين ايزو، سعر ايزو 100، سعر بروتين، كم سكوب بروتين): ايزو 100 بروتين | ايزو 100 فانيلا | ايزو 100 شوكولاتة | ايزو 100 5 باوند | ايزو 100 فول سوداني | ايزو 100 كوكيز | ايزو 100 فراوله | ايزو 100 واي بروتين | ايزو 100 سعر | ايزو 100 بروتين فانيلا | iso 100 dymatize | iso 100 بروتين | iso 100 من dymatize | iso 100 بروتين فانيلا | iso 100 protein | iso 100 vanilla | iso 100 5lb | iso 100 بروتين شوكولاته | iso 100 فانيلا | iso 100 chocolate | iso 100 من شركة dymatize | iso 100 whey protein | ديماتيز ايزو 100 بروتين | ديماتيز iso 100 | ديماتيز ايزو 100 بروتين فانيلا | ديماتيز ايزو 100 بروتين 5 باوند | ديماتيز ايزو 100 بروتين كوكيز اند كريم | ايزو 100 ديماتيز | بروتين ايزو 100 ديماتيز | بروتين ايزو 100
- Overflow (same page, n=19): بروتين ايزو 100 5 باوند | بروتين ايزو 100 فانيلا | بروتين ايزو 100 للنساء | بروتين ايزو 100 فول سوداني | بروتين ايزو دانكن | سعر ايزو 100 في السعودية | سعر ايزو 100 بروتين | سعر بروتين ايزو 100 في السعودية | سعر مكمل ايزو 100 | سعر علبة ايزو 100 | سعر dymatize iso 100 | سعر بروتين ايزو 100 | ديماتيز ايزو 100 جورمية شوكولاتة | ديماتيز ايزو 100 بروتين دانكن | ديماتيز ايزو 100 بروتين معزول | ديماتيز ايزو 100 (dymatize iso 100) | ايزو ١٠٠ ديماتيز | ديماتيز ايزو 100 - زبدة الفول السوداني بالشوكولاتة - 2.3 كجم | كم سكوب بروتين ايزو 100
- H1: ايزو 100 من ديماتيز (واي بروتين ايزوليت مهدرج)
- Title: ايزو 100 ديماتيز واي ايزوليت بأفضل سعر | اوبتيمال اكس

#### B03. ابلايد نيوترشن (Applied Nutrition)
- Page: brand page, slug `/brand/applied-nutrition`
- Head query: ابلايد نيوترشن
- Intent: navigational, transactional
- Members (n=11, verbatim from S1; seeds واي بروتين، whey، كرياتين مونوهيدرات، كرياتين كم سكوب، شوفان بروتين، ابي بروتين، creatine): واي بروتين ابلايد نيوترشن | واي بروتين ابلايد | whey protein applied nutrition | كرياتين مونوهيدرات ابلايد نيوترشن | كرياتين ابلايد كم.سكوب | creatine monohydrate applied nutrition | creatine applied nutrition | شوفان بروتين ابلايد نيوترشن | شوفان بروتين ابلايد | شوفان بروتين كريتيكال اوتس | abe بروتين
- Naming note: the brand is never written "أبلايد" or "ابلايد نيوتريشن" in S1; the form is ابلايد نيوترشن (short: ابلايد). The ABE pre-workout is written in Latin letters (abe) even inside Arabic queries.
- H1: ابلايد نيوترشن
- Title: ابلايد نيوترشن منتجات أصلية بأفضل سعر | اوبتيمال اكس

#### B04. ماسل تك (MuscleTech)
- Page: brand page, slug `/brand/muscletech`
- Head query: ماسل تك
- Intent: navigational, transactional
- Members (n=10, verbatim from S1; seeds ماسل تك، ماسلتك): ماسل تك كرياتين | مسل تك بروتين | مسل تك نيترو | كرياتين ماصل تك | ماسل تك وي | مكمل مسل تك | ماسلتيك | وي ماسلتيك | كرياتين ماسلتيك | كلير ماسل تك
- Naming note: four spellings coexist (ماسل تك، مسل تك، ماصل تك، ماسلتيك). Sporter uses "مسل تك" (S3). Recommend ماسل تك as the canonical form because it heads the longest list, with the other three as synonyms.
- H1: ماسل تك
- Title: ماسل تك بروتين وكرياتين أصلي بأفضل سعر | اوبتيمال اكس

#### P05. نيترو تك (MuscleTech Nitro-Tech)
- Page: product page, slug `/product/muscletech-nitro-tech`
- Head query: نيترو تك
- Intent: transactional, navigational
- Members (n=12, verbatim from S1; seed نيترو تك): نيترو تك بروتين | نيترو تك واي جولد | نيترو تك واي بروتين | نيترو تك جولد | نيترو تك ريبد | نيترو تك واي | نيترو تك واي جولد بروتين | نيترو تك ايزو | نيترو تك سعر | نيترو تك مكمل غذائي | نيترو تك بروتين سعر | nitro tech
- H1: نيترو تك واي بروتين من ماسل تك
- Title: نيترو تك واي بروتين من ماسل تك بأفضل سعر | اوبتيمال اكس

#### B05. سي فور (Cellucor C4)
- Page: product page (brand Cellucor), slug `/product/cellucor-c4`
- Head query: سي فور
- Intent: transactional, navigational
- Members (n=11, verbatim from S1; seeds c4، سي فور): c4 مشروب | c4 مكمل | c4 كم فيه كافيين | c4 بروتين | c4 شوت | c4 energy drink | سي فور مشروب | سي فور شوت | سي فور بودرة | سي فور مشروب طاقه | سي فور بروتين
- Naming note: the seed "سعر سي 4" returned only phones and cars; the Arabic form Saudis use for the product is سي فور, and the Latin c4 is the dominant form. Never write "سي 4".
- H1: سي فور بري وورك اوت من سيلوكور
- Title: سي فور بري وورك اوت من سيلوكور بأفضل سعر | اوبتيمال اكس

#### Brand pages below the evidence threshold (fewer than 8 S1 members)

These brands appear in S1 only as a modifier on a product query. Their members are owned by the category or product clusters above; a brand page is justified only when the catalogue carries the brand.

| Brand | Arabic form seen in S1 | S1 members | Where the members sit |
|---|---|---|---|
| NOW Foods | ناو | 3 (ناو سي ال ايه، كولاجين بودرة شركة ناو، مغنيسيوم جليسينات ناو) | C14, C22, C19 |
| Nordic Naturals | none | 0 | not in S1; no seed was run for it, so this is a harvest gap rather than absence of demand |
| Centrum | سنتروم | 7 (ملتي فيتامين سنتروم، ملتي فيتامين سنتروم للرجال، ملتي فيتامين للرجال سنتروم، ملتي فيتامين للنساء سنتروم، فيتامينات للنساء سنتروم، مكملات سنتروم للنساء، سنتروم زنك للرجال) | C20, C21, C18 |
| Limitless (Saudi brand) | ليمتلس | 7 (واي بروتين ايزوليت ليمتلس، بروتين نباتي ليمتلس، مغنيسيوم جليسينات ليمتلس، فيتامينات للرجال ليمتلس، ملتي فيتامين للرجال ليمتلس، ملتي فيتامين للرجال ليمتلس مان، الكتروليت ليمتلس) | C06, C19, C20, C26 (واي بروتين ايزوليت ليمتلس excluded: competitor-brand isolate the store may not stock) |
| Body Builder | بودي بيلدر | 3 (واي بروتين بودي بيلدر، كرياتين بودي بيلدر، ماس جينر بودي بيلدر) | C02, C09, C05 |
| Creapure (ingredient mark) | كريابيور | 5 | C09 |
| Quest | كويست | 4 (بروتين بار كويست، شيبس بروتين كويست، cookies protein quest، chips protein quest) | C07, C08 |
| Grenade | قرنيد / grenade | 2 | C07 |
| Barebells | باربلز / barebells | 2 | C07 |
| Sports Research | سبورتس ريسيرتش | 1 | C15 |
| Jamieson | جاميسون | 2 | C19, C24 |
| Dragon Pharma | دراجون فارما | 7 (دراجون فارما كرياتين، دراجون فارما بروتين، دراجون فارما سيترولين، شركة دراجون فارما، موقع دراجون فارما، منتجات دراجون فارما، واي بروتين دراجون فارما) | unassigned; brand page only if stocked |
| Ghost | قوست | 1 | C10 |
| Xtend | xtend | 1 | C11 |
| Labrada | لابرادا | 1 | C05 |
| Thorne, Doctor's Best, Solaray | ثورن، دكتور بيست، سولاري | 1 each | C19 |

### 2.6 Guide articles

BUILD.md budgets 8 launch articles. The 15 guide clusters below are ranked by member count inside each product family; the first 8 to write are U01, U07, U06, U10, U03, U08, U11, U05.

#### U01. متى آخذ الكرياتين وكيف أستخدمه
- Page: guide article, slug `/guides/how-to-take-creatine`
- Head query: متى اخذ الكرياتين
- Intent: informational
- Members (n=30, verbatim from S1; seeds متى اخذ الكرياتين، الكرياتين قبل ولا بعد التمرين، كيف استخدم الكرياتين، طريقة استخدام الكرياتين): متى اخذ الكرياتين قبل او بعد التمرين | متى اخذ الكرياتين للمبتدئين | متى اخذ الكرياتين قبل التمرين | متى اخذ الكرياتين في رمضان | متى اخذ الكرياتين بعد التمرين | متى اخذ الكرياتين والبروتين | متى يجب اخذ الكرياتين | متى يفضل اخذ الكرياتين | متى يفضل اخذ الكرياتين قبل او بعد التمرين | متى يمكن اخذ الكرياتين | متى ابدا اخذ الكرياتين | متى استطيع اخذ الكرياتين | متى يجب اخذ الكرياتين لكمال الاجسام | الكرياتين قبل ولا بعد التمرين افضل | الكرياتين يتاخد قبل ولا بعد التمرين | فوائد الكرياتين قبل التمرين ولا بعد التمرين | كيف استخدم الكرياتين لكمال الاجسام | كيف استخدم الكرياتين لأول مرة | كيف استخدم الكرياتين قبل التمرين | كيف استخدم الكرياتين للجسم | كيف استخدم الكرياتين للمبتدئين | كيف استخدم الكرياتين في رمضان | كيف استخدم مكمل الكرياتين | طريقة استخدام الكرياتين للمبتدئين | طريقة استخدام الكرياتين مع الماء | طريقة استخدام الكرياتين قبل أم بعد التمرين | طريقة استخدام الكرياتين لكمال الاجسام | طريقة استخدام الكرياتين مع العصير | طريقة استخدام الكرياتين مع البروتين | طريقة استخدام الكرياتين مونوهيدرات
- Overflow (same page, n=7): طريقة استخدام الكرياتين للعضلات | طريقه استخدام الكرياتين الصحيحه | طريقه استخدام الكرياتين للجيم | طريقة استخدام الكرياتين لاول مرة | طريقة استخدام الكرياتين في رمضان | طريقة استخدام الكرياتين مع الحليب | فوائد الكرياتين قبل التمرين
- H1: متى آخذ الكرياتين وكيف أستخدمه بالطريقة الصحيحة
- Title: متى آخذ الكرياتين: قبل أم بعد التمرين | اوبتيمال اكس

#### U02. كم سكوب كرياتين في اليوم
- Page: guide article, slug `/guides/creatine-dose`
- Head query: كرياتين كم سكوب
- Intent: informational
- Members (n=22, verbatim from S1; seeds كرياتين كم سكوب، كم سكوب، كرياتين مع البروتين، متى اخذ البروتين، كيف اخذ البروتين): كرياتين مونوهيدرات كم سكوب | كرياتين جولد كم سكوب | 300 جرام كرياتين كم سكوب | 5 جرام كرياتين كم سكوب | 500 جرام كرياتين كم سكوب | كم سكوب كرياتين في اليوم | سكوب كرياتين كم يحتاج ماء | سكوب كرياتين كم جرام | سكوب كرياتين كم يعادل لحم | سكوب كرياتين كم سعرة حرارية | كم سكوب كرياتين في اليوم للمبتدئين | سكوب كرياتين كم بروتين | كم سكوب كرياتين اخذ | سكوب كرياتين كم سعره | كم سكوب كرياتين | كرياتين البروتين | كرياتين مع بروتين | بروتين كرياتين للجسم | كرياتين مع واي بروتين | متى اخذ البروتين والكرياتين | كيف اخذ البروتين والكرياتين | أضرار البروتين والكرياتين
- H1: كم سكوب كرياتين في اليوم؟ الجرعة الصحيحة وخلطه مع البروتين
- Title: كم سكوب كرياتين في اليوم؟ الجرعة الصحيحة | اوبتيمال اكس

#### U03. فوائد الكرياتين وأضراره
- Page: guide article, slug `/guides/creatine-benefits-side-effects`
- Head query: فوائد الكرياتين
- Intent: informational
- Claim note: the article describes what creatine is and how the body stores it; it does not promise outcomes. Kidney, fertility, blood-pressure, drug-test and under-18 questions are excluded (section 3) and answered only with "استشر مختصا".
- Members (n=24, verbatim from S1; seeds فوائد الكرياتين، اضرار الكرياتين، هل الكرياتين، كرياتين مونوهيدرات): فوائد الكرياتين للرجال | فوائد الكرياتين للعضلات | فوائد الكرياتين للجسم | فوائد الكرياتين واضراره | فوائد الكرياتين مونوهيدرات | فوائد الكرياتين للمبتدئين | فوائد الكرياتين للرجال واضراره | فوائد الكرياتين لغير الرياضيين | فوائد الكرياتين لكبار السن | كرياتين مونوهيدرات فوائد | اضرار الكرياتين للرجال | اضرار الكرياتين على الجسم | اضرار الكرياتين للرياضيين | اضرار الكرياتين للعضلات | اضرار الكرياتين لكمال الاجسام | اضرار الكرياتين للجيم | اضرار الكرياتين للشباب | اضرار الكرياتين وفوائده | اضرار الكرياتين البودر | هل الكرياتين مضر | هل الكرياتين يزيد الوزن | هل الكرياتين يسبب تساقط الشعر | هل الكرياتين ينقص الوزن | هل الكرياتين يزيد الوزن بدون رياضة
- H1: فوائد الكرياتين وأضراره: ما الذي تقوله الأدلة
- Title: فوائد الكرياتين وأضراره بلا مبالغة | اوبتيمال اكس

#### U04. الفرق بين الكرياتين والبروتين والمكملات الأخرى
- Page: guide article, slug `/guides/creatine-vs-protein`
- Head query: الفرق بين الكرياتين والبروتين
- Intent: informational
- Members (n=14, verbatim from S1; seeds الفرق بين الكرياتين، الفرق بين واي بروتين): الفرق بين الكرياتين والبروتين | الفرق بين الكرياتين والكرياتينين | الفرق بين الكرياتين والكيراتين | الفرق بين الكرياتين والجلوتامين | الفرق بين الكرياتين والكارنتين | الفرق بين الكرياتين المونوهيدرات | الفرق بين الكرياتين والبروتين لكمال الأجسام | الفرق بين الكرياتين والواي بروتين | الفرق بين الكرياتين مونوهيدرات و ميكرونيزد | الفرق بين الكرياتين والبروتين للجسم | الفرق بين الكرياتين المونوهيدرات و hcl | الفرق بين الكرياتين والسيترولين | الفرق بين واي بروتين والكرياتين | الفرق بين الكرياتين والبروتين للشعر
- Editorial note: three members are disambiguations (كرياتينين، كيراتين، للشعر). The article should carry one short paragraph that says what the store does not sell, which also captures the confused traffic without ranking for the medical or hair terms.
- H1: الفرق بين الكرياتين والبروتين والمكملات التي تشبهه في الاسم
- Title: الفرق بين الكرياتين والبروتين وغيرهما | اوبتيمال اكس

#### U05. الكرياتين للنساء والبنات
- Page: guide article, slug `/guides/creatine-for-women`
- Head query: الكرياتين للبنات
- Intent: informational
- Members (n=19, verbatim from S1; seeds الكرياتين للبنات، افضل كرياتين، كرياتين مونوهيدرات، فوائد الكرياتين، اضرار الكرياتين، هل الكرياتين، طريقة استخدام الكرياتين): فوائد الكرياتين للبنات | اضرار الكرياتين للبنات | الكرياتين ينفع للبنات | هل الكرياتين للبنات | استخدام الكرياتين للبنات | مكمل الكرياتين للبنات | افضل انواع الكرياتين للبنات | فوائد واضرار الكرياتين للبنات | ماذا يفعل الكرياتين للبنات | الكرياتين للبنت | الكرياتين للمرأة | الكرياتين للمراه | الكرياتين للنساء | افضل كرياتين للنساء | كرياتين مونوهيدرات للنساء | فوائد الكرياتين للنساء | أضرار الكرياتين للنساء | هل الكرياتين يزيد الوزن للنساء | طريقة استخدام الكرياتين للنساء
- H1: الكرياتين للنساء والبنات: ما الذي يفعله وكيف يستخدم
- Title: الكرياتين للنساء والبنات: دليل مبسط | اوبتيمال اكس

#### U06. كم سكوب بروتين في اليوم
- Page: guide article, slug `/guides/protein-dose`
- Head query: كم سكوب بروتين
- Intent: informational
- Members (n=23, verbatim from S1; seeds كم سكوب بروتين، كم سكوب، كيف اخذ البروتين، كيف اشرب البروتين، طريقة استخدام واي بروتين، بروتين للمبتدئين): كم سكوب بروتين في اليوم | كم سكوب بروتين في اليوم لزيادة الوزن | كم سكوب بروتين في اليوم للتضخيم | كم سكوب بروتين في اليوم لنقص الوزن | كم سكوب بروتين مسموح في اليوم | كم سكوب بروتين ماس في اليوم | كم سكوب بروتين في العلبة | كم سكوب بروتين لازم اخذ | كم سكوب بروتين للمبتدئين | كم سكوب بروتين ماس جينر في اليوم | كم سكوب واي بروتين في اليوم | كم سكوب في علبة الواي بروتين | كم سكوب ماس جينر في اليوم | كم سكوب ماس جينر في اليوم لزيادة الوزن | كيف اخذ مكمل البروتين | كيف اخذ احتياجي من البروتين | كيف اخذ كفايتي من البروتين | كيف اخذ حاجتي من البروتين | كيف اشرب البروتين باودر | طريقة استخدام واي بروتين لزيادة الوزن | جرعات الواي بروتين للمبتدئين | جدول بروتين للمبتدئين | متى يجب اخذ البروتين لزيادة الوزن
- H1: كم سكوب بروتين في اليوم؟ كيف تحسب احتياجك
- Title: كم سكوب بروتين في اليوم؟ حساب الجرعة | اوبتيمال اكس

#### U07. متى آخذ البروتين: قبل التمرين أم بعده
- Page: guide article, slug `/guides/protein-timing`
- Head query: متى اخذ البروتين
- Intent: informational
- Members (n=30, verbatim from S1; seeds متى اخذ البروتين، متى اشرب البروتين، بروتين قبل التمرين، بروتين للمبتدئين): متى اخذ البروتين قبل او بعد التمرين | متى اخذ البروتين بعد التمرين | متى اخذ البروتين لكمال الاجسام | متى اخذ البروتين شيك | متى اخذ البروتين باودر | متى اخذ البروتين للمبتدئين | متى اخذ البروتين بار | متى اخذ البروتين قبل التمرين | متى يجب اخذ البروتين | متى يفضل اخذ البروتين | متى يفضل اخذ البروتين قبل او بعد التمرين | متى يمكن اخذ البروتين | متى اشرب البروتين بعد التمرين | متى اشرب البروتين قبل او بعد التمرين | متى اشرب البروتين قبل التمرين | متى اشرب البروتين بعد الاكل | متى اشرب البروتين شيك | متى اشرب حليب البروتين | متى اشرب مشروب البروتين | بروتين قبل التمرين او بعد | شرب بروتين قبل التمرين | افضل بروتين قبل التمرين | بروتين بار قبل التمرين | سكوب بروتين قبل التمرين | اكل بروتين قبل التمرين | اخذ بروتين قبل التمرين | الواي بروتين قبل التمرين | حليب بروتين قبل التمرين | بروتين قبل وبعد التمرين | متى اخذ بروتين للمبتدئين
- H1: متى آخذ البروتين: قبل التمرين أم بعده أم قبل النوم
- Title: متى آخذ البروتين: قبل التمرين أم بعده | اوبتيمال اكس

#### U08. الفرق بين واي بروتين ايزوليت وكونسنتريت
- Page: guide article, slug `/guides/whey-vs-isolate`
- Head query: الفرق بين واي بروتين و ايزوليت
- Intent: informational
- Members (n=14, verbatim from S1; seeds الفرق بين واي بروتين، الفرق بين الايزو): الفرق بين واي بروتين و ايزو | الفرق بين واي بروتين و ايزوليت | الفرق بين واي بروتين و ايزو 100 | الفرق بين واي بروتين ايزوليت و كونسنتريت | الفرق بين واي بروتين و نيترو تك | الفرق بين الهيدرو واي والواى بروتين | الفرق بين بيف بروتين و واي بروتين | الفرق بين الواي بروتين والهيدرو واي | الفرق بين بروتين ايزو وبروتين واي | الفرق بين الايزو والواي | الفرق بين الايزو والواي بروتين | الفرق بين الايزوليت و الكونسنتريت | الفرق بين الايزوليت بروتين والواي بروتين | الفرق بين الايزو والهيدرو
- H1: الفرق بين واي بروتين ايزوليت وكونسنتريت وهيدرو
- Title: الفرق بين واي بروتين ايزوليت وكونسنتريت | اوبتيمال اكس

#### U09. فوائد واي بروتين
- Page: guide article, slug `/guides/whey-protein-benefits`
- Head query: فوائد واي بروتين
- Intent: informational
- Members (n=9, verbatim from S1; seeds فوائد واي بروتين، هل واي بروتين، اضرار واي بروتين): فوائد واي بروتين للنساء | فوائد واي بروتين للجسم | فوائد هيدرو واي بروتين | فوائد واضرار واي بروتين | ما فوائد واي بروتين | فوائد دايت واي بروتين | فوائد البروتين واي بروتين | هل واي بروتين يضخم | اضرار وفوائد واي بروتين
- H1: فوائد واي بروتين وكيف تختار النوع المناسب لك
- Title: فوائد واي بروتين وكيف تختار نوعك | اوبتيمال اكس

#### U10. هل البروتين باودر مضر؟ أضرار البروتين بلا مبالغة
- Page: guide article, slug `/guides/is-protein-powder-safe`
- Head query: اضرار البروتين
- Intent: informational
- Claim note: answers stay at the level of "مكمل غذائي للأشخاص الأصحاء" and "استشر مختصا"; kidney, sugar, cholesterol, pregnancy and digestion members are excluded (section 3).
- Members (n=30, verbatim from S1; seeds اضرار البروتين، اضرار واي بروتين، هل البروتين، هل واي بروتين، هل مكملات، مكملات كمال الاجسام، مكملات الجيم): أضرار واي بروتين | اضرار واي بروتين للبنات | أضرار هيدرو واي بروتين | اضرار البروتين واي | اضرار whey protein | اضرار بروتين بودره | اضرار البروتين للجسم | اضرار البروتين البودر | اضرار البروتين للرياضيين | اضرار البروتين باودر | اضرار البروتينات كمال الاجسام | اضرار البروتين الصناعي | اضرار البروتين البودرة للجسم | اضرار البروتين للرجال | اضرار البروتين البودر للرجال | اضرار البروتين في الجيم | أضرار البروتين بار | هل البروتين يزيد الوزن | هل البروتين مضر | هل البروتين باودر مضر | هل البروتين ينحف | هل واي بروتين يزيد الوزن | هل واي بروتين له اضرار | هل واي بروتين مضر | هل واي بروتين ينقص الوزن | هل مكملات البروتين مضرة | هل مكملات الغذائية مضرة | هل مكملات كمال الاجسام مضرة | اضرار مكملات كمال الاجسام | اضرار مكملات الجيم
- Overflow (same page, n=3): هل مكملات الجيم مضره | ‏هل واي بروتين | هل مكملات الزنك مضرة
- H1: هل البروتين باودر مضر؟ ما الذي يقوله العلم وما الذي لا يقوله
- Title: هل البروتين باودر مضر؟ جواب بلا مبالغة | اوبتيمال اكس

#### U11. مكملات للمبتدئين في الجيم
- Page: guide article, slug `/guides/supplements-for-beginners`
- Head query: مكملات للمبتدئين
- Intent: informational with transactional tail
- Members (n=13, verbatim from S1; seeds مكملات للمبتدئين، مكملات كمال الاجسام، بروتين للمبتدئين، افضل بروتين للمبتدئين، افضل واي بروتين): مكملات للمبتدئين في كمال الاجسام | افضل مكملات للمبتدئين | مكملات غذائية للمبتدئين | افضل كورس مكملات للمبتدئين كمال اجسام | مكملات كمال الاجسام للمبتدئين | بروتين للمبتدئين في كمال الاجسام | بروتين للمبتدئين في الجيم | افضل بروتين للمبتدئين | افضل بروتين للمبتدئين في الجيم | واي بروتين للمبتدئين | بروتين العضلات للمبتدئين | افضل بروتين للمبتدئين كمال اجسام | افضل واي بروتين للمبتدئين
- Note: the للمبتدئين variants of creatine timing, creatine dose and protein dose stay with their product guides (U01, U02, U03, U06); this article links to them instead of duplicating them.
- H1: مكملات للمبتدئين في الجيم: من أين تبدأ وماذا تتجاهل
- Title: مكملات للمبتدئين في الجيم: من أين تبدأ | اوبتيمال اكس

#### U12. أفضل بروتين باودر: كيف تختار
- Page: guide article, slug `/guides/best-protein-powder`
- Head query: افضل بروتين
- Intent: informational, commercial investigation
- Members (n=13, verbatim from S1; seeds افضل بروتين، افضل واي بروتين، وش افضل بروتين، مكملات بروتين): افضل بروتين باودر | افضل بروتين لبناء العضلات | افضل بروتين للجسم | افضل بروتين للعضلات | افضل بروتين طبيعي | افضل واي بروتين في العالم | افضل واي بروتين لبناء العضلات | افضل نوع واي بروتين | افضل واي بروتين مستورد | وش افضل بروتين للجسم | وش افضل نوع بروتين | وش افضل مشروب بروتين | افضل مكملات بروتين
- H1: أفضل بروتين باودر: كيف تختار النوع المناسب لهدفك
- Title: أفضل بروتين باودر: دليل الاختيار | اوبتيمال اكس

#### U13. هل الماس جينر يزيد الوزن؟ أسئلة الماس جينر
- Page: guide article, slug `/guides/mass-gainer-faq`
- Head query: هل الماس جينر
- Intent: informational
- Members (n=13, verbatim from S1; seeds هل الماس جينر، الفرق بين واي بروتين): هل الماس جينر مضر | هل الماس جينر يزيد الوزن | هل الماس جينر له اضرار | هل الماس جينر فيه كرياتين | هل الماس جينر يزيد الدهون | هل الماس جينر مفيد | هل الماس جينر يضخم العضلات | هل الماس جينر بروتين | هل الماس جينر فيه بروتين | هل الماس جينر مفيد للتضخيم | هل الماس جينر يضخم | الفرق بين واي بروتين وماس جينر | الفرق بين واي بروتين وماس
- H1: هل الماس جينر يزيد الوزن؟ الأسئلة الشائعة عن الماس جينر
- Title: هل الماس جينر يزيد الوزن؟ أسئلة شائعة | اوبتيمال اكس

#### U14. أوميغا 3 للرياضيين
- Page: guide article, slug `/guides/omega-3-for-athletes`
- Head query: اوميغا 3 للرياضيين
- Intent: informational
- Members (n=9, verbatim from S1; seeds اوميغا 3 للرياضيين، اوميغا 3، زيت السمك): omega 3 للرياضيين | فوائد اوميغا 3 للرياضيين | افضل اوميغا 3 للرياضيين | حبوب اوميغا 3 للرياضيين | جرعة اوميغا 3 للرياضيين | فوائد حبوب اوميغا 3 للرياضيين | أفضل وقت لتناول أوميغا 3 للرياضيين | اوميغا 3 فوائد | زيت السمك فوائده
- H1: أوميغا 3 للرياضيين: الجرعة والتوقيت وما تبحث عنه على الملصق
- Title: أوميغا 3 للرياضيين: الجرعة والتوقيت | اوبتيمال اكس

#### U15. ما هو البري وورك اوت ومتى تأخذه
- Page: guide article, slug `/guides/what-is-pre-workout`
- Head query: بري ورك اوت معنى
- Intent: informational
- Members (n=11, verbatim from S1; seeds بري وورك اوت، اضرار بري وورك اوت، افضل بري وركاوت، مكمل قبل التمرين): بري ورك اوت معنى | بري ورك اوت بالانجليزي | اضرار بري ورك اوت | افضل وقت لتناول بري ورك اوت | أفضل بري ورك اوت | افضل بري ورك اوت قبل التمرين | افضل بري ورك اوت بدون كافيين | افضل بري ورك اوت طبيعي | افضل بري ورك اوت طبيعي قبل التمرين | افضل مكمل قبل التمرين | اقوى مكمل قبل التمرين
- H1: ما هو البري وورك اوت ومتى تأخذه وكيف تختاره
- Title: ما هو البري وورك اوت ومتى تأخذه | اوبتيمال اكس

### 2.7 Local page, services page, homepage

#### L01. مكملات المدينة المنورة
- Page: local page (branch page in BUILD.md), slug `/branch/medina`
- Head query: مكملات المدينة المنورة
- Intent: local
- Members (n=16, verbatim from S1; seeds مكملات المدينة المنورة، مكملات المدينة، محلات مكملات المدينة المنورة، محل مكملات، متجر مكملات، متجر مكملات غذائية، مكملات الجيم): مكملات المدينة المنورة | مكملات غذائية المدينة المنورة | محل مكملات المدينة المنورة | محل مكملات غذائية المدينة المنورة | محلات مكملات غذائية في المدينة المنورة | محل مكملات غذائية | محل مكملات غذائية قريب مني | محل مكملات قريب مني | محل مكملات رياضية قريب مني | محل مكملات رياضية | محل مكملات قريب | متجر مكملات غذائية قريب مني | اقرب متجر مكملات غذائية | محلات مكملات الجيم | محل مكملات الجيم | اماكن بيع مكملات الجيم
- Local note: "قريب مني" and "اقرب" queries are won by the Google Business Profile plus a branch page that carries the national address, opening hours and a map, not by copy. BUILD.md records that the branch record still has null address fields and default hours (P0); this cluster cannot be won until that is fixed. Only three Medina-specific suggestions exist in S1, which fits a city with one or two established supplement shops and low autocomplete depth.
- H1: مكملات غذائية في المدينة المنورة: فرع الخالدية
- Title: مكملات غذائية في المدينة المنورة | اوبتيمال اكس

#### V01. مكملات أصلية: كيف تعرف المكمل الأصلي
- Page: services page (trust and authenticity), slug `/services/authenticity`
- Head query: كيف اعرف المكمل اصلي
- Intent: informational with a trust and conversion role
- Members (n=11, verbatim from S1; seeds مكملات اصلية، كيف اعرف المكمل اصلي، مكملات نون، اوميغا 3، جولد ستاندرد واي، جلوتامين، ايزو 100، الفرق بين الكرياتين، كرياتين مونوهيدرات، سعر الكرياتين، سعر ماس جينر): مكملات غذائية اصلية | كيف اعرف ان المكمل الغذائي اصلي | هل مكملات نون اصليه | اوميغا 3 الاصلي | واي جولد ستاندرد الاصلي | جلوتامين الاصلي | ايزو 100 الأصلي | الفرق بين الكرياتين الالماني والصيني | كرياتين مونوهيدرات الماني | سعر الكرياتين المستورد | سعر ماس جينر مستورد
- Evidence note: the seeds مكملات تقليد and مكملات رياضية اصلية returned nothing, so the fear is expressed as "الاصلي" attached to a product name, not as a standalone query. The authenticity page should list the products by name with batch, distributor and SFDA wording, and each product page should carry an "أصلي" line that links here.
- H1: كيف تعرف المكمل الأصلي: ضمان الأصالة في اوبتيمال اكس
- Title: كيف تعرف المكمل الأصلي: ضمان الأصالة | اوبتيمال اكس

#### H01. متجر مكملات غذائية ورياضية في السعودية (homepage)
- Page: homepage, slug `/`
- Head query: متجر مكملات غذائية
- Intent: transactional, navigational
- Members (n=12, verbatim from S1; seeds متجر مكملات، متجر مكملات غذائية، افضل متجر مكملات، مكملات اون لاين، مكملات توصيل، مكملات رياضية، مكملات الجيم): متجر مكملات غذائية | متجر مكملات غذائية في السعودية | متجر مكملات في السعوديه | متجر مكملات رياضية | افضل متجر مكملات غذائية | ارخص متجر مكملات غذائية | مكملات غذائية اون لاين | شراء مكملات غذائية اون لاين | توصيل مكملات غذائية | موقع مكملات رياضية | عروض مكملات رياضية | سعر مكملات الجيم
- Note: "ارخص" is a member, not a positioning; BUILD.md's persona is restraint, so the homepage answers it with clear pricing and VAT-inclusive display rather than a price claim. "توصيل" belongs here until a shipping page exists; the seed مكملات توصيل returned only two suggestions, one of them Kuwait.
- H1: اوبتيمال اكس: متجر مكملات غذائية ورياضية أصلية
- Title: متجر مكملات غذائية ورياضية في السعودية | اوبتيمال اكس

### 2.8 Cluster summary (member counts including overflow)

| ID | Cluster | Page type | Slug | Members |
|---|---|---|---|---|
| P04 | ايزو 100 (Dymatize ISO100) | product page | /product/dymatize-iso-100 | 49 |
| C05 | ماس جينر وبروتين زيادة الوزن | type category | /category/mass-gainer | 40 |
| U01 | متى آخذ الكرياتين وكيف أستخدمه | guide article | /guides/how-to-take-creatine | 37 |
| C09 | كرياتين | type category | /category/creatine | 36 |
| G05 | الشعر والبشرة | goal collection | /goal/hair-skin | 34 |
| C08 | سناكات بروتين (شيبس، كوكيز، شوفان، زبدة فول سوداني) | type category | /category/protein-snacks | 33 |
| P01 | جولد ستاندرد واي بروتين (ON Gold Standard 100% Whey) | product page | /product/on-gold-standard-100-whey | 33 |
| U10 | هل البروتين باودر مضر؟ أضرار البروتين بلا مبالغة | guide article | /guides/is-protein-powder-safe | 33 |
| C22 | كولاجين | type category | /category/collagen | 31 |
| C03 | واي بروتين ايزوليت | type category | /category/whey-isolate | 30 |
| C19 | مغنيسيوم جليسينات | type category | /category/magnesium | 30 |
| G04 | التعافي | goal collection | /goal/recovery | 30 |
| A01 | مكملات وبروتين للنساء (audience collection, proposed addition) | audience collection | /collection/women | 30 |
| U07 | متى آخذ البروتين: قبل التمرين أم بعده | guide article | /guides/protein-timing | 30 |
| B01 | اوبتيموم نيوتريشن (Optimum Nutrition) | brand page | /brand/optimum-nutrition | 26 |
| C07 | بروتين بار | type category | /category/protein-bars | 25 |
| C01 | بروتين (parent category) | type category | /category/protein | 24 |
| C02 | واي بروتين | type category | /category/whey-protein | 24 |
| C16 | فيتامين د3 | type category | /category/vitamin-d | 24 |
| U03 | فوائد الكرياتين وأضراره | guide article | /guides/creatine-benefits-side-effects | 24 |
| C14 | ال كارنتين وسي ال ايه | type category | /category/l-carnitine-cla | 23 |
| U06 | كم سكوب بروتين في اليوم | guide article | /guides/protein-dose | 23 |
| C10 | بري وورك اوت | type category | /category/pre-workout | 22 |
| U02 | كم سكوب كرياتين في اليوم | guide article | /guides/creatine-dose | 22 |
| C11 | أحماض أمينية (بي سي اي اي و اي اي اي) | type category | /category/amino-acids | 21 |
| G02 | الصحة العامة | goal collection | /goal/general-health | 21 |
| G06a | الوزن المثالي: زيادة الكتلة (التضخيم) | goal collection | /goal/ideal-weight | 21 |
| G06b | الوزن المثالي: التنشيف | goal collection | /goal/ideal-weight | 21 |
| C13 | سيترولين ماليت وبيتا الانين | type category | /category/citrulline-beta-alanine | 20 |
| U05 | الكرياتين للنساء والبنات | guide article | /guides/creatine-for-women | 19 |
| C20 | ملتي فيتامين (عام وللرجال) | type category | /category/multivitamin | 17 |
| G03 | الأداء | goal collection | /goal/performance | 17 |
| C18 | زنك | type category | /category/zinc | 16 |
| C25 | جلوكوزامين ودعم المفاصل | type category (product type) | /category/joint-support | 16 |
| L01 | مكملات المدينة المنورة | local page (branch page in BUILD.md) | /branch/medina | 16 |
| C12 | جلوتامين | type category | /category/glutamine | 15 |
| P03 | سيرياس ماس (ON Serious Mass) | product page | /product/on-serious-mass | 15 |
| C04 | بروتين كازين | type category | /category/casein | 14 |
| C17 | فيتامين سي | type category | /category/vitamin-c | 14 |
| U04 | الفرق بين الكرياتين والبروتين والمكملات الأخرى | guide article | /guides/creatine-vs-protein | 14 |
| U08 | الفرق بين واي بروتين ايزوليت وكونسنتريت | guide article | /guides/whey-vs-isolate | 14 |
| U11 | مكملات للمبتدئين في الجيم | guide article | /guides/supplements-for-beginners | 13 |
| U12 | أفضل بروتين باودر: كيف تختار | guide article | /guides/best-protein-powder | 13 |
| U13 | هل الماس جينر يزيد الوزن؟ أسئلة الماس جينر | guide article | /guides/mass-gainer-faq | 13 |
| C06 | بروتين نباتي | type category | /category/plant-protein | 12 |
| C15 | أوميغا 3 وزيت السمك | type category | /category/omega-3 | 12 |
| C21 | ملتي فيتامين وفيتامينات للنساء | type category | /category/multivitamin-women | 12 |
| C23 | بيوتين | type category | /category/biotin | 12 |
| C26 | الكتروليت والترطيب | type category (product type) | /category/electrolytes | 12 |
| P02 | جولد ستاندرد ايزوليت (ON Gold Standard 100% Isolate) | product page | /product/on-gold-standard-isolate | 12 |
| P05 | نيترو تك (MuscleTech Nitro-Tech) | product page | /product/muscletech-nitro-tech | 12 |
| H01 | متجر مكملات غذائية ورياضية في السعودية (homepage) | homepage | / | 12 |
| B03 | ابلايد نيوترشن (Applied Nutrition) | brand page | /brand/applied-nutrition | 11 |
| B05 | سي فور (Cellucor C4) | product page (brand Cellucor) | /product/cellucor-c4 | 11 |
| U15 | ما هو البري وورك اوت ومتى تأخذه | guide article | /guides/what-is-pre-workout | 11 |
| V01 | مكملات أصلية: كيف تعرف المكمل الأصلي | services page (trust and authenticity) | /services/authenticity | 11 |
| G01 | الطاقة | goal collection | /goal/energy | 10 |
| B04 | ماسل تك (MuscleTech) | brand page | /brand/muscletech | 10 |
| C24 | اشواغاندا | type category (product type) | /category/ashwagandha | 9 |
| B02 | ديماتيز (Dymatize) | brand page | /brand/dymatize | 9 |
| U09 | فوائد واي بروتين | guide article | /guides/whey-protein-benefits | 9 |
| U14 | أوميغا 3 للرياضيين | guide article | /guides/omega-3-for-athletes | 9 |
| C27 | اكسسوارات (شيكر) | type category | /category/accessories | 3 (below threshold, kept as a gap) |

Coverage (computed by script over the assembled file): 1242 of the 2168 unique S1 suggestions are assigned to 63 clusters, each to exactly one cluster; the remaining 926 are accounted for in section 3 by exclusion group.

## 3. Exclusions

The 926 suggestions not assigned in section 2 fall into these groups and are ignored as page targets (they remain usable as negative signals): hair keratin and hair-protein treatments (كيراتين، بروتين الشعر، فرد الشعر); the kidney marker كرياتينين; other-country modifiers (مصر، الكويت، الجزائر، الاردن، قطر، البحرين); retailer and competitor navigational queries (النهدي، الدواء، الوزن المثالي، دكتور نيوترشن، جي ان سي، ايهيرب، نون، امازون، سبورتر); Egyptian-market brands not stocked (بيج رامي، ماكس ماصل، ريد ريكس، نوفوجين، امتنان، ايفولف، ديفل، كريا باور، تراكتور، سترونج ماصل، مارفيلوس); fertility, pregnancy, children and pet supplements (للخصوبة، للحامل، للاطفال، للقطط); outcome and weight-loss claim phrasings that the store may not target with promises (حارق دهون، للتنحيف بسرعة، يزيد الوزن في اسبوع); and pure information queries with no purchase intent that are better served by the guide clusters already listed.

## 4. The 40 highest-value Arabic question queries (PAA style) with direct-answer drafts

Selection rule: the question must be a verbatim S1 suggestion, must sit in a cluster in section 2 (ID in brackets), and must be answerable without a medical, treatment or outcome claim. Ranking inside each group follows the number of S1 variants the question stem produced (متى اخذ الكرياتين alone produced 13 variants across two seeds). Each answer is one or two MSA sentences written to be lifted as-is into an FAQ block or a guide intro; wording stays at "يدعم" / "يساهم" / "يستخدم" and never "يعالج" / "يحرق" / a promised number of kilograms. Dose figures are the ranges printed on mainstream product labels, not recommendations for any individual.

Format: Q (S1 verbatim) [cluster] / MSA heading / answer.

### 4.1 Creatine (9)

1. Q: متى اخذ الكرياتين قبل او بعد التمرين [U01]
   - Heading: متى آخذ الكرياتين: قبل التمرين أم بعده؟
   - Answer: لا يوجد فرق حاسم بين الوقتين، والأهم هو الانتظام على جرعة يومية ثابتة. من يفضل تحديد وقت يأخذه بعد التمرين مع وجبة تحتوي على كربوهيدرات.
2. Q: كم سكوب كرياتين في اليوم [U02]
   - Heading: كم سكوب كرياتين في اليوم؟
   - Answer: الجرعة الشائعة للكرياتين مونوهيدرات 3 إلى 5 غرامات يوميا، أي سكوب واحد في معظم العبوات. راجع وزن السكوب على الملصق لأنه يختلف بين العلامات.
3. Q: كيف استخدم الكرياتين لأول مرة [U01]
   - Heading: كيف أستخدم الكرياتين لأول مرة؟
   - Answer: ابدأ بسكوب واحد يوميا مذابا في الماء أو العصير، في أيام التمرين وأيام الراحة على حد سواء. مرحلة التحميل اختيارية وليست شرطا.
4. Q: متى اخذ الكرياتين في رمضان [U01]
   - Heading: متى آخذ الكرياتين في رمضان؟
   - Answer: الجرعة اليومية نفسها بعد الإفطار أو مع السحور، مع كمية كافية من الماء بين الإفطار والإمساك. المهم عدم قطع الاستخدام خلال الشهر.
5. Q: هل الكرياتين يزيد الوزن [U03]
   - Heading: هل الكرياتين يزيد الوزن؟
   - Answer: قد يرتفع رقم الميزان قليلا في الأسابيع الأولى لأن العضلات تحتفظ بمزيد من الماء، وهذا ليس زيادة في الدهون. الأثر يختلف من شخص لآخر ويستقر مع الاستمرار.
6. Q: الفرق بين الكرياتين مونوهيدرات و ميكرونيزد [U04]
   - Heading: ما الفرق بين الكرياتين مونوهيدرات والميكرونيزد؟
   - Answer: الميكرونيزد هو كرياتين مونوهيدرات نفسه بحبيبات أدق فيذوب في الماء بسهولة أكبر. المادة الفعالة والجرعة واحدة في النوعين.
7. Q: الفرق بين الكرياتين والبروتين [U04]
   - Heading: ما الفرق بين الكرياتين والبروتين؟
   - Answer: البروتين مصدر غذائي يساهم في نمو الكتلة العضلية والحفاظ عليها، والكرياتين مركب يدعم إنتاج الطاقة في التمارين القصيرة عالية الشدة. يمكن استخدامهما معا في الكوب نفسه.
8. Q: الكرياتين ينفع للبنات [U05]
   - Heading: هل الكرياتين مناسب للنساء والبنات؟
   - Answer: نعم، الكرياتين مكمل عام لا يقتصر على الرجال، والجرعة نفسها 3 إلى 5 غرامات يوميا. يناسب أهداف القوة والأداء بغض النظر عن الجنس.
9. Q: الفرق بين الكرياتين والكرياتينين [U04]
   - Heading: ما الفرق بين الكرياتين والكرياتينين؟
   - Answer: الكرياتين مكمل غذائي يباع في متاجر المكملات، أما الكرياتينين فهو اسم مؤشر يظهر في التحاليل المخبرية وليس منتجا. الكلمتان متشابهتان في الكتابة فقط.

### 4.2 Whey and protein powder (12)

10. Q: كم سكوب بروتين في اليوم [U06]
    - Heading: كم سكوب بروتين في اليوم؟
    - Answer: يعطي السكوب الواحد من الواي بروتين عادة 20 إلى 25 غراما من البروتين، ويكفي معظم المتدربين سكوب إلى سكوبين يوميا لتكملة ما يأتي من الطعام. الملصق يحدد وزن السكوب لكل منتج.
11. Q: متى اخذ البروتين قبل او بعد التمرين [U07]
    - Heading: متى آخذ البروتين: قبل التمرين أم بعده؟
    - Answer: الوقتان مقبولان والفارق بينهما صغير، وإجمالي البروتين خلال اليوم أهم من التوقيت الدقيق. من يتدرب على معدة فارغة قد يناسبه سكوب قبل التمرين، وإلا فبعده مع وجبة.
12. Q: عادي اشرب بروتين قبل النوم [G04]
    - Heading: هل يمكن شرب البروتين قبل النوم؟
    - Answer: نعم، والكازين خيار شائع قبل النوم لأنه بطيء الامتصاص، بينما الواي بروتين أسرع امتصاصا ويناسب ما بعد التمرين. كلاهما يحسب ضمن احتياجك اليومي.
13. Q: الفرق بين واي بروتين ايزوليت و كونسنتريت [U08]
    - Heading: ما الفرق بين واي بروتين ايزوليت وكونسنتريت؟
    - Answer: الايزوليت مرشح أكثر فتكون نسبة البروتين فيه أعلى واللاكتوز والدهون أقل، والكونسنتريت أقل تكلفة ويحتفظ بقدر أكبر من مكونات الحليب. كلاهما مصدر بروتين كامل.
14. Q: الفرق بين واي بروتين و ايزو 100 [U08]
    - Heading: ما الفرق بين الواي بروتين وايزو 100؟
    - Answer: ايزو 100 اسم منتج من شركة ديماتيز، وهو واي بروتين ايزوليت مهدرج، أي نوع من الواي وليس فئة مختلفة. يتميز بسرعة الامتصاص وانخفاض اللاكتوز.
15. Q: الفرق بين واي بروتين وماس جينر [U13]
    - Heading: ما الفرق بين الواي بروتين والماس جينر؟
    - Answer: الواي بروتين يقدم بروتينا بسعرات منخفضة نسبيا، أما الماس جينر فيجمع البروتين مع كمية كبيرة من الكربوهيدرات والسعرات لمن يحتاج إلى رفع إجمالي سعراته اليومية.
16. Q: هل واي بروتين يزيد الوزن [U10]
    - Heading: هل الواي بروتين يزيد الوزن؟
    - Answer: الواي بروتين بحد ذاته منخفض السعرات، والوزن يتبع إجمالي السعرات التي تتناولها خلال اليوم. يستخدم ضمن أهداف زيادة الوزن أو خفضه حسب بقية النظام الغذائي.
17. Q: هل البروتين باودر مضر [U10]
    - Heading: هل البروتين باودر مضر؟
    - Answer: مسحوق البروتين مكمل غذائي مصدره الحليب أو النبات، ويستخدمه الأشخاص الأصحاء لتكملة احتياج البروتين اليومي. من لديه حالة صحية يستشير مختصا قبل استخدام أي مكمل.
18. Q: هل البروتين النباتي يبني العضلات [C06]
    - Heading: هل البروتين النباتي يساهم في بناء العضلات؟
    - Answer: نعم عند تناول كمية كافية منه، ويفضل اختيار خلطة تجمع أكثر من مصدر مثل البازلاء والأرز لاكتمال الأحماض الأمينية الأساسية.
19. Q: كم سكوب في علبة الواي بروتين [U06]
    - Heading: كم سكوب في علبة الواي بروتين؟
    - Answer: يختلف حسب الحجم: عبوة 5 باوند (2.27 كغم) تعطي عادة 70 إلى 75 حصة، وعبوة 2 باوند نحو 28 إلى 30 حصة. الرقم الدقيق مكتوب على الملصق تحت عدد الحصص.
20. Q: افضل بروتين للمبتدئين [U11]
    - Heading: ما أفضل بروتين للمبتدئين؟
    - Answer: واي بروتين كونسنتريت من علامة موثوقة هو الخيار الأبسط والأقل تكلفة للبداية، بسكوب واحد بعد التمرين. الايزوليت خيار لمن يفضل أقل قدر من اللاكتوز.
21. Q: طريقة استخدام واي بروتين لزيادة الوزن [U06]
    - Heading: كيف أستخدم الواي بروتين لزيادة الوزن؟
    - Answer: أضف سكوبا إلى وجباتك أو اخلطه مع الحليب والشوفان لرفع السعرات، مع الحفاظ على وجبات منتظمة. الماس جينر بديل عملي لمن يصعب عليه الوصول إلى سعراته اليومية من الطعام.

### 4.3 Mass gainer (3)

22. Q: هل الماس جينر يزيد الوزن [U13]
    - Heading: هل الماس جينر يزيد الوزن؟
    - Answer: الماس جينر يساهم في زيادة الوزن عندما يضيف سعرات فوق احتياجك اليومي، لأنه يجمع الكربوهيدرات والبروتين في حصة واحدة عالية السعرات. النتيجة تعتمد على إجمالي الطعام والتمرين وتختلف من شخص لآخر.
23. Q: كم سكوب ماس جينر في اليوم [U06]
    - Heading: كم سكوب ماس جينر في اليوم؟
    - Answer: الحصة المعتادة حصة واحدة يوميا، وبعض المنتجات مثل سيرياس ماس تحسب الحصة بسكوبين كبيرين. يمكن تقسيم الحصة على مرتين إذا كانت ثقيلة على المعدة.
24. Q: هل الماس جينر فيه كرياتين [U13]
    - Heading: هل الماس جينر يحتوي على كرياتين؟
    - Answer: بعض منتجات الماس جينر تضيف الكرياتين إلى تركيبتها وبعضها لا. تحقق من جدول المكونات على العبوة قبل أن تضيف كرياتين منفصلا.

### 4.4 Pre-workout (5)

25. Q: بري ورك اوت معنى [U15]
    - Heading: ما هو البري وورك اوت؟
    - Answer: مكمل يؤخذ قبل التمرين بنحو 20 إلى 30 دقيقة، ويحتوي عادة على الكافيين والسيترولين والبيتا الانين لدعم الطاقة والتركيز خلال الحصة التدريبية.
26. Q: افضل وقت لتناول بري ورك اوت [U15]
    - Heading: متى آخذ البري وورك اوت؟
    - Answer: قبل التمرين بـ20 إلى 30 دقيقة مع كوب ماء. يفضل تجنبه في ساعات المساء المتأخرة لأن الكافيين قد يؤثر في النوم.
27. Q: c4 كم فيه كافيين [B05]
    - Heading: كم كافيين في سي فور؟
    - Answer: يختلف حسب الإصدار: النسخة الأصلية من سي فور تحتوي على نحو 150 ملغ كافيين في الحصة، ونسخة ألتيميت تصل إلى 300 ملغ. الرقم الدقيق مكتوب على ملصق كل إصدار.
28. Q: بري ورك اوت بدون كافيين [C10]
    - Heading: هل يوجد بري وورك اوت بدون كافيين؟
    - Answer: نعم، توجد نسخ خالية من المنبهات تعتمد على السيترولين والبيتا الانين، وتناسب من يتدرب مساء أو يفضل تجنب الكافيين.
29. Q: بيتا الانين اضرار [C13]
    - Heading: لماذا أشعر بوخز بعد البيتا الانين؟
    - Answer: الوخز الخفيف في الجلد بعد البيتا الانين شعور شائع ومؤقت يزول خلال دقائق، ولا يعني أن الجرعة خاطئة. تقسيم الجرعة على مرتين يخففه.

### 4.5 Amino acids (3)

30. Q: bcaa ما هو [C11]
    - Heading: ما الفرق بين بي سي اي اي و اي اي اي؟
    - Answer: بي سي اي اي ثلاثة أحماض أمينية متفرعة السلسلة، أما اي اي اي فتشمل الأحماض الأمينية الأساسية التسعة كلها بما فيها الثلاثة المتفرعة. من يحصل على بروتين كاف من الطعام والمكمل قد لا يحتاج إلى أي منهما.
31. Q: فوائد الجلوتامين للرياضيين [C12]
    - Heading: ما فائدة الجلوتامين للرياضيين؟
    - Answer: الجلوتامين حمض أميني يوجد بكثرة في العضلات، ويستخدمه بعض المتدربين لدعم التعافي بعد الحصص المكثفة. الجرعة الشائعة 5 غرامات بعد التمرين أو قبل النوم.
32. Q: سيترولين ماليت فوائد [C13]
    - Heading: ما فائدة السيترولين ماليت؟
    - Answer: السيترولين ماليت مكون شائع في مكملات ما قبل التمرين، ويستخدم لدعم الأداء والتحمل خلال التمرين. الجرعة الشائعة 6 إلى 8 غرامات قبل التمرين بنصف ساعة.

### 4.6 Vitamins and minerals (6)

33. Q: فيتامين د 50000 متى يؤخذ [C16]
    - Heading: متى آخذ فيتامين د؟
    - Answer: يفضل تناول فيتامين د3 مع وجبة تحتوي على دهون لأنه يذوب في الدهون. الجرعات اليومية الشائعة في المكملات 1000 إلى 5000 وحدة دولية، أما جرعة 50000 فهي أسبوعية وتؤخذ بتوجيه مختص.
34. Q: مغنيسيوم للنوم اي نوع [C19]
    - Heading: أي نوع من المغنيسيوم يناسب المساء؟
    - Answer: مغنيسيوم جليسينات هو النوع الأكثر استخداما في المساء لأنه لطيف على المعدة، بجرعة شائعة 200 إلى 400 ملغ. السترات جيد الامتصاص أيضا، لكن كثيرين يفضلون الجليسينات لتحمله الأفضل.
35. Q: فيتامين سي فوار متى يشرب [C17]
    - Heading: متى أشرب فيتامين سي الفوار؟
    - Answer: في أي وقت من اليوم مع كوب ماء، ويفضل مع وجبة لمن يجد الفوار ثقيلا على معدة فارغة. الجرعة الشائعة 500 إلى 1000 ملغ يوميا.
36. Q: فيتامين سي مع زنك [C17]
    - Heading: هل آخذ الزنك مع فيتامين سي؟
    - Answer: نعم، يشيع الجمع بينهما في منتج واحد، ويفضل تناول الزنك مع الطعام. الجرعة اليومية الشائعة للزنك في المكملات 15 إلى 30 ملغ.
37. Q: أفضل وقت لتناول أوميغا 3 للرياضيين [U14]
    - Heading: متى آخذ أوميغا 3؟
    - Answer: مع وجبة تحتوي على دهون لتحسين الامتصاص، في أي وقت من اليوم. الرياضيون ينظرون إلى محتوى EPA و DHA المكتوب على العبوة أكثر من إجمالي زيت السمك.
38. Q: اشواغاندا فوائد [C24]
    - Heading: ما هي الاشواغاندا وكيف تستخدم؟
    - Answer: الاشواغاندا عشبة تستخدم في المكملات بخلاصة موحدة مثل KSM 66، ويأخذها كثيرون مساء لدعم الاسترخاء. الجرعة الشائعة 300 إلى 600 ملغ يوميا.

### 4.7 Collagen and biotin (2)

39. Q: هل مكملات الكولاجين مفيدة [C22]
    - Heading: كيف يستخدم الكولاجين ببتيدات؟
    - Answer: يؤخذ الكولاجين ببتيدات يوميا بجرعة 5 إلى 10 غرامات مذابة في أي مشروب، والاستخدام المعتاد مستمر لمدة 8 إلى 12 أسبوعا قبل تقييم أي فرق. النتائج تختلف بين الأشخاص.
40. Q: بيوتين للشعر [C23]
    - Heading: هل البيوتين مفيد للشعر؟
    - Answer: البيوتين فيتامين من مجموعة ب يساهم في الحفاظ على الشعر والبشرة الطبيعيين، وهذه صياغة على مستوى التغذية لا وعد بنتيجة. الجرعات الشائعة في المكملات 5000 إلى 10000 ميكروغرام.

Questions deliberately left out although they are frequent in S1: everything about الكلى، السكر، الكوليسترول، الضغط، العقم، الحامل، التكميم، تحليل المخدرات، سن 16 و18، and every "حرق دهون" phrasing. They are listed in section 3 and get a one-line "استشر مختصا" response on the site, not an article.

## 5. Search-synonym list for the store search box

BUILD.md records that synonyms and typo tolerance are the platform's search engine, not theme work. This list is therefore the input for whatever synonym or redirect surface Salla exposes (dashboard synonyms, or a client-side rewrite before the query hits the native search if the platform has no synonym table). Two layers:

### 5.1 Normalisation rules to apply before matching (derived from S1 spelling variance)

| Rule | Evidence in S1 |
|---|---|
| Fold hamza forms: أ إ آ to ا | افضل / أفضل, اضرار / أضرار, اوميغا / أوميغا all appear |
| Fold taa marbuta and haa: ة to ه (and match both) | فراوله / فراولة, حلاوه / حلاوة, رخيصه, الصحيحه, شوكولاته / شوكولاتة |
| Fold alef maqsura and ya: ى to ي | واى بروتين, النهدى, صيدلية النهدى |
| Convert Arabic-Indic digits to Western: ٠١٢٣٤٥٦٧٨٩ | ايزو ١٠٠, بيوتين ١٠٠٠, فيتامين دال ٥٠٠٠٠, اوميجا ٣, د٣ |
| Strip tatweel and diacritics | not seen in S1 queries, seen in Sporter copy (S3) |
| Collapse repeated spaces and the space around a dot or hyphen | كرياتين ابلايد كم.سكوب, ديماتيز ايزو 100 - زبدة الفول السوداني |
| Lower-case Latin | whey / Whey, ISO 100 / iso 100 |
| Fold غ and ج in loanwords | اشواغاندا / اشواجاندا / اشواجندا, اوميغا / اوميجا |
| Fold ص and س in loanwords | ماصل تك / ماسل تك, ماكس ماصل / ماكس ماسل |
| Fold ق and ج and غ in "gold" and "gainer" | جولد / قولد, جينر / گينر |
| Strip leading dialect question and desire words | وش, ايش, ابي, ابغى, ابغا, ودي, بغيت, وين احصل, وين القى, يمه ابي |

### 5.2 Synonym rows (input as typed, canonical term the index should match)

| # | Input (dialect, transliteration or Latin) | Canonical term | Owning page |
|---|---|---|---|
| 1 | وش افضل بروتين | بروتين | C01 (and U12 for the "افضل" guide) |
| 2 | ابي بروتين / ابغى بروتين / ودي ببروتين | بروتين | C01 |
| 3 | ابي كرياتين / ابغى كرياتين | كرياتين | C09 |
| 4 | whey / وي / وي بروتين / واي | واي بروتين | C02 |
| 5 | whey protein / whey بروتين | واي بروتين | C02 |
| 6 | whey isolate / isolate / ايزو / ايزوليت / واي ايزوليت / بروتين ايزو | واي بروتين ايزوليت | C03 |
| 7 | whey concentrate / كونسنتريت / كونسنترات | واي بروتين كونسنتريت | C02 |
| 8 | hydro whey / هيدرو واي / هيدرولايزد / مهدرج | واي بروتين مهدرج | C03 |
| 9 | iso 100 / iso100 / ايزو ١٠٠ / ايزو مية / ايزو 100 دايماتايز | ايزو 100 ديماتيز | P04 |
| 10 | dymatize / ديماتايز / دايماتيز / دايماتايز | ديماتيز | B02 |
| 11 | gold standard / قولد ستاندرد / جولد / gold standard whey | جولد ستاندرد واي بروتين | P01 |
| 12 | gold standard isolate / جولد ايزوليت / واي جولد ايزوليت | جولد ستاندرد ايزوليت | P02 |
| 13 | optimum / on / اون / اوبتيمم / اوبتيموم / اوبتيمم نيوترشن / on protein | اوبتيموم نيوتريشن | B01 |
| 14 | serious mass / سيريس ماس / سيريوس ماس / سيرياس | سيرياس ماس | P03 |
| 15 | mass gainer / ماس / جينر / قينر / گينر / ماس قينر | ماس جينر | C05 |
| 16 | بروتين للنحاف / بروتين لزيادة الوزن / بروتين تسمين | ماس جينر | C05 |
| 17 | casein / كازيين / كاسين / بروتين بطيء | بروتين كازين | C04 |
| 18 | vegan protein / plant protein / بروتين فيجن / بروتين نباتي | بروتين نباتي | C06 |
| 19 | beef protein / بروتين بيف / بروتين لحم | بروتين بيف | C01 |
| 20 | protein bar / بار بروتين / بارات بروتين / بار | بروتين بار | C07 |
| 21 | quest / كويست / كوست | بروتين بار كويست | C07 |
| 22 | grenade / قرنيد / جرنيد / غرينيد | قرنيد | C07 |
| 23 | barebells / باربلز / بيربلز | باربلز | C07 |
| 24 | protein chips / شيبس بروتين / تشيبس بروتين | شيبس بروتين | C08 |
| 25 | protein oats / اوتس / شوفان / شوفان بروتيني | شوفان بروتين | C08 |
| 26 | peanut butter / بينت بتر / زبدة فول سوداني / زبدة الفستق | زبدة الفول السوداني | C08 |
| 27 | creatine / كرياتين مونوهايدريت / كرياتين مونو / كريا / كراتين | كرياتين مونوهيدرات | C09 |
| 28 | creapure / كريا بيور / كريابيور / كرياتين الماني | كرياتين كريابيور | C09 |
| 29 | micronized / ميكرونايزد / ميكرونيزد | كرياتين ميكرونيزد | C09 |
| 30 | creatine hcl / كرياتين اتش سي ال / كرياتين hcl | كرياتين HCL | C09 |
| 31 | pre workout / preworkout / بري ورك اوت / بري وركاوت / بريوركاوت / بري ورك | بري وورك اوت | C10 |
| 32 | مكمل قبل التمرين / باور قبل التمرين / مكمل طاقة | بري وورك اوت | C10 |
| 33 | c4 / سي فور / سي 4 / c4 pre workout / سي فور شوت | سي فور بري وورك اوت | B05 |
| 34 | abe / اي بي اي / ايه بي ايه / ابلايد بري ورك اوت | ابلايد نيوترشن ABE | B03 |
| 35 | applied / ابلايد / ابلايد نيوتريشن / أبلايد نيوترشن | ابلايد نيوترشن | B03 |
| 36 | muscletech / مسل تك / ماصل تك / ماسلتك / ماسلتيك / مصل تك | ماسل تك | B04 |
| 37 | nitro tech / نيترو / نيتروتك / نايترو تك | نيترو تك | P05 |
| 38 | bcaa / بي سي اي اي / بي سي ايه ايه / بي سي اي / بيسي | بي سي اي اي | C11 |
| 39 | eaa / اي اي اي / ايه ايه ايه / امينو / امينو اسيد | احماض امينية اساسية (اي اي اي) | C11 |
| 40 | glutamine / جلوتامين / غلوتامين / جلوتامين بودر | جلوتامين | C12 |
| 41 | citrulline / سيترولين مالات / سترولين / سيترولين ماليت | سيترولين ماليت | C13 |
| 42 | beta alanine / بيتا الانين / بيتا الأنين / بيتا الانين | بيتا الانين | C13 |
| 43 | arginine / ارجنين / ارجينين / ال ارجنين | ارجنين | C13 |
| 44 | carnitine / كارنتين / الكارنتين / كارنيتين / ال كارنتين / كارنتين شراب | ال كارنتين | C14 |
| 45 | cla / سي ال ايه / سي ال اي / سي ال ايه حارق | سي ال ايه (CLA) | C14 |
| 46 | حارق دهون / حارق الدهون / فات بيرنر / fat burner | ال كارنتين وسي ال ايه (search only; never in page copy) | C14 |
| 47 | omega / اوميجا / اوميقا / اوميغا ٣ / omega 3 / اوميغا 3 6 9 | اوميغا 3 | C15 |
| 48 | fish oil / زيت السمك / فش اويل / زيت سمك | اوميغا 3 | C15 |
| 49 | vitamin d / فيتامين دال / فيتامين دي / فيتامين د٣ / د3 / d3 / vitamin d3 | فيتامين د3 | C16 |
| 50 | d3 k2 / فيتامين د مع ك2 / د3 و ك2 / k2 | فيتامين د3 مع k2 | C16 |
| 51 | vitamin c / فيتامين c / فوار سي / فيتامين سي فوار / فيتامين ج | فيتامين سي | C17 |
| 52 | zinc / زنك / زنگ / زنك بيكولينات / زنك جلوكونات | زنك | C18 |
| 53 | magnesium / مغنيسيوم / ماغنيسيوم / مغنسيوم / ماغنسيوم | مغنيسيوم | C19 |
| 54 | glycinate / جلايسينيت / جليسينات / بيسجليسينات / بسجلايسينيت | مغنيسيوم جليسينات | C19 |
| 55 | citrate / سترات / ستريت / مغنيسيوم ستريت | مغنيسيوم سترات | C19 |
| 56 | multivitamin / ملتي / مالتي فيتامين / ملتي فيتامين / فيتامينات متعددة | ملتي فيتامين | C20 |
| 57 | فيتامينات للرجال / ملتي للرجال / سنتروم رجال | ملتي فيتامين للرجال | C20 |
| 58 | فيتامينات للنساء / ملتي للنساء / سنتروم نساء / فيتامينات حريم | ملتي فيتامين للنساء | C21 |
| 59 | centrum / سنتروم / سينتروم | سنتروم | C20 / C21 |
| 60 | collagen / كولاجين / كولاجن / كلاجين | كولاجين | C22 |
| 61 | peptides / ببتيد / بيبتايد / ببتيدات / بيبتيدز / ببتيديز | كولاجين ببتيدات | C22 |
| 62 | كولاجين بحري / مارين كولاجين / marine collagen | كولاجين بحري | C22 |
| 63 | biotin / بيوتين / بايوتين / بيوتين ١٠٠٠٠ | بيوتين | C23 |
| 64 | ashwagandha / اشواجاندا / اشواجندا / اشواغندا / اشوقندا / ksm 66 / ksm66 | اشواغاندا | C24 |
| 65 | glucosamine / جلوكوزامين / جلوكوز امين / كوندرويتين / msm / ام اس ام | جلوكوزامين | C25 |
| 66 | مكملات المفاصل / مكمل مفاصل / للمفاصل | جلوكوزامين ودعم المفاصل | C25 |
| 67 | electrolytes / الكترولايت / الكتروليتات / الكتروليتس / الكتروليت / املاح | الكتروليت | C26 |
| 68 | caffeine / كافيين / حبوب كافيين / كافين | حبوب كافيين | G01 |
| 69 | shaker / شيكر / شاكر / شيكر بروتين / كوب بروتين / مطارة | شيكر | C27 |
| 70 | scoop / سكوب / اسكوب / مكيال / معيار | سكوب | C09 / C02 (unit word, boosts دليل الجرعة U02 / U06) |
| 71 | lb / lbs / باوند / رطل / 5 باوند / 10 باوند | باوند | size facet |
| 72 | kg / كيلو / كجم / كغ / 5 كيلو | كيلو | size facet |
| 73 | vanilla / فانيلا / فانيليا / فانيلا ايسكريم | فانيلا | flavour facet |
| 74 | chocolate / شوكلت / شوكولاته / شوكولاتة / شوكلاته / تشوكلت | شوكولاتة | flavour facet |
| 75 | cookies and cream / كوكيز اند كريم / كوكيز | كوكيز اند كريم | flavour facet |
| 76 | strawberry / فراوله / فراولة / ستروبري | فراولة | flavour facet |
| 77 | peanut / فول سوداني / بينت / بينت بتر | فول سوداني | flavour facet |
| 78 | kinder / كندر / كيندر | كندر | flavour facet |
| 79 | dunkin / دانكن / دانكن دونتس | دانكن | flavour facet (ISO 100 line) |
| 80 | تنشيف / كت / cut / lean | واي بروتين ايزوليت (goal التنشيف) | G06b |
| 81 | تضخيم / bulk / بلك / ضخامة | ماس جينر (goal التضخيم) | G06a |
| 82 | للبنات / للنساء / حريم / نسائي / بنات | مكملات للنساء | A01 |
| 83 | للمبتدئين / مبتدئ / اول مرة / بداية | مكملات للمبتدئين | U11 |
| 84 | اصلي / اصلية / اورجنال / original / تقليد | ضمان الأصالة | V01 |
| 85 | المدينة / المدينة المنورة / طيبة / الخالدية / قريب مني | فرع المدينة المنورة | L01 |
| 86 | توصيل / شحن / يوصل / delivery | التوصيل والشحن (homepage until a shipping page exists) | H01 |
| 87 | عروض / تخفيضات / خصم / كود خصم / offers | العروض | H01 (native offers route) |

Rows 1 to 3 and the leading-word rule in 5.1 cover the dialect layer (وش، ابي، ابغى، ودي); rows 4 to 45 cover transliteration and Latin; rows 46 and 80 to 87 are intent rewrites that should land on a page rather than a product list. The canonical spellings in the third column are the spellings section 7 recommends for product names, so a single index handles both.

## 6. English twin list: H1 and title for every owning page

English is the secondary language. Titles keep the same shape as the Arabic ones (page name, qualifier, brand last after a pipe) and stay under 60 characters. "Saudi Arabia" is used on category heads where S1 showed Saudi users typing English product names (whey, creatine, iso 100, gold standard, c4, on protein), because those are the pages that can rank in English from inside the Kingdom.

| ID | Arabic H1 | English H1 | English title |
|---|---|---|---|
| C01 | بروتين باودر | Protein Powder | Protein Powder in Saudi Arabia \| OptimalX |
| C02 | واي بروتين | Whey Protein | Whey Protein in Saudi Arabia, Authentic \| OptimalX |
| C03 | واي بروتين ايزوليت | Whey Protein Isolate | Whey Protein Isolate, Authentic \| OptimalX |
| C04 | بروتين كازين | Casein Protein | Casein Protein, Slow Release \| OptimalX |
| C05 | ماس جينر | Mass Gainer | Mass Gainer and Weight Gain Protein \| OptimalX |
| C06 | بروتين نباتي | Plant Protein | Plant Based Protein Powder \| OptimalX |
| C07 | بروتين بار | Protein Bars | Protein Bars, Sugar Free Options \| OptimalX |
| C08 | سناكات بروتين | Protein Snacks | Protein Snacks: Chips, Cookies, Oats \| OptimalX |
| C09 | كرياتين مونوهيدرات | Creatine Monohydrate | Creatine Monohydrate in Saudi Arabia \| OptimalX |
| C10 | بري وورك اوت (مكملات ما قبل التمرين) | Pre-Workout | Pre-Workout Supplements \| OptimalX |
| C11 | أحماض أمينية: بي سي اي اي و اي اي اي | Amino Acids: BCAA and EAA | BCAA and EAA Amino Acids \| OptimalX |
| C12 | جلوتامين | Glutamine | Glutamine Powder and Capsules \| OptimalX |
| C13 | سيترولين ماليت وبيتا الانين | Citrulline Malate and Beta-Alanine | Citrulline Malate and Beta-Alanine \| OptimalX |
| C14 | ال كارنتين وسي ال ايه | L-Carnitine and CLA | L-Carnitine and CLA \| OptimalX |
| C15 | أوميغا 3 وزيت السمك | Omega-3 and Fish Oil | Omega-3 Fish Oil \| OptimalX |
| C16 | فيتامين د3 | Vitamin D3 | Vitamin D3 with K2 \| OptimalX |
| C17 | فيتامين سي | Vitamin C | Vitamin C, Effervescent and Tablets \| OptimalX |
| C18 | زنك | Zinc | Zinc Picolinate and Gluconate \| OptimalX |
| C19 | مغنيسيوم جليسينات | Magnesium Glycinate | Magnesium Glycinate 400 mg \| OptimalX |
| C20 | ملتي فيتامين | Multivitamin | Multivitamin for Men and Athletes \| OptimalX |
| C21 | ملتي فيتامين للنساء | Multivitamin for Women | Multivitamin for Women \| OptimalX |
| C22 | كولاجين ببتيدات | Collagen Peptides | Collagen Peptides, Marine and Bovine \| OptimalX |
| C23 | بيوتين | Biotin | Biotin 5000 and 10000 mcg \| OptimalX |
| C24 | اشواغاندا | Ashwagandha | Ashwagandha KSM-66 \| OptimalX |
| C25 | جلوكوزامين ومكملات دعم المفاصل | Glucosamine and Joint Support | Glucosamine and Joint Support \| OptimalX |
| C26 | الكتروليت ومشروبات الترطيب | Electrolytes and Hydration | Electrolytes and Hydration for Athletes \| OptimalX |
| C27 | شيكر وأكسسوارات | Shakers and Accessories | Shakers and Gym Accessories \| OptimalX |
| G01 | مكملات الطاقة | Energy | Energy and Focus Supplements \| OptimalX |
| G02 | مكملات الصحة العامة | General Health | General Health and Daily Vitamins \| OptimalX |
| G03 | مكملات الأداء لكمال الأجسام والجيم | Performance | Performance Supplements for Bodybuilding \| OptimalX |
| G04 | مكملات التعافي | Recovery | Recovery Supplements, Post-Workout and Night \| OptimalX |
| G05 | مكملات الشعر والبشرة والأظافر | Hair, Skin and Nails | Hair, Skin and Nails Supplements \| OptimalX |
| G06a | بروتين ومكملات زيادة الكتلة العضلية | Muscle and Weight Gain | Muscle Mass and Weight Gain Supplements \| OptimalX |
| G06b | بروتين ومكملات مرحلة التنشيف | Lean and Cutting | Cutting Phase Supplements: Isolate and Creatine \| OptimalX |
| A01 | بروتين ومكملات للنساء | Supplements for Women | Protein and Supplements for Women \| OptimalX |
| B01 | اوبتيموم نيوتريشن | Optimum Nutrition | Optimum Nutrition, Authentic \| OptimalX |
| P01 | جولد ستاندرد 100% واي بروتين من اوبتيموم نيوتريشن | Optimum Nutrition Gold Standard 100% Whey | Gold Standard 100% Whey, Authentic \| OptimalX |
| P02 | جولد ستاندرد 100% ايزوليت | Optimum Nutrition Gold Standard 100% Isolate | Gold Standard 100% Isolate \| OptimalX |
| P03 | سيرياس ماس من اوبتيموم نيوتريشن | Optimum Nutrition Serious Mass | Serious Mass by Optimum Nutrition \| OptimalX |
| B02 | ديماتيز | Dymatize | Dymatize Protein and Creatine \| OptimalX |
| P04 | ايزو 100 من ديماتيز (واي بروتين ايزوليت مهدرج) | Dymatize ISO100 Hydrolyzed Whey Isolate | Dymatize ISO100 in Saudi Arabia \| OptimalX |
| B03 | ابلايد نيوترشن | Applied Nutrition | Applied Nutrition, Authentic \| OptimalX |
| B04 | ماسل تك | MuscleTech | MuscleTech Protein and Creatine \| OptimalX |
| P05 | نيترو تك واي بروتين من ماسل تك | MuscleTech Nitro-Tech Whey | MuscleTech Nitro-Tech Whey Protein \| OptimalX |
| B05 | سي فور بري وورك اوت من سيلوكور | Cellucor C4 Pre-Workout | Cellucor C4 Pre-Workout \| OptimalX |
| U01 | متى آخذ الكرياتين وكيف أستخدمه بالطريقة الصحيحة | When to Take Creatine and How to Use It | When to Take Creatine: Before or After \| OptimalX |
| U02 | كم سكوب كرياتين في اليوم؟ الجرعة الصحيحة وخلطه مع البروتين | How Many Scoops of Creatine a Day | Creatine Dose: How Many Scoops a Day \| OptimalX |
| U03 | فوائد الكرياتين وأضراره: ما الذي تقوله الأدلة | Creatine Benefits and Side Effects | Creatine Benefits and Side Effects \| OptimalX |
| U04 | الفرق بين الكرياتين والبروتين والمكملات التي تشبهه في الاسم | Creatine vs Protein and Look-Alike Names | Creatine vs Protein: What Is the Difference \| OptimalX |
| U05 | الكرياتين للنساء والبنات: ما الذي يفعله وكيف يستخدم | Creatine for Women | Creatine for Women: A Simple Guide \| OptimalX |
| U06 | كم سكوب بروتين في اليوم؟ كيف تحسب احتياجك | How Many Scoops of Protein a Day | Protein Dose: How Many Scoops a Day \| OptimalX |
| U07 | متى آخذ البروتين: قبل التمرين أم بعده أم قبل النوم | When to Take Protein | When to Take Protein: Before or After Training \| OptimalX |
| U08 | الفرق بين واي بروتين ايزوليت وكونسنتريت وهيدرو | Whey Isolate vs Concentrate vs Hydro | Whey Isolate vs Concentrate \| OptimalX |
| U09 | فوائد واي بروتين وكيف تختار النوع المناسب لك | Whey Protein Benefits | Whey Protein Benefits and How to Choose \| OptimalX |
| U10 | هل البروتين باودر مضر؟ ما الذي يقوله العلم وما الذي لا يقوله | Is Protein Powder Safe | Is Protein Powder Safe? A Plain Answer \| OptimalX |
| U11 | مكملات للمبتدئين في الجيم: من أين تبدأ وماذا تتجاهل | Supplements for Beginners | Gym Supplements for Beginners \| OptimalX |
| U12 | أفضل بروتين باودر: كيف تختار النوع المناسب لهدفك | Best Protein Powder: How to Choose | Best Protein Powder: A Buying Guide \| OptimalX |
| U13 | هل الماس جينر يزيد الوزن؟ الأسئلة الشائعة عن الماس جينر | Mass Gainer FAQ | Does Mass Gainer Work? Mass Gainer FAQ \| OptimalX |
| U14 | أوميغا 3 للرياضيين: الجرعة والتوقيت وما تبحث عنه على الملصق | Omega-3 for Athletes | Omega-3 for Athletes: Dose and Timing \| OptimalX |
| U15 | ما هو البري وورك اوت ومتى تأخذه وكيف تختاره | What Is Pre-Workout | What Is Pre-Workout and When to Take It \| OptimalX |
| L01 | مكملات غذائية في المدينة المنورة: فرع الخالدية | Supplements in Madinah: Al Khalidiyah Branch | Supplement Store in Madinah \| OptimalX |
| V01 | كيف تعرف المكمل الأصلي: ضمان الأصالة في اوبتيمال اكس | How to Spot Genuine Supplements | Authenticity Guarantee \| OptimalX |
| H01 | اوبتيمال اكس: متجر مكملات غذائية ورياضية أصلية | OptimalX: Authentic Sports Nutrition and Supplements | Supplements and Sports Nutrition in Saudi Arabia \| OptimalX |

Transliteration of the city: "Madinah" is the form used by the Saudi General Authority for Statistics and by Google Maps in English; "Medina" is the older English spelling. Use Madinah in H1 and title, and add Medina in body copy once so both are covered.

## 7. Naming conventions observed in the harvest

Everything below is read off S1 (2026-09-17). Where two spellings compete, the count is the number of unique S1 suggestions containing that spelling. Product names on the store should use the first form in each row; the others go into section 5 as synonyms.

### 7.1 Brand names in Arabic script

| Brand | Use this on the store | Also seen in S1 (synonyms) | Evidence |
|---|---|---|---|
| Optimum Nutrition | اوبتيموم نيوتريشن | اوبتيموم نيوترشن، اوبتيمم نيوترشن، اوبتيموم، اوبتيمم، اون، on | The seed اوبتيموم نيوتريشن returned 6 rows, all with نيوتريشن or نيوترشن; the short seed اوبتيمم returned 15 rows dominated by اوبتيمم نيوترشن. Latin "on protein" is its own head (15 rows). |
| Gold Standard | جولد ستاندرد | قولد، gold standard، gold standard way | 30 Arabic-script rows use جولد; one row uses قولد (كرياتين مونوهيدرات قولد). Latin gold standard is a full head of its own. |
| Serious Mass | سيرياس ماس | سيريس ماس (seed only), gold standard gainer | Every one of the 15 suggestions came back as سيرياس ماس although the seed was سيريس ماس. |
| Dymatize | ديماتيز | ديماتايز، دايماتيز، dymatize، ديماتيز نيوتريشن | Both alternative seeds were normalised to ديماتيز by Google. |
| ISO100 | ايزو 100 | iso 100، ايزو ١٠٠، ايزو 100 دايماتايز، ايزو ديماتيز | Arabic ايزو with Western digits leads (15 rows); Arabic-Indic ١٠٠ appears once; the brief's own spelling "دايماتايز" appears zero times. |
| Applied Nutrition | ابلايد نيوترشن | ابلايد، applied nutrition | Never spelled نيوتريشن with the ي in S1 (contrast with اوبتيموم نيوتريشن, where both forms appear). The ABE pre-workout is written in Latin (abe) inside Arabic queries. |
| MuscleTech | ماسل تك | مسل تك، ماصل تك، ماسلتيك، ماسلتك، مصل تك | Four spellings in the ماسل تك seed alone; Sporter uses مسل تك (S3). |
| Nitro-Tech | نيترو تك | nitro tech، نيترو تك واي جولد | 14 Arabic rows, one Latin. "نيترو تك واي جولد" is the Saudi name of Nitro-Tech 100% Whey Gold. |
| Cellucor C4 | سي فور | c4، c4 pre workout، سي فور شوت | "سي 4" with a digit returns only phones and cars; write the number as a word. |
| Body Builder (Nutrition) | بودي بيلدر | none | Three rows: واي بروتين بودي بيلدر، كرياتين بودي بيلدر، ماس جينر بودي بيلدر. |
| Creapure (ingredient mark) | كريابيور | creapure، كريا بيور | كرياتين كريابيور، كرياتين مونوهيدرات كريابيور، creatine creapure. |
| Centrum | سنتروم | none | 7 rows, always سنتروم. |
| Quest | كويست | quest | بروتين بار كويست، شيبس بروتين كويست. |
| Grenade | قرنيد | grenade | One Arabic, one Latin. |
| Barebells | باربلز | barebells | One Arabic, one Latin. |
| Limitless (Saudi) | ليمتلس | ليمتلس مان | 7 rows. |
| Sports Research | سبورتس ريسيرتش | none | اوميغا 3 سبورتس ريسيرتش. |
| NOW Foods | ناو | شركة ناو | ناو سي ال ايه، كولاجين بودرة شركة ناو، مغنيسيوم جليسينات ناو. |
| Jamieson | جاميسون | none | مغنيسيوم جاميسون، اشواغاندا جاميسون. |
| Ghost | قوست | none | بري ورك اوت قوست. |
| Labrada | لابرادا | none | ماس جينر لابرادا. |
| Russian Bear (Vitol) | الدب الروسي | none | ماس جينر الدب الروسي، بروتين الدب الروسي 10000. |
| Egyptian-market brands, not for the store | بيج رامي، ماكس ماصل، ريد ريكس، نوفوجين، امتنان، ايفولف، ديفل، كريا باور، تراكتور، سترونج ماصل، مارفيلوس | | Listed only so the search box does not silently match them to a stocked product. |
| Retail chains that appear as brand-like modifiers | النهدي، الدواء، الوزن المثالي، سبورتر (S3 only), دكتور نيوترشن، جي ان سي، ايهيرب، نون، امازون | | Never use in copy; see section 3. |

### 7.2 Product and ingredient words

| Concept | Use this | Also seen | Notes |
|---|---|---|---|
| Whey | واي بروتين | وي، whey، whey بروتين | "وي" appears only inside brand strings (ماسل تك وي، وي ماسلتيك). |
| Isolate | ايزوليت | ايزو، isolate، بروتين معزول | "معزول" appears once, in a retailer product title (ديماتيز ايزو 100 بروتين معزول). |
| Concentrate | كونسنتريت | concentrate | |
| Hydrolysed | هيدرو واي | مهدرج | Saudis say هيدرو واي (الفرق بين الهيدرو واي والواي بروتين); مهدرج is MSA and safe for the H1. |
| Protein powder | بروتين باودر | بروتين بودر، بروتين بودرة، مسحوق بروتين | باودر for protein; بودرة or بودر for collagen (كولاجين بودرة 15 rows, كولاجين بودر 15 rows). |
| Casein | كازين | كازيين | The bare seed كازين returns casinos; always write بروتين كازين. |
| Mass gainer | ماس جينر | ماس، جينر، گينر، weight gainer | |
| Pre-workout | بري ورك اوت | بري وورك اوت، بري وركاوت، pre workout، مكمل قبل التمرين | Google normalised the seed بري وورك اوت to بري ورك اوت in every suggestion; the store title uses the MSA-friendly "بري وورك اوت" per the brief, and section 5 maps the rest. |
| Creatine monohydrate | كرياتين مونوهيدرات | مونوهايدريت، monohydrate | 15 rows with مونوهيدرات, 1 with مونوهايدريت. |
| Micronised | ميكرونيزد | ميكرونايزد، micronized | |
| BCAA | بي سي اي اي | bcaa | Latin bcaa returned 15 rows, Arabic بي سي اي اي only 3 supplement rows before drifting into alphabet strings. Show both on the page. |
| EAA | eaa | اي اي اي | The Arabic seed اي اي اي returned only a song; Saudis write EAA in Latin. |
| Glutamine | جلوتامين | glutamine | |
| Citrulline malate | سيترولين ماليت | سيترولين مالات | ماليت 3 rows, مالات 1 row. |
| Beta-alanine | بيتا الانين | | Single spelling in S1. |
| L-Carnitine | ال كارنتين | كارنتين، الكارنتين | Two seeds, both productive; keep the spaced ال form as the display name and fold the rest. |
| CLA | سي ال ايه | cla | Mostly Mercedes; write CLA in Latin next to the Arabic on the page. |
| Omega-3 | اوميغا 3 | اوميجا 3، omega 3، اوميغا ٣ | اوميغا leads; اوميجا appears in زيت السمك اوميجا 3 and اوبتيمم اوميجا ٣. |
| Fish oil | زيت السمك | fish oil | |
| Vitamin D | فيتامين د3 | فيتامين د، فيتامين دال، فيتامين دي، فيتامين د٣، d3 | The seed فيتامين د returned دال (4), دي (2), د3 and د٣; write د3 with a Western digit. |
| Vitamin C effervescent | فيتامين سي فوار | | Effervescent is the dominant form word. |
| Zinc forms | زنك بيكولينات، زنك جلوكونات، زنك جلايسينيت | زنك كارنوزين | |
| Magnesium glycinate | مغنيسيوم جليسينات | جلايسينيت، بيسجليسينات، glycinate | جلايسينيت 8 rows, جليسينات 15 rows (as a seed); use جليسينات and fold the rest. |
| Magnesium citrate | مغنيسيوم سترات | ستريت | |
| Collagen peptides | كولاجين ببتيدات | بيبتايد، ببتيد، بيبتيدز، ببتيديز | ببتيدات leads (4 rows). |
| Marine and bovine | كولاجين بحري، كولاجين بقري | | |
| Biotin | بيوتين | | Bare seed بيوتين drifts to بيتونيا (furniture); always pair with للشعر or a dose on the page. |
| Multivitamin | ملتي فيتامين | مالتي فيتامين | مالتي appears once (ماسلتيك مالتي فيتامين). |
| Ashwagandha | اشواغاندا | اشواجاندا، اشواجندا، ksm 66 | |
| Electrolytes | الكتروليت | الكترولايت، الكتروليتات، الكتروليتس | |
| Glucosamine | جلوكوزامين كوندرويتين | ام اس ام، msm | |
| Protein bar | بروتين بار | | |
| Protein chips | شيبس بروتين | chips protein | |
| Protein oats | شوفان بروتين | اوتس، oats، شوفان بروتيني | |
| Peanut butter | زبدة الفول السوداني | | Full MSA form is what Saudis type; no dialect variant appeared. |
| Shaker | شيكر | protein shaker | |
| Scoop | سكوب | | Universal; no Arabic equivalent appeared. |
| Serving count | حصة / عدد الحصص | | Saudis ask "كم سكوب في العلبة", so the product page should show servings per container in Arabic next to the scoop weight. |

### 7.3 Sizes, flavours, numerals

- Sizes are written in باوند for imported protein (5 باوند، 10 باوند، 12 باوند، 6 باوند) and in كيلو for the same products when the buyer thinks in metric (5 كيلو، 1 كيلو، 2 كيلو); both must be on the product page. Grams are used for creatine (300 جرام، 500 جرام). The Latin "5lb" appears in English queries (iso 100 5lb).
- Flavours: فانيلا، شوكولاتة (also شوكلت، شوكولاته)، كوكيز اند كريم، فول سوداني، فراولة، كندر، دانكن، اوريو، سنيكرز، توت، ليمون، برتقال. Write the flavour after the product name, as Saudis do (ايزو 100 فانيلا، واي بروتين شوكلت).
- Numerals: Western digits dominate (100, 5000, 50000); Arabic-Indic digits appear in a minority (١٠٠، ١٠٠٠، ٥٠٠٠٠، ٣). Display Western digits and normalise input.
- Dose vocabulary: سكوب، جرعة، حصة، كم سكوب في اليوم، كم سكوب في العلبة، كم جرام.

### 7.4 Orthography of the harvest versus the store

- S1 queries drop hamza almost everywhere (افضل، اضرار، احماض، اوميغا). The store's MSA copy keeps hamza (أفضل، أضرار، أحماض، أوميغا) because Google folds hamza when matching and because the brief requires MSA. The search index must fold it too (section 5.1).
- S1 mixes ة and ه (فراوله، حلاوه، رخيصه) and ى and ي (واى بروتين). The store writes ة and ي.
- Latin and Arabic mix inside one query is normal (whey بروتين، iso 100 بروتين، فيتامين د مع k2، creatine للتنشيف). Product titles should carry the Latin brand and product name once, after the Arabic, so both scripts are on the page: "ايزو 100 ديماتيز (Dymatize ISO100)".
- Spacing varies in brand names (ماسل تك / ماسلتك، ال كارنتين / الكارنتين). Pick one display form and fold the other.
- Persian-script noise (گينر، پروتئين، کراتین) appears in 16 rows and comes from Iranian users on Saudi IPs; ignore it in naming, fold it in search if cheap.

### 7.5 Naming template for product titles on the store

Derived from how the harvest orders words (product, brand, flavour, size), which is also how Sporter and Nahdi write titles (S3):

`<Arabic product line> <Arabic brand> <flavour> <size> (<Latin brand> <Latin product>)`

Examples that match the harvest word order:
- جولد ستاندرد واي بروتين اوبتيموم نيوتريشن فانيلا 5 باوند (Optimum Nutrition Gold Standard 100% Whey)
- ايزو 100 ديماتيز كوكيز اند كريم 5 باوند (Dymatize ISO100)
- سيرياس ماس اوبتيموم نيوتريشن شوكولاتة 12 باوند (Optimum Nutrition Serious Mass)
- نيترو تك واي جولد ماسل تك فانيلا 5 باوند (MuscleTech Nitro-Tech 100% Whey Gold)
- كرياتين مونوهيدرات كريابيور ابلايد نيوترشن 500 جرام (Applied Nutrition Creatine Monohydrate)
- سي فور اوريجينال سيلوكور توت 60 حصة (Cellucor C4 Original)
