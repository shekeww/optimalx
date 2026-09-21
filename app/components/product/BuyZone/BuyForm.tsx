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
  /**
   * Rendered inside `.ox-buy`, after the engine's form. The buy-now half of
   * the CTA pair lives here rather than as a sibling of the whole block, so
   * the distance between add-to-cart and buy-now is one margin this
   * stylesheet owns and not the buy column's own gap on top of it. Measured
   * before the move: 46px between the two buttons (16 section margin + 18
   * column gap + 12 own margin) where the pair is meant to sit 12 apart.
   */
  afterForm?: ReactNode;
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
export function BuyForm({ product, formStartSlot, formEndSlot, anchorRef, afterForm }: BuyFormProps) {
  return (
    <div className="ox-buy" ref={anchorRef}>
      <AddToCartForm
        product={product}
        stickyAddToCart={false}
        formStartSlot={formStartSlot}
        formEndSlot={formEndSlot}
      />
      {afterForm}
    </div>
  );
}
