import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { GOAL_CARD_LINES, goalPhoto } from '../../content/goals';
import { HOME_TILE_TONES } from '../../content/categories';
import { nodeBySlug } from '../../content/taxonomy';
import { Icon } from '../common/Icon';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { SectionHeader } from '../common/SectionHeader';
import { GoalCard } from '../home/GoalCard';
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
 * `/categories`: the index of the 25-node taxonomy (PLAN-ship Batch S1 step
 * 6). Ten type cards (protein carrying its five children as chips), six goal
 * cards, and a row of the four utility categories.
 *
 * THE DEFECT THIS CLOSES. The home page's category row has linked "عرض الكل"
 * to `/categories` since B2, and the route never existed (PLAN-ship §1 item
 * 6): the most prominent "see everything" link on the storefront was a 404
 * in production.
 *
 * Every link comes from `useTaxonomyLinks` (Contract C), so a card points at
 * the live category when the store has one and at a search for the node's
 * own name until then, the same answer the header and the drawer give for
 * the same slug. A card also shows the live category's image once one
 * exists (the overlay, then batch S5's store write), and the sprite glyph
 * until then, so the grid is finished in both states rather than a row of
 * broken-image corners.
 *
 * It is a page with words, not a grid (SEO-ENG-009): an h1, an intro that
 * says what the page holds and how to choose an entry point, and each type
 * card's meta description under its name. The description sits OUTSIDE the
 * card's link on purpose. The whole card is clickable through a stretched
 * pseudo-element, but the accessible name of the link is the category name
 * alone, not a 150-character paragraph read out on every tab stop.
 *
 * The goal cards are the home page's `GoalCard`, unchanged, with the same
 * photograph and the same product-type line: one goal, one card, wherever it
 * appears.
 */
export function CategoriesIndex() {
  const { t } = useTranslation();
  const { types, goals, utility } = useTaxonomyLinks();

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
        <ul className="ox-cat-index__grid">
          {types.map((link) => (
            <li key={link.slug} className="ox-cat-index__item">
              <TypeCard link={link} t={t} />
            </li>
          ))}
        </ul>
      </section>

      <section className="ox-cat-index__section" aria-labelledby="categories-goals-title">
        <SectionHeader as="h2" title={t('ox.home.goals_title')} titleId="categories-goals-title" />
        <ul className="ox-goals__grid">
          {goals.map((goal, index) => {
            const lineKey = GOAL_CARD_LINES[goal.slug];
            return (
              <li key={goal.slug} className="ox-cat-index__item">
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
 * The type card (owner restyle 2026-09-22, same treatment as the home grid's
 * `CategoryTile`): the icon above the image slot, a tinted ground
 * (`HOME_TILE_TONES`, shared with `OxCategories`), and the count only on a
 * live, positive `products_count`. The image slot is a `background-image`,
 * never an `<img>`: a merchant's `Category.image` is an external URL that
 * can 404, and a failed background paint just leaves the tint showing.
 */
function TypeCard({ link, t }: CardProps) {
  const description = descriptionOf(link, t);
  const tone = HOME_TILE_TONES[link.slug] ?? 'ash';
  const backgroundImage = link.image
    ? `url("${link.image}")`
    : `var(--ox-need-image-${link.slug}, none)`;
  return (
    <div
      className={`ox-cat-card ox-cat-card--${tone}`}
      data-testid="ox-type-card"
      data-resolved={link.resolved ? 'true' : 'false'}
      data-tone={tone}
    >
      <Link to={link.to} className="ox-cat-card__link">
        <Icon name={link.icon} size={32} className="ox-cat-card__icon" />
        <span className="ox-cat-card__media" aria-hidden="true" style={{ backgroundImage }} />
        <span className="ox-cat-card__name">{link.label}</span>
        {link.count && link.count > 0 ? (
          <span className="ox-cat-card__count">
            {t('ox.home.need_count').replace('{{count}}', String(link.count))}
          </span>
        ) : null}
      </Link>
      {description ? <p className="ox-cat-card__desc ox-small">{description}</p> : null}
      {link.children.length > 0 ? (
        <ul className="ox-cat-card__children" aria-label={t('ox.listing.children_label')}>
          {link.children.map((child) => (
            <li key={child.slug}>
              <Link to={child.to} className="ox-chip ox-chip--filter ox-chip--link ox-cat-card__chip">
                <span className="ox-chip__label">{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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
