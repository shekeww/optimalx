import type { TFunction } from './types';

/**
 * The listing sort control (DIRECTION 5.3 ListingHeader: "the sort options are
 * the engine's listing sort keys").
 *
 * The engine builds the same list in `sortOptions(currentSort, t)`
 * (theme-engine dist/chunk-6Z4MOC4S.js) but does not export it from any public
 * entry, so the five ids are replicated here and asserted by a test. The id is
 * what `?sort=` carries and what `product.list({ sort })` takes; changing one
 * silently breaks pagination, so ids are never renamed.
 *
 * Labels: where FINAL-content 9 has an audited Arabic label, it wins
 * (`ox.sort.*`). The two options whose label is a claim about the catalogue
 * (best selling, top rated) keep SALLA's own label, resolved from the engine's
 * translation key. Claims gate 5.1: a popularity label renders only when the
 * platform supplies it, never as copy of ours. When the key is missing from the
 * loaded translations, i18next returns the key itself, and that option is
 * dropped rather than shown raw.
 */
export interface SortOption {
  id: string;
  label: string;
}

export interface SortOptionSpec {
  id: string;
  /** Our own audited label, or an engine key when the label is Salla's. */
  labelKey: string;
  /** True when `labelKey` is an engine key that may not be loaded. */
  platform?: boolean;
}

/** The five engine sort ids, in the engine's order. */
export const SORT_IDS = [
  'ourSuggest',
  'bestSell',
  'topRated',
  'priceFromLowToTop',
  'priceFromTopToLow',
] as const;

export type SortId = (typeof SORT_IDS)[number];

/** The engine's default when `?sort=` is absent (product-listing.js: DEFAULT_SORT). */
export const DEFAULT_SORT: SortId = 'ourSuggest';

export const SORT_SPECS: readonly SortOptionSpec[] = [
  { id: 'ourSuggest', labelKey: 'ox.sort.relevance' },
  { id: 'bestSell', labelKey: 'pages.categories.sort_by_sales', platform: true },
  { id: 'topRated', labelKey: 'pages.categories.sort_by_rating', platform: true },
  { id: 'priceFromLowToTop', labelKey: 'ox.sort.price_asc' },
  { id: 'priceFromTopToLow', labelKey: 'ox.sort.price_desc' },
];

/** Resolved options for the select. Platform options with no label are dropped. */
export function sortOptions(t: TFunction): SortOption[] {
  const out: SortOption[] = [];
  for (const spec of SORT_SPECS) {
    const label = t(spec.labelKey);
    if (spec.platform && (label === spec.labelKey || label.length === 0)) continue;
    out.push({ id: spec.id, label });
  }
  return out;
}

/** The sort in the URL, or the engine default when it is absent or unknown. */
export function currentSort(value: string | undefined): string {
  if (!value) return DEFAULT_SORT;
  return (SORT_IDS as readonly string[]).includes(value) ? value : DEFAULT_SORT;
}
