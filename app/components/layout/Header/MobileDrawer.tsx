import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../../blocks/href';
import { HEADER_NAV, SECONDARY_NAV } from '../../../content/nav';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';
import { resolveNavHref } from '../navLinks';
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

  // The header items collapse in here below 1024, above the standing pages.
  // An item with no destination is dropped, exactly as on the bar.
  const primary: Array<{ key: string; label: string; to: string }> = [];
  for (const entry of HEADER_NAV) {
    const label = t(entry.labelKey);
    const to = resolveNavHref(entry, label, items);
    if (to) primary.push({ key: entry.key, label, to });
  }

  // The standing pages the bar does not carry. The advisory used to be typed
  // here and nowhere else, which is what made the drawer and the bar two
  // different site maps; it is in `HEADER_NAV` now and reaches this list
  // through `primary` above.
  const pages = SECONDARY_NAV.map((entry) => ({
    key: entry.key,
    label: t(entry.labelKey),
    to: entry.to ?? '/',
  }));

  // Wishlist and account leave the mobile bar, which carries the cart, and
  // arrive here as their own group.
  const account = [
    { key: 'account', label: t('ox.nav.account'), to: '/account/profile', icon: 'sicon-user' },
    { key: 'wishlist', label: t('ox.header.wishlist'), to: '/account/wishlist', icon: 'sicon-heart' },
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
          <Logo raster size={40} className="ox-drawer__logo" />
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
          <ul className="ox-drawer__list" data-testid="ox-drawer-list">
            {primary.map((item) => (
              <li key={item.key} data-drawer-primary="">
                <Link to={item.to} className="ox-drawer__row" onClick={onClose}>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

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

            {account.map((item) => (
              <li key={item.key} className="ox-drawer__account" data-drawer-account="">
                <Link
                  to={item.to}
                  className="ox-drawer__row ox-drawer__row--sub"
                  onClick={onClose}
                >
                  <i className={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
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
