import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { BandPhoto } from './BandPhoto';
import type { HomePlan } from '../../content/services';

export interface PlanCardProps {
  plan: HomePlan;
  /** DOM index, consumed by the reveal stagger. */
  index?: number;
}

/**
 * One advisory card (homepage-spec section 7).
 *
 * The same dark photographic card the goal row uses, at a wider crop and with
 * a filled action instead of an outline one, because this is the half of the
 * business the store is actually asking to be judged on and a ghost button at
 * the bottom of it reads as a footnote.
 *
 * The whole card is one link; the action is a `span`. The photograph is the
 * brief's `plan-*.jpg` and none of the three exists yet, so `BandPhoto`
 * leaves the dark ground showing and the card is finished either way.
 */
export function PlanCard({ plan, index = 0 }: PlanCardProps) {
  const { t } = useTranslation();
  return (
    <Link
      to={plan.to}
      className="ox-plan"
      data-testid="ox-plan-card"
      data-plan={plan.id}
      style={{ ['--i' as string]: String(index) }}
    >
      {plan.photo ? <BandPhoto src={plan.photo} className="ox-plan__photo" /> : null}
      <span className="ox-plan__scrim" aria-hidden="true" />
      <span className="ox-plan__slash" aria-hidden="true" />
      <span className="ox-plan__body">
        <Icon name={plan.icon} size={28} className="ox-plan__icon" />
        <span className="ox-plan__title ox-h3">{t(plan.titleKey)}</span>
        <span className="ox-plan__line ox-small">{t(plan.lineKey)}</span>
        <span className="ox-plan__cta">
          <span className="ox-plan__cta-label">{t('ox.home.plan_cta')}</span>
          <i className="sicon-keyboard_arrow_right ox-mirror" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
