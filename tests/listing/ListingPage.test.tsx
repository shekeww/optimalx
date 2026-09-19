import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';

/**
 * The composed listing page (PLAN-final C3). The assertions are the ones the
 * acceptance criteria name: one h1, the engine's four hook slots in the
 * engine's positions, `ItemsList` in button mode with the reset key, the goal
 * hero replacing the plain header, the search zero state, and no
 * `#page-main-title` anywhere.
 *
 * Everything the engine owns is mocked at its own module path, because the
 * components package's root barrel cannot be imported outside the bundler
 * (see tests/product/jsonld.test.ts for the same note).
 */

const itemsListProps = vi.fn();
const historyPush = vi.fn();
const storeSettings: Record<string, unknown> = {
  product: { filters: true },
  category: { testimonial_enabled: false },
};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/whey-protein/c1', searchStr: '' }),
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
vi.mock('@salla.sa/twilight-theme-engine/home', () => ({
  Testimonials: () => <div data-testid="engine-testimonials" />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/HookSlot', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-testid="hook-slot" data-name={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: storeSettings }),
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
  SallaFilters: ({ id }: { id: string }) => <div data-testid="salla-filters" data-id={id} />,
}));
vi.mock('@salla.sa/twilight-components-react', () => ({
  ItemsList: (props: Record<string, unknown>) => {
    itemsListProps(props);
    const items = (props.items ?? []) as unknown[];
    const render = props.children as (list: unknown[]) => React.ReactNode;
    return (
      <div data-testid="items-list" data-mode={String(props.mode)}>
        <div className={String(props.itemsClassName ?? '')}>{items.length ? render(items) : props.empty}</div>
      </div>
    );
  },
  SallaProductsSlider: ({ children, loader }: Record<string, unknown>) => {
    void loader;
    void children;
    return <div data-testid="salla-products-slider" />;
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: vi.fn().mockResolvedValue({ items: [], next: null }) },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));

const { ListingPage } = await import('../../app/components/listing/ListingPage');

const ORIGIN = 'https://optimalx.com.sa';

function data(overrides: Partial<ProductListLoaderData> = {}): ProductListLoaderData {
  return {
    page: {
      title: 'واي بروتين',
      slug: 'product.index',
      breadcrumbs: [{ name: 'الرئيسية', url: '/' }],
    },
    source: {
      type: 'categories',
      value: '1',
      entity: { id: 1, name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c1` },
    },
    query: { sort: 'ourSuggest', filters: true },
    products: [
      { id: 1, name: 'Gold Standard Whey', url: `${ORIGIN}/p1` },
      { id: 2, name: 'Impact Whey', url: `${ORIGIN}/p2` },
    ],
    pagination: { next: 'cursor-2' },
    filters: [{ key: 'brand', label: 'العلامة', type: 'list', values: [] }],
    ...overrides,
  } as ProductListLoaderData;
}

beforeEach(() => {
  itemsListProps.mockClear();
  historyPush.mockClear();
  storeSettings.product = { filters: true };
  storeSettings.category = { testimonial_enabled: false };
});

describe('ListingPage, category variant', () => {
  it('renders exactly one h1, and never the engine page-main-title', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    const headings = container.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toContain('واي بروتين');
    expect(container.querySelector('#page-main-title')).toBeNull();
  });

  it('keeps the engine breadcrumb and the four hook slots in the engine order', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    expect(screen.getByTestId('engine-breadcrumb')).toBeTruthy();
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

  it('drives ItemsList in button mode with the source and sort reset key', () => {
    renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    const props = itemsListProps.mock.calls[0][0];
    expect(props.mode).toBe('button');
    expect(props.resetKey).toBe('1-ourSuggest');
    expect(props.skeletonType).toBe('item');
    expect(props.pageUrl).toBe('/whey-protein/c1');
    expect(typeof props.loader).toBe('function');
  });

  it('falls back to static mode when the API has no next page', () => {
    renderWithProviders(
      <ListingPage {...data({ pagination: { next: null } })} slug="whey-protein" />
    );
    expect(itemsListProps.mock.calls[0][0].mode).toBe('static');
  });

  it('renders the engine ProductCard per item so the card override applies', () => {
    renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    expect(screen.getAllByTestId('engine-product-card')).toHaveLength(2);
  });

  it('shows the category intro, the child chips and the FAQ from the content maps', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    expect(container.querySelector('.ox-listing__intro-text')).not.toBeNull();
    const chips = container.querySelectorAll('.ox-listing__chips a');
    expect(chips.length).toBe(5);
    expect(container.querySelectorAll('.ox-listing__faq .ox-acc__trigger').length).toBe(3);
  });

  it('mounts the rail only when the merchant has filters switched on', () => {
    const { container: on } = renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    expect(on.querySelector('.ox-filters')).not.toBeNull();

    storeSettings.product = { filters: false };
    const { container: off } = renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    expect(off.querySelector('.ox-filters')).toBeNull();
  });

  it('navigates with ?sort= and drops the page cursor, as the engine does', () => {
    renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    const select = screen.getByLabelText('ترتيب حسب') as HTMLSelectElement;
    select.value = 'priceFromLowToTop';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(historyPush).toHaveBeenCalledTimes(1);
    expect(String(historyPush.mock.calls[0][0])).toContain('sort=priceFromLowToTop');
  });
});

describe('ListingPage, goal variant', () => {
  const goalData = data({
    page: { title: 'الأداء', slug: 'product.index', breadcrumbs: [] },
    source: {
      type: 'categories',
      value: '9',
      entity: { id: 9, name: 'الأداء', url: `${ORIGIN}/goal-performance/c9` },
    },
  });

  it('gives the h1 to the hero and the grid heading an h2', () => {
    const { container } = renderWithProviders(
      <ListingPage {...goalData} slug="goal-performance" />
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    const hero = container.querySelector('.ox-goal-hero');
    expect(hero).not.toBeNull();
    expect(within(hero as HTMLElement).getByRole('heading', { level: 1 })).toBeTruthy();
    expect(container.querySelector('.ox-listing__head h2')).not.toBeNull();
  });

  it('renders the goal blocks: intro, explainer, sub-needs and the need-help panel', () => {
    const { container } = renderWithProviders(
      <ListingPage {...goalData} slug="goal-performance" />
    );
    expect(container.querySelector('.ox-goal-intro')).not.toBeNull();
    expect(container.querySelector('.ox-explainer')).not.toBeNull();
    expect(container.querySelectorAll('.ox-subneed')).toHaveLength(3);
    expect(container.querySelector('.ox-needhelp')).not.toBeNull();
  });

  it('renders the two anchored groups of the ideal-weight goal', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'الوزن المثالي', slug: 'product.index', breadcrumbs: [] },
          source: {
            type: 'categories',
            value: '11',
            entity: { id: 11, name: 'الوزن المثالي', url: `${ORIGIN}/goal-ideal-weight/c11` },
          },
        })}
        slug="goal-ideal-weight"
      />
    );
    expect(container.querySelector('#gain')).not.toBeNull();
    expect(container.querySelector('#lean')).not.toBeNull();
    expect(container.querySelector('.ox-explainer')).toBeNull();
  });
});

describe('ListingPage, search variant', () => {
  const searchData = (products: unknown[]) =>
    data({
      page: { title: 'واي', slug: 'search', breadcrumbs: [] },
      source: { type: 'search', value: 'واي' },
      products: products as never,
      pagination: { next: null },
    });

  it('renders the zero state instead of the grid when nothing matched', () => {
    const { container } = renderWithProviders(<ListingPage {...searchData([])} />);
    expect(container.querySelector('.ox-zero')).not.toBeNull();
    expect(container.querySelector('[data-testid="items-list"]')).toBeNull();
    // Six goal chips plus the five fixed suggestions.
    expect(container.querySelectorAll('.ox-zero__chips a')).toHaveLength(11);
    expect(screen.getByTestId('salla-products-slider')).toBeTruthy();
  });

  it('isolates the query in a bdi so a Latin term reads left to right', () => {
    const { container } = renderWithProviders(<ListingPage {...searchData([])} />);
    const bdi = container.querySelector('h1 bdi, .ox-empty__title bdi');
    expect(bdi?.textContent).toBe('واي');
  });

  it('renders the grid and no zero state when the search matched', () => {
    const { container } = renderWithProviders(
      <ListingPage {...searchData([{ id: 1, name: 'Gold Standard Whey', url: `${ORIGIN}/p1` }])} />
    );
    expect(container.querySelector('.ox-zero')).toBeNull();
    expect(screen.getByTestId('items-list')).toBeTruthy();
  });
});

describe('ListingPage, brand and static variants', () => {
  it('puts the brand logo plate in the title row', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'Optimum Nutrition', slug: 'brands.index', breadcrumbs: [] },
          source: {
            type: 'brands',
            value: '7',
            entity: {
              id: '7',
              name: 'Optimum Nutrition',
              url: `${ORIGIN}/optimum/b7`,
              logo: `${ORIGIN}/logo.png`,
              description: '<p>وصف العلامة</p>',
            },
          },
          filters: undefined,
        })}
      />
    );
    expect(container.querySelector('.ox-brand-plate')).not.toBeNull();
    expect(container.querySelector('.ox-listing__intro-text')?.textContent).toBe('وصف العلامة');
  });

  it('renders a static source with no intro, no chips and no FAQ', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'أحدث المنتجات', slug: 'product.index.latest', breadcrumbs: [] },
          source: { type: 'latest' },
          filters: undefined,
        })}
      />
    );
    expect(container.querySelector('.ox-listing--static')).not.toBeNull();
    expect(container.querySelector('.ox-listing__faq')).toBeNull();
    expect(container.querySelector('.ox-listing__chips')).toBeNull();
    expect(screen.getByTestId('items-list')).toBeTruthy();
  });
});
