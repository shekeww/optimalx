import { memo, useMemo } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ProductCardProps } from '@salla.sa/twilight-theme-engine/product';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { Badge, BadgeStack } from '../common/Badge';
import { Bdi } from '../common/Bdi';
import { Price } from '../common/Price';
import { PdpIcon } from './PdpIcon';
import { RatingRow } from './RatingRow';
import { parseSpecLine } from './lib/specLine';
import { specField, unitBearingWeight, PACK_SIZE_LABELS } from './lib/stats';
import { monthsUntilExpiry } from './lib/supply';
import { effectivePrice, isNewProduct, savingOf } from './lib/claims';

/**
 * OptimalX's product card, registered over the engine's `product:card` key so
 * every listing, slider and wishlist grid gets it (PLAN-final C1), rebuilt to
 * the approved design (region 42).
 *
 * It never renders the engine `ProductCard`: that component performs the
 * registry lookup itself, so calling it from here would recurse on every card.
 *
 * Every row keeps its height when its content is absent, which is what lets a
 * row of mixed products put every price on one baseline. The rating slot in
 * particular stays 20px tall at zero reviews (B28) instead of collapsing and
 * dragging the price up on one card out of five.
 */

/** 2x the widest slot the card ever occupies (171 at 390, 243 at 1440): A8. */
const CARD_IMAGE_WIDTHS = [150, 300, 500] as const;
const CARD_IMAGE_SIZES = '(min-width: 1024px) 211px, 45vw';
/** A hair space each side of the divider, so the line breathes without a gap. */
const DIVIDER =
  String.fromCharCode(0x200a) + String.fromCharCode(124) + String.fromCharCode(0x200a);

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
  const hoverImage = product.images?.find((image) => image.url && image.url !== product.image?.url);

  // Two facts, never more: the design gives the line one row, and a third fact
  // would push the title or the price out of its slot.
  const facts: string[] = [];
  // A list card carries no description, so the spec line is usually empty here
  // and the catalogue `weight` is all there is. It is a bare number with no
  // unit on this store, and a bare number on a card reads as a second price,
  // so it renders only when the merchant typed the unit in with it.
  const packSize = specField(spec, PACK_SIZE_LABELS) ?? unitBearingWeight(product.weight);
  if (packSize) facts.push(packSize);
  if (typeof spec?.servings === 'number') facts.push(t('ox.card.servings', { n: spec.servings }));
  else if (spec?.form) facts.push(spec.form);

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
            plus the wishlist and add controls. */}
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
        <button
          type="button"
          className={'ox-card-product__wish' + (inWishlist ? ' is-active' : '')}
          aria-label={t('ox.a11y.wishlist_toggle')}
          aria-pressed={inWishlist}
          onClick={() => wishlist.toggle(product.id)}
        >
          <i className="sicon-heart" aria-hidden="true" />
        </button>
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
        <p className="ox-card-product__chips">
          {facts.length > 0 ? <Bdi lang={null}>{facts.join(DIVIDER)}</Bdi> : null}
        </p>
        <div className="ox-card-product__rating">
          <RatingRow
            stars={product.rating?.stars ?? 0}
            count={product.rating?.count ?? 0}
            size={12}
          />
        </div>
        <div className="ox-card-product__price">
          <Price amount={price} size="card" currency={product.currency} />
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
 *
 * **The label tells the shopper which tap opens a chooser.** A product with
 * variants does not go into the cart on the tap: Salla's own button opens the
 * options modal instead, and a card that says "أضف إلى السلة" on both kinds
 * of product makes that modal a surprise. `has_options` comes straight from
 * the list payload, not from a second request (checked on the live catalogue
 * 2026-09-20: of the first twenty products it is true on exactly one, the
 * shaker, which is the one with colours), so the signal costs nothing and
 * takes no extra row on the card. A merchant who has typed their own
 * `add_to_cart_label` still wins: theirs is the more specific instruction.
 */
function AddButton({ product }: { product: Product }) {
  const { t } = useTranslation();
  const label =
    product.add_to_cart_label ?? t(product.has_options ? 'ox.card.choose_options' : 'ox.card.add');
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
      <PdpIcon name="cart" size={16} className="ox-card-product__add-icon" />
      {label}
    </SallaAddProductButton>
  );
}

export default OxProductCard;
