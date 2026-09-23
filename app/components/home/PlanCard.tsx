import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { BandPhoto } from './BandPhoto';
import type { HomePlan } from '../../content/services';

export interface PlanCardProps {
  plan: HomePlan;
}

/**
 * One photographic door in the advisory band (S2 design-audit 2026-09-22,
 * reworked to `docs/build/X-IDENTITY-2026-09-22.md` §4.5-4.6).
 *
 * FADED photographic background: the frame sits at `opacity: 0.55`, under a
 * scrim whose gradient runs perpendicular to the mark's own 34° bars —
 * `linear-gradient(236deg, …)` in RTL, `124deg` in LTR (§4.5's own literal
 * values, declared as two rules rather than a `rotate`; a gradient angle is
 * outside `--ox-angle`/`--ox-skew`'s reach, so this is the one place a
 * literal degree is correct). The 0% stop is the darkest (0.94) and sits at
 * the card's top-inline-start corner, which is why the whole content block
 * lives there now instead of at the foot: §4.5 measures the floor at
 * alpha >= 0.60 for `--ox-ink-on-dark` on a worst-case white pixel, and only
 * the 0-72% zone of the gradient clears it. Past 72% the card carries no
 * text, only the watermark.
 *
 * §4.6: a dark plan card takes the watermark and no corner cut (the pastel
 * need cards take the corner cut and no watermark) — the two rows read as a
 * pair rather than the same card twice. The mark sits at accent 0.12 on
 * `--ox-band-util`, the measured ceiling for that pairing.
 *
 * The CTA label is the plan's OWN `ctaKey` (owner review 2026-09-23, late
 * night), not one shared label under all three cards: the training session is
 * booked ("احجز الجلسة") and the other two open a page that explains before it
 * books ("اعرف التفاصيل"), so the three labels say what the click does.
 *
 * The card carries no slash of its own: the identity rule spends the
 * section's one angled band edge on `OxServices`'s ground motif, so a second
 * angle here would be the "scattered wedges as texture" the rule forbids.
 * Hover is a 1px accent inset ring, never a lift (BUILD.md §3.4: border
 * colour only). The glyph is painted flat orange through the
 * `--ox-icon-mono` per-context override rather than the sprite's default
 * two-tone (white stroke, orange fleck) — one accent note, not two.
 */
export function PlanCard({ plan }: PlanCardProps) {
  const { t } = useTranslation();
  return (
    <Link to={plan.to} className="ox-plan" data-testid="ox-plan-card" data-plan={plan.id}>
      {plan.photo ? <BandPhoto src={plan.photo} className="ox-plan__photo" /> : null}
      <span className="ox-plan__scrim" aria-hidden="true" />
      <Icon name="mark" size={96} className="ox-plan__watermark" />
      <span className="ox-plan__body">
        <span className="ox-plan__title ox-h3">{t(plan.titleKey)}</span>
        <span className="ox-plan__line ox-small">{t(plan.lineKey)}</span>
        <span className="ox-plan__foot">
          <Icon name={plan.icon} size={24} className="ox-plan__icon ox-icon--mono" />
          <span className="ox-plan__cta">
            <span className="ox-plan__cta-label">{t(plan.ctaKey)}</span>
            <i className="sicon-keyboard_arrow_right ox-plan__arrow ox-mirror" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}
