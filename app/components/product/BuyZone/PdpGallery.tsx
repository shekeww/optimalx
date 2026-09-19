import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import type { ProductGalleryProps } from '@salla.sa/twilight-theme-engine/product';
import type { ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';

/**
 * The PDP gallery, registered over `product:gallery` (DIRECTION 5.4).
 *
 * The engine's own gallery is a `salla-slider type="thumbs"` with an `items`
 * slot and a `thumbs` slot (theme-engine chunk-UQRLBMIO.js:261-300); this
 * keeps that contract so the web component behaves identically, and changes
 * only what it looks like: every image sits contained on an `--ox-plate`
 * square, so the portrait sources in the catalogue (OX-002, OX-006, OX-014)
 * letterbox on the plate instead of being cropped.
 *
 * It never renders the engine `ProductGallery`: that component resolves this
 * same registry key and would recurse.
 */

/** 2x the largest slot: 358 on mobile, 560 on desktop (amendment A8). */
const GALLERY_WIDTHS = [400, 720, 1120] as const;
const GALLERY_SIZES = '(min-width: 1024px) 560px, 100vw';
const THUMB_WIDTHS = [128] as const;

function imagesOf(product: ProductGalleryProps['product']): ProductImage[] {
  if (product.images && product.images.length > 0) return product.images;
  return product.image?.url ? [product.image] : [];
}

function keyOf(image: ProductImage, index: number): string {
  return String(image.id ?? image.url ?? image.video_url ?? index);
}

export function PdpGallery({ product }: ProductGalleryProps) {
  const { t } = useTranslation();
  const images = imagesOf(product);
  const total = images.length;

  if (total === 0) {
    return <div className="ox-gallery ox-gallery--empty" aria-hidden="true" />;
  }

  return (
    <div className="ox-gallery">
      <SallaSlider
        id={'ox-gallery-' + product.id}
        className="ox-gallery__slider"
        type="thumbs"
        loop={false}
        autoHeight={false}
        listenToThumbnailsOption
        showThumbsControls={false}
        sliderConfig={{ watchOverflow: true }}
      >
        <div slot="items">
          {images.map((image, index) => (
            <div className="swiper-slide ox-gallery__slide" key={keyOf(image, index)}>
              <div className="ox-gallery__plate">
                <Image
                  src={image.url}
                  alt={image.alt || t('ox.pdp.gallery_image', { index: index + 1, total })}
                  aspectRatio="1/1"
                  objectFit="contain"
                  priority={index === 0}
                  noWrapper
                  srcSetWidths={GALLERY_WIDTHS}
                  sizes={GALLERY_SIZES}
                  className="ox-gallery__img"
                />
              </div>
            </div>
          ))}
        </div>
        {total > 1 ? (
          <div slot="thumbs">
            {images.map((image, index) => (
              <div className="ox-gallery__thumb" key={'t' + keyOf(image, index)}>
                <Image
                  src={image.url}
                  alt=""
                  aspectRatio="1/1"
                  objectFit="contain"
                  noWrapper
                  srcSetWidths={THUMB_WIDTHS}
                  sizes="64px"
                  className="ox-gallery__thumb-img"
                />
                {image.video_url ? (
                  <i className="sicon-play ox-gallery__play" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </SallaSlider>
      <div className="ox-gallery__share">
        <SallaSocialShare />
      </div>
    </div>
  );
}

export default PdpGallery;
