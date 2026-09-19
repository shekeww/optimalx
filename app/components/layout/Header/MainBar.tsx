import { Suspense, lazy, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Logo } from './Logo';
import { useCartCountPill } from './useCartCountPill';

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
 * this pill instead.
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
}

/**
 * The store search, kept as Salla's (BUILD rule: search stays Salla's). The
 * wrapper carries `role="search"` and the accessible name, because the web
 * component owns the input inside its own shadow tree.
 */
export function SearchField({ className }: SearchFieldProps) {
  const { t } = useTranslation();
  return (
    <div
      className={['ox-search', className].filter(Boolean).join(' ')}
      role="search"
      aria-label={t('ox.header.search_label')}
      data-testid="ox-search"
    >
      <Suspense fallback={<div className="ox-search__placeholder" aria-hidden="true" />}>
        <SallaSearch inline oval height={48} />
      </Suspense>
    </div>
  );
}

/**
 * The desktop main bar (DIRECTION 5.1 MainBar, 6.1: 72 tall): the mark at the
 * start, the search field in the middle, then account, wishlist and cart at
 * the end. Wishlist is a plain link with the engine's count; account and cart
 * are the Salla web components with our icon in the cart's icon slot
 * (engine-surface 9.2 salla-cart-summary).
 */
export function MainBar() {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const actionsRef = useRef<HTMLDivElement>(null);
  useCartCountPill(actionsRef);

  return (
    <div className="ox-mainbar__inner ox-container">
      <Logo size={48} priority className="ox-mainbar__logo" />

      <SearchField className="ox-mainbar__search" />

      <div className="ox-mainbar__actions" ref={actionsRef}>
        <Suspense fallback={null}>
          <SallaUserMenu avatarOnly showHeader className="ox-iconbtn" />
        </Suspense>

        <Link to="/account/wishlist" className="ox-iconbtn ox-wishlist" aria-label={t('ox.header.wishlist')}>
          <i className="sicon-heart" aria-hidden="true" />
          <CountPill count={wishlist?.count ?? 0} />
        </Link>

        <Suspense fallback={null}>
          <SallaCartSummary className="ox-iconbtn ox-cart">
            <span slot="icon" className="ox-cart__icon">
              <i className="sicon-shopping-bag" aria-hidden="true" />
            </span>
          </SallaCartSummary>
        </Suspense>
      </div>
    </div>
  );
}
