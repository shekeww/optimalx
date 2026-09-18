# Brief B6: commerce theming (cart, thank-you, blog, brands, policies, account, toasts and modals)

You are a Fable implementation agent of the mastermind team. Execute batch **B6** of the OptimalX Salla React theme in `C:\Users\Ahmed\OneDrive\Desktop\optimalx`. Two other builders (B2 home; B5 pages) work concurrently in the same tree; touch only the files B6 owns (PLAN-final B6 section; `app/router.tsx` is yours in this wave only for the C10 stretch). Checkout, cart logic and search stay Salla's: you wrap and style, you never reimplement.

## Read first (scratchpad: C:\Users\Ahmed\AppData\Local\Temp\claude\c--Users-Ahmed-OneDrive-Desktop-optimalx\ff691bcb-344e-4a12-98cc-98d989eacf7d\scratchpad\)
1. `builder-preamble.md`.
2. `PLAN-final.md`: section 2 (protocol; your locale blocks are `ox.cart.*`, `ox.account.*`, `ox.empty.*`, `ox.thankyou.*`, `ox.blog.*` in `locales/partials/b6.ar.json` and `b6.en.json`), corrections C5, C10, C11, C12, the **B6** section and 5.1 claims gates.
3. `DIRECTION.md` 2 to 4, 5.3 (card, placed only), 5.5, 5.6 (modal, drawer, toast, empty states), 6.9 (cart), 6.10 (thank-you), 6.13 (guides index and article), 6.14 (brands), 6.18, 7.1 rows for toast, modal, drawer, checkout bar, 7.3 (view transitions, stretch), A7.
4. `research/FINAL-content.md` sections 6.3 (policy intros), 6.4 (thank-you "how to start" lines by category), 6.5 (empty states: cart, wishlist, orders, notifications), 7 (guides index wording, article disclaimer), 9 (exact key values).
5. `engine-surface.md` 1.1 (cart hook slots and their context), 3 (route loaders and components for cart, thank-you, blog, brands, page single), 5 (`useCartContext`, `useWishlist`), 8.3, 9.2 (SallaPayments, SallaCartSummary classes, AddProductToast), 12 (engine locale keys you may reuse), 15.5; the engine sources `dist/routes/cart.js`, `thank-you.js`, `blog.js`, `blog-single.js`, `brands.js`, `page-single.js`.
6. Wave 0 and 1 output: `app/components/common/`, `app/components/blocks/` (GuideCard, OxNewsletter, ProductsSliderWrapper), `app/content/{thankyou,categories}.ts`, B3's card and `data-ox-product` attribute, B1's body class conventions (`ox-sticky-bar` hides the tab bar).
7. Reference images (Read tool) in `references/`: `account.png` (account area feel), `mockup.jpeg` (bottom tab bar coexisting with a fixed action bar), `faq.png`. DIRECTION.md decides tokens and structure.

## Claims gates (binding)
The VAT-inclusive note only when `vat_number` is set; the free-shipping bar interpolates `free_shipping_threshold` (engine `free_shipping_bar` wins when present); payment marks only through `SallaPayments`; no reply promise; thank-you lines come from `content/thankyou.ts` only.

## Verification
`pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:all`, `pnpm check:jsonld` with your `b6-*` article fixture; browser check with chrome-devtools if `pnpm preview` runs: `/ar/cart` empty and with two items (add from a PDP first) at 390 and 1440, checkout bar fixed at 390 with the tab bar hidden, `/ar/brands`, `/ar/blog`, a policy page, `/ar/account/wishlist` logged out (login modal styled), no console errors from theme code. If the C10 stretch costs layout in the probe, remove it and say so. Append progress to `scratchpad/B6-progress.md` per route. Write files with the Write tool; no em-dashes; no `pnpm install`; no git index changes. Return only the delegation JSON envelope from the preamble.
