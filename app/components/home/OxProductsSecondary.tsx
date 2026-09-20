import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ProductsGridWrapper } from '../blocks/ProductsGridWrapper';
import { ProductsGridSkeleton } from './HomeSkeleton';
import { resolveSource } from './OxProducts';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The second product grid (homepage-scale-spec section 8).
 *
 * Two grids on one page only earn their place when they are not the same
 * eight products twice, so this one is **sourced differently**: `offers`
 * first, the products that genuinely carry a reduced price, falling back to
 * `latest` sorted price-ascending when there are none, which is every day
 * until the owner runs a campaign.
 *
 * **The heading says neither.** `تصفح المزيد من المنتجات` is true of both and
 * claims nothing about price, popularity or stock. Naming the fallback in the
 * heading would be a discount claim on days there is no discount, and naming
 * offers would be one on the same days. The fallback is what stops the row
 * from collapsing under the visitor: a grid that renders a heading, finds
 * nothing and then removes itself is worse than the honest alternative.
 *
 * This is the last of the three answers to "which one is for me", and it is
 * placed after the goal row and the poster carousel on purpose: by the time a
 * shopper reaches it they have been offered two ways to narrow the catalogue,
 * and this grid catches the ones who would rather just browse.
 *
 * It used to be a rail wedged into the FAQ block's right-hand column. The FAQ
 * is a quiet closing section and a product rail inside it made it neither
 * quiet nor a closing section.
 */
export function OxProductsSecondary({ data }: OxBlockProps) {
  const { t } = useTranslation();
  // A merchant who picks products or a source in the dashboard overrides both
  // the primary source and the fallback, which is what picking one means.
  const chosen = resolveSource(data);
  const curated = chosen.source !== 'latest';
  const title = fieldText(data, 'title') || t('ox.home.offers_title');

  return (
    <section className="ox-products ox-products--secondary" data-testid="ox-products-secondary">
      <div className="ox-container">
        <ProductsGridWrapper
          source={curated ? chosen.source : 'offers'}
          {...(curated && chosen.sourceValue !== undefined
            ? { sourceValue: chosen.sourceValue }
            : {})}
          {...(curated ? {} : { fallbacks: [{ source: 'latest' as const }] })}
          sort="priceFromLowToTop"
          count={8}
          title={title}
          eyebrow={t('ox.home.offers_eyebrow')}
          viewAll={{ to: '/latest-products' }}
          gridId="ox-home-offers"
          skeleton={<ProductsGridSkeleton />}
        />
      </div>
    </section>
  );
}
