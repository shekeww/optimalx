import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { menuSegments, type NavEntry } from '../../content/nav';

/** Every menu item, parents and children, in one list. */
export function flattenMenu(items: readonly MenuItem[] | undefined): MenuItem[] {
  if (!items) return [];
  const out: MenuItem[] = [];
  const walk = (list: readonly MenuItem[]) => {
    for (const item of list) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return out;
}

/**
 * A menu URL reduced to its path: origin, query and hash dropped
 * (NAV-2026-09-23 §8 item 1). `menuSegments` already does this reduction for
 * matching; this is the same reduction kept as a return value, because the
 * dashboard menu is free to publish an absolute URL
 * (`https://optimalx.com.sa/protein/c9001`, the measured defect this closes)
 * and an absolute href leaves the preview build the moment someone clicks it.
 */
function menuPath(url: string): string {
  const segments = menuSegments(url);
  return segments.length ? `/${segments.join('/')}` : '/';
}

/**
 * The destination for one navigation entry, or `null` when it has none.
 *
 * Precedence, and the reason for it:
 *
 * 1. A live category whose URL carries the entry's slug. Once the merchant
 *    creates the category, the link follows it without a code change. The
 *    match is reduced to a path (`menuPath`) before it is returned: matching
 *    against the raw URL is fine (`menuSegments` reduces its own copy), but
 *    returning the raw URL let an absolute origin through unmodified.
 * 2. The entry's standing theme route, which always exists.
 * 3. A search for the entry's own label. This is a real destination showing
 *    real products, and it is the fallback this codebase already uses for the
 *    goal collections rather than shipping a dead URL.
 *
 * An entry with no slug, no route and no label resolves to `null` and the
 * caller drops the row. Nothing ever renders pointing nowhere.
 */
export function resolveNavHref(
  entry: NavEntry,
  label: string,
  items: readonly MenuItem[] | undefined
): string | null {
  if (entry.slug) {
    const match = flattenMenu(items).find(
      (item) => typeof item.url === 'string' && menuSegments(item.url).includes(entry.slug as string)
    );
    if (match?.url) return menuPath(match.url);
  }
  if (entry.to) return entry.to;
  const query = label.trim();
  if (query) return `/search?q=${encodeURIComponent(query)}`;
  return null;
}

/** The store's default locale: served with no path prefix. */
const DEFAULT_LOCALE = 'ar';

/**
 * Prefixes `path` with the active locale segment, for the one raw `<a href>`
 * in the header that the engine's `Link` does not touch (NAV-2026-09-23 §8
 * item 2: the shop trigger keeps a real `href` so a no-JS or keyboard visitor
 * still reaches `/categories`, which means this file has to do by hand what
 * `Link` does for every other item on the bar).
 */
export function withLocale(path: string, locale: string | null | undefined): string {
  const code = locale || DEFAULT_LOCALE;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === `/${code}` || normalized.startsWith(`/${code}/`)) return normalized;
  return `/${code}${normalized}`;
}

/** A 2-letter locale segment at the start of a pathname, if there is one. */
const LOCALE_SEGMENT = /^\/[a-z]{2}(?=\/|$)/;

/**
 * `pathname` with its leading locale segment removed (NAV-2026-09-23 §4.1,
 * §7.3): `stripLocale('/ar/offers')` is `/offers`. The one active-route test
 * `NavBar` and `BottomTabBar` both run their own route sets against, so a
 * desktop item and a mobile tab never disagree about what is "on" this page.
 */
export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(LOCALE_SEGMENT, '');
  return stripped === '' ? '/' : stripped;
}

const SHOP_ROUTES = new Set([
  '/categories',
  '/offers',
  '/latest-products',
  '/most-sales-products',
  '/brands',
]);
const SHOP_PREFIXES = ['/brands/', '/tags/'];
/** `c123`, `p123`, `brand-123`, `tag-123`: the engine's own entity segments. */
const SHOP_ENTITY_SEGMENT = /^(?:c|p)\d+$|^(?:brand|tag)-\d+$/;

/**
 * True on every catalogue route (NAV-2026-09-23 §7.3's `تسوق` row): the type
 * and goal index, offers, brands (and a brand page), the two date/rank sorts,
 * a tag page, and a category, brand, tag or product page under any slug. The
 * one route set the desktop `تسوق` item (§4.1: "a slot with a dropdown is
 * active when any route in its set matches") and the mobile `تسوق` tab
 * (§7.3) both test against, run on an already `stripLocale`d path.
 */
export function matchesShopRoute(path: string): boolean {
  if (SHOP_ROUTES.has(path)) return true;
  if (SHOP_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return segments.length >= 2 && last !== undefined && SHOP_ENTITY_SEGMENT.test(last);
}
