import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { canonicalForRequest, localeCodesOf, robots, tryOriginOf } from '../seo/head';
import { headTranslator } from '../seo/strings';
import { faqPage, graph, itemList, type JsonLdNode } from '../seo/jsonld';
import { listingFaqItems } from './faq';
import { slugFromUrl } from './resolve';

/**
 * The `withHead` extension every listing route shares.
 *
 * It applies exactly three corrections to the engine's head and adds nothing
 * else:
 *  - C12: the engine canonical is `origin + path` with no locale prefix while
 *    og:url and hreflang carry one. Both are rebuilt with `canonicalFor`, so
 *    the canonical always equals the served URL, and a single-language store
 *    emits no hreflang cluster at all;
 *  - `robots`: noindex on search and tag listings, index elsewhere;
 *  - the graph gains an ItemList when the page has products and an FAQPage
 *    when the slug's content map has rows. Never a BreadcrumbList: the engine
 *    `Breadcrumb` component already emits one, in a script of its own
 *    (theme-engine Breadcrumb-W64WMO56.js `BreadcrumbJsonLd`), and never a
 *    second ItemList.
 *
 * The nodes ship inside one `@graph` document rather than as a bare array:
 * the head adapter emits `JSON.stringify(descriptor.jsonLd)` into a single
 * `application/ld+json` script (theme-engine chunk-4D44TJ72.js:93-95), and an
 * array whose later members carry no `@context` is not a document a consumer
 * can read.
 *
 * The FAQ rows are resolved through the request's own i18n, the same call the
 * page's accordion makes, so the two can never disagree.
 */
export interface ListingHeadOptions {
  noindex?: boolean;
}

export function listingHeadExtend({ noindex = false }: ListingHeadOptions = {}) {
  return (
    result: HeadDescriptor,
    ctx: TwilightContext,
    data: ProductListLoaderData
  ): HeadDescriptor => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path
        ? canonicalForRequest(origin, path, {
        multilingual,
        locale: ctx.locale,
        languages: localeCodesOf(ctx.settings),
      })
        : result.canonical;

    const nodes: JsonLdNode[] = result.jsonLd
      ? Array.isArray(result.jsonLd)
        ? [...result.jsonLd]
        : [result.jsonLd]
      : [];

    const products = data?.products ?? [];
    if (canonical && products.length > 0) nodes.push(itemList(products, canonical));

    const slug = slugFromUrl(path);
    const rows = listingFaqItems(
      headTranslator(ctx.locale),
      slug
    );
    if (canonical && rows.length > 0) nodes.push(faqPage(rows, canonical));

    return {
      ...result,
      robots: robots(noindex),
      canonical,
      openGraph: { ...result.openGraph, url: canonical },
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
      jsonLd: nodes.length > 0 ? graph(...nodes) : undefined,
    };
  };
}
