# The OptimalX skin for the live store

Written for: the store owner, pasting two blocks of code into the Salla design customizer.

These two files put the OptimalX design on optimalx.com.sa while the store still runs Salla's Raed theme. They are a stopgap. When the OptimalX React theme passes Salla review and you publish it, delete both and the theme carries its own design.

## What to paste, and where

Open the design customizer at `s.salla.sa/design/277388345?version_id=499745075` and find the custom code section you enabled.

| Box | File | Size |
|---|---|---|
| Custom CSS | `optimalx-raed.css` | 52,886 characters |
| Custom JavaScript | `optimalx-raed.min.js` | 59,233 characters |

Both sit under Salla's 65,535 character limit. Paste the whole of each file, save, then open the store in a private window so you are not seeing a cached page.

Paste `optimalx-raed.min.js`, not `optimalx-raed.js`. The unminified file is the readable source, kept so the code can be understood and changed later; it is too large for the box.

## What each file does

The stylesheet restyles Raed's own markup with the OptimalX tokens: the paper ground, white cards, the plate behind product imagery, graphite bands with a single angled wedge, orange kept for interaction only, Cairo at the design's type scale, the three shadows and the two radii. It touches the product card, the product page, buttons and form controls, the home blocks, the header, the footer, the listing grid and the cart.

The script adds the three things Raed has no concept of, and only on a product page:

1. The spec chips, read from the first line of each product description: servings, serving size, form and expiry.
2. The supply calculator, which turns servings and a daily dose into how many days the tub lasts and roughly when it runs out.
3. The nutrition table's third column, which says in plain Arabic what each number on the label means.

Every feature is wrapped so that a failure in one cannot affect the others or the page. If the script does not run at all, the page is simply Raed with the OptimalX styling.

## Verified before delivery

Both files were injected into the live pages in a browser and checked at 1440 and 390 pixels wide, in Arabic:

| Page | Desktop | Phone |
|---|---|---|
| Home | pass | pass |
| Product | pass | pass |
| Search results | pass | pass |
| Cart | pass | pass |

On every page: no horizontal scrolling at phone width, exactly one main heading, and no console errors from this code. The only console errors on the store are Salla's own Apple Pay manifest warnings, which predate this and are unrelated.

The before and after screenshots are in `docs/screenshots`, named `skin-*`.

## What will break this, and what to watch

The stylesheet targets Raed's class names, and those are not a promise Salla makes. A Raed update can rename or restructure something and a rule stops applying. Nothing will break the store, it will just look less finished in that one place. The names most likely to churn are the product card internals (`s-product-card-*`), the buy zone (`sticky-product-bar`, `s-add-product-button-*`) and the home block modifiers (`s-block--*`).

The script depends on one thing in your data: every product description starting with the line `الحصص: N | حجم الحصة: X | الصلاحية: YYYY-MM | الشكل: ...`. Keep that convention when you import your real product sheet and the chips and the calculator keep working. Drop it and they simply do not render, which is safe.
