import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import {
  canonicalFor,
  canonicalForRequest,
  localeCodesOf,
  resolvedLabel,
  robots,
  tryOriginOf,
} from './head';
import { headTranslator } from './strings';
import {
  breadcrumbList,
  collectionPage,
  faqPage,
  graph,
  service,
  urlItemList,
  type JsonLdNode,
} from './jsonld';
import { articleHeadExtend } from '../commerce/head';
import { pageHead, type PageHeadOptions } from '../pages/head';
import { listingHeadExtend, type ListingHeadOptions } from '../listing/head';
export { paginationCanonical, type PaginationCanonicalResult } from '../listing/head';
import { pdpFaqItems } from '../product/lib/faq';
import { variantOf } from '../product/lib/variant';
import { effectivePrice } from '../product/lib/claims';

/**
 * The heads several routes share, so the routes themselves stay one line
 * (Contract E). `listingHeadExtend`, `pageHead` and `articleHeadExtend` do the
 * heavy lifting; the functions here compose them for a specific route shape.
 */

const HOME_TITLE_KEY = 'ox.seo.home.title';
const HOME_DESCRIPTION_KEY = 'ox.seo.home.description';

/**
 * The home route's `extend`: the C12 canonical correction every owned route
 * applies, plus the researched title and description (keywords-ar.md H01)
 * instead of the engine's own, which the store's dictionary does not carry.
 */
export function homeHeadExtend() {
  return (result: HeadDescriptor, ctx: TwilightContext): HeadDescriptor => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path
        ? canonicalFor(origin, multilingual ? ctx.locale : null, path)
        : result.canonical;

    const t = headTranslator(ctx.locale);
    const title = t(HOME_TITLE_KEY);
    const description = t(HOME_DESCRIPTION_KEY);

    return {
      ...result,
      title,
      description,
      robots: robots(false),
      canonical,
      openGraph: { ...result.openGraph, title, description, url: canonical },
      twitter: result.twitter ? { ...result.twitter, title, description } : result.twitter,
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
    };
  };
}

/**
 * The PDP `extend`: the C12 canonical correction, the FAQPage and Service
 * nodes `$slug.p$id.tsx` already added, plus a BreadcrumbList built from the
 * loader's own `page.breadcrumbs` (SEO-ENG-006: one `@graph` per page, so the
 * trail the engine `Breadcrumb` component draws and the trail the graph
 * publishes come from the same source instead of two separate scripts).
 */
export function productHeadExtend() {
  return (
    result: HeadDescriptor,
    ctx: TwilightContext,
    data: ProductPageProps
  ): HeadDescriptor => {
    const product = data?.product;
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

    const t = headTranslator(ctx.locale);
    const crumbs = data?.page?.breadcrumbs;
    if (canonical && crumbs && crumbs.length > 0) {
      nodes.unshift(
        breadcrumbList(crumbs.map((item) => ({ ...item, name: resolvedLabel(item.name, t) })))
      );
    }

    // The same rows the Faq block renders, resolved through the request's own
    // i18n so the page and the FAQPage node can never disagree.
    const rows = pdpFaqItems(t, product?.category?.url);
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
  };
}

const BRAND_TITLE_QUALIFIED_KEY = 'ox.seo.brand.title_qualified';
const BRAND_TITLE_COMPACT_KEY = 'ox.seo.brand.title_compact';
const BRAND_DESCRIPTION_KEY = 'ox.seo.brand.description_pattern';
const BRAND_PLACEHOLDER = '{{brand}}';
/** SEO-ENG-010's hard title ceiling, both locales. */
const TITLE_CEILING = 60;

/**
 * A brand listing's `extend`: `listingHeadExtend`'s canonical, robots and
 * graph (CollectionPage + ItemList + BreadcrumbList), with a title and a
 * description built for the brand.
 *
 * TWO title patterns, not one, because one cannot fit. SEO-ENG-010 wants an
 * Arabic title of 45 to 55 characters with a hard ceiling of 60, and this
 * catalogue's brand names run from 3 characters ("BSN") to 21 ("Olimp Sport
 * Nutrition"): no single fixed wrapper can clear the lower target for the
 * short name and the ceiling for the long one. So the qualified pattern is
 * used whenever it fits, and the compact one takes over when it would
 * breach. Measured across the store's 21 brands: Arabic 43 to 59, English 42
 * to 60, nothing over the ceiling (docs/build/progress/S4d.md).
 *
 * The description was missing entirely: the engine answered `/brands/9101`
 * with the English "Browse NOW Foods" on an Arabic page (verified live,
 * 2026-09-23). It now comes from our own pattern, 131 to 149 characters in
 * Arabic across the same 21 brands.
 *
 * NO AUTHENTICITY, DISTRIBUTION OR EXCLUSIVITY CLAIM appears in either
 * pattern. The previous title key (`ox.seo.brand.title_pattern`,
 * "{{brand}} أصلي") asserted per-brand authenticity, which is wider than the
 * one store-wide originality line the claims gate allows; it is left in the
 * dictionary untouched for whoever owns the keyword research, and is simply
 * no longer read. See progress/S4d.md.
 */
export function brandHeadExtend(options: ListingHeadOptions = {}) {
  const base = listingHeadExtend(options);
  return (
    result: HeadDescriptor,
    ctx: TwilightContext,
    data: ProductListLoaderData
  ): HeadDescriptor => {
    const extended = base(result, ctx, data);
    const brandName = data?.source?.entity?.name;
    if (!brandName) return extended;
    const t = headTranslator(ctx.locale);
    const qualified = t(BRAND_TITLE_QUALIFIED_KEY).replace(BRAND_PLACEHOLDER, brandName);
    const title =
      qualified.length <= TITLE_CEILING
        ? qualified
        : t(BRAND_TITLE_COMPACT_KEY).replace(BRAND_PLACEHOLDER, brandName);
    const description = t(BRAND_DESCRIPTION_KEY).replace(BRAND_PLACEHOLDER, brandName);
    return {
      ...extended,
      title,
      description,
      openGraph: { ...extended.openGraph, title, description },
      twitter: extended.twitter ? { ...extended.twitter, title, description } : extended.twitter,
    };
  };
}

const BRANDS_TITLE_KEY = 'ox.seo.brands.title';
const BRANDS_DESCRIPTION_KEY = 'ox.seo.brands.description';
const BRANDS_LABEL_KEY = 'ox.nav.brands';
const HOME_LABEL_KEY = 'common.titles.home';

/**
 * The `/brands` index head (owner brief 2026-09-23 late, item 2).
 *
 * Three corrections to what the engine answers with, all verified live on
 * 2026-09-23 before this was written:
 *  - the title was the raw platform key `common.titles.brands` (the store's
 *    dictionary carries the key, the engine head does not resolve it), so
 *    the tab and the SERP line read as a lookup key. It is our own researched
 *    title now: Arabic 50 characters, English 53, inside SEO-ENG-010;
 *  - the description was the store's generic one, duplicated across pages.
 *    SEO-ENG-010 asks for one description per indexable page;
 *  - the page published no structured data at all. It now carries the
 *    CollectionPage, an ItemList of the brand URLs the loader actually
 *    returned, and the BreadcrumbList, in the one `@graph` every owned route
 *    in this theme emits (SEO-ENG-006).
 *
 * The ItemList is built from the loader's own groups: no brand is invented,
 * none is added, and a store with no brands publishes a CollectionPage with
 * no `mainEntity` rather than an empty list.
 */
export function brandsIndexHeadExtend() {
  return (
    result: HeadDescriptor,
    ctx: TwilightContext,
    data: BrandsPageProps
  ): HeadDescriptor => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const locale = multilingual ? ctx.locale : null;
    const canonical = origin && path ? canonicalFor(origin, locale, path) : result.canonical;

    const t = headTranslator(ctx.locale);
    const title = t(BRANDS_TITLE_KEY);
    const description = t(BRANDS_DESCRIPTION_KEY);

    const entries = Object.keys(data?.brands ?? {})
      .sort()
      .flatMap((char) => data.brands[char] ?? [])
      .filter((entry) => entry && entry.name && entry.url)
      .map((entry) => ({ name: entry.name, url: entry.url }));

    const nodes: JsonLdNode[] = [];
    if (canonical) {
      nodes.push(
        collectionPage({
          url: canonical,
          name: title,
          description,
          itemListId: entries.length > 0 ? `${canonical}#itemlist` : undefined,
        })
      );
      if (entries.length > 0) nodes.push(urlItemList(entries, canonical));
      nodes.push(
        breadcrumbList([
          { name: t(HOME_LABEL_KEY), url: origin ? canonicalFor(origin, locale, '/') : '/' },
          { name: t(BRANDS_LABEL_KEY), url: canonical },
        ])
      );
    }

    return {
      ...result,
      title,
      description,
      robots: robots(false),
      canonical,
      openGraph: { ...result.openGraph, title, description, url: canonical },
      twitter: result.twitter ? { ...result.twitter, title, description } : result.twitter,
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
      jsonLd: nodes.length > 0 ? graph(...nodes) : undefined,
    };
  };
}

/** The article head every guide route shares (re-exported for Contract E callers). */
export const blogHeadExtend = articleHeadExtend;

/**
 * The `/categories` head: `pageHead`'s title, description and canonical
 * (already wired by S1 through `CATEGORIES_INDEX_KEYS`), plus the CollectionPage
 * node SEO-ENG-006 wants for an index page. S1 owns `app/routes/categories.tsx`
 * (PLAN-ship shared-file table), so this is exported for that route to wire in
 * one line rather than edited there directly.
 */
export function categoriesHeadExtend(options: PageHeadOptions) {
  const base = pageHead(options);
  return (ctx: TwilightContext): HeadDescriptor => {
    const result = base(ctx);
    if (!result.canonical || !result.title) return result;
    const node = collectionPage({
      url: result.canonical,
      name: result.title,
      description: result.description,
    });
    const existing = result.jsonLd
      ? Array.isArray(result.jsonLd)
        ? result.jsonLd
        : [result.jsonLd]
      : [];
    return { ...result, jsonLd: graph(node, ...(existing as JsonLdNode[])) };
  };
}

