import { useCallback, useMemo, type ComponentProps } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';
import { Chip, ChipRow } from '../common/Chip';
import { appliedBrandChips, brandFilter, type AppliedBrandChip } from './appliedFilters';

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
 * It is a panel, not a bare column: cream fill, one hairline, the 16 radius
 * every card in this store shares, and a ruled head row carrying the title.
 * That is the same surface contract the approved image gives every block of
 * structured content, so the rail reads as part of the page rather than as the
 * platform's own widget dropped beside it.
 *
 * The facets are the ones the loader received (`filterable: true` on the
 * category and search queries, theme-engine dist/routes/product-listing.js);
 * nothing is added to them and no group is invented. On this store the API
 * returns none today, so the rail is absent and the grid takes the whole row,
 * which is the render the design is checked in. Below 1024 the same component
 * is mounted once inside the drawer instead, with its own id, exactly as the
 * engine does it.
 *
 * ## The brand group (S2f item 6)
 *
 * `salla-filters` already draws whatever group is in `filters[]`, brand
 * included, the moment the payload carries one — nothing is invented or
 * fetched separately. What this adds is the theme's own Arabic heading for
 * that ONE group (`brandFilter` finds it by its own `key`, never a guess at a
 * URL param spelling) and a row of applied-brand chips above the widget, each
 * with its own clear action, built on the SAME URL the widget itself
 * navigates to. Data-gated throughout: with no brand-like key in the payload,
 * `brandFilter` returns null and neither the relabel nor the chip row exist.
 */
export function FiltersRail({ filters, id = 'filters-menu', className }: FiltersRailProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const location = useLocation();

  const brand = useMemo(() => brandFilter(filters), [filters]);
  const chips = useMemo(
    () => appliedBrandChips(location.searchStr, brand),
    [location.searchStr, brand]
  );
  const clearChip = useCallback(
    (chip: AppliedBrandChip) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const remaining = params.getAll(chip.param).filter((v) => v !== chip.value);
      params.delete(chip.param);
      for (const value of remaining) params.append(chip.param, value);
      params.delete('page');
      const search = params.toString();
      router.history.push(`${window.location.pathname}${search ? `?${search}` : ''}`);
    },
    [router]
  );

  if (!filters || filters.length === 0) return null;

  // Relabelled to the theme's own Arabic heading; every other group keeps
  // whatever label the payload itself sent, untouched.
  const labeled = brand
    ? filters.map((f) => (f === brand ? { ...f, label: t('ox.filter.brand_heading') } : f))
    : filters;

  return (
    <aside
      className={['ox-filters', className].filter(Boolean).join(' ')}
      aria-label={t('ox.filter.title')}
    >
      <div className="ox-filters__head">
        <p className="ox-filters__title">{t('ox.filter.title')}</p>
      </div>
      {chips.length > 0 ? (
        <div className="ox-filters__applied">
          <ChipRow>
            {chips.map((chip) => (
              <Chip
                key={chip.param + ':' + chip.value}
                kind="filter"
                selected
                onRemove={() => clearChip(chip)}
                removeLabel={t('ox.filter.brand_remove', { value: chip.label })}
              >
                {chip.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      ) : null}
      <div className="ox-filters__body">
        <SallaFilters id={id} filters={labeled as SallaFiltersFilters} />
      </div>
    </aside>
  );
}
