import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';

const ar = loadDictionary('ar');
const en = loadDictionary('en');
const themeSettings: Record<string, unknown> = {};
const storeValue: Record<string, unknown> = { contacts: {}, settings: {} };
const twilight: Record<string, unknown> = { store: { settings: {} }, settings: {} };
// The router's own store, not `useTwilight().location` (NAV-2026-09-23
// addendum, S9g): `useRouterPathname` (navLinks.ts) reads this instead, the
// same reasoning NavBar.test.tsx documents for its own copy of this mock.
const routerLocation: Record<string, unknown> = { pathname: '/ar/x' };
const menuItems: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
vi.mock('@tanstack/react-router', () => ({
  useRouterState: (options?: { select?: (state: unknown) => unknown }) => {
    const state = { location: routerLocation };
    return options?.select ? options.select(state) : state;
  },
  useRouter: () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({ useStore: () => storeValue }));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: {
    queries: { footer: () => ({ queryKey: ['menu', 'footer'], queryFn: async () => menuItems }) },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { UtilityBar } = await import('../../app/components/layout/Header/UtilityBar');

beforeEach(() => {
  storeValue.contacts = {};
  twilight.store = { settings: {} };
  twilight.settings = {};
  routerLocation.pathname = '/ar/x';
});

describe('UtilityBar language switch', () => {
  it('renders no link when the store is not multilingual', () => {
    renderWithProviders(<UtilityBar />);
    expect(screen.queryByTestId('ox-language-switch')).toBeNull();
  });

  it('renders no link when the store is multilingual but lists only one language', () => {
    twilight.store = { settings: { is_multilingual: true } };
    twilight.settings = { languages: [{ code: 'ar' }] };
    renderWithProviders(<UtilityBar />);
    expect(screen.queryByTestId('ox-language-switch')).toBeNull();
  });

  it('shows EN, to the /en path, from an Arabic page', () => {
    twilight.store = { settings: { is_multilingual: true } };
    twilight.settings = { languages: [{ code: 'ar' }, { code: 'en' }] };
    routerLocation.pathname = '/ar/x';
    renderWithProviders(<UtilityBar />);
    const link = screen.getByTestId('ox-language-switch');
    expect(link.textContent).toBe(ar['ox.header.lang_switch_en']);
    expect(link.textContent).toBe('EN');
    expect(link.getAttribute('href')).toBe('/en/x');
    expect(link.getAttribute('lang')).toBe('en');
    expect(link.getAttribute('hreflang')).toBe('en');
    expect(link.getAttribute('aria-label')).toBe(ar['ox.header.switch_language_en']);
  });

  it('shows العربية, to the /ar path, from an English page', () => {
    twilight.store = { settings: { is_multilingual: true } };
    twilight.settings = { languages: [{ code: 'ar' }, { code: 'en' }] };
    routerLocation.pathname = '/en/x';
    renderWithProviders(<UtilityBar />, { locale: 'en' });
    const link = screen.getByTestId('ox-language-switch');
    expect(link.textContent).toBe(en['ox.header.lang_switch_ar']);
    expect(link.textContent).toBe('العربية');
    expect(link.getAttribute('href')).toBe('/ar/x');
    expect(link.getAttribute('lang')).toBe('ar');
    expect(link.getAttribute('hreflang')).toBe('ar');
  });

  it('offers no country selector: the old country control is gone', () => {
    twilight.store = { settings: { is_multilingual: true } };
    twilight.settings = { languages: [{ code: 'ar' }, { code: 'en' }] };
    renderWithProviders(<UtilityBar />);
    expect(screen.queryByTestId('ox-country-control')).toBeNull();
  });
});
