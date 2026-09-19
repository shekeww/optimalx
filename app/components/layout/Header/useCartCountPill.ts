import { useEffect, type RefObject } from 'react';

/**
 * `salla-cart-summary` renders its own count element and prints "0" for an
 * empty cart. The count itself has to stay the component's (the SDK keeps it
 * current on every route, while `useCartContext()` is null outside the cart
 * page), but DIRECTION 5.1 hides the pill at zero.
 *
 * This reads that element and marks it `is-zero`; the stylesheet hides it.
 * Nothing about the cart's behaviour is touched, only one presentational
 * class on an element the component owns.
 */
export function useCartCountPill(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof MutationObserver === 'undefined') return;

    const read = () => {
      const count = root.querySelector('.s-cart-summary-count');
      if (!count) return;
      const value = (count.textContent ?? '').trim();
      count.classList.toggle('is-zero', value === '' || value === '0');
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [ref]);
}
