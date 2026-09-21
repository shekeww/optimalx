import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { AnnouncementBar } from './AnnouncementBar';
import { MainBar } from './MainBar';
import { MobileDrawer } from './MobileDrawer';
import { MobileHeader } from './MobileHeader';
import { UtilityBar } from './UtilityBar';
import { UtilityTrust } from './UtilityTrust';
import { useHeaderHeightVar } from './useHeaderHeightVar';

/**
 * The bottom tab bar lives outside the header, so its "categories" tab asks
 * for the drawer through a DOM event rather than through shared state: one
 * listener, no context, and nothing to keep in sync across two subtrees.
 */
export const DRAWER_OPEN_EVENT = 'ox:drawer-open';

export interface DrawerOpenDetail {
  group?: 'goals' | 'categories';
}

export function openMobileDrawer(group: DrawerOpenDetail['group'] = 'categories') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DrawerOpenDetail>(DRAWER_OPEN_EVENT, { detail: { group } }));
}

const SallaAdvertisement = lazy(() =>
  import('@salla.sa/twilight-components-react/advertisement').then((m) => ({
    default: m.SallaAdvertisement,
  }))
);

/**
 * Routes whose mobile header carries a second row with the search field
 * (DIRECTION 6.1: 104 instead of 56).
 *
 * **Every route is listed twice, in two spellings, and both are needed.**
 * The set was written in the router's `createFileRoute` spelling and matched
 * against `useTwilight().routeId`, which is not that: on the server the
 * engine maps the router's leaf through its own table (theme-engine
 * chunk-QVPMWMPP.js:374, `TANSTACK_ROUTE_ID_MAP`) and publishes a semantic
 * id, so `/{-$locale}/$slug/c{$id}` arrives as `product.index`. In the
 * browser it publishes neither: the context store starts at `routeId: ""`
 * and the header never re-renders when `syncNavigationState` fills it in, so
 * the value the component reads after hydration is the empty string. Checked
 * on the live store on 2026-09-20 by printing it onto the element: the
 * server markup carried `has-search-row` and the hydrated markup dropped it,
 * on every route, which is why this row has never been seen in a browser.
 *
 * So the engine's id is matched for the server pass and the router's own
 * leaf id, which is correct on both sides, is matched for the client one.
 * Both resolve to the same set of pages, the two passes agree, and nothing
 * here depends on the engine's context being reactive.
 *
 * The home and product pages are in the set on their own merits. They are
 * where a shopper who already knows a supplier brand arrives, and every
 * Saudi-serving reference gives search a full-width field in the phone
 * header on every page. The cost is 40px of chrome; the hero still owns the
 * LCP element under it.
 */
const SEARCH_ROW_ROUTES = new Set([
  // The engine's semantic ids (the server pass).
  'index',
  'product.single',
  'product.index',
  'product.index.search',
  'product.index.latest',
  'product.index.sales',
  'product.index.offers',
  'product.index.tag',
  'brands.index',
  'brands.single',
  // The router's own ids (the client pass).
  '/{-$locale}/',
  '/{-$locale}/$slug/p{$id}',
  '/{-$locale}/$slug/c{$id}',
  '/{-$locale}/$slug/brand-{$id}',
  '/{-$locale}/$slug/tag-{$id}',
  '/{-$locale}/search',
  '/{-$locale}/brands',
  '/{-$locale}/brands/$id',
  '/{-$locale}/latest-products',
  '/{-$locale}/most-sales-products',
  '/{-$locale}/offers',
  '/{-$locale}/tags/$id',
]);

/** A router state shaped only as much as this file reads it. */
interface LeafMatches {
  matches?: { routeId?: string }[];
}

/**
 * The router's leaf route id, which is filled in on both passes.
 *
 * Selected rather than read whole, so the header re-renders when the matched
 * route changes and not on every other thing the router puts in its state.
 */
function useLeafRouteId(): string {
  return useRouterState({
    select: (state) => {
      const matches = (state as unknown as LeafMatches).matches ?? [];
      return matches[matches.length - 1]?.routeId ?? '';
    },
  }) as unknown as string;
}

/**
 * The OptimalX header (DIRECTION 5.1, 6.1).
 *
 * It keeps the engine's outer contract so storefront apps and the engine's own
 * CSS still find it: the class `store-header`, the `header:start` and
 * `header:end` hook slots, and `.advertisement-slot` as the first thing inside
 * (theme-engine chunk-65Z2ZDKZ.js:27-29, :118). Everything between them is
 * ours. The engine's `MainMenu` and `MobileMenu` are not rendered at all.
 *
 * There is no `<h1>` here: the store name lives in the logo's `alt`, and the
 * one h1 per route belongs to the page (DIRECTION 9.2).
 */
export function Header() {
  const { settings } = useTheme();
  const { routeId } = useTwilight();
  const leafRouteId = useLeafRouteId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [group, setGroup] = useState<'goals' | 'categories'>('goals');
  const adSlotRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const drawerId = useId();

  useHeaderHeightVar(headerRef);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<DrawerOpenDetail>).detail;
      setGroup(detail?.group ?? 'categories');
      setMenuOpen(true);
    };
    window.addEventListener(DRAWER_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(DRAWER_OPEN_EVENT, onOpen);
  }, []);

  // Not sticky unless the merchant switches it on. The identity has the bar
  // scroll away with the page (owner call, 2026-09-22); the earlier `!== false`
  // made every store without the setting sticky, which is what the Partners
  // demo stores showed.
  const sticky = (settings as Record<string, unknown> | undefined)?.header_is_sticky === true;
  const withSearchRow = SEARCH_ROW_ROUTES.has(routeId) || SEARCH_ROW_ROUTES.has(leafRouteId);

  const classes = [
    'store-header',
    'ox-header',
    sticky ? 'is-sticky' : null,
    withSearchRow ? 'has-search-row' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header ref={headerRef} className={classes} suppressHydrationWarning data-testid="ox-header">
      <HookSlot name="header:start" />

      <div className="advertisement-slot" ref={adSlotRef}>
        <Suspense fallback={null}>
          <SallaAdvertisement />
        </Suspense>
      </div>

      <AnnouncementBar adSlotRef={adSlotRef} />
      <UtilityBar />

      <div className="ox-mainbar">
        <MainBar />
        <MobileHeader
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          withSearchRow={withSearchRow}
          drawerId={drawerId}
        />
      </div>

      {/* Below 1024 the utility strip is hidden and its three trust items
          re-mount here on paper as a 40px snap scroller (spec A1). Only one of
          the two is ever in the accessibility tree: the other is display:none
          at that width. */}
      <UtilityTrust variant="scroller" />

      <MobileDrawer
        id={drawerId}
        open={menuOpen}
        initialGroup={group}
        onClose={() => setMenuOpen(false)}
      />

      <HookSlot name="header:end" />
    </header>
  );
}
