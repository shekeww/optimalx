import { useQuery } from '@tanstack/react-query';
import { brand as brandApi } from '@salla.sa/twilight-theme-engine/api/brands';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { SectionHeader } from '../common/SectionHeader';
import { MENU } from '../../content/taxonomy';
import { useTaxonomyLinks, type TaxonomyLink } from '../listing/useTaxonomyLinks';
import { isBrand, type BrandWithCount } from './BrandTile';

/**
 * The route out of a brand page (the `ExploreLinks` pattern, brand edition):
 * a chip row of the OTHER brands the store carries, and a chip row of the
 * root product types.
 *
 * The type chips resolve through `useTaxonomyLinks`, whose fallback renders
 * from the node's own static label and a `/search?q=` URL before the live
 * category query settles, so the first client render matches the SSR html
 * exactly the way `ChildChips` and `ExploreLinks` already do. The brand chips
 * come from the same `brand.queries.list()` the home carousel reads; until it
 * answers, that row is absent rather than half-built, which is the same
 * degrade every data-gated block in this theme uses.
 *
 * Nothing here ranks, recommends or compares brands: the chips are the
 * store's own catalogue in the API's own order, capped so the row stays a row.
 */

/** The row never grows past this many chips; the rest are one click away at /brands. */
const MAX_BRAND_CHIPS = 12;

export interface BrandExploreProps {
  /** The brand whose page this is; it is never a chip on its own page. */
  currentId: string | undefined;
}

export function BrandExplore({ currentId }: BrandExploreProps) {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();
  const { data: group } = useQuery({ ...brandApi.queries.list() });

  const others = (Object.values(group ?? {}).flat() as unknown[])
    .filter(isBrand)
    .filter((item: BrandWithCount) => String(item.id) !== String(currentId) && Boolean(item.url))
    .slice(0, MAX_BRAND_CHIPS);

  const types = MENU.types
    .map((node) => bySlug(node.slug))
    .filter((link): link is TaxonomyLink => Boolean(link));

  if (others.length === 0 && types.length === 0) return null;

  return (
    <section className="ox-explore" aria-labelledby="brand-explore-title">
      <SectionHeader
        as="h2"
        title={t('ox.listing.explore_title')}
        titleId="brand-explore-title"
      />
      {others.length > 0 ? (
        <nav className="ox-explore__nav" aria-label={t('ox.brands.explore_brands_label')}>
          <ul className="ox-explore__list">
            {others.map((item) => (
              <li key={item.id ?? item.name}>
                <Link to={item.url} className="ox-chip ox-chip--filter ox-chip--link">
                  <span className="ox-chip__label">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {types.length > 0 ? (
        <nav className="ox-explore__nav" aria-label={t('ox.brands.explore_types_label')}>
          <ul className="ox-explore__list">
            {types.map((link) => (
              <li key={link.slug}>
                <Link to={link.to} className="ox-chip ox-chip--filter ox-chip--link">
                  <span className="ox-chip__label">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <ul className="ox-explore__foot">
        <li>
          <Link to="/brands" className="ox-listing__guide-row">
            <span className="ox-body">{t('ox.nav.all_brands')}</span>
            <Icon name="chevron-start" size={16} />
          </Link>
        </li>
      </ul>
    </section>
  );
}

export default BrandExplore;
