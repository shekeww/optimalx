import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Price } from '../../common/Price';
import { SpecFacts } from '../BuyZone/SpecChips';
import { consultationCreditNote, effectivePrice, type Settings } from '../lib/claims';
import { picksSlotAtCheckout, type SpecLineLike } from './types';

export interface ServiceBuyZoneProps {
  product: Product;
  spec: SpecLineLike | null;
  settings?: Settings;
}

/**
 * The service and booking buy zone (DIRECTION 5.5 ServicePdp, 6.6).
 *
 * Blocks 4, 5, 7 and 9 of the DIRECTION 6.6 table: the price or "مجاني", the
 * channel facts read off the spec line, the slot note, and the mandated
 * medical line. The button itself stays the engine `AddToCartForm`, which the
 * page renders after this block, because a booking is an ordinary cart item
 * and slot selection happens in Salla checkout.
 *
 * Claims gates (PLAN-final 5.1):
 *  - "تختار موعدك في صفحة إتمام الطلب" renders only for `product_type:
 *    booking`. OX-045 to OX-047 are still `service` because the create API
 *    rejected `booking` (C14, Q12), so today the line stays hidden;
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
      {picksSlotAtCheckout(product.type) ? (
        <p className="ox-service__slot-note">{t('ox.booking.slot_at_checkout')}</p>
      ) : null}
      {credit ? <p className="ox-service__credit">{credit}</p> : null}
      <p className="ox-service__scope">{t('ox.pdp.medical_line')}</p>
    </div>
  );
}
