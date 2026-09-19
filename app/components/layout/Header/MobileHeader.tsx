import { Suspense, lazy, useRef } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SearchField } from './MainBar';
import { Logo } from './Logo';
import { useCartCountPill } from './useCartCountPill';

const SallaCartSummary = lazy(() =>
  import('@salla.sa/twilight-components-react/cart-summary').then((m) => ({
    default: m.SallaCartSummary,
  }))
);

export interface MobileHeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  /**
   * Listing, search, goal and brand routes carry a second row with the search
   * field, which makes the header 104 tall instead of 56 (DIRECTION 6.1).
   */
  withSearchRow?: boolean;
  drawerId: string;
}

/**
 * The mobile header (DIRECTION 5.1 MobileHeader): menu at the start, the mark
 * centred, the cart at the end. The cart, not search, takes the end slot
 * because the merchant can switch the bottom tab bar off and the header still
 * has to carry it.
 */
export function MobileHeader({ menuOpen, onToggleMenu, withSearchRow, drawerId }: MobileHeaderProps) {
  const { t } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  useCartCountPill(rowRef);

  return (
    <div className="ox-mobilebar" data-testid="ox-mobile-header">
      <div className="ox-mobilebar__row" ref={rowRef}>
        <button
          type="button"
          className="ox-iconbtn"
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          aria-label={menuOpen ? t('ox.a11y.menu_close') : t('ox.a11y.menu_open')}
          data-testid="ox-menu-button"
          onClick={onToggleMenu}
        >
          <i className={menuOpen ? 'sicon-cancel' : 'sicon-menu'} aria-hidden="true" />
        </button>

        <Logo size={40} priority className="ox-mobilebar__logo" />

        <Suspense fallback={null}>
          <SallaCartSummary className="ox-iconbtn ox-cart">
            <span slot="icon" className="ox-cart__icon">
              <i className="sicon-shopping-bag" aria-hidden="true" />
            </span>
          </SallaCartSummary>
        </Suspense>
      </div>

      {withSearchRow ? <SearchField className="ox-mobilebar__search" /> : null}
    </div>
  );
}
