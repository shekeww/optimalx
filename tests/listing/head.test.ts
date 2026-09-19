import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { listingHeadExtend } from '../../app/components/listing/head';
import { listingFaqItems } from '../../app/components/listing/faq';
import { findDuplicateKeys } from '../../scripts/check-jsonld.mjs';
import { createT } from '../helpers/i18n';

/**
 * The listing head, built the way the routes build it: the engine's own
 * `ProductListing.head` supplies title, description and OG, and our `extend`
 * adds the C12 canonical correction, the robots rule and the two JSON-LD
 * nodes. The fixtures in tests/fixtures/jsonld are the documents that
 * composition produces, and `pnpm check:jsonld` scans them for duplicate keys.
 */

const ORIGIN = 'https://optimalx.com.sa';
const FIXTURE_DIR = path.join('tests', 'fixtures', 'jsonld');
const t = createT('ar');

function context(pathname: string, multilingual = false) {
  return {
    settings: { store: { url: `${ORIGIN}/`, settings: { is_multilingual: multilingual } } },
    location: { pathname },
    locale: 'ar',
    i18n: { t },
  } as never;
}

function loaderData(overrides: Partial<ProductListLoaderData> = {}): ProductListLoaderData {
  return {
    page: {
      title: 'واي بروتين',
      slug: 'product.index',
      breadcrumbs: [
        { name: 'الرئيسية', url: '/' },
        { name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c1` },
      ],
    },
    source: {
      type: 'categories',
      value: '1',
      entity: { id: 1, name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c1` },
    },
    query: { sort: 'ourSuggest', filters: true },
    products: [
      { id: 1996831868, name: 'Gold Standard Whey', url: `${ORIGIN}/p1996831868` },
      { id: 1497955814, name: 'Impact Whey Isolate', url: `${ORIGIN}/p1497955814` },
    ],
    pagination: { next: null },
    ...overrides,
  } as ProductListLoaderData;
}

/** What the engine's `head` hands `extend` (dist/routes/product-listing.js). */
function engineHead(title: string, canonical: string): HeadDescriptor {
  return {
    title,
    description: `Browse ${title}`,
    canonical,
    openGraph: { type: 'website', title, description: `Browse ${title}`, url: canonical },
    twitter: { card: 'summary_large_image', title, description: `Browse ${title}` },
    alternateLanguages: [{ hreflang: 'ar', href: `${ORIGIN}/ar/whey-protein/c1` }],
  };
}

/**
 * The nodes inside the one `@graph` document the head emits. The engine
 * `Breadcrumb` component emits its BreadcrumbList in a script of its own, so
 * it is deliberately not part of this document (C11).
 */
function nodesOf(result: HeadDescriptor): Record<string, unknown>[] {
  const doc = result.jsonLd as Record<string, unknown> | undefined;
  if (!doc) return [];
  expect(doc['@context']).toBe('https://schema.org');
  return (doc['@graph'] ?? []) as Record<string, unknown>[];
}

describe('listing head extend', () => {
  it('rebuilds the canonical without a locale prefix on a single-language store', () => {
    const result = listingHeadExtend()(
      engineHead('واي بروتين', `${ORIGIN}/whey-protein/c1`),
      context('/whey-protein/c1'),
      loaderData()
    );
    expect(result.canonical).toBe(`${ORIGIN}/whey-protein/c1`);
    expect(result.openGraph?.url).toBe(result.canonical);
    expect(result.alternateLanguages).toBeUndefined();
  });

  it('carries the locale prefix on a multilingual store (C12)', () => {
    const result = listingHeadExtend()(
      engineHead('واي بروتين', `${ORIGIN}/whey-protein/c1`),
      context('/ar/whey-protein/c1', true),
      loaderData()
    );
    expect(result.canonical).toBe(`${ORIGIN}/ar/whey-protein/c1`);
    expect(result.openGraph?.url).toBe(`${ORIGIN}/ar/whey-protein/c1`);
    expect(result.alternateLanguages).toHaveLength(1);
  });

  it('indexes a category and refuses to index search and tags', () => {
    const category = listingHeadExtend()(
      engineHead('واي بروتين', ''),
      context('/whey-protein/c1'),
      loaderData()
    );
    expect(category.robots).toBe('index, follow');

    const search = listingHeadExtend({ noindex: true })(
      engineHead('واي', ''),
      context('/search'),
      loaderData({ source: { type: 'search', value: 'واي' }, products: [] })
    );
    expect(search.robots).toBe('noindex, follow');
  });

  it('adds one ItemList of the loaded products and never a BreadcrumbList', () => {
    const result = listingHeadExtend()(
      engineHead('واي بروتين', ''),
      context('/whey-protein/c1'),
      loaderData()
    );
    const nodes = nodesOf(result);
    const itemLists = nodes.filter((node) => node['@type'] === 'ItemList');
    expect(itemLists).toHaveLength(1);
    expect(itemLists[0].numberOfItems).toBe(2);
    expect((itemLists[0].itemListElement as Record<string, unknown>[])[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Gold Standard Whey',
    });
    // C11: the engine Breadcrumb component is the only BreadcrumbList source.
    expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(false);
  });

  it('emits no ItemList for an empty result', () => {
    const result = listingHeadExtend({ noindex: true })(
      engineHead('zzzz', ''),
      context('/search'),
      loaderData({ source: { type: 'search', value: 'zzzz' }, products: [] })
    );
    expect(nodesOf(result).some((node) => node['@type'] === 'ItemList')).toBe(false);
  });

  it('adds the FAQPage of the slug the path carries, and only then', () => {
    const withFaq = listingHeadExtend()(
      engineHead('واي بروتين', ''),
      context('/whey-protein/c1'),
      loaderData()
    );
    const faq = nodesOf(withFaq).find((node) => node['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect((faq?.mainEntity as unknown[]).length).toBe(3);

    const noFaq = listingHeadExtend()(
      engineHead('أحدث المنتجات', ''),
      context('/latest-products'),
      loaderData({ source: { type: 'latest' } })
    );
    expect(nodesOf(noFaq).some((node) => node['@type'] === 'FAQPage')).toBe(false);
  });

  it('reads the goal FAQ for a goal landing path', () => {
    const result = listingHeadExtend()(
      engineHead('مكملات الأداء', ''),
      context('/goal-performance/c9'),
      loaderData({
        source: {
          type: 'categories',
          value: '9',
          entity: { id: 9, name: 'الأداء', url: `${ORIGIN}/goal-performance/c9` },
        },
      })
    );
    const faq = nodesOf(result).find((node) => node['@type'] === 'FAQPage');
    const first = (faq?.mainEntity as Record<string, unknown>[])[0];
    expect(first.name).toBe(t('ox.content.goals.performance.faq_1_q'));
  });
});

describe('listingFaqItems', () => {
  it('resolves the category rows through the request i18n', () => {
    const rows = listingFaqItems(t, 'creatine');
    expect(rows).toHaveLength(3);
    expect(rows[0].question).toBe(t('ox.content.categories.creatine.faq_1_q'));
  });

  it('is empty without a slug, a `t`, or a known slug', () => {
    expect(listingFaqItems(t, undefined)).toEqual([]);
    expect(listingFaqItems(undefined, 'creatine')).toEqual([]);
    expect(listingFaqItems(t, 'not-a-category')).toEqual([]);
  });
});

describe('the emitted documents', () => {
  for (const name of ['b4-category.json', 'b4-goal.json', 'b4-search.json']) {
    it(`${name} has no duplicate keys and parses`, () => {
      const text = fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
      expect(findDuplicateKeys(text)).toEqual([]);
      expect(() => JSON.parse(text)).not.toThrow();
    });
  }

  it('the category fixture is exactly what the page emits', () => {
    const canonical = `${ORIGIN}/whey-protein/c1`;
    const result = listingHeadExtend()(
      engineHead('واي بروتين', canonical),
      context('/whey-protein/c1'),
      loaderData()
    );
    const fixture = JSON.parse(
      fs.readFileSync(path.join(FIXTURE_DIR, 'b4-category.json'), 'utf8')
    );
    expect(result.jsonLd).toEqual(fixture);
  });

  it('emits one script-ready document, not a bare array of nodes', () => {
    // The head adapter stringifies `jsonLd` straight into one
    // application/ld+json script (theme-engine chunk-4D44TJ72.js:93-95).
    const result = listingHeadExtend()(
      engineHead('واي بروتين', ''),
      context('/whey-protein/c1'),
      loaderData()
    );
    expect(Array.isArray(result.jsonLd)).toBe(false);
    expect((result.jsonLd as Record<string, unknown>)['@context']).toBe('https://schema.org');
  });

  it('emits no document at all when there is nothing to say', () => {
    const result = listingHeadExtend({ noindex: true })(
      engineHead('zzzz', ''),
      context('/search'),
      loaderData({ source: { type: 'search', value: 'zzzz' }, products: [] })
    );
    expect(result.jsonLd).toBeUndefined();
  });
});
