import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Alternatives } from './Alternatives';

export interface RelatedRailProps {
  productId: number;
  /** The product's own category, passed down so the rail can fall back to it. */
  categoryId?: number | null;
}

/**
 * The related products carousel (design regions 41 and 42).
 *
 * The rail itself stays `ProductsSliderWrapper`, untouched, so the home page
 * rails are not disturbed: this file only wraps it in the design's header row
 * and drives the slider's own scroller from two arrow buttons.
 *
 * Claims gate B27: the whole section, heading and arrows included, is absent
 * when the loader comes back empty, because `ProductsSliderWrapper` returns
 * null and this wrapper has no content of its own to leave behind.
 */
export function RelatedRail({ productId, categoryId }: RelatedRailProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [empty, setEmpty] = useState(false);

  // The rail removes itself once its loader comes back with nothing; the
  // heading and the arrows have to go with it, or the page keeps a title over
  // an empty strip.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const check = () => setEmpty(host.querySelector('.ox-rail') === null);
    check();
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(check);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // The arrows drive the slider itself, so the web component keeps owning the
  // position, the loop and the snap.
  //
  // Three routes, in this order, because the first two each fail on their own.
  //
  //   1. The Swiper instance. `SallaProductsSlider` leaves it on the
  //      `.swiper.swiper-initialized` element as `.swiper`, and `slideNext`
  //      and `slidePrev` are already direction-aware, so RTL needs no
  //      arithmetic here. Measured on the live store on 2026-09-20: this is
  //      the only route that moves the rail in BOTH directions.
  //   2. The component's own nav buttons. They exist (`.s-slider-prev` and
  //      `.s-slider-next`) and the stylesheet hides them in favour of the
  //      design's arrows, but `.s-slider-prev` keeps `swiper-button-disabled`
  //      after the rail has advanced, so clicking it does nothing. That is
  //      why route 1 is tried first; this stays as the fallback for a build
  //      that does not expose the instance.
  //   3. A plain scroll, which is what a phone gets, where the rail is a
  //      scroll-snap strip with no Swiper at all.
  const nudge = useCallback((direction: number) => {
    const host = hostRef.current;
    if (!host) return;

    const instance = (host.querySelector('.swiper.swiper-initialized') as
      | (HTMLElement & { swiper?: { slideNext?: () => void; slidePrev?: () => void } })
      | null)?.swiper;
    const step = direction < 0 ? instance?.slidePrev : instance?.slideNext;
    if (typeof step === 'function') {
      step.call(instance);
      return;
    }

    const selector =
      direction < 0 ? '.s-slider-prev, .swiper-button-prev' : '.s-slider-next, .swiper-button-next';
    const control = host.querySelector(selector) as HTMLElement | null;
    if (control && !control.classList.contains('swiper-button-disabled')) {
      control.click();
      return;
    }

    const scroller = host.querySelector(
      '.swiper-wrapper, .swiper, .ox-rail__slider'
    ) as HTMLElement | null;
    if (!scroller || typeof scroller.scrollBy !== 'function') return;
    const distance = Math.round(scroller.clientWidth * 0.8) || 260;
    scroller.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }, []);

  return (
    <section
      className={'ox-related' + (empty ? ' is-empty' : '')}
      id="ox-related"
      aria-labelledby="ox-related-title"
    >
      <div className="ox-related__head">
        <h2 className="ox-related__title" id="ox-related-title">
          {t('ox.pdp.you_may_like')}
        </h2>
        <div className="ox-related__nav">
          <button
            type="button"
            className="ox-related__arrow"
            onClick={() => nudge(-1)}
            aria-label={t('ox.pdp.rail_prev')}
          >
            <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ox-related__arrow ox-related__arrow--next"
            onClick={() => nudge(1)}
            aria-label={t('ox.pdp.rail_next')}
          >
            <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ox-related__body" ref={hostRef}>
        <Alternatives productId={productId} categoryId={categoryId} title="" />
      </div>
    </section>
  );
}

export default RelatedRail;
