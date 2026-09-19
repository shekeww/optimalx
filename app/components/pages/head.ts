import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import { canonicalFor, hreflangFor, robots, tryOriginOf } from '../seo/head';
import { headTranslator } from '../seo/strings';
import { faqPage, graph, type FaqPair, type JsonLdNode } from '../seo/jsonld';

/**
 * The head every custom B5 route builds (services, branch, about, contact,
 * the converter).
 *
 * Two engine facts shape it:
 *  - `withHead` returns `{}` when the route has no loader data
 *    (theme-engine chunk-4D44TJ72.js:108), so each B5 route ships a one-line
 *    loader and passes this builder as the route module's `head`. In return
 *    `withHead` calls `ensureTwilightContextFromMatches` for us and swallows a
 *    `SettingsError`, which is what makes `ctx.settings` safe to read here.
 *  - C12: the engine canonical is `origin + path` with no locale prefix while
 *    og:url and hreflang carry one. A custom route has no engine head at all,
 *    so the canonical, og:url and the hreflang cluster are all built from
 *    `canonicalFor`, and a single-language store emits no cluster.
 *
 * The path is a constant per route rather than `ctx.location.pathname`: the
 * location on the context is updated by the router's navigation callback, and
 * during the server head pass it may still hold the previous URL.
 */
export interface PageHeadOptions {
  /** The route path without the locale segment, e.g. `/services`. */
  path: string;
  titleKey: string;
  descriptionKey: string;
  /** noindex, follow. The converter is the only B5 page that sets it. */
  noindex?: boolean;
  /** FAQ rows to publish as an FAQPage node; resolved through the request i18n. */
  faq?: (t: (key: string) => string) => FaqPair[];
}

export function pageHead(options: PageHeadOptions) {
  return (ctx: TwilightContext): HeadDescriptor => {
    const store = ctx.settings?.store;
    const origin = tryOriginOf(store?.url);
    const multilingual = Boolean(store?.settings?.is_multilingual);
    const languages = (ctx.settings?.languages ?? [])
      .map((language) => language?.code)
      .filter((code): code is string => typeof code === 'string' && code.length > 0);

    // `TwilightContext` carries no translator (seo/strings), so head strings
    // are read from the theme dictionaries rather than a runtime `t`.
    const translate = headTranslator(ctx.locale);
    const title = translate(options.titleKey);
    const description = translate(options.descriptionKey);

    const canonical = origin
      ? canonicalFor(origin, multilingual ? ctx.locale : null, options.path)
      : undefined;

    const rows = options.faq ? options.faq(translate) : [];
    const nodes: JsonLdNode[] = [];
    if (canonical && rows.length > 0) nodes.push(faqPage(rows, canonical));

    return {
      title,
      description,
      robots: robots(options.noindex ?? false),
      canonical,
      openGraph: {
        type: 'website',
        siteName: store?.name,
        title,
        description,
        url: canonical,
        ...(store?.logo ? { images: store.logo } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(store?.logo ? { images: store.logo } : {}),
      },
      alternateLanguages:
        multilingual && origin ? hreflangFor(origin, options.path, languages) : undefined,
      jsonLd: nodes.length > 0 ? graph(...nodes) : undefined,
    };
  };
}
