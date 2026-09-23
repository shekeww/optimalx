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
  // The four goals the owner's reference contact sheet carries and the theme
  // did not (S6a fidelity pass, 2026-09-23). Drawn so the family is complete
  // as the owner reviewed it; no caller yet.
  'endurance',
  'immunity',
  'wellness',
  'better-sleep',
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
  // Added by S6a (2026-09-23) with the redraw: the two trust marks the trust
  // row was drawing with `sicon-*`, the training service, and the add-to-cart
  // variant the card and the bundle row need.
  'lock',
  'badge',
  'training',
  'cart-add',
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
  // The chrome set, drawn by S6a (2026-09-23) so a later batch can retire the
  // `sicon-*` glyphs one line at a time (docs/build/progress/S6a.md section 4).
  // Nothing here is wired up yet: the components that still carry `sicon-*`
  // are owned by other builders. `chevron-start`/`chevron-end` are drawn in
  // LTR geometry and mirror through `.ox-mirror`, like every other
  // direction-indicating glyph in the theme.
  'chevron-up',
  'chevron-start',
  'chevron-end',
  'arrow',
  'close',
  'check',
  'search',
  'user',
  'heart',
  'home',
  'menu',
  'list',
  'grid',
  'filter',
  'sort',
  'play',
  'pause',
  'external',
  'info',
  'warning',
  'globe',
  'store',
  'rotate',
  'document',
  'archive',
  'check-circle',
  'clock',
  'calendar',
  'mail',
  'phone',
  'map-pin',
  // The logo's X, traced from public/assets/brand/optimalx-mark.png into 18
  // straight-edged vertices (X-IDENTITY-2026-09-22.md §1.6). It is the mark,
  // so it is used sparingly and only
  // where the brand is speaking: a section's corner cut, an empty state, the
  // scroll-to-top, a watermark behind a dark band. It is never a UI glyph and
  // never stands in for a chevron, a close or a tick.
  'mark',
] as const;

/**
 * Symbols that ship a simplified optical twin, `#ox-{name}-s`, for 16 and 20
 * (owner brief, 2026-09-23: "produce simplified optical variants for 16/20px
 * and standard variants for 24/32/36px rather than mechanically scaling
 * detailed SVGs"). Fewer parts, fatter counters, the accent kept only where
 * it still reads. Every other symbol is already simple enough to hold at 16
 * and falls back to its standard drawing.
 *
 * The ten product-category symbols are deliberately absent: the owner
 * restored them verbatim from the pre-redraw sprite on 2026-09-24, so they
 * must paint as the one original drawing at every size, 16 and 20 included.
 */
export const OX_SIMPLIFIED_ICON_NAMES = [
  'goal-energy',
  'goal-performance',
  'goal-recovery',
  'goal-ideal-weight',
  'goal-general-health',
  'goal-hair-skin',
  'endurance',
  'wellness',
  'shield-check',
  'authentic',
  'truck',
  'whatsapp',
  'phone',
  'points',
  'cart',
  'digital-library',
] as const;

/** The size at or below which the simplified twin is used. */
export const OX_SIMPLIFIED_MAX_SIZE = 20;

/**
 * The only symbols that mirror under RTL: navigation and direction. Every
 * other symbol — and above all the brand-derived chamfer and `ox-mark` —
 * keeps its geometry in both directions (DIRECTION 3.4, owner brief
 * "preserve brand geometry in RTL"). The flip itself is the theme's existing
 * `.ox-mirror` rule (`_primitives.scss`), not a new transform here.
 */
export const OX_MIRRORED_ICON_NAMES = [
  'chevron-start',
  'chevron-end',
  'arrow',
  'external',
  'play',
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
  // Two optical variants, not one drawing scaled: below 21 the simplified
  // twin is used where one exists.
  const simplified =
    size <= OX_SIMPLIFIED_MAX_SIZE &&
    (OX_SIMPLIFIED_ICON_NAMES as readonly string[]).includes(name);
  const symbolId = simplified ? `ox-${name}-s` : `ox-${name}`;
  const mirrored = (OX_MIRRORED_ICON_NAMES as readonly string[]).includes(name);
  const classes = [
    'ox-icon',
    `ox-icon--${size}`,
    mirrored ? 'ox-mirror' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
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
      <use href={`#${symbolId}`} />
    </svg>
  );
}
