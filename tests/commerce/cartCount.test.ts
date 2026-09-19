import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cartCountStore,
  countFromPayload,
  getCartCount,
  resetCartCount,
  setCartCount,
} from '../../app/components/commerce/useCartCount';

/**
 * The site-wide cart count (brief B6 addendum). The store is a module
 * singleton, so every test resets it and tears the SDK subscription down.
 */
describe('countFromPayload', () => {
  it('reads a bare cart summary', () => {
    expect(countFromPayload([{ count: 3, total: 100 }])).toBe(3);
  });

  it('reads the axios-shaped response the SDK passes on itemAdded', () => {
    expect(countFromPayload([{ data: { cart: { count: 7 } } }, 123])).toBe(7);
  });

  it('reads a nested data.count', () => {
    expect(countFromPayload([{ data: { count: 2 } }])).toBe(2);
  });

  it('reads a top-level cart object', () => {
    expect(countFromPayload([{ cart: { count: 5 } }])).toBe(5);
  });

  it('returns null for anything it does not recognise', () => {
    expect(countFromPayload(['cart::updated', 42, null, { total: 9 }])).toBeNull();
  });
});

describe('cart count store', () => {
  beforeEach(() => {
    resetCartCount();
    document.body.innerHTML = '';
    delete (window as { salla?: unknown }).salla;
  });

  afterEach(() => {
    resetCartCount();
    delete (window as { salla?: unknown }).salla;
  });

  it('starts unknown, which is not zero', () => {
    expect(getCartCount()).toBeNull();
  });

  it('notifies subscribers on a change and not on a repeat', () => {
    const listener = vi.fn();
    const unsubscribe = cartCountStore.subscribe(listener);
    const before = listener.mock.calls.length;
    setCartCount(4);
    setCartCount(4);
    expect(listener.mock.calls.length).toBe(before + 1);
    expect(getCartCount()).toBe(4);
    unsubscribe();
  });

  it('rejects a negative or non-finite count as unknown', () => {
    setCartCount(3);
    setCartCount(-1);
    expect(getCartCount()).toBeNull();
    setCartCount(Number.NaN);
    expect(getCartCount()).toBeNull();
  });

  it('subscribes to salla.cart.event.onUpdated and unsubscribes with offUpdated', () => {
    const listeners: Array<(...args: unknown[]) => void> = [];
    const offUpdated = vi.fn();
    (window as unknown as { salla: unknown }).salla = {
      cart: {
        event: {
          onUpdated: (cb: (...args: unknown[]) => void) => listeners.push(cb),
          offUpdated,
        },
      },
    };

    const unsubscribe = cartCountStore.subscribe(() => {});
    expect(listeners).toHaveLength(1);

    listeners[0]({ count: 6 });
    expect(getCartCount()).toBe(6);

    unsubscribe();
    expect(offUpdated).toHaveBeenCalledTimes(1);
  });

  it('falls back to the global emitter when the cart helper is absent', () => {
    const on = vi.fn();
    const off = vi.fn();
    (window as unknown as { salla: unknown }).salla = { cart: {}, event: { on, off } };

    const unsubscribe = cartCountStore.subscribe(() => {});
    expect(on).toHaveBeenCalledWith('cart::updated', expect.any(Function));

    const handler = on.mock.calls[0][1] as (...args: unknown[]) => void;
    handler({ data: { cart: { count: 9 } } });
    expect(getCartCount()).toBe(9);

    unsubscribe();
    expect(off).toHaveBeenCalledWith('cart::updated', handler);
  });

  it('seeds from the count salla-cart-summary is already showing', () => {
    document.body.innerHTML =
      '<salla-cart-summary><span class="s-cart-summary-count">2</span></salla-cart-summary>';
    const unsubscribe = cartCountStore.subscribe(() => {});
    expect(getCartCount()).toBe(2);
    unsubscribe();
  });

  it('mounts the SDK subscription once for many subscribers', () => {
    const onUpdated = vi.fn();
    (window as unknown as { salla: unknown }).salla = {
      cart: { event: { onUpdated, offUpdated: vi.fn() } },
    };
    const a = cartCountStore.subscribe(() => {});
    const b = cartCountStore.subscribe(() => {});
    expect(onUpdated).toHaveBeenCalledTimes(1);
    a();
    b();
  });

  it('renders nothing on the server', () => {
    expect(cartCountStore.getServerSnapshot()).toBeNull();
  });
});
