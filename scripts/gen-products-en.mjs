#!/usr/bin/env node
// gen-products-en.mjs, generates fixtures/store/overlay/products.en.json,
// the English twins (name, subtitle, description) of the mock catalogue,
// read by SKU from docs/build/research/optimalx-catalogue.csv and keyed by
// the numeric product id fixtures/store/product-details.json already
// answers with. scripts/serve-store.mjs overlays this onto the Arabic
// snapshot for `accept-language: en`.
//
// NEVER INVENTED: a SKU whose CSV row has no English twin, or whose twin
// fails the same copy (scripts/check-copy.mjs) and claims
// (scripts/check-claims.mjs) gates the locale files are held to, is left
// out of the overlay entirely, that product keeps its real Arabic name on
// /en until a clean twin exists. Every exclusion is reported, never
// silently dropped.
//
// Usage: node scripts/gen-products-en.mjs

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './salla-lib.mjs';
import { parseCsvTable } from './salla-categories.mjs';
import { checkCopy } from './check-copy.mjs';
import { checkClaims } from './check-claims.mjs';

export const CSV_PATH = path.join(ROOT, 'docs', 'build', 'research', 'optimalx-catalogue.csv');
export const DETAILS_PATH = path.join(ROOT, 'fixtures', 'store', 'product-details.json');
export const OUT_PATH = path.join(ROOT, 'fixtures', 'store', 'overlay', 'products.en.json');

/** @typedef {{ sku: string, name: string, subtitle: string, description: string }} EnglishTwin */

/**
 * The English claims FINAL-claims-source.md §3 bans that check-claims.mjs
 * does not itself check for in English (its health-outcome/superlative
 * rules are Arabic-phrase and Arabic-token based; only `best`/`#1`/etc are
 * covered in English via SUPERLATIVE_EN). A dedicated, small, literal list
 * - never a rewrite of check-claims.mjs, which stays the locale files' own
 * gate, for the exact English equivalents this batch names: cures,
 * treats, guaranteed, best, #1, fastest, burns fat, clinically proven.
 */
const BANNED_EN_CLAIM_WORDS = [
  'cures',
  'cure',
  'treats',
  'treat',
  'guaranteed',
  'guarantee',
  'fastest',
  'burns fat',
  'burn fat',
  'clinically proven',
];
const BANNED_EN_CLAIM_RE = new RegExp(`\\b(${BANNED_EN_CLAIM_WORDS.join('|')})\\b`, 'i');

/**
 * Reads the CSV's English columns, keyed by SKU. A row missing `name_en`,
 * `subtitle_en` or `description_html_en` is left out of the map.
 * @param {{ csvPath?: string }} [opts]
 * @returns {Map<string, EnglishTwin>}
 */
export function loadTwinsFromCsv({ csvPath = CSV_PATH } = {}) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, '');
  const [header, ...rows] = parseCsvTable(text);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  /** @type {Map<string, EnglishTwin>} */
  const twins = new Map();
  for (const row of rows) {
    const sku = row[idx.sku];
    if (!sku) continue;
    const name = (row[idx.name_en] ?? '').trim();
    const subtitle = (row[idx.subtitle_en] ?? '').trim();
    const description = (row[idx.description_html_en] ?? '').trim();
    if (name && subtitle && description) twins.set(sku, { sku, name, subtitle, description });
  }
  return twins;
}

/**
 * The copy-quality and claims gates one candidate twin must pass, run the
 * same way check-copy.mjs / check-claims.mjs run them on the locale files,
 * plus the small literal list above. Exported so
 * scripts/salla-product-translations.mjs gates the exact same twins before
 * writing them to the live store.
 * @param {EnglishTwin} twin
 * @returns {string[]} human-readable problems; empty when the twin is clean
 */
export function gateTwin(twin) {
  /** @type {string[]} */
  const problems = [];
  for (const [field, value] of /** @type {[string, string][]} */ ([
    ['name', twin.name],
    ['subtitle', twin.subtitle],
    ['description', twin.description],
  ])) {
    for (const finding of checkCopy(`products.en.json:${twin.sku}.${field}`, value)) {
      problems.push(`[copy:${finding.rule}] ${field}: ${finding.match ?? finding.value}`);
    }
    const banned = value.match(BANNED_EN_CLAIM_RE);
    if (banned) problems.push(`[claim:banned-word] ${field}: ${banned[0]}`);
  }
  const claimsText = JSON.stringify({ name: twin.name, subtitle: twin.subtitle, description: twin.description });
  for (const finding of checkClaims(`products.en.json:${twin.sku}.json`, claimsText)) {
    problems.push(`[claims:${finding.rule}] ${finding.key}: ${finding.match ?? finding.value}`);
  }
  return problems;
}

/**
 * Builds the overlay object: product id -> English fields, for every
 * product whose SKU has a CSV twin that also passes `gateTwin`. Everything
 * else is reported in `missing` (no CSV twin) or `excluded` (twin found,
 * gate failed), never written.
 * @param {{ details: Record<string, { id: number, sku: string }>, twins: Map<string, EnglishTwin> }} opts
 * @returns {{ overlay: Record<string, { name: string, subtitle: string, description: string }>,
 *   missing: string[], excluded: { sku: string, problems: string[] }[] }}
 */
export function buildOverlay({ details, twins }) {
  /** @type {Record<string, { name: string, subtitle: string, description: string }>} */
  const overlay = {};
  /** @type {string[]} */
  const missing = [];
  /** @type {{ sku: string, problems: string[] }[]} */
  const excluded = [];
  for (const product of Object.values(details)) {
    const twin = twins.get(product.sku);
    if (!twin) {
      missing.push(product.sku);
      continue;
    }
    const problems = gateTwin(twin);
    if (problems.length) {
      excluded.push({ sku: product.sku, problems });
      continue;
    }
    overlay[String(product.id)] = { name: twin.name, subtitle: twin.subtitle, description: twin.description };
  }
  return { overlay, missing, excluded };
}

function main() {
  const details = JSON.parse(fs.readFileSync(DETAILS_PATH, 'utf8'));
  const twins = loadTwinsFromCsv();
  const { overlay, missing, excluded } = buildOverlay({ details, twins });

  const ordered = Object.fromEntries(Object.entries(overlay).sort(([a], [b]) => Number(a) - Number(b)));
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');

  const total = Object.keys(details).length;
  console.log(
    `gen-products-en: ${total} product(s) in the snapshot, ${Object.keys(overlay).length} English twin(s) written to fixtures/store/overlay/products.en.json`
  );
  if (missing.length) console.log(`  no CSV twin (${missing.length}): ${missing.join(', ')}`);
  if (excluded.length) {
    console.log(`  excluded by the copy/claims gate (${excluded.length}), Arabic name kept:`);
    for (const item of excluded) console.log(`    ${item.sku}: ${item.problems.join('; ')}`);
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) main();
