import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

const toggle = vi.fn();
const wishlistIds: number[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({
    ids: wishlistIds,
    count: wishlistIds.length,
    has: (id: number) => wishlistIds.includes(id),
    toggle,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span data-testid="money">{String(amount)}</span>,
    parse: Number,
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src, className }: Record<string, unknown>) => (
    <img alt={String(alt ?? '')} src={src as string} className={className as string} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ children, ...rest }: Record<string, unknown>) => (
    <button type="button" data-testid="add-button" data-product-id={String(rest.productId)}>
      {children as React.ReactNode}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, ariaLabel, onClick, className }: Record<string, unknown>) => (
    <button
      type="button"
      aria-label={ariaLabel as string}
      className={className as string}
      onClick={onClick as () => void}
    >
      {children as React.ReactNode}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/rating-stars', () => ({
  SallaRatingStars: ({ value }: { value: number }) => (
    <span data-testid="rating-stars">{value}</span>
  ),
}));

const { OxProductCard } = await import('../../app/components/product/OxProductCard');

const t = createT('ar');

const SPEC = '<p>الحصص: 30 | حجم الحصة: 31 جم | الصلاحية: 2029-03 | الشكل: بودرة</p>';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 1996831868,
    name: 'Gold Standard Whey',
    description: SPEC + '<p>وصف.</p>',
    url: '/p1996831868',
    type: 'product',
    status: 'sale',
    price: 240,
    sale_price: 240,
    regular_price: 240,
    base_currency_price: 240,
    currency: 'SAR',
    max_quantity: 10,
    image: { url: 'https://cdn.test/a.jpg', alt: 'a' },
    brand: { id: 4, name: 'Optimum Nutrition' },
    is_taxable: true,
    has_read_more: false,
    can_add_note: false,
    can_show_remained_quantity: false,
    can_upload_file: false,
    has_custom_form: false,
    has_metadata: false,
    is_on_sale: false,
    is_hidden_quantity: false,
    is_available: true,
    is_out_of_stock: false,
    is_require_shipping: true,
    has_size_guide: false,
    ...overrides,
  } as never;
}

describe('OxProductCard', () => {
  it('renders no engine card markup at all (the override must replace it)', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.s-product-card-vertical')).toBeNull();
    expect(container.querySelector('.s-product-card-content-footer')).toBeNull();
    expect(container.querySelector('.ox-card-product')).not.toBeNull();
  });

  it('carries the data-ox-product attribute B6 names its view transitions by', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('[data-ox-product="1996831868"]')).not.toBeNull();
  });

  it('keeps the fixed-height rows so a grid of cards shares one baseline', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    for (const cls of [
      '.ox-card-product__brand',
      '.ox-card-product__name',
      '.ox-card-product__chips',
      '.ox-card-product__rating',
      '.ox-card-product__price',
      '.ox-card-product__action',
    ]) {
      expect(container.querySelector(cls), cls).not.toBeNull();
    }
  });

  it('draws the rating row empty at count 0 and never invents stars', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.ox-card-product__rating')?.textContent).toBe('');
    expect(screen.queryByTestId('rating-stars')).toBeNull();
  });

  it('shows the stars only when the store has real reviews', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ rating: { count: 12, stars: 4 } })} />
    );
    expect(container.querySelector('.ox-rating')).not.toBeNull();
    expect(container.querySelector('.ox-rating__value')?.textContent).toBe('4.0');
    expect(screen.getByText(t('ox.pdp.rating_count', { count: 12 }))).toBeTruthy();
  });

  it('renders the spec line off the label and leaves the row empty without one', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const spec = container.querySelector('.ox-card-product__chips')?.textContent ?? '';
    expect(spec).toContain(t('ox.card.servings', { n: 30 }));

    const plain = renderWithProviders(
      <OxProductCard product={makeProduct({ description: '<p>نص عادي.</p>' })} />
    );
    // The row keeps its height so a grid of mixed products shares one
    // baseline, but it states nothing the label did not.
    const empty = plain.container.querySelector('.ox-card-product__chips');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toBe('');
  });

  it('keeps the rating row reserved and empty on a store with no reviews (B28)', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const slot = container.querySelector('.ox-card-product__rating');
    expect(slot).not.toBeNull();
    expect(slot?.textContent).toBe('');
    expect(container.querySelector('.ox-rating')).toBeNull();
  });

  it('badges only from real product flags: out of stock and a real saving', () => {
    const out = renderWithProviders(
      <OxProductCard product={makeProduct({ is_out_of_stock: true, status: 'out' })} />
    );
    expect(out.container.querySelector('.ox-badge--stop')).not.toBeNull();
    expect(out.container.querySelector('.ox-badge--popular')).toBeNull();

    const sale = renderWithProviders(
      <OxProductCard
        product={makeProduct({ is_on_sale: true, regular_price: 300, sale_price: 240 })}
      />
    );
    expect(sale.container.querySelector('.ox-badge--saving')).not.toBeNull();
  });

  it('never renders a "new" badge without a real created_at inside the window', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.ox-badge--new')).toBeNull();
  });

  it('passes the product to the engine add button instead of adding to cart itself', () => {
    renderWithProviders(<OxProductCard product={makeProduct()} />);
    const button = screen.getByTestId('add-button');
    expect(button.getAttribute('data-product-id')).toBe('1996831868');
  });

  it('toggles the wishlist through the engine hook', () => {
    renderWithProviders(<OxProductCard product={makeProduct()} />);
    screen.getByLabelText(t('ox.a11y.wishlist_toggle')).click();
    expect(toggle).toHaveBeenCalledWith(1996831868);
  });
});
