import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../../common/Icon';
import { claimsOfficialDistributors, type Settings } from '../lib/claims';

export interface TrustGridProps {
  settings?: Settings;
  /** Digital goods swap the shipping promise for instant delivery (D 6.7). */
  digital?: boolean;
}

/**
 * The store's own four promises under the buy zone (DIRECTION 5.4 TrustGrid).
 *
 * Claims gates (PLAN-final 5.1):
 *  - the authenticity item reads "منتجات أصلية" until the owner sets
 *    `claim_official_distributors`, and only then "موزعون رسميون" (Q3);
 *  - the payment item never names a payment method; the marks row is the
 *    footer's `salla-payments`;
 *  - the help item promises a free reply, never a reply time: that would need
 *    `reply_sla_hours`, which is empty (Q15).
 */
export function TrustGrid({ settings, digital = false }: TrustGridProps) {
  const { t } = useTranslation();
  const items: { key: string; icon: OxIconName; title: string; line: string }[] = [
    {
      key: 'authentic',
      icon: 'authentic',
      title: claimsOfficialDistributors(settings)
        ? t('ox.pdp.official_distributors')
        : t('ox.trust.authentic'),
      line: t('ox.trust.authentic_line'),
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
          icon: 'shipping',
          title: t('ox.trust.shipping'),
          line: t('ox.trust.shipping_line'),
        },
    {
      key: 'payment',
      icon: 'secure-payment',
      title: t('ox.trust.payment'),
      line: t('ox.trust.payment_line'),
    },
    {
      key: 'help',
      icon: 'help',
      title: t('ox.trust.help'),
      line: t('ox.trust.help_line'),
    },
  ];

  return (
    <ul className="ox-trust-grid">
      {items.map((item) => (
        <li className="ox-trust-grid__item" key={item.key}>
          <Icon name={item.icon} size={20} />
          <div className="ox-trust-grid__text">
            <p className="ox-trust-grid__title">{item.title}</p>
            <p className="ox-trust-grid__line">{item.line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
