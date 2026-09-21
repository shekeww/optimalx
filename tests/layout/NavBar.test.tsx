import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const twilight: Record<string, unknown> = { routeId: '/{-$locale}/', location: { pathname: '/branch' } };
const menuItems = [
  { id: 1, title: 'بروتين', url: '/protein/c1' },
  { id: 2, title: 'كرياتين', url: '/creatine/c2' },
  { id: 3, title: 'الطاقة', url: '/goal-energy/c3' },
];
const categories: unknown[] = [];

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
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => categories }) } },
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
function stubWidths({ row, item, more }: { row: number; item: number; more: number }) {
  Element.prototype.getBoundingClientRect = function rect(this: Element) {
    let width = 0;
    if (this.classList.contains('ox-nav') || this.classList.contains('ox-nav__list')) width = row;
    else if (this.hasAttribute('data-nav-item')) width = item;
    else if (this.classList.contains('ox-nav__item--more')) width = more;
    return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  twilight.location = { pathname: '/branch' };
  categories.length = 0;
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

  it('counts the row gap, which is what the overflow was overlapping the search with', () => {
    expect(fitCount([100, 100, 100], 400, 96, 32)).toBe(3);
    expect(fitCount([100, 100, 100, 100], 400, 96, 32)).toBe(2);
    expect(fitCount([100, 100, 100, 100], 400, 96, 0)).toBe(4);
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
  it("carries the design's five items, in order, with the advisory among them", async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    await waitFor(() => expect(screen.getByText('المنتجات')).toBeTruthy());
    const labels = Array.from(document.querySelectorAll('[data-nav-item] a, [data-nav-item] button')).map(
      (node) => node.textContent
    );
    // The advisory sits fourth, beside the shopping pillars, not last where
    // the overflow control would take it first (see NavBar.tsx).
    expect(labels).toEqual(['المنتجات', 'المكملات', 'البروتين', 'اسأل قبل أن تشتري', 'المزيد']);
    expect(screen.getByTestId('ox-nav-services').getAttribute('href')).toBe('/services');
    await waitFor(() => expect(screen.queryByTestId('ox-nav-overflow-control')).toBeNull());
  });

  it('المنتجات is a plain link to the full listing while show_goal_nav is off', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-products');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/latest-products');
    expect(link.getAttribute('aria-expanded')).toBeNull();
  });

  it('المنتجات opens the goals and types mega panel once show_goal_nav is on', async () => {
    themeSettings.show_goal_nav = true;
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-products');
    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-mega-panel');
    const goalCards = Array.from(panel.querySelectorAll<HTMLAnchorElement>('.ox-goalcard'));
    expect(goalCards).toHaveLength(6);
    // Only goal-energy exists in the mocked menu tree.
    expect(goalCards[0].getAttribute('href')).toBe('/goal-energy/c3');
    expect(goalCards[1].getAttribute('href')).toContain('/search?q=');
    const typeLinks = Array.from(panel.querySelectorAll<HTMLAnchorElement>('.ox-mega__cats a'));
    expect(typeLinks.length).toBeGreaterThan(0);
  });

  it('المكملات opens a dropdown of the ten types with protein expandable', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-supplements');
    expect(link.getAttribute('href')).toBe('/categories');
    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-nav-types-panel');
    expect(panel.querySelectorAll(':scope > li')).toHaveLength(10);
    const proteinChildren = panel.querySelectorAll('.ox-nav__subdropdown a');
    expect(proteinChildren.length).toBe(5);
  });

  it('البروتين resolves to its live category and lists its five children', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-protein');
    await waitFor(() => expect(link.getAttribute('href')).toBe('/protein/c1'));
    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-nav-protein-panel');
    expect(panel.querySelectorAll('li')).toHaveLength(5);
  });

  it('المزيد is a toggle button listing the four utility categories then the standing pages', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const button = await screen.findByTestId('ox-nav-more');
    expect(button.tagName).toBe('BUTTON');
    fireEvent.click(button);
    const panel = await screen.findByTestId('ox-nav-more-panel');
    const links = Array.from(panel.querySelectorAll('a')).map((a) => a.textContent);
    expect(links).toEqual(
      expect.arrayContaining(['الحزم', 'الاستشارات والخدمات', 'المكتبة الرقمية', 'بطاقات الهدايا', 'الأدلة', 'عن اوبتيمال اكس', 'فرع المدينة المنورة', 'اتصل بنا'])
    );
  });

  it('moves the trailing items into the automatic overflow control on a narrow row', async () => {
    stubWidths({ row: 400, item: 150, more: 96 });
    renderWithProviders(<NavBar />);

    const more = await screen.findByTestId('ox-nav-overflow-control');
    expect(more).toBeTruthy();

    const shown = document.querySelectorAll('[data-nav-item]');
    expect(shown.length).toBe(2);
  });

  it('marks the item matching the current path as the current page', async () => {
    twilight.location = { pathname: '/services' };
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const services = await screen.findByTestId('ox-nav-services');
    expect(services.getAttribute('aria-current')).toBe('page');
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
