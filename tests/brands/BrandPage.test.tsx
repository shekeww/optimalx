import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';

const ar = loadDictionary('ar');

/**
 * A brand's own page as the 2026-09-23 (late) owner brief rebuilt it: the
 * identity banner with the name mark and the live count, the SAME two-up
 * cover carousel S4c built for category pages, the toolbar, the filters
 * without their now-redundant brand facet, the grid, and the chips out to the
 * other brands and the root types.
 *
 * Everything the engine owns is mocked at its own module path, the same way
 * tests/listing/ListingPage.test.tsx does it.
 */

const itemsListProps = vi.fn();
const historyPush = vi.fn();
const storeSettings: Record<string, unknown> = { product: { filters: true } };
const brandGroups: Record<string, unknown[]> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
const location = { pathname: '/brands/9101', searchStr: '' };
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => location,
  useRouter: () => ({ history: { push: historyPush } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: ({ page }: { page: { title: string } }) => (
    <nav data-testid="engine-breadcrumb">{page.title}</nav>
  ),
  RenderWhenVisible: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/HookSlot', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-testid="hook-slot" data-name={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: storeSettings }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: number | string | undefined) =>
      React.createElement(React.Fragment, null, Number(amount ?? 0).toFixed(2)),
    parse: (value: string) => Number(value),
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <article data-testid="engine-product-card">{product.name}</article>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/drawer', () => {
  const Drawer = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="filters-drawer">{children}</div> : null;
  Drawer.Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Drawer.Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Drawer.Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Drawer };
});
vi.mock('@salla.sa/twilight-components-react/filters', () => ({
  SallaFilters: ({ id, filters }: { id: string; filters: { key: string }[] }) => (
    <div data-testid="salla-filters" data-id={id} data-keys={filters.map((f) => f.key).join(',')} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react', () => ({
  ItemsList: (props: Record<string, unknown>) => {
    itemsListProps(props);
    const items = (props.items ?? []) as unknown[];
    const render = props.children as (list: unknown[]) => React.ReactNode;
    return (
      <div data-testid="items-list" data-mode={String(props.mode)}>
        {items.length ? render(items) : props.empty}
      </div>
    );
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: vi.fn().mockResolvedValue({ items: [], next: null }) },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/brands', () => ({
  brand: { queries: { list: () => ({ queryKey: ['brands'], queryFn: async () => brandGroups }) } },
}));

const { BrandPage } = await import('../../app/components/brands/BrandPage');

const ORIGIN = 'https://optimalx.com.sa';

function data(overrides: Partial<ProductListLoaderData> = {}): ProductListLoaderData {
  return {
    page: {
      title: 'NOW Foods',
      slug: 'product.index',
      breadcrumbs: [{ name: 'الرئيسية', url: '/' }],
    },
    source: {
      type: 'brands',
      value: '9101',
      entity: {
        id: '9101',
        name: 'NOW Foods',
        url: `${ORIGIN}/brands/9101`,
        logo: '',
        description: '<p>وصف التاجر</p>',
        products_count: 7,
      },
    },
    query: { sort: 'ourSuggest', filters: true },
    products: [
      { id: 1, name: 'Gold Standard Whey', url: `${ORIGIN}/p1`, image: { url: `${ORIGIN}/1.jpg` } },
      { id: 2, name: 'Impact Whey', url: `${ORIGIN}/p2`, image: { url: `${ORIGIN}/2.jpg` } },
    ],
    pagination: { next: 'cursor-2' },
    filters: [
      { key: 'brand', label: 'العلامة', type: 'list', values: [] },
      { key: 'price', label: 'السعر', type: 'range', values: [] },
    ],
    ...overrides,
  } as ProductListLoaderData;
}

beforeEach(() => {
  itemsListProps.mockClear();
  historyPush.mockClear();
  location.searchStr = '';
  for (const key of Object.keys(brandGroups)) delete brandGroups[key];
});

describe('BrandPage', () => {
  it('opens on the identity banner: one h1 name mark, the live count, the breadcrumb', () => {
    const { container } = renderWithProviders(<BrandPage {...data()} />);
    const headings = container.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('NOW Foods');
    expect(headings[0].querySelector('.ox-brandhero__mark-first')?.textContent).toBe('N');
    expect(container.querySelector('.ox-brandhero__count')?.textContent).toBe(
      ar['ox.brands.products_count'].replace('{{count}}', '7')
    );
    expect(screen.getByTestId('engine-breadcrumb')).toBeTruthy();
    expect(container.querySelector('#page-main-title')).toBeNull();
  });

  it('never states a count the API did not send', () => {
    const payload = data();
    const source = { ...payload.source, entity: { ...payload.source.entity, products_count: undefined } };
    const { container } = renderWithProviders(<BrandPage {...data({ source })} />);
    expect(container.querySelector('.ox-brandhero__count')).toBeNull();
  });

  it('renders the merchant description as text, never as markup', () => {
    const { container } = renderWithProviders(<BrandPage {...data()} />);
    const intro = container.querySelector('.ox-brandhero__intro');
    expect(intro?.textContent).toBe('وصف التاجر');
    expect(intro?.querySelector('p')).toBeNull();
  });

  it('reuses the featured cover carousel, fed with the brand own products', () => {
    const { container } = renderWithProviders(<BrandPage {...data()} />);
    expect(container.querySelector('.ox-featured')).not.toBeNull();
    expect(container.querySelectorAll('.ox-featured__item')).toHaveLength(2);
  });

  it('hides the brand facet on the brand own page and keeps every other one', () => {
    renderWithProviders(<BrandPage {...data()} />);
    const widget = screen.getAllByTestId('salla-filters')[0];
    expect(widget.getAttribute('data-keys')).toBe('price');
  });

  it('keeps the engine hook slots in the engine order', () => {
    const { container } = renderWithProviders(<BrandPage {...data()} />);
    const names = Array.from(container.querySelectorAll('[data-testid="hook-slot"]')).map((node) =>
      node.getAttribute('data-name')
    );
    expect(names).toEqual([
      'product:list.start',
      'product:list.items.start',
      'product:list.items.end',
      'product:list.end',
    ]);
  });

  it('drives ItemsList in button mode with the brand source and sort reset key', () => {
    renderWithProviders(<BrandPage {...data()} />);
    const props = itemsListProps.mock.calls[0][0];
    expect(props.mode).toBe('button');
    expect(props.resetKey).toBe('9101-ourSuggest');
  });

  it('routes out to the brand empty state when the brand has no products', () => {
    const { container } = renderWithProviders(
      <BrandPage {...data({ products: [], pagination: { next: null } })} />
    );
    expect(container.querySelector('.ox-empty__title')?.textContent).toBe(
      ar['ox.listing.empty_brand']
    );
    expect(container.querySelector('.ox-featured')).toBeNull();
  });

  it('chips out to the other brands, never to itself', async () => {
    brandGroups.n = [
      { id: '9101', name: 'NOW Foods', url: `${ORIGIN}/brands/9101` },
      { id: '9102', name: 'Optimum Nutrition', url: `${ORIGIN}/brands/9102` },
    ];
    const { container } = renderWithProviders(<BrandPage {...data()} />);
    const chipLabels = () =>
      Array.from(container.querySelectorAll('.ox-explore__list .ox-chip__label')).map(
        (el) => el.textContent
      );
    // The brand list arrives with its own query; the row is absent until then
    // rather than half-built, so the wait is on the chip, not on the block.
    await waitFor(() => expect(chipLabels()).toContain('Optimum Nutrition'));
    expect(chipLabels()).not.toContain('NOW Foods');
  });
});
