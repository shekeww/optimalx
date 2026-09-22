import { useCallback, useRef } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { Icon } from '../../common/Icon';

export interface PdpThumbRailProps {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** 2x the drawn 64 by 72 thumb. */
const THUMB_WIDTHS = [160] as const;
/** One thumb plus the rail gap, so a chevron press moves exactly one row. */
const STEP = 84;

/**
 * The vertical thumbnail rail at the gallery column's inline start (design
 * region 14).
 *
 * Four thumbs are drawn; a fifth and beyond scroll inside the rail, which is
 * why the chevrons exist at all. They are removed from the tab order when the
 * rail cannot scroll, so a shopper never tabs to a control that does nothing.
 *
 * At 390 the stylesheet turns the same markup into a horizontal snap scroller
 * under the plate and hides the chevrons; no second component, no second DOM.
 */
export function PdpThumbRail({ images, activeIndex, onSelect }: PdpThumbRailProps) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLUListElement | null>(null);
  const scrollable = images.length > 4;

  const nudge = useCallback((direction: number) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ top: direction * STEP, behavior: 'smooth' });
  }, []);

  return (
    <div className="ox-thumbs">
      <button
        type="button"
        className="ox-thumbs__chev"
        onClick={() => nudge(-1)}
        aria-label={t('ox.a11y.gallery_prev')}
        tabIndex={scrollable ? 0 : -1}
        aria-hidden={!scrollable}
      >
        <i className="sicon-keyboard_arrow_up" aria-hidden="true" />
      </button>
      <ul className="ox-thumbs__list" ref={listRef}>
        {images.map((image, index) => (
          <li className="ox-thumbs__item" key={String(image.id ?? image.url ?? index)}>
            <button
              type="button"
              className={'ox-thumbs__btn' + (index === activeIndex ? ' is-active' : '')}
              onClick={() => onSelect(index)}
              aria-current={index === activeIndex}
              aria-label={t('ox.pdp.gallery_image', { index: index + 1, total: images.length })}
            >
              <Image
                src={image.url}
                alt=""
                aspectRatio="1/1"
                objectFit="contain"
                noWrapper
                srcSetWidths={THUMB_WIDTHS}
                sizes="64px"
                className="ox-thumbs__img"
              />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ox-thumbs__chev"
        onClick={() => nudge(1)}
        aria-label={t('ox.a11y.gallery_next')}
        tabIndex={scrollable ? 0 : -1}
        aria-hidden={!scrollable}
      >
        <Icon name="chevron-down" size={16} />
      </button>
    </div>
  );
}

export default PdpThumbRail;
