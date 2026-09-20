import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The campaign band (homepage-spec section 6).
 *
 * **Absent by default, and the page closes correctly without it.** The block
 * is in the default composition and renders `null` until the merchant gives
 * it a line or an image, its reserved height is 0 on both viewports, and the
 * section above it and the footer below it carry their own spacing. A
 * campaign band with no campaign in it is a claim that there is one.
 *
 * When there is one, it is the reference's dark full-width band rather than
 * the flat plate strip this block used to draw: the wedge pair at the band's
 * start corner, the campaign line set as the page's statement, the product
 * photograph at the end side, and one action. The photograph is the
 * merchant's upload and goes through the engine `Image` so the CDN resizes
 * it; `docs/build/image-brief.md` section 12 writes the frame for it
 * (`campaign-band.jpg`, product left of centre, right half dark) so the copy
 * lands on empty pixels.
 *
 * No discount medallion. The reference draws one reading "up to 40%", which
 * is a number no field on this block carries and no store data can supply. A
 * merchant running a real campaign puts the figure in their own artwork, or
 * in the line, where they are the one asserting it.
 */
export function OxBanner({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const image = fieldText(data, 'image');
  const url = fieldText(data, 'url');
  const line = fieldText(data, 'line');

  if (!image && !line) return null;

  const body = (
    <>
      <span className="ox-band__wedge ox-campaign__wedge ox-campaign__wedge--wide" aria-hidden="true" />
      <span className="ox-band__wedge ox-campaign__wedge ox-campaign__wedge--thin" aria-hidden="true" />
      {image ? (
        <span className="ox-campaign__media">
          <Image
            src={image}
            alt=""
            width={1280}
            height={320}
            srcSetWidths={[390, 780, 1280, 2560]}
            sizes="(min-width: 1024px) 1280px, 100vw"
            objectFit="cover"
            className="ox-campaign__img"
            noWrapper
          />
          <span className="ox-campaign__scrim" aria-hidden="true" />
        </span>
      ) : null}
      {line ? (
        <span className="ox-campaign__text">
          <span className="ox-campaign__line ox-h2">{line}</span>
          {url ? (
            <span className="ox-campaign__cta ox-cta-wedge">
              <span className="ox-campaign__cta-label">{t('ox.home.shop_now')}</span>
              <i className="sicon-keyboard_arrow_right ox-mirror" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  if (!url) {
    return (
      <section className="ox-campaign" data-testid="ox-banner">
        <div className="ox-container">
          <div className="ox-campaign__inner ox-band-dark">{body}</div>
        </div>
      </section>
    );
  }

  const external = url.startsWith('http://') || url.startsWith('https://');
  return (
    <section
      className="ox-campaign"
      aria-label={line || t('ox.common.learn_more')}
      data-testid="ox-banner"
    >
      <div className="ox-container">
        {external ? (
          <a className="ox-campaign__inner ox-band-dark" href={url} target="_blank" rel="noopener noreferrer">
            {body}
          </a>
        ) : (
          <Link className="ox-campaign__inner ox-band-dark" to={url.startsWith('/') ? url : `/${url}`}>
            {body}
          </Link>
        )}
      </div>
    </section>
  );
}
