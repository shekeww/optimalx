import type { SVGAttributes } from 'react';

/**
 * The brand symbols in app/assets/ox-sprite.svg (DIRECTION 8.7):
 * categories, goals and the store's own promises. Each carries exactly one
 * accent element.
 *
 * `authentic`, `shipping` and `help` are a legacy trio: `shield-check`,
 * `truck` and `headset` redraw them (S2a, 2026-09-22). Two call sites under a
 * path this batch could not edit depend on the exact old ids —
 * `app/components/layout/Header/UtilityTrust.tsx` (`authentic`, `shipping`),
 * `app/components/listing/ZeroResults.tsx` and
 * `app/routes/account.notifications.tsx` (`help`) — which is why all three
 * old names stay (docs/build/progress/S2a.md has the full list, including a
 * few more `help` callers this batch left alone rather than edit without a
 * reason). Do not point a new caller at an old name; the conductor removes
 * whichever ones are unused once those files migrate.
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
  'headset',
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
  'shield-check',
  'truck',
  'bolt',
  'cart',
  'plus',
  'minus',
  'bundles',
  'digital-library',
] as const;

/**
 * Interface furniture: the contact mark, the registry seal, the label
 * attributes and the rating stars. Single `currentColor`, the same 1.8 stroke
 * as every brand symbol, and deliberately no accent element: the approved
 * design spends the accent four times on a page and a coloured chevron would
 * be a fifth.
 */
export const OX_UI_ICON_NAMES = [
  'whatsapp',
  // Legacy: three Header-owned components this batch could not edit still
  // read this name (docs/build/progress/S2a.md). Every chevron/arrow the
  // theme draws elsewhere is sallaicons (BUILD.md:221); do not add a new
  // caller for this one.
  'chevron-down',
  'registry',
  'vegan-leaf',
  'low-sugar',
  'gluten-free',
  'expand',
  'scoop-cup',
  'shaker',
  'shaker-straw',
  'star',
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
