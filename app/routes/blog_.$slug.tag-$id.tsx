import { createFileRoute } from '@tanstack/react-router';
import { BlogTagRoute } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogTagLoaderData } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * BlogTagRoute route configuration.
 * Loads page data via loader and renders the BlogTagRoute component.
 *
 * Head: the C12 canonical correction and `noindex, follow` (brief
 * S3-S6-2026-09-22.md "S3 amendments": a blog tag page is a slice of the
 * guides index that duplicates it, so it is a crawl path rather than an
 * index target, same rule as the product tag listings).
 */
export const Route = createFileRoute('/{-$locale}/blog/$slug/tag-{$id}')({
  loader: ({ params }): Promise<BlogTagLoaderData> =>
    BlogTagRoute.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogTagRoute, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogTagRouteComponent,
});

/**
 * BlogTagRoute page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function BlogTagRouteComponent() {
  const data: BlogTagLoaderData = Route.useLoaderData();
  return <BlogTagRoute.Component {...data} />;
}
