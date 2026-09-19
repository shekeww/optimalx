import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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

  it('is position relative at the root, as the render budget requires', async () => {
    list.mockResolvedValueOnce({ items: [{ id: 3, name: 'اوميغا 3' }], next: null });
    const { container } = renderWithProviders(
      <ProductsSliderWrapper source="latest" sliderId="rail-3" />
    );
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(1));
    expect(container.querySelector('[data-testid="ox-products-slider"]')?.className).toContain('ox-rail');
  });
});
