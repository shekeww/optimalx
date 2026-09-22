import { describe, expect, it } from 'vitest';
import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import {
  blogHeadExtend,
  brandHeadExtend,
  categoriesHeadExtend,
  homeHeadExtend,
  paginationCanonical,
  productHeadExtend,
} from '../../app/components/seo/routeHeads';
import { articleHeadExtend } from '../../app/components/commerce/head';
import { createT } from '../helpers/i18n';

/**
 * The route heads `app/components/seo/routeHeads.ts` shares across the home,
 * product, brand, blog and `/categories` routes (PLAN-ship Batch S3, "Files
 * new: routeHeads.ts"). One `en` case per builder (brief-S3-S6-2026-09-22.md,
 * "English: add one test per head builder with `locale: 'en'`") so the
 * `/en/...` render is exercised in the build, not only by a manual curl.
 */

const ORIGIN = 'https://optimalx.com.sa';
const tAr = createT('ar');
const tEn = createT('en');

function ctx(pathname: string, locale: 'ar' | 'en' = 'ar', multilingual = false) {
  return {
    settings: { store: { url: `${ORIGIN}/`, settings: { is_multilingual: multilingual } } },
    location: { pathname },
    locale,
  } as never;
}

function engineHead(title: string, canonical: string): HeadDescriptor {
  return {
    title,
    description: `Browse ${title}`,
    canonical,
    openGraph: { type: 'website', title, description: `Browse ${title}`, url: canonical },
    twitter: { card: 'summary_large_image', title, description: `Browse ${title}` },
  };
}

describe('homeHeadExtend', () => {
  it('replaces the title and description with the researched H01 pair (ar)', () => {
    const result = homeHeadExtend()(engineHead('Home', `${ORIGIN}/`), ctx('/'));
    expect(result.title).toBe(tAr('ox.seo.home.title'));
    expect(result.description).toBe(tAr('ox.seo.home.description'));
    expect(result.canonical).toBe(`${ORIGIN}/`);
  });

  it('serves the English H01 pair and the /en canonical at locale en', () => {
    const result = homeHeadExtend()(
      engineHead('Home', `${ORIGIN}/en/`),
      ctx('/en/', 'en', true)
    );
    expect(result.title).toBe(tEn('ox.seo.home.title'));
    expect(result.description).toBe(tEn('ox.seo.home.description'));
    expect(result.canonical).toBe(`${ORIGIN}/en/`);
  });
});

describe('categoriesHeadExtend', () => {
  const options = {
    path: '/categories',
    titleKey: 'ox.tax.index.title',
    descriptionKey: 'ox.tax.index.description',
  };

  it('adds a CollectionPage node built from the page title and description (ar)', () => {
    const result = categoriesHeadExtend(options)(ctx('/categories'));
    expect(result.title).toBe(tAr('ox.tax.index.title'));
    const doc = result.jsonLd as Record<string, unknown>;
    const nodes = doc['@graph'] as Record<string, unknown>[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      '@type': 'CollectionPage',
      '@id': `${ORIGIN}/categories#webpage`,
      name: tAr('ox.tax.index.title'),
      description: tAr('ox.tax.index.description'),
    });
  });

  it('builds the same CollectionPage at locale en, on the /en canonical', () => {
    const result = categoriesHeadExtend(options)(ctx('/en/categories', 'en', true));
    const doc = result.jsonLd as Record<string, unknown>;
    const [node] = doc['@graph'] as Record<string, unknown>[];
    expect(node['@id']).toBe(`${ORIGIN}/en/categories#webpage`);
    expect(node.name).toBe(tEn('ox.tax.index.title'));
  });
});

function listingData(overrides: Partial<ProductListLoaderData> = {}): ProductListLoaderData {
  return {
    page: { title: 'Optimum Nutrition', slug: 'brands.show', breadcrumbs: [] },
    source: {
      type: 'brands',
      value: '5',
      entity: { id: 5, name: 'Optimum Nutrition', url: `${ORIGIN}/brands/5` },
    },
    query: { sort: 'ourSuggest' },
    products: [],
    pagination: { next: null },
    ...overrides,
  } as ProductListLoaderData;
}

describe('brandHeadExtend', () => {
  it('rebuilds the title from the researched brand pattern (ar)', () => {
    const result = brandHeadExtend()(
      engineHead('Optimum Nutrition', `${ORIGIN}/brands/5`),
      ctx('/brands/5'),
      listingData()
    );
    expect(result.title).toBe(tAr('ox.seo.brand.title_pattern').replace('{{brand}}', 'Optimum Nutrition'));
  });

  it('rebuilds the title from the English brand pattern at locale en', () => {
    const result = brandHeadExtend()(
      engineHead('Optimum Nutrition', `${ORIGIN}/en/brands/5`),
      ctx('/en/brands/5', 'en'),
      listingData()
    );
    expect(result.title).toBe(tEn('ox.seo.brand.title_pattern').replace('{{brand}}', 'Optimum Nutrition'));
  });
});

describe('blogHeadExtend', () => {
  it('is the same function as commerce/head.ts articleHeadExtend', () => {
    expect(blogHeadExtend).toBe(articleHeadExtend);
  });
});

describe('paginationCanonical (re-exported for Contract E callers)', () => {
  it('is the function listing/head.ts implements', () => {
    expect(paginationCanonical(`${ORIGIN}/x`, { page: 2 })).toEqual({
      canonical: `${ORIGIN}/x?page=2`,
      noindexExtra: false,
    });
  });
});

function makeProduct(overrides: Partial<ProductPageProps['product']> = {}): ProductPageProps['product'] {
  return {
    id: 1996831868,
    name: 'Gold Standard Whey',
    description: '<p>Whey protein.</p>',
    url: `${ORIGIN}/p1996831868`,
    type: 'product',
    price: 240,
    sale_price: 0,
    starting_price: 240,
    currency: 'SAR',
    is_on_sale: false,
    is_available: true,
    is_out_of_stock: false,
    category: { url: `${ORIGIN}/whey-protein/c1` },
    ...overrides,
  } as ProductPageProps['product'];
}

function productData(overrides: Partial<ProductPageProps> = {}): ProductPageProps {
  return {
    page: {
      title: 'Gold Standard Whey',
      slug: 'p1996831868',
      parent: { id: 1, name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c1` },
      breadcrumbs: [
        { name: 'الرئيسية', url: '/' },
        { name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c1` },
        { name: 'Gold Standard Whey', url: `${ORIGIN}/p1996831868` },
      ],
    },
    product: makeProduct(),
    ...overrides,
  } as ProductPageProps;
}

function productEngineHead(canonical: string): HeadDescriptor {
  return {
    title: 'Gold Standard Whey',
    canonical,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Gold Standard Whey',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'SAR' },
    },
  };
}

describe('productHeadExtend', () => {
  it('adds a BreadcrumbList from page.breadcrumbs and corrects the zero sale_price (ar)', () => {
    const canonical = `${ORIGIN}/p1996831868`;
    const result = productHeadExtend()(productEngineHead(canonical), ctx('/p1996831868'), productData());
    const doc = result.jsonLd as Record<string, unknown>;
    const nodes = doc['@graph'] as Record<string, unknown>[];
    const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    expect(crumbs).toBeDefined();
    expect((crumbs?.itemListElement as unknown[]).length).toBe(3);
    const product = nodes.find((node) => node['@type'] === 'Product');
    expect((product?.offers as Record<string, unknown>).price).toBe(240);
    expect(result.robots).toBe('index, follow');
  });

  it('adds a Service node for a service product', () => {
    const result = productHeadExtend()(
      productEngineHead(`${ORIGIN}/p1`),
      ctx('/p1'),
      productData({ product: makeProduct({ type: 'service' }) })
    );
    const nodes = (result.jsonLd as Record<string, unknown>)['@graph'] as Record<string, unknown>[];
    expect(nodes.some((node) => node['@type'] === 'Service')).toBe(true);
  });

  it('builds the same graph at locale en, on the /en canonical', () => {
    const result = productHeadExtend()(
      productEngineHead(`${ORIGIN}/en/p1996831868`),
      ctx('/en/p1996831868', 'en', true),
      productData()
    );
    expect(result.canonical).toBe(`${ORIGIN}/en/p1996831868`);
    const nodes = (result.jsonLd as Record<string, unknown>)['@graph'] as Record<string, unknown>[];
    expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(true);
  });
});
