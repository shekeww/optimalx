import { createFileRoute } from '@tanstack/react-router';
import { Brands } from '@salla.sa/twilight-theme-engine/routes/brands';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BrandsIndex } from '../components/brands/BrandsIndex';
import { brandsIndexHeadExtend } from '../components/seo/routeHeads';

/**
 * The brands index (DIRECTION 6.14; owner brief 2026-09-23 late, item 2). The
 * engine loader stays; the page it renders is ours (`components/brands/
 * BrandsIndex`), so the tiles, the letter groups and the watermark match the
 * rest of the storefront instead of the engine's own grid.
 *
 * A store with no brands yet answers `/brands` with an HTML error page rather
 * than JSON, and the engine loader turns that into a 500 for a page that is in
 * the footer of every screen. The loader failure degrades to an empty group
 * instead, so the route renders its empty state; the page itself is what tells
 * the visitor there is nothing here, which is also true once the owner adds
 * brands and one of them is hidden.
 *
 * `brandsIndexHeadExtend` (seo/routeHeads.ts) carries the C12 canonical
 * correction, the page's own title and description (the engine served the raw
 * key `common.titles.brands` and the store-wide description before this
 * batch) and the CollectionPage + ItemList + BreadcrumbList graph.
 */
export const Route = createFileRoute('/{-$locale}/brands')({
  loader: async ({ params }): Promise<BrandsPageProps> => {
    try {
      return await Brands.loader({ locale: params.locale });
    } catch {
      return { page: { title: '', slug: 'brands.index' }, brands: {} };
    }
  },
  head: withHead(Brands, brandsIndexHeadExtend()),
  component: BrandsComponent,
});

function BrandsComponent() {
  const data: BrandsPageProps = Route.useLoaderData();
  return <BrandsIndex {...data} />;
}
