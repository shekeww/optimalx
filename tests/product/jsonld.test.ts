import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import type { Product as ProductType } from '@salla.sa/twilight-theme-engine/types';
import { canonicalFor, robots, tryOriginOf } from '../../app/components/seo/head';
import { breadcrumbList, faqPage, graph, service } from '../../app/components/seo/jsonld';
import { variantOf } from '../../app/components/product/lib/variant';
import { findDuplicateKeys } from '../../scripts/check-jsonld.mjs';

/**
 * The PDP's structured data, built the way the route builds it: the engine's
 * `Product.head` supplies the Product node, our `extend` adds the FAQPage and
 * the Service node, and the engine `Breadcrumb` component contributes the one
 * BreadcrumbList (PLAN-final C11). The fixtures in tests/fixtures/jsonld are
 * the documents that composition produces, and `pnpm check:jsonld` scans them
 * for duplicate keys.
 */

const ORIGIN = 'https://optimalx.com.sa';
const FIXTURE_DIR = path.join('tests', 'fixtures', 'jsonld');

const settings = {
  store: {
    id: 1,
    name: 'اوبتيمال اكس',
    url: ORIGIN + '/',
    settings: { is_multilingual: false },
  },
} as never;

function makeProduct(overrides: Partial<ProductType> = {}): ProductType {
  return {
    id: 1996831868,
    name: 'Gold Standard Whey',
    description: '<p>الحصص: 73 | الشكل: بودرة</p><p>بروتين واي.</p>',
    url: ORIGIN + '/p1996831868',
    type: 'product',
    status: 'sale',
    sku: 'OX-001',
    price: 240,
    sale_price: 240,
    regular_price: 240,
    base_currency_price: 240,
    currency: 'SAR',
    max_quantity: 10,
    image: { url: 'https://cdn.salla.sa/a.jpg' },
    is_taxable: true,
    has_read_more: false,
    can_add_note: false,
    can_show_remained_quantity: false,
    can_upload_file: false,
    has_custom_form: false,
    has_metadata: false,
    is_on_sale: false,
    is_hidden_quantity: false,
    is_available: true,
    is_out_of_stock: false,
    is_require_shipping: true,
    has_size_guide: false,
    ...overrides,
  } as ProductType;
}

const FAQ_ROWS = [
  { question: 'لماذا قد تجد سعرا أقل في مكان آخر؟', answer: 'نشتري كميات صغيرة ونعرض سعرا واحدا.' },
];

/**
 * The engine's Product node, transcribed from dist/routes/product.js:122-200.
 *
 * The engine route module cannot be imported here: it pulls the components
 * package's root barrel, whose dist/index.js imports `./components/components`,
 * a file the package does not publish, so the import fails outside the
 * bundler. Only the fields this suite asserts on are reproduced, and the
 * point of the assertions is what OUR extend adds and does not add. If the
 * engine changes its node, the browser walk in the verifier is what catches
 * it.
 */
function engineProductNode(product: ProductType): Record<string, unknown> {
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 1);
  const node: Record<string, unknown> = {
    // The engine's node carries its own @context (dist/routes/product.js:126);
    // the route strips it when folding the node into the graph.
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: (product.description ?? '').replace(TAGS, '').slice(0, 160),
    sku: product.sku,
    image: product.image?.url ? [product.image.url] : undefined,
    offers: {
      '@type': 'Offer',
      url: product.url,
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      price: product.sale_price,
      priceCurrency: product.currency,
      priceValidUntil: validUntil.toISOString().split('T')[0],
      seller: { '@type': 'Organization', name: settings.store.name },
    },
  };
  // The engine adds aggregateRating only when rating.count > 0, which is why
  // a store with no reviews emits none (claims gate: no invented ratings).
  if (product.rating && product.rating.count > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingCount: product.rating.count,
      ratingValue: product.rating.stars,
    };
  }
  return node;
}

/** `<[^>]*>`, built from char codes (PLAN-final 2.3, last bullet). */
const TAGS = new RegExp(
  String.fromCharCode(60, 91, 94, 62, 93) + String.fromCharCode(42, 62),
  'g'
);

/** The route's `extend`, with the FAQ rows injected so the branch is exercised. */
function buildDocument(product: ProductType, rows = FAQ_ROWS) {
  const pathname = '/p' + product.id;
  const result = {
    title: product.name,
    canonical: product.url,
    jsonLd: engineProductNode(product) as Record<string, unknown>,
  };
  const origin = tryOriginOf(settings.store.url) as string;
  const canonical = canonicalFor(origin, null, pathname);
  const engineNodes = result.jsonLd
    ? Array.isArray(result.jsonLd)
      ? result.jsonLd
      : [result.jsonLd]
    : [];
  const nodes = engineNodes.map((node) => {
    const { '@context': _context, ...rest } = node as Record<string, unknown>;
    return rest;
  });
  if (rows.length > 0) nodes.push(faqPage(rows, canonical));
  if (variantOf(product.type) === 'service') nodes.push(service(product));
  // What the route's `extend` puts in `jsonLd`: ONE document, because the head
  // adapter stringifies the whole value into a single script
  // (theme-engine chunk-4D44TJ72.js:93-95).
  const routeDoc = nodes.length > 0 ? graph(...nodes) : undefined;
  // The engine Breadcrumb renders its BreadcrumbList in a script of its own
  // (ES 9.2:1097-1099); the route never emits a second one. `pageDoc` is every
  // node the page ends up publishing, which is what the fixtures record.
  const crumbs = breadcrumbList([
    { name: 'الرئيسية', url: ORIGIN + '/' },
    { name: product.name, url: product.url },
  ]);
  return {
    head: { ...result, robots: robots(false), canonical, jsonLd: routeDoc },
    routeDoc,
    pageDoc: graph(crumbs, ...nodes),
  };
}

const VARIANTS: { file: string; product: ProductType }[] = [
  { file: 'b3-product.json', product: makeProduct() },
  {
    file: 'b3-food.json',
    product: makeProduct({ id: 1497955814, type: 'food', sku: 'OX-037', calories: 220 }),
  },
  {
    file: 'b3-bundle.json',
    product: makeProduct({ id: 1141798217, type: 'group_products', sku: 'OX-041' }),
  },
  {
    file: 'b3-digital.json',
    product: makeProduct({ id: 702549495, type: 'digital', sku: 'OX-042', is_require_shipping: false }),
  },
  {
    file: 'b3-giftcard.json',
    product: makeProduct({ id: 662137586, type: 'codes', sku: 'OX-043', is_require_shipping: false }),
  },
  {
    file: 'b3-service.json',
    product: makeProduct({ id: 487045117, type: 'service', sku: 'OX-045', is_require_shipping: false }),
  },
];

function typesOf(doc: Record<string, unknown> | undefined): string[] {
  if (!doc) return [];
  const nodes = (doc['@graph'] ?? []) as Record<string, unknown>[];
  return nodes.map((node) => String(node['@type']));
}

describe('PDP JSON-LD', () => {
  for (const variant of VARIANTS) {
    describe(variant.file, () => {
      const { head, routeDoc, pageDoc } = buildDocument(variant.product);

      it('emits exactly one Product node and exactly one BreadcrumbList', () => {
        const types = typesOf(pageDoc);
        expect(types.filter((type) => type === 'Product')).toHaveLength(1);
        expect(types.filter((type) => type === 'BreadcrumbList')).toHaveLength(1);
      });

      it('hands the head ONE document, not a bare array of nodes', () => {
        // The adapter stringifies `jsonLd` whole into one script, so an array
        // would leave every node after the first without an `@context`.
        expect(Array.isArray(head.jsonLd)).toBe(false);
        expect(routeDoc).toBeDefined();
        expect(routeDoc?.['@context']).toBe('https://schema.org');
        expect(Array.isArray(routeDoc?.['@graph'])).toBe(true);
      });

      it('carries exactly one @context, at the document and never on a node', () => {
        const text = JSON.stringify(routeDoc);
        expect(text.split('"@context"')).toHaveLength(2);
        const nodes = (routeDoc?.['@graph'] ?? []) as Record<string, unknown>[];
        for (const node of nodes) expect(node['@context']).toBeUndefined();
      });

      it('parses as a JSON-LD document a consumer can read', () => {
        const parsed = JSON.parse(JSON.stringify(routeDoc)) as Record<string, unknown>;
        expect(parsed['@context']).toBe('https://schema.org');
        const nodes = parsed['@graph'] as Record<string, unknown>[];
        expect(nodes.length).toBeGreaterThan(0);
        for (const node of nodes) expect(typeof node['@type']).toBe('string');
      });

      it('matches the committed fixture', () => {
        const file = path.join(FIXTURE_DIR, variant.file);
        expect(fs.existsSync(file), file).toBe(true);
        const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
        expect(typesOf(fixture)).toEqual(typesOf(pageDoc));
        expect(findDuplicateKeys(fs.readFileSync(file, 'utf8'))).toEqual([]);
      });

      it('is indexable, with a canonical that equals the served URL', () => {
        expect(head.robots).toBe('index, follow');
        expect(head.canonical).toBe(ORIGIN + '/p' + variant.product.id);
      });
    });
  }

  it('adds a Service node for a service and for a booking, and for nothing else', () => {
    for (const type of ['service', 'booking']) {
      const { routeDoc } = buildDocument(makeProduct({ type: type as ProductType['type'] }));
      expect(typesOf(routeDoc), type).toContain('Service');
    }
    for (const type of ['product', 'food', 'digital', 'codes', 'group_products']) {
      const { routeDoc } = buildDocument(makeProduct({ type: type as ProductType['type'] }));
      expect(typesOf(routeDoc), type).not.toContain('Service');
    }
  });

  it('omits the FAQPage entirely when the content map has no rows', () => {
    const { routeDoc } = buildDocument(makeProduct(), []);
    expect(typesOf(routeDoc)).not.toContain('FAQPage');
  });

  it('never invents an aggregateRating for a product with no reviews', () => {
    const { routeDoc } = buildDocument(makeProduct());
    const product = ((routeDoc?.['@graph'] ?? []) as Record<string, unknown>[]).find(
      (node) => node['@type'] === 'Product'
    );
    expect(product?.aggregateRating).toBeUndefined();
    expect(product?.review).toBeUndefined();
  });
});
