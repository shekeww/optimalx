import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BrandPage } from '../components/brands/BrandPage';
import { brandHeadExtend } from '../components/seo/routeHeads';

/**
 * A brand's products (DIRECTION 6.14; owner brief 2026-09-23 late, item 3).
 *
 * The engine loader and head stay; the page is ours
 * (`components/brands/BrandPage`): the identity banner, the two-up cover
 * carousel S4c built for category pages, the toolbar, the filters without
 * their now-redundant brand facet, the grid, and the chips out to the other
 * brands and the root types. The engine's own brand header is not rendered
 * anywhere: it prints the merchant's description through
 * `dangerouslySetInnerHTML`, and ours renders it as text.
 *
 * `brandHeadExtend` (seo/routeHeads.ts) is `listingHeadExtend` plus the
 * brand-page title and description patterns.
 */
export const Route = createFileRoute('/{-$locale}/brands/$id')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { source: 'brands', id: params.id },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, brandHeadExtend()),
  component: BrandListingComponent,
});

function BrandListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <BrandPage {...data} />;
}
