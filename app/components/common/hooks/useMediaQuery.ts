import { useCallback, useSyncExternalStore } from 'react';

// Hoisted, not inline. useSyncExternalStore compares the snapshot functions by
// identity, and a fresh arrow on every render makes React warn that "the
// result of getServerSnapshot should be cached to avoid an infinite loop".
const snapshotServer = () => false;

/**
 * SSR-safe media query subscription. Returns `false` on the server and
 * during hydration (so the server and first client render agree), then the
 * live match once mounted. One `matchMedia` listener per hook instance.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  }, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, snapshotServer);
}
