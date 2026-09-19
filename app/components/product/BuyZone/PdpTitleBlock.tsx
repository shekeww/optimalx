import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { Badge, BadgeStack } from '../../common/Badge';
import { Bdi } from '../../common/Bdi';
import { Price } from '../../common/Price';
import { claimsOfficialDistributors, savingOf, type Settings } from '../lib/claims';
import { monthsUntilExpiry } from '../lib/supply';

export interface PdpTitleBlockProps {
  product: Product;
  /** Expiry as YYYY-MM from the spec line, for the near-expiry note. */
  expiry?: string | null;
  settings?: Settings;
}

/**
 * Brand line, h1, rating row and badge row (DIRECTION 5.4 PdpTitleBlock).
 *
 * The rating row is removed entirely when the count is zero rather than drawn
 * empty: a new store shows no stars at all, and no rating is ever invented.
 * "موزعون رسميون" is behind `claim_official_distributors` (PLAN-final 5.1).
 */
export function PdpTitleBlock({ product, expiry, settings }: PdpTitleBlockProps) {
  const { t } = useTranslation();
  const ratingCount = product.rating?.count ?? 0;
  const saving = savingOf(product);
  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const expiryMonths = monthsUntilExpiry(expiry);
  const nearExpiry = expiryMonths !== null && expiryMonths >= 0 && expiryMonths < 6;

  return (
    <div className="ox-pdp__title-block">
      <p className="ox-pdp__brand">
        {product.brand?.name ? (
          product.brand.url ? (
            <Link to={product.brand.url} className="ox-pdp__brand-link">
              <Bdi>{product.brand.name}</Bdi>
            </Link>
          ) : (
            <Bdi>{product.brand.name}</Bdi>
          )
        ) : null}
      </p>
      <h1 className="ox-pdp__h1 ox-h1">
        <Bdi>{product.name}</Bdi>
      </h1>
      {ratingCount > 0 ? (
        <p className="ox-pdp__rating">
          <SallaRatingStars value={product.rating?.stars ?? 0} />
          <a href="#ox-reviews" className="ox-pdp__rating-link">
            {t('ox.pdp.rating_count', { count: ratingCount })}
          </a>
        </p>
      ) : null}
      <BadgeStack className="ox-pdp__badges">
        {outOfStock ? <Badge tone="stop">{t('ox.card.out_of_stock')}</Badge> : null}
        {!outOfStock && saving !== null ? (
          <Badge tone="saving">
            {t('ox.pdp.save_label')} <Price amount={saving} go currency={product.currency} />
          </Badge>
        ) : null}
        {nearExpiry && expiry ? (
          <Badge tone="note">{t('ox.card.expiry', { date: expiry })}</Badge>
        ) : null}
        {claimsOfficialDistributors(settings) ? (
          <Badge tone="neutral">{t('ox.pdp.official_distributors')}</Badge>
        ) : null}
      </BadgeStack>
    </div>
  );
}
