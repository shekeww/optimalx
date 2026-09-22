# OptimalX brand voice, Saudi Arabia: definition and KOS audit

Written for: every agent and person who writes or reviews an Arabic or English string for this store, now and in later sessions. Read it whole before touching `locales/`.

Date: 2026-09-22. Owner decision recorded the same day: the voice is defined here, audited against the Neurix KOS, and applied to every string globally. The dialect and diacritic gates stay and are enforced; nothing that reads as machine-written ships.

## 0. What this document is

It is two things at once. It is the **Project Search Profile** that GOV-012 requires before any KOS standard is applied to a client project ("No standard is applied to a project until its profile exists"), and it is the **voice definition** that profile's `Audience: formality register` field points at. It binds the copy the same way `docs/build/research/FINAL-claims-source.md` binds the claims: that file decides *what* may be said; this one decides *how it sounds*. Neither overrides the other.

## 1. Project Search Profile (GOV-012)

| Field | OptimalX |
|---|---|
| Category | E-commerce (SEO-ENG-009 activates), with a booking sub-model for advisory |
| Business model | One-time sales of boxed supplements; paid advisory sessions and plans booked online |
| Markets | Primary: Saudi Arabia, Medina (Al-Khalidiyah branch, pickup + nationwide shipping). Secondary: none. Tertiary: none. One country, one currency (SAR), one legal regime |
| Languages | Arabic leads and lives at the root (`/`), per the store's own setting (`is_multilingual: false` today; Arabic enabled and default). English is the twin at `/en` once the owner enables it in the dashboard; EN is a genuine translation of the final Arabic, never a placeholder |
| Audience | B2C. Saudi adults who train, and foreigners resident in the Kingdom. Register: **plain Modern Standard Arabic, second person, warm and direct** (defined in section 3) |
| Conversion event | A purchase; a WhatsApp conversation; a booked advisory session; a branch visit |
| Claims source | `docs/build/research/FINAL-claims-source.md`. It is the only authority on what the store may claim (GOV-013). Section 3 of that file is quoted in section 6 below because it is the part copy keeps breaking |
| Regulatory notes | Supplement advertising under SFDA S1 (sections 2.1, 2.2.1, 2.2.2, 2.2.3): no treatment, cure, prevention or disease language; no outcome numbers; no "clinically proven", "100% safe", "no side effects"; no professional titles until classification documents exist |
| Contact reality | WhatsApp dominant; branch phone; email secondary. The utility bar and the trust strip already reflect this |

Activation: e-commerce category activates ENG-009; a named local market activates STD-004 instantiated as *Medina / Saudi Arabia*; Arabic plus English activates ENG-008 instantiated as *Arabic root, English at `/en`, Saudi query research* (the GOV-012 example for "a Riyadh brand" applied to a Medina one).

## 2. The audit

### 2.1 What the owner's edits established (measured)

Between the green handoff `380b2cf` and `754ede3` the owner rewrote **667 Arabic values** in `locales/ar.json` (954 edits counting the partials): 636 real rewordings, 31 spelling-only. Profiled against the previous text:

- Register moved to **Saudi Gulf dialect**: مو ×79, كمل ×66, وش ×51, اللي ×42, بس ×21, شوف ×20, مب ×19, عشان ×16, زين ×15, تقدر ×12, تبي ×8, وين ×7, ليش ×6.
- **Second-person address nearly doubled**: 56 → 104 of the 667 values carry a direct "you" form or an imperative.
- **Sentences got 20% shorter**: average value length 82 → 66 characters.
- **Diacritics appeared** in 98 values, almost all one habit: the accusative tanween on an adverb's final alef (مجانا ×11, غالبا ×7, خصوصا, حاليا, تقريبا, شكرا).
- Product and category nouns did not change. The transliterations the query research fixed (واي بروتين، كرياتين مونوهيدرات، بري وورك اوت، ماس جينر) survived intact. The edits were to the *sentences around* the products, not to the products.
- Where it landed: `ox.content` 342, `ox.tax` 52, `ox.home` 42, `ox.services` 37, `ox.pdp` 29, `ox.pages` 29. Brand copy, not Salla's platform strings.
- Search-facing surfaces were not spared: 23 title/meta/H1/intro keys now carry dialect, including two meta titles (`ox.services.nutrition.meta_title`: "من وين تبدأ؟") and the proof heading ("وش يقول اللي زارنا؟"). Ten `ox.tax.*.description` values (meta descriptions) fell below the 120-character floor the tests enforce, as a side effect of the shortening.
- Three edits introduced a **banned claim word**: "أفضل" twice (`ox.content.goals.energy.intro`), "الأفضل" once (`ox.pages.contact.social_line`), and "يقي" (prevents) once (`ox.content.goals.recovery.faq_1_a`).

Read as intent rather than as text, the edits say four things clearly: *be shorter, talk to me, sound like a person, drop the paperwork tone.* That intent is right for this store and it is kept. The register it was written in is not, for the reasons below.

### 2.2 What the KOS rules, and why it wins here

**SEO-ENG-008 Principle 5 (v1.1, 2026-08-17): Modern Standard Arabic, always.** Colloquial Arabic is not acceptable on any surface: headings, body copy, UI labels, buttons, validation, placeholders, meta, structured data. The standard is explicit that this is a *register* rule, not a vocabulary rule: "Writing 'everyday' Arabic means plain MSA words and short sentences. It does NOT mean dialect." It withdrew its own earlier "Gulf-natural" clause because that clause "produced published dialect."

**SEO-ENG-008 Principle 6 (v1.2, 2026-09-15): no diacritics in published Arabic**, with a build failure on any combining mark (U+064B to U+065F, U+0670, U+06D6 to U+06ED, U+08D3 to U+08FF). The reasons are practical: nobody types a mark into a query, so a marked word is a different token from the one users search; marks read as machine translation or a textbook; they stack badly in web fonts at small sizes; they inflate the character counts the meta rules measure.

**GOV-012 precedence.** "On market, language, register, and claims questions the project profile wins," *but* a profile "may never override … native-authorship for localized content (ENG-008)," and ENG-008's register and diacritic principles are floors of the same standard. The owner's profile decides that the register is *warm, second-person, plain* MSA. It cannot decide that the register is dialect, because that is not a parameter the standard exposes.

**The copywriting standard (mastermind-copywriting)** adds the third floor: nothing that reads as machine output. The em-dash is banned everywhere. Banned constructions are listed in section 3.5. This applies to Arabic exactly as to English.

**Why the ruling is also the right commercial call, not only the compliant one.** Every search-facing surface on this site is a Google or answer-engine token match. Arabic SERPs, People-Also-Ask, product schema and assistant answers are written in MSA; a meta title reading "من وين تبدأ؟" is a token nobody searches and a heading no assistant quotes. The owner's product vocabulary already proves the point: the edits left "واي بروتين ايزوليت" alone because that is what people type. The same logic applies to the verbs and question words around it.

**One thing the ruling does not do:** it does not restore the old text. The old text was MSA but it was also bureaucratic in places ("تم استقبال طلبك بنجاح وسيتم مراجعته"), third-person where second would serve, and longer than it needed to be. The owner was right to cut it. The defined voice is the owner's intent, executed in the register the KOS requires.

### 2.3 Cleared concerns (GOV-011 Rule 7)

- Product and category nouns: unchanged by the owner, correct per `keywords-ar.md`, kept verbatim by the sweep.
- Emoji: one (👊 on the thank-you title). Kept; it is a single deliberate touch, not a pattern.
- Honesty lines the owner preserved ("المتجر جديد", "ما بنخترع تقييمات" → "لن نخترع تقييمات"): these are the voice at its best and stay, in MSA.
- English: the owner touched no English value. EN stays as it is except where the Arabic *meaning* changed in the sweep, in which case EN is re-translated to match.

## 3. The voice

### 3.1 Persona

The colleague behind the counter at the Al-Khalidiyah branch. Knows the label, has used the products, and would rather tell you that you do not need something than sell it to you. Speaks to one person, plainly, in short sentences. Never promises a result. Never hides behind a passive verb. Owns an opinion when there is one and says "we" when the store acts.

Saudi in what it knows (the market, the brands people ask for, the branch, the heat, the training culture). Modern Standard Arabic in how it writes, the way every Saudi storefront a customer already trusts writes: Noon, Nahdi, Salla's own dashboard.

### 3.2 Register rules

1. **Modern Standard Arabic on every surface.** No dialect token, ever. The map in 3.3 is the conversion table.
2. **Plain words, not textbook words.** "يمكنك" not "بوسعك"; "أرسلنا" not "قمنا بإرسال"; "تعرف" not "تكون على دراية". Everyday MSA is a real register and it is the target.
3. **Second person, singular, masculine as the market convention**, exactly as Noon and Nahdi address customers. Prefer an imperative or a noun phrase where it reads better, because those are gender-neutral: "اختر النكهة" beats "يمكنك أن تختار النكهة".
4. **Short.** Aim at the owner's measured 66-character average for UI strings. Never pad. One idea per sentence, one idea per paragraph in long copy.
5. **Active voice, the store as "we".** "وصلنا طلبك" not "تم استلام طلبك". The bureaucratic "تم + مصدر" construction is retired except where Salla's own engine strings force it.
6. **Numbers as digits** in prices, servings, sizes and counts (the store already does this); Arabic-Indic numerals nowhere, because the product data is Latin-digit and mixing them on one card reads as an error.
7. **No diacritics.** Write the adverb bare: مجانا، شكرا، غالبا، حاليا، تقريبا. Where a bare word is genuinely ambiguous, reword the sentence; never add a mark.

### 3.3 The owner's tokens and their MSA equivalents

These are the exact tokens the 667 edits used, with the plain-MSA form that keeps the same warmth. The sweep uses this table; `check-copy` enforces the left column as forbidden.

| Owner wrote | Write instead | Note |
|---|---|---|
| وش | ما / ماذا | "ما هدفك اليوم؟" keeps the question and the directness |
| مو / مب | ليس / لا / غير | "ليس بديلا عن الواي" |
| اللي | الذي / التي, or restructure | Often the sentence is better without a relative clause: "الفريق نفسه يرد على أسئلتك" |
| ما فيه / مافي | لا توجد / لا يوجد / ليس هناك | "لا توجد تقييمات بعد" |
| تقدر | يمكنك / بإمكانك | |
| تبي / تبغى / يبي / ابي | تريد / يريد / أريد | Or an imperative: "تريد أن تعرف الفرق؟" → "الفرق بين الأصلي وغيره:" |
| شوف | انظر / اطلع على / تصفح | "لهدف آخر، انظر" |
| كمل | أكمل / تابع / واصل | "أكمل التسوق" |
| عشان | حتى / لكي / لأن / من أجل | |
| زين | جيد / مناسب | |
| بس | فقط / لكن | |
| وين | أين | "من أين تبدأ؟" |
| ليش | لماذا | |
| لازم | يجب / عليك أن | Prefer the imperative: "اقرأ الملصق" over "لازم تقرأ الملصق" |
| كذا | هكذا / بهذه الطريقة | |
| حق (possessive) | لـ / الخاص بـ | |
| تجي / تسوي | تأتي / تصل / تفعل / تجهز | |
| فاضية | فارغة | "السلة فارغة" |
| قبل ما | قبل أن | "اسأل قبل أن تشتري" is the nav label and the page title; it does not move |
| بنراجع / بنرجع (future بـ) | سنراجع / سنعيد | |
| ينشحن / ينشترى (dialect passive) | يشحن / يشترى (bare, no mark) | |
| ثاني (as "another") | آخر | "لهدف آخر" |
| مرة ثانية | مرة أخرى | |
| تمت الإضافة للسلة | أضيف إلى السلة | Shorter and active |

### 3.4 What the owner got right, kept as rules

- **"أكمل التسوق"** over "متابعة التسوق": a verb the reader does, not a noun.
- **"وصلنا طلبك بنجاح، وسنراجعه ونؤكد لك التفاصيل"** over "تم استقبال طلبك بنجاح وسيتم مراجعته": the store as a person.
- **"متوفر"** over "متوفر في المخزون": the qualifier added nothing.
- **"اعرف أكثر"** over "اقرأ المزيد": the reader wants to know, not to read.
- **"العلامات التجارية"** over "العلامات": precision the reader needs.
- **"ملاحظة مهمة"** over "ملاحظة طبية": the store gives no medical notes and must not label anything as one.
- **"ليست توصية شخصية"** over "ليست توصية لأي شخص بعينه": same claim, half the words.

### 3.5 Banned constructions (the machine-output tells)

Arabic:
- The em-dash (—), anywhere. Use a comma, a colon, a full stop, or parentheses.
- "في عالم اليوم", "في عصرنا الحالي", "في ظل التطور السريع"
- "دعنا / دعونا نستكشف / نتعمق / نلقي نظرة"
- "ليس مجرد X، بل Y" and "ليس فقط X بل أيضا Y" as a reflex
- "سواء كنت X أو Y"
- "إليك ما يجب أن تعرفه", "إليك الأمر"
- "رحلتك", "رحلة" as a metaphor for shopping or training
- "اكتشف قوة", "أطلق العنان", "ارتق بـ", "نقلة نوعية", "سلس / سلسة", "يعزز تجربتك", "شامل ومتكامل", "حل مثالي"
- A triad of one-word sentences ("سريع. بسيط. قوي.")
- Two or more rhetorical questions in a row
- "في الختام", "لا تتردد في", "نحن هنا من أجلك" as a sign-off
- Every paragraph or heading on one page built on the same grammatical frame

English (from the copywriting standard): "It's not just X, it's Y" · "Here's the thing" · "In today's fast-paced/digital/ever-evolving" · "Let's dive in / delve" · "unlock", "elevate", "seamless", "game-changer", "leverage" as a verb, metaphorical "landscape", "robust", "empower" · "Whether you're a X or a Y" · stacked rhetorical questions · a triad in every paragraph · every paragraph opening with a bolded phrase · "In conclusion" and motivational sign-offs · perfectly parallel heading grammar down a page.

### 3.6 Required texture

Sentence lengths that vary. Real numbers (24 غرام، 60 حصة، 299 ريال). Named products ("واي جولد ستاندرد من أوبتيمم") instead of "المنتج المميز". An opinion, owned: "نرى أن الواي المركز يكفي معظم المبتدئين." Transitions that come from the argument, not from a connector inventory. Endings that land on a fact or an action, never on encouragement. Read it aloud in Arabic: where the voice sounds like a press release or a school textbook, rewrite that sentence.

### 3.7 Surface rules

| Surface | Rule |
|---|---|
| Meta title | The researched head term from `keywords-ar.md` first, then the qualifier, then " \| اوبتيمال اكس". Target 50 to 60 characters before the brand suffix. No question marks, no dialect, no marks |
| Meta description | 120 to 155 characters (tested). Answer-first: what it is, who it is for, one concrete fact. Ends on a full stop |
| H1 | The head term the cluster ranks on, plain. The hero is the one exception: "ما هدفك اليوم؟" is a question by design |
| Category intro | First sentence states what the category is and who buys it, answer-first, so an assistant can quote it. Then the shopper's decision in two sentences. Then the honest limit ("لا نكتب جرعات؛ الملصق يفعل") |
| FAQ answer | Answer in the first sentence. Facts from the label or the claims source only. Medical questions redirect to the reader's own doctor in the phrase already used site-wide |
| Buttons and labels | A verb the reader does: أضف، اشتر، احجز، اسأل، تصفح، أكمل. Two to three words |
| Empty states | One line of fact, one route out. "لا توجد منتجات لهذه العلامة الآن. تصفح كل العلامات" |
| Errors | What happened, what to do. Never an apology paragraph |
| Alt text | The product name and form. No adjectives |

### 3.8 English

English is the twin, not the original. It states the same facts in the same order and the same register (plain, second person, short). The English tells in 3.5 are banned. When the sweep changes an Arabic value's *meaning* (not merely its register), the English value is re-translated; when only the register moved, the English stays.

## 4. Calibration: old, owner, defined

| Key | Old (MSA, bureaucratic) | Owner (dialect) | Defined voice (this document) |
|---|---|---|---|
| `pages.cart.empty` | السلة فارغة | السلة فاضية | السلة فارغة |
| `pages.cart.continue_shopping` | متابعة التسوق | كمل التسوق | أكمل التسوق |
| `pages.thank_you.description` | تم استقبال طلبك بنجاح وسيتم مراجعته وتأكيده في أقرب وقت. | وصلنا طلبك بنجاح، وبنراجعه ونأكد لك التفاصيل في أقرب وقت. | وصلنا طلبك بنجاح، وسنراجعه ونؤكد لك التفاصيل في أقرب وقت. |
| `ox.common.retry` | أعد المحاولة | حاول مرة ثانية | حاول مرة أخرى |
| `ox.pdp.no_reviews` | لا تقييمات بعد. المتجر جديد، ولن نخترع تقييمات. | ما فيه تقييمات حتى الآن. المتجر جديد، وما بنخترع تقييمات. | لا توجد تقييمات بعد. المتجر جديد، ولن نخترع تقييمات. |
| `ox.pdp.goal_route` | لهدف آخر، انظر | لهدف ثاني، شوف | لهدف آخر، انظر |
| `ox.pdp.bundle_members` | ما في الحزمة | وش داخل الحزمة | ما داخل الحزمة |
| `ox.pdp.authentic_line` | منتج أصلي بتاريخ صلاحية واضح. كيف تعرف المكمل الأصلي؟ | منتج أصلي بتاريخ صلاحية واضح. وتبي تعرف كيف تفرق بين الأصلي وغيره؟ | منتج أصلي بتاريخ صلاحية واضح. كيف تفرق بين الأصلي وغيره؟ |
| `ox.services.nutrition.meta_title` | التغذية والمكملات: من أين تبدأ \| اوبتيمال اكس | التغذية والمكملات: من وين تبدأ؟ \| اوبتيمال اكس | التغذية والمكملات: من أين تبدأ \| اوبتيمال اكس |
| `ox.proof.title` | ما يقوله من زار المتجر | وش يقول اللي زارنا؟ | ما يقوله من زار الفرع |
| `ox.content.goals.recovery.faq_1_a` (ends) | …قد لا يحتاج إلى السكوب أصلا. | …ما تحتاج سكوب لمجرد التوقيت. | …فلا تحتاج إلى سكوب لمجرد التوقيت. |
| `ox.content.goals.energy.intro` (opens) | مكملات الطاقة هي ما تأخذه قبل التمرين… | إذا هدفك تدخل التمرين بطاقة وتركيز أفضل… | إذا كان هدفك أن تدخل التمرين بطاقة وتركيز، فهنا تجد… ("أفضل" removed: an unearned comparative, claims source §3) |

## 5. Gates and the sweep procedure

Gates, all of which must be green before a string ships:

- `pnpm check:copy`: rules `diacritic`, `dialect`, `em-dash`, and from today `ai-tell` (the constructions in 3.5). The dialect list now carries every token in 3.3 that has no MSA reading.
- `node scripts/check-claims.mjs`: the claims lexicon. Voice never licenses a claim.
- `pnpm vitest run tests/i18n.test.ts tests/i18n-keys.test.ts tests/i18n-claims.test.ts tests/content`: key parity ar/en, partial/base agreement, meta lengths, the same rules as `check-copy` asserted in-process.

Sweep procedure (2026-09-22):

1. The owner's 667 edits are frozen in the session scratchpad as `owner-voice-edits.json` (key, file, old, owner). They are the intent signal per key: the sweep writes the *defined-voice* value for each, keeping the owner's brevity and address and restoring MSA.
2. The 788 Arabic keys the owner did not touch get the same pass, so the site speaks with one voice. Most need nothing; the ones with "تم + مصدر", third-person address, or padding are rewritten.
3. Every changed value is edited in its declaring partial first and mirrored identically into `locales/ar.json` (PLAN-ship §0), because `tests/i18n.test.ts` forbids a partial disagreeing with the base.
4. English follows 3.8.
5. The three claims regressions are fixed in the same pass and listed in `docs/content/changes-2026-09-22.md` with old, owner, new and reason, the same way S4 recorded its own changes.
6. Gates run; nothing is committed on red.

## 6. What this document does not license

From `docs/build/research/FINAL-claims-source.md` §3, quoted because the sweep will be tempted: no treatment, cure, prevention, protection, disease or symptom language (يعالج، يشفي، يقي من، يحمي من، يخفف); no outcome promises or numbers; no "clinically proven", "100% safe", "no side effects"; no professional titles; no diagnosis or individualised dosage; no invented statistics (customer counts, satisfaction rates, "the best", "number one", "the most sold") until real order data exists; no delivery-time promise without a carrier agreement; no "official distributor" (the two allowlisted `ox.pdp.official_distributors` keys are gated behind a setting the owner has not filled and render nothing today). "مضمون" is banned verbatim.

A warm sentence that promises something is a warmer violation. The persona in 3.1 would not say it.

## 7. Persona source: the founders' story (owner, 2026-09-22)

The owner supplied the About-us story below in Gulf dialect and asked that the
OptimalX persona and brand voice be defined from it. This section records the
story as claims-source input (GOV-013: owner-authored, so it may be used; the
owner initials it into `docs/build/research/FINAL-claims-source.md` §1 when
they sign that document), the persona it defines, the MSA rendering that ships
(KOS SEO-ENG-008 P5/P6: no dialect, no marks), and the claims audit of each
sentence.

### 7.1 The persona, in the owner's own facts

- **Who speaks:** two training partners ("نحن شريكان نتمرن مثلك"), not a
  company voice. First person plural, second person singular.
- **Why the store exists:** they bought supplements they did not need and met
  products that looked alike with no visible difference; the whole store is
  built to answer one question: "ما الذي تحتاجه فعلا؟".
- **How they work:** a small range they know and can explain; the label's
  numbers explained; a recommendation for the reader's goal; advice,
  consultations and subscriptions that support the goal; information first,
  then the decision; the reader has the right to learn they do not need a
  product before paying for it.
- **Honesty about scale:** the store is at its beginning; no invented ratings
  or numbers; what they own today: genuine products, clear information,
  goal-fit recommendations, subscriptions built for the need, and time set
  aside for the reader.
- **Register (feeds §3):** short declaratives, one idea per sentence, a
  question as a heading, a staccato list of what is true, no superlatives,
  limits stated out loud. Nothing here changes §3.3 to §3.6: dialect and
  marks stay out; the warmth is carried by the second person and the short
  sentence, not by dialect tokens.

### 7.2 The story as it ships (MSA rendering, Arabic)

Heading: **قصة اوبتيمال اكس**

الأداء لا يبدأ من المكمل. يبدأ من فهم احتياجك.

نحن شريكان نتمرن مثلك.

اشترينا مكملات من قبل، ثم اكتشفنا أننا لم نكن نحتاجها. ومرت علينا منتجات تبدو متشابهة، لكن الفرق بينها لم يكن واضحا.

ومع كثرة الخيارات، صار السؤال عندنا أبسط:

**ما الذي تحتاجه فعلا؟**

من هنا بدأت اوبتيمال اكس.

لم نرد أن نكون متجرا للمكملات فحسب. أردنا مكانا يساعدك على الاختيار بناء على هدفك: مكملات مختارة، وبرامج تمرين، ومحتوى غذائي، وتوصيات واشتراكات مصممة لاحتياجك.

Heading: **كيف نعمل؟**

نختار تشكيلة محدودة نعرفها، نفهم تفاصيلها ونستطيع شرحها.

نوضح المنتج وطريقة استخدامه، ونشرح لك معنى الأرقام على الملصق، لتعرف ما تشتريه بالضبط.

ونساعدك على اختيار مكملك، ونرشح لك الأنسب لهدفك، ونوفر لك نصائح واستشارات واشتراكات تدعم هدفك.

المعلومة أولا، ثم القرار.

وإذا كنت لا تحتاج المنتج، فمن حقك أن تعرف ذلك قبل أن تدفع ثمنه.

لا نريد أن تنتهي علاقتنا معك عند أول طلب.

نريد أن نكون الشريك الذي يساعدك على اختيار مكملك، ويرشح لك الأنسب لهدفك، ويجهز لك اشتراكا يناسب احتياجك مع الوقت.

اوبتيمال اكس في بدايتها، ولن نخترع تقييمات أو أرقاما لا نملكها.

ما نملكه اليوم واضح:

منتجات أصلية. معلومات واضحة. توصيات تناسب هدفك. اشتراكات مصممة لاحتياجك. ووقت نخصصه لك.

Tagline: **ما تحتاجه، لا أكثر.**

### 7.3 The story in English (true translation, same claims)

Heading: **The OptimalX story**

Performance does not start with a supplement. It starts with understanding what you need.

We are two training partners, and we train like you do.

We bought supplements before, then found out we never needed them. Products passed through our hands that looked the same, with no clear difference between them.

With so many choices, our question became simpler:

**What do you actually need?**

That is where OptimalX began.

We did not want to be just another supplement shop. We wanted a place that helps you choose by your goal: a selected range, training programmes, nutrition content, and recommendations and subscriptions built around your need.

Heading: **How we work**

We keep a small range we know, understand in detail and can explain.

We describe the product and how it is used, and we explain what the numbers on the label mean, so you know exactly what you are buying.

We help you choose your supplement, recommend what fits your goal, and offer advice, consultations and subscriptions that support that goal.

Information first, then the decision.

And if you do not need a product, you have the right to know that before you pay for it.

We do not want our relationship with you to end at the first order.

We want to be the partner who helps you choose, recommends what fits your goal, and sets up a subscription that suits your need over time.

OptimalX is at its beginning, and we will not invent ratings or numbers we do not have.

What we have today is clear:

Genuine products. Clear information. Recommendations that fit your goal. Subscriptions built for your need. And time set aside for you.

Tagline: **What you need, and nothing more.**

### 7.4 Claims audit of the story (FINAL-claims-source §3, mastermind-copywriting)

| Owner's line | Ships as | Ruling |
|---|---|---|
| احنا شريكين نتمرن مثلكم | نحن شريكان نتمرن مثلك | Factual statement about the founders; permitted. `ox.pages.about.stat_team_value` = 2 already says the same. |
| نصائح واستشارات واشتراكات لتحقيق هدفك | ...اشتراكات تدعم هدفك | "لتحقيق هدفك" reads as an outcome promise (§3 outcome promises; the design audit banned حقق هدفك as a headline); "تدعم" is the §4 allowed verb family (يدعم، يساهم في). Owner intent kept, verb changed. |
| برامج تمرين ومحتوى غذائي | برامج تمرين، ومحتوى غذائي | Permitted: the training plan and the nutrition consultation are real products (OX-045 to OX-047); "محتوى غذائي" is content, not a meal plan. The services page's own disclaimer (لا نضع أنظمة غذائية) still applies and stays on that page. |
| الاشتراكات المخصصة / اشتراكات مخصصة لاحتياجك | اشتراكات مصممة لاحتياجك | A commerce service, not an individualised health prescription; permitted. "مخصصة" swapped for "مصممة" to keep clear of the banned prescription reading (خطة مبنية لك). |
| ما راح نخترع تقييمات او ارقام ما عندنا | لن نخترع تقييمات أو أرقاما لا نملكها | Permitted and on-doctrine (no invented statistics). Reinforces the rating gate. |
| منتجات اصلية | منتجات أصلية | Permitted (§2 row 8: genuine products). Never "100%". |
| ليس مجرد متجر (candidate rendering of "ما كنا نبي نكون مجرد متجر") | لم نرد أن نكون متجرا للمكملات فحسب | The AI-tell construction "ليس مجرد X بل Y" is banned (§3.5); rendered without it. |
| اللي تحتاجه، وبس. | ما تحتاجه، لا أكثر. | Tagline. MSA keeps the two-beat cut; alternative for the owner: "ما تحتاجه فقط." |
| كثير من الناس يدخلون متجر المكملات وما يعرفون وش يحتاجون (old story_1) | replaced by the owner's first-person version | The old About text spoke about "people"; the owner's story speaks as the two partners. The new version wins. |

Dialect tokens removed and their MSA forms (all from §3.3): احنا→نحن، كذا→من قبل، ما كنا→لم نكن، وش→ما الذي، نبي→نريد/أردنا، نشتغل→نعمل، نقدر→نستطيع، عشان→لـ، نوفرلك→نوفر لك، اذا ما كنت→إذا كنت لا، قبل ما→قبل أن، نبغى→نريد، اللي→الذي/ما، ما راح→لن، عندنا→نملكها، وبس→لا أكثر. No combining marks anywhere (checked with the shared `DIACRITICS` regex).

### 7.5 Where the persona lands

- `/about`: the story above replaces `ox.pages.about.story_1..4` (new keys
  `story_1..story_9`, `how_title`, `how_1..how_3`, `own_title`, `own_list`,
  `closing`), the lead stays factual (branch, city, shipping), the four
  "why" panels stay as the summary row, the medical line stays.
- Footer tagline (`ox.footer.tagline`) and the hero eyebrow candidates: "ما
  تحتاجه، لا أكثر." is the store line; the hero H1 stays the question "ما
  هدفك اليوم؟" (§3.7).
- Services intro and the advisory band subline draw from "المعلومة أولا، ثم
  القرار." and "من حقك أن تعرف ذلك قبل أن تدفع ثمنه." (both permitted).
- Meta description for `/about` (SEO-ENG-010, 130-150 chars): "اوبتيمال اكس
  متجر مكملات من المدينة المنورة أسسه شريكان يتمرنان. نشرح لك ما على الملصق،
  ونرشح ما يناسب هدفك، ونقول لك إن كنت لا تحتاج المنتج." (measure before
  shipping).
