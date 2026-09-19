import type { ListingVariant } from './types';

/**
 * Per-source copy for the listing page (PLAN-final 4.3: "Search results and
 * the offers, latest and most-sold pages use the same grid; they differ in
 * their header and their empty state, not in their card").
 *
 * Every entry is a locale key in `locales/partials/b4.*`. Nothing here is a
 * string, and nothing here states a fact the store cannot stand behind:
 *
 *  - `/offers` describes what a discounted price looks like on a card and
 *    names no percentage, no deadline and no "best price" (claims gate 4.4);
 *  - `/most-sales-products` is titled and introduced as the catalogue, not by
 *    sales. The route exists because Salla ships it, the store has zero
 *    orders, and a sales label would be an invented statistic. The ordering is
 *    still the platform's `sales` source; only the claim is withheld;
 *  - a tag listing carries no intro at all, because a tag is the merchant's
 *    own label and this theme has nothing true to add to it.
 */
export interface ListingSourceCopy {
  /** Paragraph under the h1; absent when the page has nothing true to add. */
  introKey?: string;
  /** Empty-grid heading. Falls back to the generic listing empty state. */
  emptyTitleKey?: string;
  emptyBodyKey?: string;
  /** A second route out beside "تسوق حسب هدفك", when one helps. */
  secondary?: { to: string; labelKey: string };
}

const BY_SOURCE: Record<string, ListingSourceCopy> = {
  offers: {
    introKey: 'ox.listing.intro_offers',
    emptyTitleKey: 'ox.listing.empty_offers',
    emptyBodyKey: 'ox.listing.empty_offers_body',
    secondary: { to: '/latest-products', labelKey: 'ox.listing.browse_all' },
  },
  latest: {
    introKey: 'ox.listing.intro_latest',
    emptyTitleKey: 'ox.listing.empty_all',
  },
  sales: {
    introKey: 'ox.listing.intro_catalogue',
    emptyTitleKey: 'ox.listing.empty_all',
  },
  tags: {
    emptyTitleKey: 'ox.listing.empty_tag',
    secondary: { to: '/latest-products', labelKey: 'ox.listing.browse_all' },
  },
  brands: {
    emptyTitleKey: 'ox.listing.empty_brand',
    emptyBodyKey: 'ox.listing.empty_brand_body',
    secondary: { to: '/brands', labelKey: 'ox.nav.brands' },
  },
};

/**
 * The copy for one listing, or an empty record for the category and goal
 * compositions, whose intro comes from `app/content/categories.ts` and
 * `app/content/goals.ts` instead.
 */
export function listingSourceCopy(
  sourceType: string | undefined,
  variant: ListingVariant
): ListingSourceCopy {
  if (variant === 'category' || variant === 'goal' || variant === 'search') return {};
  return (sourceType && BY_SOURCE[sourceType]) || {};
}

/**
 * The titles the three static routes pass into the engine loader.
 *
 * The engine resolves its own `SOURCE_TITLE_KEY` only when the caller passes
 * no title, and those platform keys (`blocks.home.latest_products`,
 * `common.titles.most_sales`, `blocks.header.offers`) are not in this theme's
 * dictionary, so leaving the title out prints the raw key as the h1. Passing
 * the English literal, which is what shipped, printed "Latest Products" as the
 * h1 of an Arabic-first store. Both are defects; the title is resolved from
 * our own locale instead, in the route, through `headString`.
 */
export const STATIC_TITLE_KEYS = {
  offers: 'ox.listing.title_offers',
  latest: 'ox.listing.title_latest',
  sales: 'ox.listing.title_catalogue',
} as const;
