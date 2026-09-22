import { createFileRoute } from '@tanstack/react-router';
import { BlogCategoryRoute } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogCategoryLoaderData } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * BlogCategoryRoute route configuration.
 * Loads page data via loader and renders the BlogCategoryRoute component.
 *
 * Head: the C12 canonical correction (engine canonical carries no locale
 * prefix on a multilingual store); indexable, unlike the tag/author archives
 * (brief S3-S6-2026-09-22.md), since a blog category groups guides the same
 * way the store's own category pages group products.
 */
export const Route = createFileRoute('/{-$locale}/blog/$slug/c-{$id}')({
  loader: ({ params }): Promise<BlogCategoryLoaderData> =>
    BlogCategoryRoute.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogCategoryRoute, commerceHeadExtend()),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogCategoryRouteComponent,
});

/**
 * BlogCategoryRoute page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function BlogCategoryRouteComponent() {
  const data: BlogCategoryLoaderData = Route.useLoaderData();
  return <BlogCategoryRoute.Component {...data} />;
}
