import type { Cart } from '@salla.sa/twilight-theme-engine/types';

export interface FreeShippingState {
  /** 0 to 100, already clamped. */
  percent: number;
  /** What is still missing, or 0 once the threshold is reached. */
  remaining: number;
  reached: boolean;
}

/**
 * The free-shipping bar's numbers (DIRECTION 5.5 CartSummary).
 *
 * The engine's own `cart.free_shipping_bar` wins whenever the API sends one:
 * it is computed by the store, which knows rules the theme cannot see
 * (per-city rates, excluded products). Only when it is absent does the theme
 * fall back to the `free_shipping_threshold` setting against the subtotal,
 * and it renders nothing at all when that setting is empty, because the
 * threshold is never a literal in the theme (PLAN-final 5.1).
 */
export function freeShippingState(
  cart: Pick<Cart, 'sub_total' | 'free_shipping_bar'> | undefined,
  threshold: number | null
): FreeShippingState | null {
  const bar = cart?.free_shipping_bar;
  if (bar && typeof bar.minimum_amount === 'number' && bar.minimum_amount > 0) {
    const percent = Math.max(0, Math.min(100, Math.round(bar.percent ?? 0)));
    const remaining = Math.max(0, bar.remaining ?? 0);
    return { percent, remaining, reached: bar.has_free_shipping === true || remaining === 0 };
  }
  if (threshold === null || !cart) return null;
  const subtotal = Number(cart.sub_total);
  if (!Number.isFinite(subtotal) || subtotal < 0) return null;
  const remaining = Math.max(0, Math.round((threshold - subtotal) * 100) / 100);
  const percent = Math.max(0, Math.min(100, Math.round((subtotal / threshold) * 100)));
  return { percent, remaining, reached: remaining === 0 };
}

/**
 * Western numerals with at most two decimals and no trailing zeros, for an
 * amount that goes inside a sentence. `useMoney().format()` returns JSX and
 * carries the SAR glyph; the locale line already names the currency, so this
 * interpolates a plain number instead of nesting a second currency mark.
 */
export function amountText(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
}
