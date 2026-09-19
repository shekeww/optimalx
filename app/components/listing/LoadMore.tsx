import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface LoadMoreProps {
  /** Products rendered so far, first page included. */
  loadedCount: number;
  /** False once the API has no next cursor. */
  hasMore: boolean;
  className?: string;
}

/**
 * The load-more block (DIRECTION 5.3 LoadMore, 6.3 block 6).
 *
 * The button itself belongs to `ItemsList`, which renders it inside its own
 * root (components-react native/items-list/ItemsList.js: the
 * `.s-items-list-load-more` div), so this component contributes the progress
 * line and the stylesheet restyles that button. Auto-loading on scroll is not
 * used: it makes the footer unreachable and the per-page URL unstable, which
 * is why the grid runs in button mode.
 *
 * The line says only what is loaded. DIRECTION's "عرض 24 من 96" needs a total
 * the products API does not return, and a total is never invented
 * (PLAN-final B4, claims gate).
 */
export function LoadMore({ loadedCount, hasMore, className }: LoadMoreProps) {
  const { t } = useTranslation();
  if (loadedCount <= 0) return null;

  const classes = ['ox-listing__progress', 'ox-small', className].filter(Boolean).join(' ');
  return (
    <p className={classes} aria-live="polite">
      {hasMore
        ? t('ox.listing.showing', { count: loadedCount })
        : t('ox.listing.showing_all', { count: loadedCount })}
    </p>
  );
}

/** The end-of-list message `ItemsList` renders in place of the button. */
export function ListEnd() {
  const { t } = useTranslation();
  return <span className="ox-listing__end ox-small">{t('ox.listing.end')}</span>;
}
