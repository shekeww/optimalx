import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import { renderWithProviders } from '../helpers/render';

/**
 * The claims gates on the cart block (PLAN-final 5.1): the free-shipping bar
 * only with a threshold, the VAT line only with a VAT number, and payment
 * marks only through `SallaPayments` - never a method name in text.
 */
const themeSettings: Record<string, unknown> = {};
let cartContext: { cart: Cart } | null = null;

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/contexts', () => ({
  useCartContext: () => cartContext,
}));
vi.mock('@salla.sa/twilight-components-react/payments', () => ({
  SallaPayments: () => React.createElement('salla-payments', { 'data-testid': 'salla-payments' }),
}));

const { CartTrust } = await import('../../app/components/commerce/CartTrust');

function cart(partial: Partial<Cart>): Cart {
  return partial as Cart;
}

describe('CartTrust', () => {
  beforeEach(() => {
    for (const key of Object.keys(themeSettings)) delete themeSettings[key];
    cartContext = null;
  });

  it('renders no free-shipping bar when the owner has set no threshold', () => {
    renderWithProviders(<CartTrust cart={cart({ sub_total: 100 })} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders the bar with the interpolated remainder, never a literal', () => {
    themeSettings.free_shipping_threshold = '200';
    renderWithProviders(<CartTrust cart={cart({ sub_total: 120 })} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
    expect(screen.getByText(/80/)).toBeTruthy();
  });

  it('switches the bar to the reached line at the threshold', () => {
    themeSettings.free_shipping_threshold = '200';
    renderWithProviders(<CartTrust cart={cart({ sub_total: 400 })} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText('الشحن مجاني لهذا الطلب')).toBeTruthy();
  });

  it('hides the VAT line until the store has a VAT number', () => {
    renderWithProviders(<CartTrust cart={cart({ sub_total: 100 })} />);
    expect(screen.queryByText('الأسعار شاملة ضريبة القيمة المضافة')).toBeNull();
  });

  it('shows the VAT line once the VAT number is set', () => {
    themeSettings.vat_number = '3001234567';
    renderWithProviders(<CartTrust cart={cart({ sub_total: 100 })} />);
    expect(screen.getByText('الأسعار شاملة ضريبة القيمة المضافة')).toBeTruthy();
  });

  it('reads the cart from the engine context when given no prop', () => {
    themeSettings.free_shipping_threshold = '200';
    cartContext = { cart: cart({ sub_total: 100 }) };
    renderWithProviders(<CartTrust />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
  });

  it('always offers the branch pickup alternative beside the bar', () => {
    themeSettings.free_shipping_threshold = '200';
    renderWithProviders(<CartTrust cart={cart({ sub_total: 100 })} />);
    expect(screen.getByText('أو استلم مجانا من فرع الخالدية')).toBeTruthy();
  });

  it('names no payment method in text', () => {
    renderWithProviders(<CartTrust cart={cart({ sub_total: 100 })} />);
    const text = document.body.textContent ?? '';
    for (const mark of ['مدى', 'أبل باي', 'تابي', 'فيزا', 'Visa', 'Mada']) {
      expect(text.includes(mark)).toBe(false);
    }
  });
});
