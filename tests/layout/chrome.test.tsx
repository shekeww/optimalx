import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const storeValue: Record<string, unknown> = { name: 'اوبتيمال اكس', contacts: {}, apps: {}, settings: {} };
const twilight: Record<string, unknown> = { location: { pathname: '/' }, store: { settings: {} } };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name, fallback }: { name: string; fallback?: React.ReactNode }) => (
    <span data-hook-slot={name}>{fallback}</span>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/layout', () => ({
  Copyright: ({ storeName }: { storeName?: string }) => <span data-testid="engine-copyright">{storeName}</span>,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({ useStore: () => storeValue }));
vi.mock('@salla.sa/twilight-theme-engine/contexts', () => ({
  useCartContext: () => ({ cart: { count: 1 } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: {
    queries: {
      header: () => ({
        queryKey: ['menu', 'header'],
        queryFn: async () => [{ id: 1, title: 'بروتين', url: '/protein/c1' }],
      }),
    },
    footer: async () => [],
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { BottomTabBar } = await import('../../app/components/layout/BottomTabBar');
const { Footer } = await import('../../app/components/layout/Footer/Footer');
const { TrustLine, maroofId } = await import('../../app/components/layout/Footer/TrustLine');
const { RouteAnnouncer } = await import('../../app/components/layout/RouteAnnouncer');
const { SkipLink } = await import('../../app/components/layout/SkipLink');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

beforeEach(() => {
  setSettings({});
  storeValue.settings = {};
  document.body.className = '';
  twilight.location = { pathname: '/' };
});

describe('SkipLink', () => {
  it('points at the id the engine and the SDK key off', () => {
    const { container } = renderWithProviders(<SkipLink />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('#main-content');
    expect(link.className).toBe('ox-skip');
    expect(link.textContent).toBe('تخطي إلى المحتوى');
  });
});

describe('BottomTabBar', () => {
  it('renders five tabs and takes the body padding class', async () => {
    renderWithProviders(<BottomTabBar />);
    const bar = screen.getByTestId('ox-tabbar');
    expect(bar.getAttribute('aria-label')).toBe('تنقل سريع');
    expect(bar.querySelectorAll('li')).toHaveLength(5);
    await waitFor(() => expect(document.body.classList.contains('ox-has-tabbar')).toBe(true));
  });

  it('is gone while the body carries menu-opened', async () => {
    const { rerender } = renderWithProviders(<BottomTabBar />);
    expect(screen.getByTestId('ox-tabbar')).toBeTruthy();
    act(() => {
      document.body.classList.add('menu-opened');
    });
    rerender(<BottomTabBar />);
    await waitFor(() => expect(screen.queryByTestId('ox-tabbar')).toBeNull());
    // The padding class goes with it: the effect cleanup runs after the commit.
    await waitFor(() => expect(document.body.classList.contains('ox-has-tabbar')).toBe(false));
  });

  it('is gone under a modal and under the product sticky bar', async () => {
    for (const cls of ['modal-is-open', 'ox-sticky-bar']) {
      document.body.className = '';
      const view = renderWithProviders(<BottomTabBar />);
      act(() => {
        document.body.classList.add(cls);
      });
      view.rerender(<BottomTabBar />);
      await waitFor(() => expect(screen.queryByTestId('ox-tabbar')).toBeNull());
      view.unmount();
    }
  });

  it('is gone when the merchant switches it off', () => {
    setSettings({ show_bottom_tabbar: false });
    renderWithProviders(<BottomTabBar />);
    expect(screen.queryByTestId('ox-tabbar')).toBeNull();
  });

  it('asks the header for the drawer instead of navigating on the categories tab', () => {
    const listener = vi.fn();
    window.addEventListener('ox:drawer-open', listener);
    renderWithProviders(<BottomTabBar />);
    fireEvent.click(screen.getByTestId('ox-tab-categories'));
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('ox:drawer-open', listener);
  });
});

describe('TrustLine', () => {
  it('stays hidden while any of the three registrations is empty', () => {
    for (const settings of [
      {},
      { cr_number: '1', vat_number: '2' },
      { cr_number: '1', maroof_url: 'https://maroof.sa/3' },
      { vat_number: '2', maroof_url: 'https://maroof.sa/3' },
    ]) {
      setSettings(settings);
      const view = renderWithProviders(<TrustLine />);
      expect(view.container.querySelector('[data-testid="ox-trust-line"]')).toBeNull();
      // The second line names no payment method and no carrier, so it is not gated.
      expect(view.container.querySelector('[data-testid="ox-payment-line"]')).not.toBeNull();
      view.unmount();
    }
  });

  it('renders with all three, interpolating the Maroof id out of its URL', () => {
    setSettings({ cr_number: '4030000000', vat_number: '300000000000003', maroof_url: 'https://maroof.sa/123456' });
    renderWithProviders(<TrustLine />);
    const line = screen.getByTestId('ox-trust-line').textContent ?? '';
    expect(line).toContain('4030000000');
    expect(line).toContain('300000000000003');
    expect(line).toContain('123456');
    expect(line).not.toContain('{{');
  });

  it('reads the Maroof id off the end of the profile URL', () => {
    expect(maroofId('https://maroof.sa/123456')).toBe('123456');
    expect(maroofId('https://maroof.sa/123456/?x=1')).toBe('123456');
    expect(maroofId('')).toBe('');
  });
});

describe('Footer', () => {
  it('keeps the engine contract: store-footer, both hook slots, the copyright slot with its fallback', async () => {
    const { container } = renderWithProviders(<Footer />);
    const footer = container.querySelector('footer') as HTMLElement;
    expect(footer.classList.contains('store-footer')).toBe(true);
    expect(container.querySelector('[data-hook-slot="footer:start"]')).not.toBeNull();
    expect(container.querySelector('[data-hook-slot="footer:end"]')).not.toBeNull();
    const copyright = container.querySelector('[data-hook-slot="copyright"]');
    expect(copyright).not.toBeNull();
    await waitFor(() => expect(screen.getByTestId('engine-copyright').textContent).toBe('اوبتيمال اكس'));
  });

  it('shows the VAT row only when a VAT number exists', () => {
    const bare = renderWithProviders(<Footer />);
    expect(bare.container.querySelector('[data-testid="ox-footer-vat"]')).toBeNull();
    bare.unmount();

    setSettings({ vat_number: '300000000000003' });
    renderWithProviders(<Footer />);
    expect(screen.getByTestId('ox-footer-vat').textContent).toContain('300000000000003');
  });

  it('names no payment method in text', () => {
    const { container } = renderWithProviders(<Footer />);
    const text = container.textContent ?? '';
    for (const brand of ['مدى', 'أبل باي', 'تابي', 'فيزا', 'Visa', 'Mada']) {
      expect(text).not.toContain(brand);
    }
  });
});

describe('RouteAnnouncer', () => {
  it('says nothing on the first render', () => {
    renderWithProviders(<RouteAnnouncer pathname="/" />);
    const region = screen.getByTestId('ox-route-announcer');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent).toBe('');
  });

  it('announces the new title and moves focus to main after a navigation', async () => {
    const main = document.createElement('main');
    main.id = 'main-content';
    main.tabIndex = -1;
    document.body.appendChild(main);
    document.title = 'صفحة المنتج';

    const view = renderWithProviders(<RouteAnnouncer pathname="/" />);
    view.rerender(<RouteAnnouncer pathname="/whey/p1" />);

    await waitFor(() =>
      expect(screen.getByTestId('ox-route-announcer').textContent).toBe('صفحة المنتج')
    );
    expect(document.activeElement).toBe(main);
    main.remove();
  });
});
