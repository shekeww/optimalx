import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { childrenOf } from '../../content/categories';
import { searchFallback } from './resolve';

export interface ChildChipsProps {
  /** Live children from the loader entity; preferred over the content map. */
  categories?: Category[];
  /** The page's slug, for the content-map fallback before categories exist. */
  slug?: string;
  className?: string;
}

/**
 * The sub-need chip row (DIRECTION 6.3 block 3): a scroller of the category's
 * children, absent on a leaf category.
 *
 * Live children win, because their `url` is real. When the merchant has not
 * created the children yet the content map supplies the labels and each chip
 * links to a search for its own label, which is the documented fallback
 * (PLAN-final C15, owner checklist A.1). The row is never faked with filters
 * the API did not return.
 */
export function ChildChips({ categories, slug, className }: ChildChipsProps) {
  const { t } = useTranslation();

  const live = (categories ?? []).filter((child) => child.name && child.url);
  const fromContent = live.length === 0 && slug ? childrenOf(slug) : [];
  const items = live.length
    ? live.map((child) => ({ key: String(child.id), label: child.name, to: child.url }))
    : fromContent.map((child) => {
        const label = t(child.h1Key);
        return { key: child.slug, label, to: searchFallback(label) };
      });

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
