import { useEffect, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { TaxonomyLink } from '../../listing/useTaxonomyLinks';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';

export interface MegaPanelProps {
  id: string;
  /** The nav item that owns the panel, for `aria-labelledby`. */
  labelledBy: string;
  goals: TaxonomyLink[];
  types: TaxonomyLink[];
  onClose: () => void;
  /** Kept open while the pointer is inside either the item or the panel. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

/**
 * The "المنتجات" mega panel (DIRECTION 5.1 NavBar): six goal cards in a 3 by
 * 2 grid over columns 1 to 8, the ten type roots over 9 to 12, closed by a
 * "كل المنتجات" link. A plain popover, not `SallaMenu`, because the
 * dashboard menu component renders nested lists and cannot host the cards.
 *
 * Both columns come from `useTaxonomyLinks` (Contract C) now, not the
 * dashboard menu: a goal or type resolves to its live category once the
 * merchant creates one, and to a search for its own name otherwise
 * (PLAN-final C15), the same fallback every other taxonomy link in the theme
 * uses.
 *
 * Focus is trapped while it is open and Escape hands focus back to the item
 * that opened it (DIRECTION 9.4).
 */
export function MegaPanel({
  id,
  labelledBy,
  goals,
  types,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: MegaPanelProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogFocus(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      id={id}
      ref={panelRef}
      className="ox-mega"
      role="group"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      data-testid="ox-mega-panel"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <ul className="ox-mega__goals">
        {goals.map((goal) => (
          <li key={goal.slug}>
            <Link to={goal.to} className="ox-goalcard" onClick={onClose}>
              <Icon name={goal.icon as OxIconName} size={32} />
              <span className="ox-goalcard__title ox-h3">{goal.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="ox-mega__cats">
        <p className="ox-mega__heading ox-small">{t('ox.nav.categories_short')}</p>
        <ul>
          {types.map((type) => (
            <li key={type.slug}>
              <Link to={type.to} className="ox-mega__link" onClick={onClose}>
                {type.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/categories" className="ox-mega__all" onClick={onClose}>
          {t('ox.nav.all_products')}
        </Link>
      </div>
    </div>
  );
}
