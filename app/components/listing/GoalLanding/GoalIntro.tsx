import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { GoalContent } from '../../../content/goals';

export interface GoalIntroProps {
  goal: GoalContent;
}

/**
 * The goal intro (DIRECTION 6.4 block 3): the full paragraph from the content
 * map in the text measure. The hero above it carries only the first sentence,
 * so the page states it once and then completes it.
 */
export function GoalIntro({ goal }: GoalIntroProps) {
  const { t } = useTranslation();
  const text = t(goal.introKey);
  if (!text || text === goal.introKey) return null;
  return (
    <div className="ox-goal-intro ox-container--text">
      <p className="ox-body">{text}</p>
    </div>
  );
}
