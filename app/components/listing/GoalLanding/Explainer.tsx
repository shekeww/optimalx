import { useId, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { GoalContent } from '../../../content/goals';
import { Button } from '../../common/Button';

export interface ExplainerProps {
  goal: GoalContent;
}

/**
 * The explainer block (DIRECTION 6.4 block 4), rendered only for the one goal
 * whose content map carries one (goal-performance, FINAL-content 2.3).
 *
 * On mobile the text clamps to eight lines behind an expander while the DOM
 * keeps every word: the paragraphs are indexable and screen readers read them
 * whole, which a truncated string would not be. The expander toggles a class,
 * never the content.
 */
export function Explainer({ goal }: ExplainerProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const bodyId = `ox-explainer-${useId()}`;

  if (!goal.explainer) return null;
  const paragraphs = goal.explainer.bodyKeys
    .map((key) => t(key))
    .filter((text) => text.length > 0 && !text.startsWith('ox.'));
  if (paragraphs.length === 0) return null;

  return (
    <section className="ox-explainer ox-container--text" aria-labelledby={`${bodyId}-title`}>
      <h2 className="ox-h2" id={`${bodyId}-title`}>
        {t(goal.explainer.titleKey)}
      </h2>
      <div className={`ox-explainer__body${expanded ? ' is-expanded' : ''}`} id={bodyId}>
        {paragraphs.map((text, index) => (
          <p className="ox-body" key={index}>
            {text}
          </p>
        ))}
      </div>
      <Button
        variant="link"
        className="ox-explainer__toggle"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? t('ox.common.show_less') : t('ox.common.show_more')}
      </Button>
    </section>
  );
}
