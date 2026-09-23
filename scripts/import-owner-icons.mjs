// Builds app/assets/ox-sprite.svg from the owner's delivered icon system
// (optimal-x-icons/, read-only input — see docs/build/progress/S8b.md). The
// owner's 47 drawings become the sprite of record from 2026-09-24; nothing in
// optimal-x-icons/ is redrawn or "improved" here, only translated into our
// sprite's existing contract (docs/build/progress/S6a.md §1.2, S6d.md §2):
// one <symbol id="ox-{name}" viewBox="0 0 24 24" class="ox-sym" fill="none"
// stroke="currentColor" stroke-width="2" stroke-linecap="square"
// stroke-linejoin="miter" stroke-miterlimit="4">, the accent painted only
// through class="ox-icon__accent"(--stroke), data-mirror="1" on the symbols
// Icon.tsx flips under RTL.
//
// What this script does, per owner SVG:
//   1. strips the <metadata><c2pa:manifest>…</c2pa:manifest></metadata> blob
//      (hundreds of KB of base64 that must never ship) and the xmlns:c2pa
//      attribute;
//   2. takes the root <svg>'s children;
//   3. converts the owner's two inline accent styles to our accent classes
//      (style="stroke:var(--ox-accent,#FF4A1A)" -> class="ox-icon__accent
//      ox-icon__accent--stroke"; style="fill:var(--ox-accent,#FF4A1A)"[;
//      stroke:none] -> class="ox-icon__accent" stroke="none" — both fill
//      forms mean "this element's whole paint is the accent", which is
//      exactly what ox-icon__accent already is in _primitives.scss) and any
//      other inline style to the equivalent presentation attributes, so no
//      <style> and no literal colour survives;
//   4. self-closes empty <path>/<circle>/<rect> tags (the owner writes
//      <path…></path>; our sprite and scripts/gen-icon-mask.mjs's <path…/>
//      matcher both expect the self-closed form — purely a tag-syntax
//      normalisation, the geometry is untouched);
//   5. wraps the result in our <symbol> shell, with data-mirror="1" where
//      icons.json's rtlFlip says so.
// <circle>, <rect> and any other element the owner drew (including a
// <g transform="…"> wrapper on three icons) are kept exactly as drawn — nested
// content aside from the empty elements above is never touched.
//
// Four of our ids are aliases: a byte-for-byte copy of an owner drawing under
// a name our components already call. Verified against actual call sites
// before wiring (docs/build/progress/S8b.md): both `shield-check` callers
// (Header/UtilityTrust, BuyZone/TrustGrid) label the trust item "authentic",
// so `authentic`'s 14-point seal + accent check is the right source, not a
// generic verified/secure drawing. Each alias follows its source's rtlFlip.
//
// Every id Icon.tsx names that is neither one of the owner's 47 nor one of
// these four aliases is carried forward unchanged from the sprite already on
// disk when this script runs (git HEAD a5049de) — the "remaining" symbols the
// owner's set does not cover, with their -s twins where they have one. That
// is what makes two runs idempotent: the owner-derived symbols are a pure
// function of optimal-x-icons/svg/*.svg (untouched, read-only), and the
// carried-forward symbols are copied verbatim from whatever the previous run
// wrote, so nothing drifts between runs.
//
// Run: node scripts/import-owner-icons.mjs

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const OWNER_DIR = path.join('optimal-x-icons');
export const OWNER_SVG_DIR = path.join(OWNER_DIR, 'svg');
export const OWNER_MANIFEST_FILE = path.join(OWNER_DIR, 'icons.json');
/**
 * Owner-requested replacements drawn on the owner's own system: a file
 * app/assets/icon-overrides/<name>.svg replaces optimal-x-icons/svg/<name>.svg
 * at generation time (2026-09-24: goal-ideal-weight, "perfect weight without
 * body details"). The owner copies an override back into optimal-x-icons
 * when he adopts it, and the file here is then deleted.
 */
export const OVERRIDE_DIR = path.join('app', 'assets', 'icon-overrides');
export function readOwnerSource(icon) {
  const override = path.join(OVERRIDE_DIR, `${icon.name}.svg`);
  if (fs.existsSync(override)) return fs.readFileSync(override, 'utf8');
  return fs.readFileSync(path.join(OWNER_DIR, icon.file), 'utf8');
}
export const SPRITE_FILE = path.join('app', 'assets', 'ox-sprite.svg');

/**
 * Our id -> the owner's manifest name it is a byte-for-byte copy of.
 * @type {Record<string, string>}
 */
export const ALIASES = {
  heart: 'wishlist',
  headset: 'help',
  truck: 'shipping',
  'shield-check': 'authentic',
};

const SYMBOL_OPEN =
  'viewBox="0 0 24 24" class="ox-sym" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4"';

/**
 * Strips the c2pa metadata blob and the xmlns:c2pa attribute, and returns the
 * root <svg>'s inner markup (its children, as source text).
 * @param {string} source
 * @returns {string}
 */
export function ownerSvgInner(source) {
  const stripped = source
    .replace(/<metadata>[\s\S]*?<\/metadata>/, '')
    .replace(/\s*xmlns:c2pa="[^"]*"/, '');
  const match = stripped.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
  if (!match) throw new Error('import-owner-icons: no <svg> root found in owner source');
  return match[1];
}

/**
 * Converts the owner's inline accent styles to our accent classes, and any
 * other inline style to presentation attributes. Throws rather than let a
 * literal colour reach the sprite.
 * @param {string} inner
 * @returns {string}
 */
export function convertAccentStyles(inner) {
  let out = inner;
  // Fill accent (a plane): with or without an explicit ";stroke:none", the
  // owner's meaning is the same — this element's whole paint is the accent —
  // which is exactly what class="ox-icon__accent" already is
  // (_primitives.scss: fill: var(--ox-icon-mono, var(--ox-accent)); stroke:
  // none). The explicit stroke="none" attribute is added too so the paint is
  // right even before the stylesheet loads.
  out = out.replace(
    /\sstyle="fill:var\(--ox-accent,#FF4A1A\)(?:;stroke:none)?"/g,
    ' class="ox-icon__accent" stroke="none"'
  );
  // Stroke accent (a line).
  out = out.replace(
    /\sstyle="stroke:var\(--ox-accent,#FF4A1A\)"/g,
    ' class="ox-icon__accent ox-icon__accent--stroke"'
  );
  // Anything else: presentation attributes, not a style block — and never a
  // literal colour.
  out = out.replace(/\sstyle="([^"]*)"/g, (_all, decls) => {
    const attrs = decls
      .split(';')
      .map((decl) => decl.trim())
      .filter(Boolean)
      .map((decl) => {
        const [prop, value] = decl.split(':').map((part) => part.trim());
        if (!prop || !value) throw new Error(`import-owner-icons: unparsable style "${decl}"`);
        if (/#[0-9a-fA-F]{3,6}\b/.test(value)) {
          throw new Error(`import-owner-icons: literal colour in unhandled style "${decl}"`);
        }
        return ` ${prop}="${value}"`;
      });
    return attrs.join('');
  });
  return out;
}

/**
 * Self-closes empty <path>, <circle> and <rect> tags (the owner writes
 * <path…></path>; our sprite convention, and scripts/gen-icon-mask.mjs's
 * <path…/> matcher, both expect <path…/>). Geometry is untouched.
 * @param {string} inner
 * @returns {string}
 */
export function selfCloseEmptyTags(inner) {
  return inner.replace(/<(path|circle|rect)((?:\s[^>]*)?)\s*><\/\1>/g, '<$1$2/>');
}

/**
 * One owner SVG source -> one <symbol>…</symbol>, ready to splice into the
 * sprite.
 * @param {string} id e.g. "ox-cart"
 * @param {string} svgSource the owner's raw file contents
 * @param {boolean} mirror
 * @returns {string}
 */
export function renderOwnerSymbol(id, svgSource, mirror) {
  const inner = selfCloseEmptyTags(convertAccentStyles(ownerSvgInner(svgSource)));
  if (/#[0-9a-fA-F]{3,6}\b/.test(inner)) {
    throw new Error(`import-owner-icons: literal colour survives in ${id}`);
  }
  const mirrorAttr = mirror ? ' data-mirror="1"' : '';
  return `<symbol id="${id}" ${SYMBOL_OPEN}${mirrorAttr}>${inner}</symbol>`;
}

/**
 * Every <symbol id="…">…</symbol> in a sprite source, in document order.
 * @param {string} source
 * @returns {{ id: string, full: string }[]}
 */
export function parseSymbols(source) {
  const symbols = [];
  for (const match of source.matchAll(/<symbol\s+([^>]*)>[\s\S]*?<\/symbol>/g)) {
    const idMatch = match[1].match(/\bid="([^"]+)"/);
    if (!idMatch) continue;
    symbols.push({ id: idMatch[1], full: match[0] });
  }
  return symbols;
}

/** Strips the "ox-" prefix and a trailing "-s" twin suffix. */
function baseName(id) {
  const withoutPrefix = id.replace(/^ox-/, '');
  return withoutPrefix.endsWith('-s') ? withoutPrefix.slice(0, -2) : withoutPrefix;
}

const HEADER = `<!--
  OptimalX icon sprite. Built by scripts/import-owner-icons.mjs (S8b,
  2026-09-24) from the owner's delivered icon system, optimal-x-icons/ — the
  sprite of record from this date. See docs/build/progress/S8b.md and
  docs/build/ICONS-2026-09-24.md for the mapping table and the rules the
  remaining, non-owner symbols still follow.

  * The owner's 47 drawings ship as delivered: metadata stripped, inline
    accent styles converted to class="ox-icon__accent"(--stroke) so the theme
    token (--ox-accent) paints them, everything else — geometry, <circle>,
    <rect>, <g transform> — untouched.
  * Four ids are aliases, a byte-for-byte copy of an owner drawing under a
    name our components already call: ox-heart = wishlist, ox-headset = help,
    ox-truck = shipping, ox-shield-check = authentic.
  * data-mirror="1" follows icons.json's rtlFlip for the owner's symbols and
    aliases (cart, shipping, written-question, and truck by inheriting
    shipping's), plus our own directional set carried forward below
    (chevron-start, chevron-end, arrow, external, play).
  * Everything else is a symbol the owner's set does not cover, carried
    forward unchanged from the sprite this script read when it last ran
    (docs/build/progress/S6a.md/S6d.md govern those). #ox-mark is one of
    them: never mirrored, pinned byte-for-byte by scripts/check-identity.mjs.

  The weight lives on each <symbol>, not on this root <svg>: <use> clones a
  symbol into a shadow tree that inherits from the <use> element, so a root
  value never reaches a rendered path (S6a §1.1). The <style> below wires
  stroke-width to a custom property so the 16px step can bump it.

  Inlined once by <Sprite />; referenced with <use href="#ox-{name}">.
-->
<style>.ox-sym{stroke-width:var(--ox-icon-stroke,2px)}.ox-icon--16{--ox-icon-stroke:2.25px}</style>
`;

/**
 * Assembles the full sprite file from the three symbol groups.
 * @param {{ ownerSymbols: string[], aliasSymbols: string[], carryForward: { id: string, full: string }[] }} groups
 * @returns {string}
 */
export function buildSpriteFile({ ownerSymbols, aliasSymbols, carryForward }) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" focusable="false" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n' +
    HEADER +
    '\n<!-- OWNER ICON SYSTEM (optimal-x-icons, 2026-09-24) -->\n' +
    ownerSymbols.join('\n') +
    '\n\n<!-- ALIASES: our ids mapped onto the owner\'s drawings -->\n' +
    aliasSymbols.join('\n') +
    '\n\n<!-- REMAINING SYMBOLS: not covered by the owner\'s set, carried forward -->\n' +
    carryForward.map((symbol) => symbol.full).join('\n') +
    '\n</svg>\n'
  );
}

/**
 * Reads the owner's manifest and every svg/*.svg it names, the sprite
 * already on disk (for the symbols the owner's set does not cover), and
 * returns the sprite source this script would write.
 * @returns {string}
 */
export function generate() {
  const manifest = JSON.parse(fs.readFileSync(OWNER_MANIFEST_FILE, 'utf8'));
  const ownerIcons = manifest.icons;
  const iconByName = new Map(ownerIcons.map((icon) => [icon.name, icon]));

  const ownerSymbols = ownerIcons.map((icon) => {
    const source = readOwnerSource(icon);
    return renderOwnerSymbol(`ox-${icon.name}`, source, icon.rtlFlip);
  });

  const aliasSymbols = Object.entries(ALIASES).map(([id, sourceName]) => {
    const icon = iconByName.get(sourceName);
    if (!icon) throw new Error(`import-owner-icons: alias source "${sourceName}" not in manifest`);
    const source = readOwnerSource(icon);
    return renderOwnerSymbol(`ox-${id}`, source, icon.rtlFlip);
  });

  const replacedNames = new Set([...iconByName.keys(), ...Object.keys(ALIASES)]);
  const existingSource = fs.existsSync(SPRITE_FILE) ? fs.readFileSync(SPRITE_FILE, 'utf8') : '';
  const carryForward = parseSymbols(existingSource).filter(
    (symbol) => !replacedNames.has(baseName(symbol.id))
  );

  return buildSpriteFile({ ownerSymbols, aliasSymbols, carryForward });
}

function main() {
  const next = generate();
  fs.writeFileSync(SPRITE_FILE, next, 'utf8');
  console.log(
    `import-owner-icons: wrote ${SPRITE_FILE} (${Buffer.byteLength(next, 'utf8')} bytes)`
  );
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main();
