import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { PlanCard } from './PlanCard';
import { HOME_PLANS, SERVICES_HUB } from '../../content/services';
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

export function OxServices({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const rowRef = useSectionReveal<HTMLDivElement>();

  const title = fieldText(data, 'title') || t('ox.home.plans_title');
  const intro = fieldText(data, 'intro') || t('ox.home.plans_intro');
  const band = fieldText(data, 'image');
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
        <div className="ox-plans ox-reveal" ref={rowRef}>
          {HOME_PLANS.map((plan, index) => (
            <PlanCard plan={plan} key={plan.id} index={index} />
          ))}
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
