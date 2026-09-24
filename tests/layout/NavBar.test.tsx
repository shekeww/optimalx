import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { MORE_NAV } from '../../app/content/nav';

const ar = loadDictionary('ar');
const themeSettings: Record<string, unknown> = {};
const twilight: Record<string, unknown> = {
  routeId: '/{-$locale}/',
  locale: 'ar',
};
// The router's own store, not `useTwilight().location`: that context is
// empty during SSR and only filled in after hydration, so an active-route
// test built on it renders "nothing active" on the server and "this item is
// active" on the client the moment the item's route matches - a hydration
// mismatch (coordinator finding, 2026-09-23). `useRouterPathname`
// (navLinks.ts) reads this store instead, which is filled in identically on
// both passes.
const routerLocation: Record<string, unknown> = { pathname: '/' };
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
vi.mock('@tanstack/react-router', () => ({
  useRouterState: (options?: { select?: (state: unknown) => unknown }) => {
    const state = { location: routerLocation };
    return options?.select ? options.select(state) : state;
  },
  // `useTaxonomyLinks.ts` prefers a route loader's taxonomy data; no test
  // here provides one, so this returns `undefined` and the hook falls back
  // to its own query, exactly like outside a `<RouterProvider>`.
  useRouter: () => undefined,
}));
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
  // `activeOptions` is real TanStack Router `Link` API, consumed by the
  // engine's own adapter and never reaching a DOM anchor; this mock is a
  // dumb passthrough, so it is destructured out here rather than spread
  // onto the `<a>` (React otherwise warns about an unrecognised DOM prop).
  Link: ({ to, children, activeOptions: _activeOptions, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { NavBar, computeFold } = await import('../../app/components/layout/Header/NavBar');
const { matchesShopRoute, resolveNavHref, stripLocale, withLocale } = await import(
  '../../app/components/layout/navLinks'
);

const realRect = Element.prototype.getBoundingClientRect;

/** jsdom has no layout, so widths come from the element's role in the row. */
function stubWidths({ row, item, more }: { row: number; item: number; more: number }) {
  Element.prototype.getBoundingClientRect = function rect(this: Element) {
    let width = 0;
    if (this.classList.contains('ox-nav') || this.classList.contains('ox-nav__list')) width = row;
    else if (this.getAttribute('data-nav-item') === 'more') width = more;
    else if (this.hasAttribute('data-nav-item')) width = item;
    return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  twilight.locale = 'ar';
  routerLocation.pathname = '/';
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

describe('computeFold', () => {
  // The Arabic row's measured widths (the owner's navigation review: about
  // and contact on the bar, brands and guides off it). The nav box is the
  // viewport less 715px between 1024 and the container's cap.
  const items = [
    { key: 'shop', width: 57.7, pin: true },
    { key: 'offers', width: 49.3 },
    { key: 'services', width: 121.1, pin: true },
    { key: 'about', width: 47.6 },
    { key: 'contact', width: 71.8 },
    { key: 'more', width: 55.1 },
  ];

  it('folds nothing when the row fits (1280, nav box 565)', () => {
    expect(computeFold(items, 565, 24)).toEqual(new Set());
  });

  it('folds only تواصل معنا at 1200 (nav box 485), keeping تسوق and اسأل قبل أن تشتري', () => {
    expect(computeFold(items, 485, 24)).toEqual(new Set(['contact']));
  });

  it('folds من نحن next at 1120 (nav box 405)', () => {
    expect(computeFold(items, 405, 24)).toEqual(new Set(['contact', 'about']));
  });

  it('folds العروض too at 1024 (nav box 309)', () => {
    expect(computeFold(items, 309, 24)).toEqual(new Set(['contact', 'about', 'offers']));
  });

  it('never folds a pinned item even on an impossibly narrow row', () => {
    const folded = computeFold(items, 0, 24);
    expect(folded.has('shop')).toBe(false);
    expect(folded.has('services')).toBe(false);
    expect(folded.has('more')).toBe(false);
  });
});

describe('matchesShopRoute', () => {
  it('matches every catalogue route named in §7.3', () => {
    for (const path of [
      '/categories',
      '/offers',
      '/latest-products',
      '/most-sales-products',
      '/brands',
      '/brands/some-brand',
      '/tags/some-tag',
      '/whey-protein/c9001',
      '/whey-protein/p9001',
      '/some-brand/brand-9001',
      '/some-tag/tag-9001',
    ]) {
      expect(matchesShopRoute(path), path).toBe(true);
    }
  });

  it('does not match a non-catalogue route', () => {
    for (const path of ['/services', '/blog', '/branch', '/about', '/contact', '/']) {
      expect(matchesShopRoute(path), path).toBe(false);
    }
  });
});

describe('stripLocale', () => {
  it('removes a two-letter locale segment', () => {
    expect(stripLocale('/ar/offers')).toBe('/offers');
    expect(stripLocale('/en/account/profile')).toBe('/account/profile');
  });

  it('leaves an unprefixed path alone', () => {
    expect(stripLocale('/offers')).toBe('/offers');
    expect(stripLocale('/')).toBe('/');
  });
});

describe('withLocale', () => {
  it('prefixes a bare path with the active locale', () => {
    expect(withLocale('/categories', 'ar')).toBe('/ar/categories');
    expect(withLocale('/categories', 'en')).toBe('/en/categories');
  });

  it('defaults to ar when no locale is known', () => {
    expect(withLocale('/categories', undefined)).toBe('/ar/categories');
  });

  it('does not double-prefix an already-prefixed path', () => {
    expect(withLocale('/ar/categories', 'ar')).toBe('/ar/categories');
  });
});

describe('NavBar', () => {
  it("carries the owner's six items, in order: brands and guides off the bar, about and contact on it", async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    await waitFor(() => expect(screen.getByTestId('ox-nav-shop')).toBeTruthy());
    const labels = Array.from(document.querySelectorAll('[data-nav-item] a, [data-nav-item] button')).map(
      (node) => node.textContent
    );
    expect(labels).toEqual([
      'تسوق',
      'العروض',
      'اسأل قبل أن تشتري',
      ar['ox.nav.about'],
      ar['ox.nav.contact'],
      'المزيد',
    ]);
    expect(screen.queryByTestId('ox-nav-brands')).toBeNull();
    expect(screen.queryByTestId('ox-nav-guides')).toBeNull();
  });

  it('hides العروض when show_offers_nav is false, keeping the other five', async () => {
    themeSettings.show_offers_nav = false;
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    await waitFor(() => expect(screen.getByTestId('ox-nav-shop')).toBeTruthy());
    expect(screen.queryByTestId('ox-nav-offers')).toBeNull();
    const labels = Array.from(document.querySelectorAll('[data-nav-item] a, [data-nav-item] button')).map(
      (node) => node.textContent
    );
    expect(labels).toEqual(['تسوق', 'اسأل قبل أن تشتري', ar['ox.nav.about'], ar['ox.nav.contact'], 'المزيد']);
  });

  it('تسوق is a raw, locale-prefixed anchor that opens the mega panel on focus', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-shop');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/ar/categories');
    expect(link.getAttribute('aria-expanded')).toBe('false');

    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-mega-panel');
    expect(link.getAttribute('aria-expanded')).toBe('true');
    expect(panel.querySelectorAll('h3.ox-mega__heading').length).toBeGreaterThanOrEqual(2);
  });

  it('the mega panel carries حسب العلامة as its brand axis, in place of the old all-brands foot link', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    fireEvent.focus(await screen.findByTestId('ox-nav-shop'));
    const panel = await screen.findByTestId('ox-mega-panel');
    const headings = Array.from(panel.querySelectorAll('h3.ox-mega__heading')).map((h) => h.textContent);
    expect(headings).toEqual([ar['ox.nav.by_type'], ar['ox.nav.by_goal'], ar['ox.nav.by_brand']]);
    const axis = screen.getByTestId('ox-mega-brand-axis');
    expect(axis.tagName).toBe('A');
    expect(axis.getAttribute('href')).toBe('/brands');
    expect(axis.textContent).toBe(ar['ox.nav.by_brand']);
    const footLabels = Array.from(panel.querySelectorAll('.ox-mega__foot a')).map((a) => a.textContent);
    expect(footLabels).toEqual([ar['ox.nav.all_types']]);
    expect(panel.textContent).not.toContain(ar['ox.nav.all_brands']);
  });

  it('Escape inside the mega panel closes it and returns focus to تسوق', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-shop');
    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-mega-panel');

    fireEvent.keyDown(panel, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('ox-mega-panel')).toBeNull());
    expect(document.activeElement).toBe(link);
  });

  it('Tab from تسوق into its panel keeps the panel open, so حسب العلامة is reachable from the keyboard', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const link = await screen.findByTestId('ox-nav-shop');
    fireEvent.focus(link);
    const panel = await screen.findByTestId('ox-mega-panel');
    const firstPanelLink = panel.querySelector('a') as HTMLElement;
    expect(firstPanelLink).toBeTruthy();

    // The Tab: تسوق blurs toward the panel's first link, inside the same item.
    fireEvent.blur(link, { relatedTarget: firstPanelLink });
    fireEvent.focus(firstPanelLink);
    // Past the 200ms close delay the blur used to schedule.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 320));
    });
    expect(screen.getByTestId('ox-mega-panel')).toBeTruthy();
    expect(screen.getByTestId('ox-mega-brand-axis')).toBeTruthy();

    // Leaving the item altogether still closes it.
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    fireEvent.blur(firstPanelLink, { relatedTarget: outside });
    await waitFor(() => expect(screen.queryByTestId('ox-mega-panel')).toBeNull());
    outside.remove();
  });

  it('Escape inside المزيد closes it and returns focus to the المزيد button', async () => {
    routerLocation.pathname = '/ar/blog';
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const button = await screen.findByTestId('ox-nav-more');
    fireEvent.click(button);
    const panel = await screen.findByTestId('ox-nav-more-panel');
    const entry = panel.querySelector('a') as HTMLElement;
    entry.focus();
    expect(document.activeElement).toBe(entry);

    fireEvent.keyDown(entry, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('ox-nav-more-panel')).toBeNull());
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes a hover-opened المزيد without pulling focus out of the search field', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const button = await screen.findByTestId('ox-nav-more');
    fireEvent.click(button);
    await screen.findByTestId('ox-nav-more-panel');
    const search = document.createElement('input');
    document.body.appendChild(search);
    search.focus();

    fireEvent.keyDown(search, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('ox-nav-more-panel')).toBeNull());
    expect(document.activeElement).toBe(search);
    search.remove();
  });

  it('المزيد closes when focus Tabs out of it, and stays open while focus moves between its entries', async () => {
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const button = await screen.findByTestId('ox-nav-more');
    fireEvent.click(button);
    const panel = await screen.findByTestId('ox-nav-more-panel');
    const [first, second] = Array.from(panel.querySelectorAll('a')) as HTMLElement[];

    fireEvent.blur(button, { relatedTarget: first });
    fireEvent.blur(first, { relatedTarget: second });
    // A blur with no target (a mouse click on an entry in Safari) keeps it open.
    fireEvent.blur(second, { relatedTarget: null });
    expect(screen.getByTestId('ox-nav-more-panel')).toBeTruthy();

    const search = document.createElement('input');
    document.body.appendChild(search);
    fireEvent.blur(second, { relatedTarget: search });
    await waitFor(() => expect(screen.queryByTestId('ox-nav-more-panel')).toBeNull());
    expect(button.getAttribute('aria-expanded')).toBe('false');
    search.remove();
  });

  it('المزيد lists whatever folded off the row plus its standing pages, the guides and the branch', async () => {
    stubWidths({ row: 292, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const button = await screen.findByTestId('ox-nav-more');
    expect(button.tagName).toBe('BUTTON');
    fireEvent.click(button);
    const panel = await screen.findByTestId('ox-nav-more-panel');
    const links = Array.from(panel.querySelectorAll('a')).map((a) => a.textContent);
    // The row is too narrow (292) for anything but the two pinned items and
    // المزيد itself, so العروض, من نحن and تواصل معنا all folded in, ahead
    // of the guides and the branch.
    expect(links).toEqual([
      'العروض',
      ar['ox.nav.about'],
      ar['ox.nav.contact'],
      ...MORE_NAV.map((entry) => ar[entry.labelKey]),
    ]);
    expect(MORE_NAV.map((entry) => entry.key)).toEqual(['guides', 'branch']);
    expect(document.querySelectorAll('[data-nav-item]')).toHaveLength(3);
  });

  it('marks تسوق active on a catalogue route and العروض active on its own route', async () => {
    routerLocation.pathname = '/ar/offers';
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const shop = await screen.findByTestId('ox-nav-shop');
    expect(shop.getAttribute('aria-current')).toBe('page');
    const offers = await screen.findByTestId('ox-nav-offers');
    expect(offers.getAttribute('aria-current')).toBe('page');
    const about = await screen.findByTestId('ox-nav-about');
    expect(about.hasAttribute('aria-current')).toBe(false);
  });

  it('marks تسوق active on the brands index, which lives inside it now', async () => {
    routerLocation.pathname = '/ar/brands';
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const shop = await screen.findByTestId('ox-nav-shop');
    expect(shop.getAttribute('aria-current')).toBe('page');
  });

  it('marks من نحن and تواصل معنا active on their own routes', async () => {
    routerLocation.pathname = '/ar/contact';
    stubWidths({ row: 2000, item: 100, more: 96 });
    const first = renderWithProviders(<NavBar />);
    expect((await screen.findByTestId('ox-nav-contact')).getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('ox-nav-about').hasAttribute('aria-current')).toBe(false);
    first.unmount();

    routerLocation.pathname = '/ar/about';
    renderWithProviders(<NavBar />);
    expect((await screen.findByTestId('ox-nav-about')).getAttribute('aria-current')).toBe('page');
  });

  it('marks المزيد on a guides page and the guides link inside it as the current page', async () => {
    routerLocation.pathname = '/ar/blog/some-guide';
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    const more = await screen.findByTestId('ox-nav-more');
    expect(more.className).toContain('is-active');
    fireEvent.click(more);
    const panel = await screen.findByTestId('ox-nav-more-panel');
    const current = Array.from(panel.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent);
    expect(current).toEqual([ar['ox.nav.guides']]);
  });

  it('marks nothing active on the home route (the coordinator hydration-mismatch report, 2026-09-23)', async () => {
    routerLocation.pathname = '/ar';
    stubWidths({ row: 2000, item: 100, more: 96 });
    renderWithProviders(<NavBar />);
    await screen.findByTestId('ox-nav-shop');
    const links = document.querySelectorAll('.ox-nav__link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.className, link.textContent ?? '').not.toContain('is-active');
      expect(link.hasAttribute('aria-current'), link.textContent ?? '').toBe(false);
    }
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

  it('drops the origin from an absolute menu URL', () => {
    const absolute = [
      { id: 1, title: 'بروتين', url: 'https://optimalx.com.sa/protein/c9001', children: [] },
    ] as never;
    expect(resolveNavHref({ key: 'p', labelKey: 'p', slug: 'protein' }, 'x', absolute)).toBe(
      '/protein/c9001'
    );
  });
});
