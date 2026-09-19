import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';

/**
 * Tooltip (DIRECTION 5.7 "Tooltip").
 *
 * Used only to surface the label of an icon-only button, never for information
 * that matters and never on touch (the `@media (hover: none)` rule in
 * `_primitives.scss` section 11 removes it there, where the label is visible
 * or the action is self-evident). A 32 tall graphite panel with small paper
 * text, 8 from the trigger, fading in over `--dur-fast`.
 *
 * The panel is a sibling of the trigger rather than a `title` attribute so the
 * text is styleable and announced through `aria-describedby`; the trigger keeps
 * its own accessible name (`aria-label` on the button), so a screen reader
 * never hears the label twice.
 */
export interface TooltipProps {
  /** The tooltip text. Two or three words. */
  label: ReactNode;
  /** The icon-only control. It keeps its own `aria-label`. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /** Above the trigger instead of below (header actions near the viewport end). */
  placement?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ label, children, placement = 'bottom', className }: TooltipProps) {
  const id = useId();
  const describedBy = `${id}-tooltip`;
  const classes = ['ox-tooltip', `ox-tooltip--${placement}`, className].filter(Boolean).join(' ');
  const trigger =
    children.props['aria-describedby'] === undefined
      ? cloneElement(children, { 'aria-describedby': describedBy })
      : children;
  return (
    <span className={classes}>
      {trigger}
      <span className="ox-tooltip__panel" id={describedBy} role="tooltip" data-ox-tooltip="">
        {label}
      </span>
    </span>
  );
}
