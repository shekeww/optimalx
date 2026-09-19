import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

/**
 * The cart's title row (DIRECTION 6.9 row 1), rendered into `cart:start`.
 *
 * The item count is the visitor's own cart count from the API. It is the one
 * number on this page and it is never computed, defaulted or filled in: with
 * no cart resolved the row prints the lead line instead, so the page never
 * shows a zero on the way in.
 */
let cartContext: { cart: Cart } | null = null;

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/contexts', () => ({
  useCartContext: () => cartContext,
}));

const { CartHeader } = await import('../../app/components/commerce/CartHeader');

const t = createT('ar');

function cart(partial: Partial<Cart>): Cart {
  return partial as Cart;
}

describe('CartHeader', () => {
  beforeEach(() => {
    cartContext = null;
  });

  it('is the page h1, in the theme voice', () => {
    renderWithProviders(<CartHeader cart={cart({ count: 2 })} />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.cart.title'));
  });

  it('interpolates the cart own count, never a literal', () => {
    renderWithProviders(<CartHeader cart={cart({ count: 3 })} />);
    expect(screen.getByText(t('ox.cart.items_count', { count: 3 }))).toBeTruthy();
  });

  it('prints the lead line rather than a zero while the cart is unresolved', () => {
    renderWithProviders(<CartHeader />);
    expect(screen.getByText(t('ox.cart.lead'))).toBeTruthy();
    expect(screen.queryByText(/0/)).toBeNull();
  });

  it('prints the lead line for a cart whose count the API did not send', () => {
    renderWithProviders(<CartHeader cart={cart({ sub_total: 120 })} />);
    expect(screen.getByText(t('ox.cart.lead'))).toBeTruthy();
  });

  it('reads the cart from the engine context when no prop is given', () => {
    cartContext = { cart: cart({ count: 5 }) };
    renderWithProviders(<CartHeader />);
    expect(screen.getByText(t('ox.cart.items_count', { count: 5 }))).toBeTruthy();
  });
});
