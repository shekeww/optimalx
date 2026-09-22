import { createFileRoute } from '@tanstack/react-router';
import { Product } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { ProductDetailSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductPage } from '../components/product/ProductPage';
import { productHeadExtend } from '../components/seo/routeHeads';

/**
 * Product route. The loader and the head stay the engine's (PLAN-final B3):
 * `Product.loader` fetches through `/api/product`, and `Product.head` builds
 * the title, the description, the OG block and the Product JSON-LD node.
 *
 * `productHeadExtend` (seo/routeHeads.ts) applies the corrections:
 *  - C12: the engine's canonical is `origin + path` with no locale prefix
 *    while og:url and hreflang carry one. Both are rebuilt with
 *    `canonicalFor`, which adds the prefix only on a multilingual store, so
 *    the canonical always equals the served URL. A single-language store
 *    emits no hreflang cluster at all;
 *  - the PDP is indexable;
 *  - the graph gains a BreadcrumbList built from the loader's own
 *    `page.breadcrumbs` (SEO-ENG-006: one `@graph` per page), a FAQPage when
 *    the page has FAQ rows, and a Service node for a booking or service
 *    product. It never adds a second Product node.
 *
 * The nodes ship inside one `@graph` document rather than as a bare array:
 * the head adapter emits `JSON.stringify(descriptor.jsonLd)` into a single
 * `application/ld+json` script (theme-engine chunk-4D44TJ72.js:93-95), so an
 * array would leave the later nodes without an `@context` and unreadable.
 * Each node's own `@context` is stripped on the way in, because the document
 * carries exactly one.
 */
export const Route = createFileRoute('/{-$locale}/$slug/p{$id}')({
  loader: ({ params }): Promise<ProductPageProps> =>
    Product.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(Product, productHeadExtend()),
  pendingComponent: () => <ProductDetailSkeleton />,
  component: ProductComponent,
});

function ProductComponent() {
  const data: ProductPageProps = Route.useLoaderData();
  return <ProductPage {...data} />;
}
