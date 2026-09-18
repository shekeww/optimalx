// Copy lint for the theme's user-facing strings.
//
// Rules (the same ones tests/i18n.test.ts asserts):
//   diacritic  - Arabic values carry no tashkeel (U+064B-U+0652, U+0670)
//   dialect    - Arabic values contain no Gulf-dialect tokens as whole words
//   em-dash    - no value, in any language, contains U+2014
//
// Usage: node scripts/check-copy.mjs [file ...]
// With no arguments it checks locales/*.json. JSON files are flattened to
// dotted keys; any other file is checked line by line. Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIALECT_WORDS = ['وش', 'ابي', 'ابغى', 'شوي', 'مو', 'مب', 'لازم', 'تقدر'];
export const DIACRITICS = /[ً-ْٰ]/u;
const EM_DASH = '—';
const ARABIC = /\p{Script=Arabic}/u;
const DIALECT = new RegExp(`(?<![\\p{L}\\p{M}])(${DIALECT_WORDS.join('|')})(?![\\p{L}\\p{M}])`, 'u');

/**
 * @typedef {{ file: string, key: string, rule: 'diacritic' | 'dialect' | 'em-dash', value: string, match?: string }} CopyFinding
 */

/**
 * Checks one file's text and returns every rule violation.
 * @param {string} file  label used in findings; decides JSON vs plain-text handling
 * @param {string} text  file contents
 * @returns {CopyFinding[]}
 */
export function checkCopy(file, text) {
  /** @type {CopyFinding[]} */
  const findings = [];
  for (const { key, value } of entriesOf(file, text)) {
    if (value.includes(EM_DASH)) findings.push({ file, key, rule: 'em-dash', value });
    if (!ARABIC.test(value)) continue;
    if (DIACRITICS.test(value)) findings.push({ file, key, rule: 'diacritic', value });
    const dialect = value.match(DIALECT);
    if (dialect) findings.push({ file, key, rule: 'dialect', value, match: dialect[1] });
  }
  return findings;
}

function entriesOf(file, text) {
  if (!file.endsWith('.json')) {
    return text.split(/\r?\n/).map((value, index) => ({ key: `L${index + 1}`, value }));
  }
  return flatten(JSON.parse(text), '');
}

function flatten(node, prefix) {
  if (typeof node === 'string') return [{ key: prefix, value: node }];
  if (Array.isArray(node)) return node.flatMap((item, i) => flatten(item, `${prefix}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

function main(args) {
  const files = args.length
    ? args
    : fs
        .readdirSync('locales')
        .filter((name) => name.endsWith('.json'))
        .map((name) => path.join('locales', name));
  let problems = 0;
  for (const file of files) {
    let findings;
    try {
      findings = checkCopy(file, fs.readFileSync(file, 'utf8'));
    } catch (error) {
      problems++;
      console.error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const f of findings) {
      problems++;
      const detail = f.match ? ` (${f.match})` : '';
      console.error(`${f.file}:${f.key} [${f.rule}]${detail} ${JSON.stringify(f.value)}`);
    }
  }
  console.log(`check-copy: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
