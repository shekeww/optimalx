#!/usr/bin/env node
/**
 * snapshot-store.mjs — turn the Admin-API dumps in `fixtures/store/raw/` into
 * the exact response bodies `https://api.salla.dev/store/v1/*` would send, so
 * `scripts/serve-store.mjs` can answer the theme from disk.
 *
 * WHY THIS EXISTS
 * ---------------
 * The storefront API host is behind Cloudflare bot protection for this
 * machine (`HTTP 429` + `Cf-Mitigated: challenge`), which a server-side fetch
 * cannot solve, so every SSR render answers "Store Unavailable". The
 * AUTHENTICATED Admin API is a different path and still answers. This script
 * is the second half of that route: an operator calls the Salla MCP tools,
 * saves each raw response under `fixtures/store/raw/`, and this file
 * normalises them into storefront shapes.
 *
 * IT MAKES NO NETWORK CALLS. Re-running it is free and deterministic.
 *
 * REFRESHING THE SNAPSHOT — see docs/build/offline-preview.md. In short: call
 * the MCP tools listed in `RAW_SOURCES` below, overwrite the matching file in
 * `fixtures/store/raw/`, then run `node scripts/snapshot-store.mjs`.
 *
 * CLAIMS RULE
 * -----------
 * Nothing here invents a rating, a review count, an order count, a bestseller
 * flag, a delivery estimate or a certification. A field the store does not
 * have is `null`, `0` or `[]`. Every derived value is arithmetic over numbers
 * the Admin API actually sent, and each one is commented where it is derived.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'fixtures', 'store', 'raw');
const OUT = join(ROOT, 'fixtures', 'store');

/** Which MCP tool produced each raw file. Used by the docs and the meta block. */
const RAW_SOURCES = {
  'store-context.json': 'mcp Salla store_context_get',
  'branding.json': 'mcp Salla store_branding_get',
  'languages.json': 'mcp Salla languages_list',
  'categories.json': 'mcp Salla categories_list',
  'menus.json': 'mcp Salla menu_list (index + each menu id)',
  'reviews.json': 'mcp Salla reviews_list',
  'theme-settings.json': 'mcp Salla theme_settings_list',
  'homepage-components.json': 'mcp Salla homepage_components_list',
  'products.page1.json': 'mcp Salla products_list (page 1, per_page 25)',
  'products.page2.json': 'mcp Salla products_list (page 2, per_page 25)',
};

function readRaw(name) {
  const path = join(RAW, name);
  if (!existsSync(path)) throw new Error(`missing raw dump: ${path} (${RAW_SOURCES[name] ?? '?'})`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function write(name, value) {
  const path = join(OUT, name);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return { name, bytes: Buffer.byteLength(JSON.stringify(value)) };
}

/* ------------------------------------------------------------------ store */

const ctx = readRaw('store-context.json');
const branding = readRaw('branding.json');
const languagesRaw = readRaw('languages.json');
const storeRaw = ctx.store.data;
const branch = ctx.branches.data[0] ?? null;

/**
 * The gateway slugs the live store has enabled.
 *
 * NOT invented and NOT guessed: this is the list the theme's own
 * `app/components/product/lib/claims.ts` records as verified against the live
 * store on 2026-09-20. The Admin API surface reachable from MCP does not
 * expose the payment settings, so the verified record is the source. If the
 * merchant changes gateways, this line is the one to update.
 */
const PAYMENTS = ['mada', 'credit_card', 'stc_pay', 'apple_pay'];

const enabledLanguages = languagesRaw.data.filter((l) => l.status === 'enabled');

/**
 * `store.settings.languages` is keyed by iso code; the engine's
 * `languagesToArray` turns it into `[{iso_code, ...}]`. `url` is the flag
 * asset, not the store URL (theme-engine types/index.d.ts:12-13).
 */
const languagesMap = Object.fromEntries(
  enabledLanguages.map((l) => [
    l.iso_code,
    {
      name: l.name,
      code: l.iso_code,
      url: `https://assets.salla.sa/images/flags/${l.iso_code}.svg`,
      is_rtl: l.iso_code === 'ar',
      country_code: storeRaw.kyc_country,
    },
  ])
);

/** Social: only the links the merchant actually filled in. Empty strings dropped. */
const social = Object.fromEntries(
  Object.entries(storeRaw.social ?? {})
    .filter(([key, value]) => typeof value === 'string' && value.trim() !== '' && !key.endsWith('_link'))
    .map(([key, value]) => [key, value])
);

/** Contacts come off the single branch; the store record itself carries none. */
const contacts = {};
if (branch?.contacts?.phone) contacts.phone = branch.contacts.phone;
if (branch?.contacts?.telephone) contacts.mobile = branch.contacts.telephone;
if (branch?.contacts?.whatsapp) contacts.whatsapp = branch.contacts.whatsapp;
if (storeRaw.email) contacts.email = storeRaw.email;

const store = {
  id: storeRaw.id,
  name: storeRaw.name,
  /**
   * The Admin API exposes the custom domain, never the salla.sa username.
   * Empty on purpose: a non-empty value makes the engine's
   * `storeBaseRedirectHref` bounce every localhost request to `/<username>`
   * (theme-engine chunk-XTMHHLNK.js:167-175), which is the dispatcher's
   * multi-store convention and only noise in a single-store preview.
   */
  username: '',
  description: storeRaw.description,
  logo: branding.identity.avatar,
  url: storeRaw.domain,
  icon: branding.identity.favicon || branding.identity.avatar,
  favicon: branding.identity.favicon || branding.identity.avatar,
  about: branding.identity.about?.ar ?? storeRaw.description,
  meta: {
    title: storeRaw.name,
    description: storeRaw.description,
  },
  country: storeRaw.kyc_country,
  store_country: storeRaw.kyc_country,
  is_merchant: false,
  /** One branch, no branch picker: Salla only sends a scope on multi-scope stores. */
  scope: null,
  apps: {},
  contacts,
  social,
  settings: {
    auth: {
      email_allowed: true,
      mobile_allowed: true,
      is_email_required: false,
      force_login: false,
    },
    cart: { apply_coupon_enabled: true },
    product: {
      /** No sales on this store, so the sold counter has nothing true to show. */
      total_sold_enabled: 0,
      manual_quantity: false,
      fit_type: 'contain',
      related_products_enabled: true,
      filters: true,
      show_comments: false,
      user_can_comment: false,
      show_price_as_dash: false,
      notify_options_availability: true,
      show_special_offers: true,
      show_more: true,
      availability_notify: { email: true, sms: false, mobile: false, whatsapp: false },
    },
    category: { testimonial_enabled: false },
    payments: PAYMENTS,
    arabic_numbers_enabled: false,
    content_copyright: false,
    use_sar_symbol: true,
    /** One enabled language (ar). English is present but disabled in the dashboard. */
    is_multilingual: enabledLanguages.length > 1,
    currencies_enabled: false,
    /** Zero reviews exist (reviews_list returned an empty page), so nothing to show. */
    rating_enabled: false,
    blog: { is_enabled: false, allow_likes_and_comments: false },
    is_loyalty_enabled: false,
    is_salla_gateway: true,
    tax: {
      /** The store genuinely has NO tax number. Do not fill this in. */
      number: null,
      certificate: null,
      taxable_prices_enabled: false,
    },
    certificate: null,
    made_in_ksa: false,
    commercial_number: storeRaw.licenses?.commercial_number ?? null,
    freelance_number: storeRaw.licenses?.freelance_number ?? null,
    ticketing_system_enabled: false,
  },
};

/* ------------------------------------------------------------------ theme */

/**
 * `theme.settings` are the booleans the engine and the theme read off the
 * dashboard. Values come from the raw `theme_settings_list` dump when it is
 * present; the fallbacks below are the engine's own defaults for a setting
 * the dump does not carry, never a guess about merchant intent.
 */
function themeSettingValues() {
  let rows = [];
  try {
    rows = readRaw('theme-settings.json').data ?? [];
  } catch {
    rows = [];
  }
  const byId = new Map();
  for (const row of rows) {
    if (!row?.id) continue;
    let value = row.value;
    if (Array.isArray(value)) value = value[0]?.value ?? undefined;
    byId.set(row.id, value);
  }
  return byId;
}

const ts = themeSettingValues();
const pick = (id, fallback) => (ts.has(id) && ts.get(id) !== undefined ? ts.get(id) : fallback);

const theme = {
  name: 'optimalx',
  profile: { id: 0, name: null },
  mode: 'preview',
  is_rtl: true,
  color: {
    primary: branding.identity.color,
    /**
     * Structural companions to the merchant's one configured brand colour.
     * Salla derives these from it; black-on-white / white-on-brand is the
     * light-mode pairing this theme is built for (docs/build/DIRECTION.md).
     */
    text: '#000000',
    is_dark: false,
    reverse_primary: '#ffffff',
    reverse_text: '#ffffff',
  },
  font: {
    name: branding.identity.font_name?.replace(/'/g, '') ?? 'Cairo',
    family_name: branding.identity.font_name?.replace(/'/g, '') ?? 'Cairo',
    url: branding.identity.font_url ?? '',
    type: branding.identity.font_type ?? 'google',
  },
  customization: { css: null, js: null },
  side_menu_enabled: false,
  /**
   * null so the engine falls back to VITE_TWILIGHT_URL from `.env` rather
   * than resolving a pinned release off the production CDN.
   */
  twilight: { version: null },
  isDark: false,
  components: [],
  settings: {
    show_tags: pick('show_tags', true),
    imageZoom: pick('imageZoom', false),
    store_color: branding.identity.color,
    is_custom_js: false,
    homepage_type: 'default',
    footer_is_dark: pick('footer_is_dark', false),
    topnav_is_dark: pick('topnav_is_dark', false),
    use_sar_symbol: true,
    important_links: pick('important_links', true),
    store_font_type: branding.identity.font_type ?? 'google',
    header_is_sticky: pick('header_is_sticky', false),
    header_layout: 'default',
    footer_layout: 'columns',
    default_font_name: branding.identity.font_name?.replace(/'/g, '') ?? 'Cairo',
    sticky_add_to_cart: pick('sticky_add_to_cart', true),
    is_more_button_enabled: pick('is_more_button_enabled', true),
    slider_background_size: pick('slider_background_size', 'contain'),
    vertical_fixed_products: pick('vertical_fixed_products', true),
    squar_photo_bg_image_size: pick('squar_photo_bg_image_size', 'contain'),
    is_breadcrumbs_enabled: pick('is_breadcrumbs', true),
    enable_add_product_toast: pick('enable_add_product_toast', true),
    enable_more_menu: pick('enable_more_menu', true),
  },
};

const storeSettings = {
  status: 200,
  success: true,
  data: {
    store,
    theme,
    languages: languagesMap,
    currencies: {
      [storeRaw.currency]: {
        code: storeRaw.currency,
        name: storeRaw.currency,
        symbol: storeRaw.currency,
        amount: 1,
        country_code: storeRaw.kyc_country,
      },
    },
    external_services: {},
    headers: { 'S-Ray': 50, 's-version-id': 0, 's-scope-id': 0, 's-scope-type': '' },
    login: {
      url: `${storeRaw.domain}/login`,
      turnstile_site_key: '',
      turnstile: { key: '', level: '' },
      social: { google: false, facebook: false, apple: false, x: false },
    },
    affiliate: { utm_url: '', cta_enabled: false },
    policy_url: `${storeRaw.domain}/page/privacy-policy`,
  },
};

/* --------------------------------------------------------------- products */

const productPages = ['products.page1.json', 'products.page2.json'].map(readRaw);
const adminProducts = productPages.flatMap((p) => p.data ?? []);

const money = (m) => (m && typeof m.amount === 'number' ? m.amount : 0);

function mapImages(admin) {
  const rows = Array.isArray(admin.images) ? admin.images : [];
  return rows.map((img, index) => ({
    id: img.id,
    url: img.url,
    /** The store uploaded no alt text. Null, not a generated sentence. */
    alt: img.alt ?? null,
    type: img.type === 'video' ? 'video' : 'image',
    video_url: img.video_url ?? undefined,
    three_d_image_url: img.three_d_image_url || undefined,
    main: Boolean(img.main),
    sort: typeof img.sort === 'number' ? img.sort : index,
  }));
}

function mapOptionValues(option) {
  return (option.values ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    price: money(v.price),
    image_url: v.image_url ?? undefined,
    is_selected: Boolean(v.is_default),
  }));
}

/** `products/{id}/details` sends `details` where the list sends `values`. */
function mapOptionDetails(option) {
  return (option.values ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    option_id: option.id,
    additional_price: money(v.price),
    option_value: v.name,
    image: v.image_url ?? '',
    color: option.display_type === 'color' ? (v.display_value ?? '') : '',
    code: String(v.id),
    is_out: Boolean(v.is_out_of_stock),
    is_default: v.is_default ? 1 : 0,
    skus_availability: {},
  }));
}

function mapSkus(admin) {
  return (admin.skus ?? []).map((s) => ({
    id: s.id,
    product_id: s.product_id,
    price: s.price,
    regular_price: s.regular_price,
    sale_price: s.sale_price ?? null,
    has_special_price: Boolean(s.has_special_price),
    stock_quantity: s.unlimited_quantity ? null : (s.stock_quantity ?? null),
    unlimited_quantity: Boolean(s.unlimited_quantity),
    is_default: Boolean(s.is_default),
    related_options: s.related_options ?? [],
    related_option_values: s.related_option_values ?? [],
  }));
}

function mapProduct(admin, { detail }) {
  const price = money(admin.price);
  const regular = money(admin.regular_price) || price;
  const sale = money(admin.sale_price);
  const onSale = sale > 0 && sale < regular;
  const images = mapImages(admin);
  const main = images.find((i) => i.main) ?? images[0] ?? null;
  const unlimited = Boolean(admin.unlimited_quantity);
  const quantity = unlimited ? null : (admin.quantity ?? null);
  const outOfStock = !admin.is_available || (!unlimited && (quantity ?? 0) <= 0);
  const options = admin.options ?? [];
  const description = admin.description ?? '';

  const product = {
    id: admin.id,
    name: admin.name,
    description,
    url: admin.url,
    promotion_title: admin.promotion?.title ?? undefined,
    subtitle: admin.promotion?.sub_title ?? undefined,
    type: admin.type,
    status: admin.status,
    weight: admin.weight != null ? String(admin.weight) : null,
    calories: admin.calories ?? null,
    sku: admin.sku ?? null,
    mpn: admin.mpn ?? null,
    gtin: admin.gtin ?? null,
    price,
    /** 0 when nothing is discounted — the same signal the live API sends. */
    sale_price: onSale ? sale : 0,
    regular_price: regular,
    starting_price: null,
    base_currency_price: { currency: admin.price?.currency ?? 'SAR', amount: price },
    currency: admin.price?.currency ?? 'SAR',
    /** Arithmetic over the store's own two numbers; absent when not on sale. */
    discount_percentage: onSale ? `${Math.round(((regular - sale) / regular) * 100)}%` : undefined,
    price_as_float: onSale ? sale : price,
    price_as_float_for_payment: onSale ? sale : price,
    currency_for_payment: admin.price?.currency ?? 'SAR',
    quantity,
    /** Real figure from the Admin API. Every product on this store is 0. */
    sold_quantity: admin.sold_quantity ?? 0,
    /**
     * Salla sends the per-order cap. The merchant set none, so the honest cap
     * is the stock on hand; an unlimited product gets 0, which the engine
     * reads as "no cap".
     */
    max_quantity: admin.maximum_quantity_per_order ?? (unlimited ? 0 : (quantity ?? 0)),
    /**
     * ZERO reviews exist on this store (reviews_list returned an empty page).
     * The Admin API's constant `{total:0,count:1,rate:0}` is not a review
     * count and is deliberately not carried through.
     */
    rating: { count: 0, stars: 0 },
    /** No categories, no brands and no tags exist on this store. */
    category: undefined,
    brand: undefined,
    tags: [],
    image: main ?? { url: undefined, alt: null },
    images,
    is_taxable: Boolean(admin.with_tax),
    /** Derived from the real description length, the same cue Salla uses. */
    has_read_more: description.length > 600,
    can_add_note: Boolean(admin.enable_note),
    can_show_remained_quantity: !admin.hide_quantity && !unlimited,
    /** No product has ever sold, so there is no sold count worth drawing. */
    can_show_sold: false,
    can_upload_file: Boolean(admin.enable_upload_image || admin.allow_attachments),
    has_custom_form: options.some((o) => o.purpose && o.purpose !== 'variants'),
    has_metadata: Boolean(admin.metadata && admin.metadata.title),
    has_options: options.length > 0,
    has_bundle_products: Boolean(admin.consisted_products?.length),
    is_on_sale: onSale,
    is_hidden_quantity: Boolean(admin.hide_quantity),
    is_available: Boolean(admin.is_available),
    is_in_wishlist: false,
    is_out_of_stock: outOfStock,
    is_require_shipping: Boolean(admin.require_shipping),
    has_3d_image: images.some((i) => i.three_d_image_url),
    /** No size guide is configured on any product. */
    has_size_guide: false,
    giftable: false,
    can_quick_buy: false,
    show_availability: !unlimited,
    has_preorder_campaign: false,
    notify_availability: {
      channels: ['email'],
      subscribed: false,
      options: false,
    },
  };

  if (options.length > 0) {
    product.options = options.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.display_type === 'color' ? 'color' : o.type,
      required: Boolean(o.required),
      ...(detail ? { details: mapOptionDetails(o) } : { values: mapOptionValues(o) }),
    }));
  }
  if (detail && admin.skus?.length) product.skus = mapSkus(admin);

  return product;
}

const listProducts = adminProducts.map((p) => mapProduct(p, { detail: false }));
const detailProducts = Object.fromEntries(
  adminProducts.map((p) => [String(p.id), mapProduct(p, { detail: true })])
);

/* ---------------------------------------------------------------- the rest */

const categories = readRaw('categories.json').data ?? [];
const menusRaw = readRaw('menus.json');
const reviews = readRaw('reviews.json');

/** Menu id → storefront slot. The store's two menus are the generic header/footer pair. */
function menuItems(name) {
  const hit = (menusRaw.menus ?? []).find((m) => m.name?.includes(name));
  return (hit?.items ?? []).map((item) => ({
    id: item.id,
    title: item.name ?? item.title,
    url: item.url ?? '',
    ...(item.children?.length ? { children: item.children, has_children: true } : {}),
  }));
}

/**
 * The merchant's configured homepage blocks, carried through honestly.
 *
 * These are the blocks of the theme that is live in the dashboard, not this
 * theme's `ox-*` blocks, so `app/routes/index.tsx` will not recognise them and
 * will render the twelve default OptimalX blocks instead — which is exactly
 * what a visitor meets today. Serving the real list rather than an empty one
 * keeps the snapshot truthful about what the dashboard holds.
 */
const homeComponents = (readRaw('homepage-components.json').store_blocks ?? [])
  .filter((b) => b.is_visible)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((b) => ({
    path: `home.${String(b.slug).replace(/_/g, '-')}`,
    key: b.key ?? String(b.id),
    title: b.title ?? undefined,
    component: {},
  }));

const written = [
  write('store-settings.json', storeSettings),
  write('products.json', listProducts),
  write('product-details.json', detailProducts),
  write('categories.json', categories),
  write('brands.json', []),
  write('menus.json', { header: menuItems('رأس الصفحة'), footer: menuItems('ذيل الصفحة') }),
  write('home-components.json', homeComponents),
  write('apps.json', { snippets: [], settings: { apps: {} } }),
  /**
   * Salla's own CDN translation bundle (the i18n `app` namespace). Served
   * empty: this theme ships the same keys in `locales/`, which reach i18next
   * as the `theme` fallback namespace, so no string is lost.
   */
  write('translations.json', {}),
  write('meta.json', {
    generated_at: new Date().toISOString(),
    generator: 'scripts/snapshot-store.mjs',
    transport: 'Salla Admin API via MCP — no request is made to api.salla.dev',
    store: { id: store.id, name: store.name, url: store.url, currency: storeRaw.currency },
    counts: {
      products: listProducts.length,
      product_details: Object.keys(detailProducts).length,
      categories: categories.length,
      brands: 0,
      reviews: reviews.pagination?.total ?? 0,
      menu_header_items: menuItems('رأس الصفحة').length,
      menu_footer_items: menuItems('ذيل الصفحة').length,
      home_components: homeComponents.length,
    },
    raw_sources: RAW_SOURCES,
  }),
];

mkdirSync(OUT, { recursive: true });
for (const f of written) console.log(`wrote fixtures/store/${f.name} (${f.bytes} bytes)`);
console.log(
  `\n${listProducts.length} products, ${categories.length} categories, 0 brands, ${reviews.pagination?.total ?? 0} reviews — no network call was made.`
);
