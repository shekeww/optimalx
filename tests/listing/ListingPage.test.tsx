import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
const location = { pathname: '/whey-protein/c1', searchStr: '' };
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
vi.mock('@salla.sa/twilight-theme-engine/home', () => ({
  Testimonials: () => <div data-testid="engine-testimonials" />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/HookSlot', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-testid="hook-slot" data-name={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: storeSettings }),
}));
// `FeaturedRail` prices its cards through `Price`, which reads this hook;
// mirrors the engine's own SAR rendering the same way tests/common/
// primitives.test.tsx does.
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: number | string | undefined) =>
      React.createElement(
        React.Fragment,
        null,
        Number(amount ?? 0).toFixed(2),
        React.createElement('i', { className: 'sicon-sar', 'aria-hidden': 'true' })
      ),
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
// The live category list, per test: empty by default (the store today), so
// every taxonomy link falls back to a search; a test pushes categories in to
// see the resolved URL win.
const liveCategories: unknown[] = [];
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { ListingPage } = await import('../../app/components/listing/ListingPage');
const { createT } = await import('../helpers/i18n');
const t = createT('ar');

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
  liveCategories.length = 0;
  itemsListProps.mockClear();
  historyPush.mockClear();
  storeSettings.product = { filters: true };
  storeSettings.category = { testimonial_enabled: false };
  location.searchStr = '';
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

  it('opens in the masthead band, with the breadcrumb and the h1 inside it', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    const band = container.querySelector('.ox-listing__band');
    expect(band).not.toBeNull();
    const inner = band?.querySelector('.ox-listing__band-inner');
    expect(inner?.querySelector('[data-testid="engine-breadcrumb"]')).not.toBeNull();
    expect(inner?.querySelector('h1')).not.toBeNull();
  });

  it('puts the chips and the controls in one toolbar, directly on the grid', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    const toolbar = container.querySelector('.ox-listing__toolbar');
    expect(toolbar).not.toBeNull();
    expect(toolbar?.querySelector('.ox-listing__chips')).not.toBeNull();
    expect(toolbar?.querySelector('.ox-listing__sort select')).not.toBeNull();
    // The toolbar is the last thing before the results, inside the grid anchor.
    expect(container.querySelector('#listing-grid .ox-listing__toolbar')).not.toBeNull();
  });

  it('answers how long the list is above the grid, not under it', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    const line = container.querySelector('.ox-listing__toolbar .ox-listing__progress');
    expect(line?.textContent).toBe(t('ox.listing.showing', { count: 2 }));
    // The honest loaded count, still with no invented total, and exactly one
    // of it on the page.
    expect(container.querySelectorAll('.ox-listing__progress')).toHaveLength(1);
    expect(
      container.querySelector('.ox-listing__results .ox-listing__progress')
    ).toBeNull();
  });

  it('shows how many facets the URL is filtered by, and nothing at none', () => {
    const { container: none } = renderWithProviders(
      <ListingPage {...data()} slug="whey-protein" />
    );
    const plain = none.querySelector('.ox-listing__filters-trigger');
    expect(plain).not.toBeNull();
    expect(plain?.querySelector('.ox-listing__filters-count')).toBeNull();
    expect(plain?.classList.contains('is-active')).toBe(false);

    location.searchStr = '?sort=ourSuggest&brands[]=7&price_from=50&price_to=300';
    const { container: filtered } = renderWithProviders(
      <ListingPage {...data()} slug="whey-protein" />
    );
    const trigger = filtered.querySelector('.ox-listing__filters-trigger');
    expect(trigger?.querySelector('.ox-listing__filters-count')?.textContent).toBe('2');
    expect(trigger?.classList.contains('is-active')).toBe(true);
    // The bare number is hidden from the assistive tree; a sentence is not.
    expect(trigger?.textContent).toContain(t('ox.filter.applied', { count: 2 }));
  });

  it('navigates with ?sort= and drops the page cursor, as the engine does', () => {
    renderWithProviders(<ListingPage {...data()} slug="whey-protein" />);
    // The label is read through the dictionary, not retyped: the value moved
    // from "ترتيب حسب" to "رتب حسب" at HEAD and this assertion kept the old
    // text, so the case failed on wording while the behaviour it pins held.
    const select = screen.getByLabelText(t('ox.sort.label')) as HTMLSelectElement;
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

  it('replaces the masthead band with the dark hero', () => {
    const { container } = renderWithProviders(
      <ListingPage {...goalData} slug="goal-performance" />
    );
    expect(container.querySelector('.ox-listing__band')).toBeNull();
    expect(container.querySelector('.ox-goal-hero')).not.toBeNull();
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

  it('gives the offers listing its own intro and its own empty state', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'العروض', slug: 'product.index.offers', breadcrumbs: [] },
          source: { type: 'offers' },
          products: [],
          pagination: { next: null },
          filters: undefined,
        })}
      />
    );
    // Read through the dictionary, not retyped: the wording is the copy
    // gate's business (tests/i18n.test.ts, check:copy); this case pins that
    // the offers intro key, and only it, renders here.
    expect(container.querySelector('.ox-listing__intro-text')?.textContent).toBe(
      t('ox.listing.intro_offers')
    );
    const empty = container.querySelector('.ox-listing__empty');
    expect(empty).not.toBeNull();
    expect(empty?.querySelector('.ox-empty__title')?.textContent).toBe(t('ox.listing.empty_offers'));
    // Two routes out: the goals page and the whole range.
    expect(empty?.querySelectorAll('.ox-empty__actions a')).toHaveLength(2);
  });

  it('gives a brand with nothing in stock its own empty state and a route to /brands', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'Optimum Nutrition', slug: 'brands.index', breadcrumbs: [] },
          source: {
            type: 'brands',
            value: '7',
            entity: { id: '7', name: 'Optimum Nutrition', url: `${ORIGIN}/optimum/b7` },
          },
          products: [],
          pagination: { next: null },
          filters: undefined,
        })}
      />
    );
    expect(container.querySelector('.ox-empty__title')?.textContent).toBe(
      t('ox.listing.empty_brand')
    );
    const hrefs = Array.from(container.querySelectorAll('.ox-empty__actions a')).map((node) =>
      node.getAttribute('href')
    );
    expect(hrefs).toContain('/brands');
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
    expect(container.querySelector('.ox-listing__intro-text')?.textContent).toBe(
      t('ox.listing.intro_latest')
    );
    expect(screen.getByTestId('items-list')).toBeTruthy();
  });
});

describe('ListingPage, taxonomy head region (S1 step 5)', () => {
  it('renders the researched h1 for a taxonomy slug, and the dashboard name for any other', () => {
    // `page.title` is the dashboard name ("واي بروتين" in the fixture); the
    // protein node's h1 is the researched head term, which differs from it.
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    expect(container.querySelector('h1')?.textContent).toBe(t('ox.content.categories.protein.h1'));
    expect(t('ox.content.categories.protein.h1')).not.toBe('واي بروتين');

    const { container: unknown } = renderWithProviders(
      <ListingPage
        {...data({ page: { title: 'قسم المالك', slug: 'product.index', breadcrumbs: [] } })}
        slug="owner-made"
      />
    );
    expect(unknown.querySelector('h1')?.textContent).toBe('قسم المالك');
  });

  it('never borrows a node heading for a brand whose slug matches a taxonomy slug', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'Protein Co', slug: 'brands.index', breadcrumbs: [] },
          source: { type: 'brands', value: '7', entity: { id: '7', name: 'Protein Co', url: `${ORIGIN}/protein/b7` } },
          filters: undefined,
        })}
        slug="protein"
      />
    );
    expect(container.querySelector('h1')?.textContent).toBe('Protein Co');
  });

  it('clamps the intro to two lines behind the show-more toggle, keeping the whole paragraph in the DOM', () => {
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    const intro = container.querySelector('.ox-listing__intro-text') as HTMLElement;
    expect(intro.classList.contains('is-clamped')).toBe(true);
    expect(intro.textContent).toBe(t('ox.content.categories.protein.intro'));
    const toggle = container.querySelector('.ox-listing__intro-toggle') as HTMLButtonElement;
    expect(toggle.textContent).toBe(t('ox.common.show_more'));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(intro.id);
    fireEvent.click(toggle);
    expect(intro.classList.contains('is-clamped')).toBe(false);
    expect(toggle.textContent).toBe(t('ox.common.show_less'));
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('links a child chip to its live category when the store has one, and to a search until then', async () => {
    liveCategories.push({
      id: 9011,
      id_: 9011,
      name: 'واي بروتين',
      url: `${ORIGIN}/whey-protein/c9011`,
    });
    const { container } = renderWithProviders(<ListingPage {...data()} slug="protein" />);
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ox-listing__chips a')).map((a) => a.getAttribute('href'))
      ).toContain(`${ORIGIN}/whey-protein/c9011`)
    );
    const hrefs = Array.from(container.querySelectorAll('.ox-listing__chips a')).map((a) =>
      a.getAttribute('href')
    );
    expect(hrefs).toHaveLength(5);
    expect(hrefs[0]).toBe(`${ORIGIN}/whey-protein/c9011`);
    for (const href of hrefs.slice(1)) expect(href).toMatch(/^\/search\?q=/);
  });

  it('prefers the live children on the entity over the taxonomy', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          source: {
            type: 'categories',
            value: '9001',
            entity: {
              id: 9001,
              name: 'بروتين',
              url: `${ORIGIN}/protein/c9001`,
              sub_categories: [
                { id: 9011, name: 'واي بروتين', url: `${ORIGIN}/whey-protein/c9011` },
                { id: 9012, name: 'واي بروتين ايزوليت', url: `${ORIGIN}/whey-isolate/c9012` },
              ],
            },
          },
        })}
        slug="protein"
      />
    );
    const hrefs = Array.from(container.querySelectorAll('.ox-listing__chips a')).map((a) =>
      a.getAttribute('href')
    );
    expect(hrefs).toEqual([`${ORIGIN}/whey-protein/c9011`, `${ORIGIN}/whey-isolate/c9012`]);
  });

  it('gives a utility category its h1, intro and FAQ from the taxonomy', () => {
    const { container } = renderWithProviders(
      <ListingPage
        {...data({
          page: { title: 'الحزم', slug: 'product.index', breadcrumbs: [] },
          source: { type: 'categories', value: '9016', entity: { id: 9016, name: 'الحزم', url: `${ORIGIN}/bundles/c9016` } },
        })}
        slug="bundles"
      />
    );
    expect(container.querySelector('h1')?.textContent).toBe(t('ox.tax.bundles.h1'));
    expect(container.querySelector('.ox-listing__intro-text')?.textContent).toBe(t('ox.tax.bundles.intro'));
    expect(container.querySelectorAll('.ox-listing__faq .ox-acc__trigger')).toHaveLength(3);
    expect(container.querySelector('.ox-listing__chips')).toBeNull();
  });
});
