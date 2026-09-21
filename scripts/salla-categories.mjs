#!/usr/bin/env node
// salla-categories.mjs — takes the owner's taxonomy and brands into the live
// Salla store: 25 categories (10 type roots, 5 protein children, 4 utility,
// 6 goals), the brands in FINAL-catalogue.md §B, and the 47 product
// assignments (categories + brand_id), all idempotent and reversible.
//
// Usage:
//   node scripts/salla-categories.mjs --plan
//   node scripts/salla-categories.mjs --apply [--brands] [--assign] [--images]
//   node scripts/salla-categories.mjs --rollback <run-id>
//
// --plan makes NO network call: every function it reaches reads only local
// files (app/content/taxonomy.json when S1 has landed Contract A, else
// FINAL-catalogue.md §A + docs/build/research/optimalx-catalogue.csv, with a
// printed warning). --apply and --rollback need a token (scripts/salla-auth.mjs
// or SALLA_ACCESS_TOKEN) and talk to https://api.salla.dev/admin/v2 through
// scripts/salla-lib.mjs's rate-limited, challenge-aware client. Every write
// is read back, diffed, and appended to docs/build/store-write-log.md under
// a run id; --rollback undoes exactly what that run id created.
//
// THIS SESSION: --plan only. --apply is implemented and unit-tested with an
// injected fetch, but is never invoked here.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT,
  createSallaClient,
  resolveAccessToken,
  appendRunLog,
  readRunLog,
  generateRunId,
  nowIso,
  SallaChallengeError,
} from './salla-lib.mjs';

export const TAXONOMY_JSON_PATH = path.join(ROOT, 'app', 'content', 'taxonomy.json');
export const TAX_AR_PATH = path.join(ROOT, 'locales', 'partials', 'tax.ar.json');
export const TAX_EN_PATH = path.join(ROOT, 'locales', 'partials', 'tax.en.json');
export const CSV_PATH = path.join(ROOT, 'docs', 'build', 'research', 'optimalx-catalogue.csv');
export const SALLA_IDS_PATH = path.join(ROOT, 'docs', 'build', 'salla-ids.json');
export const TAXONOMY_IDS_PATH = path.join(ROOT, 'docs', 'build', 'taxonomy-ids.json');
export const PRODUCTS_FIXTURE_PATH = path.join(ROOT, 'fixtures', 'store', 'products.json');

/* =================================================================== *
 * Taxonomy: conductor §4 / FINAL-catalogue.md §A, used only until
 * app/content/taxonomy.json (Contract A) exists.
 * =================================================================== */

/**
 * @typedef {{ key: string, slug: string, scope: 'type' | 'goal' | 'utility',
 *   parent: string | null, order: number, nameAr: string, nameEn: string }} TaxonomyBase
 * @typedef {TaxonomyBase & { skus: string[], imageSku?: string }} TaxonomyNode
 */

/** @type {TaxonomyBase[]} */
export const TAXONOMY_FALLBACK = [
  // 10 type roots
  { key: 'protein', slug: 'protein', scope: 'type', parent: null, order: 1, nameAr: 'بروتين', nameEn: 'Protein' },
  { key: 'creatine', slug: 'creatine', scope: 'type', parent: null, order: 2, nameAr: 'كرياتين', nameEn: 'Creatine' },
  { key: 'pre_workout', slug: 'pre-workout', scope: 'type', parent: null, order: 3, nameAr: 'ما قبل التمرين', nameEn: 'Pre-Workout' },
  { key: 'amino_acids', slug: 'amino-acids', scope: 'type', parent: null, order: 4, nameAr: 'الأحماض الأمينية', nameEn: 'Amino Acids' },
  { key: 'omega_3', slug: 'omega-3', scope: 'type', parent: null, order: 5, nameAr: 'اوميغا 3 والزيوت', nameEn: 'Omega-3 & Oils' },
  { key: 'vitamins_minerals', slug: 'vitamins-minerals', scope: 'type', parent: null, order: 6, nameAr: 'الفيتامينات والمعادن', nameEn: 'Vitamins & Minerals' },
  { key: 'collagen_beauty', slug: 'collagen-beauty', scope: 'type', parent: null, order: 7, nameAr: 'الكولاجين والجمال', nameEn: 'Collagen & Beauty' },
  { key: 'daily_health', slug: 'daily-health', scope: 'type', parent: null, order: 8, nameAr: 'الصحة اليومية', nameEn: 'Daily Health' },
  { key: 'snacks_bars', slug: 'snacks-bars', scope: 'type', parent: null, order: 9, nameAr: 'سناكات وبروتين بار', nameEn: 'Snacks & Protein Bars' },
  { key: 'accessories', slug: 'accessories', scope: 'type', parent: null, order: 10, nameAr: 'الإكسسوارات', nameEn: 'Accessories' },
  // 5 protein children
  { key: 'whey_protein', slug: 'whey-protein', scope: 'type', parent: 'protein', order: 11, nameAr: 'واي بروتين', nameEn: 'Whey Protein' },
  { key: 'whey_isolate', slug: 'whey-isolate', scope: 'type', parent: 'protein', order: 12, nameAr: 'واي بروتين ايزوليت', nameEn: 'Whey Protein Isolate' },
  { key: 'casein', slug: 'casein', scope: 'type', parent: 'protein', order: 13, nameAr: 'بروتين كازين', nameEn: 'Casein Protein' },
  { key: 'plant_protein', slug: 'plant-protein', scope: 'type', parent: 'protein', order: 14, nameAr: 'بروتين نباتي', nameEn: 'Plant Protein' },
  { key: 'mass_gainer', slug: 'mass-gainer', scope: 'type', parent: 'protein', order: 15, nameAr: 'ماس جينر', nameEn: 'Mass Gainer' },
  // 4 utility
  { key: 'bundles', slug: 'bundles', scope: 'utility', parent: null, order: 16, nameAr: 'الحزم', nameEn: 'Bundles' },
  { key: 'services', slug: 'services', scope: 'utility', parent: null, order: 17, nameAr: 'الاستشارات والخدمات', nameEn: 'Consultations & Services' },
  { key: 'digital_library', slug: 'digital-library', scope: 'utility', parent: null, order: 18, nameAr: 'المكتبة الرقمية', nameEn: 'Digital Library' },
  { key: 'gift_cards', slug: 'gift-cards', scope: 'utility', parent: null, order: 19, nameAr: 'بطاقات الهدايا', nameEn: 'Gift Cards' },
  // 6 goal collections
  { key: 'goal_energy', slug: 'goal-energy', scope: 'goal', parent: null, order: 20, nameAr: 'الطاقة', nameEn: 'Energy' },
  { key: 'goal_general_health', slug: 'goal-general-health', scope: 'goal', parent: null, order: 21, nameAr: 'الصحة العامة', nameEn: 'General Health' },
  { key: 'goal_performance', slug: 'goal-performance', scope: 'goal', parent: null, order: 22, nameAr: 'الأداء', nameEn: 'Performance' },
  { key: 'goal_recovery', slug: 'goal-recovery', scope: 'goal', parent: null, order: 23, nameAr: 'التعافي', nameEn: 'Recovery' },
  { key: 'goal_hair_skin', slug: 'goal-hair-skin', scope: 'goal', parent: null, order: 24, nameAr: 'الشعر والبشرة', nameEn: 'Hair & Skin' },
  { key: 'goal_ideal_weight', slug: 'goal-ideal-weight', scope: 'goal', parent: null, order: 25, nameAr: 'الوزن المثالي', nameEn: 'Ideal Weight' },
];

const NAME_FALLBACK_BY_SLUG = new Map(
  TAXONOMY_FALLBACK.map((n) => [n.slug, { ar: n.nameAr, en: n.nameEn }])
);

/**
 * A minimal, quote-aware CSV parser (handles `"a,b""c"` style escaping).
 * Dependency-free by design: this is the only CSV the store-data pipeline
 * reads.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvTable(text) {
  /** @type {string[][]} */
  const rows = [];
  let row = /** @type {string[]} */ ([]);
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * @typedef {{ sku: string, brand: string, categories: string[] }} ProductRow
 * @param {{ csvPath?: string }} [opts]
 * @returns {ProductRow[]}
 */
export function loadProductRows({ csvPath = CSV_PATH } = {}) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, '');
  const [header, ...rows] = parseCsvTable(text);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  return rows
    .filter((r) => r[idx.sku])
    .map((r) => ({
      sku: r[idx.sku],
      brand: r[idx.brand] ?? '',
      categories: (r[idx.categories] ?? '')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean),
    }));
}

function addSku(node, sku) {
  if (!node.skus.includes(sku)) node.skus.push(sku);
  if (!node.imageSku) node.imageSku = sku;
}

/**
 * Builds the 25 taxonomy nodes with `skus`/`imageSku` populated from the
 * CSV's `categories` column: the leaf slug first, then any `goal-*` slugs.
 * A leaf with a parent (the five protein children) also credits the
 * parent — "every whey-protein SKU is also protein" (PLAN §2 Batch S1).
 * @param {ProductRow[]} rows
 * @returns {TaxonomyNode[]}
 */
export function buildTaxonomyFromFallback(rows) {
  /** @type {TaxonomyNode[]} */
  const nodes = TAXONOMY_FALLBACK.map((n) => ({ ...n, skus: [] }));
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  for (const row of rows) {
    const [leafSlug, ...goalSlugs] = row.categories;
    const leaf = leafSlug ? bySlug.get(leafSlug) : undefined;
    if (leafSlug && !leaf) {
      console.warn(`[salla-categories] ${row.sku}: unknown leaf category "${leafSlug}", skipped`);
    } else if (leaf) {
      addSku(leaf, row.sku);
      if (leaf.parent) {
        const parent = bySlug.get(leaf.parent);
        if (parent) addSku(parent, row.sku);
      }
    }
    for (const goalSlug of goalSlugs) {
      const goal = bySlug.get(goalSlug);
      if (goal) addSku(goal, row.sku);
      else console.warn(`[salla-categories] ${row.sku}: unknown goal category "${goalSlug}", skipped`);
    }
  }
  return nodes;
}

/**
 * Reads the taxonomy: `app/content/taxonomy.json` (Contract A, S1) when it
 * exists, else the CSV fallback above with a printed warning.
 * @param {{ taxonomyJsonPath?: string, csvPath?: string, warn?: (msg: string) => void }} [opts]
 * @returns {{ nodes: TaxonomyNode[], source: 'contract-a' | 'csv-fallback' }}
 */
export function loadTaxonomy({
  taxonomyJsonPath = TAXONOMY_JSON_PATH,
  csvPath = CSV_PATH,
  warn = console.warn,
} = {}) {
  if (fs.existsSync(taxonomyJsonPath)) {
    const raw = JSON.parse(fs.readFileSync(taxonomyJsonPath, 'utf8'));
    const nodes = raw.nodes.map(({ image_sku, ...n }) => ({ ...n, skus: n.skus ?? [], imageSku: image_sku }));
    return { nodes, source: 'contract-a' };
  }
  warn(
    `[salla-categories] ${taxonomyJsonPath} not found (Contract A not landed yet); building the 25-node ` +
      `taxonomy from FINAL-catalogue.md §A and product membership in ${csvPath}. Re-run once S1 lands the ` +
      'JSON to read its data instead.'
  );
  return { nodes: buildTaxonomyFromFallback(loadProductRows({ csvPath })), source: 'csv-fallback' };
}

/**
 * `locales/partials/tax.{ar,en}.json` (`ox.tax.<key>.name`) when S1 has
 * landed them, else null (the caller falls back to `NAME_FALLBACK_BY_SLUG`).
 * @param {{ arPath?: string, enPath?: string }} [opts]
 */
export function loadNames({ arPath = TAX_AR_PATH, enPath = TAX_EN_PATH } = {}) {
  if (fs.existsSync(arPath) && fs.existsSync(enPath)) {
    return {
      ar: JSON.parse(fs.readFileSync(arPath, 'utf8')),
      en: JSON.parse(fs.readFileSync(enPath, 'utf8')),
      source: /** @type {const} */ ('tax-partials'),
    };
  }
  return { ar: null, en: null, source: /** @type {const} */ ('fallback') };
}

/**
 * @param {TaxonomyNode} node
 * @param {ReturnType<typeof loadNames>} names
 * @returns {{ ar: string, en: string }}
 */
export function nameFor(node, names) {
  if (names.source === 'tax-partials') {
    const ar = names.ar?.[`ox.tax.${node.key}.name`];
    const en = names.en?.[`ox.tax.${node.key}.name`];
    if (ar && en) return { ar, en };
  }
  const fallback = NAME_FALLBACK_BY_SLUG.get(node.slug);
  if (!fallback) throw new Error(`no name available for taxonomy node "${node.slug}"`);
  return fallback;
}

/** Parents before children. The taxonomy is exactly one level deep (only
 * `protein` has children), so a stable two-pass split is sufficient.
 * @param {TaxonomyNode[]} nodes */
export function orderNodesParentsFirst(nodes) {
  const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
  const roots = nodes.filter((n) => !n.parent).sort(byOrder);
  const children = nodes.filter((n) => n.parent).sort(byOrder);
  return [...roots, ...children];
}

/* =================================================================== *
 * Brands: FINAL-catalogue.md §B, plus one documented gap-fill.
 * =================================================================== */

/**
 * @typedef {{ name: string, arabic: string }} Brand
 * @type {Brand[]}
 */
export const BRAND_SOURCE = [
  { name: 'Optimum Nutrition', arabic: 'اوبتيموم نيوترشن' },
  { name: 'MuscleTech', arabic: 'مسل تك' },
  { name: 'EVLution Nutrition', arabic: 'ايفليوشن نيوترشن' },
  { name: 'Dymatize', arabic: 'ديماتيز' },
  { name: 'Isopure', arabic: 'ايزوبيور' },
  { name: 'NOW Foods', arabic: 'ناو فودز' },
  { name: 'Sports Research', arabic: 'سبورتس ريسيرش' },
  { name: 'Ghost', arabic: 'جوست' },
  { name: 'BSN', arabic: 'بي اس ان' },
  { name: 'Thorne', arabic: 'ثورن' },
  { name: 'Olimp Sport Nutrition', arabic: 'اوليمب' },
  { name: 'Vital Proteins', arabic: 'فيتال بروتينز' },
  { name: 'NeoCell', arabic: 'نيوسيل' },
  { name: 'Nuun', arabic: 'نون هايدريشن' },
  { name: "Nature's Way", arabic: 'نيتشرز واي' },
  { name: 'BlenderBottle', arabic: 'بلندر بوتل' },
  { name: 'Quest Nutrition', arabic: 'كويست' },
  { name: 'Grenade', arabic: 'جرينيد' },
  { name: 'Born Winner', arabic: 'بورن وينر' },
  { name: 'BombBar', arabic: 'بومبار' },
  // OX-028 (سنتروم للرجال) and OX-039/OX-040 (ماي بروتين, peanut butter and
  // oats) use these two brands; neither has a row in FINAL-catalogue.md §B —
  // a research gap, not a script defect. Both transliterations are the ones
  // the CSV's own name_ar column already uses. Flagged again in
  // docs/build/store-data-runbook.md for the owner to backfill proper §B
  // research (official site, press kit).
  { name: 'Centrum', arabic: 'سنتروم' },
  { name: 'Myprotein', arabic: 'ماي بروتين' },
  { name: 'OptimalX', arabic: 'اوبتيمال اكس' },
];

/** @param {string} name */
export function brandSlug(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * The brand list to create: FINAL-catalogue.md §B plus the documented
 * Centrum gap-fill, always in full (the dashboard tree should match the
 * plan even for a §B brand no current SKU uses yet). Warns — does not
 * silently drop — about any CSV brand this list still does not cover.
 * @param {ProductRow[]} rows
 */
export function resolveBrands(rows) {
  const known = new Set(BRAND_SOURCE.map((b) => b.name));
  for (const name of new Set(rows.map((r) => r.brand).filter(Boolean))) {
    if (!known.has(name)) {
      console.warn(`[salla-categories] brand "${name}" appears in the catalogue but has no BRAND_SOURCE entry; add it before --apply --brands.`);
    }
  }
  return BRAND_SOURCE;
}

/* =================================================================== *
 * API bodies
 * =================================================================== */

/** Salla category SEO URL = the slug (conductor §4). @param {TaxonomyNode} node */
export function slugMetadataUrl(node) {
  return node.slug;
}

/**
 * @param {TaxonomyNode} node
 * @param {{ ar: string, en: string }} name
 */
export function buildCategoryBody(node, name) {
  return {
    name: name.ar,
    status: 'active',
    metadata_title: `${name.ar} | اوبتيمال اكس`,
    metadata_description: `تسوق ${name.ar} في اوبتيمال اكس، متجر مكملات غذائية أصلية في السعودية.`,
    metadata_url: slugMetadataUrl(node),
    translations: {
      en: {
        name: name.en,
        metadata_title: `${name.en} | OptimalX`,
        metadata_description: `Shop ${name.en} at OptimalX, a genuine supplements store in Saudi Arabia.`,
        metadata_url: slugMetadataUrl(node),
      },
    },
  };
}

/** @param {Brand} brand */
export function buildBrandBody(brand) {
  return {
    name: brand.name,
    description: `${brand.arabic} — علامة ${brand.name} للمكملات الغذائية، متوفرة في اوبتيمال اكس.`,
    metadata_url: brandSlug(brand.name),
    translations: {
      en: { name: brand.name, description: `${brand.name} supplements, available at OptimalX.` },
    },
  };
}

/* =================================================================== *
 * Product assignments
 * =================================================================== */

/**
 * @typedef {{ sku: string, productId: number | null, categorySlugs: string[], brandName: string | null }} Assignment
 * @param {{ rows: ProductRow[], nodes: TaxonomyNode[], sallaIds: Record<string, { id: number }> }} opts
 * @returns {Assignment[]}
 */
export function loadProductAssignments({ rows, nodes, sallaIds }) {
  const nodeBySlug = new Map(nodes.map((n) => [n.slug, n]));
  return rows.map((row) => {
    const [leafSlug, ...goalSlugs] = row.categories;
    const leaf = nodeBySlug.get(leafSlug);
    const categorySlugs = [leafSlug, ...(leaf?.parent ? [leaf.parent] : []), ...goalSlugs].filter(Boolean);
    return {
      sku: row.sku,
      productId: sallaIds[row.sku]?.id ?? null,
      categorySlugs,
      brandName: row.brand || null,
    };
  });
}

/* =================================================================== *
 * --plan (pure, offline)
 * =================================================================== */

/**
 * @param {{ nodes: TaxonomyNode[], names: ReturnType<typeof loadNames>, brands: Brand[],
 *   assignments: Assignment[], flags: { brands: boolean, assign: boolean } }} opts
 */
export function runPlan({ nodes, names, brands, assignments, flags }) {
  const ordered = orderNodesParentsFirst(nodes);
  const lines = [`Categories (${ordered.length}):`];
  for (const node of ordered) {
    const name = nameFor(node, names);
    const indent = node.parent ? '    ' : '  ';
    lines.push(
      `${indent}${node.slug} — ${name.ar} / ${name.en} (parent: ${node.parent ?? '-'}, skus: ${node.skus.length}, image_sku: ${node.imageSku ?? '-'})`
    );
  }
  if (flags.brands) {
    lines.push(`Brands (${brands.length}):`);
    for (const brand of brands) lines.push(`  ${brand.name} (${brandSlug(brand.name)})`);
  }
  if (flags.assign) {
    lines.push(`Product assignments (${assignments.length}):`);
    for (const a of assignments) {
      const brandNote = a.brandName ? `, brand ${a.brandName}` : '';
      const missing = a.productId ? '' : ' [MISSING Salla id]';
      lines.push(`  ${a.sku} -> [${a.categorySlugs.join(', ')}]${brandNote}${missing}`);
    }
  }
  return lines.join('\n');
}

/* =================================================================== *
 * --apply (network; never invoked this session)
 * =================================================================== */

async function apiGetJson(client, pathname) {
  const response = await client.request(pathname, { method: 'GET' });
  if (!response.ok) throw new Error(`GET ${pathname} failed: HTTP ${response.status}`);
  return response.json();
}

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

async function apiDelete(client, pathname) {
  const response = await client.request(pathname, { method: 'DELETE' });
  if (!response.ok) throw new Error(`DELETE ${pathname} failed: HTTP ${response.status}`);
}

/** Pages through a list endpoint; the store has at most ~25 categories and
 * ~22 brands, so one page normally covers it, but this does not assume so. */
async function listAll(client, pathname) {
  const results = [];
  for (let page = 1; ; page++) {
    // eslint-disable-next-line no-await-in-loop -- pages must be fetched in order
    const response = await apiGetJson(client, `${pathname}?page=${page}&per_page=100`);
    const data = response.data ?? [];
    results.push(...data);
    const totalPages = response.pagination?.totalPages ?? response.pagination?.total_pages ?? page;
    if (data.length === 0 || page >= totalPages) break;
  }
  return results;
}

/** metadata_url match first, then exact name match — idempotency key order
 * from the plan's Accept criteria. */
export function findExistingCategory(existing, node, arName) {
  return existing.find((c) => c.metadata_url === node.slug) ?? existing.find((c) => c.name === arName) ?? null;
}

export function findExistingBrand(existing, brand) {
  const slug = brandSlug(brand.name);
  return existing.find((b) => b.metadata_url === slug) ?? existing.find((b) => b.name === brand.name) ?? null;
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

/**
 * Creates a category, or reuses an existing one by `metadata_url`/`name`.
 * Tries `parent_id` on the create body for a child node first; on failure
 * falls back to `POST /categories/{parent}/subcategory` per the
 * verified-facts brief. Reads the created/matched category back and diffs
 * it against what was sent.
 * @param {ReturnType<typeof import('./salla-lib.mjs').createSallaClient>} client
 * @param {TaxonomyNode} node
 * @param {{ ar: string, en: string }} name resolved once by the caller via `nameFor`
 */
export async function createOrReuseCategory(client, node, name, { existing, parentId }) {
  const found = findExistingCategory(existing, node, name.ar);
  if (found) return { id: found.id, created: false, diffs: [] };

  const body = buildCategoryBody(node, name);
  if (parentId) body.parent_id = parentId;

  let created;
  try {
    created = (await apiSendJson(client, '/categories', 'POST', body)).data ?? {};
  } catch (error) {
    if (!node.parent) throw error;
    created = (await apiSendJson(client, `/categories/${parentId}/subcategory`, 'POST', body)).data ?? {};
  }

  const readback = (await apiGetJson(client, `/categories/${created.id}`)).data ?? {};
  const diffs = diffFields(body, readback, ['name', 'status', 'metadata_url']);
  if (node.parent && String(readback.parent_id) !== String(parentId)) {
    diffs.push({ field: 'parent_id', expected: parentId, actual: readback.parent_id });
  }
  return { id: created.id, created: true, diffs };
}

/** Creates a brand, or reuses an existing one by `metadata_url`/`name`. */
export async function createOrReuseBrand(client, brand, { existing }) {
  const found = findExistingBrand(existing, brand);
  if (found) return { id: found.id, created: false, diffs: [] };

  const body = buildBrandBody(brand);
  const created = (await apiSendJson(client, '/brands', 'POST', body)).data ?? {};
  const readback = (await apiGetJson(client, `/brands/${created.id}`)).data ?? {};
  const diffs = diffFields(body, readback, ['name', 'metadata_url']);
  return { id: created.id, created: true, diffs };
}

/** Reads the product's current categories/brand (for rollback), writes the
 * new set, reads back, and diffs. */
export async function assignProductCategories(client, assignment, categoryIdBySlug, brandIdByName) {
  const currentRaw = (await apiGetJson(client, `/products/${assignment.productId}`)).data ?? {};
  const before = {
    categories: (currentRaw.categories ?? []).map((c) => c.id ?? c),
    brand_id: currentRaw.brand?.id ?? currentRaw.brand_id ?? null,
  };

  const categories = assignment.categorySlugs.map((slug) => categoryIdBySlug.get(slug)).filter((id) => id != null);
  const brandId = assignment.brandName ? brandIdByName.get(assignment.brandName) : undefined;
  const body = { categories, ...(brandId ? { brand_id: brandId } : {}) };

  await apiSendJson(client, `/products/${assignment.productId}`, 'PUT', body);
  const readback = (await apiGetJson(client, `/products/${assignment.productId}`)).data ?? {};
  const after = {
    categories: (readback.categories ?? []).map((c) => c.id ?? c),
    brand_id: readback.brand?.id ?? readback.brand_id ?? null,
  };

  const diffs = [];
  if (JSON.stringify([...after.categories].sort()) !== JSON.stringify([...categories].sort())) {
    diffs.push({ field: 'categories', expected: categories, actual: after.categories });
  }
  return { before, after, diffs };
}

/** The `image_sku` product's cdn image URL, from the offline fixture
 * snapshot — the same image the theme's overlay renders for the category. */
export function imageUrlForSku(sku, products) {
  return products.find((p) => p.sku === sku)?.image?.url ?? null;
}

async function applyCategoryImage(client, categoryId, imageUrl) {
  await apiSendJson(client, `/categories/${categoryId}`, 'PUT', { image: imageUrl });
  const readback = (await apiGetJson(client, `/categories/${categoryId}`)).data ?? {};
  const actualUrl = typeof readback.image === 'string' ? readback.image : readback.image?.url;
  return { ok: actualUrl === imageUrl, image: readback.image };
}

function baseAction(type, target) {
  return { when: nowIso(), type, target };
}

function toCategoryAction(node, result) {
  const type = result.created ? 'category_create' : 'category_reuse';
  const diffNote = result.diffs.length ? `DIFF ${JSON.stringify(result.diffs)}` : 'name/status/metadata_url match';
  return {
    ...baseAction(type, node.slug),
    id: result.id,
    result: result.created ? `created id ${result.id}` : `reused existing id ${result.id}`,
    readback: diffNote,
  };
}

function toBrandAction(brand, result) {
  const type = result.created ? 'brand_create' : 'brand_reuse';
  const diffNote = result.diffs.length ? `DIFF ${JSON.stringify(result.diffs)}` : 'name/metadata_url match';
  return {
    ...baseAction(type, brand.name),
    id: result.id,
    result: result.created ? `created id ${result.id}` : `reused existing id ${result.id}`,
    readback: diffNote,
  };
}

function toAssignAction(assignment, result) {
  const brandNote = result.after.brand_id ? `, brand_id ${result.after.brand_id}` : '';
  return {
    ...baseAction('product_update', assignment.sku),
    id: assignment.productId,
    before: result.before,
    after: result.after,
    result: `categories -> [${result.after.categories.join(',')}]${brandNote}`,
    readback: result.diffs.length ? `DIFF ${JSON.stringify(result.diffs)}` : 'categories match',
  };
}

function toImageAction(node, result) {
  return {
    ...baseAction('category_image', node.slug),
    result: result.ok ? 'image set' : 'image rejected (set manually per the runbook)',
    readback: JSON.stringify(result.image ?? null),
  };
}

/**
 * Orchestrates one `--apply` run: categories (always), brands/assignments/
 * images behind their flags. Always appends whatever actions completed to
 * `store-write-log.md`, even on a mid-run failure (e.g. the Cloudflare
 * challenge), so a partial run is never silently lost.
 */
export async function runApply({
  client,
  nodes,
  names,
  brands,
  assignments,
  products,
  flags,
  runId,
  log = console.log,
  writeLog = appendRunLog,
  writeTaxonomyIds = defaultWriteTaxonomyIds,
}) {
  const startedAt = nowIso();
  const actions = [];
  const categoryIdBySlug = new Map();
  const brandIdByName = new Map();
  try {
    const existingCategories = await listAll(client, '/categories');
    for (const node of orderNodesParentsFirst(nodes)) {
      const name = nameFor(node, names);
      const parentId = node.parent ? categoryIdBySlug.get(node.parent) : undefined;
      // eslint-disable-next-line no-await-in-loop -- children need their parent's id
      const result = await createOrReuseCategory(client, node, name, { existing: existingCategories, parentId });
      categoryIdBySlug.set(node.slug, result.id);
      actions.push(toCategoryAction(node, result));
      log(`category ${node.slug}: ${result.created ? 'created' : 'reused'} id=${result.id}`);
    }

    if (flags.brands) {
      const existingBrands = await listAll(client, '/brands');
      for (const brand of brands) {
        // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
        const result = await createOrReuseBrand(client, brand, { existing: existingBrands });
        brandIdByName.set(brand.name, result.id);
        actions.push(toBrandAction(brand, result));
      }
    }

    if (flags.assign) {
      for (const assignment of assignments) {
        if (!assignment.productId) {
          log(`skip ${assignment.sku}: no Salla product id in docs/build/salla-ids.json`);
          continue;
        }
        // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
        const result = await assignProductCategories(client, assignment, categoryIdBySlug, brandIdByName);
        actions.push(toAssignAction(assignment, result));
      }
    }

    if (flags.images) {
      for (const node of nodes) {
        const imageUrl = node.imageSku ? imageUrlForSku(node.imageSku, products) : null;
        const id = categoryIdBySlug.get(node.slug);
        if (!imageUrl || !id) continue;
        // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
        const result = await applyCategoryImage(client, id, imageUrl);
        actions.push(toImageAction(node, result));
      }
    }

    writeTaxonomyIds(Object.fromEntries(categoryIdBySlug));
    return { runId, actions, categoryIdBySlug, brandIdByName };
  } finally {
    writeLog({ runId, mode: 'apply', startedAt, finishedAt: nowIso(), actions });
  }
}

function defaultWriteTaxonomyIds(map) {
  fs.writeFileSync(TAXONOMY_IDS_PATH, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
}

/**
 * Undoes exactly what one run created: deletes categories/brands it
 * created (never a reused one), restores each touched product's
 * pre-write categories/brand_id. Logs the rollback as its own run.
 */
export async function runRollback({ client, runId, log = console.log, readLog = readRunLog, writeLog = appendRunLog }) {
  const run = readLog(runId);
  if (!run) throw new Error(`no run "${runId}" found in docs/build/store-write-log.md`);
  const startedAt = nowIso();
  const undoActions = [];
  for (const action of [...run.actions].reverse()) {
    if (action.type === 'category_create') {
      // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
      await apiDelete(client, `/categories/${action.id}`);
      undoActions.push({ ...baseAction('category_delete', action.target), id: action.id, result: `deleted id ${action.id}`, readback: 'n/a' });
      log(`rollback: deleted category ${action.target} (id ${action.id})`);
    } else if (action.type === 'brand_create') {
      // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
      await apiDelete(client, `/brands/${action.id}`);
      undoActions.push({ ...baseAction('brand_delete', action.target), id: action.id, result: `deleted id ${action.id}`, readback: 'n/a' });
      log(`rollback: deleted brand ${action.target} (id ${action.id})`);
    } else if (action.type === 'product_update') {
      const body = { categories: action.before.categories, ...(action.before.brand_id ? { brand_id: action.before.brand_id } : {}) };
      // eslint-disable-next-line no-await-in-loop -- sequential, spaced writes only
      await apiSendJson(client, `/products/${action.id}`, 'PUT', body);
      undoActions.push({
        ...baseAction('product_restore', action.target),
        id: action.id,
        result: `restored categories [${action.before.categories.join(',')}]`,
        readback: 'n/a',
      });
      log(`rollback: restored ${action.target} (product ${action.id})`);
    }
    // category_reuse / brand_reuse / category_image: nothing this run
    // created is undone by reversing them (a reused entity pre-dates the
    // run; an image write is left for manual review per the runbook).
  }
  writeLog({ runId: `${runId}-rollback`, mode: 'rollback', startedAt, finishedAt: nowIso(), actions: undoActions, notes: `Rollback of run ${runId}.` });
  return { undone: undoActions.length };
}

/* =================================================================== *
 * CLI
 * =================================================================== */

function loadContext() {
  const { nodes, source } = loadTaxonomy();
  const names = loadNames();
  const rows = loadProductRows();
  const brands = resolveBrands(rows);
  let sallaIds = {};
  try {
    sallaIds = JSON.parse(fs.readFileSync(SALLA_IDS_PATH, 'utf8'));
  } catch (error) {
    console.warn(`[salla-categories] could not read ${SALLA_IDS_PATH}: ${error.message}`);
  }
  const assignments = loadProductAssignments({ rows, nodes, sallaIds });
  return { nodes, source, names, rows, brands, assignments };
}

/** @param {string[]} argv */
async function main(argv) {
  const flags = {
    plan: argv.includes('--plan'),
    apply: argv.includes('--apply'),
    brands: argv.includes('--brands'),
    assign: argv.includes('--assign'),
    images: argv.includes('--images'),
  };
  const rollbackIndex = argv.indexOf('--rollback');
  const rollbackId = rollbackIndex !== -1 ? argv[rollbackIndex + 1] : null;

  if (rollbackId) {
    const { token } = resolveAccessToken();
    if (!token) throw new Error('no access token available; run node scripts/salla-auth.mjs first');
    const { undone } = await runRollback({ client: createSallaClient({ token }), runId: rollbackId });
    console.log(`rollback of ${rollbackId}: ${undone} action(s) undone`);
    return 0;
  }

  if (!flags.plan && !flags.apply) {
    console.error('usage: node scripts/salla-categories.mjs --plan | --apply [--brands] [--assign] [--images] [--rollback <run-id>]');
    return 1;
  }

  const { nodes, source, names, brands, assignments } = loadContext();

  if (flags.plan) {
    console.log(`taxonomy source: ${source}`);
    console.log(runPlan({ nodes, names, brands, assignments, flags }));
    return 0;
  }

  const { token } = resolveAccessToken();
  if (!token) throw new Error('no access token available; run node scripts/salla-auth.mjs first, or set SALLA_ACCESS_TOKEN');
  const client = createSallaClient({ token });
  const runId = generateRunId();
  const products = flags.images ? JSON.parse(fs.readFileSync(PRODUCTS_FIXTURE_PATH, 'utf8')) : [];

  try {
    const result = await runApply({ client, nodes, names, brands, assignments, products, flags, runId });
    console.log(`apply run ${runId}: ${result.actions.length} action(s); ${TAXONOMY_IDS_PATH} written`);
    return 0;
  } catch (error) {
    if (error instanceof SallaChallengeError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`salla-categories: ${error.message}`);
      process.exitCode = 1;
    });
}
