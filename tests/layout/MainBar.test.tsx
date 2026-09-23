import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

/**
 * MainBar.tsx itself was not touched by NAV-2026-09-23 (only its stylesheet
 * selectors changed: gap, `position: relative`, the search pill's flex
 * basis). This file exists because the coordinator observed permanent grey
 * discs on the account and cart buttons, and a grey search block, on the
 * live preview at 1440 - a Salla web-component skeleton state, not this
 * theme's markup (see docs/build/progress/S3d.md addendum 3). What this
 * suite actually proves: our own React tree still passes the right slot
 * content and props to those components; a real browser's shadow DOM for
 * `salla-search`/`salla-user-menu`/`salla-cart-summary` is not something
 * jsdom renders, so it is out of reach here either way.
 */

const themeSettings: Record<string, unknown> = {};
const wishlistValue: Record<string, unknown> = { ids: [], count: 0 };
const menuItems: Array<{ id: number; title: string; url: string }> = [];
const categories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => ({ locale: 'ar' }) }));
vi.mock('@tanstack/react-router', () => ({
  useRouterState: (options?: { select?: (state: unknown) => unknown }) => {
    const state = { location: { pathname: '/ar' } };
    return options?.select ? options.select(state) : state;
  },
  useRouter: () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => wishlistValue,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ name: 'اوبتيمال اكس', contacts: {}, settings: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => menuItems }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => categories }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  // `activeOptions` is real TanStack Router `Link` API, consumed by the
  // engine's own adapter and never reaching a DOM anchor; destructured out
  // rather than spread (this mock is a dumb passthrough to a DOM `<a>`).
  Link: ({ to, children, activeOptions: _activeOptions, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
// The real components are Salla's custom-element wrappers; jsdom cannot
// render their shadow DOM, so they are mocked to plain elements that echo
// what MainBar.tsx actually passed them - the same props and slot content a
// real browser's light DOM would carry into the component either way.
vi.mock('@salla.sa/twilight-components-react/search', () => ({
  SallaSearch: (props: Record<string, unknown>) => (
    <div data-testid="mock-salla-search" data-inline={String(props.inline ?? false)} data-oval={String(props.oval ?? false)} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/user-menu', () => ({
  SallaUserMenu: (props: Record<string, unknown>) => (
    <div
      data-testid="mock-salla-user-menu"
      data-avatar-only={String(props.avatarOnly ?? false)}
      data-show-header={String(props.showHeader ?? false)}
      className={props.className as string}
    />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/cart-summary', () => ({
  SallaCartSummary: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mock-salla-cart-summary" className={className}>
      {children}
    </div>
  ),
}));

const { MainBar } = await import('../../app/components/layout/Header/MainBar');

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  wishlistValue.count = 0;
  menuItems.length = 0;
  categories.length = 0;
});

describe('MainBar', () => {
  it('renders the search field, inline and oval, not the collapsed glyph', async () => {
    renderWithProviders(<MainBar />);
    expect(screen.getByTestId('ox-search')).toBeTruthy();
    const search = await screen.findByTestId('mock-salla-search');
    expect(search.getAttribute('data-inline')).toBe('true');
    expect(search.getAttribute('data-oval')).toBe('true');
  });

  it('passes avatarOnly and showHeader to the account control', async () => {
    renderWithProviders(<MainBar />);
    const account = await screen.findByTestId('mock-salla-user-menu');
    expect(account.getAttribute('data-avatar-only')).toBe('true');
    expect(account.getAttribute('data-show-header')).toBe('true');
    expect(account.className).toContain('ox-iconbtn');
  });

  it('slots the drawn cart icon (not sicon-shopping-bag) into the cart control', async () => {
    renderWithProviders(<MainBar />);
    const cart = await screen.findByTestId('mock-salla-cart-summary');
    expect(cart.className).toContain('ox-cartbtn');
    const icon = cart.querySelector('svg.ox-icon use');
    expect(icon?.getAttribute('href')).toBe('#ox-cart');
    expect(cart.querySelector('.sicon-shopping-bag')).toBeNull();
  });

  it('renders the wishlist link with the drawn heart glyph (not sicon-heart)', () => {
    renderWithProviders(<MainBar />);
    const wishlist = screen.getByLabelText('المفضلة');
    const icon = wishlist.querySelector('svg.ox-icon use');
    expect(icon?.getAttribute('href')).toBe('#ox-heart');
    expect(wishlist.querySelector('.sicon-heart')).toBeNull();
  });
});
