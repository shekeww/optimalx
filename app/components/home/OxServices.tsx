import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { PlanCard } from './PlanCard';
import { ChannelCard } from '../blocks/ChannelCard';
import { HOME_PLANS, SERVICES_HUB, SERVICE_CHANNELS } from '../../content/services';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The advisory row, `برامج وخطط التغذية` (homepage-spec section 7).
 *
 * This block used to be the home page's one dark band: a photograph under a
 * gradient with the three "ask before you buy" channels sitting on it. The
 * reference puts something different here and it is the better call for this
 * business. Three dark cards on the light ground, one per programme, read as
 * three things the store offers; three cards floating on a photograph read as
 * one decorated stripe, and the advisory half of the business then reads as
 * an afterthought attached to the shop rather than half of what is for sale.
 *
 * The three are the ones `docs/build/image-brief.md` sections 9 to 11 name
 * and `HOME_PLANS` holds: nutrition plans, training, and the video
 * consultation. The two channels that are not programmes, the free written
 * question and the branch visit, stay on `/services`, which the section
 * header's route-out link points at, and the free written question is also
 * the trust strip's fourth cell. Neither leaves the page.
 *
 * The manifest's `image` field is labelled "Band image" in the dashboard, and
 * it still does what it says: setting it puts the section back on a dark
 * photographic band, with the three cards lifted a step so they read on it.
 * It is off unless the merchant fills it, because a dashboard control that
 * changes nothing is worse than one that is not there. The theme ships no
 * default for it: the design the reference draws is the cards on the page.
 *
 * Claims gate, unchanged: the reply-time sentence renders only when
 * `reply_sla_hours` is set and interpolates it. Nothing here promises a
 * result, a timeframe or an outcome, and no card names a professional title.
 */

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

/** The reference band behind the advisory row (image brief section 9). */
export const DEFAULT_SERVICES_BAND = '/assets/images/services-band.jpg';

export function OxServices({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const rowRef = useSectionReveal<HTMLDivElement>();

  const title = fieldText(data, 'title') || t('ox.home.plans_title');
  // The band is ON by default now, on the owner's reference frame. It used to
  // be opt-in and therefore never on, so the section rendered as three cards
  // on the page ground while the approved design is a photographic band with
  // the cards lifted onto it. A merchant who uploads their own still wins.
  const band = fieldText(data, 'image') || DEFAULT_SERVICES_BAND;
  const replyHours = settingValue(settings, SERVICES_HUB.replyTimeSetting);

  return (
    <section
      className={['ox-services', band ? 'ox-services--banded ox-band-dark' : null]
        .filter(Boolean)
        .join(' ')}
      data-testid="ox-services"
    >
      {band ? (
        <>
          <img className="ox-services__photo" src={band} alt="" loading="lazy" decoding="async" />
          <span className="ox-services__scrim" aria-hidden="true" />
        </>
      ) : null}
      <div className="ox-container ox-services__inner">
        <SectionHeader title={title} viewAll={{ to: '/services' }} />

        {/* TWO TIERS, and the order is the point.
            The channels are how a shopper ASKS: free or nearly so, no
            commitment, and therefore the cheapest yes on the page. The plans
            are what the asking LEADS TO, and they are paid. Putting the six in
            one flat row would make them read as six equivalent things and lose
            that, which is the confusion the brief exists to prevent. They are
            not mirrored either: two identical rows is what makes a section
            read as a template. They share the motif and differ in treatment. */}
        <div className="ox-services__tier">
          <h3 className="ox-services__tier-title">{t('ox.services.channels_title')}</h3>
          <div className="ox-channels ox-services__channels">
            {SERVICE_CHANNELS.map((channel) => (
              <ChannelCard channel={channel} key={channel.id} />
            ))}
          </div>
        </div>

        <span className="ox-services__rule" aria-hidden="true" />

        <div className="ox-services__tier">
          <h3 className="ox-services__tier-title">{t('ox.home.plans_tier_title')}</h3>
          <div className="ox-plans ox-reveal" ref={rowRef}>
            {HOME_PLANS.map((plan, index) => (
              <PlanCard plan={plan} key={plan.id} index={index} />
            ))}
          </div>
        </div>
        <div className="ox-services__notes">
          {replyHours ? (
            <p className="ox-services__reply ox-small" data-testid="ox-services-reply">
              {t('ox.home.services_reply', { hours: replyHours })}
            </p>
          ) : null}
          {/* The limit-of-our-work line. It renders on every advisory surface
              and it is the reason none of the copy above has to hedge. */}
          <p className="ox-services__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
        </div>
      </div>
    </section>
  );
}
