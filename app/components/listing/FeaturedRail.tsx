import { useRef, useState } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { effectivePrice } from '../product/lib/claims';
import { Bdi } from '../common/Bdi';
import { Price } from '../common/Price';
import { SectionHeader } from '../common/SectionHeader';
import { useReducedMotion } from '../common/hooks/useReducedMotion';

export interface FeaturedRailProps {
  /** The listing's own loaded products (the loader's first page). */
  products: Product[];
  className?: string;
}

/** Real rendered widths (owner item 2026-09-23: "cover images that are
 *  larger"): below 768 a cover is ~88% of the container, 768 up it is
 *  `(container - gap) / 2` up to the 1296 container cap, i.e. roughly 253 to
 *  642 CSS px across every probe width — see docs/build/progress/S4c.md for
 *  the measured heights this drives. */
const RAIL_IMAGE_WIDTHS = [320, 640, 980] as const;
const RAIL_IMAGE_SIZES = '(min-width: 768px) 46vw, 88vw';
/** The fallback picks the first 4 to 6 of the listing's own default sort. */
const FALLBACK_MAX = 6;
/** Exactly two covers fill the container from 768 up (owner item 2026-09-23);
 *  the prev/next pair steps by this many and hides once nothing is cut off. */
const VISIBLE_AT_DESKTOP = 2;

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
 * 2026-09-22, "New: S2d"; rebuilt into a cover carousel, owner item
 * 2026-09-23: "on each category section, add a carousel for cover images
 * that are larger... to showcase and emphasize featured products of each
 * category"): a scroll-snap carousel of the category's featured products,
 * each a large cover with its name, its price through `Price` and one link
 * to the product page.
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
 *
 * Carousel mechanics: `startIndex` is the first slide currently aligned to
 * the container's inline-start edge; the prev/next pair (`_b4-listing.scss`
 * section 15, rendered only at 1024 and up through `SectionHeader`'s own
 * `.ox-sh__actions` slot) steps it by `VISIBLE_AT_DESKTOP` and scrolls the
 * target slide into view with `scrollIntoView({ inline: 'start' })` rather
 * than a hand-computed `scrollLeft` delta, so the step is correct in both
 * reading directions without a manual RTL sign flip. The pair is absent
 * entirely once there is nothing left to reach (`items.length <=
 * VISIBLE_AT_DESKTOP`), which is the "hidden when everything fits" half of
 * the requirement; below 1024 touch/scroll-snap is the only way through the
 * rail, matching every other horizontal scroller in this theme.
 */
export function FeaturedRail({ products, className }: FeaturedRailProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  if (products.length < 2) return null;
  const items = featuredProducts(products);
  if (items.length === 0) return null;

  const maxStart = Math.max(0, items.length - VISIBLE_AT_DESKTOP);
  const showNav = items.length > VISIBLE_AT_DESKTOP;

  const goTo = (target: number) => {
    const clamped = Math.min(Math.max(target, 0), maxStart);
    setStartIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      className={['ox-featured', className].filter(Boolean).join(' ')}
      aria-labelledby="listing-featured-title"
    >
      <SectionHeader
        as="h2"
        title={t('ox.listing.featured_title')}
        titleId="listing-featured-title"
        actions={
          showNav ? (
            <div className="ox-featured__nav">
              <button
                type="button"
                className="ox-featured__arrow"
                onClick={() => goTo(startIndex - VISIBLE_AT_DESKTOP)}
                disabled={startIndex === 0}
                aria-label={t('ox.listing.featured_prev')}
              >
                <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ox-featured__arrow ox-featured__arrow--next"
                onClick={() => goTo(startIndex + VISIBLE_AT_DESKTOP)}
                disabled={startIndex >= maxStart}
                aria-label={t('ox.listing.featured_next')}
              >
                <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
              </button>
            </div>
          ) : undefined
        }
      />
      <ul
        className="ox-featured__row"
        role="list"
        aria-roledescription={t('ox.listing.featured_carousel_role')}
      >
        {items.map((product, index) => {
          const cover = featuredCoverImage(product);
          return (
            <li
              key={product.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="ox-featured__item"
              aria-roledescription={t('ox.listing.featured_slide_role')}
              aria-label={t('ox.listing.featured_slide_label', {
                index: index + 1,
                total: items.length,
              })}
            >
              <Link to={product.url} className="ox-featured__card">
                <span className="ox-featured__plate">
                  <Image
                    src={cover.url}
                    alt={cover.alt}
                    aspectRatio="3/2"
                    objectFit="contain"
                    priority={index < 2}
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
