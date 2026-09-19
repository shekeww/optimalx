import { useEffect, type ComponentProps } from 'react';
import { Drawer } from '@salla.sa/twilight-theme-engine/drawer';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';
import { Button } from '../common/Button';

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
 */
export function FiltersDrawer({
  filters,
  isOpen,
  onClose,
  id = 'filters-menu-mobile',
}: FiltersDrawerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const bus = (window as unknown as { salla?: SallaEventBus }).salla?.event;
    if (!bus) return;
    const handler = () => onClose();
    bus.on('salla-filters::changed', handler);
    return () => {
      bus.off('salla-filters::changed', handler);
    };
  }, [onClose]);

  if (!filters || filters.length === 0) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" className="ox-filters-drawer">
      <Drawer.Header onClose={onClose}>
        <span className="ox-h3">{t('ox.filter.title')}</span>
      </Drawer.Header>
      <Drawer.Body>
        <SallaFilters id={id} filters={filters as SallaFiltersFilters} />
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
