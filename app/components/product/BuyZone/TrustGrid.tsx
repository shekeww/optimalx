import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Icon, type OxIconName } from '../../common/Icon';
import {
  authenticityPageUrl,
  enabledPayments,
  orderTrackingUrl,
  type Settings,
} from '../lib/claims';

export interface TrustGridProps {
  settings?: Settings;
  /** Digital goods swap the shipping promise for instant delivery (D 6.7). */
  digital?: boolean;
  /** `store.settings.payments`, so the payment sub-line can be gated. */
  payments?: unknown;
}

interface TrustItem {
  key: string;
  icon: OxIconName;
  title: ReactNode;
  /** The second line, or null when the store cannot yet stand behind it. */
  line: string | null;
}

/**
 * The three trust items under the buy box (design region 26).
 *
 * Every sub-line is a promise, so every sub-line is gated and the item is
 * drawn to look finished as a title alone, vertically centred in the same row:
 *
 *   B18  "مضمونة 100%" needs a page that says what the guarantee is. Without
 *        one the item is the authenticity title, unlinked, and no guarantee is
 *        asserted anywhere on the page.
 *   B17  "تتبع طلبك" needs a carrier that provides tracking. There is none, so
 *        item two ships as its title alone.
 *   B10  the payment sub-line renders only when the store has a gateway
 *        enabled, and it still names none of them.
 */
export function TrustGrid({ settings, digital = false, payments }: TrustGridProps) {
  const { t } = useTranslation();
  const authenticity = authenticityPageUrl(settings);
  const tracking = orderTrackingUrl(settings);
  const hasPayments = enabledPayments(payments).length > 0;

  const items: TrustItem[] = [
    {
      key: 'payment',
      icon: 'secure-payment',
      title: t('ox.trust.payment'),
      line: hasPayments ? t('ox.pdp.trust_payment_sub') : null,
    },
    digital
      ? {
          key: 'delivery',
          icon: 'plan',
          title: t('ox.pdp.trust_digital'),
          line: t('ox.pdp.trust_digital_line'),
        }
      : {
          key: 'shipping',
          icon: 'truck',
          title: t('ox.pdp.trust_ships_kingdom'),
          line: tracking ? t('ox.pdp.trust_track_order') : null,
        },
    {
      key: 'authentic',
      icon: 'shield-check',
      title: authenticity ? (
        <Link to={authenticity} className="ox-trust-grid__link">
          {t('ox.trust.authentic')}
        </Link>
      ) : (
        t('ox.trust.authentic')
      ),
      line: authenticity ? t('ox.pdp.trust_authentic_sub') : null,
    },
  ];

  return (
    <ul className="ox-trust-grid">
      {items.map((item) => (
        <li className={'ox-trust-grid__item' + (item.line ? '' : ' is-single')} key={item.key}>
          <Icon name={item.icon} size={22} className="ox-trust-grid__icon" />
          <div className="ox-trust-grid__text">
            <p className="ox-trust-grid__title">{item.title}</p>
            {item.line ? <p className="ox-trust-grid__line">{item.line}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
