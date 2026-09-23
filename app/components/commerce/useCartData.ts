import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cart as cartApi } from '@salla.sa/twilight-theme-engine/api/cart';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { setCartCount } from './useCartCount';

export interface CartData {
  /** The cart, once the SDK has given us an id and the fetch has resolved. */
  cart: Cart | undefined;
  /** True until both of those happen; the skeleton is the engine's own. */
  loading: boolean;
}

/**
 * The cart on the cart route.
 *
 * This is deliberately the same two steps the engine's own `CartPageContent`
 * takes (`routes/cart.js`): ask the SDK for the current cart id, then run
 * `cart.queries.detail(cartId)`. Because the query key is the engine's, the
 * wrapper and the engine page share one react-query entry and one request:
 * whichever renders first fills the cache for the other.
 *
 * It exists so the route wrapper can decide between the empty state and the
 * engine page, and so `cart:items.end` can be given a real cart through
 * `CartContextProvider` (the engine exports that provider but mounts it
 * nowhere, so `useCartContext()` would otherwise be null here too).
 */
export function useCartData(): CartData {
  // `undefined` means "still asking"; `null` means "this visitor has no cart,
  // or this build has no cart API". The two were one value before, so a
  // preview with no SDK, and a store whose id request rejects, both sat on
  // the skeleton for ever instead of reaching the empty state
  // (UX-2026-09-24 P0-1).
  const [cartId, setCartId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    // Every hop is optional: the offline preview ships no `window.salla` at
    // all, and a partially booted SDK has `salla` without `cart.api`. A
    // missing API is a cartless visitor, not an exception to throw through
    // the render.
    const pending = window.salla?.cart?.api?.getCurrentCartId?.();
    if (!pending || typeof pending.then !== 'function') {
      setCartId(null);
      return;
    }
    pending
      .then((id) => {
        if (alive) setCartId(typeof id === 'number' ? id : null);
      })
      .catch(() => {
        if (alive) setCartId(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const { data, isPending } = useQuery({
    ...cartApi.queries.detail(cartId as number),
    enabled: typeof cartId === 'number',
  });

  // The cart page holds the authoritative count; publish it so the header
  // pill and the bottom tab bar agree with the page the visitor is looking at.
  const count = data?.count;
  useEffect(() => {
    if (typeof count === 'number') setCartCount(count);
  }, [count]);

  // Loading is "we have not finished asking", never "there is nothing" and
  // never "the request failed". A visitor with no cart (`cartId === null`) is
  // resolved, and a request that ERRORED is resolved too: react-query leaves
  // `data` undefined in both cases, and reading that as "still loading" is
  // what left the cart under a permanent skeleton at 1440 in the offline
  // preview. `isPending` is the question actually being asked, and it stays
  // true for ever on a disabled query, which is why the id is tested first.
  return {
    cart: data,
    loading: cartId === undefined || (typeof cartId === 'number' && isPending),
  };
}
