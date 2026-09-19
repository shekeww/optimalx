import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { Price } from '../../common/Price';
import { effectivePrice, savingOf, showsVatLine, type Settings } from '../lib/claims';
import { pricePerServing } from '../lib/supply';

export interface PdpPriceBlockProps {
  product: Product;
  /** Servings from the spec line; the per-serving line hides without it. */
  servings?: number | null;
  settings?: Settings;
  /** Store country and language for the installment widgets. */
  country?: string;
  language?: string;
}

/**
 * Price, was-price, saving, tax note, per-serving line and the installment
 * widgets (DIRECTION 5.4 PdpPriceBlock).
 *
 * Every amount goes through `Price`, which is `useMoney().format()` inside a
 * bidi isolate, so no money is ever concatenated into a sentence. Red never
 * appears on a price: the was-price is struck in --ox-fg-3 and the saving is
 * --ox-go (DIRECTION 2.5). Percentages are never shown.
 *
 * The installment widgets get a fixed 48 slot so their late load cannot push
 * the buy button down (DIRECTION 6.5 row 4).
 */
export function PdpPriceBlock({
  product,
  servings,
  settings,
  country,
  language,
}: PdpPriceBlockProps) {
  const { t } = useTranslation();
  const saving = savingOf(product);
  const price = effectivePrice(product);
  const perServing = pricePerServing(price, servings);

  return (
    <div className="ox-pdp__price-block">
      <p className="ox-pdp__price">
        <Price amount={price} size="h2" currency={product.currency} />
        {product.is_on_sale ? (
          <span className="ox-pdp__was">
            <span className="ox-pdp__was-label">{t('ox.pdp.was_price_label')}</span>
            <Price amount={product.regular_price} currency={product.currency} was />
          </span>
        ) : null}
      </p>
      {saving !== null ? (
        <p className="ox-pdp__saving">
          <span>{t('ox.pdp.save_label')}</span>{' '}
          <Price amount={saving} go currency={product.currency} />
        </p>
      ) : null}
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
