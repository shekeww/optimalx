import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';
import { PlanCard } from './PlanCard';
import {
  effectivePrice,
  inbodyIncluded,
  replySlaHours,
  settingText,
  type Settings,
} from '../product/lib/claims';
import { idForSku } from '../../content/salla-ids';
import { HOME_PLANS, SERVICES_HUB, SERVICE_CHANNELS, type ServiceChannel } from '../../content/services';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The advisory band: ONE OFFER IN TWO STEPS, on the home page and on
 * `/services` alike (owner review 2026-09-23, late night; the copy table is in
 * `docs/build/progress/S5c.md`).
 *
 * THE SHAPE, and why it is this one. The band used to be six cards under one
 * heading, with the eyebrow ("قبل أن تشتري") repeating the heading ("اسأل قبل
 * أن تشتري") and nothing telling the reader that the first three cards and the
 * last three answer different questions. It now reads top to bottom as a
 * single offer:
 *
 *  - an EYEBROW that frames the offer ("المعلومة أولا، ثم القرار") and says
 *    something the heading does not, which is the only condition DIRECTION
 *    amendment A4 puts on an eyebrow existing at all;
 *  - the HEADING as the invitation: "اسأل قبل أن تشتري" on the home page (the
 *    locked nav and page label, voice doc 3.3). On `/services` that exact
 *    sentence is already the page's h1, so the band takes "ابدأ من هنا"
 *    instead rather than saying the same words twice on one screen;
 *  - a SUBLINE with what the reader gets and the honest limit of it;
 *  - ROW ONE, the three ways to ask, with its own title and note, plus the
 *    reply-time cue when (and only when) the owner has set `reply_sla_hours`;
 *  - ROW TWO, what the asking leads to, with its own title and note;
 *  - ONE primary next step: "عرض الكل" to `/services` on the home page; on
 *    `/services` the written-question door itself is the section's primary
 *    (`ox-channel-door--primary`), because the page the CTA would point at is
 *    the page the reader is standing on;
 *  - the limit-of-our-work line, last, which is why nothing above it hedges.
 *
 * BOTH ROWS RENDER ON BOTH PAGES now. `/services` used to draw its own fuller
 * channel section above this band and `routeOut` gated row one off to avoid
 * showing the three channels twice; that section is gone (see
 * `ServicesHub.tsx`), so the band carries the whole offer on both surfaces and
 * `routeOut` means only what its name says: whether the section routes the
 * reader out to another page.
 *
 * Ground: flat `--ox-graphite` plus ONE skewed motif (never a card slash: the
 * identity rule is one angled band edge per section, not scattered wedges).
 * The eyebrow is ink-on-dark with the accent bar, never orange type (§3.1:
 * accent is reserved for things people can click).
 *
 * Claims: every price is read live through `effectivePrice()`
 * (`product/lib/claims.ts`), never typed as copy and never a per-serving
 * figure. The three trust cues are gated on the owner's own settings and each
 * renders nothing while its gate is off: the reply time interpolates
 * `reply_sla_hours`, the consultation credit is the `consultation_credit_note`
 * text verbatim, and the free InBody body-composition MEASUREMENT at the
 * branch (owner statement 2026-09-23; claims source section 2, row 10) rides
 * on `inbody_included`, which is the one gate that defaults to on because the
 * device is at the branch today. The InBody copy names a measurement and a
 * place, never a diagnosis, a medical test or an outcome.
 */

export interface OxServicesProps extends Partial<OxBlockProps> {
  /**
   * True on the home page, where the band is a trailer and its one filled CTA
   * opens `/services`; false on `/services` itself, where the band is the
   * offer and the written-question door is its primary action instead.
   */
  routeOut?: boolean;
  className?: string;
}

interface ChannelDoorProps {
  channel: ServiceChannel;
  /** The section's one primary action, on the page that has no CTA button. */
  primary?: boolean;
}

/**
 * One channel door, row one: an upright card — icon, name, one-line summary
 * (`channel.metaKey`, already a single sentence), the gated notes (the
 * consultation credit on the video door, the branch measurement on the visit
 * door), a live price line and the channel's own short CTA verb — never a
 * photograph, which is what tells this row apart from the plan doors below it
 * even once the grid joins the two into one three-up track.
 *
 * The price reads `effectivePrice()`, the same sale/starting-price precedence
 * the engine's own add-to-cart form follows, and renders the shared free label
 * when the product costs nothing (the written question and the branch visit
 * both do, in the live catalogue).
 */
function ChannelDoor({ channel, primary = false }: ChannelDoorProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const id = idForSku(channel.sku);
  const query = useQuery({
    ...product.queries.detail(String(id ?? '')),
    enabled: id !== undefined,
  });
  const amount = query.data ? effectivePrice(query.data) : undefined;
  const isFree = amount === 0;
  // Verbatim from the owner's setting, or nothing at all: the 50 riyal credit
  // is a claim the store may only make once the coupon exists (claims source
  // section 2, row 7).
  const credit = channel.gatedSetting
    ? settingText(settings as Settings, channel.gatedSetting)
    : null;
  // The branch measurement, said only while the owner's switch is on.
  const inbody =
    channel.inbodyKey && inbodyIncluded(settings as Settings) ? channel.inbodyKey : null;

  return (
    <Link
      to={channel.to}
      className={['ox-channel-door', primary ? 'ox-channel-door--primary' : null]
        .filter(Boolean)
        .join(' ')}
      data-testid="ox-channel-door"
      data-channel={channel.id}
    >
      <span className="ox-channel-door__body">
        <Icon name={channel.icon} size={28} className="ox-channel-door__icon" />
        <span className="ox-channel-door__title ox-h3">{t(channel.titleKey)}</span>
        <span className="ox-channel-door__line ox-small">{t(channel.metaKey)}</span>
        {credit ? (
          <span className="ox-channel-door__credit ox-small" data-testid="ox-channel-credit">
            {credit}
          </span>
        ) : null}
        {inbody ? (
          <span className="ox-channel-door__credit ox-small" data-testid="ox-channel-inbody">
            {t(inbody)}
          </span>
        ) : null}
        <span className="ox-channel-door__foot">
          <span className="ox-channel-door__price" data-testid="ox-channel-door-price">
            {amount === undefined ? null : isFree ? (
              <span className="ox-channel-door__free">{t('ox.common.free')}</span>
            ) : (
              <Price amount={amount} size="h3" />
            )}
          </span>
          <span className="ox-channel-door__cta">
            <span className="ox-channel-door__cta-label">{t(channel.doorCtaKey)}</span>
            <i className="sicon-keyboard_arrow_right ox-mirror ox-iconbtn--angled" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}

interface BandRowProps {
  titleKey: string;
  noteKey: string;
  /** A gated trust cue: rendered only when the owner's setting carries it. */
  cue?: { text: string; testId: string } | null;
  children: ReactNode;
}

/**
 * One row of the band: a title that names what the three cards are, a one-line
 * note, an optional gated cue, and the cards. Each row owns its own reveal, so
 * the stagger runs across the three cards of that row rather than across all
 * six at once.
 */
function BandRow({ titleKey, noteKey, cue, children }: BandRowProps) {
  const { t } = useTranslation();
  const rowRef = useSectionReveal<HTMLUListElement>();

  return (
    <div className="ox-services__row">
      <div className="ox-services__row-head">
        <h3 className="ox-services__row-title ox-h3">{t(titleKey)}</h3>
        <p className="ox-services__row-note ox-small">{t(noteKey)}</p>
        {cue ? (
          <p className="ox-services__row-cue ox-small" data-testid={cue.testId}>
            {cue.text}
          </p>
        ) : null}
      </div>
      <ul className="ox-plans ox-reveal" role="list" ref={rowRef}>
        {children}
      </ul>
    </div>
  );
}

export function OxServices({ data, routeOut = true, className }: OxServicesProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  // The block registry always passes `data`; `/services` mounts the section
  // directly and passes none, so the section falls back to its own defaults.
  const fields: OxBlockData = data ?? { path: 'ox-services' };

  // The merchant's heading wins on the home page; with none, the invitation.
  // On `/services` the page's own h1 is already that invitation, so the band
  // says the next thing instead of the same thing.
  const title =
    fieldText(fields, 'title') ||
    t(routeOut ? 'ox.services.title' : 'ox.home.band_title_services');
  // No default band photograph any more: the reference's ground is flat
  // near-black plus the motif, not a photograph. The manifest's "Band image"
  // field still works for a merchant who uploads one.
  const band = fieldText(fields, 'image');
  const replyHours = replySlaHours(settings as Settings);
  const showsInbody = inbodyIncluded(settings as Settings);

  return (
    <section
      className={['ox-services', 'ox-services--banded', 'ox-band-dark', className]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="ox-services-title"
      data-testid="ox-services"
    >
      {band ? (
        <>
          <img className="ox-services__photo" src={band} alt="" loading="lazy" decoding="async" />
          <span className="ox-services__scrim" aria-hidden="true" />
        </>
      ) : null}
      {/* The one angled band edge: a skewed accent motif plus a hairline,
          behind everything, never a per-card slash. */}
      <span className="ox-services__motif" aria-hidden="true" />
      <span className="ox-services__motif ox-services__motif--hair" aria-hidden="true" />

      <div className="ox-container ox-services__inner">
        <header className="ox-services__head">
          <p className="ox-services__eyebrow">
            <span className="ox-services__eyebrow-bar" aria-hidden="true" />
            {t('ox.home.band_eyebrow')}
          </p>
          <h2 id="ox-services-title" className="ox-services__title ox-h2">
            {title}
          </h2>
          <p className="ox-services__subline">{t('ox.home.band_subline')}</p>
        </header>

        <BandRow
          titleKey="ox.home.band_row_ask_title"
          noteKey="ox.home.band_row_ask_note"
          cue={
            replyHours
              ? {
                  text: t('ox.home.services_reply', { hours: replyHours }),
                  testId: 'ox-services-reply',
                }
              : null
          }
        >
          {SERVICE_CHANNELS.map((channel, index) => (
            <li
              className="ox-plans__slide"
              key={channel.id}
              style={{ ['--i' as string]: String(index) }}
            >
              <ChannelDoor channel={channel} primary={!routeOut && channel.id === 'written'} />
            </li>
          ))}
        </BandRow>

        <BandRow
          titleKey="ox.home.band_row_plans_title"
          noteKey="ox.home.band_row_plans_note"
          cue={
            showsInbody
              ? { text: t('ox.home.band_inbody_plans'), testId: 'ox-services-inbody' }
              : null
          }
        >
          {HOME_PLANS.map((plan, index) => (
            <li
              className="ox-plans__slide"
              key={plan.id}
              style={{ ['--i' as string]: String(index) }}
            >
              <PlanCard plan={plan} />
            </li>
          ))}
        </BandRow>

        {routeOut ? (
          <div className="ox-services__cta">
            <Button to="/services" size={44} variant="primary">
              {t('ox.common.view_all')}
            </Button>
          </div>
        ) : null}

        {/* The limit-of-our-work line. It renders on every advisory surface
            and it is the reason none of the copy above has to hedge. */}
        <p className="ox-services__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
      </div>
    </section>
  );
}
