import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Blog } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogPageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * The guides index (DIRECTION 6.13). The engine page is wrapped and kept: its
 * slider, its card grid, its pagination and its category nav all stay, and
 * B6 adds the page header through the `blog:start` hook and restyles the rest
 * through `_b6-commerce.scss`.
 *
 * Head: the C12 canonical correction and `index, follow`. No JSON-LD: a blog
 * index is not an ItemList of products, and the engine `Breadcrumb` emits the
 * one BreadcrumbList (C11).
 */
export const Route = createFileRoute('/{-$locale}/blog')({
  loader: ({ params }): Promise<BlogPageProps> => Blog.loader({ locale: params.locale }),
  // The engine titles this route from the platform bundle key
  // `blocks.footer.blog`, which no dictionary in this theme carries, so the
  // browser tab read the key itself (UX-2026-09-24 P0-5).
  head: withHead(Blog, commerceHeadExtend({ titleKey: 'ox.titles.blog' })),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogComponent,
});

function BlogComponent() {
  const data: BlogPageProps = Route.useLoaderData();
  // NOT patched here: the engine's blog page does not print `page.title` for
  // its own h1 or breadcrumb, it calls `t('blocks.footer.blog')` itself
  // against the PLATFORM bundle (measured: `common.titles.home` renders as a
  // key on this page too, and this theme's dictionary does carry that one).
  // Those strings resolve from Salla's CDN in production and cannot resolve
  // in the offline preview at all; the document title, which the theme owns,
  // is fixed in `head` above (UX-2026-09-24 P0-5).
  return (
    <div className="ox-blog">
      <Suspense fallback={<BlogSkeleton />}>
        <Blog.Component {...data} />
      </Suspense>
    </div>
  );
}
