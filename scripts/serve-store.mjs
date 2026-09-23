#!/usr/bin/env node
/**
 * serve-store.mjs — a stand-in for `https://api.salla.dev/store/v1`, served
 * off the snapshot in `fixtures/store/`.
 *
 * node:http only. No dependencies, no network, no request ever leaves this
 * process.
 *
 * WHY: the real storefront host answers this machine with `429` +
 * `Cf-Mitigated: challenge` (Cloudflare bot protection, not a quota), which a
 * server-side fetch cannot solve, so every SSR render dies on
 * "Store Unavailable". The authenticated Admin API still answers, so the
 * catalogue is pulled through MCP, normalised by `scripts/snapshot-store.mjs`
 * and served from here instead.
 *
 * CONTRACT
 *   - Everything it knows answers `200` with the real snapshot.
 *   - Everything it does NOT know also answers `200`, with a valid empty
 *     envelope (`{status,success,data:null}`). A `404` inside a TanStack
 *     loader is what renders the 500 page, so a gap must never be a 404.
 *   - Every request is logged with the path, the query and how it was
 *     answered, so gaps are visible in the dev log.
 *
 * Usage: node scripts/serve-store.mjs [--port 5178] [--host 127.0.0.1]
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(ROOT, 'fixtures', 'store');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env[`OFFLINE_STORE_${name.toUpperCase()}`] ?? fallback;
}

const PORT = Number(arg('port', 5178));
const HOST = arg('host', '127.0.0.1');

/**
 * THE TAXONOMY OVERLAY (PLAN-ship Batch S1 step 7). The live store has zero
 * categories and an empty menu, and by default this snapshot says so: every
 * category, goal and menu-tree page renders its fallback, which is what a
 * visitor meets today. `OFFLINE_TAXONOMY=1` swaps in the 25-node taxonomy
 * from `fixtures/store/overlay/` (written by scripts/gen-taxonomy-fixture.mjs)
 * so those pages can be browser-verified before batch S5 writes the real
 * categories. It is a switch, not a default: nothing else about the snapshot
 * changes, and the honest-empty behaviour is one unset variable away.
 *
 * `fixtures/store/overlay/brands.json` (S2e, 2026-09-22; derived from the
 * live catalogue on 2026-09-23, owner review item 4 — 21 real supplier
 * brands, `docs/build/progress/S4a.md` has the full mapping) joined the same
 * switch: the live store also has zero brands, so this snapshot lets
 * `OxBrands` and `/brands` be seen locally the same way the overlay
 * categories let the category pages be seen (see
 * `docs/build/offline-preview.md`). `overlay/brand-membership.json` is the
 * brand-id -> product-id map that `--source=brands` filters against, the
 * same mechanism `overlay/membership.json` already gives categories.
 */
const OVERLAY = process.env.OFFLINE_TAXONOMY === '1';
const OVERLAY_DIR = join(SNAPSHOT, 'overlay');

/* ------------------------------------------------------------- snapshot */

function load(name, fallback) {
  const path = join(SNAPSHOT, name);
  if (!existsSync(path)) {
    console.warn(`[store-api] snapshot missing: fixtures/store/${name} — serving a fallback`);
    return fallback;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** An overlay file when the switch is on, else the snapshot's own file. */
function loadTaxonomy(name, fallback) {
  if (!OVERLAY) return load(name, fallback);
  const path = join(OVERLAY_DIR, name);
  if (!existsSync(path)) {
    console.warn(
      `[store-api] OFFLINE_TAXONOMY=1 but fixtures/store/overlay/${name} is missing — run node scripts/gen-taxonomy-fixture.mjs; serving the snapshot instead`
    );
    return load(name, fallback);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Every overlay category, children walked in, for lookups by id. */
function flattenCategories(list) {
  const out = [];
  const walk = (items) => {
    for (const item of items ?? []) {
      out.push(item);
      if (item.sub_categories?.length) walk(item.sub_categories);
    }
  };
  walk(list);
  return out;
}

/**
 * The real Salla `/brands` endpoint returns brands GROUPED BY FIRST LETTER
 * (`{[char]: Brand[]}`, confirmed against `@salla.sa/twilight-theme-engine`'s
 * own `routes/brands.js`: the loader treats `brand.list()`'s data as already
 * keyed by letter and only sorts the keys). Grouped here by `ar_char` (the
 * storefront's default direction) rather than served as a flat array, so the
 * offline preview matches that contract instead of relying on the accident
 * that `Object.values([...]).flat()` happens to still work on a flat array.
 */
function groupBrandsByChar(list) {
  const groups = {};
  for (const item of list ?? []) {
    const char = item.ar_char || item.en_char || '#';
    (groups[char] ??= []).push(item);
  }
  return groups;
}

/**
 * The PLATFORM string bundle the engine reads, which is NOT the same thing as
 * the theme's own `locales/`.
 *
 * Salla serves `js/translations.json` from its CDN and the engine looks up its
 * own chrome there: the breadcrumb's home label, account titles, and similar.
 * This snapshot used to answer it with `{}` on the note that "locales/ covers
 * these keys", which is true of every `ox.*` key and false of every `common.*`
 * one. The visible result was a product page whose breadcrumb read
 * "common.titles.home", raw, including inside the BreadcrumbList microdata.
 *
 * The theme already defines those strings, so the honest fixture is to serve
 * them rather than nothing. Read from `locales/ar.json` at boot instead of a
 * checked-in copy, so the bundle can never drift from the dictionary.
 */
function platformStrings() {
  const file = join(ROOT, 'locales', 'ar.json');
  if (!existsSync(file)) return {};
  const all = JSON.parse(readFileSync(file, 'utf8'));
  const out = {};
  for (const [key, value] of Object.entries(all)) {
    if (!key.startsWith('ox.')) out[key] = value;
  }
  return out;
}

const snapshot = {
  settings: load('store-settings.json', { status: 200, success: true, data: null }),
  products: load('products.json', []),
  details: load('product-details.json', {}),
  categories: loadTaxonomy('categories.json', []),
  // Overlay branch added (S2e, 2026-09-22) next to categories/menus: four
  // sample brands under OFFLINE_TAXONOMY=1 so `OxBrands` (MIN_BRANDS 1) can
  // be seen locally before the store carries a real one. The snapshot
  // default stays `fixtures/store/brands.json`, still empty.
  brands: loadTaxonomy('brands.json', []),
  menus: loadTaxonomy('menus.json', { header: [], footer: [] }),
  /** Overlay category id -> product ids; empty unless OFFLINE_TAXONOMY=1. */
  membership: OVERLAY ? loadTaxonomy('membership.json', {}) : {},
  /** Overlay brand id -> product ids; empty unless OFFLINE_TAXONOMY=1. */
  brandMembership: OVERLAY ? loadTaxonomy('brand-membership.json', {}) : {},
  home: load('home-components.json', []),
  apps: load('apps.json', { snippets: [], settings: { apps: {} } }),
  translations: platformStrings(),
  meta: load('meta.json', {}),
};

/* ------------------------------------------------------------- envelopes */

const ok = (data, extra = {}) => ({ status: 200, success: true, data, ...extra });
/** The universal empty answer. The engine coalesces `data` with `?? []` / `?? {}`. */
const empty = () => ok(null);

/**
 * Which `source` values this snapshot can honestly answer.
 *
 * `sales`, `best_selling` and `top-rated` return NOTHING on purpose: the store
 * has zero orders and zero reviews, so there is no bestseller and no rating to
 * rank by. Inventing one would be a fabricated claim. `categories`, `brands`,
 * `tags` and `related` return nothing because the store genuinely has no
 * taxonomy and no curated relations — the empty rails are what a visitor meets.
 * The one exception is `categories` under OFFLINE_TAXONOMY=1, answered from
 * the overlay's membership map (the taxonomy's own SKU lists, by product id).
 */
function selectProducts(source, values, keyword) {
  const all = snapshot.products;
  switch (source) {
    case 'latest':
      // The Admin API's own default order, carried through unchanged.
      return all;
    case 'categories': {
      if (!OVERLAY) return [];
      const wanted = new Set(
        values.flatMap((id) => snapshot.membership[String(id)] ?? []).map(String)
      );
      return all.filter((p) => wanted.has(String(p.id)));
    }
    case 'brands': {
      if (!OVERLAY) return [];
      const wanted = new Set(
        values.flatMap((id) => snapshot.brandMembership[String(id)] ?? []).map(String)
      );
      return all.filter((p) => wanted.has(String(p.id)));
    }
    case 'offers':
      return all.filter((p) => p.is_on_sale);
    case 'selected': {
      const wanted = values.map(String);
      const byId = new Map(all.map((p) => [String(p.id), p]));
      return wanted.map((id) => byId.get(id)).filter(Boolean);
    }
    case 'search': {
      const q = String(keyword ?? '').trim().toLowerCase();
      if (!q) return [];
      return all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? '').toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    default:
      return [];
  }
}

function productsResponse(url) {
  const q = url.searchParams;
  const source = q.get('source') ?? 'latest';
  const page = Math.max(1, Number(q.get('page') ?? 1) || 1);
  const perPage = Math.max(1, Number(q.get('per_page') ?? 16) || 16);
  const values = q.getAll('source_value[]').concat(q.getAll('source_value'));
  const sort = q.get('sort');

  let items = selectProducts(source, values, q.get('keyword'));

  // Only the orderings the snapshot can support truthfully.
  if (sort === 'price_asc' || sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc' || sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);

  const total = items.length;
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);
  const hasNext = start + perPage < total;

  return {
    body: ok(slice, {
      // Cursor pagination: the engine reads `response.cursor.next`.
      cursor: { current: String(page), next: hasNext ? String(page + 1) : null, count: slice.length },
      pagination: {
        count: slice.length,
        total,
        perPage,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        links: {},
      },
      /** No facets: the store has no categories, brands or tags to filter on. */
      filters: [],
    }),
    note: `source=${source} page=${page}/${Math.max(1, Math.ceil(total / perPage))} → ${slice.length} of ${total}`,
  };
}

/* --------------------------------------------------------------- routing */

function route(pathname, url) {
  // Tolerate both `/store/v1/x` and a bare `/x`.
  const p = pathname.replace(/^\/store\/v1\/?/, '').replace(/^\/+|\/+$/g, '');
  const seg = p ? p.split('/') : [];

  if (p === '' ) return { body: ok(snapshot.meta), note: 'index' };

  if (p === 'store/settings') return { body: snapshot.settings, note: 'real store settings' };

  if (seg[0] === 'menus') {
    const slot = seg[1] === 'footer' ? 'footer' : 'header';
    const items = snapshot.menus[slot] ?? [];
    return { body: ok(items), note: `${slot} menu — ${items.length} item(s)` };
  }

  if (p === 'component/list') {
    return { body: ok(snapshot.home), note: `${snapshot.home.length} dashboard home block(s)` };
  }

  if (seg[0] === 'products' && seg.length === 1) return productsResponse(url);

  if (seg[0] === 'products' && seg[2] === 'details') {
    const found = snapshot.details[String(seg[1])];
    if (found) return { body: ok(found), note: `product ${seg[1]} — ${found.name}` };
    // Unknown id: 404 so the loader's `orThrow` renders the theme's Not Found
    // rather than a broken product page.
    return { body: { status: 404, success: false, error: { message: 'Product not found' } }, code: 404, note: `unknown product ${seg[1]}` };
  }

  if (seg[0] === 'categories') {
    const flat = flattenCategories(snapshot.categories);
    const emptyNote = OVERLAY
      ? `${flat.length} overlay categories (OFFLINE_TAXONOMY=1)`
      : 'store has ZERO categories';
    if (seg.length === 1) return { body: ok(snapshot.categories), note: emptyNote };
    // Children are nested under their parent in the list, so the lookup walks
    // the tree: `/protein/c9001` and `/whey-protein/c9011` both have to answer.
    const found = flat.find(
      (c) => String(c.id) === String(seg[1]) || (c.id_ !== undefined && String(c.id_) === String(seg[1]))
    );
    return found
      ? { body: ok(found), note: `category ${seg[1]} — ${found.name}` }
      : { body: { status: 404, success: false, error: { message: 'Category not found' } }, code: 404, note: emptyNote };
  }

  if (seg[0] === 'brands') {
    if (seg.length === 1) {
      const emptyNote = OVERLAY
        ? `${snapshot.brands.length} overlay brands (OFFLINE_TAXONOMY=1)`
        : 'store has ZERO brands';
      return { body: ok(groupBrandsByChar(snapshot.brands)), note: emptyNote };
    }
    const found = snapshot.brands.find((b) => String(b.id) === String(seg[1]));
    return found
      ? { body: ok(found), note: `brand ${seg[1]}` }
      : { body: { status: 404, success: false, error: { message: 'Brand not found' } }, code: 404, note: 'store has ZERO brands' };
  }

  /**
   * Endpoints the SDK calls on every page whose honest answer here is
   * nothing. Named so the log distinguishes them from a real gap.
   */
  if (seg[0] === 'advertisements') return { body: ok([]), note: 'no advertisements' };
  if (seg[0] === 'blog') return { body: ok([]), note: 'blog not snapshotted' };
  if (seg[0] === 'notifications') return { body: ok([]), note: 'no session, no notifications' };
  if (seg[0] === 'wishlist') return { body: ok([]), note: 'no session, empty wishlist' };
  if (seg[0] === 'pages') return { body: ok(null), note: 'pages not snapshotted' };

  if (p === 'apps/snippets') return { body: ok(snapshot.apps.snippets), note: 'no installed app snippets' };
  if (p === 'apps/snippets/settings') return { body: ok(snapshot.apps.settings), note: 'no app scopes' };

  /** Guest. There is no authenticated session in an offline preview. */
  if (p === 'auth/user' || p === 'profile') return { body: ok({ type: 'guest' }), note: 'guest' };

  /**
   * Cart and checkout are NOT emulated. An empty cart is returned so the
   * header pill and the cart page render their empty state instead of
   * throwing; nothing can actually be added or bought in this mode.
   */
  if (seg[0] === 'cart') {
    return {
      body: ok({
        id: String(seg[1] ?? '0'),
        count: 0,
        items: [],
        sub_total: 0,
        total: 0,
        discount: 0,
        coupon: null,
        tax_amount: 0,
        has_shipping: false,
        real_shipping_cost: 0,
        options: [],
      }),
      note: 'STUB — cart is not emulated offline',
    };
  }

  // Salla's CDN translation bundle, proxied through the same origin.
  if (p === 'js/translations.json' || p === 'translations') {
    return { body: snapshot.translations, raw: true, note: 'platform strings, derived from locales/ar.json' };
  }

  return { body: empty(), note: 'UNKNOWN PATH — empty envelope (200)', unknown: true };
}

/*
 * OFFLINE_LANGS=ar,en adds English to the store's language list so the engine
 * renders /en locally. The live store (1888890798) has English configured but
 * disabled, and the snapshot mirrors that, so without this switch every /en
 * URL is a 307 to /. Theme strings come from the bundled locales/en.json; the
 * platform strings bundle stays the Arabic-derived one.
 */
const OFFLINE_LANGS = (process.env.OFFLINE_LANGS || '')
  .split(',')
  .map((code) => code.trim())
  .filter(Boolean);
if (OFFLINE_LANGS.includes('en') && snapshot.settings?.data && !snapshot.settings.data.languages?.en) {
  snapshot.settings.data.languages = {
    ...(snapshot.settings.data.languages || {}),
    en: {
      name: 'English',
      code: 'en',
      url: 'https://assets.salla.sa/images/flags/en.svg',
      is_rtl: false,
      country_code: 'US',
    },
  };
  // The engine's generated {-$locale} route reads store.settings.is_multilingual:
  // false sends every /en URL back to the bare path, true sends every bare
  // path to /ar/... (the live behaviour once English is enabled).
  if (snapshot.settings.data.store?.settings) snapshot.settings.data.store.settings.is_multilingual = true;
  console.log('[store-api] OFFLINE_LANGS: English added to the store languages and is_multilingual=true (local only)');
}

/* ---------------------------------------------------------------- server */

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-max-age': '600',
};

let served = 0;
const unknownPaths = new Set();

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${HOST}:${PORT}`}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  let result;
  try {
    result = route(url.pathname, url);
  } catch (error) {
    // Still a 200: a throw here must not become a 500 page in the theme.
    console.error(`[store-api] handler error on ${url.pathname}:`, error);
    result = { body: empty(), note: `handler error: ${error.message}` };
  }

  const code = result.code ?? 200;
  const payload = JSON.stringify(result.body);
  res.writeHead(code, {
    ...CORS,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    'x-offline-snapshot': '1',
  });
  res.end(payload);

  served += 1;
  if (result.unknown) unknownPaths.add(url.pathname);
  const query = url.search ? ` ${decodeURIComponent(url.search)}` : '';
  console.log(
    `[store-api] ${String(code)} ${req.method} ${url.pathname}${query} — ${result.note} (${Buffer.byteLength(payload)}B)`
  );
});

server.listen(PORT, HOST, () => {
  const counts = snapshot.meta.counts ?? {};
  console.log(`[store-api] listening on http://${HOST}:${PORT}/store/v1`);
  console.log(
    `[store-api] snapshot: ${counts.products ?? '?'} products, ${counts.categories ?? 0} categories, ${counts.brands ?? 0} brands, generated ${snapshot.meta.generated_at ?? 'unknown'}`
  );
  console.log(
    OVERLAY
      ? `[store-api] OFFLINE_TAXONOMY=1: serving ${flattenCategories(snapshot.categories).length} overlay categories, ${snapshot.menus.header?.length ?? 0} header menu items and ${snapshot.brands.length} overlay brands from fixtures/store/overlay/`
      : '[store-api] taxonomy overlay off (set OFFLINE_TAXONOMY=1 to serve fixtures/store/overlay/)'
  );
  console.log('[store-api] api.salla.dev is never contacted by this process.');
});

function shutdown() {
  console.log(
    `\n[store-api] ${served} request(s) served.${unknownPaths.size ? ` Unhandled paths seen: ${[...unknownPaths].join(', ')}` : ' No unhandled paths.'}`
  );
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
