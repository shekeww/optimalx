import { Breadcrumb, Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';

/**
 * The brands index (DIRECTION 6.14): a page header and one grid of tiles, 2-up
 * on mobile and 6-up on desktop, each a logo contained on a 3/2 plate with the
 * name under it. The logo is the brand's own artwork: never recoloured, never
 * cropped, never set as text.
 *
 * The engine groups brands by first letter; the groups are flattened into one
 * grid because a Saudi catalogue of this size reads as a wall of single-letter
 * sections otherwise. Group order is kept, so the page is still alphabetical.
 *
 * The h1 falls back to the navigation label when the loader could not name the
 * page (the route degrades a brands API failure to an empty group), because a
 * page without an h1 is an accessibility failure, not an empty state.
 *
 * The head sits in the same masthead band every listing carries, so /brands
 * and a brand's own products open identically. The tiles are plates because
 * that is what every piece of supplier artwork in this store sits on.
 */
export function BrandsGrid({ page, brands }: BrandsPageProps) {
  const { t } = useTranslation();
  const items = Object.keys(brands ?? {})
    .sort()
    .flatMap((char) => brands[char] ?? [])
    .filter((brand) => brand && brand.name && brand.url);

  return (
    <div className="ox-brands">
      <div className="ox-listing__band">
        <div className="ox-container ox-listing__band-inner">
          <Breadcrumb page={page} className="ox-crumbs" />
          <header className="ox-brands__head">
            <h1 className="ox-h1">{page.title || t('ox.nav.brands')}</h1>
            <p className="ox-body ox-brands__intro">{t('ox.brands.intro')}</p>
          </header>
        </div>
      </div>

      <div className="ox-container">
        {items.length === 0 ? (
          <div className="ox-listing__empty">
            <EmptyState
              icon="shaker"
              title={t('ox.brands.empty')}
              primary={
                <Button variant="primary" size={48} to="/latest-products">
                  {t('ox.brands.empty_cta')}
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="ox-brands__grid">
            {items.map((brand) => (
              <li key={brand.id}>
                <Link to={brand.url} className="ox-brand-tile">
                  <span className="ox-brand-tile__plate">
                    {brand.logo ? (
                      <Image
                        className="ox-brand-tile__img"
                        src={brand.logo}
                        alt={brand.name}
                        aspectRatio="3/2"
                        objectFit="contain"
                      />
                    ) : null}
                  </span>
                  <span className="ox-brand-tile__name ox-small">
                    <Bdi>{brand.name}</Bdi>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
