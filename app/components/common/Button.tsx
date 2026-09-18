import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
/** Heights: 40 compact (table rows, chip actions), 44 default, 48 page actions. */
export type ButtonSize = 40 | 44 | 48;

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full width of its container. */
  block?: boolean;
  /** A 20px icon before the label (mirrors only if the caller wraps it in .ox-mirror). */
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /**
   * Width locked to the resting width, label hidden, a 20px ring centred.
   * The control stays in the DOM and announces `aria-busy`.
   */
  loading?: boolean;
  /** Primary only: swaps the label for a tick plus `confirmedLabel` for --dur-confirm. */
  confirmed?: boolean;
  confirmedLabel?: ReactNode;
  /**
   * `aria-disabled` keeps the control discoverable (focusable, announced)
   * while blocking activation; the native `disabled` removes it from the
   * tab order. Use `disabled` only for hidden or out-of-stock products.
   */
  ariaDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: undefined;
  href?: undefined;
}

export interface ButtonAsLinkProps
  extends ButtonBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> {
  /** Internal route: rendered through the engine `Link` (locale prefixing, preload). */
  to?: string;
  /** External URL: a plain anchor. */
  href?: string;
  disabled?: boolean;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function classesFor(
  { variant = 'primary', size = 44, block, loading, confirmed, className }: ButtonBaseProps,
  disabled: boolean
) {
  return [
    'ox-btn',
    `ox-btn--${variant}`,
    variant === 'link' ? null : `ox-btn--s${size}`,
    block ? 'ox-btn--block' : null,
    loading ? 'is-loading' : null,
    confirmed && variant === 'primary' ? 'is-confirmed' : null,
    disabled ? 'is-disabled' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The button (DIRECTION 5.7). Four variants, three heights, the states:
 * hover, focus ring (offset 2), pressed (1px translate), disabled (plate-2
 * fill, ink-4 label), loading (width locked) and confirmed (tick). Renders a
 * `<button>`, or an anchor when `to` (engine Link) or `href` is given.
 * `SallaButton` and `s-button-element` take the same `ox-btn*` classes.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  props,
  ref
) {
  const { t } = useTranslation();
  const {
    variant = 'primary',
    size = 44,
    block,
    iconStart,
    iconEnd,
    loading = false,
    confirmed = false,
    confirmedLabel,
    ariaDisabled = false,
    className,
    children,
    ...rest
  } = props;

  const innerRef = useRef<HTMLElement | null>(null);
  const [lockedWidth, setLockedWidth] = useState<number | null>(null);

  // Lock the resting width the moment loading starts so the ring replaces
  // the label without the control changing size (DIRECTION 5.7 "loading").
  useLayoutEffect(() => {
    if (!loading) {
      setLockedWidth(null);
      return;
    }
    const node = innerRef.current;
    if (!node) return;
    const width = node.getBoundingClientRect().width;
    if (width > 0) setLockedWidth(width);
  }, [loading]);

  const setRefs = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | HTMLAnchorElement | null }).current = node;
  };

  const showConfirmed = confirmed && variant === 'primary';
  const label = (
    <span className="ox-btn__label">
      {iconStart ? <span className="ox-btn__icon">{iconStart}</span> : null}
      {showConfirmed ? (
        <>
          <svg className="ox-icon ox-icon--20" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <use href="#ox-tick" />
          </svg>
          {confirmedLabel ?? children}
        </>
      ) : (
        children
      )}
      {iconEnd ? <span className="ox-btn__icon">{iconEnd}</span> : null}
    </span>
  );
  const loader = loading ? (
    <span className="ox-btn__loader" role="status" aria-label={t('ox.common.loading')} />
  ) : null;
  const lockStyle = lockedWidth !== null ? { minInlineSize: `${lockedWidth}px` } : undefined;

  if ('to' in props && props.to !== undefined) {
    const { to, disabled, style, ...anchorRest } = rest as ButtonAsLinkProps;
    const isDisabled = Boolean(disabled) || ariaDisabled;
    const classes = classesFor({ variant, size, block, loading, confirmed: showConfirmed, className }, isDisabled);
    return (
      <Link
        to={to}
        ref={setRefs as unknown as Ref<HTMLAnchorElement>}
        className={classes}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        style={{ ...style, ...lockStyle }}
        {...(anchorRest as Record<string, unknown>)}
      >
        {label}
        {loader}
      </Link>
    );
  }

  if ('href' in props && props.href !== undefined) {
    const { href, disabled, style, ...anchorRest } = rest as ButtonAsLinkProps;
    const isDisabled = Boolean(disabled) || ariaDisabled;
    const classes = classesFor({ variant, size, block, loading, confirmed: showConfirmed, className }, isDisabled);
    return (
      <a
        href={isDisabled ? undefined : href}
        ref={setRefs}
        className={classes}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        style={{ ...style, ...lockStyle }}
        {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {label}
        {loader}
      </a>
    );
  }

  const { type = 'button', disabled, style, onClick, ...buttonRest } = rest as ButtonAsButtonProps;
  const isDisabled = Boolean(disabled);
  const classes = classesFor(
    { variant, size, block, loading, confirmed: showConfirmed, className },
    isDisabled || ariaDisabled
  );
  return (
    <button
      type={type}
      ref={setRefs}
      className={classes}
      disabled={isDisabled}
      aria-disabled={ariaDisabled || undefined}
      aria-busy={loading || undefined}
      onClick={ariaDisabled || loading ? (event) => event.preventDefault() : onClick}
      style={{ ...style, ...lockStyle }}
      {...buttonRest}
    >
      {label}
      {loader}
    </button>
  );
});
