# Offline preview — running the theme without api.salla.dev

`pnpm preview:offline`

That brings up the theme at **http://localhost:3210/** rendering the real
OptimalX catalogue, with no request to `api.salla.dev` from any process it
starts.

**Open every direct URL under its locale prefix** (`/ar/...` or `/en/...`),
for example `http://localhost:3210/ar/latest-products`; bare `/` redirects to
`/ar`. Since 2026-09-23 `preview-offline.mjs` passes the snapshot's store id
to the engine as `VITE_STORE_DOMAIN` (its last-resort identifier), so the
`?storeId=1888890798` query is optional and harmless. What still bites is a
URL with no locale prefix: on a loopback host the engine has no store in the
hostname, so it reads the first path segment as the store's username whenever that segment
matches `^[a-z0-9][a-z0-9_-]{0,62}$` (engine `resolveRequestStoreBase`), strips
it, and renders the home for `/latest-products`, `/brands`, `/cart` and every
other ASCII route. Arabic product slugs do not match the pattern, which is why
a PDP opened directly works and a listing opened directly does not. Client-side
navigation is unaffected, so clicking through from the home always works, and
production is unaffected because `optimalx.com.sa` identifies the store by
host. Found 2026-09-21 after an hour of chasing a routing regression that did
not exist.

**The dev server (`vite dev` on :3210) is one shared Node process and can go
fully unresponsive — not just slow — under concurrent headless-browser load.**
Confirmed 2026-09-24 while diagnosing an owner report of the product page's
add-to-cart button and quantity control "disappearing": with several
concurrent headless-Chrome sessions hitting the preview, `Page.navigate`
(CDP) did not acknowledge for 90+ seconds, a plain `curl` to `/ar` or to a
product page got zero bytes back after 40-60s, and the vite process's CPU
time was flat (idle, not computing) the whole time it was stuck — a genuine
stall, not a busy loop. Any route needing the SSR data-loader chain (which is
almost every real page: home, PDP, listings) was affected; a route needing no
loader (the bare-host username redirect above) kept answering in under 60ms
the entire time, and the separate snapshot API on `:5178` (`serve-store.mjs`,
plain `node:http`, its own process) kept answering in under 2ms throughout —
so the bottleneck is specifically Vite's dev-mode SSR render pipeline, not
the API mock and not the whole machine. The conductor restarting both
processes cleared it immediately. **If a page won't load, or a control that
should be there (add-to-cart, quantity, anything mounted client-side) seems
to be missing or flickering, check whether the server is actually answering
(`curl -w '%{http_code} %{time_total}'` to `/ar`) before concluding it's a
code defect** — a live re-check against this exact catalogue/product, once
the server answers in well under a second, is the only trustworthy evidence.
There is no code fix for this in `serve-store.mjs` / `offline-api.ts` /
`preview-offline.mjs`: it is Vite's own dev-server concurrency, and it has no
equivalent on the live store (a real multi-tenant platform, not one shared
local Node process). Full diagnosis, including the live DOM evidence taken
once the server was healthy again, is in
`docs/build/progress/PDP-ADD-DIAG-2026-09-24.md`.

---

## Why this exists

The theme renders server-side by fetching `https://api.salla.dev/store/v1/*`.
That host now answers this machine with:

```
HTTP/1.1 429 Too Many Requests
Cf-Mitigated: challenge
```

`Cf-Mitigated: challenge` is **Cloudflare bot protection, not a quota**. Hours
of automated traffic got this connection flagged, and the mitigation demands a
JavaScript challenge that a server-side `fetch` cannot solve. Waiting does not
clear it, because it is a reputation state rather than a timer, and every
further request re-arms it. Without store settings the root loader throws
`SettingsError` and every route answers 500 "Store Unavailable".

**Do not send requests to `api.salla.dev` to test this.** Not with different
headers, not once. The only reliable fix for the live host is a different IP
(phone hotspot or VPN); defeating the control is not on the table.

The **authenticated Admin API** goes over a different path and is not
challenged. So: pull the store through it, write the answers to disk, serve
them locally, and point the theme at that.

## How it works

```
  Salla Admin API ──(MCP tools, manual)──▶ fixtures/store/raw/*.json
                                                   │
                                   scripts/snapshot-store.mjs  (no network)
                                                   ▼
                                          fixtures/store/*.json
                                                   │
                                   scripts/serve-store.mjs  (node:http only)
                                                   ▼
                                    http://127.0.0.1:5178/store/v1
                                                   ▲
                app/dev/offline-api.ts  ───────────┘
                (rewrites api.salla.dev → VITE_API_URL, server and browser)
                                                   ▲
                                          vite dev  (VITE_API_URL set)
```

`scripts/preview-offline.mjs` starts the bottom two and keeps them together.

### The one trap: `VITE_API_URL` alone does nothing

The engine *reads* `VITE_API_URL` in `resolveRuntimeEnv()`, so it looks like
the intended switch. It is not — that value is written into the runtime-env
object and never read again. The API client hardcodes its prefix:

```js
// node_modules/@salla.sa/twilight-theme-engine/dist/chunk-O6XXHXC4.js:89
var api = ky.extend({ prefix: "https://api.salla.dev/store/v1",  // TODO: check env
```

There is no environment variable that moves it. Three ways to work around that
were considered:

| approach | why not |
| --- | --- |
| edit the engine in `node_modules` | pnpm hard-links those files into the shared store, so editing one edits every project's copy |
| Vite `transform` hook on the chunk | plugin hooks do not reach a pre-bundled dependency |
| **rewrite the request itself** | ✅ works in the workerd SSR runner, in the browser, and for the Salla SDK's XHR calls |

`app/dev/offline-api.ts` does the third. It wraps `globalThis.fetch` and
`XMLHttpRequest.prototype.open`, redirects only `api.salla.dev` and
`cdn.salla.network`, and is **inert unless `VITE_API_URL` is set** — a normal
`pnpm dev` and every production build behave exactly as before.

---

## What is real and what is not

### Real — straight from the store, unmodified

| area | detail |
| --- | --- |
| Store identity | Optimal X, id `1888890798`, `optimalx.com.sa`, SAR, description, logo |
| Registration | commercial registration `7054552703`, **no tax number** (the store genuinely has none) |
| Branch | one branch, Al-Khalidiyah, Medina, `+966553524524`, its real working hours |
| Brand | `#EE4D22`, Cairo, the Instagram link (the only social account filled in) |
| Catalogue | all **47** products — real names, Arabic descriptions, prices in SAR, SKUs, weights, stock, product types (36 product, 4 food, 4 service, 1 codes, 1 digital, 1 group) |
| Images | the real `cdn.salla.sa` URLs. 41 products have images; **6 have none** (OX-042…047) and render the placeholder, as they do live |
| Discounts | the **4** genuinely discounted products; `discount_percentage` is arithmetic over the store's own two numbers |
| Variants | the one product with options (the shaker's 4 colours) keeps its real options and SKUs |
| Language | Arabic only. English exists in the dashboard but is **disabled**, so `is_multilingual` is false and no hreflang cluster is emitted |
| Emptiness | **zero** categories, **zero** brands, **zero** tags, **zero** reviews, **zero** orders, **zero** menu items — all real, none padded |

### Honestly empty — the store has nothing to show here

These are not stubs. They are the truth of the store today, and seeing them
empty is the point of the preview.

- `/categories`, `/brands` → `[]`. No product carries either.
- Header and footer menus → `[]`. Both dashboard menus exist and are empty.
- `source=sales`, `best_selling`, `top-rated`, `related`, `recently`,
  `wishlist` → `[]`. **Zero orders and zero reviews exist**, so there is no
  bestseller and no rating to rank by, and inventing one would be a fabricated
  claim. The **most-sales-products page is therefore empty**; rails that
  declare a fallback (`fallbacks={[{ source: 'latest' }]}`) fall back to latest.
- Product `rating` → `{count: 0, stars: 0}`. The Admin API returns a constant
  `{total:0,count:1,rate:0}` on every product; that is not a review count and
  is deliberately not carried through.

### Stubbed — plausible structure, not store data

| area | what is stubbed | why |
| --- | --- | --- |
| `store.username` | empty string | the Admin API never exposes the salla.sa username, and a non-empty value makes the engine bounce every localhost request to `/<username>` |
| `store.settings.payments` | `["mada","credit_card","stc_pay","apple_pay"]` | not reachable over MCP; taken from the verified record in `app/components/product/lib/claims.ts` (checked against the live store 2026-09-20) |
| `theme.color.text` / `reverse_*` | black / white | Salla derives these from the one brand colour the merchant set; this is the light-mode pairing the theme is built for |
| auth / login config | empty turnstile keys, all social logins off | no session exists offline |
| `external_services`, `affiliate`, `headers` | empty | nothing reads them |
| Salla CDN translations | `{}` | the theme ships the same keys in `locales/`, which reach i18next as the `theme` fallback namespace, so no string is lost |
| `apps/snippets` | `[]` | no installed-app snippets are emulated |
| Homepage blocks | the merchant's **real** 10 visible blocks are served, but they belong to the theme that is live in the dashboard, not this theme's `ox-*` blocks. `app/routes/index.tsx` does not recognise them and renders the **twelve default OptimalX blocks** instead — which is exactly what a visitor meets today |

### Does not work at all in this mode

- **Cart and checkout.** Add-to-cart, quantity changes, coupons, shipping,
  payment and the thank-you page all run through the Salla SDK against the
  live platform. `/store/v1/cart/*` answers an empty cart so the header pill
  and the cart page render their empty state instead of throwing; nothing can
  be added and nothing can be bought.
- **Login, profile, orders, wishlist, wallet, loyalty, notifications.** No
  session exists; these answer an empty envelope and render empty states.
- **Blog and pages.** No content was snapshotted; these answer empty.
- **Search** works, but against the snapshot: a substring match over product
  name, SKU and description, not the platform's ranked search.

### Still loaded from the internet

The preview is offline **from the Salla store API**, not from the web. The
browser still fetches, because these are what the real page uses and faking
them would make the preview lie about how it looks:

- product images from `cdn.salla.sa`
- the Cairo webfont from `fonts.googleapis.com`
- the twilight SDK, Lit and the Salla icon font from
  `cdn.assets.salla.network`

The twilight SDK would itself call `api.salla.dev` from the page; the XHR patch
in `app/dev/offline-api.ts` redirects those to the local server too, so the
browser does not re-trip the mitigation either.

---

## Refreshing the snapshot

The snapshot script **cannot call MCP itself**. An operator (or Claude in a
session with the Salla MCP server) calls the tools and saves each raw response,
then the script normalises them. Nothing in that second step touches the
network, so re-running it is free.

1. Call each tool and save its raw JSON over the matching file:

   | file in `fixtures/store/raw/` | MCP tool |
   | --- | --- |
   | `store-context.json` | `store_context_get` |
   | `branding.json` | `store_branding_get` |
   | `languages.json` | `languages_list` |
   | `categories.json` | `categories_list` |
   | `menus.json` | `menu_list` — the index, then each menu id, merged as `{"menus":[{id,name,items}]}` |
   | `reviews.json` | `reviews_list` |
   | `theme-settings.json` | `theme_settings_list` |
   | `homepage-components.json` | `homepage_components_list` |
   | `products.page1.json` | `products_list` page 1, `per_page: 25` |
   | `products.page2.json` | `products_list` page 2, `per_page: 25` |

   Use `products_list`, **not** `products_list_with_images` — the latter
   returns rendered image blocks, not JSON. Add `products.page3.json` and
   register it in the `productPages` array if the catalogue grows past 50.

2. `pnpm snapshot:store`
3. Restart `pnpm preview:offline`.

`fixtures/store/meta.json` records when the snapshot was generated, the counts
it holds, and which tool produced each raw file.

---

## Commands and knobs

| command | what it does |
| --- | --- |
| `pnpm preview:offline` | snapshot API + `vite dev`, wired together |
| `pnpm serve:store` | the snapshot API on its own (`--port`, `--host`) |
| `pnpm snapshot:store` | rebuild `fixtures/store/*.json` from `raw/` |

| env var | default | meaning |
| --- | --- | --- |
| `OFFLINE_API_PORT` | `5178` | snapshot API port |
| `OFFLINE_DEV_PORT` | `3210` | theme dev server port |
| `OFFLINE_LOG` | `.offline-preview.log` | combined log of both processes |

Every request the snapshot API answers is logged with its path, its query and
how it was answered, and a path it does not know is logged as
`UNKNOWN PATH — empty envelope (200)`. An unknown path answers **200 with an
empty envelope, never 404**, because a 404 inside a TanStack loader is what
produces the 500 page. Watch that log for `UNKNOWN PATH` lines: each one is a
gap worth filling.

## Proving it never touched the challenged host

```
grep -c 429 .offline-preview.log            # 0
grep -ci "api.salla.dev" .offline-preview.log   # 0
```

The snapshot API also prints a summary of every path it was asked for on
shutdown.

---

## What this exposed (not caused by the offline mode)

These are real gaps in the theme, found while getting the preview to render.
None of them is introduced by the snapshot; all of them are visible live too.

1. **Nine referenced images do not exist.** `app/content/goals.ts` points at
   `/assets/images/goal-{muscle,strength,weight,recovery,daily,lean}.jpg` and
   `app/content/services.ts` at `/assets/images/plan-{nutrition,training,advisory}.jpg`.
   `public/assets/images/` holds only six files, none of them these, so the
   goal cards and the plan cards render with six and three broken images. The
   owner brief for them is `docs/build/image-brief.md`.

2. **A missing image can turn into a product-detail request.** The product
   route is `/{-$locale}/$slug/p{$id}`, and `/assets/images/plan-advisory.jpg`
   matches it — `$slug` = `images`, `$id` = `lan-advisory.jpg`, because the
   `p` of `plan` is the route's literal prefix. The loader then asks for
   `products/lan-advisory.jpg/details`. Harmless while the request 404s into
   a Not Found, but any theme asset under a path segment starting with `p`
   is one missing file away from a bogus product lookup.

3. **A two-segment ASCII product URL redirects once.** `/starter-pack/p<id>`
   307s to `/starter-pack/ar/p<id>` before rendering. The real catalogue URLs
   (Arabic slugs) resolve in one hop with no redirect, so this is latent
   rather than live, but the optional-locale segment is matching a slug.

4. **One unit test was already failing before this work.**
   `tests/home/OxServices.test.tsx > prefers the merchant heading over the
   locale copy` — the `.ox-sh__desc` node it asserts on no longer exists after
   the section-header rework. 819 of 820 tests pass.

## Notes on reading the preview

- The product rails are lazy: the `ox-products` and `ox-faq` rails mount when
  they scroll into view, so the home page fills in as you scroll rather than
  all at once.
- `.offline-preview.log` is gitignored. `fixtures/store/` is not — the
  snapshot is meant to be committed so a teammate can run the preview without
  MCP access.

## The taxonomy overlay (`OFFLINE_TAXONOMY=1`)

The live store has zero categories and an empty menu, and the snapshot says
so by default: every category, goal and menu-tree page renders its search
fallback, which is what a visitor meets today. To browser-verify those pages
before batch S5 writes the real categories, start the preview with the
overlay switched on:

```
OFFLINE_TAXONOMY=1 pnpm preview:offline
```

`scripts/serve-store.mjs` then serves `fixtures/store/overlay/` instead of the
snapshot's `categories.json` and `menus.json`: the 25-node taxonomy as
storefront categories (ids `9000 + order`, so `/protein/c9001`,
`/whey-protein/c9011`, `/goal-energy/c9020`), the same tree as a header menu,
and `products?source=categories` answered from the taxonomy's own SKU lists
(`membership.json`). Nothing else about the snapshot changes.

The three files are generated, never edited:

```
node scripts/gen-taxonomy-fixture.mjs           # rewrite from taxonomy.json, products.json, tax.ar.json
node scripts/gen-taxonomy-fixture.mjs --check   # exit 1 when they are stale
```

The category URLs carry the store origin (`https://optimalx.com.sa/...`), the
same one the fixture's product URLs carry, on purpose: the engine only
client-routes an anchor whose origin equals `store.url`, so a localhost URL
would be a full page load into the `?storeId=` trap described at the top of
this file. Client-side navigation from the home page, the header or
`/categories` reaches every overlay category; a direct URL still needs
`?storeId=1888890798`.

### The brand overlay, in the same file (`fixtures/store/overlay/brands.json`)

The live store also has zero brands, and the snapshot's `fixtures/store/brands.json`
says so by default (`[]`): `OxBrands` renders nothing (S2e, 2026-09-22:
`MIN_BRANDS` is 1, so even a single real brand would be enough). To see the
strip locally before the store carries one, the same `OFFLINE_TAXONOMY=1`
switch also serves `fixtures/store/overlay/brands.json` — four sample rows
(Optimum Nutrition, MuscleTech, EVLution Nutrition, Dymatize; Latin names,
`logo: null`, from `docs/build/research/FINAL-catalogue.md` §B) instead of the
snapshot's empty one.

Unlike `categories.json`/`menus.json`/`membership.json`, **`brands.json` is
hand-written, not generated**: `gen-taxonomy-fixture.mjs` only knows the
25-node taxonomy, and the store's four utility categories and fifteen product
categories have no brand data of their own to derive one from. Edit it
directly if the sample set ever needs to change.

## The settings overlay, in the same switch (`fixtures/store/overlay/settings.json`)

The snapshot's `store-settings.json` was captured before this theme declared
any of its own custom settings, so `data.theme.settings` carries only the
engine-native ones (`show_tags`, `imageZoom`, …) and none of `show_newsletter`,
`newsletter_action_url`, `inbody_included`, `reply_sla_hours` or any other
gated custom setting (`docs/build/progress/S8d.md` §4 item 5 first found this
gap; owner brief S8h fixed it). `OFFLINE_TAXONOMY=1` now also merges
`fixtures/store/overlay/settings.json` over `data.theme.settings`:

```json
{
  "show_newsletter": true,
  "newsletter_action_url": "https://example.com/subscribe",
  "inbody_included": true,
  "reply_sla_hours": 24,
  "whatsapp_number": "966500000000"
}
```

That is enough for every gate this theme reads through `settings.<key>`
(`app/components/product/lib/claims.ts`'s own gates included) to open
locally, the newsletter form among them - `newsletter_action_url` points at
a placeholder `https://example.com/subscribe`, which is valid enough to pass
the "is this a real https URL" gate and render the form, but obviously
answers no real POST; do not expect a submit against it to reach an inbox.
The theme reads these through the exact same `settings.<key>` path on the
live store once the merchant saves them in the dashboard - this overlay is a
different SOURCE of the same object, never a different mechanism. Edit the
file directly to try other values; it is not generated.

## English locally (`OFFLINE_LANGS=ar,en`)

The live store has English configured but disabled (`languages_list` on
2026-09-22: `ar` enabled, `en` disabled), and the snapshot's store settings
carry only `ar`, so the engine answers every `/en/...` URL with a 307 to `/`.
To render the English storefront locally:

```
OFFLINE_LANGS=ar,en pnpm preview:offline
```

`scripts/serve-store.mjs` then adds `en` to the store's language list. Theme
strings come from the bundled `locales/en.json`; the platform-string bundle
(`js/translations.json`) stays the Arabic-derived one, so engine chrome such
as breadcrumb labels still reads Arabic until Salla serves the English
bundle on the live store. Combine with the overlay: `OFFLINE_TAXONOMY=1
OFFLINE_LANGS=ar,en pnpm preview:offline`.
