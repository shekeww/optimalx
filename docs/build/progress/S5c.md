# S5c: the "اسأل قبل أن تشتري" services section, home and /services

Batch: the owner's 2026-09-23 (late night) brief on the advisory section, plus
the coordinator's same-night addendum (the "we curate, guide and recommend"
positioning line and the free InBody branch measurement).

---

## 1. What was wrong, in the owner's three points

1. **The eyebrow said the heading.** `ox.home.band_eyebrow` was "قبل أن تشتري"
   and the h2 was "اسأل قبل أن تشتري". DIRECTION amendment A4 allows an eyebrow
   only when it states a fact the heading lacks; this one stated a subset of
   the heading's own words.
2. **The two rows had no titles.** Six cards sat under one heading in one list,
   so the three ways to ask and the three programmes read as six equal boxes,
   which is the exact failure S2c had split the section apart to avoid and the
   S4a rebuild reintroduced.
3. **No single next step.** Every card said "اعرف التفاصيل", including the two
   that book something, and `/services` opened on its own fuller channel
   section, so the same three services introduced themselves twice on that page
   (three times counting the comparison grid) in two card shapes.

A fourth defect surfaced while reading the data rather than the design: two of
the six cards were the SAME product. Row one's video door and row two's
"استشارة مرئية" card both pointed at OX-045 with near-identical titles. That is
the "six equal boxes" reading in its purest form and it is fixed here (see
Deviations 1).

---

## 2. The composition that ships, on BOTH pages

```
eyebrow        المعلومة أولا، ثم القرار              (a frame, not the heading)
h2             اسأل قبل أن تشتري   /  ابدأ من هنا    (home / services)
subline        نختار تشكيلة محدودة، ونشرح ما على الملصق، ونرشح ما يناسب هدفك.
               لا نكتب أنظمة غذائية ولا نفسر تحاليل.
────────────── row 1 ───────────────────────────────────────────────────────
h3             ثلاث طرق تسأل بها
note           اسأل اليوم وقرر لاحقا. السؤال لا يلزمك بأي شراء.
cue (gated)    نرد على السؤال المكتوب خلال {{hours}} ساعة عمل.
cards          سؤال مكتوب · استشارة مرئية 20 دقيقة · زيارة الفرع
────────────── row 2 ───────────────────────────────────────────────────────
h3             برامج وخطط تدعم هدفك
note           حين تريد أكثر من إجابة واحدة، هذه هي الخطوة التالية.
cue (gated on) قياس تكوين الجسم (InBody) مجانا في الفرع مع الاشتراك.
cards          التغذية والمكملات · التمرين والتدريب · قائمة مكتوبة بعد الاستشارة
────────────────────────────────────────────────────────────────────────────
primary        عرض الكل → /services        (home)
               the written-question door, marked primary   (/services)
closing        الرد رأي عام من فريق المتجر لمساعدتك في الاختيار، وليس استشارة صحية.
```

**The merge, and why it reads better than keeping both.** The brief allowed
either keeping `/services`' fuller channel cards above the band or merging the
two into one composition. **Merged**, for three reasons that are about the
reader rather than about the code:

- the same three services were already introduced three times on `/services`
  (the channel section, the comparison grid, the five full sections). Removing
  the first of the three removes a repeat, not information;
- the brief asks for BOTH row titles on BOTH pages. With the channel section
  still in place, row one's title would have had to appear twice on `/services`
  over two different renderings of the same three services;
- nothing was lost. Every channel's description, scope, preparation, output,
  change policy and price still renders in its own `ServiceSection` further
  down the page, and the two claims gates the fuller card carried (the verbatim
  `consultation_credit_note`, the `reply_sla_hours` line) moved onto the band
  with their test ids intact. `ChannelCard.tsx` itself is untouched and still
  ships on `/contact` and in the kitchen sink, so its own test file needed no
  edit at all.

The page-level reply line in the hub intro (`ox-reply-line`,
`ox.services.reply_within`) went with the section: with the band stating the
reply time under the row where the written question actually sits, the page
would otherwise have promised the same thing twice in two wordings within one
screenful. Its key is retired rather than left unused.

---

## 3. The copy table

Every string below is Modern Standard Arabic, carries no combining mark, no
dialect token, no em-dash and no banned construction (`check-copy` on both base
locales: 0 problems). "Claims" states why each passes
`docs/build/research/FINAL-claims-source.md` §3/§4.

### 3.1 New keys (`locales/partials/s5.ar.json` / `s5.en.json`)

| Key | Arabic | English | Claims |
|---|---|---|---|
| `ox.home.band_title_services` | ابدأ من هنا | Start here | An instruction, no claim. Exists so the band's h2 on `/services` is not the page h1 repeated word for word. |
| `ox.home.band_row_ask_title` | ثلاث طرق تسأل بها | Three ways to ask | A count of what is on the page (3 real channels, OX-044 to OX-046), not an invented statistic. |
| `ox.home.band_row_ask_note` | اسأل اليوم وقرر لاحقا. السؤال لا يلزمك بأي شراء. | Ask today and decide later. A question commits you to no purchase. | Removes risk instead of promising a result. Second sentence restates the already-approved `ox.services.faq_3_a`. |
| `ox.home.band_row_plans_title` | برامج وخطط تدعم هدفك | Programmes and plans that support your goal | "تدعم" is the §4 allowed verb family. "تحقق هدفك" would have been the outcome promise the design audit banned; it is not used. |
| `ox.home.band_row_plans_note` | حين تريد أكثر من إجابة واحدة، هذه هي الخطوة التالية. | When you want more than one answer, this is the next step. | States the sequence, promises nothing. This is the "clear next step" the owner asked the section to carry. |
| `ox.content.services.written_cta_short` | اكتب سؤالك | Write your question | A verb the reader does (voice §3.7). Two words for a third-of-a-row card. Differs from the hub hero's own "أرسل سؤالك" so no two buttons on `/services` read identically. |
| `ox.content.services.visit_cta_short` | احجز زيارتك | Book your visit | Same rule; the card's own line keeps "الحجز اختياري." so the shorter verb does not overstate. |
| `ox.home.band_inbody_plans` | قياس تكوين الجسم (InBody) مجانا في الفرع مع الاشتراك. | Free InBody body-composition measurement at the branch with a subscription. | Owner statement 2026-09-23, recorded as row 10 of the claims source. A service fact: what is measured, where, and what it comes with. No تشخيص، فحص طبي، تحليل، قراءة نتائج, and no outcome attached. Gated on `inbody_included`. |
| `ox.content.services.visit_inbody` | يشمل قياس تكوين الجسم (InBody) مجانا في الفرع. | Includes a free InBody body-composition measurement at the branch. | The same fact, door-sized, on the one channel that happens at the branch. Same gate. |

### 3.2 Changed values (edited in the declaring partial and mirrored into the base)

| Key | Was | Now (AR) | Now (EN) | Why |
|---|---|---|---|---|
| `ox.home.band_eyebrow` (`s2`) | قبل أن تشتري | المعلومة أولا، ثم القرار | Information first, then the decision | The owner's point 1. The line is the founders' story verbatim (voice doc §7.2, and §7.5 points the advisory band's own copy at it). It frames the offer and states an order of operations the heading does not. |
| `ox.home.band_subline` (`s2`) | نشرح المنتج وطريقة استخدامه والجرعة المطبوعة على الملصق. لا نكتب أنظمة غذائية ولا نفسر تحاليل. | نختار تشكيلة محدودة، ونشرح ما على الملصق، ونرشح ما يناسب هدفك. لا نكتب أنظمة غذائية ولا نفسر تحاليل. | We keep a small range, explain what is on the label, and recommend what fits your goal. We do not write diet plans and we do not interpret lab results. | The coordinator's positioning line (curate, guide, recommend) in one sentence of three clauses, taken from the story's own approved wording ("نختار تشكيلة محدودة نعرفها", "نشرح لك معنى الأرقام على الملصق", "نرشح لك الأنسب لهدفك"). No superlative. The honest scope stays as sentence two. Written as one sentence on purpose: three one-word sentences would be the banned triad (voice §3.5). |
| `ox.home.plan_advisory_title` (`b2`) | استشارة مرئية | قائمة مكتوبة بعد الاستشارة | A written list after the consultation | See Deviations 1. Row one already sells the call; row two now names what the reader leaves with, which is the already-approved `video_output` ("قائمة مكتوبة بالمنتجات المقترحة نرسلها بعد المكالمة"). |
| `ox.home.plan_advisory_line` (`b2`) | 20 دقيقة تسأل فيها قبل أن تشتري. | المنتجات مرتبة بالأولوية، تصلك بعد المكالمة. | The products in priority order, sent to you after the call. | The old line was row ONE's frame written on a row TWO card. The new one is the deliverable, no timeframe promise ("بعد المكالمة", never "خلال يومين"). |

### 3.3 Retired keys (deleted from both base locales and from their partials)

| Key | Where it was | Why it is gone |
|---|---|---|
| `ox.services.channels_title` ("اختر الطريقة التي تناسبك") | `b5` | Its section is the band's row one now; the row title says what the row is. |
| `ox.home.plans_intro` ("جانب المساعدة في المتجر: استشارة، أو تدريب، أو خطة…") | `b2` | Already unrendered before this batch; `ox.home.band_row_plans_note` is the line that now does its job. |
| `ox.services.reply_within` ("الرد خلال {{hours}} ساعة عمل.") | `b5` | The hub intro's page-level reply line was a second wording of the same gated promise the band now states once. |

### 3.4 Reused without change

`ox.services.title`, `ox.home.band_card_cta` ("اعرف التفاصيل", now the CTA of
the two plan cards that open an explaining page), `ox.content.services.video_cta`
("احجز موعدك", already two words so the door reuses it rather than declaring a
duplicate), `ox.content.services.training_cta` ("احجز الجلسة"),
`ox.home.services_reply`, `ox.content.services.card_footer`, `ox.common.free`,
`ox.common.view_all`, and every channel `*_title` / `*_meta`.

**No "اشترك" anywhere.** The brief lists it among the allowed CTA verbs, but
the catalogue holds four service products and no subscription product
(`fixtures/store/products.json`: OX-044 free, OX-045 50, OX-046 free, OX-047
150). A subscribe button would have been an invented offer. The only place the
word "اشتراك" appears is the InBody line, where it is the owner's own statement
of what the measurement comes with.

---

## 4. The InBody addendum, end to end

- **Setting.** `twilight.json` gains `inbody_included`, boolean/switch,
  `"value": true`, with `label` ("إظهار قياس تكوين الجسم (InBody) المجاني في
  الفرع") and `label_en`, placed in the services cluster next to
  `reply_sla_hours` and `consultation_credit_note`.
- **Gate.** `inbodyIncluded(settings)` in `app/components/product/lib/claims.ts`,
  beside the other gates. It is the one gate here that DEFAULTS TO TRUE: the
  device is at the branch today, so the switch exists to turn the line off the
  day it is not. Explicit `false` / `"false"` / `0` / `"0"` hides it; empty or
  missing keeps the owner's stated fact.
- **Surfaces.** The plans row cue (`ox-services-inbody`) and the branch-visit
  door (`ox-channel-inbody`), on the home page and on `/services`.
- **Wording law.** The noun is قياس, a measurement. تشخيص، فحص طبي، تحليل،
  قراءة نتائج are outside it, and no outcome (loss, gain, a number, a
  timeframe) may be attached. "InBody" stays in Latin: it is the name on the
  device, and Latin inside an Arabic value is already precedent here
  (`video_meta` carries "Google Meet"). A unit test asserts the rendered
  section contains neither "تشخيص" nor "فحص".
- **Recorded.** `docs/build/research/FINAL-claims-source.md` §2 row 10 (owner
  2026-09-23) plus a paragraph under the table spelling out what is approved
  and what may never be said; `docs/brand/voice-ksa.md` §6.3 gains the label
  row.

---

## 5. Measurements

### 5.1 Reserved height, `HOME_BLOCK_HEIGHTS['ox-services']`

Token arithmetic against `_b2-home.scss` section 8 (not a browser measurement;
the dev server serves the block lazily, see §7). The six cards did not change
size: what grew is the head over each row and the gap between the rows.

| | mobile (390) | desktop (1440) |
|---|---|---|
| padding (`--ox-12` / `--ox-16`, both ends) | 48 + 48 | 64 + 64 |
| head stack (eyebrow 20, gap 8, h2 30/40, gap 8, subline 51/27, margin-end 24/32) | 141 | 135 |
| row one (head 88 = h3 26 + gap 4 + note 42, margin-end 16; grid 728 = 3 × 232 + 2 × 16 / 260) | 816 | 330 |
| row gap (`--ox-8`) | 32 | 32 |
| row two (head 134 / 96 = row one's head plus gap 4 + InBody cue 42 / 22; same grid) | 862 | 356 |
| CTA (margin 24 + 44) | 68 | 68 |
| closing note (margin 16 + 20) | 36 | 36 |
| **total** | **2051** (was 1813) | **1085** (was 911) |

Only the InBody cue is reserved, because its gate defaults to ON, so every
store paints it. The reply-time cue is not: it renders only once the owner
fills `reply_sla_hours`, and that store takes one 22px shift here rather than
every store reserving a line nothing paints.

Read back off the live `/ar`:
`min-height:clamp(1085px, calc(2409.8px - 92vw), 2051px)` on the
`ox-services` block, which is exactly this pair.

### 5.2 Skeleton

`ServicesSkeleton()` now draws heading bar → row bar → three dark blocks → row
bar → three dark blocks, matching the two titled rows. Read back off the live
`/ar`: inside `.ox-skel-services`, three `.ox-skel__bar` and six
`.ox-skel__block.ox-skel-dark` in that order.

---

## 6. Files changed

| File | Why |
|---|---|
| `app/components/home/OxServices.tsx` | The composition: new `BandRow` (title, note, gated cue, its own reveal), `ChannelDoor` gains the per-channel short CTA, the gated credit note, the gated InBody line and the `--primary` flag; both rows render on both pages; the heading switches on `routeOut`. |
| `app/components/home/PlanCard.tsx` | Label only: the CTA reads `plan.ctaKey` instead of one shared label. |
| `app/content/services.ts` | `ServiceChannel.doorCtaKey` and `ServiceChannel.inbodyKey`; `HomePlan.ctaKey`; the advisory card's docblock and the row-two rationale. |
| `app/components/pages/ServicesHub.tsx` | The channel section and the page-level reply line removed; the band carries both rows; docblock rewritten (composition, the third structural decision, the claims gates). |
| `app/components/product/lib/claims.ts` | `inbodyIncluded()`, the default-true gate (coordinator addendum; outside the brief's original file list, flagged in Deviations 4). |
| `twilight.json` | The `inbody_included` switch (same addendum). |
| `app/styles/06-ox/_b2-home.scss` | Surgical inserts only: `.ox-services__row*` (row head, title, note, cue), `.ox-channel-door__credit`, `.ox-channel-door--primary`. |
| `app/styles/06-ox/_b5-pages.scss` | Surgical deletes only: `.ox-hub-intro__reply` and `.ox-hub__section`, both dead once the section went; `.ox-hub__channel`'s comment now names `/contact` as its caller. |
| `app/components/home/defaults.ts` | The re-measured pair (§5.1) and its arithmetic. |
| `app/components/home/HomeSkeleton.tsx` | Two titled rows instead of one six-block grid. |
| `locales/partials/s5.ar.json`, `s5.en.json` | New: the nine new keys. |
| `locales/partials/s2.*`, `b2.*`, `b5.*`, `locales/ar.json`, `locales/en.json` | Changed values in their declaring partials, mirrored into the base; three retirements deleted from both. |
| `docs/build/research/FINAL-claims-source.md` | §2 row 10 (InBody, owner 2026-09-23) and the paragraph bounding it. |
| `docs/brand/voice-ksa.md` | §6.3 gains the InBody label row. |
| `tests/home/OxServices.test.tsx` | Rewritten: 16 tests (eyebrow ≠ heading, the two row titles and notes, row membership, per-card CTA verbs, both rows on `/services`, the heading swap, one primary per surface, the two gated cues both ways, the claims sweep). |
| `tests/pages/ServicesHub.test.tsx` | Updated for the merge: no channel card, three doors, the written door as the section primary, one reply line, the InBody gate. |

`tests/blocks/ChannelCard.test.tsx` needed **no edit**: `ChannelCard` is
untouched and still rendered by `/contact` and the kitchen sink.

---

## 7. Verification

```
pnpm typecheck
$ tsc --noEmit          (clean, no output)

pnpm vitest run tests/home tests/pages tests/blocks tests/common
 Test Files  32 passed (32)
      Tests  335 passed (335)

pnpm vitest run tests/i18n.test.ts tests/i18n-keys.test.ts tests/i18n-claims.test.ts tests/content
 Test Files  8 passed (8)
      Tests  114 passed (114)

pnpm check:rtl       check-rtl: 327 file(s), 0 problem(s)
pnpm check:motion    check-motion: 327 file(s), 0 problem(s)
pnpm check:strings   check-strings: 322 file(s), 0 problem(s)
node scripts/check-copy.mjs locales/ar.json locales/en.json
                     check-copy: 2 file(s), 0 problem(s)
node scripts/check-claims.mjs
                     check-claims: 32 file(s), 0 problem(s), 4 allowlisted
node scripts/check-tokens.mjs
                     check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
node scripts/check-identity.mjs
                     check-identity: 327 file(s), 0 problem(s)
node scripts/i18n-merge.mjs --check
                     locales\ar.json: 1375 partial key(s), 0 added, 0 updated
                     locales\en.json: 1375 partial key(s), 0 added, 0 updated
node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css
                     compiles clean (pre-existing @import deprecations only)
```

The four allowlisted claims findings are the pre-existing
`official_distributors` / `trust_distributors` pair in `b2`/`b3`, unrelated to
this batch.

### 7.1 Live render, `curl http://localhost:3210/ar/services` (HTTP 200)

The section as the page actually serves it, read out of the raw SSR HTML:

| Slot | Rendered text |
|---|---|
| eyebrow | المعلومة أولا، ثم القرار |
| h2 | ابدأ من هنا |
| subline | نختار تشكيلة محدودة، ونشرح ما على الملصق، ونرشح ما يناسب هدفك. لا نكتب أنظمة غذائية ولا نفسر تحاليل. |
| row 1 title | ثلاث طرق تسأل بها |
| row 1 note | اسأل اليوم وقرر لاحقا. السؤال لا يلزمك بأي شراء. |
| row 1 cue | (absent: `reply_sla_hours` is empty on this store) |
| row 2 title | برامج وخطط تدعم هدفك |
| row 2 note | حين تريد أكثر من إجابة واحدة، هذه هي الخطوة التالية. |
| row 2 cue | قياس تكوين الجسم (InBody) مجانا في الفرع مع الاشتراك. |
| card 1 | سؤال مكتوب · رد مكتوب من فريق المتجر. · **اكتب سؤالك** |
| card 2 | استشارة مرئية 20 دقيقة · مواعيد محدودة يوميا. عبر Google Meet أو واتساب. · **احجز موعدك** |
| card 3 | زيارة الفرع · الخالدية، المدينة المنورة. الحجز اختياري. · يشمل قياس تكوين الجسم (InBody) مجانا في الفرع. · **احجز زيارتك** |
| card 4 | التغذية والمكملات · افهم من أين تبدأ وما الذي تحتاجه فعلا. · **اعرف التفاصيل** |
| card 5 | التمرين والتدريب · جلسة شخصية في المدينة المنورة أو عبر مكالمة مرئية. · **احجز الجلسة** |
| card 6 | قائمة مكتوبة بعد الاستشارة · المنتجات مرتبة بالأولوية، تصلك بعد المكالمة. · **اعرف التفاصيل** |
| primary | the written-question door carries `ox-channel-door--primary` (count 1); no `.ox-services__cta` button on this page |
| closing | الرد رأي عام من فريق المتجر لمساعدتك في الاختيار، وليس استشارة صحية. |

Same response: `ox-channel-card` count 0 (the merged section), "اختر الطريقة
التي تناسبك" absent (retired), exactly one `h1`, and the heading order reads
h1 → h2 (band) → h3 (row 1) → h3 (row 2) → the rest of the page, no level
skipped.

### 7.2 Live render, `curl http://localhost:3210/ar` (HTTP 200)

The home band is a lazy block: the raw SSR HTML carries its reserved box and
its skeleton, and the six cards hydrate client-side, which is the same
documented behaviour `docs/build/progress/S2c.md` and `S4a.md` already record
for this block. What `curl` proves on `/ar` is therefore the reservation and
the skeleton shape (both in §5), and the copy is proven byte for byte on
`/ar/services` above, which renders the identical component. The only two
home-only differences, the heading ("اسأل قبل أن تشتري") and the primary
("عرض الكل" → `/services`, with no door marked primary), are asserted in
`tests/home/OxServices.test.tsx`.

---

## 8. Deviations

1. **Row two's third card changed identity (copy only, same destination).** It
   was "استشارة مرئية" pointing at OX-045, which is the same product and very
   nearly the same title as row one's video door: two of the six cards were one
   thing. It is now "قائمة مكتوبة بعد الاستشارة" with the line "المنتجات مرتبة
   بالأولوية، تصلك بعد المكالمة.", still routed to OX-045 because that page is
   where the list is booked. This is a copy change the owner did not ask for by
   name, and it is reversible by restoring two values in `locales/partials/b2.*`
   and the base locales; it is here because the owner's third point ("not a
   catalogue of six equal boxes") cannot be satisfied while two of the six
   boxes are the same box. Flagged rather than done quietly.
2. **`/services` lost its fuller channel section** (the merge, reasoned in §2).
   The alternative the brief also allowed would have put row one's title over
   the channel section and row two's over the band, which repeats the three
   services twice on one page in two card shapes.
3. **The hub intro's page-level reply line was removed and its key retired.**
   Consequence of the merge: the band states that gated fact once, under the
   row it belongs to.
4. **Two files outside the brief's file list were edited, both on the
   coordinator's addendum**: `app/components/product/lib/claims.ts` (one new
   exported gate, additive, nothing existing touched) and `twilight.json` (one
   new setting), because "read like the other gates in claims.ts" and "gated on
   a new twilight setting" cannot be done anywhere else. `docs/brand/voice-ksa.md`
   and `docs/build/research/FINAL-claims-source.md` were also edited, as that
   addendum instructs.
5. **`inbody_included` defaults to TRUE**, unlike every other claims gate in
   this codebase, which default to off. That is the coordinator's instruction
   ("boolean, default true … so the owner can switch it off") and it is written
   into the function's own docblock, the setting's description and the claims
   source, because a default-on claim gate is exactly the kind of thing a later
   audit should find explained rather than discover.
6. **One pre-existing repeat left alone and reported instead**: `/services`
   carries a visually hidden `h2` on the intro section whose text is
   `ox.services.title`, i.e. the page `h1` repeated verbatim for screen-reader
   users only. It is invisible copy, it predates this batch and changing it
   means writing a new accessible name for that section, which is a copy
   decision beyond this brief. Recommended for whoever next touches the hub.
7. **Heights are token arithmetic, not a browser measurement.** The lazy block
   means a `curl` cannot measure the mounted section, and this tool has no
   browser session. The arithmetic is itemised line by line in §5.1 and in
   `defaults.ts`' own comment, and the clamp it produces was read back off the
   live page.
