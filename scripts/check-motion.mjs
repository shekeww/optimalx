// Motion and render-budget lint (DIRECTION 7, 10.1 rules 1 to 3, amendment A9;
// PLAN-final 2.1 "Scripts").
//
// Rules (one finding per line, `file:line [rule] text`):
//   filter-blur       filter: blur(...)        a glow is a radial gradient here, never a blur
//   backdrop-filter   backdrop-filter          the budget for this theme is 0 backdrop roots
//   will-change       will-change              no permanent compositor promotion
//   translateZ / translate3d / transform-gpu   the same, in transform form
//   blur-utility      blur-* Tailwind utility
//   drop-shadow       drop-shadow(...) or the drop-shadow-* utility
//   negative-tracking letter-spacing: -...     Arabic tracking is always 0 (DIRECTION 3.2)
//   wedge-motion      `transition` or `animation` inside a rule whose selector names a
//                     wedge element (A9: nothing on a wedge ever animates)
//
// Wedge selectors: .ox-hero__photo, .ox-hero__stroke, .ox-hero__corner, .ox-band__wedge.
//
// Scope: app/**/*.{ts,tsx,css,scss} minus ALLOWLIST. Comments are stripped
// before matching. Usage: node scripts/check-motion.mjs [path ...] (default app).
// Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listFiles, isAllowed, stripComments, hasPragma } from './check-rtl.mjs';

/** Same reasoning as check-rtl's list: inherited Raed scaffolding only. */
export const ALLOWLIST = [
  'app/styles/01-settings/',
  'app/styles/02-generic/',
  'app/styles/03-elements/',
  'app/styles/04-components/',
  'app/styles/05-utilities/',
];

export const RULES = [
  ['filter-blur', new RegExp('filter:\\s*blur')],
  ['backdrop-filter', new RegExp('backdrop-filter')],
  ['will-change', new RegExp('will-change')],
  ['translateZ', new RegExp('translateZ')],
  ['translate3d', new RegExp('translate3d')],
  ['transform-gpu', new RegExp('transform-gpu')],
  ['blur-utility', new RegExp('(^|[^-\\w])blur-')],
  ['drop-shadow', new RegExp('drop-shadow')],
  ['negative-tracking', new RegExp('letter-spacing:\\s*-')],
];

/** Elements that carry a clip-path wedge; nothing on them may move (A9). */
export const WEDGE_SELECTORS = [
  '.ox-hero__photo',
  '.ox-hero__stroke',
  '.ox-hero__corner',
  '.ox-band__wedge',
];

const MOTION_DECLARATION = new RegExp('(^|[^-\\w])(transition|animation)(-[a-z]+)?\\s*:');

/**
 * Resolves one SCSS selector against its parent so `&__photo` under `.ox-hero`
 * reads as `.ox-hero__photo`. Comma groups are joined; the result is only ever
 * tested with `includes`, so exact grouping does not matter.
 * @param {string} selector
 * @param {string} parent
 * @returns {string}
 */
export function resolveSelector(selector, parent) {
  return selector
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.includes('&')) return trimmed.split('&').join(parent);
      return parent ? `${parent} ${trimmed}` : trimmed;
    })
    .join(', ');
}

/**
 * Walks a stylesheet brace by brace, tracking the selector stack, and reports a
 * `transition` or `animation` declaration inside a rule whose selector chain
 * names a wedge element. SCSS nesting is handled by the stack; `&` is resolved
 * by concatenating the ancestors' text, which is enough for a name test.
 * @param {string} file
 * @param {string} text  comment-stripped source
 * @returns {{ file: string, line: number, rule: string, text: string }[]}
 */
export function checkWedgeMotion(file, text, raw) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  const rawLines = raw.split(/\r?\n/);
  /** @type {string[]} */
  const stack = [];
  let pending = '';
  lines.forEach((line, index) => {
    let rest = line;
    for (;;) {
      const open = rest.indexOf('{');
      const close = rest.indexOf('}');
      if (open < 0 && close < 0) break;
      if (open >= 0 && (close < 0 || open < close)) {
        stack.push(resolveSelector((pending + rest.slice(0, open)).trim(), stack[stack.length - 1] ?? ''));
        pending = '';
        rest = rest.slice(open + 1);
        continue;
      }
      stack.pop();
      pending = '';
      rest = rest.slice(close + 1);
    }
    pending = (pending + rest).trim() ? `${pending} ${rest}` : '';
    const chain = stack.join(' ');
    if (!WEDGE_SELECTORS.some((selector) => chain.includes(selector))) return;
    if (MOTION_DECLARATION.test(line) && !hasPragma(rawLines[index], 'wedge-motion')) {
      findings.push({ file, line: index + 1, rule: 'wedge-motion', text: rawLines[index].trim() });
    }
  });
  return findings;
}

/**
 * @param {string} file
 * @param {string} text
 * @returns {{ file: string, line: number, rule: string, text: string }[]}
 */
export function checkMotion(file, text) {
  const findings = [];
  const stripped = stripComments(text);
  const lines = stripped.split(/\r?\n/);
  const raw = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const [rule, pattern] of RULES) {
      if (pattern.test(line) && !hasPragma(raw[index], rule)) {
        findings.push({ file, line: index + 1, rule, text: raw[index].trim() });
      }
    }
  });
  findings.push(...checkWedgeMotion(file, stripped, text));
  return findings.sort((a, b) => a.line - b.line);
}

function main(args) {
  const roots = args.length ? args : ['app'];
  const files = roots.flatMap((root) => listFiles(root)).filter((file) => !isAllowed(file, ALLOWLIST));
  let problems = 0;
  for (const file of files) {
    for (const f of checkMotion(file, fs.readFileSync(file, 'utf8'))) {
      problems++;
      console.error(`${f.file}:${f.line} [${f.rule}] ${f.text}`);
    }
  }
  console.log(`check-motion: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
