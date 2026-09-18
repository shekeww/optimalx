import { describe, it, expect } from 'vitest';
import type { Store, Product } from '@salla.sa/twilight-theme-engine/types';
import type { ArticleDetail } from '@salla.sa/twilight-theme-engine/routes';
import {
  organization,
  website,
  localBusiness,
  breadcrumbList,
  itemList,
  faqPage,
  article,
  service,
  graph,
} from '../../app/components/seo/jsonld';
import { findDuplicateKeys } from '../../scripts/check-jsonld.mjs';

const store = {
  id: 1,
  name: 'اوبتيمال اكس',
  url: 'https://optimalx.sa/',
  logo: 'https://cdn.salla.sa/logo.png',
  description: 'مكملات غذائية',
  contacts: { email: 'hi@optimalx.sa', phone: '0500000000' },
  social: { instagram: 'https://instagram.com/optimalx', twitter: '' },
} as unknown as Store;

const product = {
  id: 7,
  name: 'استشارة تغذية',
  description: '<p>جلسة 30 دقيقة</p>',
  url: 'https://optimalx.sa/ar/consult/p7',
  type: 'service',
  price: 150,
  currency: 'SAR',
  image: { url: 'https://cdn.salla.sa/p7.jpg' },
} as unknown as Product;

const detail = {
  id: 'a1',
  name: 'دليل البروتين',
  description: 'كم تحتاج يوميا',
  image: 'https://cdn.salla.sa/a1.jpg',
  url: 'https://optimalx.sa/ar/blog/protein/a-1',
  author: { name: 'فريق اوبتيمال اكس', url: 'https://optimalx.sa/ar/blog/author/1' },
  created_at: '2026-09-01',
} as unknown as ArticleDetail;

const builders: Record<string, () => Record<string, unknown>> = {
  organization: () => organization({ store, sameAs: [store.social.instagram] }),
  website: () => website({ store, searchUrl: 'https://optimalx.sa/ar/search' }),
  localBusiness: () =>
    localBusiness({
      store,
      branch: {
        address: 'المدينة المنورة، حي العزيزية',
        hours: ['Sa-Th 16:00-23:00'],
        phone: '0500000000',
        geo: { latitude: 24.46276125, longitude: 39.653138015 },
      },
    }),
  breadcrumbList: () =>
    breadcrumbList([
      { name: 'الرئيسية', url: 'https://optimalx.sa/ar' },
      { name: 'بروتين', url: 'https://optimalx.sa/ar/protein/c1' },
    ]),
  itemList: () => itemList([product], 'https://optimalx.sa/ar/protein/c1'),
  faqPage: () =>
    faqPage(
      [{ question: 'هل المنتج اصلي؟', answer: 'نعم، من الموزع المعتمد.' }],
      'https://optimalx.sa/ar/protein/c1'
    ),
  article: () => article(detail),
  service: () => service(product),
};

describe('jsonld builders', () => {
  for (const [name, build] of Object.entries(builders)) {
    it(`${name} serialises without duplicate keys`, () => {
      const json = JSON.stringify(build(), null, 2);
      expect(findDuplicateKeys(json)).toEqual([]);
    });
  }

  it('gives every node a stable @id derived from the store origin or the page url', () => {
    expect(organization({ store })['@id']).toBe('https://optimalx.sa/#organization');
    expect(website({ store, searchUrl: 'https://optimalx.sa/ar/search' })['@id']).toBe(
      'https://optimalx.sa/#website'
    );
    expect(service(product)['@id']).toBe('https://optimalx.sa/ar/consult/p7#service');
    expect(article(detail)['@id']).toBe('https://optimalx.sa/ar/blog/protein/a-1#article');
  });

  it('website search action targets the search url with a q placeholder', () => {
    const node = website({ store, searchUrl: 'https://optimalx.sa/ar/search' });
    const action = node.potentialAction as { target: string; 'query-input': string };
    expect(action.target).toBe('https://optimalx.sa/ar/search?q={q}');
    expect(action['query-input']).toBe('required name=q');
  });

  it('service carries raw numbers and a currency code, never formatted money', () => {
    const offers = service(product).offers as { price: number; priceCurrency: string };
    expect(offers.price).toBe(150);
    expect(offers.priceCurrency).toBe('SAR');
  });

  it('graph wraps nodes in a single @context', () => {
    const doc = graph(organization({ store }), website({ store, searchUrl: 'https://x/s' }));
    expect(doc['@context']).toBe('https://schema.org');
    expect((doc['@graph'] as unknown[]).length).toBe(2);
    expect(findDuplicateKeys(JSON.stringify(doc))).toEqual([]);
  });
});

describe('check-jsonld scanner', () => {
  it('flags a duplicate key at the token level, with its path', () => {
    const findings = findDuplicateKeys('{"a":{"b":1,"c":[{"d":1,"d":2}],"b":3}}');
    expect(findings.map((f) => f.path)).toEqual(['a.c[0].d', 'a.b']);
  });

  it('does not flag the same key on sibling objects or escaped lookalikes', () => {
    expect(findDuplicateKeys('[{"x":1},{"x":2}]')).toEqual([]);
    expect(findDuplicateKeys('{"a\\"":1,"a":2}')).toEqual([]);
  });
});
