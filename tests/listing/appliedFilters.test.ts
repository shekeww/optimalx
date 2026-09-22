import { describe, it, expect } from 'vitest';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';
import {
  appliedFilterCount,
  facetKey,
  NON_FILTER_PARAMS,
  brandFilter,
  appliedBrandChips,
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

/**
 * The brand facet (S2f item 6). A fixture payload stands in for the live
 * store, which has no brands recorded yet (`fixtures/store/brands.json` is
 * `[]`) and no `fixtures/store/overlay/brands.json` for the offline preview
 * either — the same reason this suite, not a browser check, is the
 * verification for the brand group today.
 */
describe('brandFilter', () => {
  it('finds the filter group by its own key, not a guess', () => {
    const filters: Filter[] = [
      { key: 'price', label: 'السعر', type: 'range' },
      { key: 'brand', label: 'Brand', type: 'list', values: [{ key: '7', value: 'Optimum Nutrition' }] },
    ];
    const found = brandFilter(filters);
    expect(found?.key).toBe('brand');
  });

  it('matches the plural spelling too', () => {
    const filters: Filter[] = [{ key: 'brands', label: 'Brands', type: 'list' }];
    expect(brandFilter(filters)?.key).toBe('brands');
  });

  it('is null when the payload carries no brand-like key — the data gate', () => {
    const filters: Filter[] = [{ key: 'price', label: 'السعر', type: 'range' }];
    expect(brandFilter(filters)).toBeNull();
    expect(brandFilter([])).toBeNull();
    expect(brandFilter(undefined)).toBeNull();
  });
});

describe('appliedBrandChips', () => {
  const filter: Filter = {
    key: 'brand',
    label: 'Brand',
    type: 'list',
    values: [
      { key: '7', value: 'Optimum Nutrition' },
      { key: '9', value: 'MyProtein' },
    ],
  };

  it('is empty with no filter, no search, or neither', () => {
    expect(appliedBrandChips('?brand=7', null)).toEqual([]);
    expect(appliedBrandChips('', filter)).toEqual([]);
    expect(appliedBrandChips(undefined, filter)).toEqual([]);
  });

  it('reads the applied value back and labels it from the filter payload', () => {
    const chips = appliedBrandChips('?brand=7', filter);
    expect(chips).toEqual([{ param: 'brand', value: '7', label: 'Optimum Nutrition' }]);
  });

  it('carries a chip per repeated value, each independently clearable', () => {
    const chips = appliedBrandChips('?brand=7&brand=9', filter);
    expect(chips).toEqual([
      { param: 'brand', value: '7', label: 'Optimum Nutrition' },
      { param: 'brand', value: '9', label: 'MyProtein' },
    ]);
  });

  it('falls back to the raw value when the payload names no label for it', () => {
    const chips = appliedBrandChips('?brand=41', filter);
    expect(chips).toEqual([{ param: 'brand', value: '41', label: '41' }]);
  });

  it('matches the bracketed and array spellings via facetKey, same as every other facet', () => {
    expect(appliedBrandChips('?filters[brand]=7', filter)).toEqual([
      { param: 'filters[brand]', value: '7', label: 'Optimum Nutrition' },
    ]);
    expect(appliedBrandChips('?brand[]=7', filter)).toEqual([
      { param: 'brand[]', value: '7', label: 'Optimum Nutrition' },
    ]);
  });

  it('ignores an unrelated facet and a cleared (empty) brand value', () => {
    expect(appliedBrandChips('?flavour=chocolate&brand=', filter)).toEqual([]);
  });
});
