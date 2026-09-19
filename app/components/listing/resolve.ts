import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { categoryBySlug, type CategoryContent } from '../../content/categories';
import { goalBySlug, type GoalContent } from '../../content/goals';
import type { ListingVariant } from './types';

/**
 * Slug and variant resolution for the listing page.
 *
 * Everything keys by SLUG at runtime (PLAN-final C15): the store's categories
 * do not exist yet, their ids are unknown, and `Category.url` carries whatever
 * SEO slug the owner sets. A category URL is `/{slug}/c{id}`, so the slug is
 * the segment before the `c{id}` one; a multilingual store prefixes the locale,
 * which is why the segment is found by shape and not by position.
 */

/** Path segments of a URL, origin, query and hash removed. */
export function pathSegments(url: string): string[] {
  let path = url;
  const hash = path.indexOf('#');
  if (hash >= 0) path = path.slice(0, hash);
  const query = path.indexOf('?');
  if (query >= 0) path = path.slice(0, query);
  const scheme = path.indexOf('//');
  if (scheme >= 0) {
    const afterHost = path.indexOf('/', scheme + 2);
    path = afterHost >= 0 ? path.slice(afterHost) : '';
  }
  return path.split('/').filter(Boolean);
}

/** `c123` and `p123`: the engine's entity segments. Built without a literal regex. */
function isEntitySegment(segment: string): boolean {
  const first = segment.charAt(0);
  if (first !== 'c' && first !== 'p') return false;
  const rest = segment.slice(1);
  if (rest.length === 0) return false;
  for (const char of rest) {
    if (char < '0' || char > '9') return false;
  }
  return true;
}

/** The SEO slug inside a category or tag URL, or undefined when there is none. */
export function slugFromUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const segments = pathSegments(url);
  if (segments.length === 0) return undefined;
  const last = segments[segments.length - 1];
  if (isEntitySegment(last)) return segments.length > 1 ? segments[segments.length - 2] : undefined;
  return last;
}

/** The entity of a category listing, or undefined for every other source. */
export function categoryEntity(data: ProductListLoaderData): Category | undefined {
  if (data.source.type !== 'categories') return undefined;
  return data.source.entity as Category | undefined;
}

/** The route slug, falling back to the slug inside the entity URL. */
export function listingSlug(data: ProductListLoaderData, routeSlug?: string): string | undefined {
  if (routeSlug) return routeSlug;
  const entity = data.source.entity as { url?: string } | undefined;
  return slugFromUrl(entity?.url);
}

/**
 * Which composition this data renders. A category slug that the goal map knows
 * is a goal landing (DIRECTION 6.4); everything else follows the source type.
 */
export function listingVariant(data: ProductListLoaderData, routeSlug?: string): ListingVariant {
  const type = data.source.type;
  if (type === 'search') return 'search';
  if (type === 'brands') return 'brand';
  if (type === 'categories') {
    return goalBySlug(listingSlug(data, routeSlug)) ? 'goal' : 'category';
  }
  return 'static';
}

/** The goal content for this page, or undefined when it is not a goal landing. */
export function listingGoal(
  data: ProductListLoaderData,
  routeSlug?: string
): GoalContent | undefined {
  if (data.source.type !== 'categories') return undefined;
  return goalBySlug(listingSlug(data, routeSlug));
}

/** The category content for this page, or undefined when the slug is unknown. */
export function listingCategory(
  data: ProductListLoaderData,
  routeSlug?: string
): CategoryContent | undefined {
  if (data.source.type !== 'categories') return undefined;
  return categoryBySlug(listingSlug(data, routeSlug));
}

/**
 * Where a content-map slug points. A category the merchant has not created yet
 * has no URL, so the link falls back to a search for its label, which is the
 * fallback the owner checklist records (PLAN-final C15, owner-checklist A.1).
 */
export function searchFallback(label: string): string {
  return `/search?q=${encodeURIComponent(label)}`;
}

/**
 * The short goal name (the hero eyebrow and every chip that points at a goal).
 * The goal's `h1Key` is a full headline, too long for a 36 pill, so the names
 * are their own keys: `goal-hair-skin` resolves `ox.goal.name_hair_skin`.
 */
export function goalNameKey(slug: string): string {
  const bare = slug.startsWith('goal-') ? slug.slice('goal-'.length) : slug;
  return `ox.goal.name_${bare.split('-').join('_')}`;
}
