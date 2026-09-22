import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { HOME_PLANS } from '../../app/content/services';

/**
 * The advisory band, one tier of three photographic doors (S2 design-audit
 * 2026-09-22). Three things are asserted because three things go wrong here.
 * The row has to be three real cards, each finished before its frame is
 * shot (the scrim and the watermark are painted by the card, not the
 * image). The band carries its one CTA under the row, not on the header.
 * And none of it may imply an expert: the store has no certified staff, so
 * there is no portrait and no professional title (claims source section 3).
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
    // The scrim and the watermark are painted by the card, not the image, so
    // a card whose photograph 404s is still a dark card rather than a hole.
    // No per-card slash: the section's one angled edge is the band's own
    // ground motif (identity rule, one angled edge per section).
    expect(container.querySelectorAll('.ox-plan__scrim')).toHaveLength(HOME_PLANS.length);
    expect(container.querySelectorAll('.ox-plan__watermark')).toHaveLength(HOME_PLANS.length);
    expect(container.querySelectorAll('.ox-plan__slash')).toHaveLength(0);
    for (const card of screen.getAllByTestId('ox-plan-card')) {
      const img = card.querySelector('img');
      if (!img) continue;
      // Every HOME_PLANS photo path has to resolve (tests/content/imagePaths
      // .test.ts holds that part); it stays decorative and lazy here.
      expect(img.getAttribute('src')).toMatch(/^\/assets\/images\//);
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('carries the bands one filled CTA to /services, on the home page only', () => {
    setSettings({});
    const home = renderWithProviders(<OxServices data={data()} />);
    const cta = home.container.querySelector('.ox-services__cta a');
    expect(cta?.getAttribute('href')).toBe('/services');
    expect(cta?.textContent).toBeTruthy();
    home.unmount();

    // routeOut off (the /services mount): the row already sits on the page
    // the CTA would point to, so it does not render a second time.
    const onPage = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    expect(onPage.container.querySelector('.ox-services__cta')).toBeNull();
  });

  it('is always on the dark band; the merchant photo is opt-in on top of it', () => {
    setSettings({});
    const off = renderWithProviders(<OxServices data={data()} />);
    // The ground is flat graphite plus the motif by default now, never a
    // photograph: `--ox-band-graphite` shows, and the section stays dark
    // (`ox-band-dark`) whether or not a photo is set.
    expect(off.container.querySelector('.ox-services--banded')).not.toBeNull();
    expect(off.container.querySelector('.ox-band-dark')).not.toBeNull();
    expect(off.container.querySelector('.ox-services__photo')).toBeNull();
    expect(off.container.querySelector('.ox-services__scrim')).toBeNull();
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

  it('prefers the merchant heading over the live ox.services.title', () => {
    setSettings({});
    const { container } = renderWithProviders(
      <OxServices data={data({ title: 'عنوان التاجر' })} />
    );
    expect(container.querySelector('.ox-services__title')?.textContent).toBe('عنوان التاجر');
    // The eyebrow and the subline are the band's own copy, never a merchant
    // field: there is no dashboard control for either.
    expect(container.querySelector('.ox-services__eyebrow')).not.toBeNull();
    expect(container.querySelector('.ox-services__subline')?.textContent).toBeTruthy();
  });

  it('never renders the retired plans_title, plans_tier_title or plan_cta keys', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('ox.home.plans_title');
    expect(text).not.toContain('ox.home.plans_tier_title');
    expect(text).not.toContain('ox.home.plan_cta');
    // The written question and its reply-time line moved to the channels
    // section on /services; neither channel copy nor the reply line render
    // inside this band any more.
    expect(container.querySelector('[data-testid="ox-channel-card"]')).toBeNull();
    expect(container.querySelector('[data-testid="ox-services-reply"]')).toBeNull();
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
