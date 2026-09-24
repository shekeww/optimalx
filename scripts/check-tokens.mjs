// Token gate: every `var(--ox-*)` the theme reads has to resolve to something,
// either a real definition or a fallback written into the same `var()` call.
// This is the class of bug that clipped the hero CTA through a non-existent
// `--ox-5` (S2a brief, 2026-09-22), a typo a build never catches, because an
// undefined custom property is not a CSS error, it is a silent computed value
// of `initial` (or the property's own inherited value, in practice usually
// nothing at all).
//
// Definitions come ONLY from app/styles/tokens.css and any generated partial
// (a file matching app/styles/**/_generated-*.scss), the theme's actual
// component stylesheets and TSX also declare plenty of their own scoped
// custom properties (`--ox-rating-fill` set inline, `--ox-need-arrow` local
// to a card), and this gate does not know those are legitimate; the existing
// convention already covers them, every read of a scoped property supplies
// its own fallback (`var(--ox-icon-size, 24px)`), which is exactly what lets
// this gate tell a real typo from a locally-set value.
//
// Usage: node scripts/check-tokens.mjs
// Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const TOKENS_FILE = path.join('app', 'styles', 'tokens.css');
export const DEFINITION_ROOTS = [path.join('app', 'styles')];
export const USE_ROOTS = [path.join('app', 'styles'), 'app'];
const DEFINITION_EXTENSIONS = ['.css', '.scss'];
const USE_EXTENSIONS = ['.css', '.scss', '.tsx'];

const DEFINITION_RE = /(--ox-[a-zA-Z0-9-]+)\s*:/g;
const USE_RE = /var\(\s*(--ox-[a-zA-Z0-9-]+)\s*([,)])/g;

/** True for tokens.css itself and any generated partial (see module doc). */
export function isDefinitionSource(file) {
  const posix = file.split(path.sep).join('/');
  if (posix === TOKENS_FILE.split(path.sep).join('/')) return true;
  return /\/_generated-[^/]+\.scss$/.test(posix);
}

/** Depth-first file list under `root`, filtered by extension. */
export function listFiles(root, extensions) {
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

/** Every `--ox-*` custom property declared anywhere in `text`. */
export function findDefinitions(text) {
  return new Set([...text.matchAll(DEFINITION_RE)].map((match) => match[1]));
}

/**
 * Every `var(--ox-*)` read in `text`, with whether that read supplies its own
 * fallback (a second argument after the comma).
 * @returns {{ name: string, hasFallback: boolean }[]}
 */
export function findUses(text) {
  return [...text.matchAll(USE_RE)].map((match) => ({
    name: match[1],
    hasFallback: match[2] === ',',
  }));
}

function main() {
  const definitionFiles = DEFINITION_ROOTS.flatMap((root) => listFiles(root, DEFINITION_EXTENSIONS)).filter(
    isDefinitionSource
  );
  const defined = new Set();
  for (const file of definitionFiles) {
    for (const name of findDefinitions(fs.readFileSync(file, 'utf8'))) defined.add(name);
  }

  const useFiles = USE_ROOTS.flatMap((root) => listFiles(root, USE_EXTENSIONS));
  let problems = 0;
  for (const file of useFiles) {
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    // A property declared in the same file it is read from is a scoped token
    // (a card's --ox-need-arrow, a section's --ox-shaker-*): legitimate, and
    // the typo this gate exists for cannot hide behind it, because a typo has
    // no declaration anywhere.
    const local = new Set(findDefinitions(text));
    for (const use of findUses(text)) {
      if (use.hasFallback || defined.has(use.name) || local.has(use.name)) continue;
      const lineIndex = lines.findIndex((line) => line.includes(use.name));
      const lineNumber = lineIndex >= 0 ? lineIndex + 1 : '?';
      problems++;
      console.error(`${file}:${lineNumber} [undefined-token] var(${use.name}) has no definition and no fallback`);
    }
  }
  console.log(
    `check-tokens: ${defined.size} token(s) defined, ${useFiles.length} file(s) scanned, ${problems} problem(s)`
  );
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main();
