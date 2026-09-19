import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { SERVICE_CHANNELS } from '../../app/content/services';

/**
 * The home's one dark band (DIRECTION 6.2 row 7).
 *
 * Three things are asserted because three things go wrong here: the band has
 * to carry the band contract (photograph, wedge, lockup) or it is a stripe; it
 * has to spend exactly one wedge motif on the screen; and it must not imply an
 * expert. The store has no certified staff, so the band shows no portrait and
 * names no title (claims source section 3).
 */

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => `${String(value)} SAR`, parse: Number, isValid: () => true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { detail: (id: string) => ({ queryKey: ['p', id], queryFn: async () => ({ price: 0 }) }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));

const { OxServices, DEFAULT_SERVICES_PHOTO } = await import('../../app/components/home/OxServices');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-services',
    key: 'services',
    ...HOME_BLOCK_FIELDS['ox-services'],
    ...extra,
  } as OxBlockData;
}

describe('OxServices', () => {
  it('carries the band contract: a photograph, the wedge and the lockup', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const band = screen.getByTestId('ox-services');

    const photo = band.querySelector('.ox-services__photo') as HTMLImageElement;
    expect(photo.getAttribute('src')).toBe(DEFAULT_SERVICES_PHOTO);
    // Decorative: the band says nothing the copy does not already say.
    expect(photo.getAttribute('alt')).toBe('');
    expect(photo.getAttribute('loading')).toBe('lazy');

    expect(band.querySelector('.ox-services__scrim')).not.toBeNull();
    expect(container.querySelector('.ox-services__lockup [data-testid="ox-wordmark"]')).not.toBeNull();
  });

  it('spends one wedge motif and no more (DIRECTION 4.5)', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    // The pair of bars share one edge and read as one mark, which is why they
    // are the screen's whole wedge budget.
    expect(container.querySelectorAll('.ox-band__wedge')).toHaveLength(2);
    expect(container.querySelectorAll('.ox-band__wedge--wide')).toHaveLength(1);
    expect(container.querySelectorAll('.ox-band__wedge--thin')).toHaveLength(1);
  });

  it('takes the merchant photograph when the dashboard carries one', () => {
    setSettings({});
    renderWithProviders(<OxServices data={data({ image: 'https://cdn.example/band.jpg' })} />);
    expect(
      screen.getByTestId('ox-services').querySelector('.ox-services__photo')?.getAttribute('src')
    ).toBe('https://cdn.example/band.jpg');
  });

  it('renders one card per channel and no portrait beside any of them', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    expect(screen.getAllByTestId('ox-channel-card')).toHaveLength(SERVICE_CHANNELS.length);
    // The only images in the band are the decorative photograph and the mark:
    // a face beside an advice heading would imply an expert the store has not
    // got.
    expect(container.querySelectorAll('.ox-channels img')).toHaveLength(0);
  });

  it('states no reply time until the owner has set one', () => {
    setSettings({});
    const closed = renderWithProviders(<OxServices data={data()} />);
    expect(closed.queryByTestId('ox-services-reply')).toBeNull();
    closed.unmount();

    setSettings({ reply_sla_hours: 24 });
    renderWithProviders(<OxServices data={data()} />);
    expect(screen.getByTestId('ox-services-reply').textContent).toContain('24');
  });

  it('names no professional title anywhere in the band', () => {
    setSettings({ reply_sla_hours: 24 });
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'طبيب', 'مدرب معتمد', 'مضمون', 'نتائج خلال']) {
      expect(text).not.toContain(banned);
    }
  });
});
