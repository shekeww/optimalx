import { useCallback, useMemo, useState } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
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
import { ExploreLinks } from './ExploreLinks';
import { FeaturedRail } from './FeaturedRail';
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
import { categoryEntity, listingGoal, listingSlug, listingVariant } from './resolve';
import { nodeBySlug } from '../../content/taxonomy';
import { ListingCategoryContext } from '../product/lib/productType';
import { currentSort, sortOptions } from './sortOptions';
import { ListingHeader } from './ListingHeader';
import { ListingToolbar } from './ListingToolbar';
import { useNextPage } from './useNextPage';
import { useTaxonomyLinks } from './useTaxonomyLinks';
import { ZeroResults } from './ZeroResults';
import type { ListingPageProps } from './types';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { PosterCard } from '../home/PosterCard';
import { POSTER_CARDS, posterHref } from '../../content/posters';

const GRID_ID = 'listing-grid';
const GRID_TITLE_ID = 'listing-grid-title';
const OFFERS_GRID_ID = 'offers-grid';

/**
 * The offers page's own poster grid (owner brief 2026-09-24, docs/build/
 * progress/S7a.md): the same six marketing posters the home carousel shows,
 * above the product grid, so an offer, a bundle or a subscription a plain
 * product card cannot show gets its own tile. `weekly-picks`'s own link
 * resolves to `#offers-grid` here (`posterHref`'s `'offers'` context) rather
 * than `/offers` — a poster cannot usefully link to the page it is already
 * on — which is why this grid, not `OxPosters`, owns `OFFERS_GRID_ID`.
 */
function OffersPosterGrid() {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();

  return (
    <div className="ox-offers-posters">
      <h2 className="ox-offers-posters__title ox-h2">{t('ox.offers.posters_title')}</h2>
      <ul className="ox-offers-posters__grid" role="list">
        {POSTER_CARDS.map((card) => (
          <li key={card.slug}>
            <PosterCard
              slug={card.slug}
              photo={card.photo}
              srcSet={card.srcSet}
              to={posterHref(card, 'offers', (slug) => bySlug(slug))}
              alt={t(card.altKey)}
              available={card.available}
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  // The taxonomy node behind a category listing, or undefined for a category
  // the owner created outside the 25-node map (S1 step 5). Only a category
  // source consults it: a brand or a static listing has a slug too, and a
  // brand whose slug happened to equal a node's must not borrow its copy.
  const node = source.type === 'categories' ? nodeBySlug(slug) : undefined;
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
  // The featured rail and the explore block are a type or goal category's own
  // rows (owner amendment 2026-09-22, "New: S2d"); a brand, a search and the
  // three static sources keep the page they had.
  const isTypeOrGoalListing = variant === 'category' || variant === 'goal';
  // Only the offers static source gets the poster grid (owner brief
  // 2026-09-24): `variant` collapses every static source to `'static'`, so
  // this checks `source.type` directly, the same way `listingSourceCopy` does.
  const isOffers = source.type === 'offers';

  // THE H1 IS THE RESEARCHED HEAD TERM, NOT THE DASHBOARD NAME. The loader's
  // `page.title` is whatever the merchant typed into the category form
  // ("بروتين"); the node's `h1Key` is the head query the cluster ranks on
  // ("بروتين باودر", keywords-ar.md C01), written once and audited. The page
  // used to render the dashboard name and leave the researched key unread
  // (PLAN-ship §1 item 2a). The dashboard name still wins for a category the
  // map does not know, and for a key that fails to resolve, so an owner-made
  // category never shows a raw key as its heading.
  const researched = node ? t(node.h1Key) : '';
  const title = isSearch ? (
    <>
      {t('ox.search.results_prefix')} <Bdi lang={null}>{queryText}</Bdi>
    </>
  ) : researched && researched !== node?.h1Key ? (
    researched
  ) : (
    page.title
  );

  // Each source states its own line and its own empty state; the card, the
  // grid and the toolbar are the same on every one of them. The intro comes
  // from the node, which covers the 21 researched categories and goals with
  // the keys they already had and the four utility categories with theirs.
  const copy = listingSourceCopy(source.type, variant);
  const intro = brand ? (
    <BrandIntro brand={brand} />
  ) : node ? (
    <CategoryIntro introKey={node.introKey} />
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

  const crumbs = <OxBreadcrumb page={page} className="ox-crumbs" />;

  // A card on a category page knows its category (owner item 2026-09-24,
  // S8a): the facts line names the product's type from it when the payload
  // carries no `product.category` of its own (`productType.ts`). Only a
  // taxonomy node is passed; a goal or utility node maps to no type there.
  const grid = (
    <ListingCategoryContext.Provider value={node?.slug ?? null}>
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
    </ListingCategoryContext.Provider>
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
        {isOffers ? <OffersPosterGrid /> : null}
        {isTypeOrGoalListing ? <FeaturedRail products={products} /> : null}

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
          <div className="ox-listing__catalogue" id={isOffers ? OFFERS_GRID_ID : undefined}>
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

        {isTypeOrGoalListing ? <ExploreLinks node={node} /> : null}
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
