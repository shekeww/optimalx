import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { useIntersectionOnce } from '../common/hooks/useIntersectionOnce';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { useHeaderMenu } from '../layout/Header/useHeaderMenu';
import { GOALS } from '../../content/goals';
import { GoalCard } from './GoalCard';
import type { OxBlockProps } from './defaults';

/**
 * The six goal collections (DIRECTION 5.2, 6.2 row 3, 7.2).
 *
 * The block has no merchant fields: the six goals are the content map, and each
 * one resolves its live category by slug through the header menu, falling back
 * to a search for its own label when the merchant has not created the category
 * yet (PLAN-final C15). That resolution is the header's hook, reused here so a
 * goal can never link to two different places on one page.
 *
 * The settle (DIRECTION 7.2) is the one entrance animation on the site: it runs
 * once per mount, starts when the grid is 30 per cent in view, and is skipped
 * entirely under reduced motion, where the cards are simply present. The grid
 * box is reserved at final size before it starts, so nothing shifts.
 */
export function OxGoals(_props: OxBlockProps) {
  const { t } = useTranslation();
  const { goals } = useHeaderMenu();
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);

  // Hidden only once JS has mounted and motion is allowed, so the server HTML
  // and a no-JS client always show the cards.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  const seen = useIntersectionOnce(gridRef, { threshold: 0.3, enabled: armed });
  const settle = !armed ? 'off' : seen ? 'running' : 'pending';

  const lineFor = (slug: string): string | undefined => {
    const goal = GOALS.find((candidate) => candidate.slug === slug);
    const need = goal?.subNeeds[0] ?? goal?.groups?.[0]?.subNeeds[0];
    return need ? t(need.titleKey) : undefined;
  };

  return (
    <section className="ox-goals" id="ox-goals" data-testid="ox-goals">
      <div className="ox-container">
        <SectionHeader title={t('ox.home.goals_title')} descriptor={t('ox.home.goals_intro')} />
        <ul className="ox-goals__grid" ref={gridRef} data-settle={settle}>
          {goals.map((goal, index) => (
            <li key={goal.slug}>
              <GoalCard
                slug={goal.slug}
                label={goal.label}
                line={lineFor(goal.slug)}
                icon={goal.icon}
                to={goal.to}
                index={index}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
