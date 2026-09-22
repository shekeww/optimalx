import { useCallback, useEffect, useMemo, type ComponentProps } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { Drawer } from '@salla.sa/twilight-theme-engine/drawer';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';
import { Button } from '../common/Button';
import { Chip, ChipRow } from '../common/Chip';
import { appliedBrandChips, brandFilter, type AppliedBrandChip } from './appliedFilters';

/** See the note in FiltersRail: the two packages declare `Filter` differently. */
type SallaFiltersFilters = ComponentProps<typeof SallaFilters>['filters'];

export interface FiltersDrawerProps {
  filters?: Filter[];
  isOpen: boolean;
  onClose: () => void;
  id?: string;
}

/**
 * The filters drawer below 1024 (DIRECTION 5.3 FiltersRail "below 1024 the
 * same content lives in a drawer ... with a sticky footer").
 *
 * The engine `Drawer` supplies the chrome (focus trap, Escape, scroll lock,
 * backdrop) and the SDK's own `salla-filters::changed` event closes it, which
 * is the behaviour the engine listing has (theme-engine
 * dist/routes/product-listing.js, the `handleFiltersChanged` effect). The
 * listener is registered here rather than in the page so the page does not
 * depend on the SDK being present.
 *
 * The brand group is the same treatment as `FiltersRail` (S2f item 6): a
 * relabel of the one group the payload's own `key` marks as brand, and a row
 * of applied-brand chips above the widget with their own clear action, on
 * the same URL the widget itself navigates to. See that file for the fuller
 * note; nothing here closes the drawer on a clear, only `salla-filters`'s own
 * `changed` event does that, which a clear chip does not fire.
 */
export function FiltersDrawer({
  filters,
  isOpen,
  onClose,
  id = 'filters-menu-mobile',
}: FiltersDrawerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    const bus = (window as unknown as { salla?: SallaEventBus }).salla?.event;
    if (!bus) return;
    const handler = () => onClose();
    bus.on('salla-filters::changed', handler);
    return () => {
      bus.off('salla-filters::changed', handler);
    };
  }, [onClose]);

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

  const labeled = brand
    ? filters.map((f) => (f === brand ? { ...f, label: t('ox.filter.brand_heading') } : f))
    : filters;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" className="ox-filters-drawer">
      <Drawer.Header onClose={onClose}>
        <span className="ox-h3">{t('ox.filter.title')}</span>
      </Drawer.Header>
      <Drawer.Body>
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
        <SallaFilters id={id} filters={labeled as SallaFiltersFilters} />
      </Drawer.Body>
      <Drawer.Footer className="ox-filters-drawer__footer">
        <Button variant="primary" size={48} block onClick={onClose}>
          {t('ox.filter.apply')}
        </Button>
      </Drawer.Footer>
    </Drawer>
  );
}

/** The slice of the storefront SDK this file uses (window.salla.event). */
interface SallaEventBus {
  event?: {
    on: (name: string, handler: () => void) => void;
    off: (name: string, handler: () => void) => void;
  };
}
