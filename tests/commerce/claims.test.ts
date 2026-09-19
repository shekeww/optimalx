import { describe, expect, it } from 'vitest';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { amountText, freeShippingState } from '../../app/components/commerce/freeShipping';
import { policyKind } from '../../app/components/commerce/policyKind';
import { articleKeyPoints } from '../../app/components/commerce/articleKeyPoints';
import { isPickupOrder, orderCategorySlugs } from '../../app/components/commerce/order';
import { thankYouLines } from '../../app/content/thankyou';
import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';

function cart(partial: Partial<Cart>): Cart {
  return partial as Cart;
}

/**
 * The claims gates B6 owns (PLAN-final 5.1): the free-shipping bar's numbers,
 * the thank-you step selection and the policy intro lookup. Each one has to
 * render nothing rather than guess.
 */
describe('freeShippingState', () => {
  it('prefers the engine free_shipping_bar over the theme setting', () => {
    const state = freeShippingState(
      cart({
        sub_total: 10,
        free_shipping_bar: {
          minimum_amount: 200,
          has_free_shipping: false,
          percent: 60,
          remaining: 80,
        },
      }),
      500
    );
    expect(state).toEqual({ percent: 60, remaining: 80, reached: false });
  });

  it('reads the engine bar as reached when the store says so', () => {
    const state = freeShippingState(
      cart({
        sub_total: 400,
        free_shipping_bar: {
          minimum_amount: 200,
          has_free_shipping: true,
          percent: 100,
          remaining: 0,
        },
      }),
      null
    );
    expect(state?.reached).toBe(true);
  });

  it('falls back to the threshold setting against the subtotal', () => {
    const state = freeShippingState(cart({ sub_total: 150 }), 200);
    expect(state).toEqual({ percent: 75, remaining: 50, reached: false });
  });

  it('clamps the percentage above the threshold and reports no remainder', () => {
    const state = freeShippingState(cart({ sub_total: 400 }), 200);
    expect(state).toEqual({ percent: 100, remaining: 0, reached: true });
  });

  it('renders nothing when the owner has set no threshold', () => {
    expect(freeShippingState(cart({ sub_total: 150 }), null)).toBeNull();
  });

  it('renders nothing without a cart', () => {
    expect(freeShippingState(undefined, 200)).toBeNull();
  });
});

describe('amountText', () => {
  it('keeps whole numbers whole and trims a trailing zero', () => {
    expect(amountText(80)).toBe('80');
    expect(amountText(80.5)).toBe('80.5');
    expect(amountText(80.55)).toBe('80.55');
  });
});

describe('thank-you step selection', () => {
  function order(ids: number[]): Order {
    return {
      items: ids.map((id, index) => ({ id: index, product: { id } })),
    } as unknown as Order;
  }

  it('maps a known product id to its category slug', () => {
    // OX-015 and OX-016 are the creatine SKUs in content/categories.ts.
    const slugs = orderCategorySlugs(order([995134839]));
    expect(slugs).toEqual(['creatine']);
    expect(thankYouLines(slugs)).toEqual(['ox.content.thankyou.line_creatine']);
  });

  it('de-duplicates two products from the same category', () => {
    const slugs = orderCategorySlugs(order([995134839, 779499389]));
    expect(thankYouLines(slugs)).toHaveLength(1);
  });

  it('contributes no line for a product the catalogue does not know', () => {
    expect(orderCategorySlugs(order([1]))).toEqual([]);
    expect(thankYouLines([])).toEqual([]);
  });

  it('handles an order with no items at all', () => {
    expect(orderCategorySlugs(undefined)).toEqual([]);
  });
});

describe('isPickupOrder', () => {
  it('is false for an ordinary order', () => {
    expect(isPickupOrder({ type: 'order', shipping: { id: 3 } } as unknown as Order)).toBe(false);
  });

  it('is false when a shipped order has no carrier yet', () => {
    expect(isPickupOrder({ type: 'order' } as unknown as Order)).toBe(false);
  });

  it('is true on an explicit pickup type', () => {
    expect(isPickupOrder({ type: 'pickup' } as unknown as Order)).toBe(true);
  });

  it('is true when the shipping carries a branch', () => {
    expect(
      isPickupOrder({ type: 'order', shipping: { branch: { name: 'x' } } } as unknown as Order)
    ).toBe(true);
  });
});

describe('policyKind', () => {
  it('reads an English slug', () => {
    expect(policyKind('shipping-policy')).toBe('shipping');
    expect(policyKind('return-and-exchange')).toBe('returns');
    expect(policyKind('privacy-policy')).toBe('privacy');
    expect(policyKind('terms-and-conditions')).toBe('terms');
  });

  it('reads an Arabic slug or title', () => {
    expect(policyKind('سياسة-الشحن')).toBe('shipping');
    expect(policyKind(undefined, 'سياسة الخصوصية')).toBe('privacy');
  });

  it('does not read a return policy as a terms page', () => {
    expect(policyKind('terms-of-return')).toBe('returns');
  });

  it('reads the hamza spellings the live store actually uses', () => {
    // The store's own page is "سياسة الإستبدال والإسترجاع" (hamza under the
    // alef) while FINAL-content writes the bare alef; both must match.
    expect(policyKind('سياسة-الإستبدال-والإسترجاع')).toBe('returns');
    expect(policyKind(undefined, 'سياسة الإسترجاع')).toBe('returns');
    expect(policyKind('الشروط-والأحكام')).toBe('terms');
  });

  it('decodes a percent-encoded Arabic slug', () => {
    expect(policyKind(encodeURIComponent('سياسة-الشحن'))).toBe('shipping');
  });

  it('returns null for a page that is not a policy', () => {
    expect(policyKind('about-us', 'من نحن')).toBeNull();
    expect(policyKind(undefined, undefined)).toBeNull();
  });
});

describe('articleKeyPoints', () => {
  it('reads the list under the article own summary heading', () => {
    const html = '<p>x</p><h2>الخلاصة</h2><ul><li>one</li><li>two</li></ul><h2>next</h2>';
    expect(articleKeyPoints(html)).toEqual(['one', 'two']);
  });

  it('caps the list at three bullets', () => {
    const html = '<h2>In short</h2><ol><li>1</li><li>2</li><li>3</li><li>4</li></ol>';
    expect(articleKeyPoints(html)).toEqual(['1', '2', '3']);
  });

  it('renders nothing when the article has no summary section', () => {
    expect(articleKeyPoints('<h2>مقدمة</h2><ul><li>one</li></ul>')).toEqual([]);
  });

  it('renders nothing when another heading comes before the list', () => {
    expect(articleKeyPoints('<h2>الخلاصة</h2><h3>x</h3><ul><li>one</li></ul>')).toEqual([]);
  });

  it('reads text only, never markup', () => {
    const html = '<h2>الخلاصة</h2><ul><li><b>bold</b> text<script>evil()</script></li></ul>';
    expect(articleKeyPoints(html)).toEqual(['bold text']);
  });

  it('handles an empty body', () => {
    expect(articleKeyPoints(undefined)).toEqual([]);
    expect(articleKeyPoints('')).toEqual([]);
  });
});
