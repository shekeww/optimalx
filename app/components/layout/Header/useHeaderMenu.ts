import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { GOALS } from '../../../content/goals';
import type { OxIconName } from '../../common/Icon';

export interface ResolvedLink {
  slug: string;
  /** Label from the live menu when the category exists, the locale key otherwise. */
  label: string;
  to: string;
  /** False when the category does not exist yet and the link falls back to search. */
  resolved: boolean;
  icon: OxIconName;
}

export interface HeaderMenu {
  /** Top-level dashboard menu items, in dashboard order. */
  items: MenuItem[];
  isLoading: boolean;
  /** The six goals, resolved against the live menu by slug. */
  goals: ResolvedLink[];
}

/** Path segments of a menu URL, query, hash and origin removed. */
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

/**
 * True when the URL carries this slug as a path segment. A Salla category URL
 * is `/{slug}/c{id}` (route `/{-$locale}/$slug/c{$id}`), and a multilingual
 * store prefixes the locale, so the slug is neither the first nor the last
 * segment in the general case.
 */
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

/**
 * The header menu (engine `menu.queries.header()`, api/menu.d.ts:5-13) plus
 * slug resolution for the goal collections.
 *
 * A goal whose category the merchant has not created yet links to a search for
 * its label instead of a dead URL, which is the fallback the owner checklist
 * records (PLAN-final C15).
 */
export function useHeaderMenu(): HeaderMenu {
  const { t } = useTranslation();
  const { data, isPending } = useQuery(menu.queries.header());

  const goals = useMemo(() => {
    const all = flatten(data);
    return GOALS.map<ResolvedLink>((goal) => {
      const match = all.find(
        (item) => typeof item.url === 'string' && matchesSlug(item.url, goal.slug)
      );
      const label = match?.title ?? t(goal.h1Key);
      return {
        slug: goal.slug,
        label,
        to: match?.url ?? `/search?q=${encodeURIComponent(label)}`,
        resolved: Boolean(match),
        icon: goal.icon,
      };
    });
  }, [data, t]);

  return { items: data ?? [], isLoading: isPending, goals };
}
