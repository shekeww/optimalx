import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { specField, INGREDIENT_LABELS, ORIGIN_LABELS, PACK_SIZE_LABELS } from '../lib/stats';
import type { SpecLine } from '../lib/specLine';

export interface DetailsPanelProps {
  product: Product;
  spec: SpecLine | null | undefined;
  /** The pre-purchase rows and the mandated medical line, under the table. */
  footer?: ReactNode;
}

interface Row {
  id: string;
  label: string;
  value: ReactNode;
}

/**
 * The product details panel (design region 36): a key and value table where
 * every value is 15/600 and every row is sourced.
 *
 * Claims gates B24 and B25: a row whose source is empty is not rendered. The
 * table simply has fewer rows and the panel still fills its column, because
 * the grid stretches it. Nothing is defaulted, and no row is invented to make
 * the table look as long as the one in the mock.
 */
export function DetailsPanel({ product, spec, footer }: DetailsPanelProps) {
  const { t } = useTranslation();
  const rows: Row[] = [];

  const brand = product.brand?.name;
  if (brand) {
    rows.push({ id: 'brand', label: t('ox.pdp.detail_brand'), value: <Bdi>{brand}</Bdi> });
  }

  const subtitle = typeof product.subtitle === 'string' ? product.subtitle.trim() : '';
  const type = subtitle || spec?.form;
  if (type) rows.push({ id: 'type', label: t('ox.pdp.detail_type'), value: type });

  const size = specField(spec, PACK_SIZE_LABELS) ?? (product.weight ? product.weight.trim() : null);
  if (size) rows.push({ id: 'size', label: t('ox.pdp.size'), value: size });

  if (spec?.servingsText) {
    rows.push({ id: 'servings', label: t('ox.pdp.servings'), value: spec.servingsText });
  }

  const ingredients = specField(spec, INGREDIENT_LABELS);
  if (ingredients) {
    rows.push({ id: 'ingredients', label: t('ox.pdp.detail_ingredients'), value: ingredients });
  }

  const origin = specField(spec, ORIGIN_LABELS);
  if (origin) rows.push({ id: 'origin', label: t('ox.pdp.detail_origin'), value: origin });

  const sku = typeof product.sku === 'string' ? product.sku.trim() : '';
  if (sku) {
    rows.push({
      id: 'sku',
      label: t('ox.pdp.detail_sku'),
      value: <Bdi ltr>{sku}</Bdi>,
    });
  }

  if (rows.length === 0 && !footer) return null;

  return (
    <section className="ox-panel ox-details" id="ox-details" aria-labelledby="ox-details-title">
      <h2 className="ox-panel__title" id="ox-details-title">
        {t('ox.pdp.facts')}
      </h2>
      {rows.length > 0 ? (
        <dl className="ox-details__table">
          {rows.map((row) => (
            <div className="ox-details__row" key={row.id}>
              <dt className="ox-details__key">{row.label}</dt>
              <dd className="ox-details__value">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {footer ? <div className="ox-details__footer">{footer}</div> : null}
    </section>
  );
}

export default DetailsPanel;
