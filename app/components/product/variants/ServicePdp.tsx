import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Price } from '../../common/Price';
import { SpecFacts } from '../BuyZone/SpecChips';
import { consultationCreditNote, effectivePrice, type Settings } from '../lib/claims';
import { picksSlotAtCheckout, type SpecLineLike } from './types';
import { channelByCode } from '../../../content/services';

export interface ServiceBuyZoneProps {
  product: Product;
  spec: SpecLineLike | null;
  settings?: Settings;
}

/**
 * The service and booking buy zone (DIRECTION 5.5 ServicePdp, 6.6).
 *
 * Blocks 4, 5, 7 and 9 of the DIRECTION 6.6 table: the price or "مجاني", the
 * channel facts read off the spec line, the slot note, the "what happens
 * next" steps and the intake note, and the mandated medical line. The button
 * itself stays the engine `AddToCartForm`, which the page renders after this
 * block, because a booking is an ordinary cart item and slot selection
 * happens in Salla checkout (never a slot picker here).
 *
 * The "what happens next" block reads FINAL-content 4.6's confirmation-page
 * facts back onto the PDP, before the order, from `ox.booking.*` (all of
 * which already exist): `pick_slot` and the prayer/Friday scheduling notes,
 * then `confirmed_body` for a slot-based booking or `question_received_body`
 * for the written-question path, then `add_calendar` and the change/cancel
 * rule (read off the product's own catalogue code through `channelByCode`,
 * so a video product states the 12-hour rule and a visit product states
 * "any time"; an unrecognised code, e.g. the training session, states
 * neither rather than guessing). `no_purchase_note` always renders: sending
 * the order does not commit the shopper beyond that order.
 *
 * Claims gates (PLAN-final 5.1):
 *  - "تختار موعدك من صفحة إتمام الطلب" renders only for `product_type:
 *    booking`; the plain "اطلب الخدمة" line renders for `service` instead
 *    (OX-045 to OX-047 are still `service` because the create API rejected
 *    `booking`, C14, Q12);
 *  - the consultation credit line renders only when the owner has written
 *    `consultation_credit_note`, and then verbatim (Q9);
 *  - the reply-time field the merchant typed into the description is
 *    suppressed by `SpecFacts` unless `reply_sla_hours` is set (Q15);
 *  - the scope line is the mandated medical sentence, unchanged.
 */
export function ServicePdp({ product, spec, settings }: ServiceBuyZoneProps) {
  const { t } = useTranslation();
  const price = effectivePrice(product);
  const free = price === 0 || price === undefined;
  const credit = consultationCreditNote(settings);
  const booking = picksSlotAtCheckout(product.type);
  const channel = channelByCode(product.sku ?? undefined);
  const changeRuleKey =
    channel?.id === 'visit'
      ? 'ox.booking.change_rule_visit'
      : channel?.id === 'video'
        ? 'ox.booking.change_rule_video'
        : null;

  return (
    <div className="ox-service">
      <p className="ox-service__price">
        {free ? (
          <span className="ox-service__free">{t('ox.common.free')}</span>
        ) : (
          <Price amount={price} size="h2" currency={product.currency} />
        )}
      </p>
      <SpecFacts spec={spec} settings={settings} title={t('ox.pdp.facts')} />
      <p className="ox-service__slot-note">
        {t(booking ? 'ox.booking.slot_at_checkout' : 'ox.booking.order_service')}
      </p>
      {credit ? <p className="ox-service__credit">{credit}</p> : null}

      <section aria-labelledby="ox-service-next-title">
        <h3 id="ox-service-next-title" className="ox-h3">
          {t('ox.booking.what_next')}
        </h3>
        <ol className="ox-body ox-service__steps">
          {booking ? (
            <li className="ox-service__step">
              <span className="ox-x-bullet" aria-hidden="true" />
              {t('ox.booking.pick_slot')}
            </li>
          ) : null}
          <li className="ox-service__step">
            <span className="ox-x-bullet" aria-hidden="true" />
            {t(booking ? 'ox.booking.confirmed_body' : 'ox.booking.question_received_body')}
          </li>
          {booking ? (
            <li className="ox-service__step">
              <span className="ox-x-bullet" aria-hidden="true" />
              {t('ox.booking.add_calendar')}
            </li>
          ) : null}
        </ol>
        {booking ? (
          <p className="ox-service__slot-note">
            {t('ox.booking.prayer_note')}. {t('ox.booking.friday_note')}.
          </p>
        ) : null}
        {changeRuleKey ? (
          <p className="ox-service__slot-note">
            {t('ox.booking.change_cancel')}: {t(changeRuleKey)}
          </p>
        ) : null}
        <p className="ox-service__slot-note">{t('ox.booking.no_purchase_note')}</p>
      </section>

      <p className="ox-service__scope">{t('ox.pdp.medical_line')}</p>
    </div>
  );
}
