import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Poster, type PosterGlyph } from './Poster';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The campaign poster (homepage-scale-spec section 5).
 *
 * This is the page's loudest band after the hero: full bleed at 100vw, 480 at
 * 1280 and 560 from 1440, a photograph with the headline and the product
 * inside the image, an accent rule under the subline, and a row of outline
 * glyphs along the floor.
 *
 * **It is gated on a real campaign and it is absent by default.** The block
 * ships in the composition, reserves 0 height on both viewports, and renders
 * `null` until the merchant writes a headline. A campaign band with no
 * campaign in it is a claim that there is one, and the page is designed to
 * close correctly without it: the grid above it and the goal row below it
 * both carry their own separation, so nothing collapses and nothing is left
 * hanging when it does not render.
 *
 * What is NOT in it, and none of these is an oversight:
 *
 * - No discount medallion and no percentage. The reference draws "up to 40%",
 *   which is a figure no field here carries and no store datum can supply. A
 *   merchant running a real campaign puts it in their own line or their own
 *   artwork, where they are the one asserting it.
 * - No delivery promise, no rating, no review count, no bestseller.
 * - The glyph row states facts the claims source already allows: the printed
 *   servings, the printed serving size, the expiry date, and the offer to
 *   explain before selling. Not one of them is a benefit.
 *
 * `poster-creatine.webp` is the shipped default frame, so a merchant who
 * writes a line gets the composed band immediately without uploading
 * anything. It is the owner's own file at 2400x1610 and its subject sits
 * clear of the reading start, which is where the copy lands.
 */

/** The owner's file. Only used once the merchant has written a campaign line. */
export const DEFAULT_POSTER = '/assets/images/poster-creatine.webp';
export const DEFAULT_POSTER_W = 2400;
export const DEFAULT_POSTER_H = 1610;

export function OxPoster({ data }: OxBlockProps) {
  const { t } = useTranslation();

  const headline = fieldText(data, 'headline');
  // The headline is the gate, not the image: an uploaded photograph with no
  // words on it is decoration, and a band of decoration is the compression
  // this rebuild exists to remove.
  if (!headline) return null;

  const image = fieldText(data, 'image') || DEFAULT_POSTER;
  const eyebrow = fieldText(data, 'eyebrow');
  const line = fieldText(data, 'line');
  const url = fieldText(data, 'url');
  const ctaLabel = fieldText(data, 'cta_label') || t('ox.home.shop_now');

  const glyphs: PosterGlyph[] = [
    { icon: 'servings', label: t('ox.home.poster_fact_servings') },
    { icon: 'serving-size', label: t('ox.home.poster_fact_size') },
    { icon: 'expiry', label: t('ox.home.poster_fact_expiry') },
    { icon: 'written-question', label: t('ox.home.poster_fact_ask') },
  ];

  return (
    <section className="ox-poster-block" data-testid="ox-poster-block">
      <Poster
        id="campaign"
        photo={image}
        // A merchant upload has no intrinsic size we can know here, so both
        // cases declare the default frame's ratio and `object-fit: cover`
        // does the rest. The band's own height is what reserves the box.
        photoWidth={DEFAULT_POSTER_W}
        photoHeight={DEFAULT_POSTER_H}
        {...(eyebrow ? { eyebrow } : {})}
        headline={headline}
        {...(line ? { line } : {})}
        {...(url ? { cta: { label: ctaLabel, to: url } } : {})}
        glyphs={glyphs}
      />
    </section>
  );
}
