import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { canonicalForRequest, localeCodesOf, resolvedLabel, robots, tryOriginOf } from '../seo/head';
import { headTranslator } from '../seo/strings';
import { breadcrumbList, collectionPage, faqPage, graph, itemList, type JsonLdNode } from '../seo/jsonld';
import { nodeBySlug } from '../../content/taxonomy';
import { listingFaqItems } from './faq';
import { slugFromUrl } from './resolve';

/**
 * The `withHead` extension every listing route shares.
 *
 * Corrections and additions to the engine's head:
 *  - C12: the engine canonical is `origin + path` with no locale prefix while
 *    og:url and hreflang carry one. Both are rebuilt with `canonicalFor`, so
 *    the canonical always equals the served URL, and a single-language store
 *    emits no hreflang cluster at all;
 *  - `paginationCanonical`: a lone `page` past 1 gets a self-canonical with
 *    `?page=N`; any other query key points the canonical back at the clean
 *    path and forces `noindex, follow`, on top of whichever listing kinds
 *    (search, tags) already ask for `noindex` themselves;
 *  - title and description come from the taxonomy node when the path's slug
 *    names one (a category or goal landing, Contract B); every other source
 *    (search, tags, brands, the static sources) keeps the engine's own;
 *  - the graph gains a CollectionPage (the page itself, SEO-ENG-006
 *    hierarchy), an ItemList when the page has products, a BreadcrumbList
 *    from the loader's own `page.breadcrumbs`, and an FAQPage when the slug's
 *    content map has rows.
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

export interface PaginationCanonicalResult {
  canonical: string | undefined;
  /** True when a query key other than `page` is present (a crawl path, not an index target). */
  noindexExtra: boolean;
}

/**
 * The query-string canonical policy every listing page shares: a lone `page`
 * parameter past 1 gets a self-canonical with `?page=N` because
 * a paginated page is still indexable; any other query key (sort, filters, a
 * search term) points the canonical back at the clean path and asks for
 * `noindex, follow`, because that combination is a crawl path rather than an
 * index target. `storeId` is the offline preview's own query param, never a
 * real page variant, and is ignored.
 */
export function paginationCanonical(
  baseCanonical: string | undefined,
  search: Record<string, unknown> | undefined
): PaginationCanonicalResult {
  const entries = Object.entries(search ?? {}).filter(
    ([key, value]) => key !== 'storeId' && value !== undefined && value !== null && value !== ''
  );
  const otherKeys = entries.filter(([key]) => key !== 'page');
  const noindexExtra = otherKeys.length > 0;
  const pageValue = Number((search as Record<string, unknown> | undefined)?.page);
  const canonical =
    baseCanonical && !noindexExtra && Number.isFinite(pageValue) && pageValue > 1
      ? `${baseCanonical}?page=${pageValue}`
      : baseCanonical;
  return { canonical, noindexExtra };
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
    const baseCanonical =
      origin && path
        ? canonicalForRequest(origin, path, {
            multilingual,
            locale: ctx.locale,
            languages: localeCodesOf(ctx.settings),
          })
        : result.canonical;

    const { canonical, noindexExtra } = paginationCanonical(
      baseCanonical,
      ctx.location?.search as Record<string, unknown> | undefined
    );

    const slug = slugFromUrl(path);
    const node = nodeBySlug(slug);
    const t = headTranslator(ctx.locale);
    const title = node ? t(node.titleKey) : result.title;
    const description = node ? t(node.descriptionKey) : result.description;

    const nodes: JsonLdNode[] = result.jsonLd
      ? Array.isArray(result.jsonLd)
        ? [...result.jsonLd]
        : [result.jsonLd]
      : [];

    const products = data?.products ?? [];
    const itemListId = canonical && products.length > 0 ? `${canonical}#itemlist` : undefined;
    if (canonical) {
      nodes.push(collectionPage({ url: canonical, name: title ?? '', description, itemListId }));
    }
    if (itemListId) nodes.push(itemList(products, canonical as string));

    const crumbs = data?.page?.breadcrumbs;
    if (crumbs && crumbs.length > 0) {
      nodes.push(
        breadcrumbList(crumbs.map((item) => ({ ...item, name: resolvedLabel(item.name, t) })))
      );
    }

    const rows = listingFaqItems(t, slug);
    if (canonical && rows.length > 0) nodes.push(faqPage(rows, canonical));

    return {
      ...result,
      title,
      description,
      robots: robots(noindex || noindexExtra),
      canonical,
      openGraph: { ...result.openGraph, title, description, url: canonical },
      twitter: result.twitter ? { ...result.twitter, title, description } : result.twitter,
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
      jsonLd: nodes.length > 0 ? graph(...nodes) : undefined,
    };
  };
}
