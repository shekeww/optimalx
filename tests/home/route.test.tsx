import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_PATHS } from '../../app/components/home/defaults';

/**
 * The home route (PLAN-final B2): the default composition when the merchant has
 * configured nothing (C2), the merchant's own blocks otherwise, the visually
 * hidden h1 when the hero block is gone (C19), and the C12 canonical.
 */

interface LoaderData {
  locale: string;
  components: { path: string; key?: string }[];
  page: { slug: string };
}

let loaderData: LoaderData = { locale: 'ar', components: [], page: { slug: 'index' } };
let routeOptions: Record<string, any> = {};

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: Record<string, unknown>) => {
    routeOptions = options;
    return { ...options, useLoaderData: () => loaderData };
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

vi.mock('@salla.sa/twilight-theme-engine/routes/home', () => ({
  Home: {
    id: 'index',
    loader: async () => loaderData,
    head: () => ({}),
    Component: ({ components = [] }: { components?: { path: string; key?: string }[] }) => (
      <div data-testid="home-page">
        {components.map((component, index) => (
          <span data-testid="home-block" key={component.key ?? index}>
            {component.path}
          </span>
        ))}
      </div>
    ),
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({
  withHead:
    (
      route: { head: (ctx: unknown) => Record<string, unknown> },
      extend?: (result: Record<string, unknown>, ctx: unknown) => Record<string, unknown>
    ) =>
    (ctx: unknown) => {
      const base = { canonical: 'https://store.example/ar/', openGraph: {}, alternateLanguages: [{ hreflang: 'ar' }] };
      return extend ? extend(base, ctx) : base;
    },
}));

const routeModule = await import('../../app/routes/index');
const HomeComponent = routeModule.Route.component as React.ComponentType;

function setLoader(next: Partial<LoaderData>) {
  loaderData = { locale: 'ar', components: [], page: { slug: 'index' }, ...next };
}

describe('home route composition', () => {
  it('renders the twelve DIRECTION 6.2 blocks, in order, when the merchant has none', () => {
    setLoader({ components: [] });
    renderWithProviders(<HomeComponent />);
    const blocks = screen.getAllByTestId('home-block').map((node) => node.textContent);
    expect(blocks).toEqual([...HOME_BLOCK_PATHS]);
  });

  it('renders the merchant composition untouched when there is one', () => {
    setLoader({ components: [{ path: 'ox-goals', key: 'a' }, { path: 'ox-faq', key: 'b' }] });
    renderWithProviders(<HomeComponent />);
    expect(screen.getAllByTestId('home-block').map((node) => node.textContent)).toEqual([
      'ox-goals',
      'ox-faq',
    ]);
  });
});

describe('the one h1 rule (C19)', () => {
  it('leaves the h1 to the hero when the hero block is in the composition', () => {
    setLoader({ components: [] });
    const { container } = renderWithProviders(<HomeComponent />);
    expect(container.querySelector('h1')).toBeNull();
  });

  it('renders the keyword line as a visually hidden h1 when the hero is gone', () => {
    setLoader({ components: [{ path: 'ox-goals', key: 'a' }] });
    const { container } = renderWithProviders(<HomeComponent />);
    const heading = container.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading?.className).toContain('ox-sr-only');
    expect(heading?.textContent).toBe('اوبتيمال اكس: متجر مكملات غذائية ورياضية أصلية');
  });
});

describe('head (C12)', () => {
  // A single-language store serves `/` and redirects `/ar/x` to `/x`, so the
  // served path differs with the store, not only the canonical.
  const ctx = (multilingual: boolean) => ({
    locale: 'ar',
    location: { pathname: multilingual ? '/ar/' : '/' },
    settings: { store: { url: 'https://store.example/ar/', settings: { is_multilingual: multilingual } } },
  });

  it('prefixes the canonical and og:url on a multilingual store and keeps hreflang', () => {
    const head = routeOptions.head(ctx(true)) as Record<string, any>;
    expect(head.canonical).toBe('https://store.example/ar/');
    expect(head.openGraph.url).toBe('https://store.example/ar/');
    expect(head.alternateLanguages).toBeDefined();
    expect(head.robots).toBe('index, follow');
  });

  it('drops the prefix and the hreflang cluster on a single-language store', () => {
    const head = routeOptions.head(ctx(false)) as Record<string, any>;
    expect(head.canonical).toBe('https://store.example/');
    expect(head.alternateLanguages).toBeUndefined();
  });
});
