import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import type { BlogSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { articleHeadExtend, commerceHeadExtend } from '../../app/components/commerce/head';
import { findDuplicateKeys } from '../../scripts/check-jsonld.mjs';

/**
 * The commerce head extensions, built the way the routes build them: the
 * engine's own `head` supplies title, description and OG, and our `extend`
 * applies the C12 canonical correction, the robots rule and, on an article,
 * the Article node. The fixture in tests/fixtures/jsonld is the document that
 * composition produces, and `pnpm check:jsonld` scans it for duplicate keys.
 */
const ORIGIN = 'https://optimalx.com.sa';
const FIXTURE_DIR = path.join('tests', 'fixtures', 'jsonld');

function context(pathname: string, multilingual = false) {
  return {
    settings: { store: { url: `${ORIGIN}/`, settings: { is_multilingual: multilingual } } },
    location: { pathname },
    locale: 'ar',
  } as never;
}

function engineHead(title: string, canonical: string): HeadDescriptor {
  return {
    title,
    description: `${title} description`,
    canonical,
    openGraph: { type: 'website', title, url: canonical },
    alternateLanguages: [{ hreflang: 'ar', href: `${ORIGIN}/ar` }],
  };
}

function articleData(): BlogSinglePageProps {
  return {
    page: { title: 'متى آخذ الكرياتين', slug: 'blog.single' },
    article: {
      id: '12',
      name: 'متى آخذ الكرياتين وكيف أستخدمه بالطريقة الصحيحة',
      description: 'لا يوجد وقت حاسم لأخذ الكرياتين.',
      image: `${ORIGIN}/images/creatine.jpg`,
      url: `${ORIGIN}/guides/how-to-take-creatine/a12`,
      author: { name: 'اوبتيمال اكس', url: `${ORIGIN}/blog/author/1` },
      created_at: '2026-09-01T00:00:00Z',
    },
    related: [],
  } as unknown as BlogSinglePageProps;
}

describe('commerceHeadExtend', () => {
  it('marks the cart and the thank-you page noindex, follow', () => {
    const result = commerceHeadExtend({ noindex: true })(
      engineHead('سلة التسوق', `${ORIGIN}/cart`),
      context('/cart')
    );
    expect(result.robots).toBe('noindex, follow');
  });

  it('marks the guides and the static pages index, follow', () => {
    const result = commerceHeadExtend()(engineHead('الأدلة', `${ORIGIN}/blog`), context('/blog'));
    expect(result.robots).toBe('index, follow');
  });

  it('drops the hreflang cluster on a single-language store', () => {
    const result = commerceHeadExtend()(engineHead('الأدلة', `${ORIGIN}/blog`), context('/blog'));
    expect(result.alternateLanguages).toBeUndefined();
    expect(result.canonical).toBe(`${ORIGIN}/blog`);
  });

  it('prefixes the canonical with the locale on a multilingual store (C12)', () => {
    const result = commerceHeadExtend()(
      engineHead('الأدلة', `${ORIGIN}/blog`),
      context('/ar/blog', true)
    );
    expect(result.canonical).toBe(`${ORIGIN}/ar/blog`);
    expect(result.openGraph?.url).toBe(`${ORIGIN}/ar/blog`);
    expect(result.alternateLanguages).toHaveLength(1);
  });

  it('carries the /en prefix at locale en on a multilingual store', () => {
    const result = commerceHeadExtend()(
      engineHead('Guides', `${ORIGIN}/blog`),
      { ...context('/en/blog', true), locale: 'en' } as never
    );
    expect(result.canonical).toBe(`${ORIGIN}/en/blog`);
    expect(result.openGraph?.url).toBe(`${ORIGIN}/en/blog`);
  });

  it('emits no JSON-LD of its own', () => {
    const result = commerceHeadExtend()(engineHead('سياسة', `${ORIGIN}/x/page-1`), context('/x/page-1'));
    expect(result.jsonLd).toBeUndefined();
  });
});

describe('articleHeadExtend', () => {
  const descriptor = articleHeadExtend()(
    engineHead('متى آخذ الكرياتين', `${ORIGIN}/guides/how-to-take-creatine/a12`),
    context('/guides/how-to-take-creatine/a12'),
    articleData()
  );

  it('emits one @graph document, never a bare array', () => {
    const doc = descriptor.jsonLd as Record<string, unknown>;
    expect(doc['@context']).toBe('https://schema.org');
    expect(Array.isArray(doc['@graph'])).toBe(true);
  });

  it('carries exactly one Article node and no BreadcrumbList (C11)', () => {
    const nodes = (descriptor.jsonLd as { '@graph': Array<{ '@type': string }> })['@graph'];
    expect(nodes.filter((node) => node['@type'] === 'Article')).toHaveLength(1);
    expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(false);
  });

  it('publishes no node for an article without a URL', () => {
    const data = articleData();
    (data.article as { url?: string }).url = undefined;
    const result = articleHeadExtend()(
      engineHead('x', `${ORIGIN}/blog`),
      context('/blog'),
      data
    );
    expect(result.jsonLd).toBeUndefined();
  });

  it('writes the fixture check:jsonld scans', () => {
    const file = path.join(FIXTURE_DIR, 'b6-article.json');
    const text = `${JSON.stringify(descriptor.jsonLd, null, 2)}\n`;
    fs.mkdirSync(FIXTURE_DIR, { recursive: true });
    fs.writeFileSync(file, text, 'utf8');
    expect(findDuplicateKeys(text)).toEqual([]);
  });
});
