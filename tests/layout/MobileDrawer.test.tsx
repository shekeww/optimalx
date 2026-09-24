import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';

const ar = loadDictionary('ar');
const themeSettings: Record<string, unknown> = {};
const storeValue: Record<string, unknown> = { contacts: {}, settings: {} };
// `StoreContext` (`useTwilight().settings`), not the theme settings above -
// `.languages` lives here (NAV-2026-09-23 addendum, S9g).
const twilightSettings: Record<string, unknown> = {};
// The router's own store, not `useTwilight().location`: `useRouterPathname`
// (navLinks.ts) reads this instead, same reasoning NavBar.test.tsx documents.
const routerLocation: Record<string, unknown> = { pathname: '/ar/x' };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  useTwilight: () => ({
    store: storeValue,
    currency: { code: 'SAR', symbol: 'SAR' },
    locale: 'ar',
    salla: undefined,
    settings: twilightSettings,
  }),
}));
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
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({ useStore: () => storeValue }));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: {
    queries: {
      header: () => ({
        queryKey: ['menu', 'header'],
        queryFn: async () => [{ id: 1, title: 'بروتين', url: '/protein/c1' }],
      }),
    },
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

const { MobileDrawer } = await import('../../app/components/layout/Header/MobileDrawer');

function Harness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <>
      <button type="button" data-testid="opener" onClick={() => setOpen(true)}>
        open
      </button>
      <MobileDrawer id="drawer" open={open} onClose={() => setOpen(false)} />
    </>
  );
}

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  storeValue.contacts = {};
  storeValue.settings = {};
  for (const key of Object.keys(twilightSettings)) delete twilightSettings[key];
  routerLocation.pathname = '/ar/x';
  document.body.className = '';
});

describe('MobileDrawer', () => {
  it('is absent from the DOM while closed', () => {
    const { container } = renderWithProviders(<Harness />);
    expect(container.querySelector('[data-testid="ox-mobile-drawer"]')).toBeNull();
    expect(document.body.classList.contains('menu-opened')).toBe(false);
  });

  it('traps focus while open and returns it to the opener on close', async () => {
    renderWithProviders(<Harness />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);

    const drawer = await screen.findByTestId('ox-mobile-drawer');
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));

    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter((el) => el.tabIndex >= 0);
    const last = focusables[focusables.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(focusables[0]);

    fireEvent.click(screen.getByTestId('ox-drawer-close'));
    await waitFor(() => expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull());
    expect(document.activeElement).toBe(opener);
  });

  it('closes on Escape and on the backdrop', async () => {
    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByTestId('opener'));
    await screen.findByTestId('ox-mobile-drawer');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await waitFor(() => expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull());

    fireEvent.click(screen.getByTestId('opener'));
    await screen.findByTestId('ox-mobile-drawer');
    fireEvent.click(screen.getByTestId('ox-drawer-backdrop'));
    await waitFor(() => expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull());
  });

  it('adds the engine scroll-lock body class only while open', async () => {
    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByTestId('opener'));
    await screen.findByTestId('ox-mobile-drawer');
    expect(document.body.classList.contains('menu-opened')).toBe(true);
    fireEvent.click(screen.getByTestId('ox-drawer-close'));
    await waitFor(() => expect(document.body.classList.contains('menu-opened')).toBe(false));
  });

  it('publishes the same site map the bar does, with the advisory once', async () => {
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const drawer = await screen.findByTestId('ox-mobile-drawer');
    const labels = Array.from(drawer.querySelectorAll('a')).map((node) => node.textContent);
    // اسأل قبل أن تشتري is one of `HEADER_NAV`'s own plain rows, so it is on
    // both the bar and the drawer and duplicated on neither.
    expect(labels.filter((label) => label === 'اسأل قبل أن تشتري')).toHaveLength(1);
    expect(labels).toContain('الأدلة');
    // فرع المدينة المنورة now lives inside المزيد's own accordion (§6.1),
    // not as a flat top-level row.
    expect(labels).toContain('فرع المدينة المنورة');
    expect(labels).toContain(ar['ox.nav.contact']);
    expect(labels).toContain(ar['ox.nav.about']);
    // Brands appear once, as the shop's حسب العلامة axis, never under their
    // old bar label.
    expect(labels.filter((label) => label === ar['ox.nav.by_brand'])).toHaveLength(1);
    expect(labels).not.toContain(ar['ox.nav.brands']);
    unmount();
  });

  it("follows the owner's model: حسب العلامة after the two shop groups, about and contact at the top level", async () => {
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const drawer = await screen.findByTestId('ox-mobile-drawer');
    const list = drawer.querySelector('[data-testid="ox-drawer-list"]') as HTMLElement;
    const topLevel = Array.from(list.children).map((li) => {
      const row = li.querySelector(':scope > .ox-drawer__row');
      return row?.textContent ?? '';
    });
    expect(topLevel).toEqual([
      ar['ox.nav.by_type'],
      ar['ox.nav.by_goal'],
      ar['ox.nav.by_brand'],
      ar['ox.nav.offers'],
      ar['ox.nav.services'],
      ar['ox.nav.about'],
      ar['ox.nav.contact'],
      ar['ox.nav.more'],
      ar['ox.nav.account'],
    ]);
    const axis = screen.getByTestId('ox-drawer-brand-axis');
    expect(axis.tagName).toBe('A');
    expect(axis.getAttribute('href')).toBe('/brands');
    unmount();
  });

  it('renders no wishlist row (owner review 2026-09-24, item 3: Shopify has no native wishlist)', async () => {
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const drawer = await screen.findByTestId('ox-mobile-drawer');
    expect(drawer.querySelector('[data-drawer-account] + [data-drawer-account]')).toBeNull();
    expect(Array.from(drawer.querySelectorAll('a')).map((a) => a.textContent)).not.toContain(
      ar['ox.header.wishlist']
    );
    unmount();
  });

  it("lists حسب النوع before حسب الهدف, with protein's five children nested and the three non-services utility categories appended", async () => {
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const drawer = await screen.findByTestId('ox-mobile-drawer');
    const groupLabels = Array.from(
      drawer.querySelectorAll('.ox-drawer__group > .ox-drawer__row > span')
    ).map((node) => node.textContent);
    expect(groupLabels).toEqual([ar['ox.nav.by_type'], ar['ox.nav.by_goal'], ar['ox.nav.more']]);

    const typeGroup = drawer.querySelectorAll('.ox-drawer__group')[0];
    expect(typeGroup.querySelectorAll('.ox-drawer__sublist a')).toHaveLength(5);
    // 10 type roots + 3 utility categories (bundles, digital library, gift
    // cards; services is excluded, §5.2/§6.1).
    expect(typeGroup.querySelectorAll(':scope > .ox-drawer__panel > .ox-drawer__panel-inner > ul > li'))
      .toHaveLength(13);

    const moreGroup = drawer.querySelectorAll('.ox-drawer__group')[2];
    const moreLabels = Array.from(moreGroup.querySelectorAll('a')).map((a) => a.textContent);
    expect(moreLabels).toEqual([ar['ox.nav.guides'], ar['ox.nav.branch']]);
    unmount();
  });

  it("opening one accordion closes the others (goals open by default, the menu button's own default)", async () => {
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const drawer = await screen.findByTestId('ox-mobile-drawer');
    const [typeToggle, goalToggle] = Array.from(
      drawer.querySelectorAll<HTMLButtonElement>('.ox-drawer__group > .ox-drawer__row')
    );
    expect(goalToggle.getAttribute('aria-expanded')).toBe('true');
    expect(typeToggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(typeToggle);
    expect(typeToggle.getAttribute('aria-expanded')).toBe('true');
    expect(goalToggle.getAttribute('aria-expanded')).toBe('false');
    unmount();
  });

  it('shows a contact row only for the numbers the store actually has', async () => {
    const first = renderWithProviders(<Harness initialOpen />);
    const bare = await screen.findByTestId('ox-mobile-drawer');
    expect(bare.querySelectorAll('.ox-drawer__contact-link')).toHaveLength(0);
    // The second render has to stand alone: the query below reaches the whole
    // document, so leaving this drawer mounted would count its links twice.
    first.unmount();

    storeValue.contacts = { whatsapp: '+966 50 123 4567', phone: '0148000000' };
    const { unmount } = renderWithProviders(<Harness initialOpen />);
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.ox-drawer__contact-link')
    );
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://wa.me/966501234567',
      'tel:0148000000',
    ]);
    unmount();
  });

  /**
   * The drawer's own language switch row (NAV-2026-09-23 addendum, S9g;
   * owner, 2026-09-24: "it should be obvious to be a language switch,
   * showing العربية in English, and EN in the Arabic version").
   */
  describe('language switch', () => {
    it('renders no row when the store is not multilingual (the live store today)', async () => {
      const { unmount } = renderWithProviders(<Harness initialOpen />);
      const drawer = await screen.findByTestId('ox-mobile-drawer');
      expect(drawer.querySelector('[data-testid="ox-language-switch"]')).toBeNull();
      unmount();
    });

    it('renders no row when the store lists only one language', async () => {
      storeValue.settings = { is_multilingual: true };
      twilightSettings.languages = [{ code: 'ar' }];
      const { unmount } = renderWithProviders(<Harness initialOpen />);
      const drawer = await screen.findByTestId('ox-mobile-drawer');
      expect(drawer.querySelector('[data-testid="ox-language-switch"]')).toBeNull();
      unmount();
    });

    it('shows EN, to the /en path, from an Arabic page, and closes the drawer on click', async () => {
      storeValue.settings = { is_multilingual: true };
      twilightSettings.languages = [{ code: 'ar' }, { code: 'en' }];
      routerLocation.pathname = '/ar/x';
      const { unmount } = renderWithProviders(<Harness initialOpen />);
      const drawer = await screen.findByTestId('ox-mobile-drawer');
      const link = drawer.querySelector<HTMLAnchorElement>('[data-testid="ox-language-switch"]');
      expect(link?.textContent).toBe(ar['ox.header.lang_switch_en']);
      expect(link?.getAttribute('href')).toBe('/en/x');
      expect(link?.getAttribute('lang')).toBe('en');
      expect(link?.getAttribute('hreflang')).toBe('en');
      expect(link?.getAttribute('aria-label')).toBe(ar['ox.header.switch_language_en']);

      fireEvent.click(link as HTMLAnchorElement);
      await waitFor(() => expect(screen.queryByTestId('ox-mobile-drawer')).toBeNull());
      unmount();
    });
  });
});
