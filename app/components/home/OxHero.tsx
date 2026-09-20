import { useEffect, useRef, useState } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { useMediaQuery } from '../common/hooks/useMediaQuery';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The home hero, built to the owner's reference (homepage-spec section 1).
 *
 * The band is one full-bleed dark photograph, not a wedge panel beside a
 * column: the reference's subject stands right of centre and the whole left
 * half of the frame is deliberately empty, which is what the copy sits on.
 * `docs/build/image-brief.md` section 1 writes that composition into the
 * prompt, so the layout and the photograph are one decision.
 *
 * **Why this band reasons in physical sides.** Everywhere else in the theme a
 * side is logical, because a side belongs to the reading direction. Here it
 * belongs to the photograph: the quiet pixels are on the left of the file in
 * every locale, so the copy is on the left in every locale and the wedge pair
 * is at the left edge in every locale. The text inside the block is still
 * logically aligned (`start`, so right in Arabic and left in English), which
 * is what the reference shows. The flip is written as a `[dir='ltr']`
 * override, the same shape the wedge mixins use, so no physical property is
 * spelled out.
 *
 * The headline is the page's h1 and it is three parts: two lines and a closing
 * word in the accent. It is the only accent-coloured type on the first screen.
 * `ox.home.h1`, the keyword line, is no longer drawn as an eyebrow above it
 * (the reference has none and it read as a line of meta above the statement);
 * it stays the route's fallback h1 for a composition with no hero block, and
 * the engine head still carries it as the title.
 *
 * Nothing here animates in. The photograph is the LCP element: `priority`
 * makes it eager with `fetchpriority="high"` and `decoding="sync"`, the
 * explicit width and height plus the band's reserved height keep CLS at zero,
 * and a reveal on the first screen would delay exactly the pixels that are
 * being measured.
 */

/**
 * The shipped hero. Two crops, because the desktop frame is a wide cinematic
 * band and the phone frame is a vertical one with its subject in the lower two
 * thirds (image brief sections 1 and 2).
 */
export const DEFAULT_HERO = '/assets/images/hero-home.jpg';
export const DEFAULT_HERO_MOBILE = '/assets/images/hero-home-mobile.jpg';

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
  const headline = fieldText(data, 'headline');
  const subline = fieldText(data, 'subline');
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
              width={1440}
              height={560}
              srcSetWidths={[390, 780, 1440, 2560]}
              sizes="100vw"
              objectFit="cover"
              priority={data.priority !== false}
              className="ox-hero__img"
              noWrapper
            />
          ) : (
            <picture>
              <source media="(min-width: 640px)" srcSet={DEFAULT_HERO} />
              <img
                className="ox-hero__img"
                src={DEFAULT_HERO_MOBILE}
                alt=""
                width={780}
                height={1040}
                decoding="sync"
                loading="eager"
                fetchPriority="high"
                data-testid="ox-hero-default-photo"
              />
            </picture>
          )}
          {showVideo ? (
            <video
              ref={videoRef}
              className="ox-hero__video"
              src={videoUrl}
              poster={image || DEFAULT_HERO}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}
        </div>
        {/* One flat gradient over the whole frame, never a blur (render budget
            rule 2). It is what keeps white type legible on a photograph the
            store has not shot yet as well as on the one it has. */}
        <span className="ox-hero__scrim" aria-hidden="true" />
        {/* The wedge pair at the band's left edge: the reference's one piece of
            brand geometry on the first screen, and the whole wedge budget for
            it (DIRECTION 4.5, amendment A9: neither bar ever moves). */}
        <span className="ox-band__wedge ox-hero__wedge ox-hero__wedge--wide" aria-hidden="true" />
        <span className="ox-band__wedge ox-hero__wedge ox-hero__wedge--thin" aria-hidden="true" />
        {showVideo ? (
          <button
            type="button"
            className="ox-hero__videobtn"
            onClick={toggleVideo}
            aria-label={playing ? t('ox.home.hero_video_pause') : t('ox.home.hero_video_play')}
            data-testid="ox-hero-video-toggle"
          >
            <i className={playing ? 'sicon-pause' : 'sicon-play'} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="ox-hero__inner ox-container">
        <div className="ox-hero__text">
          <h1 className="ox-hero__headline ox-display">
            {headline ? (
              headline
            ) : (
              <>
                <span className="ox-hero__line">{t('ox.home.hero_line_1')}</span>{' '}
                <span className="ox-hero__line">
                  {t('ox.home.hero_line_2')}{' '}
                  <span className="ox-hero__accent">{t('ox.home.hero_accent')}</span>
                </span>
              </>
            )}
          </h1>
          {/* The reference sets a light Latin line under the headline. A
              merchant subline replaces it, because a store that writes its own
              second line means it rather than the lockup. */}
          {subline ? (
            <p className="ox-hero__sub ox-lead">{subline}</p>
          ) : (
            <p className="ox-hero__latin ox-latin">{t('ox.home.hero_latin')}</p>
          )}
          <div className="ox-hero__actions">
            <Button
              {...linkProps(primaryUrl)}
              variant="primary"
              size={48}
              className="ox-cta-wedge"
              iconEnd={
                <i className="sicon-keyboard_arrow_right ox-mirror" aria-hidden="true" />
              }
            >
              {primaryLabel}
            </Button>
            <Button
              {...linkProps(secondaryUrl)}
              variant="secondary"
              size={48}
              className="ox-cta-pill"
            >
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
