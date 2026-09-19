import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  ProductsSliderWrapper,
  type ProductsSliderQuery,
} from '../../blocks/ProductsSliderWrapper';

export interface AlternativesProps {
  productId: number;
  /** The product's own category, when the catalogue puts it in one. */
  categoryId?: number | null;
  /** Heading; defaults to ox.pdp.alternatives. */
  title?: string;
}

/** The rail asks for eight so it still fills after the current product is dropped. */
const RAIL_SIZE = 8;

/**
 * Related products under the PDP (DIRECTION 5.4 Alternatives).
 *
 * `ProductsSliderWrapper` (P1b) owns the rail: it loads through
 * `product.list`, renders the engine `ProductCard` per item so the
 * `product:card` override applies, and returns null once every source it was
 * given has come back empty.
 *
 * Three sources, in this order, because `related` alone leaves a hole:
 *
 *   1. `related`, the products the merchant linked on this product by hand.
 *      This is the only source that is a real editorial recommendation, so it
 *      wins whenever it has anything.
 *   2. the product's own category, which is what DIRECTION 5.4 describes
 *      ("the same category and form") and what the heading promises.
 *   3. `latest`, so a catalogue with neither curation nor categories still
 *      closes the page with the shop rather than with a gap.
 *
 * Verified against the live store on 2026-09-19, which is why the chain
 * exists at all: `product.list({source: 'related'})` returned zero items for
 * the product the rail was tested on, and product detail came back with
 * `category: null` on all fifteen products checked, while `latest` answered
 * with six. The rail is therefore served by source three today and was
 * rendering nothing at all before. Linking related products, or assigning
 * categories, is a dashboard action that upgrades it with no code change.
 *
 * Nothing here asserts anything about the products it shows. The heading is
 * "منتجات قد تعجبك", a suggestion, never a bestseller or a rating claim, which
 * is why `best_selling` and `top-rated` are not in the chain even though the
 * API would answer them.
 *
 * The current product is excluded, so the rail never offers the page it is on.
 */
export function Alternatives({ productId, categoryId, title }: AlternativesProps) {
  const { t } = useTranslation();
  const fallbacks: ProductsSliderQuery[] = [
    ...(categoryId ? [{ source: 'categories' as const, sourceValue: categoryId }] : []),
    { source: 'latest' as const },
  ];

  return (
    <ProductsSliderWrapper
      className="ox-alternatives"
      source="related"
      sourceValue={productId}
      fallbacks={fallbacks}
      exclude={productId}
      perPage={RAIL_SIZE}
      sliderId={'ox-related-' + productId}
      title={title ?? t('ox.pdp.alternatives')}
    />
  );
}
