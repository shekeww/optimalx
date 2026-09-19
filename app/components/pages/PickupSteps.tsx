import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Panel } from '../common/Panel';
import { BRANCH } from '../../content/branch';
import { settingText } from '../product/lib/claims';

export interface PickupStepsProps {
  className?: string;
}

/**
 * "How to pick up your order" (DIRECTION 6.12 block 4, FINAL-content 5.4).
 *
 * Two of the four steps state a number the owner owns: how long the order
 * takes to be ready (`pickup_ready_hours`) and how long it is held
 * (`pickup_hold_days`). Both are empty today (open question Q5), and a pickup
 * promise with a missing number is a promise the store cannot keep, so the
 * whole block is hidden until both settings carry a value. That gate is the
 * reason this is a component and not four lines inside the page.
 *
 * It renders on the shared plate `Panel`, so a numbered procedure looks like
 * every other block of structured content on the site rather than like a
 * loose list under a heading.
 */
export function PickupSteps({ className }: PickupStepsProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const themeSettings = settings as Record<string, unknown> | undefined;

  const readyHours = settingText(themeSettings, BRANCH.settings.pickupReadyHours);
  const holdDays = settingText(themeSettings, BRANCH.settings.pickupHoldDays);
  if (!readyHours || !holdDays) return null;

  const values = { PICKUP_READY_HOURS: readyHours, PICKUP_HOLD_DAYS: holdDays };

  return (
    <Panel
      tone="plate"
      headingLevel="h2"
      title={t(BRANCH.pickup.titleKey)}
      className={['ox-pickup', className].filter(Boolean).join(' ')}
      testId="ox-pickup-steps"
    >
      <ol className="ox-pickup__list">
        {BRANCH.pickup.stepKeys.map((key, index) => (
          <li key={key} className="ox-pickup__step ox-body">
            <span className="ox-pickup__num ox-num" aria-hidden="true">
              {index + 1}
            </span>
            <span>{t(key, values)}</span>
          </li>
        ))}
      </ol>
      <p className="ox-pickup__late ox-small">{t(BRANCH.pickup.lateKey)}</p>
    </Panel>
  );
}
