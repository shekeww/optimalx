import { Suspense, lazy, useId, useState } from 'react';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';
import { StoreRating } from '../common/StoreRating';
import { fieldList, rowText, type OxBlockProps } from './defaults';

const SallaPayments = lazy(() =>
  import('@salla.sa/twilight-components-react/payments').then((m) => ({ default: m.SallaPayments }))
);

/**
 * The trust strip under the hero (DIRECTION 5.2 OxTrustStrip, 6.2 row 2,
 * FINAL-content 1.3 and 1.5).
 *
 * Four cells on the light ground divided by hairlines, each a glyph beside a
 * bold line and a lighter one. No fill, no border around the row, no shadow:
 * the separation is the hairline and nothing else, which is how every surface
 * in this design is separated.
 *
 * **It is no longer `.ox-stats`.** The product page's statistic strip and this
 * row were one class until the phone layouts parted: the reference's phone
 * pane scrolls these four sideways under the hero, while a product page's
 * facts stay a two by two grid. Forcing one class to be both meant the home
 * page overriding half of the product page's rules inside a width query, which
 * is how a shared part rots. They share the design (equal cells, hairlines, a
 * glyph, a two line caption) and each owns its own box.
 *
 * Four items, one definition panel, one item open at a time. Two claims gates
 * live here (PLAN-final 5.1):
 *   - "موزعون رسميون" renders only when `claim_official_distributors` is on;
 *     otherwise the item is the authentic-products line with its definition;
 *   - the payment item never names a method. Its panel is the `SallaPayments`
 *     marks row, which shows exactly the methods the store actually has.
 * The reply-time promise is NOT here: the help line stays the free-reply line
 * until `reply_sla_hours` is set, and the services block owns that sentence.
 */

interface TrustItem {
  id: string;
  icon: OxIconName;
  title: string;
  line: string;
  /** The two-line definition the panel opens to; without one the item is static. */
  definition?: string;
  /** The payment item shows marks instead of a sentence. */
  marks?: boolean;
}

function readSetting(settings: unknown, key: string): unknown {
  if (!settings || typeof settings !== 'object') return undefined;
  return (settings as Record<string, unknown>)[key];
}

const MERCHANT_ICONS: Record<string, OxIconName> = {
  authentic: 'authentic',
  expiry: 'expiry',
  shipping: 'shipping',
  payment: 'secure-payment',
  'secure-payment': 'secure-payment',
  help: 'help',
};

export function OxTrustStrip({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const prefix = useId();
  const [open, setOpen] = useState<string | null>(null);

  const distributors = readSetting(settings, 'claim_official_distributors') === true;

  const merchantRows = fieldList(data, 'items');
  const items: TrustItem[] =
    merchantRows.length > 0
      ? // Four at most: the strip's cell rules are drawn for one to four cells,
        // and a fifth promise in the same row is a promise nobody reads.
        merchantRows.slice(0, 4).map((row, index) => ({
          id: `item-${index + 1}`,
          icon: MERCHANT_ICONS[rowText(row, 'icon')] ?? 'authentic',
          title: rowText(row, 'title'),
          line: rowText(row, 'line'),
        }))
      : [
          {
            id: 'authentic',
            icon: 'authentic',
            title: distributors ? t('ox.home.trust_distributors') : t('ox.trust.authentic'),
            line: t('ox.trust.authentic_line'),
            definition: t('ox.home.trust_authentic_def'),
          },
          {
            id: 'shipping',
            icon: 'shipping',
            title: t('ox.trust.shipping'),
            line: t('ox.trust.shipping_line'),
            definition: t('ox.home.trust_shipping_def'),
          },
          {
            id: 'payment',
            icon: 'secure-payment',
            title: t('ox.trust.payment'),
            line: t('ox.trust.payment_line'),
            marks: true,
          },
          {
            id: 'help',
            icon: 'help',
            title: t('ox.trust.help'),
            line: t('ox.trust.help_line'),
            definition: t('ox.home.trust_help_def'),
          },
        ];

  const panelId = `${prefix}-panel`;
  const current = items.find((item) => item.id === open);

  return (
    <section className="ox-trust" aria-label={t('ox.home.trust_region')} data-testid="ox-trust-strip">
      <div className="ox-container">
        {/*
          The store's Google rating, directly under the hero and above the
          four promises, because it is the one piece of outside evidence the
          business owns and the four cells below it are all the store's own
          word. It self-gates on `content/social-proof.ts`: without the
          settings filled it renders nothing and the strip is exactly what it
          was before.
        */}
        <StoreRating variant="rail" className="ox-trust__rating" />

        <ul className="ox-trust__row" data-count={items.length}>
          {items.map((item) => {
            const expandable = Boolean(item.definition) || Boolean(item.marks);
            const isOpen = open === item.id;
            const body = (
              <>
                <Icon name={item.icon} size={26} className="ox-trust__icon" />
                <span className="ox-trust__text">
                  <span className="ox-trust__title">{item.title}</span>
                  <span className="ox-trust__line">{item.line}</span>
                </span>
              </>
            );
            return (
              <li className="ox-trust__item" key={item.id}>
                {expandable ? (
                  <button
                    type="button"
                    className="ox-trust__btn"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                    data-testid={`ox-trust-${item.id}`}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="ox-trust__btn ox-trust__btn--static" data-testid={`ox-trust-${item.id}`}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div
          id={panelId}
          className="ox-trust__panel"
          data-open={current ? 'true' : 'false'}
          data-testid="ox-trust-panel"
        >
          <div className="ox-trust__panelinner">
            {current?.definition ? (
              <p className="ox-trust__def ox-small">{current.definition}</p>
            ) : null}
            {current?.marks ? (
              <div className="ox-trust__marks" aria-label={t('ox.home.trust_payment_marks')}>
                <Suspense fallback={null}>
                  <SallaPayments />
                </Suspense>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
