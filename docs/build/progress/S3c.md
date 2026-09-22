# S3c designer handback (2026-09-23)

The two specs were written to docs/build/NAV-2026-09-23.md and docs/build/CARD-2026-09-23.md by the conductor from the designer's raw return (the designer role has no Write tool).


**The `Write` tool is disabled session-wide** ("No such tool available: Write. Write is disabled for this session, in subagents as well as here"), so `docs/build/NAV-2026-09-23.md` and `docs/build/CARD-2026-09-23.md` could not be created. Both documents are below in full, ready to be written verbatim to those two paths by whoever holds write permission. The repo was otherwise read-only, as briefed; no git command was run that changes anything, and no server was started.

Two corrections to the brief, both verified against the tree: `app/content/taxonomy.json` holds **10** type roots, not 8 (plus 5 protein children, 4 utility, 6 goals); and `claims.ts` lives at `app/components/product/lib/claims.ts`, not `app/components/commerce/claims.ts`.

Measured live at `http://localhost:3210/ar`, `/ar/categories`, `/ar/protein/c9001` and `/ar/p/p1945829739` at 1440 and 390 with chrome-devtools. The compositor probe was not run in full; every render-budget line below is either measured in Chromium or asserted from source and marked as such.

Nine findings worth the conductor's attention before the builder starts:

1. `MegaPanel.tsx:46` traps focus on a hover-opened non-modal popover. Keyboard visitors cannot Tab past it. (a11y, blocker)
2. `.ox-card-product__buy` (`_b4-listing.scss:1607`) carries `margin-inline: 8px` without the matching `inline-size: calc(100% - 16px)` its own `--native` twin has at `:1678`. Measured: the CTA overhangs the card's content box by 8px on the inline end at both 390 and 1440.
3. The card carries **two** angled primitives (`ox-angled(40px)` on the add button at `:1447`, `ox-angled(44px)` on the buy button at `:1636`). X-IDENTITY §3.3 forbids it, and §2.4's `run / 0.24` floor (123.75px) independently disqualifies the parallelogram on a 77px mobile CTA.
4. The plate is not 1:1. Measured 137.6 x 132 at 390 and 272.4 x 184 at 1440 against a square image: a 24% crop of every product photo in the desktop grid.
5. The hover second image is always in the DOM at `opacity: 0`, so a phone fetches and decodes two images per card: about 2.88 MB on the first viewport against DIRECTION 10.4's 1.4 MB listing line.
6. `.ox-card-product:hover { transform: translateY(-2px) }` (`_b3-product.scss:39`) violates BUILD 3.4 and DIRECTION 5's card default.
7. `.ox-util__trust--scroller` is a horizontal scroller with computed `position: static` (measured). DIRECTION 10.1's G2 scroller rule.
8. White on `--ox-accent` measures **3.59:1**. The live `--ox-on-accent` is `#FFFFFF`; DIRECTION 2.2 mandates ink (`#12171E` on `#F54915` measures **5.01:1**). The theme is currently legal only through the 19px large-text exemption, which the mobile card cannot afford.
9. `BottomTabBar.tsx:91` matches routes with `path.includes()`, so `/cart` lights inside `/account/cart-anything`, and three different link-resolution shapes ship in one nav row (locale-prefixed path, unprefixed path, absolute origin).

---
---
