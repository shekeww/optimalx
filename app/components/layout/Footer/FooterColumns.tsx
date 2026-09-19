import { Suspense, lazy, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMediaQuery } from '../../common/hooks/useMediaQuery';
import { useHeaderMenu } from '../Header/useHeaderMenu';

const SallaContacts = lazy(() =>
  import('@salla.sa/twilight-components-react/contacts').then((m) => ({ default: m.SallaContacts }))
);

interface ColumnProps {
  heading: string;
  children: ReactNode;
  /** Collapsible below 1024, a plain column above it (DIRECTION 5.2 Footer). */
  collapsible: boolean;
}

function Column({ heading, children, collapsible }: ColumnProps) {
  const [open, setOpen] = useState(false);
  if (!collapsible) {
    return (
      <div className="ox-footer__col">
        <p className="ox-footer__heading ox-small">{heading}</p>
        {children}
      </div>
    );
  }
  return (
    <div className={`ox-footer__col is-collapsible${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="ox-footer__heading ox-footer__toggle ox-small"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{heading}</span>
        <i className="sicon-keyboard_arrow_down ox-footer__chevron" aria-hidden="true" />
      </button>
      <div className="ox-footer__panel">
        <div className="ox-footer__panel-inner">{children}</div>
      </div>
    </div>
  );
}

/**
 * The four footer columns (DIRECTION 5.2 Footer): the live categories, the
 * dashboard's footer menu (policies), the standing company pages, and the
 * contacts web component.
 *
 * The policies column is omitted rather than filled with guesses when
 * `menu.queries.footer()` comes back empty: an invented policy URL is a dead
 * link on a legal page.
 */
export function FooterColumns() {
  const { t } = useTranslation();
  const store = useStore();
  const { items } = useHeaderMenu();
  const { data: footerMenu } = useQuery({
    queryKey: ['menu', 'footer'],
    queryFn: () => menu.footer(),
    staleTime: 5 * 60 * 1000,
  });
  const desktop = useMediaQuery('(min-width: 1024px)');
  const collapsible = !desktop;

  const company = [
    { key: 'about', label: t('ox.nav.about'), to: '/about' },
    { key: 'contact', label: t('ox.nav.contact'), to: '/contact' },
    { key: 'branch', label: t('ox.nav.branch'), to: '/branch' },
    { key: 'guides', label: t('ox.nav.guides'), to: '/blog' },
  ];

  return (
    <nav className="ox-footer__cols" aria-label={t('ox.nav.page_links_label')} data-testid="ox-footer-columns">
      <Column heading={t('ox.footer.shop')} collapsible={collapsible}>
        <ul>
          {items.map((item) => (
            <li key={String(item.id)}>
              <Link to={item.url} className="ox-footer__link">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </Column>

      {footerMenu && footerMenu.length > 0 ? (
        <Column heading={t('ox.footer.policies')} collapsible={collapsible}>
          <ul>
            {footerMenu.map((item) => (
              <li key={String(item.id)}>
                <Link to={item.url} className="ox-footer__link">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </Column>
      ) : null}

      <Column heading={t('ox.footer.company')} collapsible={collapsible}>
        <ul>
          {company.map((item) => (
            <li key={item.key}>
              <Link to={item.to} className="ox-footer__link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Column>

      <Column heading={t('ox.footer.contact')} collapsible={collapsible}>
        <Suspense fallback={null}>
          <SallaContacts contacts={store?.contacts} hideTitle />
        </Suspense>
      </Column>
    </nav>
  );
}
