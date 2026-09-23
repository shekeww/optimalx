import { useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import type { ProductGalleryProps } from '@salla.sa/twilight-theme-engine/product';
import type { ProductImage } from '@salla.sa/twilight-theme-engine/types';
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
 *
 * NO WISHLIST HEART on the plate (owner review 2026-09-24, item 3, header
 * feature audit: "if anything can't be integrated in Shopify, delete it").
 * Shopify's storefront carries no native wishlist; decision table in
 * `docs/build/progress/S9a-V3.md`.
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

        {/* THE IMAGE ITSELF IS THE ZOOM CONTROL (S2f item 5, owner review
            2026-09-22): a real `<button>` wrapping the plate's photograph, so
            a tap or a click enlarges it directly, and Enter/Space do too for
            free — a native button needs no keydown handler of its own for
            either. The accessible name is the same `ox.pdp.zoom_label` the
            old dedicated button carried, so nothing here invents new copy;
            `ox.pdp.zoom` (that button's visible label) keeps its key even
            though nothing renders it now, so it is not a silent removal. */}
        <button
          type="button"
          className="ox-gallery__frame"
          onClick={() => setZoomed((value) => !value)}
          aria-pressed={zoomed}
          aria-label={t('ox.pdp.zoom_label')}
        >
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
        </button>

        {badge ? <p className="ox-gallery__badge">{badge}</p> : null}
      </div>
    </div>
  );
}

export default PdpGallery;
