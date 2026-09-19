import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ProductsSliderWrapper } from '../../blocks/ProductsSliderWrapper';

export interface AlternativesProps {
  productId: number;
  /** Heading; defaults to ox.pdp.alternatives. */
  title?: string;
}

/**
 * Related products under the PDP (DIRECTION 5.4 Alternatives).
 *
 * `ProductsSliderWrapper` (P1b) owns the rail: it loads through
 * `product.list({source: 'related'})`, renders the engine `ProductCard` per
 * item so the `product:card` override applies, and returns null once the
 * loader has come back empty. The block therefore disappears on a store with
 * no related products instead of falling back to an unrelated list.
 */
export function Alternatives({ productId, title }: AlternativesProps) {
  const { t } = useTranslation();
  return (
    <ProductsSliderWrapper
      className="ox-alternatives"
      source="related"
      sourceValue={productId}
      sliderId={'ox-related-' + productId}
      title={title ?? t('ox.pdp.alternatives')}
    />
  );
}
