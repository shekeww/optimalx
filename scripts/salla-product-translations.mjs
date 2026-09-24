#!/usr/bin/env node
// salla-product-translations.mjs, writes the live store's English product
// translations: the `translations.en` object Salla's Update Product
// endpoint accepts (PUT /admin/v2/products/{id} or
// /admin/v2/products/sku/{sku}, scope products.read_write; the
// multi-language variables docs.salla.dev/421122m0 documents for products
// are name, description, promotion titles and metadata title/description/
// url, the storefront's own product response already names the
// promotional-line field `subtitle` (fixtures/store/product-details.json),
// which this script sends as `translations.en.subtitle`; verify that field
// name against the live docs before ever running --apply, since this
// session had no access to fetch them).
//
// Reads the SAME twins scripts/gen-products-en.mjs reads (CSV by SKU) and
// gates them through the SAME copy/claims checks (`gateTwin`), so the
// offline preview and the live store never disagree about which products
// carry real English copy.
//
// Usage:
//   node scripts/salla-product-translations.mjs             # dry run (default), no network call
//   node scripts/salla-product-translations.mjs --apply      # PUTs, reads back with
//                                                              accept-language: en, diffs, logs
//
// Category translations (translations.en.name for the taxonomy's 25 nodes)
// are only attempted when the store has actually created its categories
// (docs/build/taxonomy-ids.json, written by scripts/salla-categories.mjs
// --apply); docs/build/store-write-log.md carries no category_create entry
// yet, so today this is always "skipped", reported, never invented.
//
// THIS SESSION: dry run only. --apply is implemented and unit-tested with
// an injected fetch, but is never invoked here.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT,
  createSallaClient,
  resolveAccessToken,
  appendRunLog,
  generateRunId,
  nowIso,
  SallaChallengeError,
} from './salla-lib.mjs';
import { loadTwinsFromCsv, gateTwin } from './gen-products-en.mjs';

export const SALLA_IDS_PATH = path.join(ROOT, 'docs', 'build', 'salla-ids.json');
export const TAXONOMY_IDS_PATH = path.join(ROOT, 'docs', 'build', 'taxonomy-ids.json');
export const TAXONOMY_JSON_PATH = path.join(ROOT, 'app', 'content', 'taxonomy.json');
export const EN_LOCALE_PATH = path.join(ROOT, 'locales', 'en.json');

/**
 * @typedef {{ sku: string, id: number | null, status: 'ready' | 'no-twin' | 'gated' | 'no-id',
 *   problems?: string[], payload?: { translations: { en: { name: string, description: string, subtitle: string } } } }} ProductPlanRow
 */

/**
 * One row per SKU in `docs/build/salla-ids.json`: the CSV twin, gated the
 * same way `gen-products-en.mjs` gates the preview overlay, paired with the
 * store's own product id. A SKU with no twin, a twin that fails the gate,
 * or no recorded Salla id never gets a payload.
 * @param {{ sallaIds: Record<string, { id: number }>, twins: Map<string, import('./gen-products-en.mjs').EnglishTwin> }} opts
 * @returns {ProductPlanRow[]}
 */
export function buildProductTranslationPlan({ sallaIds, twins }) {
  return Object.entries(sallaIds).map(([sku, entry]) => {
    const twin = twins.get(sku);
    if (!twin) return { sku, id: entry.id ?? null, status: 'no-twin' };
    const problems = gateTwin(twin);
    if (problems.length) return { sku, id: entry.id ?? null, status: 'gated', problems };
    if (!entry.id) return { sku, id: null, status: 'no-id' };
    return {
      sku,
      id: entry.id,
      status: 'ready',
      payload: { translations: { en: { name: twin.name, description: twin.description, subtitle: twin.subtitle } } },
    };
  });
}

/**
 * @typedef {{ slug: string, id: number | null, status: 'ready' | 'no-id' | 'no-name',
 *   payload?: { translations: { en: { name: string } } } }} CategoryPlanRow
 */

/**
 * translations.en.name for every taxonomy node the store has actually
 * created a category for. Returns `skipped: true` with a reason (never a
 * network call, never an invented id) when `docs/build/taxonomy-ids.json`
 * does not exist yet.
 * @param {{ taxonomyIdsPath?: string, taxonomyJsonPath?: string, enLocalePath?: string }} [opts]
 * @returns {{ skipped: true, reason: string } | { skipped: false, rows: CategoryPlanRow[] }}
 */
export function buildCategoryTranslationPlan({
  taxonomyIdsPath = TAXONOMY_IDS_PATH,
  taxonomyJsonPath = TAXONOMY_JSON_PATH,
  enLocalePath = EN_LOCALE_PATH,
} = {}) {
  if (!fs.existsSync(taxonomyIdsPath)) {
    return {
      skipped: true,
      reason: `${taxonomyIdsPath} not found, the store has not created its categories yet (no category_create entry in docs/build/store-write-log.md); run scripts/salla-categories.mjs --apply first`,
    };
  }
  const ids = JSON.parse(fs.readFileSync(taxonomyIdsPath, 'utf8'));
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyJsonPath, 'utf8'));
  const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf8'));
  const rows = taxonomy.nodes.map((node) => {
    const id = ids[node.slug] ?? null;
    const name = enLocale[`ox.tax.${node.key}.name`];
    if (!id) return { slug: node.slug, id: null, status: 'no-id' };
    if (!name) return { slug: node.slug, id, status: 'no-name' };
    return { slug: node.slug, id, status: 'ready', payload: { translations: { en: { name } } } };
  });
  return { skipped: false, rows };
}

/** @param {ProductPlanRow[]} rows */
function summarizeProductRows(rows) {
  const byStatus = (status) => rows.filter((r) => r.status === status);
  return {
    ready: byStatus('ready').length,
    noTwin: byStatus('no-twin').length,
    gated: byStatus('gated').length,
    noId: byStatus('no-id').length,
  };
}

/**
 * @param {ProductPlanRow[]} productRows
 * @param {ReturnType<typeof buildCategoryTranslationPlan>} categoryPlan
 */
export function formatPlanTable(productRows, categoryPlan) {
  const lines = [];
  lines.push('Product translations (dry run, no network call):');
  lines.push('SKU     | Salla id    | status  | name (en)');
  for (const row of productRows) {
    const name = row.payload?.translations.en.name ?? '';
    lines.push(`${row.sku.padEnd(7)} | ${String(row.id ?? '-').padEnd(11)} | ${row.status.padEnd(7)} | ${name}`);
  }
  const s = summarizeProductRows(productRows);
  lines.push(
    `${productRows.length} product(s): ${s.ready} ready, ${s.noTwin} no CSV twin, ${s.gated} gated (copy/claims), ${s.noId} no Salla id.`
  );
  for (const row of productRows.filter((r) => r.status === 'gated')) {
    lines.push(`  gated ${row.sku}: ${(row.problems ?? []).join('; ')}`);
  }

  if (categoryPlan.skipped) {
    lines.push(`Category translations: skipped, ${categoryPlan.reason}`);
  } else {
    lines.push(`Category translations (${categoryPlan.rows.length} node(s)):`);
    for (const row of categoryPlan.rows) lines.push(`  ${row.slug} -> id ${row.id ?? '-'} [${row.status}]`);
  }
  return lines.join('\n');
}

/* =================================================================== *
 * --apply (network; never invoked this session)
 * =================================================================== */

async function apiSendJson(client, pathname, method, body) {
  const response = await client.request(pathname, { method, body: JSON.stringify(body) });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!response.ok) throw new Error(`${method} ${pathname} failed: HTTP ${response.status}: ${text.slice(0, 300)}`);
  return json;
}

async function apiGetEnglish(client, pathname) {
  const response = await client.request(pathname, { method: 'GET', headers: { 'accept-language': 'en' } });
  if (!response.ok) throw new Error(`GET ${pathname} failed: HTTP ${response.status}`);
  return (await response.json()).data ?? {};
}

function diffFields(expected, actual, fields) {
  const diffs = [];
  for (const field of fields) {
    if (String(expected[field] ?? '') !== String(actual?.[field] ?? '')) {
      diffs.push({ field, expected: expected[field], actual: actual?.[field] });
    }
  }
  return diffs;
}

function baseAction(type, target) {
  return { when: nowIso(), type, target };
}

/** Writes one product's translation, reads it back with `accept-language:
 * en`, and diffs name/description/subtitle. */
export async function applyProductTranslation(client, row) {
  await apiSendJson(client, `/products/${row.id}`, 'PUT', row.payload);
  const readback = await apiGetEnglish(client, `/products/${row.id}`);
  const diffs = diffFields(row.payload.translations.en, readback, ['name', 'description', 'subtitle']);
  return { readback, diffs };
}

/** Writes one category's translations.en.name, reads it back, and diffs. */
export async function applyCategoryTranslation(client, row) {
  await apiSendJson(client, `/categories/${row.id}`, 'PUT', row.payload);
  const response = await client.request(`/categories/${row.id}`, { method: 'GET', headers: { 'accept-language': 'en' } });
  if (!response.ok) throw new Error(`GET /categories/${row.id} failed: HTTP ${response.status}`);
  const readback = (await response.json()).data ?? {};
  const diffs = diffFields(row.payload.translations.en, readback, ['name']);
  return { readback, diffs };
}

/**
 * Orchestrates one `--apply` run: every `ready` product, then every `ready`
 * category (when the category plan is not skipped). Always appends
 * whatever actions completed to `store-write-log.md`, even on a mid-run
 * failure, so a partial run is never silently lost.
 * @param {{ client: ReturnType<typeof createSallaClient>, productRows: ProductPlanRow[],
 *   categoryPlan: ReturnType<typeof buildCategoryTranslationPlan>, runId: string,
 *   log?: typeof console.log, writeLog?: typeof appendRunLog }} opts
 */
export async function runApply({ client, productRows, categoryPlan, runId, log = console.log, writeLog = appendRunLog }) {
  const startedAt = nowIso();
  const actions = [];
  try {
    for (const row of productRows.filter((r) => r.status === 'ready')) {
      // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
      const { diffs } = await applyProductTranslation(client, row);
      actions.push({
        ...baseAction('product_translation_update', row.sku),
        id: row.id,
        result: `translations.en set for id ${row.id}`,
        readback: diffs.length ? `DIFF ${JSON.stringify(diffs)}` : 'name/description/subtitle match',
      });
      log(`product ${row.sku} (${row.id}): translation written${diffs.length ? `, DIFF ${JSON.stringify(diffs)}` : ', read-back matches'}`);
    }

    if (!categoryPlan.skipped) {
      for (const row of categoryPlan.rows.filter((r) => r.status === 'ready')) {
        // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
        const { diffs } = await applyCategoryTranslation(client, row);
        actions.push({
          ...baseAction('category_translation_update', row.slug),
          id: row.id,
          result: `translations.en.name set for id ${row.id}`,
          readback: diffs.length ? `DIFF ${JSON.stringify(diffs)}` : 'name matches',
        });
        log(`category ${row.slug} (${row.id}): translation written${diffs.length ? `, DIFF ${JSON.stringify(diffs)}` : ', read-back matches'}`);
      }
    }

    return { runId, actions };
  } finally {
    writeLog({ runId, mode: 'apply', startedAt, finishedAt: nowIso(), actions });
  }
}

/* =================================================================== *
 * CLI
 * =================================================================== */

function loadContext() {
  const sallaIds = JSON.parse(fs.readFileSync(SALLA_IDS_PATH, 'utf8'));
  const twins = loadTwinsFromCsv();
  const productRows = buildProductTranslationPlan({ sallaIds, twins });
  const categoryPlan = buildCategoryTranslationPlan();
  return { productRows, categoryPlan };
}

/** @param {string[]} argv */
async function main(argv) {
  const apply = argv.includes('--apply');
  const { productRows, categoryPlan } = loadContext();

  if (!apply) {
    console.log(formatPlanTable(productRows, categoryPlan));
    return 0;
  }

  const { token } = resolveAccessToken();
  if (!token) throw new Error('no access token available; run node scripts/salla-auth.mjs first, or set SALLA_ACCESS_TOKEN');
  const client = createSallaClient({ token });
  const runId = generateRunId('s9f');

  try {
    const result = await runApply({ client, productRows, categoryPlan, runId });
    console.log(`apply run ${runId}: ${result.actions.length} action(s) logged to docs/build/store-write-log.md`);
    return 0;
  } catch (error) {
    if (error instanceof SallaChallengeError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`salla-product-translations: ${error.message}`);
      process.exitCode = 1;
    });
}
