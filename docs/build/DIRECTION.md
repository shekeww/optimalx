# OptimalX design direction

Creative director's document. Date 2026-09-17. Binding inputs: scratchpad/design-constraints.md (platform facts, owner brief, render budget, motion law, angle system), the logo, the owner's reference boards, the benchmark and competitor research, BUILD.md sections 3, 4, 6, 7, 13, app/styles/tokens.css and tailwind.config.cjs. Builders implement this document; where it conflicts with BUILD.md 3.1 or 3.2, this document is the newer decision and says why.

Two measurements made while writing this, both of which change earlier assumptions:

1. White text on the brand orange #EE4D22 measures 3.67:1. That passes the 3:1 non-text floor for the button as a component but fails 4.5:1 for any label under 18.66px bold. Every board shows white on orange; every board therefore fails AA on its primary button. This document uses ink on orange for primary buttons (4.87:1), the same pairing the logo itself uses.
2. Negative letter-spacing on Arabic text breaks cursive joins in Chromium and WebKit. BUILD.md 3.2 asks for -0.035em on display. That rule survives only for Latin runs (the wordmark and English brand names). Arabic gets its display character from weight 800 and tighter line-height, never from tracking.

Conventions in this document: sizes are px unless stated; "start" and "end" are logical (inline-start is the right edge in Arabic); "mobile" is 390 wide, "desktop" is 1440 wide with a 1280 container; every token is prefixed --ox- unless it is one of Salla's --color-* or one of the shared motion names (--dur-*, --ease-*, --stagger-step, --direction-factor).

---

## 1. Two directions and the pick

### Direction A: Graphite Field (الميدان)

Intent. A light, neutral shop floor with a graphite ceiling. The page ground is a cool off-white that never turns cream; products sit on white cards; the brand's dark register appears only as full-bleed graphite bands (hero, expert services, footer) and each of those bands carries exactly one large 22-degree edge borrowed from the mark. Orange is spent on things a thumb can press and on one architectural stroke in the home hero, nowhere else. Photography is of real Saudi athletes, both genders, in modest sportswear under natural light, shot against concrete and graphite so the orange reads as the only warm thing on screen. Type is Cairo alone, with weight doing the work: 800 for the hero line, 700 for headings and prices, 600 for labels and buttons, 400 for reading. The feeling is a well-lit specialist shop run by someone who trains: calm, specific, a little austere, with energy coming from composition (the wedge, the athlete, the scale jump between display and body) rather than from motion or colour.

On a phone. The first screen is a 500px graphite band: the athlete fills the top, the headline sits at the bottom in 34px Cairo 800 paper-white, two buttons under it, and one orange corner wedge at the top end edge. Then a 2-by-2 trust strip, then the white-card world begins: six goal cards two-up, category tiles two-up, bestseller cards two-up with an ink-on-orange add button at 44px. A 56px bottom tab bar (home, categories, search, cart, account) stays fixed. It scans fast because every card in a row is the same height and every price sits at the same baseline.

### Direction B: Plate and Footnote (اللوح والحاشية)

Intent. A lab-editorial catalogue. No athletes; every product is a studio render on a single warm-grey plate, cropped identically. Sections open with a small mono-style eyebrow (Latin, tracked, the "NUTRITION & WELLNESS" register from the tagline) and a two-line definition of the term about to be used, in the Transparent Labs "what does clean actually mean" manner. Every factual line carries a footnote mark that resolves to a source or a plain-Arabic explanation at the foot of the block, the Seed discipline. Colour is almost absent: ink, plate, paper, one orange link colour. Cards are sparse in the Thorne manner: image, name, price, servings, nothing else. The wedge appears once per page as a hairline, not a fill. Photography, where it exists at all, is raw ingredients (oats, cocoa, a scoop of powder) not people. The feeling is a reference book you trust because it never raises its voice.

On a phone. A white page with a 40px eyebrow strip, a text hero (no image) in 34px Cairo 800 ink, then plates. Product renders on plate two-up, each card 30% shorter than A's because there is no rating, no chip and no button (add-to-cart lives on the PDP only). It reads slower and more deliberately; the eye has to read to know what a thing is, because nothing on the card is coloured or photographed.

### Recommendation: Graphite Field, with five grafts from Plate and Footnote

Pick A. The reasons, tied to the audience, the persona and the evidence:

1. The audience buys from a person and a place. Saudi supplement buying runs on WhatsApp, on "which branch", on "is this the real one". A lab-editorial page is what an international DTC brand looks like from Riyadh: credible, but foreign and faceless. Athletes who look like the customer, a storefront photo of the Medina branch, and a named delivery day are the trust devices that work here. Direction A has a face and a door; B has neither.
2. Mobile-first scanning favours photography and same-height cards. On a 390px screen B's sparse card forces reading to identify a product; A's plate image plus brand plus name plus servings chip lets a thumb decide in one glance. The KSA competitors (Sporter, Dr Nutrition) win on density and lose on honesty; A keeps their scan speed and strips their claim-heavy noise.
3. The persona explains things properly and never oversells. A dark hero with one wedge and an athlete is energetic but not loud, and everything after the trust strip is white cards and plain lines. The restraint reads as competence, not as a discount store. B is even more restrained, but restraint that removes the product photo and the add button costs conversion on a multi-brand catalogue where the customer already knows the tub they want.
4. The benchmarks split exactly on this line. The highest-trust catalogues (Thorne, Momentous, Transparent Labs) are light chrome with dark image bands and product cards that carry name, price and one honesty device. The editorial-lab pages (AG1, Seed) are single-product subscription funnels; their devices work as sections inside a catalogue, not as the whole store. The one KSA reference with real Arabic traffic (Sporter) is a photo-led catalogue.
5. Cairo has no monospace companion and the one-family rule is binding. B's eyebrow system is a Latin device; in Arabic it becomes a small bold label, which A can carry just as well.

The five grafts from B, all of them kept:

- The plate. Every product image, category tile and brand logo sits on --ox-plate (#F1F1F3), composited or contained, the Bulk device. It tames the loud third-party packaging (ON gold, Dymatize red) and makes a mixed catalogue read as one shop.
- Footnoted facts. The nutrition table's third column explains each number in plain Arabic; any claim that needs a source carries a mark that resolves in the same block. No statistic appears without its source line, ever.
- Definition sections. Before using the words أصلي (authentic) or حلال on a page, a two-line definition of what OptimalX means by them appears once (home trust strip expands to it; PDP trust grid links to it).
- The price objection answered on the page. Thorne's "why are we more expensive" FAQ becomes an honest "لماذا قد تجد سعرًا أقل في مكان آخر؟" item in the home and PDP FAQ, answered with sourcing and expiry facts.
- Sparse spec chips. Servings, serving size, form and expiry are chips in the card and the PDP, the Huel and ON device, and the only numbers that appear on a card besides the price.

The conductor confirms the pick. Everything below is written for Graphite Field.

---

## 2. Token sheet for app/styles/tokens.css

One :root block. Salla's names first (the engine overwrites the four --color-primary* values inline on html after hydration; tokens.css carries the same values so the first paint matches). Everything under "ours" is untouched by the engine. Contrast figures were computed against WCAG relative luminance; where a BUILD.md 3.1 value failed, it is changed here and marked.

### 2.1 Salla-owned names (fallbacks, same values as the dashboard)

| Token | Value | Note |
|---|---|---|
| --color-primary | #EE4D22 | brand orange; the dashboard is the source of truth |
| --color-primary-dark | #C93D18 | hover and pressed fills |
| --color-primary-light | #F38264 | 30% toward white; used by engine tints only |
| --color-primary-reverse | #FFFFFF | engine's on-primary colour; our buttons set label colour explicitly and do not depend on this |
| --color-primary-rgb | 238, 77, 34 | must stay in sync by hand |
| --font-main | 'Cairo', system-ui, -apple-system, 'Segoe UI', sans-serif | |
| --font-ar | same as --font-main | must be defined; app.css remaps --font-main to it under [dir="rtl"] |

### 2.2 Ours: accent aliases

| Token | Value | Role |
|---|---|---|
| --ox-accent | var(--color-primary) | primary buttons, links, active nav, cart count, the home hero stroke, the one orange fill element in each sprite icon |
| --ox-accent-dark | var(--color-primary-dark) | hover fill on primary buttons; visited-free link hover colour |
| --ox-accent-light | var(--color-primary-light) | not used in our markup; exists for engine parity |
| --ox-accent-rgb | var(--color-primary-rgb) | rgba tints in engine selectors |
| --ox-accent-soft | #FDEDE9 | 10% tint on white: wishlist-active background, selected-swatch halo, link hover background in menus |
| --ox-on-accent | #17171A | label and icon colour on an accent fill (4.87:1) |

### 2.3 Ours: ground and surfaces

| Token | Value | Role |
|---|---|---|
| --ox-paper | #F7F7F8 | route ground on every route; html and body background |
| --ox-card | #FFFFFF | cards, inputs, header main bar, modals |
| --ox-plate | #F1F1F3 | image plate behind every product, category, brand and thumbnail image |
| --ox-plate-2 | #E9E9EC | skeleton blocks, pressed plate, table header fill |
| --ox-graphite | #17171A | dark bands: hero, services, footer, announcement, utility bar |
| --ox-graphite-2 | #222226 | tonal wedge inside a dark band; cards on graphite |
| --ox-graphite-3 | #2C2C32 | hover surface for cards on graphite; input fill on graphite |

### 2.4 Ours: ink and lines

| Token | Value | Contrast | Role |
|---|---|---|---|
| --ox-ink | #17171A | 16.3:1 on paper | headings, body, prices, primary button labels |
| --ox-ink-2 | #5A5A61 | 6.4:1 on paper | secondary copy, descriptors, table explanations |
| --ox-ink-3 | #6F6F78 | 4.6:1 on paper, 5.0:1 on card | meta: brand line, review count, breadcrumb, captions. Changed from BUILD's #8A8A93, which measured 3.5:1 and failed AA |
| --ox-ink-4 | #9A9AA3 | below AA | placeholders, disabled text, decorative marks only. Never carries information |
| --ox-ink-on-dark | #F7F7F8 | 16.3:1 on graphite | text on dark bands |
| --ox-ink-2-on-dark | #B9B9C1 | 9.2:1 | secondary text on dark bands |
| --ox-ink-3-on-dark | #8C8C96 | 5.4:1 | meta on dark bands |
| --ox-line | #E6E6E9 | | hairlines, card borders, dividers |
| --ox-line-2 | #D2D2D8 | | input and chip borders, table rules |
| --ox-line-on-dark | rgba(255,255,255,0.12) | | dividers on graphite |

### 2.5 Ours: semantic

| Token | Value | Pair | Contrast | Meaning |
|---|---|---|---|---|
| --ox-go | #0F7B4F | --ox-go-soft #E8F4EE | 4.7:1 on soft, 5.3:1 on white | in stock, delivery day named, saving amount, free shipping reached, verified purchase |
| --ox-note | #8A5E0E | --ox-note-soft #FBF2E0 | 5.1:1 on soft | low stock, expiry under six months, pending status. Changed from BUILD's #9A6A12, which measured 4.2:1 on its own soft |
| --ox-stop | #B3261E | --ox-stop-soft #FBEAE8 | 5.6:1 on soft | form errors, out of stock, failed payment. Never for sale prices |

Sale and was-price colour: the was-price is --ox-ink-3 with a strike; the saving is --ox-go text ("توفير 50 ر.س"). Red never appears on a price. That is the visible difference from Sporter and Dr Nutrition's red discount stacks.

### 2.6 Ours: role tokens (what components actually reference)

Components read role tokens, not palette tokens. A dark band re-declares the roles once and every component inside it adapts without a variant class.

```
:root {
  --ox-bg: var(--ox-paper);      --ox-surface: var(--ox-card);
  --ox-fg: var(--ox-ink);        --ox-fg-2: var(--ox-ink-2);   --ox-fg-3: var(--ox-ink-3);
  --ox-bd: var(--ox-line);       --ox-bd-2: var(--ox-line-2);
  --ox-focus: var(--ox-ink);
}
.ox-band-dark {
  --ox-bg: var(--ox-graphite);   --ox-surface: var(--ox-graphite-2);
  --ox-fg: var(--ox-ink-on-dark); --ox-fg-2: var(--ox-ink-2-on-dark); --ox-fg-3: var(--ox-ink-3-on-dark);
  --ox-bd: var(--ox-line-on-dark); --ox-bd-2: var(--ox-line-on-dark);
  --ox-focus: var(--ox-paper);
  color: var(--ox-fg); background: var(--ox-bg);
}
```

### 2.7 Ours: focus, shadows, radii

| Token | Value | Role |
|---|---|---|
| --ox-focus-ring | 2px solid var(--ox-focus) | applied with outline; outline-offset 2px on buttons and cards, 0 on inputs (ring replaces border colour) |
| --ox-shadow-1 | 0 1px 3px rgba(23,23,26,0.08) | raised: header when scrolled, sticky buy bar, bottom tab bar |
| --ox-shadow-2 | 0 8px 24px rgba(23,23,26,0.10) | floating: mega menu, dropdowns, popovers, toast |
| --ox-shadow-3 | 0 24px 48px rgba(23,23,26,0.18) | modal and drawer panels |
| --ox-r-1 | 6px | chips, inputs, badges, thumbnails, swatches |
| --ox-r-2 | 8px | cards, buttons, image plates, modals, menus (equals tailwind borderRadius.DEFAULT so engine components match) |
| --ox-r-pill | 9999px | filter chips, the cart count, avatar, toggle |

Cards never carry a shadow at rest or on hover; they carry --ox-line and change it to --ox-line-2 on hover and --ox-ink on selection. Three shadows total, no fourth radius.

### 2.8 Ours: spacing, containers, chrome heights, z-index

| Token | Value |
|---|---|
| --ox-1 / --ox-2 / --ox-3 / --ox-4 | 4 / 8 / 12 / 16 |
| --ox-6 / --ox-8 / --ox-12 / --ox-16 / --ox-24 | 24 / 32 / 48 / 64 / 96 |
| --ox-gutter | 16 below 640, 24 from 640, 32 from 1024 |
| --ox-container | 1280 (content max; full-bleed bands ignore it, their inner content respects it) |
| --ox-container-narrow | 880 (account, booking, cart on desktop, contact) |
| --ox-container-text | 720 (guide article measure, about, policies) |
| --ox-h-util | 36 (desktop utility bar) |
| --ox-h-bar | 72 desktop, 56 mobile (main header bar) |
| --ox-h-nav | 48 (desktop category row) |
| --ox-h-tabbar | 56 plus env(safe-area-inset-bottom) |
| --ox-h-sticky | 64 (PDP sticky buy bar) |
| --ox-z-raised | 10 (sticky sidebar, sticky section headers) |
| --ox-z-sticky | 100 (header, tab bar, sticky buy bar) |
| --ox-z-overlay | 200 (mega menu, drawers and their backdrop) |
| --ox-z-modal | 300 |
| --ox-z-toast | 400 |
| --ox-z-skip | 500 (skip link while focused) |

### 2.9 Motion and the angle

Names are the shared motion-law names; values are OptimalX's, tuned for interaction readiness on mid-tier Android. --dur-confirm is a domain addition in the --dur-fast role (confirmation feedback).

| Token | Value | Role |
|---|---|---|
| --dur-fast | 120ms | hover, focus, tap feedback, variant price cross-fade, image swap |
| --dur-confirm | 160ms | add-to-cart tick and cart-count bump |
| --dur-base | 180ms | accordion, filter group, drawer, menu open, toast in |
| --dur-slow | 280ms | sticky bar slide, modal in, route view transition |
| --ease-out | cubic-bezier(0.2, 0, 0, 1) | entrances and reveals |
| --ease-in | cubic-bezier(0.4, 0, 1, 1) | exits, always shorter than the matching entrance |
| --ease-in-out | cubic-bezier(0.4, 0, 0.2, 1) | moves that begin and end on screen (tab indicator) |
| --stagger-step | 40ms | only the goal-grid settle on the home page |
| --direction-factor | 1; -1 under [dir="rtl"] | multiplies every horizontal translate, including inside keyframes |
| --ox-angle | 22deg | the mark's angle from vertical |
| --ox-angle-tan | 0.4040 | tan(22deg); horizontal run per unit of height |
| --ox-band-h | set per band (560, 500, 420, 360) | the band height the wedge is computed from |
| --ox-wedge-run | calc(var(--ox-band-h) * var(--ox-angle-tan)) | resolved horizontal offset of the angled edge |

### 2.10 Tailwind config changes that follow from the sheet

- colors.dark becomes var(--ox-graphite), colors.darker becomes #0F0F12, colors.danger becomes var(--ox-stop); engine classes that use them then match the bands.
- boxShadow: keep the scaffold's names for engine compatibility but point default, light and dropdown to --ox-shadow-1, md and top to --ox-shadow-2, huge to --ox-shadow-3. Delete progress (teal, unused) and mobile (an eight-layer shadow that costs paint on every open drawer).
- borderRadius.DEFAULT stays 8px. Add sm: 6px and full: 9999px as the only other entries.
- transitionTimingFunction: add out, in, in-out pointing at the tokens; leave elastic in place but forbid it in app/ (a lint rule, not a token).
- animation.slideUpFromBottom and slideDownFromBottom: change duration to var(--dur-slow) and easing to var(--ease-out) and var(--ease-in); the scaffold's 0.6s linear is a template tell.

---

## 3. Typography

One family, Cairo, self-hosted variable file, four weights used: 400 (reading), 600 (labels, buttons, chips, nav), 700 (headings, prices, product names), 800 (display only). Latin glyphs come from Cairo too; no Archivo, no second family (BUILD 3.2's Archivo line is withdrawn: it doubled the font load for a wordmark that ships as SVG anyway).

Until the dashboard font is switched to the custom upload, 600 and 800 are not loaded and fall back silently. The kitchen sink route asserts `document.fonts.check('800 16px Cairo')` and shows a red banner when it fails. Fallback rule if 800 is missing: display renders at 700 with the same size and line-height; nothing else changes.

### 3.1 Fluid scale (390 to 1440, linear between)

| Role | Mobile | Desktop | clamp() | Weight | Line-height (Arabic) | Use |
|---|---|---|---|---|---|---|
| display | 34 | 56 | clamp(34px, 25.83px + 2.095vw, 56px) | 800 | 1.15 | hero headline, 404 headline, goal landing headline |
| h1 | 28 | 40 | clamp(28px, 23.54px + 1.143vw, 40px) | 700 | 1.2 | page title, PDP product name |
| h2 | 24 | 32 | clamp(24px, 21.03px + 0.762vw, 32px) | 700 | 1.25 | section headers, PDP price |
| h3 | 18 | 20 | clamp(18px, 17.26px + 0.190vw, 20px) | 700 | 1.4 | card titles, goal card labels, price on cards, modal titles |
| lead | 17 | 20 | clamp(17px, 15.89px + 0.286vw, 20px) | 400 | 1.6 | hero sub-line, section descriptors |
| body | 15 | 16 | clamp(15px, 14.63px + 0.095vw, 16px) | 400 | 1.7 | reading copy, table cells, form values |
| small | 13 | 14 | clamp(13px, 12.63px + 0.095vw, 14px) | 400 or 600 | 1.6 | meta, brand line, chips, captions, breadcrumb |
| micro | 11.5 | 12 | clamp(11.5px, 11.31px + 0.048vw, 12px) | 700 | 1.5 | badges, eyebrows, the cart count |

Buttons: 15 mobile / 16 desktop at 600 (label size does not scale with button height; height changes padding). Arabic body is never below 15 and never below weight 400 (constraint 8). Line-heights are Arabic-safe: BUILD's 1.05 display clipped Cairo's descenders and the lam-alef ligature in testing boards, so display is 1.15 and no heading goes below 1.2.

### 3.2 Tracking rules

- Arabic text: letter-spacing 0 at every size. Negative tracking breaks cursive joins in Chromium and WebKit; positive tracking opens gaps inside words. Display character comes from 800 weight, 1.15 line-height and a short line (max 14 words).
- Latin display runs at 32px and above (the English hero line on /en, English brand names set large): -0.02em.
- Latin 14 to 31px: 0.
- Latin eyebrow and tagline register (uppercase, 11.5 to 12px, 700): +0.12em. This is the only place uppercase Latin appears; it echoes "NUTRITION & WELLNESS" on the mark. Arabic has no uppercase, so the Arabic eyebrow is small 600 in --ox-fg-3 with a 24px orange rule beside it.

### 3.3 Numerals and units

- Western digits (0 to 9) everywhere: prices, counts, servings, dates, phone numbers. Never Arabic-Indic digits, in either locale.
- Prices: amount in 700, the riyal symbol as `sicon-sar` at 0.85em sized to the cap height, one space of gap, in the order Salla's price component uses; our custom price markup copies that order exactly and the kitchen sink shows both side by side. "SAR" and "ر.س" never appear as text.
- Alignment of numbers in tables and cart summaries is done with grid columns and `text-align: end`, not with tabular figures. Cairo's tnum support is verified in the kitchen sink; if present it is enabled with `font-variant-numeric: tabular-nums` on `.ox-num` as a bonus, never as the mechanism.
- Units follow the number in Arabic: "2.27 كجم", "30 حصة", "20 جم". Latin unit abbreviations (kg, g, ml) are used only on /en.

### 3.4 Mixed direction (English inside Arabic)

- Every Latin island in Arabic copy is isolated: `<bdi>` for product names and brand names that come from the catalogue ("Gold Standard 100% Whey"), `<span dir="ltr">` for things that must read strictly left to right: phone numbers, email addresses, SKUs, URLs, promo codes, payment brand names (Apple Pay, mada, tabby, tamara).
- Punctuation stays outside the island: "من <bdi>Optimum Nutrition</bdi>،" not "<bdi>Optimum Nutrition،</bdi>".
- Numeric ranges and percentages sit inside `<bdi>`: "<bdi>5-10</bdi> جم", "<bdi>18%</bdi>". Without isolation the hyphenated range reverses in RTL.
- Icons that indicate direction (chevrons, arrows, "back") mirror with `[dir="rtl"] { transform: scaleX(-1) }` on the icon only; icons that do not indicate direction (search, cart, user, heart) never mirror.
- Inputs that take Latin values (email, phone, promo code) set `dir="ltr"` and `text-align: start` so the caret behaves; their labels stay Arabic and RTL.

### 3.5 The wordmark

- The logo is an SVG, never typeset. Two files: `logo-full.svg` (wordmark + mark + tagline) and `logo-compact.svg` (wordmark + mark). A reversed variant of each for graphite grounds (wordmark in --ox-paper; the mark stays #EE4D22 on both grounds).
- Header uses logo-compact at 132px wide desktop, 108px mobile. Footer and about use logo-full at 180px. The tagline is never shown under 160px width; the mark alone (`mark.svg`) is the favicon, the app icon, the loading state and the 404 decoration.
- Clear space equals the height of the "o" on every side. Nothing else is orange inside that clear space.
- In running Arabic copy the brand is "اوبتيمال اكس"; in English copy "OptimalX" as one word. The lowercase "optimal" exists only in the SVG; it is never written as text, never set in Cairo as a fake logo, and never followed by a Cairo "X".

### 3.6 Loading

Preload the variable Cairo file (woff2, Arabic + Latin basic subset) with `font-display: swap` and a metric-matched local fallback (`@font-face` for "Cairo Fallback" with `size-adjust`, `ascent-override`, `descent-override` computed by a font-metrics tool against Segoe UI on Windows and Geeza Pro on iOS, never guessed). The fallback exists so the swap does not shift layout; the numbers are a build task, not a design guess.

---

## 4. Layout and rhythm

### 4.1 Grid

- 12 columns inside a 1280 container; column-gap 16 below 640, 24 from 640 up. Gutters per --ox-gutter (16 / 24 / 32).
- Breakpoints: mobile below 640, tablet 640 to 1023, desktop 1024 and up; container caps at 1280 from 1344 viewport (1280 + 2 × 32).
- Card columns: product cards 2-up on mobile, 3-up on tablet, 4-up on desktop (with the 280px filter rail, 3-up from 1024 to 1279 and 4-up from 1280). Goal cards 2-up mobile, 3-up tablet, 6-up desktop. Category tiles 2-up mobile, 4-up tablet and desktop. Guide cards 1-up mobile as a scroller, 3-up desktop.
- Text measure: --ox-container-text (720) for articles, about and policies; --ox-container-narrow (880) for forms and account.

### 4.2 Vertical rhythm

| Gap | Where |
|---|---|
| 48 (--ox-12) | mobile between every section; desktop inside "buy" pages: PDP below-fold sections, cart, account, booking steps, listing between grid and pagination |
| 64 (--ox-16) | desktop between paper sections on home, hubs, guides and brands; listing top padding; band internal padding (dark bands pad 64 top and bottom on desktop, 48 on mobile) |
| 96 (--ox-24) | desktop above and below the services band, above the branch block, above the newsletter band. These are the breaths that make the dark bands read as chapters rather than stripes |

Fixed zeros: the trust strip sits directly under the hero (it belongs to the first screen); the footer starts directly after the newsletter band; the PDP breadcrumb sits 16 under the header.

Inside a section: header to content 24 mobile / 32 desktop; card internal padding 12 mobile / 16 desktop; between text blocks 16; between a label and its input 8.

### 4.3 Where the grid breaks (and only there)

1. Home hero: the photo panel ignores the container and bleeds to the viewport end edge; the text sits in container columns 1 to 5 (of 12) at the start side.
2. Services band: full-bleed graphite; the tonal wedge panel is full band height at the end side; the three channel cards stay inside the container.
3. Branch block: a 7/5 split. The storefront photo takes columns 1 to 7 at the end side and extends past the container to the viewport edge; the address card takes columns 8 to 12. The photo's inner edge carries the angled cut.
4. Goal landing hero and services hub hero: same construction as the home hero, tonal edge instead of the orange stroke, shorter band.
5. Guides index: the first row is an 8-column feature card beside one 4-column card, both the same height; every later row is three 4-column cards. No masonry.

Everything else (listing grids, PDP, cart, checkout, account, search, booking, brands, contact, policies, 404) is a conventional container, straight edges, equal heights, no clip-path. That is the browse-versus-buy rule from BUILD 3.3 made concrete.

### 4.4 Equal-height rule

Rows are CSS grid with `align-items: stretch`; each card is a flex column whose action row has `margin-block-start: auto`. Inside product cards the slots are fixed: brand line 20, name exactly two lines (min-height 2 × line-height, `-webkit-line-clamp: 2`), chip row 24, rating row 20 (rendered empty at full height when count is 0 so prices stay level), price row 32, actions 44. Goal cards are 128 tall on mobile and 160 on desktop; category tiles are aspect-ratio 4/3; guide cards are a 4/3 image plus a fixed three-line text slot. A row where one card is taller than its neighbour is a G2 failure.

### 4.5 The wedge: one per screen, exact values

The angle is 22 degrees from vertical. Horizontal run = band height × 0.4040. The angled edge always leans the same way as the hero on every band: the photo or tonal panel is wider at its top than at its bottom. Polygons below are declared for RTL (default document direction); `[dir="ltr"]` overrides with the mirrored points listed. No `scaleX(-1)` on photo panels (it would mirror the athlete); colour-only wedges may use `transform: scaleX(var(--direction-factor))` but for uniformity the two-declaration pattern is used everywhere.

| Band | --ox-band-h | Run | Element and RTL polygon | LTR polygon |
|---|---|---|---|---|
| Home hero, desktop | 560 | 226 | `.ox-hero__photo` absolute, inset-block 0, inset-inline-end 0, inline-size 58%: `polygon(0 0, 100% 0, calc(100% - 226px) 100%, 0 100%)` | `polygon(0 0, 100% 0, 100% 100%, 226px 100%)` |
| Home hero stroke, desktop | 560 | 226 | `.ox-hero__stroke` sibling, same box, fill --ox-accent, 12px wide parallelogram along the edge: `polygon(calc(100% - 12px) 0, 100% 0, calc(100% - 226px) 100%, calc(100% - 238px) 100%)`; the photo polygon shifts by 12px so the stroke is not covered: `polygon(0 0, calc(100% - 12px) 0, calc(100% - 238px) 100%, 0 100%)` | mirror: `polygon(0 0, 12px 0, 238px 100%, 226px 100%)` and photo `polygon(12px 0, 100% 0, 100% 100%, 238px 100%)` |
| Home hero, tablet | 520 | 210 | photo 52%, same shape with 210 and 222 | mirrored |
| Home hero, mobile | 500 | (corner) | photo full-bleed behind, gradient overlay; `.ox-hero__corner` 64 × 158 at top inline-end, fill --ox-accent: `polygon(0 0, 64px 0, 0 158px)` (box anchored top-left in RTL) | box anchored top-right: `polygon(100% 0, calc(100% - 64px) 0, 100% 158px)` |
| Services band, desktop | 480 (min-height) | 194 | `.ox-band__wedge` absolute, inset-block 0, inset-inline-end 0, inline-size calc(34% + 194px), fill --ox-graphite-2: `polygon(0 0, 100% 0, calc(100% - 194px) 100%, 0 100%)` | `polygon(0 0, 100% 0, 100% 100%, 194px 100%)` |
| Services band, mobile | auto | (corner) | corner 80 × 198 top inline-end, fill --ox-graphite-2: `polygon(0 0, 80px 0, 0 198px)` | `polygon(100% 0, calc(100% - 80px) 0, 100% 198px)` |
| Goal landing hero and services hub hero, desktop | 420 | 170 | photo 50%, no stroke: `polygon(0 0, 100% 0, calc(100% - 170px) 100%, 0 100%)` | `polygon(0 0, 100% 0, 100% 100%, 170px 100%)` |
| Goal landing hero, mobile | 360 | (corner) | photo full-bleed, corner 64 × 158 in --ox-graphite-2 | mirrored |
| Branch block photo, desktop | 480 | 194 | photo panel: `polygon(0 0, 100% 0, calc(100% - 194px) 100%, 0 100%)` | `polygon(0 0, 100% 0, 100% 100%, 194px 100%)` |
| Branch photo, mobile | 268 (4:3 at 358 wide) | (corner) | paper-coloured corner cut 64 × 158 top inline-end over the photo | mirrored |

Rules that go with the table: one wedge element per viewport-height of page (the hero's stroke and photo edge count as one because they share the edge); nothing under 158px tall is ever angled; badges, buttons, chips, inputs, dividers and card borders are straight; text is never rotated; the wedge is static (no animated clip-path except the cross-document view transition described in section 7, which animates the element's box, not the polygon).

## 5. Component specs

How to read this section. Every component is written the same way. Anatomy lists the slots in reading order (start to end, top to bottom). Sizes are mobile / desktop in px. States list only the states that apply. RTL says what mirrors and what must not. Wraps names the engine or salla-* piece the component composes or styles; "ours" means there is no engine piece and the component is built from HTML, tokens and the sprite. Component names are the ones in PLAN.md section 3 so a builder can find the file. Every component reads role tokens (--ox-fg, --ox-bg, --ox-surface, --ox-bd) so it adapts inside .ox-band-dark with no variant class. Every interactive element has a visible focus ring (--ox-focus-ring) and a minimum 44 × 44 hit area even when its drawn box is smaller; that rule is stated once here and not repeated per component.

Three defaults apply everywhere and are not repeated: card hover changes only the border colour (--ox-line to --ox-line-2) and never lifts, scales or shadows; text is never rotated; every horizontal scroller is position relative with scroll-snap on mobile and arrow buttons on desktop only.

### 5.1 Chrome

**SkipLink** (layout/SkipLink). Anatomy: one link, label "تخطي إلى المحتوى", target #main. Sizes: 44 tall, padding 12 / 16, sits at inset-block-start 8 and inset-inline-start 8 when focused. States: visually hidden (clip) until focus; focused shows as a primary button on --ox-graphite with --ox-paper focus ring at --ox-z-skip. RTL: appears at the start edge, the right on Arabic pages. Wraps: ours; the first child of body, before the engine's Toaster.

**AnnouncementBar** (layout/Header/AnnouncementBar). Anatomy: one line of text, centred, from the announcement_text setting (FINAL-content 1.2; the short variant under 640). Sizes: 40 / 36 tall, small 600, --ox-graphite band, --ox-ink-on-dark text. States: default; hidden when the setting is empty. No dismiss button: the line is the store's shipping promise, not a campaign, and a dismiss control costs a cookie and a state. If the dashboard advertisement feature is configured, the engine's advertisement bar renders above ours and ours hides for that session so two dark lines never stack. RTL: text runs RTL; the 299 figure stays Western. Wraps: ours; hides when the engine advertisement bar is present.

**UtilityBar** (layout/Header/UtilityBar). Anatomy: delivery promise line at start (icon 16 from sicon truck, text small 400 --ox-fg-2-on-dark, city and day from the delivery_promise_line setting until the live promise exists); language and currency button at end. Sizes: desktop only, --ox-h-util 36 tall, --ox-graphite band, container width. Hidden below 1024; the promise moves to the mobile drawer footer and the PDP delivery block. States: default; button hover underlines. RTL: the promise sits at the start (right), the button at the end (left); the globe icon does not mirror. Wraps: ours. The language and currency button is a plain button labelled "العربية · ر.س" (or "English · SAR") that dispatches the localization::open event; one SallaLocalizationModal is rendered once in OptimalXLayout and styled: title h3, two segmented lists (language, currency), 48 rows, the selected row carries --ox-ink border and a tick.

**MainBar** (layout/Header/MainBar). Anatomy: logo-compact link at start, search field in the centre, then account, wishlist, cart at the end. Sizes: 56 / 72 tall, --ox-card surface, a 1px --ox-line bottom rule at rest and --ox-shadow-1 once the page has scrolled 8px (sticky when header_is_sticky is on; z --ox-z-sticky). Logo 108 / 132 wide. Search field 48 tall, min-width 480, max-width 640, grows to fill the middle. Icon buttons 44 square with 24 icons, gap 8. States: scrolled (shadow-1); search focused (ring replaces the field border; the suggestions panel opens under the field with --ox-shadow-2, 8px radius, max-height 60vh, product rows 56 tall with a 40 thumb on plate). Cart count and wishlist count are pills, micro 700, --ox-accent fill with --ox-on-accent text, hidden at 0. RTL: logo at the right, actions at the left; the search icon sits at the inline-start of the field; the magnifier, user, heart and bag icons never mirror. Wraps: SallaSearch inside our field styling with placeholder "ابحث عن منتج أو هدف" and inputmode search; SallaUserMenu with avatarOnly (its dropdown restyled: 8px radius, shadow-2, rows 44, Arabic labels from the engine); wishlist is a plain Link to /account/wishlist with the count from useWishlist; SallaCartSummary with our icon in the icon slot and the count pill.

**NavBar** (layout/Header/NavBar). Anatomy, start to end: الأهداف (opens the goals mega panel), then the categories from menu.queries.header() as top-level links, then الخدمات, الأدلة, الفرع, then a "المزيد" overflow when the row would exceed the container. Sizes: desktop only, --ox-h-nav 48 tall, --ox-card, bottom rule --ox-line; items 15 600 with 16 horizontal padding; active route item carries a 2px --ox-accent underline the width of the label. Mega panel: container width, 8px radius, --ox-shadow-2, padding 32, two regions: six goal cards in a 3 × 2 grid at 160 tall each (the GoalCard spec below) taking columns 1 to 8, and a categories column in columns 9 to 12 (heading small 600 --ox-fg-3, links 40 tall). States: hover opens the panel after 120ms of intent and closes 200ms after the pointer leaves both item and panel; click and Enter toggle; Escape closes and returns focus to the item; the open item shows the underline. The overflow "المزيد" is computed on resize with ResizeObserver and holds the trailing items in a plain dropdown (rows 44). RTL: order runs right to left; the panel aligns to the start edge of the container; the chevron on "المزيد" mirrors. Wraps: ours; category data from the engine menu query; the panel is a plain popover, not SallaMenu, because SallaMenu renders the dashboard tree as nested lists and cannot host the goal cards.

**MobileHeader** (layout/MobileHeader). Anatomy: menu button (44, sicon menu) at start, logo-compact centred, cart at end. On listing, search and goal routes a second row, 48 tall, holds the search field full width and stays sticky with the bar. Sizes: 56 tall, --ox-card, rule --ox-line; the two-row variant is 104. The end slot is the cart rather than search because the bottom tab bar can be switched off by the merchant (show_bottom_tabbar) and the header must still carry the cart on its own. States: scrolled shadow-1; menu open (button becomes a close icon, aria-expanded). RTL: menu at the right, cart at the left; the menu icon does not mirror. Wraps: ours; SallaCartSummary in the end slot.

**MobileDrawer** (layout/MobileDrawer). Anatomy top to bottom: header row 56 (logo-compact 96 wide, close button 44); the menu stack: الأهداف as a collapsible group of six 48 rows with 24 sprite icons, then التصنيفات as a group from menu.queries.header() (nested categories one level deep, indented 16, chevron rows), then الخدمات, الأدلة, الفرع, من نحن, اتصل بنا as single rows; a footer region on --ox-plate with the language and currency button (48), the delivery promise line, and a contact row (WhatsApp and phone links, 44 each). Sizes: inline-size 320 on 390 (86vw, max 360), full height, --ox-card, --ox-shadow-3, z --ox-z-overlay; backdrop rgba(23,23,26,0.5), no backdrop-filter. States: closed, opening (slide in from the start edge, --dur-base --ease-out), open (focus trapped, body scroll locked), closing (--dur-fast --ease-in); group rows use aria-expanded and animate height with --dur-base. RTL: slides from the right; row chevrons mirror. Wraps: ours; category data from the engine menu query; login and account rows use the engine's login modal (SallaLoginModal is already in the layout).

**BottomTabBar** (layout/BottomTabBar). Anatomy: five equal tabs: الرئيسية (home), التصنيفات (opens MobileDrawer at the categories group), البحث (opens the search sheet with the field focused), السلة (cart, with count pill), حسابي (account, or the login modal when logged out). Each tab is an icon 24 over a label 12 600. Sizes: 56 tall plus env(safe-area-inset-bottom) as bottom padding, --ox-card, top rule --ox-line, --ox-shadow-1, fixed, z --ox-z-sticky, below 1024 only. States: active tab icon --ox-accent and label --ox-ink; inactive both --ox-ink-2; the count pill as in MainBar. Hidden while a drawer or modal is open, and on the PDP while the sticky buy bar is showing (the buy bar takes its place; two fixed bars would take 120px of a 660px viewport). RTL: order runs right to left; no icon mirrors. Wraps: ours; SallaCartSummary count via its store; SallaUserMenu logic via the engine auth store for the account tab.

### 5.2 Home blocks

**OxHero** (home/OxHero). Anatomy: eyebrow (the H1 line from FINAL-content 1.1 at small 600 --ox-fg-2-on-dark: it is the page's h1 because the keyword line must exist and be visible, and the eyebrow position keeps it from reading as a keyword line), display line (a paragraph in display style, Cairo 800, the recommended "ما هدفك اليوم؟"), sub-line (lead, --ox-fg-2-on-dark, max 14 words per line, max 2 lines), a button row (primary ink-on-orange "تسوق حسب هدفك" scrolling to the goals block, secondary outline-on-dark "اسأل قبل أن تشتري" linking to /services), the athlete photo panel and the orange stroke (polygons in 4.5). Sizes: 500 / 560 tall (520 on tablet); text in columns 1 to 5 with padding-block 48 / 64; buttons 44 / 48. Mobile: photo full-bleed behind, a bottom gradient from transparent at 40% height to --ox-graphite at 100% for text contrast (a linear gradient, not a blur), text pinned to the bottom with 24 padding, the corner wedge 64 × 158 at the top end. Image slot: the hero image object-fit cover, object-position from the merchant field (default "center top" on mobile so the face stays in frame). States: default only; the merchant fields are image, mobile image, eyebrow, headline, sub-line, both button labels and links. Video variant (optional, 8.7): the loop replaces the photo on desktop only when prefers-reduced-motion is not set and the connection is not save-data; the poster is the photo. RTL: text at the start (right), photo at the end (left); the athlete photo is never mirrored. Wraps: ours; registered as home:ox-hero.

**OxTrustStrip** (home/OxTrustStrip). Anatomy: four items in a row (2 × 2 below 640), each a button with a 24 sprite icon at the start, a title 15 700 and a six-word line small 400 --ox-fg-2 (FINAL-content 1.3). Under the row, a definition panel: a two-line sentence for the open item (the أصلي and حلال definitions, and the "why OptimalX" items in FINAL-content 1.5). Sizes: item 72 tall; panel 0 to auto with 16 padding; the block sits at zero gap under the hero on --ox-paper with a --ox-line bottom rule. States: closed; one open at a time (aria-expanded, height --dur-base --ease-out); hover on the title underlines; the whole block hides an item whose owner gate in 1.3 is not cleared (the "موزعون رسميون" line is gated). RTL: icon at the start of each item; the grid order runs right to left. Wraps: ours; registered as home:ox-trust-strip.

**GoalCard** (home/OxGoals and the mega panel). Anatomy: sprite icon 32 (one orange fill element), title h3 (18 / 20, 700), one line small 400 --ox-fg-2 clamped to one line. Sizes: 128 / 160 tall, padding 16 / 20, --ox-card, --ox-line border, 8px radius; grid 2-up / 3-up / 6-up. States: default; hover border --ox-line-2; focus ring outside the border; active (pressed) background --ox-plate. The whole card is one link. RTL: icon and text align to the start. Wraps: ours; the six goals come from content/goals.ts and link to the goal categories.

**CategoryTile** (home/OxCategories). Anatomy: photo on --ox-plate (aspect 4/3, image contained with 12 padding so the packaging never touches the edge), a label strip under the photo (label 16 700 --ox-fg, optional count small --ox-fg-3 at the end). Sizes: label strip 48 tall; grid 2-up / 4-up. States: hover border --ox-line-2 and the image plate darkens to --ox-plate-2; focus ring. RTL: label at the start, count at the end. Wraps: ours; images from the asset brief (8.2); links to the type categories.

**SectionHeader** (common/SectionHeader). Anatomy: eyebrow row (24 × 2 --ox-accent rule then a small 600 --ox-fg-3 label), title h2, descriptor lead --ox-fg-2 (one line, from FINAL-content 1.4), "عرض الكل" link at the end of the title row (15 600 --ox-fg with a 16 chevron). Sizes: block-end gap to content 24 / 32; the link sits on the title baseline on desktop and drops under the descriptor on mobile. States: link hover changes colour to --ox-accent-dark and the chevron moves 2px along the reading direction (translate, --dur-fast). RTL: rule at the start of the eyebrow; chevron mirrors. Wraps: ours.

**ProductsSliderWrapper** (home/OxProducts). Anatomy: SectionHeader, then the slider of ProductCards. Sizes: card width 172 on 390 (two cards and a peek of the third), 300 on desktop (four per view); arrows 40 square on --ox-card with --ox-line border, placed at the end of the header row on desktop; no arrows below 1024. States: loading shows four card skeletons at final size; empty hides the whole block (never an empty rail). RTL: the rail starts at the right and scrolls leftward; arrows mirror and swap roles; the first card aligns to the container start. Wraps: SallaProductsSlider (native Swiper) with the card override from registry product:card; the slider root is position relative (render budget).

**OxServices** (home/OxServices). Anatomy: dark band with the wedge (4.5), SectionHeader in the on-dark roles, three ChannelCards in a row (stacked on mobile). ChannelCard: sprite icon 32, title h3, two lines body --ox-fg-2, price line (from the product price via useMoney, or "مجاني" for the written question), a primary ink-on-orange CTA. Sizes: band min-height 480 on desktop with 64 padding; card 20 / 24 padding on --ox-surface (graphite-2), --ox-bd border, 8px radius; cards equal height with the CTA pinned to the bottom. States: card hover raises the surface to --ox-graphite-3; CTA states as the button spec. RTL: wedge at the end; cards run right to left. Wraps: ours; links to the three service or booking products; registered as home:ox-services.

**GuideCard** (home/OxGuides and the blog index). Anatomy: 4/3 image (cover, on plate while loading), category label small 600 --ox-fg-3, title h3 clamped to 2 lines, read time small --ox-fg-3 ("قراءة 4 دقائق"). Sizes: text slot fixed at 3 lines of height plus 16 padding; mobile one-up scroller at 300 wide, desktop 3-up. States: hover border --ox-line-2; the image never zooms. RTL: text aligned to the start. Wraps: ours; data from the engine blog loaders.

**OxBranch** (home/OxBranch and pages/BranchPage). Anatomy: storefront photo panel with the angled inner edge (4.5), then the address card: eyebrow "فرعنا في المدينة المنورة", address body (two lines, "الخالدية، شارع جبار بن صخر"), HoursTable, a button row with a primary WhatsApp button (48, sicon whatsapp) and a secondary "الموقع على الخريطة" link opening {MAP_URL}, and the pickup note small --ox-fg-2 ("استلام مجاني من الفرع" with the cut-off hour from settings). Sizes: desktop 7/5 split at 480 tall; mobile the photo at 4/3 with the paper corner cut, then the card at full width. States: hours row for today is bold with "اليوم" at its end; a closed-now line appears in --ox-note when the opening_hours say closed. RTL: photo at the end, card at the start. Wraps: ours; hours and address from theme settings via content/branch.ts; the map link is a plain link (SallaMap is reserved for the branch page where the maps key exists).

**OxNewsletter** (home/OxNewsletter). Anatomy: title h2, intro line (FINAL-content 1.4), an email input with a primary button attached at its end, a consent line small --ox-fg-3. Sizes: band on --ox-plate (not graphite: the footer that follows is graphite, and two dark bands touching would merge), padding 48 / 64; input 48; button 48. States: idle, submitting (button loading), success (the form is replaced by a line in --ox-go with a tick, same height), error (field error state). RTL: the input is dir ltr with text-align start for the address; the label stays Arabic. Wraps: ours; posts to the store's newsletter endpoint if present, otherwise to the owner's chosen provider (owner checklist).

**Footer** (layout/Footer). Anatomy top to bottom: four link columns (تسوق, المساعدة, الشركة, تواصل معنا) with headings small 600 --ox-fg-3-on-dark and links 40 tall; a row with SallaSocial at the start and SallaAppsIcons at the end; SallaPayments marks row (marks on a --ox-paper plate 32 tall each so card logos keep their own colours); SallaTrustBadges row (the Saudi Business Center and Maroof marks the engine provides); the VAT certificate block (a 56 tall link row with the certificate icon, opening the certificate the store provides); the trust line (FINAL-content 1.6, rendered only when {CR}, {VAT} and {MAROOF} are all filled, and the second line under the marks); the copyright row with the engine's copyright hook slot. Sizes: --ox-graphite band, padding 48 / 64, columns 1-up on mobile as collapsible groups (48 rows), 4-up on desktop; logo-full reversed at 180 above the columns. States: links hover underline; groups collapsible on mobile with aria-expanded. RTL: columns run right to left; social and apps icons never mirror. Wraps: ours around SallaSocial, SallaPayments, SallaTrustBadges, SallaAppsIcons, SallaContacts (in the contact column), and the engine's copyright hook.

### 5.3 Catalogue

**Breadcrumb** (SallaBreadcrumb styled). Anatomy: home link, then each ancestor, then the current page as plain text. Sizes: small 400, items 32 tall, 16 under the header on the PDP; a horizontal scroller on mobile so long trails never wrap to three lines. States: link hover colour --ox-accent-dark. RTL: separators are 16 chevrons that mirror; the trail reads right to left. Wraps: SallaBreadcrumb (engine) styled through its s-breadcrumb classes; ours only where the engine omits it (custom routes), built from the same markup.

**ListingHeader** (listing/ListingPage). Anatomy: title h1, count small --ox-fg-3 ("96 منتجا"), sort select at the end, and below 1024 a filters trigger button (secondary, 44, sicon filter, with the active-filter count in a pill). Sizes: title row 48 / 56; controls row 44. States: sort open (native select); filters trigger active when any filter is applied. RTL: title at the start, controls at the end. Wraps: ours; the sort options are the engine's listing sort keys.

**FiltersRail** (listing/FiltersDrawer styling hooks). Anatomy: applied chips row (each chip with a remove control and a "مسح الكل" link), then filter groups as collapsibles: group title 15 600, options as checkbox rows 44 tall with counts in --ox-fg-3, the price range group with two inputs (من, إلى, 44 tall, dir ltr) and the range slider under them. Sizes: 280 wide from 1024, sticky at top offset header height plus 16, z --ox-z-raised, max-height calc(100vh minus that offset) with internal scroll. Below 1024 the same content lives in a drawer (MobileDrawer sizing, from the end edge, with a sticky footer holding "عرض N منتجا" primary and "مسح" ghost). States: group open and closed; option checked; slider thumb focus ring; the rail shows skeleton rows while facets load. RTL: the rail sits at the start (right) of the grid; the slider fills from the start; chips remove control at the end of the chip. Wraps: SallaFilters and salla-price-range styled through their s-* classes; the drawer chrome is ours.

**LoadMore** (listing/ListingPage). Anatomy: a progress line small --ox-fg-3 ("عرض 24 من 96") and a secondary button "عرض المزيد" (48). Sizes: block 48 gap above, centred. States: idle, loading (button loading state; the next row of skeleton cards appears at final height before the data), end (button replaced by the line "هذه كل المنتجات"). Auto-loading on scroll is not used: it makes the footer unreachable and the per-page URL unstable. RTL: nothing mirrors. Wraps: SallaInfiniteScroll in button mode, styled; the engine's pagination markup on routes that use it.

**ProductCard** (product/OxProductCard, registry product:card). Anatomy top to bottom: image plate (1:1, --ox-plate, image contained with 12 padding, a second image on hover only when the product has one) with the badge stack at the top start corner and the wishlist button at the top end corner; brand line small 600 --ox-fg-3 (a bdi, 20 tall); name h3 at 15 / 16 700 clamped to exactly 2 lines (min-height two line-heights); spec chips row 24 (servings, form; from specLine.ts; empty row keeps its height); rating row 20 (SallaRatingStars 14 plus count small --ox-fg-3; rendered empty at full height when count is 0); price row 32 (price 700 with the riyal icon, was-price small --ox-fg-3 struck, saving small 600 --ox-go); action row 44 (the add button full width). Sizes: card padding 12 / 16, --ox-card, --ox-line border, 8px radius; 2-up on 390 gives a 171 wide card with a 147 plate. States: default; hover border --ox-line-2 and second image; focus ring on the card link and separately on the buttons; loading skeleton; out of stock (badge "نفدت الكمية" in --ox-stop on --ox-stop-soft, price stays, the action becomes a secondary "نبهني عند التوفر" that the engine renders when productStatus is out-and-notify, otherwise the button is disabled with the label "غير متوفر"); low stock (a small --ox-note line "بقي N" under the price when the engine exposes the quantity and it is 5 or less). Badges: الأكثر طلبا (--ox-graphite fill, --ox-paper text; only when total_sold_enabled and real data exist), جديد (--ox-card with --ox-line-2 border, --ox-fg text), the saving badge (--ox-go on --ox-go-soft, "توفير 50 ر.س"), and the expiry note (--ox-note on --ox-note-soft, "صلاحية حتى 2027-03") when the expiry is under six months. Badges are 20 tall micro 700, 6px radius, max two stacked. RTL: badges at the start corner (right), wishlist at the end corner (left); price row order follows the engine's price component (amount then icon). Wraps: overrides the engine ProductCard at registry key product:card; the add button wraps SallaAddProductButton at 44 with our primary styling; wishlist is a SallaButton with the heart icon toggling useWishlist; rating is SallaRatingStars; price through useMoney. The engine's ProductCard.tsx wrapper in the project (the post-mount class marking and inline hides) is retired by the override.

**GoalLanding hero** (listing/GoalLanding). Anatomy: same construction as OxHero without the stroke: eyebrow (the goal name), display headline (the goal H1 from FINAL-content section 2, verbatim), the intro paragraph (lead, 2 lines max), one primary button that scrolls to the grid, photo at the end with the tonal edge. Sizes: 360 / 420. States: default. RTL: as the hero. Wraps: ours; content from content/goals.ts.

**SubNeeds row** (listing/GoalLanding). Anatomy: SectionHeader ("اختر حسب حاجتك") then three sub-need cards (FINAL-content section 2: need title h3, one line body --ox-fg-2, a "عرض" link at the end), each linking to its type category with the filter in the query when the content names one. Sizes: 3-up on desktop at equal height, stacked on mobile; card padding 16 / 20. States: hover border. RTL: text at the start. Wraps: ours.

**ZeroResults** (listing/ZeroResults). Anatomy: the mark at 48, title h3 ("لم نجد شيئا يطابق «{q}»"), two lines of body --ox-fg-2 with spelling and goal suggestions, a row of six goal chips, a "اسأل قبل أن تشتري" secondary button, and under it a popular-products slider. Sizes: centred, 48 padding. RTL: the query is wrapped in a bdi. Wraps: ours over the engine search loader.

### 5.4 Product page

**PdpGallery** (product/BuyZone). Anatomy: main image 1:1 on --ox-plate (contained, 24 padding), a thumb strip (64 square thumbs, 6px radius, 8 gap; the video thumb carries a 24 play icon), the badge stack at the top start of the main image, the wishlist and share buttons at the top end. Sizes: mobile full-width main image (358 square on 390) with dots under it and swipe; desktop main image 560 with the thumb strip vertical at the start, 6 visible thumbs and a scroll. States: thumb selected (--ox-ink 2px border); zoom on desktop hover when the imageZoom setting is on (the engine's zoom, restyled to a 2x pane that opens at the end side, never over the buy column); image loading shows the plate. RTL: thumb strip at the right on desktop; the swipe direction on mobile follows the document direction (the engine slider handles this). Wraps: SallaSlider for the main image and thumbs; SallaSocialShare for share; the engine's zoom.

**PdpTitleBlock** (product/BuyZone). Anatomy: brand link small 600 --ox-fg-3 (bdi), h1 name (h1 style, 700; the Latin product name stays in a bdi), rating link row (SallaRatingStars 16 with "N تقييما" as a link to the reviews block; hidden entirely when the count is 0 rather than showing empty stars), badge row (same badge set as the card, plus "أصلي" and "حلال" as links to the definition sentences when the owner gates clear). Sizes: block 12 gap between rows. RTL: all rows start-aligned. Wraps: SallaRatingStars; the rest is ours.

**PdpPriceBlock** (product/BuyZone). Anatomy: price h2 700 with the riyal icon, was-price small --ox-fg-3 struck beside it, saving line small 600 --ox-go, the tax note micro --ox-fg-3 ("شامل ضريبة القيمة المضافة"), the per-serving line small --ox-fg-2 ("حوالي 3.20 ر.س للحصة", computed from servings; hidden if the spec line has no servings), and SallaInstallment (tabby and tamara widgets) under it. Sizes: rows 8 gap; installment widgets are given a fixed 48 slot so their late load does not shift the buy button. States: the price cross-fades when a variant changes (opacity, --dur-fast) with no size change because the slot is min-height 40. RTL: the amount and icon follow the engine's order. Wraps: useMoney for JSX money; SallaInstallment.

**SpecChips** (common/Chip in product/BuyZone). Anatomy: chips for الحصص, حجم الحصة, الشكل, الصلاحية from specLine.ts, each an icon 16 plus label small 600. Sizes: 32 tall on the PDP (24 on the card), 6px radius, --ox-plate fill, --ox-fg text, 8 gap, wrap allowed on the PDP. States: static. RTL: icon at the start. Wraps: ours.

**Options** (salla-product-options styled). Anatomy: group label 15 600 with the selected value beside it in --ox-fg-2, then the choices. Size choices as pills (44 tall, 16 padding, --ox-line-2 border, 6px radius); flavour choices as swatches (a 44 tall tile with the flavour name and, when the option has an image, a 28 thumb at its start). Sizes: gap 8, groups 16 apart. States: default; hover border --ox-line-2; selected 2px --ox-ink border with --ox-accent-soft fill; unavailable struck with a diagonal --ox-line-2 rule and --ox-ink-4 text, still focusable and announced as غير متوفر; error (a required group without a choice shows the group label in --ox-stop with a line under the group). RTL: choices run right to left. Wraps: SallaProductOptions through its s-* classes; radio semantics are the engine's.

**SupplyCalculator** (product/BuyZone). Anatomy: label "كم تكفيك هذه العبوة؟", a stepper for servings per day (44 tall, minus and plus buttons 44 square, value 1 by default, range 1 to 4), a result line body 600 ("تكفي حوالي N يوما حتى {date}", N = servings from the spec line divided by the dose, rounded down, the date computed from today in the Gregorian calendar with Western digits). Sizes: a --ox-plate panel, 16 padding, 6px radius. States: hidden when the spec line has no servings; the result updates in place with an opacity cross-fade. Copy rule: the line describes the package, never a person; no "recommended dose" wording. RTL: stepper minus at the start. Wraps: ours, client only.

**DeliveryPromise** (product/BuyZone). Anatomy: truck icon 20, the promise line body ("يصل إلى {city} يوم {day}" with the day in --ox-go 600), a city change link small at the end. Sizes: 48 tall row, --ox-line top and bottom rules. States: loading (a text skeleton at the same height); no city (the line reads "اختر مدينتك لمعرفة موعد الوصول" with the link). RTL: icon at the start. Wraps: SallaDeliveryPromise with the city from the engine store, styled.

**BuyRow** (product/BuyZone). Anatomy: quantity input at the start (44 tall, minus, value, plus, 120 wide), add to cart primary 48 filling the rest, then a full-width secondary "اشتر الآن" 48 under the row. Sizes: 12 gap; the row is the anchor the sticky bar watches. States: add button default, hover, pressed, loading (engine loader restyled), confirmed (label swaps to a tick plus "أضيف" for --dur-confirm then returns), disabled when required options are missing (the button stays enabled but scrolls to and highlights the missing group; a truly disabled state exists only for hidden or out products). RTL: quantity at the right. Wraps: SallaQuantityInput, SallaAddProductButton, SallaQuickBuy (buy now).

**WishlistShare** (product/BuyZone). Anatomy: two ghost buttons 44 with icon 20 and label ("أضف إلى المفضلة", "مشاركة"). States: wishlist active fills the heart in --ox-accent and the label reads "في المفضلة". RTL: icons at the start of each label. Wraps: SallaButton over useWishlist; SallaSocialShare.

**TrustGrid** (product/BuyZone). Anatomy: four items in a 2 × 2 grid, each a 20 sprite icon plus a title small 600 and a line small --ox-fg-2 (authentic, expiry printed, shipping from Medina, secure payment); the authentic and expiry items link to the definition sentences. Sizes: items 56 tall, 12 gap, --ox-line top rule. RTL: icon at the start. Wraps: ours (SallaTrustBadges is the footer's; this grid is the store's own promises).

**StickyBar** (product/StickyBar). Anatomy: thumb 40 on plate, name 15 600 one line clamped, price 700 with icon, add to cart primary 44 at the end (on mobile the button reads "أضف · 129 ر.س" and the name and price hide under 360). Sizes: --ox-h-sticky 64, --ox-card, top rule and --ox-shadow-1, fixed bottom, z --ox-z-sticky, container padding. States: hidden until the BuyRow's bottom edge passes the viewport top (IntersectionObserver on the BuyRow), then slides up --dur-slow --ease-out; slides down with --dur-base --ease-in when the row returns or the footer enters view. On mobile it replaces the bottom tab bar while visible. RTL: thumb at the right, button at the left. Wraps: the same SallaAddProductButton instance semantics (a second button bound to the same product and quantity); the engine's body class is-sticky-product-bar is honoured for padding.

**BoughtTogether** (SallaBoughtTogether styled). Anatomy: SectionHeader ("يشترى معه عادة"), the engine's group (thumbs on plate, checkboxes, total, one add button). Sizes: thumbs 96 on plate; total row 48. States: the engine's; our button styling. RTL: the plus separators between thumbs are symmetric and do not mirror. Wraps: SallaBoughtTogether.

**GoalFit** (product/BelowFold). Anatomy: SectionHeader ("لمن هذا المنتج؟"), a row of goal chips (each links to its goal page), one body line stating the fit in the allowed verbs ("مناسب لمن يريد دعم..."), and one "وليس ضروريا إذا..." line in --ox-fg-2. Sizes: chips 36. RTL: chips run right to left. Wraps: ours; content from the product metadata and content/goals.ts.

**WhyThis** (product/BelowFold). Anatomy: SectionHeader ("لماذا اخترناه"), three bullets with a 16 sprite tick, body 400. Sizes: bullets 8 gap. RTL: tick at the start. Wraps: ours; the three lines from the product description's second paragraph or the content map, never from an engine field that the sanitizer has not passed.

**NutritionTable** (product/BelowFold). Anatomy: SectionHeader ("حقائق التغذية"), a caption line with serving size, then a table with three columns: العنصر, لكل حصة, ماذا يعني (the plain-Arabic explanation, --ox-fg-2, the widest column at 45% on desktop). Sizes: header row 44 on --ox-plate-2, body rows 48, rules --ox-line-2; on mobile the table is a horizontal scroller (position relative) with min-width 560 and the first column sticky at the start with a --ox-card background. States: rows with a footnote mark link to the source line under the table (small --ox-fg-3, the Seed discipline from section 1). RTL: numbers end-aligned in the amount column; the sticky column is at the right. Wraps: ours; the table is parsed from the first table in the description by specLine.ts and sanitized; the third column comes from the content map keyed by nutrient name.

**HowToUse** (product/BelowFold). Anatomy: SectionHeader, numbered steps (a 28 numeral circle in --ox-plate-2 with 700 digits, step text body). Sizes: steps 16 apart. RTL: the numeral sits at the start; digits stay Western. Wraps: ours.

**PrePurchaseInfo** (product/BelowFold). Anatomy: three collapsible rows: مسببات الحساسية, التخزين, تنبيه (the medical line, owner and lawyer gated). Row: title 15 600, chevron at the end, panel body 400. Sizes: rows 56; panel padding 16. States: the medical row is open by default and cannot be collapsed (it is the honesty device); the others closed. RTL: chevron at the end and rotates 180 when open (direction-neutral). Wraps: SallaAccordion styled.

**Reviews** (SallaComments type product). Anatomy: SectionHeader ("التقييمات"), a summary row (average 700 at h2 size, SallaRatingStars 20, count, a "قيم المنتج" secondary button), then the engine's comments list restyled: each review a --ox-card row with the reviewer name 600, date small --ox-fg-3, stars 14, text body, the verified-purchase mark in --ox-go. Sizes: rows 16 padding, 12 gap. States: empty ("لا توجد تقييمات بعد. كن أول من يقيم." with the button); loading skeleton of three rows; the write form uses our input specs. RTL: stars run right to left (the engine handles the fill direction). Wraps: SallaComments, SallaRatingStars, the engine rating modal.

**Faq** (SallaAccordion styled). Anatomy: SectionHeader ("أسئلة شائعة"), rows as in PrePurchaseInfo; the mandatory item "كيف تختار أوبتيمال إكس المنتجات التي تناسبني؟" is always present on the PDP and the home FAQ. Sizes: as above. States: one open at a time; deep links (#faq-N) open the matching row. Wraps: SallaAccordion; the FAQPage JSON-LD is emitted from the same data.

**Alternatives** (product/BelowFold). Anatomy: SectionHeader ("بدائل مشابهة") and a products slider of the same category and form. Wraps: SallaProductsSlider with source related, our card.

### 5.5 Commerce, account and service pages

**CartRow** (cart.tsx styling). Anatomy: thumb 80 on plate at the start, name 15 600 (bdi) with the chosen options small --ox-fg-3 under it, quantity input 40 tall, line price 700 at the end, a ghost remove button (icon 20, label "إزالة" visible on desktop). Sizes: row 112 on mobile as a two-line layout (thumb and name on line one, quantity and price on line two), 96 on desktop in one line; --ox-line rules between rows. States: updating (the price cross-fades and the row's controls disable for the request); out of stock during checkout (the row gets a --ox-stop-soft background and a line "نفد هذا المنتج" with the remove button emphasised); low stock note in --ox-note. RTL: thumb at the right, price at the left. Wraps: the engine cart page markup styled through its s-* classes; SallaQuantityInput.

**CartSummary** (cart.tsx styling). Anatomy: the free-shipping bar (a 6 tall track on --ox-plate-2 with a --ox-accent fill that turns --ox-go at 100%, a line above it: "أضف 80 ر.س للشحن المجاني" or "وصلت إلى الشحن المجاني"), coupon field (input 48 with an attached secondary button "تطبيق"), the totals table (rows 40: المجموع, الشحن, الضريبة, then الإجمالي at 700 h3 size), the checkout primary 48, and under it a payment marks row (SallaPayments on plate) and the two trust lines small --ox-fg-3. Sizes: --ox-card, 20 padding, --ox-line border; sticky at the top offset on desktop in a 5-column side column of the 12; full width under the rows on mobile with the checkout button repeated in a fixed bottom bar (64) that replaces the tab bar. States: coupon applied (a chip with the code and a remove control replaces the field), coupon error (field error). RTL: labels at the start, amounts at the end with text-align end. Wraps: the engine cart page and SallaCartSummary store; checkout stays Salla's.

**ThankYou blocks** (thankyou.$orderId.tsx). Anatomy after the engine's order summary: a "كيف تبدأ" card with three numbered steps drawn from the ordered products' how-to-use lines, a services nudge card (secondary button to the written question), and the branch pickup note when the order is pickup. Sizes: cards as the card spec, 24 gap. Wraps: the engine ThankYou wrapped.

**AccountNav** (CustomerLayout styling). Anatomy: on desktop a 240 wide side column with the avatar row (48) and links (44 tall, icon 20 at the start, active with a 2px --ox-accent start border and --ox-plate fill); on mobile a horizontal chip scroller (36 pills) under the page title. Sizes: as stated; the content column uses --ox-container-narrow. States: active, hover (--ox-plate fill), badge count on الإشعارات. RTL: side column at the start (right); the active border sits on the start edge. Wraps: the engine CustomerLayout styled; SallaUserMenu logic for the avatar row.

**ServicePdp** (product/variants/BookingProduct and ServiceProduct). Anatomy in place of the physical buy zone: image (the service photo at 4/3 on plate), title block (channel eyebrow, h1, no rating unless reviews exist), price block (price and duration line "30 دقيقة"), a channel facts card (--ox-plate panel with three rows: القناة, المدة, المكان or الرابط), a "ماذا تحضر" list (three bullets: current products, the goal, questions), the note line small --ox-fg-2 "تختار موعدك في صفحة إتمام الطلب" because slot selection happens in Salla checkout, then the primary "احجز الآن" 48 wrapping SallaAddProductButton with productType booking (for the service type the label is "اطلب الخدمة"), then the scope line (what the consultation is not: no diagnosis, no prescriptions). Below the fold: how it works (three numbered steps), FAQ, and the other two channels as ChannelCards. Sizes: the same column widths as the physical PDP. States: the add button as BuyRow; when the booking product has no available slots the engine's status governs and the button reads "لا توجد مواعيد حاليا" disabled with a WhatsApp secondary beside it. RTL: as the PDP. Wraps: SallaAddProductButton with the booking product type; SallaBookingField and SallaDatetimePicker are not rendered on the PDP (they belong to checkout); the digital, gift card and bundle variants are in section 6.

### 5.6 States and feedback

**EmptyState** (pages/EmptyState). Anatomy: the mark at 48 in its brand orange (the only orange decoration allowed outside buttons and the hero stroke), title h3, one body line --ox-fg-2, one primary route out, an optional secondary. Copy per surface: cart ("سلتك فارغة" with "تسوق حسب هدفك"), search (ZeroResults above), wishlist ("لم تحفظ شيئا بعد" with "تصفح أحدث المنتجات"; the bestsellers block is deferred until real data exists, so the route out is the latest products), orders ("لا توجد طلبات بعد" with "ابدأ التسوق"), notifications ("لا إشعارات" with a link to the orders). Sizes: centred in the content column, 48 / 64 padding, max-width 420 for the text. RTL: centred, nothing mirrors. Wraps: ours; the engine's no-content placeholder markup is replaced.

**ErrorState and NotFound** (pages/ErrorState, pages/NotFound). Anatomy: the mark at 96 (404) or 64 (error) as decoration at the top start, display headline ("الصفحة غير موجودة" or "حدث خطأ ما"), one body line, then a route-out row: primary "الرئيسية", secondary "تسوق حسب هدفك", link "ابحث", and a WhatsApp link. The 404 also shows the search field (the MainBar field instance) under the headline. Sizes: --ox-container-narrow, 64 / 96 padding; the mark is static (no rotation, no spin). States: the error state carries a "أعد المحاولة" primary when a retry function exists. RTL: decoration at the start. Wraps: __root.tsx notFoundComponent and the error boundary; ours.

**Skeleton** (common/Skeletons). Rule: every block has a skeleton whose outer box equals the final block in both viewports (the reserved heights in section 6), built from --ox-plate-2 rectangles with the block's own radius. Text lines are 60 to 90% wide rectangles at the line-height. Animation: one opacity pulse between 1 and 0.6 over 1.2s, --ease-in-out, on the skeleton root only (opacity is compositor-safe; a moving highlight would be a paint per frame). Reduced motion: static at opacity 0.8. Skeletons exist for: header (the bar with a logo box and a field box), hero, trust strip, goal grid, category grid, product card and card rows, services band, guide row, branch block, newsletter, footer columns, breadcrumb, listing header, filters rail, product grid, PDP gallery, title, price, options, buy row, each below-fold block, cart rows and summary, account list, booking facts, guide article (title, meta, image, six paragraphs). Wraps: ours; SallaSkeleton and SallaPlaceholder are not used because their boxes do not match ours.

**Toast** (the engine Toaster and cart/AddProductToast). Anatomy: thumb 40 on plate, name 15 600 one line, price small, a "عرض السلة" link, a close button 44. Sizes: 64 tall on desktop, 360 wide, at the top end corner with 16 inset, --ox-card, --ox-shadow-2, 8px radius; on mobile full width minus 16 gutters, above the tab bar or the sticky bar. States: in (translate from the edge, --dur-base --ease-out), visible 4s (pauses on hover and focus), out (--dur-fast --ease-in); a success tick in --ox-go at the start; error toasts use --ox-stop-soft with a --ox-stop start border. Only one toast is visible; a new one replaces the old. RTL: enters from the end edge; on mobile it rises from the bottom. Wraps: the engine Toaster through TwilightProvider's toast and toastMobilePosition props; AddProductToast registered once (the double registration in the current hooks file is a defect to fix, not a design).

**Modal** (SallaModal styled, and the engine's login, offer, scopes, rating modals). Anatomy: backdrop, panel with a header row (title h3, close 44 at the end), body, and an optional footer row for buttons. Sizes: panel max-width 480 (560 for the login modal's social row), 8px radius, --ox-shadow-3, padding 24; on mobile the panel becomes a bottom sheet at full width with a 12px top radius and max-height 90vh. Backdrop rgba(23,23,26,0.5), no backdrop-filter, no blur. States: in (panel opacity 0 to 1 and translate 16px up on desktop, from the bottom on mobile, --dur-slow --ease-out), out (--dur-fast --ease-in), focus trapped, Escape closes, scroll locked. RTL: close at the end (left); the sheet does not mirror. Wraps: SallaModal and the engine modals styled through their s-* classes.

**Drawer**. The MobileDrawer and FiltersRail drawer share one chrome: panel from the start edge (menu) or the end edge (filters), sizing and states as MobileDrawer. Wraps: SallaDrawer where the engine provides it (the filters drawer), ours for the menu.

### 5.7 Primitives

**Button** (common, and the styles applied to s-button-element). Variants: primary (fill --ox-accent, label and icon --ox-on-accent; hover fill --ox-accent-dark with the label staying --ox-on-accent, which measures 4.1:1 at 16px 600 and is accepted for the hover instant only; pressed fill --ox-accent-dark and translate 1px down), secondary (fill --ox-surface, 1px --ox-ink border, --ox-fg label; hover --ox-plate fill), ghost (no fill, no border, --ox-fg label; hover --ox-plate fill), link (inline, --ox-fg with a 1px underline; hover --ox-accent-dark), and the on-dark variants that follow from the roles inside .ox-band-dark: primary unchanged (the orange stays), secondary becomes a --ox-paper border with --ox-paper label and a hover fill of --ox-graphite-3. Sizes: heights 40 (compact: table rows, chips actions), 44 (default, cards, mobile), 48 (page actions, hero, buy); label 15 / 16 600; icon 20 with 8 gap; padding 16 / 20 / 24 by height; 8px radius; min-width 44. States: default, hover, focus (ring, offset 2), active, disabled (fill --ox-plate-2, label --ox-ink-4, no hover, aria-disabled where the control must stay discoverable), loading (width locked, label opacity 0, the engine's 20px loader in the label colour centred; this is a control state, not a content loader, so it is exempt from the no-spinner rule), confirmed (primary only: the tick, --dur-confirm). RTL: icons that indicate direction mirror; the label order is DOM order. Wraps: SallaButton and s-button-element take the same classes so engine-rendered buttons match.

**Input, Select, Textarea** (common). Anatomy: label 14 600 above (8 gap), the field, a helper or error line 13 under it (helper --ox-fg-3, error --ox-stop with a 16 icon). Sizes: field 48 tall (44 inside cart and filters), 16 horizontal padding, --ox-card fill (--ox-graphite-3 on dark), 1px --ox-line-2 border, 6px radius, body 400 text; textarea min 3 rows and resize vertical; select is a native select with a 16 chevron at the end and the same metrics. States: default, hover border --ox-ink-3, focus (ring replaces the border colour, offset 0), filled, disabled (fill --ox-plate, text --ox-ink-4), error (border --ox-stop, ring --ox-stop, the error line, aria-describedby), success (border --ox-go for the newsletter and coupon only). RTL: Latin-value fields (email, phone, promo code; card numbers are Salla's) set dir ltr and text-align start while the label stays RTL; the select chevron does not mirror. Wraps: engine form fields and SallaConditionalFields, SallaFileUpload take the same classes.

**Checkbox and Radio**. Anatomy: a 20 box or circle at the start, label body 400, optional count --ox-fg-3 at the end. Sizes: row 44 tall for the hit area. States: unchecked (--ox-line-2 border on --ox-card), checked (--ox-ink fill with a --ox-paper tick or dot; ink rather than orange so a filter rail with ten checked boxes stays calm), indeterminate (a 10 × 2 bar), focus ring, disabled (--ox-plate fill). RTL: control at the start. Wraps: native inputs; SallaFilters' inputs take the same classes.

**Chip** (common/Chip). Two kinds: spec chips (static, above) and filter chips (interactive: 36 tall pill, 15 600, --ox-card, --ox-line-2 border; selected --ox-ink fill with --ox-paper text; removable chips carry a 16 close icon at the end). States: hover border --ox-ink-3, focus ring, selected, disabled. RTL: icon at the start, close at the end.

**Badge** (common/Badge). 20 tall, micro 700, 6px radius, 8 horizontal padding, the colour pairs listed in ProductCard, never a shadow, never orange (orange is reserved for pressable things and the hero stroke). Wraps: ours; engine promotion badges on s-product-card are restyled to the same box.

**Tabs** (SallaTabs styled). Anatomy: a tab list with a --ox-line bottom rule, tabs 48 tall 15 600, an indicator 2px --ox-ink under the active tab, panels below. Sizes: tabs scroll horizontally on mobile (position relative). States: active, hover (--ox-fg from --ox-fg-2), focus ring, disabled. Motion: the indicator moves with --dur-base --ease-in-out along the direction factor. RTL: the first tab is at the right. Wraps: SallaTabs.

**Tooltip**. Used only on icon-only buttons (header actions, gallery share) to surface the label; never for information that matters. A 32 tall --ox-graphite panel, small --ox-paper text, 6px radius, 8 from the trigger, opacity in --dur-fast; no tooltips on touch (the labels are visible there or the action is self-evident). RTL: centred under the trigger, no mirroring.

**Table** (hours, nutrition, cart totals, order details). Rules --ox-line-2, header row 44 on --ox-plate-2 with small 600 --ox-fg-2, body rows 48 body 400, first column 600 when it is a label column, numbers end-aligned by column alignment, no zebra stripes (rules are enough at 48 tall). On mobile tables wider than the viewport scroll inside a position relative wrapper with a start-side sticky first column.


---

## 6. Page compositions

How to read this section. Every page is an ordered list of blocks, top to bottom, using the component names from section 5 and the routes from PLAN.md section 2. The two height columns are the reserved height of the block's skeleton at 390 (mobile) and 1440 (desktop), in px, excluding the inter-section gap from 4.2. Kind: F is fixed (the skeleton box equals the final box); C is count-driven (rows times row height, the count known before paint from the page size or the content map, so the final box is still deterministic); U is unknown count (the skeleton reserves the empty-state height and the block sits last in its group so growth pushes nothing that matters). Home block heights are the values register.ts hands to registerHomeComponentConfig. A copy reference such as 1.4 points at FINAL-content.md; "copywriter" plus a key means the line does not exist yet and ships under that locale key. Shared chrome is listed once.

### 6.1 Shared chrome (every route)

| Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|
| AnnouncementBar | 40 | 36 | F | 0 when the setting is empty or the engine advertisement bar is present |
| UtilityBar | 0 | 36 | F | desktop only |
| MainBar / MobileHeader | 56 | 72 | F | 104 on mobile for listing, goal, search and brand routes (the search row) |
| NavBar | 0 | 48 | F | |
| Header total | 96 (144 with the search row) | 192 | | body padding-block-start when the header is sticky |
| BottomTabBar | 56 plus safe area | 0 | F | fixed, out of flow; body padding-block-end 56 below 1024 |
| Footer | 640 | 720 | F | logo 40, columns (4 collapsed groups at 48 / open columns 264), social 48, payments 48, trust badges 48, VAT 56, trust lines 48, copyright 40, padding |
| SkipLink, Toast, Modal, Drawer, StickyBar | 0 | 0 | | out of flow |

### 6.2 Home (/, index.tsx)

The default composition (PLAN D5) when the merchant has configured nothing; the merchant reorders or removes blocks in the dashboard.

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | OxHero | 500 | 560 | F | H1 eyebrow 1.1, headline "ما هدفك اليوم؟", sub-line 1.1, both CTAs 1.1, hero photo 8.1 |
| 2 | OxTrustStrip | 144 | 72 | F | four items 1.3; the panel opens to the definitions and the 1.5 items; zero gap to the hero |
| 3 | OxGoals | 544 | 280 | F | SectionHeader (1.4 Goals) 128 / 120, six GoalCards 2-up in three rows at 128 / 6-up at 160 |
| 4 | OxCategories | 880 | 694 | F | SectionHeader (1.4 Categories); eight CategoryTiles by default (the merchant field accepts 4, 8 or 12 so every row is full) 2-up / 4-up, tile 176 / 275 |
| 5 | OxProducts | 508 | 630 | F | SectionHeader; source latest products with the title "أحدث المنتجات" because 1.4 defers "الأكثر طلبا" until real order data exists; one row of ProductCards at 380 / 510 in the slider |
| 6 | OxBrands | 64 | 80 | F | logo strip on plates, no header; scroller on mobile, eight per row on desktop; hidden under four brands |
| 7 | OxServices | 920 | 480 | F | dark band with the wedge; SectionHeader (1.4 Services) in on-dark roles; three ChannelCards stacked at 220 (icon in the title row on mobile) / in one row |
| 8 | OxGuides | 485 | 556 | C | SectionHeader (1.4 Guides); three GuideCards 355 / 436; hidden when the blog has fewer than three posts |
| 9 | OxBranch | 810 | 480 | F | photo 268 then the address card on mobile; 7/5 split at 480 on desktop; copy 1.4 Branch, hours from settings |
| 10 | OxFaq | 408 | 400 | C | SectionHeader "أسئلة شائعة"; five SallaAccordion rows at 56 including the mandatory price item from section 1; registered as home:ox-faq (the planner adds it to the component map; section 5.4 already depends on it) |
| 11 | OxNewsletter | 320 | 300 | F | plate band, copy 1.4 Newsletter |
| 12 | OxBanner | 0 | 0 | F | optional merchant campaign block, off in the default composition; when on: a 4/3 image at 268 on mobile, a 240 tall full-width band on desktop, one line and one link, straight edges |

Sequence rules: blocks 1 and 2 are the first screen; on mobile block 3 begins at 740 from the top of the page so the goal cards are what the first swipe lands on. Gaps are 48 on mobile and 64 on desktop, except 96 above and below OxServices, above OxBranch and above OxNewsletter (4.2). Mobile page height in the default composition is about 6300 including chrome.

### 6.3 Category listing (/$slug/c$id)

The same composition and CSS serve /offers, /latest-products, /most-sales-products, tag routes and brand routes.

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | 16 under the header |
| 2 | ListingHeader with CategoryIntro | 140 | 120 | F | h1 (the category name), intro paragraph from content/categories.ts (two lines mobile, one desktop), count, sort; the filters trigger on mobile. Brand routes add a 64 logo plate at the start of the title row |
| 3 | Child category chips | 52 | 52 | C | filter-chip scroller of the children (بروتين has five); absent on leaf categories |
| 4 | FiltersRail | drawer | 280 column | F | at the start from 1024; skeleton rows while facets load; the drawer on mobile is out of flow |
| 5 | Product grid | 776 first paint, 380 per row | 894 first paint, 435 per row | C | 24 per page: 12 rows of two / 6 rows of four beside the rail; the skeleton draws two rows and the remaining rows mount at final height as data arrives; the count in block 2 stays blank until the loader answers |
| 6 | LoadMore | 120 | 120 | F | |
| 7 | CategoryFaq | 296 | 288 | C | SectionHeader "أسئلة شائعة" plus three rows from the content map; absent when the map has none |
| 8 | Related guides | 272 | 264 | C | SectionHeader "أدلة ذات صلة" plus three 48 link rows (PLAN 7: every category links three guides); rows rather than cards because listing is a buy page |

Empty category: EmptyState at 320 / 360 in the grid column (copywriter, key ox.listing.empty) with the route out "تسوق حسب هدفك".

### 6.4 Goal landing (/$slug/c$id, slug in the goal map)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | GoalLanding hero | 360 | 420 | F | eyebrow (the goal name), display H1 verbatim from 2.x, the first sentence of the 2.x intro as lead (two lines max), one primary button scrolling to the grid (copywriter, key ox.goal.heroCta); photo 8.2 with the tonal edge |
| 3 | Goal intro | 140 | 96 | F | the full 2.x intro as body in --ox-container-text; the hero carries only its first sentence, so nothing is repeated |
| 4 | Explainer | 300 | 470 | F | goal-performance only: the 2.3 explainer (h2 and two paragraphs) in the text measure; mobile clamps to eight lines with an "اقرأ المزيد" expander while the DOM keeps the full text |
| 5 | SubNeeds row | 600 | 270 | F | SectionHeader "اختر حسب حاجتك" plus the three 2.x cards; goal-ideal-weight renders two rows under H2 A and H2 B with their short intros (anchors #gain and #lean) |
| 6 | Grid header | 96 | 56 | F | h2 row with count and sort, the filters trigger on mobile |
| 7 | FiltersRail and grid | as 6.3 | as 6.3 | C | the goal category's products; one grid on goal-ideal-weight, the two SubNeeds rows link into it with the filter in the query |
| 8 | LoadMore | 120 | 120 | F | |
| 9 | Goal FAQ | 296 | 288 | C | SectionHeader "أسئلة شائعة" plus the three 2.x pairs; FAQPage JSON-LD from the same data |
| 10 | Need-help panel | 160 | 120 | F | plate panel: the 2.x need-help line plus the primary "اسأل مجانا" linking to the written-question service |

### 6.5 PDP, physical (/$slug/p$id; product_type product and food)

Desktop: the gallery column is 7 of 12 at the start and sticky at the header offset (its 632 box fits the viewport; the buy column at about 1200 does not, so the column that sticks is the gallery). The buy column is 5 of 12. Mobile: one column in the order below.

| # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | scroller on mobile |
| 2 | PdpGallery | 382 | 560 | F | mobile 358 square plus 24 for dots; desktop 560 main image with the 72 thumb column at its start |
| 3 | PdpTitleBlock | 172 | 200 | F | brand 20, h1 two lines, rating 24 (removed before paint when the loader's count is 0), badges 24 |
| 4 | PdpPriceBlock | 180 | 180 | F | includes the fixed 48 installment slot |
| 5 | SpecChips | 72 | 40 | F | two rows mobile, one desktop; 0 when the spec line is absent |
| 6 | Options | 272 | 184 | C | two groups at 136 / 92; the skeleton draws one group; 0 for products without options |
| 7 | SupplyCalculator | 144 | 144 | F | 0 without servings |
| 8 | DeliveryPromise | 48 | 48 | F | |
| 9 | BuyRow | 108 | 108 | F | |
| 10 | WishlistShare | 44 | 44 | F | |
| 11 | TrustGrid | 128 | 128 | F | |
| 12 | BoughtTogether | 352 | 344 | U | hidden when the engine returns no group |
| 13 | GoalFit | 240 | 236 | F | |
| 14 | WhyThis | 220 | 220 | F | |
| 15 | NutritionTable | 532 | 524 | C | rows from the parsed table (skeleton six rows); scroller on mobile |
| 16 | HowToUse | 260 | 252 | C | three steps |
| 17 | PrePurchaseInfo | 280 | 280 | F | the medical row open |
| 18 | Reviews | 248 | 248 | U | summary row plus the empty state; grows by 120 per review; last of the text blocks for that reason |
| 19 | Faq | 408 | 400 | C | five rows including the mandatory price item |
| 20 | Alternatives | 508 | 630 | C | one row of ProductCards |
| StickyBar | 64 | 64 | F | fixed, out of flow, from the moment the BuyRow leaves the viewport |

Blocks 13 to 19 sit in --ox-container-narrow (880); 12 and 20 use the full container. Food products (OX-037 to OX-040) share this composition; the SupplyCalculator reads servings the same way.

### 6.6 PDP, booking and service (ServicePdp)

| # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Service image | 268 | 546 | F | 4/3 on plate from 8.3; column 7 of 12 on desktop, not sticky |
| 3 | Title block | 108 | 136 | F | channel eyebrow, h1, no rating row unless reviews exist |
| 4 | Price block | 72 | 72 | F | price (or "مجاني") and the duration line |
| 5 | Channel facts card | 164 | 164 | F | three rows |
| 6 | "ماذا تحضر" list | 120 | 120 | F | three bullets |
| 7 | Checkout note | 24 | 24 | F | "تختار موعدك في صفحة إتمام الطلب" |
| 8 | Book button | 48 | 48 | F | 108 in the no-slot state (disabled button plus the WhatsApp secondary) |
| 9 | Scope line | 54 | 54 | F | |
| 10 | How it works | 260 | 252 | F | three numbered steps |
| 11 | Faq | 352 | 344 | C | four rows from content/services.ts |
| 12 | Other channels | 585 | 384 | F | SectionHeader plus the two remaining ChannelCards |

No StickyBar: the buy zone is short enough to stay within reach. Service JSON-LD from the same data.

### 6.7 PDP, digital, gift card and bundle

| Variant | # | Block | Mobile | Desktop | Kind | Note |
|---|---|---|---|---|---|---|
| Digital | 1 | Breadcrumb | 32 | 32 | F | |
| Digital | 2 | Cover image | 382 | 560 | F | 1:1 on plate; the cover from the product images |
| Digital | 3 | PdpTitleBlock | 172 | 200 | F | |
| Digital | 4 | PdpPriceBlock | 132 | 132 | F | no per-serving line; installment slot kept |
| Digital | 5 | Facts card | 164 | 164 | F | الصيغة, الحجم, التسليم ("رابط تحميل بعد الدفع") |
| Digital | 6 | BuyRow | 108 | 108 | F | quantity hidden (the engine fixes digital items to one) |
| Digital | 7 | WishlistShare | 44 | 44 | F | |
| Digital | 8 | TrustGrid | 128 | 128 | F | the shipping item swaps to instant delivery (copywriter, key ox.pdp.trust.digital) |
| Digital | 9 | Contents list | 260 | 252 | C | "ماذا يوجد داخل الدليل": numbered chapters in the HowToUse styling |
| Digital | 10 | WhyThis | 220 | 220 | F | |
| Digital | 11 | Faq | 352 | 344 | C | |
| Digital | 12 | Alternatives | 508 | 630 | C | other digital-library items |
| Gift card | 1 | Breadcrumb | 32 | 32 | F | |
| Gift card | 2 | Card image | 224 | 350 | F | 16/10 on plate (358 by 224 / 560 by 350) |
| Gift card | 3 | Title block | 172 | 200 | F | |
| Gift card | 4 | Price block | 72 | 72 | F | the selected amount |
| Gift card | 5 | Amount options | 128 | 84 | F | SallaProductOptions as pills |
| Gift card | 6 | Gifting fields | 232 | 232 | F | SallaGifting: recipient name, message, send date (three fields at 72) in our input styling |
| Gift card | 7 | Facts card | 164 | 164 | F | التسليم, الصلاحية, الاستخدام (copywriter, keys ox.pdp.giftcard.*) |
| Gift card | 8 | BuyRow | 108 | 108 | F | |
| Gift card | 9 | How it works | 260 | 252 | F | three steps |
| Gift card | 10 | Faq | 296 | 288 | C | |
| Bundle | 1 | Breadcrumb | 32 | 32 | F | |
| Bundle | 2 | PdpGallery | 382 | 560 | F | the composite image on plate |
| Bundle | 3 | PdpTitleBlock | 172 | 200 | F | |
| Bundle | 4 | PdpPriceBlock | 180 | 180 | F | the saving line reads "توفير N ر.س مقابل الشراء منفردا" from the members' sum when the engine exposes members; otherwise the plain price |
| Bundle | 5 | Members list | 240 | 240 | C | "ما في الحزمة": rows 72 (thumb 56 on plate, name in a bdi, quantity, member price as a link); skeleton three rows |
| Bundle | 6 | DeliveryPromise | 48 | 48 | F | |
| Bundle | 7 | BuyRow | 108 | 108 | F | |
| Bundle | 8 | WishlistShare | 44 | 44 | F | |
| Bundle | 9 | TrustGrid | 128 | 128 | F | |
| Bundle | 10 | GoalFit | 240 | 236 | F | |
| Bundle | 11 | WhyThis | 220 | 220 | F | why these together |
| Bundle | 12 | HowToUse | 260 | 252 | C | the order of use across the members |
| Bundle | 13 | Faq | 408 | 400 | C | |
| Bundle | 14 | Alternatives | 508 | 630 | C | |

The gift card has no TrustGrid (shipping and expiry do not apply); code delivery and redemption are Salla's. The bundle has no SupplyCalculator and no NutritionTable at bundle level; each member's PDP carries its own.

### 6.8 Search results and zero results (/search, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | ListingHeader | 120 | 80 | F | h1 from the engine's search title with the query in a bdi, count line, sort |
| 2 | FiltersRail | drawer | 280 column | F | facets only when the engine returns them; the column collapses to 0 otherwise |
| 3 | Grid | as 6.3 | as 6.3 | C | |
| 4 | LoadMore | 120 | 120 | F | |
| Zero, 2 | ZeroResults | 410 | 360 | F | replaces 2 to 4: mark 48, title, two lines, six goal chips, "اسأل قبل أن تشتري" secondary |
| Zero, 3 | Popular products | 508 | 630 | C | ProductsSliderWrapper titled "أحدث المنتجات" until sales data exists |

### 6.9 Cart (/cart, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Title row | 48 | 56 | F | the engine's cart title with the item count |
| 2 | CartRows | 224 first paint, 112 per row | 192 first paint, 96 per row | C | 7 of 12 on desktop; the count is in the cart store before paint, so the box is deterministic |
| 3 | CartSummary | 560 | 560 | F | full width under the rows on mobile; 5 of 12 sticky at the header offset on desktop |
| 4 | Mobile checkout bar | 64 | 0 | F | fixed, replaces the tab bar, out of flow |

Empty cart: EmptyState at 320 / 360 in place of 2 and 3. No cross-sell slider on the cart; it stays a buy page.

### 6.10 Thank-you (/thankyou/$orderId, noindex)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Engine order summary | 480 | 420 | C | styled: status line, order number (dir ltr), item rows 72, totals table, address; --ox-container-narrow |
| 2 | "كيف تبدأ" card | 300 | 290 | C | three numbered steps from the ordered products' HowToUse lines; hidden when the order has no physical product |
| 3 | Services nudge card | 160 | 140 | F | one line and a secondary button to the written question |
| 4 | Pickup note | 96 | 80 | F | pickup orders only: branch address, today's hours, the cut-off, link to /branch |
| 5 | Route out | 108 | 48 | F | primary to orders, secondary "متابعة التسوق" (engine strings) |

### 6.11 Services hub (/services)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Hub hero | 360 | 420 | F | goal-landing construction: eyebrow "الخدمات", display "اسأل قبل أن تشتري", lead from 1.4 Services, no button; photo 8.3 (video consultation) with the tonal edge |
| 3 | ChannelCards | 700 | 264 | F | the three cards on paper, price lines from the products |
| 4 | Scope panel | 140 | 120 | F | plate panel: "نقول ما هو خارج عملنا" and its 1.5 text, plus the no-diagnosis line |
| 5 | How it works | 260 | 252 | F | three steps (copywriter, keys ox.services.steps.*) |
| 6 | Faq | 352 | 344 | C | four rows from content/services.ts |
| 7 | Contact row | 96 | 72 | F | WhatsApp secondary plus the phone line |

### 6.12 Branch (/branch)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | OxBranch | 810 | 480 | F | the home block reused with the h1 in place of the eyebrow; photo 8.4 exterior |
| 3 | Map | 268 | 400 | F | SallaMap when the maps key exists, otherwise the static map image from 8.4 with the "افتح في الخرائط" link |
| 4 | Pickup steps | 260 | 252 | F | "كيف يتم الاستلام من الفرع": three numbered steps (copywriter, keys ox.branch.pickup.*) |
| 5 | Interior photo | 268 | 396 | F | 8.4 interior; 16/9 in eight columns on desktop, 4/3 on mobile |
| 6 | Faq | 296 | 288 | C | three rows (parking, Ramadan hours, paying in store; copywriter) |
| 7 | Contact row | 96 | 72 | F | |

LocalBusiness JSON-LD from content/branch.ts.

### 6.13 Guides index (/blog) and article (/blog/$slug/a-$id)

| Page | # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|---|
| Index | 1 | Breadcrumb | 32 | 32 | F | |
| Index | 2 | Page header | 120 | 112 | F | h1 "أدلة تشرح بلا مبالغة", intro from 1.4 Guides, text measure |
| Index | 3 | Category chips | 52 | 52 | C | blog categories as filter chips |
| Index | 4 | Feature row | 400 | 480 | F | 4.3 rule 5: an 8-column feature card beside a 4-column card at equal height; on mobile the feature card is the first of the stack |
| Index | 5 | Card rows | 1232 first paint, 400 per card | 896 first paint, 436 per row | C | 1-up stacked on mobile, 3-up on desktop; 12 per page |
| Index | 6 | Pagination | 96 | 96 | F | the engine's pagination styled |
| Index | 7 | OxNewsletter | 320 | 300 | F | |
| Article | 1 | Breadcrumb | 32 | 32 | F | |
| Article | 2 | Article header | 140 | 168 | F | category label, h1 two lines, meta row (date, read time; no author title) in --ox-container-text |
| Article | 3 | Hero image | 200 | 405 | F | 16/9 at the text measure |
| Article | 4 | Key points | 160 | 150 | F | plate panel "الخلاصة": three bullets, the answer-first device for AEO |
| Article | 5 | Body | 700 | 720 | U | sanitized dashboard HTML; skeleton six paragraphs; in-body images 16/9, tables per the Table spec |
| Article | 6 | Mentioned products | 508 | 630 | C | ProductsSliderWrapper "المنتجات المذكورة في الدليل" from the article's linked products; hidden when none |
| Article | 7 | Disclaimer line | 72 | 64 | F | the medical line, lawyer gated |
| Article | 8 | Share row | 44 | 44 | F | SallaSocialShare |
| Article | 9 | Related guides | 485 | 556 | C | three GuideCards |
| Article | 10 | OxNewsletter | 320 | 300 | F | |

Article JSON-LD on the single route; the body's U kind is why the products slider sits after it and never above it.

### 6.14 Brands (/brands and brand routes)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Page header | 96 | 88 | F | h1 (engine string) and one line (copywriter, key ox.brands.intro) |
| 3 | Brand grid | 502 first paint, 154 per row | 362 | C | tiles: logo contained on a 3/2 plate with 24 padding, name 40 under it; 2-up / 6-up; the logo is the brand's own artwork, never recoloured or cropped |

A brand route is the 6.3 composition with the logo plate in the ListingHeader and an intro from the content map when one exists.

### 6.15 About (/about)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Header | 160 | 176 | F | eyebrow, h1, lead in the text measure |
| 3 | Why OptimalX | 590 | 324 | F | the four 1.5 items as 2 by 2 plain text cards (title, three lines) |
| 4 | Storefront photo | 200 | 405 | F | 8.4 exterior at 16/9 in the text measure |
| 5 | Story | 330 | 340 | F | three paragraphs (copywriter, keys ox.pages.about.story.*) |
| 6 | Registration panel | 120 | 96 | F | the 1.6 trust line as a plate panel; renders only when {CR}, {VAT} and {MAROOF} are all filled |
| 7 | Route out | 108 | 48 | F | primary to /services, secondary to /branch |

No portraits and no titles (constraint 15); the "فريق من شخصين" line in 1.5 is the whole team section.

### 6.16 Contact (/contact)

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | Breadcrumb | 32 | 32 | F | |
| 2 | Header | 96 | 88 | F | h1 and one line |
| 3 | Channel rows | 250 | 120 | F | WhatsApp (primary), phone, email as 72 rows (3-up cards on desktop); SallaContacts styled; values dir ltr |
| 4 | Written-question card | 140 | 120 | F | "اسأل قبل أن تشتري" with the price line "مجاني" and the button to the service product; no custom form, the written question is a product so it lands in the order flow and the inbox |
| 5 | Branch card | 160 | 140 | F | address, today's hours, "الموقع على الخريطة", link to /branch |
| 6 | HoursTable | 296 | 296 | F | seven rows |

### 6.17 404 and error

| # | Block | Mobile | Desktop | Kind | Content |
|---|---|---|---|---|---|
| 1 | NotFound | 580 | 600 | F | mark 96 at the top start, display headline, one line, the search field, the route-out row (two rows of buttons on mobile), WhatsApp link |
| 2 | Latest products | 508 | 630 | C | ProductsSliderWrapper "أحدث المنتجات"; not on the error state |

The error state is block 1 alone at 480 / 500 with the retry button and the mark at 64.

### 6.18 Not composed here

Account (the engine CustomerLayout with AccountNav from 5.5 and an EmptyState per surface; list rows 72), policies (engine static page: h1 plus sanitized body in the text measure), the kitchen sink (every component in every state, dev only) and the unit converter (a --ox-container-narrow form: two selects, one input, one result line; 320 / 280). Their skeletons follow the same rule: the outer box equals the final box.

---

## 7. Motion

The universal motion law applies unchanged: only transform and opacity animate; the native-first ladder is CSS transition, CSS keyframes, IntersectionObserver as a trigger, then View Transitions for routes; scroll-driven timelines are not used because there are no scroll reveals; no motion library is justified anywhere in this theme. Values are the 2.9 tokens. Composition carries the energy; motion confirms that something happened. Every entrance has a shorter exit. Every horizontal translate, including inside keyframes, is written `calc(var(--direction-factor) * Npx)`; vertical translates are not multiplied.

Colour never transitions. A border, fill or text colour on hover, focus, press or selection snaps to its new value with no transition: a 120ms colour fade is a paint per frame across the whole element for a change the eye reads as instant anyway. --dur-fast covers the transform and opacity parts of hover and press only.

### 7.1 Every animated interaction

| Interaction | Element | Property | In | Out | Reduced motion | Rung |
|---|---|---|---|---|---|---|
| Button press | primary and secondary Button | translateY(0 to 1px) | --dur-fast --ease-out | --dur-fast --ease-in | none, the colour snap remains | transition |
| Add-to-cart confirm | BuyRow, ProductCard and StickyBar add button label | opacity 1 to 0 to 1 with the tick swapped at the midpoint | --dur-confirm --ease-out | (single keyframe) | label swaps instantly | keyframes |
| Cart count bump | the count pill in MainBar, MobileHeader, BottomTabBar | scale 1 to 1.15 to 1 | --dur-confirm --ease-out | (single keyframe) | number updates, no scale | keyframes |
| Wishlist toggle | heart icon in ProductCard, WishlistShare, PdpGallery | scale 1 to 1.2 to 1 | --dur-confirm --ease-out | (single keyframe) | none, the fill snaps | keyframes |
| Toast in and out | Toast | desktop: translateX(calc(var(--direction-factor) * 16px)) to 0 plus opacity 0 to 1; mobile: translateY(16px) to 0 plus opacity | --dur-base --ease-out | opacity 1 to 0, --dur-fast --ease-in | opacity only, same durations | transition |
| Variant change | PdpPriceBlock price, PdpGallery main image, StickyBar price | opacity cross-fade of two stacked layers in a min-height slot | --dur-fast --ease-in-out | (cross-fade) | instant swap | transition |
| Card second image | ProductCard image plate | opacity 0 to 1 on the second image layered over the first | --dur-fast --ease-out | --dur-fast --ease-in | instant swap | transition |
| SupplyCalculator result, cart line price, newsletter success line | the text slot | opacity cross-fade | --dur-fast (--dur-base for the newsletter) --ease-in-out | (cross-fade) | instant | transition |
| SectionHeader link hover | the 16 chevron | translateX(calc(var(--direction-factor) * 2px)) | --dur-fast --ease-out | --dur-fast --ease-in | none | transition |
| Accordion open and close | SallaAccordion rows (Faq, PrePurchaseInfo), OxTrustStrip panel, MobileDrawer and Footer groups, FiltersRail groups | wrapper grid-template-rows 0fr to 1fr, panel opacity 0 to 1, chevron rotate 0 to 180deg | --dur-base --ease-out | --dur-fast --ease-in | panel appears at final size, chevron snaps | transition |
| Drawer open and close | MobileDrawer (start edge), FiltersRail drawer (end edge) | inner panel translateX(calc(var(--direction-factor) * -100%)) to 0 for the start edge, the opposite sign for the end edge; backdrop opacity 0 to 1 | --dur-base --ease-out | --dur-fast --ease-in | panel and backdrop fade in place | transition |
| Modal and bottom sheet | Modal, login, localization, offer, rating modals | desktop: opacity 0 to 1 plus translateY(16px) to 0; mobile sheet: translateY(100%) to 0 | --dur-slow --ease-out | --dur-fast --ease-in | opacity only, --dur-base | transition |
| StickyBar and mobile cart checkout bar | StickyBar, cart bottom bar | translateY(100%) to 0 | --dur-slow --ease-out | --dur-base --ease-in | opacity 0 to 1, --dur-fast | transition, IntersectionObserver trigger |
| Mega panel | NavBar goals panel | opacity 0 to 1 plus translateY(-4px) to 0 | --dur-base --ease-out (after the 120ms intent delay) | opacity, --dur-fast --ease-in | opacity only | transition |
| Dropdowns and suggestions | user menu, "المزيد" overflow, search suggestions panel, tooltips | opacity 0 to 1 (dropdowns add translateY(-4px) to 0) | --dur-fast --ease-out | --dur-fast --ease-in | opacity only | transition |
| Tabs indicator | SallaTabs indicator | translateX(calc(var(--direction-factor) * Npx)) plus scaleX to the tab width | --dur-base --ease-in-out | (same) | jumps | transition |
| Skeleton pulse | Skeleton root only | opacity 1 to 0.6 to 1, 1.2s loop | --ease-in-out | (loop) | static at opacity 0.8 | keyframes |
| Goal grid settle | the six GoalCards in OxGoals (7.2) | opacity 0 to 1 plus translateY(8px) to 0, delay index times --stagger-step | --dur-base --ease-out | (once) | cards simply present, no delay | keyframes, IntersectionObserver trigger |
| Route change | the document | see 7.3 | --dur-slow | --dur-fast | root cross-fade only | View Transitions |
| Anchor scrolls | "تسوق حسب هدفك", goal hero button, "قيم المنتج", #faq-N deep links | `scroll-behavior: smooth` on html | browser | browser | `scroll-behavior: auto` | native |

The accordion row is the one property outside transform and opacity, and it is written down here as the exception: a user-initiated open of a single panel bounded by its content, once per click, on one subtree. `grid-template-rows` is the reliable way to animate to an unknown height; `height` itself is never animated, and no accordion opens on load or on scroll.

Not animated, by decision: colour and border changes; image load (the image covers the plate with no fade); header shadow on scroll; badges, chips and applied filters appearing or leaving; LoadMore rows (they mount at final height); the BottomTabBar hiding under a drawer; the free-shipping bar fill (snaps to its new width); focus rings; star fills; the wedge and every polygon; the mark on the 404 and empty states; the hero video (it is a video, governed by 8.7, not a motion primitive).

### 7.2 The signature moment: the goal grid settle

The one entrance animation on the site. When OxGoals first enters the viewport at 30% (IntersectionObserver, once per mount), the six GoalCards run from opacity 0 and translateY(8px) to opacity 1 and translateY(0) over --dur-base with --ease-out, each delayed by its DOM index times --stagger-step: 0, 40, 80, 120, 160, 200ms, the last card landing at 380ms. DOM order is reading order, so in Arabic the wave runs from the top-right card across the row on desktop and down the two columns on mobile; the translate is vertical, so no direction factor is involved.

Rules. The grid's box is reserved at final size (6.2) before the settle starts, so nothing shifts. The cards are focusable and pressable from the first frame (no pointer-events change). The settle runs once per page mount, never on return to the route, never in the mega panel's GoalCards, and never on any other grid: --stagger-step has exactly one consumer. On the first load it happens to coincide with the skeleton resolving into content (constraint 10), which is the point: the shop arrives, the rest of the page is simply there. Under reduced motion the six cards are present at opacity 1 with no delay.

### 7.3 Route changes: the view-transition rule

Mechanism. Same-document View Transitions around the router's DOM commit (`document.startViewTransition`, the router's view-transition option), after the loader resolves; pending states use the skeleton, never a transition. Where the API is unsupported the navigation swaps instantly; no polyfill, no library. Because the SSR defect discards the server tree, transitions apply only to client navigations after hydration, which is every navigation the user makes.

Root. `::view-transition-old(root)` fades out over --dur-fast with --ease-in; `::view-transition-new(root)` fades in over --dur-slow with --ease-out. The root never translates: a whole-viewport slide is the largest layer move a phone can be asked for.

Named groups, and only these:

| view-transition-name | Set on | Behaviour |
|---|---|---|
| ox-header | the sticky header (MainBar or MobileHeader) | pinned: it does not fade with the root |
| ox-tabbar | BottomTabBar | pinned |
| ox-product-{id} | the image of the one ProductCard the user activated (assigned on pointerdown or keydown, removed on navigation end) and the PdpGallery main image | the group morphs position and size over --dur-slow --ease-out; card plate and gallery plate share --ox-plate, so the morph is clean |
| ox-hero-photo | the photo panel of OxHero, the GoalLanding hero and the services hub hero | the band's photo box morphs between heroes over --dur-slow --ease-out; the polygon is inside the snapshot, so the angled edge travels with the box and is never interpolated as a path (this is the exception 4.5 names) |

Rules. At most four named groups exist in any one transition; no per-item element other than the single activated card is ever named; nothing inside a horizontal scroller is named except that activated card, and its name is removed if the navigation is cancelled. Traversals (back and forward) skip the transition so the browser's own swipe gesture is not doubled. Under reduced motion the named groups set `view-transition-name: none` and only the root cross-fade remains. Groups animate in physical coordinates, so the direction factor does not apply. The same names serve the cross-document form (`@view-transition { navigation: auto; }`) should any route ever fall back to a full page load; nothing else changes.

---

## 8. Imagery and asset brief for the owner

Rules that apply to every generated photograph. Saudi adults, both genders across the set, in modest sportswear (men: t-shirt or long sleeves with joggers or below-the-knee shorts; women: hijab, long sleeves, loose fit). Natural light only, from a window or the open sky. Settings are concrete, graphite-painted walls, matte gym floors, plain counters. Orange (#EE4D22) appears once per image as one small object (a scoop, a cap, a shaker lid, a strap); nothing else in the frame is warm. No text anywhere: labels are plain, screens are out of focus, no signage, no captions. No scales, tape measures, before-and-after pairs, medical props, white coats, pills in hands, competitor packaging or third-party logos. Faces are adults; no minors. Deliver each file at the stated pixel size as JPEG quality 90 (PNG for the icon and logo files); the build encodes AVIF and WebP at 1x and 2x of each slot and sets width, height, sizes, `decoding="async"`, `loading="lazy"` on everything except the hero, which gets `fetchpriority="high"`. Product packshots are not in this brief: they come from the dashboard per product, on white, and the plate composites them.

Hero photographs share one framing rule because they sit under a clip-path that changes side with the locale and under text on mobile: subject centred horizontally, face in the top third, both bottom corners empty.

### 8.1 Home hero and video

| File | px | Ratio | Format | Slot | Art direction |
|---|---|---|---|---|---|
| hero-home-desktop.jpg | 2400 by 1600 | 3:2 | JPEG src, AVIF and WebP out | OxHero photo panel, 835 by 560 at 1x on desktop and tablet | A Saudi woman athlete in a black hijab and a loose graphite long-sleeve top, seated on a concrete ledge after training, holding a matte shaker with an orange lid, looking slightly off camera, calm. Hard side light from a high window on a graphite concrete wall. Shallow depth, the wall soft. Nothing else in frame. |
| hero-home-mobile.jpg | 1200 by 1600 | 3:4 | JPEG src, AVIF and WebP out | OxHero full-bleed on mobile, 390 by 500, gradient and text over the lower 60% | A Saudi man in his late twenties, short beard, dark t-shirt and joggers, standing in an open concrete stairwell with the sky above, wrist wrap in orange, hands resting at the hips, direct eye contact. Face in the top 35% of the frame, the lower half quiet concrete. |
| hero-home-loop.mp4 and hero-home-loop.webm | 1920 by 1280 | 3:2 | H.264 and VP9 or AV1, no audio track, 24 fps, 6 to 8 s, under 2.5 MB | desktop hero only, poster is hero-home-desktop.jpg; not loaded under reduced motion or save-data (5.2) | The same woman, the same ledge, a slow loop: she turns the shaker once in her hands and looks up; the camera does not move; the loop ends on the pose of the still so the poster and the first frame match. |

### 8.2 Goal heroes (six)

One landscape per goal serves both viewports (desktop panel 720 by 420, mobile full-bleed 390 by 360). Files goal-{slug}.jpg at 2400 by 1600, 3:2, JPEG source.

| File | Art direction |
|---|---|
| goal-energy.jpg | A Saudi man at the top of a concrete outdoor staircase at dawn, hands on knees mid-breath, dark long-sleeve top, an orange stripe on one sleeve, the city soft behind him. Cool light, low sun. |
| goal-general-health.jpg | A Saudi woman in a grey hijab and a loose white top pouring water from a jug into a glass at a plain concrete counter, one small matte bottle with an orange cap beside the glass, morning window light. |
| goal-performance.jpg | A Saudi man setting up a barbell on a rack in a concrete gym, graphite plates, chalk on his hands, orange collar clips on the bar, side window light, no other people. |
| goal-recovery.jpg | A Saudi woman athlete in a black hijab seated on a bench with a towel over one shoulder and a shaker with an orange lid on the bench, eyes closed, evening light through a high window, graphite wall. |
| goal-hair-skin.jpg | A Saudi woman in a beige hijab and a loose long-sleeve training top standing at a window counter, stirring a glass with a small orange scoop resting on a plain pouch beside it, soft daylight, concrete wall. |
| goal-ideal-weight.jpg | A Saudi man and a Saudi woman in modest gym wear walking side by side out of a gym door onto a concrete walkway with gym bags, one orange bag strap, ordinary athletic builds, mid-stride, daylight. No scale, no measuring, no comparison. |

### 8.3 Category tiles (ten)

Files cat-{slug}.jpg at 1200 by 900, 4:3, JPEG source. Each is a still-life on a seamless #F1F1F3 background so the photo dissolves into --ox-plate; soft daylight from the top start side, a faint contact shadow, camera slightly above eye level, the objects inside the central 1200 by 630 band so the same file crops to the category page's og:image. Containers are matte with plain unprinted labels; no text of any kind.

| File | Art direction |
|---|---|
| cat-protein.jpg | Two matte tubs, one large one small, and a scoop of pale powder tipped forward; the scoop is orange. |
| cat-creatine.jpg | One small tub, a level 5 g scoop of white powder, a glass of water; the tub cap is orange. |
| cat-pre-workout.jpg | A tub beside a clear shaker holding a pale drink, a measuring scoop laid flat; the shaker lid is orange. |
| cat-amino-acids.jpg | A tub and a tall glass with ice and a pale drink, a spoon; the scoop is orange. |
| cat-omega-3.jpg | A dark glass bottle and six amber softgels on a small concrete dish; the amber capsules are the accent, no extra orange. |
| cat-vitamins-minerals.jpg | Three small bottles of different heights, one open with a few plain tablets beside it; one cap is orange. |
| cat-collagen-beauty.jpg | A matte pouch with a small scoop beside a cup of coffee on a concrete saucer; the scoop is orange. |
| cat-daily-health.jpg | A tube of tablets, a small tub, and a glass of water with a tablet dissolving; the tube cap is orange. |
| cat-snacks-bars.jpg | Three bars in plain wrappers, one unwrapped and broken in half showing the texture; one wrapper is orange. |
| cat-accessories.jpg | A shaker, a folded grey gym towel and a wrist wrap; the shaker is orange. |

### 8.4 Services photographs (three)

Files at 1600 by 1200, 4:3, JPEG source. Used at 4/3 on plate on each ServicePdp and, for the video consultation, as the services hub hero (cover crop, so the framing rule from the top of this section applies). No clinical settings, no white coats, no stethoscopes, no screens with readable content: the persona has no professional title and the photographs must not imply one.

| File | Art direction |
|---|---|
| service-written-question.jpg | A person's hands typing on a phone at a concrete counter, a plain matte tub beside the phone, the screen out of focus, an orange phone case edge, window light. Gender-neutral crop, no face. |
| service-video-consult.jpg | A Saudi woman in a dark hijab at a laptop in a bright plain room, the screen turned away from the camera, a notebook and a plain tub on the table, an orange pen, natural light, no wall decor. |
| service-branch-visit.jpg | Preferably a real photograph inside the Medina branch: a staff member handing a tub across the counter to a customer, both in modest dress, shelves of plain tubs behind, an orange edge on the counter. Until it exists, generate the same scene. |

### 8.5 Branch (two photographs and a map)

Real photographs, not generated: a storefront that does not exist would be a fabricated record, and the storefront is the trust device the whole direction rests on. Owner shoots in golden hour with a phone, landscape, no faces without consent, no licence plates.

| File | px | Ratio | Format | Slot | Art direction |
|---|---|---|---|---|---|
| branch-exterior.jpg | 2400 by 1600 | 3:2 | JPEG src | OxBranch photo panel (746 by 480 desktop, 358 by 268 mobile), the About page at 16/9 | From across the street, slightly to one side, the whole frontage and sign in frame, the door centred, the pavement clear. The real sign's text is allowed here. |
| branch-interior.jpg | 2400 by 1600 | 3:2 | JPEG src | Branch page interior block | The counter and the main shelf wall from the entrance, lights on, tidy shelves, no people or one staff member with consent. |
| branch-map.png | 2560 by 1280 | 2:1 | PNG | Branch page map when SallaMap is unavailable; desktop crops to 2560 by 800, mobile to the central 4:3 | A static map export from the owner's map provider centred on 24.46276125, 39.653138015 with one pin, light style, street names visible, zoom about 16, no other markers. Map labels are the one text exception. |

### 8.6 Logo files, favicon, app icons and the OG image

The raster at public/Logo.webp (1254 by 1254, the full logo on white) is a reference, not a production asset: it cannot sit on a graphite footer, it cannot scale to a 24 favicon, and its white box would show on --ox-paper. The build may crop it to a temporary logo-compact-tmp.png at 264 by 60 for the header until the vectors arrive; that stopgap fails G2 and is a launch blocker until replaced.

Vector files requested from the owner or the logo's designer, all SVG with text converted to outlines, a tight viewBox, no embedded raster, fills as literal hex:

| File | Contents | Colours |
|---|---|---|
| logo-full.svg | wordmark, mark, tagline | wordmark #17171A, mark #EE4D22, tagline and rules #17171A |
| logo-compact.svg | wordmark and mark | as above |
| mark.svg | the mark alone | #EE4D22 |
| logo-full-reverse.svg | wordmark, mark, tagline | wordmark, tagline and rules #F7F7F8, mark #EE4D22 |
| logo-compact-reverse.svg | wordmark and mark | wordmark #F7F7F8, mark #EE4D22 |

Also requested: the mark's exact angle from vertical. The layout system (2.9, 4.5) assumes 22 degrees; if the drawn mark measures differently, --ox-angle and --ox-angle-tan change to match the mark, never the other way round.

Derived by the build from mark.svg (the owner supplies nothing extra):

| File | px | Composition |
|---|---|---|
| favicon.svg | any | the mark on transparent |
| favicon.ico | 16, 32, 48 layers | the mark on transparent; at 16 the mark is simplified to its outer silhouette if the counter closes up |
| apple-touch-icon.png | 180 by 180 | the mark at 64% width centred on --ox-paper, no rounding (iOS masks it) |
| icon-192.png, icon-512.png | 192, 512 | as the touch icon |
| icon-512-maskable.png | 512 | the mark at 50% width centred on --ox-paper so it survives the 40% safe-zone mask |
| og-default.png | 1200 by 630 | --ox-paper ground, logo-full centred at 560 wide, a graphite wedge on the end 30% of the width with its inner edge at 22 degrees (run 254 at 630 tall), nothing else; used on every route without its own image |

Per-route OG images: the home uses hero-home-desktop.jpg cropped to 1200 by 630 from the centre; category pages use their cat-{slug}.jpg central band; product pages use the engine's product image; guides use the article hero; the branch page uses branch-exterior.jpg. No text is composited onto any OG image.

### 8.7 The SVG sprite

One file, public/assets/icons/ox-sprite.svg, inlined once by OptimalXLayout as `<symbol id="ox-{name}">` elements and referenced with `<use href="#ox-{name}">`. Chrome icons (search, cart, user, heart, menu, chevrons, truck, filter, whatsapp, close, play) stay on sicon-* and are not redrawn. Drawing rules, from constraint 9: a 24 by 24 grid, `stroke="currentColor"` at 1.8, `stroke-linejoin="miter"` with miter-limit 4, `stroke-linecap="square"`, no rounded terminals, no rounded corners, geometry snapped to the half-pixel, and exactly one element per icon filled with `class="ox-icon__accent"` (fill var(--ox-accent)) and no stroke. The same symbol renders at 16, 20, 24 and 32 through the CSS size; there is no separate 16 set. None of these icons indicates direction, so none mirrors under RTL.

| Symbol | Used by | The one orange element |
|---|---|---|
| ox-protein | CategoryTile, drawer rows, SpecChips form | the scoop |
| ox-creatine | same | the level scoop's heap |
| ox-pre-workout | same | the shaker lid |
| ox-amino-acids | same | the drop in the glass |
| ox-omega-3 | same | one softgel |
| ox-vitamins-minerals | same | one tablet |
| ox-collagen-beauty | same | the spoon bowl |
| ox-daily-health | same | the dissolving tablet |
| ox-snacks-bars | same | the broken bar's inner square |
| ox-accessories | same | the shaker cap |
| ox-goal-energy | GoalCard, mega panel, ZeroResults chips, GoalFit chips | the spark |
| ox-goal-general-health | same | the centre of the leaf |
| ox-goal-performance | same | the inner plate on the bar |
| ox-goal-recovery | same | the moon's inner disc |
| ox-goal-hair-skin | same | the single strand's end |
| ox-goal-ideal-weight | same | the balance point |
| ox-authentic | OxTrustStrip, TrustGrid, PdpTitleBlock badge | the seal's inner disc |
| ox-expiry | TrustGrid, SpecChips, ProductCard note | the highlighted calendar cell |
| ox-shipping | OxTrustStrip, TrustGrid | the parcel's tape |
| ox-secure-payment | OxTrustStrip, TrustGrid, CartSummary | the lock's keyhole |
| ox-help | OxTrustStrip, need-help panels, ZeroResults | the dot of the question mark |
| ox-written-question | ChannelCard, ServicePdp eyebrow, contact card | the pen's tip |
| ox-video-consult | ChannelCard, ServicePdp eyebrow, services hub | the camera lens |
| ox-branch-visit | ChannelCard, ServicePdp eyebrow, OxBranch, BranchPage | the door |
| ox-servings | SpecChips | the scoop |
| ox-serving-size | SpecChips | the measure line |
| ox-form | SpecChips | the powder heap, capsule or bar depending on the form value |
| ox-plan | AccountNav orders, ThankYou steps, HowToUse numerals fallback | the ticked step |
| ox-points | AccountNav loyalty, loyalty page | the coin's inner disc |
| ox-gift | GiftCardProduct, AccountNav | the bow's knot |
| ox-referral | loyalty and referral rows | the second figure's head |
| ox-tick | WhyThis bullets, confirmed states, newsletter success | the tick itself (the only icon whose stroke is the accent) |

Thirty-two symbols; the sprite should stay under 16 KB. The kitchen sink renders every symbol at all four sizes on paper and on graphite, and the G2 review checks each one for a stray rounded join.

---

## 9. Accessibility and RTL checklist for G2, and the anti-template mapping

The reviewer runs this list on the built app at 390 and 1440 in Arabic, then at 1440 on /en, on the routes named in PLAN 8 (home, a physical PDP, a category, the search zero state, cart, services, branch, 404) plus a goal landing and a guide article. Instruments: lighthouse_audit for the axe pass, evaluate_script for the direction, scroll and focus probes, a keyboard walkthrough, NVDA with an Arabic voice on Windows and VoiceOver on iOS for the reading order. Each row is pass or fail; a fail on a row marked B is a blocker.

### 9.1 Amendments this checklist makes to sections 2 to 5

Writing the checklist surfaced six gaps; the builder applies these as if they were in the earlier sections.

| # | Amends | Change | Why |
|---|---|---|---|
| A1 | 2.4 | add --ox-line-3 #85858E, "control boundary": 3.7:1 on card, 3.4:1 on paper, 3.2:1 on plate | --ox-line-2 measures 1.6:1 on white and fails WCAG 1.4.11 as the sole boundary of a control |
| A2 | 5.7 Input, Checkbox and Radio, Chip (filter), Options pills, the price-range track | rest border --ox-line-3; hover --ox-ink-3 and focus ring unchanged; card borders stay --ox-line because a card's boundary is decorative | same |
| A3 | 5.2 OxHero, 8.1 | the video variant carries a 44 pause and play button at the bottom end corner of the photo panel, icon only with aria-label "إيقاف الفيديو" and "تشغيل الفيديو", visible at all times while the loop is active | WCAG 2.2.2: auto-playing motion longer than 5 s needs a pause control |
| A4 | 5.2 SectionHeader | the eyebrow row is conditional: it renders only when its text is a fact the heading lacks (OxHero: the H1 keyword line; OxBranch: the district; goal hero: the live product count "N منتجا"; ServicePdp: channel and duration). Elsewhere the h2 stands alone and the 24 by 2 accent rule is omitted with it | the named tell "eyebrow labels that carry no information" |
| A5 | 3.4 | every bdi that holds a Latin product or brand name also carries lang="en" | screen readers otherwise read Latin names with the Arabic voice |
| A6 | 5.1 OptimalXLayout | a visually hidden aria-live="polite" region announces the new document title after every client navigation, and focus moves to #main | single-page navigation is silent to assistive tech without it |

### 9.2 Structure and semantics

| Check | Pass criterion | Blocker |
|---|---|---|
| One h1 per route | home: the OxHero eyebrow line; listing and search: ListingHeader; goal landing and hubs: the hero display line; PDP: PdpTitleBlock name; article: the article header; 404: the display headline. Exactly one, never hidden with display none | B |
| Landmarks | header, two nav elements with distinct aria-labels ("التنقل الرئيسي", "روابط الصفحة"), main#main, aside for FiltersRail with aria-label "تصفية", footer, the search form with role search; BottomTabBar is a nav with aria-label "تنقل سريع" | B |
| Skip link | first focusable element on every route, visible on focus, lands on #main with tabindex -1 | B |
| Document language and direction | html carries lang="ar" dir="rtl" in the server HTML, not only after hydration; /en carries lang="en" dir="ltr" | B |
| Page titles | Arabic title per route, updated on client navigation and announced (A6) | B |
| Headings order | h2 for every SectionHeader, h3 for cards and modal titles, no skipped levels; hidden decorative headings absent | |
| Lists and tables | goal grid, category grid, product grid and footer columns are ul; NutritionTable, HoursTable and the cart totals are table with th scope; the nutrition table's third column is a real column, not a tooltip | |
| Buttons and links | navigation is an a with href; actions are button; the whole-card link pattern uses one a and no nested interactive content inside it except the add and wishlist buttons, which sit outside the link in DOM order | B |
| Accordion semantics | SallaAccordion rows expose aria-expanded and aria-controls; the medical row has no collapse control at all rather than a disabled one | |

### 9.3 Contrast and colour

| Check | Pass criterion | Blocker |
|---|---|---|
| Text pairs | every pair in 2.4 and 2.5 measures as listed; --ox-ink-4 never carries text that conveys information; placeholder text is not the only label | B |
| Primary button | --ox-on-accent on --ox-accent 4.87:1 at rest; the hover instant at 4.1:1 on --ox-accent-dark is the one documented exception (5.7) | B at rest |
| Non-text boundaries | inputs, checkboxes, radios, chips and option pills at 3:1 or better against their ground (A1, A2); the focus ring at 3:1 against everything it can sit on (ink on paper 16.3:1, paper on graphite 16.3:1, ink beside orange 4.9:1) | B |
| Active states | the NavBar underline and the active tab icon (--ox-accent on --ox-card, 3.7:1) pass the non-text floor; the active AccountNav border is accompanied by the plate fill so colour is not the only cue | |
| Colour as the only cue | stock, saving, error and expiry all carry an icon or a word beside the colour; the checked checkbox shows a tick, not a fill alone | B |
| Link discovery | inline links carry an underline at rest; hover colour --ox-accent-dark 5.0:1 on white | |
| On-dark bands | --ox-ink-2-on-dark 9.2:1 and --ox-ink-3-on-dark 5.4:1 verified on --ox-graphite-2 as well as --ox-graphite | |

### 9.4 Keyboard, focus and pointer

| Check | Pass criterion | Blocker |
|---|---|---|
| Focus visible | --ox-focus-ring on every interactive element, never outline none without a replacement; the ring is not clipped by overflow hidden on cards, sliders or the tab list | B |
| Focus order | DOM order equals reading order on every route; the mega panel, drawers and modals trap focus while open and return it to the opener on close; Escape closes all three | B |
| Sliders and galleries | ProductsSliderWrapper cards are tabbable in order and the arrows are buttons; PdpGallery thumbs are a tablist or buttons; swiping is never the only way (2.5.7) | B |
| Price range | the two inputs are the accessible path; the slider thumbs are focusable with arrow-key steps and aria-valuenow | |
| Target size | 44 by 44 minimum on every control including the breadcrumb links, thumbs, chips' remove controls and the stepper buttons; adjacent targets at least 8 apart | B |
| Sticky and fixed bars | the StickyBar button and the mobile checkout bar are reachable in tab order where they appear in the DOM (end of main), labelled identically to the buttons they duplicate | |
| Hover-only content | the second card image and tooltips carry no information; icon-only buttons have aria-label, not only a tooltip | B |
| Pointer cancellation | actions fire on click or keyup, never on pointerdown; the ox-product-{id} naming on pointerdown (7.3) is not an action | |

### 9.5 Forms and status

| Check | Pass criterion | Blocker |
|---|---|---|
| Labels | every input, select and textarea has a visible label bound by for and id; the search field's label is visually hidden with the clip pattern, never with left -9999px | B |
| Errors | aria-invalid, the error line bound with aria-describedby, the error icon plus text, focus moved to the first invalid field on submit | B |
| Autocomplete and input modes | email, tel, name, postal-code and one-time-code where they apply; inputmode numeric on the stepper and the price inputs; Latin-value fields dir ltr with the label RTL | |
| Status messages | Toast has role status; the ListingHeader count, the LoadMore result, the SupplyCalculator result, the newsletter success line and the coupon result are aria-live polite; the cart count pill is aria-hidden and the toast carries the announcement | B |
| Consistent help | the WhatsApp contact sits in the footer contact column and the drawer footer on every route in the same position (3.2.6) | |

### 9.6 Images, media and motion

| Check | Pass criterion | Blocker |
|---|---|---|
| Alt text | product images: the product name; category tiles and brand tiles: alt="" because the label strip names them; hero and goal photos: alt="" because the copy beside them carries the meaning; branch photos: a real description ("واجهة فرع اوبتيمال اكس في الخالدية، المدينة المنورة"); the mark as decoration: aria-hidden | B |
| Dimensions | width and height attributes on every img and video, sizes on every responsive image, the skeleton box equal to the final box (5.6, 6) | B |
| Video | muted, no audio track, poster, not loaded under reduced motion or save-data, the pause control from A3, no autoplay on mobile | B |
| Reduced motion | every row in 7.1 behaves as its reduced column says; the settle does not run; the skeleton is static; scroll-behavior is auto | B |
| Flashing | the skeleton pulse at 0.83 Hz is the fastest periodic change on the site; nothing flashes | |

### 9.7 Reflow, zoom and text

| Check | Pass criterion | Blocker |
|---|---|---|
| 320 wide | no horizontal scroll on any route; every horizontal scroller is position relative and its own overflow clips it; fixed elements' bounding boxes stay inside the viewport (measured, not read from scrollWidth) | B |
| 200% zoom and 400% | content reflows; the header collapses to the mobile header; no clipped text in the fixed card slots (the two-line clamp still clamps, it never hides a price) | |
| Text spacing override | with line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em and word-spacing 0.16em applied by a bookmarklet, nothing overlaps or is cut; Arabic joins may open under the override, which is the user's choice, not a defect | |
| Arabic type floors | body never below 15 at weight 400; line-height 1.7 on body; no negative letter-spacing on any Arabic run (a stylelint rule on letter-spacing inside [lang="ar"] scopes) | B |
| Numerals | Western digits in both locales in rendered text (a test regex for U+0660 to U+0669 over the DOM of each route fails the build) | B |
| Diacritics and em-dashes | none in rendered copy (the copy lint from PLAN 8) | |

### 9.8 RTL

| Check | Pass criterion | Blocker |
|---|---|---|
| Physical properties | no margin-left, margin-right, padding-left, padding-right, left, right, text-align left or right, border-left or border-right in app/ styles (a grep gate); float and translateX only through the direction factor | B |
| Polygons | every wedge in 4.5 has both declarations; the [dir="ltr"] override is present and the photo panels are never mirrored with scaleX | B |
| Mirrors | chevrons, arrows, back, breadcrumb separators, the SectionHeader link chevron, slider arrows (roles swapped), drawer edges, toast entry edge, tab indicator travel, the free-shipping bar and price-range fill (start to end), the AccountNav active border (start edge), the sticky first column in tables (start side) | B |
| Never mirrors | search, cart, user, heart, menu, globe, close, play, every ox-sprite symbol, athlete photographs, brand logos, the mark, payment marks, the BoughtTogether plus separators, the map | B |
| Placement | hero text at the start and photo at the end; FiltersRail at the start; the cart summary column at the end; badges at the start corner and wishlist at the end corner of cards; the mega panel aligned to the container start; MobileHeader menu at the start and cart at the end | |
| Scrollers | every horizontal scroller starts at the start edge with the first item flush to the container start (verify scrollLeft semantics in Chromium and WebKit, which differ in sign); snap points hold in both directions | B |
| Bidi text | bdi with lang="en" on catalogue names; dir ltr on phone, email, SKU, URL, promo codes and payment brand names; punctuation outside the island; ranges and percentages inside a bdi; the price element is unicode-bidi isolate so amount and riyal icon keep the engine's order | B |
| Inputs | Latin-value fields dir ltr and text-align start with the caret at the left; the label and helper stay RTL; the select chevron sits at the end and does not mirror | |
| Truncation | line-clamp ellipsis appears at the end of the line (left in Arabic) in Chromium and WebKit; long Latin product names inside Arabic cards clamp without breaking the bdi | |
| /en | every flip happens through [dir="ltr"] overrides and the direction factor; no LTR-only rule anywhere; Latin tracking per 3.2; Cairo's Latin verified at body size on the kitchen sink | |
| Dates and units | Gregorian dates with Western digits in the SupplyCalculator; units follow the number in Arabic; engine date formatting follows the store locale | |

### 9.9 Anti-template mapping

The G2 checklist passes a surface that shows at least four of nine dimensions. Where this direction delivers each one, and what the reviewer looks at:

| Dimension | Where the direction delivers it | Evidence on the built page |
|---|---|---|
| Scale-contrast hierarchy | display 56 at 800 against body 16 at 400 (3.5:1), the hero line against the trust strip's small 400, PDP h1 against the meta rows | measure the two sizes on the home first screen and the PDP |
| Intentional spacing rhythm | 48 / 64 / 96 as chapters (4.2): the 96 breaths around OxServices, OxBranch and OxNewsletter, the zero gap between hero and trust strip | the gaps on the home measure exactly those values and nothing in between |
| Depth and layering | three grounds (paper, card, plate) and three shadows, no more; dark bands as chapters; cards without shadow at rest | no fourth shadow, no card lift |
| Typographic character | one family with weight as the voice; Cairo 800 at 1.15 for display; the tagline register in tracked uppercase Latin only where the mark's tagline lives | the display weight is 800 (fonts.check on the kitchen sink) |
| Semantic colour | go, note, stop with their soft pairs; ink on orange; no red on a price; orange only on pressable things and the hero stroke | grep the built CSS for --ox-stop on any price selector: none |
| Designed states | every component in section 5 lists its states; pressed translate, selected ink border, disabled plate, loading with locked width, confirmed tick | tab through the PDP buy zone and the filters rail |
| Grid-breaking composition | the five places in 4.3 and nowhere else; the browse versus buy rule | the PDP, cart and listing have no clip-path; the home has exactly one wedge per screen |
| Atmosphere and texture | the photography brief (8): athletes, concrete, graphite, one warm accent; no CSS texture, grain or gradient blobs | present only once the owner delivers 8.1 to 8.5; until then this dimension is not claimed and the surface still shows eight |
| Clarifying motion | the confirm tick, the count bump, the sticky bar arrival, the product image morph on route change; nothing decorative | 7.1 rows behave as written; no fade-and-slide on sections |

Named tells, each addressed by name so the character dimension cannot fail on an unnamed cluster:

| Tell | Status here |
|---|---|
| Single-word headline accents | absent: orange never appears in text; headlines are one colour |
| All-caps micro-labels | deliberate and named (3.2): the tracked uppercase Latin register exists only for the tagline echo at 11.5 to 12px and only on /en or beside the mark; Arabic has no uppercase and gets a small 600 label instead |
| Eyebrow labels that carry no information | removed by A4: an eyebrow renders only when it states a fact the heading lacks |
| 01 02 03 markers on non-sequences | numerals appear only on real sequences (HowToUse, pickup steps, thank-you steps, how-it-works); SubNeeds cards, the why items and the trust strip carry no numbers |
| Fade-and-slide-up on every section | absent; the goal grid settle (7.2) is the single entrance on the site and is named as such |
| A hover transition on every card | absent: cards snap their border colour with no transition; the product card's second image is the one hover motion and it is named in 7.1 |

Non-negotiables: accessibility per 9.2 to 9.8; explicit image dimensions per 9.6; one theme only, so the "both themes" rule does not apply (PLAN D12, and the dark bands are components with role tokens, not a theme); the render budget per section 10.

---

## 10. Render-budget compliance statement

Rule by rule against mastermind-audit/references/mobile-render-budget.md section 3 and the two additions in the G2 gate (scrollers and visually hidden text), plus the inventories a reviewer needs to run the section 4 probe at 390 by 844, 3x, on the home, the PDP and a listing. Where writing this statement changed the design, the change is numbered A7 to A9 and amends the earlier section it names, like the A1 to A6 amendments in 9.1.

### 10.1 The eight rules

| Rule | What the direction does | Where it could slip, and the guard |
|---|---|---|
| 1. Glows are radial gradients, never filter: blur() | There are no glows. The palette has no glow token, no orb, no halo; the only soft element is --ox-accent-soft as a flat fill (wishlist active, selected swatch). filter appears nowhere in app/ styles | the tailwind blur-* scale and drop-shadow-* utilities are forbidden in app/ by a stylelint rule that also sweeps the named scale (blur-3xl, blur-md), not only arbitrary values |
| 2. backdrop-filter rationed | Zero backdrop roots per route. Backdrops behind drawers and modals are flat rgba(23,23,26,0.5) with no blur (5.6); the header when scrolled is opaque --ox-card with --ox-shadow-1, never translucent; the hero text legibility on mobile comes from a linear gradient to --ox-graphite, not blur (5.2) | any future "frosted" header or sheet is a G2 finding by this line; the budget for this theme is 0, not 30 |
| 3. No permanent promotion | No will-change, translateZ(0), transform-gpu or backface-visibility anywhere. Animations promote for their own duration only (7.1); the goal settle, the count bump and the toast promote six, one and one elements for under 400ms and release them | the tailwind transform-gpu utility and the will-change-* utilities are forbidden in app/ by the same lint |
| 4. No filter on an ancestor of background-clip: text | background-clip: text is not used; headlines are solid ink or paper (9.9, no single-word accents, no gradient text) | grep gate on background-clip in the built CSS: only the engine's own occurrences, none of ours |
| 5. No fixed full-viewport decoration | No grain, noise, vignette or overlay. The only full-viewport fixed elements are functional backdrops while a drawer or modal is open (10.2), flat colour, mounted only while open | the wedge is a clipped child of its band, never fixed; OxBanner is a normal block |
| 6. Fixed panels stay inside the viewport | Drawers, sheets and modals are unmounted when closed (React conditional render) and mounted on open with their entrance transition, so nothing is ever parked off-screen. The drawer's fixed outer box is pinned to the viewport with overflow hidden and the inner panel is what translates (7.1); the toast is inset 16 from the end edge with inline-size min(360px, 100vw minus 32px); the StickyBar and the mobile checkout bar are inset-inline 0 at the bottom | the probe measures every fixed element's bounding box against the viewport at 390 and 320; the expected count past the viewport is 0 on every route, closed or open |
| 7. html and body backgrounds equal the route ground | Both set to --ox-paper on every route (2.3). Dark bands are components that paint their own --ox-graphite; the footer is a band, not the canvas, so an overscroll at the page end shows paper, which is the ground | the kitchen sink renders html and body backgrounds as a visible assertion |
| 8. Budget per route at 3x | Filtered elements: none, so the filter sum is 0 MB against the 10 MB line. Backdrop roots: 0 against 30. Forced layers: 0. Fixed elements past the viewport: 0. Transient layers during animation are listed in 10.3 and stay under 2 MB except the platform-managed view transition | the probe from section 4 of the reference is part of G4 (PLAN 8) on home, PDP and listing, at 390 and 320 |

The two G2 additions:

| Rule | What the direction does |
|---|---|
| Every horizontal scroller is position: relative | ProductsSliderWrapper root, the guide scroller, OxBrands strip, category chips, Breadcrumb, SallaTabs list, the PdpGallery thumb strip and mobile gallery, the NutritionTable wrapper, the AccountNav chip scroller, ZeroResults chips, the applied-filters chip row, the mobile tables wrapper. Each carries position relative and its own overflow, so an absolute descendant (arrows, badges, the sticky first column) belongs to the scroller, not to body. A test asserts computed position relative on every element with overflow-x auto or scroll |
| Visually hidden text is the clip pattern | one .ox-sr-only utility: position absolute, inline-size 1px, block-size 1px, overflow hidden, clip rect(0 0 0 0), clip-path inset(50%), white-space nowrap. No -9999px anywhere, including the skip link at rest and the search field's label; the engine's own sr-only class is restyled to the same pattern through the safelist |

### 10.2 Fixed and sticky inventory (mobile, 390 by 844)

| Element | Position | Box | When | Layer cost at 3x |
|---|---|---|---|---|
| Header (MobileHeader with AnnouncementBar) | sticky, top 0 | 390 by 96 (144 with the search row) | always when header_is_sticky | about 1.3 MB while composited during scroll |
| BottomTabBar | fixed, bottom 0 | 390 by 56 plus safe area | below 1024, hidden under drawers, modals and the StickyBar | 0.8 MB |
| StickyBar (PDP) | fixed, bottom 0 | 390 by 64 | while the BuyRow is off screen | 0.9 MB, replaces the tab bar so the two never coexist |
| Cart checkout bar | fixed, bottom 0 | 390 by 64 | cart route on mobile | 0.9 MB, replaces the tab bar |
| Toast | fixed, top end | 358 by 64 | 4 s after add to cart | 0.8 MB |
| Drawer backdrop | fixed, inset 0 | 390 by 844 | while a drawer or modal is open | solid-colour layer, no backing store in Chromium and WebKit because it is a flat fill with no blur or gradient |
| Drawer panel (inner) | inside the pinned fixed box | 320 by 844 | while open | 9.7 MB while open, released on close by unmounting; never coexists with a modal |
| Modal sheet | fixed, bottom 0 | 390 by up to 760 (90vh) | while open | up to 8.7 MB while open, released on close |
| Skip link | fixed, top start | 44 tall | while focused | negligible |

At rest on any route the fixed and sticky set is the header and one bottom bar: about 2.2 MB. Nothing is fixed on desktop except the same set; the FiltersRail and the cart summary are sticky inside their columns, sized to their content, and sit within the viewport by construction (max-height calc(100vh minus the header offset)).

### 10.3 Transient layers during animation

| Moment | Elements promoted | Area at 3x | Duration |
|---|---|---|---|
| Goal grid settle | six GoalCards at 171 by 128 | 6 times 0.79 MB, 4.7 MB total | under 400 ms, once per mount |
| Add to cart | the button label, the count pill | under 0.1 MB | 160 ms |
| Toast | the toast | 0.8 MB | 180 ms in, 120 ms out |
| Variant change | the price slot, the main image | 4.6 MB (the 358 square image) | 120 ms |
| Accordion | the panel and chevron | the panel's own area, at most about 1 MB | 180 ms |
| Skeleton pulse (A7) | the text-line bars of one skeleton root | under 2 MB | while that skeleton is in view |
| Route change | the browser's own snapshots of old and new root plus at most four named groups | platform managed, two viewport textures for 280 ms | 280 ms; the browser skips the transition under memory pressure on its own |

A7 (amends 5.6 Skeleton). The pulse no longer runs on every skeleton root: twelve pulsing block roots on the home would hold one to two viewports of tiles for the several seconds the SSR defect keeps the skeleton on screen, which is the black-tile failure this budget exists to prevent. Instead, block rectangles are static at --ox-plate-2, and the 1.2 s opacity pulse runs only on the text-line bars inside the one skeleton root currently in the viewport (an IntersectionObserver moves the pulsing class; at most one root pulses at a time; the pulsing area on any route stays under 2 MB at 3x). Under reduced motion nothing pulses. The visible effect is the same "alive" cue at the point the eye is resting; the cost drops from tens of MB to under two.

### 10.4 Decoded image memory on the first viewport

A8 (amends 8, delivery rule). The build emits image widths capped at 2x of the slot, never the source size, and a 3x phone receives the 2x file: a 2400 by 1600 hero decoded whole would take 15 MB, its 2x mobile variant at 780 by 1000 takes 3.1 MB. Product images request the Salla CDN size nearest to 2x of the slot through the engine's image helper and never the original upload.

| Route, first viewport at 390 | Images decoded | Memory |
|---|---|---|
| Home | mobile hero 780 by 1000; trust strip icons from the inline sprite | 3.1 MB |
| Home, after one swipe | eight category tiles at 342 by 256 | 2.8 MB, lazy |
| PDP | main image 716 by 716; the thumb strip at 128 by 128 times 6 | 2.1 MB plus 0.4 MB |
| Listing | four card plates at 294 by 294 in the first two rows | 1.4 MB, the rest lazy |

The hero video never loads on mobile (5.2, 8.1), so no decoder is allocated there. Brand logos are SVG or small PNG on plates and are lazy below the fold.

### 10.5 Clip-path and the wedge

clip-path polygons are static (4.5) on elements that never animate transform or opacity, so Chromium and WebKit apply them as paint-time clips without a mask layer. The route morph in 7.3 animates a snapshot image of the panel, not the live element, so the polygon is never on an animating layer. A9 (amends 4.5, stated for the record): no wedge element may receive a transition or animation property of any kind; a lint on .ox-hero__photo, .ox-hero__stroke, .ox-hero__corner and .ox-band__wedge enforces it.

### 10.6 Document width

Nothing widens the document: the wedge panels are absolute children of position relative bands with overflow hidden; the mega panel is container width inside the header; the toast, bars and drawers are sized in 10.2; every scroller clips its own overflow; tables wider than the viewport live inside a scroller. The G4 probe reads each fixed element's bounding box and every scroller's scrollWidth against the viewport, at 390 and 320, rather than trusting document.scrollWidth, which fixed elements do not report.

Statement. With A7 to A9 applied, every route on this theme spends 0 MB on filters, 0 backdrop roots, 0 forced layers and 0 fixed elements past the viewport; the fixed set at rest is about 2.2 MB, the largest transient animation cost is the 4.7 MB goal settle for under 400 ms, and the first viewport decodes under 4 MB of images. The atmosphere the direction asks for is carried by photography, weight, spacing and one static angle, none of which spend the compositor budget.

<!-- END -->
