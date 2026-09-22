import type { SVGAttributes } from 'react';

/**
 * LEGACY SHIM, pending deletion (S2a icon-system batch, 2026-09-22).
 *
 * Every glyph this file used to draw now lives in the shared sprite
 * (`app/assets/ox-sprite.svg` via `common/Icon.tsx`): the nine duplicates
 * folded in unchanged, `chevron-up`/`chevron-down`/`chevron-end` moved to
 * `sallaicons` per BUILD.md:221 (`chevron-down` keeps one sprite exception
 * elsewhere, not through this file), and `cart`/`plus`/`minus` moved to the
 * sprite as new brand symbols (BUILD.md 3.5's weight law and accent rule).
 *
 * Two call sites this batch could not edit still import this export —
 * `app/components/layout/Header/MainBar.tsx:124` and
 * `.../Header/MobileHeader.tsx:69`, both under the Header batch's restricted
 * path (docs/build/progress/S2a.md lists the request). This file now draws
 * `cart` alone, the exact shape it always drew, so those two callers render
 * unchanged until their owner repoints them to `<Icon name="cart" />` (the
 * sprite's bag, not this trolley) and the conductor deletes this file.
 */
export const PDP_ICON_NAMES = ['cart'] as const;

export type PdpIconName = (typeof PDP_ICON_NAMES)[number];

/** Each glyph is a list of path commands on the shared 24 grid. */
const PATHS: Record<PdpIconName, string[]> = {
  cart: [
    'M2.8 3.6h2.4l2.3 10.6h9.5l2.2-7.7H6.2',
    'M9.4 19.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
    'M16.6 19.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
  ],
};

export interface PdpIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: PdpIconName;
  /** Drawn size in CSS pixels; the geometry is the same at every size. */
  size?: number;
  /** Accessible name; without one the glyph is decorative. */
  label?: string;
}

export function PdpIcon({ name, size = 20, label, className, ...rest }: PdpIconProps) {
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
      fill="none"
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
