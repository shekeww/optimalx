# OptimalX design benchmarks: visual and interaction reference for a premium, trust-led supplement storefront

Prepared for the creative director setting OptimalX's design direction.
Research date: 2026-09-17. Every fact below carries the URL it was read from and the access date. Hex values marked "extracted" were read from the site's own CSS or branding metadata; values marked "observed" are inferred from page structure or copy and should be re-sampled before use in tokens.

Status: IN PROGRESS (written incrementally; sections fill in as research completes).

## 0. Method

- Sources: each brand's live storefront homepage, read on 2026-09-17 via Firecrawl scrape in two formats: "branding" (which reads the page's computed CSS for colours, font families, sizes, radii and button styles) and "markdown" (page structure and copy). WebFetch was used for documentation pages.
- Font sizes are the extractor's reading of the largest h1/h2 on the homepage at desktop width and are approximate.
- Where the extractor's reading conflicts with the page's own colour-scheme declaration, both are reported and the conflict is flagged.
- No traffic, revenue or market statistics are stated. Where a brand states a number about itself on its own page, it is quoted as that brand's claim, with the URL.

## 1. Brand-by-brand benchmarks

Reading key: "extracted" = value read from the site's own CSS/branding metadata via Firecrawl's branding format. "observed" = inferred from page structure or copy, not measured.

### 1.1 Transparent Labs
Source: https://www.transparentlabs.com/ (accessed 2026-09-17)

- Palette (extracted): background #FFFFFF; text #000000; accent/link #1B73B3 (mid blue); secondary button #111111 on white; input border #2A4756. Meta theme-color #fff, colour scheme light.
- Type pairing (extracted): Aeonik for headings, Neue Haas Unica for body. h1 about 40px, body 18px. Base radius 6px; primary button square (0px), secondary 4px.
- Layout and density (observed): a dense Shopify catalogue. The mega-menu lists Bestsellers plus five goal groups (Protein; Build Muscle and Recover; Pre-Workout; Improve Performance; Health and Wellness). Homepage: bestseller carousel, goal grid, then a long "Find Your Clean Supplements" grid.
- Hero (observed): typographic headline "Hold your supplements to a higher standard." with two CTAs, "Find my Supplement Routine" (a quiz) as primary and "Shop All Products" as secondary.
- Card (observed): product render on white, "Best Seller" badge, name, review count ("7686 Reviews"), flavour count ("24 Flavors"), "Shop". Cards carry no science copy; the trust work is done by section bands.
- Photography vs illustration (observed): product renders dominate; line icons for the four trust pillars.
- How they show science and clean (observed): four icon badges (Natural and Grass-Fed Ingredients; Complete Label Transparency; Clinically Dosed Formulas; Third Party Lab Tested); a section titled "What does 'Clean' really mean?" that defines the term instead of asserting it; a "Supporting You With Science" numeric band and a "58,934 Verified 5 Star Reviews" band (their claim). The move worth borrowing is the definition section: they explain the word before using it.
- Motion (observed from structure): carousels; no scroll-driven effects evident in markup.
- Dark vs light: light only.
- Mobile nav (observed): drawer with the same goal groups; cart drawer shows free-shipping progress ("You're $99.00 away from free shipping").

### 1.2 Momentous
Source: https://www.livemomentous.com/ (accessed 2026-09-17)

- Palette (extracted): primary and accent #FF5E03 (orange); secondary #EDE5D8 (warm sand); background #FFFFFF; black text. Primary button orange with black text, 6px radius; secondary white with black text, 4px; inputs #F1F1F1 at 8px. Meta theme-color #fff.
- Type pairing (extracted): PP Neue Montreal Medium for headings, Helvetica Now Pro Text for body. h1 48px, display h2 up to 85px, body 16px.
- Layout and density (observed): medium. Navigation is a three-column mega-menu: Shop by Goal (Sleep; Cognitive Function; Athletic Performance; Hormone Support; Foundational Health), Shop by Category (Supplements; Sports Nutrition; Stacks; PR Lotion; Vegan; Travel Size), Best Sellers (six named products). A separate "Learn" menu holds The Momentous Standard, Routine Guide, Trusted Experts, Blog, Product Success Guides and Certificate of Analysis.
- Hero (observed): product-led. Two announcement strips, then product hero cards (Nightly Sleep; Momentous Creatine) with one formula sentence and "Buy Now". Brand line "Performance For Life".
- Card (observed): render, name, short benefit sentence, flavour selector ("Flavor: Unflavored / Chocolate / Pure Cinnamon / Lemon Lime"), Buy Now.
- Photography vs illustration (observed): renders on pale backgrounds; expert portraits; no illustration.
- Science and clean (observed): "Not The Industry Standard. The Momentous Standard." with three sub-heads, Science, Sourcing, Certification; an expert-partner band ("x Dr. Stacy Sims", "x Dr. Kelly Starrett", "x Dr. Andy Galpin", "x Jordan Mazur"); Certificate of Analysis as a first-level nav item. COA-in-nav is the strongest single trust device in this whole set. Note: the expert band relies on professional titles, which OptimalX's rules exclude; the COA and Standard pages do not.
- Motion (observed from structure): carousels only.
- Dark vs light: light only; sand secondary gives warmth without a dark mode.
- Mobile nav (observed): drawer with "Shop All" and "Build My Routine" buttons at top, then Best Sellers, Shop by Goal, Shop by Category groups.
- Relevance: the closest palette analogue to OptimalX (orange accent on white with a warm neutral). Their orange is #FF5E03 against OptimalX's #EE4D22; theirs is lighter and yellower.

### 1.3 Thorne
Source: https://www.thorne.com/ (accessed 2026-09-17)

- Palette (extracted): primary #71897E (sage grey-green); accent/link #2F8B68 (green); secondary #0F172A (near-black navy); text #000000; primary button #222222 white text at 4px; secondary white with #040404 text. The extractor reported background #000000 while also reporting colour scheme "light"; treat the background reading as an extraction error and re-sample (the page reads as white with dark bands).
- Type (extracted): one family, Visuelt Pro, for everything. h2 about 52px, body 14px. Base radius 6px, inputs square.
- Layout and density (observed): low density above the fold, then a product row with names and prices directly under the hero (no badges, no review counts on the homepage cards).
- Hero (observed): typographic. "Performance, proven." then "Elevate your routine with clinically formulated, NSF Certified for Sport supplements in precision dosages." CTA "Shop Sports Performance".
- Card (observed): render on white, name, price. Nothing else. The sparseness reads as confidence.
- Photography vs illustration (observed): lifestyle photography for category tiles (a man drinking from a transparent bottle; a woman lying in shade), renders for products, no illustration.
- Science and clean (observed): a four-pillar band (Science over hype; Quality you can verify; Rigor in every step; Trusted at every level), each with one plain sentence; a "Trusted by 100+ professional and U.S. National teams" logo band (UFC, Team Penske, USA Triathlon); a certification band (NSF, TGA "A rating", GRMA); and an FAQ on the homepage with four questions including "Why are Thorne products more expensive than other supplements?" Answering the price objection on the homepage is a device worth copying.
- Motion: none evident in structure.
- Dark vs light: light primary with dark image bands; the "Preparation / Game Time / Recovery" product trio sits on imagery.
- Mobile nav (observed): standard drawer; an AI assistant ("Taia") is offered as a chat entry.

### 1.4 AG1
Source: https://drinkag1.com/ (accessed 2026-09-17)

- Palette (extracted): primary and accent #46DE46 (bright green); secondary #0C3D3D and text #023D3D (deep teal-green); background #FFFFFF. Primary button green with black text, 32px pill; secondary white with teal text, pill; inputs pill (99px). Base radius 2px for surfaces, so the system is "sharp surfaces, pill controls".
- Type (extracted): Diatype for body and headings, Diatype Mono for labels. Display h2 up to 96px; body 14px. Uppercase mono eyebrows ("QUALITY STANDARDS", "DAILY NUTRITION TO MEET YOUR GOALS", "WITH CREATINE") sit above every section title.
- Layout and density (observed): long single-column narrative page; promo strip first ("ENDS SEPT 30"), then product intro, then a trust icon row (NSF Certified for Sport; Backed by industry-leading research; Trusted by leading scientists and athletes; No-risk 90-day guarantee).
- Hero (observed): promo-led then product render. "Check back in to your routine." with a discount code; second hero "It's AG1, now with creatine, and more."
- Card (observed): three comparison cards (Essentials Gummies; Next Gen; Pro) with price per month and per serving, flavour note, a bulleted benefit list and a "Supplement Facts" disclosure link. Then a full comparison table (Format, Ingredients, Serving Size, NSF, Multivitamin ... Price per month).
- Photography vs illustration (observed): renders; small line icons; celebrity and expert portraits.
- Science and clean (observed): "Tested for those that test themselves." quality section; ingredient-category cards labelled in mono caps (CREATINE MONOHYDRATE / Amino Acids; MAGNESIUM / Vitamins and minerals); an inline Supplement Facts panel with the full table; a "cost versus buying separately" table. The comparison table and the inline facts panel are the strongest "show the label" devices in the set. Warning: the testimonial band leans on professional titles ("DR. ANDREW HUBERMAN, NEUROSCIENTIST") and on outcome language ("I feel great"), both outside OptimalX's rules.
- Motion: none evident in structure.
- Dark vs light: light; deep teal text gives a "dark ink on white" feel without a dark mode.
- Mobile nav: not captured (long-form landing; header nav minimal).

### 1.5 Huel
Source: https://huel.com/ (accessed 2026-09-17)

- Palette (extracted): primary and accent #E1F8E0 (pale mint) with button border #95E392; secondary #393328 (warm near-black brown); text #0C0C0D; link #C7F1C5; background #FFFFFF. Buttons full pill (9999px); inputs 8px with #6E6E6E border. Base radius 12px. Built on Tailwind.
- Type (extracted): Suisse Intl for everything plus Suisse Intl Mono. Body 16px.
- Layout and density (observed): medium-high. Opens with "Food to fuel your goals" and four goal tiles with photography (Lose weight; More protein; Eat healthy; On-the-go), then a "Shop your way" row of six small icon-and-label chips (Bestsellers; Powdered Meals; Bundles; Ready-to-drink; Hot Instant Meals; Greens and Superfoods).
- Hero (observed): typographic plus tile grid; no single hero image.
- Card (observed): render with a lifestyle image on hover, bold name, one-line descriptor, two spec chips ("40g protein", "400 cal per meal"), "From $45 / $2.65 per meal", "View product". Per-serving price on the card is a strong honesty device.
- Photography vs illustration (observed): renders and raw-ingredient photography (scattered peas, oats, coconut); no illustration.
- Science and clean (observed): a six-item "Benefits of Huel" strip (100% Complete; Save Time; Save Money; No Bullshit; Taste Guaranteed; Easy); "Why Huel works" with "See the science" and "100+ peer-reviewed studies" (their claim); a press-logo quote band (Vox, GQ, Wired, Men's Health). Tone is blunt and colloquial.
- Motion (observed): hover image swap on cards.
- Dark vs light: light; warm dark-brown text and mint accent avoid clinical coldness.
- Mobile nav (observed): the six-chip "Shop your way" row doubles as mobile category nav.
- Warning: "Lose weight" is a first-level goal tile. OptimalX's rules exclude weight-loss promises, so the tile taxonomy cannot be copied as is.

### 1.6 Myprotein
Source: https://www.myprotein.com/ (accessed 2026-09-17)

- Palette (extracted): primary #003942 (deep teal); accent #D9420F (orange-red); background #FFFFFF. Primary button #D9420F white text, square (0px); secondary white pill (32px) with #003942 border; inputs pill on #F2F2F2. The extractor read text colour as #A22452 (magenta); this is almost certainly the sale-price colour, not body text. Meta generator: Astro v5.15.8; Tailwind.
- Type (extracted): Figtree for everything; h2 36px, body 16px.
- Layout and density (observed): very high. The top bar carries four promos at once (next-day delivery; app discounts; referral credit; "Over 220k reviews and 4.4 rated" Trustpilot). Below it a countdown banner ("IMPACT WEEK CLOSING DOWN | 35% OFF ALMOST EVERYTHING | ENDS IN ..."), a banner carousel, a six-tile deals grid, product carousels, then activewear.
- Hero (observed): promotional image banners, not brand storytelling.
- Card (observed): 450x450 crop, name, "discounted price £11.99 / Was £29.99 / Save £18.00", "QUICK BUY", and a promo strip line under every card.
- Science and clean (observed): trust appears as image tiles near the footer ("Proof not promises. If it's on the label it's in the product"; "Rigorous testing across the range"; "Europe's #1 Sports Nutrition Brand" footnoted to "Source Euromonitor International Limited; Consumer Health 2026 edition, retail value sales (RSP), all retail channels, 2025 data").
- Motion: countdown timer, carousels.
- Dark vs light: light.
- Mobile nav: not captured in main content.
- Relevance: the discount-led template OptimalX should be visibly unlike. Its one good habit is footnoting the market claim to its source.

### 1.7 Bulk
Source: https://www.bulk.com/uk/ (accessed 2026-09-17)

- Palette (extracted): primary #0E46AE (blue); secondary #E42828 (red); accent/link #15884C (green); text #111111; background #FFFFFF; product images composited on #F6F6F6 (the image CDN URL carries bg-color=246,246,246). Primary button #111111 white text, 28px pill. Base radius 10px.
- Type (extracted): Proxima Nova for everything; body 16px.
- Layout and density (observed): high. Full-bleed promo image, "Shop Now", then a row of ten category chips (Protein Powder; Collagen; Isolate; Creatine; Pre-workout; Protein Snacks; Clear Protein; Vegan Protein; Hydration; Greens), then three product carousels titled Bestsellers, Trending and Just For You.
- Hero (observed): promo image banner.
- Card (observed): numbered carousel card with "Quick Buy", badge (Best Value / New), bold name, variant line ("Vanilla 900g"), review count "(8.2k)", strike-through price, and a promo line ("September Savings: Up to 75% off - no code required").
- Science and clean: none on the homepage. Shop By Goal tiles include "Lose weight" (excluded for OptimalX).
- Motion: carousels.
- Dark vs light: light.
- Mobile nav: chip row doubles as category nav.
- Relevance: what a pure catalogue looks like with no editorial layer. The #F6F6F6 image plate is a cheap, useful consistency device.

### 1.8 Ritual
Source: https://ritual.com/ (accessed 2026-09-17)

- Palette (extracted): primary #142B6F (navy); secondary #64748B (slate); link #CBD5E1; secondary button #FFF7CC (pale yellow) with navy border; background #FFFFFF. Buttons 25px pill. Inputs square, transparent. Tailwind.
- Type (extracted): CircularXX for everything; h1 66px, h2 32px, body 16px. Signature device: an italic word inside an otherwise upright heading ("Welcome to *Peri*dise", "The future of health is *clear*").
- Layout and density (observed): low to medium. Video hero, a starter-set banner, a six-card "New and Bestselling" row, a six-item trust strip, then two science sections each with a video.
- Hero (observed): full-width video with headline and two CTAs (Shop Perimenopause; Shop All).
- Card (observed): lifestyle-ish product tile, badge (New / Best Seller), bold name, category subtitle ("Hormone Balance Support"), "From Sale price $31.20 Regular price $39.00", "Add".
- Photography vs illustration (observed): video and lifestyle photography; product tiles are photographed, not rendered; team portraits.
- Science and clean (observed): a trust strip of six short facts (2.6 Billion Capsules Sold; Clean Label Project Certified; 100% Ingredients Made Traceable; $5M Investment in Clinical Studies; Formulated by Dietitians and Scientists; Vegan and Non-GMO), all their claims; "Our radical idea: supplements should work."; "'Clean' isn't clear enough. We're traceable." with "Check Our Ingredients"; a leadership band with photos and credentials; a "For Skeptics, By Skeptics" UGC carousel. The "clean isn't clear enough" line is the best example in the set of reframing a category cliche.
- Motion (observed): autoplay video heroes; carousels.
- Dark vs light: light; navy ink and pale yellow give warmth.
- Mobile nav: cart drawer includes a "Need a place to start?" starter-set prompt.
- Warning: leadership band uses professional titles (PhD, MD, RD), excluded by OptimalX rules.

### 1.9 Legion
Source: https://legionathletics.com/ (accessed 2026-09-17)

- Palette (extracted): primary #81C784 (soft green); accent #27A2FF (sky blue) used for links and the primary button (white text, square 0px); secondary button #E48310 (orange, white text, square); background #FFFFFF; placeholder text #CFD0D1. Base radius 3px. No meta theme-color.
- Type (extracted): Wonder Unit Sans for body plus proxima-nova; h1 and h2 about 34px, body 15px.
- Layout and density (observed): very high. Two stacked sale strips ("Labor Day sale! Buy one get one 50% off", "Flash sale! BOGO 75% off select products"), a referral strip ("Give 20% and Get $20"), a "Save 50% | Free Shipping on First Order | 100% Money-Back Guarantee" strip, and a countdown timer, all before the hero. Category tabs: Most Popular / On Sale / Whey Protein / Pre-Workout.
- Hero (observed): typographic, and unusually candid: "You don't need supplements to build muscle, burn fat, and stay healthy. But the right ones can help." Subhead "Clean sports supplements with zero artificial sweeteners, flavors, dyes, or other unnecessary junk." Three trust lines (Science-backed ingredients and doses; Third-party lab tested; Total label transparency). CTAs Shop All / Shop Bestsellers.
- Card (observed): render, short name ("Whey+"), descriptor ("Grass-Fed Whey Protein Isolate Powder"), review count ("12,145 Reviews").
- Science and clean (observed): "See how Legion compares to the rest." comparison table against named competitors (Thorne, Momentous, Dymatize ISO100, Kaged) with true/false marks; expert endorsements with titles (Dr. Bill Campbell, PhD; Dr. Spencer Nadolsky, MD; Menno Henselmans, MS); "1,559 evidence-based articles" blog claim; "Evidence Based" and "Fact Checked" badges; "The #1 brand of naturally sweetened and flavored sports supplements" (their claim, no source shown on the homepage).
- Motion: countdown timer.
- Dark vs light: light.
- Mobile nav: not captured.
- Warnings: "Fat Loss" as a category, "burn fat" in the hero, professional titles, and promo stacking are all patterns OptimalX cannot use. The candid hero sentence is the one idea worth keeping (in OptimalX's own words and without the outcome clauses).

### 1.10 Seed
Source: https://seed.com/ (accessed 2026-09-17)

- Palette (extracted): the extractor reports colour scheme "dark": primary and background #1C3A13 (deep forest green); secondary #31472A; accent #D3FA99 (pale lime); off-white #FCFCF7 for input text and borders. Primary button #D3FA99 with #1C3A13 text at 4px; secondary #FCFCF7 pill (1000px) with green text. Meta theme-color is #fff and meta color-scheme "light dark", so the page is a light system whose hero and science bands are deep green. This is the clearest example in the set of dark bands inside a light site.
- Type (extracted): Seed Sans and Seed Sans Mono (custom). h2 48px; body 16px. Mono is used for eyebrows and captions ("SCIENCE / Microbiome 101", "ViaCap Technology", "Lipari, Panarea, Italy").
- Layout and density (observed): low. Headline hero, four product cards, one bundle, one technology section, two video sections, a UGC scroller, a closing CTA.
- Hero (observed): typographic headline "A life-changing health routine, built for your microbiome." with two CTAs (Take the Quiz; Shop Now) and a photo of four jars.
- Card (observed): badge (Bestseller / New), alphanumeric product code as the name ("DS-01", "DM-02", "AM-02", "PM-02"), descriptor ("Daily Synbiotic"), "Starting at $49.99 per month", Shop Now. The code-as-name system is their signature and reads as laboratory rather than shop.
- Photography vs illustration (observed): photography and video; one technical diagram (an exploded capsule with "OUTER CAPSULE" and "INNER CAPSULE" annotations and a 360-degree spin).
- Science and clean (observed): the annotated capsule diagram; a statistic with a footnote marker ("increases healthy bacteria, 17x, Lactobacillus" with a degree-sign footnote); consistent use of footnote marks (degree sign and asterisk) on every claim; a "Microbiome 101" video; a "SeedLabs" band. The footnote discipline is the pattern to borrow.
- Motion (observed): video (Mux player), 360 product spin, horizontal scroller strip.
- Dark vs light: light chrome, deep-green bands, lime accent only on dark. See section 5.
- Mobile nav: not captured.
- Warnings: "reduces bloating", "Feel lasting relief in one week", "Transform your gut health" are outcome promises OptimalX cannot use.

### 1.11 Gymshark (tone reference, apparel)
Source: https://www.gymshark.com/ (accessed 2026-09-17)

- Palette (extracted): background #FFFFFF; text #000000; #007DB5 and #00699B (blue) for links/interactive; accent #C69735 (gold, most likely the rating stars). Buttons square (0px), white or #F5F5F5 with near-black text. Base unit 10px, radius 2px. Meta theme-color #ffffff.
- Type (extracted): Plaak Gymshark (a custom condensed display face) for headings, SN Skandia for body. h1 and h2 about 48px, body 14px. Section headings in all caps ("POPULAR RIGHT NOW", "FOR EVERY RUN", "WAIT THERE'S MORE").
- Layout and density (observed): full-bleed video or photo hero per collection with two CTAs; product rails with "view all"; a rotating top bar with four offers (10% off for email sign-up; free shipping over $75; students 20%; refer a friend $10).
- Hero (observed): model photography and video; headline plus one-sentence descriptor ("The soft, ultra-lightweight sets you'll want to wear for gym, life and all the moments in between.").
- Card (observed): large photo (3840px source), "New" badge, a numeric rating ("3.7"), bold name, fit descriptor ("light support", "regular"), colour name ("Butter Yellow"), "Regular Price: $28". No strike-through on new lines. The card stays clean even while the top bar is promotional.
- Photography vs illustration (observed): model photography and video only.
- Motion (observed): rotating hero slides with a "Pause slide rotation" control; video.
- Dark vs light: light chrome with monochrome photography carrying the mood.
- Mobile nav: deep category taxonomy (Gym Leggings; Leggings With Pockets; High Waisted Leggings ...) exposed in the footer for SEO.
- Relevance: the "sport" register comes from the condensed caps display face and the photography, not from colour. Cairo Black in caps can carry a similar weight in Arabic without importing the apparel-brand voice.

### 1.12 Sporter (Arabic-region reference)
(pending: scraped, being read)

### 1.13 Dr Nutrition (Arabic-region reference)
(pending: scraped, being read)

### 1.14 Award-listed e-commerce designs, 2026
(pending)

## 2. Synthesis A: five named style directions for OptimalX

(pending)

## 3. Synthesis B: Arabic typography best practice for Cairo

(pending; sources being gathered: Google Fonts Cairo description, UAE Design System 2.0 typography, Google Design on Arabic type, W3C Arabic layout requirements)

## 4. Synthesis C: ten "template store" tells to avoid

(pending)

## 5. Synthesis D: light-mode primary with dark complementary bands, done well

(pending)

## 6. Claims needing verification and gaps

(pending)
