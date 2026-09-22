import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { findMenuLink } from '../../../content/nav';
import { Icon, type OxIconName } from '../../common/Icon';

interface TrustItem {
  key: string;
  icon: OxIconName;
  labelKey: string;
}

/**
 * The three standing facts about the store. Each is a statement the store can
 * make today without a carrier agreement, an order history or a certificate:
 *
 * - it resells sealed manufacturer stock, so the goods are genuine
 * - Salla runs the checkout, so payment is handled by the platform
 * - it ships inside the Kingdom
 *
 * Nothing here promises a delivery window, a tracking number or a refund. The
 * third item in particular must never gain a sub-line about tracking (B17).
 */
const TRUST_ITEMS: TrustItem[] = [
  { key: 'authentic', icon: 'shield-check', labelKey: 'ox.trust.authentic_short' },
  { key: 'payment', icon: 'secure-payment', labelKey: 'ox.trust.payment_secure' },
  { key: 'shipping', icon: 'truck', labelKey: 'ox.trust.ships_kingdom' },
];

/**
 * Fragments that identify a merchant page about product authenticity.
 *
 * These are matchers against the store's own page titles, not copy: nothing
 * here is ever rendered. They cannot move to locales/ for the same reason a
 * regular expression cannot - the text they compare against is whatever the
 * merchant typed in the dashboard, in either language.
 */
const AUTHENTICITY_TOKENS = ['authentic', 'original', 'الأصلية', 'أصلية', 'الاصالة']; // ox-allow: arabic-literal

export interface UtilityTrustProps {
  /**
   * `bar` is the desktop row inside the dark utility strip; `scroller` is the
   * 40px snap row that takes its place on paper under the mobile header.
   */
  variant?: 'bar' | 'scroller';
}

/**
 * The three trust items.
 *
 * Item one links to the merchant's own authenticity page when that page
 * exists in the footer menu, and renders as a plain label when it does not:
 * the label is a statement about how the store sources stock, not a guarantee,
 * so it stands on its own without a page behind it (B18).
 */
export function UtilityTrust({ variant = 'bar' }: UtilityTrustProps) {
  const { t } = useTranslation();
  const { data: footerMenu } = useQuery({
    queryKey: ['menu', 'footer'],
    queryFn: () => menu.footer(),
    staleTime: 5 * 60 * 1000,
  });

  const authenticityPage = findMenuLink(footerMenu, AUTHENTICITY_TOKENS);

  return (
    <ul
      className={`ox-util__trust ox-util__trust--${variant}`}
      data-testid={variant === 'bar' ? 'ox-utility-trust' : 'ox-trust-scroller'}
    >
      {TRUST_ITEMS.map((item) => {
        const label = t(item.labelKey);
        const inner = (
          <>
            <Icon name={item.icon} size={16} />
            <span>{label}</span>
          </>
        );
        return (
          <li className="ox-util__trust-item" key={item.key}>
            {item.key === 'authentic' && authenticityPage?.url ? (
              <Link to={authenticityPage.url} className="ox-util__trust-link">
                {inner}
              </Link>
            ) : (
              <span className="ox-util__trust-link">{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
