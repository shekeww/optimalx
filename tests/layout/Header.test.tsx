import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const twilight: Record<string, unknown> = { routeId: '/{-$locale}/', location: { pathname: '/' } };
const menuItems: Array<{ id: number; title: string; url: string }> = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ name: 'اوبتيمال اكس', contacts: {}, settings: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ ids: [], count: 2 }),
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
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
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
  twilight.routeId = '/{-$locale}/';
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

  it('carries the cart and wishlist counts as aria-hidden pills', () => {
    setSettings({});
    renderWithProviders(<Header />);
    const pills = screen.getAllByTestId('ox-count-pill');
    expect(pills.length).toBeGreaterThan(0);
    for (const pill of pills) expect(pill.getAttribute('aria-hidden')).toBe('true');
    expect(pills.map((p) => p.textContent)).toContain('2');
  });

  it('adds the mobile search row only on the routes that carry one', () => {
    setSettings({});
    const home = renderWithProviders(<Header />);
    expect(home.container.querySelector('.ox-mobilebar__search')).toBeNull();
    home.unmount();

    twilight.routeId = '/{-$locale}/search';
    const search = renderWithProviders(<Header />);
    expect(search.container.querySelector('.ox-mobilebar__search')).not.toBeNull();
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

  it('opens the mega panel from the goals item and closes it on Escape', async () => {
    setSettings({});
    renderWithProviders(<Header />);
    const goals = screen.getByTestId('ox-nav-goals');
    expect(goals.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(goals);
    await waitFor(() => expect(screen.getByTestId('ox-mega-panel')).toBeTruthy());
    expect(goals.getAttribute('aria-expanded')).toBe('true');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await waitFor(() => expect(screen.queryByTestId('ox-mega-panel')).toBeNull());
    expect(document.activeElement).toBe(goals);
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

  it('drops the goals item when show_goal_nav is off', () => {
    setSettings({ show_goal_nav: false });
    renderWithProviders(<Header />);
    expect(screen.queryByTestId('ox-nav-goals')).toBeNull();
  });
});
