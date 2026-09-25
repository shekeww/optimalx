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
