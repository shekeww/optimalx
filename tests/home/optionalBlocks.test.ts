import { describe, it, expect } from 'vitest';
import { HOME_BLOCK_HEIGHTS, HOME_BLOCK_HEIGHT_CSS } from '../../app/components/home/defaults';
import { BLOCK_SKELETONS } from '../../app/components/home/HomeSkeleton';

/**
 * The GATED home blocks: the ones that render null on the store as it stands,
 * because the data or the setting they depend on does not exist.
 *
 * The rule they all obey is the same one. A block that renders nothing must
 * reserve nothing and draw no placeholder, because a reserved box that later
 * collapses is a layout jump, and a skeleton is a promise of content that in
 * these cases never comes. The newsletter and banner taught this: while their
 * rows reserved 320 and 268, a phone got 588px of grey above the footer that
 * vanished on scroll.
 *
 * The list grew on 2026-09-20, and every addition was measured rather than
 * assumed (scratchpad/measured-2026-09-20.md):
 *
 *   ox-brands   the store has zero brands, so the strip renders nothing. It
 *               was reserving 80.
 *   ox-guides   no guide entries, so the block renders nothing. It was
 *               reserving 556, the single largest wasted reservation on the
 *               page.
 *   ox-poster   the campaign band is gated on a merchant headline and there
 *               is no campaign.
 *   ox-certifications  no product carries the per-product evidence a badge
 *               needs, so the resolver returns an empty list.
 *
 * A store that later turns one of these on takes the shift on that block
 * instead, which is the smaller cost and affects nobody today.
 *
 * `ox-categories` joined this list on 2026-09-22 (S2b): it is `OxNeeds`'
 * OTHER registered slot (register.ts), and whichever of `ox-goals` /
 * `ox-categories` is not first in the composition renders null, which is
 * `ox-categories` in every default composition (`ox-goals` sits right after
 * the hero; `ox-categories` sits after `ox-products-secondary`).
 */
const GATED = [
  'ox-newsletter',
  'ox-banner',
  'ox-brands',
  'ox-guides',
  'ox-poster',
  'ox-certifications',
  'ox-categories',
] as const;

describe('the gated home blocks', () => {
  it('reserve no height at either viewport', () => {
    for (const path of GATED) {
      expect(HOME_BLOCK_HEIGHTS[path].mobile, `${path} mobile`).toBe(0);
      expect(HOME_BLOCK_HEIGHTS[path].desktop, `${path} desktop`).toBe(0);
      expect(HOME_BLOCK_HEIGHT_CSS[path], `${path} css`).toBe('0px');
    }
  });

  it('draw no placeholder, because a skeleton promises content that may never land', () => {
    for (const path of GATED) {
      expect(BLOCK_SKELETONS[path](), `${path} skeleton`).toBeNull();
    }
  });

  it('leaves every block that does render reserving a real height', () => {
    const gated = new Set<string>(GATED);
    const others = Object.entries(HOME_BLOCK_HEIGHTS).filter(([path]) => !gated.has(path));
    expect(others.length).toBeGreaterThan(0);
    for (const [path, { mobile, desktop }] of others) {
      expect(mobile, `${path} mobile`).toBeGreaterThan(0);
      expect(desktop, `${path} desktop`).toBeGreaterThan(0);
    }
  });
});
