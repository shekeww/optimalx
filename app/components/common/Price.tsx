import {
  Children,
  isValidElement,
  cloneElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

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

/** The engine marks its SAR symbol with this class, wherever it renders it. */
const SAR_GLYPH_CLASS = 'sicon-sar';

function hasSarGlyphClass(value: unknown): boolean {
  return typeof value === 'string' && value.split(/\s+/).includes(SAR_GLYPH_CLASS);
}

/**
 * Wraps the engine's SAR glyph node so it stays the visible mark while still
 * carrying real text, anywhere in the node the money formatter returned.
 *
 * `useMoney().format()` renders the riyal as `<i class="sicon-sar" />`, drawn
 * from the `sallaicons` icon font (theme-engine dist/chunk-UR7G7GK2.js:363).
 * Verified 2026-09-22 against the live font (`cdn.assets.salla.network/
 * static/fonts/lib/sallaicons/sallaicons.ttf`, codepoint U+E9BC, rasterised
 * and inspected): the glyph draws Salla's current official Saudi Riyal
 * symbol, not the old `﷼` (U+FDFC) ligature, so it is the platform's correct
 * visible mark and the right thing to keep on screen. What it cannot do alone
 * is speak: an icon-font glyph is not text, so it cannot be copied and a
 * screen reader announces nothing. This wraps it in a `role="img"` span with
 * an `aria-label`, plus a genuinely-selectable `ox-sr-only` text node, so
 * bots, crawlers and screen readers all get the written mark while sighted
 * users keep Salla's own symbol. `use_sar_symbol` (`store.settings`) does not
 * gate this: the engine's own `useMoney().format()` always returns the icon
 * for SAR regardless of that setting, so this wrap always applies too.
 *
 * The walk is generic rather than a match on the exact fragment shape, so a
 * release that wraps or reorders the symbol keeps working. This is the one
 * place the theme formats money, so every price on every page changes here and
 * no call site knows about it.
 */
function withWrittenCurrency(node: ReactNode, mark: string): ReactNode {
  if (Array.isArray(node)) {
    return Children.map(node, (child) => withWrittenCurrency(child, mark));
  }
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ className?: unknown; children?: ReactNode }>;
  if (hasSarGlyphClass(element.props.className)) {
    return (
      <span className="ox-price__mark" role="img" aria-label={mark} key={element.key ?? undefined}>
        <i className="sicon-sar" aria-hidden="true" />
        <span className="ox-sr-only">{mark}</span>
      </span>
    );
  }
  if (element.props.children === undefined) return element;
  return cloneElement(element, undefined, withWrittenCurrency(element.props.children, mark));
}

/**
 * Money in JSX, only ever through `useMoney().format()`. The wrapper is
 * `unicode-bidi: isolate` so the amount and the mark keep the engine's order
 * in Arabic copy (DIRECTION 9.8). Never use this where a string is required
 * (alt, title, JSON-LD): pass the raw number plus "SAR" there instead.
 */
export function Price({
  amount,
  size = 'inherit',
  was = false,
  go = false,
  currency,
  className,
  ...rest
}: PriceProps) {
  const { format } = useMoney();
  const { t } = useTranslation();
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
  const formatted = withWrittenCurrency(format(amount, options) as ReactNode, t('ox.common.sar'));
  return (
    <span className={classes} {...rest}>
      {was ? <s>{formatted}</s> : formatted}
    </span>
  );
}
