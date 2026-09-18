# OptimalX: AEO and GEO for Arabic supplement queries in Saudi Arabia

Status: IN PROGRESS (written incrementally; sections fill in as research lands)
Date of research: 2026-09-17
Author lens: answer-engine and generative-engine optimization, Arabic-first Salla store (salla.sa/optimal-x)

Hard rules applied to this document: no invented statistics; every number carries a source URL and an access date; no health-outcome, treatment, cure or weight-loss promises; no professional titles; plain prose; no em-dashes.

## 0. Method

1. Ten real Arabic buyer questions were run through web search with Saudi Arabia as the location and Arabic as the language, to observe which domains rank and which passage shapes get pulled into answer boxes.
2. AI-answer citation behaviour was observed indirectly through search results about Perplexity, ChatGPT and Google AI Overviews for Arabic queries, and directly by inspecting the top-ranked passages the engines index.
3. Structured-data guidance was checked against Google Search Central and schema.org primary docs.
4. AI crawler policy was checked against each crawler's own documentation page.
5. Regulatory limits on claims were checked against SFDA pages.

## 1. Citation landscape for Arabic supplement questions

(pending)

## 2. Answer-object template and three completed examples

(pending)

## 3. Structured-data plan for an Arabic-primary Salla store

(pending)

## 4. llms.txt and robots guidance for AI crawlers

(pending)

## 5. Per-category FAQ sets (MSA, 30 to 60 words each, no medical claims)

(pending)

## 6. Sources log (URL, date accessed, what it was used for)

(pending)

---
## RAW OBSERVATIONS LOG (kept for audit; distilled into section 1 below)

Search tool: Firecrawl search, location "Saudi Arabia", accessed 2026-09-17. Positions are as returned by the tool at that moment; they are a snapshot, not a stable ranking.

### Q1 ما الفرق بين واي بروتين ايزوليت والكونسنتريت
1. instagram.com reel (Egyptian fitness account) 2. suppsplanet.com/ar/blog (supplement retailer blog, Arabic) 3. facebook.com post (Egyfitness) 4. egysupps.com blog 5. tiktok.com video 6. faydety.com (comparison site) 7. instagram.com reel 8. instagram.com reel 9. fitneeds.sa/blogs/isolate-vs-concentrate (Saudi retailer blog; snippet is a "quick decision" sentence) 10. gnc.com article (English)
Passage shape pulled: one-sentence definitional lead ("الواي بروتين هو بروتين مستخرج من الحليب أثناء عملية تصنيع الجبن...") and one-sentence decision rule ("اختر الكونسنتريت إذا... واختر الآيزوليت إذا...").

### Q2 متى آخذ الكرياتين
1. youtube.com short 2. instagram.com reel 3. ar.yanggebiotech.com (manufacturer, machine-translated Arabic) 4. mayoclinic.org/ar creatine 5. prowheysa.com blog (Saudi retailer) 6. youtube.com short 7. greenspotsa.com page (Saudi retailer) 8. facebook.com video 9. aawsat.com (newspaper health section) 10. altibbi.com article (Arabic health portal)
Passage shape pulled: "قبل التمرين / بعد التمرين / أيام الراحة" bullet-style list (altibbi), one-sentence verdict (prowheysa), hedged evidence sentence (aawsat: "الأدلة المتاحة متناقضة").

### Q3 كم حصة في عبوة الواي بروتين
1. instagram.com reel 2. youtube.com video 3. muscles-world.com blog 4. kooora.com (sports news, embeds an Amazon.sa product with "74 حصة") 5. youtube.com 6. facebook.com 7. reddit.com (auto-translated ar-eg) 8. nahdionline.com product page (74 servings, 2.27 kg, "الحصص بكل عبوة: 74", nutrition table per serving and per 100 g) 9. drnutrition.com blog 10. coupon1.org
Passage shape pulled: product spec line "الحصص بكل عبوة: 74" plus nutrition table. This is the only query in the set where a retailer product page (Nahdi) appeared with a spec table snippet.

### Q4 هل الكرياتين آمن
1. mayoclinic.org/ar creatine ("رأينا: آمن بوجه عام" heading + safety section) 2. apollohospitals.com/ar 3. webteb.com article 4. youtube.com 5. suppsplanet.com/ar blog 6. facebook.com video (MBC Masr) 7. pmc.ncbi.nlm.nih.gov (English review PMC7871530) 8. aawsat.com 9. sa.iherb.com/blog/creatine-benefits/1918 (iHerb Saudi blog; cites ISSN position stand) 10. altibbi.com term page
Passage shape pulled: Mayo's H2 "رأينا" + one-line verdict; Altibbi "يعد الكرياتين آمناً عند تناوله... بجرعات تصل إلى..." dose-bounded sentence; iHerb sentence citing the International Society of Sports Nutrition.

### Q5 أفضل وقت لأخذ فيتامين د
1. youtube.com (Arabic doctor-influencer videos, 1M+ views) 2. instagram.com reel 3. facebook.com video 4. webteb.com article 5. mayoclinic.org/ar vitamin D 6. youtube.com 7. instagram.com reel 8. toqueen.com (Arabic supplement blog; one-sentence direct answer) 9. altibbi.com Q&A 10. unitedpharmacy.sa/ar/blog (Saudi pharmacy blog)
Passage shape pulled: one-sentence direct answer with a reason clause ("مع وجبة تحتوي على دهون... لأن فيتامين د من الفيتامينات الذائبة في الدهون").
