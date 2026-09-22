import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { BandPhoto } from './BandPhoto';
import type { HomePlan } from '../../content/services';

export interface PlanCardProps {
  plan: HomePlan;
}

/**
 * One photographic door in the advisory band (S2 design-audit 2026-09-22).
 *
 * FADED photographic background (owner amendment 2026-09-22 evening): the
 * frame sits at low opacity, and a scrim angled on the identity's own skew
 * (`var(--ox-skew)`, never a literal degree) darkens the text end while
 * leaving the middle open enough that the photograph still reads as a
 * picture, not as a black rectangle with a caption. `BandPhoto` swallows a
 * missing frame, so a card with no photograph is still a finished dark card.
 *
 * The card carries no slash of its own: the identity rule spends the
 * section's one angled band edge on `OxServices`'s ground motif, so a second
 * angle here would be the "scattered wedges as texture" the rule forbids.
 * Hover is a 1px accent inset ring, never a lift (BUILD.md §3.4: border
 * colour only). The glyph sits in the bottom stack, painted flat orange
 * through the `--ox-icon-mono` per-context override rather than the sprite's
 * default two-tone (white stroke, orange fleck) — one accent note, not two.
 */
export function PlanCard({ plan }: PlanCardProps) {
  const { t } = useTranslation();
  return (
    <Link to={plan.to} className="ox-plan" data-testid="ox-plan-card" data-plan={plan.id}>
      {plan.photo ? <BandPhoto src={plan.photo} className="ox-plan__photo" /> : null}
      <span className="ox-plan__scrim" aria-hidden="true" />
      <span className="ox-plan__body">
        <span className="ox-plan__title ox-h3">{t(plan.titleKey)}</span>
        <span className="ox-plan__line ox-small">{t(plan.lineKey)}</span>
        <span className="ox-plan__foot">
          <Icon name={plan.icon} size={24} className="ox-plan__icon ox-icon--mono" />
          <span className="ox-plan__cta">
            <span className="ox-plan__cta-label">{t('ox.home.band_card_cta')}</span>
            <i className="sicon-keyboard_arrow_right ox-plan__arrow ox-mirror" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}
