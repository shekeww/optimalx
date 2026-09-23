import { useCallback, useMemo, useState } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { plainText } from '../listing/BrandHeader';
import { FeaturedRail } from '../listing/FeaturedRail';
import { FiltersDrawer } from '../listing/FiltersDrawer';
import { FiltersRail } from '../listing/FiltersRail';
import { ListingToolbar } from '../listing/ListingToolbar';
import { ListEnd, LoadMore } from '../listing/LoadMore';
import { ProductGrid } from '../listing/ProductGrid';
import { appliedFilterCount, brandFilter } from '../listing/appliedFilters';
import { currentSort, sortOptions } from '../listing/sortOptions';
import { useNextPage } from '../listing/useNextPage';
import type { ListingPageProps } from '../listing/types';
import { BrandBanner } from './BrandBanner';
import { BrandExplore } from './BrandExplore';
import type { BrandWithCount } from './BrandTile';

const GRID_ID = 'listing-grid';

/**
 * A brand's own page, `/brands/$id` (DIRECTION 6.14; owner brief 2026-09-23
 * late, item 3).
 *
 * It is the listing composition with a brand's head region rather than a
 * category's: the breadcrumb, the identity banner (`BrandBanner`), the SAME
 * two-up cover carousel S4c built for category pages (`FeaturedRail`, reused
 * verbatim, fed with the brand's own products), the toolbar, the filters rail
 * and drawer, the product grid, and a chip row out to the other brands and
 * the root types.
 *
 * Why it is its own component and not a `ListingPage` variant: the brand page
 * now differs from a category listing in its head region (a banner, not the
 * masthead band), in carrying the featured rail (which `ListingPage` gates to
 * type and goal listings) and in hiding one facet. `ListingPage.tsx` belongs
 * to another batch this session and is read-only here, so the composition
 * lives in this file and reuses every part of it that did not change.
 *
 * THE BRAND FACET IS HIDDEN HERE. Every product on this page is already this
 * brand's, so a brand filter would be a control with one option and no
 * effect. It is removed from the payload passed to the rail and the drawer,
 * never from the URL contract: the platform's own `salla-filters` keeps
 * writing whatever it writes, and `appliedFilterCount` still counts it.
 */
export function BrandPage(props: ListingPageProps) {
  const { page, source, query, products, filters } = props;
  const { t } = useTranslation();
  const store = useStore();
  const router = useRouter();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brand = source.entity as BrandWithCount | undefined;
  const sort = currentSort(query.sort);
  const options = useMemo(() => sortOptions(t), [t]);
  const { load, loadedCount, hasMore } = useNextPage(props, sort);

  // Every facet the loader sent except the brand one (see the docblock).
  const facets = useMemo(() => {
    const group = brandFilter(filters);
    return (filters ?? []).filter((facet) => facet !== group);
  }, [filters]);

  const showFilters = Boolean(query.filters && store?.settings?.product?.filters && facets.length);

  const onSortChange = useCallback(
    (id: string) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      params.set('sort', id);
      params.delete('page');
      const search = params.toString();
      router.history.push(`${window.location.pathname}${search ? `?${search}` : ''}`);
    },
    [router]
  );

  const intro = plainText(brand?.description);
  const toolbarSort = options.length > 0 ? { value: sort, options, onChange: onSortChange } : null;
  const toolbarFilters = showFilters
    ? { count: appliedFilterCount(location.searchStr), onOpen: () => setFiltersOpen(true) }
    : null;

  return (
    <div className="ox-listing ox-listing--brand ox-brandpage">
      <div className="ox-container">
        <OxBreadcrumb page={page} className="ox-crumbs" />
        {brand ? (
          <BrandBanner brand={brand} titleId="listing-title" intro={intro || undefined} />
        ) : (
          <h1 className="ox-h1" id="listing-title">
            {page.title}
          </h1>
        )}
      </div>

      <HookSlot name="product:list.start" />

      <div className="ox-container ox-listing__body">
        <FeaturedRail products={products} />

        <div className="ox-listing__catalogue">
          <div id={GRID_ID} className="ox-listing__grid-head">
            <ListingToolbar
              sort={toolbarSort}
              filters={toolbarFilters}
              count={loadedCount > 0 ? <LoadMore loadedCount={loadedCount} hasMore={hasMore} /> : null}
            />
          </div>

          <div className={`ox-listing__results${showFilters ? ' has-rail' : ''}`}>
            {showFilters ? <FiltersRail filters={facets} /> : null}
            <div className="ox-listing__main">
              <HookSlot name="product:list.items.start" />
              <ProductGrid
                products={products}
                loader={load}
                resetKey={`${source.value ?? source.type}-${sort}`}
                hasMore={hasMore}
                pageUrl={`${location.pathname}${location.searchStr ?? ''}`}
                withFilters={showFilters}
                ariaLabel={t('ox.listing.results_label')}
                end={<ListEnd />}
                empty={
                  <div className="ox-listing__empty">
                    <EmptyState
                      icon="shaker"
                      title={t('ox.listing.empty_brand')}
                      body={t('ox.listing.empty_brand_body')}
                      primary={
                        <Button variant="primary" size={48} to="/brands">
                          {t('ox.nav.brands')}
                        </Button>
                      }
                      secondary={
                        <Button variant="secondary" size={48} to="/">
                          {t('ox.nav.goals')}
                        </Button>
                      }
                    />
                  </div>
                }
                t={t}
              />
              <HookSlot name="product:list.items.end" />
            </div>
          </div>
        </div>

        <BrandExplore currentId={brand?.id} />
      </div>

      {showFilters ? (
        <FiltersDrawer
          filters={facets}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}

      <HookSlot name="product:list.end" />
    </div>
  );
}

export default BrandPage;
