import type { SVGAttributes } from 'react';

/**
 * The brand symbols in app/assets/ox-sprite.svg (DIRECTION 8.7):
 * categories, goals and the store's own promises. Each carries exactly one
 * accent element.
 */
export const OX_BRAND_ICON_NAMES = [
  'protein',
  'creatine',
  'pre-workout',
  'amino-acids',
  'omega-3',
  'vitamins-minerals',
  'collagen-beauty',
  'daily-health',
  'snacks-bars',
  'accessories',
  'goal-energy',
  'goal-general-health',
  'goal-performance',
  'goal-recovery',
  'goal-hair-skin',
  'goal-ideal-weight',
  'authentic',
  'expiry',
  'shipping',
  'secure-payment',
  'help',
  'written-question',
  'video-consult',
  'branch-visit',
  'servings',
  'serving-size',
  'form',
  'plan',
  'points',
  'gift',
  'referral',
  'tick',
] as const;

/**
 * Interface furniture: chevrons, the contact mark, the registry seal, the
 * label attributes and the rating stars. Single `currentColor`, stroke 1.5,
 * and deliberately no accent element: the approved design spends the accent
 * four times on a page and a coloured chevron would be a fifth.
 */
export const OX_UI_ICON_NAMES = [
  'whatsapp',
  'chevron-down',
  'chevron-fwd',
  'chevron-double',
  'registry',
  'vegan-leaf',
  'low-sugar',
  'gluten-free',
  'expand',
  'scoop-cup',
  'shaker',
  'shaker-straw',
  'star',
  'star-half',
  // The logo's X, traced from public/assets/brand/optimalx-mark.png into 29
  // straight-edged vertices. It is the mark, so it is used sparingly and only
  // where the brand is speaking: a section's corner cut, an empty state, the
  // scroll-to-top, a watermark behind a dark band. It is never a UI glyph and
  // never stands in for a chevron, a close or a tick.
  'mark',
] as const;

export const OX_ICON_NAMES = [...OX_BRAND_ICON_NAMES, ...OX_UI_ICON_NAMES] as const;

export type OxIconName = (typeof OX_ICON_NAMES)[number];
/**
 * Any drawn size. The four classic steps keep their modifier class; every
 * other size arrives as `--ox-icon-size`, so the chrome can draw an 18px
 * chevron or a 34px badge without a new class per number.
 */
export type OxIconSize = number;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: OxIconName;
  /** Rendered size; one symbol serves every size (no separate 16 set). */
  size?: OxIconSize;
  /**
   * Accessible name. Without it the icon is decorative (`aria-hidden`);
   * with it the svg is `role="img"` and announced. Icon-only buttons should
   * label the button, not the icon.
   */
  label?: string;
}

/**
 * One symbol from the inline sprite (`<Sprite />` is rendered once by the
 * layout). Stroke and accent colours come from CSS: `currentColor` for the
 * strokes and `--ox-accent` for the one accent element. Never mirrored.
 */
export function Icon({ name, size = 24, label, className, style, ...rest }: IconProps) {
  const classes = ['ox-icon', `ox-icon--${size}`, className].filter(Boolean).join(' ');
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const };
  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ ['--ox-icon-size' as string]: `${size}px`, ...style }}
      {...a11y}
      {...rest}
    >
      <use href={`#ox-${name}`} />
    </svg>
  );
}
