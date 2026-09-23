import { useEffect, useState } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Client-only `matchMedia('(hover: hover) and (pointer: fine)')`, read after
 * hydration (CARD-2026-09-23 section 11).
 *
 * The card's second product image used to sit in the DOM at all times, at
 * `opacity: 0`, so a touch phone fetched and decoded it for nothing: about
 * 2.88 MB on the first listing viewport against DIRECTION 10.4's 1.4 MB line.
 * Starting `false` and only ever flipping to `true` in an effect means the
 * server tree and the first client tree both mount without it, so hydration
 * never has to reconcile a mismatch; a hover-capable pointer gets the second
 * image the moment the effect runs.
 */
export function useHoverCapable(): boolean {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(QUERY);
    setCapable(query.matches);
    const onChange = (event: MediaQueryListEvent) => setCapable(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return capable;
}

export default useHoverCapable;
