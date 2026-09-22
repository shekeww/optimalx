import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { THANKYOU, thankYouLines } from '../../content/thankyou';
import { isPickupOrder, isServiceOnlyOrder, orderCategorySlugs, orderServiceChannel } from './order';

export { isPickupOrder, isServiceOnlyOrder, orderCategorySlugs, orderServiceChannel } from './order';
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
 *
 * The booking branch (S6, FINAL-content 4.6): an order whose every item is a
 * service/booking product (`isServiceOnlyOrder`) swaps the "how to start
 * using it" card, which assumes a physical product, for the confirmed or
 * question-received block. `orderServiceChannel` reads the order's own item
 * SKU to tell the written-question path (`question_received_*`) from a
 * slot-based one (`confirmed_*`); an unrecognised or missing channel (the
 * training session, OX-047) defaults to the slot-based block, which is still
 * true for an appointment it does not name a channel for. Never a slot
 * picker: the slot itself was chosen in Salla checkout.
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
  const serviceOnly = isServiceOnlyOrder(order);
  const channel = orderServiceChannel(order);
  const written = channel?.id === 'written';
  const changeRuleKey =
    channel?.id === 'visit'
      ? 'ox.booking.change_rule_visit'
      : channel?.id === 'video'
        ? 'ox.booking.change_rule_video'
        : null;
  const bookingLines = [
    ...(written ? [] : [t('ox.booking.add_calendar')]),
    ...(changeRuleKey ? [`${t('ox.booking.change_cancel')}: ${t(changeRuleKey)}`] : []),
  ];

  return (
    <div className="ox-ty" data-testid="ox-thankyou-blocks">
      {hasItems && !serviceOnly ? (
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

      {hasItems && serviceOnly ? (
        <section className="ox-ty__card ox-ty__steps" aria-labelledby="ox-ty-booking-title" data-testid="ox-ty-booking">
          <h2 className="ox-h3" id="ox-ty-booking-title">
            <Icon name={THANKYOU.icon} size={24} />
            {t(written ? 'ox.booking.question_received_title' : 'ox.booking.confirmed_title')}
          </h2>
          <p className="ox-body ox-ty__intro">
            {t(written ? 'ox.booking.question_received_body' : 'ox.booking.confirmed_body')}
          </p>
          {bookingLines.length > 0 ? (
            <ol className="ox-ty__list">
              {bookingLines.map((line, index) => (
                <li key={line}>
                  <span className="ox-ty__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="ox-body">{line}</span>
                </li>
              ))}
            </ol>
          ) : null}
          <p className="ox-small ox-ty__storage">{t('ox.booking.no_purchase_note')}</p>
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
