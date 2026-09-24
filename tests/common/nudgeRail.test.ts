import { describe, it, expect, vi } from 'vitest';
import { nudgeRail } from '../../app/components/common/nudgeRail';

/**
 * The rail cue's step (review 2026-09-25): one card and the track's gap,
 * relative to where the track is now, in the track's own direction, so the
 * cue reaches the last card at every width and a swipe before the tap never
 * sends the row backwards. The Shopify port's `wireRail()` takes the same
 * step.
 */

function track(direction: 'rtl' | 'ltr', cardWidth = 309.2, gap = '16px'): HTMLUListElement {
  const list = document.createElement('ul');
  list.style.direction = direction;
  list.style.columnGap = gap;
  const first = document.createElement('li');
  first.getBoundingClientRect = () => ({ width: cardWidth }) as DOMRect;
  list.append(first, document.createElement('li'));
  list.scrollBy = vi.fn() as unknown as typeof list.scrollBy;
  document.body.append(list);
  return list;
}

describe('nudgeRail', () => {
  it('moves an RTL track one card and its gap toward the reading end (negative scrollLeft)', () => {
    const list = track('rtl');
    nudgeRail(list, false);
    expect(list.scrollBy).toHaveBeenCalledWith({ left: -(309.2 + 16), behavior: 'smooth' });
  });

  it('moves an LTR track the same distance the other way, and back with direction -1', () => {
    const list = track('ltr');
    nudgeRail(list, false);
    expect(list.scrollBy).toHaveBeenLastCalledWith({ left: 309.2 + 16, behavior: 'smooth' });
    nudgeRail(list, false, -1);
    expect(list.scrollBy).toHaveBeenLastCalledWith({ left: -(309.2 + 16), behavior: 'smooth' });
  });

  it('jumps instead of gliding under reduced motion', () => {
    const list = track('rtl');
    nudgeRail(list, true);
    expect(list.scrollBy).toHaveBeenCalledWith({ left: -(309.2 + 16), behavior: 'auto' });
  });

  it('does nothing without a track', () => {
    expect(() => nudgeRail(null, false)).not.toThrow();
  });
});
