import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { BRANCH } from '../../content/branch';
import { STORE_PHOTOS, storePhotoSrcSet, type StorePhotoSlug } from '../../content/store-photos';

export interface BranchGalleryProps {
  className?: string;
}

/** The four gallery photos, largest-first order kept out of `STORE_PHOTOS`
 *  itself: `store-wide` is `OxBranch`'s own panel, never repeated here. */
const GALLERY_ITEMS: ReadonlyArray<{ slug: StorePhotoSlug; captionKey: string }> = [
  { slug: 'storefront', captionKey: BRANCH.gallery.storefrontCaptionKey },
  { slug: 'shelves', captionKey: BRANCH.gallery.shelvesCaptionKey },
  { slug: 'advisory-room', captionKey: BRANCH.gallery.advisoryCaptionKey },
  { slug: 'waiting-area', captionKey: BRANCH.gallery.waitingCaptionKey },
];

/**
 * The four other branch photographs on `/branch` (VISIT-2026-09-24 §4.4 item
 * 2): a two-up grid from 640px, a scroll-snap rail below it (the shared
 * `.ox-rail` primitive is built for the carousel's chevron cue and progress
 * strap, machinery four static tiles do not need, so this draws the plain
 * fallback the direction names explicitly).
 *
 * Every `<figure>` is a plain `<img>` plus a visible `<figcaption>` below it
 * (never over it, VISIT §4.4: "a caption never overlays the photo"), so the
 * image itself carries an empty `alt` — the figcaption is the accessible
 * label, the same relationship a native `<figure>` gives assistive tech for
 * free. `srcset` is built only from the manifest's own `widths`
 * (`store-photos.ts`), never a slot width table of this component's own, so
 * the 415px-wide `storefront` file is served sharp rather than blurred up.
 *
 * Sharp corners throughout; the first tile alone carries the mark's own
 * corner cut (`ox-x-corner`, `_x-motif.scss`), scoped to the photo frame so
 * the caption underneath it is never clipped.
 */
export function BranchGallery({ className }: BranchGalleryProps) {
  const { t } = useTranslation();

  return (
    <section
      className={['ox-branch-gallery', className].filter(Boolean).join(' ')}
      aria-label={t(BRANCH.gallery.labelKey)}
      data-testid="ox-branch-gallery"
    >
      <ul className="ox-branch-gallery__list">
        {GALLERY_ITEMS.map(({ slug, captionKey }, index) => {
          const photo = STORE_PHOTOS[slug];
          return (
            <li
              key={slug}
              className={[
                'ox-branch-gallery__item',
                index === 0 ? 'ox-branch-gallery__item--cut' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <figure className="ox-branch-gallery__figure">
                <img
                  className="ox-branch-gallery__photo"
                  src={photo.photo}
                  srcSet={storePhotoSrcSet(photo)}
                  sizes="(min-width: 640px) 45vw, 78vw"
                  width={photo.width}
                  height={photo.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="ox-branch-gallery__caption ox-small">
                  {t(captionKey)}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default BranchGallery;
