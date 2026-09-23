import { useEffect, useState } from 'react';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { hoursStatus, parseBranchHours } from '../../content/branch';
import { channelById } from '../../content/services';
import { pathForSku } from '../../content/salla-ids';
import { STICKY_BODY_CLASS } from '../product/BuyZone/StickyBar';

export interface VisitStickyBarProps {
  /**
   * A selector for the page's own visit-booking control; the bar shows once
   * that control scrolls out of view, exactly the `StickyBar` (PDP) contract,
   * so it is never a second, redundant CTA on top of a visible one.
   */
  anchorSelector: string;
  /** Test seam for the open/closed chip. */
  now?: Date;
  className?: string;
}

/**
 * The mobile "احجز زيارتك" bar on `/branch` and `/services`
 * (VISIT-2026-09-24 §4.4 item 4): reuses the PDP `StickyBar`'s own
 * IntersectionObserver-and-body-class convention (`STICKY_BODY_CLASS`, so the
 * bottom tab bar steps aside the same way) rather than the component itself,
 * because this bar's trigger is a page-level anchor selector, not a `ref`
 * from the buy zone.
 *
 * Gated on the visit product actually existing in the catalogue id map
 * (`pathForSku`, not the channel's own `'/services'` fallback): a sticky bar
 * whose one job is booking a visit has nothing to do once that product is
 * gone. Hidden above 1024px (CSS only, `_b5-pages.scss`), same breakpoint the
 * PDP bar uses.
 */
export function VisitStickyBar({ anchorSelector, now, className }: VisitStickyBarProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [visible, setVisible] = useState(false);

  const visit = channelById('visit');
  const visitPath = visit ? pathForSku(visit.sku) : undefined;

  useEffect(() => {
    if (!visitPath || typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const anchor = document.querySelector(anchorSelector);
    if (!anchor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorSelector, visitPath]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle(STICKY_BODY_CLASS, visible);
    return () => document.body.classList.remove(STICKY_BODY_CLASS);
  }, [visible]);

  if (!visitPath) return null;

  const hoursSetting = (settings as Record<string, unknown> | undefined)?.branch_hours;
  const rows = parseBranchHours(typeof hoursSetting === 'string' ? hoursSetting : null);
  const status = rows.length > 0 ? hoursStatus(rows, now ?? new Date()) : null;
  const chipLabel = status
    ? status.isOpen
      ? t('ox.blocks.hours.open_now')
      : status.nextOpen
        ? t('ox.blocks.hours.opens_at', { time: status.nextOpen })
        : t('ox.blocks.hours.closed_now')
    : null;

  return (
    <div
      className={['ox-visit-sticky', visible ? 'is-visible' : '', className].filter(Boolean).join(' ')}
      aria-hidden={!visible}
      data-testid="ox-visit-sticky"
    >
      <div className="ox-visit-sticky__inner">
        {chipLabel ? (
          <span
            className={`ox-visit-sticky__status ${status?.isOpen ? 'is-open' : 'is-closed'}`}
            data-testid="ox-visit-sticky-status"
          >
            {chipLabel}
          </span>
        ) : null}
        <Button
          to={visitPath}
          size={48}
          variant="primary"
          block
          className="ox-visit-sticky__cta"
          tabIndex={visible ? 0 : -1}
        >
          {t('ox.content.services.visit_cta_short')}
        </Button>
      </div>
    </div>
  );
}

export default VisitStickyBar;
