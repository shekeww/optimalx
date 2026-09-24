/**
 * Moves a rail's track one card (and the track's own gap) toward the reading
 * end, or back with `direction = -1`: the step the rail cue takes, and the
 * one the Shopify port's `wireRail()` takes on every rail (assets/ox.js).
 *
 * Relative to where the track is now, never to a remembered start index, so
 * a swipe before the tap can never send the row backwards, and the browser's
 * own scroll clamp stops it at the last card at every width (1.15 cards on a
 * phone, 4 at 1440). Review 2026-09-25: the posters' cue used to jump to a
 * start index clamped for three visible cards, so on a phone the second tap
 * did nothing while two posters were still out of view.
 *
 * `scrollBy`, never `scrollIntoView`, which can also scroll the page.
 * `scrollLeft` runs negative in RTL, so the step carries the track's own
 * direction. With snap on the track, one card plus the gap lands exactly on
 * the next snap point.
 */
export function nudgeRail(
  track: HTMLElement | null,
  reducedMotion: boolean,
  direction: 1 | -1 = 1
): void {
  if (!track || typeof track.scrollBy !== 'function') return;
  const first = track.firstElementChild as HTMLElement | null;
  const style = getComputedStyle(track);
  const gap = parseFloat(style.columnGap) || 0;
  const card = first?.getBoundingClientRect().width || track.clientWidth * 0.8;
  const factor = style.direction === 'rtl' ? -1 : 1;
  // `scrollBy` takes a physical `left`; the direction factor above is what
  // makes the step logical.
  const left = direction * factor * (card + gap);
  track.scrollBy({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
}
