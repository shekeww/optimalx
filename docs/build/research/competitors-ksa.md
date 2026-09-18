# OptimalX competitor teardown: Saudi and GCC supplement retailers

Lens: what OptimalX competes with in Arabic search and on price.
Research date: 2026-09-17. All observations are from live pages fetched on that date unless a different access date is noted. Where a page could not be fetched, the section says so and nothing is inferred.

Method note: pages were fetched with a headless scraper (Firecrawl) and a text fetcher. Some sites render payment icons, delivery banners and review widgets client-side; where the scrape did not surface an element, the section records "not observed in scrape" rather than "absent". Treat every "not observed" as a claim to verify in a real browser.

## Status log

- 2026-09-17 skeleton created; research in progress.

## 1. Sporter.com (Saudi storefront)

Source: https://www.sporter.com/ar-sa/ (accessed 2026-09-17, Firecrawl, SA proxy, Arabic locale).

- Platform: custom Next.js build (asset paths under /_next/), not Salla or Zid.
- Page title: "سبورتر السعودية | أفضل الفيتامينات والمكملات الغذائية والسناكات الصحية". Meta description: "موقع متكامل للمكملات الغذائية وأقوى المنتجات المصنعة عالمياً لغايات كمال الأجسام, زيادة أو إنقاص الوزن، الطاقة و اللياقة البدنية في السعودية."
- URL structure: locale prefix /ar-sa/ and /en-sa/ (language switch link "English" points to https://www.sporter.com/en-sa/). All slugs are Latin (e.g. /ar-sa/sport-supplements/protein/whey-protein/). Product URLs are Latin slug plus numeric ID (e.g. /ar-sa/sporter-whey-smart-blend-64873/). Country selector labelled "السعودية". hreflang tags not confirmed from the markdown scrape (verify in page source).
- Arabic quality: MSA with heavy transliteration of English product terms ("بري ورك اوت", "ماس جينر", "واي بروتين سمارت بليند", "ستاك"). Several category labels read as translated lists, e.g. "احماض امينية, استشفاء عضلي" and "بري ورك اوت, مكملات تعزيز الطاقة" (comma-joined pairs, Latin comma inside Arabic text). Inconsistent hamza usage ("احماض" vs "الأحماض", "اوت" vs "أوت"). Diacritics appear sporadically ("مكمِلات", "مَخفّضة", "مُربّى"). Verdict: human-written MSA base with machine-like inconsistency; reads as Arabic written by a marketing team, not a translator.
- Product naming: Arabic transliterated brand + Arabic product name, separated by a spaced hyphen: "سبورتر - واي بروتين باودر - نسخة مطوّرة", "ديماتيز ايزو 100 بروتين", "مسل تك - بروتين نيترو تك", "ناو - ZMA", "سنتروم - ملتي فيتامين للنساء". Latin abbreviations kept when no Arabic equivalent (ZMA, BCAA, EAA, HMB, CLA, 5-HTP).
- Price display: "SAR172.50" (Latin ISO code, no space, decimals, on the Arabic page). Discount badge as percentage ("23%"). No VAT note observed on the homepage cards.
- Delivery promise: footer trust strip says "خدمة توصيل سريعة / توصيل سريع، أسعار مَخفّضة وخدمة ممتازة". No city list or hour promise on the homepage.
- Payment: footer trust strip "مدفوعات آمنة 100 ٪ / عملية شراء آمنة عبر نظام Norton Veresign" (sic, "Veresign" misspelled). Payment method icons not surfaced in the markdown scrape (verify in browser).
- Authenticity signals: "منتجات أصلية 100% / نتعامل فقط مع المنتجات المضمونة والأصلية"; footer links "جودة المنتج" (/ar-sa/products-quality/) and "وكيل معتمد" (/ar-sa/official-supplier/). No SFDA or halal wording on the homepage.
- Reviews: Trustpilot widget in the footer ("Review us on Trustpilot"). Product cards on the homepage do not show star ratings.
- WhatsApp: not observed on homepage. Contact is "Email : wow@sporter.com" and a "معلومات الإتصال" page.
- Mobile app: Google Play (com.sporter) and App Store (id1486575952) links under "تسوق أينما كنت".
- Loyalty: "vitamins-subscribe-save" banner link (subscription programme), "discount-hub" pages; no points programme observed on the homepage.
- Services: "هل تحتاج لجدول غذائي مخصص؟ ابدأ رحلتك نحو حياة أكثر صحة مع اخصائي تغذية معتمد" linking to /ar-sa/sporter-nutrition/ (paid nutrition plans); "البيع بالجملة" wholesale page; "مدونة سبورتر" at blog.sporter.com/ar/.
- Homepage structure (top to bottom): trust ticker (منتجات أصلية 100%, طرق دفع آمنة), mega menu, hero banners (own-brand products), "الأكثر مبيعاً" grid, "الستاك الأكثر مبيعاً" (bundles named by goal, e.g. "ستاك دعم خسارة الوزن", "ستاك دعم المناعة والصحة"), "الأكثر رواجاً" tiles, "حسب الفئة" tiles, "وصل حديثاً" grid, nutritionist CTA, three-column trust strip, footer.
- Top-level categories verbatim: "مكمِلات رياضية", "الفيتامينات والصحة", "الأغذية الصحية", "ماركة سبورتر", "للنساء فقط".
- Second level under "مكمِلات رياضية": "بروتين باودر", "كرياتين", "احماض امينية, استشفاء عضلي", "مقويات عضلية", "إنقاص الوزن", "كربوهيدرات", "بري ورك اوت, مكملات تعزيز الطاقة".
- Third level under protein: "واي بروتين", "واي بروتين ايزوليت", "بروتين نباتي", "بروتين كازين", "بروتين زيادة الوزن", "المزيد من مكملات البروتين". Under creatine: "كرياتين مونوهيدرات", "تركيبات الكرياتين". Under aminos: "BCAA", "EAA", "الأرجينين", "بيتا ألانين", "الأحماض الأمينية HMB", "امينو اسيد, الاحماض الامينية", "السيترولين", "جلوتامين", "خليط استشفاء عضلي", "الكترولايتس وترطيب".
- Second level under "الفيتامينات والصحة": "الأكثر شيوعاً", "فيتامينات أساسية", "ملتي فيتامين", "العظام والمفاصل", "الجمال", "زيت السمك و الأوميجا ٣", "منتجات صحية", "الهضم والبروبيوتيك", "المعادن".
- Goal-based navigation: yes, but only inside the women's section: "للنساء فقط" > "حسب الهدف" with "تخفيف الوزن", "الشعر والبشرة والأظافر", "الطاقة والتحمل", "اكتساب العضلات والوزن", "الصحة العامة", "توازن الهرمونات", "الدورة الشهرية", etc. The main sports menu is ingredient-based, not goal-based, with the exception of "إنقاص الوزن" and "مقويات عضلية".
- Health-claim posture (for contrast with OptimalX rules): Sporter names products with outcome claims, e.g. "إنو سبس - نايت شريد - مساعد نوم وحارق دهون مسائي", "ناو - أشواغندا للتخلص من التوتر - يحسّن المزاج والنوم", stacks like "ستاك العناية بمتلازمة تكيّس المبايض" and "ستاك محاربة السيلوليت وإدارة الوزن". This is aggressive by Saudi advertising and SFDA standards and is a differentiation point for a "no overselling" brand.

## 2. Dr. Nutrition (KSA storefront)

Source: https://drnutrition.com/ar-sa (accessed 2026-09-17, Firecrawl, SA proxy). Page title: "Dr. Nutrition السعودية | متجر للمكملات الغذائية وكمال الأجسام". Meta description: "متجر دكتور نيوترشن هو المتجر رقم 1 لمكملات كمال الأجسام والتغذية وإكسسوارات التمرين . أقل الأسعار على مكملات كمال الأجسام ، مع أسرع شحن ." (note the space before the full stop and the "رقم 1" claim with no source).

- Platform: custom build (UAE-headquartered group, Dr. Nutrition Pharmaceuticals). og:locale ar_SA.
- URL structure: locale prefix /ar-sa and /en-sa; 17 country storefronts listed in the footer (ar-ae, ar-sa, ar-om, ar-kw, ar-jo, ar-bh, ar-qa, ar-lb, ar-in, ar-ma, ar-pk, ar-ke, ar-ng, ar-eg, ar-iq, ar-sg, ar-ph). Product slugs Latin with no ID (e.g. /ar-sa/muscletech-creatine-cell-tech-creactor-120-unflavored). Category URLs mixed: /ar-sa/categories/sports-nutrition (Latin) but also /ar-sa/categories/مالتي فيتامين (percent-encoded Arabic slug) and homepage tiles pointing to /ar-sa/search?categories=مكملات+الرياضيين (Arabic query-string facets). Several homepage banners link to un-prefixed URLs (https://drnutrition.com/brands/muscletech) that then redirect; a sign of an inconsistent locale router. hreflang not confirmed from markdown.
- Arabic quality: MSA base, but with frequent Egyptian-orthography tells: "اطلع الان علي" (على written as علي), "الوصفات", "حاسبة الوزن المثالى" and "الباقات الصحيه" (final ya without dots, ta marbuta written as ha), "بودى بيلدر", "لاكجرى هيلثى لايف ستايل", "اوبتي تيكت". Hamza dropped inconsistently ("الان", "اوراق"). Heavy use of "!!" in section headings ("منتجات الرياضيين الأفضل مبيعاً!!", "منتجاتك المميزة!!"). Verdict: human Arabic written by non-Saudi staff; not machine-translated but not Saudi MSA either.
- Product naming: transliterated brand + transliterated product + flavour + size, comma-separated: "مسل تك كرياتين سيل تك كريكتور, بدون نكهة, 120", "اوبتيموم نيوترشن جولد ستاندرد 100% بروتين نباتي, حلوى الشوكولاتة, 1.76 باوند". Same brand transliterated inconsistently across cards: "مسل تك" vs "مسل تيك" vs footer "مصل تيك"; "نوتريكس ريسيرش" vs "نوتريكس ريسورش"; "ابلايد نيوترشن" vs "اوبتميم نيوترشن". Combo bundles keep all-caps English on the Arabic page: "AN DIET WHEY PROTEIN, AN I DRIVE INSULIN DRIVER". Units mixed: "باوند", "جرام", "وقيه" (for oz), "كجم", "ملجم".
- Price display: "SAR354.65479.65" in the scrape, i.e. sale price and struck original price rendered adjacent, both prefixed by Latin "SAR" with no space. Discount badges "-26%", flash badges "عرض البرق-22%". No VAT note observed on cards.
- Delivery: no promise on the homepage body; footer link "الشحن والتوصيل" only.
- Payment icons: not surfaced in markdown; verify. Instalment providers not observed on the homepage.
- Authenticity: footer link "منتجات أصلية" (/ar-sa/original). No SFDA or halal wording on the homepage.
- WhatsApp: yes, footer "واتساب" linking to wa.me/97142040734 (a UAE number, +971) and a WhatsApp Channel link (whatsapp.com/channel/...). Phone shown is "+971 4 204 0700" (Dubai) on the Saudi storefront.
- Reviews: numeric ratings on some cards ("4.8", "4.4", "5"), no review counts on cards.
- Mobile app: App Store (id1516446052), Google Play (app.drnutrition.com), Huawei AppGallery (C116882557).
- Loyalty/programmes: "إشتراكات التحكم بالوزن" / "الباقات الصحيه" (weight-management subscription packages), "حجز موعد" (appointment booking), "حاسبة مؤشر كتلة الجسم" (BMI calculator), "الوصفات" (recipes), "المدونة", "الفروع" (branch locator), "الجملة" (wholesale), "التصفية" (clearance). A "GLP-1 Friendly" product label is used as a merchandising tag ("أفضل الخيارات المناسبة لـ GLP-1").
- Homepage structure: promo ticker (flash sale up to 90%, deals of the day, GLP-1 friendly, Hada Labo skincare), header with country/language, brand banner carousel, 7 category tiles, "أشهر الكومبوهات!", "منتجات الرياضيين الأفضل مبيعاً!! - البروتينات", same for كرياتين, "مشهور الان!", brand banners, "تصفح حسب الخصم" (discount tiers 20/40/50/70/90%), "عروض المنتجات الاكثر مبيعا!!", per-category featured rows (التحكم بالوزن, الأغذية الصحية, الصحة والعافية, مكملات الرياضيين), WhatsApp channel banner, "منتجات مميزة", footer. Sticky bottom mobile tab bar: "الرئيسية", "الفئات", "العروض", "السلة", "المزيد".
- Top-level categories verbatim (homepage tiles): "مكملات الرياضيين", "الصحة والعافية", "الجمال والعناية", "التحكم بالوزن", "الأغذية الصحية", "معدات رياضية", "ملابس رياضية". Footer "الأقسام": "مكملات الرياضيين", "الصحة والعافية", "التحكم بالوزن", "إكسسوارات وملابس رياضية", "الأغذية الصحية", "مالتي فيتامين", "واى بروتين".
- Goal-based navigation: partial. "التحكم بالوزن" is a goal-level top category; "ستاك وكومبو" bundles are sold by pairing rather than by goal.
- Health-claim posture: product names carry claims and disease references: "بيو نيوتريشن جاوت اوت للنقرس" (gout), "بودي بيلدر إنسو-شوجر كنترول", "إمباور نيوتريشن سليم لحرق الدهون وإنقاص الوزن", "اوبتي تيكت فيرم أند تايتلي + حزام الشد والتنحيف". Discounts of "-82%" and "-70%" on house-adjacent brands suggest inflated list prices. Both are openings for a plain-spoken, honestly priced competitor.

