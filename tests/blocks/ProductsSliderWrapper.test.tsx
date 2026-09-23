import React from 'react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const list = vi.fn();

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('../helpers/i18n')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: (params: unknown) => list(params) },
}));
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({ product }: { product: { id: number; name: string } }) => (
    <article data-testid="engine-product-card">{product.name}</article>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { ProductsSliderWrapper } = await import('../../app/components/blocks/ProductsSliderWrapper');

describe('ProductsSliderWrapper', () => {
  // The loader is a module-level mock, so queued `once` values and the call
  // log leak between cases unless each one starts from nothing.
  beforeEach(() => {
    list.mockReset();
  });

  it('renders the engine ProductCard for every item the loader returns', async () => {
    list.mockResolvedValueOnce({
      items: [
        { id: 1, name: 'واي بروتين' },
        { id: 2, name: 'كرياتين' },
      ],
      next: null,
    });
    renderWithProviders(<ProductsSliderWrapper source="latest" sliderId="rail-1" perPage={8} />);
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(2));
    expect(list).toHaveBeenCalledWith({ source: 'latest', perPage: 8 });
  });

  it('removes itself when the loader comes back empty, so no empty rail is painted', async () => {
    list.mockResolvedValueOnce({ items: [], next: null });
    const { container } = renderWithProviders(
      <ProductsSliderWrapper source="latest" sliderId="rail-2" title="من الخيارات الشائعة" />
    );
    expect(container.querySelector('[data-testid="ox-products-slider"]')).not.toBeNull();
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-products-slider"]')).toBeNull()
    );
  });

  it('falls through to the next source only when the one before it came back empty', async () => {
    list.mockResolvedValueOnce({ items: [], next: null });
    list.mockResolvedValueOnce({ items: [], next: null });
    list.mockResolvedValueOnce({ items: [{ id: 9, name: 'كرياتين' }], next: null });
    renderWithProviders(
      <ProductsSliderWrapper
        source="related"
        sourceValue={42}
        fallbacks={[
          { source: 'categories', sourceValue: 7 },
          { source: 'latest' },
        ]}
        perPage={8}
        sliderId="rail-4"
      />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(list).toHaveBeenNthCalledWith(1, { source: 'related', sourceValue: 42, perPage: 8 });
    expect(list).toHaveBeenNthCalledWith(2, { source: 'categories', sourceValue: 7, perPage: 8 });
    expect(list).toHaveBeenNthCalledWith(3, { source: 'latest', perPage: 8 });
  });

  it('stops at the first source that answers, and never asks the ones after it', async () => {
    list.mockResolvedValueOnce({ items: [{ id: 1, name: 'واي' }], next: null });
    renderWithProviders(
      <ProductsSliderWrapper
        source="related"
        sourceValue={42}
        fallbacks={[{ source: 'latest' }]}
        sliderId="rail-5"
      />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('drops the excluded product, and treats a source that returns only it as empty', async () => {
    list.mockResolvedValueOnce({ items: [{ id: 42, name: 'نفس المنتج' }], next: null });
    list.mockResolvedValueOnce({
      items: [
        { id: 42, name: 'نفس المنتج' },
        { id: 8, name: 'منتج آخر' },
      ],
      next: null,
    });
    renderWithProviders(
      <ProductsSliderWrapper
        source="related"
        sourceValue={42}
        exclude={42}
        fallbacks={[{ source: 'latest' }]}
        sliderId="rail-6"
      />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(screen.getByTestId('engine-product-card').textContent).toBe('منتج آخر');
    expect(list).toHaveBeenCalledTimes(2);
  });

  // S9d, owner brief 2026-09-24: the related rail (the PDP's own
  // `Alternatives.tsx`) asks for this so a real bundle never rides along as
  // a "related" product.
  it('drops a real bundle when excludeBundles is on, and treats a bundle-only source as empty', async () => {
    list.mockResolvedValueOnce({
      items: [
        { id: 1, name: 'واي بروتين', type: 'product' },
        { id: 2, name: 'حزمة البداية - اوبتيمال اكس', type: 'group_products' },
      ],
      next: null,
    });
    renderWithProviders(
      <ProductsSliderWrapper source="latest" sliderId="rail-8" excludeBundles />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(screen.getByTestId('engine-product-card').textContent).toBe('واي بروتين');
  });

  it('still removes itself when every source in the chain comes back empty', async () => {
    list.mockResolvedValue({ items: [], next: null });
    const { container } = renderWithProviders(
      <ProductsSliderWrapper
        source="related"
        sourceValue={42}
        fallbacks={[{ source: 'latest' }]}
        sliderId="rail-7"
      />
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-products-slider"]')).toBeNull()
    );
  });

  it('is position relative at the root, as the render budget requires', async () => {
    list.mockResolvedValueOnce({ items: [{ id: 3, name: 'اوميغا 3' }], next: null });
    const { container } = renderWithProviders(
      <ProductsSliderWrapper source="latest" sliderId="rail-3" />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(container.querySelector('[data-testid="ox-products-slider"]')?.className).toContain('ox-rail');
  });
});
