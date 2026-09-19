import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SORT,
  SORT_IDS,
  SORT_SPECS,
  currentSort,
  sortOptions,
} from '../../app/components/listing/sortOptions';
import { createT } from '../helpers/i18n';

/**
 * The sort ids are the engine's (dist/chunk-6Z4MOC4S.js). They are what
 * `?sort=` carries and what `product.list({ sort })` takes, so a rename here
 * is a silent pagination break: this suite is the guard.
 */
describe('sortOptions', () => {
  it('keeps the five engine sort ids, in the engine order', () => {
    expect(SORT_IDS).toEqual([
      'ourSuggest',
      'bestSell',
      'topRated',
      'priceFromLowToTop',
      'priceFromTopToLow',
    ]);
    expect(DEFAULT_SORT).toBe('ourSuggest');
  });

  it('labels the sorts we have audited copy for from our own keys', () => {
    const t = createT('ar');
    const options = sortOptions(t);
    const byId = new Map(options.map((option) => [option.id, option.label]));
    expect(byId.get('ourSuggest')).toBe(t('ox.sort.relevance'));
    expect(byId.get('priceFromLowToTop')).toBe(t('ox.sort.price_asc'));
    expect(byId.get('priceFromTopToLow')).toBe(t('ox.sort.price_desc'));
  });

  it('drops a platform-labelled sort when the platform string is missing', () => {
    // Claims gate 5.1: a popularity label ships only when Salla supplies it,
    // never as copy of ours, and never as a raw translation key on screen.
    const t = createT('ar');
    const options = sortOptions(t);
    expect(options.some((option) => option.id === 'bestSell')).toBe(false);
    expect(options.every((option) => !option.label.startsWith('pages.'))).toBe(true);
    expect(SORT_SPECS.find((spec) => spec.id === 'bestSell')?.labelKey).toBe(
      'pages.categories.sort_by_sales'
    );
  });

  it('keeps a platform sort once the platform supplies the label', () => {
    const t = (key: string) =>
      key === 'pages.categories.sort_by_sales' ? 'Best Seller' : key === 'pages.categories.sort_by_rating' ? 'Top Rated' : key;
    const ids = sortOptions(t).map((option) => option.id);
    expect(ids).toContain('bestSell');
    expect(ids).toContain('topRated');
  });

  it('falls back to the engine default for an unknown or absent sort', () => {
    expect(currentSort(undefined)).toBe('ourSuggest');
    expect(currentSort('')).toBe('ourSuggest');
    expect(currentSort('notASort')).toBe('ourSuggest');
    expect(currentSort('priceFromTopToLow')).toBe('priceFromTopToLow');
  });
});
