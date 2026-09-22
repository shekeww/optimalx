import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { brandHeadExtend } from '../components/seo/routeHeads';

/**
 * A brand's products (DIRECTION 6.14: the 6.3 composition with the brand
 * logo plate in the header).
 *
 * The engine's own brand header is not rendered: it prints the merchant's
 * brand description through `dangerouslySetInnerHTML`. Ours renders it as
 * text (components/listing/BrandHeader).
 *
 * `brandHeadExtend` (seo/routeHeads.ts) is `listingHeadExtend` plus the
 * researched brand-page title pattern (keywords-ar.md B01-B05).
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
  return <ListingPage {...data} />;
}
