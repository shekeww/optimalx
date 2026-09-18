### 1.1 iHerb (multi-brand marketplace, US-based, ships to Saudi Arabia)

Pages fetched 2026-09-17: home https://www.iherb.com/ (Firecrawl, full markup, 146,959 characters, read in URL-stripped form); category https://www.iherb.com/c/sports-nutrition (Firecrawl, resolves to /c/sports); PDP fetched separately (WebFetch returns HTTP 403 on iherb.com, Firecrawl used instead; see 1.1c).

Information architecture (home, https://www.iherb.com/):
- Utility bar above the logo: "Free Shipping over $30", "24/7 Support", country / language / currency switcher (US / EN / USD), sign-in, cart.
- Search box opens with "Suggested products", "Search history", "Trending now" chips (Munchkin, Ceylon Cinnamon, Milk Thistle, Coconut Oil, Peppermint Oil, B Complex) before the user types.
- A "Browse" row under search: Deals, Sales & Offers, Subscribe & Save, New, Best Sellers, Health Topics.
- Eight top-level departments: Supplements, Grocery, Bath, Sports, Beauty, Pets, Baby, Healthy Home. Each department opens a three-level mega-menu (department, sub-category, leaf). Under Sports: Amino Acids (BCAAs, EAA, L-Carnitine, L-Glutamine, L-Taurine), Creatine (Buffered, Monohydrate, HCl), Electrolytes & Hydration, Fitness Accessories, Muscle Recovery, Nitric Oxide, Pre-Workout (Caffeine, Non-Stim, Stimulant), Protein (Casein, Mass Gainers, Meal Replacements, Plant Based, Ready-to-Drink, Whey), Sports Bars & Snacks, Sports Supplements, "Sport Certified", "Shop all Sports". Each department menu carries a "Trending brands" strip.
- A separate "Health Topics" taxonomy runs in parallel to the product taxonomy: Aging Well, Fitness (GLP-1 Support, Hydration, High Protein, Recovery), Internal Health Support, Look & Feel Your Best, Healthy Life Stages, Nutrition, Wellness. This is the goal or need layer.
- A third axis of diet and value tags: Vegan, Kosher, Non-GMO, Gluten Free, Cruelty-Free, Organic, Ketogenic-Diet, Dairy-free, Vegetarian, Paleo, Professional Brands.
- Brands A-Z menu lists roughly 60 brands inline plus "View All".

Home content blocks in order: promo carousel ("50% Off LactoBif Probiotics, #1 Probiotic on iHerb Worldwide, Limited to 1 item per customer"; "Subscribe & Save, Save up to 10% on subscription orders"; "Our Promise of Quality, Authentic products, standards you can trust"), "Get a more personalized iHerb, Sign In or Create Account", "iHerb Quality Promise: Authentic products, Tested ingredients, Preserved freshness, Easy returns and refunds", "Brands you trust", "Daily Flash Deals, Save 40%+ on hundreds of new deals every 24 hours", "Recommended for you", "Buy it again", a "Deals" grid.

Home product card anatomy (Deals grid): "Add to Cart" button first, then brand, product name and size in one line ("California Gold Nutrition, Baby's DHA, Omega-3s with Vitamin D3 and EPA, 2 fl oz (59 ml)"), review count in brackets ("[31,879]"), sale price then struck list price, discount percentage ("50% off") or "See price in cart" when the discount is gated.

Loyalty: the account flyout shows "$98.2M+ Credits rewarded in 2025" and "3.9M+ Orders using rewards in 2025", then Available Rewards, Pending Rewards, expiry warnings. Rewards are store credit.

Mini-cart: "Added to Cart", "Deliver every" (subscription cadence chosen inside the mini-cart), "Customers Also Bought" cross-sell inside the cart drawer.

1.1b Category page https://www.iherb.com/c/sports (Firecrawl, 66,251 characters; the first 8,000 and last 8,500 characters of the compressed text were read in full, a 12,665-character middle slice was read in a second pass, see status log):
- Hero: "Sports & Active Wellness", one-line description, "NEW! Shop our Sport Certified collection featuring trusted third-party certified supplements" with three certification tiles (NSF Certified, Informed Choice, Informed Sport) and eight sub-category tiles (Protein, Creatine, Electrolytes & Hydration, Sports Supplements, Protein Bars, Amino Acids, Pre-Workout Supplements, Muscle Recovery Supplements).
- Result count "1 - 48 of 4,908 results", "Sort by Featured".
- Card: brand plate where the product is an iHerb brand, image, "Add to Cart", "+ More options" (variant picker on the card), brand plus name plus size in one line, rating and count as a link ("4.8/5 - 41,291 Reviews"), a velocity badge ("50K+ sold in 30 days", "20K+ sold in 30 days", "10K+ sold in 30 days"), price. Deals cards add "35% off" and struck price, or "See price in cart".
- A "Deals in Sports" carousel is injected between result rows; an email capture ("Get the latest deals") is injected mid-grid.
- Filter groups (left rail): Health topics (roughly 30 values), Gender (Men, Women, Neutral), Age ranges (Baby & toddler, Kids, Teens, Adults, Seniors), Certification and diet (roughly 80 values including "3rd party tested", "Banned substances tested", "Certificate of analysis", "GMP certified", "Halal", "Informed choice", "Informed Protein", "Informed Sport certified", "iTested", "NSF certified for sport", "No artificial sweeteners", "Sugar-free", "Vegan"), Potency (ranges in billion CFU, g, IU, mcg, mg), Package quantity (count, fl oz, g, lb, ml, oz ranges), Product form (Capsule, Softgel, Tablet, Powder, Gummy, Liquid, Effervescent, Sachet, Stick and more), Formulation (Multi-ingredient, Single ingredient, Liposomal, Buffered, Unbuffered), Color, Flavor (roughly 85 values), Weight (lb ranges).
- Footer capture: "Get 25% off your first order".

### 1.2 Transparent Labs (single-brand DTC, US, Shopify)

Pages fetched 2026-09-17: home https://www.transparentlabs.com/ (WebFetch); PDP https://www.transparentlabs.com/products/proteinseries-100-grass-fed-whey-protein-isolate (WebFetch); collection https://www.transparentlabs.com/collections/protein-powder (WebFetch; the guessed /collections/protein URL returned 404 and the correct one came from a Firecrawl map).

Information architecture: main nav Shop All, Bestsellers, Protein, Build Muscle & Recover, Pre-Workout, Improve Performance, Health & Wellness, Weight Loss, Take the Quiz; secondary Blog, Support, Account. Goal layer: Build Lean Muscle, Improve Performance, Support Health & Longevity, Body Recomposition. Collections are also tagged by goal in the URL (for example /collections/bestsellers/goal-energy-focus, seen in the Firecrawl map).

Announcement bar: "You're $99.00 away from free shipping" (a live progress message, not a static threshold); collection page also says "Free USA Shipping Over $99".

Home: tagline "Start with clean supplements that get you to your goal". Trust block: "Natural & Grass-Fed Ingredients", "Complete Label Transparency", "Clinically-Dosed Formulas", "3rd-Party Lab Tested" with a link to view all tests, "No Artificial Sweeteners, Colors, or Fillers", "Certified by Informed Choice & Informed Protein". Social proof counters: "130,000+ Active Subscribers", "58,934 Verified 5 Star Reviews". Home product cards: name, price, review count, "Best Seller" badge (Grass-Fed Whey Protein Isolate, $64.99, 7,686 reviews; Bulk Pre-Workout, $49.99, 5,035 reviews). A Protein Calculator and a blog grid sit below.

Collection page (protein-powder): breadcrumb Home / Protein Powder Supplements; filters Series (Protein, 12), Goal (Body Recomposition, Build Lean Muscle, Gut Health, Health & Longevity, Immunity, Joint Support, Recovery, Travel Packs, Weight Loss), Ingredients (Collagen, Creatine, Vegan Protein, Whey Protein); 13 products, no pagination; card: image with variant views, name, review count ("7686 Reviews"), price, "Shop 24 Flavors" button (the flavour count is the call to action), "Best Seller" badge; below the grid: three verified testimonials, the four trust badges, six-question FAQ, "Start Learning" article block.

PDP anatomy in order (Grass-Fed Whey Protein Isolate):
1. Title, star rating with "7686 reviews", price "$64.99".
2. Flavour selector with 24 flavours; size 2LB / 4LB.
3. Purchase toggle: one-time vs "Subscribe and Save $6", with the subscription terms spelled out beside it: "Delivered every [n] days, Save on every order, Free Shipping, Cancel or pause anytime".
4. Trust strip: "No Artificial Sweeteners, No Artificial Coloring, No Artificial Preservatives, Gluten-Free and Non-GMO"; Informed Choice and Informed Protein badges; "45 Day Satisfaction Guarantee".
5. "Why Use Grass-Fed Whey Protein Isolate" education block.
6. "Key Ingredients" expandable: ingredient name, dose ("28 g"), plain-language explanation, numbered research citations [1-4].
7. Supplement facts: an image per flavour and size variant.
8. Reviews: 7,686 with a distribution bar ("5 stars: 6467 (84%), 4 stars: 595 (8%), 3 stars: 364 (5%), 2 stars: 144 (2%), 1 star: 116 (2%)"), verified purchaser label, the flavour purchased shown on each review, review images.
9. "Complete Your Stack" cross-sell: Creatine HMB, Grass-Fed Protein+ Bars, Bulk Pre-Workout, Greens.
10. Add To Cart carries the one-time or subscription choice (sticky behaviour not observable in fetch).
Not present in fetched content: Q&A, price per serving, payment logos, loyalty. Servings are not surfaced above the fold.

### 1.3 Myprotein (single-brand, UK, THG platform)

Pages fetched 2026-09-17: category https://www.myprotein.com/nutrition/protein.list (WebFetch); PDP https://www.myprotein.com/sports-nutrition/impact-whey-protein/10530943.html (WebFetch, content truncated after the highlights block; Firecrawl retry logged in the status log).

Information architecture: top nav Protein, Supplements, Vitamins, Bars/Snacks & Foods, Accessories, Collabs, Clearance, Expert Advice (plus Nutrition, Clothing, Brands on the PDP header). Trending links: Fibre, GLP-1 Support, Hydration. Breadcrumb on category: Home > Nutrition > Protein Powder & Shakes.

Category page (protein):
- Filters: Protein type, Product Category, Flavour, Diet, Price range, Savings, Volume, Average Reviews.
- Sort: Default, Price (Low to High), Price (High to Low), A-Z, Newest arrivals, Percentage Discount.
- Card: image, name, rating with count in the pattern "4.03 out of 5 stars (74)", bold sale price, struck "Was £34.99", "Save £12.50", "Quick Buy" button, contextual promo badge.
- "61 Results", "Page 1 of 3".
- Below the grid: long-form education and search copy ("Who Protein Powder & Protein Shakes Are For", "When to Use", "Benefits"), "Popular Picks" (three products), an FAQ block.
- Promo: countdown banner "IMPACT WEEK CLOSING DOWN | 35% OFF ALMOST EVERYTHING | ENDS IN..."; "Order before 00:30 for Next Day Delivery"; "Unlock App exclusive discounts"; "Earn £15 Credit?" referral; Trustpilot "Over 220k reviews & 4.4 rated"; Informed Choice and Informed Sport logos on some cards.

PDP above the fold (Impact Whey Protein): title, "4.64 out of 5 stars" with "30k customer reviews", claim line "The UK and Europe's No.1 best-selling whey protein, delivering 23g of protein per serving", price "£31.99", "Was £34.99", "Save £3.00", "£1.07 per serving", three product variants (Original, +Collagen, Milkshake), four highlight chips (23g Protein, Low fat & Sugar, Delicious Flavours, Quality Tested). The rest of the page was not returned by WebFetch.

### 1.4 Momentous (single-brand DTC, US, Shopify)

Pages fetched 2026-09-17: home https://www.livemomentous.com/ (WebFetch); collections https://www.livemomentous.com/collections/all (WebFetch, partial render); PDP https://www.livemomentous.com/products/essential-whey-protein (WebFetch; the guessed /products/whey-protein-isolate returned 404, correct URL from a Firecrawl map).

Information architecture: Shop by Goal (Sleep, Cognitive Function, Athletic Performance, Hormone Support, Foundational Health); Shop by Category (Supplements, Sports Nutrition, Stacks, PR Lotion, Vegan, Travel Size); Learn (Momentous Standard, Routine Guide, Trusted Experts, Blog, Product Success Guides, Certificate of Analysis); "Build My Routine" tool linked in nav and CTAs. Announcement: "Free Shipping on U.S. Orders $99+".

Home product cards: name, star rating with count ("4.8 stars (3,895 reviews)" for Creatine), "Subscribe & Save 25%" price beside the one-time price (Creatine: Subscribe $32.24, One-time $42.99; Whey: Subscribe $44.99, One-time $59.99), flavour list, "NSF Certified for Sport" badge. Subscription cadence "Delivery every 1 month / 2 months / 3 months", "Out of Stock Protection", "10% off future deliveries".

Trust claims on home: "Third-party Tested", "Money-Back Guarantee", "100% of NFL teams using Momentous products in their locker rooms", "150 teams in professional and NCAA sports", "11 innovation and research contracts" with the U.S. Department of Defense, named experts. Education: blog, Product Success Guides, Certificate of Analysis page, "The Science Behind Creatine".

PDP anatomy in order (Whey Protein Isolate):
1. Title, "4.7" stars with "3,219" reviews, "Best Seller" and "25% Off" badges.
2. Three benefit bullets ("Supports lean muscle mass and recovery", "High in leucine to build and repair muscle faster", "No gums, fillers, or artificial sweeteners"). The first two are US structure/function claims and would not pass OptimalX's claims rule.
3. Price block: Subscribe "$44.99" (struck "$59.99"), One-time "$59.99", "25 Servings Per Container", "$1.79/Serving", "20g of European grass-fed whey".
4. Flavour dropdown (Chocolate, Vanilla, Strawberry, Unflavored) and size.
5. Trust: "NSF Certified for Sport" badge, "Gluten Free", "Grass Fed", "30 day money back guarantee", "Free U.S. shipping over $99", "100% of Momentous portfolio is 3rd party certified to be banned substance free", Certificate of Analysis link.
6. Supplement facts as an image per flavour (Serving Size 1 Scoop, 90 Calories, 20g Protein), ingredient list per flavour, five linked clinical studies, directions ("1 scoop with 10-12 fluid ounces of preferred liquid, as needed"), an intake guideline and a "results expected within 4-6 weeks" line.
7. Reviews: "3,219 reviews", "4.7 out of 5", distribution ("2.7k" five-star), "94% would recommend", filters "Photos & Videos", sort "Most Helpful", "Highest Rating", "Oldest", "Lowest Rating".
8. Seven-question FAQ (sourcing, isolate vs concentrate, dietary compatibility, how much protein, digestibility, who it is for, certification process).
9. "Frequently Purchased Together" (Omega-3 $39.99, Creatine $42.99, each with "Add to Bag") and "Build Your Stack" (Collagen Peptides $54.99, Vitamin D3 $19.99, subscribe at 25% off).
10. Sticky "Add to Bag" with quantity and both prices.
Not present in fetched content: payment logos, loyalty.

### 1.5 Thorne (single-brand, US, own platform)

Pages fetched 2026-09-17: home https://www.thorne.com/ (WebFetch); product list https://www.thorne.com/products/by-health-goal (WebFetch, resolves to the Products list); PDP https://www.thorne.com/products/dp/creatine (WebFetch).

Information architecture: Shop, Get Started, Take 5 Daily (editorial), Help. Product list sidebar of 26 need-based categories (Stacks, Sports Performance, Gut Health, Women's Health, Men's Health, Immune, Sleep, Liver, Fish Oil & Omegas, Multivitamins, Energy, Stress, Probiotics, Methylation, Protein, Cognition & Focus, Amino Acids, Children's Health, Metabolism, Healthy Aging, Thyroid, Mood, Bone & Joint, Skin/Hair/Nails, Hormone Support, Heart & Vessels). Breadcrumb "Home / Products". "Quick Order" link.

Product list: filters Product Type, Health Needs, Ingredients, Product Form (Capsule, Gel Cap, Liquid, Powder, Tablet), Ingredient Concerns (Dairy Free, Gluten Free, Soy Free, Vegan and more). Sort "Recommended". "1-23 of 210 results", paginated. Card: image, badge (Bestsellers, New, Exclusive), price, name, benefit line, health-need tags, star rating, "NSF Certified for Sport" badge where applicable. An AI advisor widget, "Taia, Thorne's AI Wellness Advisor", with "Ask Taia a Question".

Announcement: "Thorne now accepts FSA/HSA funds via Truemed". No free-shipping threshold in the announcement. Home trust claims: "Four rounds of testing on every product", NSF, Australian TGA A rating, GRMA, cGMP, "100+ professional and U.S. National teams".

PDP (Creatine): title "Creatine - 90 Servings", price "$44 /90 Scoop(s)", size 90 / 180 servings, quantity selector, "NSF Certified for Sport" badge, testing claim ("test each ingredient for identity, purity, and potency", screening "for contaminants like heavy metals, pesticides, and harmful microbes"), expandable Q&A style FAQ (suitability, testing, timing, dosing, bloating, results timeline), supplement facts as text ("Serving size 1 Scoop(s)", "Servings per container 90", "Creatine Monohydrate 5g"), directions ("Mix 1 scoop with at least 8 ounces of water..."), a warnings block, "Recommendations for you" cross-sell, sticky add-to-cart present in fetched markup. Not present in fetched content: star rating and review count on the PDP, subscribe-and-save, delivery promise, payment logos.

### 1.6 AG1 (single-product DTC, US)

Pages fetched 2026-09-17: home https://drinkag1.com/ (Firecrawl, full page read); product page https://drinkag1.com/products/greens-powder-pouch (see status log; WebFetch returned HTTP 429 twice).

Home anatomy in order: announcement "ENDS SEPT 30: Save an additional 20% on your first subscription order, use code BACK2ROUTINE"; hero for AG1 Pro; "60,000+ verified 5-star reviews for AG1 products"; four trust chips ("Validated by NSF Certified for Sport", "Backed by industry-leading research", "Trusted by leading scientists and athletes", "No-risk 90-day guarantee"); a three-tier product ladder with monthly and per-serving prices ("AG1 Essentials Gummies $49/mo $1.63/serving", "AG1 Next Gen $79/mo $2.63/serving", "AG1 Pro $99/mo $3.30/serving", "MOST POPULAR" on Pro); a comparison table (Format, Ingredients count, Serving Size, certification, feature rows, Price/month); "Nutrition Built for Your Goals" self-selection list; "HSA/FSA eligible with Truemed"; reviews wall "Over 60,000 Satisfied Customers" with the dated note "AG1 underwent a research-backed update in January of 2025. Reviews prior to that month reflect an earlier formulation."; press logos; ingredient categories with "View All Ingredients" and "Supplement Facts" links; "Tested for those that test themselves" quality block; a value-stacking table comparing $79 or $99 per month with "$275" of separate supplements, footnoted "Based on current available data for average industry prices of premium supplements"; celebrity and expert testimonials; "Try AG1 risk-free for the next 90 days"; FAQ (membership perks: "Premium Welcome Kit plus free gifts with first subscription order", "Start unlocking rewards after 90 days", "Earn referral credits", "Pause, skip, or cancel your delivery anytime"); blog grid; a full Nutrition Facts table inline at the foot of the page.

Note for OptimalX: the AG1 page is a subscription funnel, not a catalogue. Its benefit bullets ("Immune Health", "Stress & Mood Balance") carry the US FDA disclaimer asterisk; they are structure/function claims permitted in the US and would not pass OptimalX's no-health-outcome rule or Saudi advertising rules (section 4).

### 1.7 Huel (single-brand DTC, UK/US, Shopify)

Pages fetched 2026-09-17: PDP https://huel.com/products/huel-black-edition (WebFetch); collection: https://huel.com/collections/all returned 404 and a Firecrawl map returned only forum threads, so no Huel category page is in this teardown.

Information architecture: announcement strip with four rotating promises ("Free shipping $65+", "Subscribe and save 25%", "Student discount boost: 33% off", "HSA/FSA Eligible"); nav Shop all, Science, About, Why Huel?, Guides & Articles, "Give 25% Get 25%" (referral as a nav item); "Which Huel is right for you?" finder in nav.

PDP anatomy in order (Black Edition):
1. Title with "Bestseller" badge; price expressed per meal: "From $2.65 per meal", "From 17 meals".
2. Flavour selector (Chocolate marked bestseller, Strawberry Banana marked new, Unflavored & Unsweetened).
3. Quantity and bundle: Variety Box (16 packs) $60, single bag $45, "Bestseller Trio".
4. Purchase toggle: "Subscribe & Save" $45 (25% off) vs one-time $60.
5. Spec chips: "40g of protein, up to 11g of fiber, no artificial sweeteners, 27 essential vitamins and minerals".
6. Badges: B Corp, "100% vegan", "Plant-based protein", "No artificial colors", "No artificial flavors", "Gluten-Free", "Non-GMO".
7. Delivery: "Spend $65 to get free shipping. Standard shipping $9.99". Loyalty: "Earn up to 90 Huel+ points per item".
8. Nutrition presented as a comparison table (Calories 400, Protein 40g, Fiber 9-11g, Net Carbs 15g) with a "Nutrition & Ingredients" link; key ingredients named.
9. "How to use Black Edition", "Science & Testing", comparison chart Black Edition vs Powder vs Essential, press quotes (Vox, GQ, Wired, Men's Health), testimonials.
10. Expandable FAQ ("Is Huel Black Edition a meal replacement?", "How much protein...", "Is Huel Black Edition low carb?", "What's the difference...").
11. Cross-sell with per-unit prices: Daily Greens "$45, $1.50 per serving"; Ready-to-drink "$53, $4.42 per bottle"; Hot & Savory "$27.65, $3.95 per meal".
12. Sticky add-to-cart with Subscribe & Save / One-Time and flavour required.
13. Payment logos: Visa, Mastercard, Apple Pay, Amex, PayPal. Email capture "15% off your first order".
Not present in fetched content: star rating and review count, Q&A beyond FAQ.

### 1.8 Bulk (single-brand, UK, Magento)

Pages fetched 2026-09-17: PDP https://www.bulk.com/uk/products/pure-whey-protein/bpb-wpc8-0000 (WebFetch); category https://www.bulk.com/uk/protein (WebFetch; filters and cards are client-rendered and did not appear).

Information architecture: Offers; Shop by Goal (Build Muscle, Lose Weight, Optimise Your Health, Sustain Endurance & Hydration, Vegan); Protein submenu with status tags ("Whey Protein [Bestseller]", "Clear Protein [Trending]", "Vegan Protein"); Pre-Workout; Creatine; Vegan. Category page states roughly 105 products, related-category chips (Whey Protein, Vegan Protein, Clear Protein, Mass Gainer, Beef Protein) and a Protein FAQ.

PDP anatomy in order (Pure Whey Protein):
1. Title, 4.5 stars with "more than 10,000 customers".
2. Price stack: "Regular £38.99; Final £31.99; Save £7.00" under a site-wide "September Savings: Up to 75% off, no code required".
3. Flavour selector with 24 flavours; sizes 450g, 500g, 900g, 1kg, 2kg, 2.5kg, 4kg, 5kg.
4. Claim line "Up to 24g whey protein in every scoop" with "5g BCAAs".
5. Delivery table: "Free" over £49, "£3.95" under £49 for 2-3 day standard; "Next Working Day £5.49" when ordered before 20:45.
6. "BULK QUALITY PROMISE" (testing by "scientists and nutritionists"); diet tags Halal, Vegetarian, "GLP1-Friendly".
7. Nutrition table per 100g and per 32g serving; short ingredient list ("Whey Protein Concentrate (Milk), Emulsifier (Sunflower Lecithin), Flavourings, Thickener (Xanthan Gum), Sweetener (Sucralose)"); allergen advisory.
8. Directions: "1 full scoop 32g" in "200ml of water", "1-3 servings daily".
9. FAQ (benefits, suitability, taste, vegan alternative).
10. "Frequently bought with" (casein as the evening complement).
11. Payment logos: Visa, Mastercard, Maestro, American Express, Klarna, PayPal, Apple Pay, Google Pay.
12. Programmes: "Bulk Boost: Unlimited Shopping. Free Delivery. Next Day Nutrition. Just £9.95 per year"; "Extra 10% off for students"; referral "You'll both get your gains".
Not present in fetched content: review filters, Q&A, sticky add-to-cart, quiz.

### 1.9 bodybuilding.com store (multi-brand, US, Shopify)

Pages fetched 2026-09-17: home https://shop.bodybuilding.com/ (WebFetch); collection https://shop.bodybuilding.com/collections/protein (WebFetch); PDP https://shop.bodybuilding.com/products/bodybuilding-signature-100-whey-5lb (see status log; the guessed URL returned 404 and the correct one came from a Firecrawl map).

Information architecture: SHOP ALL, PROTEIN, PRE/INTRA & CREATINE, MUSCLE PERFORMANCE, HEALTHY WEIGHT, VITAMINS & SUPPLEMENTS, SHAKERS & GEAR; goal tiles Strength & Muscle, Sports Performance, Healthy Weight, Recovery; brand menu (Signature, EVL, Codeage, Cellucor, Redcon1, Panda, Nutrex, Dymatize and roughly 20 more); SALES, WORKOUTS, ARTICLES, OUR TEAM, BB HEALTH+, REWARDS, FORUMS.

Home: stacked promo banners ("Buy 1 Get 1 50% Off + 3x Points", "Buy 2 Get 1 Free", "BOGO50 ON SALE NOW", "3-WEEK 20% OFF SALE"), "Free Shipping on Signature & EVL Nutrition Only Orders Over $99.99!", "Members Earn 5 points per $1 spent on every order", Klarna plus Mastercard, Visa, Apple Pay, Google Pay, PayPal. Trust strip: "U.S DOMESTIC SHIPPING TO 49 STATES & MILITARY", "WE ARE PROUDLY USA MADE", "SAFE AND SECURE PAYMENT METHODS", "Building bodies since 1999!". Content: calculators (macros, calories, BMI, one-rep max), nutrition guides, training programs, "TAKE YOUR ASSESSMENT" (a BB Health+ telehealth funnel).

Collection page (protein): breadcrumb Home > Protein Powder & Protein Shakes; filters Product Type, Price, Flavor (30+), Size (2lb, 5lb), Brand (25+); sort Featured, Most relevant, Best selling, A-Z, Z-A, Price both ways, Date both ways; "69 Results", page 1 of 3 with "Loading more products"; card: brand, title, review count ("301 Reviews"), product type, flavour dropdown, size options, regular and sale price with discount percentage ("$94.99, Sale $85.49 (-10%)"), "In stock", "Quick order", badges "BOGO50" / "Sale"; FAQ and long-form copy below the grid.

### 1.10 Optimum Nutrition (brand-owned store, US, Shopify)

Pages fetched 2026-09-17: home https://www.optimumnutrition.com/en-us (WebFetch); PDP https://www.optimumnutrition.com/en-us/products/gold-standard-100-whey-protein-powder (WebFetch); collection https://www.optimumnutrition.com/en-us/collections/protein (see status log).

Information architecture: Shop by Product (ChampionSips, Protein, Creatine (Gummies, Powder, Capsules), Weight Gainers, Advanced Fitness, Energy, Active Lifestyle, Accessories, Top Sellers, Samples, Bundles); Shop by Goal (Prepare Before Training, Keep Going During Training, Recover After Training, Weight Gain, Strength & Endurance, Everyday Protein); Explore (About Us, Our Quality, Authentic Products, Academy, Protein Calculator, Articles, Recipes, Athletes, Coach Optimum); Offers, Samples, Optimum Advantage.

Announcement bar: "Free shipping on orders above $75"; "20% Off + Free Shipping on All Subscription Orders"; "15% off your first order when you sign up to our newsletter".

Home cards: "Gold Standard 100% Whey From $26.49", "Gold Standard Pre-Workout $28.49", "Gold Standard 100% Isolate $103.49", "Micronized Creatine Powder From $20.49", all with quick add. Education: Protein Calculator ("How Much Protein Do I Need?"), "Just Getting Started?" hub, articles, recipes. Payment logos in footer: American Express, Apple Pay, Diners Club, Discover, Google Pay, Mastercard, PayPal, Shop Pay, Visa. The "Authentic Products" page in the Explore menu is a counterfeit-protection surface, relevant in Saudi Arabia where ON is widely counterfeited.

PDP anatomy in order (Gold Standard 100% Whey):
1. Title "GOLD STANDARD 100% WHEY", price "$74.49" (5 lb selected), flavour selector with 23 flavours (new flavour flagged "Iced Cafe Latte (New)"), size selector written in servings first: "29 Servings (2 lb)" and "73 Servings (5 lb)".
2. "$2.56" per serving, "24g of quality protein", "5.5g of naturally occurring BCAAs per serving".
3. Badges "Gluten free", "Banned Substance Tested"; claims "The World's #1 Whey Protein Powder", "The World's #1 Sports Nutrition Brand".
4. Nutrition facts as a label image per flavour (file name "GSW_Banana_2lb_NFP.jpg" shows the image is flavour and size specific).
5. Directions ("Mix about one scoop of the powder into 6 to 8 fluid ounces of cold water, milk, or other beverage... 30 to 60 minutes after your workout or use as an anytime snack").
6. Athlete profiles and article links.
7. "Add to cart" repeated down the page (sticky behaviour likely, not observable in fetch).
Not present in fetched content: star rating and review count, subscription toggle on the PDP (the 20% subscription offer sits only in the header), Q&A, cross-sell, payment logos.
