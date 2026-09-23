import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ListingPage } from '../components/listing/ListingPage';
import { listingHeadExtend } from '../components/listing/head';
import { STATIC_TITLE_KEYS } from '../components/listing/listingCopy';
import { headString } from '../components/seo/strings';

/**
 * The offers listing (DIRECTION 6.3 composition, static source). The page
 * states no saving of its own: every discount shown is the product's own
 * price pair, rendered by the card, as a struck regular price and a saving in
 * riyals. No percentage, no countdown, no "best price" (claims gate 4.4).
 *
 * The title is resolved from our own locale rather than left to the engine:
 * its `SOURCE_TITLE_KEY` for this source (`blocks.header.offers`) is not in
 * this theme's dictionary, so the engine would print the raw key, and the
 * English literal that shipped printed "Offers" as the h1 of an Arabic-first
 * store.
 */
export const Route = createFileRoute('/{-$locale}/offers')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: {
        source: 'offers',
        title: headString(params.locale, STATIC_TITLE_KEYS.offers),
        slug: 'offers',
      },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing, offersHeadExtend()),
  component: OffersComponent,
});

/**
 * `listingHeadExtend()` only overrides `title`/`description` when the path's
 * slug names a taxonomy node (a category or goal landing); `offers` is a
 * static source with none, so it falls through to the engine's own head,
 * whose title is the same short h1 label above and whose description is
 * empty. `ox.seo.offers.*` (owner brief 2026-09-24, SEO-ENG-010) fills both,
 * on top of the shared extension rather than instead of it, so the offers
 * route still gets the canonical/robots/JSON-LD work `listingHeadExtend`
 * does for every listing.
 */
function offersHeadExtend() {
  const extend = listingHeadExtend();
  return (result: HeadDescriptor, ctx: TwilightContext, data: ProductListLoaderData): HeadDescriptor => {
    const extended = extend(result, ctx, data);
    const title = headString(ctx.locale, 'ox.seo.offers.title');
    const description = headString(ctx.locale, 'ox.seo.offers.description');
    return {
      ...extended,
      title,
      description,
      openGraph: { ...extended.openGraph, title, description },
      twitter: extended.twitter ? { ...extended.twitter, title, description } : extended.twitter,
    };
  };
}

function OffersComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ListingPage {...data} />;
}
