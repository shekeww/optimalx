import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../../blocks/href';
import { HEADER_NAV, MORE_NAV } from '../../../content/nav';
import { Icon, type OxIconName } from '../../common/Icon';
import { useDialogFocus } from '../../common/useDialogFocus';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
import { resolveNavHref, toSafeLinks } from '../navLinks';
import { LocalizationButton } from './LocalizationButton';
import { Logo } from './Logo';
import { ShopTree } from './ShopTree';

export interface MobileDrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Opens with the goals group expanded by default (the menu button's own default). */
  initialGroup?: 'goals' | 'categories';
}

/** The class the engine's own CSS keys its scroll lock off (engine-surface 10.3). */
const BODY_OPEN_CLASS = 'menu-opened';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

type Group = 'types' | 'goals' | 'more' | null;

interface GroupProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function DrawerGroup({ label, open, onToggle, children }: GroupProps) {
  return (
    <li className="ox-drawer__group">
      <button type="button" className="ox-drawer__row" aria-expanded={open} onClick={onToggle}>
        <span>{label}</span>
        <Icon name="chevron-down" size={16} className="ox-drawer__chevron" />
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
 * The mobile menu drawer (NAV-2026-09-23 §6): the **site map**. The shop
 * sheet (`ShopSheet.tsx`) is the **catalogue**; the two share `ShopTree` so
 * they can never become two different site maps again.
 *
 * Top to bottom: حسب النوع (the ten type roots, protein nested, then the
 * three non-services utility categories - one group), حسب الهدف (the six
 * goals), then العروض (gated the same as the bar), العلامات التجارية,
 * اسأل قبل أن تشتري and الأدلة as plain rows, then المزيد (the three
 * standing pages), then the account rule. One group open at a time.
 *
 * Not rendered at all while closed, so nothing is parked off-screen and the
 * panel layer is released on close (render budget 10.1 rule 6, 10.2). Focus
 * is trapped while open and returned to the menu button on close.
 */
export function MobileDrawer({ id, open, onClose, initialGroup = 'goals' }: MobileDrawerProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  // Reduced to a path here, not inside `useTaxonomyLinks`: that hook is
  // shared with the listing page's `ChildChips`, whose own test pins
  // today's raw-URL behaviour for its live-children path (NAV-2026-09-23 §8
  // item 1).
  const goals = toSafeLinks(useTaxonomyLinks().goals);
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [group, setGroup] = useState<Group>(initialGroup === 'goals' ? 'goals' : 'types');

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
  const showOffers = (settings as Record<string, unknown> | undefined)?.show_offers_nav !== false;

  // The four plain rows between the two catalogue accordions and المزيد:
  // العروض (gated, same as the bar), العلامات التجارية, اسأل قبل أن تشتري,
  // الأدلة. `شop` and `more` are never in this list: their content is the two
  // accordions above and المزيد below.
  const primary: Array<{ key: string; label: string; to: string }> = [];
  for (const entry of HEADER_NAV) {
    if (entry.dropdown) continue;
    if (entry.key === 'offers' && !showOffers) continue;
    const label = t(entry.labelKey);
    const to = resolveNavHref(entry, label, undefined);
    if (to) primary.push({ key: entry.key, label, to });
  }

  // المزيد's own three standing pages.
  const morePages = MORE_NAV.map((entry) => {
    const label = t(entry.labelKey);
    return { key: entry.key, label, to: resolveNavHref(entry, label, undefined) ?? '/' };
  });

  // Wishlist and account leave the mobile bar, which carries the cart, and
  // arrive here as their own group.
  const account: Array<{ key: string; label: string; to: string; icon: OxIconName }> = [
    { key: 'account', label: t('ox.nav.account'), to: '/account/profile', icon: 'user' },
    { key: 'wishlist', label: t('ox.header.wishlist'), to: '/account/wishlist', icon: 'heart' },
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
            <Icon name="close" size={22} />
          </button>
        </div>

        <nav className="ox-drawer__nav" aria-label={t('ox.nav.drawer_label')}>
          <ul className="ox-drawer__list" data-testid="ox-drawer-list">
            <DrawerGroup
              label={t('ox.nav.by_type')}
              open={group === 'types'}
              onToggle={() => setGroup((current) => (current === 'types' ? null : 'types'))}
            >
              <ShopTree mode="list" includeUtility onNavigate={onClose} />
            </DrawerGroup>

            <DrawerGroup
              label={t('ox.nav.by_goal')}
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
            </DrawerGroup>

            {primary.map((item) => (
              <li key={item.key} data-drawer-primary="">
                <Link to={item.to} className="ox-drawer__row" onClick={onClose}>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            <DrawerGroup
              label={t('ox.nav.more')}
              open={group === 'more'}
              onToggle={() => setGroup((current) => (current === 'more' ? null : 'more'))}
            >
              {morePages.map((page) => (
                <li key={page.key}>
                  <Link to={page.to} className="ox-drawer__row ox-drawer__row--sub" onClick={onClose}>
                    <span>{page.label}</span>
                  </Link>
                </li>
              ))}
            </DrawerGroup>

            {account.map((item) => (
              <li key={item.key} className="ox-drawer__account" data-drawer-account="">
                <Link
                  to={item.to}
                  className="ox-drawer__row ox-drawer__row--sub"
                  onClick={onClose}
                >
                  <Icon name={item.icon} size={24} />
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
                <Icon name="whatsapp" size={24} />
                <span>{t('ox.blocks.branch.whatsapp')}</span>
              </a>
            ) : null}
            {phone ? (
              <a className="ox-drawer__contact-link" href={`tel:${phone}`}>
                <Icon name="phone" size={24} />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
