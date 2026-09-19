import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { PdpIcon } from '../PdpIcon';
import { Alternatives } from './Alternatives';

export interface RelatedRailProps {
  productId: number;
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
export function RelatedRail({ productId }: RelatedRailProps) {
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

  // The arrows drive the slider's own controls, so the web component keeps
  // owning the scroll position, the loop and the snap. Without them the rail
  // is scrolled directly, which is what happens below 1024 anyway.
  const nudge = useCallback((direction: number) => {
    const host = hostRef.current;
    if (!host) return;
    const control = host.querySelector(
      direction < 0 ? '.swiper-button-prev' : '.swiper-button-next'
    ) as HTMLElement | null;
    if (control && typeof control.click === 'function') {
      control.click();
      return;
    }
    const scroller = host.querySelector('.ox-rail__slider') as HTMLElement | null;
    if (!scroller || typeof scroller.scrollBy !== 'function') return;
    const step = Math.round(scroller.clientWidth * 0.8) || 260;
    scroller.scrollBy({ left: direction * step, behavior: 'smooth' });
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
            <PdpIcon name="chevron-end" size={16} />
          </button>
          <button
            type="button"
            className="ox-related__arrow ox-related__arrow--next"
            onClick={() => nudge(1)}
            aria-label={t('ox.pdp.rail_next')}
          >
            <PdpIcon name="chevron-end" size={16} />
          </button>
        </div>
      </div>
      <div className="ox-related__body" ref={hostRef}>
        <Alternatives productId={productId} title="" />
      </div>
    </section>
  );
}

export default RelatedRail;
