import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { SectionHeader } from '../common/SectionHeader';
import { PlanCard } from './PlanCard';
import { HOME_PLANS, SERVICES_HUB } from '../../content/services';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The advisory band: one tier, three photographic doors (S2 design-audit
 * 2026-09-22, `# propose:2` folded with the identity/claims/a11y judges'
 * required changes, plus the owner's evening amendments).
 *
 * IT SITS DIRECTLY AFTER THE NEEDS SECTION (the needs grid asks "which one",
 * this band answers "ask us"). It used to carry SIX cards: three "ask before
 * you buy" `ChannelCard`s plus these three plan doors. The channels moved to
 * `/services` (top of that page, `ServicesHub` mounts them directly) — a
 * reference draws three cards here, not six, and six in one row read as six
 * equivalent things, which is the confusion this rebuild removes. The written
 * question is still one click away: the header's route-out and the trust
 * strip's fourth cell both point at it.
 *
 * Ground: flat `--ox-graphite` plus ONE skewed motif (never a card slash: the
 * identity rule is one angled band edge per section, not scattered wedges).
 * The eyebrow is ink-on-dark with the accent bar, never orange type (§3.1:
 * accent is reserved for things people can click). ONE filled `ox-angled()`
 * CTA sits under the row — the band's one button, not three — because "the
 * band has no button" is the sentence that lost the identity review.
 *
 * Claims: this band STOPS RENDERING `ox.home.plans_title`, `plans_tier_title`
 * and `plan_cta` (the first is a retired section title, the second an
 * individualised-prescription tier heading with no tier left to head now
 * the channels are gone, the third a generic per-card CTA label). The
 * headline is the live `ox.services.title`; the per-card copy is the
 * existing, already-reviewed `ox.home.plan_*` strings (rule 4: their values
 * are never touched here). The reply-time line moved with the written
 * question to the channels section on `/services`.
 */

export interface OxServicesProps extends Partial<OxBlockProps> {
  /**
   * The one filled CTA under the row, to `/services`. On for the home page,
   * where the band is a trailer for the full page; off on `/services` itself,
   * where the row already sits on the page the CTA would point to.
   */
  routeOut?: boolean;
  className?: string;
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

        <ul className="ox-plans ox-reveal" role="list" ref={rowRef}>
          {HOME_PLANS.map((plan, index) => (
            <li className="ox-plans__slide" key={plan.id} style={{ ['--i' as string]: String(index) }}>
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
