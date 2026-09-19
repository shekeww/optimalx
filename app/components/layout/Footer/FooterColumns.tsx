import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../../blocks/href';
import { FOOTER_COLUMNS, findMenuLink, type NavEntry } from '../../../content/nav';
import { Icon } from '../../common/Icon';
import { useMediaQuery } from '../../common/hooks/useMediaQuery';
import { resolveNavHref } from '../navLinks';
import { useHeaderMenu } from '../Header/useHeaderMenu';

interface ColumnProps {
  heading: string;
  children: ReactNode;
  /** An accordion below 1024, a plain column above it. */
  collapsible: boolean;
}

function Column({ heading, children, collapsible }: ColumnProps) {
  const [open, setOpen] = useState(false);
  if (!collapsible) {
    return (
      <div className="ox-footer__col">
        <p className="ox-footer__heading">{heading}</p>
        {children}
      </div>
    );
  }
  return (
    <div className={`ox-footer__col is-collapsible${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="ox-footer__heading ox-footer__toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{heading}</span>
        <Icon name="chevron-down" size={16} className="ox-footer__chevron" />
      </button>
      <div className="ox-footer__panel">
        <div className="ox-footer__panel-inner">{children}</div>
      </div>
    </div>
  );
}

/** What one entry resolves to, or null when it has no destination. */
type Resolved = { key: string; label: string; href: string; external: boolean } | null;

/**
 * The three footer link columns of the approved design: the brand pages,
 * customer service, and the product families.
 *
 * Three kinds of destination, and each fails differently on purpose:
 *
 * - a standing theme route is always rendered
 * - a product family resolves to the live category, or to a search for its own
 *   label, so the column is never short and never dead
 * - a policy page resolves against the merchant's own footer menu and is
 *   dropped when it is not there. It gets no search fallback: a search results
 *   page is not a returns policy, and an invented policy URL is a dead link on
 *   a legal page
 * - WhatsApp renders only when the store publishes a number
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

  const whatsapp = digitsOnly(store?.contacts?.whatsapp ?? '');

  const resolve = (entry: NavEntry): Resolved => {
    const label = t(entry.labelKey);
    if (entry.kind === 'whatsapp') {
      return whatsapp
        ? { key: entry.key, label, href: `https://wa.me/${whatsapp}`, external: true }
        : null;
    }
    if (entry.tokens) {
      const match = findMenuLink(footerMenu, entry.tokens);
      return match?.url
        ? { key: entry.key, label: match.title || label, href: match.url, external: false }
        : null;
    }
    const href = resolveNavHref(entry, label, items);
    return href ? { key: entry.key, label, href, external: false } : null;
  };

  return (
    <nav
      className="ox-footer__cols"
      aria-label={t('ox.nav.page_links_label')}
      data-testid="ox-footer-columns"
    >
      {FOOTER_COLUMNS.map((column) => {
        const links = column.links.map(resolve).filter((link): link is NonNullable<Resolved> =>
          Boolean(link)
        );
        if (links.length === 0) return null;
        return (
          <Column key={column.key} heading={t(column.headingKey)} collapsible={collapsible}>
            <ul>
              {links.map((link) => (
                <li key={link.key}>
                  {link.external ? (
                    <a
                      className="ox-footer__link"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="ox-footer__link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Column>
        );
      })}
    </nav>
  );
}
