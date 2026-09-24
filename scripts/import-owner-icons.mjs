// Builds app/assets/ox-sprite.svg from the owner's delivered icon system
// (optimal-x-icons/, read-only input, see docs/build/progress/S8b.md). The
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
//      stroke:none] -> class="ox-icon__accent" stroke="none", both fill
//      forms mean "this element's whole paint is the accent", which is
//      exactly what ox-icon__accent already is in _primitives.scss) and any
//      other inline style to the equivalent presentation attributes, so no
//      <style> and no literal colour survives;
//   4. self-closes empty <path>/<circle>/<rect> tags (the owner writes
//      <path…></path>; our sprite and scripts/gen-icon-mask.mjs's <path…/>
//      matcher both expect the self-closed form, purely a tag-syntax
//      normalisation, the geometry is untouched);
//   5. wraps the result in our <symbol> shell, with data-mirror="1" where
//      icons.json's rtlFlip says so.
// <circle>, <rect> and any other element the owner drew (including a
// <g transform="…"> wrapper on three icons) are kept exactly as drawn, nested
// content aside from the empty elements above is never touched.
//
// Two owner rulings, 2026-09-24 (docs/build/ICONS-2026-09-24.md, this file's
// own header note), layered on top of step 5's shell:
//   a. the source root's own viewBox, stroke-width, stroke-linecap,
//      stroke-linejoin and overflow, when it carries one, ship on the
//      <symbol> in place of the shell default (ownerSvgRootAttrs); an
//      override file (app/assets/icon-overrides/, readOwnerSource above) is
//      exactly this case, e.g. goal-ideal-weight's own 2.3 stroke and round
//      caps/joins;
//   b. the ten product-category symbols (manifest category
//      "product-categories") additionally take stroke-linejoin="round" -
//      corners only, caps stay square, no geometry touched, via
//      CATEGORY_ATTRS, applied after (a) so it wins even though the owner's
//      category files also spell out the default "miter" themselves.
//
// Four of our ids are aliases: a byte-for-byte copy of an owner drawing under
// a name our components already call. Verified against actual call sites
// before wiring (docs/build/progress/S8b.md): both `shield-check` callers
// (Header/UtilityTrust, BuyZone/TrustGrid) label the trust item "authentic",
// so `authentic`'s 14-point seal + accent check is the right source, not a
// generic verified/secure drawing. Each alias follows its source's rtlFlip.
//
// A fifth, `star-fill` (S9j, 2026-09-25), is not an owner drawing: `star` is
// one of the "remaining" symbols below, not one of the owner's 47, so
// `star-fill` instead copies `star`'s current sprite geometry and repaints it
// solid via ALIAS_ATTRS. It still goes through this same alias path, copied
// by the generator, never hand-edited into the sprite, so it stays in step
// with `star` if that drawing ever changes.
//
// Every id Icon.tsx names that is neither one of the owner's 47 nor one of
// these four aliases is carried forward unchanged from the sprite already on
// disk when this script runs (git HEAD a5049de), the "remaining" symbols the
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
 * Our id -> the name it is a copy of: an owner manifest name for four of the
 * five aliases, byte-for-byte; `star-fill`'s source, `star`, is not in the
 * owner's manifest, so it copies whatever the sprite already carries for
 * `ox-star` instead (see `generate()`).
 * @type {Record<string, string>}
 */
export const ALIASES = {
  heart: 'wishlist',
  headset: 'help',
  truck: 'shipping',
  'shield-check': 'authentic',
  'star-fill': 'star',
};

/**
 * Shell paint attributes an alias may override (owner ruling, 2026-09-25,
 * S9j): `star-fill` is `star`'s geometry painted solid, because a
 * presentation attribute on a `<symbol>`, `star`'s own `fill="none"`, always
 * outranks a CSS fill declared on the `<use>` that references it, so the
 * Google-rating fill row's stylesheet rule could never have worked. Every
 * other alias has no entry here and keeps the shell's plain `fill="none"
 * stroke="currentColor"`.
 * @type {Record<string, Record<string, string>>}
 */
export const ALIAS_ATTRS = {
  'star-fill': { fill: 'currentColor' },
};

/** The shell's own defaults for the five attributes a source root may override. */
const SHELL_DEFAULTS = {
  viewBox: '0 0 24 24',
  'stroke-width': '2',
  'stroke-linecap': 'square',
  'stroke-linejoin': 'miter',
};

/**
 * Owner ruling, 2026-09-24, item 2: "sharp angled icons such as the product
 * categories [should be] a bit rounded on the edges if it does not ruin the
 * shape." Corners only, caps stay square, no path data touched, keyed by
 * the owner's manifest category (optimal-x-icons/icons.json).
 * @type {Record<string, Record<string, string>>}
 */
export const CATEGORY_ATTRS = {
  'product-categories': { 'stroke-linejoin': 'round' },
};

/**
 * The five presentation attributes a source root may declare for itself
 * (owner ruling, 2026-09-24, item 1): when present, each ships on the
 * <symbol> in place of the shell default. Every other shell attribute
 * (class, fill, stroke, stroke-miterlimit) is ours regardless of what the
 * source declares.
 * @param {string} source
 * @returns {Record<string, string>}
 */
export function ownerSvgRootAttrs(source) {
  const match = source.match(/<svg\b([^>]*)>/);
  if (!match) throw new Error('import-owner-icons: no <svg> root found in owner source');
  const attrs = {};
  for (const name of ['viewBox', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'overflow']) {
    const attrMatch = match[1].match(new RegExp(`\\s${name}="([^"]*)"`));
    if (attrMatch) attrs[name] = attrMatch[1];
  }
  return attrs;
}

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
  // owner's meaning is the same, this element's whole paint is the accent -
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
  // Anything else: presentation attributes, not a style block, and never a
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

/** The shell's own defaults for the two paint attributes an alias may override (ALIAS_ATTRS). */
const PAINT_DEFAULTS = { fill: 'none', stroke: 'currentColor' };

/**
 * One owner SVG source -> one <symbol>…</symbol>, ready to splice into the
 * sprite. `categoryAttrs` (CATEGORY_ATTRS[icon.category], item 2) is merged
 * in after the source root's own attributes (ownerSvgRootAttrs, item 1), so
 * the owner's per-category ruling wins even where the source also spells out
 * the shell default itself; `attrOverrides` (ALIAS_ATTRS, S9j 2026-09-25) is
 * merged in last of all, so an alias's own repaint always wins.
 * @param {string} id e.g. "ox-cart"
 * @param {string} svgSource the owner's raw file contents
 * @param {boolean} mirror
 * @param {Record<string, string>} [categoryAttrs]
 * @param {Record<string, string>} [attrOverrides]
 * @returns {string}
 */
export function renderOwnerSymbol(id, svgSource, mirror, categoryAttrs = {}, attrOverrides = {}) {
  const inner = selfCloseEmptyTags(convertAccentStyles(ownerSvgInner(svgSource)));
  if (/#[0-9a-fA-F]{3,6}\b/.test(inner)) {
    throw new Error(`import-owner-icons: literal colour survives in ${id}`);
  }
  const attrs = {
    ...SHELL_DEFAULTS,
    ...PAINT_DEFAULTS,
    ...ownerSvgRootAttrs(svgSource),
    ...categoryAttrs,
    ...attrOverrides,
  };
  const overflowAttr = attrs.overflow ? ` overflow="${attrs.overflow}"` : '';
  const symbolOpen =
    `viewBox="${attrs.viewBox}" class="ox-sym" fill="${attrs.fill}" stroke="${attrs.stroke}" ` +
    `stroke-width="${attrs['stroke-width']}" stroke-linecap="${attrs['stroke-linecap']}" ` +
    `stroke-linejoin="${attrs['stroke-linejoin']}" stroke-miterlimit="4"${overflowAttr}`;
  const mirrorAttr = mirror ? ' data-mirror="1"' : '';
  return `<symbol id="${id}" ${symbolOpen}${mirrorAttr}>${inner}</symbol>`;
}

/**
 * An alias whose source is not an owner manifest icon but a symbol already in
 * the sprite (S9j, 2026-09-25: `star-fill` from `star`). Reuses
 * `renderOwnerSymbol`'s same pipeline by wrapping the existing symbol's own
 * body in a synthetic root carrying its viewBox, so the two alias paths, an
 * owner file, or an existing symbol, produce the same shell guarantees.
 * @param {string} id e.g. "ox-star-fill"
 * @param {string} existingSymbolFull the full "<symbol …>…</symbol>" markup
 * @param {Record<string, string>} [attrOverrides]
 * @returns {string}
 */
export function renderSpriteAlias(id, existingSymbolFull, attrOverrides = {}) {
  const openMatch = existingSymbolFull.match(/<symbol\s+([^>]*)>/);
  const bodyMatch = existingSymbolFull.match(/<symbol\s+[^>]*>([\s\S]*)<\/symbol>/);
  if (!openMatch || !bodyMatch) {
    throw new Error(`import-owner-icons: malformed existing symbol markup for ${id}`);
  }
  const viewBoxMatch = openMatch[1].match(/\sviewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : SHELL_DEFAULTS.viewBox;
  const syntheticSource = `<svg viewBox="${viewBox}">${bodyMatch[1]}</svg>`;
  return renderOwnerSymbol(id, syntheticSource, false, {}, attrOverrides);
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
  2026-09-24) from the owner's delivered icon system, optimal-x-icons/, the
  sprite of record from this date. See docs/build/progress/S8b.md and
  docs/build/ICONS-2026-09-24.md for the mapping table and the rules the
  remaining, non-owner symbols still follow.

  * The owner's 47 drawings ship as delivered: metadata stripped, inline
    accent styles converted to class="ox-icon__accent"(--stroke) so the theme
    token (--ox-accent) paints them, everything else, geometry, <circle>,
    <rect>, <g transform>, untouched.
  * Four ids are aliases, a byte-for-byte copy of an owner drawing under a
    name our components already call: ox-heart = wishlist, ox-headset = help,
    ox-truck = shipping, ox-shield-check = authentic. A fifth, ox-star-fill
    (S9j, 2026-09-25), copies ox-star instead, not an owner drawing, and
    repaints it fill="currentColor" for the Google-rating fill row.
  * data-mirror="1" follows icons.json's rtlFlip for the owner's symbols and
    aliases (cart, shipping, written-question, and truck by inheriting
    shipping's), plus our own directional set carried forward below
    (chevron-start, chevron-end, arrow, external, play).
  * Everything else is a symbol the owner's set does not cover, carried
    forward unchanged from the sprite this script read when it last ran
    (docs/build/progress/S6a.md/S6d.md govern those). #ox-mark is one of
    them: never mirrored, pinned byte-for-byte by scripts/check-identity.mjs.
  * Two 2026-09-24 owner rulings (docs/build/ICONS-2026-09-24.md): a source
    file's own viewBox/stroke-width/stroke-linecap/stroke-linejoin/overflow
    ships on its symbol in place of the shell default (goal-ideal-weight's
    override: viewBox="1 1 22 22" stroke-width="2.3" round caps/joins); the
    ten product-category symbols additionally carry
    stroke-linejoin="round" (corners only, caps stay square).

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
    '\n\n<!-- ALIASES: our ids mapped onto the owner\'s drawings, plus star-fill onto ox-star -->\n' +
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
    return renderOwnerSymbol(`ox-${icon.name}`, source, icon.rtlFlip, CATEGORY_ATTRS[icon.category]);
  });

  const existingSource = fs.existsSync(SPRITE_FILE) ? fs.readFileSync(SPRITE_FILE, 'utf8') : '';
  const existingSymbolsById = new Map(parseSymbols(existingSource).map((symbol) => [symbol.id, symbol]));

  const aliasSymbols = Object.entries(ALIASES).map(([id, sourceName]) => {
    const attrOverrides = ALIAS_ATTRS[id];
    const icon = iconByName.get(sourceName);
    if (icon) {
      const source = readOwnerSource(icon);
      return renderOwnerSymbol(`ox-${id}`, source, icon.rtlFlip, CATEGORY_ATTRS[icon.category], attrOverrides);
    }
    // Not one of the owner's 47 (e.g. `star-fill`'s source, `star`): copy
    // whatever symbol is already in the sprite instead.
    const existing = existingSymbolsById.get(`ox-${sourceName}`);
    if (!existing) {
      throw new Error(`import-owner-icons: alias source "${sourceName}" not in manifest or sprite`);
    }
    return renderSpriteAlias(`ox-${id}`, existing.full, attrOverrides);
  });

  const replacedNames = new Set([...iconByName.keys(), ...Object.keys(ALIASES)]);
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
