import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { HOME_FAQ, PRICE_FAQ } from '../../app/content/faq';
import { ROOT_CATEGORY_SLUGS } from '../../app/content/categories';

const ar = loadDictionary('ar');

/**
 * The blocks whose contract is a gate: what hides them, and what they fall back
 * to while the store is still being filled in.
 */

const articles: { id: string; name: string; url: string; author: { name: string; url: string } }[] = [];
const categories: unknown[] = [];
const brandGroups: Record<string, unknown[]> = {};
const productList = vi.fn(async () => ({ items: [], next: null }));

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({ product }: { product: { name?: string } }) =>
    React.createElement('article', { 'data-testid': 'engine-product-card' }, product.name),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: (params: unknown) => productList(params as never) },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => categories }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/brands', () => ({
  brand: { queries: { list: () => ({ queryKey: ['brands'], queryFn: async () => brandGroups }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/routes/blog', () => ({
  Blog: { loader: async () => ({ articles }) },
}));

const { OxFaq } = await import('../../app/components/home/OxFaq');
const { OxGuides } = await import('../../app/components/home/OxGuides');
const { OxBrands } = await import('../../app/components/home/OxBrands');
const { OxBanner } = await import('../../app/components/home/OxBanner');
const { OxProducts, resolveSource } = await import('../../app/components/home/OxProducts');

function data(path: keyof typeof HOME_BLOCK_FIELDS, extra: Record<string, unknown> = {}): OxBlockData {
  return { path, key: `t-${path}`, ...HOME_BLOCK_FIELDS[path], ...extra } as OxBlockData;
}

function article(id: string) {
  return { id, name: `دليل ${id}`, url: `/blog/a-${id}`, author: { name: 'اوبتيمال اكس', url: '/about' } };
}

describe('OxFaq', () => {
  it('opens with the price question, which is mandatory (DIRECTION 5.4)', () => {
    const { container } = renderWithProviders(<OxFaq data={data('ox-faq')} />);
    const rows = container.querySelectorAll('.ox-acc__row');
    expect(rows).toHaveLength(HOME_FAQ.length);
    expect(rows[0].id).toBe(PRICE_FAQ.id);
    expect(rows[0].textContent).toContain(ar[PRICE_FAQ.qKey]);
  });

  it('puts the rows in a panel, which is the unit for structured content', () => {
    const { container } = renderWithProviders(<OxFaq data={data('ox-faq')} />);
    const panel = container.querySelector('.ox-faq__panel');
    expect(panel?.classList.contains('ox-panel')).toBe(true);
    expect(panel?.querySelector('.ox-acc')).not.toBeNull();
  });

  it('keeps the price question first even when the merchant writes their own rows', () => {
    const { container } = renderWithProviders(
      <OxFaq data={data('ox-faq', { items: [{ 'items.q': 'سؤال التاجر', 'items.a': 'جواب التاجر' }] })} />
    );
    const rows = container.querySelectorAll('.ox-acc__row');
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe(PRICE_FAQ.id);
    expect(rows[1].textContent).toContain('سؤال التاجر');
  });
});

describe('OxGuides', () => {
  it('stays hidden while the blog has fewer than three articles', async () => {
    articles.length = 0;
    articles.push(article('1'), article('2'));
    const { container } = renderWithProviders(<OxGuides data={data('ox-guides')} />);
    await waitFor(() => expect(productList).toBeDefined());
    expect(container.querySelector('[data-testid="ox-guides"]')).toBeNull();
  });

  it('renders three cards once the blog has three articles', async () => {
    articles.length = 0;
    articles.push(article('1'), article('2'), article('3'), article('4'));
    renderWithProviders(<OxGuides data={data('ox-guides')} />);
    await waitFor(() => expect(screen.getByTestId('ox-guides')).toBeTruthy());
    expect(screen.getAllByTestId('ox-guide-card')).toHaveLength(3);
  });
});

describe('OxBrands', () => {
  it('hides the strip under four brands', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [{ id: '1', name: 'A', url: '/a', logo: '' }];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(container).toBeTruthy());
    expect(container.querySelector('[data-testid="ox-brands"]')).toBeNull();
  });

  it('renders the strip from four brands up', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [1, 2, 3, 4].map((n) => ({ id: String(n), name: `B${n}`, url: `/b${n}`, logo: '' }));
    renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});

describe('OxBanner', () => {
  it('renders nothing at all with no image and no line', () => {
    const { container } = renderWithProviders(<OxBanner data={data('ox-banner')} />);
    expect(container.querySelector('[data-testid="ox-banner"]')).toBeNull();
  });

  it('is one link carrying the dark band when the merchant fills it', () => {
    renderWithProviders(<OxBanner data={data('ox-banner', { line: 'حملة', url: '/offers' })} />);
    const banner = screen.getByTestId('ox-banner');
    expect(banner.querySelectorAll('a')).toHaveLength(1);
    expect(banner.querySelector('a')?.getAttribute('href')).toBe('/offers');
    // The reference's campaign band is a dark band with the wedge pair at its
    // start corner, not the flat plate strip this block used to draw.
    expect(banner.querySelectorAll('.ox-band__wedge')).toHaveLength(2);
    expect(banner.querySelector('.ox-campaign__line')?.textContent).toBe('حملة');
  });

  it('never prints a discount figure of its own', () => {
    renderWithProviders(
      <OxBanner data={data('ox-banner', { line: 'حملة', url: '/offers', image: 'https://cdn.example/c.jpg' })} />
    );
    // The reference draws a medallion reading "up to 40%". No field carries
    // that number and no store data supplies it, so the band has no element
    // for it: a merchant asserting a figure does it in their own artwork.
    expect(screen.getByTestId('ox-banner').textContent).not.toMatch(/[0-9]+%/);
  });
});

describe('OxProducts', () => {
  it('asks for the latest products under the deferred-bestseller rule', async () => {
    productList.mockClear();
    productList.mockResolvedValueOnce({ items: [{ id: 1, name: 'واي بروتين' }], next: null } as never);
    renderWithProviders(<OxProducts data={data('ox-products')} />);
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(productList.mock.calls[0][0]).toMatchObject({ source: 'latest', perPage: 8 });
    expect(screen.getByTestId('ox-products').textContent).toContain('أحدث المنتجات');
  });

  it('paints no empty rail when the store has no products yet', async () => {
    productList.mockClear();
    const { container } = renderWithProviders(<OxProducts data={data('ox-products')} />);
    await waitFor(() => expect(productList).toHaveBeenCalled());
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-products-slider"]')).toBeNull()
    );
  });

  it('reads both shapes of the products field', () => {
    expect(resolveSource(data('ox-products'))).toEqual({ source: 'latest' });
    expect(resolveSource(data('ox-products', { products: [{ id: 3 }, { id: 4 }] }))).toEqual({
      source: 'selected',
      sourceValue: [3, 4],
    });
    expect(
      resolveSource(data('ox-products', { products: { source: 'categories', source_value: 9 } }))
    ).toEqual({ source: 'categories', sourceValue: 9 });
  });
});
