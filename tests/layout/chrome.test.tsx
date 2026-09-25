import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const storeValue: Record<string, unknown> = { name: 'اوبتيمال اكس', contacts: {}, apps: {}, settings: {} };
const twilight: Record<string, unknown> = { location: { pathname: '/' }, store: { settings: {} } };
// BottomTabBar reads the router's own store, not the Twilight context (that
// context is empty during SSR - see BottomTabBar.tsx's useRouterPathname),
// so its tests drive the active tab through this instead of `twilight`.
const routerLocation: Record<string, unknown> = { pathname: '/' };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({ useTwilight: () => twilight }));
vi.mock('@tanstack/react-router', () => ({
  useRouterState: (options?: { select?: (state: unknown) => unknown }) => {
    const state = { location: routerLocation };
    return options?.select ? options.select(state) : state;
  },
  // `useTaxonomyLinks.ts` (S2b, 2026-09-22) reads `useRouter({ warn: false })`
  // to prefer a route loader's taxonomy data; no test here provides one, so
  // this returns `undefined`, exactly what the real hook returns outside a
  // `<RouterProvider>`, and `useTaxonomyLinks` falls back to its query.
  useRouter: () => undefined,
}));
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
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { BottomTabBar } = await import('../../app/components/layout/BottomTabBar');
const { Footer } = await import('../../app/components/layout/Footer/Footer');
const { RegistrationBlock } = await import(
  '../../app/components/layout/Footer/RegistrationBlock'
);
const { RouteAnnouncer } = await import('../../app/components/layout/RouteAnnouncer');
const { SkipLink } = await import('../../app/components/layout/SkipLink');
const { findMenuLink } = await import('../../app/content/nav');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

beforeEach(() => {
  setSettings({});
  storeValue.settings = {};
  document.body.className = '';
  twilight.location = { pathname: '/' };
  routerLocation.pathname = '/';
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

  it('marks the home tab active from the router state, not the Twilight context', () => {
    // Twilight's own location is deliberately wrong here: the fix this
    // guards is BottomTabBar reading the router's store instead (Twilight's
    // is empty during SSR, which is the hydration mismatch the bug report
    // caught on this exact tab).
    twilight.location = { pathname: '' };
    routerLocation.pathname = '/';
    renderWithProviders(<BottomTabBar />);
    const home = screen.getByText('الرئيسية').closest('a');
    expect(home?.className).toBe('ox-tab is-active');
    expect(home?.getAttribute('aria-current')).toBe('page');
  });

  it('does not mark the home tab active on another route', () => {
    routerLocation.pathname = '/search';
    renderWithProviders(<BottomTabBar />);
    const home = screen.getByText('الرئيسية').closest('a');
    expect(home?.className).toBe('ox-tab');
    expect(home?.hasAttribute('aria-current')).toBe(false);
    const search = screen.getByText('البحث').closest('a');
    expect(search?.className).toBe('ox-tab is-active');
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

  it('opens the shop sheet instead of navigating on the تسوق tab', () => {
    const listener = vi.fn();
    window.addEventListener('ox:shop-open', listener);
    renderWithProviders(<BottomTabBar />);
    const shop = screen.getByTestId('ox-tab-shop');
    expect(shop.tagName).toBe('BUTTON');
    expect(shop.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(shop);
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('ox:shop-open', listener);
  });

  it('lights تسوق on every catalogue route, exact-match only elsewhere', () => {
    for (const path of ['/categories', '/offers', '/whey-protein/c9001']) {
      routerLocation.pathname = path;
      const view = renderWithProviders(<BottomTabBar />);
      const shop = screen.getByTestId('ox-tab-shop');
      expect(shop.className, path).toContain('is-active');
      view.unmount();
    }

    routerLocation.pathname = '/services';
    const view = renderWithProviders(<BottomTabBar />);
    expect(screen.getByTestId('ox-tab-shop').className).not.toContain('is-active');
    view.unmount();
  });

  it('matches routes exactly, not with path.includes()', () => {
    // The old test at BottomTabBar.tsx:91 matched `/cart` inside
    // `/account/cart-anything` (S3c finding 9). An exact/prefix test never
    // lights two tabs for one route.
    routerLocation.pathname = '/account/cart-anything';
    renderWithProviders(<BottomTabBar />);
    const cart = screen.getByText('السلة').closest('a');
    const account = screen.getByText('حسابي').closest('a');
    expect(cart?.className).not.toContain('is-active');
    expect(account?.className).toContain('is-active');
  });

  it('draws the cart icon rather than sicon-shopping-bag', () => {
    renderWithProviders(<BottomTabBar />);
    const cart = screen.getByText('السلة').closest('a');
    expect(cart?.querySelector('.ox-icon')).not.toBeNull();
    expect(cart?.querySelector('.sicon-shopping-bag')).toBeNull();
  });
});

describe('RegistrationBlock', () => {
  it('drops the whole numbers block when neither number is set, and keeps the social row', () => {
    setSettings({});
    const { container } = renderWithProviders(<RegistrationBlock />);
    expect(container.querySelector('[data-testid="ox-footer-numbers"]')).toBeNull();
    expect(container.querySelector('[data-testid="ox-footer-cr"]')).toBeNull();
    expect(container.querySelector('[data-testid="ox-footer-vat"]')).toBeNull();
    // The column is not empty: the social row is its remaining content.
    expect(container.querySelector('.ox-footer__social')).not.toBeNull();
  });

  it('gates the two lines separately', () => {
    setSettings({ cr_number: '4030000000' });
    const crOnly = renderWithProviders(<RegistrationBlock />);
    expect(crOnly.container.querySelector('[data-testid="ox-footer-cr"]')).not.toBeNull();
    expect(crOnly.container.querySelector('[data-testid="ox-footer-vat"]')).toBeNull();
    crOnly.unmount();

    setSettings({ vat_number: '300000000000003' });
    const vatOnly = renderWithProviders(<RegistrationBlock />);
    expect(vatOnly.container.querySelector('[data-testid="ox-footer-cr"]')).toBeNull();
    expect(vatOnly.container.querySelector('[data-testid="ox-footer-vat"]')).not.toBeNull();
    vatOnly.unmount();
  });

  it('interpolates the numbers and never prints a placeholder', () => {
    setSettings({ cr_number: '4030000000', vat_number: '300000000000003' });
    renderWithProviders(<RegistrationBlock />);
    const block = screen.getByTestId('ox-footer-numbers').textContent ?? '';
    expect(block).toContain('4030000000');
    expect(block).toContain('300000000000003');
    expect(block).not.toContain('{{');
  });

  it('asserts no VAT position anywhere while the store holds no registration', () => {
    setSettings({});
    const { container } = renderWithProviders(<RegistrationBlock />);
    expect(container.textContent ?? '').not.toContain('ضريبة القيمة المضافة');
  });
});

describe('findMenuLink', () => {
  it('returns nothing rather than a guess when the page is not published', () => {
    expect(findMenuLink([], ['privacy'])).toBeUndefined();
    expect(findMenuLink(undefined, ['privacy'])).toBeUndefined();
    expect(findMenuLink([{ id: 1, title: 'من نحن', url: '/about' }], ['privacy'])).toBeUndefined();
  });

  it('matches on either the URL or the merchant-written title', () => {
    const items = [
      { id: 1, title: 'سياسة الخصوصية', url: '/pages/p-9' },
      { id: 2, title: 'Terms', url: '/terms-and-conditions/page-2' },
    ];
    expect(findMenuLink(items, ['privacy', 'الخصوصية'])?.id).toBe(1);
    expect(findMenuLink(items, ['terms', 'الشروط'])?.id).toBe(2);
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
    // The fallback is the theme's own Arabic line with the year, not the
    // engine's English "Copyright | <year> <store>" (phase B, HC-16).
    await waitFor(() =>
      expect(screen.getByTestId('ox-footer-copyright').textContent).toBe(
        `اوبتيمال اكس ${new Date().getFullYear()}. جميع الحقوق محفوظة.`
      )
    );
    expect(screen.queryByTestId('engine-copyright')).toBeNull();
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

  it('carries the brand block and the design\'s three link columns', async () => {
    renderWithProviders(<Footer />);
    expect(screen.getByTestId('ox-footer-brand')).toBeTruthy();
    const headings = await waitFor(() => {
      const found = Array.from(document.querySelectorAll('.ox-footer__heading')).map(
        (node) => node.textContent
      );
      expect(found.length).toBeGreaterThan(0);
      return found;
    });
    expect(headings).toEqual(['عن اوبتيمال اكس', 'خدمة العملاء', 'المنتجات', 'حسب الهدف']);
  });

  it('carries the six goal links in its own column (NAV-2026-09-23 §9)', async () => {
    renderWithProviders(<Footer />);
    const columns = await screen.findByTestId('ox-footer-columns');
    await waitFor(() => {
      const heading = Array.from(columns.querySelectorAll('.ox-footer__heading')).find(
        (node) => node.textContent === 'حسب الهدف'
      );
      expect(heading).toBeTruthy();
      const goalColumn = heading?.closest('.ox-footer__col');
      expect(goalColumn?.querySelectorAll('li a').length).toBe(6);
    });
  });

  it('drops a policy link the merchant has not published, and never invents one', async () => {
    renderWithProviders(<Footer />);
    const columns = await screen.findByTestId('ox-footer-columns');
    const hrefs = Array.from(columns.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    // menu.footer() is empty in this mock, so terms, privacy and returns are
    // absent rather than pointed at a guessed URL.
    expect(hrefs).not.toContain('/terms');
    expect(hrefs).not.toContain('/privacy');
    expect(hrefs.some((href) => href?.includes('return'))).toBe(false);
    // The standing routes are still there.
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/contact');
  });

  it('shows the WhatsApp row only when the store publishes a number', async () => {
    const bare = renderWithProviders(<Footer />);
    const bareColumns = await screen.findByTestId('ox-footer-columns');
    expect(
      Array.from(bareColumns.querySelectorAll('a')).some((a) =>
        a.getAttribute('href')?.includes('wa.me')
      )
    ).toBe(false);
    bare.unmount();

    storeValue.contacts = { whatsapp: '+966 50 123 4567' };
    renderWithProviders(<Footer />);
    const columns = await screen.findByTestId('ox-footer-columns');
    const whatsapp = Array.from(columns.querySelectorAll('a')).find((a) =>
      a.getAttribute('href')?.includes('wa.me')
    );
    expect(whatsapp?.getAttribute('href')).toBe('https://wa.me/966501234567');
    storeValue.contacts = {};
  });

  it('carries the branch address and the store rating in the contact column (VISIT-2026-09-24 §4.5)', async () => {
    const bare = renderWithProviders(<Footer />);
    const bareColumns = await screen.findByTestId('ox-footer-columns');
    expect(bareColumns.querySelector('.ox-footer__address')).toBeNull();
    expect(bareColumns.querySelector('[data-testid="ox-store-rating"]')).toBeNull();
    bare.unmount();

    setSettings({
      branch_address: 'حي الخالدية، شارع جبار بن صخر',
      google_place_url: 'https://maps.google.com/place/1',
      google_rating: '5.0',
      google_review_count: '80',
      google_verified_at: '2026-09-24',
    });
    storeValue.contacts = { whatsapp: '+966 50 123 4567' };
    renderWithProviders(<Footer />);
    const columns = await screen.findByTestId('ox-footer-columns');
    expect(columns.querySelector('.ox-footer__address')?.textContent).toBe(
      'حي الخالدية، شارع جبار بن صخر'
    );
    const rating = columns.querySelector('[data-testid="ox-store-rating"]');
    expect(rating).not.toBeNull();
    expect(rating?.className).toContain('ox-gr--inline');
    // The WhatsApp entry stays alongside the new address and rating.
    expect(
      Array.from(columns.querySelectorAll('a')).some((a) => a.getAttribute('href')?.includes('wa.me'))
    ).toBe(true);
    storeValue.contacts = {};
  });

  it('keeps the unapproved Latin tagline behind a setting that is off', () => {
    const bare = renderWithProviders(<Footer />);
    expect(bare.container.querySelector('[data-testid="ox-footer-en-tagline"]')).toBeNull();
    bare.unmount();

    setSettings({ show_en_tagline: true });
    renderWithProviders(<Footer />);
    expect(screen.getByTestId('ox-footer-en-tagline').textContent).toContain('Fuel Your Progress');
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
