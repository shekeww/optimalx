import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { Price } from '../../common/Price';
import { freeShippingThreshold, settingText, type Settings } from '../lib/claims';

export interface DeliveryPromiseProps {
  settings?: Settings;
  currency?: string;
  /** Digital goods and services ship nothing: the block renders nothing. */
  shippable: boolean;
}

/**
 * The delivery and pickup lines (DIRECTION 5.4 DeliveryPromise).
 *
 * Every line is owner data or nothing:
 *  - the delivery line is the merchant's own `delivery_promise_line` setting,
 *    rendered verbatim; there is no computed arrival day, because no carrier
 *    cutoff is configured and a guessed date is a promise we cannot keep;
 *  - the free shipping line interpolates `free_shipping_threshold` as money
 *    through `Price` (PLAN-final 5.1 forbids the literal 299 anywhere);
 *  - the pickup line renders only when a branch address exists, which is the
 *    only signal we have that the branch is pickable (open question Q5).
 *
 * `salla-delivery-promise` is deliberately not used: the web component takes
 * no props and its copy cannot be gated by the claims rules above.
 */
export function DeliveryPromise({ settings, currency, shippable }: DeliveryPromiseProps) {
  const { t } = useTranslation();
  if (!shippable) return null;

  const promise = settingText(settings, 'delivery_promise_line');
  const threshold = freeShippingThreshold(settings);
  const branch = settingText(settings, 'branch_address');
  if (!promise && threshold === null && !branch) return null;

  return (
    <div className="ox-delivery">
      {promise ? (
        <p className="ox-delivery__row">
          <Icon name="shipping" size={20} />
          <span>{promise}</span>
        </p>
      ) : null}
      {threshold !== null ? (
        <p className="ox-delivery__row">
          <Icon name="shipping" size={20} />
          <span>
            {t('ox.pdp.free_shipping_prefix')}{' '}
            <Price amount={threshold} currency={currency} />
          </span>
        </p>
      ) : null}
      {branch ? (
        <p className="ox-delivery__row">
          <Icon name="branch-visit" size={20} />
          <span>{t('ox.pdp.pickup_free')}</span>
        </p>
      ) : null}
    </div>
  );
}
