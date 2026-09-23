import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

// `Header` renders the real (lazy) `SallaAdvertisement`, `SallaSearch`,
// `SallaUserMenu` and `SallaCartSummary` behind `<Suspense>`; none are
// mocked here (the header's own render, not the web component's, is what
// this file tests). Their hydration boundary reads `react-intersection-
// observer`'s `useInView`, and jsdom has no `IntersectionObserver` at all -
// once the lazy `import()` resolves (part way through this file's run),
// every later `<Header>` mount crashes on it. A permanent, un-stubbed
// global (not `vi.stubGlobal`, which this file's own `afterEach` clears
// after every test) fixes it for the file's whole lifetime.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub implements IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin = '';
    thresholds: readonly number[] = [];
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub;
}

const themeSettings: Record<string, unknown> = {};
const twilight: Record<string, unknown> = { routeId: 'index', location: { pathname: '/' } };
const leafRouteId = { current: '/{-$locale}/' };
const menuItems: Array<{ id: number; title: string; url: string }> = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
// The engine's routeId is empty in a browser, so the header also reads the
// router's own leaf id; the mock answers with whatever the test set.
vi.mock('@tanstack/react-router', () => ({
  useRouterState: (options?: { select?: (state: unknown) => unknown }) => {
    const state = { matches: [{ routeId: leafRouteId.current }] };
    return options?.select ? options.select(state) : state;
  },
  // `useTaxonomyLinks.ts` (S2b, 2026-09-22) reads `useRouter({ warn: false })`
  // to prefer a route loader's taxonomy data; no test here provides one, so
  // this returns `undefined`, exactly what the real hook returns outside a
  // `<RouterProvider>`, and `useTaxonomyLinks` falls back to its query.
  useRouter: () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ name: 'اوبتيمال اكس', contacts: {}, settings: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/contexts', () => ({
  useCartContext: () => ({ cart: { count: 3 } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: {
    queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => menuItems }) },
    footer: async () => [],
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => [] }) } },
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

const { Header } = await import('../../app/components/layout/Header/Header');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

const realRect = Element.prototype.getBoundingClientRect;

/** jsdom has no layout: the header reports whatever height the test pins. */
function stubHeaderHeight(height: number) {
  Element.prototype.getBoundingClientRect = function rect(this: Element) {
    const value = this.classList.contains('store-header') ? height : 0;
    return { width: 0, height: value, top: 0, left: 0, right: 0, bottom: value, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

/** Fires on `observe()` and keeps the callback for the test to re-fire. */
function stubResizeObserver(): { fire: () => void } {
  const callbacks: Array<() => void> = [];
  class RO {
    constructor(private cb: () => void) {}
    observe() {
      callbacks.push(this.cb);
      this.cb();
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('ResizeObserver', RO);
  return { fire: () => callbacks.forEach((cb) => cb()) };
}

beforeEach(() => {
  menuItems.length = 0;
  twilight.routeId = 'index';
  leafRouteId.current = '/{-$locale}/';
  twilight.location = { pathname: '/' };
  document.documentElement.style.removeProperty('--ox-header-h');
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
  vi.unstubAllGlobals();
});

describe('Header', () => {
  it('keeps the engine contract: store-header, both hook slots, the advertisement slot first', () => {
    setSettings({});
    const { container } = renderWithProviders(<Header />);
    const header = container.querySelector('header') as HTMLElement;
    expect(header.classList.contains('store-header')).toBe(true);
    expect(container.querySelector('[data-hook-slot="header:start"]')).not.toBeNull();
    expect(container.querySelector('[data-hook-slot="header:end"]')).not.toBeNull();
    expect(header.firstElementChild?.getAttribute('data-hook-slot')).toBe('header:start');
    expect(header.children[1].className).toBe('advertisement-slot');
  });

  it('renders no engine MainMenu markup and no h1', () => {
    setSettings({});
    const { container } = renderWithProviders(<Header />);
    expect(container.querySelector('.main-menu, .mobile-menu, #mobile-menu')).toBeNull();
    expect(container.querySelector('h1')).toBeNull();
  });

  it('hides the announcement bar without a threshold and shows it with one', () => {
    setSettings({});
    const bare = renderWithProviders(<Header />);
    expect(bare.container.querySelector('[data-testid="ox-announcement"]')).toBeNull();
    bare.unmount();

    setSettings({ free_shipping_threshold: '299' });
    renderWithProviders(<Header />);
    const bar = screen.getByTestId('ox-announcement');
    expect(bar.textContent).toContain('299');
    // No literal is baked into the copy: the figure came from the setting.
    expect(bar.textContent).not.toContain('{{threshold}}');
  });

  it('renders no wishlist affordance (owner review 2026-09-24, item 3: Shopify has no native wishlist)', () => {
    setSettings({});
    const { container } = renderWithProviders(<Header />);
    expect(screen.queryAllByTestId('ox-count-pill')).toHaveLength(0);
    expect(container.querySelector('.ox-wishlist')).toBeNull();
  });

  it('adds the mobile search row only on the routes that carry one', () => {
    setSettings({});
    // The ids are the engine's semantic ones, which is the fix: the set was
    // written in the router's spelling, so no entry ever matched and the row
    // never rendered anywhere. The home and product pages are in it now too.
    for (const routeId of ['index', 'product.single', 'product.index', 'product.index.search']) {
      twilight.routeId = routeId;
      const view = renderWithProviders(<Header />);
      expect(view.container.querySelector('.ox-mobilebar__search'), routeId).not.toBeNull();
      view.unmount();
    }

    // And the router's own leaf id carries the client pass on its own, which
    // is the pass that was dropping the row: the engine reports an empty
    // routeId in a browser.
    twilight.routeId = '';
    for (const leaf of ['/{-$locale}/', '/{-$locale}/$slug/p{$id}', '/{-$locale}/$slug/c{$id}']) {
      leafRouteId.current = leaf;
      const view = renderWithProviders(<Header />);
      expect(view.container.querySelector('.ox-mobilebar__search'), leaf).not.toBeNull();
      view.unmount();
    }

    // A page in neither spelling has no row.
    leafRouteId.current = '/{-$locale}/about';
    const about = renderWithProviders(<Header />);
    expect(about.container.querySelector('.ox-mobilebar__search')).toBeNull();
  });

  it('opens the drawer on the menu button and removes it from the DOM on close', async () => {
    setSettings({});
    renderWithProviders(<Header />);
    expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull();

    fireEvent.click(screen.getByTestId('ox-menu-button'));
    await waitFor(() => expect(screen.getByTestId('ox-mobile-drawer')).toBeTruthy());
    expect(document.body.classList.contains('menu-opened')).toBe(true);

    fireEvent.click(screen.getByTestId('ox-drawer-close'));
    await waitFor(() => expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull());
    expect(document.body.classList.contains('menu-opened')).toBe(false);
  });

  it('opens the mega panel from تسوق on hover/focus, no setting gates it', async () => {
    setSettings({});
    renderWithProviders(<Header />);
    const shop = screen.getByTestId('ox-nav-shop');
    expect(shop.getAttribute('aria-expanded')).toBe('false');

    fireEvent.focus(shop);
    await waitFor(() => expect(screen.getByTestId('ox-mega-panel')).toBeTruthy());
    expect(shop.getAttribute('aria-expanded')).toBe('true');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await waitFor(() => expect(screen.queryByTestId('ox-mega-panel')).toBeNull());
  });

  it('publishes its measured height on <html> for anchor scroll offsets', async () => {
    setSettings({});
    const observer = stubResizeObserver();
    stubHeaderHeight(96.4);
    const view = renderWithProviders(<Header />);
    const root = document.documentElement;

    await waitFor(() => expect(root.style.getPropertyValue('--ox-header-h')).toBe('96px'));

    // The bar grows (a search row appears, the announcement collapses): the
    // observer republishes rather than leaving a stale offset behind.
    stubHeaderHeight(144);
    act(() => observer.fire());
    await waitFor(() => expect(root.style.getPropertyValue('--ox-header-h')).toBe('144px'));

    view.unmount();
    expect(root.style.getPropertyValue('--ox-header-h')).toBe('');
  });

  it('leaves the variable unset where ResizeObserver does not exist', () => {
    setSettings({});
    vi.stubGlobal('ResizeObserver', undefined);
    renderWithProviders(<Header />);
    // The call sites carry their own fallback, so no value is better than a guess.
    expect(document.documentElement.style.getPropertyValue('--ox-header-h')).toBe('');
  });

  it('gates العروض on show_offers_nav, on by default', () => {
    setSettings({});
    const bare = renderWithProviders(<Header />);
    expect(screen.getByTestId('ox-nav-offers')).toBeTruthy();
    bare.unmount();

    setSettings({ show_offers_nav: false });
    renderWithProviders(<Header />);
    expect(screen.queryByTestId('ox-nav-offers')).toBeNull();
  });

  it('opens the shop sheet on the ox:shop-open event and closes it on Escape', async () => {
    setSettings({});
    const { openShopSheet } = await import('../../app/components/layout/Header/Header');
    renderWithProviders(<Header />);
    expect(screen.queryByTestId('ox-shop-sheet')).toBeNull();

    act(() => openShopSheet());

    await waitFor(() => expect(screen.getByTestId('ox-shop-sheet')).toBeTruthy());
    expect(document.body.classList.contains('modal-is-open')).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await waitFor(() => expect(screen.queryByTestId('ox-shop-sheet')).toBeNull());
    expect(document.body.classList.contains('modal-is-open')).toBe(false);
  });

  it('carries the utility strip whether or not its two outer zones have content', () => {
    setSettings({});
    const bare = renderWithProviders(<Header />);
    // The three trust items are standing statements about the store, so the
    // strip renders even with no contact number and nothing to localise.
    expect(screen.getByTestId('ox-utility-bar')).toBeTruthy();
    expect(screen.getByTestId('ox-utility-trust').querySelectorAll('li')).toHaveLength(3);
    expect(bare.container.querySelector('[data-testid="ox-utility-contact"]')).toBeNull();
    expect(bare.container.querySelector('[data-testid="ox-country-control"]')).toBeNull();
    bare.unmount();

    setSettings({ whatsapp_number: '+966 50 123 4567' });
    renderWithProviders(<Header />);
    expect(screen.getByTestId('ox-utility-contact').getAttribute('href')).toBe(
      'https://wa.me/966501234567'
    );
  });

  it('re-mounts the same three trust items as the mobile scroller', () => {
    setSettings({});
    renderWithProviders(<Header />);
    const scroller = screen.getByTestId('ox-trust-scroller');
    expect(scroller.querySelectorAll('li')).toHaveLength(3);
    // Same copy in both, so the two never disagree; CSS shows exactly one.
    const bar = screen.getByTestId('ox-utility-trust');
    expect(scroller.textContent).toBe(bar.textContent);
  });

  it('collapses the search pill to a glyph on a route with no search row', () => {
    setSettings({});
    twilight.routeId = 'page-single';
    leafRouteId.current = '/{-$locale}/about';
    const about = renderWithProviders(<Header />);
    expect(about.container.querySelector('.ox-search--collapsed')).not.toBeNull();
    expect(about.container.querySelector('.ox-mobilebar__search')).toBeNull();
    about.unmount();

    twilight.routeId = 'product.index.search';
    const search = renderWithProviders(<Header />);
    expect(search.container.querySelector('.ox-mobilebar__search')).not.toBeNull();
    expect(search.container.querySelector('.ox-search--collapsed')).toBeNull();
  });

  it('makes no claim in the chrome that the store cannot support', () => {
    setSettings({});
    const { container } = renderWithProviders(<Header />);
    const text = container.textContent ?? '';
    for (const banned of ['تتبع', 'خلال', 'يوم', 'مجاني', 'مضمونة']) {
      expect(text).not.toContain(banned);
    }
  });
});
