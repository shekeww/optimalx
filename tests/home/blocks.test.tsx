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
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
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
const { OxCategories } = await import('../../app/components/home/OxCategories');
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
  it('hides the strip with zero brands', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(container).toBeTruthy());
    expect(container.querySelector('[data-testid="ox-brands"]')).toBeNull();
  });

  it('renders the strip from one brand up (owner call, 2026-09-22: was four)', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [{ id: '1', name: 'A', url: '/a', logo: '' }];
    renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('renders the strip from four brands up too', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [1, 2, 3, 4].map((n) => ({ id: String(n), name: `B${n}`, url: `/b${n}`, logo: '' }));
    renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  // Owner brief 2026-09-24, item 1(a): no section eyebrow, so the heading
  // carries the same size and spacing as `OxCategories`' own header (neither
  // passes one now).
  it('carries no eyebrow above its title (hierarchy, item 1(a))', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [{ id: '1', name: 'A', url: '/a', logo: '' }];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(container.querySelector('.ox-sh__eyebrow')).toBeNull();
  });

  it('sorts by product count, heaviest first (owner review 2026-09-23 (late), item 4)', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [
      { id: '1', name: 'Light', url: '/l', logo: '', products_count: 1 },
      { id: '2', name: 'Heavy', url: '/h', logo: '', products_count: 7 },
    ];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    const names = Array.from(container.querySelectorAll('.ox-brand-tile')).map((el) => el.textContent);
    expect(names[0]).toContain('Heavy');
    expect(names[1]).toContain('Light');
  });

  it('caps the strip at 24 brands', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = Array.from({ length: 30 }, (unused, index) => ({
      id: String(index),
      name: `Brand ${index}`,
      url: `/b${index}`,
      logo: '',
      products_count: 30 - index,
    }));
    renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(screen.getAllByRole('listitem')).toHaveLength(24);
  });

  it('renders a name mark, first letter in its own span, when a brand has no logo', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [{ id: '1', name: 'Optimum Nutrition', url: '/on', logo: '' }];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    const mark = container.querySelector('.ox-brand-tile__mark');
    expect(mark?.textContent).toBe('Optimum Nutrition');
    expect(mark?.querySelector('.ox-brand-tile__mark-first')?.textContent).toBe('O');
  });

  // The 2026-09-23 (late) owner brief: the strip becomes a CAROUSEL of plated
  // tiles with the shared rail primitive's cue instead of a native scrollbar.
  // The 2026-09-24 owner brief, item 1(c): the tile never states a count,
  // even when the API sends one - `products_count` still drives the sort
  // (the next test) but is never printed.
  it('never states a count on the tile, whether or not the API sends one', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [
      { id: '1', name: 'Counted', url: '/c', logo: '', products_count: 7 },
      { id: '2', name: 'Uncounted', url: '/u', logo: '' },
    ];
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    expect(container.querySelectorAll('.ox-brand-tile__count')).toHaveLength(0);
  });

  it('is a carousel: the row and every slide say so, and each tile takes the corner-cut plate', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [1, 2, 3].map((n) => ({ id: String(n), name: `B${n}`, url: `/b${n}`, logo: '' }));
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    const row = container.querySelector('.ox-brands__row');
    expect(row?.getAttribute('aria-roledescription')).toBe(ar['ox.home.brands_carousel_role']);
    expect(row?.classList.contains('ox-rail__track')).toBe(true);
    const slides = container.querySelectorAll('.ox-brands__item');
    expect(slides).toHaveLength(3);
    expect(slides[0].getAttribute('aria-label')).toBe(
      ar['ox.home.brands_slide_label'].replace('{{index}}', '1').replace('{{total}}', '3')
    );
    expect(container.querySelectorAll('.ox-brand-tile__plate')).toHaveLength(3);
  });

  it('carries the rail cue as its next affordance, and the arrows only past four brands', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [1, 2, 3].map((n) => ({ id: String(n), name: `B${n}`, url: `/b${n}`, logo: '' }));
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    const cue = container.querySelector('.ox-rail__cue');
    expect(cue?.getAttribute('aria-label')).toBe(ar['ox.home.brands_next']);
    expect(container.querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
    expect(container.querySelector('.ox-rail__progress')).not.toBeNull();
    expect(container.querySelectorAll('.ox-brands__arrow')).toHaveLength(0);
  });

  it('shows the prev/next pair once there is a screen of tiles to step past', async () => {
    for (const key of Object.keys(brandGroups)) delete brandGroups[key];
    brandGroups.a = [1, 2, 3, 4, 5].map((n) => ({ id: String(n), name: `B${n}`, url: `/b${n}`, logo: '' }));
    const { container } = renderWithProviders(<OxBrands data={data('ox-brands')} />);
    await waitFor(() => expect(screen.getByTestId('ox-brands')).toBeTruthy());
    const arrows = container.querySelectorAll('.ox-brands__arrow');
    expect(arrows).toHaveLength(2);
    expect((arrows[0] as HTMLButtonElement).disabled).toBe(true);
    expect((arrows[1] as HTMLButtonElement).disabled).toBe(false);
    // The unfilled angled face is a span inside the button, never the button
    // itself: a clip-path would clip the focus ring (X-IDENTITY 7.1).
    expect(arrows[0].querySelector('.ox-iconbtn--angled')).not.toBeNull();
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

// Restored 2026-09-22 (owner reverts the "shop by need" merge): the fallback
// contract this file's own docblock is about - the tiles it falls back to
// while the store is still being filled in. The full behavioural contract
// (tints, the icon-above-image order, the no-count foot) lives in its own
// `tests/home/OxCategories.test.tsx`.
describe('OxCategories', () => {
  it('falls back to eight type tiles, each linking to a search until the category exists', async () => {
    categories.length = 0;
    renderWithProviders(<OxCategories data={data('ox-categories')} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-category-tile')).toHaveLength(8));
    const tiles = screen.getAllByTestId('ox-category-tile');
    expect(tiles[0].getAttribute('href')).toContain('/search?q=');
    // No artwork yet: the sprite symbol stands in, never a broken image.
    expect(tiles[0].querySelector('svg')).not.toBeNull();
    // The only <img> is the curated local artwork (2026-09-23); the live
    // image slot, the one that could 404, is never rendered on an art tile.
    expect(tiles[0].querySelector('img.ox-tile__art')).not.toBeNull();
    expect(tiles[0].querySelector('.ox-tile__image')).toBeNull();
  });

  it('uses the live category URL when the store has the category', async () => {
    categories.length = 0;
    categories.push({
      id: 7,
      name: 'بروتين',
      url: `/${ROOT_CATEGORY_SLUGS[0]}/c7`,
      products_count: 12,
      image: null,
    });
    renderWithProviders(<OxCategories data={data('ox-categories')} />);
    await waitFor(() =>
      expect(screen.getAllByTestId('ox-category-tile')[0].getAttribute('href')).toBe(
        `/${ROOT_CATEGORY_SLUGS[0]}/c7`
      )
    );
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

  // S9d, owner brief 2026-09-24: the starter bundle stops appearing as a
  // product, so "أحدث المنتجات" never shows it, even when the catalogue's own
  // `latest` order puts it in the page.
  it('drops a real bundle from "أحدث المنتجات", and keeps the ordinary products beside it', async () => {
    productList.mockClear();
    productList.mockResolvedValueOnce({
      items: [
        { id: 1, name: 'واي بروتين', type: 'product' },
        { id: 2, name: 'حزمة البداية - اوبتيمال اكس', type: 'group_products' },
        { id: 3, name: 'كرياتين', type: 'product' },
      ],
      next: null,
    } as never);
    renderWithProviders(<OxProducts data={data('ox-products')} />);
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(2));
    const names = screen.getAllByTestId('engine-product-card').map((card) => card.textContent);
    expect(names).toEqual(['واي بروتين', 'كرياتين']);
  });
});
