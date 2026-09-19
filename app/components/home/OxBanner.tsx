import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The optional campaign banner (DIRECTION 6.2 row 12).
 *
 * Off in the default composition and `is_default: false` in the manifest: with
 * no image it renders nothing at all, which is why its row reserves 0 on both
 * viewports. Straight edges, no wedge, no overlay text on the image itself, and
 * one link. A banner with a line but no destination is still a banner, so the
 * link is optional too.
 */
export function OxBanner({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const image = fieldText(data, 'image');
  const url = fieldText(data, 'url');
  const line = fieldText(data, 'line');

  if (!image && !line) return null;

  const media = image ? (
    <Image
      src={image}
      alt=""
      width={1280}
      height={240}
      srcSetWidths={[390, 780, 1280, 2560]}
      sizes="(min-width: 1024px) 1280px, 100vw"
      objectFit="cover"
      className="ox-banner__img"
      noWrapper
    />
  ) : null;

  const body = (
    <>
      {media ? <span className="ox-banner__media">{media}</span> : null}
      {line ? (
        <span className="ox-banner__line ox-h3">
          {line}
          <i className="sicon-keyboard_arrow_right ox-banner__chevron ox-mirror" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  if (!url) {
    return (
      <section className="ox-banner" data-testid="ox-banner">
        <div className="ox-container">
          <div className="ox-banner__inner">{body}</div>
        </div>
      </section>
    );
  }

  const external = url.startsWith('http://') || url.startsWith('https://');
  return (
    <section className="ox-banner" aria-label={line || t('ox.common.learn_more')} data-testid="ox-banner">
      <div className="ox-container">
        {external ? (
          <a className="ox-banner__inner" href={url} target="_blank" rel="noopener noreferrer">
            {body}
          </a>
        ) : (
          <Link className="ox-banner__inner" to={url.startsWith('/') ? url : `/${url}`}>
            {body}
          </Link>
        )}
      </div>
    </section>
  );
}
