import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { matchesSlug, pathSegments } from '../../listing/resolve';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
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
  /** The six goals, resolved against the live taxonomy by slug. */
  goals: ResolvedLink[];
}

// `pathSegments` and `matchesSlug` used to be defined here a second time; the
// one implementation now lives in `listing/resolve.ts` (Contract C), and this
// re-export keeps every existing import (NavBar, MegaPanel, home's
// OxCategories, this module's own tests) working unchanged.
export { pathSegments, matchesSlug };

/**
 * The dashboard header menu (engine `menu.queries.header()`, api/menu.d.ts)
 * plus the six goal collections resolved by `useTaxonomyLinks` (Contract C).
 *
 * This hook used to run its own slug resolution against the dashboard menu
 * only; it is now a thin adapter over `useTaxonomyLinks`, which also checks
 * the live category list and carries an id-based match once batch S5 writes
 * `taxonomy-ids.ts`. The public shape (`ResolvedLink[]`) is unchanged, so
 * `OxGoals` and every other existing consumer keeps working (PLAN-ship
 * Contract C).
 */
export function useHeaderMenu(): HeaderMenu {
  const { data, isPending } = useQuery(menu.queries.header());
  const taxonomy = useTaxonomyLinks();

  const goals = useMemo<ResolvedLink[]>(
    () =>
      taxonomy.goals.map((link) => ({
        slug: link.slug,
        label: link.label,
        to: link.to,
        resolved: link.resolved,
        icon: link.icon,
      })),
    [taxonomy.goals]
  );

  return { items: data ?? [], isLoading: isPending || taxonomy.isLoading, goals };
}
