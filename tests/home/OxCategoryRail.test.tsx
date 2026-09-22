import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

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

  it('sends the view-all link to the category url and falls back to its name for the title', async () => {
    liveCategories.push({ id: 9001, name: 'بروتين', url: '/protein/c9001', products_count: 14 });
    productList.mockResolvedValue({ items: products(4), next: null } as never);
    renderWithProviders(<OxCategoryRail data={data({ rootSlug: 'protein' })} />);
    await waitFor(() => expect(screen.getAllByTestId('ox-product-card')).toHaveLength(4));
    const rail = screen.getByTestId('ox-category-rail');
    expect(rail.querySelector('a[href="/protein/c9001"]')).not.toBeNull();
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
