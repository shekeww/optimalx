import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const twilight: Record<string, unknown> = { routeId: '/{-$locale}/', location: { pathname: '/branch' } };
const menuItems = [
  { id: 1, title: 'بروتين', url: '/protein/c1' },
  { id: 2, title: 'كرياتين', url: '/creatine/c2' },
  { id: 3, title: 'الطاقة', url: '/goal-energy/c3' },
];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => menuItems }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { NavBar, fitCount } = await import('../../app/components/layout/Header/NavBar');
const { matchesSlug, pathSegments } = await import('../../app/components/layout/Header/useHeaderMenu');
const { resolveNavHref } = await import('../../app/components/layout/navLinks');

const realRect = Element.prototype.getBoundingClientRect;

/** jsdom has no layout, so widths come from the element's role in the row. */
function stubWidths({ row, item, fixed, more }: { row: number; item: number; fixed: number; more: number }) {
  Element.prototype.getBoundingClientRect = function rect(this: Element) {
    let width = 0;
    if (this.classList.contains('ox-nav__list')) width = row;
    else if (this.hasAttribute('data-nav-fixed')) width = fixed;
    else if (this.hasAttribute('data-nav-item')) width = item;
    else if (this.classList.contains('ox-nav__item--more')) width = more;
    return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  twilight.location = { pathname: '/branch' };
  class RO {
    constructor(private cb: () => void) {}
    observe() {
      this.cb();
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('ResizeObserver', RO);
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
  vi.unstubAllGlobals();
});

describe('fitCount', () => {
  it('keeps every item when the row fits', () => {
    expect(fitCount([100, 100, 100], 400, 96)).toBe(3);
  });

  it('makes room for the overflow control once it is needed', () => {
    expect(fitCount([150, 150, 150], 300, 96)).toBe(1);
    expect(fitCount([150, 150, 150], 400, 96)).toBe(2);
  });

  it('can end up with nothing visible on an impossibly narrow row', () => {
    expect(fitCount([150], 100, 96)).toBe(0);
  });
});

describe('slug matching', () => {
  it('reads the segments of a category URL, origin, query and hash ignored', () => {
    expect(pathSegments('/goal-energy/c3')).toEqual(['goal-energy', 'c3']);
    expect(pathSegments('https://x.com/ar/goal-energy/c3?a=1#b')).toEqual(['ar', 'goal-energy', 'c3']);
    expect(pathSegments('/')).toEqual([]);
  });

  it('matches the slug wherever it sits in the path', () => {
    expect(matchesSlug('/goal-energy/c3', 'goal-energy')).toBe(true);
    expect(matchesSlug('https://x.com/ar/goal-energy/c3', 'goal-energy')).toBe(true);
    expect(matchesSlug('/protein/c1', 'goal-energy')).toBe(false);
  });
});

describe('NavBar', () => {
  it('carries the design\'s five items, in its order', async () => {
    stubWidths({ row: 2000, item: 100, fixed: 120, more: 96 });
    renderWithProviders(<NavBar />);
    await waitFor(() => expect(screen.getByText('المنتجات')).toBeTruthy());
    const labels = Array.from(document.querySelectorAll('[data-nav-item] a')).map(
      (node) => node.textContent
    );
    expect(labels).toEqual([
      'المنتجات',
      'المكملات',
      'البروتين',
      'الخطط الغذائية',
      'عن اوبتيمال اكس',
    ]);
    await waitFor(() => expect(screen.queryByTestId('ox-nav-more')).toBeNull());
  });

  it('prefers the live category, then the standing route, then a search', async () => {
    stubWidths({ row: 2000, item: 100, fixed: 120, more: 96 });
    renderWithProviders(<NavBar />);
    const href = (label: string) => screen.getByText(label).getAttribute('href');

    // `protein` exists in the mocked menu, so the item follows it once the
    // menu query resolves.
    await waitFor(() => expect(href('البروتين')).toBe('/protein/c1'));
    // `products` does not, so it falls to its standing route.
    expect(href('المنتجات')).toBe('/latest-products');
    // `supplements` has neither, so it lands on a search for its own label
    // rather than a dead URL.
    expect(href('المكملات')).toContain('/search?q=');
    expect(href('عن اوبتيمال اكس')).toBe('/about');
  });

  it('moves the trailing items into the overflow control on a narrow row', async () => {
    stubWidths({ row: 400, item: 150, fixed: 100, more: 96 });
    renderWithProviders(<NavBar />);

    const more = await screen.findByTestId('ox-nav-more');
    expect(more.textContent).toContain('المزيد');
    expect(more.getAttribute('aria-expanded')).toBe('false');

    // The goals item is off by default, so the whole 400 is the budget; minus
    // the control leaves 304, which fits two 150 wide items out of the five.
    const shown = document.querySelectorAll('[data-nav-item]');
    expect(shown.length).toBe(2);
  });

  it('marks the item matching the current path as the current page', async () => {
    twilight.location = { pathname: '/about' };
    stubWidths({ row: 2000, item: 100, fixed: 120, more: 96 });
    renderWithProviders(<NavBar />);
    const about = await screen.findByText('عن اوبتيمال اكس');
    expect(about.getAttribute('aria-current')).toBe('page');
  });

  it('never marks a search fallback as the current page', async () => {
    twilight.location = { pathname: '/search' };
    stubWidths({ row: 2000, item: 100, fixed: 120, more: 96 });
    renderWithProviders(<NavBar />);
    const supplements = await screen.findByText('المكملات');
    expect(supplements.getAttribute('aria-current')).toBeNull();
  });

  it('resolves a goal to its live category URL and falls back to search', async () => {
    themeSettings.show_goal_nav = true;
    stubWidths({ row: 2000, item: 100, fixed: 120, more: 96 });
    renderWithProviders(<NavBar />);
    const goals = await screen.findByTestId('ox-nav-goals');
    goals.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const panel = await screen.findByTestId('ox-mega-panel');
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>('.ox-goalcard'));
    expect(links).toHaveLength(6);
    // Only goal-energy exists in the mocked menu tree.
    expect(links[0].getAttribute('href')).toBe('/goal-energy/c3');
    expect(links[1].getAttribute('href')).toContain('/search?q=');
  });
});

describe('resolveNavHref', () => {
  const menuTree = [{ id: 1, title: 'بروتين', url: '/protein/c1', children: [] }] as never;

  it('drops an entry that has no slug, no route and no label', () => {
    expect(resolveNavHref({ key: 'x', labelKey: 'x' }, '   ', undefined)).toBeNull();
  });

  it('reads a slug out of a nested child as well as a top-level item', () => {
    const nested = [
      { id: 1, title: 'مكملات', url: '/c1', children: [{ id: 2, title: 'بروتين', url: '/protein/c2' }] },
    ] as never;
    expect(resolveNavHref({ key: 'p', labelKey: 'p', slug: 'protein' }, 'البروتين', nested)).toBe(
      '/protein/c2'
    );
  });

  it('prefers the live category over the standing route', () => {
    expect(
      resolveNavHref({ key: 'p', labelKey: 'p', slug: 'protein', to: '/latest-products' }, 'x', menuTree)
    ).toBe('/protein/c1');
  });
});
