import { useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import type { ProductGalleryProps } from '@salla.sa/twilight-theme-engine/product';
import type { ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { Icon } from '../../common/Icon';
import { PdpThumbRail } from './PdpThumbRail';
import { promotionLabel } from '../lib/claims';

/**
 * The PDP gallery, registered over `product:gallery` (DIRECTION 5.4), rebuilt
 * to the approved design (regions 14 to 17).
 *
 * Two columns: a 64 wide thumbnail rail at the inline start and the plate. The
 * plate is the warm `--ox-plate` surface every product image in this store
 * sits on, which is what makes a grid of mixed supplier photography read as
 * one shop. The diagonal band and the accent parallelogram behind the image
 * are the brand's wedge motif at the same 22 degrees as the rest of the theme.
 *
 * It no longer wraps `salla-slider`: this is the theme's own markup, the
 * design needs a vertical rail with its own controls, and the slider's thumbs
 * slot cannot carry one. Nothing about cart, checkout or search moves; only
 * the picture does.
 *
 * Zoom is a transform on the image, never a colour change and never a filter,
 * and it is a real button with `aria-pressed` rather than a hover affordance
 * that a touch device could not reach.
 */

/** 2x the largest drawn slot: 358 at 390, 580 at 1440. */
const GALLERY_WIDTHS = [400, 760, 1160] as const;
const GALLERY_SIZES = '(min-width: 1024px) 580px, 100vw';

function imagesOf(product: ProductGalleryProps['product']): ProductImage[] {
  if (product.images && product.images.length > 0) return product.images;
  return product.image?.url ? [product.image] : [];
}

export function PdpGallery({ product }: ProductGalleryProps) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const images = imagesOf(product);
  const total = images.length;

  if (total === 0) {
    return <div className="ox-gallery ox-gallery--empty" aria-hidden="true" />;
  }

  const index = Math.min(active, total - 1);
  const image = images[index];
  const badge = promotionLabel(product);
  const inWishlist = wishlist.has(product.id);

  return (
    <div className={'ox-gallery' + (total > 1 ? ' ox-gallery--railed' : '')}>
      {total > 1 ? (
        <PdpThumbRail
          images={images}
          activeIndex={index}
          onSelect={(next) => {
            setActive(next);
            setZoomed(false);
          }}
        />
      ) : null}

      <div className="ox-gallery__plate">
        <span className="ox-gallery__band" aria-hidden="true" />
        <span className="ox-gallery__mark" aria-hidden="true" />
        <Image
          key={image.url}
          src={image.url}
          alt={image.alt || t('ox.pdp.gallery_image', { index: index + 1, total })}
          aspectRatio="1/1"
          objectFit="contain"
          priority={index === 0}
          noWrapper
          srcSetWidths={GALLERY_WIDTHS}
          sizes={GALLERY_SIZES}
          className={'ox-gallery__img' + (zoomed ? ' is-zoomed' : '')}
        />

        {badge ? <p className="ox-gallery__badge">{badge}</p> : null}

        <button
          type="button"
          className={'ox-gallery__wish' + (inWishlist ? ' is-active' : '')}
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={inWishlist}
          aria-label={t('ox.a11y.wishlist_toggle')}
        >
          <i className="sicon-heart" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="ox-gallery__zoom"
          onClick={() => setZoomed((value) => !value)}
          aria-pressed={zoomed}
          aria-label={t('ox.pdp.zoom_label')}
        >
          <span className="ox-gallery__zoom-label">{t('ox.pdp.zoom')}</span>
          <Icon name="expand" size={16} />
        </button>
      </div>
    </div>
  );
}

export default PdpGallery;
