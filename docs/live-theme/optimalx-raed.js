/*
 * optimalx-raed.js
 *
 * Purpose: the companion script to optimalx-raed.css. It runs before the
 * closing body tag on every page of the live storefront and does three things:
 *
 *   1. checks whether the stylesheet is already in effect, and injects its own
 *      copy only when it is not;
 *   2. on a product page, reads the spec line the catalogue writes as the first
 *      paragraph of every description and renders it as chips plus the supply
 *      line above the buy button;
 *   3. gives the nutrition table its third column of plain-Arabic explanations
 *      and makes it scroll on a narrow screen with the first column pinned.
 *
 * Where each file goes: optimalx-raed.css into the theme's custom CSS box, and
 * optimalx-raed.min.js (the same script, compacted to fit the paste limit) into
 * the custom JavaScript box. This readable file is the source the minified one
 * is built from; pasting it instead works, but it is larger than the field
 * allows on some Salla plans.
 *
 * This file is a stopgap. It exists only until the OptimalX React theme passes
 * Salla review, at which point the script and the stylesheet are deleted rather
 * than maintained.
 *
 * The parsing, the arithmetic and the glossary are ports of the theme's own
 * tested modules: app/components/product/lib/specLine.ts, supply.ts and
 * nutritionTable.ts, and app/content/glossary.ts with the Arabic strings from
 * locales/ar.json. Nothing here guesses: a field the label did not print stays
 * out, and a nutrient the glossary does not cover gets an empty cell.
 *
 * Every feature is wrapped in its own try/catch, so a failure in one cannot
 * stop the others and cannot leave the page worse than it started.
 */
(function () {
  'use strict';

  if (window.__optimalxRaedSkin) return;
  window.__optimalxRaedSkin = { version: '1.0.0', injected: false, features: {} };

  var STYLE_ID = 'optimalx-raed-skin';
  var MARK = 'data-optimalx';

  /* ---------------------------------------------------------------------
   * 0. A fallback copy of the stylesheet.
   *
   *    optimalx-raed.css belongs in the theme's custom CSS box, where it loads
   *    with the page and paints on the first frame. The copy below is only
   *    used when that box is empty or its content failed to apply: the script
   *    asks the browser whether the stylesheet's own marker rule is in effect,
   *    and injects this copy only when it is not.
   * ------------------------------------------------------------------- */

  var CSS = `
/*
 * optimalx-raed.css
 *
 * Purpose: put the OptimalX visual identity onto the live storefront while it
 * runs Salla's Raed theme. It restyles Raed's own markup (the s-* component
 * classes and the theme's block sections) with the OptimalX tokens: the paper
 * ground, white cards, the plate behind product imagery, graphite bands with a
 * single 22 degree wedge, orange reserved for interaction, Cairo at the
 * DIRECTION type scale, the three shadows and the two radii.
 *
 * This file is a stopgap. It exists only until the OptimalX React theme passes
 * Salla review and can be published as the store's own theme, at which point
 * this stylesheet and its companion script are deleted rather than maintained.
 *
 * Token values are copied verbatim from app/styles/tokens.css. The type scale
 * is the fluid scale of DIRECTION 3.1. The wedge polygons are DIRECTION 4.5.
 * Rules honoured here: colour never transitions, motion runs only on transform
 * and opacity through the duration and easing tokens, nothing animates on a
 * wedge, prefers-reduced-motion is respected, there is no blur, no
 * backdrop-filter and no will-change, control borders at rest use --ox-line-3,
 * and every touch target stays at 44px.
 *
 * Where this goes: the theme's custom CSS box, whole. Its companion script,
 * optimalx-raed.min.js, goes in the custom JavaScript box; it carries a copy of
 * this sheet and injects it only if this one did not arrive.
 *
 * Paired with: optimalx-raed.js (the readable source of that script), which
 * also adds the product page spec chips, the supply line and the nutrition
 * glossary column.
 */

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

/* ===========================================================================
   1. Tokens (app/styles/tokens.css, verbatim)
   =========================================================================== */

:root {
  --font-main: 'Cairo', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-ar: 'Cairo', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --color-primary: #EE4D22;
  --color-primary-dark: #C93D18;
  --color-primary-light: #F38264;
  --color-primary-reverse: #FFFFFF;
  --color-primary-rgb: 238, 77, 34;

  --ox-accent: var(--color-primary);
  --ox-accent-dark: var(--color-primary-dark);
  --ox-accent-light: var(--color-primary-light);
  --ox-accent-rgb: var(--color-primary-rgb);
  --ox-accent-soft: #FDEDE9;
  --ox-on-accent: #17171A;

  --ox-paper: #F7F7F8;
  --ox-card: #FFFFFF;
  --ox-plate: #F1F1F3;
  --ox-plate-2: #E9E9EC;
  --ox-graphite: #17171A;
  --ox-graphite-2: #222226;
  --ox-graphite-3: #2C2C32;

  --ox-ink: #17171A;
  --ox-ink-2: #5A5A61;
  --ox-ink-3: #6F6F78;
  --ox-ink-4: #9A9AA3;
  --ox-ink-on-dark: #F7F7F8;
  --ox-ink-2-on-dark: #B9B9C1;
  --ox-ink-3-on-dark: #8C8C96;
  --ox-line: #E6E6E9;
  --ox-line-2: #D2D2D8;
  --ox-line-3: #85858E;
  --ox-line-on-dark: rgba(255, 255, 255, 0.12);

  --ox-go: #0F7B4F;
  --ox-go-soft: #E8F4EE;
  --ox-note: #8A5E0E;
  --ox-note-soft: #FBF2E0;
  --ox-stop: #B3261E;
  --ox-stop-soft: #FBEAE8;

  --ox-bg: var(--ox-paper);
  --ox-surface: var(--ox-card);
  --ox-fg: var(--ox-ink);
  --ox-fg-2: var(--ox-ink-2);
  --ox-fg-3: var(--ox-ink-3);
  --ox-bd: var(--ox-line);
  --ox-bd-2: var(--ox-line-2);
  --ox-focus: var(--ox-ink);

  --ox-focus-ring: 2px solid var(--ox-focus);
  --ox-shadow-1: 0 1px 3px rgba(23, 23, 26, 0.08);
  --ox-shadow-2: 0 8px 24px rgba(23, 23, 26, 0.1);
  --ox-shadow-3: 0 24px 48px rgba(23, 23, 26, 0.18);
  --ox-r-1: 6px;
  --ox-r-2: 8px;
  --ox-r-pill: 9999px;

  --ox-1: 4px;
  --ox-2: 8px;
  --ox-3: 12px;
  --ox-4: 16px;
  --ox-6: 24px;
  --ox-8: 32px;
  --ox-12: 48px;
  --ox-16: 64px;
  --ox-24: 96px;
  --ox-gutter: 16px;
  --ox-container: 1280px;
  --ox-container-narrow: 880px;
  --ox-container-text: 720px;
  --ox-h-util: 36px;
  --ox-h-bar: 56px;
  --ox-h-nav: 48px;
  --ox-h-tabbar: calc(56px + env(safe-area-inset-bottom, 0px));
  --ox-h-sticky: 64px;
  --ox-z-raised: 10;
  --ox-z-sticky: 100;
  --ox-z-overlay: 200;
  --ox-z-modal: 300;
  --ox-z-toast: 400;
  --ox-z-skip: 500;

  --dur-fast: 120ms;
  --dur-confirm: 160ms;
  --dur-base: 180ms;
  --dur-slow: 280ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --stagger-step: 40ms;
  --direction-factor: 1;
  --ox-angle: 22deg;
  --ox-angle-tan: 0.4040;
  --ox-band-h: 560px;
  --ox-wedge-run: calc(var(--ox-band-h) * var(--ox-angle-tan));

  /* Type roles, DIRECTION 3.1: fluid 390 to 1440, linear between. */
  --ox-t-display: clamp(34px, 25.83px + 2.095vw, 56px);
  --ox-t-h1: clamp(28px, 23.54px + 1.143vw, 40px);
  --ox-t-h2: clamp(24px, 21.03px + 0.762vw, 32px);
  --ox-t-h3: clamp(18px, 17.26px + 0.190vw, 20px);
  --ox-t-lead: clamp(17px, 15.89px + 0.286vw, 20px);
  --ox-t-body: clamp(15px, 14.63px + 0.095vw, 16px);
  --ox-t-small: clamp(13px, 12.63px + 0.095vw, 14px);
  --ox-t-micro: clamp(11.5px, 11.31px + 0.048vw, 12px);
}

[dir='rtl'] {
  --direction-factor: -1;
}

@media (min-width: 640px) {
  :root { --ox-gutter: 24px; }
}

@media (min-width: 1024px) {
  :root { --ox-gutter: 32px; --ox-h-bar: 72px; }
}

/* A dark band re-declares the role tokens once. */
.ox-band-dark {
  --ox-bg: var(--ox-graphite);
  --ox-surface: var(--ox-graphite-2);
  --ox-fg: var(--ox-ink-on-dark);
  --ox-fg-2: var(--ox-ink-2-on-dark);
  --ox-fg-3: var(--ox-ink-3-on-dark);
  --ox-bd: var(--ox-line-on-dark);
  --ox-bd-2: var(--ox-line-on-dark);
  --ox-focus: var(--ox-paper);
  color: var(--ox-fg);
  background-color: var(--ox-bg);
}

/* ===========================================================================
   2. Ground and typography
   =========================================================================== */

html,
body.theme-raed {
  background-color: var(--ox-paper);
  color: var(--ox-ink);
  font-family: var(--font-main);
  letter-spacing: 0;
}

body.theme-raed {
  font-size: var(--ox-t-body);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

body.theme-raed main,
body.theme-raed .main-content,
body.theme-raed #app {
  background-color: transparent;
}

/* Arabic never carries tracking, and no heading is rotated. */
body.theme-raed h1,
body.theme-raed h2,
body.theme-raed h3,
body.theme-raed h4,
body.theme-raed h5,
body.theme-raed h6 {
  letter-spacing: 0;
  color: var(--ox-fg);
  font-family: var(--font-main);
}

body.theme-raed h1 { font-size: var(--ox-t-h1); line-height: 1.2; font-weight: 700; }
body.theme-raed h2 { font-size: var(--ox-t-h2); line-height: 1.25; font-weight: 700; }
body.theme-raed h3 { font-size: var(--ox-t-h3); line-height: 1.4; font-weight: 700; }
body.theme-raed h4 { font-size: var(--ox-t-body); line-height: 1.5; font-weight: 700; }

body.theme-raed a {
  color: inherit;
  text-underline-offset: 0.15em;
}

/* The companion script's probe. It appends one element with this class, reads
   --ox-skin back with getComputedStyle, and injects its own copy of this
   stylesheet only when the value is missing. Do not delete this rule: without
   it the script cannot tell that the stylesheet is already loaded and will
   inject a second copy of it on every page. */
.ox-skin-probe {
  --ox-skin: 1;
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  pointer-events: none;
}

/* Focus is always visible and always the ink ring. */
body.theme-raed a:focus-visible,
body.theme-raed button:focus-visible,
body.theme-raed input:focus-visible,
body.theme-raed select:focus-visible,
body.theme-raed textarea:focus-visible,
body.theme-raed [tabindex]:focus-visible,
body.theme-raed .s-button-element:focus-visible {
  outline: var(--ox-focus-ring);
  outline-offset: 2px;
  border-radius: var(--ox-r-1);
}

/* Colour must never transition. Raed uses transition-all in several places;
   this narrows every transition it starts to the two safe properties. */
body.theme-raed *,
body.theme-raed *::before,
body.theme-raed *::after {
  transition-property: transform, opacity;
}

/* Numerals are tabular wherever a price or a quantity is printed. */
body.theme-raed .s-product-card-price,
body.theme-raed .total-price,
body.theme-raed .s-quantity-input-input,
body.theme-raed .ox-num {
  font-variant-numeric: tabular-nums;
}

/* Raed's brand radius is 12; the OptimalX scale is 6 / 8 / pill. */
body.theme-raed .s-product-card-entry,
body.theme-raed .s-button-element,
body.theme-raed .s-block--features__item {
  border-radius: var(--ox-r-2);
}

/* ===========================================================================
   3. Buttons
   =========================================================================== */

body.theme-raed .s-button-element {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ox-2);
  min-width: 44px;
  min-height: 44px;
  padding-inline: 20px;
  border: 1px solid transparent;
  border-radius: var(--ox-r-2);
  font-family: var(--font-main);
  font-size: var(--ox-t-body);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: none;
  transition: transform var(--dur-fast) var(--ease-in);
  -webkit-tap-highlight-color: transparent;
}

body.theme-raed .s-button-element:active:not(:disabled):not([aria-disabled='true']) {
  transform: translateY(1px);
  transition-timing-function: var(--ease-out);
}

/* Primary: ink on orange. This is the only orange fill in the design, and it
   is reserved for something you press. */
body.theme-raed .s-button-primary,
body.theme-raed .s-button-primary-outline,
body.theme-raed .s-button-solid.s-button-primary,
body.theme-raed salla-add-product-button .s-button-element,
body.theme-raed .s-add-product-button-main,
body.theme-raed .s-button-element.s-button-primary-solid {
  background-color: var(--ox-accent);
  border-color: var(--ox-accent);
  color: var(--ox-on-accent);
}

body.theme-raed .s-button-primary:hover,
body.theme-raed .s-button-primary-outline:hover,
body.theme-raed salla-add-product-button .s-button-element:hover,
body.theme-raed .s-add-product-button-main:hover {
  background-color: var(--ox-accent-dark);
  border-color: var(--ox-accent-dark);
  color: var(--ox-on-accent);
}

body.theme-raed .s-button-primary .s-button-text,
body.theme-raed .s-button-primary-outline .s-button-text,
body.theme-raed salla-add-product-button .s-button-element .s-button-text,
body.theme-raed .s-add-product-button-main .s-button-text {
  color: var(--ox-on-accent);
  display: inline-flex;
  align-items: center;
  gap: var(--ox-2);
}

/* Secondary and light outlines become the graphite-bordered secondary. */
body.theme-raed .s-button-outline:not(.s-button-primary-outline),
body.theme-raed .s-button-light-outline {
  background-color: var(--ox-card);
  border-color: var(--ox-line-3);
  color: var(--ox-fg);
}

body.theme-raed .s-button-outline:not(.s-button-primary-outline):hover,
body.theme-raed .s-button-light-outline:hover {
  background-color: var(--ox-plate);
  border-color: var(--ox-ink-3);
  color: var(--ox-fg);
}

body.theme-raed .s-button-text-only,
body.theme-raed .s-button-link {
  background-color: transparent;
  border-color: transparent;
  color: var(--ox-fg);
}

body.theme-raed .s-button-element:disabled,
body.theme-raed .s-button-element[aria-disabled='true'],
body.theme-raed .s-button-element.disabled {
  background-color: var(--ox-plate-2);
  border-color: var(--ox-plate-2);
  color: var(--ox-ink-4);
  cursor: not-allowed;
  transform: none;
}

/* Icon-only buttons keep a 44 square hit area and a square-ish box. */
body.theme-raed .s-button-icon {
  padding-inline: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--ox-r-2);
}

body.theme-raed .ox-band-dark .s-button-outline:not(.s-button-primary-outline),
body.theme-raed .ox-band-dark .s-button-light-outline {
  background-color: transparent;
  border-color: var(--ox-paper);
  color: var(--ox-paper);
}

body.theme-raed .ox-band-dark .s-button-outline:not(.s-button-primary-outline):hover,
body.theme-raed .ox-band-dark .s-button-light-outline:hover {
  background-color: var(--ox-graphite-3);
}

/* ===========================================================================
   4. Form controls
   =========================================================================== */

body.theme-raed input[type='text'],
body.theme-raed input[type='email'],
body.theme-raed input[type='tel'],
body.theme-raed input[type='number'],
body.theme-raed input[type='password'],
body.theme-raed input[type='search'],
body.theme-raed select,
body.theme-raed textarea,
body.theme-raed .s-form-control,
body.theme-raed .form-input {
  min-height: 48px;
  padding-inline: var(--ox-4);
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-card);
  color: var(--ox-fg);
  font-family: var(--font-main);
  font-size: var(--ox-t-body);
  line-height: 1.7;
  box-shadow: none;
}

body.theme-raed input::placeholder,
body.theme-raed textarea::placeholder {
  color: var(--ox-ink-4);
}

body.theme-raed textarea {
  padding-block: var(--ox-3);
  resize: vertical;
}

body.theme-raed input[type='checkbox'],
body.theme-raed input[type='radio'] {
  width: 20px;
  height: 20px;
  border: 1px solid var(--ox-line-3);
  background-color: var(--ox-card);
  accent-color: var(--ox-ink);
}

/* Quantity steppers: 44 tall with 44 square controls. */
body.theme-raed .s-quantity-input-container {
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-card);
  overflow: hidden;
  min-height: 44px;
}

body.theme-raed .s-quantity-input-container button,
body.theme-raed .s-quantity-input-button {
  min-width: 44px;
  min-height: 44px;
  background-color: transparent;
  color: var(--ox-fg);
  border: 0;
}

body.theme-raed .s-quantity-input-input {
  border: 0;
  min-height: 44px;
  text-align: center;
  background-color: transparent;
  color: var(--ox-fg);
  font-weight: 700;
}

/* ===========================================================================
   5. Product card
   =========================================================================== */

body.theme-raed .s-product-card-entry {
  display: flex;
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  box-shadow: none;
  overflow: hidden;
  color: var(--ox-fg);
}

/* Hover changes only the border colour: it never lifts, scales or shadows. */
body.theme-raed .s-product-card-entry:hover {
  border-color: var(--ox-line-2);
  box-shadow: none;
  transform: none;
}

body.theme-raed .s-product-card-vertical {
  flex-direction: column;
}

/* The plate behind the product photograph: a tonal square the packaging sits
   inside, never touching the edge. */
body.theme-raed .s-product-card-image {
  position: relative;
  background-color: var(--ox-plate);
  border-radius: 0;
  overflow: hidden;
}

body.theme-raed .s-product-card-vertical .s-product-card-image {
  /* flex: none keeps the square: as a flex item the plate would otherwise take
     whatever height the content column left over. height: auto and min-height 0
     undo the theme's own height on this box, which would beat aspect-ratio. */
  flex: none;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: auto;
  min-height: 0;
  max-height: none;
  border-bottom: 1px solid var(--ox-line);
}

/* The link and the photograph fill the plate absolutely. A percentage height
   inside an aspect-ratio box resolves to auto, which would let the source
   image's own height decide the plate: this pins it instead. */
body.theme-raed .s-product-card-image > a {
  position: absolute;
  inset: 0;
  display: block;
}

body.theme-raed img.s-product-card-image-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--ox-3);
  background-color: transparent;
  border-radius: 0;
  transform: none;
}

body.theme-raed .s-product-card-entry:hover img.s-product-card-image-cover {
  transform: none;
}

body.theme-raed .s-product-card-horizontal .s-product-card-image {
  flex: none;
  width: 116px;
  min-width: 116px;
  height: auto;
  align-self: stretch;
  border-inline-end: 1px solid var(--ox-line);
}

@media (min-width: 640px) {
  body.theme-raed .s-product-card-horizontal .s-product-card-image {
    width: 148px;
    min-width: 148px;
  }
}

body.theme-raed .s-product-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--ox-2);
  flex: 1 1 auto;
  /* Without this the content column refuses to shrink and the card clips its
     own add button on a horizontal layout. */
  min-width: 0;
  padding: var(--ox-3);
  background-color: var(--ox-card);
}

@media (min-width: 640px) {
  body.theme-raed .s-product-card-content { padding: var(--ox-4); }
}

body.theme-raed .s-product-card-content-main {
  display: flex;
  flex-direction: column;
  gap: var(--ox-1);
}

body.theme-raed h3.s-product-card-content-title {
  margin: 0;
  font-size: var(--ox-t-body);
  font-weight: 700;
  line-height: 1.45;
  color: var(--ox-fg);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(2 * 1.45em);
}

body.theme-raed h3.s-product-card-content-title a {
  color: inherit;
  text-decoration: none;
}

body.theme-raed h3.s-product-card-content-title a:hover {
  color: var(--ox-accent-dark);
}

body.theme-raed p.s-product-card-content-subtitle {
  margin: 0;
  font-size: var(--ox-t-small);
  font-weight: 400;
  line-height: 1.6;
  color: var(--ox-fg-3);
  opacity: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

body.theme-raed .s-product-card-content-sub {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--ox-2);
  min-height: 32px;
}

body.theme-raed h4.s-product-card-price {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
  unicode-bidi: isolate;
  font-size: var(--ox-t-h3);
  font-weight: 700;
  line-height: 1.2;
  color: var(--ox-fg);
  white-space: nowrap;
}

body.theme-raed h4.s-product-card-price .sicon-sar {
  font-size: 0.8em;
  line-height: 1;
  color: inherit;
}

/* On a sale card Raed nests the new price (h4) and the old one (span) inside
   one wrapper. The new price keeps the ink; only the old one is struck, and
   neither is orange: orange belongs to the button. */
body.theme-raed .s-product-card-sale-price {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--ox-2);
}

body.theme-raed .s-product-card-sale-price h4 {
  margin: 0;
  unicode-bidi: isolate;
  font-size: var(--ox-t-h3);
  font-weight: 700;
  line-height: 1.2;
  color: var(--ox-fg);
  white-space: nowrap;
}

body.theme-raed .s-product-card-sale-price h4 .sicon-sar {
  font-size: 0.8em;
}

body.theme-raed .s-product-card-sale-price span,
body.theme-raed .s-product-card-price-before,
body.theme-raed .s-product-card-old-price {
  unicode-bidi: isolate;
  font-size: var(--ox-t-small);
  font-weight: 400;
  color: var(--ox-fg-3);
  text-decoration: line-through;
  white-space: nowrap;
}

body.theme-raed .s-product-card-content-footer {
  margin-top: auto;
  display: flex;
  align-items: stretch;
  gap: var(--ox-2);
  padding-top: var(--ox-2);
}

body.theme-raed .s-product-card-content-footer salla-add-product-button {
  flex: 1 1 auto;
  min-width: 0;
}

body.theme-raed .s-product-card-content-footer .s-button-element {
  width: 100%;
  min-height: 44px;
  font-size: var(--ox-t-small);
  padding-inline: var(--ox-3);
}

/* The wishlist control: a 44 square on the plate, at the end corner. */
body.theme-raed .s-product-card-wishlist-btn.s-button-element,
body.theme-raed .s-product-card-wishlist-btn .s-button-element {
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0;
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-2);
  color: var(--ox-fg-2);
  box-shadow: none;
}

body.theme-raed .s-product-card-wishlist-btn.s-button-element:hover,
body.theme-raed .s-product-card-wishlist-btn .s-button-element:hover {
  border-color: var(--ox-ink-3);
  background-color: var(--ox-card);
  color: var(--ox-accent);
}

body.theme-raed .s-product-card-image .s-product-card-wishlist-btn {
  position: absolute;
  top: var(--ox-2);
  inset-inline-end: var(--ox-2);
  z-index: var(--ox-z-raised);
}

body.theme-raed .s-product-card-wishlist-btn.is-added .s-button-element,
body.theme-raed .s-product-card-wishlist-btn.s-wishlist-added .s-button-element {
  color: var(--ox-accent);
}

/* Badges are never orange and never shadowed. */
body.theme-raed .s-product-card-promotion-title,
body.theme-raed .s-product-card-discount,
body.theme-raed .s-product-card-out-of-stock {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding-inline: var(--ox-2);
  border: 1px solid transparent;
  border-radius: var(--ox-r-1);
  font-size: var(--ox-t-micro);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  box-shadow: none;
  background-color: var(--ox-graphite);
  color: var(--ox-paper);
}

body.theme-raed .s-product-card-out-of-stock {
  background-color: var(--ox-stop-soft);
  color: var(--ox-stop);
}

body.theme-raed .s-product-card-discount {
  background-color: var(--ox-go-soft);
  color: var(--ox-go);
}

/* The grid the card sits in: 2-up on mobile, 3-up on tablet, 4-up on desktop
   for the vertical card; one column fewer at every step for the wider
   horizontal card. */
body.theme-raed .s-products-list-wrapper {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ox-3);
  align-items: stretch;
}

body.theme-raed .s-products-list-horizontal-cards {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 640px) {
  body.theme-raed .s-products-list-wrapper {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ox-4);
  }
  body.theme-raed .s-products-list-horizontal-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  body.theme-raed .s-products-list-wrapper {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  body.theme-raed .s-products-list-horizontal-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

body.theme-raed .s-products-list-wrapper > * {
  height: 100%;
}

/* ===========================================================================
   6. Section headers and sliders
   =========================================================================== */

body.theme-raed .s-block__title,
body.theme-raed .s-slider-block__title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ox-4);
  margin-bottom: var(--ox-6);
  padding-bottom: 0;
  border: 0;
}

@media (min-width: 1024px) {
  body.theme-raed .s-block__title,
  body.theme-raed .s-slider-block__title {
    margin-bottom: var(--ox-8);
  }
}

body.theme-raed .s-block__title h2,
body.theme-raed .s-slider-block__title h2,
body.theme-raed .s-slider-block__title-text {
  position: relative;
  margin: 0;
  font-size: var(--ox-t-h2);
  font-weight: 700;
  line-height: 1.25;
  color: var(--ox-fg);
}

/* The eyebrow rule: a 24 by 2 accent mark above every section title. */
body.theme-raed .s-block__title h2::before,
body.theme-raed .s-slider-block__title h2::before {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  margin-bottom: var(--ox-3);
  background-color: var(--ox-accent);
}

body.theme-raed .s-block__display-all,
body.theme-raed .s-slider-block__title-all {
  display: inline-flex;
  align-items: center;
  gap: var(--ox-1);
  min-height: 44px;
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
  text-decoration: none;
  border-radius: var(--ox-r-1);
  background-color: transparent;
  border: 0;
  padding-inline: 0;
}

body.theme-raed .s-block__display-all:hover,
body.theme-raed .s-slider-block__title-all:hover {
  color: var(--ox-accent-dark);
}

body.theme-raed .s-block__display-all i,
body.theme-raed .s-slider-block__title-all i {
  font-size: 16px;
  transition: transform var(--dur-fast) var(--ease-in);
}

body.theme-raed .s-block__display-all:hover i,
body.theme-raed .s-slider-block__title-all:hover i {
  transform: translateX(calc(var(--direction-factor) * 2px));
  transition-timing-function: var(--ease-out);
}

/* Slider arrows: 40 square cards with a line border, never orange. */
body.theme-raed .s-slider-block__title-nav button,
body.theme-raed .s-slider-nav-btn,
body.theme-raed .swiper-button-next,
body.theme-raed .swiper-button-prev {
  width: 44px;
  height: 44px;
  border-radius: var(--ox-r-2);
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line-3);
  color: var(--ox-fg);
  box-shadow: none;
}

body.theme-raed .s-slider-block__title-nav button:hover,
body.theme-raed .s-slider-nav-btn:hover,
body.theme-raed .swiper-button-next:hover,
body.theme-raed .swiper-button-prev:hover {
  border-color: var(--ox-ink-3);
  background-color: var(--ox-plate);
}

body.theme-raed .swiper-pagination-bullet {
  background-color: var(--ox-line-2);
  opacity: 1;
  border-radius: var(--ox-r-pill);
}

body.theme-raed .swiper-pagination-bullet-active {
  background-color: var(--ox-accent);
}

/* ===========================================================================
   7. Home blocks
   =========================================================================== */

body.theme-raed .s-block {
  background-color: transparent;
}

body.theme-raed.index .s-block + .s-block {
  margin-top: var(--ox-12);
}

@media (min-width: 1024px) {
  body.theme-raed.index .s-block + .s-block {
    margin-top: var(--ox-16);
  }
}

/* 7.1 The hero band. Graphite ground, the photograph over it, and the single
   orange wedge of the first screen at the top inline-end corner. Nothing here
   animates: a wedge is a static paint-time clip. */
body.theme-raed .s-block--hero-slider {
  position: relative;
  background-color: var(--ox-graphite);
  margin-top: 0;
}

body.theme-raed .s-block--hero-slider::after {
  content: '';
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  width: 64px;
  height: 158px;
  background-color: var(--ox-accent);
  clip-path: polygon(0 0, 64px 0, 0 158px);
  pointer-events: none;
  z-index: var(--ox-z-raised);
}

[dir='ltr'] body.theme-raed .s-block--hero-slider::after {
  clip-path: polygon(100% 0, calc(100% - 64px) 0, 100% 158px);
}

@media (min-width: 1024px) {
  body.theme-raed .s-block--hero-slider::after {
    width: 96px;
    height: 238px;
    clip-path: polygon(0 0, 96px 0, 0 238px);
  }
  [dir='ltr'] body.theme-raed .s-block--hero-slider::after {
    clip-path: polygon(100% 0, calc(100% - 96px) 0, 100% 238px);
  }
}

body.theme-raed .s-block--hero-slider .swiper-slide img,
body.theme-raed .s-block--hero-slider .s-slider-slide img {
  border-radius: 0;
}

/* 7.2 Category tiles: photo on plate, label strip under it. */
body.theme-raed .s-block--categories .swiper-slide > a,
body.theme-raed .s-block--categories .s-slider-slide > a,
body.theme-raed .s-block--categories .main-links-item {
  display: flex;
  flex-direction: column;
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  overflow: hidden;
  text-decoration: none;
  color: var(--ox-fg);
  box-shadow: none;
}

body.theme-raed .s-block--categories .swiper-slide > a:hover,
body.theme-raed .s-block--categories .main-links-item:hover {
  border-color: var(--ox-line-2);
  box-shadow: none;
  transform: none;
}

body.theme-raed .s-block--categories img {
  background-color: var(--ox-plate);
  object-fit: contain;
  padding: var(--ox-3);
  border-radius: 0;
}

body.theme-raed .s-block--categories .main-links-item i,
body.theme-raed .s-block--categories .swiper-slide i {
  color: var(--ox-accent);
}

body.theme-raed .s-block--categories h3,
body.theme-raed .s-block--categories h2,
body.theme-raed .s-block--categories .main-links-title {
  font-size: var(--ox-t-body);
  font-weight: 700;
  color: var(--ox-fg);
  letter-spacing: 0;
}

/* 7.3 The trust strip (Raed's features block). */
body.theme-raed .s-block--features__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ox-2);
  padding: var(--ox-4);
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  box-shadow: none;
  min-height: 72px;
  text-align: start;
}

@media (min-width: 640px) {
  body.theme-raed .s-block--features__item { padding: var(--ox-6); }
}

body.theme-raed .s-block--features__item:hover {
  border-color: var(--ox-line-2);
  box-shadow: none;
  transform: none;
}

body.theme-raed .s-block--features__item .feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  margin: 0;
  background-color: transparent;
  border-radius: 0;
  color: var(--ox-accent);
}

body.theme-raed .s-block--features__item .feature-icon i {
  font-size: 28px;
  color: var(--ox-accent);
}

body.theme-raed .s-block--features__item h2 {
  margin: 0;
  font-size: var(--ox-t-h3);
  font-weight: 700;
  color: var(--ox-fg);
}

body.theme-raed .s-block--features__item p {
  margin: 0;
  font-size: var(--ox-t-small);
  line-height: 1.6;
  color: var(--ox-fg-2);
}

/* 7.4 Tabbed product blocks: a tonal plate band, never a second dark stripe. */
/* Both class names are matched on purpose: s-block--tabs-produtcs carries
   Salla's own typo, so s-block-tabs is the one likely to survive a fix. */
body.theme-raed .s-block--tabs-produtcs,
body.theme-raed .s-block-tabs {
  background-color: var(--ox-plate);
  padding-block: var(--ox-12);
}

@media (min-width: 1024px) {
  body.theme-raed .s-block--tabs-produtcs,
  body.theme-raed .s-block-tabs { padding-block: var(--ox-16); }
}

/* Inside a plate band the card's own plate steps one tone down, so the card
   still reads as a white object with a photograph on it rather than a hole. */
body.theme-raed .s-block--tabs-produtcs .s-product-card-image,
body.theme-raed .s-block-tabs .s-product-card-image,
body.theme-raed .s-block--slider-with-bg .s-product-card-image {
  background-color: var(--ox-plate-2);
}

body.theme-raed .s-block-tabs .tabs__head {
  display: flex;
  gap: var(--ox-2);
  border-bottom: 1px solid var(--ox-line-2);
  margin-bottom: var(--ox-6);
  overflow-x: auto;
  scrollbar-width: none;
}

body.theme-raed .s-block-tabs .tabs__head::-webkit-scrollbar { display: none; }

body.theme-raed .s-block-tabs .tabs__head button,
body.theme-raed .s-block-tabs .tabs__head a {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding-inline: var(--ox-4);
  background-color: transparent;
  border: 0;
  border-radius: 0;
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg-2);
}

body.theme-raed .s-block-tabs .tabs__head .is-active,
body.theme-raed .s-block-tabs .tabs__head button.is-active {
  color: var(--ox-fg);
  background-color: transparent;
  box-shadow: inset 0 -2px 0 0 var(--ox-ink);
}

/* 7.5 The slider-with-background block: the second dark band, with the one
   graphite-2 wedge panel at its inline-end edge (DIRECTION 4.5 services band). */
body.theme-raed .s-block--slider-with-bg .slider-bg {
  position: relative;
  background-color: var(--ox-graphite);
  background-blend-mode: normal;
  color: var(--ox-ink-on-dark);
  isolation: isolate;
}

body.theme-raed .s-block--slider-with-bg .slider-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(23, 23, 26, 0.55);
  pointer-events: none;
  z-index: 0;
}

body.theme-raed .s-block--slider-with-bg .slider-bg::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  inset-inline-end: 0;
  width: calc(34% + 194px);
  background-color: var(--ox-graphite-2);
  clip-path: polygon(0 0, 100% 0, calc(100% - 194px) 100%, 0 100%);
  pointer-events: none;
  z-index: 0;
}

[dir='ltr'] body.theme-raed .s-block--slider-with-bg .slider-bg::after {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 194px 100%);
}

@media (max-width: 1023px) {
  body.theme-raed .s-block--slider-with-bg .slider-bg::after {
    width: 80px;
    bottom: auto;
    height: 198px;
    clip-path: polygon(0 0, 80px 0, 0 198px);
  }
  [dir='ltr'] body.theme-raed .s-block--slider-with-bg .slider-bg::after {
    clip-path: polygon(100% 0, calc(100% - 80px) 0, 100% 198px);
  }
}

body.theme-raed .s-block--slider-with-bg .slider-bg > * {
  position: relative;
  z-index: 1;
}

body.theme-raed .s-block--slider-with-bg .slider-bg h1,
body.theme-raed .s-block--slider-with-bg .slider-bg h2,
body.theme-raed .s-block--slider-with-bg .slider-bg h3 {
  color: var(--ox-ink-on-dark);
  font-size: var(--ox-t-h2);
  font-weight: 700;
  line-height: 1.25;
}

body.theme-raed .s-block--slider-with-bg .slider-bg p {
  color: var(--ox-ink-2-on-dark);
  font-size: var(--ox-t-lead);
  line-height: 1.6;
}

/* 7.6 Photos slider: no rounded corners on a full-bleed photo. */
body.theme-raed .s-block--photos-slider img {
  border-radius: var(--ox-r-2);
}

/* ===========================================================================
   8. Header
   =========================================================================== */

body.theme-raed header.store-header {
  background-color: var(--ox-card);
  box-shadow: none;
}

/* The utility line is the one graphite strip at the top of every page. */
body.theme-raed header.store-header .top-navbar {
  background-color: var(--ox-graphite);
  color: var(--ox-ink-on-dark);
  border: 0;
  min-height: var(--ox-h-util);
  padding-block: var(--ox-1);
  box-shadow: none;
}

body.theme-raed header.store-header .top-navbar a,
body.theme-raed header.store-header .top-navbar span,
body.theme-raed header.store-header .top-navbar p,
body.theme-raed header.store-header .top-navbar i {
  color: var(--ox-ink-2-on-dark);
}

body.theme-raed header.store-header .top-navbar a:hover {
  color: var(--ox-ink-on-dark);
  text-decoration: underline;
}

body.theme-raed .s-menu-topnav-list {
  display: flex;
  align-items: center;
  gap: var(--ox-4);
}

body.theme-raed .s-menu-topnav-item {
  display: inline-flex;
  align-items: center;
  min-height: var(--ox-h-util);
  font-size: var(--ox-t-small);
  font-weight: 400;
  color: var(--ox-ink-2-on-dark);
  text-decoration: none;
}

/* The search field inside the utility line reads as a control on dark, and it
   is capped so it never swallows the whole line. */
body.theme-raed header.store-header .top-navbar .header-search {
  max-width: 480px;
  margin-inline-start: auto;
}

body.theme-raed header.store-header .top-navbar .s-search-input-wrapper,
body.theme-raed header.store-header .top-navbar input {
  background-color: var(--ox-graphite-3);
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  color: var(--ox-ink-on-dark);
  min-height: 36px;
  box-shadow: none;
}

body.theme-raed header.store-header .top-navbar input::placeholder {
  color: var(--ox-ink-3-on-dark);
}

/* The main bar: a white card with one line rule and shadow-1. */
body.theme-raed header.store-header .main-nav-container {
  background-color: var(--ox-card);
  border-bottom: 1px solid var(--ox-line);
  box-shadow: var(--ox-shadow-1);
}

body.theme-raed header.store-header .main-nav-container .inner {
  background-color: var(--ox-card);
}

body.theme-raed header.store-header .main-nav-container .container > div {
  min-height: var(--ox-h-bar);
}

body.theme-raed header.store-header .mobile-menu-btn,
body.theme-raed header.store-header .main-nav-container button,
body.theme-raed header.store-header .main-nav-container .s-cart-summary-wrapper > * {
  color: var(--ox-fg);
}

body.theme-raed header.store-header nav a,
body.theme-raed header.store-header .main-menu a {
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
  letter-spacing: 0;
}

body.theme-raed header.store-header nav a:hover,
body.theme-raed header.store-header .main-menu a:hover {
  color: var(--ox-accent-dark);
}

/* Counter pills are the one other orange fill, and they carry ink. */
body.theme-raed .s-cart-summary-count,
body.theme-raed .s-count,
body.theme-raed header.store-header .badge {
  background-color: var(--ox-accent);
  color: var(--ox-on-accent);
  font-size: var(--ox-t-micro);
  font-weight: 700;
  border-radius: var(--ox-r-pill);
}

/* ===========================================================================
   9. Footer
   =========================================================================== */

body.theme-raed footer.store-footer {
  --ox-bg: var(--ox-graphite);
  --ox-surface: var(--ox-graphite-2);
  --ox-fg: var(--ox-ink-on-dark);
  --ox-fg-2: var(--ox-ink-2-on-dark);
  --ox-fg-3: var(--ox-ink-3-on-dark);
  --ox-bd: var(--ox-line-on-dark);
  background-color: var(--ox-graphite);
  color: var(--ox-ink-on-dark);
  border-top: 0;
}

body.theme-raed footer.store-footer .store-footer__inner {
  background-color: transparent;
  padding-block: var(--ox-12);
  border-bottom: 1px solid var(--ox-line-on-dark);
}

@media (min-width: 1024px) {
  body.theme-raed footer.store-footer .store-footer__inner {
    padding-block: var(--ox-16);
  }
}

body.theme-raed footer.store-footer h2,
body.theme-raed footer.store-footer h3,
body.theme-raed footer.store-footer h4,
body.theme-raed footer.store-footer .footer-title {
  color: var(--ox-ink-on-dark);
  font-size: var(--ox-t-small);
  font-weight: 600;
  letter-spacing: 0;
}

body.theme-raed footer.store-footer a,
body.theme-raed footer.store-footer p,
body.theme-raed footer.store-footer li,
body.theme-raed footer.store-footer span {
  color: var(--ox-ink-2-on-dark);
  font-size: var(--ox-t-small);
}

body.theme-raed footer.store-footer a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  text-decoration: none;
}

body.theme-raed footer.store-footer a:hover {
  color: var(--ox-ink-on-dark);
  text-decoration: underline;
}

/* Payment and trust marks keep their own colours on a paper plate. */
body.theme-raed footer.store-footer .s-payments-list li,
body.theme-raed footer.store-footer .s-payments-list img {
  background-color: var(--ox-paper);
  border-radius: var(--ox-r-1);
}

body.theme-raed footer.store-footer .s-payments-list li {
  min-height: 32px;
  padding: var(--ox-1) var(--ox-2);
  border: 0;
}

/* ===========================================================================
   10. Product page
   =========================================================================== */

body.theme-raed .container--breadcrumbs {
  padding-block: var(--ox-4);
}

body.theme-raed .container--breadcrumbs a,
body.theme-raed .container--breadcrumbs span,
body.theme-raed .s-breadcrumb a,
body.theme-raed .s-breadcrumb span {
  font-size: var(--ox-t-small);
  color: var(--ox-fg-3);
}

body.theme-raed .container--breadcrumbs a:hover {
  color: var(--ox-accent-dark);
}

body.theme-raed .container--product-details {
  background-color: transparent;
}

body.theme-raed.product-single h1,
body.theme-raed .product-entry__title {
  font-size: var(--ox-t-h1);
  font-weight: 700;
  line-height: 1.2;
  color: var(--ox-fg);
  letter-spacing: 0;
}

body.theme-raed h2.product-entry__sub-title {
  font-size: var(--ox-t-lead);
  font-weight: 400;
  line-height: 1.6;
  color: var(--ox-fg-2);
  letter-spacing: 0;
  margin-block: var(--ox-2) var(--ox-4);
}

/* The gallery plate: the packaging sits inside a tonal square. */
body.theme-raed .s-slider-nav-inner img,
body.theme-raed .product-single .swiper-slide img,
body.theme-raed .slider-single img,
body.theme-raed .product__gallery img {
  background-color: var(--ox-plate);
  border-radius: var(--ox-r-2);
  object-fit: contain;
  padding: var(--ox-6);
}

body.theme-raed .s-slider-nav-thumbs img,
body.theme-raed .product__thumbs img {
  padding: var(--ox-2);
  border-radius: var(--ox-r-1);
}

/* The buy column price. */
body.theme-raed .product-entry .total-price,
body.theme-raed .product-single .total-price,
body.theme-raed h2.total-price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
  unicode-bidi: isolate;
  font-size: var(--ox-t-h2);
  font-weight: 700;
  color: var(--ox-fg);
  letter-spacing: 0;
}

body.theme-raed .product-entry .before-price,
body.theme-raed .product-single .before-price {
  font-size: var(--ox-t-small);
  font-weight: 400;
  color: var(--ox-fg-3);
  text-decoration: line-through;
}

body.theme-raed form.product-form {
  display: block;
}

body.theme-raed form.product-form .s-button-element,
body.theme-raed .s-add-product-button-main {
  min-height: 48px;
  font-size: var(--ox-t-body);
}

/* Product options: pills and swatches, never orange until they are chosen. */
body.theme-raed salla-product-options .s-product-options-option-label,
body.theme-raed .s-product-options-option-label {
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
}

body.theme-raed .s-product-options-option-item,
body.theme-raed .s-product-options-single-option label {
  min-height: 44px;
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-card);
  color: var(--ox-fg);
  font-size: var(--ox-t-body);
}

body.theme-raed .s-product-options-option-item.s-product-options-selected,
body.theme-raed .s-product-options-option-item[aria-checked='true'] {
  border: 2px solid var(--ox-ink);
  background-color: var(--ox-accent-soft);
  color: var(--ox-fg);
}

/* The description: a text measure, and the spec line the script parses. */
body.theme-raed div.product__description {
  max-width: calc(var(--ox-container-text) + 2 * var(--ox-gutter));
  font-size: var(--ox-t-body);
  line-height: 1.7;
  color: var(--ox-fg-2);
}

body.theme-raed div.product__description p {
  margin-block: 0 var(--ox-3);
}

body.theme-raed div.product__description h2,
body.theme-raed div.product__description h3 {
  font-size: var(--ox-t-h3);
  font-weight: 700;
  color: var(--ox-fg);
  margin-block: var(--ox-6) var(--ox-2);
}

/* The buy zone. Raed renders it as two stacked white sections inside the
   product form; the pair is drawn here as one card. */
body.theme-raed form.product-form > section:not(.sticky-product-bar) {
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-bottom: 0;
  border-radius: var(--ox-r-2) var(--ox-r-2) 0 0;
  padding: var(--ox-4);
  color: var(--ox-fg);
}

body.theme-raed section.sticky-product-bar {
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: 0 0 var(--ox-r-2) var(--ox-r-2);
  box-shadow: none;
  padding: var(--ox-4);
  color: var(--ox-fg);
}

/* When the theme pins the bar to the viewport it becomes the sticky buy bar:
   64 tall, one top rule, shadow-1, above the page. */
body.theme-raed section.sticky-product-bar.is-fixed,
body.theme-raed section.sticky-product-bar.fixed {
  border: 0;
  border-top: 1px solid var(--ox-line);
  border-radius: 0;
  box-shadow: var(--ox-shadow-1);
  min-height: var(--ox-h-sticky);
  z-index: var(--ox-z-sticky);
}

body.theme-raed form.product-form .form-label,
body.theme-raed form.product-form .form-label b {
  font-size: var(--ox-t-small);
  font-weight: 600;
  color: var(--ox-fg-3);
  letter-spacing: 0;
}

body.theme-raed section.sticky-product-bar img {
  background-color: var(--ox-plate);
  border-radius: var(--ox-r-1);
  object-fit: contain;
}

body.theme-raed .sticky-product-bar__quantity .s-quantity-input-container {
  min-height: 44px;
}

body.theme-raed .sticky-product-bar__btn .s-button-element {
  min-height: 48px;
  background-color: var(--ox-accent);
  border-color: var(--ox-accent);
  color: var(--ox-on-accent);
}

/* ===========================================================================
   11. Listing, search and filters
   =========================================================================== */

body.theme-raed .s-filters-wrapper,
body.theme-raed .filters-rail,
body.theme-raed salla-filters {
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  color: var(--ox-fg);
}

body.theme-raed .s-filters-group-title,
body.theme-raed .s-filters-wrapper h3 {
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
}

body.theme-raed .s-filters-option,
body.theme-raed .s-filters-wrapper label {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--ox-3);
  font-size: var(--ox-t-body);
  color: var(--ox-fg);
}

body.theme-raed .s-sort-select,
body.theme-raed .s-listing-sort select {
  min-height: 44px;
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-card);
  color: var(--ox-fg);
}

body.theme-raed .s-pagination a,
body.theme-raed .s-pagination span {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ox-r-1);
  border: 1px solid var(--ox-line-3);
  background-color: var(--ox-card);
  color: var(--ox-fg);
  font-weight: 600;
}

body.theme-raed .s-pagination .is-active,
body.theme-raed .s-pagination .active {
  background-color: var(--ox-ink);
  border-color: var(--ox-ink);
  color: var(--ox-paper);
}

/* ===========================================================================
   12. Cart
   =========================================================================== */

body.theme-raed .s-cart-summary,
body.theme-raed .cart-summary,
body.theme-raed .cart-total,
body.theme-raed .s-cart-totals {
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  box-shadow: none;
  color: var(--ox-fg);
}

body.theme-raed .cart-item,
body.theme-raed .s-cart-item,
body.theme-raed .cart-items > li {
  background-color: var(--ox-card);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  box-shadow: none;
}

body.theme-raed .cart-item img,
body.theme-raed .s-cart-item img {
  background-color: var(--ox-plate);
  border-radius: var(--ox-r-1);
  object-fit: contain;
}

body.theme-raed .cart-item h3,
body.theme-raed .s-cart-item h3 {
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
}

/* ===========================================================================
   13. The parts the script adds (PDP spec chips, supply line, nutrition)
   =========================================================================== */

.ox-injected {
  font-family: var(--font-main);
  color: var(--ox-fg);
  letter-spacing: 0;
}

.ox-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ox-2);
  margin-block: var(--ox-3);
  padding: 0;
  list-style: none;
}

.ox-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ox-1);
  max-width: 100%;
  height: 32px;
  padding-inline: var(--ox-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-plate);
  color: var(--ox-fg);
  font-size: var(--ox-t-small);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.ox-chip__label {
  font-weight: 400;
  color: var(--ox-fg-3);
}

.ox-chip__value {
  font-weight: 600;
  color: var(--ox-fg);
  unicode-bidi: isolate;
}

/* The supply calculator: a plate panel that describes the package. */
.ox-supply {
  display: flex;
  flex-direction: column;
  gap: var(--ox-3);
  margin-block: var(--ox-4);
  padding: var(--ox-4);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-plate);
  color: var(--ox-fg);
}

.ox-supply__label {
  font-size: var(--ox-t-body);
  font-weight: 600;
  color: var(--ox-fg);
  margin: 0;
}

.ox-supply__row {
  display: flex;
  align-items: center;
  gap: var(--ox-3);
  flex-wrap: wrap;
}

.ox-supply__stepper {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--ox-line-3);
  border-radius: var(--ox-r-1);
  background-color: var(--ox-card);
  overflow: hidden;
}

.ox-supply__btn {
  width: 44px;
  height: 44px;
  border: 0;
  background-color: transparent;
  color: var(--ox-fg);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: transform var(--dur-fast) var(--ease-in);
}

.ox-supply__btn:active:not(:disabled) {
  transform: translateY(1px);
  transition-timing-function: var(--ease-out);
}

.ox-supply__btn:disabled {
  color: var(--ox-ink-4);
  cursor: not-allowed;
}

.ox-supply__btn:focus-visible {
  outline: var(--ox-focus-ring);
  outline-offset: -2px;
}

.ox-supply__value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  font-size: var(--ox-t-body);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--ox-fg);
  border-inline: 1px solid var(--ox-line);
}

.ox-supply__result {
  margin: 0;
  font-size: var(--ox-t-body);
  font-weight: 600;
  line-height: 1.6;
  color: var(--ox-fg);
  transition: opacity var(--dur-fast) var(--ease-out);
}

.ox-supply__result .ox-num {
  font-variant-numeric: tabular-nums;
  unicode-bidi: isolate;
}

.ox-supply__unit {
  font-size: var(--ox-t-body);
  color: var(--ox-fg-2);
}

.ox-supply__note,
.ox-table__note {
  margin: 0;
  font-size: var(--ox-t-small);
  font-weight: 400;
  line-height: 1.6;
  color: var(--ox-fg-3);
}

/* The nutrition table: header row on plate-2, rules on line-2, the first
   column pinned while the table scrolls on a narrow screen. */
.ox-table-wrap {
  position: relative;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-block: var(--ox-4);
  border: 1px solid var(--ox-line);
  border-radius: var(--ox-r-2);
  background-color: var(--ox-card);
}

.ox-table-wrap > table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: var(--ox-t-body);
  line-height: 1.7;
  letter-spacing: 0;
  color: var(--ox-fg);
  background-color: var(--ox-card);
  margin: 0;
}

.ox-table-wrap > table th,
.ox-table-wrap > table td {
  padding-inline: var(--ox-3);
  text-align: start;
  vertical-align: middle;
  border-bottom: 1px solid var(--ox-line-2);
}

.ox-table-wrap > table thead th {
  height: 44px;
  background-color: var(--ox-plate-2);
  font-size: var(--ox-t-small);
  font-weight: 600;
  color: var(--ox-fg-2);
  position: sticky;
  top: 0;
  z-index: 2;
}

.ox-table-wrap > table tbody td,
.ox-table-wrap > table tbody th {
  min-height: 48px;
  height: 48px;
}

.ox-table-wrap > table tbody tr:last-child th,
.ox-table-wrap > table tbody tr:last-child td {
  border-bottom: 0;
}

.ox-table-wrap > table thead th:first-child,
.ox-table-wrap > table tbody th:first-child,
.ox-table-wrap > table tbody td:first-child {
  position: sticky;
  inset-inline-start: 0;
  background-color: var(--ox-card);
  font-weight: 600;
  z-index: 1;
}

.ox-table-wrap > table thead th:first-child {
  background-color: var(--ox-plate-2);
  z-index: 3;
}

.ox-table__meaning {
  color: var(--ox-fg-2);
  font-size: var(--ox-t-small);
  line-height: 1.6;
  white-space: normal;
}

@media (min-width: 768px) {
  .ox-table__meaning { width: 45%; }
}

.ox-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* The original spec paragraph stays in the document and stops being painted,
   so nothing is lost if the script is removed. */
.ox-source-hidden {
  display: none;
}

/* ===========================================================================
   14. Reduced motion
   =========================================================================== */

@media (prefers-reduced-motion: reduce) {
  body.theme-raed *,
  body.theme-raed *::before,
  body.theme-raed *::after {
    transition-duration: 0.01ms;
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }

  body.theme-raed .s-button-element:active,
  .ox-supply__btn:active {
    transform: none;
  }
}
`;

  /* ---------------------------------------------------------------------
   * 1. Copy. Every string is the one the theme ships in locales/ar.json.
   * ------------------------------------------------------------------- */

  var T = {
    servings: 'عدد الحصص',
    servingSize: 'حجم الحصة',
    form: 'الشكل',
    expiry: 'الصلاحية',
    specsLabel: 'حقائق الملصق',
    supplyTitle: 'كم يوما تكفي العبوة؟',
    servingsPerDay: 'حصص في اليوم',
    increase: 'زيادة الحصص في اليوم',
    decrease: 'إنقاص الحصص في اليوم',
    resultDays: 'تكفي نحو {{days}} يوما',
    resultRunout: 'تنتهي تقريبا في {{date}}',
    supplyNote: 'حساب تقريبي من عدد الحصص على الملصق، وليس توصية بجرعة.',
    nutritionNutrient: 'العنصر',
    nutritionPerServing: 'في الحصة الواحدة',
    nutritionMeaning: 'ماذا يعني الرقم',
    labelDataNote: 'الأرقام منقولة من ملصق المنتج، وليست توصية لأي شخص بعينه.'
  };

  /* The supplement glossary: term, search aliases and the one-sentence plain
     Arabic definition, lifted from app/content/glossary.ts and locales/ar.json. */
  var GLOSSARY = {
    "bcaa": { term: "الأحماض الأمينية متفرعة السلسلة", aliases: "بي سي اي اي، BCAA", def: "ثلاثة أحماض أمينية: اللوسين والايزولوسين والفالين، تباع مشروبا خلال التمرين." },
    "beta_alanine": { term: "بيتا الانين", aliases: "بيتا الانين، beta alanine", def: "حمض أميني في مكملات ما قبل التمرين، يسبب وخزا خفيفا مؤقتا في الجلد." },
    "biotin": { term: "بيوتين", aliases: "بيوتين، biotin", def: "فيتامين من مجموعة ب يساهم في الحفاظ على الشعر والبشرة الطبيعيين." },
    "caffeine": { term: "كافيين", aliases: "كافيين، caffeine", def: "ملغرامات الكافيين في الحصة الواحدة، وهو الرقم الذي تجمعه مع قهوة يومك." },
    "calories": { term: "سعرات حرارية", aliases: "سعرات، سعرة، كالوري، calories، kcal", def: "طاقة الحصة الواحدة، وتحسب ضمن مجموع سعرات يومك لا فوقه." },
    "carbohydrates": { term: "كربوهيدرات", aliases: "كربوهيدرات، كارب، carbohydrate", def: "غرامات الكربوهيدرات في الحصة، وتشمل السكريات والنشويات والألياف." },
    "casein": { term: "كازين", aliases: "كازين، casein", def: "بروتين الحليب البطيء الامتصاص، يؤخذ قبل النوم أو بين الوجبات المتباعدة." },
    "citrulline": { term: "سيترولين ماليت", aliases: "سيترولين، citrulline", def: "مكون في مكملات ما قبل التمرين يستخدم لدعم التحمل خلال الحصة." },
    "collagen": { term: "كولاجين ببتيدات", aliases: "كولاجين، collagen", def: "كولاجين متحلل بلا طعم يذوب في المشروبات بجرعة 10 إلى 20 غراما يوميا." },
    "concentrate": { term: "واي مركز", aliases: "كونسنتريت، concentrate", def: "واي بترشيح أساسي، نسبة البروتين فيه 70 إلى 80 غراما لكل 100 غرام، وهو الأقل تكلفة." },
    "creatine": { term: "كرياتين مونوهيدرات", aliases: "كرياتين، creatine", def: "مركب تخزنه العضلات ويدعم إنتاج الطاقة في الجهد القصير عالي الشدة، بجرعة 3 إلى 5 غرامات يوميا." },
    "eaa": { term: "الأحماض الأمينية الأساسية", aliases: "اي اي اي، EAA", def: "الأحماض الأمينية التسعة التي لا يصنعها الجسم، وتشمل الثلاثة المتفرعة." },
    "electrolytes": { term: "الكتروليت", aliases: "الكترولايت، electrolytes", def: "أملاح الصوديوم والبوتاسيوم والمغنيسيوم التي تخرج مع العرق، تباع أقراصا تذاب في الماء." },
    "fat": { term: "دهون", aliases: "دهون، الدهون، fat", def: "غرامات الدهون في الحصة الواحدة، وتحسب ضمن سعرات اليوم مثل البروتين والكربوهيدرات." },
    "fibre": { term: "ألياف", aliases: "ألياف، الياف، fiber", def: "غرامات الألياف الغذائية في الحصة، وهي جزء من الكربوهيدرات لا يهضمه الجسم." },
    "glutamine": { term: "جلوتامين", aliases: "جلوتامين، glutamine", def: "حمض أميني يوجد بكثرة في العضلات، يستخدم بعد التمرين بجرعة 5 غرامات." },
    "hydrolysed": { term: "واي محلل مائيا", aliases: "هيدرو، هيدروليزد، hydrolyzed", def: "ايزوليت قطعت بروتيناته إلى سلاسل أقصر ليمتص أسرع." },
    "isolate": { term: "واي معزول", aliases: "ايزوليت، ايزو، isolate", def: "واي بترشيح إضافي، بروتين أعلى ولاكتوز ودهون أقل في الحصة." },
    "iu": { term: "الوحدة الدولية", aliases: "IU، آي يو", def: "وحدة قياس جرعة بعض الفيتامينات مثل د3، ولا تعادل الملغ." },
    "lactose": { term: "اللاكتوز", aliases: "لاكتوز، lactose", def: "سكر الحليب الذي يقل في الايزوليت ويكاد ينعدم في المحلل مائيا." },
    "loading": { term: "مرحلة التحميل", aliases: "لودينغ، loading", def: "أسبوع بجرعة كرياتين أكبر للوصول إلى المخزون الكامل أسرع، وهي اختيارية." },
    "magnesium": { term: "مغنيسيوم", aliases: "مغنيسيوم، جلايسينيت، magnesium glycinate", def: "شكل من المغنيسيوم لطيف على المعدة يؤخذ مساء بجرعة 200 إلى 400 ملغ." },
    "mass_gainer": { term: "مكمل زيادة السعرات", aliases: "ماس جينر، جينر، mass gainer", def: "مسحوق يجمع الكربوهيدرات والبروتين في حصة واحدة عالية السعرات." },
    "micronised": { term: "كرياتين مطحون ناعم", aliases: "ميكرونيزد، micronized", def: "كرياتين مونوهيدرات نفسه بحبيبات أدق ليذوب أسهل." },
    "nutrition_facts": { term: "جدول الحقائق الغذائية", aliases: "نيوترشن فاكتس، الملصق، nutrition facts", def: "الجدول على العبوة الذي يذكر السعرات والبروتين والكربوهيدرات لكل حصة." },
    "omega_3": { term: "أوميغا 3", aliases: "اوميغا، زيت السمك، omega 3", def: "أحماض دهنية أساسية مصدرها زيت السمك، والرقم المهم محتوى EPA و DHA في الحصة." },
    "plant_protein": { term: "بروتين نباتي", aliases: "فيغان بروتين، بلانت بروتين، vegan protein", def: "بروتين من البازلاء أو الأرز أو خلطة منهما لمن يتجنب الحليب." },
    "pre_workout": { term: "مكمل ما قبل التمرين", aliases: "بري وورك اوت، بري ورك، pre workout", def: "خلطة كافيين وسيترولين وبيتا الانين تؤخذ قبل الحصة بنصف ساعة." },
    "probiotic": { term: "بروبيوتيك", aliases: "بروبيوتيك، probiotic", def: "بكتيريا نافعة في كبسولات، والرقمان المهمان عدد السلالات وعدد الوحدات المكونة للمستعمرات." },
    "protein": { term: "بروتين", aliases: "بروتين، protein", def: "غرامات البروتين في الحصة الواحدة، وهو الرقم الذي تقارن به مسحوقا بآخر." },
    "saturated_fat": { term: "دهون مشبعة", aliases: "دهون مشبعة، الدهون المشبعة، saturated fat", def: "الجزء المشبع من دهون الحصة، ويذكر على الملصق في سطر منفصل تحت إجمالي الدهون." },
    "scoop": { term: "المغرفة", aliases: "سكوب، scoop", def: "أداة القياس داخل العبوة، ووزنها يختلف بين المنتجات فراجعه على الملصق." },
    "serving": { term: "الحصة", aliases: "سيرفنغ، serving", def: "الكمية المحددة على الملصق لمرة واحدة، وعدد الحصص هو ما تقارن به العبوات." },
    "sodium": { term: "صوديوم", aliases: "صوديوم، الصوديوم، sodium", def: "ملغرامات الصوديوم في الحصة، وهو رقم الملح على الملصق، ويرتفع في مشروبات الالكتروليت." },
    "stim_free": { term: "خال من المنبهات", aliases: "ستيم فري، stim free", def: "مكمل ما قبل التمرين بلا كافيين، لمن يتدرب مساء أو يتجنب المنبهات." },
    "sugars": { term: "سكريات", aliases: "سكريات، سكر، sugar", def: "غرامات السكر في الحصة، وتشمل السكر المضاف والسكر الموجود أصلا في المكونات." },
    "vitamin_c": { term: "فيتامين سي", aliases: "فيتامين سي، فيتامين ج، vitamin c، ascorbic", def: "ملغرامات فيتامين سي في الحصة، ويذكر معها على الملصق نسبتها من الاحتياج اليومي المرجعي." },
    "vitamin_d3": { term: "فيتامين د3", aliases: "فيتامين د، vitamin d", def: "فيتامين يذوب في الدهون ويؤخذ مع وجبة، بجرعة شائعة 1000 إلى 5000 وحدة دولية." },
    "whey": { term: "بروتين مصل الحليب", aliases: "واي بروتين، واي، whey", def: "بروتين يستخلص من السائل المتبقي بعد صناعة الجبن، سريع الامتصاص وكامل الأحماض الأمينية." },
    "zinc": { term: "زنك", aliases: "زنك، الزنك، zinc", def: "ملغرامات الزنك في الحصة، ويذكر معها على الملصق نسبتها من الاحتياج اليومي المرجعي." },
    "zma": { term: "زد ام ايه", aliases: "ZMA، زي ام ايه", def: "خلطة زنك ومغنيسيوم وفيتامين ب6 تؤخذ قبل النوم." }
  };

  /* ---------------------------------------------------------------------
   * 2. Is the stylesheet already in effect?
   *
   *    The question is asked of the browser, not of the document's markup: a
   *    probe element carrying the stylesheet's own class is measured with
   *    getComputedStyle and thrown away. That answers correctly however the
   *    stylesheet arrived, through the theme's custom CSS box, through a link,
   *    or through an earlier run of this script.
   * ------------------------------------------------------------------- */

  function stylesheetIsApplied() {
    var host = document.body || document.documentElement;
    if (!host) return false;
    var probe = document.createElement('div');
    probe.className = 'ox-skin-probe';
    probe.setAttribute('aria-hidden', 'true');
    host.appendChild(probe);
    var applied = false;
    try {
      var value = window.getComputedStyle(probe).getPropertyValue('--ox-skin');
      applied = String(value).trim() === '1';
    } catch (error) {
      applied = false;
    }
    if (probe.parentNode) probe.parentNode.removeChild(probe);
    return applied;
  }

  /* Injects the fallback copy. Guarded twice: by the window flag at the top of
     the file and by the element id, so a second execution does nothing. */
  function injectStyle() {
    if (stylesheetIsApplied()) return 'already-applied';
    if (document.getElementById(STYLE_ID)) return 'already-injected';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute(MARK, 'stylesheet');
    style.appendChild(document.createTextNode(CSS));
    var host = document.head || document.documentElement;
    if (!host) return 'no-host';
    host.appendChild(style);
    return 'injected-fallback';
  }

  /* ---------------------------------------------------------------------
   * 3. The spec line parser (port of app/components/product/lib/specLine.ts).
   *    No regular expressions: string scanning only.
   * ------------------------------------------------------------------- */

  var PIPE = String.fromCharCode(124);
  var COLON = String.fromCharCode(58);
  var ARABIC_SEMICOLON = String.fromCharCode(0x061b);
  var NOT_APPLICABLE = 'غير منطبق';

  var LABEL_SERVINGS = 'الحصص';
  var LABEL_SERVING_SIZE = 'حجم الحصة';
  var LABEL_EXPIRY = 'الصلاحية';
  var LABEL_FORM = 'الشكل';

  function splitPair(chunk) {
    var at = chunk.indexOf(COLON);
    if (at < 0) at = chunk.indexOf(ARABIC_SEMICOLON);
    if (at < 0) return null;
    var label = chunk.slice(0, at).trim();
    var value = chunk.slice(at + 1).trim();
    if (label.length === 0 || value.length === 0) return null;
    return { label: label, value: value };
  }

  function leadingInteger(value) {
    var digits = '';
    for (var i = 0; i < value.length; i += 1) {
      var code = value.charCodeAt(i);
      if (code < 48 || code > 57) break;
      digits += value.charAt(i);
    }
    if (digits.length === 0) return null;
    var parsed = parseInt(digits, 10);
    return isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function isYearMonth(value) {
    if (value.length !== 7) return false;
    for (var i = 0; i < 7; i += 1) {
      var code = value.charCodeAt(i);
      if (i === 4) {
        if (code !== 45) return false;
        continue;
      }
      if (code < 48 || code > 57) return false;
    }
    return true;
  }

  function parseSpecLineText(line) {
    if (!line) return null;
    var fields = [];
    var chunks = line.split(PIPE);
    for (var i = 0; i < chunks.length; i += 1) {
      var pair = splitPair(chunks[i]);
      if (pair) fields.push(pair);
    }
    if (fields.length === 0) return null;
    function find(label) {
      for (var j = 0; j < fields.length; j += 1) {
        if (fields[j].label === label) return fields[j].value;
      }
      return null;
    }
    var servingsText = find(LABEL_SERVINGS);
    var expiryText = find(LABEL_EXPIRY);
    return {
      servings: servingsText === null ? null : leadingInteger(servingsText),
      servingsText: servingsText,
      servingSize: find(LABEL_SERVING_SIZE),
      expiry: expiryText !== null && isYearMonth(expiryText) ? expiryText : null,
      expiryText: expiryText,
      form: find(LABEL_FORM),
      fields: fields
    };
  }

  function isNotApplicable(value) {
    return typeof value === 'string' && value.trim() === NOT_APPLICABLE;
  }

  /* ---------------------------------------------------------------------
   * 4. The supply arithmetic (port of app/components/product/lib/supply.ts).
   *    It describes the package, never a person.
   * ------------------------------------------------------------------- */

  var MIN_DOSE = 1;
  var MAX_DOSE = 4;

  function clampDose(dose) {
    if (!isFinite(dose)) return MIN_DOSE;
    var whole = Math.floor(dose);
    if (whole < MIN_DOSE) return MIN_DOSE;
    if (whole > MAX_DOSE) return MAX_DOSE;
    return whole;
  }

  function pad(value, size) {
    var out = String(value);
    while (out.length < size) out = '0' + out;
    return out;
  }

  function toIsoDate(date) {
    return pad(date.getFullYear(), 4) + '-' + pad(date.getMonth() + 1, 2) + '-' + pad(date.getDate(), 2);
  }

  function estimateSupply(servings, dose, now) {
    if (typeof servings !== 'number' || !isFinite(servings) || servings <= 0) return null;
    var reference = now || new Date();
    var perDay = clampDose(dose);
    var days = Math.floor(servings / perDay);
    if (days < 1) return null;
    var runOut = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    runOut.setDate(runOut.getDate() + days);
    return { days: days, runOut: toIsoDate(runOut) };
  }

  /* ---------------------------------------------------------------------
   * 5. Small DOM helpers.
   * ------------------------------------------------------------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.appendChild(document.createTextNode(String(text)));
    return node;
  }

  function fill(template, token, value) {
    return template.split('{{' + token + '}}').join(String(value));
  }

  /* ---------------------------------------------------------------------
   * 6. The spec chips and the supply calculator.
   * ------------------------------------------------------------------- */

  function chip(label, value) {
    var node = el('li', 'ox-chip');
    node.appendChild(el('span', 'ox-chip__label', label));
    var val = el('span', 'ox-chip__value', value);
    val.setAttribute('dir', 'auto');
    node.appendChild(val);
    return node;
  }

  function buildChips(spec) {
    var row = el('ul', 'ox-chip-row ox-injected');
    row.setAttribute(MARK, 'spec-chips');
    row.setAttribute('aria-label', T.specsLabel);
    var any = false;
    if (spec.servingsText && !isNotApplicable(spec.servingsText)) {
      row.appendChild(chip(T.servings, spec.servingsText));
      any = true;
    }
    if (spec.servingSize && !isNotApplicable(spec.servingSize)) {
      row.appendChild(chip(T.servingSize, spec.servingSize));
      any = true;
    }
    if (spec.form && !isNotApplicable(spec.form)) {
      row.appendChild(chip(T.form, spec.form));
      any = true;
    }
    if (spec.expiryText && !isNotApplicable(spec.expiryText)) {
      row.appendChild(chip(T.expiry, spec.expiryText));
      any = true;
    }
    return any ? row : null;
  }

  function buildSupply(spec) {
    if (typeof spec.servings !== 'number' || spec.servings <= 0) return null;
    var dose = MIN_DOSE;

    var panel = el('div', 'ox-supply ox-injected');
    panel.setAttribute(MARK, 'supply');

    var title = el('p', 'ox-supply__label', T.supplyTitle);
    panel.appendChild(title);

    var row = el('div', 'ox-supply__row');

    var stepper = el('div', 'ox-supply__stepper');
    var minus = el('button', 'ox-supply__btn', String.fromCharCode(0x2212));
    minus.type = 'button';
    minus.setAttribute('aria-label', T.decrease);
    var value = el('span', 'ox-supply__value ox-num', String(dose));
    value.setAttribute('aria-live', 'off');
    var plus = el('button', 'ox-supply__btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', T.increase);
    stepper.appendChild(minus);
    stepper.appendChild(value);
    stepper.appendChild(plus);

    row.appendChild(stepper);
    row.appendChild(el('span', 'ox-supply__unit', T.servingsPerDay));
    panel.appendChild(row);

    var result = el('p', 'ox-supply__result');
    result.setAttribute('aria-live', 'polite');
    panel.appendChild(result);

    var note = el('p', 'ox-supply__note ox-chip__label', T.supplyNote);
    panel.appendChild(note);

    function render() {
      var estimate = estimateSupply(spec.servings, dose, new Date());
      while (result.firstChild) result.removeChild(result.firstChild);
      if (!estimate) {
        panel.style.display = 'none';
        return;
      }
      panel.style.display = '';
      var days = el('span', 'ox-num', fill(T.resultDays, 'days', estimate.days));
      var runout = el('span', 'ox-num', ' ' + fill(T.resultRunout, 'date', estimate.runOut));
      runout.style.color = 'var(--ox-fg-2)';
      result.appendChild(days);
      result.appendChild(runout);
      value.firstChild.nodeValue = String(dose);
      minus.disabled = dose <= MIN_DOSE;
      plus.disabled = dose >= MAX_DOSE;
    }

    minus.addEventListener('click', function () {
      dose = clampDose(dose - 1);
      render();
    });
    plus.addEventListener('click', function () {
      dose = clampDose(dose + 1);
      render();
    });

    render();
    return panel;
  }

  /* Where the chips and the calculator go: directly above the buy form, which
     is the block that holds the price, the quantity and the add button. */
  function buyZoneAnchor() {
    return (
      document.querySelector('form.product-form') ||
      document.querySelector('.sticky-product-bar') ||
      null
    );
  }

  function renderSpecBlock() {
    if (document.body.className.indexOf('product-single') < 0) return 'skipped';
    var description = document.querySelector('.product__description');
    if (!description) return 'no-description';
    var paragraph = description.querySelector('p');
    if (!paragraph) return 'no-paragraph';
    var spec = parseSpecLineText(paragraph.textContent ? paragraph.textContent.trim() : '');
    if (!spec) return 'not-a-spec-line';

    var anchor = buyZoneAnchor();
    if (!anchor || !anchor.parentNode) return 'no-anchor';
    if (document.querySelector('[' + MARK + '="spec-chips"]')) return 'already-rendered';

    var host = el('div', 'ox-injected');
    host.setAttribute(MARK, 'spec-block');
    var chips = buildChips(spec);
    if (chips) host.appendChild(chips);
    var supply = buildSupply(spec);
    if (supply) host.appendChild(supply);
    if (!host.firstChild) return 'nothing-to-render';

    anchor.parentNode.insertBefore(host, anchor);

    /* The original paragraph stays in the document and stops being painted, so
       nothing is lost if this script is removed or fails on the next load. */
    paragraph.classList.add('ox-source-hidden');
    return 'rendered';
  }

  /* ---------------------------------------------------------------------
   * 7. The nutrition table: the third column and the narrow-screen scroller.
   * ------------------------------------------------------------------- */

  var ARABIC_COMMA = String.fromCharCode(0x060c);

  function normaliseTerm(input) {
    return String(input).trim().toLowerCase().split(/\s+/).join(' ');
  }

  function glossaryForLabel(label) {
    var needle = normaliseTerm(label);
    if (needle.length === 0) return null;
    var best = null;
    for (var id in GLOSSARY) {
      if (!Object.prototype.hasOwnProperty.call(GLOSSARY, id)) continue;
      var aliases = GLOSSARY[id].aliases;
      if (!aliases) continue;
      var parts = aliases.split(ARABIC_COMMA);
      var flatParts = [];
      for (var p = 0; p < parts.length; p += 1) {
        var inner = parts[p].split(',');
        for (var q = 0; q < inner.length; q += 1) flatParts.push(inner[q]);
      }
      for (var a = 0; a < flatParts.length; a += 1) {
        var alias = normaliseTerm(flatParts[a]);
        if (alias.length === 0) continue;
        /* An alias of one or two characters only counts as an exact match. The
           two-letter Latin aliases (iu) otherwise turn up inside longer words
           such as potassium, magnesium and calcium and claim a row that is not
           theirs. Longest alias still wins among the rest. */
        var exact = needle === alias;
        if (!exact && (alias.length < 3 || needle.indexOf(alias) < 0)) continue;
        if (!best || alias.length > best.length) best = { entry: GLOSSARY[id], length: alias.length };
      }
    }
    return best ? best.entry : null;
  }

  function enhanceNutritionTable() {
    if (document.body.className.indexOf('product-single') < 0) return 'skipped';
    var description = document.querySelector('.product__description');
    if (!description) return 'no-description';
    var table = description.querySelector('table');
    if (!table) return 'no-table';
    if (table.getAttribute(MARK) === 'nutrition') return 'already-enhanced';
    table.setAttribute(MARK, 'nutrition');

    var rows = table.querySelectorAll('tr');
    if (!rows.length) return 'no-rows';

    var added = 0;
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var cells = row.children;
      if (!cells.length) continue;
      var allHeader = true;
      for (var c = 0; c < cells.length; c += 1) {
        if (cells[c].tagName !== 'TH') { allHeader = false; break; }
      }

      if (i === 0 && allHeader) {
        /* The label's own header row gains the third heading and the first two
           are relabelled to the wording the theme uses. */
        if (cells[0]) cells[0].textContent = T.nutritionNutrient;
        if (cells[1]) cells[1].textContent = T.nutritionPerServing;
        var head = document.createElement('th');
        head.setAttribute('scope', 'col');
        head.className = 'ox-table__meaning';
        head.appendChild(document.createTextNode(T.nutritionMeaning));
        row.appendChild(head);
        added += 1;
        continue;
      }

      var name = cells[0] && cells[0].textContent ? cells[0].textContent.trim() : '';
      var cell = document.createElement('td');
      cell.className = 'ox-table__meaning';
      var entry = name ? glossaryForLabel(name) : null;
      /* A nutrient the glossary does not cover keeps an empty cell. Nothing
         is ever invented to fill it. */
      if (entry && entry.def) cell.appendChild(document.createTextNode(entry.def));
      row.appendChild(cell);
      added += 1;
    }

    /* If the table had no header row, give it one so the third column is
       announced rather than appearing as an unlabelled cell. */
    var firstRow = rows[0];
    var hasHeader = false;
    if (firstRow) {
      for (var h = 0; h < firstRow.children.length; h += 1) {
        if (firstRow.children[h].tagName === 'TH') { hasHeader = true; break; }
      }
    }
    if (!hasHeader) {
      var thead = document.createElement('thead');
      var hr = document.createElement('tr');
      var titles = [T.nutritionNutrient, T.nutritionPerServing, T.nutritionMeaning];
      for (var t = 0; t < titles.length; t += 1) {
        var th = document.createElement('th');
        th.setAttribute('scope', 'col');
        if (t === 2) th.className = 'ox-table__meaning';
        th.appendChild(document.createTextNode(titles[t]));
        hr.appendChild(th);
      }
      thead.appendChild(hr);
      table.insertBefore(thead, table.firstChild);
    }

    /* The scroller. The wrapper is what scrolls; the first column is pinned by
       the stylesheet, so a narrow screen never loses the nutrient name. */
    if (!table.parentNode || !table.parentNode.classList || !table.parentNode.classList.contains('ox-table-wrap')) {
      var wrap = el('div', 'ox-table-wrap ox-injected');
      wrap.setAttribute(MARK, 'nutrition-scroller');
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', T.nutritionMeaning);
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);

      var note = el('p', 'ox-table__note ox-chip__label', T.labelDataNote);
      note.style.fontSize = 'var(--ox-t-small)';
      note.style.marginBlock = 'var(--ox-2) var(--ox-4)';
      if (wrap.parentNode) wrap.parentNode.insertBefore(note, wrap.nextSibling);
    }

    return 'enhanced:' + added;
  }

  /* ---------------------------------------------------------------------
   * 8. Run. Each feature is isolated: one throwing must not stop the others.
   * ------------------------------------------------------------------- */

  function record(name, value) {
    window.__optimalxRaedSkin.features[name] = value;
  }

  try {
    record('style', injectStyle());
    window.__optimalxRaedSkin.injected = true;
  } catch (error) {
    record('style', 'failed: ' + (error && error.message));
  }

  function runPageFeatures() {
    try {
      record('specBlock', renderSpecBlock());
    } catch (error) {
      record('specBlock', 'failed: ' + (error && error.message));
    }
    try {
      record('nutrition', enhanceNutritionTable());
    } catch (error) {
      record('nutrition', 'failed: ' + (error && error.message));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPageFeatures, { once: true });
  } else {
    runPageFeatures();
  }
})();
