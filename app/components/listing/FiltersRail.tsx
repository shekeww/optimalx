import type { ComponentProps } from 'react';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';

/**
 * The web component and the engine declare `Filter` in two packages: the
 * engine's `type` is a plain string, the component's is a union of its own
 * option kinds. The payload is one object from one API response, so the cast
 * names that divergence instead of widening either type.
 */
type SallaFiltersFilters = ComponentProps<typeof SallaFilters>['filters'];

export interface FiltersRailProps {
  filters?: Filter[];
  /** Distinct per instance: the rail and the drawer mount two components. */
  id?: string;
  className?: string;
}

/**
 * The desktop filter rail (DIRECTION 5.3 FiltersRail, 6.3 block 4): the native
 * `SallaFilters` in a 280 column, sticky under the header, from 1024 up.
 *
 * The facets are the ones the loader received (`filterable: true` on the
 * category and search queries, theme-engine dist/routes/product-listing.js);
 * nothing is added to them and no group is invented. Below 1024 the same
 * component is mounted once inside the drawer instead, with its own id,
 * exactly as the engine does it.
 */
export function FiltersRail({ filters, id = 'filters-menu', className }: FiltersRailProps) {
  const { t } = useTranslation();
  if (!filters || filters.length === 0) return null;

  return (
    <aside
      className={['ox-filters', className].filter(Boolean).join(' ')}
      aria-label={t('ox.filter.title')}
    >
      <SallaFilters id={id} filters={filters as SallaFiltersFilters} />
    </aside>
  );
}
