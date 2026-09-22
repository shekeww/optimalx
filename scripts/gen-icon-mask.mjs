// Generates the --ox-cart-glyph CSS custom property in app/styles/tokens.css
// from the sprite's ox-cart symbol (app/assets/ox-sprite.svg).
//
// `_b3-product.scss` masks a pseudo-element with this token twice (the sticky
// buy bar and the card's native add button, ~1355-1391): both take no
// children, so the cart glyph the rest of the theme draws through `<Icon
// name="cart">` has to arrive as a CSS mask instead. Generating it from the
// sprite symbol, rather than hand-copying the paths a second time, is what
// keeps the two in agreement when the drawing changes (S2a, 2026-09-22).
//
// Run: node scripts/gen-icon-mask.mjs [--check]
//   --check  exits 1 when tokens.css's generated block differs from what this
//            script would write (a stale token after the sprite changed, or a
//            hand edit), and writes nothing.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SPRITE = path.join('app', 'assets', 'ox-sprite.svg');
export const TARGET = path.join('app', 'styles', 'tokens.css');
export const SYMBOL_ID = 'ox-cart';
export const START_MARKER = '/* ---------- Generated: scripts/gen-icon-mask.mjs (do not hand-edit) ---------- */';
export const END_MARKER = '/* ---------- End generated ---------- */';

/**
 * Reads one `<symbol id="...">` body out of the inline sprite source.
 * @param {string} source
 * @param {string} id
 * @returns {string}
 */
export function readSymbolBody(source, id) {
  const match = source.match(new RegExp(`<symbol id="${id}"[^>]*>([\\s\\S]*?)</symbol>`));
  if (!match) throw new Error(`gen-icon-mask: no symbol #${id} in ${SPRITE}`);
  return match[1];
}

/**
 * Turns a symbol body into the SVG-in-a-data-URI a CSS mask needs: every
 * `<path>`'s `d`, stroked by the wrapper's own defaults unless it carries the
 * accent class, which is filled solid instead — a mask has no colour, so the
 * distinction the accent makes through `<Icon>` (a second, orange element) is
 * drawn here as "part of the silhouette" instead, the closest a one-colour
 * mask gets to the same shape.
 * @param {string} symbolBody
 * @returns {string}
 */
export function maskDataUri(symbolBody) {
  const elements = [...symbolBody.matchAll(/<path\b([^>]*)\/>/g)].map((match) => match[1]);
  if (elements.length === 0) throw new Error('gen-icon-mask: symbol has no <path> elements');
  const parts = elements.map((attrs) => {
    const d = attrs.match(/\sd="([^"]+)"/)?.[1];
    if (!d) throw new Error('gen-icon-mask: <path> with no d attribute');
    const isAccent = /class="ox-icon__accent"/.test(attrs);
    const paint = isAccent ? " fill='%23000' stroke='none'" : '';
    return `%3Cpath d='${d}'${paint}/%3E`;
  });
  const svg =
    `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' ` +
    `stroke-width='1.8' stroke-linejoin='miter' stroke-linecap='square'%3E${parts.join('')}%3C/svg%3E`;
  return `url("data:image/svg+xml,${svg}")`;
}

/**
 * The generated block, markers included, ready to splice into tokens.css.
 * @param {string} spriteSource
 * @returns {string}
 */
export function renderBlock(spriteSource) {
  const token = maskDataUri(readSymbolBody(spriteSource, SYMBOL_ID));
  return `${START_MARKER}\n:root {\n  --ox-cart-glyph: ${token};\n}\n${END_MARKER}\n`;
}

/**
 * Splices `block` into `css`, replacing an existing marked block if one is
 * there, else appending one after a blank line.
 * @param {string} css
 * @param {string} block
 * @returns {string}
 */
export function spliceBlock(css, block) {
  const startIndex = css.indexOf(START_MARKER);
  const endIndex = css.indexOf(END_MARKER);
  if (startIndex >= 0 && endIndex >= startIndex) {
    const before = css.slice(0, startIndex);
    const after = css.slice(endIndex + END_MARKER.length).replace(/^\n/, '');
    return `${before}${block}${after}`;
  }
  const trimmed = css.replace(/\n+$/, '\n');
  return `${trimmed}\n${block}`;
}

function main(args) {
  const spriteSource = fs.readFileSync(SPRITE, 'utf8');
  const block = renderBlock(spriteSource);
  const current = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : '';
  const next = spliceBlock(current, block);
  if (args.includes('--check')) {
    if (current !== next) {
      console.error(`${TARGET} is out of date with the sprite; run node scripts/gen-icon-mask.mjs`);
      return 1;
    }
    console.log(`gen-icon-mask: ${TARGET} up to date with #${SYMBOL_ID}`);
    return 0;
  }
  fs.writeFileSync(TARGET, next, 'utf8');
  console.log(`gen-icon-mask: wrote --ox-cart-glyph from #${SYMBOL_ID} to ${TARGET}`);
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
