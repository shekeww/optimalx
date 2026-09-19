import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { pathSegments, searchFallback } from './resolve';

/**
 * Runtime slug to URL resolution for links the content maps declare
 * (PLAN-final C15). The maps hold slugs; the live URL of a category is only
 * known once the merchant creates it, and the header menu
 * (`menu.queries.header()`, engine api/menu.d.ts) is the one payload that
 * carries both. A slug with no live category links to a search for its label
 * instead of a dead URL.
 *
 * The query is the same one the header issues, so this costs no extra request:
 * react-query serves it from the cache.
 */

/** True when the URL carries this slug as a path segment (`/{slug}/c{id}`). */
export function matchesSlug(url: string, slug: string): boolean {
  return pathSegments(url).includes(slug);
}

function flatten(items: MenuItem[] | undefined): MenuItem[] {
  if (!items) return [];
  const out: MenuItem[] = [];
  const walk = (list: MenuItem[]) => {
    for (const item of list) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return out;
}

export interface SlugResolver {
  /** The live URL for a slug, or a search for `label` when it does not exist. */
  (slug: string, label: string): string;
}

export interface SlugLinks {
  resolve: SlugResolver;
  /** True while the menu is still loading; links resolve to the fallback then. */
  isLoading: boolean;
}

export function useSlugLink(): SlugLinks {
  const { data, isPending } = useQuery(menu.queries.header());

  const resolve = useMemo<SlugResolver>(() => {
    const all = flatten(data);
    return (slug: string, label: string) => {
      const match = all.find(
        (item) => typeof item.url === 'string' && matchesSlug(item.url, slug)
      );
      return match?.url ?? searchFallback(label);
    };
  }, [data]);

  return { resolve, isLoading: isPending };
}
