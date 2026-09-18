import type { SVGAttributes } from 'react';

/** The 32 symbols in public/assets/icons/ox-sprite.svg (DIRECTION 8.7). */
export const OX_ICON_NAMES = [
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

export type OxIconName = (typeof OX_ICON_NAMES)[number];
export type OxIconSize = 16 | 20 | 24 | 32;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: OxIconName;
  /** Rendered size; the same symbol serves all four (no separate 16 set). */
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
export function Icon({ name, size = 24, label, className, ...rest }: IconProps) {
  const classes = ['ox-icon', `ox-icon--${size}`, className].filter(Boolean).join(' ');
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const };
  return (
    <svg className={classes} width={size} height={size} viewBox="0 0 24 24" {...a11y} {...rest}>
      <use href={`#ox-${name}`} />
    </svg>
  );
}
