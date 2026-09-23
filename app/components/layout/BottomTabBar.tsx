import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { CountPill } from './Header/MainBar';
import { Icon } from '../common/Icon';
import { useCartCount } from '../commerce/useCartCount';
import { openShopSheet } from './Header/Header';
import { matchesShopRoute, stripLocale, useRouterPathname } from './navLinks';

/**
 * Body classes that hide the bar: the engine sets `menu-opened` and
 * `modal-is-open` (engine-surface 10.3, 10.6; the shop sheet also adds
 * `modal-is-open`) and the product batch adds `ox-sticky-bar` while the PDP
 * buy bar is showing. Two fixed bars would take 120px of a 660px viewport
 * (DIRECTION 5.1 BottomTabBar).
 */
export const HIDING_BODY_CLASSES = ['menu-opened', 'modal-is-open', 'ox-sticky-bar'];

/** True while `<body>` carries any of `names`. Client only. */
export function useBodyHasClass(names: string[]): boolean {
  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const body = document.body;
    const read = () => setPresent(names.some((name) => body.classList.contains(name)));
    read();
    const observer = new MutationObserver(read);
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
    // The list is a module constant; re-subscribing per render would thrash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join(' ')]);
  return present;
}

/**
 * The mobile bottom tab bar (NAV-2026-09-23 §7).
 *
 * Five equal tabs, 56 tall plus the safe area, fixed below 1024 only, and
 * gated on the `show_bottom_tabbar` theme setting. It unmounts (rather than
 * hides) under a drawer, a modal or the PDP sticky bar, so the fixed layer is
 * released instead of being parked behind them.
 *
 * Every active state is an exact match against a stripped (locale removed)
 * pathname, replacing the old `path.includes(match)` test that lit "السلة"
 * inside `/account/cart-anything` (S3c finding 9). `تسوق` replaces
 * `التصنيفات`: it opens the full-height catalogue sheet rather than the side
 * drawer scrolled to a group, so one control no longer does both the site
 * map's job and the catalogue's.
 */
export function BottomTabBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const path = stripLocale(useRouterPathname() || '/');
  // The SDK-backed count, not `useCartContext`: the engine never mounts the
  // cart provider, so the context reads null on every route (commerce
  // useCartCount). `null` means "not known yet" and renders an empty pill.
  const cartCount = useCartCount();
  const hidden = useBodyHasClass(HIDING_BODY_CLASSES);

  const enabled = (settings as Record<string, unknown> | undefined)?.show_bottom_tabbar !== false;
  const mounted = enabled && !hidden;

  // The page needs room for the bar only while it is actually there; the
  // merchant can switch it off (DIRECTION 6.1 "body padding-block-end 56").
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!mounted) return;
    document.body.classList.add('ox-has-tabbar');
    return () => document.body.classList.remove('ox-has-tabbar');
  }, [mounted]);

  if (!mounted) return null;

  const isHome = path === '/';
  const isShop = matchesShopRoute(path);
  const isSearch = path === '/search';
  const isCart = path === '/cart';
  const isAccount = path === '/account' || path.startsWith('/account/');

  return (
    <nav className="ox-tabbar" aria-label={t('ox.nav.quick_label')} data-testid="ox-tabbar">
      <ul className="ox-tabbar__list">
        <li>
          <Link
            to="/"
            className={`ox-tab${isHome ? ' is-active' : ''}`}
            {...(isHome ? { 'aria-current': 'page' } : {})}
          >
            <Icon name="home" size={20} />
            <span className="ox-tab__label">{t('ox.nav.home')}</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            className={`ox-tab${isShop ? ' is-active' : ''}`}
            aria-haspopup="dialog"
            // The sheet is what hides this bar while it is open (§7.4:
            // `modal-is-open`), so a rendered instance of this button is
            // never itself the trigger of an already-open sheet.
            aria-expanded={false}
            data-testid="ox-tab-shop"
            onClick={() => openShopSheet()}
          >
            <Icon name="grid" size={20} />
            <span className="ox-tab__label">{t('ox.nav.shop')}</span>
          </button>
        </li>
        <li>
          <Link
            to="/search"
            className={`ox-tab${isSearch ? ' is-active' : ''}`}
            {...(isSearch ? { 'aria-current': 'page' } : {})}
          >
            <Icon name="search" size={20} />
            <span className="ox-tab__label">{t('ox.nav.search')}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`ox-tab${isCart ? ' is-active' : ''}`}
            {...(isCart ? { 'aria-current': 'page' } : {})}
          >
            <span className="ox-tab__icon">
              {/* DRAWN, not `sicon-shopping-bag`: that glyph is not in the
                  loaded face, so the browser falls through to an emoji font
                  and paints a colour bag beside four monochrome tabs
                  (MainBar.tsx has the full measurement). This is the same
                  `<Icon name="cart" />` the main bar and the mobile header
                  already use, so one glyph serves all three. */}
              <Icon name="cart" size={20} />
              <CountPill count={cartCount ?? 0} />
            </span>
            <span className="ox-tab__label">{t('ox.header.cart')}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/account/profile"
            className={`ox-tab${isAccount ? ' is-active' : ''}`}
            {...(isAccount ? { 'aria-current': 'page' } : {})}
          >
            <Icon name="user" size={20} />
            <span className="ox-tab__label">{t('ox.nav.account')}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
