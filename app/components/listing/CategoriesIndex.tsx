import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { GOAL_CARD_LINES, goalPhoto } from '../../content/goals';
import { CATEGORIES, HOME_TILE_TONES } from '../../content/categories';
import { nodeBySlug } from '../../content/taxonomy';
import { Icon } from '../common/Icon';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { SectionHeader } from '../common/SectionHeader';
import { CategoryTile, type CategoryTileTone } from '../home/CategoryTile';
import { GoalCard } from '../home/GoalCard';
import { useSectionReveal } from '../home/useSectionReveal';
import { useTaxonomyLinks, type TaxonomyLink } from './useTaxonomyLinks';
import type { TFunction } from './types';

/**
 * The locale keys `/categories` reads, in one place so the route head and the
 * page cannot drift apart (`app/routes/categories.tsx` builds `<title>` and
 * the description from the same object).
 */
export const CATEGORIES_INDEX_KEYS = {
  h1: 'ox.tax.index.h1',
  title: 'ox.tax.index.title',
  description: 'ox.tax.index.description',
  intro: 'ox.tax.index.intro',
  utilityTitle: 'ox.tax.index.utility_title',
} as const;

/**
 * `CategoryContent.backgroundImage` and `cardLineKey`, by slug: the SAME two
 * maps `OxCategories.tsx` builds for the home grid, read here by
 * `link.slug` so a type tile on this page receives exactly the props the
 * home tile for the same slug receives.
 */
const ART_BY_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((entry) => entry.backgroundImage).map((entry) => [entry.slug, entry.backgroundImage as string])
);
const LINE_BY_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((entry) => entry.cardLineKey).map((entry) => [entry.slug, entry.cardLineKey as string])
);
const TYPE_TONE = HOME_TILE_TONES as Record<string, CategoryTileTone>;

/**
 * `/categories`: the index of the 25-node taxonomy (PLAN-ship Batch S1 step
 * 6). The ten type roots, the six goals and a row of the four utility
 * categories.
 *
 * THE TYPE GRID IS THE HOME GRID (owner review 2026-09-25: "it should have
 * the same exact design of categories section in homepage"). Each type is the
 * home page's own `CategoryTile` in the home page's own `.ox-cats__grid`: the
 * same art, tint, icon, short name, product-type line and angled arrow, the
 * same 2-up phone grid and 4-up desktop grid, the same reveal. The long meta
 * description and protein's child chips the old type card carried are gone
 * from the tile, as the home tile has neither; the children stay one tap
 * away as the chip row on the protein listing itself (`ListingToolbar`).
 * `.ox-cat-index` takes the home container's measure (`_b4-listing.scss`
 * section 14), so a tile here is the same size as the home tile, not 5%
 * narrower inside the page gutter.
 *
 * Every link comes from `useTaxonomyLinks` (Contract C), so a tile points at
 * the live category when the store has one and at a search for the node's
 * own name until then, the same answer the header and the drawer give for
 * the same slug.
 *
 * The goal cards are the home page's `GoalCard` in the home page's
 * `.ox-goals__grid`, unchanged, with the same photograph and product-type
 * line: one goal, one card, wherever it appears.
 */
export function CategoriesIndex() {
  const { t } = useTranslation();
  const { types, goals, utility } = useTaxonomyLinks();
  const typesRef = useSectionReveal<HTMLUListElement>();
  const goalsRef = useSectionReveal<HTMLUListElement>();

  const page: Page = { title: t(CATEGORIES_INDEX_KEYS.h1), slug: 'categories' };

  return (
    <div className="ox-page ox-cat-index" data-testid="ox-categories-index">
      <OxBreadcrumb page={page} className="ox-crumbs" />

      <header className="ox-page-head">
        <h1 className="ox-page-head__title ox-h1" id="categories-title">
          {t(CATEGORIES_INDEX_KEYS.h1)}
        </h1>
        <p className="ox-page-head__lead ox-lead">{t(CATEGORIES_INDEX_KEYS.intro)}</p>
      </header>

      <section className="ox-cat-index__section" aria-labelledby="categories-types-title">
        <SectionHeader as="h2" title={t('ox.home.categories_title')} titleId="categories-types-title" />
        <ul className="ox-cats__grid ox-reveal" ref={typesRef} role="list">
          {types.map((link, index) => (
            <li key={link.slug} className="ox-cat-index__item" style={{ ['--i' as string]: String(index) }}>
              <TypeTile link={link} index={index} t={t} />
            </li>
          ))}
        </ul>
      </section>

      <section className="ox-cat-index__section" aria-labelledby="categories-goals-title">
        <SectionHeader as="h2" title={t('ox.home.goals_title')} titleId="categories-goals-title" />
        <ul className="ox-goals__grid ox-reveal" ref={goalsRef}>
          {goals.map((goal, index) => {
            const lineKey = GOAL_CARD_LINES[goal.slug];
            return (
              <li key={goal.slug} className="ox-cat-index__item" style={{ ['--i' as string]: String(index) }}>
                <GoalCard
                  slug={goal.slug}
                  label={goal.label}
                  line={lineKey ? t(lineKey) : undefined}
                  icon={goal.icon}
                  to={goal.to}
                  photo={goalPhoto(goal.slug)}
                  index={index}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ox-cat-index__section" aria-labelledby="categories-utility-title">
        <SectionHeader
          as="h2"
          title={t(CATEGORIES_INDEX_KEYS.utilityTitle)}
          titleId="categories-utility-title"
        />
        <ul className="ox-cat-index__utility">
          {utility.map((link) => (
            <li key={link.slug} className="ox-cat-index__utility-item">
              <UtilityRow link={link} t={t} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** The node's meta description, or empty when the key does not resolve. */
function descriptionOf(link: TaxonomyLink, t: TFunction): string {
  const node = nodeBySlug(link.slug);
  if (!node) return '';
  const text = t(node.descriptionKey);
  return text && text !== node.descriptionKey ? text : '';
}

interface CardProps {
  link: TaxonomyLink;
  t: TFunction;
}

/**
 * One type root as the home tile. The label is the node's short name
 * (`ox.tax.<key>.name`), the one `OxCategories` passes, never the live
 * category's own longer name; the tone, art and line come off the same
 * `HOME_TILE_TONES`, `backgroundImage` and `cardLineKey` the home grid reads.
 * The two roots with no home tile (`snacks-bars`, `accessories`) carry no
 * art and no line, so they render the home tile's own tinted variant on the
 * neutral `ash` ground, with the live category image in its image slot.
 */
function TypeTile({ link, index, t }: CardProps & { index: number }) {
  const node = nodeBySlug(link.slug);
  const lineKey = LINE_BY_SLUG[link.slug];
  return (
    <CategoryTile
      slug={link.slug}
      tone={TYPE_TONE[link.slug] ?? 'ash'}
      icon={link.icon}
      label={node ? t(node.nameKey) : link.label}
      line={lineKey ? t(lineKey) : ''}
      to={link.to}
      count={link.count}
      image={link.image}
      art={ART_BY_SLUG[link.slug]}
      index={index}
    />
  );
}

function UtilityRow({ link, t }: CardProps) {
  const description = descriptionOf(link, t);
  return (
    <Link to={link.to} className="ox-cat-index__util" data-testid="ox-utility-row">
      <Icon name={link.icon} size={24} className="ox-cat-index__util-icon" />
      <span className="ox-cat-index__util-body">
        <span className="ox-cat-index__util-name">{link.label}</span>
        {description ? <span className="ox-cat-index__util-desc ox-small">{description}</span> : null}
      </span>
    </Link>
  );
}
