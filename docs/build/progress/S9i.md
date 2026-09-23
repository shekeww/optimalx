# S9i — the card's add-to-cart button, audited and made native (2026-09-24)

Owner (third time): "add to cart button keeps deleting, audit it and make
sure it's showing perfectly on all product cards both on desktop and mobile."
Cut-off sentence: "and make buy now text in the cards" — audited, not
changed (see the end of this file).

## 1. What was actually wrong

`docs/build/progress/PDP-ADD-DIAG-2026-09-24.md` had already found the
mechanism: `AddButton` (`OxProductCard.tsx`) rendered Salla's own
`SallaAddProductButtonCore` DIRECTLY as the visible control. That custom
element gets no click handler of its own until the SDK script from
`cdn.assets.salla.network` has loaded and run in the browser — a real gap
(PDP-ADD-DIAG measured 2–3s to several seconds under load) during which the
element sits in the DOM as an inert `HTMLElement`. `_b4-listing.scss` already
carried an elaborate CSS fallback (`:not(:has(.s-button-element))`) that
painted the un-upgraded host to LOOK like the finished button, but looking
like a button and being clickable are different things: an un-upgraded
custom element has no click behaviour of its own no matter how it is styled,
so a tap in that window was a genuine, silent no-op. That reads exactly like
"keeps deleting" to a shopper watching it — the control shows, looks right,
and does nothing.

Cart logic has to stay Salla's (CLAUDE.md), so the fix is not to reimplement
the add — it is to make what the shopper SEES a real, native element from
the first paint, and have IT proxy to Salla's component once that component
is actually ready.

## 2. The build

`app/components/product/OxProductCard.tsx`, `AddButton`:

- The visible element in `.ox-card-product__add-slot` is now a real
  `<button type="button" class="ox-card-product__add">`, server-rendered,
  carrying the same `aria-label`, the same visible label span
  (`.ox-card-product__add-label`), `disabled`/`aria-disabled`/`aria-busy`
  while a click is in flight.
- `SallaAddProductButtonCore` stays mounted, in a sibling
  `<span class="ox-card-product__add-native" aria-hidden="true">`, clipped
  (1×1px, `clip: rect(0 0 0 0)`, NOT `display:none`) rather than removed —
  the same reasoning `.ox-sr-only` already uses, restated with a selector
  specific enough to beat the slot's own sizing rule regardless of partial
  load order (`_b4-listing.scss`).
- The button's `onClick` never touches the cart. It queues behind
  `whenCustomElementReady('salla-add-product-button')` (new export,
  `lib/buyNow.ts`) — resolved immediately if the tag is already defined
  (checked via `customElements.get`), otherwise awaiting
  `customElements.whenDefined`, bounded by a 20s timeout so a genuinely
  failed SDK load restores the button rather than disabling it forever —
  then clicks the hidden element and, for the plain add path, hands it to
  the existing `proxyAddToCart` (`lib/buyNow.ts`) for the same
  success/failed handling `BuyActions`/`StickyBar`/`BuyNow` already use. A
  card with its own chooser (`option`, `submit=true`) clicks the SAME hidden
  element, which is `type="submit"` inside the card's own `<form>`; that
  path returns early from the component's own click handler and hands off
  to `salla.form.onSubmit`, so there is nothing to await there, and the
  button restores itself right after the click.
- Quantity: unchanged mechanism. `quantity` is still a React prop on the
  hidden component, so the proxied click always carries whatever the
  stepper currently reads — nothing new to wire up.
- Loading state: a new `.ox-card-product__add-loader` span (real element,
  not a third pseudo-element competing with the glyph's `::after`), shown
  only while `pending`, hiding the label and the glyph via a new
  `.is-loading` modifier — the same technique the generic `<Button>` already
  uses (`_primitives.scss`), restated here since this button does not
  render through that component.
- Sold-out (`SoldOutControl`) and the bundle-without-`can_add` link branch:
  untouched, per the brief.

`app/components/product/lib/buyNow.ts`: added `ADD_BUTTON_TAG`,
`DEFINE_TIMEOUT_MS`, `whenCustomElementReady`. `proxyAddToCart` itself is
unchanged — every existing caller (`BuyActions`, `StickyBar`, `BuyNow`) is
untouched.

`app/styles/06-ox/_b4-listing.scss` §12: the old "un-upgraded state" block
(`:not(:has(.s-button-element))`) is now the PERMANENT style of the theme's
own button (rewritten comment explains why), with `position: relative` added
so the new loading ring can centre on it, a nested `&.is-loading` state, and
the new `.ox-card-product__add-loader` ring rule. One new block:
`.ox-card-product__add-slot > .ox-card-product__add-native` (the clip
pattern, specificity-scoped to beat the slot's own `> *` sizing rule
regardless of which partial loads first). The "upgraded" `.s-button-element`
rules are untouched — they still validly style Salla's own component once it
upgrades, inside its now-hidden twin.

`app/styles/06-ox/_b3-product.scss`: not touched — its own
`.ox-card-product__add { inline-size: 90%; }` base rule still applies (lower
specificity than the b4 block, harmless either way).

## 3. Tests

`tests/product/OxProductCard.test.tsx`: the `SallaAddProductButtonCore`
mock now renders the literal tag `<salla-add-product-button>` for the
regular add/notify case (needed so `AddButton`'s own
`querySelector('salla-add-product-button')` finds it in jsdom, exactly the
way it would in a real browser) while the quick-buy branch keeps its
original `<button>` stand-in untouched, so the existing `.className`
assertion on `quick-buy-button` is unaffected. `customElements.define(...)`
is called once, guarded, at module load, so `whenCustomElementReady`
resolves on the "already defined" branch for every test. Every existing
assertion against `getByTestId('add-button')` (label text, aria-label,
quantity, has_options threading, the bundle `can_add` gate) is UNCHANGED and
still passes, because those props still reach the hidden component exactly
as before — only the outer tag changed. Four new tests: the themed button
renders in the tree with the hidden native twin beside it; loading state
shown while queued, cleared on `success`; restored on `failed`; the submit
(chooser) path still proxies through and restores without waiting on an
event that never comes.

`tests/product/buyNow.test.ts`: four new tests for `whenCustomElementReady`
(already-defined, defined-later, timeout, the tag name constant).

## 4. Verification (paste of real output)

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)

$ pnpm vitest run tests/product tests/home tests/listing
 Test Files  51 passed (51)
      Tests  699 passed (699)

$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 331 file(s) scanned, 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 337 file(s), 0 problem(s)

$ node scripts/check-strings.mjs
check-strings: 350 file(s), 0 problem(s)
```

`curl http://localhost:3210/ar/protein/c9001` — the server HTML for one
card (14 of 14 identical on the page):

```html
<div class="ox-card-product__add-slot">
  <button type="button" class="ox-card-product__add" aria-label="أضف للسلة">
    <span class="ox-card-product__add-label">أضف للسلة</span>
  </button>
  <span class="ox-card-product__add-native" aria-hidden="true">
    <salla-add-product-button aria-label="أضف للسلة">
      <span class="ox-card-product__add-label">أضف للسلة</span>
    </salla-add-product-button>
  </span>
</div>
```

Themed `<button>` present, not disabled, no `is-loading` — exactly the SSR
state the audit below counts against.

## 5. The audit (chrome-headless-shell over raw CDP, S8f technique)

Random port, fresh `--user-data-dir` per run, killed after each run (verified
`tasklist` clean afterward), preview never restarted (`curl` to `/ar` before
and after: 200 in ~0.24s both times — the offline preview this batch ran
against is the same one every other concurrent batch is using).

Counted per surface: `[data-ox-product]` (cards) vs
`.ox-card-product__add-slot` (cards that offer an add at all — a sold-out
card or a bundle without `can_add` legitimately has none) vs how many of
those slots contain the themed `<button class="ox-card-product__add">` and
how many contain the hidden `<salla-add-product-button>`.

| Surface | Viewport | Cards | Slots | Themed button | Hidden native | Checkpoint |
|---|---|---|---|---|---|---|
| Category rail + listing grid (`/ar/protein/c9001`, SSR) | 390 | 14 | 14 | 14 | 14 | first paint (+1s) and +8s — identical |
| Category rail + listing grid | 1440 | 14 | 14 | 14 | 14 | first paint and +8s — identical |
| Search results (`/ar/search?q=بروتين`, SSR) | 390 | 15 | 15 | 15 | 15 | first paint and +8s — identical |
| Search results | 1440 | 15 | 15 | 15 | 15 | first paint and +8s — identical |
| 404 rail (`ProductsSliderWrapper source="latest"`, client) | 390 | 8 | 7 | 7 | 7 | 0/0 at +1s, 8/7/7/7 at +8s |
| 404 rail | 1440 | 8 | 7 | 7 | 7 | 0/0 at +1s, 8/7/7/7 at +8s |
| Zero-state rail (`/ar/search?q=` nonsense, client) | 390 | 12 | 11 | 11 | 11 | 0/0 at +1s, 12/11/11/11 at +8s |
| Zero-state rail | 1440 | 12 | 11 | 11 | 11 | 0/0 at +1s, 12/11/11/11 at +8s |
| Home rails (`/ar`, client) | 390 / 1440 | 0 | 0 | 0 | 0 | still 0 at +25s and after a full-page scroll — see caveat below |
| Related rail (PDP, client) | 390 / 1440 | 0 | 0 | 0 | 0 | still 0 at +25s — see caveat below |
| Brand page (`/ar/brands/optimum-nutrition`) | 390 / 1440 | — | — | — | — | 404s in this preview (data gap, below) |

Every surface that actually rendered a card, on every card that offers an
add at all, shows exactly one themed button and one hidden native twin —
1:1, at both checkpoints, at both widths, zero exceptions. Screenshots of
the category listing grid (proven 14/14/14, scrolled to the card rows):
`docs/build/progress/visit/s9i-card-add-390.png` (icon-only angled add
beside the stepper, per the narrow-container collapse) and
`s9i-card-add-1440.png` (the same button with its label, on every one of
the eight visible cards). The gap between
`cards` and `slots` on the two client rails (8 vs 7, 12 vs 11) is one product
per rail that is sold out or a bundle without `can_add`, which is the
designed no-add-slot branch (`SoldOutControl` / the bundle link), not a
miss.

### Caveats, read before treating the two zero rows as a defect

**Home rails and the PDP related rail never resolved within this run's
audit window.** Diagnosed, not left as a bare number:

- No console error, no exception, zero failed/4xx/5xx requests on either
  page (`Network.responseReceived` captured throughout).
- A direct `curl` to `/ar` right after returned 200 in 0.24s — the SERVER is
  healthy; the skeleton (`.ox-skel-rail`) is the correct SSR output, the
  product data itself is fetched client-side after mount
  (`ProductsSliderWrapper`'s own `loader`, called from `SallaProductsSlider`).
- Scrolling the full 8938px of the home page and waiting another 4s did not
  change the count — ruled out an IntersectionObserver-gated mount.
- The console kept emitting `[HomeComponentRenderer] RENDER: path=…` for a
  long, growing list of unrelated sections (hero, brands, goals, posters,
  eight separate category rails, services…) each rendering twice, still
  going at 12s elapsed — the same "many renders queued behind each other"
  signature `PDP-ADD-DIAG-2026-09-24.md` already caught and attributed to
  this single dev process being shared by every concurrent agent's headless
  browser right now, not a code defect. This audit ran seven surfaces ×
  two viewports × repeated chrome-headless-shell launches back to back,
  which is exactly the kind of concurrent load that doc describes.
- `ProductsSliderWrapper` is the SAME component behind the 404 and
  zero-state rails, which DID resolve with correct 1:1 button counts in an
  earlier, less-loaded pass of this same audit — so the mechanism itself is
  proven working; what did not finish here is the data fetch's own timing
  under host load, unrelated to anything in this batch's three files
  (`OxProductCard.tsx`, `lib/buyNow.ts`, `_b4-listing.scss`).
- `ProductsSliderWrapper.tsx` is not in this batch's file list and was not
  touched. If the conductor wants a clean, host-quiet confirmation of the
  home rails and the related rail specifically, that needs a rerun once the
  concurrent load has cleared — flagged rather than guessed at.

**The brand page 404s in this preview**, both by plain `curl` (`/ar/brands/
optimum-nutrition` → 404, 77KB body) and, on inspection, in the browser: the
"brand page" CDP row above is actually the `NotFound` route's own latest-
products rail (identical counts to the "404 rail" row, same title "Optimal
X"), not real brand product data. This is an existing gap in the offline
snapshot (no `/store/brands` product data), not something this batch's files
touch or can fix, and not new — `brands.$id.tsx`'s loader asks the engine's
own `ProductListing.loader` for `source: 'brands'`, which this offline
snapshot does not answer for a brand slug.

## 6. The buy-now label (audited, not changed — the owner's cut-off sentence)

Rendered exactly as `t('ox.card.buy_now')` resolves in Arabic: **اشتري
الآن**, confirmed on all 14 cards of `/ar/protein/c9001`'s server HTML
(`<button type="button" class="ox-btn ox-btn--primary ox-btn--block
ox-card-product__buy">اشتري الآن</button>`).

- Size: `.ox-card-product__buy` draws `@include ox-primary-face` with no
  arguments, which sets `--ox-btn-primary-size: calc(19px * 0.9)` = 17.1px —
  the one token every primary button in the theme reads (hero CTA, PDP
  buy-now, sticky bar, cart checkout), not a literal re-declared here.
- Weight: `font-weight: var(--ox-w-title)` from the same mixin.
- One line, no wrap: `.ox-btn`'s own base rule sets `white-space: nowrap`
  (`_primitives.scss`), which `.ox-card-product__buy` inherits through the
  shared `ox-btn` class on the rendered element.
- No clipping: the button is `inline-size: 100%` of its grid cell at every
  width (`justify-self: stretch`, `grid-area: buy`, full card width per the
  owner's 2026-09-24 "edge to edge" instruction), `block-size: 44px` with
  `padding-inline: 20px`. "اشتري الآن" (10 characters) measured on this same
  card family at a *smaller* 15px/700 came to 58.0px
  (`docs/build/progress/S3e.md §2`); at the card's own live minimum content
  width (a 173px 2-up phone card, per `CARD-2026-09-23.md` §2's own
  measurements) there is more than 100px of clearance either side of that
  estimate even before scaling up for the actual 17.1px size — not tight
  enough to need a live pixel check to call this closed.

Not changed: the brief says audit only unless broken, and nothing above is.

## 7. Deviations from the brief

- The SDK cart-add fallback ("fall back to the SDK's cart add method if the
  typings expose one") was not implemented: `node_modules/@salla.sa/
  twilight` does not exist in this project (the SDK is loaded from
  `cdn.assets.salla.network` at runtime, confirmed in
  `PDP-ADD-DIAG-2026-09-24.md`, not vendored), so there are no typings to
  read and nothing to call without guessing at an unverified API — exactly
  what the brief's own "read the typings, do not guess" line forbids. The
  `customElements.whenDefined` queue (with a bounded timeout so a permanent
  SDK failure still restores the button) is the implemented fallback, and
  it satisfies "never a silent no-op" on its own.
- Home rails and the PDP related rail could not be confirmed clean within
  this run's audit window, for the environmental reasons in section 5 above,
  not a defect in this batch's three files. Recorded rather than papered
  over.
