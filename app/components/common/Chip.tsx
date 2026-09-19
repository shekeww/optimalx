import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from './Icon';

interface ChipBaseProps {
  /** A 16px sprite symbol at the start of the label. */
  icon?: OxIconName;
  children: ReactNode;
}

export interface SpecChipProps
  extends ChipBaseProps,
    Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  kind?: 'spec';
  /** 24 tall on the card (default), 32 on the PDP. */
  size?: 'card' | 'pdp';
}

export interface FilterChipProps
  extends ChipBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  kind: 'filter';
  selected?: boolean;
  /** When given, a remove control (16 close icon, 44 hit area) sits at the end. */
  onRemove?: () => void;
  /** Accessible name of the remove control; defaults to the common close label. */
  removeLabel?: string;
}

export type ChipProps = SpecChipProps | FilterChipProps;

/**
 * Two kinds (DIRECTION 5.7 Chip): the static spec chip (servings, form,
 * expiry; a plate fill with a 16 icon) and the interactive filter chip (a 36
 * pill with the --ox-line-3 rest border of amendment A2; selected is an ink
 * fill with paper text; removable chips carry a close control at the end).
 */
export function Chip(props: ChipProps) {
  if (props.kind === 'filter') return <FilterChip {...props} />;
  const { kind: _kind, size = 'card', icon, className, children, ...rest } = props;
  const classes = ['ox-chip', 'ox-chip--spec', size === 'pdp' ? 'ox-chip--pdp' : null, className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      <span className="ox-chip__label">{children}</span>
    </span>
  );
}

function FilterChip({
  kind: _kind,
  icon,
  selected = false,
  onRemove,
  removeLabel,
  className,
  children,
  type = 'button',
  ...rest
}: FilterChipProps) {
  const { t } = useTranslation();
  const classes = [
    'ox-chip',
    'ox-chip--filter',
    selected ? 'is-selected' : null,
    onRemove ? 'ox-chip--removable' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onRemove) {
    // A removable chip is a label plus a separate remove button so the
    // remove action never nests inside another control.
    return (
      <span className={classes}>
        {icon ? <Icon name={icon} size={16} /> : null}
        <span className="ox-chip__label">{children}</span>
        <button
          type="button"
          className="ox-chip__remove"
          onClick={onRemove}
          aria-label={removeLabel ?? t('ox.common.close')}
        >
          <i className="sicon-cancel" aria-hidden="true" />
        </button>
      </span>
    );
  }

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      <span className="ox-chip__label">{children}</span>
    </button>
  );
}

/** A wrapping row of chips that keeps its 24px height when empty (equal-height cards). */
export function ChipRow({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const classes = ['ox-chip-row', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
