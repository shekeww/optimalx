import { useEffect, type RefObject } from 'react';

/** The custom property anchor targets read for their scroll offset. */
export const HEADER_HEIGHT_VAR = '--ox-header-h';

/**
 * Publishes the live header height on `<html>` as `--ox-header-h`.
 *
 * Anchor targets offset themselves by it so a deep link does not land under
 * the sticky header: `_primitives.scss` (accordion rows) and `_b2-home.scss`
 * (`#ox-goals`) both read it. Nothing wrote it before, so both were running on
 * their fallbacks.
 *
 * Client only and deliberately without an SSR value: the height depends on the
 * viewport (the utility and nav rows are desktop only) and on whether the
 * announcement bar rendered at all, so a server guess would be wrong half the
 * time. Both call sites carry a fallback for the first paint. The
 * `ResizeObserver` covers every reason the header changes height: a resize
 * across the breakpoint, the announcement bar collapsing when the merchant's
 * advertisement slot fills, and the mobile search row appearing per route.
 */
export function useHeaderHeightVar(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof document === 'undefined' || typeof ResizeObserver === 'undefined') return;

    const root = document.documentElement;
    let published = '';
    const publish = () => {
      const next = `${Math.round(node.getBoundingClientRect().height)}px`;
      if (next === published) return;
      published = next;
      root.style.setProperty(HEADER_HEIGHT_VAR, next);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, [ref]);
}
