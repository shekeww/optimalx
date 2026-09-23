import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The closing CTA band (S2c, 2026-09-22): shares `ox-newsletter`'s gate with
 * the embedded form - `show_newsletter` on AND a valid `newsletter_action_url`
 * (owner brief S8h item 3; `OxCtaBand.tsx`'s docblock has the reason) - and
 * carries an image slot exposed as `--ox-band-image`, a headline and line
 * that fall back to `ox.home.cta_*`, and one filled CTA to `/services`.
 */

const themeSettings: Record<string, unknown> = {};
/** The footer menu `menu.footer()` answers with; empty unless a test sets it. */
let footerMenuItems: Array<{ id: string; title: string; url: string }> = [];
/** A valid https action URL (owner brief S8h item 3): the band's own gate now needs this alongside `show_newsletter`. */
const VALID_URL = 'https://example.com/subscribe';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
// `OxCtaBand` resolves the privacy-policy link against the merchant's own
// footer menu (item 2); mocked here so no test ever reaches a real network
// call, the same reasoning `tests/home/blocks.test.tsx`'s own `api/menu`
// mock already documents for `menu.queries.header()`.
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { footer: () => Promise.resolve(footerMenuItems) },
}));

const { OxCtaBand } = await import('../../app/components/home/OxCtaBand');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-newsletter',
    key: 'cta-band',
    ...HOME_BLOCK_FIELDS['ox-newsletter'],
    ...extra,
  } as OxBlockData;
}

describe('OxCtaBand', () => {
  it('renders nothing while show_newsletter is off, headline and all', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    expect(container.querySelector('[data-testid="ox-cta-band"]')).toBeNull();
  });

  it('renders nothing with show_newsletter on but no action URL saved - a dead form must never ship', () => {
    setSettings({ show_newsletter: true });
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    expect(container.querySelector('[data-testid="ox-cta-band"]')).toBeNull();
  });

  it('renders nothing when the saved action URL is not https', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: 'http://example.com/subscribe' });
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    expect(container.querySelector('[data-testid="ox-cta-band"]')).toBeNull();
  });

  it('falls back to the locale headline and line once the setting is on', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxCtaBand data={data()} />);
    const band = screen.getByTestId('ox-cta-band');
    expect(band.querySelector('.ox-cta-band__title')?.textContent).toBeTruthy();
    expect(band.querySelector('.ox-cta-band__line')?.textContent).toBeTruthy();
  });

  it('prefers the merchant headline and line over the locale copy', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(
      <OxCtaBand data={data({ headline: 'عنوان التاجر', line: 'سطر التاجر' })} />
    );
    const band = screen.getByTestId('ox-cta-band');
    expect(band.querySelector('.ox-cta-band__title')?.textContent).toBe('عنوان التاجر');
    expect(band.querySelector('.ox-cta-band__line')?.textContent).toBe('سطر التاجر');
  });

  it('carries one filled CTA to /services', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxCtaBand data={data()} />);
    const cta = screen.getByTestId('ox-cta-band').querySelector('.ox-cta-band__cta');
    expect(cta?.getAttribute('href')).toBe('/services');
  });

  it('exposes the merchant image as --ox-band-image, and sets nothing without one', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    const off = renderWithProviders(<OxCtaBand data={data()} />);
    const bandOff = off.getByTestId('ox-cta-band');
    expect(bandOff.style.getPropertyValue('--ox-band-image')).toBe('');
    off.unmount();

    renderWithProviders(<OxCtaBand data={data({ image: 'https://cdn.example/band.jpg' })} />);
    const band = screen.getByTestId('ox-cta-band');
    expect(band.style.getPropertyValue('--ox-band-image')).toBe('url("https://cdn.example/band.jpg")');
  });

  it('folds the newsletter form in, gated the same as the rest of the band', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxCtaBand data={data()} />);
    expect(screen.getByTestId('ox-newsletter')).toBeTruthy();
  });

  it('names no professional title and promises no outcome', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    const text = container.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'طبيب', 'مدرب معتمد', 'مضمون', 'نتائج خلال']) {
      expect(text).not.toContain(banned);
    }
  });

  // Owner brief 2026-09-24, item 2: "a conversion block on the identity
  // plate". The plate is the newsletter's own wrapper, not the band.
  it('carries the newsletter on its own identity plate, inside the dark band', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    expect(container.querySelector('.ox-cta-band.ox-band-dark')).not.toBeNull();
    expect(container.querySelector('.ox-cta-band__newsletter')?.classList.contains(
      'ox-cta-band__newsletter'
    )).toBe(true);
  });

  it('links the privacy line to the merchant policy page when the footer menu has one', async () => {
    footerMenuItems = [{ id: '1', title: 'سياسة الخصوصية', url: '/policy-1' }];
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxCtaBand data={data()} />);
    await waitFor(() => {
      const link = screen.getByTestId('ox-newsletter').querySelector('.ox-newsletter__privacy-link');
      expect(link?.getAttribute('href')).toBe('/policy-1');
    });
    footerMenuItems = [];
  });

  it('renders the privacy sentence with no link when the store has no policy page', async () => {
    footerMenuItems = [];
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxCtaBand data={data()} />);
    await waitFor(() => expect(screen.getByTestId('ox-newsletter')).toBeTruthy());
    expect(
      screen.getByTestId('ox-newsletter').querySelector('.ox-newsletter__privacy-link')
    ).toBeNull();
  });
});
