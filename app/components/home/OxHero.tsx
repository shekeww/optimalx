import { useEffect, useRef, useState } from 'react';
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
// THE CREATINE FRAME, the owner's own commercial: their branded shaker beside
// the product, shot in a gym, with the mark on both the vest and the bottle. It
// leads because it is the LCP element and the first thing a visitor sees should
// say whose shop this is; the frames that follow are texture.
//
// IT IS USED AS PHOTOGRAPHY, NOT AS ARTWORK, and that is a real trade rather
// than an oversight. The file carries an Arabic headline and four benefit rows
// burnt into its right third. The split hero gives the photo half 856x560 at
// 1440 and the source is 1915x821, so `object-fit: cover` scales to the height
// and throws away 225px from each side: the burnt-in type sits outside the
// visible window and never renders. Measured, not assumed.
//
// The upside is that nothing collides — the hero lays its own headline in the
// OTHER half (copy starts at x=847, the photo ends at x=856) so there is no
// second headline in the same corner. The cost is that the artwork's message is
// lost. A frame whose type must be read belongs in a full-bleed band, where the
// whole composition survives, not in this hero's photo half.
export const DEFAULT_HERO = '/assets/images/hero-creatine.webp';
export const DEFAULT_HERO_MOBILE = '/assets/images/hero-shakers-mobile.webp';

/**
 * The frames the photo half cycles through when the merchant has not set its
 * own. Only the store's own photography, never a supplier's packaging shot.
 *
 * Order matters and is not arbitrary: the branded frame is first because the
 * split shows the photograph undimmed now, so a dark frame leaves that half of
 * the band looking empty rather than photographic.
 */
export const DEFAULT_HERO_SLIDES = [
  DEFAULT_HERO,
  '/assets/images/hero-shakers.webp',
  '/assets/images/hero-home.jpg',
  '/assets/images/hero-athlete.webp',
];
// `athlete-band.jpg` (539x569) and `nutrition-band.jpg` (784x568) used to be
// here and are not any more. The photo half is about 826x560 at 1440, so both
// were being scaled UP into it: that is what "too zoomed in and very low
// quality" was. Every frame here is now at least 1600 wide, and each is
// cropped near the region's own 1.47 ratio so `object-fit: cover` throws away
// as little of the subject as possible. Both small files are still used at the
// sizes they are good for, behind goal cards.

/** How long a frame holds before it slides. */
export const SLIDE_MS = 5500;

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
  const image2 = fieldText(data, 'image_2');
  const image3 = fieldText(data, 'image_3');
  const mobileImage = fieldText(data, 'mobile_image');
  const videoUrl = fieldText(data, 'video_url');
  const headline = fieldText(data, 'headline');
  const subline = fieldText(data, 'subline');
  const eyebrow = fieldText(data, 'eyebrow');
  const primaryLabel = fieldText(data, 'primary_label') || t('ox.home.hero_cta_primary');
  const primaryUrl = fieldText(data, 'primary_url') || '#ox-goals';
  const secondaryLabel = fieldText(data, 'secondary_label') || t('ox.home.hero_cta_secondary');
  const secondaryUrl = fieldText(data, 'secondary_url') || '/services';

  // DIRECTION 5.2 and 8.1: the loop is a desktop enhancement over the still,
  // and never runs for a visitor who asked for less motion or less data.
  const showVideo = Boolean(videoUrl) && wide && !reduced && !saveData;

  // The frames. A merchant who sets only `image` gets exactly what they set
  // and no slideshow: one photograph is not a carousel, and rotating their
  // single frame against two of ours would be us overriding their choice.
  const merchantSlides = [image, image2, image3].filter(Boolean);
  const slides = merchantSlides.length > 0 ? merchantSlides : DEFAULT_HERO_SLIDES;

  // The portrait crop for the first frame: the merchant's if they set one,
  // ours when the slideshow is running on the theme's own photography.
  const mobileFirst = image ? mobileImage : merchantSlides.length > 0 ? '' : DEFAULT_HERO_MOBILE;

  const [slide, setSlide] = useState(0);
  const [held, setHeld] = useState(false);

  // Autoplay is off entirely for a visitor who asked for less motion, for one
  // who asked for less data, while the pointer or the keyboard is inside the
  // panel, and whenever the video branch is showing. A single frame never
  // animates. WCAG 2.2.2 wants auto-updating content to be stoppable: the
  // dots stop it for good, and hover or focus pauses it meanwhile.
  const animating = slides.length > 1 && !reduced && !saveData && !showVideo && !held;

  useEffect(() => {
    if (!animating) return;
    const id = setInterval(() => setSlide((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [animating, slides.length]);

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
      <div
        className="ox-hero__panel"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        <div className="ox-hero__photo" data-slides={slides.length}>
          {/*
            A TRACK, not a crossfade. The frames sit side by side and the whole
            row slides, which is the motion the owner asked for and is one
            compositor transform rather than N opacity animations. The track is
            forced to `ltr` because these are photographs: their order is not
            reading order, and letting it flip with the document would make the
            slide run backwards in Arabic.

            `--ox-hero-i` is the only thing React changes, so the server's HTML
            already shows frame 0 at translate 0 and the hero is complete with
            scripting off.
          */}
          <div className="ox-hero__track" style={{ ['--ox-hero-i' as string]: String(slide) }}>
          {/*
            Every frame is in the server's HTML with only the first visible,
            so the hero paints before any script runs and nothing shifts when
            one does. The first is eager and high priority because it is the
            LCP element; the rest are lazy and must never compete with it.
            The crossfade is opacity alone, which stays on the compositor.
          */}
          {slides.map((src, i) => {
            // Art direction survives the slideshow. The first frame is the one
            // a phone actually sees before anything rotates, so it keeps its
            // portrait crop: a 1440x560 landscape letterboxed into a tall
            // mobile band wastes most of the screen on empty floor. Later
            // frames are landscape bands and are cropped by object-fit, which
            // is fine because they are texture, not the subject.
            const portrait = i === 0 ? mobileFirst : '';
            const first = i === 0;
            return (
              <picture key={src} className="ox-hero__frame" data-active={i === slide ? '' : undefined}>
                {portrait ? <source media="(min-width: 640px)" srcSet={src} /> : null}
                <img
                  className="ox-hero__img"
                  src={portrait || src}
                  alt=""
                  width={portrait ? 780 : 1440}
                  height={portrait ? 1040 : 560}
                  decoding={first ? 'sync' : 'async'}
                  loading={first ? 'eager' : 'lazy'}
                  {...(first ? { fetchPriority: 'high' as const } : {})}
                  {...(first && !image ? { 'data-testid': 'ox-hero-default-photo' } : {})}
                  {...(first && image ? { 'data-priority': 'true', 'data-mobile-src': mobileImage } : {})}
                />
              </picture>
            );
          })}
          </div>
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
          {slides.length > 1 ? (
            <div className="ox-hero__dots" role="group" aria-label={t('ox.home.hero_slides_label')}>
              {slides.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className="ox-hero__dot"
                  data-active={i === slide ? '' : undefined}
                  aria-current={i === slide ? 'true' : undefined}
                  // Choosing a frame ends the rotation for good, which is the
                  // stop mechanism WCAG 2.2.2 asks of auto-updating content.
                  onClick={() => {
                    setSlide(i);
                    setHeld(true);
                  }}
                >
                  <span className="ox-sr-only">{t('ox.home.hero_slide_n', { n: i + 1 })}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {/* One flat gradient over the whole frame, never a blur (render budget
            rule 2). It is what keeps white type legible on a photograph the
            store has not shot yet as well as on the one it has. */}
        <span className="ox-hero__scrim" aria-hidden="true" />
        {/* The bright line on the diagonal, the reference's one accent on the
            first screen. Like the wedges it never animates (A9). */}
        <span className="ox-hero__edge" aria-hidden="true" />
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
          {/* The eyebrow the reference sets above the headline: who this shop
              is, in one line, before the question is asked. */}
          <p className="ox-hero__eyebrow">{eyebrow || t('ox.home.hero_eyebrow')}</p>
          <h1 className="ox-hero__headline ox-display">
            {headline || t('ox.home.hero_headline')}
          </h1>
          {/* The reference sets a light Latin line under the headline. A
              merchant subline replaces it, because a store that writes its own
              second line means it rather than the lockup. */}
          <p className="ox-hero__sub ox-lead">{subline || t('ox.home.hero_subline')}</p>
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
