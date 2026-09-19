import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';

/**
 * Search results (DIRECTION 6.8). Search itself stays Salla's: the engine
 * loader calls the platform's search source and this route only renders the
 * answer, with the zero state when it is empty.
 *
 * `noindex, follow`: a results page is a visitor surface, not an index
 * surface, and its query string would generate an unbounded set of URLs.
 */
export const Route = createFileRoute('/{-$locale}/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || '',
    ...(search.sort ? { sort: String(search.sort) } : {}),
  }),
  loaderDeps: ({ search }) => ({ q: search.q, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { source: 'search' },
      search: { q: deps.q, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, listingHeadExtend({ noindex: true })),
  component: SearchComponent,
});

function SearchComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ListingPage {...data} />;
}
