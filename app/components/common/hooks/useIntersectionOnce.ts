import { useEffect, useState, type RefObject } from 'react';

export interface UseIntersectionOnceOptions {
  /** Passed to IntersectionObserver; `0.3` means 30% of the box visible. */
  threshold?: number | number[];
  rootMargin?: string;
  /** When `false` the observer is never attached and the hook stays `false`. */
  enabled?: boolean;
}

/**
 * `true` once the referenced element has entered the viewport, then stays
 * `true` (the observer disconnects after the first hit). Without
 * IntersectionObserver (old browsers, SSR) it resolves to `true` immediately
 * on the client so nothing is ever hidden behind a trigger that cannot fire.
 */
export function useIntersectionOnce<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0, rootMargin, enabled = true }: UseIntersectionOnceOptions = {}
): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!enabled || seen) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // `threshold` may be an array literal; callers pass a stable value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enabled, seen, rootMargin, JSON.stringify(threshold)]);

  return seen;
}
