import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { Badge, BadgeStack } from '../../common/Badge';
import { Price } from '../../common/Price';
import {
  claimsOfficialDistributors,
  effectivePrice,
  hasInstallmentGateway,
  savingOf,
  showsVatLine,
  type Settings,
} from '../lib/claims';
import { monthsUntilExpiry } from '../lib/supply';

export interface PdpPriceBlockProps {
  product: Product;
  /** Servings from the spec line; the per-serving line hides without it. */
  servings?: number | null;
  /** Expiry as YYYY-MM from the spec line, for the near-expiry badge. */
  expiry?: string | null;
  settings?: Settings;
  /** Store country and language for the installment widgets. */
  country?: string;
  language?: string;
  /** `store.settings.payments`: the gateway slugs the store actually has. */
  payments?: unknown;
}

/**
 * The price (design region 22), with the badge row the title block used to
 * carry underneath it.
 *
 * The amount is 36/800 and the currency mark sits after it in the accent, at
 * the digits' cap height. Money is always `useMoney().format()` inside
 * `Price`, so no amount is ever concatenated into a sentence, and red never
 * touches a price: the was-price is struck in a grey and the saving is the
 * verified green.
 *
 * The installment widget is not in the approved image, and on this store it
 * could not be: `salla-installment` mounts whatever the gateways are and, with
 * no split provider enabled, holds its own skeleton open forever. The slot is
 * therefore gated on `hasInstallmentGateway`, so the default render closes the
 * distance between the price and the buy button exactly as the image draws it,
 * and the widget reappears the day the owner enables tabby or tamara.
 *
 * The badge row is gated the same way: an empty stack still spends a row gap,
 * and on a store with no sale, no expiry and no distributor claim that is
 * every product.
 */
export function PdpPriceBlock({
  product,
  servings,
  expiry,
  settings,
  country,
  language,
  payments,
}: PdpPriceBlockProps) {
  const { t } = useTranslation();
  const saving = savingOf(product);
  const price = effectivePrice(product);
  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const expiryMonths = monthsUntilExpiry(expiry);
  const nearExpiry = expiryMonths !== null && expiryMonths >= 0 && expiryMonths < 6;
  const official = claimsOfficialDistributors(settings);
  const hasBadges =
    outOfStock || (saving !== null) || (nearExpiry && Boolean(expiry)) || official;
  const showsInstallment = hasInstallmentGateway(payments);

  return (
    <div className="ox-pdp__price-block">
      <p className="ox-pdp__price">
        <Price amount={price} size="hero" currency={product.currency} />
        {product.is_on_sale ? (
          <span className="ox-pdp__was">
            <span className="ox-pdp__was-label">{t('ox.pdp.was_price_label')}</span>
            <Price amount={product.regular_price} currency={product.currency} was />
          </span>
        ) : null}
      </p>

      {hasBadges ? (
        <BadgeStack className="ox-pdp__badges">
          {outOfStock ? <Badge tone="stop">{t('ox.card.out_of_stock')}</Badge> : null}
          {!outOfStock && saving !== null ? (
            <Badge tone="saving">
              {t('ox.pdp.save_label')} <Price amount={saving} go currency={product.currency} />
            </Badge>
          ) : null}
          {nearExpiry && expiry ? (
            <Badge tone="note">{t('ox.card.expiry', { date: expiry })}</Badge>
          ) : null}
          {official ? <Badge tone="neutral">{t('ox.pdp.official_distributors')}</Badge> : null}
        </BadgeStack>
      ) : null}

      {showsVatLine(settings) ? (
        <p className="ox-pdp__tax">{t('ox.trust.vat_included')}</p>
      ) : null}
      {showsInstallment ? (
        <div className="ox-pdp__installment">
          <SallaInstallment
            price={String(price ?? '')}
            currency={product.currency}
            country={country}
            language={language}
          />
        </div>
      ) : null}
    </div>
  );
}
