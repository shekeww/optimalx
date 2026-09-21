import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type {
  ProductsListParams,
  ProductsListSource,
} from '@salla.sa/twilight-theme-engine/api/product';
import { ProductsGridWrapper } from '../blocks/ProductsGridWrapper';
import { ProductsGridSkeleton } from './HomeSkeleton';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The first product grid, `أحدث المنتجات` (homepage-scale-spec section 4).
 *
 * **This is where a price first appears and it has to appear high.** A price
 * high on the page is what tells a Saudi shopper this is a real shop and not
 * a brochure, so this block sits directly under the category row, above the
 * campaign poster and above the goal row. It is the second of the four
 * questions the page answers in order: what do you sell.
 *
 * Four across at 1296, dense, eight cards. It was a rail until the rebuild
 * and the rail was the wrong shape: it showed four of eight and hid the rest
 * behind a drag, on the one block whose job is to look like a shop shelf.
 *
 * The source is `latest`, because FINAL-content 1.4 defers `الأكثر طلبا`
 * until the store has real order data and the rule is never to seed a
 * bestseller list. A merchant who picks products in the dashboard gets
 * exactly those, in that order.
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
        <ProductsGridWrapper
          source={resolved.source}
          {...(resolved.sourceValue !== undefined ? { sourceValue: resolved.sourceValue } : {})}
          count={8}
          title={title}
          viewAll={{ to: '/latest-products' }}
          gridId="ox-home-products"
          skeleton={<ProductsGridSkeleton />}
        />
      </div>
    </section>
  );
}
