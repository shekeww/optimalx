import { useId, type ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import type { SortOption } from './sortOptions';

export interface ListingSortControl {
  value: string;
  options: SortOption[];
  onChange: (id: string) => void;
}

export interface ListingFiltersTrigger {
  /** Applied filter count; renders in a pill and marks the trigger active. */
  count: number;
  onOpen: () => void;
}

export interface ListingToolbarProps {
  /** The child-category chip scroller, at the RTL start of the row. */
  chips?: ReactNode;
  /** Null when the source carries no sort (the engine sends none for tags). */
  sort?: ListingSortControl | null;
  /** Null when the source has no filters, or the merchant disabled them. */
  filters?: ListingFiltersTrigger | null;
  className?: string;
}

/**
 * The row that sits directly on the grid (DIRECTION 6.3 blocks 2 and 3): the
 * sub-category chips at the RTL start, the filters trigger and the sort select
 * at the end, ruled above and below.
 *
 * It is one instrument rather than three stray controls, which is the whole
 * point: the approved design separates regions with a hairline and a value
 * step, never with a boxed toolbar or a shadow. Below 1024 the chips take
 * their own row and the controls sit under them; from 1024 the two share one
 * 64 row.
 *
 * Filtering and sorting stay on Salla's own query surface: the sort writes
 * `?sort=` and the filters are the platform's `salla-filters`, which the rail
 * and the drawer mount. Nothing here filters a list in the browser.
 *
 * Renders nothing when the page has no chips, no sort and no filters, so a tag
 * listing does not carry an empty rule across the page.
 */
export function ListingToolbar({ chips, sort, filters, className }: ListingToolbarProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const sortId = `ox-sort-${generatedId}`;

  const hasSort = Boolean(sort && sort.options.length > 0);
  const hasControls = hasSort || Boolean(filters);
  if (!chips && !hasControls) return null;

  const classes = ['ox-listing__toolbar', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {chips}
      {hasControls ? (
        <div className="ox-listing__controls">
          {filters ? (
            <Button
              variant="secondary"
              size={44}
              onClick={filters.onOpen}
              className={`ox-listing__filters-trigger${filters.count > 0 ? ' is-active' : ''}`}
              iconStart={<i className="sicon-filter" aria-hidden="true" />}
            >
              {t('ox.filter.title')}
              {filters.count > 0 ? (
                <span className="ox-listing__filters-count ox-num">{filters.count}</span>
              ) : null}
            </Button>
          ) : null}
          {sort && hasSort ? (
            <div className="ox-listing__sort">
              <label className="ox-listing__sort-label" htmlFor={sortId}>
                {t('ox.sort.label')}
              </label>
              <select
                id={sortId}
                className="ox-select ox-select--compact"
                value={sort.value}
                onChange={(event) => sort.onChange(event.target.value)}
              >
                {sort.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
