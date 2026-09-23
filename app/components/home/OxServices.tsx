import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';
import { PlanCard } from './PlanCard';
import { effectivePrice } from '../product/lib/claims';
import { idForSku } from '../../content/salla-ids';
import { HOME_PLANS, SERVICES_HUB, SERVICE_CHANNELS, type ServiceChannel } from '../../content/services';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The advisory band: TWO ROWS of three (owner review 2026-09-23 (late),
 * item 3 — full audit in `docs/build/progress/S4a.md`).
 *
 * THE HISTORY, because it explains the shape below. The 2026-09-20 batch
 * (`ab8e6d2`) first built this section as one band of SIX cards: three
 * "ask before you buy" `ChannelCard`s (how a shopper asks) plus these three
 * `PlanCard` doors (what the asking leads to). S2c (2026-09-22) split the
 * two apart — the channels moved to the top of `/services` — on the reading
 * that "six cards in one row read as six equivalent things". The owner's
 * instruction on 2026-09-23 (late) is explicit: both halves belong on the
 * home page, so this batch rejoins them, but keeps S2c's own insight about
 * NOT mixing them into one undifferentiated row — row one is the three
 * channels (an upright `ChannelDoor`: icon, name, one-line summary, a live
 * price, a CTA to that channel's own product), row two is the three
 * photographic `PlanCard` doors, unchanged. One `<ul>` carries all six `<li>`
 * so the grid can lay them out as two rows of three once it reaches three
 * columns (1024+); at 390 they simply stack in that same channels-then-plans
 * order, which is what keeps the two questions ("ask us" / "get a plan")
 * answered in sequence rather than interleaved.
 *
 * `routeOut` ALSO gates row one now, not only the CTA: `/services`
 * (`ServicesHub.tsx`, `routeOut={false}`) already opens on its own dedicated
 * channels section, directly above where it mounts this band for "THE PLAN
 * DOORS" only (that file's own comment) — rendering the three channels a
 * second time, a few hundred pixels below the first three, would be the
 * exact "six cards read as six equivalent things" confusion S2c fixed by
 * moving them there in the first place. The home page has no such section,
 * so `routeOut={true}` (the default) is where both rows belong.
 *
 * Ground: flat `--ox-graphite` plus ONE skewed motif (never a card slash: the
 * identity rule is one angled band edge per section, not scattered wedges).
 * The eyebrow is ink-on-dark with the accent bar, never orange type (§3.1:
 * accent is reserved for things people can click). ONE filled `ox-angled()`
 * CTA sits under both rows — the band's one button, not one per card.
 *
 * Claims: this band still never renders `ox.home.plans_title`,
 * `plans_tier_title` or `plan_cta` (S2c's retirements, still correct — see
 * that batch's own note). The headline is the live `ox.services.title`; the
 * channel copy is the existing, already-reviewed `ox.content.services.*`
 * strings and the plan copy the existing `ox.home.plan_*` strings (rule 4:
 * neither is touched here). Every price is read live through
 * `effectivePrice()` (`product/lib/claims.ts`), never typed as copy and never
 * a per-serving figure.
 */

export interface OxServicesProps extends Partial<OxBlockProps> {
  /**
   * The one filled CTA under the rows, to `/services`. On for the home page,
   * where the band is a trailer for the full page; off on `/services` itself,
   * where the rows already sit on the page the CTA would point to.
   */
  routeOut?: boolean;
  className?: string;
}

interface ChannelDoorProps {
  channel: ServiceChannel;
}

/**
 * One channel door, row one (owner review 2026-09-23 (late), item 3): an
 * upright card — icon, name, one-line summary (`channel.metaKey`, already a
 * single sentence), a live price line, a CTA to the channel's own product
 * page — never a photograph, which is what tells this row apart from the
 * plan doors below it even once the grid joins the two into one track.
 *
 * The price reads `effectivePrice()`, the same sale/starting-price
 * precedence the engine's own add-to-cart form follows, and renders the
 * shared free label when the product costs nothing (the written question
 * and the branch visit both do, in the live catalogue).
 */
function ChannelDoor({ channel }: ChannelDoorProps) {
  const { t } = useTranslation();
  const id = idForSku(channel.sku);
  const query = useQuery({
    ...product.queries.detail(String(id ?? '')),
    enabled: id !== undefined,
  });
  const amount = query.data ? effectivePrice(query.data) : undefined;
  const isFree = amount === 0;

  return (
    <Link
      to={channel.to}
      className="ox-channel-door"
      data-testid="ox-channel-door"
      data-channel={channel.id}
    >
      <span className="ox-channel-door__body">
        <Icon name={channel.icon} size={28} className="ox-channel-door__icon" />
        <span className="ox-channel-door__title ox-h3">{t(channel.titleKey)}</span>
        <span className="ox-channel-door__line ox-small">{t(channel.metaKey)}</span>
        <span className="ox-channel-door__foot">
          <span className="ox-channel-door__price" data-testid="ox-channel-door-price">
            {amount === undefined ? null : isFree ? (
              <span className="ox-channel-door__free">{t('ox.common.free')}</span>
            ) : (
              <Price amount={amount} size="h3" />
            )}
          </span>
          <span className="ox-channel-door__cta">
            <span className="ox-channel-door__cta-label">{t('ox.home.band_card_cta')}</span>
            <i className="sicon-keyboard_arrow_right ox-mirror ox-iconbtn--angled" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export function OxServices({ data, routeOut = true, className }: OxServicesProps) {
  const { t } = useTranslation();
  const rowRef = useSectionReveal<HTMLUListElement>();
  // The block registry always passes `data`; `/services` mounts the section
  // directly and passes none, so the section falls back to its own defaults.
  const fields: OxBlockData = data ?? { path: 'ox-services' };

  const title = fieldText(fields, 'title') || t('ox.services.title');
  // No default band photograph any more: the reference's ground is flat
  // near-black plus the motif, not a photograph. The manifest's "Band image"
  // field still works for a merchant who uploads one.
  const band = fieldText(fields, 'image');

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

        {/* Row one (the three channels, home page only — see this file's own
            docblock for why `/services` skips it) then row two (the three
            plan doors), one list so the grid can lay both out as two rows
            of three at 1024+. */}
        <ul className="ox-plans ox-reveal" role="list" ref={rowRef}>
          {routeOut
            ? SERVICE_CHANNELS.map((channel, index) => (
                <li
                  className="ox-plans__slide"
                  key={channel.id}
                  style={{ ['--i' as string]: String(index) }}
                >
                  <ChannelDoor channel={channel} />
                </li>
              ))
            : null}
          {HOME_PLANS.map((plan, index) => (
            <li
              className="ox-plans__slide"
              key={plan.id}
              style={{
                ['--i' as string]: String((routeOut ? SERVICE_CHANNELS.length : 0) + index),
              }}
            >
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>

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
