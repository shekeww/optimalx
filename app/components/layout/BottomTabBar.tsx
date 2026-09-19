import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useCartContext } from '@salla.sa/twilight-theme-engine/contexts';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { CountPill } from './Header/MainBar';
import { openMobileDrawer } from './Header/Header';

/**
 * Body classes that hide the bar: the engine sets `menu-opened` and
 * `modal-is-open` (engine-surface 10.3, 10.6) and the product batch adds
 * `ox-sticky-bar` while the PDP buy bar is showing. Two fixed bars would take
 * 120px of a 660px viewport (DIRECTION 5.1 BottomTabBar).
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
 * The mobile bottom tab bar (DIRECTION 5.1 BottomTabBar, 10.2).
 *
 * Five equal tabs, 56 tall plus the safe area, fixed below 1024 only, and
 * gated on the `show_bottom_tabbar` theme setting. It unmounts (rather than
 * hides) under a drawer, a modal or the PDP sticky bar, so the fixed layer is
 * released instead of being parked behind them.
 */
export function BottomTabBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const { location } = useTwilight();
  const cart = useCartContext();
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

  const path = location?.pathname ?? '';
  const isHome = path === '/' || /^\/[a-z]{2}\/?$/.test(path);
  const current = (match: string) => path.includes(match);

  return (
    <nav className="ox-tabbar" aria-label={t('ox.nav.quick_label')} data-testid="ox-tabbar">
      <ul className="ox-tabbar__list">
        <li>
          <Link
            to="/"
            className={`ox-tab${isHome ? ' is-active' : ''}`}
            {...(isHome ? { 'aria-current': 'page' } : {})}
          >
            <i className="sicon-home" aria-hidden="true" />
            <span className="ox-tab__label">{t('ox.nav.home')}</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="ox-tab"
            data-testid="ox-tab-categories"
            onClick={() => openMobileDrawer('categories')}
          >
            <i className="sicon-menu" aria-hidden="true" />
            <span className="ox-tab__label">{t('ox.nav.categories_short')}</span>
          </button>
        </li>
        <li>
          <Link
            to="/search"
            className={`ox-tab${current('/search') ? ' is-active' : ''}`}
            {...(current('/search') ? { 'aria-current': 'page' } : {})}
          >
            <i className="sicon-search" aria-hidden="true" />
            <span className="ox-tab__label">{t('ox.nav.search')}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`ox-tab${current('/cart') ? ' is-active' : ''}`}
            {...(current('/cart') ? { 'aria-current': 'page' } : {})}
          >
            <span className="ox-tab__icon">
              <i className="sicon-shopping-bag" aria-hidden="true" />
              <CountPill count={cart?.cart?.count ?? 0} />
            </span>
            <span className="ox-tab__label">{t('ox.header.cart')}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/account/profile"
            className={`ox-tab${current('/account') ? ' is-active' : ''}`}
            {...(current('/account') ? { 'aria-current': 'page' } : {})}
          >
            <i className="sicon-user" aria-hidden="true" />
            <span className="ox-tab__label">{t('ox.nav.account')}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
