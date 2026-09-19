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

export interface ListingHeaderProps {
  title: ReactNode;
  /** h1 everywhere except the goal landing, where the hero carries the h1. */
  as?: 'h1' | 'h2';
  titleId?: string;
  /** A media slot before the title: the brand logo plate (DIRECTION 6.14). */
  media?: ReactNode;
  /** The category intro paragraph, rendered under the title row. */
  intro?: ReactNode;
  /** Null when the source carries no sort (the engine sends none for tags). */
  sort?: ListingSortControl | null;
  /** Null when the source has no filters, or the merchant disabled them. */
  filters?: ListingFiltersTrigger | null;
  className?: string;
}

/**
 * The listing head region (DIRECTION 5.3 ListingHeader, 6.3 block 2).
 *
 * No count line: the products API returns no total, and a count that is only
 * the loaded page would be a number the page cannot stand behind (PLAN-final
 * B4). The progress line under the grid states the loaded count instead.
 *
 * The h1 is the category name from the loader, not a string of ours, and the
 * engine's own `#page-main-title` heading is not rendered anywhere on the page.
 */
export function ListingHeader({
  title,
  as: Heading = 'h1',
  titleId,
  media,
  intro,
  sort,
  filters,
  className,
}: ListingHeaderProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const sortId = `ox-sort-${generatedId}`;
  const classes = ['ox-listing__head', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="ox-listing__title-row">
        {media ? <div className="ox-listing__media">{media}</div> : null}
        <Heading className={Heading === 'h1' ? 'ox-h1' : 'ox-h2'} id={titleId}>
          {title}
        </Heading>
      </div>
      {intro ? <div className="ox-listing__intro">{intro}</div> : null}
      {sort || filters ? (
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
          {sort && sort.options.length > 0 ? (
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
