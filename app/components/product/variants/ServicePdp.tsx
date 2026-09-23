import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaAddProductButtonCore } from '@salla.sa/twilight-components-react/add-product-button';
import { Price } from '../../common/Price';
import { WebComponentBoundary } from '../../common/WebComponentBoundary';
import { SpecFacts } from '../BuyZone/SpecChips';
import {
  consultationCreditNote,
  effectivePrice,
  inbodyIncluded,
  type Settings,
} from '../lib/claims';
import { picksSlotAtCheckout, type SpecLineLike } from './types';
import { channelByCode, SERVICES_HUB } from '../../../content/services';

export interface ServiceBuyZoneProps {
  product: Product;
  spec: SpecLineLike | null;
  settings?: Settings;
}

/**
 * The service and booking buy zone (DIRECTION 5.5 ServicePdp, 6.6).
 *
 * Blocks 4, 5, 7 and 9 of the DIRECTION 6.6 table: the price or "مجاني", the
 * channel facts read off the spec line, the buy control, the slot note, the
 * "what happens next" steps and the intake note, and the mandated medical
 * line. The control is Salla's own `salla-add-product-button` - a booking is
 * an ordinary cart item and the slot is chosen in Salla's checkout, never in
 * a picker here - but it is mounted HERE rather than through the engine's
 * `AddToCartForm`, which `ProductPage` no longer renders for a service or a
 * booking: that form's weight, size and quantity rows are shipping fields,
 * they printed in English on the branch-visit page, and its controls never
 * resolved past their skeletons (UX-2026-09-24 P0-2).
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
  const visit = channel?.id === 'visit';
  // The platform type is still `service` on all four advisory products (the
  // create API rejected `booking`, C14/Q12), so the slot PROMISE stays gated
  // on the real type while the LABEL follows the catalogue, which knows a
  // branch visit is booked and a written question is sent.
  const buyLabelKey =
    channel?.doorCtaKey ?? channel?.ctaKey ?? (booking ? 'ox.pdp.book_now' : 'ox.booking.order_service');
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
      {/* THE CONTROL. Before this, the page's only thing to press was the
          engine's scaffold form: English `Weight 0.1` and `Quantity` rows, a
          total of 0, and a quantity input and add button that never resolved
          past their skeletons, under a `<p>` that read "order the service"
          (UX-2026-09-24 P0-2). The form is not mounted for a service or a
          booking at all now; this is Salla's own add button, wearing the
          48-tall primary, and a booking is an ordinary cart item whose slot
          is chosen in Salla's checkout. */}
      <div className="ox-service__buy">
        <WebComponentBoundary label={`service add ${product.id}`}>
          <SallaAddProductButtonCore
            productId={product.id}
            productType={product.type}
            productStatus={product.status}
            width="wide"
            fill="solid"
            loaderPosition="center"
            className="ox-service__add"
          >
            {/* THE CATALOGUE'S OWN VERB, not a generic one. Each advisory
                channel already declares what a shopper does with it
                (`احجز زيارتك`, `احجز موعدك`, `أرسل سؤالك مجانا`), so the
                button says that rather than restating it in a second key.
                A booking-typed product the catalogue does not know still
                gets `ox.pdp.book_now`, and anything else is a request. The
                note below never repeats whichever one lands. */}
            {t(buyLabelKey)}
          </SallaAddProductButtonCore>
        </WebComponentBoundary>
      </div>
      {booking ? (
        <p className="ox-service__slot-note">{t('ox.booking.slot_at_checkout')}</p>
      ) : null}
      {/* The measurement, under the control that requests it (P0-2, and the
          third leg of P0-12). THE THEME'S ONE SENTENCE, read through
          `SERVICES_HUB.inbodyKey` so this page, the home band and the
          services page can never word it differently, gated on the same
          `inbody_included` setting they read. A measurement, never an
          outcome (FINAL-claims-source section 2 row 10). */}
      {visit && inbodyIncluded(settings) ? (
        <p className="ox-service__inbody">{t(SERVICES_HUB.inbodyKey)}</p>
      ) : null}
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
