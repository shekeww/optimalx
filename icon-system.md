# OptimalX icon system v2: the brief for Claude Design

Prepared 2026-09-25 from a full audit of both storefronts (Shopify live theme and the Salla build). Build the icons marked **NEW** and **REDRAW** in Claude Design, keep the ones marked **KEEP**, and send the folder back in the format at the end. I import it with the same script that installed v1 (scripts/import-owner-icons.mjs), so every page on both platforms updates at once.

## 1. What the audit found

- The sprite holds 96 icons. 47 are your v1 set. The other 49 were drawn during the build to fill gaps, so they do not share your set's construction. Examples are the solid black star, the thin chevrons, the plus and minus, the check marks and the dietary badges.
- Several icons say the wrong thing. The how-to-use steps on every product page show a scoop, a shaker and a straw, even on capsules, tablets, the shaker bottle itself, the gift card and the services. The home poster always shows the servings and serving-size scoops.
- Some icons are duplicates in all but name:
  - "heart" and "wishlist"
  - "truck" and "shipping"
  - "shield-check" and "authentic"
  - "tick" and "check"
  - "headset" and "help"
  - "bolt" and "goal-energy"
  - "gift" and "offers" (both are gift boxes)
  - "servings", "serving-size" and "scoop-cup" (three scoops)
- No icon is technically missing: every icon a page asks for exists. The problem is meaning and consistency, not gaps in the file.

## 2. Style rules (give these to Claude Design with every batch)

These keep v2 consistent with the 47 icons you already built, and push them toward the brand: premium, energetic, minimal.

1. **Grid and stroke.** 24 by 24 artboard, 2px padding (20 by 20 live area), 2px stroke, square caps, miter joins, no fills except the accent element. Same as v1.
2. **The brand angle.** Every diagonal that expresses motion or direction leans at 34° from vertical, the lean of the X mark and of the site's angled buttons and plates. This covers arrows, speed lines, cut corners and return loops. Where a container shape gets a corner cut (a card, a box, a plate), cut it at the same 34° lean. This is what makes the set feel kinetic without adding detail.
3. **One accent element, at most.** A single small part in the brand orange (#F54915): a solid wedge, a dot or one stroke. It marks the active part of the metaphor, such as the powder in the scoop, the code on the gift card or the arrow of a return. The icon must still read with the accent in the body colour, because the theme also shows icons in one colour.
4. **Minimal.** Two to four strokes per icon. No gradients, no shadows, no text inside an icon. The one exception is the official riyal symbol, where money is the subject.
5. **Readable at 16px.** Every icon ships at 16, 20, 24, 32, 36 and 44px from the same file. Check it at 16px in one colour before approving it.
6. **Direction.** Draw directional icons pointing forward in English, that is to the right: arrows, chevrons, carts, returns, shipping. Mark them "rtlFlip: true" and the theme mirrors them in Arabic. Nothing else flips.
7. **Claims-safe imagery.** No medical crosses, stethoscopes, heartbeat lines standing for health outcomes, flames for fat burning, scales with a downward arrow, or before-and-after bodies. InBody is drawn as a measurement device, never as a medical test.
8. **Brand marks are not drawn.** WhatsApp, Instagram, TikTok, Snapchat, X, Facebook, YouTube, Google, Apple Pay, mada, STC Pay, Visa, Mastercard, Tabby, Tamara and the riyal symbol come from each owner's official files. Section 4.11 lists them so nobody redraws one.

## 3. Status key

| Status | Meaning |
|---|---|
| KEEP | Your v1 icon is right; nothing to draw. |
| REFINE | Your v1 icon, but its drawing says the wrong thing where it is used; redraw it under the same name. |
| REDRAW | Exists today but was not drawn by you; draw it in your set's style under the same name. |
| NEW | Does not exist; the site needs it. |
| OPTIONAL | Useful, not blocking; draw it when the rest is done. |

## 4. The icons

### 4.1 Interface and navigation

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| menu | القائمة | Three horizontal lines, the middle one shorter and offset to the reading end. | none | Header, phone | KEEP |
| search | البحث | Magnifier. | none | Header, tab bar, search page | KEEP |
| cart | السلة | Cart. | none | Header, tab bar, cart page | KEEP |
| cart-add | أضف للسلة | Your cart with a small plus above its basket. | the plus | Quick add on product cards | REDRAW |
| user | الحساب | Head and shoulders. | none | Header, tab bar | KEEP |
| wishlist | المفضلة | Heart. The only heart in the set; "heart" is retired. | none | Cards, header | KEEP |
| home | الرئيسية | House. | none | Tab bar | KEEP |
| store | تسوق | Shopping bag. | none | Tab bar, shop menu | KEEP |
| categories | الأقسام | Four squares in a 2 by 2 grid, the top inline-end square cut at 34°. Replaces "grid". | the cut square | Tab bar, listing view toggle | REDRAW |
| list-view | عرض القائمة | Three rows, each a short square dot and a line. Replaces "list". | none | Listing view toggle | REDRAW |
| filter | تصفية | Funnel with straight edges. | none | Listing toolbar, phone filter button | REDRAW |
| sort | ترتيب | Two vertical arrows, one up and one down, side by side, heads cut at 34°. | the down arrow | Listing toolbar sort | REDRAW |
| close | إغلاق | Two crossing strokes; the leaning stroke at 34°, echoing the X mark. | none | Drawers, sheets, dialogs, chips | REDRAW |
| chevron-end | التالي | Single chevron pointing forward. | none | Buttons, links, rails, breadcrumbs | REDRAW, rtlFlip |
| chevron-start | السابق | Mirror of chevron-end. | none | Rail back buttons | REDRAW, rtlFlip |
| chevron-down | فتح | Chevron pointing down. | none | Accordions, menus, selects | REDRAW |
| chevron-up | إغلاق القسم | Chevron pointing up. | none | Open accordions, back to top | REDRAW |
| arrow | عرض الكل | Straight arrow forward, a short 34° tail line under the shaft for speed. | the tail line | "عرض الكل" links, primary buttons | REDRAW, rtlFlip |
| plus | زيادة | Plus. | none | Quantity bar, accordions | REDRAW |
| minus | نقص | Minus. | none | Quantity bar | REDRAW |
| check | صح | Check mark; the long stroke at 34°. The only check; "tick" is retired. | none | Feature lists, selected chips | REDRAW |
| check-circle | تم | Check inside a circle. | the check | Order placed, question received, form success | REDRAW |
| info | معلومة | "i" in a circle. | the dot | Notes, hints | REDRAW |
| warning | تنبيه | Triangle with an exclamation mark. | the dot | Label warnings, "before you buy" | REDRAW |
| external | يفتح في نافذة جديدة | Square with an arrow leaving its top inline-end corner at 34°. | the arrow | Links to Google Maps and reviews | REDRAW, rtlFlip |
| expand | تكبير | Four corner brackets. | none | Product gallery zoom | REDRAW |
| language | اللغة | Globe with one meridian and one parallel. Replaces "globe". | none | EN / العربية switch | REDRAW |
| play | تشغيل | Triangle. | none | Hero carousel autoplay | REDRAW, rtlFlip |
| pause | إيقاف | Two bars. | none | Hero carousel autoplay | REDRAW |
| copy | نسخ | Two overlapping cards, the front one with a 34° corner cut. | front card corner | Copy a gift card code or coupon | NEW |
| share | مشاركة | Three nodes joined by two lines. | one node | Share a product (WhatsApp share) | OPTIONAL |

### 4.2 Trust, shipping and payment

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| shipping | الشحن | Delivery truck moving forward, two short 34° speed lines behind it. The only truck; "truck" is retired. | the speed lines | Trust rows, cart, product page | KEEP (add the speed lines if you refine) |
| track-order | تتبع طلبك | Map pin standing on a dashed route line that ends in a small box. | the pin head | "تتبع طلبك" trust row, order page | NEW |
| delivery-estimate | موعد التوصيل | Calendar page with a small forward arrow crossing it at 34°. | the arrow | "التوصيل المتوقع" line on the product page | NEW |
| secure-payment | دفع آمن | Card with a stripe. | the chip | Trust rows, checkout note | KEEP |
| authentic | منتجات أصلية | Seal with a check. The only seal; "shield-check" and "badge" are retired. | the check | Trust rows, footer, product page | KEEP |
| expiry | تاريخ الصلاحية | Calendar with a marked day. | the day | Product page expiry line, poster facts | KEEP |
| registry | السجل التجاري | Document with a round seal in its lower corner. | the seal | Footer registration line, About page | REDRAW |
| returns | الاسترجاع | Box with an arrow looping back out of it at 34°. | the arrow | Return policy line, product trust rows, FAQ | NEW, rtlFlip |
| refund | استرداد المبلغ | Coin carrying the official riyal symbol, circled by a return arrow. | the arrow | "Refund within 24 hours" line | NEW, rtlFlip |
| cash-on-delivery | الدفع عند الاستلام | Banknote over an open hand. | the banknote corner | Payment methods row, checkout note | NEW |
| bank-transfer | تحويل بنكي | Bank building (pediment and three columns) with a forward arrow under it. | the arrow | Payment methods row | NEW, rtlFlip |
| installments | تقسيط | Circle split into four equal arcs, one in the accent. | one arc | Tabby and Tamara explanation line (beside their official marks, never replacing them) | OPTIONAL |

### 4.3 Offers, gifts and bundles

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| offers | العروض | Price tag with its hole, the tag's point cut at 34°. Not a gift box. No percent sign, because savings are shown in riyals. | the hole | Offers link, sale sections | REFINE |
| gift | هدية | Gift box with a bow. | the bow | Gifts, gift section | KEEP |
| gift-card | بطاقة هدية | Card with a ribbon crossing one corner and two short lines for the code. | the ribbon | Gift card product, gift card category tile, how-to steps | NEW |
| bundles | الحزم | Three boxes stacked, the top one offset toward the reading end. | the top box | Bundle product, bundles tile | REDRAW |
| points | النقاط | Star. The store has no points programme today. | the star | Not used | KEEP (not used now) |
| referral | دعوة صديق | Two people side by side. | the smaller figure's head | Salla account page only | OPTIONAL |

### 4.4 Contact, branch and hours

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| phone | الهاتف | Handset. | none | Contact page, FAQ row, phone menu | KEEP |
| mail | البريد | Envelope. | the flap | Contact page, newsletter | KEEP |
| map-pin | العنوان | Map pin. | the pin dot | Address lines | KEEP |
| branch-visit | زيارة الفرع | A storefront: an awning with three scallops over a door. Today it is a second map pin, too close to map-pin. | the awning | "احجز زيارتك", branch block, services, tab bar | REFINE |
| directions | الاتجاهات | Arrow turning forward on a road line. | the arrow | "افتح في خرائط جوجل" on the branch page | NEW, rtlFlip |
| hours | ساعات العمل | Clock face, hands at 10 and 2. Replaces "clock". | the minute hand | Hours table, the "open now" chip | REDRAW |
| calendar | اختر اليوم | Calendar page with a check on one day. | the check | Service booking: preferred day | REDRAW |
| time-morning | صباحا | Half sun rising over a line. | the sun | Booking time chips | OPTIONAL |
| time-afternoon | ظهرا | Full sun, four short rays. | the sun | Booking time chips | OPTIONAL |
| time-evening | مساء | Crescent. | the crescent | Booking time chips | OPTIONAL |

### 4.5 Services and advisory

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| customer-service | خدمة العملاء | Headset with a microphone. This is today's "help" drawing, renamed; "headset" is retired. | the microphone | Contact cards, reviews commitments, footer | REFINE (rename only) |
| help | مساعدة | Question mark inside a speech bubble. | the dot | FAQ links, "need help" rows, empty states | REFINE |
| written-question | سؤال مكتوب | Speech bubble with three dots. | the dots | Services, contact, branch | KEEP |
| video-consult | استشارة مرئية | Screen with a play mark. | the play mark | Services, category tile | KEEP |
| advisory | الاستشارة المجانية | Two speech bubbles overlapping, one outlined, one smaller behind it. | the small bubble | Advisory card, "اسأل قبل أن تشتري" | NEW |
| recommendation | ترشيح المنتج المناسب | Product tub with a forward arrow pointing at it from the side at 34°. | the arrow | Guidance card, "we guide you to what you need" | NEW |
| inbody | قياس InBody | Standing platform with two handles rising from its front edge, and a simple person outline standing on it. A measurement device: no heart line, no cross. | the handles | InBody measurement lines, branch visit, subscriptions | NEW |
| plan | خطة تغذية | Clipboard with two checked lines. | the checks | Nutrition plan service | REFINE |
| training | تدريب شخصي | Dumbbell. | the plates | Personal training | KEEP |
| aftersales | متابعة بعد البيع | Box with a circular arrow around it, arrowhead at 34°. | the arrowhead | Reviews commitments, services | NEW |
| lock | مغلق | Padlock. | the keyhole | Password page, privacy | KEEP |

### 4.6 Product categories

Keep all ten v1 icons: protein, creatine, pre-workout, amino-acids, omega-3, vitamins-minerals, collagen-beauty, daily-health, snacks-bars, accessories. They appear in the header shop menu, the categories page, the home category tiles and the phone shop sheet.

Optional sub-type icons, if you want the protein chips to carry icons later:

| Name | Arabic | What to draw | Status |
|---|---|---|---|
| whey-protein | واي بروتين | Your protein tub with a single drop above it. | OPTIONAL |
| whey-isolate | واي آيزوليت | Protein tub with a thin filter line across its body. | OPTIONAL |
| casein | كازين | Protein tub with a small crescent. | OPTIONAL |
| plant-protein | بروتين نباتي | Protein tub with a leaf. | OPTIONAL |
| mass-gainer | زيادة الوزن | Wider, taller tub with a plus. | OPTIONAL |

### 4.7 Goals

Keep all ten v1 icons: goal-energy, goal-performance, goal-recovery, goal-ideal-weight, goal-general-health, goal-hair-skin, endurance, immunity, wellness, better-sleep. They appear on the goal cards, the shop menu's goal column and the goal listings. "bolt" is retired; goal-energy covers it.

### 4.8 Product form and specification

The product page and cards need to say what the product physically is. These replace the three scoops.

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| form-powder | بودرة | Scoop holding a level mound of powder. | the powder | Form line, powder how-to step 1 | NEW |
| form-capsule | كبسولات | One capsule lying at 34°, split into two halves. | one half | Form line, capsule how-to | NEW |
| form-tablet | أقراص | Round tablet seen from above with a score line, a second tablet partly behind it. | the score line | Form line, tablet how-to | NEW |
| form-softgel | كبسولات جيلاتينية | Oval softgel with a small highlight. | the highlight | Omega-3 and similar | NEW |
| form-liquid | سائل | Bottle with a drop leaving its neck. | the drop | Liquids | NEW |
| form-bar | بار | Bar with one end unwrapped, the wrapper cut at 34°. | the unwrapped end | Bars | NEW |
| form-container | عبوة | Shaker bottle with a flip cap. Replaces today's "shaker". | the cap | Accessories (shakers, containers) | NEW |
| form-digital | ملف رقمي | Document with a down arrow at its foot. | the arrow | Digital products | NEW |
| servings | عدد الحصص | Three scoops in a row, spaced evenly, read as a count. | the middle scoop | Supply calculator, poster facts, spec chips | REFINE |
| serving-size | حجم الحصة | One scoop with a level line and a small tick mark beside it, read as an amount. | the level line | Spec chips, poster facts | REFINE |

Dietary badges, shown only when the product data carries the matching fact:

| Name | Arabic | What to draw | Accent | Status |
|---|---|---|---|---|
| vegan | نباتي | Leaf with a centre vein. Replaces "vegan-leaf". | the vein | REDRAW |
| low-sugar | قليل السكر | Sugar cube with one 34° slash through it. | the slash | REDRAW |
| gluten-free | خال من الجلوتين | Wheat ear with one 34° slash through it. | the slash | REDRAW |
| lactose-free | خال من اللاكتوز | Milk drop with one 34° slash through it. | the slash | OPTIONAL |
| caffeine | يحتوي على كافيين | Coffee bean. | the bean's centre line | OPTIONAL |
| allergen | مسببات الحساسية | Warning triangle with a small drop inside. | the drop | OPTIONAL |
| storage | طريقة الحفظ | Closed box with three short horizontal lines beside it, for a cool dry place. | the lines | OPTIONAL |

### 4.9 How-to-use steps

These fix the wrong glyphs on the product page. The site picks a set of up to three by the product's form. Draw them at 24 like the rest; they display at 44.

| Name | Arabic | What to draw | Accent | Used for | Status |
|---|---|---|---|---|---|
| step-measure | قس الكمية | Scoop leveled by a straight edge. | the powder | Powder, step 1 | NEW |
| step-pour | أضف الماء أو الحليب | Glass tilted over a shaker at 34°, a short stream between them. | the stream | Powder, step 2 | NEW |
| step-shake | رج الخلط | Shaker with two 34° motion lines on each side. | the motion lines | Powder, step 3; accessory, step 2 | NEW |
| step-drink | اشرب | Cup with a straw. Replaces "shaker-straw". | the straw | Powder, final step | NEW |
| step-with-water | مع كوب ماء | Glass of water, a capsule beside it. | the capsule | Capsules, tablets, softgels | NEW |
| step-with-meal | مع الوجبة | Plate with a fork and spoon crossing at 34°. | the plate rim | Vitamins, omega-3 | NEW |
| step-before-workout | قبل التمرين | Dumbbell with a small arrow leading into it. | the arrow | Pre-workout, creatine timing | NEW |
| step-after-workout | بعد التمرين | Dumbbell with a small arrow leaving it. | the arrow | Protein, recovery timing | NEW |
| step-daily | يوميا | Calendar with one repeating mark. | the mark | Daily-use products | NEW |
| step-unwrap | افتح واستمتع | Bar with its wrapper peeled open at 34°. | the wrapper | Bars | NEW |
| step-fill | املأ حتى العلامة | Shaker with a fill line. | the fill line | Accessory, step 1 | NEW |
| step-rinse | اغسل بعد الاستخدام | Shaker under three falling drops. | the drops | Accessory, step 3 | NEW |
| step-choose-value | اختر القيمة | Gift card with a small check on it. | the check | Gift card, step 1 | NEW |
| step-email-code | يصلك الرمز بالبريد | Envelope with the gift card's two code lines rising out of it. | the code lines | Gift card, step 2 | NEW |
| step-redeem | استخدم الرمز | Code field with a check at its inline end. | the check | Gift card, step 3 | NEW |
| step-book | احجز الموعد | Calendar with a check (use "calendar"). | the check | Services, step 1 | covered by calendar |
| step-confirm | يصلك التأكيد | Envelope with a check. | the check | Services, step 2 | NEW |
| step-download | حمل الملف | Arrow down into an open tray. | the arrow | Digital products | NEW |

### 4.10 Empty states and system messages

These display at 32 to 44px, so they can carry one more detail than the interface icons.

| Name | Arabic | What to draw | Accent | Where it appears | Status |
|---|---|---|---|---|---|
| empty-cart | السلة فارغة | Your cart with a dashed line where the contents would be. | the dashes | Empty cart | NEW |
| search-empty | لا نتائج | Magnifier with a short 34° slash inside the lens. | the slash | Search with no results | NEW |
| not-found | الصفحة غير موجودة | A road line that breaks off, with the gap cut at 34°. | the gap | 404 page (today it shows the brand mark) | NEW |
| order-success | تم الطلب | Box with a check on its front. | the check | Order confirmation | NEW |
| message-sent | تم الإرسال | Paper plane leaving at 34° with a short trail. | the trail | Newsletter success, question sent | NEW, rtlFlip |
| coming-soon | قريبا | Padlock with a small clock at its corner. | the clock | Password page | OPTIONAL |

### 4.11 Official marks: not drawn

These come from each brand's official files and keep their own colours. They are listed so nobody redraws one.

- **Messaging and social:** WhatsApp (today's hand-drawn "whatsapp" and "whatsapp-s" are replaced by the official glyph), Instagram, TikTok, Snapchat, X, Facebook, YouTube.
- **Reviews:** the Google mark is not used; the words "خرائط جوجل" carry the source.
- **Payment:** mada, Apple Pay, STC Pay, Visa, Mastercard, Tabby, Tamara.
- **Currency:** the riyal symbol is the official Saudi glyph. The site already carries it.
- **Brand:** the X mark and the OptimalX lockup are your logo files, not icons.

### 4.12 Retired names

These leave the sprite once v2 lands. Every place that uses one moves to the name on the right.

| Retired | Use instead |
|---|---|
| heart | wishlist |
| truck | shipping |
| shield-check, badge | authentic |
| tick | check |
| headset | customer-service |
| bolt | goal-energy |
| scoop-cup | form-powder or step-measure |
| shaker | form-container or step-shake |
| shaker-straw | step-drink |
| vegan-leaf | vegan |
| grid | categories |
| list | list-view |
| globe | language |
| clock | hours |
| star, star-fill | the rating stars below |
| whatsapp, whatsapp-s | the official WhatsApp glyph |
| mark | the X mark from your logo files |
| archive, document | not needed on the storefront |

### 4.13 Rating stars

| Name | What to draw | Status |
|---|---|---|
| rating-star | Five-point star, points slightly sharp, drawn on the same stroke as the set. The outline version is the empty star. | NEW |
| rating-star-fill | The same star filled solid in the accent. | NEW |
| rating-star-half | The same star, its inline-start half filled in the accent. | NEW, rtlFlip |

## 5. Brand graphic elements (drawn by me, nothing for you to build)

The two diagonal shapes you liked behind the advisory section are a skewed accent wash and a thin accent hairline beside it, both leaning at the brand angle. I will turn the pair into a reusable brand element and place it on a few chosen dark surfaces in the next round. It will also be exported as an SVG for posters and social posts.

## 6. How to deliver

1. **One folder,** named optimal-x-icons-v2, with the same layout as v1: an `svg` folder (one file per icon, named exactly as the Name column, for example `svg/gift-card.svg`) and an `icons.json` manifest with one entry per icon: name, category, hasAccent, rtlFlip.
2. **The accent part** carries the class `ox-icon__accent` when it is a filled shape. When it is a stroke, it carries `ox-icon__accent ox-icon__accent--stroke`. Everything else uses `currentColor`. This is how v1 works, and the theme colours the accent from it.
3. **No hard-coded colours** anywhere in the file, and no embedded images. Content credentials metadata can stay; the import strips it.
4. **Send it in batches** if that is easier:
   1. The how-to steps and product forms (4.8 and 4.9), which fix the visible errors.
   2. Trust and services (4.2 to 4.5).
   3. Interface (4.1).
   4. The rest.

   Each batch goes live as it arrives.

## 7. What changes on the site now, before the new icons arrive

- The how-to-use steps show the scoop, shaker and straw only on powders. Every other product shows the step numbers alone until its icons arrive. A number is honest; a scoop on a gift card is not.
- The home poster's facts show the servings and serving-size icons only for a powder product.
- When v2 lands, I map every step, stat, trust row and tile to the names above, retire the duplicates, and check every page on both platforms at 390 and 1440 in both languages.

## 8. Icon system v3: the bold set (the next brief for Claude Design)

Prepared 2026-09-25 after your direction: "match and inspire the identity and design of the icons with the icons and icons system in https://onthegoofficial.my, reflecting the bold premium energetic identity". Nobody but you draws an icon, so this section is the brief; the site already does everything it can with v2 in the meantime (8.2).

### 8.1 What the reference does, and what we take

The full audit, with crops, is the workshop note ref-icons-audit.md (session scratchpad, r8). In short:

- **Two families with opposite rules.** The icons that state what the product gives are **solid or heavy**: the value panel (protein, macros, calories, prebiotic) is fully solid, one colour, the detail cut out of the solid as negative space, two to four shapes per glyph; the feature row (80px) and the benefit row (60px) mix a heavy or thin outline with solid parts (a solid star in a ring, a solid core in a flame, one full silhouette); the comparison marks are solid discs with the tick or cross cut in. Everything else is **line**, and that includes the store's own shipping and payment promises: the service row (international delivery, processing, reliable delivery, secure payments) is a 2px outline at 40, and the trust row under the add to cart button a 1.5 line at 24, as light as the interface glyphs (search, account, cart, close, chevrons). The weight goes where the product's value is stated; no line on the reference is heavier than 1.5 in a 24 grid.
- **The accent is a container, not a line.** The value icons stand white on a solid accent disc (a 30 glyph in a 40 to 44 disc), the benefit icons white on black. The accent never draws a hairline.
- **Big, and the same size on a phone.** Service icons 40, benefit icons 60, feature icons 80, value icons 30 in their disc, at 390 and at 1440 alike. The layout reflows; the icon never shrinks. Much of the reference's boldness is this size and the heavy labels, not the stroke.
- **Bold labels beside them.** 14 to 20px at 700 to 900, 8 to 10px from the glyph beside it, 17 to 18px under it when stacked.
- **Almost no motion.** Only the play button scales on hover. The energy comes from mass and contrast.
- **What we do not take:** the red, the round discs (ours are plates on the 34° angle), and the 9px labels of its buy-box trust row.

### 8.2 What the site does now with v2, before v3 arrives

- **A heavier line, by size.** Your v2 files are drawn at 2 in the 24 grid; the theme now strokes them at 2.4 at 24 and under (a whole 2px line at the 20px minimum, the crispest a screen draws), 2.25 from 26 to 40, and your own 2 from 44 up. No icon on the site draws a line under 2px.
- **The icon tile.** Promise icons stand in a solid plate cut once at 34° on the corner that faces the label, the same at every width: an **orange plate with the glyph all white** on dark bands and cards (the home advisory and guidance facts, the channel cards), a **graphite plate with the glyph white and its accent orange** on light surfaces (the review facts, the service headers and service cards, the branch map, and the three empty and error states: the empty cart, an empty search and the 404 page). Sizes: glyph 24 in a 44 plate, 28 in a 48 (the services page's service cards), 32 in a 56, 40 in a 72.
- **Sizes.** Nothing draws under 20px; the header and tab bar glyphs are 24; the product page's trust and delivery rows are 24.

v3 gives the tiles and rows a drawing made for them, instead of a line icon made heavier.

### 8.3 Style rules for the solid family (give these to Claude Design with every batch)

1. **Grid.** 24 by 24 artboard, 2px padding (20 by 20 live area), as v1 and v2. The theme draws these at 24 inside a 44 plate, at 32 inside a 56, and at 20 bare in a row.
2. **Solid, one colour.** Filled silhouettes in `currentColor`, no stroke. Interior detail is cut out of the solid (a knockout), never drawn on top of it. The filled area covers roughly half of the live area: heavy enough to read as a mass at 20px, open enough for the knockouts to read.
3. **Minimum sizes in the 24 grid.** Any solid part at least 2.5 units across; any knockout or gap at least 2 units; nothing thinner. Check every icon at 20px in one colour before approving it.
4. **The brand angle.** One outer corner of the silhouette may be cut at 34° from vertical, the lean of the X mark and of the plates the icon stands in; every diagonal that expresses motion (an arrow, a return loop, a speed cut) leans at the same 34°. Other corners match v2: a small rounding (about 1 unit), never a large radius.
5. **Two to four shapes.** One idea per icon. No gradients, no shadows, no text, no outline around the solid.
6. **The accent, optional.** A solid icon may keep one separate part as its accent, with the class `ox-icon__accent`: the theme paints it orange on a graphite plate and white on an orange plate. Leave it out where the whole glyph is the idea; the plate already carries the colour.
7. **Direction and claims.** Unchanged from section 2: draw directional icons pointing right and mark them rtlFlip; no medical crosses, heartbeats, flames for fat burning, scales with a downward arrow or bodies; InBody is a measurement device.
8. **Brand marks are not drawn.** WhatsApp stays the official glyph (section 4.11), solid by design.

### 8.4 Rules for the line family (the interface glyphs)

The interface stays line: search, account, cart, menu, close, chevrons, arrows, plus and minus, filter, sort, language, share, copy, external. Keep drawing them at 2; the theme strokes them at 2.4. Three drawings need room at that weight:

| Name | What to change | Status |
|---|---|---|
| plan | The ticks inside the clipboard close up at 2.4. Open them so each tick keeps 2 units of clear space. | REFINE |
| inbody | The platform lines crowd the figure at 2.4. Keep the figure and one platform line, 2 units apart. | REFINE |
| registry | The document's inner lines crowd the accent dot at 20px. One inner line, the dot 2 units clear of it. | REFINE |
| every other line icon | Nothing to draw; the theme sets the heavier stroke. | KEEP |

### 8.5 The solid set to draw

Each is a new file named `<name>-solid` beside the line file of the same name (for example `svg/advisory-solid.svg`); the line file stays for the places that need a line. Batches in the order they go live:

**Batch 1: the promise tiles (live today, in the plates of 8.2)**

| Name | Where it stands | What to draw | Status |
|---|---|---|---|
| advisory-solid | orange plate 44/24: home and services facts; graphite 56/32: review facts | Two overlapping speech bubbles, the rear one solid, the front one knocked out of it with a 2 unit outline. | NEW, rtlFlip |
| inbody-solid | orange plate 44/24 | The measurement platform as a solid slab, the two hand grips as solid posts, a figure knocked out between them. A device, not a body scan. | NEW |
| recommendation-solid | orange plate 44/24 | A solid tag with a 34° cut corner, a forward arrow knocked out of it. | NEW, rtlFlip |
| authentic-solid | orange plate 44/24 (the product trust grid only if you choose Batch 2) | A solid seal (the v2 scalloped badge filled), the check knocked out. | NEW |
| written-question-solid | orange plate 44/24: channel card; graphite 48/28: service card; graphite 56/32: service header | A solid speech bubble with a tail, three dots knocked out. | NEW, rtlFlip |
| video-consult-solid | orange plate 44/24; graphite 48/28: service card; graphite 56/32 | A solid screen, the play triangle knocked out. | NEW |
| branch-visit-solid | orange 44/24; graphite 48/28: service card; graphite 56/32: service header, review facts, branch map | The storefront with its awning as a solid, the door knocked out, the awning stripes as knockouts at 2 units. | NEW |
| training-solid | graphite 48/28: service card; graphite 56/32: service header | A solid dumbbell, the grip thinner than the plates, the plates cut at 34°. | NEW |
| plan-solid | graphite 56/32 | A solid clipboard, two ticks knocked out, 2 units apart. | NEW |
| aftersales-solid | graphite 56/32 | A solid return loop around a small box, the loop's head cut at 34°. | NEW, rtlFlip |
| empty-cart-solid | graphite 72/40: the empty cart | The cart basket as a solid, the wheels as solid dots, the dashed contents as the accent. | NEW, rtlFlip |
| search-empty-solid | graphite 72/40: an empty search | A solid lens, the slash as the accent. | NEW |
| not-found-solid | graphite 72/40: the 404 page | The same construction as search-empty-solid, with its own mark. | NEW |

**Batch 2 (optional, your choice): trust and payment rows (24 bare, beside a bold label)**

This batch is not a lesson from the reference. The reference draws its shipping and payment rows in line: its service row is a 2px outline at 40 and its trust row under the add to cart button a 1.5 line at 24. The site keeps your v2 line drawings in these rows at the heavier 2.4, which already outweighs them. Draw this batch only if you want the rows to share the solid look of the plates; skip it and they stay line.

| Name | Where it stands | What to draw | Status |
|---|---|---|---|
| secure-payment-solid | product trust grid, utility bar | A solid card with the stripe knocked out, a small solid lock at its corner. | NEW |
| shipping-solid | product trust grid, utility bar, delivery row | A solid truck, the wheels knocked out of the body line, the cab cut at 34°. | NEW, rtlFlip |
| returns-solid | product trust grid | A solid box, the return arrow knocked out. | NEW, rtlFlip |
| delivery-estimate-solid | delivery row | A solid clock face with the hands knocked out, a forward arrow. | NEW, rtlFlip |
| cash-on-delivery-solid, bank-transfer-solid, installments-solid | payment chips | Solid versions of the v2 drawings, the same knockout rule. | NEW |

**Batch 3: categories and goals (tiles 36, goal cards 26 over photographs)**

| Name | Where it stands | What to draw | Status |
|---|---|---|---|
| the ten category icons (4.6), each as `<name>-solid` | category tiles and the categories page | Solid versions of the v1 drawings. A solid reads over a photograph or a plate far better than a line. | NEW |
| the ten goal icons (4.7), each as `<name>-solid` | goal cards over photographs | Solid versions, the accent kept as the one orange part. | NEW |

### 8.6 What the theme draws, not the file

- **The plates.** Never draw a disc, a square or a badge behind an icon: the theme draws the plate, cuts it at 34°, colours it and mirrors it for Arabic. The file is the glyph alone.
- **Sizes.** No icon under 20px; plates of 44, 48, 56 and 72.
- **Spacing, measured on the site at 390 and 1440 in both languages (2026-09-26).**
  - **A leading icon and its label in a row: 8px.** The utility bar, buttons and links, the product page's trust grid and delivery rows, the payment pills, the footer's registration lines, the plan and scope lists, the service cards' WhatsApp link, the advisory plate's directions link.
  - **Beside a plate:** 12px beside a 44 or 48 plate (the advisory and guidance facts, the service cards), 16px beside a 56 (the review facts, the service headers).
  - **Trailing arrows and chevrons that belong to their word: 4px,** so the glyph reads as part of the label: the menu's disclosure chevron, "view all" arrows, "show more" chevrons, the external-link glyph, the breadcrumb separators.
  - **Under a stacked icon:** 8px in the goal cards (26 glyph), the channel cards (44 plate) and under the branch map's 56 plate; 4px in the category tiles' compact body, where the 36 glyph's own 3px of padding brings the visible gap to about 7; 16px under the 72 plate of an empty or error state.
  - **Not an icon and label pair, spaced by their own component:** arrow faces in their own square or angled chip (the offer strip's arrow and WhatsApp faces, the branch gallery covers, the featured rail's call to action, the carousel arrows), the header's icon buttons, the chevron at the far end of an accordion row, the plus and minus of a quantity stepper beside the number, and the illustration column of a step list (the product page's how-to steps: a bare 44 beside the numbered text, 20px).
- **Motion.** None on icons, as on the reference: the weight and the angle carry the energy.

### 8.7 How to deliver v3

1. One folder, **optimal-x-icons-v3**, the same layout as v2: an `svg` folder with one file per icon, named exactly as the Name column, and an `icons.json` manifest with one entry per icon: name, category, hasAccent, rtlFlip, and one new field, family, set to "solid" or "line".
2. Solid files use `fill="currentColor"` and no stroke; the optional accent part carries the class `ox-icon__accent`. No hard-coded colours, no embedded images.
3. Send it in the batches of 8.5 (Batch 2 only if you choose it). Each batch goes live as it arrives: I extend the import script to carry the solid family beside the line one, swap each call site of the batch to its solid name, and check every page at 390 and 1440 in both languages.
