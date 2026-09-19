import { createFileRoute } from '@tanstack/react-router';
import { Product } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { ProductDetailSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductPage } from '../components/product/ProductPage';
import { canonicalForRequest, localeCodesOf, robots, tryOriginOf } from '../components/seo/head';
import { headTranslator } from '../components/seo/strings';
import { faqPage, graph, service, type JsonLdNode } from '../components/seo/jsonld';
import { pdpFaqItems } from '../components/product/lib/faq';
import { variantOf } from '../components/product/lib/variant';
import { effectivePrice } from '../components/product/lib/claims';

/**
 * Product route. The loader and the head stay the engine's (PLAN-final B3):
 * `Product.loader` fetches through `/api/product`, and `Product.head` builds
 * the title, the description, the OG block and the Product JSON-LD node.
 *
 * `extend` applies three corrections and nothing else:
 *  - C12: the engine's canonical is `origin + path` with no locale prefix
 *    while og:url and hreflang carry one. Both are rebuilt with
 *    `canonicalFor`, which adds the prefix only on a multilingual store, so
 *    the canonical always equals the served URL. A single-language store
 *    emits no hreflang cluster at all;
 *  - the PDP is indexable;
 *  - the graph gains a FAQPage when the page has FAQ rows, and a Service node
 *    for a booking or service product. It never adds a second Product node,
 *    and never a BreadcrumbList: the engine `Breadcrumb` already emits one
 *    (C11, ES 7.3:577-578).
 *
 * The nodes ship inside one `@graph` document rather than as a bare array:
 * the head adapter emits `JSON.stringify(descriptor.jsonLd)` into a single
 * `application/ld+json` script (theme-engine chunk-4D44TJ72.js:93-95), so an
 * array would leave the FAQPage and Service nodes without an `@context` and
 * unreadable. Each node's own `@context` is stripped on the way in, because
 * the document carries exactly one.
 */
export const Route = createFileRoute('/{-$locale}/$slug/p{$id}')({
  loader: ({ params }): Promise<ProductPageProps> =>
    Product.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(Product, (result, ctx, data) => {
    const product = data?.product;
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path ? canonicalForRequest(origin, path, {
        multilingual,
        locale: ctx.locale,
        languages: localeCodesOf(ctx.settings),
      }) : result.canonical;

    const engineNodes = result.jsonLd
      ? Array.isArray(result.jsonLd)
        ? result.jsonLd
        : [result.jsonLd]
      : [];
    // The engine's Product node carries its own `@context`; inside a graph the
    // document owns it, so it is dropped here rather than nested.
    const nodes: JsonLdNode[] = engineNodes.map((node) => {
      const { '@context': _context, ...rest } = node as JsonLdNode;
      return rest;
    });
    // The same rows the Faq block renders, resolved through the request's own
    // i18n so the page and the FAQPage node can never disagree.
    const rows = pdpFaqItems(
      headTranslator(ctx.locale),
      product?.category?.url
    );
    if (rows.length > 0) nodes.push(faqPage(rows, canonical));

    // The engine writes `offers.price` from `product.sale_price`
    // (dist/routes/product.js:150), which the API sends as 0 for anything not
    // discounted, so an undiscounted product would publish a price of zero.
    // The displayed price is substituted for it in a copy of the offer;
    // nothing else in the node is touched, and no second Product node is
    // ever added.
    const price = product ? effectivePrice(product) : undefined;
    if (price !== undefined) {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node['@type'] !== 'Product') continue;
        const offers = node.offers as Record<string, unknown> | undefined;
        if (offers) nodes[i] = { ...node, offers: { ...offers, price } };
      }
    }
    if (product && variantOf(product.type) === 'service') nodes.push(service(product));

    return {
      ...result,
      robots: robots(false),
      canonical,
      openGraph: { ...result.openGraph, url: canonical },
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
      jsonLd: nodes.length > 0 ? graph(...nodes) : undefined,
    };
  }),
  pendingComponent: () => <ProductDetailSkeleton />,
  component: ProductComponent,
});

function ProductComponent() {
  const data: ProductPageProps = Route.useLoaderData();
  return <ProductPage {...data} />;
}
