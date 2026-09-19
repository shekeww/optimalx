import { describe, it, expect } from 'vitest';
import { loadDictionary } from '../helpers/i18n';
import {
  STATIC_TITLE_KEYS,
  listingSourceCopy,
} from '../../app/components/listing/listingCopy';

/**
 * Per-source listing copy, and the claims gates that constrain it
 * (PLAN-final 4.4, docs/build/research/FINAL-claims-source.md section 4).
 *
 * The store has zero orders and zero reviews, so nothing on a listing page may
 * claim popularity, a percentage saving, a deadline or a superlative. The most
 * load-bearing case is `/most-sales-products`: Salla ships the route, the
 * theme keeps it, and the theme must not title it by sales.
 */

const ar = loadDictionary('ar');
const en = loadDictionary('en');

/** The banned Arabic lexicon that could plausibly reach a listing header. */
const BANNED_AR = [
  'الأكثر مبيعا',
  'الأكثر طلبا',
  'الأكثر مبيعاً',
  'أفضل سعر',
  'الأفضل',
  'رقم 1',
  'أفضل في السعودية',
  'مضمون',
  'نتائج خلال',
  'يحرق الدهون',
  'يزيد العضلات',
  'مثبت سريريا',
  'آمن 100%',
];

const BANNED_EN = [
  'best sell',
  'best-sell',
  'bestseller',
  'most sold',
  'most popular',
  'number one',
  'guaranteed',
  'clinically proven',
  'fat burning',
];

describe('listingSourceCopy', () => {
  it('leaves the category, goal and search compositions to their own content maps', () => {
    expect(listingSourceCopy('categories', 'category')).toEqual({});
    expect(listingSourceCopy('categories', 'goal')).toEqual({});
    expect(listingSourceCopy('search', 'search')).toEqual({});
  });

  it('gives offers, latest, sales, tags and brands their own header and empty state', () => {
    expect(listingSourceCopy('offers', 'static').introKey).toBe('ox.listing.intro_offers');
    expect(listingSourceCopy('offers', 'static').emptyTitleKey).toBe('ox.listing.empty_offers');
    expect(listingSourceCopy('latest', 'static').introKey).toBe('ox.listing.intro_latest');
    expect(listingSourceCopy('sales', 'static').introKey).toBe('ox.listing.intro_catalogue');
    expect(listingSourceCopy('tags', 'static').emptyTitleKey).toBe('ox.listing.empty_tag');
    expect(listingSourceCopy('brands', 'brand').emptyTitleKey).toBe('ox.listing.empty_brand');
  });

  it('falls back to the generic empty state for a source it does not know', () => {
    expect(listingSourceCopy('something-new', 'static')).toEqual({});
    expect(listingSourceCopy(undefined, 'static')).toEqual({});
  });
});

describe('the three static route titles', () => {
  it('resolve to a real string in both locales, never to the key', () => {
    for (const key of Object.values(STATIC_TITLE_KEYS)) {
      expect(ar[key]).toBeTypeOf('string');
      expect(ar[key]).not.toBe(key);
      expect(ar[key]?.length).toBeGreaterThan(0);
      expect(en[key]).toBeTypeOf('string');
      expect(en[key]).not.toBe(key);
    }
  });

  it('never titles /most-sales-products by sales while order data is zero', () => {
    expect(ar[STATIC_TITLE_KEYS.sales]).toBe('المنتجات');
    expect(en[STATIC_TITLE_KEYS.sales]).toBe('Products');
  });
});

describe('listing copy carries no banned claim', () => {
  const arValues = Object.entries(ar).filter(([key]) => key.startsWith('ox.listing.'));
  const enValues = Object.entries(en).filter(([key]) => key.startsWith('ox.listing.'));

  it('has listing keys in both locales', () => {
    expect(arValues.length).toBeGreaterThan(0);
    expect(arValues.length).toBe(enValues.length);
  });

  it('states no popularity, superlative or outcome claim in Arabic', () => {
    for (const [key, value] of arValues) {
      for (const banned of BANNED_AR) {
        expect(`${key}: ${value}`).not.toContain(banned);
      }
    }
  });

  it('states no popularity, superlative or outcome claim in English', () => {
    for (const [key, value] of enValues) {
      for (const banned of BANNED_EN) {
        expect(`${key}: ${value.toLowerCase()}`).not.toContain(banned);
      }
    }
  });

  it('states no percentage and no countdown on the offers page', () => {
    for (const key of ['ox.listing.intro_offers', 'ox.listing.empty_offers_body']) {
      expect(ar[key]).not.toContain('%');
      expect(ar[key]).not.toContain('٪');
      expect(en[key]).not.toContain('%');
    }
  });
});
