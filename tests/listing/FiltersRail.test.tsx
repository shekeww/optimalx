import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { Filter } from '@salla.sa/twilight-theme-engine/api/product';

/**
 * The desktop filter rail, and the brand group it adds (S2f item 6): a
 * relabel of the one group the payload's own `key` marks as brand, and an
 * applied-chip row above the widget with its own clear action. `salla-filters`
 * itself is the platform's own black box, so it is mocked to expose the
 * `filters` prop it was actually handed, which is the whole of what this file
 * can control.
 */

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

const { FiltersRail } = await import('../../app/components/listing/FiltersRail');

const BRAND_FILTER: Filter = {
  key: 'brand',
  label: 'Brand',
  type: 'list',
  values: [
    { key: '7', value: 'Optimum Nutrition' },
    { key: '9', value: 'MyProtein' },
  ],
};
const PRICE_FILTER: Filter = { key: 'price', label: 'السعر', type: 'range' };

beforeEach(() => {
  historyPush.mockClear();
  sallaFiltersProps.mockClear();
  location = { pathname: '/whey-protein/c1', searchStr: '' };
});

describe('FiltersRail', () => {
  it('renders nothing with no filters at all', () => {
    const { container } = renderWithProviders(<FiltersRail filters={[]} />);

    expect(container.querySelector('.ox-filters')).toBeNull();
  });

  it('passes every non-brand filter through untouched \u2014 no group invented', () => {
    renderWithProviders(<FiltersRail filters={[PRICE_FILTER]} />);

    expect(sallaFiltersProps).toHaveBeenCalledWith(
      expect.objectContaining({ filters: [PRICE_FILTER] })
    );
    expect(document.querySelector('.ox-filters__applied')).toBeNull();
  });

  it('relabels only the brand group, to the theme’s own Arabic heading', () => {
    renderWithProviders(<FiltersRail filters={[PRICE_FILTER, BRAND_FILTER]} />);

    const passed = sallaFiltersProps.mock.calls[0][0].filters as Filter[];
    expect(passed[0]).toBe(PRICE_FILTER); // untouched, same reference
    expect(passed[1].key).toBe('brand');
    expect(passed[1].label).toBe('العلامة التجارية');
    expect(passed[1].values).toBe(BRAND_FILTER.values); // values untouched
  });

  it('is data-gated: no brand key in the payload, no relabel and no chip row', () => {
    renderWithProviders(<FiltersRail filters={[PRICE_FILTER]} />);

    const passed = sallaFiltersProps.mock.calls[0][0].filters as Filter[];
    expect(passed[0].label).toBe('السعر');
    expect(document.querySelector('.ox-filters__applied')).toBeNull();
  });

  it('renders an applied chip per selected brand value, from the URL', () => {
    location = { pathname: '/whey-protein/c1', searchStr: '?brand=7' };
    const { container } = renderWithProviders(<FiltersRail filters={[BRAND_FILTER]} />);

    const chips = container.querySelectorAll('.ox-filters__applied .ox-chip');
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain('Optimum Nutrition');
  });

  it('clears one applied brand value on the chip’s remove control, keeping the rest', () => {
    location = { pathname: '/whey-protein/c1', searchStr: '?brand=7&brand=9&sort=price-asc' };
    Object.defineProperty(window, 'location', {
      value: { pathname: '/whey-protein/c1', search: '?brand=7&brand=9&sort=price-asc' },
      writable: true,
    });
    const { container } = renderWithProviders(<FiltersRail filters={[BRAND_FILTER]} />);

    const removeButtons = container.querySelectorAll('.ox-chip__remove');
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]);
    expect(historyPush).toHaveBeenCalledTimes(1);
    const pushed = historyPush.mock.calls[0][0] as string;
    expect(pushed).toContain('brand=9');
    expect(pushed).not.toContain('brand=7');
    expect(pushed).toContain('sort=price-asc');
  });
});
