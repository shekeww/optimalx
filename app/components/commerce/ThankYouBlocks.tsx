import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { THANKYOU, thankYouLines } from '../../content/thankyou';
import { isPickupOrder, orderCategorySlugs } from './order';

export { isPickupOrder, orderCategorySlugs } from './order';
import { settingText } from '../product/lib/claims';

export interface ThankYouBlocksProps {
  order: Order | undefined;
  /** The services hub; the written question lives there. */
  servicesHref?: string;
  branchHref?: string;
  ordersHref?: string;
}

/**
 * The blocks under the engine's order summary (DIRECTION 6.10 rows 2 to 5,
 * FINAL-content 6.4).
 *
 * Every line comes from `content/thankyou.ts`; nothing here is written in
 * this file and no line is invented for a product we do not recognise. The
 * services nudge carries no reply-time promise (PLAN-final 5.1: a reply time
 * renders only where `reply_sla_hours` is set, and the thank-you page is not
 * one of those places).
 */
export function ThankYouBlocks({
  order,
  servicesHref = '/services',
  branchHref = '/branch',
  ordersHref = '/account/orders',
}: ThankYouBlocksProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const lines = thankYouLines(orderCategorySlugs(order));
  const hasItems = (order?.items?.length ?? 0) > 0;
  const branchAddress = settingText(settings as Record<string, unknown> | undefined, 'branch_address');
  const pickup = isPickupOrder(order) && branchAddress !== null;

  return (
    <div className="ox-ty" data-testid="ox-thankyou-blocks">
      {hasItems ? (
        <section className="ox-ty__card ox-ty__steps" aria-labelledby="ox-ty-steps-title">
          <h2 className="ox-h3" id="ox-ty-steps-title">
            <Icon name={THANKYOU.icon} size={24} />
            {t(THANKYOU.titleKey)}
          </h2>
          <p className="ox-body ox-ty__intro">{t(THANKYOU.introKey)}</p>
          <ol className="ox-ty__list">
            {THANKYOU.stepKeys.map((key, index) => (
              <li key={key}>
                <span className="ox-ty__num" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="ox-body">{t(key)}</span>
              </li>
            ))}
          </ol>
          {lines.length > 0 ? (
            <ul className="ox-ty__lines">
              {lines.map((key) => (
                <li className="ox-body" key={key}>
                  {t(key)}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="ox-small ox-ty__storage">{t(THANKYOU.storageKey)}</p>
        </section>
      ) : null}

      <section className="ox-ty__card ox-ty__nudge" aria-labelledby="ox-ty-nudge-title">
        <h2 className="ox-h3" id="ox-ty-nudge-title">
          {t('ox.thankyou.services_title')}
        </h2>
        <p className="ox-body">{t(THANKYOU.closingKey)}</p>
        <Button to={servicesHref} variant="secondary" size={44}>
          {t('ox.thankyou.services_cta')}
        </Button>
      </section>

      {pickup ? (
        <section className="ox-ty__card ox-ty__pickup" aria-labelledby="ox-ty-pickup-title">
          <h2 className="ox-h3" id="ox-ty-pickup-title">
            {t('ox.thankyou.pickup_title')}
          </h2>
          <p className="ox-body">{t('ox.thankyou.pickup_body')}</p>
          <p className="ox-body ox-ty__address">{branchAddress}</p>
          <Button to={branchHref} variant="link">
            {t('ox.thankyou.pickup_link')}
          </Button>
        </section>
      ) : null}

      <div className="ox-ty__out">
        <Button to={ordersHref} size={48} variant="primary">
          {t('ox.thankyou.orders_cta')}
        </Button>
        <Button to="/" size={48} variant="secondary">
          {t('ox.thankyou.continue_cta')}
        </Button>
      </div>
    </div>
  );
}
