// lang-overlay.mjs — pure, synchronous helpers that turn the Arabic
// snapshot `scripts/serve-store.mjs` serves by default into its English
// twin for `accept-language: en`. No filesystem, no network, no side
// effects: every function here takes plain data in and returns new plain
// data, so it is unit-testable without starting the mock's HTTP server.
//
// WHY: the live Salla API answers a product's translation when the
// merchant has one and the request carries `accept-language: en`
// (confirmed: node_modules/@salla.sa/twilight-theme-engine's
// `sharedHeaders()` sets that header from the engine's own locale on every
// call). The offline snapshot has no such mechanism — it is one static
// capture — so this module is what makes the mock behave the same way the
// real API does for a merchant who HAS entered English translations,
// using the CSV twins `scripts/gen-products-en.mjs` already vetted.

/**
 * @typedef {{ name: string, subtitle: string, description: string }} EnglishFields
 */

/**
 * One product, overlaid with its English twin when the overlay carries one
 * for that product's id. A product with no twin in the overlay is returned
 * unchanged (Arabic) — never invented.
 * @param {Record<string, any>} product
 * @param {Record<string, EnglishFields>} overlay  product id (string) -> English fields
 * @returns {Record<string, any>}
 */
export function overlayProduct(product, overlay) {
  const twin = overlay[String(product.id)];
  if (!twin) return product;
  return { ...product, name: twin.name, subtitle: twin.subtitle, description: twin.description };
}

/**
 * `products.json`-shaped array, each item overlaid.
 * @param {any[]} products
 * @param {Record<string, EnglishFields>} overlay
 */
export function overlayProducts(products, overlay) {
  return products.map((product) => overlayProduct(product, overlay));
}

/**
 * `product-details.json`-shaped object (id -> product), each value overlaid.
 * @param {Record<string, any>} details
 * @param {Record<string, EnglishFields>} overlay
 */
export function overlayDetails(details, overlay) {
  /** @type {Record<string, any>} */
  const out = {};
  for (const [id, product] of Object.entries(details)) out[id] = overlayProduct(product, overlay);
  return out;
}

/**
 * Reads the one path segment before the numeric `c<id>` segment out of an
 * overlay category/menu-item URL (`https://.../whey-protein/c9011` ->
 * `whey-protein`), the same slug `app/content/taxonomy.json` nodes carry.
 * @param {string | undefined} url
 * @returns {string | null}
 */
export function slugFromCategoryUrl(url) {
  const match = /\/([a-z0-9-]+)\/c\d+(?:$|[/?#])/i.exec(url ?? '');
  return match ? match[1] : null;
}

/**
 * slug -> English name, built once from the 25-node taxonomy and the
 * theme's own `ox.tax.<key>.name` strings. A node with no matching locale
 * key is left out of the map — never invented.
 * @param {{ nodes: { slug: string, key: string }[] }} taxonomy
 * @param {Record<string, string>} enLocale
 * @returns {Map<string, string>}
 */
export function buildCategoryNameMap(taxonomy, enLocale) {
  const map = new Map();
  for (const node of taxonomy.nodes ?? []) {
    const name = enLocale[`ox.tax.${node.key}.name`];
    if (name) map.set(node.slug, name);
  }
  return map;
}

/**
 * One overlay category node (and its `sub_categories`, recursively),
 * `name` swapped to English when the slug parsed from its `url` is in
 * `nameMap`; unchanged otherwise.
 * @param {any} category
 * @param {Map<string, string>} nameMap
 */
export function overlayCategory(category, nameMap) {
  const slug = slugFromCategoryUrl(category.url);
  const name = slug ? nameMap.get(slug) : undefined;
  const sub_categories = category.sub_categories?.length
    ? category.sub_categories.map((child) => overlayCategory(child, nameMap))
    : category.sub_categories;
  return { ...category, ...(name ? { name } : {}), sub_categories };
}

/** @param {any[]} categories @param {Map<string, string>} nameMap */
export function overlayCategories(categories, nameMap) {
  return categories.map((category) => overlayCategory(category, nameMap));
}

/**
 * One menu item (`title`, not `name`; `children`, not `sub_categories` —
 * `scripts/gen-taxonomy-fixture.mjs`'s own shape), recursively overlaid.
 * @param {any} item
 * @param {Map<string, string>} nameMap
 */
export function overlayMenuItem(item, nameMap) {
  const slug = slugFromCategoryUrl(item.url);
  const title = slug ? nameMap.get(slug) : undefined;
  const children = item.children?.length ? item.children.map((child) => overlayMenuItem(child, nameMap)) : item.children;
  return { ...item, ...(title ? { title } : {}), children };
}

/** @param {{ header: any[], footer: any[] }} menus @param {Map<string, string>} nameMap */
export function overlayMenus(menus, nameMap) {
  /** @type {Record<string, any[]>} */
  const out = {};
  for (const [slot, items] of Object.entries(menus)) out[slot] = (items ?? []).map((item) => overlayMenuItem(item, nameMap));
  return out;
}

/**
 * The two-letter language the engine's `accept-language` header (or a
 * manual `?lang=` query override, for curling the mock by hand) asks for.
 * Anything other than `en` resolves to `ar`, the snapshot's own language —
 * the Arabic path must never depend on this parsing being exhaustive.
 * @param {string | undefined | null} acceptLanguageHeader
 * @param {string | undefined | null} queryLang
 * @returns {'ar' | 'en'}
 */
export function resolveLang(acceptLanguageHeader, queryLang) {
  const raw = queryLang || acceptLanguageHeader || 'ar';
  const primary = String(raw).split(',')[0].split(';')[0].trim().slice(0, 2).toLowerCase();
  return primary === 'en' ? 'en' : 'ar';
}
