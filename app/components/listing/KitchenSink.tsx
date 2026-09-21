import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { GOALS } from '../../content/goals';
import { CategoryFaq } from './CategoryFaq';
import { CategoryIntro } from './CategoryIntro';
import { ChildChips } from './ChildChips';
import { GoalHero } from './GoalLanding/GoalHero';
import { GoalIntro } from './GoalLanding/GoalIntro';
import { Explainer } from './GoalLanding/Explainer';
import { NeedHelp } from './GoalLanding/NeedHelp';
import { SubNeeds } from './GoalLanding/SubNeeds';
import { ListingHeader } from './ListingHeader';
import { ListingToolbar } from './ListingToolbar';
import { ListEnd, LoadMore } from './LoadMore';
import { ProductCardSkeleton } from './ProductGrid';
import { RelatedGuides } from './RelatedGuides';
import { sortOptions } from './sortOptions';

/**
 * The listing section of the kitchen sink (PLAN-final C16). Dev-only: it
 * renders the blocks a live listing cannot show yet, because the store has no
 * categories (the goal hero and its ten blocks) and no guides (the related
 * rows), so the design review has something to look at.
 */
export default function KitchenSink() {
  const { t } = useTranslation();
  const goal = GOALS.find((item) => item.slug === 'goal-performance') ?? GOALS[0];
  const weight = GOALS.find((item) => item.slug === 'goal-ideal-weight');

  return (
    <section>
      <h2>Listing (B4)</h2>

      <h3>ListingHeader, in the masthead band</h3>
      <div className="ox-listing__band">
        <div className="ox-container ox-listing__band-inner">
          <ListingHeader
            title="واي بروتين"
            intro={<CategoryIntro introKey="ox.content.categories.whey_protein.intro" />}
          />
        </div>
      </div>

      <h3>ListingToolbar</h3>
      <ListingToolbar
        chips={<ChildChips slug="protein" />}
        sort={{ value: 'ourSuggest', options: sortOptions(t), onChange: () => undefined }}
        filters={{ count: 2, onOpen: () => undefined }}
      />

      <h3>Grid skeleton</h3>
      <ul className="ox-grid-products">
        {[0, 1, 2, 3].map((index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>

      <h3>LoadMore</h3>
      <LoadMore loadedCount={24} hasMore />
      <p>
        <ListEnd />
      </p>

      <h3>Goal landing</h3>
      <GoalHero goal={goal} gridId="ks-grid" titleId="ks-goal-title" />
      <GoalIntro goal={goal} />
      <Explainer goal={goal} />
      <SubNeeds needs={goal.subNeeds} />
      {weight?.groups?.map((group) => (
        <SubNeeds
          key={group.anchor}
          anchor={group.anchor}
          title={t(group.titleKey)}
          intro={t(group.introKey)}
          needs={group.subNeeds}
        />
      ))}
      <NeedHelp goal={goal} />

      <h3>FAQ and guides</h3>
      <CategoryFaq slug="whey-protein" id="ks-faq" />
      <RelatedGuides
        items={[
          { slug: 'guides/protein-dose', title: 'Guide row one', to: '/guides/protein-dose' },
          { slug: 'guides/protein-timing', title: 'Guide row two', to: '/guides/protein-timing' },
        ]}
      />
    </section>
  );
}
