import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
const storeSettings: Record<string, unknown> = {};
// Mutable copy of the real manifest: every test starts with the real store
// photos and no 'mark-wall' entry, matching production until the owner's
// photograph lands; a test can add or delete the key to exercise both states
// of the masthead band (conductor addendum, S9a-V2).
const storePhotosStub: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('../../app/content/store-photos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../app/content/store-photos')>();
  Object.assign(storePhotosStub, actual.STORE_PHOTOS);
  return { ...actual, STORE_PHOTOS: storePhotosStub };
});
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
  delete storePhotosStub['mark-wall'];
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

  it('shows the click-to-load facade with no maps key and no branch_map_url (VISIT §4.4)', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const map = screen.getByTestId('ox-branch-map');
    expect(screen.queryByTestId('salla-map')).toBeNull();
    expect(screen.queryByTestId('ox-branch-map-frame')).toBeNull();
    expect(map.querySelector('img')).toBeTruthy();
    // The listing's own facts render with no setting at all: turn-by-turn and
    // the audited listing URL, never blank buttons.
    const links = Array.from(map.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toContain('https://www.google.com/maps/dir/?api=1&destination=24.4630382,39.6533422');
    expect(links).toContain('https://maps.google.com/?cid=2204940348214661233');
  });

  it('swaps the facade for the embed iframe on tap, never before', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-branch-map-frame')).toBeNull();
    fireEvent.click(screen.getByTestId('ox-branch-map-view'));
    const frame = screen.getByTestId('ox-branch-map-frame');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(
      'https://maps.google.com/maps?q=24.4630382,39.6533422&z=16&hl=ar&output=embed'
    );
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-popups');
  });

  it('falls back to branch_map_url for "افتح في خرائط جوجل" when google_place_url is unset', () => {
    setSettings({ branch_map_url: 'https://maps.example/branch' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const map = screen.getByTestId('ox-branch-map');
    const openLink = screen.getByText(t('ox.content.branch.map_open_google')).closest('a');
    expect(openLink?.getAttribute('href')).toBe('https://maps.example/branch');
    expect(map.querySelector('img')).toBeTruthy();
  });

  it('prefers google_place_url over branch_map_url for "افتح في خرائط جوجل"', () => {
    setSettings({
      branch_map_url: 'https://maps.example/branch',
      google_place_url: 'https://maps.google.com/place/1',
    });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const openLink = screen.getByText(t('ox.content.branch.map_open_google')).closest('a');
    expect(openLink?.getAttribute('href')).toBe('https://maps.google.com/place/1');
  });

  it('refuses a javascript: map url rather than putting it in an href, falling back to the listing', () => {
    setSettings({ branch_map_url: 'javascript:alert(1)' });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const openLink = screen.getByText(t('ox.content.branch.map_open_google')).closest('a');
    expect(openLink?.getAttribute('href')).toBe('https://maps.google.com/?cid=2204940348214661233');
    expect(document.body.innerHTML).not.toContain('javascript:');
  });

  it('renders the native map when the store carries a maps key', async () => {
    Object.assign(storeSettings, { keys: { maps: 'test-key' } });
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(await screen.findByTestId('salla-map')).toBeTruthy();
  });

  it('drops the FAQ row whose answer still needs an unset setting', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    // The price row interpolates {{threshold}} and the hold row
    // {{PICKUP_HOLD_DAYS}}; only the walk-in row can be answered today.
    expect(screen.getByText(t('ox.content.branch.faq_2_q'))).toBeTruthy();
    expect(screen.queryByText(t('ox.content.branch.faq_1_q'))).toBeNull();
    expect(document.body.textContent).not.toContain('{{');
  });

  it('renders the store rating (through OxBranch) only once the four google_* settings are complete', () => {
    const { rerender } = renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-store-rating')).toBeNull();

    setSettings({
      google_place_url: 'https://maps.google.com/place/1',
      google_rating: '5.0',
      google_review_count: '80',
      google_verified_at: '2026-09-24',
    });
    rerender(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.getAllByTestId('ox-store-rating').length).toBeGreaterThan(0);
  });

  it('passes OxBranch the storefront photo', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const branch = screen.getByTestId('ox-branch');
    const photo = branch.querySelector('img');
    expect(photo?.getAttribute('src')).toBe('/assets/store/storefront.webp');
  });

  // S9h: the gallery drops its own storefront tile here, since OxBranch's
  // cover directly above already shows that photograph.
  it('renders the three-photo gallery, storefront dropped', () => {
    const { container } = renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.getByTestId('ox-branch-gallery')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="ox-branch-gallery-cover"]')).toHaveLength(3);
    expect(container.querySelector('[data-cover="storefront"]')).toBeNull();
  });

  it('mounts the mobile visit sticky bar, hidden until its anchor scrolls away', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    const bar = screen.getByTestId('ox-visit-sticky');
    expect(bar.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getAllByText(t('ox.content.services.visit_cta_short')).length).toBeGreaterThan(0);
  });
});

describe('BranchPage masthead band (conductor addendum, S9a-V2)', () => {
  it('renders the plain header, no band, while the manifest carries no mark-wall entry', () => {
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(screen.queryByTestId('ox-band')).toBeNull();
    expect(document.querySelector('.ox-page-head')).toBeTruthy();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.content.branch.h1'));
  });

  it('opens on the S7b-style band once the manifest carries mark-wall, still one h1', () => {
    storePhotosStub['mark-wall'] = {
      photo: '/assets/store/mark-wall.webp',
      width: 900,
      height: 1200,
      widths: [400, 900],
    };
    renderWithProviders(<BranchPage now={THURSDAY_NOON} />);
    expect(document.querySelector('.ox-page-head')).toBeNull();
    const band = screen.getByTestId('ox-band');
    expect(band.className).toContain('ox-page--branch__band');
    const photo = band.querySelector('img');
    expect(photo?.getAttribute('src')).toBe('/assets/store/mark-wall.webp');
    expect(photo?.getAttribute('alt')).toBe(t('ox.content.branch.mark_wall_alt'));
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.content.branch.h1'));
  });
});
