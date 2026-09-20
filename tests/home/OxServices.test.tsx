import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { HOME_PLANS } from '../../app/content/services';

/**
 * The advisory row, `برامج وخطط التغذية` (homepage-spec section 7).
 *
 * Three things are asserted because three things go wrong here. The row has
 * to be three real cards on the page rather than three cards decorating one
 * band photograph, which is what made this section read as an afterthought.
 * Each card has to be finished before its frame is shot, because none of the
 * three has been. And none of it may imply an expert: the store has no
 * certified staff, so there is no portrait and no professional title
 * (claims source section 3).
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

const { OxServices } = await import('../../app/components/home/OxServices');

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
  it('renders one dark card per programme, each a whole-card link', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const cards = screen.getAllByTestId('ox-plan-card');
    expect(cards).toHaveLength(HOME_PLANS.length);
    expect(cards.map((card) => card.getAttribute('data-plan'))).toEqual(
      HOME_PLANS.map((plan) => plan.id)
    );
    for (const card of cards) expect(card.getAttribute('href')).toBeTruthy();
    // One link per card, nothing interactive nested inside it.
    expect(container.querySelectorAll('.ox-plan button')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-plan a')).toHaveLength(0);
  });

  it('is finished before the frames are shot', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    // The scrim and the slash are painted by the card, not by the image, so
    // a card whose photograph 404s is still a dark card with an accent
    // corner rather than a hole.
    expect(container.querySelectorAll('.ox-plan__scrim')).toHaveLength(HOME_PLANS.length);
    expect(container.querySelectorAll('.ox-plan__slash')).toHaveLength(HOME_PLANS.length);
    const sources = screen
      .getAllByTestId('ox-plan-card')
      .map((card) => card.querySelector('img')?.getAttribute('src'));
    for (const src of sources) expect(src).toMatch(/^\/assets\/images\/plan-[a-z]+\.jpg$/);
    // Decorative: every card's title already says what it is.
    for (const card of screen.getAllByTestId('ox-plan-card')) {
      expect(card.querySelector('img')?.getAttribute('alt')).toBe('');
      expect(card.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    }
  });

  it('routes out to the services page, where the channels it does not show live', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    // The free written question and the branch visit are not programmes, so
    // they are not cards here. The header's route-out is what keeps them one
    // click from the home page.
    expect(container.querySelector('.ox-sh__link')?.getAttribute('href')).toBe('/services');
  });

  it('puts the section back on a band only when the merchant fills that field', () => {
    setSettings({});
    const off = renderWithProviders(<OxServices data={data()} />);
    // Off by default: the dashboard control is labelled "Band image" and it
    // still does what it says, but the shipped design is three cards on the
    // page ground and the theme supplies no default for it.
    expect(off.container.querySelector('.ox-services__photo')).toBeNull();
    expect(off.container.querySelector('.ox-services--banded')).toBeNull();
    off.unmount();

    const { container } = renderWithProviders(
      <OxServices data={data({ image: 'https://cdn.example/band.jpg' })} />
    );
    const photo = container.querySelector('.ox-services__photo') as HTMLImageElement;
    expect(photo.getAttribute('src')).toBe('https://cdn.example/band.jpg');
    expect(photo.getAttribute('alt')).toBe('');
    expect(photo.getAttribute('loading')).toBe('lazy');
    expect(container.querySelector('.ox-services__scrim')).not.toBeNull();
    expect(container.querySelector('.ox-services--banded')).not.toBeNull();
  });

  it('prefers the merchant heading over the locale copy; the intro field is gone', () => {
    setSettings({});
    const { container } = renderWithProviders(
      <OxServices data={data({ title: 'عنوان التاجر', intro: 'مقدمة التاجر' })} />
    );
    expect(container.querySelector('.ox-sh__title')?.textContent).toBe('عنوان التاجر');
    // Section headers carry no sub-line, so `intro` had nowhere to render.
    // It is now out of twilight.json too, so the dashboard stops offering a
    // field that does nothing. Data passed here is simply ignored, which is
    // what this asserts: an old saved value cannot resurrect the sub-line.
    expect(container.querySelector('.ox-sh__desc')).toBeNull();
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

  it('names no professional title anywhere in the row', () => {
    setSettings({ reply_sla_hours: 24 });
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'طبيب', 'مدرب معتمد', 'مضمون', 'نتائج خلال']) {
      expect(text).not.toContain(banned);
    }
  });
});
