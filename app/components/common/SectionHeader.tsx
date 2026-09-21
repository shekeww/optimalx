import type { HTMLAttributes, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export type HeadingLevel = 'h1' | 'h2' | 'h3';

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The section heading; an h2 unless the page says otherwise. */
  title: ReactNode;
  as?: HeadingLevel;
  /**
   * Rendered only when given, and only when it states a fact the heading
   * lacks (amendment A4): the H1 keyword line, the district, a live count.
   * Never a decorative label.
   */
  eyebrow?: ReactNode;
  /** The "view all" link at the end of the title row; label defaults to ox.common.view_all. */
  viewAll?: { to: string; label?: ReactNode };
  /** Desktop-only slot at the end of the title row (slider arrows). */
  actions?: ReactNode;
  /** Ids for the heading (aria-labelledby targets). */
  titleId?: string;
}

/**
 * Section header (DIRECTION 5.2): optional eyebrow row (24 by 2 accent rule
 * plus a small 600 label), the centred title, and the "view
 * all" link whose chevron mirrors in RTL and moves 2px on hover.
 */
export function SectionHeader({
  title,
  as: Heading = 'h2',
  eyebrow,
  viewAll,
  actions,
  titleId,
  className,
  ...rest
}: SectionHeaderProps) {
  const { t } = useTranslation();
  const titleClass = Heading === 'h1' ? 'ox-h1' : Heading === 'h3' ? 'ox-h3' : 'ox-h2';
  const classes = ['ox-sh', className].filter(Boolean).join(' ');
  return (
    <header className={classes} {...rest}>
      {eyebrow ? <p className="ox-sh__eyebrow">{eyebrow}</p> : null}
      <Heading className={`ox-sh__title ${titleClass}`} id={titleId}>
        {title}
      </Heading>
      {actions ? <div className="ox-sh__actions">{actions}</div> : null}
      {viewAll ? (
        <Link to={viewAll.to} className="ox-sh__link">
          <span>{viewAll.label ?? t('ox.common.view_all')}</span>
          <i className="sicon-keyboard_arrow_right ox-sh__chevron ox-mirror" aria-hidden="true" />
        </Link>
      ) : null}
    </header>
  );
}
