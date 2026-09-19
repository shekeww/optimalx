import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { ChannelCard } from '../blocks/ChannelCard';
import { SERVICE_CHANNELS, SERVICES_HUB } from '../../content/services';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The services band (DIRECTION 5.2 OxServices, 4.5 services polygon, 6.2 row 7,
 * FINAL-content 1.4 and 4.3).
 *
 * One dark band, one wedge, three channel cards. The band re-declares the role
 * tokens through `.ox-band-dark`, so the section header and the cards adapt
 * without a variant class.
 *
 * Claims gates (PLAN-final 5.1): the reply-time line renders only when
 * `reply_sla_hours` is set and interpolates it; the 50 riyal consultation
 * credit is the `consultation_credit_note` setting rendered verbatim inside the
 * card, and neither sentence exists in the markup when its setting is empty.
 */

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

export function OxServices({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();

  const title = fieldText(data, 'title') || t('ox.home.services_title');
  const intro = fieldText(data, 'intro') || t('ox.home.services_intro');
  const replyHours = settingValue(settings, SERVICES_HUB.replyTimeSetting);

  return (
    <section className="ox-services ox-band-dark" data-testid="ox-services">
      <span className="ox-band__wedge" aria-hidden="true" />
      <div className="ox-container ox-services__inner">
        <SectionHeader title={title} descriptor={intro} viewAll={{ to: '/services' }} />
        <div className="ox-channels">
          {SERVICE_CHANNELS.map((channel) => (
            <ChannelCard channel={channel} key={channel.id} />
          ))}
        </div>
        {replyHours ? (
          <p className="ox-services__reply ox-small" data-testid="ox-services-reply">
            {t('ox.home.services_reply', { hours: replyHours })}
          </p>
        ) : null}
        <p className="ox-services__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
      </div>
    </section>
  );
}
