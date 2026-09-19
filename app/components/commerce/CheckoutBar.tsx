import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { Price } from '../common/Price';

export interface CheckoutBarProps {
  cart: Cart | undefined;
}

/**
 * The mobile checkout bar (DIRECTION 6.9 row 4, 5.5 CartSummary): 64 tall,
 * fixed to the bottom below 1024, carrying the order total and a repeat of
 * the engine's checkout button.
 *
 * Checkout itself stays Salla's. The button calls `window.salla.cart.submit()`,
 * which is the exact call the engine's own summary button makes
 * (theme-engine CartSummary-4V3L56U7.js:62-67), so both buttons run one code
 * path and the SDK keeps its validation, its loader and its errors.
 *
 * While it is mounted the document carries `ox-sticky-bar`, the class B1's
 * `BottomTabBar` unmounts on (its `HIDING_BODY_CLASSES`). Two fixed bars
 * would take 120 of a 660 viewport, so the tab bar yields to this one, and
 * the class is removed on unmount so the tab bar comes straight back.
 */
export function CheckoutBar({ cart }: CheckoutBarProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const empty = !cart || cart.items.length === 0;

  useEffect(() => {
    if (typeof document === 'undefined' || empty) return;
    document.body.classList.add('ox-sticky-bar');
    return () => document.body.classList.remove('ox-sticky-bar');
  }, [empty]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      await window.salla?.cart.submit();
    } catch {
      // The SDK reports its own failure through the toaster.
    } finally {
      setSubmitting(false);
    }
  }, []);

  if (empty) return null;

  return (
    <div className="ox-checkout-bar" data-testid="ox-checkout-bar">
      <div className="ox-checkout-bar__inner">
        <span className="ox-checkout-bar__total">
          <span className="ox-checkout-bar__label ox-small">{t('ox.cart.total')}</span>
          <Price amount={cart.total} size="h3" />
        </span>
        <button
          type="button"
          className="ox-btn ox-btn--primary ox-btn--s48 ox-checkout-bar__btn"
          onClick={submit}
          aria-busy={submitting || undefined}
          aria-label={t('ox.cart.checkout_bar_label')}
        >
          {t('ox.cart.checkout')}
        </button>
      </div>
    </div>
  );
}
