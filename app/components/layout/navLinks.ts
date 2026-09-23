import { useRouterState } from '@tanstack/react-router';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { menuSegments, type NavEntry } from '../../content/nav';

/** A router state shaped only as much as this file reads it. */
interface RouterLocationState {
  location?: { pathname?: string };
}

/**
 * The router's current pathname, filled in identically on the server and the
 * client. `useTwilight().location` is not this: it is empty during SSR and
 * only filled in after hydration - reading it for an active-route test
 * renders "nothing is active" on the server and "this item is active" on the
 * client the moment the item's route matches, which is a hydration mismatch
 * (the coordinator's finding, 2026-09-23). TanStack's own router store is
 * what `Link` itself reads to paint its active state identically on both
 * passes, so every active-route test in the header and the tab bar reads the
 * same store here instead.
 */
export function useRouterPathname(): string {
  return useRouterState({
    select: (state) => (state as unknown as RouterLocationState).location?.pathname ?? '',
  }) as unknown as string;
}

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
 * A menu or category URL reduced to its path: origin, query and hash dropped
 * (NAV-2026-09-23 §8 item 1). The dashboard menu and the live category API
 * are both free to publish an absolute URL
 * (`https://optimalx.com.sa/protein/c9001`, the measured defect this closes)
 * and an absolute href leaves the preview build the moment someone clicks it.
 */
export function toPath(url: string): string {
  const segments = menuSegments(url);
  return segments.length ? `/${segments.join('/')}` : '/';
}

/**
 * Half of THE link resolution rule: the path of `url` with its query and hash
 * kept, the origin dropped, nothing else touched.
 *
 * This is what a component renders through the engine `Link`, whose adapter
 * (`localizeDestination`) then adds the locale segment from the route params -
 * the one place a locale is added on that path, identically on the server and
 * on the client. `toPath` drops the query too, which is right for a menu URL
 * being matched against a route set and wrong for a destination: the
 * taxonomy's own fallback is `/search?q=<label>` and that query IS the
 * destination.
 */
export function toInternalPath(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) return '/';
  const scheme = trimmed.indexOf('://');
  const hostAt = scheme >= 0 ? scheme + 3 : trimmed.startsWith('//') ? 2 : -1;
  if (hostAt >= 0) {
    const slash = trimmed.indexOf('/', hostAt);
    return slash >= 0 ? trimmed.slice(slash) : '/';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * THE link resolution rule (NAV-2026-09-23 §8; UX-2026-09-24 P0-14), whole:
 * the origin dropped and the active locale segment added exactly once.
 *
 * It is idempotent by construction - a path that already starts with a locale
 * segment is returned unchanged - so it is safe on a href that is then handed
 * to the engine `Link`, whose adapter applies the same rule again, and safe
 * on a href read back off the DOM.
 *
 * Measured defect it closes: 24 of 58 anchors on `/ar` at 390 resolved to
 * `https://optimalx.com.sa/...`, because the live category API, the dashboard
 * menu and `product.url` all publish absolute URLs. An absolute href leaves
 * the preview build, forces a full reload in production and drops an English
 * visitor back into Arabic.
 *
 * For the store's own destinations only. An external URL (`wa.me`,
 * `instagram.com`, `mailto:`) must never be passed through it.
 */
export function toHref(url: string, locale?: string | null): string {
  return withLocale(toInternalPath(url), locale);
}

/**
 * `links`, each `.to` reduced to a path and each `.children` recursed the
 * same way. `useTaxonomyLinks` itself is not changed to do this: it is
 * shared with the listing page's `ChildChips`, whose own test pins today's
 * raw-URL behaviour for its live-children path, and that page is out of this
 * batch's scope. Every one of this batch's own consumers of the hook - the
 * mega panel, `ShopTree`, the shop sheet, the mobile drawer, the footer's
 * goal column - calls this once on the arrays it reads instead.
 */
export function toSafeLinks<T extends { to: string; children?: T[] }>(links: readonly T[]): T[] {
  return links.map((link) => ({
    ...link,
    to: toPath(link.to),
    ...(link.children ? { children: toSafeLinks(link.children) } : {}),
  }));
}

/**
 * The destination for one navigation entry, or `null` when it has none.
 *
 * Precedence, and the reason for it:
 *
 * 1. A live category whose URL carries the entry's slug. Once the merchant
 *    creates the category, the link follows it without a code change. The
 *    match is reduced to a path (`toPath`) before it is returned: matching
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
    if (match?.url) return toPath(match.url);
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
  // Any locale segment, not only the active one: a path that already carries
  // `/en` must not become `/ar/en/...` on an Arabic page. This is the same
  // test the engine's own link adapter runs (`localizeDestination`), so a
  // href resolved here and then handed to `Link` is prefixed exactly once.
  if (LOCALE_SEGMENT.test(normalized)) return normalized;
  return `/${code}${normalized}`;
}

/** A 2-letter locale segment at the start of a pathname, if there is one. */
const LOCALE_SEGMENT = /^\/[a-z]{2}(?=\/|$)/;

/**
 * The leading locale segment of a served pathname, with its slash
 * (`/ar/x/p1` -> `/ar`), or an empty string when the page is served without
 * one. Used to build a destination that matches HOW THIS PAGE IS SERVED,
 * which is not the same question as "what is the active locale": a
 * single-language store serves `/cart` and redirects `/ar/cart` to it, so
 * defaulting to `/ar` there would send every buy-now through a redirect.
 */
export function localeSegmentOf(pathname: string): string {
  return LOCALE_SEGMENT.exec(pathname)?.[0] ?? '';
}

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

/**
 * The two locales this theme ships copy for. The language switch link
 * (NAV-2026-09-23 addendum, S9g) only ever offers one of these two - a third
 * store language would need its own dictionary before this link could show
 * it, so the pair is literal rather than derived from the store's own list.
 */
const SWITCHABLE_LOCALES = ['ar', 'en'] as const;
export type SwitchableLocale = (typeof SWITCHABLE_LOCALES)[number];

/** The language switch link's destination and the two locale keys it reads. */
export interface LanguageSwitch {
  /** The language this link switches TO (never the page's own language). */
  locale: SwitchableLocale;
  /** The current page, under the target language's own locale segment. */
  to: string;
  /** The link's visible text: the target language's own name. */
  labelKey: 'ox.header.lang_switch_en' | 'ox.header.lang_switch_ar';
  /** The accessible name, phrased in the CURRENT page's own language. */
  ariaLabelKey: 'ox.header.switch_language_en' | 'ox.header.switch_language_ar';
}

/**
 * The language switch link for `pathname` (owner, 2026-09-24: "arabic and
 * english language switch can be confusing, as the other would only see the
 * country; it should be obvious to be a language switch, showing العربية in
 * English, and EN in the Arabic version"), or `null` when the store has
 * nothing to switch to.
 *
 * `languages` is the store's own language codes
 * (`useTwilight().settings.languages`, mapped to `.code`). The target is
 * English on an Arabic page and Arabic on an English one - the only pair
 * this theme ships strings for - and it is offered only when the store's own
 * list actually carries that target, which is what leaves the live,
 * English-disabled store with no link at all.
 */
export function otherLocaleLink(
  pathname: string,
  languages: readonly string[] | undefined
): LanguageSwitch | null {
  const current = localeSegmentOf(pathname).slice(1) || DEFAULT_LOCALE;
  const target: SwitchableLocale = current === 'en' ? 'ar' : 'en';
  if (!languages?.includes(target)) return null;
  return {
    locale: target,
    to: withLocale(stripLocale(pathname), target),
    labelKey: target === 'en' ? 'ox.header.lang_switch_en' : 'ox.header.lang_switch_ar',
    ariaLabelKey:
      target === 'en' ? 'ox.header.switch_language_en' : 'ox.header.switch_language_ar',
  };
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
