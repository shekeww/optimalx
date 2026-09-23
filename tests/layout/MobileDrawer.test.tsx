import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';

const ar = loadDictionary('ar');
const themeSettings: Record<string, unknown> = {};
const storeValue: Record<string, unknown> = { contacts: {}, settings: {} };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  useTwilight: () => ({ store: { settings: {} }, currency: { code: 'SAR', symbol: 'SAR' }, locale: 'ar', salla: undefined }),
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
    unmount();
  });

  it('lists حسب النوع before حسب الهدف, with protein's five children nested and the three non-services utility categories appended', async () => {
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
    expect(moreLabels).toEqual([
      ar['ox.nav.about_brand'],
      ar['ox.nav.branch'],
      ar['ox.nav.contact'],
    ]);
    unmount();
  });

  it('opening one accordion closes the others (goals open by default, the menu button's own default)', async () => {
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
});
