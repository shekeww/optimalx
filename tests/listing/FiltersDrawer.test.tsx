import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';

/** The mobile drawer twin of FiltersRail.test.tsx, see that file's header. */

const historyPush = vi.fn();
let location = { pathname: '/whey-protein/c1', searchStr: '' };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => location,
  useRouter: () => ({ history: { push: historyPush } }),
}));
const sallaFiltersProps = vi.fn();
vi.mock('@salla.sa/twilight-components-react/filters', () => ({
  SallaFilters: (props: Record<string, unknown>) => {
    sallaFiltersProps(props);
    return <div data-testid="salla-filters" data-id={String(props.id)} />;

  },
}));
vi.mock('@salla.sa/twilight-theme-engine/drawer', () => {
  const Drawer = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="filters-drawer">{children}</div> : null;

  Drawer.Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  Drawer.Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  Drawer.Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  return { Drawer };
});

const { FiltersDrawer } = await import('../../app/components/listing/FiltersDrawer');

const BRAND_FILTER: Filter = {
  key: 'brand',
  label: 'Brand',
  type: 'list',
  values: [{ key: '7', value: 'Optimum Nutrition' }],
};

beforeEach(() => {
  historyPush.mockClear();
  sallaFiltersProps.mockClear();
  location = { pathname: '/whey-protein/c1', searchStr: '' };
});

describe('FiltersDrawer', () => {
  it('renders nothing closed or with no filters', () => {
    const { container: closed } = renderWithProviders(
      <FiltersDrawer filters={[BRAND_FILTER]} isOpen={false} onClose={vi.fn()} />

    );
    expect(closed.querySelector('[data-testid="filters-drawer"]')).toBeNull();

    const { container: empty } = renderWithProviders(
      <FiltersDrawer filters={[]} isOpen onClose={vi.fn()} />

    );
    expect(empty.querySelector('[data-testid="filters-drawer"]')).toBeNull();
  });

  it('relabels the brand group to the theme’s own Arabic heading', () => {
    renderWithProviders(<FiltersDrawer filters={[BRAND_FILTER]} isOpen onClose={vi.fn()} />);

    const passed = sallaFiltersProps.mock.calls[0][0].filters as Filter[];
    expect(passed[0].label).toBe('العلامة التجارية');
  });

  it('shows an applied chip for the selected brand and clears it without closing', () => {
    location = { pathname: '/whey-protein/c1', searchStr: '?brand=7' };
    Object.defineProperty(window, 'location', {
      value: { pathname: '/whey-protein/c1', search: '?brand=7' },
      writable: true,
    });
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <FiltersDrawer filters={[BRAND_FILTER]} isOpen onClose={onClose} />

    );
    const chip = container.querySelector('.ox-chip');
    expect(chip?.textContent).toContain('Optimum Nutrition');

    fireEvent.click(container.querySelector('.ox-chip__remove')!);
    expect(historyPush).toHaveBeenCalledTimes(1);
    expect(historyPush.mock.calls[0][0]).not.toContain('brand=7');
    // Clearing our own chip is not `salla-filters::changed`; the drawer stays open.
    expect(onClose).not.toHaveBeenCalled();
  });
});
