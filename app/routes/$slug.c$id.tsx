import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';

/**
 * Category listing, and the goal landing variant when the slug is one of the
 * six goal collections (DIRECTION 6.3 and 6.4; PLAN-final C3 and C15).
 *
 * The loader and the head stay the engine's: `ProductListing.loader` fetches
 * the category and its first page, and `ProductListing.head` builds the title
 * and the OG block. Only the composition below it is ours.
 */
export const Route = createFileRoute('/{-$locale}/$slug/c{$id}')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { id: params.id },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, listingHeadExtend()),
  component: CategoryListingComponent,
});

function CategoryListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  const { slug } = Route.useParams();
  return <ListingPage {...data} slug={slug} />;
}
