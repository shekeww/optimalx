import { useRef, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';
import { StoreRating } from '../common/StoreRating';
import { PlanCard } from './PlanCard';
import {
  effectivePrice,
  inbodyIncluded,
  replySlaHours,
  settingText,
  type Settings,
} from '../product/lib/claims';
import { idForSku } from '../../content/salla-ids';
import { readStoreRating } from '../../content/social-proof';
import { STORE_PHOTOS, storePhotoSrcSet } from '../../content/store-photos';
import {
  channelById,
  HOME_PLANS,
  SERVICES_HUB,
  SERVICE_CHANNELS,
  type ServiceChannel,
} from '../../content/services';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The offer strip's photo panel (VISIT-2026-09-24 §4.2): the advisory room,
 * the same portrait frame `/branch`'s own gallery will show. Read from the
 * manifest so the srcset always traces back to a rendition on disk.
 */
const ADVISORY_PHOTO = STORE_PHOTOS['advisory-room'];

/**
 * The advisory band: THE OFFER FIRST, then the ways to reach it (owner brief
 * 2026-09-24, with the live screenshot of the 1890px home band; the decision
 * record is `docs/build/progress/S7c.md`).
 *
 * WHAT CHANGED AND WHY. The band shipped by S5c said the two things the owner
 * most wants seen (that the advice is free and that the branch measures body
 * composition with InBody for nothing) in two grey notes, one under a row
 * title and one inside the third card, at the smallest type on the section.
 * Everything that could be clicked was an accent text link beside a 24px
 * chevron box, and every card's lower half was empty. So the offer is now the
 * first thing under the heading and it is a plate with real buttons on it:
 *
 *  - the HEAD (eyebrow, heading, subline), unchanged in copy;
 *  - the OFFER STRIP: two facts one type step over the row titles (free advice, and the free
 *    branch InBody measurement while `inbody_included` is on), then the
 *    band's own primary ("احجز زيارتك", the branch visit product) and its
 *    secondary ("اسأل الآن", the free written question), then the reply-time
 *    cue when the owner has filled `reply_sla_hours`. It carries the
 *    identity's corner cut and it is the largest text after the h2;
 *  - ROW ONE, the three ways to ask, each door sized to its content with a
 *    real full-width button pinned to its foot, a price chip, and the
 *    recommended door (the written question) carrying the accent outline,
 *    the `ox.home.door_recommended` eyebrow and the filled button;
 *  - ROW TWO, the three programmes, on `PlanCard`;
 *  - the TRUST ROW: the branch address, the consultation credit when the
 *    owner has written one, and then the limit-of-our-work line. Real facts
 *    or nothing: no counts, no ratings, nobody called an expert;
 *  - on the home page only, a quiet text link to `/services` ("كل الخدمات",
 *    named rather than a twelfth "عرض الكل", UX audit 2026-09-24, P1-7).
 *
 * BOTH SURFACES GET THE SAME COMPOSITION, `/services` included, so the offer
 * strip exists once per page; `routeOut` decides the heading and whether the
 * band offers a way out to another page, nothing else.
 *
 * Ground: flat `--ox-graphite` plus ONE skewed motif (never a card slash).
 * The eyebrow is ink-on-dark with the accent bar, never orange type (§3.1).
 *
 * Claims: every price is read live through `effectivePrice()`, never typed as
 * copy. The three gated cues each render nothing while their gate is shut:
 * the reply time interpolates `reply_sla_hours`, the consultation credit is
 * the `consultation_credit_note` text verbatim, and the InBody measurement
 * rides on `inbody_included` (default on, the device is at the branch today).
 * The InBody sentence is now ONE sentence in one place on the band
 * (`SERVICES_HUB.inbodyKey`), which is UX audit 2026-09-24 P0-12: it used to
 * say two different things on one screen. It names a measurement and a place,
 * never a diagnosis, a medical test, a number or an outcome.
 */

export interface OxServicesProps extends Partial<OxBlockProps> {
  /**
   * True on the home page, where the band is a trailer and ends in a quiet
   * link to `/services`; false on `/services` itself, where the band is the
   * offer and routes nobody out to the page they are standing on.
   */
  routeOut?: boolean;
  className?: string;
}

interface ChannelDoorProps {
  channel: ServiceChannel;
}

/**
 * One channel door, row one.
 *
 * It is NOT a link any more, and that is the point of this rebuild: the card
 * used to be one big anchor whose only visible affordance was an accent word
 * and a detached chevron box, so nothing on it looked pressable. The door is
 * a plain container now and the CTA is a real button: the outline
 * parallelogram, full width, 48 tall, pinned to the card's foot by the
 * stylesheet's `margin-block-start: auto`, so three doors of unequal copy
 * still end on one line. A `<button>`/`<a>` inside an `<a>` is invalid, which
 * is why the wrapper had to stop being a `Link` for the button to exist.
 *
 * The price reads `effectivePrice()`, the same sale/starting-price precedence
 * the engine's own add-to-cart form follows, and renders as a chip: the
 * accent-soft "مجاني" for the two free channels (the written question and the
 * branch visit, in the live catalogue), the riyal amount otherwise.
 */
function ChannelDoor({ channel }: ChannelDoorProps) {
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
  const recommended = channel.recommended === true;

  return (
    <div
      className={['ox-channel-door', recommended ? 'ox-channel-door--primary' : null]
        .filter(Boolean)
        .join(' ')}
      data-testid="ox-channel-door"
      data-channel={channel.id}
    >
      {recommended ? (
        <p className="ox-channel-door__flag ox-micro" data-testid="ox-channel-door-flag">
          {t('ox.home.door_recommended')}
        </p>
      ) : null}
      <Icon name={channel.icon} size={24} className="ox-channel-door__icon" />
      <p className="ox-channel-door__title ox-title">{t(channel.titleKey)}</p>
      <p className="ox-channel-door__line ox-small">{t(channel.metaKey)}</p>
      <p className="ox-channel-door__facts">
        <span className="ox-channel-door__price" data-testid="ox-channel-door-price">
          {amount === undefined ? null : isFree ? (
            <span className="ox-channel-door__chip">{t('ox.common.free')}</span>
          ) : (
            <Price amount={amount} size="h3" />
          )}
        </span>
        {credit ? (
          <span className="ox-channel-door__credit ox-small" data-testid="ox-channel-credit">
            {credit}
          </span>
        ) : null}
      </p>
      <Button
        to={channel.to}
        size={48}
        block
        variant={recommended ? 'primary' : 'secondary'}
        className="ox-channel-door__action"
      >
        {t(channel.doorCtaKey)}
      </Button>
    </div>
  );
}

/**
 * The offer strip: the two free things, and the two buttons that take them.
 *
 * This is the conversion element of the whole band, so it sits directly under
 * the heading, it is the largest type after it, and it is the only plate here
 * that carries the identity's corner cut. The InBody fact is gated and the
 * advisory fact is not: the written question and the branch visit are both
 * free in the live catalogue (`fixtures/store/products.json`, OX-044 and
 * OX-046 at 0), which is a fact about the shop's own price list rather than a
 * claim about anybody's health.
 *
 * The advisory-room photograph (VISIT-2026-09-24 §4.2; extended S9e item 1,
 * owner brief 2026-09-24: "extend the advisory image to have chemistry with
 * the section") is now part of the plate itself, never a rounded thumbnail
 * beside it: a full-width top band under the facts below 768, the plate's
 * own inline-end panel - spanning its full height, its inner edge cut at the
 * identity lean - from there. The plate's `ox-x-corner` stays the block's
 * ONE angled gesture; the panel's own cut is a second kind of construction on
 * a different selector (`.ox-offer__photo-frame`), which is what
 * `check-identity.mjs`'s `one-angled-per-block` rule actually polices (kinds
 * within one selector's own body, never across a family) - see `_b2-home.scss`
 * §8 for the full geometry and `docs/build/progress/S9e.md` for the measured
 * panel shares and the chosen `object-position`.
 */
function OfferStrip() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const visit = channelById('visit');
  const written = channelById('written');
  const replyHours = replySlaHours(settings as Settings);
  const showsInbody = inbodyIncluded(settings as Settings);

  return (
    <div className="ox-services__offer" data-testid="ox-services-offer">
      <div className="ox-offer__photo-frame">
        <img
          className="ox-offer__photo"
          src={ADVISORY_PHOTO.photo}
          srcSet={storePhotoSrcSet(ADVISORY_PHOTO)}
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 30vw, 100vw"
          width={ADVISORY_PHOTO.width}
          height={ADVISORY_PHOTO.height}
          alt={t('ox.home.offer_photo_alt')}
          loading="lazy"
          decoding="async"
        />
        <span className="ox-offer__photo-scrim" aria-hidden="true" />
        <span className="ox-offer__photo-glow" aria-hidden="true" />
      </div>
      <ul className="ox-offer__facts" role="list">
        <li className="ox-offer__fact" data-testid="ox-offer-advisory">
          <Icon name="help" size={24} className="ox-offer__icon" />
          <span className="ox-offer__fact-text ox-h3">{t('ox.home.offer_advisory')}</span>
        </li>
        {showsInbody ? (
          <li className="ox-offer__fact" data-testid="ox-offer-inbody">
            <Icon name="goal-ideal-weight" size={24} className="ox-offer__icon" />
            <span className="ox-offer__fact-text ox-h3">{t(SERVICES_HUB.inbodyKey)}</span>
          </li>
        ) : null}
      </ul>
      <div className="ox-offer__actions">
        <Button
          to={visit?.to ?? '/services'}
          size={48}
          variant="primary"
          className="ox-offer__action"
        >
          {t('ox.content.services.visit_cta_short')}
        </Button>
        <Button
          to={written?.to ?? '/services'}
          size={48}
          variant="secondary"
          className="ox-offer__action"
        >
          {t('ox.home.offer_cta_ask')}
        </Button>
      </div>
      {replyHours ? (
        <p className="ox-offer__cue ox-small" data-testid="ox-services-reply">
          {t('ox.home.services_reply', { hours: replyHours })}
        </p>
      ) : null}
    </div>
  );
}

interface BandRowProps {
  titleKey: string;
  noteKey: string;
  children: ReactNode;
  /** The plans row's own anchor (owner brief 2026-09-24: `/services#plans`,
   *  the weight-subscription poster's fallback while no subscription product
   *  exists). Absent on row one, which nothing links to by anchor. */
  id?: string;
}

/**
 * One row of the band: a title that names what the three cards are, a
 * one-line note, and the cards.
 *
 * NO REVEAL (X-IDENTITY 5.1, which this band was not following): the table
 * reads "Advisory band | nothing" and the text under it cut the band's own
 * stagger back to the single revealed block BUILD 3.4 sanctions. It is also
 * an availability question rather than a taste one: a revealed row sits at
 * `opacity: 0` until an IntersectionObserver callback arrives, and this
 * batch's own headless measurement caught the plans row still invisible
 * after a scroll pass because that callback never came. A row that holds the
 * offer may not depend on an observer to exist.
 *
 * The gated cues that used to hang off a row head are gone too: the InBody
 * line is the offer strip's second fact and the reply time is the line under
 * the strip's buttons, each said once on the band.
 *
 * A CAROUSEL BELOW 1024, A GRID FROM THERE (owner, 2026-09-25: "on mobile
 * make it a carousel, both the 3 cards at the top and the 3 cards below
 * them"). Each row sits on the shared rail primitive (`_rail.scss`): the
 * track snaps, hides the native scrollbar and scrolls sideways only, the
 * next card peeks past the reading end, and the accent chevron cue appears
 * once `useRailProgress` has measured a rail that can still scroll. From
 * 1024 the same track is the three-column grid (`_b2-home.scss` section 8),
 * nothing overflows, `data-rail` stays absent and the cue never draws. The
 * DOM order is the reading order on both, so the recommended door (first in
 * `SERVICE_CHANNELS`) is the card a phone sees first.
 *
 * The cue moves the track by one card and its gap (`scrollBy`, never
 * `scrollIntoView`, which can also scroll the page). `scrollLeft` runs
 * negative in RTL, so the step carries the track's own direction.
 */
function BandRow({ titleKey, noteKey, children, id }: BandRowProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);

  const next = () => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || 0;
    const step = (first?.getBoundingClientRect().width ?? track.clientWidth * 0.8) + gap;
    const factor = style.direction === 'rtl' ? -1 : 1;
    track.scrollBy({ left: factor * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="ox-services__row" id={id}>
      <div className="ox-services__row-head">
        <h3 className="ox-services__row-title ox-title">{t(titleKey)}</h3>
        <p className="ox-services__row-note ox-small">{t(noteKey)}</p>
      </div>
      <div className="ox-rail ox-services__rail" ref={railRef}>
        <ul className="ox-rail__track ox-plans" ref={trackRef} role="list">
          {children}
        </ul>
        <button
          type="button"
          className="ox-rail__cue"
          onClick={next}
          aria-label={t('ox.home.band_row_next')}
        >
          <span className="ox-rail__cue-arm" aria-hidden="true" />
          <span className="ox-rail__cue-arm ox-rail__cue-arm--down" aria-hidden="true" />
        </button>
        <div className="ox-rail__progress" />
      </div>
    </div>
  );
}

/**
 * The trust row: the facts the store can prove, and nothing else.
 *
 * The address prefers the owner's `branch_address` setting and falls back to
 * the locale line the branch block already prints (`OxBranch.tsx` does the
 * same, and the street is in the claims source), because the branch is a real
 * place whether or not the dashboard field has been filled. The consultation
 * credit renders verbatim from its own setting or not at all. The store's
 * Google rating (VISIT-2026-09-24 §4.2) is the row's first item, through
 * `StoreRating` alone and gated the same way (`readStoreRating`): a bare
 * figure with no source link is never rendered here, either. No professional
 * titles: there is nothing true to say in that shape yet.
 */
function TrustRow() {
  const { t, i18n } = useTranslation();
  const { settings } = useTheme();
  const rating = readStoreRating(settings);
  // Phase B J-09 (2026-09-25): the setting is the owner's Arabic text, so on
  // any other locale the row prints the locale's own address line (the one
  // the branch block and the contact page print) rather than Arabic under
  // an English heading; the Arabic band keeps the setting. The language is
  // the i18n instance's own (the same one `t` reads), so the section renders
  // wherever the band does, with no router or provider of its own.
  const language = i18n?.language;
  const arabic = !language || String(language).toLowerCase().startsWith('ar');
  const address =
    (arabic ? settingText(settings as Settings, 'branch_address') : undefined) ??
    t('ox.blocks.branch.address');
  const credit = settingText(settings as Settings, 'consultation_credit_note');

  return (
    <ul className="ox-services__trust ox-small" role="list" data-testid="ox-services-trust">
      {rating ? (
        <li className="ox-services__trust-item" data-testid="ox-trust-rating">
          <StoreRating variant="inline" value={rating} />
        </li>
      ) : null}
      <li className="ox-services__trust-item" data-testid="ox-trust-branch">
        <Icon name="map-pin" size={20} className="ox-services__trust-icon" />
        {address}
      </li>
      {credit ? (
        <li className="ox-services__trust-item" data-testid="ox-trust-credit">
          <Icon name="badge" size={20} className="ox-services__trust-icon" />
          {credit}
        </li>
      ) : null}
    </ul>
  );
}

export function OxServices({ data, routeOut = true, className }: OxServicesProps) {
  const { t } = useTranslation();
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

        <OfferStrip />

        <BandRow titleKey="ox.home.band_row_ask_title" noteKey="ox.home.band_row_ask_note">
          {SERVICE_CHANNELS.map((channel) => (
            <li className="ox-plans__slide" key={channel.id}>
              <ChannelDoor channel={channel} />
            </li>
          ))}
        </BandRow>

        <BandRow
          titleKey="ox.home.band_row_plans_title"
          noteKey="ox.home.band_row_plans_note"
          id="plans"
        >
          {HOME_PLANS.map((plan) => (
            <li className="ox-plans__slide" key={plan.id}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </BandRow>

        <TrustRow />

        {/* The limit-of-our-work line. It renders on every advisory surface
            and it is the reason none of the copy above has to hedge. */}
        <p className="ox-services__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>

        {routeOut ? (
          <p className="ox-services__cta">
            <Button to="/services" variant="link">
              {t('ox.services.view_all')}
            </Button>
          </p>
        ) : null}
      </div>
    </section>
  );
}
