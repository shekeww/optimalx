# PDP-ADD-DIAG-2026-09-24, "add to cart button and quantity keep deleting" on the product page

Owner report: the add-to-cart button and the quantity control disappear on
the product page. Diagnosing against the offline preview at
`http://localhost:3210` (already running; not restarted or stopped for this
diagnosis) with the snapshot API on `http://127.0.0.1:5178`.

## Source read, before touching a browser

- `app/components/product/BuyZone/BuyForm.tsx` renders the engine's own
  `AddToCartForm` (from `@salla.sa/twilight-theme-engine/product`) inside
  `.ox-buy`. Nothing in the theme controls what that component renders
  internally, it is one opaque export from the pre-bundled engine.
- `app/components/product/OxProductCard.tsx` (`AddButton`, `BuyNow`,
  `SoldOutControl`) explicitly avoids the engine's deferred web-component
  wrappers and imports `SallaAddProductButtonCore` directly, with this comment
  on record (lines ~763-782 as read):

  > "CORE, NOT THE DEFERRED EXPORT, and this is what made the button vanish.
  > `SallaAddProductButton` is wrapped in the package's `HydrationBoundary`: it
  > renders a `s-skeleton-button` placeholder and only mounts the real custom
  > element once an IntersectionObserver fires. Measured on the home grid:
  > four cards scrolled fully into view, `readyState` complete, and the slot
  > still held the skeleton, zero `salla-add-product-button` hosts and zero
  > `.s-button-element` on the page."

  i.e. this exact defect was already found and fixed **for the product
  cards**. The product page's buy zone was not touched by that fix because it
  does not go through `OxProductCard` at all, it goes through the engine's
  `AddToCartForm`.

- Traced which export `AddToCartForm` actually imports, in
  `node_modules/@salla.sa/twilight-theme-engine/dist/AddToCartForm-OJZB6Y5P.js`:

  ```
  import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
  import { SallaProductOptionsCore } from '@salla.sa/twilight-components-react/product-options';
  import { SallaQuantityInput } from '@salla.sa/twilight-components-react/quantity-input';
  ```

  `SallaProductOptionsCore` is the Core (immediate-mount) export.
  `SallaAddProductButton` and `SallaQuantityInput` are **not**, both are
  `withDeferredHydration(...Core, 'SallaAddProductButton' | 'SallaQuantityInput')`
  from `@salla.sa/twilight-components-react/dist/hydration/withDeferredHydration.js`.

- `withDeferredHydration` wraps the Core component in `HydrationBoundary`
  (`dist/hydration/HydrationBoundary.js`), which uses
  `react-intersection-observer`'s `useInView({ rootMargin: '200px',
  triggerOnce: true, skip: eventTriggered || shouldHydrate })` and only flips
  `shouldHydrate` to `true` once the wrapping `<div>` intersects the viewport
  (or immediately if `fallback` is falsy, not the case here: both
  `SallaAddProductButton` and `SallaQuantityInput` have a real skeleton
  (`ButtonSkeleton` / `InputSkeleton`) registered in `clientOnlyComponents`).
  Until `shouldHydrate` is true, the DOM holds the skeleton, not
  `<salla-add-product-button>`/`<salla-quantity-input>`.

This is the same defect class the owner's team already diagnosed and fixed on
cards, now suspected on the PDP's buy zone, which the theme cannot patch
directly since `AddToCartForm` is an opaque pre-bundled export.

## Browser evidence (chrome-headless-shell over raw CDP)

### Host is under heavy concurrent load right now, isolated and confirmed, not caused by this script

Before trusting any browser timing, a hang had to be explained: `Page.navigate`
to `http://localhost:3210/ar/p299069850` did not ack within 90s on the first
two attempts (separate chrome-headless-shell instances, separate ports). A
control probe on the same chrome instance proved the CDP mechanics are fine:

- `Page.navigate` to `data:text/html,<h1>hi</h1>` → **acked in <1ms**
- `Page.navigate` to `http://example.com/` → **acked in <1ms**, full load
- `Page.navigate` to `http://localhost:3210/ar/p299069850` → **not acked in
  20s** (then not in 90s on a separate run)

`curl -L` (a completely independent client, no CDP involved) to the same URL:
the 307 to `/ar/ar/p299069850` (self-redirect adding the locale, bare
`/ar/p299069850` has no slug, so the engine's `resolveRequestStoreBase` trap
from `offline-preview.md` reads `ar` as the slug, not the locale, exactly
the "two-segment ASCII product URL redirects once" case the doc already
documents) returns in **0.05s**, but the follow-up `GET
/ar/ar/p299069850`, the one that actually renders the product, **did not
return a single byte in 60s** (`curl` exit 28, timeout).

`.offline-preview.log` (45+ MB, gitignored) corroborates: its tail is stuck
re-emitting the identical home-page `HomeComponentRenderer` render trace
(`ox-hero` … `ox-banner`, `renderCount=1`) over and over, the file keeps
growing (confirmed: +16KB between two checks a minute apart) but the visible
content doesn't change, which reads as many concurrent SSR renders queued
behind each other on this single-threaded dev server, not one hung request.
The task brief already warned several other agents are running headless
Chrome concurrently right now; this project's one dev server on :3210 appears
to be the contended resource, not a bug this diagnosis introduced.

**This means the 15-second checkpoint the task asks for cannot be timed
against wall-clock right now**, the page is queued, not broken, for however
long the contention lasts. Findings below are qualified accordingly; a rerun
once the host is quiet would give a clean number.

The server did later recover on its own (a fresh `curl` to
`http://localhost:3210/ar/ar/p299069850` returned 200 in 1.3s after the
stalls above), so the block was transient contention, not a permanent hang -
but it means a couple of minutes of this run's wall-clock timing is noise
from host load, not from the theme.

### The SDK script tag, confirmed from the served HTML directly (no browser needed)

`curl http://localhost:3210/ar/ar/p299069850` once the server recovered:

```html
<script id="salla-sdk" type="module" src="https://cdn.assets.salla.network/dev/@salla.sa/twilight/9b1ad668bb386735f64a045e4c13b4c5508ad4c8/twilight.esm.js">
```

This is rendered server-side by the engine's own `buildRootScripts()`
(`node_modules/@salla.sa/twilight-theme-engine/dist/chunk-BTWIOWGZ.js:340`),
always present, not conditional on the offline preview. `cdn.assets.salla.network`
is **not** in the offline shim's `REDIRECTED_HOSTS` set (only `api.salla.dev`
and `cdn.salla.network` are), so this script genuinely goes to the real
internet CDN, this matches `offline-preview.md`'s own claim that the SDK,
Lit and the icon font are "still loaded from the internet." The offline shim
is not involved in loading the components bundle at all.

The served HTML has **zero** `<salla-add-product-button>`,
`<salla-quantity-input>` or `<salla-product-options>` tags (grep for
`<salla-[a-z-]+` finds only `<salla-hook`, an unrelated element), consistent
with all three being client-only mounts, matching the task's own observation
for this URL.

### CONDUCTOR NOTE: the preview was restarted mid-diagnosis

The conductor restarted both `:3210` and `:5178` because they had become
unresponsive under several concurrent headless browsers (matches everything
above: `Page.navigate` not acking in 90s+, `curl` timing out with zero bytes,
the vite process's CPU time flat, genuinely stuck, not merely slow). Every
result below is from **after** that restart, confirmed fresh immediately
before each run with a plain `curl` to `/ar` (200 in 0.16–0.26s).

### Live DOM (chrome-headless-shell over raw CDP), post-restart, confirmed clean

**PDP** (`http://localhost:3210/ar/p299069850` → 307 → `/ar/ar/p299069850`,
navigated at 18:02:46, checked at t+15.0s and again at t+20.0s, identical
both times):

```json
"defined": { "salla-add-product-button": true, "salla-quantity-input": true, "salla-product-options": true },
"counts":  { "salla-add-product-button": 1,    "salla-quantity-input": 1,    "salla-product-options": 0 },
"boxes": {
  "salla-add-product-button": [{ "w": 360, "h": 56,  "x": 873, "y": 818, "visible": true }],
  "salla-quantity-input":     [{ "w": 138, "h": 40,  "x": 710, "y": 826, "visible": true }],
  "salla-product-options": []
}
"skeletonButtons": 0, "skeletonInputs": 0
```

Both `customElements` are defined, both mount exactly one instance, both have
real nonzero visible boxes, and the HTML shows `class="... hydrated"` on the
quantity input. `salla-product-options` is defined but renders zero instances
- correct and expected: this product ("plain", per the task) carries no
options, and the engine's own `AddToCartForm` does not render the component
for one. **No skeletons anywhere, at either checkpoint, the add button and
quantity did not disappear or flicker in this run.**

**HOME** (`http://localhost:3210/ar`, rerun fresh again per the conductor's
instruction, navigated 18:04:54, checked at t+15.0s):

```json
"totalSlots": 7, "addButtonDefined": true, "addButtonCount": 7,
"skeletonButtonsAnywhere": 0
```

All 7 `.ox-card-product__add-slot` elements have a mounted, visible
`salla-add-product-button` child, box `144×40`, `hasSkeleton: false` on every
one. Zero exceptions on either page.

### Console errors observed (PDP only; HOME had none)

Two, both **inside the vendored Salla SDK itself**
(`cdn.assets.salla.network/dev/@salla.sa/twilight/.../p-8f2ecff5.entry.js`),
not theme code, firing at t≈6.1–6.3s (2–3s after the buy zone had already
mounted successfully):

```
TypeError: Cannot read properties of null (reading 'length')
    at v.render (…p-8f2ecff5.entry.js:4:25557)
TypeError: Cannot read properties of null (reading 'length')
    at v.emitPromotionViewed (…p-8f2ecff5.entry.js:4:22121)
    at v.componentDidLoad (…p-8f2ecff5.entry.js:4:25334)
```

`emitPromotionViewed` reads as a GA4-style "view_promotion" analytics hook
inside some SDK component reading a `.length` off a null value, plausibly
missing store analytics config in the snapshot, plausibly something else.
Neither error coincided with a control disappearing in this run, and neither
is theme code, so not investigated further here, flagged for the record
since the task asked for every console error.

Also present, informational only:
`[Twilight] Could not hydrate twilight context: no root match in router state`
(warning, t≈3.7-4.0s on both pages) and the offline shim's own boot log
(`[offline-api] browser: api.salla.dev + cdn.salla.network -> http://127.0.0.1:5178`).

### Side finding: engine-level strings render in English on the Arabic PDP (preview-only)

`buyZoneHTML` at the 15s checkpoint shows **"Weight"**, **"Price"**,
**"Quantity"**, and the raw untranslated key
**`common.elements.increase_quantity`**, on `/ar/ar/p299069850`, which should
be Arabic throughout. Traced to source: the engine's own `AddToCartForm`
calls `t("pages.products.quantity", "Quantity")` etc.
(`AddToCartForm-OJZB6Y5P.js`), react-i18next falls back to the literal
English default (2nd arg) whenever the key is missing from the served
translation bundle. `scripts/serve-store.mjs`'s `platformStrings()` derives
`/js/translations.json` from **`locales/ar.json`**, the **theme's own**
dictionary (`ox.*` keys plus whatever non-`ox.*` keys the theme happens to
define), which never had reason to carry the **engine's** own default keys
like `pages.products.quantity`. On the live store, Salla's real
`js/translations.json` carries these natively in Arabic. This is a genuine
gap in the offline snapshot's translation coverage, separate from the
add-to-cart question, not fixed here (out of this task's scope) but worth a
line in `offline-preview.md`'s known-stubs table if someone picks it up.

## Answers

**(1) customElements defined? counts? boxes?**
PDP: all three defined; `salla-add-product-button` ×1 (360×56, visible),
`salla-quantity-input` ×1 (138×40, visible), `salla-product-options` ×0
(correct, no options on this product). Home rail: `salla-add-product-button`
defined, ×7, each 144×40 and visible, zero skeletons. See JSON above.
Stable across two checkpoints 5s apart; no flicker, nothing vanished.

**(2) Every console error / failed or 4xx-5xx request.**
Two `TypeError: Cannot read properties of null (reading 'length')` inside the
Salla SDK bundle itself (`cdn.assets.salla.network/.../p-8f2ecff5.entry.js`),
in `render()` and `emitPromotionViewed()`/`componentDidLoad()`, not theme
code, did not visibly break anything in this run. One `[Twilight] Could not
hydrate twilight context: no root match in router state` warning on both
pages. Zero failed/4xx/5xx network requests on either page in the clean
(post-restart, no-Network-domain) PDP run or the full-network-capture HOME
run (626 localhost + 30 `cdn.assets.salla.network` + 9 `cdn.salla.sa` + 5
`127.0.0.1:5178` + 1 `fonts.googleapis.com` + 1 `cdn.salla.network`, all
2xx/3xx).

**(3) Is the components bundle requested, from where, and does the offline
shim intercept something it needs?**
Yes: a server-rendered `<script id="salla-sdk" type="module" src="https://
cdn.assets.salla.network/dev/@salla.sa/twilight/9b1ad668bb.../twilight.esm.js">`
(confirmed both from raw `curl` of the SSR HTML and from source -
`buildRootScripts()` in the vendored engine, unconditional). `cdn.assets.
salla.network` is **not** in the offline shim's `REDIRECTED_HOSTS`
(`app/dev/offline-api.ts` only touches `api.salla.dev` and
`cdn.salla.network`), so this script is untouched by the shim and goes to the
real internet CDN, matching `offline-preview.md`'s own claim. The shim is
not involved in loading or defining these components at all; the React
wrapper package's own "define" functions are no-op stubs
(`const defineSallaAddProductButton_runtime = () => {}`) precisely because
the real `customElements.define(...)` comes from this external SDK script,
not from the npm package. Nothing here points to the shim breaking anything.

**(4) Verdict and smallest fix.**
**Preview-side operational issue, not a reproduced theme defect.** With the
preview server healthy, the add button and quantity control on the PDP and
on every home-page card mount correctly, stay hydrated, and do not
disappear across two checkpoints 5 seconds apart. What *is* real and
independently confirmed (by the conductor's own restart) is that this
single-process Vite/TanStack dev server can become completely unresponsive
- not merely slow, under concurrent headless-browser load: `Page.navigate`
did not acknowledge for 90+ seconds, plain `curl` got zero bytes back after
40-60s, and the vite process's CPU time was flat (idle, not computing) while
stuck, all while the separate snapshot API on :5178 kept answering in under
2ms. Any route needing the SSR loader chain (i.e. every real page, PDP and
home included) was affected; routes needing no loader (bare-host redirects)
kept responding. A user reloading, navigating, or watching HMR reconnect
during one of these stalls would plausibly see the buy zone go blank or
revert to nothing rendered, which reads exactly like "keeps deleting", for
as long as the stall lasts. This is inherent to a single local dev process
being shared by every concurrent agent/tab hitting it; it has no equivalent
on the live Salla store (a real multi-tenant platform, not one Node process).

Also on record but NOT reproduced live: `app/components/product/BuyZone/
BuyForm.tsx` renders the engine's opaque `AddToCartForm`, which imports the
**deferred** (`IntersectionObserver`+`HydrationBoundary`-gated) exports
`SallaAddProductButton` and `SallaQuantityInput` rather than their `Core`
counterparts, the exact mechanism this codebase has twice already found and
fixed elsewhere (`OxProductCard.tsx`'s `AddButton`/`BuyNow`/`SoldOutControl`,
and the "completion row" noted in `WebComponentBoundary.tsx`) after finding
it fails to hydrate reliably. `AddToCartForm` is a single opaque import from
`@salla.sa/twilight-theme-engine`; the theme cannot swap its internals
without reimplementing cart-add mechanics the codebase deliberately leaves to
Salla. This remains a plausible LATENT risk (same npm packages ship to the
live store, so if it ever does misfire it would misfire there too) but is
**not the confirmed cause** of tonight's reports, live testing against a
healthy server could not reproduce it failing.

**Smallest fix applied:** documentation only, in `docs/build/offline-
preview.md`, a note describing the concurrent-load stall (symptom, cause,
what NOT to conclude from it) so the next person hitting a "page won't load /
button is missing" report in this preview checks server health first instead
of assuming a code defect. No script logic changed (there is nothing in
`serve-store.mjs`/`offline-api.ts`/`preview-offline.mjs` that controls Vite's
own dev-SSR concurrency). No theme file touched.
