import type { HTMLAttributes } from 'react';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';

export type PriceSize = 'inherit' | 'small' | 'h3' | 'h2' | 'card' | 'hero';

export interface PriceProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  amount: number | string | undefined;
  /**
   * Type size; the amount is always 700 (600 at small). `card` is the
   * product card's 20/800 and `hero` the buy column's 36/800, both with the
   * currency mark in the accent after the digits (design regions 22 and 42).
   */
  size?: PriceSize;
  /** The was-price: small, --ox-fg-3, struck. */
  was?: boolean;
  /** Saving amounts render in --ox-go. */
  go?: boolean;
  currency?: string;
}

/**
 * Money in JSX, only ever through `useMoney().format()` (SAR renders the
 * `sicon-sar` glyph after the amount, in the engine's own order). The wrapper
 * is `unicode-bidi: isolate` so the amount and the glyph keep that order in
 * Arabic copy (DIRECTION 9.8). Never use this where a string is required
 * (alt, title, JSON-LD): pass the raw number plus "SAR" there instead.
 */
export function Price({ amount, size = 'inherit', was = false, go = false, currency, className, ...rest }: PriceProps) {
  const { format } = useMoney();
  const classes = [
    'ox-price',
    size !== 'inherit' ? `ox-price--${size}` : null,
    was ? 'ox-price--was' : null,
    go ? 'ox-price--go' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const options = currency ? { currency } : undefined;
  return (
    <span className={classes} {...rest}>
      {was ? <s>{format(amount, options)}</s> : format(amount, options)}
    </span>
  );
}
