import { describe, it, expect } from 'vitest';
import { collectPartials, flatten, mergeLocale, parityErrors } from '../scripts/i18n-merge.mjs';

const FIXTURES = 'tests/fixtures/i18n-partials';

describe('i18n-merge', () => {
  it('flattens nested objects to dotted keys and keeps only strings', () => {
    expect(flatten({ ox: { a: { b: 'v' } }, n: 1, arr: ['x'] })).toEqual({ 'ox.a.b': 'v' });
  });

  it('collects partials, accepts identical duplicates, and reports conflicts and engine keys', () => {
    const { entries, errors } = collectPartials(FIXTURES, 'ar');
    expect(entries.get('ox.header.search')?.value).toBe('بحث');
    expect(entries.get('ox.footer.vat')?.value).toBe('الرقم الضريبي');
    expect(entries.get('ox.card.add')?.value).toBe('أضف');
    expect(entries.has('pages.cart.total')).toBe(false);
    expect(errors).toHaveLength(2);
    expect(errors.some((e) => e.includes('conflict on "ox.header.search"'))).toBe(true);
    expect(errors.some((e) => e.includes('"pages.cart.total"'))).toBe(true);
  });

  it('returns nothing for a language with no partials', () => {
    const { entries, errors } = collectPartials(FIXTURES, 'en');
    expect(entries.size).toBe(0);
    expect(errors).toEqual([]);
  });

  it('merges without removing or reordering existing keys', () => {
    const existing = { 'pages.cart.total': 'الإجمالي', 'ox.common.back': 'رجوع' };
    const entries = new Map([
      ['ox.common.back', { value: 'عودة', file: 'x' }],
      ['ox.common.next', { value: 'التالي', file: 'x' }],
    ]);
    const { merged, added, updated } = mergeLocale(existing, entries);
    expect(Object.keys(merged)).toEqual(['pages.cart.total', 'ox.common.back', 'ox.common.next']);
    expect(added).toBe(1);
    expect(updated).toBe(1);
    expect(merged['pages.cart.total']).toBe('الإجمالي');
  });

  it('flags keys missing from one language', () => {
    const byLang = {
      ar: new Map([['ox.a', { value: '1', file: 'a' }]]),
      en: new Map(),
    };
    expect(parityErrors(byLang)).toEqual(['"ox.a" is in the ar partials but not in en']);
  });
});
