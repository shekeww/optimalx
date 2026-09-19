import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';

/**
 * Shared types for the listing batch (B4).
 *
 * `ListingVariant` is the one switch every block reads: the composition in
 * DIRECTION 6.3 (category), 6.4 (goal landing), 6.8 (search) and 6.14 (brand)
 * is one page whose head region and below-grid blocks change by variant, never
 * four pages (PLAN-final C3).
 */
export type ListingVariant = 'category' | 'goal' | 'search' | 'brand' | 'static';

/**
 * A key-only `t`. The engine's i18next `t` is assignable to this, while a
 * `(key, fallback)` shape is not: i18next's second parameter is an options
 * object, and TypeScript compares it contravariantly. Callers that need a
 * fallback resolve the key and compare it to itself (i18next returns the key
 * when it is missing).
 */
export type TFunction = (key: string) => string;

export interface ListingPageProps extends ProductListLoaderData {
  /**
   * The route's own `$slug` param. The loader does not carry it (the engine
   * keys categories by id), and it is the only place the goal and category
   * content maps can be resolved from on a first paint (PLAN-final C15).
   */
  slug?: string;
  /** Forced variant; the kitchen sink uses it. Resolved from the data otherwise. */
  variant?: ListingVariant;
}
