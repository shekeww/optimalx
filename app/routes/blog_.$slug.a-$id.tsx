import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BlogSingle } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ArticleProvider } from '../components/commerce/ArticleContext';
import { articleHeadExtend } from '../components/commerce/head';

/**
 * A guide article (DIRECTION 6.13). The engine page is wrapped: its title,
 * meta row, hero image, sanitised body, tags and comments all stay, and B6
 * adds the key-points panel and the extras through the engine's own
 * `blog:single.start` and `blog:single.end` hook slots.
 *
 * Those slots carry no context, so `ArticleProvider` puts the article in
 * reach of both handlers.
 *
 * Head: the C12 canonical correction, `index, follow`, and one Article node
 * inside a single `@graph` document. The document shape matters: the head
 * adapter stringifies `descriptor.jsonLd` into one `application/ld+json`
 * script (theme-engine chunk-4D44TJ72.js:93-95), so an array of bare nodes
 * would publish only the first node's `@context`.
 */
export const Route = createFileRoute('/{-$locale}/blog/$slug/a-{$id}')({
  loader: ({ params }): Promise<BlogSinglePageProps> =>
    BlogSingle.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogSingle, articleHeadExtend()),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogSingleComponent,
});

function BlogSingleComponent() {
  const data: BlogSinglePageProps = Route.useLoaderData();
  return (
    <div className="ox-article">
      <ArticleProvider value={{ article: data.article, related: data.related ?? [] }}>
        <Suspense fallback={<BlogSkeleton />}>
          <BlogSingle.Component {...data} />
        </Suspense>
      </ArticleProvider>
    </div>
  );
}
