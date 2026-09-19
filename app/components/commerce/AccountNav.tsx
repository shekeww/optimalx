import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';

/**
 * The account rail (DIRECTION 5.5 AccountNav, PLAN-final 6.3 "Account").
 *
 * Why a theme component rather than the engine's own menu: `CustomerLayout`
 * puts `SallaUserMenu` inside `nav.sidebar` behind `hidden lg:block`
 * (CustomerLayout-PLJTAXCP.js), so below 1024 the account area has no
 * navigation at all. The CDN menu also lists whatever the platform ships,
 * which on this store includes surfaces that do not exist. This rail lists
 * the seven routes the theme actually serves and nothing else.
 *
 * No icons. The theme's sprite (P1a, frozen) carries category, goal and
 * promise symbols; it has no user, bell or wallet glyph, and Salla's `sicon`
 * font is a different stroke language from ours. Mixing the two families in
 * one rail is the kind of seam that makes a store read as assembled rather
 * than designed, so the rail is set as text rows separated by hairlines, with
 * the current row marked by a 2px accent bar at the inline start. That is the
 * same device the approved image uses for the active product tab.
 */
export type AccountSurface =
  | 'profile'
  | 'orders'
  | 'wishlist'
  | 'wallet'
  | 'notifications'
  | 'settings'
  | 'loyalty'
  | 'testimonials';

export interface AccountNavItem {
  id: AccountSurface;
  to: string;
  labelKey: string;
}

export interface AccountNavGroup {
  id: string;
  headingKey: string;
  items: AccountNavItem[];
}

/**
 * Two groups, in the order a signed-in visitor uses them: what they bought
 * and saved first, then the account itself. Every `to` is a route in
 * `app/routes/`; nothing here links to a surface BUILD.md defers (the
 * reference image's "Recommended Products" and "Supply Tracker" are V2 and
 * are deliberately absent).
 */
export const ACCOUNT_NAV: AccountNavGroup[] = [
  {
    id: 'shop',
    headingKey: 'ox.account.section_shop',
    items: [
      { id: 'orders', to: '/account/orders', labelKey: 'ox.account.orders' },
      { id: 'wishlist', to: '/account/wishlist', labelKey: 'ox.account.wishlist' },
      { id: 'loyalty', to: '/loyalty', labelKey: 'ox.account.loyalty' },
    ],
  },
  {
    id: 'account',
    headingKey: 'ox.account.section_account',
    items: [
      { id: 'profile', to: '/account/profile', labelKey: 'ox.account.profile' },
      { id: 'wallet', to: '/account/wallet', labelKey: 'ox.account.wallet' },
      { id: 'notifications', to: '/account/notifications', labelKey: 'ox.account.notifications' },
      { id: 'settings', to: '/account/settings', labelKey: 'ox.account.settings' },
    ],
  },
];

export interface AccountNavProps {
  /**
   * The surface being viewed. It is passed in rather than read from the URL
   * so the active row is correct in the server render, before hydration.
   */
  current: AccountSurface;
}

export function AccountNav({ current }: AccountNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="ox-acct-nav" aria-label={t('ox.account.nav_label')} data-testid="ox-account-nav">
      {ACCOUNT_NAV.map((group) => (
        <div className="ox-acct-nav__group" key={group.id}>
          <h2 className="ox-acct-nav__heading ox-micro">{t(group.headingKey)}</h2>
          <ul className="ox-acct-nav__list">
            {group.items.map((item) => {
              const active = item.id === current;
              return (
                <li className="ox-acct-nav__item" key={item.id}>
                  <Link
                    to={item.to}
                    className={`ox-acct-nav__link${active ? ' is-current' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
