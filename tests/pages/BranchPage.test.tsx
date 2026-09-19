import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
const storeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: storeSettings, contacts: {}, social: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useOpeningHours: () => ({ isOpen: false, isEnabled: false, nextOpen: null, nextOpenFormatted: '' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="ox-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@salla.sa/twilight-components-react/map', () => ({
  SallaMap: (props: Record<string, unknown>) => <div data-testid="salla-map" data-lat={String(props.lat)} />,
}));

const { BranchPage } = await import('../../app/components/pages/BranchPage');

const t = createT('ar');
// 2026-09-17 is a Thursday, inside the Sunday-to-Thursday row.
const THURSDAY_NOON = new Date('2026-09-17T12:00:00');
const HOURS = ['الأحد إلى الخميس: 09:00 - 23:00', 'الجمعة: 16:00 - 23:00'].join('\n');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

beforeEach(() => {
  setSettings({});
  for (const key of Object.keys(storeSettings)) delete storeSettings[key];
});

describe('BranchPage', () => {
  it('renders one h1 and it is the mandated keyword headline', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.content.branch.h1'));
  });

  it('hides the hours table while branch_hours is empty', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-hours-status')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows the parsed hours table once the setting carries real hours', () => {
    setSettings({ branch_hours: HOURS });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByTestId('ox-hours-today')).toBeTruthy();
  });

  it('hides the pickup steps until BOTH pickup numbers are set', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-pickup-steps')).toBeNull();

    setSettings({ pickup_ready_hours: '4' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-pickup-steps')).toBeNull();
  });

  it('renders the pickup steps with both numbers interpolated once they are set', () => {
    setSettings({ pickup_ready_hours: '4', pickup_hold_days: '3' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const steps = screen.getByTestId('ox-pickup-steps');
    expect(steps.textContent).toContain('4');
    expect(steps.textContent).toContain('3');
    expect(steps.textContent).not.toContain('{{');
  });

  it('hides the map entirely with no maps key and no branch_map_url', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-branch-map')).toBeNull();
  });

  it('falls back to the plate and the map link when only branch_map_url is set', () => {
    setSettings({ branch_map_url: 'https://maps.example/branch' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const map = screen.getByTestId('ox-branch-map');
    expect(screen.queryByTestId('salla-map')).toBeNull();
    const link = map.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://maps.example/branch');
  });

  it('refuses a javascript: map url rather than putting it in an href', () => {
    setSettings({ branch_map_url: 'javascript:alert(1)' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-branch-map')).toBeNull();
    expect(document.body.innerHTML).not.toContain('javascript:');
  });

  it('renders the native map when the store carries a maps key', () => {
    Object.assign(storeSettings, { keys: { maps: 'test-key' } });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.getByTestId('ox-branch-map')).toBeTruthy();
  });

  it('drops the FAQ row whose answer still needs an unset setting', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    // The price row interpolates {{threshold}} and the hold row
    // {{PICKUP_HOLD_DAYS}}; only the walk-in row can be answered today.
    expect(screen.getByText(t('ox.content.branch.faq_2_q'))).toBeTruthy();
    expect(screen.queryByText(t('ox.content.branch.faq_1_q'))).toBeNull();
    expect(document.body.textContent).not.toContain('{{');
  });
});
