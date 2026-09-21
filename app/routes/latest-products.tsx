import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';
import { STATIC_TITLE_KEYS } from '../components/listing/listingCopy';
import { headString } from '../components/seo/strings';

/**
 * The latest-products listing (DIRECTION 6.3 composition, static source).
 *
 * The title is resolved from our own locale. The engine falls back to its own
 * `SOURCE_TITLE_KEY` (`blocks.home.latest_products`) only when no title is
 * passed, and that platform key is not in this theme's dictionary, so the h1
 * would be the raw key; the English literal that shipped instead printed
 * "Latest Products" as the h1 of an Arabic-first store.
 */
export const Route = createFileRoute('/{-$locale}/latest-products')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: {
        source: 'latest',
        title: headString(params.locale, STATIC_TITLE_KEYS.latest),
        slug: 'latest-products',
      },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, listingHeadExtend()),
  component: LatestProductsComponent,
});

function LatestProductsComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ListingPage {...data} />;
}
