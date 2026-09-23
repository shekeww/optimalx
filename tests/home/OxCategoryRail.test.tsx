import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

const ar = loadDictionary('ar');

/**
 * One product rail per root category (S2e, 2026-09-22). The contract:
 *
 *   1. hidden when the category cannot be resolved to a real id at all;
 *   2. hidden under two products, a rail of one is not a shelf;
 *   3. otherwise a `role="list"` of `OxProductCard`, `per_page` 8, through
 *      `products?source=categories&source_value[]=<id>`;
 *   4. a merchant's own `category` selection overrides the default `rootSlug`.
 */

const liveCategories: unknown[] = [];
const productList = vi.fn(async () => ({ items: [], next: null }));

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));
vi.mock('../../app/components/product/OxProductCard', () => ({
  OxProductCard: ({ product }: { product: { id: number; name: string } }) =>
    React.createElement('article', { 'data-testid': 'ox-product-card' }, product.name),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: (params: unknown) => productList(params as never) },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { OxCategoryRail } = await import('../../app/components/home/OxCategoryRail');

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-category-rail',
    key: 'rail',
    ...HOME_BLOCK_FIELDS['ox-category-rail'],
    ...extra,
  } as OxBlockData;
}

function products(count: number) {
  return Array.from({ length: count }, (unused, index) => ({ id: index + 1, name: `منتج ${index + 1}` }));
}

beforeEach(() => {
  liveCategories.length = 0;
  productList.mockClear();
  productList.mockResolvedValue({ items: [], next: null } as never);
  Element.prototype.scrollIntoView = vi.fn();
});

describe('OxCategoryRail, resolution', () => {
  it('renders nothing with no rootSlug and no merchant selection', async () => {
    const { container } = renderWithProviders(<OxCategoryRail data={data()} />);
    await waitFor(() => expect(container).toBeTruthy());
    expect(container.querySelector('[data-testid="ox-category-rail"]')).toBeNull();
  });

  it('renders nothing while the rootSlug has not resolved to a live category id', async () => {
    const { container } = renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(container).toBeTruthy());
    expect(container.querySelector('[data-testid="ox-category-rail"]')).toBeNull();
    expect(productList).not.toHaveBeenCalled();
  });

  it('renders nothing under two products, even once resolved', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 1 });
    productList.mockResolvedValue({ items: products(1), next: null } as never);
    const { container } = renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(productList).toHaveBeenCalled());
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-category-rail"]')).toBeNull()
    );
  });
});

describe('OxCategoryRail, a resolved category', () => {
  it('asks for that category id, per_page 8, and renders a role=list of cards', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(8), next: null } as never);
    renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(8));
    expect(productList.mock.calls[0][0]).toMatchObject({
      source: 'categories',
      sourceValue: [9001],
      perPage: 8,
    });
    expect(screen.getByRole('list')).toBeTruthy();
  });

  // S9d, owner brief 2026-09-24: a real bundle is not a product on a
  // category shelf.
  it('drops a real bundle from the rail, and does not count it toward the minimum', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({
      items: [
        ...products(1),
        { id: 99, name: 'حزمة البداية - اوبتيمال اكس', type: 'group_products' },
      ],
      next: null,
    } as never);
    const { container } = renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(productList).toHaveBeenCalled());
    // One real product plus one bundle is still under MIN_PRODUCTS once the
    // bundle is dropped, so the rail hides — proving the exclusion runs
    // before the "at least two" gate, not after it.
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-category-rail"]')).toBeNull()
    );
  });

  it('sends the view-all link to the category url and falls back to its name for the title', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(4), next: null } as never);
    renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(4));
    const rail = screen.getByTestId('ox-category-rail');
    expect(rail.querySelector('a[href="/protein/c9001"]')).not.toBeNull();
  });

  it('drops a real bundle from an otherwise full rail, and shows every ordinary product beside it', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({
      items: [
        ...products(4),
        { id: 99, name: 'حزمة البداية - اوبتيمال اكس', type: 'group_products' },
      ],
      next: null,
    } as never);
    renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(4));
    expect(screen.queryByText('حزمة البداية - اوبتيمال اكس')).toBeNull();
  });

  it('lets the merchant title override win over the resolved category name', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(3), next: null } as never);
    renderWithProviders(
      <OxCategoryRail data={data({ rootSlug: 'protein', title: 'عنوان التاجر' })} />
    );
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(3));
    expect(screen.getByTestId('ox-category-rail').textContent).toContain('عنوان التاجر');
  });
});

describe('OxCategoryRail, the rail primitive (owner review 2026-09-23 late night, item 1)', () => {
  it('carries no native scrollbar contract, the cue and the progress strap, with no nav at three products', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(3), next: null } as never);
    const { container } = renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(3));

    const row = container.querySelector('.ox-cat-rail__scroller');
    expect(row?.classList.contains('ox-rail__track')).toBe(true);
    const cue = container.querySelector('.ox-rail__cue');
    expect(cue?.getAttribute('aria-label')).toBe(ar['ox.listing.featured_next']);
    expect(container.querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
    expect(container.querySelector('.ox-rail__progress')).not.toBeNull();
    expect(container.querySelector('.ox-cat-rail__nav')).toBeNull();
  });

  it('shows the prev/next pair past three products, prev disabled at the start', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(8), next: null } as never);
    const { container } = renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(8));

    const arrows = container.querySelectorAll('.ox-cat-rail__arrow');
    expect(arrows).toHaveLength(2);
    expect((arrows[0] as HTMLButtonElement).disabled).toBe(true);
    expect((arrows[1] as HTMLButtonElement).disabled).toBe(false);
    // The unfilled angled face is a span inside the button, never the button
    // itself: a clip-path would clip the focus ring (X-IDENTITY 7.1).
    expect(arrows[0].querySelector('.ox-iconbtn--angled')).not.toBeNull();

    fireEvent.click(arrows[1]);
    await waitFor(() => expect((arrows[0] as HTMLButtonElement).disabled).toBe(false));
  });
});

describe('OxCategoryRail, a merchant selection', () => {
  it('overrides the default rootSlug with the picked category id', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(2), next: null } as never);
    renderWithProviders(
      <OxCategoryRail
        data={data({
          rootSlug: 'creatine',
          category: [{ id: 9099, name: 'واي بروتين', url: '/whey-protein/c9099' }],
        })}
      />
    );
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(2));
    expect(productList.mock.calls[0][0]).toMatchObject({ sourceValue: [9099] });
  });
});
