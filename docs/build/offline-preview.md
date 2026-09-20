# Offline preview — running the theme without api.salla.dev

`pnpm preview:offline`

That brings up the theme at **http://localhost:3210/** rendering the real
OptimalX catalogue, with no request to `api.salla.dev` from any process it
starts.

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
| Branch | one branch, Al-Khalidiyah, Medina, `+966581565351`, its real working hours |
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
