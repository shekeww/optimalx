/**
 * How many facets the current URL constrains the grid by.
 *
 * `ListingToolbar` is built to render a count in the filter trigger and to
 * mark it active, and the page fed it a literal zero, so a shopper who
 * applied three facets, scrolled, and came back saw the same trigger as a
 * shopper who had applied none. Filtered and unfiltered looked identical.
 *
 * ## Why it is counted off the URL and not asked of the widget
 *
 * The facets are Salla's own `salla-filters`, and the applied state is the
 * query string it navigates to: the engine's listing route re-runs its loader
 * on that navigation (theme-engine dist/routes/product-listing.js) and the
 * SDK fires `salla-filters::changed` alongside it. The component does expose
 * a `getFilters()` promise, but it returns the facets that are AVAILABLE, not
 * the ones that are on, and its resolved shape is not part of the documented
 * contract (docs.salla.dev/doc-422704). The URL is the contract: it is what
 * the loader reads, what a shared link carries and what the back button
 * restores.
 *
 * ## Why the rule is negative
 *
 * Salla does not publish the parameter names its facets write, and they
 * differ by facet type. So this does not try to recognise a filter. It counts
 * every query parameter that is NOT one of the handful the theme and the
 * platform use for something else: the sort, the cursor, the search keyword,
 * the locale, and the advertising tags a click can leave behind. A parameter
 * that is new to us is counted, which is the safe direction to be wrong in:
 * the trigger says the list is filtered when it is, and the number is a
 * number of facets rather than a number of values.
 *
 * A range facet writes two parameters and is one constraint, so `price_from`
 * and `price_to`, `price[from]` and `price[to]`, and `min_price` and
 * `max_price` all normalise onto `price` and count once. Repeated values of
 * one key (`brands[]=1&brands[]=2`) are one facet too.
 *
 * Nothing here filters anything. It reads the address bar and returns an
 * integer.
 */

/** Query parameters that are never a facet. */
export const NON_FILTER_PARAMS = new Set([
  'sort',
  'page',
  'cursor',
  'q',
  'keyword',
  'search',
  'lang',
  'locale',
  'currency',
  'redirect',
  'ref',
]);

/** Prefixes of parameters a click leaves behind; never a facet. */
const TRACKING_PREFIXES = ['utm_', '_g', 'gclid', 'fbclid', 'msclkid', 'ttclid', 'igshid'];

/** Bracketed sub-keys and suffixes that make a range's two halves one facet. */
const RANGE_PARTS = ['from', 'to', 'min', 'max', 'start', 'end'];

/**
 * The facet a parameter name belongs to, lowercased, or an empty string when
 * the name carries no facet at all.
 */
export function facetKey(name: string): string {
  let key = name.trim().toLowerCase();
  if (key === '') return '';

  // `filters[brand][]` and `filter[brand]` both name the brand facet.
  const wrapper = /^filters?\[([^\]]+)\]/.exec(key);
  if (wrapper) key = wrapper[1] + key.slice(wrapper[0].length);

  // A trailing `[]` is PHP array syntax, not a sub-key.
  if (key.endsWith('[]')) key = key.slice(0, -2);

  // `price[from]` and `price[to]` are one facet.
  const bracket = /^([^[]+)\[([^\]]+)\]$/.exec(key);
  if (bracket && RANGE_PARTS.includes(bracket[2])) key = bracket[1];

  // `price_from` / `price_to`, and `min_price` / `max_price`.
  for (const part of RANGE_PARTS) {
    if (key.endsWith('_' + part)) key = key.slice(0, -(part.length + 1));
    if (key.startsWith(part + '_')) key = key.slice(part.length + 1);
  }

  return key.trim();
}

/**
 * The number of distinct facets the search string constrains by.
 *
 * @param search the location's query string, with or without its leading `?`
 */
export function appliedFilterCount(search: string | null | undefined): number {
  if (!search) return 0;
  const raw = search.charAt(0) === '?' ? search.slice(1) : search;
  if (raw === '') return 0;

  const facets = new Set<string>();
  for (const [name, value] of new URLSearchParams(raw)) {
    // An empty parameter is a facet the shopper cleared, not one they set.
    if (value.trim() === '') continue;
    const key = facetKey(name);
    if (key === '' || NON_FILTER_PARAMS.has(key)) continue;
    if (TRACKING_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
    facets.add(key);
  }
  return facets.size;
}
