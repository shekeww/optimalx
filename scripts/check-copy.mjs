// Copy lint for the theme's user-facing strings.
//
// Rules (the same ones tests/i18n.test.ts asserts):
//   diacritic  - Arabic values carry no combining mark (SEO-ENG-008 P6)
//   dialect    - Arabic values contain no Gulf-dialect tokens as whole words
//                (SEO-ENG-008 P5; the token list is docs/brand/voice-ksa.md 3.3)
//   em-dash    - no value, in any language, contains U+2014
//   ai-tell    - no value carries one of the machine-output constructions in
//                docs/brand/voice-ksa.md 3.5 (mastermind-copywriting standard)
//
// Usage: node scripts/check-copy.mjs [file ...]
// With no arguments it checks locales/*.json. JSON files are flattened to
// dotted keys; any other file is checked line by line. Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** A value the copywriter still owes; B7 fills them (PLAN-final 2.2). */
export const TODO_PREFIX = 'TODO-copy:';

// EVERY TOKEN THE OWNER'S 2026-09-22 EDITS USED that has no Modern Standard
// Arabic reading, plus the original eight. Whole-word only, so MSA words that
// happen to share letters stay legal. Deliberately NOT here because they are
// real MSA words in other senses: بس is caught as dialect only when the
// sentence needs "فقط", which a regex cannot know; زين is a name; مرة is
// "once"; حق is "right"; ثاني is "second". The sweep handles those by reading,
// the gate handles the unambiguous ones by pattern. The mapping to MSA lives
// in docs/brand/voice-ksa.md section 3.3.
export const DIALECT_WORDS = [
  'وش', 'وشو', 'ايش', 'ابي', 'ابغى', 'تبي', 'تبغى', 'يبي', 'شوي', 'مو', 'مب', 'لازم', 'تقدر',
  'اللي', 'مافيه', 'مافي', 'شوف', 'كمل', 'عشان', 'وين', 'ليش', 'كذا', 'تجي', 'تسوي', 'فاضية',
  'بنراجع', 'بنرجع', 'ينشحن', 'ينشترى', 'هالمنتج', 'هالشي',
];
/** Two-word dialect phrases; matched as a phrase because the parts are legal alone. */
export const DIALECT_PHRASES = ['ما فيه', 'ما في ', 'قبل ما ', 'مرة ثانية'];
// The FULL Arabic combining-mark set SEO-ENG-008 v1.2 names, not the narrower
// U+064B-U+0652 the first version of this file used: the Quranic annotation
// block and the small high signs are marks too, and a minifier once folded a
// char-code call into one (mastermind-copywriting). Built from code points so
// no tool can "helpfully" unescape it into the very characters it forbids.
export const DIACRITICS = new RegExp(
  '[' +
    String.fromCodePoint(0x064b) + '-' + String.fromCodePoint(0x065f) +
    String.fromCodePoint(0x0670) +
    String.fromCodePoint(0x06d6) + '-' + String.fromCodePoint(0x06ed) +
    String.fromCodePoint(0x08d3) + '-' + String.fromCodePoint(0x08ff) +
  ']',
  'u'
);
const EM_DASH = '—';
const ARABIC = /\p{Script=Arabic}/u;
const DIALECT = new RegExp(`(?<![\\p{L}\\p{M}])(${DIALECT_WORDS.join('|')})(?![\\p{L}\\p{M}])`, 'u');
const DIALECT_PHRASE = new RegExp(`(?<![\\p{L}\\p{M}])(${DIALECT_PHRASES.map((p) => p.trim()).join('|')})(?![\\p{L}\\p{M}])`, 'u');

// THE MACHINE-OUTPUT TELLS. Each one, on its own, marks a sentence as
// generated to a reader who has seen enough generated Arabic or English. The
// list is docs/brand/voice-ksa.md 3.5; the English half is the
// mastermind-copywriting standard verbatim. Matched case-insensitively as
// substrings, because these are phrases, not tokens. "leverage" is matched as
// a verb form only ("leverage our", "leverages", "leveraging") so the noun in
// a finance context is not a false positive.
export const AI_TELLS_AR = [
  'في عالم اليوم', 'في عصرنا الحالي', 'في ظل التطور', 'دعنا نستكشف', 'دعونا نستكشف', 'دعنا نتعمق',
  'دعونا نتعمق', 'دعنا نلقي نظرة', 'ليس مجرد', 'ليس فقط', 'سواء كنت', 'إليك ما يجب', 'إليك الأمر',
  'رحلتك', 'اكتشف قوة', 'أطلق العنان', 'ارتق ب', 'نقلة نوعية', 'يعزز تجربتك', 'شامل ومتكامل',
  'حل مثالي', 'في الختام', 'لا تتردد في', 'نحن هنا من أجلك',
];
export const AI_TELLS_EN = [
  "it's not just", 'here\'s the thing', 'in today\'s fast-paced', 'in today\'s digital', 'ever-evolving',
  "let's dive in", 'delve into', 'unlock the', 'elevate your', 'seamless', 'game-changer', 'game changer',
  'leverage our', 'leverages', 'leveraging', 'the landscape of', 'robust', 'empower', 'whether you\'re a',
  'in conclusion',
];
const AI_TELL = new RegExp(`(${[...AI_TELLS_AR, ...AI_TELLS_EN].map(escapeRegExp).join('|')})`, 'iu');
/** Two rhetorical questions back to back is the stacked-question tell. */
const STACKED_QUESTIONS = /[?؟]\s*[^.!؟?]{3,80}[?؟]\s*[^.!؟?]{3,80}[?؟]/u;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @typedef {{ file: string, key: string, rule: 'diacritic' | 'dialect' | 'em-dash' | 'ai-tell', value: string, match?: string }} CopyFinding
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
    // The tells are language-independent: an English value is checked too.
    const tell = value.match(AI_TELL) || value.match(STACKED_QUESTIONS);
    if (tell) findings.push({ file, key, rule: 'ai-tell', value, match: tell[1] ?? 'stacked questions' });
    if (!ARABIC.test(value)) continue;
    if (DIACRITICS.test(value)) findings.push({ file, key, rule: 'diacritic', value });
    const dialect = value.match(DIALECT) || value.match(DIALECT_PHRASE);
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

/**
 * Values that still start with the TODO-copy prefix. A warning, never a
 * failure: the merge protocol lets a batch ship a marked placeholder and B7
 * reconciles the list against FINAL-content 9.
 * @param {string} file
 * @param {string} text
 * @returns {{ file: string, key: string, value: string }[]}
 */
export function todoCopy(file, text) {
  return entriesOf(file, text)
    .filter(({ value }) => value.startsWith(TODO_PREFIX))
    .map(({ key, value }) => ({ file, key, value }));
}

/** locales/*.json plus every partial pair (the merge inputs, PLAN-final 2.1). */
function defaultFiles() {
  const out = [];
  for (const dir of ['locales', path.join('locales', 'partials')]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (name.endsWith('.json')) out.push(path.join(dir, name));
    }
  }
  return out;
}

function main(args) {
  const files = args.length ? args : defaultFiles();
  let problems = 0;
  /** @type {{ file: string, key: string, value: string }[]} */
  const todos = [];
  for (const file of files) {
    let text;
    let findings;
    try {
      text = fs.readFileSync(file, 'utf8');
      findings = checkCopy(file, text);
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
    todos.push(...todoCopy(file, text));
  }
  for (const todo of todos) {
    console.warn(`${todo.file}:${todo.key} [todo-copy] ${JSON.stringify(todo.value)}`);
  }
  const todoLine = todos.length ? `, ${todos.length} TODO-copy placeholder(s)` : '';
  console.log(`check-copy: ${files.length} file(s), ${problems} problem(s)${todoLine}`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
