import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { categoryBySlug } from '../../content/categories';
import { SectionHeader } from '../common/SectionHeader';
import type { TFunction } from './types';

export interface RelatedGuide {
  slug: string;
  title: string;
  to: string;
}

export interface RelatedGuidesProps {
  /** The category slug; its three guides come from the content map. */
  slug?: string;
  /** Explicit rows (the kitchen sink); resolved from the slug otherwise. */
  items?: RelatedGuide[];
  className?: string;
}

/**
 * `ox.content.guides.<key>.title` for a guide slug like `guides/protein-dose`.
 * The guide titles belong to the blog content (FINAL-content 7.1) which a
 * later batch loads; until they exist the key does not resolve and the row is
 * dropped, so the block never renders a slug as a label or a dead link.
 */
export function guideTitleKey(slug: string): string {
  const last = slug.split('/').filter(Boolean).pop() ?? slug;
  return `ox.content.guides.${last.split('-').join('_')}.title`;
}

export function relatedGuidesFor(t: TFunction, slug: string | undefined): RelatedGuide[] {
  const category = slug ? categoryBySlug(slug) : undefined;
  if (!category) return [];
  return category.relatedGuides
    .map((guide) => ({ slug: guide, title: t(guideTitleKey(guide)), to: `/${guide}` }))
    .filter((guide) => guide.title.length > 0 && !guide.title.startsWith('ox.'));
}

/**
 * The related-guides row (DIRECTION 6.3 block 8): three link rows, not cards,
 * because a listing is a buy page and the guides are a way out of it, not a
 * second grid.
 */
export function RelatedGuides({ slug, items, className }: RelatedGuidesProps) {
  const { t } = useTranslation();
  const rows = items ?? relatedGuidesFor(t, slug);
  if (rows.length === 0) return null;

  return (
    <section
      className={['ox-listing__guides', className].filter(Boolean).join(' ')}
      aria-labelledby="listing-guides-title"
    >
      <SectionHeader as="h2" title={t('ox.listing.guides_title')} titleId="listing-guides-title" />
      <ul className="ox-listing__guides-list">
        {rows.map((guide) => (
          <li key={guide.slug}>
            <Link to={guide.to} className="ox-listing__guide-row">
              <span className="ox-body">{guide.title}</span>
              <i className="sicon-keyboard_arrow_left ox-mirror" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
