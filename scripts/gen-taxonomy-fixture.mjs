#!/usr/bin/env node
// gen-taxonomy-fixture.mjs — writes the offline preview's taxonomy overlay
// (PLAN-ship Batch S1 step 7):
//
//   fixtures/store/overlay/categories.json   the 25 nodes as storefront
//                                            categories, children nested
//   fixtures/store/overlay/menus.json        the same tree as a header menu
//   fixtures/store/overlay/membership.json   category id -> product ids
//
// `scripts/serve-store.mjs` serves these INSTEAD of the snapshot's empty
// categories and menus when it is started with `OFFLINE_TAXONOMY=1`, and
// uses the membership map to answer `products?source=categories`. Without
// the variable the snapshot stays honest: the live store has zero
// categories today, and the default preview shows that.
//
// Everything here is derived, never typed: the structure and SKU membership
// from app/content/taxonomy.json (Contract A), the Arabic name and
// description from locales/partials/tax.ar.json, the image and the product
// ids from fixtures/store/products.json, the URL origin from
// fixtures/store/meta.json. Re-run it after any of those change.
//
// Ids are 9000 + the node's `order`, so they can never collide with a real
// Salla id (nine digits) and a reader can tell an overlay category from a
// live one at a glance. The URL is `<store url>/<slug>/c<id>`: the STORE
// origin, the same one the fixture's product URLs carry, because the
// engine's navigation interceptor only client-routes an anchor whose origin
// equals `store.url` (theme-engine chunk-63GHZIAG.js resolveRelativePath);
// a localhost origin would be a full page load, and a direct URL on
// localhost without `?storeId=` renders the home for every ASCII path
// (docs/build/offline-preview.md).
//
// Run: node scripts/gen-taxonomy-fixture.mjs [--check]
//   --check  exits 1 when a file on disk differs from what would be written,
//            and writes nothing.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const TAXONOMY_JSON = path.join('app', 'content', 'taxonomy.json');
export const PRODUCTS_JSON = path.join('fixtures', 'store', 'products.json');
export const META_JSON = path.join('fixtures', 'store', 'meta.json');
export const NAMES_JSON = path.join('locales', 'partials', 'tax.ar.json');
export const OVERLAY_DIR = path.join('fixtures', 'store', 'overlay');
export const ID_BASE = 9000;

/**
 * @typedef {{ key: string, slug: string, scope: string, parent: string | null, order: number, skus: string[], image_sku?: string }} RawNode
 * @typedef {{ id: number, sku?: string, image?: { url?: string } | null }} FixtureProduct
 */

/**
 * The three overlay documents, from the inputs alone (no file system), so a
 * test can assert the shape without writing anything.
 *
 * @param {{ nodes: RawNode[], products: FixtureProduct[], names: Record<string, string>, storeUrl: string }} input
 */
export function build({ nodes, products, names, storeUrl }) {
  const origin = storeUrl.replace(/\/+$/, '');
  const byOrder = [...nodes].sort((a, b) => a.order - b.order);
  const productBySku = new Map(products.filter((p) => p.sku).map((p) => [p.sku, p]));
  const membership = {};

  const idOf = (node) => ID_BASE + node.order;

  const toCategory = (node) => {
    const id = idOf(node);
    const members = node.skus.map((sku) => productBySku.get(sku)).filter(Boolean);
    membership[String(id)] = members.map((p) => p.id);
    const imageProduct = node.image_sku ? productBySku.get(node.image_sku) : undefined;
    const children = byOrder.filter((child) => child.parent === node.slug).map(toCategory);
    return {
      // Both id forms the engine's Category type names: the API's `id` and
      // the raw numeric `id_` (useTaxonomyLinks reads `id_` first).
      id,
      id_: id,
      name: names[`ox.tax.${node.key}.name`] ?? node.slug,
      description: names[`ox.tax.${node.key}.description`] ?? '',
      url: `${origin}/${node.slug}/c${id}`,
      icon: null,
      image: imageProduct?.image?.url ?? null,
      products_count: members.length,
      sub_categories: children,
      items: null,
    };
  };

  const categories = byOrder.filter((node) => node.parent === null).map(toCategory);

  const toMenu = (category) => ({
    id: category.id,
    title: category.name,
    url: category.url,
    image: category.image,
    children: category.sub_categories.map(toMenu),
    has_children: category.sub_categories.length > 0,
  });

  return {
    categories,
    menus: { header: categories.map(toMenu), footer: [] },
    membership,
  };
}

/** The inputs, read from the repo. */
export function readInputs(root = process.cwd()) {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const meta = read(META_JSON);
  const storeUrl = meta?.store?.url;
  if (typeof storeUrl !== 'string' || storeUrl.length === 0) {
    throw new Error(`${META_JSON} carries no store.url; the overlay URLs need the store origin`);
  }
  return {
    nodes: read(TAXONOMY_JSON).nodes,
    products: read(PRODUCTS_JSON),
    names: read(NAMES_JSON),
    storeUrl,
  };
}

/** The three files as they would be written, keyed by basename. */
export function renderFiles(input) {
  const { categories, menus, membership } = build(input);
  const text = (value) => `${JSON.stringify(value, null, 2)}\n`;
  return {
    'categories.json': text(categories),
    'menus.json': text(menus),
    'membership.json': text(membership),
  };
}

function main(args) {
  const files = renderFiles(readInputs());
  const dir = path.join(process.cwd(), OVERLAY_DIR);
  if (args.includes('--check')) {
    const stale = Object.entries(files).filter(([name, output]) => {
      const target = path.join(dir, name);
      return !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output;
    });
    if (stale.length > 0) {
      console.error(
        `${OVERLAY_DIR}: ${stale.map(([name]) => name).join(', ')} out of date; run node scripts/gen-taxonomy-fixture.mjs`
      );
      return 1;
    }
    console.log(`gen-taxonomy-fixture: ${OVERLAY_DIR} up to date`);
    return 0;
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, output] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), output, 'utf8');
  }
  const { categories, membership } = build(readInputs());
  const total = categories.reduce((n, c) => n + 1 + c.sub_categories.length, 0);
  const assigned = Object.values(membership).reduce((n, ids) => n + ids.length, 0);
  console.log(
    `gen-taxonomy-fixture: wrote ${total} categories (${categories.length} roots), ${assigned} product assignments to ${OVERLAY_DIR}`
  );
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
