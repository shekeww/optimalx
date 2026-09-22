import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { GOALS, goalBySlug, type GoalContent, type GoalSubNeed } from '../../content/goals';
import { MENU, childrenOf, type TaxonomyNode } from '../../content/taxonomy';
import { SectionHeader } from '../common/SectionHeader';
import { relatedGuidesFor, type RelatedGuide } from './RelatedGuides';
import { useTaxonomyLinks, type TaxonomyLink } from './useTaxonomyLinks';
import type { TFunction } from './types';

export interface ExploreLinksProps {
  /** The resolved taxonomy node for this page; absent for a category the map
   *  does not know, in which case the block renders nothing (the same
   *  degrade `CategoryIntro`, `ChildChips` and `CategoryFaq` already use). */
  node: TaxonomyNode | undefined;
  className?: string;
}

/** Every subNeed a goal names, its anchored groups included, in order. */
function subNeedsOf(goal: GoalContent): GoalSubNeed[] {
  return [...goal.subNeeds, ...(goal.groups ?? []).flatMap((group) => group.subNeeds)];
}

/** The taxonomy pool a node's siblings are drawn from, by its own scope. */
function poolFor(scope: TaxonomyNode['scope']): TaxonomyNode[] {
  if (scope === 'goal') return MENU.goals;
  if (scope === 'utility') return MENU.utility;
  return MENU.types;
}

/**
 * Sibling slugs: the node's own children's siblings when it is a child
 * (protein's five children), otherwise the other roots of its own scope.
 */
export function siblingSlugsOf(node: TaxonomyNode): string[] {
  const pool = node.parent ? childrenOf(node.parent) : poolFor(node.scope);
  return pool.filter((sibling) => sibling.slug !== node.slug).map((sibling) => sibling.slug);
}

/** Goal slugs that route a subNeed at this type category slug, deduplicated. */
export function goalsIncluding(typeSlug: string): string[] {
  const out = new Set<string>();
  for (const goal of GOALS) {
    if (subNeedsOf(goal).some((need) => need.categorySlug === typeSlug)) out.add(goal.slug);
  }
  return [...out];
}

/** The type category slugs a goal routes to, its groups included, deduplicated. */
export function typesOf(goalSlug: string): string[] {
  const goal = goalBySlug(goalSlug);
  if (!goal) return [];
  return [...new Set(subNeedsOf(goal).map((need) => need.categorySlug))];
}

/**
 * One guide link for the page: the node's own related guides (a type
 * category), or, for a goal, the first related guide of one of its member
 * types. Undefined when neither the content map nor the blog index (S6) has
 * a matching entry yet, which is the case for every slug today (the guide
 * titles are FINAL-content 7.1 copy a later batch writes).
 */
export function exploreGuide(t: TFunction, node: TaxonomyNode): RelatedGuide | undefined {
  const direct = relatedGuidesFor(t, node.slug);
  if (direct[0]) return direct[0];
  if (node.scope !== 'goal') return undefined;
  for (const typeSlug of typesOf(node.slug)) {
    const guide = relatedGuidesFor(t, typeSlug)[0];
    if (guide) return guide;
  }
  return undefined;
}

/**
 * The compact "explore" block (owner amendment 2026-09-22, "New: S2d"):
 * sibling categories, the goal(s) that include this type or the types inside
 * this goal, one guide link when the content map has one, and the advisory
 * CTA to `/services`. Sits after the grid; `ChildChips` (the sub-need row in
 * the toolbar) is unchanged and stays where it is.
 *
 * Every link resolves through `useTaxonomyLinks`, whose fallback already
 * renders from the node's own static label plus the hook's resolved `to`
 * (`ox.tax.<key>.name` and a `/search?q=` URL) before the live category query
 * settles, so the first client render matches the SSR html exactly the way
 * `ChildChips` already does; nothing here reaches for the query directly.
 */
export function ExploreLinks({ node, className }: ExploreLinksProps) {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();

  if (!node) return null;

  const siblingLinks = resolveLinks(bySlug, siblingSlugsOf(node));
  const memberSlugs = node.scope === 'goal' ? typesOf(node.slug) : goalsIncluding(node.slug);
  const memberLinks = resolveLinks(bySlug, memberSlugs);
  const guide = exploreGuide(t, node);

  if (siblingLinks.length === 0 && memberLinks.length === 0 && !guide) return null;

  const memberLabel = t(
    node.scope === 'goal' ? 'ox.listing.explore_types_label' : 'ox.listing.explore_goals_label'
  );

  return (
    <section className={['ox-explore', className].filter(Boolean).join(' ')} aria-labelledby="listing-explore-title">
      <SectionHeader as="h2" title={t('ox.listing.explore_title')} titleId="listing-explore-title" />
      {siblingLinks.length ? (
        <nav className="ox-explore__nav" aria-label={t('ox.listing.explore_siblings_label')}>
          <ChipRow links={siblingLinks} />
        </nav>
      ) : null}
      {memberLinks.length ? (
        <nav className="ox-explore__nav" aria-label={memberLabel}>
          <ChipRow links={memberLinks} />
        </nav>
      ) : null}
      <ul className="ox-explore__foot">
        {guide ? (
          <li>
            <Link to={guide.to} className="ox-listing__guide-row">
              <span className="ox-body">{guide.title}</span>
              <i className="sicon-keyboard_arrow_left ox-mirror" aria-hidden="true" />
            </Link>
          </li>
        ) : null}
        <li>
          <Link to="/services" className="ox-listing__guide-row">
            <span className="ox-body">{t('ox.services.title')}</span>
            <i className="sicon-keyboard_arrow_left ox-mirror" aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </section>
  );
}

function resolveLinks(bySlug: (slug: string) => TaxonomyLink | undefined, slugs: string[]): TaxonomyLink[] {
  return slugs.map((slug) => bySlug(slug)).filter((link): link is TaxonomyLink => Boolean(link));
}

function ChipRow({ links }: { links: TaxonomyLink[] }) {
  return (
    <ul className="ox-explore__list">
      {links.map((link) => (
        <li key={link.slug}>
          <Link to={link.to} className="ox-chip ox-chip--filter ox-chip--link">
            <span className="ox-chip__label">{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default ExploreLinks;
