import type { HTMLAttributes } from 'react';

/**
 * The colour pairs from DIRECTION 5.3 ProductCard: graphite for real
 * popularity data, an outlined card for "new", go for savings, note for low
 * stock and expiry, stop for out of stock. Never orange, never a shadow.
 */
export type BadgeTone = 'popular' | 'new' | 'saving' | 'note' | 'stop' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** 20 tall, micro 700, 6px radius, 8 horizontal padding. At most two stacked. */
export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  const classes = ['ox-badge', `ox-badge--${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

/** Column stack for up to two badges at a card's start corner. */
export function BadgeStack({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const classes = ['ox-badge-stack', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
