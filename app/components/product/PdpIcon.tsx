import type { SVGAttributes } from 'react';

/**
 * The glyphs the approved product page needs that the shared sprite does not
 * carry yet (`common/Icon.tsx` and `ox-sprite.svg` belong to the chrome
 * batch). They are drawn inline here, in the product batch's own file, so this
 * page is never blocked waiting on a sprite commit.
 *
 * House style, identical to the sprite's: a 24 box, stroke 1.5, round caps and
 * joins, `currentColor`, no fill, never mirrored.
 */
export const PDP_ICON_NAMES = [
  'vegan-leaf',
  'low-sugar',
  'gluten-free',
  'expand',
  'scoop-cup',
  'shaker',
  'shaker-straw',
  'chevron-up',
  'chevron-down',
  'chevron-end',
  'star',
  'cart',
  'plus',
  'minus',
] as const;

export type PdpIconName = (typeof PDP_ICON_NAMES)[number];

/** Each glyph is a list of path commands on the shared 24 grid. */
const PATHS: Record<PdpIconName, string[]> = {
  'vegan-leaf': [
    'M20.2 3.8C9.9 4.6 4.4 9 4.4 15.3c0 1.7.5 3.3 1.4 4.6',
    'M20.2 3.8c.8 9.9-3.6 15.6-9.9 15.6-1.5 0-3-.3-4.5-1',
    'M5.8 19.9C7.6 14.3 11.4 10 17 7.4',
  ],
  'low-sugar': [
    'M12 3.6c3.4 4 5.3 6.6 5.3 9a5.3 5.3 0 0 1-10.6 0c0-2.4 1.9-5 5.3-9z',
    'M4.8 4.8 19.2 19.2',
  ],
  'gluten-free': [
    'M12 20.5V9',
    'M12 9c0-2.2 1.6-3.8 3.9-3.8C15.9 7.4 14.3 9 12 9z',
    'M12 13.4c0-2.2 1.6-3.8 3.9-3.8 0 2.2-1.6 3.8-3.9 3.8z',
    'M12 9c0-2.2-1.6-3.8-3.9-3.8C8.1 7.4 9.7 9 12 9z',
    'M4.8 4.8 19.2 19.2',
  ],
  expand: ['M9.5 3.5H3.5v6', 'M14.5 3.5h6v6', 'M9.5 20.5H3.5v-6', 'M14.5 20.5h6v-6'],
  'scoop-cup': [
    'M5.5 7.5h13l-1.3 11.1a2.2 2.2 0 0 1-2.2 1.9H9a2.2 2.2 0 0 1-2.2-1.9z',
    'M8 4.2h8v3.3H8z',
    'M6.6 12h10.8',
  ],
  shaker: [
    'M7.6 7.5h8.8l.9 11.1a2 2 0 0 1-2 2.2H8.7a2 2 0 0 1-2-2.2z',
    'M8.6 3.2h6.8v4.3H8.6z',
    'M7.2 11.8h9.6',
  ],
  'shaker-straw': [
    'M7.6 9.5h8.8l.9 9.1a2 2 0 0 1-2 2.2H8.7a2 2 0 0 1-2-2.2z',
    'M7.1 13.2h9.8',
    'M14.4 9.5 17 3.2',
    'M15.4 3.2h3.2',
  ],
  'chevron-up': ['M6 14.5 12 8.5l6 6'],
  'chevron-down': ['M6 9.5 12 15.5l6-6'],
  'chevron-end': ['M14.5 6 8.5 12l6 6'],
  star: ['M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z'],
  cart: [
    'M2.8 3.6h2.4l2.3 10.6h9.5l2.2-7.7H6.2',
    'M9.4 19.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
    'M16.6 19.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
  ],
  plus: ['M12 5.5v13', 'M5.5 12h13'],
  minus: ['M5.5 12h13'],
};

export interface PdpIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: PdpIconName;
  /** Drawn size in CSS pixels; the geometry is the same at every size. */
  size?: number;
  /** Accessible name; without one the glyph is decorative. */
  label?: string;
  /** The star fills rather than strokes, so a rating reads at 14px. */
  filled?: boolean;
}

export function PdpIcon({ name, size = 20, label, filled = false, className, ...rest }: PdpIconProps) {
  const classes = ['ox-pdp-icon', className].filter(Boolean).join(' ');
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const };
  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default PdpIcon;
