import { useTaxonomyLinks } from './useTaxonomyLinks';
import { searchFallback } from './resolve';

/**
 * Runtime slug to URL resolution for links the content maps declare
 * (PLAN-final C15): `SubNeeds` (a goal's sub-need rows) and `ZeroResults` (the
 * search empty state's suggested goals). A slug with no live category links to
 * a search for its label instead of a dead URL.
 *
 * This used to run its own query against the dashboard menu; it is now a thin
 * adapter over `useTaxonomyLinks` (Contract C), which also checks the live
 * category list and carries an id-based match once batch S5 writes
 * `taxonomy-ids.ts`, sharing one react-query cache with the header and the
 * `/categories` index instead of issuing its own request.
 */

export interface SlugResolver {
  /** The live URL for a slug, or a search for `label` when it does not exist. */
  (slug: string, label: string): string;
}

export interface SlugLinks {
  resolve: SlugResolver;
  /** True while the taxonomy links are still loading; links resolve to the fallback then. */
  isLoading: boolean;
}

export function useSlugLink(): SlugLinks {
  const { bySlug, isLoading } = useTaxonomyLinks();

  const resolve: SlugResolver = (slug, label) => bySlug(slug)?.to ?? searchFallback(label);

  return { resolve, isLoading };
}
