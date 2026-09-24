// Unit tests for scripts/lang-overlay.mjs, the pure helpers
// scripts/serve-store.mjs uses to answer `accept-language: en` (S9f).
// Every function here is synchronous and takes plain data, so none of
// these tests touch the filesystem or start the mock's HTTP server.
import { describe, expect, it } from 'vitest';
import {
  overlayProduct,
  overlayProducts,
  overlayDetails,
  slugFromCategoryUrl,
  buildCategoryNameMap,
  overlayCategory,
  overlayCategories,
  overlayMenuItem,
  overlayMenus,
  resolveLang,
} from '../../scripts/lang-overlay.mjs';

describe('overlayProduct / overlayProducts / overlayDetails', () => {
  const overlay = {
    '1': { name: 'Whey Protein', subtitle: '24 g protein', description: '<p>English</p>' },
  };

  it('overlays a product with a twin, leaves everything else on the product untouched', () => {
    const product = { id: 1, name: 'بروتين', subtitle: 'ذيل', description: '<p>عربي</p>', price: 349, sku: 'OX-001' };
    const result = overlayProduct(product, overlay);
    expect(result).toEqual({
      id: 1,
      name: 'Whey Protein',
      subtitle: '24 g protein',
      description: '<p>English</p>',
      price: 349,
      sku: 'OX-001',
    });
  });

  it('leaves a product with no twin exactly as it was (never invented)', () => {
    const product = { id: 999, name: 'كرياتين', subtitle: 'ذيل', description: '<p>عربي</p>' };
    expect(overlayProduct(product, overlay)).toEqual(product);
  });

  it('overlayProducts maps every item in a products.json-shaped array', () => {
    const products = [
      { id: 1, name: 'بروتين', subtitle: 'ذيل', description: '<p>عربي</p>' },
      { id: 2, name: 'كرياتين', subtitle: 'ذيل', description: '<p>عربي</p>' },
    ];
    const result = overlayProducts(products, overlay);
    expect(result[0].name).toBe('Whey Protein');
    expect(result[1].name).toBe('كرياتين');
  });

  it('overlayDetails maps every value of a product-details.json-shaped object, keeping its id keys', () => {
    const details = {
      '1': { id: 1, name: 'بروتين', subtitle: 'ذيل', description: '<p>عربي</p>' },
      '2': { id: 2, name: 'كرياتين', subtitle: 'ذيل', description: '<p>عربي</p>' },
    };
    const result = overlayDetails(details, overlay);
    expect(Object.keys(result)).toEqual(['1', '2']);
    expect(result['1'].name).toBe('Whey Protein');
    expect(result['2'].name).toBe('كرياتين');
  });
});

describe('slugFromCategoryUrl', () => {
  it('reads the slug before the numeric c<id> segment', () => {
    expect(slugFromCategoryUrl('https://optimalx.com.sa/whey-protein/c9011')).toBe('whey-protein');
    expect(slugFromCategoryUrl('https://optimalx.com.sa/protein/c9001')).toBe('protein');
  });

  it('returns null for a URL that does not match the pattern', () => {
    expect(slugFromCategoryUrl('https://optimalx.com.sa/p123456')).toBeNull();
    expect(slugFromCategoryUrl(undefined)).toBeNull();
  });
});

describe('buildCategoryNameMap', () => {
  const taxonomy = {
    nodes: [
      { slug: 'protein', key: 'protein' },
      { slug: 'whey-protein', key: 'whey_protein' },
      { slug: 'no-locale-key', key: 'ghost' },
    ],
  };
  const enLocale = { 'ox.tax.protein.name': 'Protein', 'ox.tax.whey_protein.name': 'Whey Protein' };

  it('maps slug -> English name for every node with a locale key', () => {
    const map = buildCategoryNameMap(taxonomy, enLocale);
    expect(map.get('protein')).toBe('Protein');
    expect(map.get('whey-protein')).toBe('Whey Protein');
  });

  it('never invents a name for a node with no matching locale key', () => {
    const map = buildCategoryNameMap(taxonomy, enLocale);
    expect(map.has('no-locale-key')).toBe(false);
  });
});

describe('overlayCategory / overlayCategories', () => {
  const nameMap = new Map([
    ['protein', 'Protein'],
    ['whey-protein', 'Whey Protein'],
  ]);

  it('swaps name to English by slug and recurses into sub_categories', () => {
    const category = {
      id: 9001,
      name: 'بروتين',
      url: 'https://optimalx.com.sa/protein/c9001',
      sub_categories: [{ id: 9011, name: 'واي بروتين', url: 'https://optimalx.com.sa/whey-protein/c9011', sub_categories: [] }],
    };
    const result = overlayCategory(category, nameMap);
    expect(result.name).toBe('Protein');
    expect(result.sub_categories[0].name).toBe('Whey Protein');
  });

  it('leaves a category with no mapped slug unchanged', () => {
    const category = { id: 9099, name: 'غير معروف', url: 'https://optimalx.com.sa/unknown/c9099', sub_categories: [] };
    expect(overlayCategory(category, nameMap).name).toBe('غير معروف');
  });

  it('overlayCategories maps a top-level list', () => {
    const list = [{ id: 9001, name: 'بروتين', url: 'https://optimalx.com.sa/protein/c9001', sub_categories: [] }];
    expect(overlayCategories(list, nameMap)[0].name).toBe('Protein');
  });
});

describe('overlayMenuItem / overlayMenus', () => {
  const nameMap = new Map([['protein', 'Protein']]);

  it('swaps title (not name) and recurses into children', () => {
    const item = {
      id: 9001,
      title: 'بروتين',
      url: 'https://optimalx.com.sa/protein/c9001',
      children: [{ id: 9011, title: 'غير معروف', url: 'https://optimalx.com.sa/unknown/c9011', children: [] }],
    };
    const result = overlayMenuItem(item, nameMap);
    expect(result.title).toBe('Protein');
    expect(result.children[0].title).toBe('غير معروف');
  });

  it('overlayMenus maps every slot (header/footer)', () => {
    const menus = {
      header: [{ id: 9001, title: 'بروتين', url: 'https://optimalx.com.sa/protein/c9001', children: [] }],
      footer: [],
    };
    const result = overlayMenus(menus, nameMap);
    expect(result.header[0].title).toBe('Protein');
    expect(result.footer).toEqual([]);
  });
});

describe('resolveLang', () => {
  it('reads en from the accept-language header', () => {
    expect(resolveLang('en', null)).toBe('en');
    expect(resolveLang('en-US,en;q=0.9', null)).toBe('en');
  });

  it('defaults everything else, including a missing header, to ar', () => {
    expect(resolveLang('ar', null)).toBe('ar');
    expect(resolveLang(undefined, null)).toBe('ar');
    expect(resolveLang(null, null)).toBe('ar');
  });

  it('a ?lang= query overrides the header', () => {
    expect(resolveLang('ar', 'en')).toBe('en');
    expect(resolveLang('en', 'ar')).toBe('ar');
  });
});
