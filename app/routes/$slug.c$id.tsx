import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';
import {
  loadTaxonomyData,
  type TaxonomyLoaderData,
} from '../components/listing/useTaxonomyLinks';

/**
 * `ProductListLoaderData` plus the taxonomy pair `useTaxonomyLinks` reads
 * first. The listing's own `source.entity` is only the ONE category this page
 * is for, never the full list `useTaxonomyLinks` resolves every link against
 * (the sibling chips, the goal/type membership rows, the header) - so this
 * loader prefetches the same pair the home route does.
 */
export type CategoryListLoaderData = ProductListLoaderData & { taxonomy: TaxonomyLoaderData };

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
  loader: async ({ deps, params, context }): Promise<CategoryListLoaderData> => {
    const [listData, taxonomy] = await Promise.all([
      ProductListing.loader({
        params: { id: params.id },
        search: { page: deps.page, sort: deps.sort },
        locale: params.locale,
      }),
      loadTaxonomyData(context.queryClient),
    ]);
    return { ...listData, taxonomy };
  },
  head: withHead(ProductListing, listingHeadExtend()),
  component: CategoryListingComponent,
});

function CategoryListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  const { slug } = Route.useParams();
  return <ListingPage {...data} slug={slug} />;
}
