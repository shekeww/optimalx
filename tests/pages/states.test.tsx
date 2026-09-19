import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
const storeContacts: Record<string, string> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: storeContacts, social: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="ox-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));
// The header's own search field and the product rail are exercised by their
// owning batches; here they stand in so the state pages can be asserted alone.
vi.mock('../../app/components/layout/Header/MainBar', () => ({
  SearchField: ({ className }: { className?: string }) => (
    <div role="search" aria-label="search" className={className} data-testid="ox-search" />
  ),
}));
vi.mock('../../app/components/blocks/ProductsSliderWrapper', () => ({
  ProductsSliderWrapper: ({ title }: { title?: React.ReactNode }) => (
    <section data-testid="ox-latest">{title}</section>
  ),
}));
// `@salla.sa/twilight-theme-engine/providers` pulls TwilightProvider and with
// it the whole CDN component package (dist/providers/index.js:1), which a
// jsdom run cannot resolve. Only the three error classes matter here, and
// `statusCodeOf` compares with `instanceof`, so the stand-ins are the same
// shape the engine's own mapping tests against.
vi.mock('@salla.sa/twilight-theme-engine/providers', () => {
  class RedirectError extends Error {}
  class NotFoundError extends Error {}
  class UnauthorizedError extends Error {}
  return { RedirectError, NotFoundError, UnauthorizedError };
});

const { NotFound } = await import('../../app/components/pages/NotFound');
const { ErrorState, statusCodeOf } = await import('../../app/components/pages/ErrorState');
const { NotFoundError, RedirectError, UnauthorizedError } = await import(
  '@salla.sa/twilight-theme-engine/providers'
);

const t = createT('ar');

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  for (const key of Object.keys(storeContacts)) delete storeContacts[key];
});

describe('NotFound', () => {
  it('renders exactly one h1 and the search form', () => {
    renderWithProviders(<NotFound />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.error.404_title'));
    expect(screen.getByRole('search')).toBeTruthy();
  });

  it('offers the home route out and the services route out', () => {
    renderWithProviders(<NotFound />);
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/services');
  });

  it('shows the latest-products rail by default and hides it on request', () => {
    const { unmount } = renderWithProviders(<NotFound />);
    expect(screen.getByTestId('ox-latest')).toBeTruthy();
    unmount();
    renderWithProviders(<NotFound showLatest={false} />);
    expect(screen.queryByTestId('ox-latest')).toBeNull();
  });

  it('hides the WhatsApp route out when the store has no number', () => {
    renderWithProviders(<NotFound />);
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((href) => href.includes('wa.me'))).toBe(false);
  });
});

describe('statusCodeOf', () => {
  it('keeps the engine mapping: 404, 401, 400 and 500', () => {
    expect(statusCodeOf(new NotFoundError('gone'))).toBe(404);
    expect(statusCodeOf(new UnauthorizedError('login'))).toBe(401);
    expect(statusCodeOf(Object.assign(new Error('api'), { response: {} }))).toBe(400);
    expect(statusCodeOf(new Error('boom'))).toBe(500);
  });

  it('renders nothing for a redirect, exactly as the engine does', () => {
    expect(statusCodeOf(new RedirectError('/somewhere'))).toBeNull();
  });
});

describe('ErrorState', () => {
  it('shows the generic headline, the retry and the status code', () => {
    const reset = vi.fn();
    renderWithProviders(<ErrorState error={new Error('boom')} reset={reset} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(t('ox.error.generic_title'));
    expect(screen.getByTestId('ox-error-code').textContent).toBe(t('ox.error.code', { code: 500 }));
    expect(screen.getByRole('button', { name: t('ox.common.retry') })).toBeTruthy();
  });

  it('drops the retry button when the boundary gave no reset', () => {
    renderWithProviders(<ErrorState error={new Error('boom')} />);
    expect(screen.queryByRole('button', { name: t('ox.common.retry') })).toBeNull();
  });

  it('answers a not-found error with the 404 page rather than an error page', () => {
    renderWithProviders(<ErrorState error={new NotFoundError('gone')} />);
    expect(screen.getByTestId('ox-notfound')).toBeTruthy();
    expect(screen.queryByTestId('ox-error-state')).toBeNull();
    // A data source may be what failed, so the 404 inside a boundary carries
    // no second data-driven block.
    expect(screen.queryByTestId('ox-latest')).toBeNull();
  });

  it('renders nothing at all for a redirect', () => {
    const { container } = renderWithProviders(<ErrorState error={new RedirectError('/x')} />);
    expect(container.querySelector('[data-testid="ox-error-state"]')).toBeNull();
    expect(container.textContent).toBe('');
  });
});
