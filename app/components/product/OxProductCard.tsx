import { memo, useMemo } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ProductCardProps } from '@salla.sa/twilight-theme-engine/product';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { Badge, BadgeStack } from '../common/Badge';
import { Bdi } from '../common/Bdi';
import { Chip } from '../common/Chip';
import { Price } from '../common/Price';
import { parseSpecLine } from './lib/specLine';
import { monthsUntilExpiry } from './lib/supply';
import { effectivePrice, isNewProduct, savingOf } from './lib/claims';

/**
 * OptimalX's product card, registered over the engine's `product:card` key so
 * every listing, slider and wishlist grid gets it (PLAN-final C1).
 *
 * It never renders the engine `ProductCard`: that component performs the
 * registry lookup itself (theme-engine chunk-UQRLBMIO.js:219-231), so calling
 * it from here would recurse on every card. Anatomy and states are DIRECTION
 * 5.3: fixed-height rows so a grid of cards never shifts, badges only from
 * real product flags, and no rating row content when the count is zero.
 */

/** 2x the widest slot the card ever occupies (171 at 390, 296 at 1440): A8. */
const CARD_IMAGE_WIDTHS = [150, 300, 600] as const;
const CARD_IMAGE_SIZES = '(min-width: 1024px) 296px, 45vw';

export const OxProductCard = memo(function OxProductCard({
  product,
  layout = 'vertical',
  className,
  withoutAddButton = false,
  index = 0,
  imagePriority = false,
  sizes,
}: ProductCardProps) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const spec = useMemo(() => parseSpecLine(product.description), [product.description]);

  const inWishlist = wishlist.has(product.id);
  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const saving = savingOf(product);
  const price = effectivePrice(product);
  const expiryMonths = monthsUntilExpiry(spec?.expiry);
  const ratingCount = product.rating?.count ?? 0;
  const hoverImage = product.images?.find((image) => image.url && image.url !== product.image?.url);

  const classes = [
    'ox-card-product',
    'ox-card-product--' + layout,
    outOfStock ? 'is-out' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes} data-ox-product={product.id}>
      <div className="ox-card-product__plate">
        {/* The plate is not a second link: the card has exactly one tab stop
            for navigation (the title link, stretched over the card by CSS),
            plus the wishlist and add buttons. */}
        <Image
          src={product.image?.url}
          alt={product.image?.alt ?? product.name}
          aspectRatio="1/1"
          objectFit="contain"
          priority={imagePriority || index < 2}
          srcSetWidths={CARD_IMAGE_WIDTHS}
          sizes={sizes ?? CARD_IMAGE_SIZES}
          className="ox-card-product__img"
        />
        {hoverImage ? (
          <Image
            src={hoverImage.url}
            alt=""
            aspectRatio="1/1"
            objectFit="contain"
            srcSetWidths={CARD_IMAGE_WIDTHS}
            sizes={sizes ?? CARD_IMAGE_SIZES}
            className="ox-card-product__img ox-card-product__img--hover"
          />
        ) : null}
        <BadgeStack className="ox-card-product__badges">
          {outOfStock ? <Badge tone="stop">{t('ox.card.out_of_stock')}</Badge> : null}
          {!outOfStock && saving !== null ? (
            <Badge tone="saving">
              {t('ox.pdp.save_label')} <Price amount={saving} go currency={product.currency} />
            </Badge>
          ) : null}
          {!outOfStock && saving === null && isNewProduct(product) ? (
            <Badge tone="new">{t('ox.common.new')}</Badge>
          ) : null}
          {expiryMonths !== null && expiryMonths >= 0 && expiryMonths < 6 && spec?.expiry ? (
            <Badge tone="note">{t('ox.card.expiry', { date: spec.expiry })}</Badge>
          ) : null}
        </BadgeStack>
        <SallaButton
          shape="icon"
          fill="none"
          className={
            'ox-card-product__wish' + (inWishlist ? ' is-active' : '')
          }
          ariaLabel={t('ox.a11y.wishlist_toggle')}
          aria-pressed={inWishlist}
          onClick={() => wishlist.toggle(product.id)}
        >
          <i className="sicon-heart" aria-hidden="true" />
        </SallaButton>
      </div>

      <div className="ox-card-product__body">
        <p className="ox-card-product__brand">
          {product.brand?.name ? <Bdi>{product.brand.name}</Bdi> : null}
        </p>
        <h3 className="ox-card-product__name">
          <Link to={product.url} className="ox-card-product__title-link">
            <Bdi>{product.name}</Bdi>
          </Link>
        </h3>
        <div className="ox-card-product__chips">
          {spec?.servings !== null && spec?.servings !== undefined ? (
            <Chip icon="servings">{t('ox.card.servings', { n: spec.servings })}</Chip>
          ) : null}
          {spec?.form ? <Chip icon="form">{spec.form}</Chip> : null}
        </div>
        <div className="ox-card-product__rating">
          {ratingCount > 0 ? (
            <>
              <SallaRatingStars value={product.rating?.stars ?? 0} size="small" />
              <span className="ox-card-product__rating-count">
                {t('ox.pdp.rating_count', { count: ratingCount })}
              </span>
            </>
          ) : null}
        </div>
        <div className="ox-card-product__price">
          <Price amount={price} currency={product.currency} />
          {product.is_on_sale ? (
            <>
              <span className="ox-sr-only">{t('ox.pdp.was_price_label')}</span>
              <Price amount={product.regular_price} currency={product.currency} was />
            </>
          ) : null}
        </div>
        {withoutAddButton ? null : (
          <div className="ox-card-product__action">
            <AddButton product={product} />
          </div>
        )}
      </div>
    </article>
  );
});

/**
 * The engine's add button: it owns the whole cart path (options modal, quick
 * buy, notify-me when the status is out-and-notify). We only size and colour
 * it. Never reimplement cart logic (BUILD.md, CLAUDE.md).
 */
function AddButton({ product }: { product: Product }) {
  const { t } = useTranslation();
  return (
    <SallaAddProductButton
      productId={product.id}
      productType={product.type}
      productStatus={product.status}
      width="wide"
      fill="solid"
      loaderPosition="center"
      className="ox-card-product__add"
    >
      {product.add_to_cart_label ?? t('ox.card.add')}
    </SallaAddProductButton>
  );
}

export default OxProductCard;
