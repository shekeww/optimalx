import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { HOME_PLANS, SERVICE_CHANNELS } from '../../app/content/services';
import { idForSku } from '../../app/content/salla-ids';

/**
 * The advisory band: ONE OFFER IN TWO TITLED ROWS (owner review 2026-09-23,
 * late night). Row one is the three ways to ask (`ChannelDoor`), row two is
 * the three programmes the asking leads to (`PlanCard`), and each row says in
 * its own title which question it answers. Both rows render on both surfaces
 * now; `routeOut` decides the heading and the section's one primary action
 * only.
 *
 * None of it may imply an expert: the store has no certified staff, so there
 * is no portrait and no professional title (claims source section 3). No card
 * states a price or a reply time in copy: the price is the live product and
 * the reply time is the owner's own setting or nothing.
 */

const themeSettings: Record<string, unknown> = {};
/** Per-product-id price override; unset ids answer free (price 0). */
const productPrices: Record<string, number> = {};

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
  product: {
    queries: {
      detail: (id: string) => ({
        queryKey: ['p', id],
        queryFn: async () => ({ price: productPrices[id] ?? 0, is_on_sale: false }),
      }),
    },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));

const { OxServices } = await import('../../app/components/home/OxServices');

const t = createT('ar');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

function clearPrices() {
  for (const key of Object.keys(productPrices)) delete productPrices[key];
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
  it('frames the offer with an eyebrow that does not repeat the heading', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const eyebrow = container.querySelector('.ox-services__eyebrow')?.textContent?.trim();
    const heading = container.querySelector('.ox-services__title')?.textContent?.trim();
    const subline = container.querySelector('.ox-services__subline')?.textContent?.trim();
    expect(eyebrow).toBe(t('ox.home.band_eyebrow'));
    expect(heading).toBe(t('ox.services.title'));
    expect(subline).toBe(t('ox.home.band_subline'));
    // The defect this section was rebuilt for: the eyebrow used to say what
    // the heading says. Neither may contain the other.
    expect(eyebrow).not.toBe(heading);
    expect(heading?.includes(eyebrow ?? '')).toBe(false);
    expect(eyebrow?.includes(heading ?? '')).toBe(false);
  });

  it('says the page h1 once: on /services the band heading is not the h1 sentence', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    const heading = container.querySelector('.ox-services__title')?.textContent?.trim();
    expect(heading).toBe(t('ox.home.band_title_services'));
    expect(heading).not.toBe(t('ox.content.services.hub_h1'));
  });

  it('titles each row, so the six cards read as two answers and not six boxes', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const rows = container.querySelectorAll('.ox-services__row');
    expect(rows).toHaveLength(2);

    const titles = Array.from(container.querySelectorAll('.ox-services__row-title')).map(
      (node) => node.textContent
    );
    expect(titles).toEqual([
      t('ox.home.band_row_ask_title'),
      t('ox.home.band_row_plans_title'),
    ]);
    // The two rows never carry the same title, and neither repeats the h2.
    expect(titles[0]).not.toBe(titles[1]);
    expect(titles).not.toContain(t('ox.services.title'));
    // Each row title is an h3 under the section's own h2: no level skipped.
    for (const node of container.querySelectorAll('.ox-services__row-title')) {
      expect(node.tagName).toBe('H3');
    }

    const notes = Array.from(container.querySelectorAll('.ox-services__row-note')).map(
      (node) => node.textContent
    );
    expect(notes).toEqual([
      t('ox.home.band_row_ask_note'),
      t('ox.home.band_row_plans_note'),
    ]);

    // Row one holds the three doors, row two the three plans.
    expect(rows[0].querySelectorAll('[data-testid="ox-channel-door"]')).toHaveLength(
      SERVICE_CHANNELS.length
    );
    expect(rows[0].querySelectorAll('[data-testid="ox-plan-card"]')).toHaveLength(0);
    expect(rows[1].querySelectorAll('[data-testid="ox-plan-card"]')).toHaveLength(
      HOME_PLANS.length
    );
    expect(rows[1].querySelectorAll('[data-testid="ox-channel-door"]')).toHaveLength(0);
  });

  it('renders both rows on /services too, now that the page has no channel section of its own', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    expect(container.querySelectorAll('.ox-services__row')).toHaveLength(2);
    expect(screen.getAllByTestId('ox-channel-door')).toHaveLength(SERVICE_CHANNELS.length);
    expect(screen.getAllByTestId('ox-plan-card')).toHaveLength(HOME_PLANS.length);
  });

  it('gives every card its own CTA verb, and the ways to ask three different ones', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const doorLabels = SERVICE_CHANNELS.map((channel) => {
      const door = container.querySelector(
        `[data-testid="ox-channel-door"][data-channel="${channel.id}"]`
      ) as HTMLElement;
      return within(door).getByText(t(channel.doorCtaKey)).textContent;
    });
    expect(new Set(doorLabels).size).toBe(SERVICE_CHANNELS.length);

    const planLabels = Array.from(container.querySelectorAll('.ox-plan__cta-label')).map(
      (node) => node.textContent
    );
    expect(planLabels).toEqual(HOME_PLANS.map((plan) => t(plan.ctaKey)));
    // The training session is booked, not read about: its card says so.
    expect(planLabels).toContain(t('ox.content.services.training_cta'));
  });

  it("reads each channel's price live through effectivePrice, never a typed number", async () => {
    setSettings({});
    clearPrices();
    const videoId = String(idForSku('OX-045'));
    productPrices[videoId] = 50;
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const written = container.querySelector('[data-testid="ox-channel-door"][data-channel="written"]');
    expect(written).not.toBeNull();
    await waitFor(() => expect(within(written as HTMLElement).getByText('مجاني')).toBeTruthy());

    const video = container.querySelector('[data-testid="ox-channel-door"][data-channel="video"]');
    expect(video).not.toBeNull();
    await waitFor(() =>
      expect(within(video as HTMLElement).getByTestId('ox-channel-door-price').textContent).toContain('50')
    );
    clearPrices();
  });

  it('states a reply time only once the owner has set reply_sla_hours', () => {
    setSettings({});
    clearPrices();
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-services-reply"]')).toBeNull();
    off.unmount();

    setSettings({ reply_sla_hours: '24' });
    const on = renderWithProviders(<OxServices data={data()} />);
    const cue = on.container.querySelector('[data-testid="ox-services-reply"]');
    expect(cue?.textContent).toBe(t('ox.home.services_reply', { hours: '24' }));
    // It belongs to row one, the row whose written question it is about.
    expect(on.container.querySelectorAll('.ox-services__row')[0].contains(cue)).toBe(true);
  });

  it('renders the consultation credit verbatim from the setting, and nothing while it is empty', async () => {
    setSettings({});
    clearPrices();
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-channel-credit"]')).toBeNull();
    off.unmount();

    setSettings({ consultation_credit_note: 'خصم على الطلب الأول' });
    const on = renderWithProviders(<OxServices data={data()} />);
    const credit = await within(
      on.container.querySelector('[data-channel="video"]') as HTMLElement
    ).findByTestId('ox-channel-credit');
    expect(credit.textContent).toBe('خصم على الطلب الأول');
    // One gate, one card: the free channels never carry a money note.
    expect(on.container.querySelectorAll('[data-testid="ox-channel-credit"]')).toHaveLength(1);
  });

  it('carries the branch measurement on the plans row and on the visit door, and drops it on the owner switch', () => {
    setSettings({});
    clearPrices();
    // Default ON: the device is at the branch today, so the gate exists to
    // switch the line off, not on (owner statement 2026-09-23).
    const on = renderWithProviders(<OxServices data={data()} />);
    const rowCue = on.container.querySelector('[data-testid="ox-services-inbody"]');
    expect(rowCue?.textContent).toBe(t('ox.home.band_inbody_plans'));
    expect(on.container.querySelectorAll('.ox-services__row')[1].contains(rowCue)).toBe(true);
    const doorLine = on.container.querySelector(
      '[data-channel="visit"] [data-testid="ox-channel-inbody"]'
    );
    expect(doorLine?.textContent).toBe(t('ox.content.services.visit_inbody'));
    // One door only: the measurement happens at the branch, so it is said on
    // the branch door and nowhere else in the row.
    expect(on.container.querySelectorAll('[data-testid="ox-channel-inbody"]')).toHaveLength(1);
    on.unmount();

    setSettings({ inbody_included: false });
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-services-inbody"]')).toBeNull();
    expect(off.container.querySelector('[data-testid="ox-channel-inbody"]')).toBeNull();
  });

  it('is finished before the frames are shot', () => {
    setSettings({});
    clearPrices();
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

  it('carries exactly one primary next step per surface', () => {
    setSettings({});
    clearPrices();
    const home = renderWithProviders(<OxServices data={data()} />);
    const cta = home.container.querySelector('.ox-services__cta a');
    expect(cta?.getAttribute('href')).toBe('/services');
    expect(cta?.textContent).toBe(t('ox.common.view_all'));
    // The home page's primary is that button, so no door is marked primary.
    expect(home.container.querySelector('.ox-channel-door--primary')).toBeNull();
    home.unmount();

    // On /services the band routes nobody out to the page they are on: the
    // written-question door is the section's primary instead.
    const onPage = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    expect(onPage.container.querySelector('.ox-services__cta')).toBeNull();
    const primaries = onPage.container.querySelectorAll('.ox-channel-door--primary');
    expect(primaries).toHaveLength(1);
    expect(primaries[0].getAttribute('data-channel')).toBe('written');
  });

  it('closes on the limit of our work, on both surfaces', () => {
    setSettings({});
    clearPrices();
    for (const routeOut of [true, false]) {
      const view = renderWithProviders(<OxServices data={data()} routeOut={routeOut} />);
      expect(view.container.querySelector('.ox-services__note')?.textContent).toBe(
        t('ox.content.services.card_footer')
      );
      view.unmount();
    }
  });

  it('is always on the dark band; the merchant photo is opt-in on top of it', () => {
    setSettings({});
    clearPrices();
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
    clearPrices();
    const { container } = renderWithProviders(
      <OxServices data={data({ title: 'عنوان التاجر' })} />
    );
    expect(container.querySelector('.ox-services__title')?.textContent).toBe('عنوان التاجر');
    // The eyebrow, the subline and the two row titles are the band's own
    // copy, never a merchant field: there is no dashboard control for them.
    expect(container.querySelector('.ox-services__eyebrow')).not.toBeNull();
    expect(container.querySelector('.ox-services__subline')?.textContent).toBeTruthy();
    expect(container.querySelectorAll('.ox-services__row-title')).toHaveLength(2);
  });

  it('never renders the retired plans_title, plans_tier_title or plan_cta keys, and never the full /services channel card', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('ox.home.plans_title');
    expect(text).not.toContain('ox.home.plans_tier_title');
    expect(text).not.toContain('ox.home.plan_cta');
    expect(text).not.toContain('{{');
    // The heavier, full `/services` channel card (badge, description, its
    // own primary button) never renders here — only the compact
    // `ChannelDoor`.
    expect(container.querySelector('[data-testid="ox-channel-card"]')).toBeNull();
  });

  it('names no professional title anywhere in the rows', () => {
    setSettings({ reply_sla_hours: 24 });
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    // The measurement is a measurement: never a diagnosis, never a medical
    // test, never an outcome attached to it.
    for (const banned of [
      'أخصائي',
      'صيدلي',
      'طبيب',
      'مدرب معتمد',
      'مضمون',
      'نتائج خلال',
      'تشخيص',
      'فحص',
    ]) {
      expect(text).not.toContain(banned);
    }
  });
});
