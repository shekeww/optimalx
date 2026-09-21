import { describe, it, expect } from 'vitest';
import {
  appliedFilterCount,
  facetKey,
  NON_FILTER_PARAMS,
} from '../../app/components/listing/appliedFilters';

/**
 * The filter trigger used to be handed a literal zero, so a filtered grid and
 * an unfiltered one carried the same control. The count is read off the URL,
 * which is what `salla-filters` navigates to and what the engine's loader
 * reads back, and the rule is negative: everything that is not one of the
 * handful of known navigation parameters is a facet.
 */
describe('facetKey', () => {
  it('leaves a plain facet name alone', () => {
    expect(facetKey('brand')).toBe('brand');
    expect(facetKey('BRAND')).toBe('brand');
  });

  it('unwraps the bracketed forms Salla can emit', () => {
    expect(facetKey('filters[brand]')).toBe('brand');
    expect(facetKey('filter[brand]')).toBe('brand');
    expect(facetKey('filters[brand][]')).toBe('brand');
    expect(facetKey('brands[]')).toBe('brands');
  });

  it('folds both halves of a range onto one facet', () => {
    expect(facetKey('price[from]')).toBe('price');
    expect(facetKey('price[to]')).toBe('price');
    expect(facetKey('price_from')).toBe('price');
    expect(facetKey('price_to')).toBe('price');
    expect(facetKey('min_price')).toBe('price');
    expect(facetKey('max_price')).toBe('price');
  });
});

describe('appliedFilterCount', () => {
  it('is zero with no query at all', () => {
    expect(appliedFilterCount('')).toBe(0);
    expect(appliedFilterCount(undefined)).toBe(0);
    expect(appliedFilterCount('?')).toBe(0);
  });

  it('never counts the parameters the page itself navigates with', () => {
    expect(appliedFilterCount('?sort=price-asc&page=2&cursor=abc&q=whey')).toBe(0);
    for (const name of NON_FILTER_PARAMS) {
      expect(appliedFilterCount(`?${name}=x`), name).toBe(0);
    }
  });

  it('never counts an advertising tag a click left behind', () => {
    expect(appliedFilterCount('?utm_source=x&utm_medium=y&gclid=z&fbclid=w')).toBe(0);
  });

  it('counts facets, not values', () => {
    expect(appliedFilterCount('?brands[]=1&brands[]=2&brands[]=3')).toBe(1);
    expect(appliedFilterCount('?brand=1&flavour=2&size=3')).toBe(3);
  });

  it('counts a price range once, in every spelling', () => {
    expect(appliedFilterCount('?price_from=50&price_to=300')).toBe(1);
    expect(appliedFilterCount('?price[from]=50&price[to]=300')).toBe(1);
    expect(appliedFilterCount('?min_price=50&max_price=300')).toBe(1);
  });

  it('ignores a facet the shopper cleared', () => {
    expect(appliedFilterCount('?brand=&flavour=chocolate')).toBe(1);
  });

  it('counts facets alongside the sort, which is the real case', () => {
    expect(appliedFilterCount('?sort=price-asc&brands[]=7&price_from=50&price_to=300')).toBe(2);
    expect(appliedFilterCount('sort=price-asc&brands[]=7')).toBe(1);
  });

  it('counts a parameter it has never seen, rather than dropping it', () => {
    // The safe direction to be wrong in: a new facet makes the trigger say
    // the list is filtered, which it is.
    expect(appliedFilterCount('?some_future_facet=1')).toBe(1);
  });
});
