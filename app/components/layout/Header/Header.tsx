import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
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
 * (DIRECTION 6.1: 104 instead of 56). Ids are the `createFileRoute` strings.
 */
const SEARCH_ROW_ROUTES = new Set([
  '/{-$locale}/$slug/c{$id}',
  '/{-$locale}/$slug/brand-{$id}',
  '/{-$locale}/$slug/tag-{$id}',
  '/{-$locale}/search',
  '/{-$locale}/brands',
  '/{-$locale}/latest-products',
  '/{-$locale}/most-sales-products',
  '/{-$locale}/offers',
]);

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

  const sticky = (settings as Record<string, unknown> | undefined)?.header_is_sticky !== false;
  const withSearchRow = SEARCH_ROW_ROUTES.has(routeId);

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
