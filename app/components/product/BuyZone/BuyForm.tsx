import type { ReactNode, RefObject } from 'react';
import { AddToCartForm } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

export interface BuyFormProps {
  product: Product;
  /** Blocks rendered inside the form, above the options (visual order). */
  formStartSlot?: ReactNode;
  /** Blocks rendered between the attachments and the price row. */
  formEndSlot?: ReactNode;
  /** The sticky bar watches this element and proxies its add button. */
  anchorRef?: RefObject<HTMLDivElement | null>;
}

/**
 * The buy mechanics stay the engine's (CLAUDE.md: cart logic is Salla's).
 *
 * `AddToCartForm` renders, in this order (dist/AddToCartForm-NICDUAS3.js):
 * the hidden product id, `formStartSlot`, the options component, the bundle
 * sections, weight and size guide, note and file attachments, `formEndSlot`,
 * the price row, then `.sticky-product-bar` with the quantity input and the
 * add button. Options, quantity and the add button are therefore contiguous
 * and cannot be interleaved, so SpecChips, SupplyCalculator and
 * DeliveryPromise go in `formStartSlot` above the options. This permutes
 * DIRECTION 6.5 rows 6 to 9 and is flagged to G2 as such (PLAN-final B3).
 *
 * `stickyAddToCart` is deliberately false: it only forwards
 * `support-sticky-bar` to the CDN web component, whose bar we cannot restyle
 * or gate. Our own StickyBar replaces it and proxies this form's add button,
 * so the chosen quantity and options are the ones that reach the cart.
 */
export function BuyForm({ product, formStartSlot, formEndSlot, anchorRef }: BuyFormProps) {
  return (
    <div className="ox-buy" ref={anchorRef}>
      <AddToCartForm
        product={product}
        stickyAddToCart={false}
        formStartSlot={formStartSlot}
        formEndSlot={formEndSlot}
      />
    </div>
  );
}
