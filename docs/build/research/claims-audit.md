# OptimalX claims audit (G0) — FINAL-content.md vs FINAL-claims-source.md and catalogue.json

Scope: FINAL-content.md (1781 lines, sections 1–10 + self-check), read in slices, never printed through the shell.
Method: manual line-by-line read against GOV-013 claims source, and independent scripts (PYTHONIOENCODING=utf-8) for: dialect whole-word list, em/en-dash, diacritics/tatweel, locale-JSON parse + key-set/order diff, meta title/description character counts (pipe-aware regex, since AR/EN titles embed a literal " | اوبتيمال اكس" / " | OptimalX" that breaks naive `split('|')` table parsing), and product-fact cross-check against catalogue.json (servings, serving size, per-serving nutrition figures, prices, categories).
This file verifies. It does not rewrite FINAL-content.md.

---

## 1. Claims (business claims vs GOV-013 section 2 rows)

**Finding 1 — BLOCKER.** Line 49: trust-strip item "منتجات أصلية" carries the line "موزعون رسميون وصلاحية على كل منتج" as committed default copy. Claims-source row 8 says "موزعون رسميين" ships only once distributor invoices exist; until then the copy must say "منتجات أصلية" with the definition sentence and **no** "رسميين". The table's own "Gate" column (same line) notes the owner must confirm the relationship first, but that gate is a spec-side comment, not a rendering condition — the rendered string itself asserts the claim unconditionally. Also reflected in lexicon table: "موزعون رسميون" is Conditional, not Allowed.

**Finding 2 — BLOCKER.** The 24-working-hour written-reply promise (claims-source row 6, conditional on the channel being staffed) is asserted as plain fact, with no placeholder or render condition, in at least 20 places outside section 4 (which does carry a section-level gate note at line 581): lines 52 (home trust strip), 116, 144, 180, 208, 236 (all six goal-page "need help" lines), 789 (About), 807/819 (Contact), 863/867 (thank-you page), 1038/1141 (guide article closings), 1311/1321/1338/1340 (locale microcopy `ox.trust.help_line`, `ox.services.reply_time`, `ox.booking.confirmed_body`, `ox.booking.question_received_body` and EN twins at 1585/1595/1612/1614), 1752/1758/1761 (meta descriptions for goal-energy, services, contact). If the owner does nothing to staff the channel, the entire site still promises a 24-hour reply by default.

**Finding 3 — BLOCKER.** Line 206 (section 2.4, goal-recovery FAQ #3, magnesium): "والجليسينات هو الشكل الأكثر طلبا لأنه لطيف على المعدة" reuses the exact phrase "الأكثر طلبا" that the document itself designates, at line 60, as deferred until real order data exists ("Deferred until real order data exists; never seed it."). This is an invented-sounding demand statistic banned by claims-source section 3 ("the most sold" until real order data exists), self-contradicting the document's own rule 60 lines earlier.

**Finding 4 — HIGH.** Payment-method and "secure payment" claims render unconditionally with no gate: line 51 (home trust strip "دفع آمن … مدى وأبل باي وتابي وفيزا"), line 79 (footer payment line), line 712 (branch page "بمدى أو أبل باي أو نقدا"), microcopy `ox.trust.payment`/`ox.trust.payment_line` and `ox.footer.payment_line` (lines 1308–1309, 1367, EN 1582–1583, 1641). BUILD.md section 1 marks payment methods as P0/unconfirmed (per the "Gate" column at line 51 and line 716's own note), yet none of these strings carry a placeholder or a stated non-render rule the way the branch-hours table does (contrast with line 732's explicit "Rule: the table renders only when the dashboard branch record carries real hours").

**Finding 5 — HIGH.** The video-consultation 50 SAR credit (claims-source row 7, conditional on the coupon existing in the dashboard) is committed copy at lines 612, 614, 617, 671 (badge, meta line, output, "what happens next"), with the only gate again confined to the internal "Gate" table row at line 620, not to the rendered strings. Section 4's intro (line 581) does gate the whole hub on "the written-question channel staffed" and defers video/visit cards to "after the legal review", but that gate is stated once in sourcing prose, not attached to each instance, and does not cover the parallel appearance of "24 hour" and "50 riyal" language reused elsewhere (About, Contact, thank-you, guides — see Findings 2).

**Finding 6 — HIGH.** VAT-inclusive pricing claim renders unconditionally in two standalone microcopy keys with no placeholder and no documented render rule: `ox.trust.vat_included` (AR line 1312, EN line 1586) and `ox.cart.vat_note` (AR line 1421, EN line 1695), both literally "الأسعار شاملة ضريبة القيمة المضافة" / "Prices include VAT". Claims-source row 4 is explicit: "only true once VAT registration exists; until then the line is hidden." Contrast with the footer trust line (line 77, rule at line 81) which correctly bundles the same VAT clause together with {CR}/{VAT}/{MAROOF} and states it renders only when all three are filled — the two microcopy keys above have no such protection.

**Finding 7 — HIGH.** The free-shipping threshold (299 SAR) is hardcoded as literal fact in six places even though the document's own binding rule (line 9) and note (line 43) call it "a placeholder bound to the dashboard shipping rule: change the rule, change this line": lines 39, 41 (hero announcement bar), 574 (accessories FAQ), 761 (branch FAQ), 825 (shipping policy intro — inconsistent within the same paragraph, since {SHIP_FEE} right next to it *is* templated), 873 (empty-cart state). Section 9's own microcopy correctly uses `{threshold}` for the equivalent strings (lines 1238–1239, 1370, 1512–1513, 1644), so the templated and hardcoded versions of the same fact now disagree in mechanism, and any of the six literal instances will show a wrong number if the dashboard's real rule differs from 299.

## 2. Product facts (copy vs catalogue.json)

**Finding 8 — HIGH.** Section 3.12 (Collagen) and its cross-links state a universal collagen dose of "5 إلى 10 غرامات يوميا" at lines 230 (goal-hair-skin FAQ), 507 (intro), 513 (FAQ), and 1181 (glossary). Both catalogue collagen SKUs in scope exceed this stated range: OX-029 (Vital Proteins) delivers 20 g collagen peptides per labelled serving — double the claimed 10 g ceiling — and OX-030 (Sports Research, marine) delivers 11 g per serving, also over. The claimed range does not describe either product actually sold.

**Finding 9 — HIGH.** Biotin dose claim "5000 إلى 10000 ميكروغرام" at lines 232, 517, 1182 does not match OX-031 (NeoCell collagen + vitamin C + biotin tablets), which is in scope on the very page carrying this FAQ (section 3.12, SKUs OX-029–032) and delivers only 3000 mcg biotin per serving — below the stated range. Only OX-032 (10,000 mcg) sits inside the claimed band.

**Finding 10 — HIGH.** Section 3.11 (vitamins-minerals) filter chips (line 489) list "فيتامين سي" and "زنك" as if each is a distinct product line, and section 2.5's sub-need #2 (line 222) routes "زنك وفيتامين سي" to this category. Across all 47 catalogue SKUs there is no standalone vitamin-C product at all (the only vitamin-C-containing item, OX-031, is filed under `collagen-beauty`, not `vitamins-minerals`) and no standalone zinc product (zinc appears only incidentally inside OX-026 ZMA, 30 mg, and OX-028 Centrum, 11 mg). Clicking either filter on day one returns nothing that matches its label.

**Finding 11 — HIGH.** Section 3.11's filter chip "مغنيسيوم جليسينات" (line 489) implies a glycinate-form magnesium product is in scope, and the FAQ at line 496 states "الجليسينات هو الشكل الأكثر طلبا" as if the stocked item is that form. The only magnesium SKU in scope, OX-024 (NOW Foods, 400 mg), is described in catalogue.json as a blend of oxide, citrate and aspartate — not glycinate. (This line also trips Finding 3, the banned "الأكثر طلبا" phrase.)

**Finding 12 — MEDIUM.** Section 3.2 (whey-protein) FAQ, line 326: "عبوة 5 باوند أي 2.27 كغم تعطي عادة 70 إلى 75 حصة" for a 2.27 kg tub. Of the four SKUs in scope on this exact page (OX-001–004), OX-001 matches (73 servings) but OX-002 does not (69 servings, just under) and OX-004 does not (60 servings, well under the stated range) for the same 2.27 kg size. The adjacent "2 باوند نحو 28 إلى 30 حصة" claim also has no matching variant among the in-scope SKUs (only OX-003 ships a ~2 lb/907 g size, at 40 servings with a different, larger scoop).

**Finding 13 — LOW / supplementary.** Section 3.9 (amino-acids) filter chip "أرجينين وسيترولين" (line 451) implies a standalone citrulline product; only OX-021 (arginine) is a real standalone SKU in scope — citrulline exists only as an ingredient inside the pre-workout SKU OX-018. The section's own header note (line 446) already flags C13 as "filter chips … until each has five products," so this is self-disclosed and lower priority than Findings 10–11, but the same empty-filter risk applies.

## 3. Health language (SFDA banned/outcome/disease/professional-title language)

Verified clean by an independent script over the full file (excluding the self-check's own descriptive line 1785, which lists the banned words as data, not usage): zero hits for يعالج، يشفي، يقي من، يحرق الدهون، يزيد العضلات، مضمون، نتائج خلال، آمن 100%، بدون آثار جانبية، مثبت سريريا، أفضل في السعودية، رقم 1، أخصائي، صيدلي، مدرب معتمد, and no percent sign anywhere in body copy. "طبيب" appears only inside the five verbatim instances of the mandated line "للحالات المرضية أو الأسئلة الدوائية، راجع طبيبك." (a redirect to the reader's own doctor, not a professional recommendation attributed to staff), which is compliant. Dosage language throughout is consistently framed as label data ("المطبوعة على الملصق", "الجرعة الشائعة") rather than individual recommendations. The self-check's claim of zero banned-word hits is confirmed independently.

## 4. Placeholders

All `{TOKEN}` placeholders found (35 distinct tokens, with line numbers): {CARRIER} 776,825 · {CR} 9,77,834 · {CUTOFF} 9,825 · {EMAIL_USER} 663 · {EMAIL} 9,807 · {HOURS_FRIDAY} 695,726 · {HOURS_RAMADAN} 695,728 · {HOURS_SATURDAY} 695,727 · {HOURS_WEEKDAY} 695,725,812 · {LANDMARK} 695,754 · {MAP_URL} 9,754 · {MAROOF} 9,77,834 · {NEXT_OPEN} 730 · {PHONE} 9,808 · {PICKUP_HOLD_DAYS} 695,741,765 · {PICKUP_READY_HOURS} 695,739 · {QUERY} 776,874 · {REFUND_DAYS} 776,820,828 · {RETURN_DAYS} 776,828 · {SHIP_DAYS_KSA}/{SHIP_DAYS_MEDINA} 825 · {SHIP_FEE} 776,825 · {SOCIAL_HANDLES} 776,810 · {VAT} 9,77,834 · {WHATSAPP} 9,663,806 — plus runtime tokens `{amount} {count} {cr} {date} {days} {maroof} {max} {n} {query} {size} {threshold} {time} {vat} {year}` inside the section-9 locale JSON only.

Well-gated examples (placeholder + an explicit non-render rule): branch hours table, line 732 ("Rule: the table renders only when the dashboard branch record carries real hours; a default-hours record must not print"); footer trust line, line 81 ("the line renders only when all three placeholders are filled"). These are correctly designed to fail safe.

**Finding 14 — HIGH (systemic).** The document is inconsistent about which pending facts get a real placeholder/rule and which get committed text with only a spec-side "Gate" comment. Findings 1, 2, 4, 5, 6 and 7 above are exactly this failure mode: on a default render (owner does nothing), the copy will show "موزعون رسميون" as fact, a 24-hour reply guarantee sitewide, live payment marks, a 50 SAR credit, "prices include VAT," and a fixed 299 SAR shipping threshold — none of which the claims source currently allows unconditionally.

## 5. Register (dialect, diacritics, tatweel, dashes)

Independent script results (PYTHONIOENCODING=utf-8) over the whole file:
- Em-dash (U+2014): 0. En-dash (U+2013): 0. Diacritics/tatweel (U+064B–U+0652, U+0670, U+0640): 0.
- Whole-word dialect list (ابغى، ابي، وش، ليش، شلون، كذا، هالـ، زين، عشان، بس، هلا، ايش، وين، حق، مو): the only matches for ابغى / ابي / وش / مو are inside the self-check's own description of what it checked (line 1785, which literally lists "وش، ابي، ابغى، شوي، مو..." as the set of words it verified are absent), not actual body usage. Zero real hits in sections 1–10.
The self-check's register claims are independently confirmed accurate.

## 6. Locale parity (section 9, ar.json vs en.json)

Parsed both fenced JSON blocks with `json.loads`: both objects contain exactly 267 keys, an identical key set, and identical key order (verified index-by-index, zero mismatches). No structural parity issues. Spot-read of values found no English placeholder-instead-of-translation and no raw transliteration; EN values are genuine translations (e.g. `ox.pdp.no_reviews`: AR "لا تقييمات بعد. المتجر جديد، ولن نخترع تقييمات." / EN "No reviews yet. The store is new, and we will not invent any." — matched claim discipline in both languages). The claims flagged in section 1 above (VAT, 24-hour reply, payment marks) are present identically in both locales, so the defect is symmetric, not an EN-only or AR-only gap.

## 7. Meta lengths

Recomputed independently with a pipe-aware regex (naive `split('|')` breaks because AR/EN titles embed a literal " | اوبتيمال اكس" / " | OptimalX" separator that collides with markdown's column delimiter):

All 12 section-10 rows (home, six goal pages, services, branch, about, contact, guides index) — claimed character counts match actual `len()` counts exactly, and all fall inside their stated bands (AR title 45–55, AR description 130–150, EN title 50–60, EN description 140–155). No out-of-band rows found.

Section 3 category-page titles (AR, 45–55 band), all in range: protein 54, whey-protein 52, whey-isolate 48, casein 51, plant-protein 47, mass-gainer 51, creatine 48, pre-workout 54, amino-acids 47, omega-3 49, collagen-beauty 51, snacks-bars 48, accessories 49, vitamins-minerals (composed) 47, daily-health (composed) 50. All 15 titles verified in-band by script; none flagged.

---

## Severity summary

- **Blockers (3):** Finding 1 (unconditional "official distributors" claim, line 49), Finding 2 (unconditional 24-hour reply promise, sitewide), Finding 3 (reuse of the self-banned "الأكثر طلبا" phrase, line 206).
- **High (8):** Findings 4, 5, 6, 7, 8, 9, 10, 11, 14.
- **Medium/Low (2):** Finding 12 (whey-serving-count generalisation), Finding 13 (citrulline filter, self-disclosed).
- **Clean, independently verified:** health-language/banned-lexicon (section 3), register/dialect/dashes/diacritics (section 5), locale-JSON parity (section 6), meta lengths sections 10 and 3 (section 7).
