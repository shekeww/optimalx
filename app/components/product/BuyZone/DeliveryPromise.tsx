import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { Price } from '../../common/Price';
import {
  deliveryCity,
  deliveryWindow,
  freeShippingThreshold,
  settingText,
  type Settings,
} from '../lib/claims';

export interface DeliveryPromiseProps {
  settings?: Settings;
  currency?: string;
  /** Digital goods and services ship nothing: the block renders nothing. */
  shippable: boolean;
  /** The store's own city, used only when no delivery city is configured. */
  storeCity?: string | null;
}

/**
 * The delivery row (design region 25): a filled pill the width of the buy
 * column, with the estimate in the verified green and the city control pushed
 * to the inline end.
 *
 * Claims gates B3, B4 and B5, and this is the one worth reading twice. The
 * approved image prints "within 2 to 4 days". That figure is not in this file,
 * is not in the locale files, and cannot be: it is two numbers the owner
 * enters once a carrier agreement exists. Until then the estimate row does not
 * render, and the buy column closes the gap rather than leaving a hole.
 *
 * The other three rows are the ones the store can already fill: the merchant's
 * own promise line rendered verbatim, the free shipping threshold as money
 * through `Price` (never the literal), and branch pickup when a branch address
 * exists. `salla-delivery-promise` is still not used: it takes no props and
 * its copy cannot be gated by any of the above.
 */
export function DeliveryPromise({ settings, currency, shippable, storeCity }: DeliveryPromiseProps) {
  const { t } = useTranslation();
  if (!shippable) return null;

  const window = deliveryWindow(settings);
  const city = deliveryCity(settings, storeCity);
  const changeUrl = settingText(settings, 'shipping_page_url');
  const promise = settingText(settings, 'delivery_promise_line');
  const threshold = freeShippingThreshold(settings);
  const branch = settingText(settings, 'branch_address');
  if (!window && !promise && threshold === null && !branch) return null;

  const days = window ? t('ox.pdp.delivery_days', { from: window.from, to: window.to }) : '';
  const estimate = city
    ? t('ox.pdp.delivery_line', { days, city })
    : t('ox.pdp.delivery_line_no_city', { days });

  return (
    <div className="ox-delivery">
      {window ? (
        changeUrl ? (
          <a className="ox-delivery__row ox-delivery__row--action" href={changeUrl}>
            <Icon name="truck" size={20} className="ox-delivery__truck" />
            <span className="ox-delivery__text">{estimate}</span>
            <span className="ox-delivery__change">{t('ox.pdp.change_city')}</span>
            <Icon name="chevron-end" size={16} className="ox-delivery__chev" />
          </a>
        ) : (
          <p className="ox-delivery__row">
            <Icon name="truck" size={20} className="ox-delivery__truck" />
            <span className="ox-delivery__text">{estimate}</span>
          </p>
        )
      ) : null}
      {promise ? (
        <p className="ox-delivery__row">
          <Icon name="truck" size={20} className="ox-delivery__truck" />
          <span className="ox-delivery__text">{promise}</span>
        </p>
      ) : null}
      {threshold !== null ? (
        <p className="ox-delivery__row">
          <Icon name="truck" size={20} className="ox-delivery__truck" />
          <span className="ox-delivery__text">
            {t('ox.pdp.free_shipping_prefix')} <Price amount={threshold} currency={currency} />
          </span>
        </p>
      ) : null}
      {branch ? (
        <p className="ox-delivery__row">
          <Icon name="branch-visit" size={20} className="ox-delivery__truck" />
          <span className="ox-delivery__text">{t('ox.pdp.pickup_free')}</span>
        </p>
      ) : null}
    </div>
  );
}
