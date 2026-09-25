# OptimalX owner checklist (draft, 2026-09-18)

Everything the theme cannot do for you, in the order that unblocks the most. Each item says where in the dashboard it lives and what the theme does once it is done.

## A. Dashboard data the theme reads (do these first)

1. Categories. Create the tree exactly as in research/FINAL-catalogue.md section A (10 type categories, 5 protein subcategories, 4 utility categories, 6 goal collections). Dashboard: المنتجات > التصنيفات. Set each category's SEO URL to the Latin slug in the table (for example protein, whey-protein, goal-energy). Then assign every mock product to its primary type category and its goal collections (the mapping is the "categories" field per item in batch-0*.md and column primary_category_slug / goal_slugs in the CSV). Until this is done, the goal pages and category links in the theme fall back to search links. A script can do all of this for you, see docs/build/store-data-runbook.md (preflight, then `node scripts/salla-categories.mjs --plan` to preview, `--apply` to write).
2. Brands. Create the brands in research/FINAL-catalogue.md section B (dashboard: المنتجات > الماركات) and set each product's brand. Same script as item 1 covers this with `--brands --assign`; see docs/build/store-data-runbook.md.
3. Product options. The API used to create the mock products cannot add options; add flavours and sizes from the "options" field per item (batch-0*.md) in the dashboard if you want variant pills on the mock PDPs. Optional for the mockup.
4. Booking products (OX-045, OX-046, OX-047 once created). Dashboard: المنتجات > the product > جدولة الحجوزات: choose "أيام وأوقات", set working days, two-hour windows around prayer times, capacity 1 per slot, buffer 10 minutes, a late-booking limit of 12 hours, and exclude Fridays before Asr. Max 12 bookable slots per day is achieved by the windows you enable. Add the intake form fields (نموذج الطلب) from research/FINAL-content.md section 4; do NOT add medication, conditions or body-measurement fields.
5. The 50 SAR video-consultation credit: create a coupon rule in التسويق > الكوبونات and paste its code into the theme setting "consultation_credit_note" (or leave the text generic until the coupon exists).
6. Store branding: the theme is built for Cairo weights 400/600/700/800 self-hosted; in الإعدادات > الهوية change the font to "خط مخصص" (upload the three woff2 files from public/assets/fonts) so the Google Fonts link stops loading. Also repair the font_name value in the same screen (it is stored as ''Cairo'' with doubled quotes). Do not change the brand colour (#EE4D22).
7. Registration: CR number, VAT number, Maroof. Enter them in الإعدادات and copy the numbers into the theme settings cr_number, vat_number, maroof_url. The footer trust line stays hidden until all three exist.
8. Branch: add building number, additional number, short address, district, and real opening hours (الإعدادات > الفروع). The branch page reads the theme settings branch_address and branch_hours; keep both in sync with the dashboard.
9. Store description: change "اوبتيمال اكس للمنتجات الصحية." to the one-line MSA description in research/FINAL-content.md (about section), or the theme's default.
10. Payments and shipping: enable mada, Apple Pay, tabby/tamara, Visa/Mastercard and the carriers; set the free-shipping rule to 299 SAR (or change the theme setting free_shipping_threshold to match).
11. Languages: enable English in الإعدادات > اللغات only when the English product names and descriptions are entered (the mock catalogue's English twins are in the CSV); the theme then serves /ar and /en automatically.
12. Static pages: create About, Contact, Shipping, Returns, Privacy, Terms in الصفحات using the copy in research/FINAL-content.md section 6, then add them to the footer menu.
13. Blog: create the blog categories (أدلة) and paste the three full guide articles from research/FINAL-content.md section 7; outlines for the other nine are ready to write.
14. Menus: after categories exist, the header menu can be built via the API (the conductor will do it) or by hand: تسوق حسب الهدف (6 goals), التصنيفات (10), الخدمات, الأدلة, الفرع, من نحن.
15. Maintenance mode: the domain optimalx.com.sa currently shows the construction page. Turn it off only after the React theme is installed and the catalogue is real.

## B. Assets to generate (the exact list with sizes and prompts is DIRECTION.md section 8)

Logo SVGs (full, compact, mark, reversed), hero athletes (desktop 1600x1000 and mobile 900x1200, two or three variants), 10 category tile photos 800x600, 3 services photos 900x675, 2 branch storefront photos 1600x1200 and 1200x900, OG image 1200x630, favicon and app icons from the mark, the category and trust icon sprite (or approve the ones the build ships), product photos for the 21 items without a usable image (list in research/FINAL-catalogue-tail.md section G), optional hero loop video.

## C. Theme publishing (docs/deployment-runbook.md)

Create the GitHub repository, push the theme, register it as a private React theme in the Salla Partners Portal, submit for review, install on store 1888890798, set it as the active version, configure the home blocks (defaults are pre-filled), then switch maintenance off.

## D. Legal (before public launch)

SFDA registration display, PDPL privacy and consent text, SCFHS scope for the written-question service, halal wording, the subscription scope. All marked "needs a lawyer" in the content.

## E. Added 2026-09-18 (conductor)

16. Product photo alt text: the image API rejects the alt field, so the 27 photos attached by the API have no alt text. Add the product name as alt in المنتجات > the product > الصور, or wait for the real product sheet import which carries alt per image.
17. Bundle members (updated 2026-09-24, S9d): OX-041 حزمة البداية is now the theme's one real bundle, removed from every product rail and grid, offered on the OX-001/OX-015/OX-028 product pages, and its own page already renders those three as its members (from the theme's own content map, `app/content/bundles.ts`, since the API carries no `consisted_products` yet). The theme is wired for exactly this trio; the dashboard step that is still yours is to open OX-041 and attach OX-001, OX-015 and OX-028 as its bundle items and set the bundle price, so the platform's own `consisted_products` and cart pricing take over from the content-map fallback.
18. Stray scaffold inside the repo: a second Salla CLI scaffold was generated at optimalx/optimalx (its own .git, node_modules, "Initial commit") and the last commit 5464b3a recorded it as a gitlink. Before the theme is pushed to GitHub it must be removed: `git rm --cached optimalx` then delete the folder; the conductor lists this in the pre-commit cleanup and will not delete it without your go-ahead.
19. Copy placeholders (research/FINAL-content.md sections 4 to 6): {HOURS_WEEKDAY} {HOURS_FRIDAY} {HOURS_SATURDAY} {HOURS_RAMADAN} {NEXT_OPEN} {LANDMARK} {PICKUP_READY_HOURS} {PICKUP_HOLD_DAYS} {CARRIER} {SHIP_FEE} {RETURN_DAYS} {REFUND_DAYS} {SOCIAL_HANDLES} {EMAIL_USER}. They map to theme settings; the branch hours table and the pickup lines stay hidden until the settings are filled, and the shipping and returns intros render without the fee and day counts until they exist.
20. Lawyer items before the intake form and privacy page ship: the PDPL consent sentence, the privacy intro, and the mandated medical line "للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك." wording. Returns intro needs your sign-off against the Ministry of Commerce e-commerce rules.
21. Services claims gates: the written-question channel must be staffed before "نجيب على سؤالك المكتوب خلال 24 ساعة عمل" renders, and the 50 SAR first-order credit needs the coupon in the dashboard (items 5 and 11). Until then the theme shows the neutral lines the content marks as fallback.
22. Guides: three full articles are ready (creatine, protein timing, whey vs isolate); nine outlines remain (FINAL-content.md section 7). Paste the three into المدونة first.

## F. Updated 2026-09-22 (conductor): what changed in the owner's path

23. **Categories and brands (supersedes items 1, 2 and 14).** The script path is ready: install app 755989931 on store 1888890798 with the scopes `categories.read_write`, `brands.read_write`, `products.read_write` and the redirect URL `http://localhost:8787/callback` (Partners > the app > OAuth), then on this laptop run `node scripts/salla-auth.mjs`, `node scripts/salla-categories.mjs --plan` (preview, no writes) and `node scripts/salla-categories.mjs --apply --brands --assign`. It creates the 25 categories with the Latin slugs, assigns every product to its leaf, its parent and its goals, creates the brands, writes `docs/build/taxonomy-ids.json` and appends `docs/build/store-write-log.md`. Then `pnpm gen:taxonomy-ids` and a push. The dashboard alternative is `docs/build/store-data-runbook.md`. Until this runs, the home cards and category links fall back to search results; the theme is deployable either way.
    - **The brand data `--brands` loads (derived from the 47-product catalogue, owner review 2026-09-23 (late), item 4; the full mapping with product ids is in `docs/build/progress/S4a.md` and the offline preview's own copy is `fixtures/store/overlay/brands.json`):** NOW Foods (ناو فودز, 7 products), Optimum Nutrition (اوبتيموم نيوترشن, 7), Sports Research (سبورتس ريسيرش, 4), MuscleTech (مسل تك, 3), Dymatize (ديماتيز, 2), Myprotein (ماي بروتين, 2), BlenderBottle (بلندر بوتل, 1), BSN (بي اس ان, 1), Centrum (سنتروم, 1), EVLution Nutrition (ايفليوشن نيوترشن, 1), Ghost (جوست, 1), Grenade (جرينيد, 1), Isopure (ايزوبيور, 1), Nature's Way (نيتشرز واي, 1), NeoCell (نيوسيل, 1), NOW Sports (ناو سبورتس, 1), Nuun (نون هايدريشن, 1), Olimp Sport Nutrition (اوليمب, 1), Quest Nutrition (كويست, 1), Thorne (ثورن, 1), Vital Proteins (فيتال بروتينز, 1), 21 brands, 40 of the 47 products (the four service products, the gift card, the PDF guide and the OX-041 starter bundle carry no supplier brand). `scripts/salla-categories.mjs`'s own `BRAND_SOURCE` already names 20 of these 21 with the same English spelling; only NOW Sports is new to that list (`ناو سبورتس` prints as its own brand suffix on OX-not-listed SKU 74248730, distinct from `ناو فودز`/NOW Foods in the same file), add it there before running `--apply --brands` so the dashboard tree matches this list exactly.
24. **English (supersedes item 11).** The theme's English is complete (every key has a true translation, `/en/...` renders with English heads). Enable English in الإعدادات > اللغات when the English product names and descriptions exist; the store settings tell the theme, nothing to change in code. Verified 2026-09-22: `en` is configured but disabled on the store.
25. **Partners theme 1938498306 (supersedes section C).** The repository is connected (`shekeww/optimalx`, branch `main`). Before submitting: set installation to Private for store 1888890798, drop the price from 3000 SAR to Salla's 250 SAR minimum (you pay it once for your own store), add three 1366x768 screenshots, a preview store and the support contact, then "Complete Theme publication". Salla reviews every submission, private or not; after approval install it from تصميم المتجر and press Publish version. The Salla CLI `salla theme preview --store 1888890798` gives a preview on the real store before approval.
26. **Stray theme version.** The store carries an inactive "تنسيق كليك رقم (1)" version (1589489348) next to the active Raed one; delete it from تصميم المتجر so nobody publishes it by mistake.
27. **Repository hygiene.** Your commit tooling pushed 83 reference images (128 MB) under `references/` into `main` on 2026-09-22; they are now untracked and ignored, but the history still carries them. If Salla's build rejects the repository size, the fix is `git filter-repo --path references --invert-paths` plus a force-push, which needs your go-ahead.
28. **Owner decisions still open:** the hero H1 stays "ما هدفك اليوم؟" (KOS forbids dialect headings; your preferred "وش هدفك اليوم؟" would be an initialed exception, see `docs/brand/voice-ksa.md` §6.2); the Google rating line stays hidden until you initial the claims source; the "مضمون"/"100%"/"شحن سريع" wording from the reference mockups was not adopted (claims law).

## G. Added 2026-09-23 (S8h): the newsletter form needs your email service's URL

29. **Newsletter form action URL.** Salla's engine has no built-in mailing-list
    feature (checked directly against the SDK and the reference theme, see
    `docs/build/progress/S8d.md` §2.1), so the home page's newsletter form
    posts straight to whatever email service you use. It stays hidden on the
    live store until you fill in two theme settings under "خيارات اوبتيمال
    اكس": `newsletter_action_url` (the form's submit address) and, if your
    service expects a field name other than `EMAIL`, `newsletter_email_field`.
    - **Mailchimp:** in your Audience, open "Signup forms" then "Embedded
      form". Mailchimp shows you a block of HTML; find the `<form
      action="https://…list-manage.com/subscribe/post?...">` line and paste
      that full URL, exactly as shown, into `newsletter_action_url`. The
      email field in that same HTML is named `EMAIL`, the setting's default,
      so `newsletter_email_field` can stay as it is.
    - **Klaviyo:** create a Klaviyo Form of type "Embed", publish it, and use
      the form endpoint Klaviyo gives you the same way - paste the action URL
      into `newsletter_action_url`, and set `newsletter_email_field` to
      whatever Klaviyo names the email property in that form's own HTML
      (check the embed code it gives you).
    - **Any other service** (Brevo and similar): the same rule applies - the
      URL is whatever `action="…"` your service's own embeddable signup form
      HTML shows, and the field name is whatever `name="…"` that same HTML
      puts on the email input.
    - **Test it with a real address** after saving: submit the form on the
      live page and confirm the address lands in your email service's
      audience/list, since the theme cannot read the response back (the
      request is a cross-origin `no-cors` POST by design - see
      `docs/build/progress/S8h.md`).
    - The form renders only once `newsletter_action_url` is a real `https://`
      link; an empty or `http://` value keeps the whole band hidden, the same
      way it behaves with `show_newsletter` off.

## H. Added 2026-09-24 (S9f): English product data on /en, what is now automated

Owner report: "in english version, products names and data are appearing in arabic." The theme itself was already correct, the engine sends `accept-language: en` on every call and the live Salla API returns a product's translation when the merchant has one. Two things were missing; item 11/24 below is updated:

30. **Item 11/24 update, the CSV twins are now writable in one script, not by hand.** `node scripts/salla-product-translations.mjs` (dry run by default, no network call) reads every product's English twin from `docs/build/research/optimalx-catalogue.csv`, gates each one through the same copy and claims checks the locale files are held to, and prints a table of what it would write. Run it with `--apply` (needs `node scripts/salla-auth.mjs` first, same as item 23) to actually write `translations.en` (name, description, subtitle) to every "ready" product via Salla's Update Product endpoint, then read each one back with `accept-language: en` and confirm it matches. As of 2026-09-24: **43 of the 47 products are ready to write**; 4 (OX-021, OX-023, OX-026, OX-035) are held back because their English description cites a third-party "best-selling" ranking, which trips the same claims gate as an unearned superlative about this store, reword those four in the CSV (drop the ranking claim) before they can ship. The script also writes `translations.en.name` for the 25 taxonomy categories, but only once they exist in the store (item 23 `--apply` first); today it reports "skipped, categories not created yet" rather than guessing an id.
31. **Still yours: turning English on.** Once `--apply` has run (or you have entered the translations by hand), enable English in الإعدادات > اللغات as item 11 always said, the store settings tell the theme, nothing to change in code. Until English is entered for a given product, `/en` honestly shows that product's Arabic name (the same thing the live Salla API does for any untranslated field), which is correct behaviour, not a bug to report again.
32. **The offline preview now shows this correctly too.** `OFFLINE_LANGS=ar,en pnpm preview:offline` renders `/en` with the real English catalogue (`fixtures/store/overlay/products.en.json`, generated by `node scripts/gen-products-en.mjs`, same CSV, same gate, same 43/4 split) instead of Arabic, see `docs/build/offline-preview.md`.

## Poster files and the corner cuts (S8i, 2026-09-24)

Every card in the "اكتشف أكثر" rail, offer poster included, is clipped on the diagonal at the physical top-right and bottom-left (a 40px-tall, 27px-wide triangle each). Keep the logo, the tagline and any text in the six poster files clear of those two corners; the cut is in the theme, not the file, so it cannot be turned off per poster.

## Branch listing values (2026-09-24)

Type these into the theme settings in the Salla dashboard (they are already in the offline preview overlay and in the Shopify theme's initial values). Each one turns on the surface that reads it; an empty one keeps that surface hidden.

| Setting | Value |
|---|---|
| google_place_url | https://maps.google.com/?cid=2204940348214661233 |
| google_rating | 5.0 |
| google_review_count | 80 (as shown on the listing on 2026-09-24; update the count and the date together whenever you check it) |
| google_verified_at | 2026-09-24 |
| branch_address | شارع جبار بن صخر، حي الخالدية، المدينة المنورة 42317 |
| branch_hours | السبت إلى الخميس: 9:00 إلى 24:00 (one line) and الجمعة: 16:00 إلى 24:00 (second line) |
| branch_map_url | https://maps.google.com/?cid=2204940348214661233 |
| whatsapp_number | 966553524524 if the listing's phone is the WhatsApp line; otherwise the WhatsApp number in the same digits-only form |

Also: send the original, full-size file of the storefront photograph (the night shot of the lit facade). The copy on disk is 415 px wide, which is enough for the small slots it fills today and too small for a wide panel.

Also (S9c, 2026-09-24): send a wider shelves photograph. The current file is 512x537 (nearly square), and the branch gallery's cover shape crops every photograph to 16:10; on `shelves` that crop keeps the labelled shelf row (المكملات، الفيتامينات وغيرها) in frame by anchoring to the top, but a wider original (the same shot pulled back, or a proper 16:10 frame) would let the crop show more of the aisle instead of losing the lower shelves.

## The six ad covers and the claims they carry (2026-09-24)

The six poster files you sent are live in the "اكتشف أكثر" rail and on /offers as placeholders "until you replace them". They are your own artwork, so the theme shows them as sent, with neutral alt text. Before launch, note that the text baked into several of them contradicts rows the claims source bans (docs/build/research/FINAL-claims-source.md §3, SFDA advertising rules), and the theme cannot gate text inside an image:

| File / slot | Baked-in text that a reviewer would reject | Why |
|---|---|---|
| Big Ramy creatine (bigramy-creatine) | "قوة أكبر / أداء أفضل / تعافٍ أسرع", "قوة تصنع الأبطال" | outcome promises; "أسرع" is on the banned list |
| Buy 1 get 1 (weekly-picks, inbody-consult) | "يدعم حرق الدهون", "يعزز عملية الأيض", "الأكثر مبيعا" | fat-burning and metabolism claims; "الأكثر مبيعا" needs real order data |
| Any two for 196 (bundle-her) | "الأكثر مبيعا", "يساعد على التحكم في الشهية" | same; an appetite claim is a health claim |
| 3-month subscription 696 (weight-subscription) | "100% كاش باك", "نتائج أخف" | a 100% figure and a result claim; the cashback must be exactly the store credit rule in the small print |
| Flex duo 196 (bundle-him) | none beyond "تنوع يناسب يومك" | fine |

Replace the chips on the first four before launch (keep the offer, drop the outcome and superlative lines), or send versions without them. The subscription poster also lists InBody as included: that matches the theme's own gated line only while the "InBody measurement included" setting stays on. The two "buy 1 get 1" files are the same artwork in two slots; the inbody-consult slot links to the consultation product, so its poster should become the consultation offer when you have one.


## Registration values (2026-09-25): mockups in place, real values pending

The owner asked for mockups until the real values arrive. Set on both platforms (Shopify config/settings_data.json; the Salla preview overlay fixtures/store/overlay/settings.json, the Salla dashboard still empty): `cr_number` 4650000000 (a Madinah-format placeholder) and `maroof_url` https://maroof.sa/ (the portal root, no listing). `vat_number` stays empty on purpose: it also switches on the "prices include VAT" line on product pages and the tax line in the cart, which must only appear once the store is VAT-registered. Replace the two mockups with the real CR number and the store's own Maroof listing before the password comes off the store.


## Open owner items after the parity review (2026-09-25)

The Shopify store is the live deployment on optimalx.com.sa. These items came out of the parity review of both platforms and need a decision or a value only you hold; the theme is ready for each of them.

| Item | What the theme does today | What you decide or provide |
|---|---|---|
| Store phone and email | Done 2026-09-25: the theme settings store_phone (+966553524524) and contact_email (contact@optimalx.com.sa) feed the contact page, the FAQ contact row and the structured data | Also set the same email as the store contact email in Settings, Store details, because Shopify uses it as the reply address on order emails |
| Shipping and markets | Checked 2026-09-25 after your message: the store still ships to 29 countries (Egypt, the Emirates, Europe, the US and others) and Saudi Arabia is not among them, so a Saudi address cannot check out yet | In Settings, Shipping and delivery, add a Saudi Arabia zone with its rates and remove the other countries; in Settings, Markets, keep Saudi Arabia as the only active market |
| Inventory | No product tracks stock, so any quantity is accepted | Turn on inventory tracking with real counts when you have them; the stepper then caps at the available stock |
| Policies | The refund policy text (14-day returns, refund within 24 hours of the returned product reaching the store, sealed products only, gift cards not refundable) is ready in both languages in the Shopify repo, docs/policies/refund-policy.md; the app cannot write policies | Paste it into Settings, Policies, Refund policy (and the English under Languages, Translate), or add the write_legal_policies scope to the app so it can be published for you; terms, shipping and contact policies still need your terms |
| The "جديد" badge | A card shows the badge only for a product tagged `new` inside its first 30 days | Tag the launch products you want badged (Products, Tags) |
| The weight-subscription poster | Shown as sent; the baked-in "100% كاش باك" and "نتائج أخف" lines are claims the review rejects | A version without the result line and with the cashback rule stated exactly, or drop the poster |
| Consultation credit | The 50-riyal first-order credit was removed from the video consultation copy and the services page description on 2026-09-25, because no coupon backs it yet; the theme prints the credit line only when the credit note setting is filled | Confirm the credit rule (amount, which orders, expiry) and create the coupon; the line then goes into the setting |
| Gift card | Done 2026-09-25: the gift card sells 100, 200 and 500 riyals (Value in English) with the brand lockup as its image | A gift card visual when you have one |
| Google reviews | Done 2026-09-25: the "شارك تجربتك" button opens Google's write-a-review form for your listing (place ID ChIJl_TCsg2VvRURcdBCfpCFmR4) | Nothing |
| Store description in the admin | Online Store, Preferences still reads "برامج خسارة الوزن، تحليل InBody"; the theme replaces it on the home page, but Shopify shows it in its own surfaces (link previews of the store, the Shop app) | Change "تحليل InBody" to "قياس InBody" and drop the weight-loss wording, per the claims rules |
| The password page message | The locked storefront carries its own copy and hides the message typed in Online Store preferences (the password section's "Show the store message from the admin" setting is off): that message says "تحليل إن بودي" and "InBody analysis", mixes Arabic and English in one paragraph and writes "قريبا" with a diacritic | Leave it off, or rewrite it with one language per line and the InBody test as a measurement (قياس), then tick the setting |
