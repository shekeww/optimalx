import { Suspense, lazy } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useCartContext } from '@salla.sa/twilight-theme-engine/contexts';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { Icon } from '../common/Icon';
import { freeShippingThreshold, showsVatLine } from '../product/lib/claims';
import { amountText, freeShippingState } from './freeShipping';

export { amountText, freeShippingState, type FreeShippingState } from './freeShipping';

const SallaPayments = lazy(() =>
  import('@salla.sa/twilight-components-react/payments').then((m) => ({ default: m.SallaPayments }))
);

export interface CartTrustProps {
  /** Test and kitchen-sink seam; the cart context otherwise. */
  cart?: Cart;
}

/**
 * The block the `cart:items.end` hook renders (PLAN-final C5): the
 * free-shipping bar, the pickup alternative, the payment marks and the trust
 * lines, under the cart rows.
 *
 * Every line here is gated. The payment marks are `SallaPayments` and never a
 * method name in text; the VAT line renders only when the store has a VAT
 * number; the free-shipping bar renders only when the store or the owner has
 * given us a threshold.
 */
export function CartTrust({ cart: cartProp }: CartTrustProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const context = useCartContext();
  const cart = cartProp ?? context?.cart;

  const themeSettings = settings as Record<string, unknown> | undefined;
  const state = freeShippingState(cart, freeShippingThreshold(themeSettings));
  const vat = showsVatLine(themeSettings);

  return (
    <section className="ox-cart-trust" aria-label={t('ox.cart.title')} data-testid="ox-cart-trust">
      {state ? (
        <div className={`ox-ship${state.reached ? ' is-reached' : ''}`}>
          <p className="ox-ship__line ox-small">
            <Icon name={state.reached ? 'tick' : 'shipping'} size={16} />
            <span>
              {state.reached
                ? t('ox.cart.free_shipping_reached')
                : t('ox.cart.free_shipping_progress', { amount: amountText(state.remaining) })}
            </span>
          </p>
          <div
            className="ox-ship__track"
            role="progressbar"
            aria-label={t('ox.cart.free_shipping_label')}
            aria-valuenow={state.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="ox-ship__fill" style={{ inlineSize: `${state.percent}%` }} />
          </div>
          <p className="ox-ship__pickup ox-small">{t('ox.cart.pickup_option')}</p>
        </div>
      ) : null}

      <div className="ox-cart-trust__marks">
        <Suspense fallback={<div className="ox-cart-trust__marks-box" aria-hidden="true" />}>
          <SallaPayments />
        </Suspense>
      </div>

      <ul className="ox-cart-trust__lines">
        <li className="ox-small">{t('ox.cart.trust_authentic')}</li>
        <li className="ox-small">{t('ox.cart.trust_shipping')}</li>
        {vat ? <li className="ox-small">{t('ox.cart.vat_note')}</li> : null}
      </ul>
    </section>
  );
}
