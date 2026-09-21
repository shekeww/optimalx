import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Price } from '../../common/Price';
import { effectivePrice } from '../lib/claims';

export interface StickyBarProps {
  product: Product;
  /** The buy zone the bar watches; the bar shows once it leaves the viewport. */
  anchorRef: RefObject<HTMLElement | null>;
}

/** The class B1's bottom tab bar hides on (PLAN-final B1 binding spec). */
export const STICKY_BODY_CLASS = 'ox-sticky-bar';

/**
 * The sticky buy bar (DIRECTION 5.4 StickyBar).
 *
 * The engine does not render one: `AddToCartForm` only forwards
 * `support-sticky-bar` to the CDN web component (verified in
 * dist/AddToCartForm-NICDUAS3.js), so this is ours, driven by one
 * IntersectionObserver on the buy zone. While it is up, `body` carries
 * `ox-sticky-bar` so the mobile tab bar steps aside.
 *
 * The approved design gives it the price at the inline start and the add
 * button filling the rest of the row; there is no thumbnail and no product
 * name, because by the time the bar is up the shopper is already looking at
 * both. It clears `env(safe-area-inset-bottom)` from the stylesheet.
 *
 * Its button is a proxy, not a second cart path: it clicks the form's own
 * `salla-add-product-button`, so the quantity and the options the shopper
 * chose are exactly what reaches the cart, and the engine keeps owning the
 * loading, validation and toast. If the button is not in the DOM yet, the bar
 * scrolls the buy zone into view instead of failing silently.
 */
export function StickyBar({ product, anchorRef }: StickyBarProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Above the viewport only: the bar must not appear before the shopper
        // has reached the buy zone for the first time.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle(STICKY_BODY_CLASS, visible);
    return () => document.body.classList.remove(STICKY_BODY_CLASS);
  }, [visible]);

  const add = useCallback(() => {
    const anchor = anchorRef.current;
    const button = anchor?.querySelector('salla-add-product-button');
    if (button && typeof (button as HTMLElement).click === 'function') {
      (button as HTMLElement).click();
      return;
    }
    anchor?.scrollIntoView({ block: 'center' });
  }, [anchorRef]);

  const outOfStock = product.is_out_of_stock || product.status === 'out';

  return (
    <div className={'ox-sticky' + (visible ? ' is-visible' : '')} aria-hidden={!visible}>
      <div className="ox-sticky__inner">
        <p className="ox-sticky__price">
          <Price amount={effectivePrice(product)} size="card" currency={product.currency} />
        </p>
        <button
          type="button"
          className="ox-btn ox-btn--primary ox-sticky__add"
          onClick={add}
          disabled={outOfStock}
          tabIndex={visible ? 0 : -1}
        >
          {outOfStock ? t('ox.card.out_of_stock') : t('ox.pdp.sticky_add')}
        </button>
      </div>
    </div>
  );
}
