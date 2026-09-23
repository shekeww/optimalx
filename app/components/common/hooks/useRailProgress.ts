import { useEffect, useRef, type RefObject } from 'react';

/**
 * Scroll state for a horizontal rail, published as CSS custom properties on
 * the rail's own wrapper (coordinator brief 2026-09-23: one cue + one
 * progress strap, reusable across the product rails, the featured covers,
 * the posters and the brand carousel).
 *
 * Why it writes to the DOM instead of returning a number: a scroll handler
 * that calls `setState` re-renders the whole rail on every frame of a swipe,
 * which is the opposite of DIRECTION 10's render budget and shows up in INP.
 * This writes three custom properties and one attribute straight onto the
 * wrapper node, inside a single `requestAnimationFrame`, so a swipe costs no
 * React render at all. Nothing here reads or writes React state.
 *
 * What it publishes on the wrapper:
 *  - `--ox-rail-visible`  the fraction of the track that fits on screen
 *                         (0 to 1); the progress segment's own width
 *  - `--ox-rail-progress` how far along the scrollable distance the rail is
 *                         (0 to 1); the segment's inline position
 *  - `data-rail`          `scroll` while there is more to reach, `end` once
 *                         the rail is scrolled out, and ABSENT entirely when
 *                         everything already fits. The cue and the strap are
 *                         both hidden until this attribute exists, so a rail
 *                         that does not scroll never draws an affordance and
 *                         the server-rendered html carries neither.
 *
 * RTL: `scrollLeft` is negative in every engine that follows the current
 * spec (Chromium 85+, Firefox, Safari 15.4+) and the magnitude is the
 * distance travelled from the reading start in both directions, so the ratio
 * is taken from `Math.abs`. Safari 14 (the §5.3 browser floor) still reports
 * the legacy "reversed" positive value in RTL; there the strap reads full at
 * rest instead of empty. That degrades a decoration, never a control: the
 * cue, the arrows and the scroll itself are unaffected.
 */

/** Two decimals is under a tenth of a pixel on a 1296 track; it keeps the
 * written value short enough that the style attribute never churns. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Below this many pixels of overflow a rail is treated as "fits". */
const SCROLLABLE_EPSILON = 2;

export function useRailProgress<T extends HTMLElement>(
  trackRef: RefObject<T | null>
): RefObject<HTMLDivElement | null> {
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      if (max <= SCROLLABLE_EPSILON) {
        rail.removeAttribute('data-rail');
        return;
      }
      const travelled = Math.min(Math.abs(track.scrollLeft), max);
      const ratio = travelled / max;
      const visible = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
      rail.style.setProperty('--ox-rail-visible', String(round(visible)));
      rail.style.setProperty('--ox-rail-progress', String(round(ratio)));
      rail.setAttribute('data-rail', max - travelled <= SCROLLABLE_EPSILON ? 'end' : 'scroll');
    };

    const schedule = () => {
      if (frame) return;
      frame =
        typeof requestAnimationFrame === 'function' ? requestAnimationFrame(write) : (write(), 0);
    };

    write();
    track.addEventListener('scroll', schedule, { passive: true });
    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedule()) : null;
    resize?.observe(track);
    // The track's own box does not change when its items do, and a rail is
    // routinely filled after mount (the brand carousel's list arrives with a
    // query). Watching the child list is what makes the cue appear for that
    // second render without giving the hook a dependency to be called with.
    const mutations =
      typeof MutationObserver === 'function' ? new MutationObserver(() => schedule()) : null;
    mutations?.observe(track, { childList: true });

    return () => {
      track.removeEventListener('scroll', schedule);
      resize?.disconnect();
      mutations?.disconnect();
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
    };
  }, [trackRef]);

  return railRef;
}

export default useRailProgress;
