# OptimalX icon system 2: the bold set (brief for Claude Design)

Prepared 2026-09-26 from your direction: "match and inspire the identity and design of the icons with the icons and icons system in https://onthegoofficial.my, reflecting the bold premium energetic identity". This file replaces nothing you already drew. Your v2 line icons stay on the site; this set adds a **solid family** for every icon that carries a promise, and refines three line icons. Generate it in Claude Design batch by batch and send each batch back in the format of section 7; each batch goes live on optimalx.com.sa as it arrives.

## 1. The idea in one paragraph

The reference store runs two icon families with opposite rules. The icons that carry a promise (delivery, secure payment, protein, the comparison ticks) are **solid masses**: one colour, the detail cut out of the solid as negative space, two to four shapes per glyph, big, and the same size on a phone as on a desktop. The interface glyphs (search, cart, close, chevrons) stay **thin and quiet**. The weight sits where the promise is. OptimalX takes that structure and keeps its own identity: the orange #F54915 instead of their red, angled plates on the brand's 34 degree lean instead of round discs, and bold labels that never go below the site's size floors.

## 2. Style rules for the solid family (paste these into Claude Design with every batch)

1. **Grid.** 24 by 24 artboard, 2 units of padding (a 20 by 20 live area).
2. **Solid, one colour.** Filled silhouettes in `currentColor`, no stroke at all. Interior detail is cut out of the solid (a knockout), never drawn on top of it. The filled area covers roughly half of the live area: heavy enough to read as a mass at 20px, open enough for the knockouts to read.
3. **Minimum sizes.** Any solid part at least 2.5 units across; any knockout or gap at least 2 units. Nothing thinner. Check every icon at 20px in one colour before approving it.
4. **The brand angle.** One outer corner of the silhouette may be cut at 34 degrees from vertical, the lean of the X in the logo. Every diagonal that shows motion (an arrow head, a return loop, a speed cut) leans at the same 34 degrees. Other corners get a small rounding of about 1 unit, never a large radius.
5. **Two to four shapes, one idea.** No gradients, no shadows, no outlines around the solid, no text inside an icon.
6. **One accent part, optional.** A single separate shape may carry the class `ox-icon__accent`. The site paints it orange on a dark plate and white on an orange plate. Leave it out when the whole glyph is the idea.
7. **Direction.** Draw directional icons pointing right (forward in English) and mark them `rtlFlip: true`; the site mirrors them in Arabic. Nothing else flips.
8. **Claims-safe imagery.** No medical crosses, stethoscopes, heartbeat lines, flames for fat burning, scales with a downward arrow, or bodies. InBody is drawn as a measurement device, never as a medical test.
9. **Brand marks are never drawn.** WhatsApp, Instagram, TikTok, Snapchat, X, Google, Apple Pay, mada, STC Pay, Visa, Mastercard, Tabby, Tamara and the riyal symbol come from their official files.
10. **The file is the glyph alone.** Never draw a disc, square or badge behind an icon: the site draws the plate, cuts it at 34 degrees, colours it and mirrors it for Arabic.

## 3. How the site will show them

| Use | Plate | Glyph size | Colour |
|---|---|---|---|
| Promise tiles on dark bands and cards (home advisory and guidance facts, channel cards) | orange plate 44, cut at 34 degrees | 24 | glyph white |
| Promise tiles on light surfaces (review facts, service headers, branch map) | graphite plate 56 | 32 | glyph white, accent orange |
| Empty states (empty cart, empty search, 404) | graphite plate 72 | 40 | glyph white, accent orange |
| Trust and payment rows under the buy button | none | 24 | ink, beside a bold 14 to 16px label |
| Category tiles and goal cards | none | 32 to 36 | white over the photo, accent orange |

The same sizes on phone and desktop: the layout reflows, the icon never shrinks. 8px between an icon and its label in a row, 12px beside a 44 plate, 16px beside a 56. No motion on icons.

## 4. The solid set to draw

Each file is named `<name>-solid.svg` (for example `advisory-solid.svg`). The line file of the same name stays for the places that need a line.

### Batch 1: the promise tiles (they replace the heavier line icons in today's plates)

| Name | Arabic | What to draw | Accent | rtlFlip |
|---|---|---|---|---|
| advisory-solid | الاستشارة | Two overlapping speech bubbles: the rear one solid, the front one knocked out of it with a 2 unit outline. | none | yes |
| inbody-solid | قياس InBody | The measurement platform as a solid slab, the two hand grips as solid posts, a simple figure knocked out between them. A device, not a body scan. | the grips | no |
| recommendation-solid | التوصية | A solid tag with a 34 degree cut corner, a forward arrow knocked out of it. | none | yes |
| authentic-solid | منتجات أصلية | A solid scalloped seal, the check knocked out. | none | no |
| written-question-solid | سؤال مكتوب | A solid speech bubble with a tail, three dots knocked out. | none | yes |
| video-consult-solid | استشارة فيديو | A solid screen on a short stand, the play triangle knocked out. | the triangle | no |
| branch-visit-solid | زيارة الفرع | A storefront with its awning as one solid, the door knocked out, the awning stripes as 2 unit knockouts. | none | no |
| training-solid | التدريب الشخصي | A solid dumbbell, the grip thinner than the plates, the plate edges cut at 34 degrees. | none | no |
| plan-solid | خطة التغذية | A solid clipboard, two ticks knocked out 2 units apart. | the clip | no |
| aftersales-solid | ما بعد البيع | A solid return loop around a small box, the loop's head cut at 34 degrees. | the loop head | yes |
| empty-cart-solid | السلة فارغة | The cart basket as a solid, wheels as solid dots, a dashed line of contents as the accent. | the dashes | yes |
| search-empty-solid | لا نتائج | A solid magnifier lens, a slash across it as the accent. | the slash | no |
| not-found-solid | الصفحة غير موجودة | A solid folded page with its corner cut at 34 degrees, a small question mark knocked out. | the corner | no |

### Batch 2: trust, delivery and payment rows

| Name | Arabic | What to draw | Accent | rtlFlip |
|---|---|---|---|---|
| shipping-solid | الشحن | A solid truck, the wheels knocked out of the body line, the cab cut at 34 degrees, two short speed cuts behind it. | the speed cuts | yes |
| secure-payment-solid | دفع آمن | A solid card, the stripe knocked out, a small solid lock on its corner. | the lock | no |
| returns-solid | الاسترجاع | A solid box, a return arrow knocked out of its face. | none | yes |
| refund-solid | استرداد المبلغ | A solid coin with a circular return arrow cut around it. Leave the coin's centre open: the site places the official riyal symbol there. | the arrow head | yes |
| delivery-estimate-solid | موعد التوصيل | A solid calendar page, a forward arrow knocked out across it at 34 degrees. | none | yes |
| track-order-solid | تتبع الطلب | A solid map pin standing on a short route line that ends in a small solid box. | the pin head | no |
| cash-on-delivery-solid | الدفع عند الاستلام | A solid banknote resting on an open hand, the note's centre knocked out as an oval. | the note's corner | no |
| bank-transfer-solid | تحويل بنكي | A solid bank building (pediment and three columns as knockouts), a forward arrow beneath it. | the arrow | yes |
| installments-solid | تقسيط | A solid circle split into four equal arcs by 2 unit gaps, one arc as the accent. | one arc | no |
| store-credit-solid | رصيد الشراء | A solid wallet, a coin half out of it with a plus knocked out. For the 100% cashback credit. | the coin | no |

### Batch 3: services, booking, subscriptions, offers and bundles (the new features)

| Name | Arabic | What to draw | Accent | rtlFlip |
|---|---|---|---|---|
| booking-slot-solid | احجز موعدك | A solid calendar page with one day block knocked out and a small clock in its corner. The booking picker's header. | the day block | no |
| time-slot-solid | الوقت | A solid clock face, the hands knocked out, one tick at 12 as the accent. | the tick | no |
| booking-confirmed-solid | تم الحجز | A solid calendar page with a check knocked out. | the check | no |
| subscription-solid | اشتراك | Two solid arrows chasing each other in a loop, heads cut at 34 degrees. For subscribe and repeat plans. | one arrow | no |
| package-solid | الباقة | A clean solid box with a ribbon cross knocked out. For the 3-month package. | the ribbon knot | no |
| bundle-solid | باقات المنتجات | Two solid boxes, the front one overlapping the rear, a plus knocked out of the front. | the plus | no |
| offers-solid | العروض | A solid price tag with a 34 degree cut corner, a round hole knocked out, and a bold stripe across it as the accent. No percent sign. | the stripe | yes |
| gift-card-solid | بطاقة هدية | A solid card with a bow knot on its corner, a code line knocked out. | the bow | no |
| whatsapp-ask | not drawn | Uses the official WhatsApp glyph. Listed so nobody draws one. | n/a | n/a |

### Batch 4: product facts (the product page's stat and spec rows)

| Name | Arabic | What to draw | Accent | rtlFlip |
|---|---|---|---|---|
| servings-solid | عدد الحصص | A solid scoop with three small solid dots stacked above it. Powders only. | the dots | no |
| serving-size-solid | حجم الحصة | A solid scoop, its powder heap as the accent. Powders only. | the heap | no |
| form-powder-solid | بودرة | A solid tub with a scoop knocked out of its label. | none | no |
| form-capsule-solid | كبسولات | Two solid capsules crossed at 34 degrees, each split by a 2 unit gap. | one capsule half | no |
| form-tablet-solid | أقراص | Two solid round tablets, a score line knocked out of each. | none | no |
| form-softgel-solid | كبسولات جيلاتينية | Two solid oval softgels, a highlight knocked out of each. | none | no |
| form-liquid-solid | سائل | A solid bottle with a dropper, one drop as the accent. | the drop | no |
| form-bar-solid | بار | A solid bar in a wrapper, the wrapper's torn end cut at 34 degrees. | the torn end | no |
| caffeine-solid | كافيين | A solid coffee bean with its centre line knocked out. | none | no |
| gluten-free-solid, lactose-free-solid, low-sugar-solid | خال من الغلوتين، خال من اللاكتوز، سكر منخفض | A solid wheat ear, milk carton and sugar cube respectively, each with a single 34 degree slash knocked through it. | the slash | no |
| vegan-solid | نباتي | A solid leaf, its vein knocked out. | none | no |

### Batch 5: categories and goals (tiles and cards over photographs)

Solid versions of your v1 drawings, same ideas, filled and simplified to the rules of section 2. A solid reads over a photograph far better than a line.

| Names | Arabic |
|---|---|
| protein-solid, creatine-solid, pre-workout-solid, amino-acids-solid, omega-3-solid, vitamins-minerals-solid, collagen-beauty-solid, daily-health-solid, snacks-bars-solid, accessories-solid | البروتين، الكرياتين، ما قبل التمرين، الأحماض الأمينية، أوميغا 3، الفيتامينات والمعادن، الكولاجين والجمال، الصحة اليومية، السناكات والبارات، الإكسسوارات |
| goal-energy-solid, goal-performance-solid, goal-recovery-solid, goal-ideal-weight-solid, goal-general-health-solid, goal-hair-skin-solid, endurance-solid, immunity-solid, wellness-solid, better-sleep-solid | الطاقة، الأداء، التعافي، الوزن المثالي، الصحة العامة، الشعر والبشرة، التحمل، المناعة، العافية، نوم أفضل |

Keep the ideal-weight goal free of scales with a downward arrow, and every goal free of bodies (rule 8).

## 5. The line family: three refinements only

The interface stays line: search, account, cart, menu, close, chevrons, arrows, plus and minus, filter, sort, language, share, copy, external. Keep drawing them at a 2 unit stroke; the site strokes them at 2.4 so they carry the bold identity.

| Name | What to change |
|---|---|
| plan | The ticks inside the clipboard close up at the heavier stroke. Open them so each tick keeps 2 units of clear space. |
| inbody | The platform lines crowd the figure. Keep the figure and one platform line, 2 units apart. |
| registry | The document's inner lines crowd the accent dot at 20px. One inner line, the dot 2 units clear of it. |

## 6. Prompts to paste into Claude Design

Paste section 2 first, then one of these per batch, then the batch's table.

- **Batch 1:** "Draw these 13 icons as a solid, single colour set on a 24 by 24 grid with 2 units of padding, following the style rules above. Premium, energetic and minimal: bold masses, detail cut out as negative space, one corner or motion line on a 34 degree lean. Export each as its own SVG named exactly as the Name column, fill currentColor, no strokes, the optional accent part with class ox-icon__accent."
- **Batch 2 to 5:** the same prompt with the batch's count and table. For batch 5 add: "These are solid versions of the attached v1 line icons; keep each idea and simplify it to two to four shapes."
- **Review each batch before export:** view all icons side by side at 20px in black on white and white on black; no part under 2.5 units, no gap under 2 units, every diagonal at 34 degrees.

## 7. How to deliver

1. One folder, **optimal-x-icons-v3**, the same layout as v2: an `svg` folder with one file per icon named exactly as the Name column, and an `icons.json` manifest with one entry per icon: name, category, hasAccent, rtlFlip, and a new field **family**, set to "solid" or "line".
2. Solid files use `fill="currentColor"` and no stroke; the optional accent part carries the class `ox-icon__accent`. No hard-coded colours, no embedded images.
3. Put the folder (or a zip of it) in the project's public folder and tell me. I import it beside v2, switch every place the batch covers to its solid icon, and check every page at 390 and 1440 in Arabic and English before it goes live.
