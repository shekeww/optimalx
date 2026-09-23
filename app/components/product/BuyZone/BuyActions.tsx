import { useCallback, useRef, type RefObject } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { currentCartPath, proxyAddToCart } from '../lib/buyNow';

export interface BuyActionsProps {
  product: Product;
  /** The buy zone that holds the engine's form and its add button. */
  anchorRef: RefObject<HTMLDivElement | null>;
}

/**
 * The product page's second call to action, and the other half of a pair.
 *
 * THE PAGE HAD ONE BUTTON WHERE EVERY CARD HAS TWO. A shopper who has already
 * decided had to add to the cart, find the cart, and then check out, while the
 * grid two clicks earlier offered them "اشتري الآن" directly. This closes that,
 * and it makes the product page speak the same language as the rest of the
 * site: the hero carries a primary and a secondary CTA side by side, the card
 * carries the same pair, and now so does the buy zone.
 *
 * ## It is a proxy, not a second cart path
 *
 * This is the pattern `StickyBar` already uses and it is deliberate: the button
 * clicks the form's own `salla-add-product-button`, so the quantity and the
 * options the shopper chose are exactly what reaches the cart, and Salla keeps
 * owning the validation, the loading state and the toast. Nothing here calls a
 * cart endpoint (CLAUDE.md: cart logic stays Salla's). The only thing this adds
 * is where the shopper goes afterwards.
 *
 * The redirect waits for the component's own `success` event rather than firing
 * on click, because clicking is not adding: a product with options opens the
 * chooser instead, and an out-of-stock product opens the notify control. If the
 * add never succeeds the shopper is never moved, which is the correct failure —
 * a buy-now that navigates to an empty cart is worse than one that does nothing.
 *
 * `failed` clears the listener so a later, unrelated success cannot strand a
 * redirect, and the timeout covers a component that reports neither.
 */
export function BuyActions({ product, anchorRef }: BuyActionsProps) {
  const { t } = useTranslation();
  // One in-flight attempt at a time: a second click while the chooser is open
  // must not stack a second redirect.
  const pending = useRef(false);

  const buyNow = useCallback(() => {
    const anchor = anchorRef.current;
    const button = anchor?.querySelector('salla-add-product-button');

    if (!button || typeof (button as HTMLElement).click !== 'function') {
      // The engine's button has not mounted. Put the buy zone on screen rather
      // than failing silently, which is what `StickyBar` does for the same case.
      anchor?.scrollIntoView({ block: 'center' });
      return;
    }

    if (pending.current) {
      (button as HTMLElement).click();
      return;
    }
    pending.current = true;

    proxyAddToCart({
      button,
      onSuccess: () => {
        if (typeof window !== 'undefined') window.location.assign(currentCartPath());
      },
      onSettled: () => {
        pending.current = false;
      },
    });
  }, [anchorRef]);

  // Out of stock has no buy-now. The engine's own button becomes a notify-me
  // control in that state, and a second button beside it offering to buy would
  // be offering something the store cannot sell.
  if (product.is_out_of_stock || product.status === 'out' || product.status === 'out-and-notify') {
    return null;
  }

  return (
    <div className="ox-buy__actions">
      <button type="button" className="ox-buy__now" onClick={buyNow}>
        {/* TEXT ONLY, centred (owner review, 2026-09-23): the bolt this
            button carried is gone from every "اشتر الآن" control, here and
            on the card and the sticky bar. */}
        {t('ox.pdp.buy_now')}
      </button>
    </div>
  );
}

export default BuyActions;
