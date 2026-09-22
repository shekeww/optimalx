import { Suspense, lazy, useRef } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SearchField } from './MainBar';
import { Logo } from './Logo';
import { useCartCountPill } from './useCartCountPill';
import { Icon } from '../../common/Icon';

const SallaCartSummary = lazy(() =>
  import('@salla.sa/twilight-components-react/cart-summary').then((m) => ({
    default: m.SallaCartSummary,
  }))
);

export interface MobileHeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  /**
   * Listing, search, goal and brand routes carry a second row with the full
   * search pill instead of the collapsed glyph.
   */
  withSearchRow?: boolean;
  drawerId: string;
}

/**
 * The mobile header, 64 tall: the menu button at the inline-start, the lockup
 * beside it, then the collapsed search glyph and the cart at the inline-end.
 *
 * What collapses into the drawer: the five nav items, the wishlist and the
 * account. What stays on the bar: the menu, the mark, search and the cart.
 * The cart stays because the merchant can switch the bottom tab bar off and
 * the header still has to carry it.
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

        <Logo width={108} priority className="ox-mobilebar__logo" />

        <div className="ox-mobilebar__actions">
          {withSearchRow ? null : (
            <SearchField collapsed className="ox-mobilebar__searchbtn" />
          )}

          <Suspense fallback={null}>
            <SallaCartSummary className="ox-iconbtn ox-cartbtn">
              <span slot="icon" className="ox-cartbtn__icon">
                {/* DRAWN, not Salla's icon font. `sicon-shopping-bag` is not in
                    the loaded face, so the browser fell through to an emoji font
                    and painted a colour bag beside two currentColor strokes: the
                    cart was amber where the heart and the account glyph were
                    white. A drawn path cannot fall back. */}
                <Icon name="cart" size={22} />
                {/* The component's own anchor (`.s-cart-summary-wrapper`) gets no
                    name of its own: `cartLabel` is internal state, only ever
                    painted when `show-cart-label` is set, and the icon slot is
                    the only content of ours the component renders. Slotted
                    content is part of the flattened tree the accessible-name
                    computation walks, so this text reaches the anchor even
                    though it never appears there visually. */}
                <span className="ox-sr-only">{t('ox.header.cart')}</span>
              </span>
            </SallaCartSummary>
          </Suspense>
        </div>
      </div>

      {withSearchRow ? <SearchField className="ox-mobilebar__search" /> : null}
    </div>
  );
}
