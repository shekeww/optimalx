import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { GoalContent } from '../../../content/goals';
import { Button } from '../../common/Button';

export interface NeedHelpProps {
  goal: GoalContent;
  /** Where the CTA goes; the services hub by default. */
  to?: string;
}

/**
 * The need-help panel that closes a goal landing (DIRECTION 6.4 block 10): the
 * goal's own line from the content map and one primary into the written
 * question service.
 *
 * It promises nothing about a reply: any reply-time line is gated on the
 * `reply_sla_hours` setting and lives on the services surfaces (claims gate
 * 5.1), not here.
 */
export function NeedHelp({ goal, to = '/services' }: NeedHelpProps) {
  const { t } = useTranslation();
  const line = t(goal.needHelpKey);
  if (!line || line === goal.needHelpKey) return null;

  return (
    <aside className="ox-needhelp">
      <p className="ox-needhelp__line ox-body">{line}</p>
      <Button variant="primary" size={48} to={to}>
        {t(goal.needHelpCtaKey)}
      </Button>
    </aside>
  );
}
