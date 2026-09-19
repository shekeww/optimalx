import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { OX_ICON_NAMES } from '../../app/components/common/Icon';

/**
 * The sprite contract from DIRECTION 8.7. These are the rules a G2 reviewer
 * cannot check by eye across 32 symbols at four sizes.
 */
const FILE = path.join('public', 'assets', 'icons', 'ox-sprite.svg');
const SOURCE = fs.readFileSync(FILE, 'utf8');

const SYMBOLS = [...SOURCE.matchAll(/<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)].map(
  (match) => ({ id: match[1], body: match[2] })
);

describe('ox-sprite.svg', () => {
  it('has exactly 32 symbols, with no duplicate id', () => {
    expect(SYMBOLS).toHaveLength(32);
    const ids = SYMBOLS.map((symbol) => symbol.id);
    expect(new Set(ids).size).toBe(32);
  });

  it('declares exactly the symbols Icon.tsx names', () => {
    const ids = SYMBOLS.map((symbol) => symbol.id).sort();
    const expected = OX_ICON_NAMES.map((name) => `ox-${name}`).sort();
    expect(ids).toEqual(expected);
  });

  it('gives every symbol exactly one accent element', () => {
    const wrong = SYMBOLS.filter(
      (symbol) => (symbol.body.match(/class="ox-icon__accent/g) ?? []).length !== 1
    ).map((symbol) => symbol.id);
    expect(wrong).toEqual([]);
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
