import type { SVGAttributes } from 'react';

/**
 * The mark itself, `X-IDENTITY-2026-09-22.md` §1.6/§4.1's render path: an
 * inline `<svg><use href="#ox-mark"/></svg>` against the already-inlined
 * sprite (`app/assets/ox-sprite.svg`), the same pattern
 * `app/components/home/PlanCard.tsx:46` uses via `<Icon name="mark">`. Never
 * a `url()` image request, never an `<img>`, no new render-blocking asset —
 * this component adds no bytes the sprite does not already ship.
 *
 * `<Icon name="mark">` already covers the generic case; this component exists
 * for callers that need the mark specifically (the watermark, the 404/empty
 * figure, the header lockup) and want a typed `tone` rather than a bare
 * `className`/`color`, so a caller cannot casually reach for `--ox-accent`
 * (BUILD 3.1 reserves it for interactive elements — see the watermark fix in
 * §4.1/§9 judge change 18) without naming it explicitly.
 */
const TONE_VAR: Record<XMarkTone, string> = {
  ink: 'var(--ox-ink)',
  'ink-on-dark': 'var(--ox-ink-on-dark)',
  'plate-2': 'var(--ox-plate-2)',
  current: 'currentColor',
};

export type XMarkTone = 'ink' | 'ink-on-dark' | 'plate-2' | 'current';

export interface XMarkProps extends Omit<SVGAttributes<SVGSVGElement>, 'name' | 'color'> {
  /** Rendered size in px, both axes (the mark's bbox is not square: 493.28 by
   * 436, but every caller in this theme sizes it by inline-size and lets the
   * height follow the viewBox's own aspect). */
  size?: number;
  /** Named ink role. Never `'accent'`: BUILD 3.1 reserves the accent for
   * things people can click, and the mark is decorative everywhere this
   * component is used (watermark, 404/empty figure, header lockup ground). */
  tone?: XMarkTone;
  /** Accessible name. Without it the mark is `aria-hidden` (the default:
   * every current use — watermark, figure, lockup ground — is decorative). */
  label?: string;
}

export function XMark({ size = 24, tone = 'current', label, className, style, ...rest }: XMarkProps) {
  const classes = ['ox-x-mark', className].filter(Boolean).join(' ');
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const };
  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color: TONE_VAR[tone], ...style }}
      {...a11y}
      {...rest}
    >
      <use href="#ox-mark" />
    </svg>
  );
}
