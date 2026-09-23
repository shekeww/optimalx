import type { Product, Store } from '@salla.sa/twilight-theme-engine/types';
import type { ArticleDetail } from '@salla.sa/twilight-theme-engine/routes';
import { originOf } from './head';

/**
 * JSON-LD builders. Each returns a plain object with a stable `@id` derived
 * from the store origin (site-wide nodes) or the page URL (page nodes), so
 * nodes can reference each other across documents. Money is raw numbers plus
 * a currency code (never `useMoney().format()`, which returns JSX for SAR).
 * Wrap nodes with `graph()` before emitting; serialise with `toScriptText()`.
 */
export type JsonLdNode = Record<string, unknown>;

export const SCHEMA_CONTEXT = 'https://schema.org';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqPair {
  question: string;
  answer: string;
}

/** Branch facts, sourced from theme settings with fallbacks (content/branch). */
export interface BranchInfo {
  address?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  /** schema.org openingHours strings, e.g. "Sa-Th 16:00-23:00". */
  hours?: readonly string[];
  phone?: string;
  mapUrl?: string;
  geo?: { latitude: number; longitude: number };
}

function compact<T extends JsonLdNode>(node: T): T {
  const out: JsonLdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value;
  }
  return out as T;
}

function organizationId(origin: string): string {
  return `${origin}/#organization`;
}

function nonEmpty(values: readonly (string | undefined | null)[]): string[] | undefined {
  const list = values.filter((v): v is string => typeof v === 'string' && v.length > 0);
  return list.length ? list : undefined;
}

function plainText(html: string | undefined): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text || undefined;
}

function priceOf(product: Product): number | undefined {
  const raw =
    typeof product.price_as_float === 'number' ? product.price_as_float : Number(product.price);
  return Number.isFinite(raw) ? raw : undefined;
}

function isoDate(input: ArticleDetail['created_at']): string | undefined {
  if (input === undefined || input === null) return undefined;
  if (input instanceof Date) return input.toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (typeof input === 'string') return input;
  return input.date;
}

export function organization({
  store,
  alternateName,
  sameAs = [],
}: {
  store: Store;
  /** The brand's other-script form (keywords-ar.md §7.1), for entity matching. */
  alternateName?: string;
  sameAs?: readonly (string | undefined | null)[];
}): JsonLdNode {
  const origin = originOf(store.url);
  const phone = store.contacts?.phone ?? store.contacts?.mobile;
  return compact({
    '@type': 'Organization',
    '@id': organizationId(origin),
    name: store.name,
    alternateName,
    url: `${origin}/`,
    logo: store.logo,
    email: store.contacts?.email,
    telephone: phone,
    // The store trades in one country today (BUILD.md, conductor §1): Medina,
    // shipping nationwide, never a wider claim than the market it serves.
    areaServed: 'SA',
    contactPoint: phone
      ? compact({
          '@type': 'ContactPoint',
          telephone: phone,
          email: store.contacts?.email,
          contactType: 'customer service',
          areaServed: 'SA',
        })
      : undefined,
    sameAs: nonEmpty(sameAs),
  });
}

export function website({ store, searchUrl }: { store: Store; searchUrl: string }): JsonLdNode {
  const origin = originOf(store.url);
  return compact({
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: store.name,
    publisher: { '@id': organizationId(origin) },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${searchUrl}?q={q}`,
      'query-input': 'required name=q',
    },
  });
}

export function localBusiness({ store, branch }: { store: Store; branch: BranchInfo }): JsonLdNode {
  const origin = originOf(store.url);
  return compact({
    '@type': 'Store',
    '@id': `${origin}/#localbusiness`,
    name: store.name,
    url: `${origin}/`,
    image: store.logo,
    telephone: branch.phone ?? store.contacts?.phone ?? store.contacts?.mobile,
    parentOrganization: { '@id': organizationId(origin) },
    address: branch.address
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: branch.address,
          addressLocality: branch.locality,
          addressRegion: branch.region,
          postalCode: branch.postalCode,
          addressCountry: branch.country ?? store.country ?? 'SA',
        })
      : undefined,
    geo: branch.geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: branch.geo.latitude,
          longitude: branch.geo.longitude,
        }
      : undefined,
    openingHours: branch.hours?.length ? [...branch.hours] : undefined,
    hasMap: branch.mapUrl,
    currenciesAccepted: 'SAR',
  });
}

/**
 * The `WebPage` node for a listing or index page (SEO-ENG-006 hierarchy:
 * Organization -> WebSite -> WebPage -> primary entity). `mainEntity` points
 * at the page's own `ItemList` by `@id` rather than nesting it, so the graph
 * stays one flat list of nodes with stable ids.
 */
export function collectionPage({
  url,
  name,
  description,
  itemListId,
}: {
  url: string;
  name: string;
  description?: string;
  itemListId?: string;
}): JsonLdNode {
  return compact({
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    mainEntity: itemListId ? { '@id': itemListId } : undefined,
  });
}

export function breadcrumbList(items: readonly BreadcrumbItem[]): JsonLdNode {
  const last = items[items.length - 1];
  return compact({
    '@type': 'BreadcrumbList',
    '@id': last ? `${last.url}#breadcrumb` : undefined,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function itemList(products: readonly Product[], url: string): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    url,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: product.url,
      name: product.name,
    })),
  };
}

/**
 * An `ItemList` of plain URLs, for an index page whose members are not
 * products: `/brands` lists brand pages, so its list carries each brand's own
 * URL and name and nothing else. Kept beside `itemList` rather than folded
 * into it because that one reads `Product` fields the engine types, and a
 * brand is a different payload with a different shape.
 */
export function urlItemList(entries: readonly BreadcrumbItem[], url: string): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    url,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: entry.url,
      name: entry.name,
    })),
  };
}

export function faqPage(pairs: readonly FaqPair[], url?: string): JsonLdNode {
  return compact({
    '@type': 'FAQPage',
    '@id': url ? `${url}#faq` : undefined,
    mainEntity: pairs.map((pair) => ({
      '@type': 'Question',
      name: pair.question,
      acceptedAnswer: { '@type': 'Answer', text: pair.answer },
    })),
  });
}

export function article(detail: ArticleDetail): JsonLdNode {
  const origin = originOf(detail.url);
  return compact({
    '@type': 'Article',
    '@id': `${detail.url}#article`,
    headline: detail.name,
    description: detail.description,
    image: detail.image,
    url: detail.url,
    mainEntityOfPage: detail.url,
    datePublished: isoDate(detail.created_at),
    author: detail.author
      ? compact({ '@type': 'Person', name: detail.author.name, url: detail.author.url })
      : undefined,
    publisher: { '@id': organizationId(origin) },
  });
}

export function service(product: Product): JsonLdNode {
  const origin = originOf(product.url);
  const outOfStock = product.is_out_of_stock || product.is_available === false;
  return compact({
    '@type': 'Service',
    '@id': `${product.url}#service`,
    name: product.name,
    description: plainText(product.description),
    url: product.url,
    image: product.image?.url,
    provider: { '@id': organizationId(origin) },
    offers: compact({
      '@type': 'Offer',
      url: product.url,
      price: priceOf(product),
      priceCurrency: product.currency,
      availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    }),
  });
}

/** One `@context` for a set of nodes; the shape every emitted document uses. */
export function graph(...nodes: readonly JsonLdNode[]): JsonLdNode {
  return { '@context': SCHEMA_CONTEXT, '@graph': nodes };
}

/** JSON for a `<script type="application/ld+json">` body: `<`, `>`, `&` and the
 * U+2028 / U+2029 line separators become JSON unicode escapes, so store data can
 * never close the tag or break the script. Built from char codes on purpose:
 * backslash escapes in this file have been mangled by tooling before. */
const UNICODE_ESCAPE = String.fromCharCode(92) + 'u';
const SCRIPT_ESCAPES: ReadonlyArray<readonly [string, string]> = [
  ['<', UNICODE_ESCAPE + '003c'],
  ['>', UNICODE_ESCAPE + '003e'],
  ['&', UNICODE_ESCAPE + '0026'],
  [String.fromCharCode(0x2028), UNICODE_ESCAPE + '2028'],
  [String.fromCharCode(0x2029), UNICODE_ESCAPE + '2029'],
];

export function toScriptText(doc: JsonLdNode): string {
  return SCRIPT_ESCAPES.reduce(
    (text, [raw, safe]) => text.replaceAll(raw, safe),
    JSON.stringify(doc)
  );
}
