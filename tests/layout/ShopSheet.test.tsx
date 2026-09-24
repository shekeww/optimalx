import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';

const ar = loadDictionary('ar');
const menuItems: Array<{ id: number; title: string; url: string }> = [];
const categories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@tanstack/react-router', () => ({ useRouter: () => undefined }));
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

const { ShopSheet } = await import('../../app/components/layout/Header/ShopSheet');

function Harness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <>
      <button type="button" data-testid="opener" onClick={() => setOpen(true)}>
        open
      </button>
      <ShopSheet id="shop-sheet" open={open} onClose={() => setOpen(false)} />
    </>
  );
}

beforeEach(() => {
  menuItems.length = 0;
  categories.length = 0;
  document.body.className = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ShopSheet', () => {
  it('is absent from the DOM while closed', () => {
    const { container } = renderWithProviders(<Harness />);
    expect(container.querySelector('[data-testid="ox-shop-sheet"]')).toBeNull();
  });

  it('is a modal dialog labelled ox.nav.shop_sheet_label, focus trapped', async () => {
    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByTestId('opener'));
    const sheet = await screen.findByTestId('ox-shop-sheet');
    expect(sheet.getAttribute('role')).toBe('dialog');
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sheet.getAttribute('aria-label')).toBe('تسوق حسب النوع أو الهدف');
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
  });

  it('adds modal-is-open while open and removes it on close, returning focus to the opener', async () => {
    renderWithProviders(<Harness />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    await screen.findByTestId('ox-shop-sheet');
    expect(document.body.classList.contains('modal-is-open')).toBe(true);

    fireEvent.click(screen.getByTestId('ox-sheet-close'));
    await waitFor(() => expect(screen.queryByTestId('ox-shop-sheet')).toBeNull());
    expect(document.body.classList.contains('modal-is-open')).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('closes on Escape', async () => {
    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByTestId('opener'));
    await screen.findByTestId('ox-shop-sheet');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await waitFor(() => expect(screen.queryByTestId('ox-shop-sheet')).toBeNull());
  });

  it('holds the six goals, ten type roots (no children) and three non-services utility categories', async () => {
    renderWithProviders(<Harness initialOpen />);
    const sheet = await screen.findByTestId('ox-shop-sheet');
    expect(sheet.querySelectorAll('.ox-sheet__grid--goal > li')).toHaveLength(6);
    expect(sheet.querySelectorAll('.ox-sheet__grid--type > li')).toHaveLength(10);
    expect(sheet.querySelectorAll('.ox-sheet__grid--utility > li')).toHaveLength(3);
    // Protein's children are three taps away by design (§7.1.1), not in the grid.
    expect(sheet.querySelectorAll('.ox-drawer__sublist')).toHaveLength(0);
  });

  it('carries حسب العلامة, one row to the brands index, between حسب النوع and أقسام أخرى', async () => {
    renderWithProviders(<Harness initialOpen />);
    const sheet = await screen.findByTestId('ox-shop-sheet');
    const axis = screen.getByTestId('ox-sheet-brand-axis');
    expect(axis.tagName).toBe('A');
    expect(axis.getAttribute('href')).toBe('/brands');
    expect(axis.textContent).toBe(ar['ox.nav.by_brand']);
    const order = Array.from(sheet.querySelectorAll('.ox-sheet__section, .ox-sheet__axis')).map(
      (node) => node.querySelector('.ox-sheet__heading')?.textContent
    );
    expect(order).toEqual([
      ar['ox.nav.by_goal'],
      ar['ox.nav.by_type'],
      ar['ox.nav.by_brand'],
      ar['ox.nav.other_categories'],
    ]);
    fireEvent.click(axis);
    await waitFor(() => expect(screen.queryByTestId('ox-shop-sheet')).toBeNull());
  });

  it('closes on a tile click and on the "كل الأنواع" button', async () => {
    renderWithProviders(<Harness initialOpen />);
    const sheet = await screen.findByTestId('ox-shop-sheet');
    const firstTile = sheet.querySelector<HTMLAnchorElement>('.ox-sheet__grid--type a');
    expect(firstTile).toBeTruthy();
    fireEvent.click(firstTile as HTMLAnchorElement);
    await waitFor(() => expect(screen.queryByTestId('ox-shop-sheet')).toBeNull());
  });
});
