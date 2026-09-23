# S8c: the free advisory + InBody CTA on the product page

Batch: the owner's 2026-09-24 brief — "the free advisory and InBody test
should be shown on product pages at the bottom, in the way of: can't decide
what you need? contact us, book a free advisory with a free InBody test …
linking to the services page or with direct WhatsApp contact; what we offer
is highly conversional." Claims law: `docs/build/research/FINAL-claims-source.md`
§3 and `docs/brand/voice-ksa.md` §6.

---

## 1. What ships

`app/components/product/BelowFold/AdvisoryCta.tsx`, mounted at the bottom of
every boxed product page — after the related rail and the FAQ, before the
sticky bar and the footer — and never on a service or booking product:

```
section[data-testid="ox-pdp-advisory"]
  plate  --ox-graphite-3, the mark's own corner cut (ox-x-corner, 40px, start)
    h2    لست متأكدا مما تحتاجه؟
    p     احجز استشارة مجانية، مع قياس تكوين الجسم (InBody) مجانا في الفرع،
          لنساعدك على اختيار ما يناسب هدفك.        (InBody clause gated)
    primary    احجز استشارتك المجانية  -> the branch-visit product
    secondary  تواصل عبر واتساب (wa.me, prefilled)  OR  كل الخدمات (text link)
    note       الرد رأي عام من فريق المتجر لمساعدتك في الاختيار، وليس استشارة صحية.
```

Read live off `/ar/x/p1673105563` (boxed, §5): the primary opens
`/ar/p1051830221` (the branch-visit product, the same route S7c's offer strip
opens), and with `whatsapp_number` unset on this store the secondary renders
as the text link to `/ar/services`, labelled `كل الخدمات` — both gates
verified in both states in `tests/product/AdvisoryCta.test.tsx`.

---

## 2. The decisions

### 2.1 A new component and a new partial, not a reuse of `OfferStrip`

The brief offered a choice: "export `OfferStrip` from `OxServices.tsx`, or
lift it into `app/components/common/OfferStrip.tsx` and have both consumers
import it … so you never edit `_b3-product.scss` or `_b2-home.scss`". Neither
literal reuse fits, for three reasons found while reading `OxServices.tsx`
and `_b2-home.scss` section 8 (S7c):

1. **The two blocks disagree on where the heading lives.** The offer strip's
   heading is the band's own `<h2>`, rendered OUTSIDE the strip, in
   `OxServices`'s own header. This block has no band around it, so its
   heading has to live INSIDE the plate — a different DOM shape, not a prop
   away.
2. **The two blocks disagree on their button breakpoint.** `.ox-offer__actions`
   switches to a row at `640px` (`_b2-home.scss`); the brief asks this block
   to switch "at 768". Reusing the exact `.ox-offer__action` selector would
   have made one class mean two breakpoints depending on which file loaded
   last — not a design choice available to make cleanly.
3. **The two blocks disagree on content shape.** The offer strip lists two
   independent FACTS (advice is free; InBody is free) with a gated reply-time
   cue; this block states ONE sentence whose tail changes on a gate, and its
   secondary action is WhatsApp or a fallback link, never a second fact.

Given that, "never edit `_b2-home.scss`" is the load-bearing half of the
brief's sentence: the plate's VISUAL identity (the graphite-3 ground, the
mark's own corner cut, full-width 48px buttons) is reproduced in the new
`_b7-advisory.scss` partial with its own `.ox-advisory*` selectors, and
`OxServices.tsx` is not imported from, or edited, at all — it was not in the
touched-file list this report needed to justify, and its own 21 tests
(`tests/home/OxServices.test.tsx`) are unaffected. `.ox-band-dark`, an
existing token-repointing utility class (`app/styles/tokens.css`, already
loaded ahead of the `06-ox` layer, not owned by this batch), is applied to
the plate `<div>` so its children's `.ox-h3`/`.ox-body`/`.ox-small` type
classes resolve to on-dark ink automatically — the same mechanism the offer
strip's own section relies on, reused rather than reinvented.

### 2.2 `settings` arrives as a prop, not a second `useTheme()` call

`ProductPage.tsx` already computes `const settings = theme.settings as
Record<string, unknown> | undefined` once and passes it down to
`ServicePdp`, `PdpPriceBlock`, `SpecFacts`, `TrustGrid` and
`DeliveryPromise`. `AdvisoryCta` takes the same `settings?: Settings` prop
(the `ServicePdp.tsx` signature, verbatim) rather than calling `useTheme()`
itself, so this file reads exactly the shape every sibling `BelowFold`/
`BuyZone` component already reads.

### 2.3 The short line needed its own key

The brief names three `ox.pdp.*` keys explicitly (`advisory_title`,
`advisory_line`, `advisory_whatsapp_text`) and describes two more behaviours
with no key name attached: the two button labels, and — "the InBody clause
renders only when `inbodyIncluded(settings)`; without it the line ends after
'مجانية'" — a SECOND sentence, not a substring of the first one spliced at
runtime (which would have meant storing half a sentence in a locale value,
banned by the fragment reading badly on its own and by `check-copy`'s
per-value dialect/diacritic scan needing a complete sentence to score). Four
keys were named by inference from the existing `ox.pdp.*` convention and are
listed in full below; all four, plus the three given verbatim, live in
`locales/partials/s8c.ar.json` / `s8c.en.json` and were mirrored into
`locales/ar.json` / `locales/en.json` with `pnpm i18n:merge` (6 added, 0
updated, both files).

| Key | AR | EN | Note |
|---|---|---|---|
| `ox.pdp.advisory_title` | لست متأكدا مما تحتاجه؟ | Not sure what you need? | Brief, verbatim. |
| `ox.pdp.advisory_line` | احجز استشارة مجانية، مع قياس تكوين الجسم (InBody) مجانا في الفرع، لنساعدك على اختيار ما يناسب هدفك. | Book a free consultation, with a free InBody body-composition measurement at the branch, and we help you choose what fits your goal. | Brief, verbatim. Renders while `inbodyIncluded(settings)`. |
| `ox.pdp.advisory_line_base` | احجز استشارة مجانية. | Book a free consultation. | New: the brief's "ends after مجانية" state, as its own complete sentence. Renders while InBody is switched off. |
| `ox.pdp.advisory_cta` | احجز استشارتك المجانية | Book your free consultation | New key name; string given verbatim by the brief. |
| `ox.pdp.advisory_whatsapp_cta` | تواصل عبر واتساب | Chat on WhatsApp | New key name; string given verbatim by the brief. |
| `ox.pdp.advisory_whatsapp_text` | مرحبا، أريد استشارة مجانية لاختيار المنتج المناسب: {{product}} | Hello, I would like a free consultation to choose the right product: {{product}} | Brief, verbatim; `{{product}}` is the live product name, URL-encoded at the `wa.me` call site. |

No claims-law finding on any of the six (`check-claims`, `check-copy`): the
allowed verb family (`لنساعدك`), InBody stated only as
`قياس تكوين الجسم` at a place, no مضمون/ضمان, no outcome, no diacritic, no
em-dash, no dialect token.

### 2.4 The closing line and the primary route are reused, not restated

The closing note is `SERVICES_HUB.cardFooterKey`
(`ox.content.services.card_footer`), the exact key `OxServices.tsx`'s own
`TrustRow`-adjacent note and `ServicePdp.tsx`'s scope line do not use (that
one is `ox.pdp.medical_line`) but the brief's own quoted sentence matches
this key's value byte for byte — the same reused-key discipline S7c
documented for its own closing line. The primary action is
`channelById('visit')?.to ?? '/services'`, the identical expression S7c's
`OfferStrip` uses for its own primary, so a future change to the branch-visit
product's route (`app/content/services.ts`) only has to move in one place
conceptually, even though it is written in two files.

### 2.5 The WhatsApp gate reads the setting directly, not the `store.contacts` fallback

`ContactRow.tsx` and `OxWhatsApp.tsx` both fall back to
`store.contacts.whatsapp` when `whatsapp_number` is empty; the brief's own
sentence for this block names one setting only — "rendered ONLY when
`settings.whatsapp_number` is set" — so `AdvisoryCta` reads `settingText(
settings, 'whatsapp_number')` alone. `digitsOnly()` (`app/components/blocks/
href.ts`) still strips everything but the Western digits before the number
reaches the `wa.me` URL, the same function every other WhatsApp link in the
theme calls.

---

## 3. Files

| File | What |
|---|---|
| `app/components/product/BelowFold/AdvisoryCta.tsx` | New. The component. |
| `app/styles/06-ox/_b7-advisory.scss` | New. `.ox-advisory*` rules only; `_b2-home.scss` and `_b3-product.scss` untouched. |
| `app/styles/06-ox/_index.scss` | One line: `@import 'b7-advisory';` after `b6-commerce`. |
| `app/components/product/ProductPage.tsx` | One import, one mount (`isService ? null : <div className="ox-container"><AdvisoryCta .../></div>`), right before the sticky bar; every other block unchanged. |
| `locales/partials/s8c.ar.json`, `s8c.en.json` | New: the six keys in 2.3. |
| `locales/ar.json`, `locales/en.json` | Mirrored via `pnpm i18n:merge` (6 added, 0 updated each). |
| `tests/product/AdvisoryCta.test.tsx` | New: 5 tests — the full line, the InBody-off short line, the WhatsApp href (number, encoding, `{{product}}`), the no-WhatsApp fallback link, the reused closing line. |
| `tests/product/ProductPage.test.tsx` | One new test: the block mounts after the related rail and before the sticky bar on a physical product, and is absent on `service` and `booking`. |

`OxServices.tsx` and `app/components/common/` were not touched — see 2.1.

---

## 4. Verification

```
pnpm typecheck
$ tsc --noEmit                    (clean, no output)

pnpm vitest run tests/product tests/home tests/common
 Test Files  1 failed | 39 passed (40)
      Tests  7 failed | 505 passed (512)
```

The one failing file is `tests/common/sprite.test.ts`, pre-existing and
unrelated: `app/assets/ox-sprite.svg` was already modified in the working
tree before this batch started (not by any file this batch touched — an
icon-geometry regression in `ox-wellness`/`ox-user`/`ox-offers`/`ox-gift`/
`ox-map-pin`/`ox-heart`, outside this batch's file list). Isolated:

```
pnpm vitest run tests/product/AdvisoryCta.test.tsx tests/product/ProductPage.test.tsx tests/home/OxServices.test.tsx tests/common/iconbtnAngled.test.ts
 ✓ tests/common/iconbtnAngled.test.ts (5 tests)
 ✓ tests/home/OxServices.test.tsx (21 tests)
 ✓ tests/product/ProductPage.test.tsx (38 tests)
 ✓ tests/product/AdvisoryCta.test.tsx (5 tests)
 Test Files  4 passed (4)
      Tests  69 passed (69)
```

```
pnpm check:rtl        check-rtl: 330 file(s), 0 problem(s)
pnpm check:motion     check-motion: 330 file(s), 0 problem(s)
pnpm check:strings    check-strings: 335 file(s), 0 problem(s)
node scripts/check-copy.mjs locales/ar.json locales/en.json
                      check-copy: 2 file(s), 0 problem(s)
node scripts/check-claims.mjs
                      check-claims: 44 file(s), 0 problem(s), 4 allowlisted
node scripts/check-tokens.mjs
                      check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
node scripts/check-identity.mjs
                      check-identity: 330 file(s), 0 problem(s)
node scripts/i18n-merge.mjs --check
                      locales\ar.json: 1415 partial key(s), 0 added, 0 updated
                      locales\en.json: 1415 partial key(s), 0 added, 0 updated
node_modules/.bin/sass --no-source-map app/styles/app.scss <out>.css
                      exit 0, compiles clean (pre-existing @import deprecations only);
                      `.ox-advisory*` and its `[dir='ltr']` corner-cut mirror present
                      in the compiled output
```

The four allowlisted claims findings are the pre-existing
`official_distributors` / `trust_distributors` pair, unrelated to this batch.

**Live read**, `http://localhost:3210` (server already running; never started
or stopped it):

- `curl /ar/x/p1673105563` (boxed): `data-testid="ox-pdp-advisory"` present;
  title, the full line with the live `InBody` clause (`inbody_included` is
  unset on this store, which defaults true), and the closing note all render
  verbatim; primary `<a href="/ar/p1051830221">احجز استشارتك المجانية</a>`;
  secondary is `<a href="/ar/services">كل الخدمات</a>` — this store has no
  `whatsapp_number` configured, so the fallback path is what a live read
  finds, and the WhatsApp path itself is covered by
  `AdvisoryCta.test.tsx`'s own `settings={{ whatsapp_number: … }}` case. The
  block sits directly before `.ox-sticky` and the `<footer>` in the served
  HTML.
- `curl /ar/x/p1051830221` (booking): `ox-pdp-advisory` and
  `احجز استشارة مجانية` both occur zero times; `.ox-service` (the booking
  composition) is present, confirming the right page was read.

---

## 5. Deviations

1. **`OfferStrip` was not exported, lifted, or imported anywhere** — see
   decision 2.1. `OxServices.tsx` is unedited.
2. **Four locale keys beyond the three the brief named verbatim** — see
   decision 2.3: the two button labels and the InBody-off short line each
   needed a key name, and the brief gave their VALUES but not their KEYS.
3. **The WhatsApp gate does not fall back to `store.contacts.whatsapp`**,
   unlike `ContactRow.tsx`/`OxWhatsApp.tsx` — see decision 2.5. Reversible by
   adding the same `?? store?.contacts?.whatsapp` this file's siblings
   already carry, if the owner wants the two behaviours to match.
4. **`tests/common/sprite.test.ts` fails**, pre-existing and outside this
   batch's file list (see §4) — reported, not touched, per the brief's own
   "edit only" list, which does not include `app/assets/ox-sprite.svg` or
   that test file.
