import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useCartContext } from '@salla.sa/twilight-theme-engine/contexts';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';

export interface CartHeaderProps {
  /** Test and kitchen-sink seam; the cart context otherwise. */
  cart?: Cart;
}

/**
 * The cart's title row (DIRECTION 6.9 row 1), rendered into the engine's
 * `cart:start` slot so it lands under the breadcrumb and above the columns.
 *
 * The engine prints its own `h1.sr-only` from the platform string; that one
 * is hidden in `_b6-commerce.scss` and this is the page's single visible h1.
 *
 * The count is the cart's own `count`, which is real data about the visitor's
 * own cart, not a store statistic. It is rendered only once the cart has
 * resolved, so the line never flashes a zero on the way in.
 */
export function CartHeader({ cart: cartProp }: CartHeaderProps) {
  const { t } = useTranslation();
  const context = useCartContext();
  const cart = cartProp ?? context?.cart;
  const count = typeof cart?.count === 'number' ? cart.count : null;

  return (
    <header className="ox-cart__head" data-testid="ox-cart-header">
      <h1 className="ox-cart__title ox-h1">{t('ox.cart.title')}</h1>
      <p className="ox-cart__lead ox-body">
        {count !== null && count > 0
          ? t('ox.cart.items_count', { count })
          : t('ox.cart.lead')}
      </p>
    </header>
  );
}
