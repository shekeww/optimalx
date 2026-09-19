import type { HTMLAttributes, ReactNode } from 'react';
import { Icon, type OxIconName } from './Icon';

/**
 * The empty state (DIRECTION 5.6). Anatomy: a 48 mark in brand orange (the one
 * orange decoration allowed outside buttons and the hero stroke), an h3 title,
 * one body line in `--ox-fg-2`, one primary route out and an optional
 * secondary. Centred in the content column, max 420 for the text, nothing
 * mirrors in RTL.
 *
 * Copy always arrives as rendered nodes from the owning page: this primitive
 * holds no strings. The engine's own no-content placeholder markup is replaced
 * rather than styled, so the box matches the reserved height of the block it
 * stands in.
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Sprite symbol for the 48 mark; omit for a state that needs no decoration. */
  icon?: OxIconName;
  title: ReactNode;
  /** One line. Two sentences at most; a wall of text is a design failure here. */
  body?: ReactNode;
  /** The route out. Pass a `Button` (or a link styled as one). */
  primary?: ReactNode;
  secondary?: ReactNode;
  /** Chips, links or a search field under the actions (search zero results). */
  footer?: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
}

export function EmptyState({
  icon,
  title,
  body,
  primary,
  secondary,
  footer,
  headingLevel: Heading = 'h3',
  className,
  ...rest
}: EmptyStateProps) {
  const classes = ['ox-empty', className].filter(Boolean).join(' ');
  const titleClass = Heading === 'h1' ? 'ox-h1' : Heading === 'h2' ? 'ox-h2' : 'ox-h3';
  return (
    <div className={classes} {...rest}>
      {icon ? (
        <span className="ox-empty__mark">
          <Icon name={icon} size={32} />
        </span>
      ) : null}
      <Heading className={`ox-empty__title ${titleClass}`}>{title}</Heading>
      {body ? <p className="ox-empty__body ox-body">{body}</p> : null}
      {primary || secondary ? (
        <div className="ox-empty__actions">
          {primary}
          {secondary}
        </div>
      ) : null}
      {footer ? <div className="ox-empty__footer">{footer}</div> : null}
    </div>
  );
}
