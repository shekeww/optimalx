import { describe, it, expect } from 'vitest';
import { HOME_BLOCK_HEIGHTS, HOME_BLOCK_HEIGHT_CSS } from '../../app/components/home/defaults';
import { BLOCK_SKELETONS } from '../../app/components/home/HomeSkeleton';

/**
 * The newsletter is behind the `show_newsletter` setting and the banner is
 * behind an uploaded image, so on a store that has set neither, both render
 * null. While their rows still reserved 320 and 268, a phone got 588px of grey
 * placeholder above the footer which then collapsed on scroll: the largest
 * layout jump on the page, and a skeleton promising content that never came.
 *
 * DIRECTION 6.2 already said the banner's row reserves 0. These keep the map
 * and the placeholders honest about it.
 */
const OPTIONAL = ['ox-newsletter', 'ox-banner'] as const;

describe('the two optional home blocks', () => {
  it('reserve no height at either viewport', () => {
    for (const path of OPTIONAL) {
      expect(HOME_BLOCK_HEIGHTS[path].mobile, `${path} mobile`).toBe(0);
      expect(HOME_BLOCK_HEIGHTS[path].desktop, `${path} desktop`).toBe(0);
      expect(HOME_BLOCK_HEIGHT_CSS[path], `${path} css`).toBe('0px');
    }
  });

  it('draw no placeholder, because a skeleton promises content that may never land', () => {
    for (const path of OPTIONAL) {
      expect(BLOCK_SKELETONS[path](), `${path} skeleton`).toBeNull();
    }
  });

  it('leaves every other block reserving a real height', () => {
    const optional = new Set<string>(OPTIONAL);
    const others = Object.entries(HOME_BLOCK_HEIGHTS).filter(([path]) => !optional.has(path));
    expect(others.length).toBeGreaterThan(0);
    for (const [path, { mobile, desktop }] of others) {
      expect(mobile, `${path} mobile`).toBeGreaterThan(0);
      expect(desktop, `${path} desktop`).toBeGreaterThan(0);
    }
  });
});
