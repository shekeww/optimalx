import { describe, it, expect, vi } from 'vitest';
import { cartPathFor, proxyAddToCart } from '../../app/components/product/lib/buyNow';

/**
 * "Buy now" buys (UX-2026-09-24 P0-10).
 *
 * The mechanism, not the markup: the control clicks Salla's own add button
 * and moves the shopper only once that component reports success. These tests
 * stand a plain element in for `salla-add-product-button` and drive its two
 * events, which is exactly the contract the card and the product page rely on.
 */
function fakeAddButton() {
  const element = document.createElement('div');
  const clicks = { count: 0 };
  element.addEventListener('click', () => {
    clicks.count += 1;
  });
  return { element, clicks };
}

describe('proxyAddToCart', () => {
  it('clicks Salla’s button and lands on the cart once it reports success', () => {
    const { element, clicks } = fakeAddButton();
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    proxyAddToCart({ button: element, onSuccess, onSettled });
    expect(clicks.count).toBe(1);
    expect(onSuccess).not.toHaveBeenCalled();

    element.dispatchEvent(new Event('success'));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('never moves the shopper when the add fails', () => {
    const { element } = fakeAddButton();
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    proxyAddToCart({ button: element, onSuccess, onSettled });
    element.dispatchEvent(new Event('failed'));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);

    // A later success, from a different attempt, cannot strand the redirect.
    element.dispatchEvent(new Event('success'));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('gives up silently on a component that reports neither event', () => {
    vi.useFakeTimers();
    const { element } = fakeAddButton();
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    proxyAddToCart({ button: element, onSuccess, onSettled, timeoutMs: 1000 });
    vi.advanceTimersByTime(1001);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();

    element.dispatchEvent(new Event('success'));
    expect(onSuccess).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('cartPathFor', () => {
  it('carries the locale segment of the page the shopper is on, exactly once', () => {
    expect(cartPathFor('/ar/x/p1673105563')).toBe('/ar/cart');
    expect(cartPathFor('/en/x/p1673105563')).toBe('/en/cart');
    expect(cartPathFor('/ar')).toBe('/ar/cart');
  });

  it('adds no prefix on a store that serves no locale segment', () => {
    expect(cartPathFor('/x/p1673105563')).toBe('/cart');
    expect(cartPathFor('/')).toBe('/cart');
  });
});
