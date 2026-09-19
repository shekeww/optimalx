import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { Badge, BadgeStack } from '../../common/Badge';
import { Price } from '../../common/Price';
import {
  claimsOfficialDistributors,
  effectivePrice,
  savingOf,
  showsVatLine,
  type Settings,
} from '../lib/claims';
import { monthsUntilExpiry, pricePerServing } from '../lib/supply';

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
 * The per-serving line and the installment widgets are not in the approved
 * image but are both real sourced facts, so they stay under the price with the
 * installment slot keeping its reserved height; one conditional removes them.
 */
export function PdpPriceBlock({
  product,
  servings,
  expiry,
  settings,
  country,
  language,
}: PdpPriceBlockProps) {
  const { t } = useTranslation();
  const saving = savingOf(product);
  const price = effectivePrice(product);
  const perServing = pricePerServing(price, servings);
  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const expiryMonths = monthsUntilExpiry(expiry);
  const nearExpiry = expiryMonths !== null && expiryMonths >= 0 && expiryMonths < 6;

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
        {claimsOfficialDistributors(settings) ? (
          <Badge tone="neutral">{t('ox.pdp.official_distributors')}</Badge>
        ) : null}
      </BadgeStack>

      {showsVatLine(settings) ? (
        <p className="ox-pdp__tax">{t('ox.trust.vat_included')}</p>
      ) : null}
      {perServing !== null ? (
        <p className="ox-pdp__per-serving">
          <span>{t('ox.pdp.per_serving_prefix')}</span>{' '}
          <Price amount={perServing} currency={product.currency} />{' '}
          <span>{t('ox.pdp.per_serving_suffix')}</span>
        </p>
      ) : null}
      <div className="ox-pdp__installment">
        <SallaInstallment
          price={String(price ?? '')}
          currency={product.currency}
          country={country}
          language={language}
        />
      </div>
    </div>
  );
}
