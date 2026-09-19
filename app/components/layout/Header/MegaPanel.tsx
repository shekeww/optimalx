import { useEffect, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';
import type { ResolvedLink } from './useHeaderMenu';

export interface MegaPanelProps {
  id: string;
  /** The nav item that owns the panel, for `aria-labelledby`. */
  labelledBy: string;
  goals: ResolvedLink[];
  categories: MenuItem[];
  onClose: () => void;
  /** Kept open while the pointer is inside either the item or the panel. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

/**
 * The goals mega panel (DIRECTION 5.1 NavBar): six goal cards in a 3 by 2 grid
 * over columns 1 to 8, and the live categories column over 9 to 12. A plain
 * popover, not `SallaMenu`, because the dashboard menu component renders
 * nested lists and cannot host the cards.
 *
 * Focus is trapped while it is open and Escape hands focus back to the item
 * that opened it (DIRECTION 9.4).
 */
export function MegaPanel({
  id,
  labelledBy,
  goals,
  categories,
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
          {categories.map((item) => (
            <li key={String(item.id)}>
              <Link to={item.url} className="ox-mega__link" onClick={onClose}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
