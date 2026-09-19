import { describe, it, expect } from 'vitest';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import {
  goalNameKey,
  listingCategory,
  listingGoal,
  listingSlug,
  listingVariant,
  pathSegments,
  searchFallback,
  slugFromUrl,
} from '../../app/components/listing/resolve';

/**
 * Variant and slug resolution. Everything on a listing keys by slug because
 * the store's categories do not exist yet and their ids are unknown
 * (PLAN-final C15), so these are the assertions that keep the goal landing
 * from silently degrading to a plain category page once the owner creates the
 * categories with different ids than anyone guessed.
 */

const ORIGIN = 'https://optimalx.com.sa';

function data(overrides: Partial<ProductListLoaderData>): ProductListLoaderData {
  return {
    page: { title: 'x', slug: 'product.index' },
    source: { type: 'categories' },
    query: { sort: 'ourSuggest' },
    products: [],
    pagination: { next: null },
    ...overrides,
  } as ProductListLoaderData;
}

describe('slugFromUrl', () => {
  it('takes the segment before the c{id} entity segment', () => {
    expect(slugFromUrl(`${ORIGIN}/whey-protein/c1234`)).toBe('whey-protein');
  });

  it('survives the locale prefix a multilingual store adds', () => {
    expect(slugFromUrl(`${ORIGIN}/ar/goal-performance/c99`)).toBe('goal-performance');
  });

  it('takes the last segment when there is no entity segment', () => {
    expect(slugFromUrl('/latest-products')).toBe('latest-products');
  });

  it('ignores the query and the hash', () => {
    expect(slugFromUrl(`${ORIGIN}/creatine/c5?sort=bestSell#top`)).toBe('creatine');
  });

  it('is undefined for an empty or missing url', () => {
    expect(slugFromUrl(undefined)).toBeUndefined();
    expect(slugFromUrl('')).toBeUndefined();
    expect(slugFromUrl(ORIGIN)).toBeUndefined();
  });

  it('does not mistake a word starting with c for an entity segment', () => {
    expect(pathSegments('/a/casein')).toEqual(['a', 'casein']);
    expect(slugFromUrl('/protein/casein')).toBe('casein');
  });
});

describe('listingVariant', () => {
  it('is goal when the route slug is one of the six goal collections', () => {
    expect(listingVariant(data({}), 'goal-performance')).toBe('goal');
  });

  it('is goal when only the entity url carries the slug', () => {
    const entity = { id: 1, name: 'الأداء', url: `${ORIGIN}/goal-performance/c1` };
    expect(listingVariant(data({ source: { type: 'categories', value: '1', entity } }))).toBe('goal');
  });

  it('is category for a type category', () => {
    expect(listingVariant(data({}), 'whey-protein')).toBe('category');
  });

  it('is category for a slug no content map knows', () => {
    expect(listingVariant(data({}), 'owner-made-this-up')).toBe('category');
  });

  it('follows the source type for search, brands and the static sources', () => {
    expect(listingVariant(data({ source: { type: 'search', value: 'واي' } }))).toBe('search');
    expect(listingVariant(data({ source: { type: 'brands', value: '7' } }))).toBe('brand');
    expect(listingVariant(data({ source: { type: 'latest' } }))).toBe('static');
    expect(listingVariant(data({ source: { type: 'sales' } }))).toBe('static');
    expect(listingVariant(data({ source: { type: 'offers' } }))).toBe('static');
    expect(listingVariant(data({ source: { type: 'tags', value: '3' } }))).toBe('static');
  });
});

describe('content lookup', () => {
  it('prefers the route slug over the entity url', () => {
    const entity = { id: 1, name: 'x', url: `${ORIGIN}/creatine/c1` };
    expect(listingSlug(data({ source: { type: 'categories', entity } }), 'whey-protein')).toBe(
      'whey-protein'
    );
  });

  it('resolves the goal and category maps by slug', () => {
    expect(listingGoal(data({}), 'goal-energy')?.slug).toBe('goal-energy');
    expect(listingCategory(data({}), 'whey-isolate')?.slug).toBe('whey-isolate');
    expect(listingGoal(data({}), 'whey-isolate')).toBeUndefined();
  });

  it('never resolves content for a source that is not a category', () => {
    expect(listingGoal(data({ source: { type: 'search', value: 'goal-energy' } }), 'goal-energy')).toBeUndefined();
    expect(listingCategory(data({ source: { type: 'tags', value: '1' } }), 'creatine')).toBeUndefined();
  });
});

describe('fallbacks', () => {
  it('sends an unresolved slug to a search for its own label', () => {
    expect(searchFallback('واي بروتين')).toBe(`/search?q=${encodeURIComponent('واي بروتين')}`);
  });

  it('maps a goal slug to its short name key', () => {
    expect(goalNameKey('goal-hair-skin')).toBe('ox.goal.name_hair_skin');
    expect(goalNameKey('goal-ideal-weight')).toBe('ox.goal.name_ideal_weight');
  });
});
