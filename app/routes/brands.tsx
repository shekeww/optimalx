import { createFileRoute } from '@tanstack/react-router';
import { Brands } from '@salla.sa/twilight-theme-engine/routes/brands';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BrandsGrid } from '../components/listing/BrandsGrid';
import { canonicalFor, robots, tryOriginOf } from '../components/seo/head';

/**
 * The brands index (DIRECTION 6.14). The engine loader and head stay; the
 * engine's own grid is replaced by ours so the tiles match the catalogue
 * plates the rest of the storefront uses.
 *
 * A store with no brands yet answers `/brands` with an HTML error page rather
 * than JSON, and the engine loader turns that into a 500 for a page that is in
 * the footer of every screen. The loader failure degrades to an empty group
 * instead, so the route renders its empty state; the page itself is what tells
 * the visitor there is nothing here, which is also true once the owner adds
 * brands and one of them is hidden.
 *
 * The head extension is the C12 canonical correction only: no JSON-LD is
 * added here (a list of brands is not an ItemList of products), and the
 * engine `Breadcrumb` inside the page emits the one BreadcrumbList (C11).
 */
export const Route = createFileRoute('/{-$locale}/brands')({
  loader: async ({ params }): Promise<BrandsPageProps> => {
    try {
      return await Brands.loader({ locale: params.locale });
    } catch {
      return { page: { title: '', slug: 'brands.index' }, brands: {} };
    }
  },
  head: withHead(Brands, (result, ctx) => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path
        ? canonicalFor(origin, multilingual ? ctx.locale : null, path)
        : result.canonical;
    return {
      ...result,
      robots: robots(false),
      canonical,
      openGraph: { ...result.openGraph, url: canonical },
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
    };
  }),
  component: BrandsComponent,
});

function BrandsComponent() {
  const data: BrandsPageProps = Route.useLoaderData();
  return <BrandsGrid {...data} />;
}
