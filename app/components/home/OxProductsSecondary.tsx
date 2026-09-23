import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
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
 * **The heading names the door, not a discount.** It read `تصفح المزيد`,
 * which is also what the poster carousel directly above it read: two adjacent
 * sections under one heading, and no way for a visitor to tell that this one
 * is the reduced prices (UX-2026-09-24 P0-11). `العروض` names the section the
 * way the header's own `/offers` item names it, and it still claims nothing
 * about a particular product: the badge on a card carries the saving, this
 * heading never does. The row follows the same gate the header does
 * (`show_offers_nav !== false`, NAV 1.3), so a store that switches offers off
 * does not keep a section called offers. The `latest` fallback is what stops
 * the row from collapsing on a day with no campaign: a grid that renders a
 * heading, finds nothing and then removes itself is worse.
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
  const { settings } = useTheme();
  // A merchant who picks products or a source in the dashboard overrides both
  // the primary source and the fallback, which is what picking one means.
  const chosen = resolveSource(data);
  const curated = chosen.source !== 'latest';
  const title = fieldText(data, 'title') || t('ox.home.offers_title');
  const showsOffers = (settings as Record<string, unknown> | undefined)?.show_offers_nav !== false;

  if (!showsOffers) return null;

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
          viewAll={{ to: '/offers' }}
          gridId="ox-home-offers"
          skeleton={<ProductsGridSkeleton />}
        />
      </div>
    </section>
  );
}
