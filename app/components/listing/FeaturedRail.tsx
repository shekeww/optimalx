import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { effectivePrice } from '../product/lib/claims';
import { Bdi } from '../common/Bdi';
import { Price } from '../common/Price';
import { SectionHeader } from '../common/SectionHeader';

export interface FeaturedRailProps {
  /** The listing's own loaded products (the loader's first page). */
  products: Product[];
  className?: string;
}

const RAIL_IMAGE_WIDTHS = [150, 300, 500] as const;
const RAIL_IMAGE_SIZES = '(min-width: 1024px) 25vw, 45vw';
/** The fallback picks the first 4 to 6 of the listing's own default sort. */
const FALLBACK_MAX = 6;

/**
 * True when the engine's runtime payload flags this product as merchant
 * featured. The engine's own `Product` type (checked 2026-09-22 against
 * `@salla.sa/twilight-theme-engine/types`) declares neither `is_featured` nor
 * `featured`, so the read is defensive rather than typed: a store whose API
 * payload carries the field (the platform has shipped it as an undocumented
 * extra before) still gets it, and a store that does not falls through to the
 * default-sort fallback below with no error.
 */
function isMerchantFeatured(product: Product): boolean {
  const raw = product as unknown as { is_featured?: unknown; featured?: unknown };
  return raw.is_featured === true || raw.featured === true;
}

/**
 * The rail's product set: every merchant-flagged product, or the first 4 to 6
 * of the listing's own default sort when none is flagged (owner amendment
 * 2026-09-22, "New: S2d"). `products` is already the listing's default-sorted
 * page, so slicing it is the fallback verbatim rather than a second request.
 */
export function featuredProducts(products: Product[]): Product[] {
  const flagged = products.filter(isMerchantFeatured);
  if (flagged.length > 0) return flagged;
  return products.slice(0, Math.min(FALLBACK_MAX, products.length));
}

/**
 * The cover tile's image.
 *
 * The brief asks for an owner-generated cover per featured product through a
 * `featured_cover_<sku>` field or an equivalent merchant field, "when the
 * engine exposes one" — checked 2026-09-22 against the engine's `Product`
 * type and the listing payload: neither carries a per-SKU cover image or a
 * matching theme setting today, so there is nothing yet to read. This
 * resolves the product's OWN first image, which is what the brief names as
 * the render for today; it is the one function that changes the day a later
 * batch wires a real `featured_cover_<sku>` source.
 */
export function featuredCoverImage(product: Product): { url: string | undefined; alt: string } {
  return { url: product.image?.url, alt: product.image?.alt ?? product.name };
}

/**
 * The first row of every type and goal category listing (owner amendment
 * 2026-09-22, "New: S2d"): a horizontal snap scroller of the category's
 * featured products, each a cover tile with its name, its price through
 * `Price` and one link to the product page.
 *
 * Reserved height, CLS 0: `products` arrives with the page (the loader's own
 * first page, present at first paint on both server and client), so nothing
 * here ever swaps a skeleton for a loaded card. The plate reserves its own
 * box through `aspect-ratio`; every text row reserves its own through
 * `min-block-size`, never `block-size` (DIRECTION 1036).
 *
 * Hidden below two products (a carousel of one is not a carousel), and never
 * carrying the identity band's wedge: `_b4-listing.scss` section 0 already
 * states the listing spends no angled shape, and this rail is part of that
 * surface, not a home section.
 */
export function FeaturedRail({ products, className }: FeaturedRailProps) {
  const { t } = useTranslation();
  if (products.length < 2) return null;
  const items = featuredProducts(products);
  if (items.length === 0) return null;

  return (
    <section
      className={['ox-featured', className].filter(Boolean).join(' ')}
      aria-labelledby="listing-featured-title"
    >
      <SectionHeader as="h2" title={t('ox.listing.featured_title')} titleId="listing-featured-title" />
      <ul className="ox-featured__row" role="list">
        {items.map((product) => {
          const cover = featuredCoverImage(product);
          return (
            <li key={product.id} className="ox-featured__item">
              <Link to={product.url} className="ox-featured__card">
                <span className="ox-featured__plate">
                  <Image
                    src={cover.url}
                    alt={cover.alt}
                    aspectRatio="1/1"
                    objectFit="contain"
                    srcSetWidths={RAIL_IMAGE_WIDTHS}
                    sizes={RAIL_IMAGE_SIZES}
                    className="ox-featured__img"
                  />
                </span>
                <span className="ox-featured__name">
                  <Bdi>{product.name}</Bdi>
                </span>
                <span className="ox-featured__price">
                  <Price amount={effectivePrice(product)} currency={product.currency} size="small" />
                </span>
                <span className="ox-featured__cta">
                  {t('ox.listing.featured_cta')}
                  <i
                    className="sicon-keyboard_arrow_left ox-mirror ox-iconbtn--angled"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default FeaturedRail;
