# Optimal X Icons v1.0 — integration guide (for Claude Code)

47 icons · 24×24 grid · 2px stroke · square caps / miter joins · one accent element max per icon.
Icon body = `currentColor`. Accent = CSS variable `--ox-accent` (default `#FF4A1A`). Never hard-code colours into markup.

## Icons
- **Product Categories**: `protein`, `creatine`, `pre-workout`, `amino-acids`, `omega-3`, `vitamins-minerals`, `collagen-beauty`, `daily-health`, `snacks-bars`, `accessories`
- **Goals & Benefits**: `goal-energy`, `goal-performance`, `goal-recovery`, `goal-ideal-weight`, `goal-general-health`, `goal-hair-skin`, `endurance`, `immunity`, `wellness`, `better-sleep`
- **Shop & UX**: `cart`, `wishlist`, `user`, `search`, `menu`, `home`, `store`, `branch-visit`, `help`, `written-question`, `video-consult`, `offers`, `gift`, `points`
- **Service & Trust**: `shipping`, `secure-payment`, `authentic`, `expiry`, `training`, `servings`, `serving-size`, `plan`, `digital-library`, `phone`, `mail`, `map-pin`, `lock`

## Files
| Path | Use |
|---|---|
| `svg/*.svg` | Source of truth. One file per icon. |
| `sprite.svg` | `<symbol id="ox-{name}">` sprite for `<use href="#ox-cart">`. |
| `icons.json` | Manifest (name, category, hasAccent, rtlFlip). |
| `ox-icons.css` | Accent var, mono modifier, size classes, RTL flips. |
| `ox-icon.js` | `<ox-icon>` web component — works in any theme / JS-rendered UI. |
| `shopify/snippets/ox-icon.liquid` + `shopify/assets/ox-icons.css` | Shopify (Online Store 2.0). |
| `salla/src/views/pages/partials/ox-icon.twig` + `salla/src/assets/styles/ox-icons.css` | Salla Twilight. |

## Shopify
1. Copy `shopify/snippets/ox-icon.liquid` → theme `snippets/`, `shopify/assets/ox-icons.css` → theme `assets/`.
2. In `layout/theme.liquid` `<head>`: `{{ 'ox-icons.css' | asset_url | stylesheet_tag }}`
3. Use: `{% render 'ox-icon', name: 'cart', size: 20 %}`
   Params: `name` (required), `size` (24), `class`, `label` (omit → aria-hidden), `mono` (true → accent follows text colour).
4. Replace theme icons (e.g. Dawn `{% render 'icon-cart' %}`) with the ox equivalent; keep the wrapping element's classes.

## Salla (Twilight)
1. Copy `salla/src/views/pages/partials/ox-icon.twig` → theme `src/views/pages/partials/`.
2. Copy `salla/src/assets/styles/ox-icons.css` → `src/assets/styles/` and import it in the main stylesheet (`@import './ox-icons.css';`).
3. Use: `{% include 'pages.partials.ox-icon' with { name: 'cart', size: 20 } %}`
   Same params as Shopify. If the theme's partial path differs, keep the file name and adjust the include path.
4. Salla stores are RTL-first: `cart`, `shipping`, `written-question` auto-mirror under `[dir="rtl"]`. Nothing else flips.
5. Salla web components (`salla-*`) accept slotted icons — pass the include inside the slot.

## Web component (either platform, JS-rendered markup)
Load `ox-icon.js` once (Shopify: `assets/` + `<script src="{{ 'ox-icon.js' | asset_url }}" defer></script>`; Salla: `src/assets/js/` and import from the entry file).
`<ox-icon name="search" size="20" label="Search"></ox-icon>`

## Theming rules
- Icon colour: set `color` on the icon or parent.
- Accent: `--ox-accent` on any ancestor (e.g. `.footer{--ox-accent:#fff}`). Mono: add `ox-icon--mono`.
- On dark backgrounds use a light `color`; the accent stays the same.
- Sizes: 16 / 20 / 24 / 32 / 36 only. 16–20 for inline/UI chrome, 24 default, 32–36 for category tiles & feature rows.
- Buttons with icon only: pass `label`, keep a 44×44 min hit area on the button, not the icon.
- Don't edit SVG paths per-theme. Change `svg/` and regenerate the snippet/twig/js so all outputs match.
