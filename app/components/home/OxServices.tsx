import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { Wordmark } from '../common/Wordmark';
import { ChannelCard } from '../blocks/ChannelCard';
import { SERVICE_CHANNELS, SERVICES_HUB } from '../../content/services';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The services band (DIRECTION 5.2 OxServices, 6.2 row 7, FINAL-content 1.4
 * and 4.3). This is the home page's one dark band and its one wedge.
 *
 * It is built to the approved image's band contract rather than to DIRECTION's
 * earlier tonal-panel sketch, because the image is the identity and it is
 * explicit about what a band is: a photograph under a gradient, the wedge at
 * the brand's 22 degrees, a statement, and the lockup. A flat graphite
 * rectangle with three cards on it is a stripe, not a chapter, and the whole
 * point of this section is to break the page.
 *
 * The photograph shows a counter and the products on it. It shows no face, by
 * rule: the store has no certified staff and a portrait beside an advice
 * heading would imply one (PLAN-final 5.1, claims source section 3).
 *
 * Claims gates: the reply-time line renders only when `reply_sla_hours` is set
 * and interpolates it; the 50 riyal consultation credit is the
 * `consultation_credit_note` setting rendered verbatim inside the card, and
 * neither sentence exists in the markup when its setting is empty.
 */

/** Decorative. The band says nothing the copy does not already say. */
export const DEFAULT_SERVICES_PHOTO = '/assets/images/services-band.jpg';

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
  const photo = fieldText(data, 'image') || DEFAULT_SERVICES_PHOTO;
  const replyHours = settingValue(settings, SERVICES_HUB.replyTimeSetting);

  return (
    <section className="ox-services ox-band-dark" data-testid="ox-services">
      <img className="ox-services__photo" src={photo} alt="" loading="lazy" decoding="async" />
      <span className="ox-services__scrim" aria-hidden="true" />
      <span className="ox-band__wedge ox-band__wedge--wide" aria-hidden="true" />
      <span className="ox-band__wedge ox-band__wedge--thin" aria-hidden="true" />

      <div className="ox-container ox-services__inner">
        <SectionHeader
          eyebrow={t('ox.home.services_eyebrow')}
          title={title}
          descriptor={intro}
          viewAll={{ to: '/services' }}
        />
        <div className="ox-channels">
          {SERVICE_CHANNELS.map((channel) => (
            <ChannelCard channel={channel} key={channel.id} />
          ))}
        </div>
        <div className="ox-services__foot">
          <div className="ox-services__notes">
            {replyHours ? (
              <p className="ox-services__reply ox-small" data-testid="ox-services-reply">
                {t('ox.home.services_reply', { hours: replyHours })}
              </p>
            ) : null}
            <p className="ox-services__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
          </div>
          {/* The owner's mark, the same asset the product page's band carries.
              It is what makes the band read as the brand speaking rather than
              as one more section. */}
          <p className="ox-services__lockup">
            <Wordmark width={148} variant="full" tone="dark" />
          </p>
        </div>
      </div>
    </section>
  );
}
