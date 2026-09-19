import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';
import { STATIC_TITLE_KEYS } from '../components/listing/listingCopy';
import { headString } from '../components/seo/strings';

/**
 * The catalogue listing on the platform's `sales` route (DIRECTION 6.3
 * composition, static source).
 *
 * The ordering stays the platform's `sales` source and the route keeps its URL
 * because Salla ships it. The page is NOT titled by sales: the store has zero
 * orders, so "الأكثر مبيعا" would be an invented statistic (PLAN-final 4.4 and
 * open question 2). The engine's own title key for this source
 * (`common.titles.most_sales`) is absent from this theme's dictionary and
 * would print raw, so the h1 is our own neutral catalogue title. It becomes a
 * sales title the day order data exists, and not before.
 */
export const Route = createFileRoute('/{-$locale}/most-sales-products')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: {
        source: 'sales',
        title: headString(params.locale, STATIC_TITLE_KEYS.sales),
        slug: 'most-sales-products',
      },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, listingHeadExtend()),
  component: MostSalesProductsComponent,
});

function MostSalesProductsComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ListingPage {...data} />;
}
