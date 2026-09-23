import { useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
import { Button } from '../../common/Button';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';
import { ShopTree } from './ShopTree';

export interface ShopSheetProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

/** The class `BottomTabBar`'s `HIDING_BODY_CLASSES` already hides the bar on. */
const BODY_OPEN_CLASS = 'modal-is-open';

/**
 * The full-height mobile catalogue sheet (NAV-2026-09-23 §7.1, §7.1.1).
 *
 * `تسوق` used to open the side drawer scrolled to a group, which made one
 * control do two jobs: the site map and the catalogue. This sheet holds the
 * catalogue and nothing else - no language switch, no phone number, no
 * account rows - and the drawer keeps the site map on the menu button.
 *
 * It is modal (unlike the mega panel): focus trapped, `role="dialog"
 * aria-modal="true"`, closes on Escape and unmounts rather than hiding, so
 * the fixed layer is released on close. It adds `modal-is-open` to `<body>`,
 * which is what makes the tab bar unmount under it (§7.4 "Hidden").
 */
export function ShopSheet({ id, open, onClose }: ShopSheetProps) {
  const { t } = useTranslation();
  const { goals, utility } = useTaxonomyLinks();
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useDialogFocus(panelRef, open && entered);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    document.body.classList.add(BODY_OPEN_CLASS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      setEntered(false);
      document.body.classList.remove(BODY_OPEN_CLASS);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const otherCategories = utility.filter((node) => node.slug !== 'services');

  return (
    <div
      id={id}
      ref={panelRef}
      className={`ox-sheet${entered ? ' is-entered' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('ox.nav.shop_sheet_label')}
      tabIndex={-1}
      data-testid="ox-shop-sheet"
    >
      <div className="ox-sheet__head">
        <p className="ox-sheet__title ox-h3">{t('ox.nav.shop')}</p>
        <button
          type="button"
          className="ox-iconbtn ox-sheet__close"
          aria-label={t('ox.nav.close_shop')}
          data-testid="ox-sheet-close"
          onClick={onClose}
        >
          <i className="sicon-cancel" aria-hidden="true" />
        </button>
      </div>

      <div className="ox-sheet__body">
        <section className="ox-sheet__section" aria-label={t('ox.nav.by_goal')}>
          <p className="ox-sheet__heading">{t('ox.nav.by_goal')}</p>
          <ul className="ox-sheet__grid ox-sheet__grid--goal">
            {goals.map((goal) => (
              <li key={goal.slug}>
                <Link to={goal.to} className="ox-tile ox-tile--goal" onClick={onClose}>
                  <Icon name={goal.icon as OxIconName} size={24} />
                  <span className="ox-tile__label">{goal.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <hr className="ox-sheet__rule" />

        <section className="ox-sheet__section" aria-label={t('ox.nav.by_type')}>
          <p className="ox-sheet__heading">{t('ox.nav.by_type')}</p>
          <ShopTree mode="grid" includeUtility={false} onNavigate={onClose} />
        </section>

        <hr className="ox-sheet__rule" />

        <section className="ox-sheet__section" aria-label={t('ox.nav.other_categories')}>
          <p className="ox-sheet__heading">{t('ox.nav.other_categories')}</p>
          <ul className="ox-sheet__grid ox-sheet__grid--utility">
            {otherCategories.map((node) => (
              <li key={node.slug}>
                <Link to={node.to} className="ox-tile ox-tile--utility" onClick={onClose}>
                  <span className="ox-tile__label">{node.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="ox-sheet__foot">
        <Button to="/categories" variant="secondary" size={48} block onClick={onClose}>
          {t('ox.nav.all_types')}
        </Button>
      </div>
    </div>
  );
}
