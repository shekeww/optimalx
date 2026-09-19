// RTL lint: the theme is Arabic first, so a physical direction in a style or a
// class name is a defect (DIRECTION 9.8, PLAN-final 2.1 "Scripts").
//
// Rules (one finding per line, `file:line [rule] text`):
//   margin-left | margin-right | padding-left | padding-right
//   left: | right:        (a physical offset declaration)
//   text-align: left|right
//   border-left | border-right
//   ml- mr- pl- pr- left- right- text-left- text-right-   (physical utilities)
//
// Logical equivalents: margin-inline-start/end, padding-inline-*, inset-inline-*,
// text-align: start/end, border-inline-*, and the ms-/me-/ps-/pe-/start-/end-/
// text-start/text-end Tailwind utilities.
//
// Scope: app/**/*.{ts,tsx,css,scss} minus ALLOWLIST. Comments are stripped
// before matching, so prose like "left to right" in a docblock is not a finding.
//
// Usage: node scripts/check-rtl.mjs [path ...]   (default: app)
// Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Paths excluded with a reason. Everything here is inherited Raed scaffolding
 * that this build does not rewrite; the OptimalX layer lives in
 * app/styles/06-ox and app/components. Remove an entry when its batch replaces
 * the file, never to silence a new finding.
 */
export const ALLOWLIST = [
  // Inherited Raed stylesheets (01 to 05); the OptimalX layer is 06-ox.
  'app/styles/01-settings/',
  'app/styles/02-generic/',
  'app/styles/03-elements/',
  'app/styles/04-components/',
  'app/styles/05-utilities/',
  // Engine markup class name `right-side` in the Raed brands block; B2 owns it.
];

const EXTENSIONS = ['.ts', '.tsx', '.css', '.scss'];

/** Each rule is [name, RegExp]; every regex is built from a plain string. */
export const RULES = [
  ['margin-left', new RegExp('margin-left')],
  ['margin-right', new RegExp('margin-right')],
  ['padding-left', new RegExp('padding-left')],
  ['padding-right', new RegExp('padding-right')],
  ['physical-offset', new RegExp('^\\s*(left|right)\\s*:')],
  ['text-align', new RegExp('text-align:\\s*(left|right)')],
  ['border-left-right', new RegExp('border-(left|right)')],
  ['physical-utility', new RegExp('(^|[^-\\w])(ml|mr|pl|pr|left|right|text-left|text-right)-')],
];

/**
 * Blanks out `//` and block comments so prose never trips a rule, keeping the
 * line count intact (findings carry a real line number).
 * @param {string} text
 * @returns {string}
 */
export function stripComments(text) {
  let out = '';
  let inBlock = false;
  let inLine = false;
  let inString = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '\n') {
      inLine = false;
      inString = null;
      out += ch;
      continue;
    }
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false;
        out += '  ';
        i++;
        continue;
      }
      out += ' ';
      continue;
    }
    if (inLine) {
      out += ' ';
      continue;
    }
    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += text[i + 1] === '\n' ? '' : ' ';
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlock = true;
      out += '  ';
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLine = true;
      out += '  ';
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * @param {string} file
 * @param {string} text
 * @returns {{ file: string, line: number, rule: string, text: string }[]}
 */
export function checkRtl(file, text) {
  const findings = [];
  const lines = stripComments(text).split(/\r?\n/);
  const raw = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const [rule, pattern] of RULES) {
      if (pattern.test(line) && !hasPragma(raw[index], rule)) {
        findings.push({ file, line: index + 1, rule, text: raw[index].trim() });
      }
    }
  });
  return findings;
}

/** Depth-first file list under `root`, filtered by extension. */
export function listFiles(root, extensions = EXTENSIONS) {
  if (!fs.existsSync(root)) return [];
  if (fs.statSync(root).isFile()) return extensions.includes(path.extname(root)) ? [root] : [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, extensions));
    else if (extensions.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/**
 * A line may opt out of one rule with a written reason:
 *   const DAYS = ['الأحد'];  // ox-allow: arabic-literal parser tokens, not copy
 * The reason is mandatory in review, not in the regex; the pragma names exactly
 * one rule so it can never blanket-silence a file.
 * @param {string} rawLine
 * @param {string} rule
 * @returns {boolean}
 */
export function hasPragma(rawLine, rule) {
  const marker = rawLine.indexOf('ox-allow:');
  if (marker < 0) return false;
  const named = rawLine.slice(marker + 'ox-allow:'.length).trim().split(/\s+/)[0];
  return named === rule;
}

/** True when `file` sits under an allowlisted prefix (posix-normalised). */
export function isAllowed(file, allowlist = ALLOWLIST) {
  const posix = file.split(path.sep).join('/');
  return allowlist.some((pattern) => {
    // A leading `*` matches by suffix, for a filename that repeats in every
    // component directory (`*/KitchenSink.tsx`); everything else is a prefix.
    if (pattern.startsWith('*')) return posix.endsWith(pattern.slice(1));
    return posix === pattern || posix.startsWith(pattern);
  });
}

function main(args) {
  const roots = args.length ? args : ['app'];
  const files = roots.flatMap((root) => listFiles(root)).filter((file) => !isAllowed(file));
  let problems = 0;
  for (const file of files) {
    for (const f of checkRtl(file, fs.readFileSync(file, 'utf8'))) {
      problems++;
      console.error(`${f.file}:${f.line} [${f.rule}] ${f.text}`);
    }
  }
  console.log(`check-rtl: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
