import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ServiceChannel } from '../../content/services';
import { idForSku } from '../../content/salla-ids';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';

export interface ChannelCardProps {
  channel: ServiceChannel;
  /** Overrides the id resolved from the channel's SKU (kitchen sink, tests). */
  productId?: number;
  className?: string;
}

/** `Product.price` is `number | string` (engine types/index.d.ts:388). */
function priceNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * One "ask before you buy" channel (DIRECTION 5.2 OxServices ChannelCard,
 * FINAL-content 4.3).
 *
 * The card never states a price in copy: it reads the live product behind the
 * channel's SKU and renders the amount through `useMoney` (`Price`), or the
 * shared free label when the product costs nothing. The consultation credit
 * line is the `consultation_credit_note` setting rendered verbatim and only
 * when the owner has filled it (claims gate, PLAN-final 5.1), which the
 * channel carries as `gatedSetting`.
 */
export function ChannelCard({ channel, productId, className }: ChannelCardProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const id = productId ?? idForSku(channel.sku);
  const query = useQuery({
    ...product.queries.detail(String(id ?? '')),
    enabled: id !== undefined,
  });

  const amount = priceNumber(query.data?.price);
  const isFree = amount === 0;
  const gatedNote = channel.gatedSetting ? settingValue(settings, channel.gatedSetting) : '';

  return (
    <article className={['ox-channel', className].filter(Boolean).join(' ')} data-testid="ox-channel-card">
      <Icon name={channel.icon} size={32} className="ox-channel__icon" />
      <h3 className="ox-channel__title ox-h3">{t(channel.titleKey)}</h3>
      {channel.badgeKey ? <p className="ox-channel__badge ox-small">{t(channel.badgeKey)}</p> : null}
      <p className="ox-channel__meta ox-small">{t(channel.metaKey)}</p>
      <p className="ox-channel__desc ox-body">{t(channel.descKey)}</p>
      <p className="ox-channel__price" data-testid="ox-channel-price">
        {isFree ? (
          <span className="ox-channel__free">{t('ox.common.free')}</span>
        ) : amount !== undefined ? (
          <Price amount={amount} size="h3" />
        ) : null}
      </p>
      {gatedNote ? (
        <p className="ox-channel__credit ox-small" data-testid="ox-channel-credit">
          {gatedNote}
        </p>
      ) : null}
      <Button to={channel.to} size={48} variant="primary" className="ox-channel__cta" block>
        {t(channel.ctaKey)}
      </Button>
    </article>
  );
}
