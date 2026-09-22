import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The closing CTA band (S2c, 2026-09-22): shares `ox-newsletter`'s
 * `show_newsletter` gate with the embedded form (`OxCtaBand.tsx`'s docblock
 * has the reason), carries an image slot exposed as `--ox-band-image`, a
 * headline and line that fall back to `ox.home.cta_*`, and one filled CTA to
 * `/services`.
 */

const themeSettings: Record<string, unknown> = {};

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

  it('falls back to the locale headline and line once the setting is on', () => {
    setSettings({ show_newsletter: true });
    renderWithProviders(<OxCtaBand data={data()} />);
    const band = screen.getByTestId('ox-cta-band');
    expect(band.querySelector('.ox-cta-band__title')?.textContent).toBeTruthy();
    expect(band.querySelector('.ox-cta-band__line')?.textContent).toBeTruthy();
  });

  it('prefers the merchant headline and line over the locale copy', () => {
    setSettings({ show_newsletter: true });
    renderWithProviders(
      <OxCtaBand data={data({ headline: 'عنوان التاجر', line: 'سطر التاجر' })} />
    );
    const band = screen.getByTestId('ox-cta-band');
    expect(band.querySelector('.ox-cta-band__title')?.textContent).toBe('عنوان التاجر');
    expect(band.querySelector('.ox-cta-band__line')?.textContent).toBe('سطر التاجر');
  });

  it('carries one filled CTA to /services', () => {
    setSettings({ show_newsletter: true });
    renderWithProviders(<OxCtaBand data={data()} />);
    const cta = screen.getByTestId('ox-cta-band').querySelector('.ox-cta-band__cta');
    expect(cta?.getAttribute('href')).toBe('/services');
  });

  it('exposes the merchant image as --ox-band-image, and sets nothing without one', () => {
    setSettings({ show_newsletter: true });
    const off = renderWithProviders(<OxCtaBand data={data()} />);
    const bandOff = off.getByTestId('ox-cta-band');
    expect(bandOff.style.getPropertyValue('--ox-band-image')).toBe('');
    off.unmount();

    renderWithProviders(<OxCtaBand data={data({ image: 'https://cdn.example/band.jpg' })} />);
    const band = screen.getByTestId('ox-cta-band');
    expect(band.style.getPropertyValue('--ox-band-image')).toBe('url("https://cdn.example/band.jpg")');
  });

  it('folds the newsletter form in, gated the same as the rest of the band', () => {
    setSettings({ show_newsletter: true });
    renderWithProviders(<OxCtaBand data={data()} />);
    expect(screen.getByTestId('ox-newsletter')).toBeTruthy();
  });

  it('names no professional title and promises no outcome', () => {
    setSettings({ show_newsletter: true });
    const { container } = renderWithProviders(<OxCtaBand data={data()} />);
    const text = container.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'طبيب', 'مدرب معتمد', 'مضمون', 'نتائج خلال']) {
      expect(text).not.toContain(banned);
    }
  });
});
