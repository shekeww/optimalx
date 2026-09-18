// Merges every locales/partials/<batch>.<lang>.json into locales/<lang>.json.
//
// - only `ox.*` keys are accepted from a partial (engine keys are never touched)
// - a key present in two partials with different values is a conflict -> exit 1
// - the ar and en partials must declare the same key set -> exit 1 otherwise
// - existing keys keep their position; new keys are appended in partial order
// - `--check` reports what would change and exits 1 instead of writing
//
// Usage: node scripts/i18n-merge.mjs [--check]

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const LANGS = ['ar', 'en'];
export const OX_PREFIX = 'ox.';
const PARTIALS_DIR = path.join('locales', 'partials');

/** Flattens nested objects to dotted keys; only string leaves are kept. */
export function flatten(node, prefix = '') {
  const out = {};
  if (typeof node === 'string') {
    if (prefix) out[prefix] = node;
    return out;
  }
  if (!node || typeof node !== 'object' || Array.isArray(node)) return out;
  for (const [key, value] of Object.entries(node)) {
    Object.assign(out, flatten(value, prefix ? `${prefix}.${key}` : key));
  }
  return out;
}

/**
 * Reads every `<batch>.<lang>.json` partial and returns the combined entries.
 * @returns {{ entries: Map<string, { value: string, file: string }>, errors: string[] }}
 */
export function collectPartials(dir, lang, readFile = (f) => fs.readFileSync(f, 'utf8')) {
  const entries = new Map();
  const errors = [];
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => name.endsWith(`.${lang}.json`))
        .sort()
    : [];
  for (const name of files) {
    const file = path.join(dir, name);
    let flat;
    try {
      flat = flatten(JSON.parse(readFile(file)));
    } catch (error) {
      errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const [key, value] of Object.entries(flat)) {
      if (!key.startsWith(OX_PREFIX)) {
        errors.push(`${file}: key "${key}" is outside the ox.* namespace (engine keys are not merged)`);
        continue;
      }
      const seen = entries.get(key);
      if (seen && seen.value !== value) {
        errors.push(`conflict on "${key}": ${seen.file} has ${JSON.stringify(seen.value)}, ${file} has ${JSON.stringify(value)}`);
        continue;
      }
      if (!seen) entries.set(key, { value, file });
    }
  }
  return { entries, errors };
}

/** Applies entries to an existing flat locale object; never removes a key. */
export function mergeLocale(existing, entries) {
  const merged = { ...existing };
  let added = 0;
  let updated = 0;
  for (const [key, { value }] of entries) {
    if (!(key in merged)) added++;
    else if (merged[key] !== value) updated++;
    merged[key] = value;
  }
  return { merged, added, updated };
}

/** Keys present in one language's partials but not the other's. */
export function parityErrors(byLang) {
  const errors = [];
  for (const lang of LANGS) {
    for (const other of LANGS) {
      if (other === lang) continue;
      for (const key of byLang[lang].keys()) {
        if (!byLang[other].has(key)) errors.push(`"${key}" is in the ${lang} partials but not in ${other}`);
      }
    }
  }
  return errors;
}

function main(args) {
  const check = args.includes('--check');
  const byLang = {};
  const errors = [];
  for (const lang of LANGS) {
    const result = collectPartials(PARTIALS_DIR, lang);
    byLang[lang] = result.entries;
    errors.push(...result.errors);
  }
  errors.push(...parityErrors(byLang));
  if (errors.length) {
    for (const e of errors) console.error(`i18n-merge: ${e}`);
    return 1;
  }
  let pending = 0;
  for (const lang of LANGS) {
    const file = path.join('locales', `${lang}.json`);
    const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    const { merged, added, updated } = mergeLocale(existing, byLang[lang]);
    const changed = added + updated;
    pending += changed;
    console.log(`i18n-merge: ${file}: ${byLang[lang].size} partial key(s), ${added} added, ${updated} updated`);
    if (changed && !check) fs.writeFileSync(file, JSON.stringify(merged, null, 2) + String.fromCharCode(10));
  }
  if (check && pending) {
    console.error(`i18n-merge: --check: ${pending} change(s) pending; run pnpm i18n:merge`);
    return 1;
  }
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
