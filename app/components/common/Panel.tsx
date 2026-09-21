import { Children, type ReactNode } from 'react';

/**
 * The panel: the cream card with a hairline and a heading at the RTL start.
 *
 * It is the unit the approved image uses for every block of structured
 * content, and the product page already ships its CSS (`.ox-panel`,
 * `.ox-panels`, `.ox-details__*` in `_b3-product.scss`, declared unscoped).
 * What was missing was a React wrapper any page could reach for, so this is
 * that wrapper and nothing more: it adds no new visual idea, and the one
 * class it introduces on top of the product's set is the `--plate` tone.
 *
 * A panel separates from the page by value and a 1px hairline. It never
 * carries a drop shadow, because the approved image does not have one.
 */
export interface PanelProps {
  /** `.ox-panel__title`, at the RTL start of the head row. */
  title?: ReactNode;
  headingLevel?: 'h2' | 'h3';
  /** Optional control at the inline end of the head row. */
  action?: ReactNode;
  /** `plate` swaps the cream fill for the warm beige plate. */
  tone?: 'card' | 'plate';
  id?: string;
  className?: string;
  /** Overrides the default `data-testid`, so a page can name its own panel. */
  testId?: string;
  children: ReactNode;
}

export function Panel({
  title,
  headingLevel: Heading = 'h3',
  action,
  tone = 'card',
  id,
  className,
  testId,
  children,
}: PanelProps) {
  const classes = [
    'ox-panel',
    tone === 'plate' ? 'ox-panel--plate' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} id={id} data-testid={testId ?? 'ox-panel'}>
      {title || action ? (
        <div className="ox-panel__head">
          {title ? <Heading className="ox-panel__title">{title}</Heading> : null}
          {action ? <div className="ox-panel__action">{action}</div> : null}
        </div>
      ) : null}
      <div className="ox-panel__body">{children}</div>
    </section>
  );
}

export interface PanelRowProps {
  label: ReactNode;
  value: ReactNode;
}

/**
 * One key and value row inside a panel: the `.ox-details__row` contract read
 * off the approved image. The key is the muted weight at the RTL start, the
 * value is the heavier weight at the end, and the row carries the hairline.
 */
export function PanelRow({ label, value }: PanelRowProps) {
  return (
    <div className="ox-details__row" data-testid="ox-panel-row">
      <span className="ox-details__key">{label}</span>
      <span className="ox-details__value">{value}</span>
    </div>
  );
}

export interface PanelRowGroupProps {
  children: ReactNode;
}

/**
 * The row wrapper that stretches one to three panels to a common height.
 *
 * `data-count` is the real number of panels, which is what the product
 * stylesheet's `.ox-panels[data-count]` rules re-space against: two panels
 * take the 3/4 split and one takes the whole row, so a page that gates a
 * panel off never leaves a column hanging. With nothing to render it returns
 * null rather than an empty grid that still eats a gap.
 */
export function PanelRowGroup({ children }: PanelRowGroupProps) {
  // `Children.toArray` already drops null, undefined and booleans, which is
  // exactly what a gated panel renders; what survives is the real columns.
  const panels = Children.toArray(children);
  if (panels.length === 0) return null;
  return (
    <div className="ox-panels" data-count={panels.length}>
      {panels}
    </div>
  );
}

export default Panel;
