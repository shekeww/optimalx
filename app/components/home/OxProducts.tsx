import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductsListParams, ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductsSliderWrapper } from '../blocks/ProductsSliderWrapper';
import { ProductsRailSkeleton } from './HomeSkeleton';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The product rail (DIRECTION 5.2 ProductsSliderWrapper, 6.2 row 5).
 *
 * The title is "أحدث المنتجات" and the source is `latest`, because
 * FINAL-content 1.4 defers "الأكثر طلبا" until the store has real order data
 * and the rule is never to seed a bestseller list. A merchant who picks
 * products in the dashboard gets exactly those, in that order.
 *
 * The rail itself is the shared P1b wrapper over the native
 * `SallaProductsSlider`, which renders the engine `ProductCard`, so the
 * `product:card` override installed by the product batch applies here with no
 * import of its own (PLAN-final C1).
 */

export interface ResolvedSource {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
}

/**
 * The `products` field arrives either as the dashboard's source config
 * (`{source, source_value}`) or as the chosen products themselves; anything
 * else means "no selection", which is the latest products.
 */
export function resolveSource(data: OxBlockData): ResolvedSource {
  const field = data.products;
  if (field && !Array.isArray(field) && typeof field === 'object' && 'source' in field) {
    const config = field as { source?: string; source_value?: string | number | number[] | null };
    if (config.source) {
      return {
        source: config.source as ProductsListSource,
        ...(config.source_value != null ? { sourceValue: config.source_value } : {}),
      };
    }
  }
  if (Array.isArray(field)) {
    const ids = field
      .map((item) => (item && typeof item === 'object' ? (item as { id?: unknown }).id : undefined))
      .filter((id): id is number => typeof id === 'number');
    if (ids.length > 0) return { source: 'selected', sourceValue: ids };
  }
  return { source: 'latest' };
}

export function OxProducts({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const resolved = resolveSource(data);
  const title = fieldText(data, 'title') || t('ox.home.products_title');

  return (
    <section className="ox-products" data-testid="ox-products">
      <div className="ox-container">
        <ProductsSliderWrapper
          source={resolved.source}
          {...(resolved.sourceValue !== undefined ? { sourceValue: resolved.sourceValue } : {})}
          perPage={8}
          title={title}
          viewAll={{ to: '/latest-products' }}
          sliderId="ox-home-products"
          skeleton={<ProductsRailSkeleton />}
        />
      </div>
    </section>
  );
}
