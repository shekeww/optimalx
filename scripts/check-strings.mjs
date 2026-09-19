// Hardcoded-copy and claims lint (BUILD.md section 4 "no hardcoded UI text";
// PLAN-final 2.1 "Scripts" and 5.1 "Claims gates").
//
// Rules (one finding per line, `file:line [rule] text`):
//   arabic-literal    Arabic script inside a string literal or JSX text in app/
//                     (every user-visible string is a t('ox.*') key)
//   latin-sentence    a quoted Latin sentence in JSX text or a display attribute
//                     (label, title, placeholder, alt, aria-label) in app/**/*.tsx
//   threshold-literal the free-shipping number 299 in app/ or locales/
//                     (it comes from the free_shipping_threshold setting and is
//                     interpolated as {threshold}; 5.1 row 1)
//   payment-name      a payment method name in app/ or locales/ (5.1 row 3:
//                     marks render through SallaPayments, never as text)
//
// Comments are stripped before matching, so an engine-fact comment that quotes a
// dashboard label is not a finding. The one Arabic word that is both a payment
// mark and ordinary MSA is مدى; the collocation "على مدى" (over a span of time)
// is the only form this corpus uses, so it is exempted by the preceding word.
//
// Usage: node scripts/check-strings.mjs [path ...]   (default: app locales)
// Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listFiles, isAllowed, stripComments, hasPragma } from './check-rtl.mjs';

/**
 * Files whose literals are data, not copy. `salla-ids.ts` is generated from the
 * store's own product names; test files render fixtures.
 */
export const ALLOWLIST = [
  // Generated from the store's own product names (PLAN-final P1a).
  'app/content/salla-ids.ts',
  // Fixtures, not copy.
  'tests/',
  // Parser token tables, not copy: Arabic weekday, closed and range words for
  // the branch_hours parser (P1b owns the file) and the spec-line and nutrition
  // label prefixes the product description parser matches on (B3 owns them).
  'app/components/blocks/contentFallback.ts',
  'app/components/product/lib/',
  // B0 demo scaffold with English placeholder copy; B6 replaces it in wave 2.
  'app/components/CustomCartPage.tsx',
  // The kitchen sink is a dev-only test fixture, not a storefront page: its
  // section chrome is English on purpose and its Arabic strings are stress
  // fixtures (the longest real catalogue name, mixed direction, numerals).
  // Putting them in locales/ would be noise in the file translators read, and
  // the route renders "Not found." outside DEV (PLAN-final C16).
  'app/routes/kitchen-sink.tsx',
  '*/KitchenSink.tsx',
];

const ARABIC_BLOCK = `${String.fromCharCode(0x0600)}-${String.fromCharCode(0x06ff)}`;
const ARABIC_SUPPLEMENT = `${String.fromCharCode(0x0750)}-${String.fromCharCode(0x077f)}`;
const ARABIC_PRESENTATION = `${String.fromCharCode(0xfb50)}-${String.fromCharCode(0xfdff)}`;
const ARABIC_CLASS = `[${ARABIC_BLOCK}${ARABIC_SUPPLEMENT}${ARABIC_PRESENTATION}]`;

export const ARABIC = new RegExp(ARABIC_CLASS);

/** A word character in any script, so an Arabic token test has real boundaries. */
const LETTER = '\\p{L}\\p{M}';

/**
 * Payment marks that may never appear as text. `exemptBefore` is a preceding
 * word that makes the token ordinary MSA rather than a brand.
 */
export const PAYMENT_TOKENS = [
  { token: 'مدى', exemptBefore: ['على'] },
  { token: 'أبل باي', exemptBefore: [] },
  { token: 'ابل باي', exemptBefore: [] },
  { token: 'تابي', exemptBefore: [] },
  { token: 'فيزا', exemptBefore: [] },
];

const THRESHOLD = new RegExp('(^|[^0-9.])299([^0-9]|$)');

/** Attributes whose quoted value is shown to a person. */
const DISPLAY_ATTRIBUTES = ['label', 'title', 'placeholder', 'alt', 'aria-label', 'aria-description'];
const DISPLAY_ATTRIBUTE = new RegExp(`(${DISPLAY_ATTRIBUTES.join('|')})=("[^"]{2,}"|'[^']{2,}')`, 'g');
const JSX_TEXT = new RegExp('>([^<>{}]{4,})<', 'g');
const LATIN_SENTENCE = new RegExp('[A-Za-z]{2,}(\\s+[A-Za-z][A-Za-z.,;:!?-]*){2,}');
/** Lines that are never copy: imports, exports, urls, css class strings. */
const NEVER_COPY = new RegExp('^\\s*(import|export|//|/\\*|\\*)|https?://');

/**
 * @param {string} token
 * @returns {RegExp} the token as a whole Arabic word, with the preceding word captured
 */
function tokenPattern(token) {
  return new RegExp(`([${LETTER}]+)?\\s*(?<![${LETTER}])${token}(?![${LETTER}])`, 'gu');
}

/**
 * @param {string} file
 * @param {string} text
 * @returns {{ file: string, line: number, rule: string, text: string }[]}
 */
export function checkStrings(file, text) {
  const findings = [];
  const isJson = file.endsWith('.json');
  const isTsx = file.endsWith('.tsx');
  const isSource = file.endsWith('.ts') || isTsx;
  const raw = text.split(/\r?\n/);
  const lines = (isJson ? text : stripComments(text)).split(/\r?\n/);

  lines.forEach((line, index) => {
    const at = { file, line: index + 1, text: raw[index].trim() };

    if (isSource && ARABIC.test(line) && !hasPragma(raw[index], 'arabic-literal')) {
      findings.push({ ...at, rule: 'arabic-literal' });
    }

    if (isTsx && !NEVER_COPY.test(line)) {
      const candidates = [];
      for (const match of line.matchAll(JSX_TEXT)) candidates.push(match[1]);
      for (const match of line.matchAll(DISPLAY_ATTRIBUTE)) candidates.push(match[2].slice(1, -1));
      if (
        candidates.some((candidate) => LATIN_SENTENCE.test(candidate)) &&
        !hasPragma(raw[index], 'latin-sentence')
      ) {
        findings.push({ ...at, rule: 'latin-sentence' });
      }
    }

    if (THRESHOLD.test(line) && !hasPragma(raw[index], 'threshold-literal')) {
      findings.push({ ...at, rule: 'threshold-literal' });
    }

    for (const { token, exemptBefore } of PAYMENT_TOKENS) {
      for (const match of line.matchAll(tokenPattern(token))) {
        const before = (match[1] ?? '').trim();
        if (exemptBefore.includes(before)) continue;
        if (hasPragma(raw[index], 'payment-name')) continue;
        findings.push({ ...at, rule: 'payment-name' });
        break;
      }
    }
  });

  return findings.sort((a, b) => a.line - b.line);
}

function main(args) {
  const roots = args.length ? args : ['app', 'locales'];
  const files = roots
    .flatMap((root) => listFiles(root, ['.ts', '.tsx', '.json']))
    .filter((file) => !isAllowed(file, ALLOWLIST));
  let problems = 0;
  for (const file of files) {
    for (const f of checkStrings(file, fs.readFileSync(file, 'utf8'))) {
      problems++;
      console.error(`${f.file}:${f.line} [${f.rule}] ${f.text}`);
    }
  }
  console.log(`check-strings: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
