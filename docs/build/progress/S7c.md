# S7c: the advisory band, the offer first

Batch: the owner's 2026-09-24 brief on the live services band ("audit and
enhance design, sizing, spacing and content. It should be clear, easy to
understand, premium, trusted, real, highly conversional, understanding of a
client's needs, and show that we offer free advisory and an InBody test in
store"), plus the coordinator's addendum to fold in the services, door and
plan items of `docs/build/UX-2026-09-24.md`.

Everything measured below is read off the running preview at
`http://localhost:3210` with a headless Chrome over the DevTools protocol, at
390x844 dpr 3 mobile and 1440x900, plus 768 and 1024 probes. Nothing in the
measurement section is token arithmetic.

---

## 1. The decisions, before the code

### 1.1 What the screenshot showed, and what each defect actually was

The owner's screenshot of the live band at 1890 shows six cards and two grey
notes. Read as a shopper rather than as a builder, it fails in five places:

1. **The offer is the least visible thing on the band.** The two facts the
   owner wants seen first, the advice is free, and the branch measures body
   composition with InBody for nothing, were a 14px note under a row title
   and a 14px line inside the third card. The heading and the six card titles
   all outrank them.
2. **Nothing looks pressable.** Every one of the six cards ended in an accent
   word plus a detached 24px chevron box. That is a link disguised as
   decoration, on the section whose whole job is to be clicked.
3. **The lower half of every card is empty.** A 232/260 `min-block-size` floor
   on cards holding three short lines. The plan cards were worse: the audit
   measured the title, line and action inside the top 110px of a ~300px card
   (P1-20).
4. **The money line floats.** "مجاني" and "50.00" sat on a baseline with
   nothing holding them, opposite the chevron box.
5. **The InBody fact says two different things on one screen** (P0-12): "يشمل
   قياس تكوين الجسم (InBody) مجانا في الفرع." on the visit card, and "… مجانا
   في الفرع مع الاشتراك." under the plans row.

### 1.2 The composition that ships, on BOTH pages

```
eyebrow     المعلومة أولا، ثم القرار
h2          اسأل قبل أن تشتري  /  ابدأ من هنا        (home / services)
subline     نختار تشكيلة محدودة، ونشرح ما على الملصق، ونرشح ما يناسب هدفك. …
──────── 32 ────────────────────────────────────────────────────────────
OFFER STRIP   one plate, the identity's corner cut, --ox-graphite-3
  fact 1      استشارة مجانية: سؤال مكتوب أو زيارة الفرع.
  fact 2      قياس تكوين الجسم (InBody) مجانا في الفرع.   (gated)
  primary     احجز زيارتك   -> the branch-visit product
  secondary   اسأل الآن     -> the written-question product
  cue         نرد على السؤال المكتوب خلال {{hours}} ساعة عمل.  (gated)
──────── 40 ────────────────────────────────────────────────────────────
h3          ثلاث طرق تسأل بها        + note
  3 doors   icon 24 accent / name / one line / price chip / 48px button
            the written door: البداية المقترحة + accent outline + filled
──────── 40 ────────────────────────────────────────────────────────────
h3          برامج وخطط تدعم هدفك     + note
  3 plans   photograph band + ink plate at the foot: name / لمن / two
            included items / live "من" price / 48px outline button
──────── 32 ────────────────────────────────────────────────────────────
trust       the branch address (pin) · the consultation credit (gated)
closing     الرد رأي عام من فريق المتجر لمساعدتك في الاختيار، وليس استشارة صحية.
home only   كل الخدمات  (text link -> /services)
```

### 1.3 The eight decisions that needed a reason

**1. The offer is a plate, not a note.** It sits directly under the head, it
is the only element in the band carrying the identity's corner cut
(`ox-x-corner(40px, start)`, lean 40 / run 27.0), and its two facts are the
largest text in the band after the h2. It holds the band's filled primary,
which is what turns "we help" into "book it".

**2. The type ladder had to move to make that true.** The brief's test is that
the strip "must be the largest text after the heading", and the ladder has no
step between `h3` (18→20) and `h2` (24→32). Rather than invent a size, the
strip takes h3's size and the ROW TITLES step down to `.ox-title` (17→18);
they stay `<h3>` elements, so the heading outline is untouched. Card titles
are `.ox-title` too, which is that role's own definition ("the panel and card
heading"). Measured: h2 32/700, strip 20/700, row and card titles 18/700 at
1440; 24 / 18 / 17 at 390.

**3. Every card ends in a real button, so the card stopped being a link.** A
control cannot live inside an `<a>`, so `ChannelDoor` and `PlanCard` are plain
containers now and the CTA is the only anchor. The cards lose their hover ring
and focus ring; the button carries both. The detached chevron icon-buttons
(`.ox-iconbtn--angled`, `.ox-plan__arrow`) are deleted, per the brief.

**4. The recommended door is the written question, and its eyebrow is NOT
"ابدأ من هنا".** The brief asks for that string; `ox.home.band_title_services`
is already exactly "ابدأ من هنا" and it is the band's own h2 on `/services`,
so the brief's string would have put the same two words twice on one screen -
the defect S5c existed to fix. The eyebrow is `ox.home.door_recommended` =
"البداية المقترحة" instead: same job, no collision, and it never reads as a
second, competing "start here". The door is the written question because it is
free, needs no appointment, reaches the whole of Saudi Arabia and commits
nobody to a purchase; the branch visit is the strip's own primary, so the two
are not the same action twice. Recommendation lives in `app/content/services.ts`
(`ServiceChannel.recommended`), so both pages recommend the same door.

**5. The band has two filled buttons and that is deliberate.** The strip's
primary is the band's call to action; the recommended door's filled button is
the row's default choice. Everything else on the band is an outline button or
a text link, and the home page's way out to `/services` was demoted from a
filled `عرض الكل` to a text link named after its destination.

**6. The InBody fact is said once, in one sentence.** P0-12's finding, fixed by
retiring `ox.home.band_inbody_plans` and restating
`ox.content.services.visit_inbody` as the single sentence the whole theme
uses, now exported as `SERVICES_HUB.inbodyKey`. A unit test asserts the
substring "InBody" appears exactly once in the rendered band. Which wording
survives is explained in 2.2.

**7. The plan cards trade their watermarks for a plate.** X-IDENTITY 4.1 allows
one watermark per SECTION and this row drew three, plus a decorative glyph per
card. All four are gone. The text block moved to the foot of the card on a
solid `--ox-ink` 0.92 plate (P1-20's fix, and what lets the card carry a list
of inclusions without a contrast argument per line). With no text over the
photograph any more, 4.5's alpha floor no longer binds the scrim, so the scrim
was lightened and the frame raised to 0.9, see 4.4.

**8. The band no longer reveals.** X-IDENTITY 5.1's table reads "Advisory band
| nothing", and this band was staggering two rows against it. It is also an
availability question, not a taste one: this batch's own first screenshot pass
caught the plans row still at `opacity: 0` after a full scroll pass, because
the `IntersectionObserver` callback never arrived in headless. A row that
holds the offer may not depend on an observer to exist.

---

## 2. Copy

Every string is Modern Standard Arabic, carries no combining mark, no dialect
token, no em-dash and no machine tell (`check-copy`: 0 problems on both base
locales and on the new partials).

### 2.1 New keys (`locales/partials/s7c.ar.json` / `s7c.en.json`)

| Key | Arabic | English | Claims |
|---|---|---|---|
| `ox.home.offer_advisory` | استشارة مجانية: سؤال مكتوب أو زيارة الفرع. | Free advice: a written question or a branch visit. | A fact about the shop's own price list, not about anybody's health: OX-044 and OX-046 are both 0 in the live catalogue, and the band's closing line still bounds what the advice is. The brief's own wording. |
| `ox.home.offer_cta_ask` | اسأل الآن | Ask now | A verb the reader does. Distinct from the written door's own "اكتب سؤالك", so no two controls in the band read identically while pointing at the same product. |
| `ox.home.door_recommended` | البداية المقترحة | Suggested start | A recommendation stated as ours, in the voice's own register ("نرشح لك الأنسب لهدفك", voice 7.2). No superlative, no count, no rating. See decision 4 for why it is not "ابدأ من هنا". |
| `ox.home.plan_price_from` | من | From | A price qualifier. The figure beside it is always the live product's. |
| `ox.services.view_all` | كل الخدمات | All services | UX audit P1-7: `عرض الكل` appears 12 times on the home page pointing at 12 URLs. The audit proposed "كل الخدمات والاشتراكات"; the catalogue holds no subscription product, so naming one would have been an invented offer. |

### 2.2 Changed values (edited in the declaring partial, mirrored into the base)

| Key | Was | Now (AR) | Now (EN) | Why |
|---|---|---|---|---|
| `ox.content.services.visit_inbody` (`s5`) | يشمل قياس تكوين الجسم (InBody) مجانا في الفرع. | قياس تكوين الجسم (InBody) مجانا في الفرع. | A free InBody body-composition measurement at the branch. | P0-12: one sentence for the theme. "يشمل" was card-shaped grammar; the strip states the fact. The audit proposed adding "مع زيارة محجوزة أو مع اشتراك"; that condition is not what the owner's own 2026-09-24 brief says ("we offer free advisory and an InBody test in store") and it is wider than the initialed claims row, so the shorter, unconditional-at-the-branch reading ships and the condition is not invented. Still a MEASUREMENT and a PLACE: no تشخيص، فحص، تحليل، قراءة نتائج، تفسير, no number, no timeframe, no outcome. |
| `ox.home.plan_nutrition_line` (`b2`) | افهم من أين تبدأ وما الذي تحتاجه فعلا. | لمن يقف أمام الرف ولا يعرف من أين يبدأ. | For anyone standing at the shelf with no idea where to start. | The brief asks each plan card for one line of WHO it is for. Taken from the already-approved `hub_subline`. |
| `ox.home.plan_training_line` (`b2`) | جلسة شخصية في المدينة المنورة أو عبر مكالمة مرئية. | لمن يريد برنامجا أسبوعيا يناسب أيامه ومستواه. | For anyone who wants a weekly programme that fits their days and level. | Same rule; drawn from `training_desc`. The where-line it replaced is still on the service's own page. |
| `ox.home.plan_advisory_line` (`b2`) | المنتجات مرتبة بالأولوية، تصلك بعد المكالمة. | لمن يريد قائمة مكتوبة يشتري منها لاحقا. | For anyone who wants a written list to buy from later. | Same rule; the deliverable it replaced is now one of the card's two included items. |

### 2.3 Retired (deleted from both base locales and from its partial)

| Key | Where | Why |
|---|---|---|
| `ox.home.band_inbody_plans` ("… مجانا في الفرع مع الاشتراك.") | `s5` | The second of the two InBody wordings (P0-12). The band states the fact once, in the offer strip. |

### 2.4 Reused without change

`ox.home.band_eyebrow`, `ox.home.band_subline`, `ox.home.band_title_services`,
`ox.home.band_row_ask_title` / `_note`, `ox.home.band_row_plans_title` /
`_note`, `ox.home.services_reply`, `ox.home.band_card_cta`,
`ox.content.services.visit_cta_short`, `written_cta_short`, `video_cta`,
`training_cta`, `card_footer`, `ox.common.free`, `ox.blocks.branch.address`,
and, as the plan cards' included items, six existing scope keys:
`written_scope_1`, `written_scope_3`, `training_scope_4`, `training_scope_1`,
`video_scope_1`, `video_scope_2`. Every inclusion a card promises is a line its
own destination page already lists.

---

## 3. What the band is made of, in code

| File | What changed |
|---|---|
| `app/components/home/OxServices.tsx` | `OfferStrip` and `TrustRow` are new; `ChannelDoor` is a container with a flag, an accent glyph, a price chip and a real button; `BandRow` lost its gated cue and its reveal; the home CTA is a named text link. |
| `app/components/home/PlanCard.tsx` | Container, not an anchor: an ink plate at the foot carrying name, a "لمن" line, two included items with the check glyph, a reserved live price row and a 48px outline button. No watermark, no foot glyph, no chevron. |
| `app/content/services.ts` | `ServiceChannel.recommended` replaces `inbodyKey`; `SERVICES_HUB.inbodyKey` is the theme's one InBody sentence; `HomePlan` gains `itemKeys` and the optional `sku` whose live price the card may print. |
| `app/styles/06-ox/_b2-home.scss` (section 8 only) | Band padding tiers; the offer strip; the door and plan rules rewritten; the trust row; the retired `__cue`, `__foot`, `__free`, `__cta`, `__watermark`, `__icon`, `__arrow` rules deleted; the plan photo and scrim retuned. |
| `app/components/home/defaults.ts` | The re-measured reserved pair, itemised child by child. |
| `app/components/home/HomeSkeleton.tsx` | The skeleton draws the offer plate and the trust bar it did not have. |
| `locales/partials/s7c.{ar,en}.json` | New: the five keys above. |
| `locales/partials/s5.{ar,en}.json`, `b2.{ar,en}.json`, `locales/{ar,en}.json` | Four changed values in their declaring partials, mirrored; one retirement deleted from both bases. |
| `tests/home/OxServices.test.tsx` | Rewritten to the new contract: 21 tests. |
| `tests/pages/ServicesHub.test.tsx` | The offer strip on `/services`, the reply line under it, and "InBody appears once on the page". |

**`app/components/pages/ServicesHub.tsx` was NOT edited.** The band mount
already passes `routeOut={false}` and `.ox-hub__advisory`, its docblock still
describes the composition accurately, and S7b is editing that file's masthead
in parallel. The brief allowed one surgical edit; none was needed, so none was
made. `_b5-pages.scss`, `claims.ts` and `twilight.json` were likewise not
touched: no new gate was needed.

---

## 4. Measurements

Headless Chrome over CDP, own page target per run, closed after each.

### 4.1 Spacing, against the brief's own list

| Asked for | Measured at 390 | Measured at 1440 |
|---|---|---|
| band padding 56 / 80 / 96 by tier | `padding-block: 56px` | `96px` (and 80 at the 768 probe) |
| head to strip 32 | 32 | 32 |
| strip to row 40 | 40 | 40 |
| row title to cards 16 | 16 | 16 |
| cards gap 16 / 24 | `gap: 16px`, 1 column | `gap: 24px`, 3 columns |
| card padding 24 / 32 | 24 | 32 top and sides, 24 at the foot |
| CTA height 48 | every band button 48 | every band button 48 |
| 1-up 390 / 2-up 768 / 3-up 1024 | `358px` | `416px 416px 416px`; 768 probe `340.5px 340.5px`, 1024 probe `299px x3` |
| row to row (not specified, kept at the strip's 40) | 40 | 40 |
| cards to trust row | 32 | 32 |

The card foot is 24 at every tier on purpose: the brief's check is "no card
with more than 24px of empty space under its CTA", so the 768 block raises the
top and the sides to 32 and leaves the foot at 24.

### 4.2 The cards

| | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| door heights | 259.8 / 235.6 / 234.6 | 269.2 / 269.2 / 243.7 | 270.1 x3 | 271.6 x3 |
| space under a door CTA | 24 / 24 / 24 | 24 | 24 | 24 |
| plan heights | 340 x3 | 380 x3 | 380 x3 | 380 x3 |
| space under a plan CTA | 24 / 24 / 24 | 24 | 24 | 24 |
| plan plate, share of the card | 65.3 / 77.7 / 77.7 % |, |, | 62.2 / 73.8 / 73.8 % |

**Equal per ROW, which is what grid stretch can promise.** At 1024 and 1440 the
three doors are one row and measure identically. At 768 the grid is 2-up: doors
one and two are one row and are equal (269.2), door three is a row of its own
at 243.7. At 390 every card is its own row, so each is exactly as tall as its
own copy, which is the brief's other requirement ("sized to their content, no
empty half") and the reason the old 232/260 floor is gone.

The plan cards keep a floor (340 / 380) because the photograph needs a band to
live in; the plate then takes whatever the copy needs above the foot, which is
why the nutrition card (no price row) shows more photograph than the other two.

### 4.3 The offer strip

| | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| block-size | 296.8 | 188.4 | 162.9 | 164 |
| inline-size | 358 |, |, | 1296 (1232 on `/services`) |
| padding | 24 | 32 | 32 | 32 |
| fact text | 18 / 700 |, |, | 20 / 700 |

The strip declares NO block-size, so `check-identity`'s `small-angle` rule has
nothing to match; and it measures over 158 at every tier, 162.9 at its
tightest, so X-IDENTITY 3.2's floor for a panel-scale cut holds on its own
terms rather than by a pragma. The clip reads
`polygon(0 0, calc(100% - 27px) 0, 100% 40px, 100% 100%, 0 100%)` in RTL: lean
40, run 27.0, the top inline-start corner, 7.5 % of the plate at 390 and 2.1 %
at 1440, both far inside 2.3's 24 % budget.

### 4.4 Contrast, for the three things that changed colour

- **The free chip.** `--ox-accent` at 0.16 over `--ox-graphite-3` composites to
  #4B3630; `--ox-ink-on-dark` on it is **10.0 : 1**. Accent as a tint, never as
  type: accent text on `--ox-graphite-3` measures 3.63 : 1 and would have
  failed at chip size, which is also why the recommended door's flag is ink
  with a 16x2 accent rule rather than orange type (the same construction
  `.ox-services__eyebrow` already uses).
- **The plan plate.** `--ox-ink` at 0.92. X-IDENTITY 4.5's floor is alpha 0.60
  for `--ox-ink-on-dark` over a worst-case white photograph pixel; 0.92 clears
  it for every pixel of any frame the merchant may swap in.
- **The plan scrim and frame.** The scrim's stops were lightened (0.66 → 0.22,
  from 0.94 → 0.46) and the frame raised from 0.55 to 0.9. Declared out loud
  because it departs from 4.5's table: that table sets a floor for a photograph
  that CARRIES TEXT, and this card carries none any more. The 236/124 degree
  directions and the two-rule mirroring are unchanged. Before the change, the
  one visible band of each card rendered as a black rectangle, the same empty
  photograph the audit raised, moved to the top of the card.

### 4.5 Reserved height and layout shift

`HOME_BLOCK_HEIGHTS['ox-services']` becomes **{ mobile: 2740, desktop: 1524 }**
(was 2051 / 1085), measured rather than derived, itemised in `defaults.ts`:

| | 390 | 1440 |
|---|---|---|
| padding | 56 + 56 | 96 + 96 |
| head (+ margin) | 124 + 32 | 134 + 32 |
| offer strip (+ margin) | 296.8 + 40 | 164 + 40 |
| row one | 826.6 | 339.2 |
| row gap | 40 | 40 |
| row two | 1116.6 | 447.6 |
| trust (+ margin) | 32 + 20.8 | 32 + 22.4 |
| closing note (+ margin) | 16 + 41.6 | 16 + 22.4 |
| view-all link (+ margin) | 16 + 26 | 16 + 26 |
| **total** | **2740.4** | **1523.5** |

Read back live: the lazy shell reserves **2740** at 390 and **1524** at 1440
against a mounted band of 2740.4 and 1523.5, inside half a pixel at both ends.

**Two late-growth sources were found and removed while measuring this.** The
door's price and the plan's price both arrive from React Query AFTER mount, so
each was inserting a row into an already-painted card and pushing the page
under the reader. The door's facts row now holds `min-block-size: 24px` and the
plan's price row is reserved (`min-block-size: 26px`, rendered empty for any
card that has a product and filled when the figure lands, absent entirely where
no product backs the card). Measured effect on the band's own contribution to
CLS at 390: **0.72 → 0.37 → 0** after both fixes, and the residual entry
attributed to `s-block--ox-services` is the Salla block shell collapsing from
253px to 0 during the route's progressive render (`from [591, 253] → to [0,
0]`), which is a home-route behaviour above this band, not the band's own box.
At 1440 no shift is attributed to the band at all.

---

## 5. The band as the page serves it

`/ar`, 1440, read out of the mounted DOM.

| Slot | Rendered text |
|---|---|
| eyebrow | المعلومة أولا، ثم القرار |
| h2 | اسأل قبل أن تشتري |
| subline | نختار تشكيلة محدودة، ونشرح ما على الملصق، ونرشح ما يناسب هدفك. لا نكتب أنظمة غذائية ولا نفسر تحاليل. |
| offer fact 1 | استشارة مجانية: سؤال مكتوب أو زيارة الفرع. |
| offer fact 2 | قياس تكوين الجسم (InBody) مجانا في الفرع. |
| offer primary | **احجز زيارتك** -> `/ar/p1051830221` |
| offer secondary | **اسأل الآن** -> `/ar/p487045117` |
| offer cue | absent (`reply_sla_hours` is empty on this store) |
| row 1 title / note | ثلاث طرق تسأل بها · اسأل اليوم وقرر لاحقا. السؤال لا يلزمك بأي شراء. |
| door 1 | *البداية المقترحة* · سؤال مكتوب · رد مكتوب من فريق المتجر. · مجاني · **اكتب سؤالك** -> `/ar/p487045117` |
| door 2 | استشارة مرئية 20 دقيقة · مواعيد محدودة يوميا. عبر Google Meet أو واتساب. · 50.00 ر.س · **احجز موعدك** -> `/ar/p2000960449` |
| door 3 | زيارة الفرع · الخالدية، المدينة المنورة. الحجز اختياري. · مجاني · **احجز زيارتك** -> `/ar/p1051830221` |
| row 2 title / note | برامج وخطط تدعم هدفك · حين تريد أكثر من إجابة واحدة، هذه هي الخطوة التالية. |
| plan 1 | التغذية والمكملات · لمن يقف أمام الرف ولا يعرف من أين يبدأ. · اختيار المنتج المناسب لهدفك وميزانيتك · طريقة الاستخدام والتوقيت · (no price) · **اعرف التفاصيل** -> `/ar/services#nutrition-plans` |
| plan 2 | التمرين والتدريب · لمن يريد برنامجا أسبوعيا يناسب أيامه ومستواه. · برنامج أسبوعي مكتوب · تقنية التمارين الأساسية · من 150.00 ر.س · **احجز الجلسة** -> `/ar/p103621577` |
| plan 3 | قائمة مكتوبة بعد الاستشارة · لمن يريد قائمة مكتوبة يشتري منها لاحقا. · اختيار المنتجات حسب الهدف والميزانية · ترتيب الأولوية بين المنتجات · من 50.00 ر.س · **اعرف التفاصيل** -> `/ar/p2000960449` |
| trust | حي الخالدية، شارع جبار بن صخر، المدينة المنورة |
| closing | الرد رأي عام من فريق المتجر لمساعدتك في الاختيار، وليس استشارة صحية. |
| view all | كل الخدمات -> `/services` |

`/ar/services` renders the identical band through the identical component, with
two differences and no third: the h2 is **ابدأ من هنا**, and there is no
view-all link. Measured there: band 1481.5 at 1440 and 2698.4 at 390, strip
164 / 296.8, doors 271.6 x3 and 259.8 / 235.6 / 234.6, plans 380 / 340, 24
under every CTA, the same numbers as the home band, less the link. The offer strip appears exactly once on that page (asserted in
`tests/pages/ServicesHub.test.tsx`), inside `.ox-hub__advisory`, never in the
masthead.

Screenshots taken with `Page.captureScreenshot` clipped to `.ox-services`:
`band-1440.png`, `band-390.png` (home) and `hub-1440.png` / `hub-390.png`
(`/services`), in
this session's scratchpad at
`C:\Users\Ahmed\AppData\Local\Temp\claude\c--Users-Ahmed-OneDrive-Desktop-optimalx\ff691bcb-344e-4a12-98cc-98d989eacf7d\scratchpad`.
They are session-scoped, which is why the rendered text above is transcribed
into this file rather than pointed at.

---

## 6. The UX audit, folded in

| Item | Applied | How, or why not |
|---|---|---|
| **P0-12** InBody says two things, once each | yes | One sentence (`SERVICES_HUB.inbodyKey`), stated once on the band, asserted by test. The audit's longer conditional wording was not adopted, see 2.2. Its third leg (render it on the booking product page, `ServicePdp.tsx`) is outside this batch's files and stays open. |
| **P1-20** plan cards put everything in the top fifth | yes | `.ox-plan__body { margin-block-start: auto }` plus the solid plate, exactly the audit's fix, extended with the included list and the price the brief asks for. |
| **P1-7** `عرض الكل` twelve times | partly | The band's own button is now `ox.services.view_all` = "كل الخدمات" and a text link. Not "كل الخدمات والاشتراكات": no subscription product exists. The other eleven instances belong to `SectionHeader` and the rails. |
| **P1-9** the comparison table has holes; the band says "three" while the page details five | no | The row holds exactly three doors, so "ثلاث طرق تسأل بها" is true of the row it titles, and the same title on the home page (where no five-service table exists) would lose accurate information by dropping the count. The mismatch is between the TABLE and the page, and `ServiceCompare` plus the missing `services.ts` comparison fields are not this batch's files. Left for the batch that fills the table. |
| **P0-4** `/ar/services` renders zoomed out on a phone | not mine, and it landed while this batch ran | Reproduced live mid-batch: at a 390 viewport the page reported `innerWidth` 720 and `scrollWidth` 720 where `/ar` reported 390, and the band itself laid out correctly at 390 inside it. A concurrent batch has since added `position: relative` to `.ox-compare__scroller` in `_b5-pages.scss`; re-measured after that landed, `/ar/services` at 390 reports 390 / 390 and the band measures 2698.4 (the home band's 2740.4 less the 42 the view-all link and its margin take). Recorded because the band measurements above were taken on both sides of that fix. |
| **P2-10** `/services` repeats its h1 as a hidden h2 | no | `ServicesHub.tsx`'s intro section, which S7b is editing. |
| **P1-6** the mobile home is eighteen screens | no, and this batch made it longer | The band grew from ~2014 to 2740 at 390, because the composition the owner asked for is bigger: an offer plate, six 48px buttons, six inclusion lines and a trust row. The audit's own fix for P1-6 is in `defaults.ts`' rail list and block order, which is a different batch; flagged here so the two are read together. |
| **P0-11**, **P0-13**, **P1-8**, **P1-10**, **P2-9** | no | Posters/offers headings, the supply calculator, the goal landing, the brand index and a service description: none is in this batch's file list. |

---

## 7. Verification

```
pnpm typecheck
$ tsc --noEmit                    (clean, no output)

pnpm vitest run tests/home tests/pages tests/blocks tests/common
 Test Files  33 passed (33)
      Tests  355 passed (355)

pnpm vitest run tests/i18n.test.ts tests/i18n-keys.test.ts \
                tests/i18n-claims.test.ts tests/content
 Test Files  8 passed (8)
      Tests  114 passed (114)

pnpm check:rtl        check-rtl: 328 file(s), 0 problem(s)
pnpm check:motion     check-motion: 328 file(s), 0 problem(s)
pnpm check:strings    check-strings: 326 file(s), 0 problem(s)
node scripts/check-copy.mjs locales/ar.json locales/en.json
                      check-copy: 2 file(s), 0 problem(s)
node scripts/check-claims.mjs
                      check-claims: 36 file(s), 0 problem(s), 4 allowlisted
node scripts/check-tokens.mjs
                      check-tokens: 123 token(s) defined, 322 file(s), 0 problem(s)
node scripts/check-identity.mjs
                      check-identity: 328 file(s), 0 problem(s)
node scripts/i18n-merge.mjs --check
                      locales\ar.json: 1381 partial key(s), 0 added, 0 updated
                      locales\en.json: 1381 partial key(s), 0 added, 0 updated
node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css
                      compiles clean (pre-existing @import deprecations only)
```

The four allowlisted claims findings are the pre-existing
`official_distributors` / `trust_distributors` pair, unrelated to this batch.

---

## 8. Deviations

1. **The recommended door's eyebrow is "البداية المقترحة", not the brief's
   "ابدأ من هنا"** (decision 4): that exact string is already the band's own h2
   on `/services`, and shipping it twice on one screen is the defect S5c was
   written to fix. Reversible by changing one value in `locales/partials/s7c.*`.
2. **The plan cards carry no InBody item**, though the brief lists "قياس InBody
   مجاني" among the example inclusions. P0-12 asks for one sentence in one
   place and the brief's own item 1 puts that sentence in the offer strip, at
   the largest type in the band; repeating it 800px lower inside a card is the
   repetition the audit raised. Each card carries two real inclusions instead.
3. **The doors' one-line copy does not switch on the SLA.** The brief suggests
   "رد مكتوب من فريق المتجر خلال ساعات العمل" when `reply_sla_hours` is set.
   The existing `written_meta` is already the brief's else-case verbatim, and
   the SLA fact renders under the offer's buttons with its real number; a
   second, number-free version of the same promise on the card would be the
   two-wordings defect again, in a new place.
4. **The trust row states the reply time under the offer, not in the row.** The
   brief lists the SLA in both places. One gated fact, one wording, one place.
   The trust row carries the address and the gated consultation credit.
5. **The branch address falls back to the locale line** when
   `branch_address` is empty, which it is on this store. `OxBranch.tsx` already
   does exactly this, the street is in the claims source, and a trust row whose
   only row disappears on an unconfigured store is a worse failure than a true
   sentence the owner can override from the dashboard.
6. **The band's reveal was removed** (decision 8), which the brief did not ask
   for. It is X-IDENTITY 5.1 conformance plus the measured failure described
   there. The same 5.1 violation is still live on `OxBrands`, `OxCategories`
   and `OxPosters`, which are other builders' files: reported, not touched.
7. **The plan scrim and frame opacities depart from X-IDENTITY 4.5's table**
   (4.4 above), because no text sits over the photograph any more. Flagged
   rather than done quietly, because 4.5 is a binding contrast table and a
   later audit should find the reasoning rather than rediscover the numbers.
8. **Band padding of 56 / 80 / 96 departs from DIRECTION 4.2**, which prices a
   dark band's internal padding at 48 mobile / 64 desktop. The brief specifies
   the three tiers; DIRECTION's own 96 row already names the services band, so
   this moves that breath inside the band rather than inventing it.
9. **Two files the brief allowed were not edited at all**:
   `app/components/pages/ServicesHub.tsx` (no change needed, and S7b is editing
   its masthead) and `_b5-pages.scss` (the band's own rule there is still
   correct, the `/services` band measures 1296 wide with the strip at 1232).
   `claims.ts` and `twilight.json` needed no new gate.
10. **The browser work was done with headless Chrome over the DevTools
    protocol**, not the chrome-devtools MCP tools, which are not attached to
    this session. Own page target per run, closed after each, Chrome killed at
    the end; the measurement script is in the session scratchpad. Every number
    in section 4 is a live read, not arithmetic.
