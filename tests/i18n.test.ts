import { describe, it, expect } from 'vitest';
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import { checkCopy, DIALECT_WORDS } from '../scripts/check-copy.mjs';

const arEntries = Object.entries(ar as Record<string, string>);
const enEntries = Object.entries(en as Record<string, string>);

describe('locales', () => {
  it('ar and en declare the same key set', () => {
    const arKeys = arEntries.map(([k]) => k).sort();
    const enKeys = enEntries.map(([k]) => k).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it('declares the B0 scaffolding keys', () => {
    for (const key of [
      'ox.a11y.skip',
      'ox.common.view_all',
      'ox.common.loading',
      'ox.common.close',
      'ox.common.back',
    ]) {
      expect(ar).toHaveProperty(key);
      expect(en).toHaveProperty(key);
    }
  });

  it('has no Arabic diacritics (U+064B-U+0652, U+0670) in any ar value', () => {
    const offenders = arEntries.filter(([, v]) => /[ً-ْٰ]/u.test(v));
    expect(offenders).toEqual([]);
  });

  it('has no em-dash (U+2014) in any value', () => {
    const offenders = [...arEntries, ...enEntries].filter(([, v]) => v.includes('—'));
    expect(offenders).toEqual([]);
  });

  it('has no dialect tokens as whole words in ar values', () => {
    const pattern = new RegExp(`(?<![\\p{L}\\p{M}])(${DIALECT_WORDS.join('|')})(?![\\p{L}\\p{M}])`, 'u');
    const offenders = arEntries.filter(([, v]) => pattern.test(v));
    expect(offenders).toEqual([]);
  });

  it('check-copy reports the same verdict as the tests', () => {
    expect(checkCopy('locales/ar.json', JSON.stringify(ar))).toEqual([]);
    expect(checkCopy('locales/en.json', JSON.stringify(en))).toEqual([]);
  });

  it('check-copy catches each violation class', () => {
    const findings = checkCopy(
      'sample/ar.json',
      JSON.stringify({ a: 'شكراً', b: 'نص — نص', c: 'وش تبي', d: 'موقع نظيف' })
    );
    expect(findings.map((f) => f.rule).sort()).toEqual(['dialect', 'diacritic', 'em-dash']);
  });
});
