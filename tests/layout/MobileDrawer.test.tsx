import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

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
