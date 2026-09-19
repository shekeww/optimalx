import { Suspense, lazy } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { enabledPayments } from '../lib/claims';

const SallaPayments = lazy(() =>
  import('@salla.sa/twilight-components-react/payments').then((m) => ({ default: m.SallaPayments }))
);

export interface PaymentMarksProps {
  /** `store.settings.payments`: the gateway slugs the store actually has. */
  payments?: unknown;
}

/**
 * The payment marks row under the buy button (design region 24).
 *
 * Claims gate B10, and the one rule that has no exception: a payment method is
 * never named in text anywhere in this theme. The row is Salla's own
 * `salla-payments`, which draws exactly the marks the store has enabled, so
 * the page cannot advertise a gateway the shopper will not find at checkout.
 * With no readable gateway the row is absent and the gap above the delivery
 * row closes.
 */
export function PaymentMarks({ payments }: PaymentMarksProps) {
  const { t } = useTranslation();
  if (enabledPayments(payments).length === 0) return null;

  return (
    <div className="ox-pay">
      <span className="ox-sr-only">{t('ox.pdp.payment_methods_label')}</span>
      <Suspense fallback={<div className="ox-pay__slot" aria-hidden="true" />}>
        <SallaPayments className="ox-pay__marks" />
      </Suspense>
    </div>
  );
}

export default PaymentMarks;
