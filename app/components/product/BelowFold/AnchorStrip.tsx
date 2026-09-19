import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface AnchorItem {
  /** The id of the region this tab scrolls to. */
  id: string;
  label: string;
}

export interface AnchorStripProps {
  items: AnchorItem[];
}

/**
 * The five tab strip under the brand band (design region 34).
 *
 * It is a scrollspy anchor strip, not a tab control: the approved image shows
 * five tabs with three panels open at once, so nothing here hides anything.
 * Each tab is an ordinary in-page link, which is what makes it work with the
 * keyboard, with a screen reader and with a pasted deep link.
 *
 * Claims gates B19 to B21: a tab exists only when its region does. With no
 * reviews and no benefit prose the strip has three tabs, re-spaced, still
 * start aligned, and it never points at a region that is not on the page.
 *
 * The indicator is one element that translates and scales. Colour never
 * transitions, and under `prefers-reduced-motion` it moves without a
 * transition rather than not moving at all.
 */
export function AnchorStrip({ items }: AnchorStripProps) {
  const { t, isRTL } = useTranslation();
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [indicator, setIndicator] = useState({ x: 0, w: 0 });

  // Scrollspy: the region with the greatest visible share wins, and a tie is
  // broken by document order, so two panels side by side cannot flicker.
  useEffect(() => {
    if (items.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = '';
        let best = 0;
        for (const item of items) {
          const ratio = ratios.get(item.id) ?? 0;
          if (ratio > best) {
            best = ratio;
            bestId = item.id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-72px 0px -40% 0px' }
    );
    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [items]);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('[aria-current="true"]') as HTMLElement | null;
    if (!active) return;
    const listBox = list.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    const start = isRTL ? listBox.right - box.right : box.left - listBox.left;
    setIndicator({ x: Math.round(start), w: Math.round(box.width) });
    if (typeof active.scrollIntoView === 'function' && list.scrollWidth > list.clientWidth) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [isRTL]);

  useEffect(() => {
    measure();
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, activeId, items]);

  if (items.length === 0) return null;

  return (
    <nav className="ox-strip" aria-label={t('ox.pdp.sections_nav')}>
      <ul className="ox-strip__list" ref={listRef}>
        {items.map((item) => (
          <li className="ox-strip__item" key={item.id}>
            <a
              className={'ox-strip__tab' + (item.id === activeId ? ' is-active' : '')}
              href={'#' + item.id}
              aria-current={item.id === activeId}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li
          className="ox-strip__ind"
          aria-hidden="true"
          style={{
            ['--ox-ind-x' as string]: String(indicator.x) + 'px',
            ['--ox-ind-w' as string]: String(indicator.w),
          }}
        />
      </ul>
    </nav>
  );
}

export default AnchorStrip;
