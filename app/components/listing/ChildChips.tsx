import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { useTaxonomyLinks } from './useTaxonomyLinks';

export interface ChildChipsProps {
  /** Live children from the loader entity; preferred over the content map. */
  categories?: Category[];
  /** The page's slug, for the taxonomy fallback before the children exist. */
  slug?: string;
  className?: string;
}

/**
 * The sub-need chip row (DIRECTION 6.3 block 3): a scroller of the category's
 * children, absent on a leaf category.
 *
 * Live children win, because their `url` is real and the loader already paid
 * for them. When the entity carries none the taxonomy supplies the row
 * through `useTaxonomyLinks` (PLAN-ship Contract C, S1 step 5): each child
 * resolves to its live category URL when the store has one, and only then to
 * a search for its own name, which is the documented fallback (PLAN-final
 * C15, owner checklist A.1). The row used to jump straight from "no live
 * children on the entity" to the search link, so a child category that DID
 * exist on the store, and merely had not been nested under its parent yet,
 * still linked to a search instead of to itself.
 *
 * The row is never faked with filters the API did not return.
 */
export function ChildChips({ categories, slug, className }: ChildChipsProps) {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();

  const live = (categories ?? []).filter((child) => child.name && child.url);
  const fromTaxonomy = live.length === 0 && slug ? (bySlug(slug)?.children ?? []) : [];
  const items = live.length
    ? live.map((child) => ({ key: String(child.id), label: child.name, to: child.url }))
    : fromTaxonomy.map((child) => ({ key: child.slug, label: child.label, to: child.to }));

  if (items.length === 0) return null;

  return (
    <nav
      className={['ox-listing__chips', className].filter(Boolean).join(' ')}
      aria-label={t('ox.listing.children_label')}
    >
      <ul className="ox-listing__chips-row">
        {items.map((item) => (
          <li key={item.key}>
            <Link to={item.to} className="ox-chip ox-chip--filter ox-chip--link">
              <span className="ox-chip__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
