import { describe, it, expect } from 'vitest';
import {
  canonicalFor,
  currentUrl,
  hreflangFor,
  originOf,
  robots,
  stripLocale,
  tryOriginOf,
} from '../../app/components/seo/head';

describe('head url helpers', () => {
  it('builds the served url with the locale prefix only when one is given', () => {
    expect(currentUrl('https://optimalx.sa', 'ar', '/')).toBe('https://optimalx.sa/ar/');
    expect(currentUrl('https://optimalx.sa/', null, '/cart')).toBe('https://optimalx.sa/cart');
    expect(currentUrl('https://optimalx.sa', 'en', 'cart')).toBe('https://optimalx.sa/en/cart');
  });

  it('never double-prefixes a path that already carries the locale', () => {
    expect(currentUrl('https://optimalx.sa', 'en', '/en/cart')).toBe('https://optimalx.sa/en/cart');
    expect(currentUrl('https://optimalx.sa', 'en', '/en')).toBe('https://optimalx.sa/en');
  });

  it('canonical equals the served url without query or fragment', () => {
    expect(canonicalFor('https://optimalx.sa', 'ar', '/protein/c1?page=2#top')).toBe(
      'https://optimalx.sa/ar/protein/c1'
    );
  });

  it('strips a leading locale segment only when it is a store language', () => {
    expect(stripLocale('/en/protein/c1', ['ar', 'en'])).toBe('/protein/c1');
    expect(stripLocale('/en', ['ar', 'en'])).toBe('/');
    expect(stripLocale('/entries/c1', ['ar', 'en'])).toBe('/entries/c1');
  });

  it('emits an hreflang cluster with x-default = ar only for multilingual stores', () => {
    expect(hreflangFor('https://optimalx.sa', '/en/protein/c1', ['ar'])).toBeUndefined();
    expect(hreflangFor('https://optimalx.sa', '/en/protein/c1', ['ar', 'en'])).toEqual([
      { hreflang: 'x-default', href: 'https://optimalx.sa/ar/protein/c1' },
      { hreflang: 'ar', href: 'https://optimalx.sa/ar/protein/c1' },
      { hreflang: 'en', href: 'https://optimalx.sa/en/protein/c1' },
    ]);
  });

  it('robots and origin helpers', () => {
    expect(robots(true)).toBe('noindex, follow');
    expect(robots(false)).toBe('index, follow');
    expect(originOf('https://optimalx.sa/ar/x')).toBe('https://optimalx.sa');
    expect(tryOriginOf('not a url')).toBeNull();
    expect(tryOriginOf(undefined)).toBeNull();
  });
});
