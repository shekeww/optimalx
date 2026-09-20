import { useCallback, useMemo, useState } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { Breadcrumb, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { Testimonials } from '@salla.sa/twilight-theme-engine/home';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { BrandHeader, BrandIntro } from './BrandHeader';
import { CategoryFaq } from './CategoryFaq';
import { CategoryIntro } from './CategoryIntro';
import { ChildChips } from './ChildChips';
import { FiltersDrawer } from './FiltersDrawer';
import { FiltersRail } from './FiltersRail';
import { GoalHero } from './GoalLanding/GoalHero';
import { GoalIntro } from './GoalLanding/GoalIntro';
import { Explainer } from './GoalLanding/Explainer';
import { NeedHelp } from './GoalLanding/NeedHelp';
import { SubNeeds } from './GoalLanding/SubNeeds';
import { appliedFilterCount } from './appliedFilters';
import { ListEnd, LoadMore } from './LoadMore';
import { ProductGrid } from './ProductGrid';
import { RelatedGuides } from './RelatedGuides';
import { listingSourceCopy } from './listingCopy';
import { categoryEntity, listingCategory, listingGoal, listingSlug, listingVariant } from './resolve';
import { currentSort, sortOptions } from './sortOptions';
import { ListingHeader } from './ListingHeader';
import { ListingToolbar } from './ListingToolbar';
import { useNextPage } from './useNextPage';
import { ZeroResults } from './ZeroResults';
import type { ListingPageProps } from './types';

const GRID_ID = 'listing-grid';
const GRID_TITLE_ID = 'listing-grid-title';

/**
 * One page for every product list (PLAN-final C3): category, goal landing,
 * search, brand and the three static sources, composed from the engine's own
 * primitives rather than wrapping `ProductListing.Component`.
 *
 * The design, carried from the approved target image:
 *  - a full-bleed masthead band on `--ox-plate` under the dark chrome, holding
 *    the breadcrumb, the h1 and the intro, closed by a hairline. The goal
 *    landing swaps it for its own dark hero, which is that page's head region;
 *  - a ruled toolbar sitting directly on the grid, carrying the sub-category
 *    chips at the RTL start and the filter and sort controls at the end;
 *  - the grid itself on paper, every card the one `product:card` override, so
 *    a listing cell and a carousel cell are the same component.
 *
 * What is kept from the engine, deliberately:
 *  - the loader and the head of each route (the routes still call them);
 *  - the `Breadcrumb` component, which is the page's only BreadcrumbList
 *    (PLAN-final C11);
 *  - the four `product:list.*` hook slots, in the engine's own positions
 *    (theme-engine dist/routes/product-listing.js), so a merchant app that
 *    injects into a listing keeps working;
 *  - `ItemsList`, `SallaFilters`, `Drawer` and the testimonials block.
 *
 * What is not kept: the engine's `<h1 id="page-main-title">`, its auto-loading
 * infinite list and its unsanitised brand description. DIRECTION 6.3 needs a
 * head region with an intro and child chips, 6.4 a goal hero carrying the
 * display h1, and 5.3 a load-more button rather than infinite scroll.
 */
export function ListingPage(props: ListingPageProps) {
  const { page, source, query, products, filters, slug: routeSlug } = props;
  const { t } = useTranslation();
  const store = useStore();
  const router = useRouter();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const variant = props.variant ?? listingVariant(props, routeSlug);
  const slug = listingSlug(props, routeSlug);
  const goal = variant === 'goal' ? listingGoal(props, routeSlug) : undefined;
  const category = listingCategory(props, routeSlug);
  const entity = categoryEntity(props);
  const brand = variant === 'brand' ? (source.entity as Brand | undefined) : undefined;

  const sort = currentSort(query.sort);
  const options = useMemo(() => sortOptions(t), [t]);
  const { load, loadedCount, hasMore } = useNextPage(props, sort);

  // The merchant can switch filters off for the whole store; the engine reads
  // the same two settings (product-listing.js: `showFilters`).
  const showFilters = Boolean(query.filters && store?.settings?.product?.filters && filters?.length);
  const showTestimonials = Boolean(
    source.type === 'categories' && store?.settings?.category?.testimonial_enabled
  );

  const onSortChange = useCallback(
    (id: string) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      params.set('sort', id);
      params.delete('page');
      const search = params.toString();
      // `router.history.push` takes a plain path, which keeps this independent
      // of the generated route-id union that `navigate({ to })` demands.
      router.history.push(`${window.location.pathname}${search ? `?${search}` : ''}`);
    },
    [router]
  );

  const isSearch = variant === 'search';
  const queryText = isSearch ? String(source.value ?? '') : '';
  const isZero = isSearch && products.length === 0;

  const title = isSearch ? (
    <>
      {t('ox.search.results_prefix')} <Bdi lang={null}>{queryText}</Bdi>
    </>
  ) : (
    page.title
  );

  // Each source states its own line and its own empty state; the card, the
  // grid and the toolbar are the same on every one of them.
  const copy = listingSourceCopy(source.type, variant);
  const intro = brand ? (
    <BrandIntro brand={brand} />
  ) : category ? (
    <CategoryIntro introKey={category.introKey} />
  ) : copy.introKey ? (
    <CategoryIntro introKey={copy.introKey} clamp={false} />
  ) : null;

  const toolbarSort = options.length > 0 && !isZero ? { value: sort, options, onChange: onSortChange } : null;
  // The trigger's count is the number of facets the URL constrains by, read
  // off the address bar rather than out of the widget: `salla-filters`
  // navigates to the filtered URL and the loader re-runs on it, so the query
  // string is the applied state (see `appliedFilters.ts`). It was a literal
  // zero, so the trigger could never say the list was filtered.
  const filterCount = appliedFilterCount(location.searchStr);
  const toolbarFilters =
    showFilters && !isZero ? { count: filterCount, onOpen: () => setFiltersOpen(true) } : null;
  const chips = goal ? null : <ChildChips categories={entity?.sub_categories} slug={slug} />;

  const crumbs = <Breadcrumb page={page} className="ox-crumbs" />;

  const grid = (
    <>
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
              title={t(copy.emptyTitleKey ?? 'ox.listing.empty')}
              body={t(copy.emptyBodyKey ?? 'ox.listing.empty_body')}
              primary={
                <Button variant="primary" size={48} to="/">
                  {t('ox.nav.goals')}
                </Button>
              }
              secondary={
                copy.secondary ? (
                  <Button variant="secondary" size={48} to={copy.secondary.to}>
                    {t(copy.secondary.labelKey)}
                  </Button>
                ) : undefined
              }
            />
          </div>
        }
        t={t}
      />
      <HookSlot name="product:list.items.end" />
    </>
  );

  return (
    <div className={`ox-listing ox-listing--${variant}`}>
      {goal ? (
        <>
          <div className="ox-container">{crumbs}</div>
          <GoalHero goal={goal} image={entity?.image} gridId={GRID_ID} titleId="listing-title" />
        </>
      ) : (
        <div className="ox-listing__band">
          <div className="ox-container ox-listing__band-inner">
            {crumbs}
            <ListingHeader
              title={title}
              as="h1"
              titleId="listing-title"
              media={brand ? <BrandHeader brand={brand} /> : undefined}
              intro={intro}
            />
          </div>
        </div>
      )}

      <HookSlot name="product:list.start" />

      <div className="ox-container ox-listing__body">
        {goal ? (
          <>
            <GoalIntro goal={goal} />
            <Explainer goal={goal} />
            {goal.groups?.length
              ? goal.groups.map((group) => (
                  <SubNeeds
                    key={group.anchor}
                    anchor={group.anchor}
                    title={t(group.titleKey)}
                    intro={t(group.introKey)}
                    needs={group.subNeeds}
                  />
                ))
              : <SubNeeds needs={goal.subNeeds} />}
          </>
        ) : null}

        {isZero ? (
          <ZeroResults query={queryText} />
        ) : (
          <div className="ox-listing__catalogue">
            <div id={GRID_ID} className="ox-listing__grid-head">
              {goal ? (
                <ListingHeader title={t('ox.goal.grid_title')} as="h2" titleId={GRID_TITLE_ID} />
              ) : null}
              <ListingToolbar
                chips={chips}
                sort={toolbarSort}
                filters={toolbarFilters}
                count={
                  loadedCount > 0 ? (
                    <LoadMore loadedCount={loadedCount} hasMore={hasMore} />
                  ) : null
                }
              />
            </div>

            <div className={`ox-listing__results${showFilters ? ' has-rail' : ''}`}>
              {showFilters ? <FiltersRail filters={filters} /> : null}
              <div className="ox-listing__main">{grid}</div>
            </div>
          </div>
        )}

        <CategoryFaq slug={slug} />
        <RelatedGuides slug={slug} />
        {goal ? <NeedHelp goal={goal} /> : null}
      </div>

      {showFilters ? (
        <FiltersDrawer
          filters={filters}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}

      {showTestimonials ? (
        <div className="ox-container">
          <RenderWhenVisible estimatedHeight="360px">
            <Testimonials data={{}} />
          </RenderWhenVisible>
        </div>
      ) : null}

      <HookSlot name="product:list.end" />
    </div>
  );
}
