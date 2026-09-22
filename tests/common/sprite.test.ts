import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  OX_BRAND_ICON_NAMES,
  OX_ICON_NAMES,
  OX_UI_ICON_NAMES,
} from '../../app/components/common/Icon';

/**
 * The sprite contract from DIRECTION 8.7. These are the rules a G2 reviewer
 * cannot check by eye across 32 symbols at four sizes.
 */
const FILE = path.join('app', 'assets', 'ox-sprite.svg');
const SOURCE = fs.readFileSync(FILE, 'utf8');

const SYMBOLS = [...SOURCE.matchAll(/<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)].map(
  (match) => ({ id: match[1], body: match[2] })
);

const brandIds = new Set(OX_BRAND_ICON_NAMES.map((name) => `ox-${name}`));
const uiIds = new Set(OX_UI_ICON_NAMES.map((name) => `ox-${name}`));

describe('ox-sprite.svg', () => {
  // The real count, hardcoded rather than read off `OX_ICON_NAMES.length`: the
  // two lists are meant to be edited together, and a test that derives its own
  // expectation from the same source it is checking cannot catch the case
  // where both are edited in lockstep but wrong (S2a, 2026-09-22).
  it('has exactly 53 symbols, one per declared name, with no duplicate id', () => {
    expect(SYMBOLS).toHaveLength(53);
    expect(OX_ICON_NAMES).toHaveLength(53);
    const ids = SYMBOLS.map((symbol) => symbol.id);
    expect(new Set(ids).size).toBe(53);
  });

  it('declares exactly the symbols Icon.tsx names', () => {
    const ids = SYMBOLS.map((symbol) => symbol.id).sort();
    const expected = OX_ICON_NAMES.map((name) => `ox-${name}`).sort();
    expect(ids).toEqual(expected);
  });

  it('gives every brand symbol exactly one accent element', () => {
    const wrong = SYMBOLS.filter((symbol) => brandIds.has(symbol.id))
      .filter((symbol) => (symbol.body.match(/class="ox-icon__accent/g) ?? []).length !== 1)
      .map((symbol) => symbol.id);
    expect(wrong).toEqual([]);
  });

  // Interface furniture is single colour on purpose: the approved design
  // spends the accent four times on a page, and a coloured chevron or a
  // coloured contact mark would be a fifth.
  it('gives no UI symbol an accent element', () => {
    const wrong = SYMBOLS.filter((symbol) => uiIds.has(symbol.id))
      .filter((symbol) => symbol.body.includes('ox-icon__accent'))
      .map((symbol) => symbol.id);
    expect(wrong).toEqual([]);
  });

  it('accounts for every symbol in exactly one family', () => {
    const orphans = SYMBOLS.filter((s) => !brandIds.has(s.id) && !uiIds.has(s.id)).map((s) => s.id);
    expect(orphans).toEqual([]);
    const both = [...brandIds].filter((id) => uiIds.has(id));
    expect(both).toEqual([]);
  });

  it('draws the tick as the one stroked accent', () => {
    const tick = SYMBOLS.find((symbol) => symbol.id === 'ox-tick');
    expect(tick?.body).toContain('ox-icon__accent--stroke');
    const others = SYMBOLS.filter((symbol) => symbol.id !== 'ox-tick').filter((symbol) =>
      symbol.body.includes('ox-icon__accent--stroke')
    );
    expect(others).toEqual([]);
  });

  it('uses miter joins and square caps, with no rounded corner anywhere', () => {
    expect(SOURCE).toContain('stroke-linejoin="miter"');
    expect(SOURCE).toContain('stroke-linecap="square"');
    expect(SOURCE).toContain('stroke-width="1.8"');
    expect(SOURCE).not.toContain('stroke-linecap="round"');
    expect(SOURCE).not.toContain('stroke-linejoin="round"');
    expect(/\srx=/.test(SOURCE)).toBe(false);
    expect(/\sry=/.test(SOURCE)).toBe(false);
  });

  // The weight law (BUILD.md 3.5): one stroke width for every symbol, brand
  // or chrome, set once on the root <svg>. A per-symbol override is exactly
  // the defect this batch removed (14 of them, all on the old UI set).
  it('sets stroke-width only on the root svg, never on a symbol', () => {
    expect(SOURCE).not.toMatch(/<symbol[^>]*stroke-width=/);
  });

  it('draws every symbol on the 24 grid', () => {
    const wrong = [...SOURCE.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)"/g)]
      .filter((match) => match[2] !== '0 0 24 24')
      .map((match) => match[1]);
    expect(wrong).toEqual([]);
  });

  it('stays under 16 KB', () => {
    expect(Buffer.byteLength(SOURCE, 'utf8')).toBeLessThan(16 * 1024);
  });
});

/**
 * A hand-drawn `<path d="M...">` outside the sprite is exactly the defect
 * this batch removed (PdpIcon.tsx's 14 glyphs, icons.tsx, BoltGlyph, the two
 * AddProductToast vendor paths): a second, undeclared icon family nobody can
 * audit against the weight law or the 34 degree rule. `ox-sprite.svg` and
 * `Icon.tsx` are the only files allowed to define one.
 */
describe('no inline icon paths outside the sprite', () => {
  const ROOT = 'app';
  const ALLOWED = new Set([
    path.join('app', 'assets', 'ox-sprite.svg'),
    path.join('app', 'components', 'common', 'Icon.tsx'),
    // Legacy shim, one glyph wide (`cart`), kept only for two Header-owned
    // call sites this batch could not edit (docs/build/progress/S2a.md).
    // Delete this exception when PdpIcon.tsx is deleted.
    path.join('app', 'components', 'product', 'PdpIcon.tsx'),
  ]);
  const INLINE_PATH = /<path[^>]*\sd=/;

  function listTsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...listTsxFiles(full));
      else if (entry.name.endsWith('.tsx')) out.push(full);
    }
    return out;
  }

  it('finds no <path> element outside ox-sprite.svg and Icon.tsx', () => {
    const offenders = listTsxFiles(ROOT)
      .filter((file) => !ALLOWED.has(file))
      .filter((file) => INLINE_PATH.test(fs.readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
