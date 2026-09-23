import { describe, it, expect } from 'vitest';
import {
  toHref,
  toInternalPath,
  toPath,
  withLocale,
  resolveNavHref,
  otherLocaleLink,
} from '../../app/components/layout/navLinks';

/**
 * The one link resolution rule (NAV-2026-09-23 section 8; UX-2026-09-24
 * P0-14 and P0-17).
 *
 * Every internal href the theme renders goes through `toHref`, on the server
 * and on the client alike, and comes out locale-prefixed exactly once. The
 * four inputs below are the four shapes the theme actually receives: a bare
 * theme path, a path that already carries the locale (a second pass, or a
 * href read back off the DOM), and the two absolute forms the live category
 * API, the dashboard menu and `product.url` publish.
 */
const INPUTS = [
  '/cart',
  '/ar/cart',
  'https://optimalx.com.sa/cart',
  'https://optimalx.com.sa/ar/cart',
];

describe('toHref', () => {
  it('resolves every shape of a cart URL to /ar/cart on an Arabic page', () => {
    for (const input of INPUTS) expect(toHref(input, 'ar')).toBe('/ar/cart');
  });

  it('keeps an absolute URL that already carries the locale', () => {
    expect(toHref('https://optimalx.com.sa/ar/about', 'ar')).toBe('/ar/about');
    expect(toHref('https://optimalx.com.sa/ar/about', 'en')).toBe('/ar/about');
  });

  it('prefixes the active locale, defaulting to ar', () => {
    expect(toHref('https://optimalx.com.sa/about', 'en')).toBe('/en/about');
    expect(toHref('/about', undefined)).toBe('/ar/about');
    expect(toHref('/about', null)).toBe('/ar/about');
  });

  it('is idempotent: a resolved href resolved again is unchanged', () => {
    for (const input of INPUTS) {
      const once = toHref(input, 'ar');
      expect(toHref(once, 'ar')).toBe(once);
      expect(withLocale(once, 'ar')).toBe(once);
    }
  });

  it('keeps the query, which is the destination for an unresolved category', () => {
    expect(toHref('/search?q=%D8%A8%D8%B1%D9%88%D8%AA%D9%8A%D9%86', 'ar')).toBe(
      '/ar/search?q=%D8%A8%D8%B1%D9%88%D8%AA%D9%8A%D9%86'
    );
    expect(toHref('https://optimalx.com.sa/protein/c9001?sort=price#top', 'ar')).toBe(
      '/ar/protein/c9001?sort=price#top'
    );
  });

  it('never leaves the build: no resolved href carries an origin', () => {
    const urls = [
      ...INPUTS,
      'https://optimalx.com.sa/protein/c9001',
      'https://optimalx.com.sa/x/p1673105563',
      '//optimalx.com.sa/brands/9101',
    ];
    for (const url of urls) {
      const href = toHref(url, 'ar');
      expect(href.startsWith('/ar/')).toBe(true);
      expect(href.includes('optimalx.com.sa')).toBe(false);
    }
  });

  it('answers / for a URL with no path at all', () => {
    expect(toHref('https://optimalx.com.sa', 'ar')).toBe('/ar/');
    expect(toHref('', 'ar')).toBe('/ar/');
  });
});

describe('toInternalPath', () => {
  it('drops the origin and keeps the rest, leaving the locale to the Link adapter', () => {
    expect(toInternalPath('https://optimalx.com.sa/cart')).toBe('/cart');
    expect(toInternalPath('https://optimalx.com.sa/ar/cart')).toBe('/ar/cart');
    expect(toInternalPath('/cart')).toBe('/cart');
    expect(toInternalPath('/search?q=a#b')).toBe('/search?q=a#b');
  });

  it('feeds the whole rule: the adapter would prefix each of these once', () => {
    for (const input of INPUTS) {
      expect(withLocale(toInternalPath(input), 'ar')).toBe('/ar/cart');
    }
  });
});

describe('withLocale', () => {
  it('never prefixes a path that already starts with a locale segment', () => {
    expect(withLocale('/en/about', 'ar')).toBe('/en/about');
    expect(withLocale('/ar', 'ar')).toBe('/ar');
  });
});

describe('toPath and resolveNavHref stay origin-free', () => {
  it('reduces an absolute menu URL to a path', () => {
    expect(toPath('https://optimalx.com.sa/protein/c9001')).toBe('/protein/c9001');
  });

  it('returns a path for a live category match, never the published URL', () => {
    const items = [{ id: 1, title: 'بروتين', url: 'https://optimalx.com.sa/protein/c9001' }];
    const href = resolveNavHref(
      { key: 'protein', labelKey: 'ox.nav.protein', slug: 'protein' },
      'بروتين',
      items as never
    );
    expect(href).toBe('/protein/c9001');
    expect(toHref(href as string, 'ar')).toBe('/ar/protein/c9001');
  });
});

/**
 * The language switch link (NAV-2026-09-23 addendum, S9g; owner, 2026-09-24:
 * "it should be obvious to be a language switch, showing العربية in
 * English, and EN in the Arabic version").
 */
describe('otherLocaleLink', () => {
  it('targets en, on the same path, from an Arabic page', () => {
    const link = otherLocaleLink('/ar/x', ['ar', 'en']);
    expect(link).toEqual({
      locale: 'en',
      to: '/en/x',
      labelKey: 'ox.header.lang_switch_en',
      ariaLabelKey: 'ox.header.switch_language_en',
    });
  });

  it('targets ar, on the same path, from an English page', () => {
    const link = otherLocaleLink('/en/x', ['ar', 'en']);
    expect(link).toEqual({
      locale: 'ar',
      to: '/ar/x',
      labelKey: 'ox.header.lang_switch_ar',
      ariaLabelKey: 'ox.header.switch_language_ar',
    });
  });

  it('is null when the store lists no other language (the live store today)', () => {
    expect(otherLocaleLink('/ar/x', ['ar'])).toBeNull();
    expect(otherLocaleLink('/ar/x', [])).toBeNull();
    expect(otherLocaleLink('/ar/x', undefined)).toBeNull();
  });

  it('defaults an unprefixed page to Arabic, so the target is English', () => {
    expect(otherLocaleLink('/x', ['ar', 'en'])?.to).toBe('/en/x');
  });

  it('preserves the query and the root path', () => {
    expect(otherLocaleLink('/ar/search?q=whey', ['ar', 'en'])?.to).toBe('/en/search?q=whey');
    expect(otherLocaleLink('/ar', ['ar', 'en'])?.to).toBe('/en/');
  });
});
