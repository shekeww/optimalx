import { useSyncExternalStore } from 'react';

/**
 * The site-wide cart count (brief B6 addendum).
 *
 * Why this exists. The engine never mounts `CartContextProvider` anywhere
 * (a grep of every file in `@salla.sa/twilight-theme-engine/dist` finds
 * `CartContext` only in `contexts/index.js`), so `useCartContext()` is null on
 * every route, including `/cart`. Anything outside the cart page that wants a
 * count - the header pill, the bottom tab bar - has to read the SDK instead.
 *
 * The SDK is the source of truth: `salla.cart.event.onUpdated` fires after
 * every add, update and delete, and the same payload is dispatched on the
 * global emitter as `cart::updated`
 * (engine types/salla-sdk.d.ts:181-215 documents both, and that `off<Event>`
 * is the only way to unsubscribe an `on<Event>` listener). Neither fires on
 * first load, so the initial value is seeded from `salla-cart-summary`, the
 * component the header already renders, which the SDK paints with the current
 * count before any interaction.
 *
 * The value lives in a module singleton rather than a React context because
 * its readers sit in different trees (the header, the tab bar and the cart
 * page never share a provider) and because a context would force the engine
 * layout to re-render on every cart change.
 *
 * `null` means "not known yet" and reads as an empty pill, not as zero.
 */

export type CartCount = number | null;

let count: CartCount = null;
const listeners = new Set<() => void>();

/** Subscribers to the SDK, mounted once for the whole document. */
let teardown: (() => void) | null = null;

function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * Publishes a new count. Exported so the cart page can push the authoritative
 * number it already has (the engine's own query) instead of waiting for an
 * event that only fires on a mutation.
 */
export function setCartCount(next: CartCount): void {
  const value = typeof next === 'number' && Number.isFinite(next) && next >= 0 ? next : null;
  if (value === count) return;
  count = value;
  emit();
}

export function getCartCount(): CartCount {
  return count;
}

/** Test seam: clears the value and the SDK subscription. */
export function resetCartCount(): void {
  count = null;
  teardown?.();
  teardown = null;
  emit();
}

/**
 * Pulls a count out of whatever the SDK handed the listener. `cart::updated`
 * passes the cart summary; `itemAdded` passes the axios response first. Both
 * shapes are searched, and anything else leaves the value untouched.
 */
export function countFromPayload(args: readonly unknown[]): CartCount {
  for (const arg of args) {
    if (!arg || typeof arg !== 'object') continue;
    const record = arg as Record<string, unknown>;
    if (typeof record.count === 'number') return record.count;
    const data = record.data as Record<string, unknown> | undefined;
    if (data && typeof data === 'object') {
      if (typeof data.count === 'number') return data.count;
      const cart = data.cart as Record<string, unknown> | undefined;
      if (cart && typeof cart === 'object' && typeof cart.count === 'number') return cart.count;
    }
    const cart = record.cart as Record<string, unknown> | undefined;
    if (cart && typeof cart === 'object' && typeof cart.count === 'number') return cart.count;
  }
  return null;
}

/** The count `salla-cart-summary` is showing, or null when it has not painted. */
function countFromSummary(): CartCount {
  if (typeof document === 'undefined') return null;
  const node = document.querySelector('salla-cart-summary .s-cart-summary-count');
  if (!node) return null;
  const text = (node.textContent ?? '').trim();
  if (text === '') return null;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Subscribes to the SDK once. Returns the teardown; safe to call before the
 * SDK has loaded (the `salla` global appears late) because the summary
 * observer keeps working either way.
 */
function connect(): () => void {
  if (typeof window === 'undefined') return () => {};

  const disposers: Array<() => void> = [];
  const onCart = (...args: unknown[]) => {
    const next = countFromPayload(args);
    if (next !== null) setCartCount(next);
    else setCartCount(countFromSummary());
  };

  const salla = window.salla;
  const cartEvent = salla?.cart?.event;
  if (typeof cartEvent?.onUpdated === 'function') {
    cartEvent.onUpdated(onCart);
    // `off<Event>` is the only way back out; `salla.cart.event.off` does not
    // exist (engine types/salla-sdk.d.ts:205-213).
    disposers.push(() => cartEvent.offUpdated?.(onCart));
  } else if (salla?.event?.on) {
    salla.event.on('cart::updated', onCart);
    disposers.push(() => salla.event.off('cart::updated', onCart));
  }

  // Seed, and keep a fallback for the case where the SDK fires no event we
  // caught: the summary element is small and the observer is scoped to it.
  setCartCount(countFromSummary());
  if (typeof MutationObserver !== 'undefined') {
    const root = document.querySelector('salla-cart-summary');
    if (root) {
      const observer = new MutationObserver(() => {
        const next = countFromSummary();
        if (next !== null) setCartCount(next);
      });
      observer.observe(root, { childList: true, subtree: true, characterData: true });
      disposers.push(() => observer.disconnect());
    }
  }

  return () => {
    for (const dispose of disposers) dispose();
  };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) teardown = connect();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardown?.();
      teardown = null;
    }
  };
}

/** SSR renders the unknown state, which is what the client hydrates into. */
function getServerSnapshot(): CartCount {
  return null;
}

/**
 * The current cart count, or null while it is unknown. Subscribing mounts the
 * SDK listener for the whole document; the last unsubscriber removes it.
 */
export function useCartCount(): CartCount {
  return useSyncExternalStore(subscribe, getCartCount, getServerSnapshot);
}

/** The store, for a consumer that wants `useSyncExternalStore` of its own. */
export const cartCountStore = {
  subscribe,
  getSnapshot: getCartCount,
  getServerSnapshot,
  set: setCartCount,
};
