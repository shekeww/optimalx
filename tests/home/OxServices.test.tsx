import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { HOME_PLANS, SERVICE_CHANNELS } from '../../app/content/services';
import { idForSku } from '../../app/content/salla-ids';
import { STORE_PHOTOS, storePhotoSrcSet } from '../../app/content/store-photos';

/**
 * The advisory band: THE OFFER FIRST (owner brief 2026-09-24).
 *
 * The band opens on the offer strip (free advice, the free branch InBody
 * measurement, and the two buttons that take them), then the three ways to
 * ask, then the three programmes, then a trust row of gated facts and the
 * limit-of-our-work line. Both rows and the strip render on both surfaces;
 * `routeOut` decides the heading and the way out, nothing else.
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

  it('puts the offer directly under the head, before either row', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const inner = container.querySelector('.ox-services__inner') as HTMLElement;
    const order = Array.from(inner.children).map((node) => node.className.split(' ')[0]);
    expect(order[0]).toBe('ox-services__head');
    expect(order[1]).toBe('ox-services__offer');
    expect(order[2]).toBe('ox-services__row');

    const strip = screen.getByTestId('ox-services-offer');
    // The two facts the owner wants seen first, in the offer, not in a note.
    expect(within(strip).getByTestId('ox-offer-advisory').textContent).toBe(
      t('ox.home.offer_advisory')
    );
    expect(within(strip).getByTestId('ox-offer-inbody').textContent).toBe(
      t('ox.content.services.visit_inbody')
    );
  });

  it('gives the offer two real buttons: the branch visit filled, the written question outlined', () => {
    setSettings({});
    clearPrices();
    renderWithProviders(<OxServices data={data()} />);

    const actions = Array.from(
      screen.getByTestId('ox-services-offer').querySelectorAll('.ox-offer__action')
    ) as HTMLAnchorElement[];
    expect(actions).toHaveLength(2);

    const [primary, secondary] = actions;
    expect(primary.className).toContain('ox-btn--primary');
    expect(primary.className).toContain('ox-btn--s48');
    expect(primary.textContent).toBe(t('ox.content.services.visit_cta_short'));
    expect(primary.getAttribute('href')).toBe(
      SERVICE_CHANNELS.find((channel) => channel.id === 'visit')?.to
    );

    expect(secondary.className).toContain('ox-btn--secondary');
    expect(secondary.className).toContain('ox-btn--s48');
    expect(secondary.textContent).toBe(t('ox.home.offer_cta_ask'));
    expect(secondary.getAttribute('href')).toBe(
      SERVICE_CHANNELS.find((channel) => channel.id === 'written')?.to
    );
  });

  it('carries the advisory-room photograph in the offer strip, srcset from the manifest', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const photo = container.querySelector('.ox-offer__photo') as HTMLImageElement;
    const entry = STORE_PHOTOS['advisory-room'];
    expect(photo.getAttribute('src')).toBe(entry.photo);
    expect(photo.getAttribute('srcset')).toBe(storePhotoSrcSet(entry));
    expect(photo.getAttribute('alt')).toBe(t('ox.home.offer_photo_alt'));
    expect(photo.getAttribute('loading')).toBe('lazy');
    // Beside the facts, inside the same strip that carries the plate's cut.
    expect(screen.getByTestId('ox-services-offer').contains(photo)).toBe(true);
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

  it('puts each row on the shared rail, the recommended door first, one cue per row', () => {
    setSettings({});
    clearPrices();
    for (const routeOut of [true, false]) {
      const view = renderWithProviders(<OxServices data={data()} routeOut={routeOut} />);
      const rows = view.container.querySelectorAll('.ox-services__row');
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        // The rail primitive's markup contract (`_rail.scss`): one wrapper,
        // one track, one cue, one (hidden) progress strap, per row.
        const rails = row.querySelectorAll('.ox-rail.ox-services__rail');
        expect(rails).toHaveLength(1);
        const track = rails[0].querySelector(':scope > ul.ox-rail__track.ox-plans');
        expect(track).not.toBeNull();
        expect(track?.getAttribute('role')).toBe('list');
        expect(track?.querySelectorAll(':scope > li.ox-plans__slide')).toHaveLength(3);
        const cues = rails[0].querySelectorAll(':scope > button.ox-rail__cue');
        expect(cues).toHaveLength(1);
        expect(cues[0].getAttribute('type')).toBe('button');
        expect(cues[0].getAttribute('aria-label')).toBe(t('ox.home.band_row_next'));
        expect(cues[0].querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
        expect(rails[0].querySelectorAll(':scope > .ox-rail__progress')).toHaveLength(1);
        // Nothing measured in jsdom, so the rail promises no affordance.
        expect(rails[0].hasAttribute('data-rail')).toBe(false);
      }
      // Reading order is swipe order: the recommended door is the first
      // card a phone sees.
      const firstDoor = rows[0].querySelector('.ox-plans__slide [data-testid="ox-channel-door"]');
      expect(firstDoor?.getAttribute('data-channel')).toBe('written');
      expect(firstDoor?.classList.contains('ox-channel-door--primary')).toBe(true);
      view.unmount();
    }
  });

  it('moves a row by one card and its gap when the cue is pressed, in the reading direction', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const track = container.querySelector('.ox-services__row .ox-plans') as HTMLUListElement;
    const first = track.firstElementChild as HTMLElement;
    const calls: Array<ScrollToOptions | undefined> = [];
    track.scrollBy = ((options?: ScrollToOptions) => {
      calls.push(options);
    }) as typeof track.scrollBy;
    first.getBoundingClientRect = () => ({ width: 309 }) as DOMRect;
    track.style.columnGap = '16px';
    track.style.direction = 'rtl';

    (container.querySelector('.ox-services__row .ox-rail__cue') as HTMLButtonElement).click();
    expect(calls).toHaveLength(1);
    // RTL scrolls toward negative scrollLeft: one card (309) plus the gap.
    expect(calls[0]?.left).toBe(-325);
  });

  it('renders the strip and both rows on /services too', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    expect(container.querySelectorAll('.ox-services__row')).toHaveLength(2);
    expect(screen.getAllByTestId('ox-services-offer')).toHaveLength(1);
    expect(screen.getAllByTestId('ox-channel-door')).toHaveLength(SERVICE_CHANNELS.length);
    expect(screen.getAllByTestId('ox-plan-card')).toHaveLength(HOME_PLANS.length);
  });

  it('gives every card a real button, full width and 48 tall, with its own verb', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const doorLabels = SERVICE_CHANNELS.map((channel) => {
      const door = container.querySelector(
        `[data-testid="ox-channel-door"][data-channel="${channel.id}"]`
      ) as HTMLElement;
      const action = door.querySelector('.ox-channel-door__action') as HTMLAnchorElement;
      // A REAL button, not an accent word beside a detached chevron box: the
      // owner's screenshot caught exactly that, and the arrow is gone.
      expect(action.className).toContain('ox-btn--block');
      expect(action.className).toContain('ox-btn--s48');
      expect(action.getAttribute('href')).toBe(channel.to);
      expect(door.querySelector('.ox-iconbtn--angled')).toBeNull();
      return action.textContent;
    });
    expect(new Set(doorLabels).size).toBe(SERVICE_CHANNELS.length);

    const planLabels = HOME_PLANS.map((plan) => {
      const card = container.querySelector(`[data-plan="${plan.id}"]`) as HTMLElement;
      const action = card.querySelector('.ox-plan__action') as HTMLAnchorElement;
      expect(action.className).toContain('ox-btn--secondary');
      expect(action.className).toContain('ox-btn--s48');
      expect(action.getAttribute('href')).toBe(plan.to);
      expect(card.querySelector('.ox-plan__arrow')).toBeNull();
      return action.textContent;
    });
    expect(planLabels).toEqual(HOME_PLANS.map((plan) => t(plan.ctaKey)));
    // The training session is booked, not read about: its card says so.
    expect(planLabels).toContain(t('ox.content.services.training_cta'));
  });

  it('marks one door as the recommended start, on both surfaces', () => {
    setSettings({});
    clearPrices();
    for (const routeOut of [true, false]) {
      const view = renderWithProviders(<OxServices data={data()} routeOut={routeOut} />);
      const flagged = view.container.querySelectorAll('[data-testid="ox-channel-door-flag"]');
      expect(flagged).toHaveLength(1);
      expect(flagged[0].textContent).toBe(t('ox.home.door_recommended'));
      // The flag never repeats the band heading it sits under on /services.
      expect(flagged[0].textContent).not.toBe(t('ox.home.band_title_services'));

      const primaries = view.container.querySelectorAll('.ox-channel-door--primary');
      expect(primaries).toHaveLength(1);
      expect(primaries[0].getAttribute('data-channel')).toBe('written');
      // The recommended door is the only one with a FILLED button.
      const filled = view.container.querySelectorAll(
        '.ox-channel-door__action.ox-btn--primary'
      );
      expect(filled).toHaveLength(1);
      expect(primaries[0].contains(filled[0])).toBe(true);
      view.unmount();
    }
  });

  it("reads each channel's price live through effectivePrice, as a chip when it is free", async () => {
    setSettings({});
    clearPrices();
    const videoId = String(idForSku('OX-045'));
    productPrices[videoId] = 50;
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const written = container.querySelector('[data-testid="ox-channel-door"][data-channel="written"]');
    expect(written).not.toBeNull();
    await waitFor(() =>
      expect(
        (within(written as HTMLElement).getByText('مجاني') as HTMLElement).className
      ).toContain('ox-channel-door__chip')
    );

    const video = container.querySelector('[data-testid="ox-channel-door"][data-channel="video"]');
    expect(video).not.toBeNull();
    await waitFor(() =>
      expect(within(video as HTMLElement).getByTestId('ox-channel-door-price').textContent).toContain('50')
    );
    clearPrices();
  });

  it('prints a plan price only where a product backs the card, and never invents one', async () => {
    setSettings({});
    clearPrices();
    productPrices[String(idForSku('OX-047'))] = 150;
    const { container } = renderWithProviders(<OxServices data={data()} />);

    const training = container.querySelector('[data-plan="training"]') as HTMLElement;
    await waitFor(() =>
      expect(within(training).getByTestId('ox-plan-price').textContent).toContain('150')
    );
    expect(within(training).getByTestId('ox-plan-price').textContent).toContain(
      t('ox.home.plan_price_from')
    );

    // The nutrition card has no product at all, and the advisory card's
    // product answers 0 here: neither may print a figure.
    const nutrition = container.querySelector('[data-plan="nutrition"]') as HTMLElement;
    expect(within(nutrition).queryByTestId('ox-plan-price')).toBeNull();
    const advisory = container.querySelector('[data-plan="advisory"]') as HTMLElement;
    expect(within(advisory).queryByTestId('ox-plan-price')).toBeNull();
    clearPrices();
  });

  it('lists what each programme includes, from its own approved scope lines', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);

    for (const plan of HOME_PLANS) {
      const card = container.querySelector(`[data-plan="${plan.id}"]`) as HTMLElement;
      const items = Array.from(card.querySelectorAll('.ox-plan__item')).map(
        (node) => node.textContent
      );
      expect(items).toEqual(plan.itemKeys.map((key) => t(key)));
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(3);
    }
  });

  it('states a reply time only once the owner has set reply_sla_hours, and only under the offer', () => {
    setSettings({});
    clearPrices();
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-services-reply"]')).toBeNull();
    off.unmount();

    setSettings({ reply_sla_hours: '24' });
    const on = renderWithProviders(<OxServices data={data()} />);
    const cues = on.container.querySelectorAll('[data-testid="ox-services-reply"]');
    expect(cues).toHaveLength(1);
    expect(cues[0].textContent).toBe(t('ox.home.services_reply', { hours: '24' }));
    // It belongs to the strip, under the button that opens the written
    // question it is about.
    expect(on.container.querySelector('.ox-services__offer')?.contains(cues[0])).toBe(true);
  });

  it('renders the consultation credit verbatim from the setting, and nothing while it is empty', async () => {
    setSettings({});
    clearPrices();
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-channel-credit"]')).toBeNull();
    expect(off.container.querySelector('[data-testid="ox-trust-credit"]')).toBeNull();
    off.unmount();

    setSettings({ consultation_credit_note: 'خصم على الطلب الأول' });
    const on = renderWithProviders(<OxServices data={data()} />);
    const credit = await within(
      on.container.querySelector('[data-channel="video"]') as HTMLElement
    ).findByTestId('ox-channel-credit');
    expect(credit.textContent).toBe('خصم على الطلب الأول');
    // One gate, one card: the free channels never carry a money note.
    expect(on.container.querySelectorAll('[data-testid="ox-channel-credit"]')).toHaveLength(1);
    // And once in the trust row, where it is a fact about the offer.
    expect(on.container.querySelector('[data-testid="ox-trust-credit"]')?.textContent).toContain(
      'خصم على الطلب الأول'
    );
  });

  it('states the branch measurement ONCE, in the offer, and drops it on the owner switch', () => {
    setSettings({});
    clearPrices();
    // Default ON: the device is at the branch today, so the gate exists to
    // switch the line off, not on (owner statement 2026-09-23).
    const on = renderWithProviders(<OxServices data={data()} />);
    const fact = on.container.querySelectorAll('[data-testid="ox-offer-inbody"]');
    expect(fact).toHaveLength(1);
    expect(fact[0].textContent).toBe(t('ox.content.services.visit_inbody'));
    // One sentence, one place (UX audit 2026-09-24, P0-12: the band used to
    // say two different InBody things on one screen).
    const inbodyMentions = (on.container.textContent ?? '').split('InBody').length - 1;
    expect(inbodyMentions).toBe(1);
    on.unmount();

    setSettings({ inbody_included: false });
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-offer-inbody"]')).toBeNull();
    expect(off.container.textContent).not.toContain('InBody');
  });

  it('closes on real facts and the limit of our work, on both surfaces', () => {
    setSettings({});
    clearPrices();
    for (const routeOut of [true, false]) {
      const view = renderWithProviders(<OxServices data={data()} routeOut={routeOut} />);
      const trust = view.container.querySelector('[data-testid="ox-services-trust"]');
      expect(trust).not.toBeNull();
      // The branch is a real place; with no `branch_address` setting the row
      // falls back to the same line the branch block prints.
      expect(view.container.querySelector('[data-testid="ox-trust-branch"]')?.textContent).toContain(
        t('ox.blocks.branch.address')
      );
      expect(view.container.querySelector('.ox-services__note')?.textContent).toBe(
        t('ox.content.services.card_footer')
      );
      view.unmount();
    }

    setSettings({ branch_address: 'شارع الملك عبدالعزيز' });
    const withSetting = renderWithProviders(<OxServices data={data()} />);
    expect(
      withSetting.container.querySelector('[data-testid="ox-trust-branch"]')?.textContent
    ).toContain('شارع الملك عبدالعزيز');
  });

  it('leads the trust row with the store rating once the four google_* settings are filled', () => {
    setSettings({});
    clearPrices();
    const off = renderWithProviders(<OxServices data={data()} />);
    expect(off.container.querySelector('[data-testid="ox-trust-rating"]')).toBeNull();
    off.unmount();

    setSettings({
      google_place_url: 'https://maps.google.com/?cid=1',
      google_rating: '5.0',
      google_review_count: '80',
      google_verified_at: '2026-09-24',
    });
    const on = renderWithProviders(<OxServices data={data()} />);
    const trust = on.container.querySelector('[data-testid="ox-services-trust"]') as HTMLElement;
    expect(trust.firstElementChild?.getAttribute('data-testid')).toBe('ox-trust-rating');
    expect(within(trust).getByTestId('ox-store-rating')).toBeTruthy();
  });

  it('is finished before the frames are shot, and draws no watermark per card', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);
    // The scrim is painted by the card, not the image, so a card whose
    // photograph 404s is still a dark card rather than a hole. The mark is
    // gone: X-IDENTITY 4.1 allows one per section and this row drew three.
    expect(container.querySelectorAll('.ox-plan__scrim')).toHaveLength(HOME_PLANS.length);
    expect(container.querySelectorAll('.ox-plan__watermark')).toHaveLength(0);
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

  it('carries one filled primary per surface, and names the way out', () => {
    setSettings({});
    clearPrices();
    const home = renderWithProviders(<OxServices data={data()} />);
    // The band's one filled action is the offer strip's own primary; the
    // recommended door's filled button is the row's default, not a second
    // band-level call to action.
    const cta = home.container.querySelector('.ox-services__cta a');
    expect(cta?.getAttribute('href')).toBe('/services');
    // Named, not the page's twelfth "عرض الكل" (UX audit 2026-09-24, P1-7).
    expect(cta?.textContent).toBe(t('ox.services.view_all'));
    expect(cta?.textContent).not.toBe(t('ox.common.view_all'));
    expect(cta?.className).toContain('ox-btn--link');
    home.unmount();

    // On /services the band routes nobody out to the page they are on.
    const onPage = renderWithProviders(<OxServices data={data()} routeOut={false} />);
    expect(onPage.container.querySelector('.ox-services__cta')).toBeNull();
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
    // The eyebrow, the subline, the offer and the two row titles are the
    // band's own copy, never a merchant field: there is no dashboard control
    // for them.
    expect(container.querySelector('.ox-services__eyebrow')).not.toBeNull();
    expect(container.querySelector('.ox-services__subline')?.textContent).toBeTruthy();
    expect(container.querySelector('.ox-services__offer')).not.toBeNull();
    expect(container.querySelectorAll('.ox-services__row-title')).toHaveLength(2);
  });

  it('never renders a retired key, and never the full /services channel card', () => {
    setSettings({});
    clearPrices();
    const { container } = renderWithProviders(<OxServices data={data()} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('ox.home.plans_title');
    expect(text).not.toContain('ox.home.band_inbody_plans');
    expect(text).not.toContain('ox.home.plan_cta');
    expect(text).not.toContain('{{');
    // The heavier, full `/services` channel card (badge, description, its
    // own primary button) never renders here, only the compact
    // `ChannelDoor`.
    expect(container.querySelector('[data-testid="ox-channel-card"]')).toBeNull();
  });

  it('names no professional title anywhere in the band', () => {
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
