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
  it('has one symbol per declared name, with no duplicate id', () => {
    expect(SYMBOLS).toHaveLength(OX_ICON_NAMES.length);
    const ids = SYMBOLS.map((symbol) => symbol.id);
    expect(new Set(ids).size).toBe(OX_ICON_NAMES.length);
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
