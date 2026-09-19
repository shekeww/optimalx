import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../../blocks/href';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';
import { LocalizationButton } from './LocalizationButton';
import { Logo } from './Logo';
import { useHeaderMenu } from './useHeaderMenu';

export interface MobileDrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Opens with the categories group expanded (the tab bar's categories tab). */
  initialGroup?: 'goals' | 'categories';
}

/** The class the engine's own CSS keys its scroll lock off (engine-surface 10.3). */
const BODY_OPEN_CLASS = 'menu-opened';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

interface GroupProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function Group({ label, open, onToggle, children }: GroupProps) {
  return (
    <li className="ox-drawer__group">
      <button type="button" className="ox-drawer__row" aria-expanded={open} onClick={onToggle}>
        <span>{label}</span>
        <i className="sicon-keyboard_arrow_down ox-drawer__chevron" aria-hidden="true" />
      </button>
      <div className={`ox-drawer__panel${open ? ' is-open' : ''}`}>
        <div className="ox-drawer__panel-inner">
          <ul>{children}</ul>
        </div>
      </div>
    </li>
  );
}

/**
 * The mobile menu drawer (DIRECTION 5.1 MobileDrawer).
 *
 * It is not rendered at all while closed, so nothing is parked off-screen and
 * the 9.7 MB panel layer is released on close (render budget 10.1 rule 6 and
 * 10.2). The inner panel is what translates; the fixed outer box stays pinned
 * to the viewport. Focus is trapped while open and returned to the menu button
 * on close by `useDialogFocus`.
 */
export function MobileDrawer({ id, open, onClose, initialGroup = 'goals' }: MobileDrawerProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  const { items, goals } = useHeaderMenu();
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [group, setGroup] = useState<'goals' | 'categories' | null>(initialGroup);

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

  const whatsapp = digitsOnly(
    settingValue(settings, 'whatsapp_number') || (store?.contacts?.whatsapp ?? '')
  );
  const phone = digitsOnly(store?.contacts?.phone || store?.contacts?.mobile || '');
  const promise = settingValue(settings, 'delivery_promise_line');

  const pages = [
    { key: 'services', label: t('ox.nav.services'), to: '/services' },
    { key: 'guides', label: t('ox.nav.guides'), to: '/blog' },
    { key: 'branch', label: t('ox.nav.branch'), to: '/branch' },
    { key: 'about', label: t('ox.nav.about'), to: '/about' },
    { key: 'contact', label: t('ox.nav.contact'), to: '/contact' },
  ];

  return (
    <div className={`ox-drawer${entered ? ' is-entered' : ''}`} data-testid="ox-mobile-drawer">
      <div className="ox-drawer__backdrop" onClick={onClose} data-testid="ox-drawer-backdrop" />
      <div
        id={id}
        ref={panelRef}
        className="ox-drawer__panel-root"
        role="dialog"
        aria-modal="true"
        aria-label={t('ox.nav.drawer_label')}
        tabIndex={-1}
      >
        <div className="ox-drawer__head">
          <Logo size={40} className="ox-drawer__logo" />
          <button
            type="button"
            className="ox-iconbtn"
            aria-label={t('ox.common.close')}
            data-testid="ox-drawer-close"
            onClick={onClose}
          >
            <i className="sicon-cancel" aria-hidden="true" />
          </button>
        </div>

        <nav className="ox-drawer__nav" aria-label={t('ox.nav.drawer_label')}>
          <ul className="ox-drawer__list">
            <Group
              label={t('ox.nav.goals')}
              open={group === 'goals'}
              onToggle={() => setGroup((current) => (current === 'goals' ? null : 'goals'))}
            >
              {goals.map((goal) => (
                <li key={goal.slug}>
                  <Link to={goal.to} className="ox-drawer__row ox-drawer__row--sub" onClick={onClose}>
                    <Icon name={goal.icon as OxIconName} size={24} />
                    <span>{goal.label}</span>
                  </Link>
                </li>
              ))}
            </Group>

            <Group
              label={t('ox.nav.categories_short')}
              open={group === 'categories'}
              onToggle={() => setGroup((current) => (current === 'categories' ? null : 'categories'))}
            >
              {items.map((item) => (
                <li key={String(item.id)}>
                  <Link to={item.url} className="ox-drawer__row ox-drawer__row--sub" onClick={onClose}>
                    <span>{item.title}</span>
                  </Link>
                  {item.children?.length ? (
                    <ul className="ox-drawer__sublist">
                      {item.children.map((child) => (
                        <li key={String(child.id)}>
                          <Link
                            to={child.url}
                            className="ox-drawer__row ox-drawer__row--child"
                            onClick={onClose}
                          >
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </Group>

            {pages.map((page) => (
              <li key={page.key}>
                <Link to={page.to} className="ox-drawer__row" onClick={onClose}>
                  <span>{page.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ox-drawer__foot">
          <LocalizationButton className="ox-drawer__localize" />
          {promise ? <p className="ox-drawer__promise ox-small">{promise}</p> : null}
          <div className="ox-drawer__contact">
            {whatsapp ? (
              <a
                className="ox-drawer__contact-link"
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="sicon-whatsapp" aria-hidden="true" />
                <span>{t('ox.blocks.branch.whatsapp')}</span>
              </a>
            ) : null}
            {phone ? (
              <a className="ox-drawer__contact-link" href={`tel:${phone}`}>
                <i className="sicon-phone" aria-hidden="true" />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
