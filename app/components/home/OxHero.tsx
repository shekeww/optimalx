import { useEffect, useRef, useState } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { useMediaQuery } from '../common/hooks/useMediaQuery';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The home hero (DIRECTION 5.2 OxHero, 4.5 hero polygons, 6.2 row 1, 8.1).
 *
 * The eyebrow is the page's h1 (C19 and DIRECTION 9.2): the keyword line has to
 * exist and be visible, and sitting above the display line keeps it from
 * reading as a keyword stuffed into a heading. The display line below it is a
 * paragraph, not a second heading.
 *
 * The photo panel and the orange stroke carry the 22 degree cut from the
 * `ox-wedge-*` mixins; on mobile the photo is full bleed behind a linear
 * gradient (never a blur, render budget rule 2) with the corner wedge at the
 * top end. Nothing here animates (amendment A9).
 *
 * The image is the LCP element: `priority` makes it eager with
 * `fetchpriority="high"` and `decoding="sync"`, and the explicit width and
 * height plus the band's own reserved height keep CLS at zero. With no upload
 * the panel is simply the graphite plate, never a broken image.
 */

/** An internal route goes through the engine Link; an anchor or an absolute URL does not. */
function linkProps(url: string): { to: string } | { href: string } {
  if (url.startsWith('#') || url.startsWith('http://') || url.startsWith('https://')) {
    return { href: url };
  }
  return { to: url.startsWith('/') ? url : `/${url}` };
}

/** True when the connection asks for less data (Chromium only; false elsewhere). */
function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) setSaveData(true);
  }, []);
  return saveData;
}

export function OxHero({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  const wide = useMediaQuery('(min-width: 1024px)');
  const reduced = useReducedMotion();
  const saveData = useSaveData();

  const image = fieldText(data, 'image');
  const mobileImage = fieldText(data, 'mobile_image');
  const videoUrl = fieldText(data, 'video_url');
  const eyebrow = fieldText(data, 'eyebrow') || t('ox.home.h1');
  const headline = fieldText(data, 'headline') || t('ox.home.hero_headline');
  const subline = fieldText(data, 'subline') || t('ox.home.hero_subline');
  const primaryLabel = fieldText(data, 'primary_label') || t('ox.home.hero_cta_primary');
  const primaryUrl = fieldText(data, 'primary_url') || '#ox-goals';
  const secondaryLabel = fieldText(data, 'secondary_label') || t('ox.home.hero_cta_secondary');
  const secondaryUrl = fieldText(data, 'secondary_url') || '/services';

  // DIRECTION 5.2 and 8.1: the loop is a desktop enhancement over the still,
  // and never runs for a visitor who asked for less motion or less data.
  const showVideo = Boolean(videoUrl) && wide && !reduced && !saveData;

  function toggleVideo() {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      void node.play();
      setPlaying(true);
    } else {
      node.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="ox-hero ox-band-dark" data-testid="ox-hero">
      <div className="ox-hero__panel">
        <div className="ox-hero__photo">
          {image ? (
            <Image
              src={image}
              {...(mobileImage ? { mobileSrc: mobileImage } : {})}
              alt=""
              width={835}
              height={560}
              srcSetWidths={[390, 780, 835, 1670]}
              sizes="(min-width: 1024px) 58vw, 100vw"
              objectFit="cover"
              priority={data.priority !== false}
              className="ox-hero__img"
              noWrapper
            />
          ) : null}
          {showVideo ? (
            <video
              ref={videoRef}
              className="ox-hero__video"
              src={videoUrl}
              {...(image ? { poster: image } : {})}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}
        </div>
        <span className="ox-hero__stroke" aria-hidden="true" />
        <span className="ox-hero__corner" aria-hidden="true" />
        {showVideo ? (
          <button
            type="button"
            className="ox-hero__videobtn"
            onClick={toggleVideo}
            aria-label={playing ? t('ox.home.hero_video_pause') : t('ox.home.hero_video_play')}
            data-testid="ox-hero-video-toggle"
          >
            <i
              className={playing ? 'sicon-pause' : 'sicon-play'}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <div className="ox-hero__inner ox-container">
        <div className="ox-hero__text">
          <h1 className="ox-hero__eyebrow ox-small">{eyebrow}</h1>
          <p className="ox-hero__headline ox-display">{headline}</p>
          <p className="ox-hero__sub ox-lead">{subline}</p>
          <div className="ox-hero__actions">
            <Button {...linkProps(primaryUrl)} variant="primary" size={48}>
              {primaryLabel}
            </Button>
            <Button {...linkProps(secondaryUrl)} variant="secondary" size={48}>
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
