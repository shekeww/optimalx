import { useMemo } from 'react';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import type { Category, MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { childrenOf, MENU, TAXONOMY, type TaxonomyNode } from '../../content/taxonomy';
import { TAXONOMY_IDS } from '../../content/taxonomy-ids';
import { flattenMenu } from '../layout/navLinks';
import type { OxIconName } from '../common/Icon';
import { matchesSlug, searchFallback } from './resolve';

/**
 * The two lists `useTaxonomyLinks` resolves against, threaded through a route
 * loader instead of a bare client query (owner amendment 2026-09-22, "SSR/
 * client consistency").
 *
 * Before this, `useTaxonomyLinks` ran `useQuery(category.queries.list())` and
 * `useQuery(menu.queries.header())` with nothing prefetching either on the
 * server: the SSR HTML always carried the `/search?q=` fallback (`resolved:
 * false`), the client's first real render carried the live category URL, and
 * React logged a hydration mismatch on every goal and type link. Home's loader
 * (`app/routes/index.tsx`) and the category listing's loader
 * (`app/routes/$slug.c$id.tsx`) now call {@link loadTaxonomyData} and return
 * its result as `taxonomy` loader data, so the server already has both lists
 * before it renders a single link.
 */
export interface TaxonomyLoaderData {
  categories: Category[];
  menuItems: MenuItem[];
}

/**
 * Prefetches both lists into the router's query client and returns them for a
 * route loader to attach as `taxonomy`. `ensureQueryData` reads the SAME query
 * options (`category.queries.list()`, `menu.queries.header()`) `useTaxonomyLinks`
 * itself queries with, so the two share one cache entry per list: a route that
 * calls this never fetches either list twice.
 */
export async function loadTaxonomyData(queryClient: QueryClient): Promise<TaxonomyLoaderData> {
  const [categories, menuItems] = await Promise.all([
    queryClient.ensureQueryData(category.queries.list()),
    queryClient.ensureQueryData(menu.queries.header()),
  ]);
  return { categories, menuItems };
}

/** True when `value` is loader data carrying the taxonomy pair. */
function hasTaxonomy(value: unknown): value is { taxonomy: TaxonomyLoaderData } {
  return (
    !!value &&
    typeof value === 'object' &&
    'taxonomy' in value &&
    !!(value as { taxonomy?: unknown }).taxonomy
  );
}

/**
 * The taxonomy pair a route loader in the CURRENT match tree already fetched,
 * or `undefined` when none did. Reads `useRouter` rather than `useLoaderData`
 * for a specific route: `useTaxonomyLinks` is called from the header, the
 * needs section and the listing page, which sit under different route matches
 * on different pages, and this has to serve all of them with the one loader
 * that actually ran. `useRouter({ warn: false })` never throws with no
 * `<RouterProvider>` ancestor (every existing component test renders bare,
 * with no router) - it returns `undefined` and this falls through to the
 * plain query below, which is the pre-existing behaviour. `router?.state?.matches`
 * is read the same defensive way, because several existing tests already
 * stub `useRouter` for an unrelated reason (`useRouter().history.push`) with
 * an object that carries no `state` at all.
 */
function useTaxonomyLoaderData(): TaxonomyLoaderData | undefined {
  const router = useRouter({ warn: false });
  const matches = router?.state?.matches;
  if (!matches) return undefined;
  for (const match of matches) {
    if (hasTaxonomy(match.loaderData)) return match.loaderData.taxonomy;
  }
  return undefined;
}

/**
 * The one runtime resolver for the 25-node taxonomy (PLAN-ship Contract C):
 * every slug in `app/content/taxonomy.ts` resolved to a real Salla category
 * when one exists, in the order the plan sets:
 *
 *  1. the live category list (`category.queries.list()`, flattened through
 *     `sub_categories`), matched by id once batch S5 writes `taxonomy-ids.ts`,
 *     otherwise by the slug inside the category's own URL;
 *  2. the dashboard header menu (`menu.queries.header()`), matched the same
 *     way, for a merchant who has built a menu tree without matching category
 *     slugs;
 *  3. a search for the node's own name, the documented fallback (PLAN-final
 *     C15) for a category the merchant has not created yet.
 *
 * `useHeaderMenu`, `useSlugLink` and `navLinks.resolveNavHref` used to each
 * run this resolution independently against the dashboard menu only; they are
 * now adapters over this hook, so the header, the drawer, `/categories` and
 * every goal or category link in the theme agree on one answer for the same
 * slug and share one react-query cache for it.
 */

export interface TaxonomyLink {
  slug: string;
  label: string;
  to: string;
  /** False when no live category or menu entry matched and `to` is a search. */
  resolved: boolean;
  icon: OxIconName;
  /** From the live category, when one matched. */
  count?: number;
  /** From the live category, when one matched. */
  image?: string;
  children: TaxonomyLink[];
}

export interface TaxonomyLinks {
  /** The ten type roots, protein carrying its five children. */
  types: TaxonomyLink[];
  /** The six goal collections. */
  goals: TaxonomyLink[];
  /** The four utility categories (bundles, services, digital library, gift cards). */
  utility: TaxonomyLink[];
  bySlug(slug: string): TaxonomyLink | undefined;
  isLoading: boolean;
}

/** Every category in the live list, its `sub_categories` walked in too. */
function flattenCategories(list: Category[] | undefined): Category[] {
  if (!list) return [];
  const out: Category[] = [];
  const walk = (items: Category[]) => {
    for (const item of items) {
      out.push(item);
      if (item.sub_categories?.length) walk(item.sub_categories);
    }
  };
  walk(list);
  return out;
}

function rawId(category: Category): number | undefined {
  if (typeof category.id_ === 'number') return category.id_;
  const parsed = Number(category.id);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveNode(
  node: TaxonomyNode,
  liveFlat: Category[],
  menuFlat: MenuItem[],
  t: (key: string) => string
): TaxonomyLink {
  const wantedId = TAXONOMY_IDS[node.slug];
  const liveMatch = liveFlat.find((entry) => {
    if (wantedId !== undefined && rawId(entry) === wantedId) return true;
    return typeof entry.url === 'string' && matchesSlug(entry.url, node.slug);
  });
  if (liveMatch) {
    return {
      slug: node.slug,
      label: liveMatch.name,
      to: liveMatch.url,
      resolved: true,
      icon: node.icon,
      count: liveMatch.products_count,
      image: liveMatch.image ?? undefined,
      children: [],
    };
  }

  const menuMatch = menuFlat.find(
    (entry) => typeof entry.url === 'string' && matchesSlug(entry.url, node.slug)
  );
  if (menuMatch) {
    return {
      slug: node.slug,
      label: menuMatch.title,
      to: menuMatch.url,
      resolved: true,
      icon: node.icon,
      children: [],
    };
  }

  const label = t(node.nameKey);
  return { slug: node.slug, label, to: searchFallback(label), resolved: false, icon: node.icon, children: [] };
}

export function useTaxonomyLinks(): TaxonomyLinks {
  const { t } = useTranslation();
  const loaderData = useTaxonomyLoaderData();
  // Disabled, not just ignored, when a loader already supplied the pair: an
  // enabled query with no prefetch is exactly the bug this fixes, so a route
  // that DID prefetch never re-issues either request on mount.
  const { data: queriedCategories, isPending: categoriesPending } = useQuery({
    ...category.queries.list(),
    enabled: !loaderData,
  });
  const { data: queriedMenuItems, isPending: menuPending } = useQuery({
    ...menu.queries.header(),
    enabled: !loaderData,
  });
  const liveCategories = loaderData?.categories ?? queriedCategories;
  const menuItems = loaderData?.menuItems ?? queriedMenuItems;
  const isPending = loaderData ? false : categoriesPending || menuPending;

  const linkBySlug = useMemo(() => {
    const liveFlat = flattenCategories(liveCategories);
    const menuFlat = flattenMenu(menuItems);
    const map = new Map<string, TaxonomyLink>();
    for (const node of TAXONOMY) map.set(node.slug, resolveNode(node, liveFlat, menuFlat, t));
    // Second pass: attach children now that every node has a link (only
    // `protein` has any today, but this holds for any future parent).
    for (const node of TAXONOMY) {
      const kids = childrenOf(node.slug);
      if (kids.length === 0) continue;
      const parentLink = map.get(node.slug);
      if (parentLink) parentLink.children = kids.map((child) => map.get(child.slug)).filter(Boolean) as TaxonomyLink[];
    }
    return map;
  }, [liveCategories, menuItems, t]);

  return useMemo(
    () => ({
      types: MENU.types.map((node) => linkBySlug.get(node.slug)).filter(Boolean) as TaxonomyLink[],
      goals: MENU.goals.map((node) => linkBySlug.get(node.slug)).filter(Boolean) as TaxonomyLink[],
      utility: MENU.utility.map((node) => linkBySlug.get(node.slug)).filter(Boolean) as TaxonomyLink[],
      bySlug: (slug: string) => linkBySlug.get(slug),
      isLoading: isPending,
    }),
    [linkBySlug, isPending]
  );
}
