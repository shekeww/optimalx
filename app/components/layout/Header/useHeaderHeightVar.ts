import { useEffect, type RefObject } from 'react';

/** The custom property anchor targets read for their scroll offset. */
export const HEADER_HEIGHT_VAR = '--ox-header-h';

/**
 * Publishes the live header height on `<html>` as `--ox-header-h`.
 *
 * Anchor targets offset themselves by it so a deep link does not land under
 * the fixed header: `_primitives.scss` (accordion rows), `_b2-home.scss`
 * (`#ox-goals`) and `.app-inner`'s own `padding-block-start` (`_b1-layout.scss`
 * — the space that keeps every page's content out from under the header now
 * that `.ox-header` is `position: fixed` at every width) all read it.
 *
 * `tokens.css` now carries a real per-breakpoint default for `--ox-header-h`
 * (144px mobile, 172px desktop — the chrome's own measured rows, assuming the
 * announcement bar is present), so the first, unhydrated paint is already
 * correctly spaced and nothing here is needed for that. What the
 * `ResizeObserver` is for is refining it to the box actually on screen: a
 * resize across the breakpoint, the announcement bar collapsing when the
 * merchant's advertisement slot fills or the setting carries no text, and the
 * mobile search row appearing per route. Writing the property inline on
 * `<html>` beats the stylesheet default with no flash back the other way.
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
