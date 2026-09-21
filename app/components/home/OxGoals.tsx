import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { useHeaderMenu } from '../layout/Header/useHeaderMenu';
import { GOAL_CARD_LINES, goalPhoto } from '../../content/goals';
import { GoalCard } from './GoalCard';
import { useSectionReveal } from './useSectionReveal';
import type { OxBlockProps } from './defaults';

/**
 * The six goal collections (homepage-spec section 4).
 *
 * The block has no merchant fields: the six goals are the content map, and
 * each resolves its live category by slug through the header menu, falling
 * back to a search for its own label when the category does not exist yet
 * (PLAN-final C15). That resolution is the header's hook, reused here so a
 * goal can never link to two different places on one page.
 *
 * The photograph per goal comes from `GOAL_PHOTOS`, which holds the paths
 * `docs/build/image-brief.md` names, so a generated frame needs no code
 * change. Until then every card renders its dark ground.
 *
 * The line under each name is `GOAL_CARD_LINES`, a list of the product types
 * the goal routes to. It is deliberately not the goal's first sub-need
 * heading, which is what the card used to show: one of those reads as an
 * effect, and a goal card may name a category of product and never a promised
 * result.
 *
 * The row is the page's largest reveal: one rise and fade, staggered across
 * the six by `--stagger-step`, fired once by the shared observer and skipped
 * entirely for a visitor who is already looking at the row.
 */
export function OxGoals(_props: OxBlockProps) {
  const { t } = useTranslation();
  const { goals } = useHeaderMenu();
  const gridRef = useSectionReveal<HTMLUListElement>();

  const lineFor = (slug: string): string | undefined => {
    const key = GOAL_CARD_LINES[slug];
    return key ? t(key) : undefined;
  };

  return (
    <section className="ox-goals" id="ox-goals" data-testid="ox-goals">
      <div className="ox-container">
        <SectionHeader title={t('ox.home.goals_title')} />
        <ul className="ox-goals__grid ox-reveal" ref={gridRef}>
          {goals.map((goal, index) => (
            // `--i` sits on the reveal's direct child, because that is the box
            // the stagger delays; custom properties inherit down, so the card
            // reads the same value.
            <li key={goal.slug} style={{ ['--i' as string]: String(index) }}>
              <GoalCard
                slug={goal.slug}
                label={goal.label}
                line={lineFor(goal.slug)}
                icon={goal.icon}
                to={goal.to}
                photo={goalPhoto(goal.slug)}
                index={index}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
