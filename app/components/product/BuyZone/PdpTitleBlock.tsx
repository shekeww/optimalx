import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { RatingRow } from '../RatingRow';

export interface PdpTitleBlockProps {
  product: Product;
  /** The description's first prose paragraph, clamped to three lines. */
  lead?: string;
  /** True when the page has a reviews region for the count to link into. */
  hasReviews?: boolean;
}

/**
 * Brand line, title, Latin subtitle, rating row and the short description
 * (design region 18 to 20).
 *
 * Three of the five parts are gated, and the block is drawn so that it is
 * finished with any of them missing:
 *   B11  the brand line renders only on a real brand, and its slot collapses;
 *   B12  the subtitle renders only when the catalogue carries one;
 *   B1   the rating row renders only above zero reviews, which is why a new
 *        store sees the title sitting straight above its description.
 *
 * The column is `text-align: start`, not left: in Arabic that is the right
 * edge, and it is what lines the title up with the price and the buy button
 * below it.
 */
export function PdpTitleBlock({ product, lead, hasReviews = false }: PdpTitleBlockProps) {
  const brand = product.brand?.name;
  const subtitle = typeof product.subtitle === 'string' ? product.subtitle.trim() : '';

  return (
    <div className="ox-pdp__title-block">
      {brand ? (
        <p className="ox-pdp__brand">
          {product.brand?.url ? (
            <Link to={product.brand.url} className="ox-pdp__brand-link">
              <Bdi>{brand}</Bdi>
            </Link>
          ) : (
            <Bdi>{brand}</Bdi>
          )}
        </p>
      ) : null}

      <h1 className="ox-pdp__h1">
        <Bdi>{product.name}</Bdi>
      </h1>

      {subtitle ? (
        <p className="ox-pdp__subtitle">
          <Bdi>{subtitle}</Bdi>
        </p>
      ) : null}

      <RatingRow
        stars={product.rating?.stars ?? 0}
        count={product.rating?.count ?? 0}
        href={hasReviews ? '#ox-reviews' : undefined}
        className="ox-pdp__rating"
      />

      {lead ? <p className="ox-pdp__lead">{lead}</p> : null}
    </div>
  );
}
