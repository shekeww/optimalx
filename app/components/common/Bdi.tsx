import type { HTMLAttributes } from 'react';

export interface BdiProps extends Omit<HTMLAttributes<HTMLElement>, 'lang'> {
  /**
   * Language of the isolated run. Latin product and brand names carry
   * `lang="en"` so screen readers switch voice (DIRECTION A5). Pass `null`
   * to omit the attribute for a run that is not English.
   */
  lang?: string | null;
  /** Force strict left-to-right (phone numbers, SKUs, URLs, promo codes). */
  ltr?: boolean;
}

/**
 * A bidi-isolated island inside Arabic copy: `<bdi lang="en">` for catalogue
 * names, or `<bdi dir="ltr">` for things that must read strictly left to
 * right. Punctuation belongs outside the island (DIRECTION 3.4).
 */
export function Bdi({ lang = 'en', ltr = false, className, children, ...rest }: BdiProps) {
  const classes = ['ox-bdi', ltr ? 'ox-ltr' : null, className].filter(Boolean).join(' ');
  return (
    <bdi className={classes} lang={lang ?? undefined} dir={ltr ? 'ltr' : undefined} {...rest}>
      {children}
    </bdi>
  );
}
