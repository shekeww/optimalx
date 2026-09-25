# OptimalX icon system 2: the complete set for Claude Design

Prepared 2026-09-26 from your direction: "match and inspire the identity and design of the icons with the icons and icons system in https://onthegoofficial.my, reflecting the bold premium energetic identity", and "it should create every icon needed for the whole website for consistency, define size and function and style and everything needed for every icon".

This file defines **every icon the website uses**, 139 in all: every icon in use on the site today, minus four retired duplicates (B13), plus six the new features need (booking, subscriptions, the 3-month package, cashback credit). Draw the whole set in Claude Design to these rules and deliver it as **optimal-x-icons-v3**. It replaces v2 file for file under the same names, so every page switches at once and the whole site speaks one visual language.

---

## Part A: the system

### A1. Two families, one language

The reference store's lesson: weight goes where the promise is. OptimalX uses two families that share one grid, one angle and one accent rule.

| Family | Used for | Drawing | Why |
|---|---|---|---|
| **Solid** | Everything that carries a promise or a meaning: trust, delivery and payment, services and channels, offers, product facts, how-to steps, categories, goals, empty states | Filled silhouettes in one colour; interior detail cut out as negative space (knockouts); 2 to 4 shapes | Bold mass reads fast, looks premium, and holds over photographs and colour plates |
| **Line** | Controls and navigation: menu, search, cart, account, close, chevrons, arrows, plus and minus, filter, sort, view toggles, share, copy, language, external link, booking time chips | Open strokes; drawn at a 2 unit stroke; round caps and round joins | Controls should be quiet and precise so content icons stand out |

A few icons exist in both families on purpose (section B, column "Family"). The file name stays the same; the manifest says which family it is.

### A2. Grid and geometry (both families)

1. **Artboard 24 by 24**, 2 units of padding, a 20 by 20 live area. Every icon, both families.
2. **The brand angle: 34 degrees from vertical**, the lean of the X in the logo. Every diagonal that expresses motion or direction (arrow heads, return loops, speed cuts, a cut corner) uses it. At most one cut corner per icon.
3. **Corners:** a small rounding of about 1 unit on solid shapes; never a large radius, never a circle where a shape can be angular, except coins, clocks, lenses, pills and discs that are round by nature.
4. **Optical weight:** all icons in one family must look the same weight side by side at 24px. Fill each solid icon to roughly half of the live area.

### A3. Solid family rules

1. Fill `currentColor`, no stroke anywhere.
2. Detail is always a knockout, never a shape drawn on top.
3. Minimum solid part 2.5 units across; minimum knockout or gap 2 units.
4. Readable as a silhouette at 20px in one colour.

### A4. Line family rules

1. Stroke `currentColor`, 2 units, round caps, round joins, no fills except the accent part.
2. The site renders the line at 2.4 at 24px and below so controls stay bold enough; draw at 2 and leave 2 units of clear space between parallel strokes so they never close up.
3. Minimal: 1 to 3 strokes.

### A5. Colour and the accent

- The icon takes the colour of its surface: ink (#0D1014 family) on light, white on dark.
- **One accent part at most**, a separate shape with the class `ox-icon__accent`. The site paints it **orange #F54915** by default, **white** when the icon stands on an orange plate, and the body colour when an icon must be one colour (for example inside a primary button). Every icon must still read with no accent.
- No other colours, no gradients, no shadows, no text inside an icon.

### A6. The size scale (the same on phone and desktop)

Icons never shrink on a phone: layouts reflow instead. Nothing on the site is drawn under 20px.

| Token | Glyph | Use |
|---|---|---|
| **icon-20** | 20 | Beside body or meta text: fact lines, footer rows, chips, card badges, inline links |
| **icon-24** | 24 | Controls and rows: header, tab bar, buttons, steppers, trust and delivery rows, payment chips, the booking picker |
| **icon-24 in plate-44** | 24 in a 44 plate | Promise tiles on dark bands and cards; how-to steps |
| **icon-32 in plate-56** | 32 in a 56 plate | Service headers, review facts, channel cards, feature rows |
| **icon-36** | 36 | Category tiles and the categories page |
| **icon-32 over photo** | 32 | Goal cards over photographs |
| **icon-40 in plate-72** | 40 in a 72 plate | Empty states (empty cart, empty search) |
| **icon-96** | 96 | The 404 page figure |

### A7. Plates (drawn by the site, never in the file)

The file is always the glyph alone. The site draws the plate behind it, cut once at 34 degrees on the corner that faces the label, and mirrors it for Arabic.

| Plate | Where | Glyph | Accent |
|---|---|---|---|
| Orange plate | Dark bands and dark cards | white | white |
| Graphite plate | Light surfaces | white | orange |
| No plate | Rows, controls, tiles over photos | surface colour | orange |

### A8. Spacing beside labels

8px between an icon and its label in a row; 12px beside a 44 plate; 16px beside a 56 plate; 8 to 12px between a stacked icon and the label under it. Labels beside promise icons are bold (700 to 800), never under 14px.

### A9. States

| State | Line icons (controls) | Solid icons (content) |
|---|---|---|
| Default | surface colour | surface colour, accent orange |
| Hover and focus | the control's colour changes instantly to orange (no fade); focus ring on the control, not the icon | none: content icons do not react |
| Active and selected | orange | not applicable |
| Disabled | 40% opacity on the control | not applicable |
| Motion | none on any icon; only the carousel play button may scale on hover | none |

### A10. Direction (Arabic and English)

Draw every directional icon **pointing right** (forward in English) and mark it `rtlFlip: true`; the site mirrors it in Arabic. Directional means: arrows, chevrons, carts, trucks, return loops, speech bubble tails, anything that moves. Nothing else flips: never flip logos, clocks, check marks, plus and minus, stars or numbers.

### A11. Accessibility

Every icon is decorative (`aria-hidden`) and always sits next to a visible label or inside a control with an accessible name. The meaning must never depend on the icon alone, and never on the accent colour alone.

### A12. Claims-safe imagery

No medical crosses, stethoscopes, pills presented as treatment, heartbeat lines standing for health outcomes, flames for fat burning, scales with a downward arrow, before-and-after bodies or body scans. InBody is a measurement device. Goals show the activity or the object, never a body.

### A13. Never drawn

Brand marks come from their official files and are not part of this set: WhatsApp, Instagram, TikTok, Snapchat, X, Facebook, YouTube, Google, Apple Pay, mada, STC Pay, Visa, Mastercard, Tabby, Tamara, the official riyal symbol, and the OptimalX logo and X mark.

---

## Part B: every icon

Column keys. **Family:** S solid, L line. **Size:** the tokens of A6 (20, 24, 24/44, 32/56, 36, 32 photo, 40/72, 96). **Flip:** yes means draw pointing right, rtlFlip true. **Accent:** the one part painted orange, or none.

### B1. Header, tab bar and navigation (line)

| Name | Arabic | Function on the site | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| menu | القائمة | Opens the phone menu drawer | Three horizontal lines, the middle one shorter and shifted to the reading end | L | 24 | none | no |
| search | البحث | Header search, tab bar, search page | A lens with a short handle leaning at 34 degrees | L | 24, 20 in fields | none | no |
| cart | السلة | Header cart, tab bar, cart page title | A cart basket on two wheels, handle at the start side | L | 24 | none | yes |
| user | الحساب | Account in header and tab bar | Head and shoulders, one continuous line | L | 24 | none | no |
| home | الرئيسية | Tab bar home | A house outline with a door opening | L | 24 | none | no |
| store | تسوق | Tab bar shop, shop menu | A shopping bag with two handles | L | 24 | none | no |
| wishlist | المفضلة | Save a product (cards, header) | A heart outline | L | 24, 20 on cards | none | no |
| language | اللغة | The EN and العربية switch in header and drawer | A globe of three strokes, one meridian at 34 degrees | L | 20 | none | no |
| close | إغلاق | Close drawers, sheets, chips, dialogs | Two crossing strokes | L | 24, 20 in chips | none | no |
| chevron-end | التالي | Forward: carousels, links, cards, breadcrumbs | A chevron pointing right, arms at 34 degrees | L | 20, 24 | none | yes |
| chevron-start | السابق | Back: carousels, breadcrumbs | The same chevron pointing left | L | 20, 24 | none | yes |
| chevron-down | فتح | Accordions, dropdowns, FAQ | A chevron pointing down | L | 20 | none | no |
| chevron-up | إغلاق القائمة | Collapse, back to top | A chevron pointing up | L | 20 | none | no |
| arrow | انتقل | "View all" links, section headers | A straight arrow pointing right, head cut at 34 degrees | L | 20 | none | yes |
| external | رابط خارجي | Links that open Google Maps, reviews, Maroof | A square with a corner arrow leaving it | L | 20 | none | yes |
| filter | تصفية | Listing filter button and panel | A funnel with straight edges | L | 24 | none | no |
| sort | ترتيب | Listing sort control | Two vertical arrows, one up one down, heads at 34 degrees | L | 24 | the down arrow | no |
| categories | الأقسام | Grid view, categories entry | Four squares in a 2 by 2 grid, the top end square cut at 34 degrees | L | 24 | the cut square | no |
| list-view | عرض القائمة | List view toggle | Three rows, each a square dot and a line | L | 24 | none | no |
| expand | تكبير | Tap to zoom the product gallery | Two corner brackets pointing out | L | 20 | none | no |
| play | تشغيل | Hero and video play control | A triangle pointing right | L | 24 | none | yes |
| pause | إيقاف | Hero autoplay pause | Two vertical bars | L | 24 | none | no |
| share | مشاركة | Share a product or article | Three dots joined by two strokes | L | 20 | none | no |
| copy | نسخ | Copy a gift card code or link | Two overlapping rectangles | L | 20 | none | no |

### B2. Buying controls (line)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| cart-add | أضف للسلة | Add to cart button and card add bar | The cart of B1 with a small plus above the basket | L | 24, 20 on cards | the plus | yes |
| plus | زيادة | Quantity stepper, bundle add | A plus, equal arms | L | 20 | none | no |
| minus | إنقاص | Quantity stepper | A single horizontal stroke | L | 20 | none | no |
| check | تم | Selected options, completed lists, inline ticks | A tick, long arm at 34 degrees | L | 20 | none | no |
| lock | آمن | Secure checkout note on the checkout button | A padlock, shackle and body | L | 20 | none | no |

### B3. Status and messages (solid)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| check-circle | نجاح | Success notices (added, saved, sent) | A solid disc with a tick knocked out | S | 20, 24 | none | no |
| info | معلومة | Neutral notices and hints | A solid disc with a small "i" knocked out | S | 20 | none | no |
| warning | تنبيه | Label warnings, password page notice, form errors | A solid triangle with a bar and dot knocked out | S | 20 | none | no |
| message-sent | تم الإرسال | Newsletter and question sent confirmation | A solid paper plane, its fold knocked out, pointing right | S | 20, 24 | none | yes |
| order-success | تم الطلب | Order confirmation and thank-you content | A solid bag with a tick knocked out | S | 40/72 | the tick | no |
| coming-soon | قريبا | Items not yet available, price coming soon | A solid hourglass, the sand knocked out | S | 20 | the lower sand | no |

### B4. Trust, delivery and payment (solid)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| shipping | الشحن | "Shipping within the Kingdom" in trust rows, utility bar, free shipping bar | A truck moving forward, wheels knocked out, cab cut at 34 degrees, two speed cuts behind | S | 20, 24 | the speed cuts | yes |
| delivery-estimate | موعد التوصيل | Expected delivery line on the product page | A calendar page with a forward arrow knocked out across it | S | 20 | none | yes |
| track-order | تتبع طلبك | Order tracking link and order page | A map pin on a short route line ending in a small box | S | 20, 24 | the pin head | no |
| secure-payment | دفع آمن | Trust rows, utility bar, checkout note | A card, stripe knocked out, a small lock on its corner | S | 20, 24 | the lock | no |
| authentic | منتجات أصلية | "Authentic products" trust rows, footer, product page | A scalloped seal, the tick knocked out | S | 20, 24, 24/44 | none | no |
| customer-service | خدمة العملاء | Support trust item, contact rows | A headset, the band and one ear cup solid, the mic knocked out | S | 24 | the mic | no |
| returns | الاسترجاع | Return terms line, product trust rows, FAQ | A box with a return arrow knocked out of its face | S | 20, 24 | none | yes |
| refund | استرداد المبلغ | "Refund within 24 hours" line | A coin with a circular return arrow cut around it; the centre left open for the official riyal symbol | S | 20 | the arrow head | yes |
| expiry | تاريخ الصلاحية | Expiry line on product page and poster facts | A calendar page with one day block knocked out | S | 20 | the day | no |
| registry | السجل التجاري | Footer registration line, About page, password page | A document with one line knocked out and a round seal at its corner | S | 20 | the seal | no |
| cash-on-delivery | الدفع عند الاستلام | Payment methods row | A banknote resting on an open hand, the note's centre an oval knockout | S | 24 | the note corner | no |
| bank-transfer | تحويل بنكي | Payment methods row | A bank building, columns knocked out, a forward arrow beneath | S | 24 | the arrow | yes |
| installments | تقسيط | Tabby and Tamara explanation line | A disc split into four arcs by 2 unit gaps | S | 20 | one arc | no |
| store-credit | رصيد الشراء | The 100% cashback credit, account credit balance | New. A wallet with a coin half out of it, a plus knocked out of the coin | S | 20, 24 | the coin | no |

### B5. Services, advisory and channels (solid)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| advisory | الاستشارة المجانية | Free advice facts on home, services, reviews, password page | Two overlapping speech bubbles, the rear solid, the front knocked out with a 2 unit rim | S | 24/44, 32/56 | none | yes |
| recommendation | التوصية | "We recommend" facts and recommendation rails | A tag with a 34 degree cut corner, a forward arrow knocked out | S | 24/44 | none | yes |
| inbody | قياس InBody | InBody measurement facts and the branch visit | The measurement platform as a slab, two grips as posts, a simple figure knocked out between them | S | 24/44, 32/56 | the grips | no |
| plan | خطة التغذية | Nutrition plan service and plan cards | A clipboard, two ticks knocked out 2 units apart | S | 24/44, 32/56 | the clip | no |
| aftersales | ما بعد البيع | After-sales follow-up fact on reviews and services | A return loop around a small box, the loop head at 34 degrees | S | 32/56 | the loop head | yes |
| written-question | سؤال مكتوب | The free written question service and contact channel | A speech bubble with a tail, three dots knocked out | S | 24/44, 32/56 | none | yes |
| video-consult | استشارة فيديو | The video consultation service and booking | A screen on a short stand, the play triangle knocked out | S | 24, 24/44, 32/56 | the triangle | no |
| branch-visit | زيارة الفرع | Branch visit service, header branch link, booking, branch map | A storefront with an awning, door and awning stripes knocked out | S | 20, 24, 32/56 | none | no |
| training | التدريب الشخصي | Personal training service and booking | A dumbbell, plates cut at 34 degrees | S | 24, 32/56 | none | no |
| digital-library | الأدلة الرقمية | Digital guide products and the guides link | An open book, the spine knocked out | S | 24, 32/56 | none | no |
| phone | الهاتف | Phone on the contact page and drawer | A handset leaning at 34 degrees | S | 24 | none | no |
| mail | البريد | Email on the contact page and footer | An envelope, the flap knocked out | S | 24 | none | no |
| map-pin | الموقع | Branch location and address lines | A map pin, a round hole knocked out | S | 20, 24 | none | no |
| directions | الاتجاهات | "Get directions" buttons (a control, so line) | A diamond road sign with a turning arrow inside | L | 20 | the arrow | yes |
| hours | ساعات العمل | Opening hours table and "open now" chip | A clock face, hands knocked out | S | 20 | the hour hand | no |

### B6. Booking and subscriptions (new features)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip | Status |
|---|---|---|---|---|---|---|---|---|
| calendar | التقويم | The booking picker's date strip header | A calendar page, binding rings on top | L | 24 | none | no | |
| booking-slot | احجز موعدك | Booking section header on service pages | A calendar page with one day block knocked out and a small clock at its corner | S | 32/56 | the day block | no | NEW |
| booking-confirmed | تم الحجز | Booking summary in the cart and thank-you content | A calendar page with a tick knocked out | S | 24, 40/72 | the tick | no | NEW |
| time-slot | الوقت | The chosen time line in the booking summary | A clock face, hands knocked out, a tick mark at 12 | S | 20 | the tick mark | no | NEW |
| time-morning | صباحا | Morning slot group chip | A half sun rising over a line | L | 20 | the sun | no | |
| time-afternoon | ظهرا | Afternoon slot group chip | A full sun with four short rays | L | 20 | the sun | no | |
| time-evening | مساء | Evening slot group chip | A crescent moon | L | 20 | the moon | no | |
| subscription | اشتراك | Subscribe option, subscription plans, repeat purchases | Two arrows chasing each other in a loop, heads at 34 degrees | S | 20, 24 | one arrow | no | NEW |
| package | الباقة | The 3-month package and service packages | A clean box with a ribbon cross knocked out | S | 24/44, 32/56 | the ribbon knot | no | NEW |

### B7. Offers, gifts and bundles (solid)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| offers | العروض والباقات | Offers menu item, offers section header, sale badge | A price tag with a 34 degree cut corner, a hole knocked out, a bold stripe across it | S | 20, 24, 32/56 | the stripe | yes |
| bundles | الباقات | Bundle cards and the bundle offer on product pages | Two boxes, the front overlapping the rear, a plus knocked out of the front | S | 24, 32/56 | the plus | no |
| gift-card | بطاقة هدية | Gift card product, menu link, utility tile | A card with a bow knot on its corner, a code line knocked out | S | 24, 32/56 | the bow | no |
| gift | هدية مجانية | "Free gift" and "free shaker" on offers | A gift box, ribbon knocked out | S | 20, 24 | the bow | no |
| points | النقاط | Loyalty points (when switched on) | A coin with a star knocked out | S | 20 | none | no |
| referral | ادع صديقا | Referral programme (when switched on) | Two overlapping person heads, a plus knocked out | S | 24 | the plus | no |

### B8. Product facts and specifications (solid)

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| servings | عدد الحصص | Servings fact (powders only) | A scoop with three small dots stacked above it | S | 20, 24/44 | the dots | no |
| serving-size | حجم الحصة | Serving size fact (powders only) | A scoop, its powder heap as the accent | S | 20, 24/44 | the heap | no |
| form-powder | بودرة | Product form fact | A tub with a scoop knocked out of its label | S | 20, 24/44 | none | no |
| form-capsule | كبسولات | Product form fact | Two capsules crossed at 34 degrees, each split by a gap | S | 20, 24/44 | one half | no |
| form-tablet | أقراص | Product form fact | Two round tablets, a score line knocked out of each | S | 20, 24/44 | none | no |
| form-softgel | كبسولات جيلاتينية | Product form fact | Two oval softgels, a highlight knocked out of each | S | 20, 24/44 | none | no |
| form-liquid | سائل | Product form fact | A bottle with a dropper, one drop as accent | S | 20, 24/44 | the drop | no |
| form-bar | بار | Product form fact | A bar in a wrapper, the torn end cut at 34 degrees | S | 20, 24/44 | the torn end | no |
| form-container | عبوة | Accessories and containers form fact | A shaker bottle, the cap line knocked out | S | 20, 24/44 | the cap | no |
| form-digital | رقمي | Digital guide form fact | A tablet screen with a page knocked out | S | 20, 24/44 | none | no |
| caffeine | كافيين | Caffeine fact on pre-workouts | A coffee bean, centre line knocked out | S | 20 | none | no |
| allergen | مسببات الحساسية | Allergen warning line | A solid triangle with a wheat ear knocked out | S | 20 | none | no |
| storage | طريقة الحفظ | Storage line in how-to and before-you-buy | A jar with its lid line knocked out and a small sun crossed by a slash beside it (keep away from heat) | S | 20 | the slash | no |
| gluten-free | خال من الغلوتين | Dietary badge | A wheat ear with one 34 degree slash knocked through | S | 20 | the slash | no |
| lactose-free | خال من اللاكتوز | Dietary badge | A milk carton with one 34 degree slash knocked through | S | 20 | the slash | no |
| low-sugar | سكر منخفض | Dietary badge | A sugar cube with a downward chevron knocked out | S | 20 | the chevron | no |
| vegan | نباتي | Dietary badge | A leaf, vein knocked out | S | 20 | none | no |

### B9. How-to-use steps (solid, 24 in a 44 plate)

The product page picks up to three steps by the product's form. Each step is one action, drawn as a scene of at most three shapes.

| Name | Arabic | Used for | What to draw | Accent | Flip |
|---|---|---|---|---|---|
| step-measure | قس الكمية | Powders, step 1 | A scoop levelled by a straight edge | the powder | no |
| step-pour | أضف الماء أو الحليب | Powders step 2, liquids step 1 | A glass tilted at 34 degrees over a shaker, a short stream | the stream | yes |
| step-shake | رج الخلط | Powders step 3, accessories step 2 | A shaker with two 34 degree motion cuts each side | the motion cuts | no |
| step-drink | اشرب | Powders, last step | A glass with a straw | the liquid line | no |
| step-with-water | مع الماء | Capsules, tablets, softgels | A capsule beside a glass | the capsule | no |
| step-with-meal | مع الطعام | Vitamins, omega-3, snacks | A plate with a fork | the fork | no |
| step-before-workout | قبل التمرين | Pre-workouts | A dumbbell with a forward arrow before it | the arrow | yes |
| step-after-workout | بعد التمرين | Recovery products | A dumbbell with a return arrow after it | the arrow | yes |
| step-daily | يوميا | Daily supplements and bundles | A calendar page with a repeat loop | the loop | no |
| step-unwrap | افتح العبوة | Bars and snacks | A wrapper peeled open at 34 degrees | the torn edge | no |
| step-fill | املأ | Shaker and accessories step 1 | A shaker with a fill line and an arrow into it | the arrow | no |
| step-rinse | اغسل | Shaker last step | A shaker under a stream of three drops | the drops | no |
| step-choose-value | اختر القيمة | Gift card step 1 | A card with a price tag cut at 34 degrees | the tag | no |
| step-email-code | يصلك الرمز | Gift card step 2 | An envelope with a code line knocked out | the code | no |
| step-redeem | استخدم الرمز | Gift card step 3 | A card entering a cart | the card | yes |
| step-download | حمل الملف | Digital guide | A downward arrow into a tray | the arrow | no |
| step-confirm | نؤكد الموعد | Services, last step | A speech bubble with a tick | the tick | yes |

### B10. Empty states and rating

| Name | Arabic | Function | What to draw | Fam | Size | Accent | Flip |
|---|---|---|---|---|---|---|---|
| empty-cart | السلة فارغة | Empty cart page and drawer | The cart basket, wheels as dots, dashed contents | S | 40/72 | the dashes | yes |
| search-empty | لا نتائج | Zero search results, empty listing | A lens with a slash across it | S | 40/72 | the slash | no |
| not-found | الصفحة غير موجودة | The 404 page figure | A folded page, corner cut at 34 degrees, a question mark knocked out | S | 96 | the corner | no |
| rating-star | نجمة فارغة | Empty star in ratings | A five point star outline | L | 20, 24 | none | no |
| rating-star-fill | نجمة | Filled star in ratings (Google reviews) | The same star, solid | S | 20, 24 | whole star orange | no |
| rating-star-half | نصف نجمة | Half star | The star, its start half solid | S | 20, 24 | the solid half | yes |

### B11. Product categories (solid, 36 on tiles, 24 in menus)

| Name | Arabic | What to draw |
|---|---|---|
| protein | البروتين | A protein tub with a scoop leaning against it at 34 degrees |
| creatine | الكرياتين | A small tub with three stacked crystals knocked out of the label |
| pre-workout | ما قبل التمرين | A tub with a lightning cut through the label at 34 degrees |
| amino-acids | الأحماض الأمينية | Three linked beads in a short chain |
| omega-3 | أوميغا 3 | A softgel drop with a small fish tail knocked out |
| vitamins-minerals | الفيتامينات والمعادن | A bottle with a round tablet knocked out of the label |
| collagen-beauty | الكولاجين والجمال | A jar with a three petal flower knocked out |
| daily-health | الصحة اليومية | A pill organiser of three compartments, one as accent |
| snacks-bars | السناكات والبارات | A bar with a bite cut at 34 degrees |
| accessories | الإكسسوارات | A shaker bottle with the lid knocked out |

Accent in each: the scoop, crystal, cut, bead or compartment that carries the idea.

### B12. Goals (solid, 32 over photographs)

| Name | Arabic | What to draw |
|---|---|---|
| goal-energy | الطاقة | A lightning bolt cut at 34 degrees |
| goal-performance | الأداء | A dumbbell rising on an upward arrow |
| goal-recovery | التعافي | A return loop around a small plus |
| goal-ideal-weight | الوزن المثالي | A tape measure coiled into a loop (no scale, no arrow down, no body) |
| goal-general-health | الصحة العامة | A leaf inside a shield shape |
| goal-hair-skin | الشعر والبشرة | A single flowing strand with a small sparkle |
| endurance | التحمل | A running track curve with two speed cuts |
| immunity | المناعة | A shield with a small dot pattern knocked out |
| wellness | العافية | A three petal lotus |
| better-sleep | نوم أفضل | A crescent moon with a small star |

Accent in each: the one part that carries the motion or spark.

### B13. Retired names (do not draw)

| Name | Why | Use instead |
|---|---|---|
| help | duplicate of customer service | customer-service or advisory |
| whatsapp, whatsapp-s | official brand glyph | the official WhatsApp mark |
| mark | the OptimalX X mark is the logo | the logo file |

---

## Part C: prompts and delivery

### C1. Order of batches (each goes live as it arrives)

1. **B4, B5, B6:** trust, services, booking (the most visible promise icons).
2. **B7, B8, B9, B3:** offers, product facts, how-to steps, status.
3. **B1, B2, B10:** navigation, buying controls, empty states and stars.
4. **B11, B12:** categories and goals.

### C2. Prompt to paste into Claude Design

Paste Part A first, then this, then the batch's tables:

> Draw every icon in the tables below as one consistent set for OptimalX, a premium Saudi sports nutrition and wellness store. Style: bold, premium, energetic, minimal. Follow the rules above exactly: 24 by 24 grid with 2 units of padding; solid family filled in currentColor with detail as knockouts, line family stroked 2 units with round caps and joins; every diagonal at 34 degrees from vertical; at most one accent part with the class ox-icon__accent; directional icons drawn pointing right. Export each icon as its own SVG named exactly as the Name column. Before export, show all icons of the batch side by side at 20px and 24px, black on white and white on black, and fix any part under 2.5 units, any gap under 2 units, and any icon that looks heavier or lighter than its family.

### C3. Delivery format

1. One folder, **optimal-x-icons-v3**: an `svg` folder with one file per icon named exactly as the Name column, and an `icons.json` manifest with one entry per icon: `name`, `category` (the section, for example "trust"), `family` ("solid" or "line"), `hasAccent`, `rtlFlip`.
2. Solid files: `fill="currentColor"`, no stroke. Line files: `stroke="currentColor"`, `stroke-width="2"`, `fill="none"`, round caps and joins. The accent part carries `class="ox-icon__accent"` (plus `ox-icon__accent--stroke` when it is a stroke).
3. No hard-coded colours, no embedded images, no text.
4. Put the folder or its zip in the project's public folder and tell me. I import it over v2, check every page at 390 and 1440 in Arabic and English, and release it.
