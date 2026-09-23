import { Suspense, lazy, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Logo } from './Logo';
import { NavBar } from './NavBar';
import { useCartCountPill } from './useCartCountPill';
import { Icon } from '../../common/Icon';

const SallaSearch = lazy(() =>
  import('@salla.sa/twilight-components-react/search').then((m) => ({ default: m.SallaSearch }))
);
const SallaUserMenu = lazy(() =>
  import('@salla.sa/twilight-components-react/user-menu').then((m) => ({ default: m.SallaUserMenu }))
);
const SallaCartSummary = lazy(() =>
  import('@salla.sa/twilight-components-react/cart-summary').then((m) => ({
    default: m.SallaCartSummary,
  }))
);

/**
 * The count on a wishlist or tab button. `aria-hidden` on purpose: the number
 * repeats the control's own name and the toast carries the change
 * announcement (DIRECTION 9.5 "status messages").
 *
 * The cart button does not use this: `salla-cart-summary` renders its own
 * `.s-cart-summary-count`, which the SDK keeps current on every route, while
 * `useCartContext()` is null outside the cart page (engine
 * contexts/CartContext.d.ts:23-33). The stylesheet dresses that element as
 * this pill instead. Either way the pill is absent at zero and the icon keeps
 * its full 44px hit area without it (B26).
 */
export function CountPill({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ox-count ox-micro" aria-hidden="true" data-testid="ox-count-pill">
      {count}
    </span>
  );
}

export interface SearchFieldProps {
  className?: string;
  /**
   * Below 1024 the pill collapses to a glyph that opens Salla's own search
   * modal (`placeholder` is the component's own button mode).
   */
  collapsed?: boolean;
}

/**
 * The store search, kept as Salla's (BUILD rule: search stays Salla's). The
 * wrapper carries `role="search"` and the accessible name, because the web
 * component owns the input inside its own shadow tree; the pill's fill, its
 * radius and its placeholder are painted onto the component's shadow parts
 * from `_b1-layout.scss`.
 */
export function SearchField({ className, collapsed = false }: SearchFieldProps) {
  const { t } = useTranslation();
  return (
    <div
      className={['ox-search', collapsed ? 'ox-search--collapsed' : null, className]
        .filter(Boolean)
        .join(' ')}
      role="search"
      aria-label={t('ox.header.search_label')}
      data-testid="ox-search"
    >
      <Suspense fallback={<div className="ox-search__placeholder" aria-hidden="true" />}>
        {collapsed ? <SallaSearch placeholder /> : <SallaSearch inline oval height={40} />}
      </Suspense>
    </div>
  );
}

/**
 * The desktop main bar: the lockup at the inline-start, the five nav items
 * beside it, the search pill, then wishlist, account and cart at the
 * inline-end.
 *
 * The icon order is the design's: in Arabic the row reads from the end edge,
 * so the DOM order wishlist, account, cart puts the cart at the physical left
 * where the image has it. Wishlist is a plain link with the engine's count;
 * account and cart are the Salla web components, with our glyph in the cart's
 * icon slot (engine-surface 9.2 salla-cart-summary).
 */
export function MainBar() {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const actionsRef = useRef<HTMLDivElement>(null);
  useCartCountPill(actionsRef);

  return (
    <div className="ox-mainbar__inner ox-container">
      <Logo width={112} priority className="ox-mainbar__logo" />

      <NavBar />

      <SearchField className="ox-mainbar__search" />

      <div className="ox-mainbar__actions" ref={actionsRef}>
        <Link
          to="/account/wishlist"
          className="ox-iconbtn ox-wishlist"
          aria-label={t('ox.header.wishlist')}
        >
          <Icon name="heart" size={20} />
          <CountPill count={wishlist?.count ?? 0} />
        </Link>

        <Suspense fallback={null}>
          <SallaUserMenu avatarOnly showHeader className="ox-iconbtn">
            {/* Same slotting shape as the cart button below: the owner's
                drawing replaces Salla's own signed-out glyph
                (`.s-user-menu-login-btn`, sized by `.ox-iconbtn
                .s-user-menu-login-btn svg` below). A signed-in avatar photo
                still wins over any slot content - that is Salla's own
                behaviour, not something this slot changes (S8e,
                2026-09-24). */}
            <span slot="icon" className="ox-iconbtn__icon">
              <Icon name="user" size={20} />
            </span>
          </SallaUserMenu>
        </Suspense>

        <Suspense fallback={null}>
          <SallaCartSummary className="ox-iconbtn ox-cartbtn">
            <span slot="icon" className="ox-cartbtn__icon">
              {/* DRAWN, not Salla's icon font. `sicon-shopping-bag` is not in
                  the loaded face, so the browser fell through to an emoji font
                  and painted a colour bag beside two currentColor strokes: the
                  cart was amber where the heart and the account glyph were
                  white. A drawn path cannot fall back. */}
              <Icon name="cart" size={22} />
              {/* The component's own anchor (`.s-cart-summary-wrapper`) gets no
                  name of its own: `cartLabel` is internal state, only ever
                  painted when `show-cart-label` is set, and the icon slot is
                  the only content of ours the component renders. Slotted
                  content is part of the flattened tree the accessible-name
                  computation walks, so this text reaches the anchor even
                  though it never appears there visually. */}
              <span className="ox-sr-only">{t('ox.header.cart')}</span>
            </span>
          </SallaCartSummary>
        </Suspense>
      </div>
    </div>
  );
}
