import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import type { BlogSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { canonicalFor, isUnresolvedKey, robots, tryOriginOf } from '../seo/head';
import { headString } from '../seo/strings';
import { article, graph, type JsonLdNode } from '../seo/jsonld';

/**
 * A document title that is never a lookup key (UX-2026-09-24 P0-5).
 *
 * The engine hands a commerce route its title from the PLATFORM string
 * bundle, which Salla serves from its own CDN and which the head pass does
 * not resolve: `/ar/cart` shipped the tab title `common.titles.cart` and
 * `/ar/blog` shipped `blocks.footer.blog`. The theme's own dictionary carries
 * many of those platform keys, so the first attempt is a real lookup in it;
 * `titleKey` is the theme key the route names for the ones it does not
 * (`blocks.footer.blog` has no entry anywhere in this theme).
 *
 * A title that is neither a key nor resolvable is left exactly as the engine
 * produced it: a merchant's own page title is never rewritten here.
 */
function headTitle(
  title: string | undefined,
  locale: string | null | undefined,
  titleKey: string | undefined
): string | undefined {
  if (!title || !isUnresolvedKey(title)) return title;
  const fromDictionary = headString(locale, title);
  if (!isUnresolvedKey(fromDictionary)) return fromDictionary;
  if (!titleKey) return title;
  const fallback = headString(locale, titleKey);
  return isUnresolvedKey(fallback) ? title : fallback;
}

/**
 * The `withHead` extension the commerce routes share.
 *
 * Two corrections and nothing else:
 *  - C12: the engine canonical is `origin + path` with no locale prefix while
 *    og:url and hreflang carry one. Both are rebuilt with `canonicalFor`, so
 *    the canonical always equals the served URL, and a single-language store
 *    emits no hreflang cluster at all;
 *  - `robots`: noindex on the cart and the thank-you page (neither is anyone's
 *    landing page and both are per-visitor), index on the guides and on the
 *    store's static pages.
 *
 * No route here emits a BreadcrumbList: the engine `Breadcrumb` component
 * inside each page already emits one in a script of its own (C11).
 */
export function commerceHeadExtend({
  noindex = false,
  titleKey,
}: { noindex?: boolean; titleKey?: string } = {}) {
  return (result: HeadDescriptor, ctx: TwilightContext): HeadDescriptor => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path
        ? canonicalFor(origin, multilingual ? ctx.locale : null, path)
        : result.canonical;

    return {
      ...result,
      title: headTitle(result.title, ctx.locale, titleKey),
      robots: robots(noindex),
      canonical,
      openGraph: { ...result.openGraph, url: canonical },
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
    };
  };
}

/**
 * The article head: the shared corrections plus one Article node.
 *
 * The nodes ship inside one `{ "@context", "@graph" }` document because the
 * head adapter emits `JSON.stringify(descriptor.jsonLd)` into a single
 * `application/ld+json` script (theme-engine chunk-4D44TJ72.js:93-95); an
 * array whose later members carry no `@context` is not a document a consumer
 * can read.
 */
export function articleHeadExtend() {
  const base = commerceHeadExtend({ noindex: false });
  return (
    result: HeadDescriptor,
    ctx: TwilightContext,
    data: BlogSinglePageProps
  ): HeadDescriptor => {
    const corrected = base(result, ctx);
    const nodes: JsonLdNode[] = corrected.jsonLd
      ? Array.isArray(corrected.jsonLd)
        ? [...corrected.jsonLd]
        : [corrected.jsonLd]
      : [];

    const detail = data?.article;
    // `article()` derives its ids from the article URL, so an article without
    // one publishes no node rather than a node with a broken @id.
    if (detail?.url) nodes.push(article(detail));

    return { ...corrected, jsonLd: nodes.length > 0 ? graph(...nodes) : undefined };
  };
}
