import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { CONTENT_CARDS, HOME_CAROUSEL, POSTER_CARDS } from '../../app/content/posters';
import { HOME_BLOCK_FIELDS, HOME_BLOCK_HEIGHTS, type OxBlockData } from '../../app/components/home/defaults';

const ar = loadDictionary('ar');

/**
 * The "اكتشف أكثر" carousel (owner items 2026-09-24, S7a then S8a): ONE rail
 * carrying both kinds of card, alternating offer, content, offer, content,
 * starting with the InBody offer. The six offers are marketing posters the
 * owner supplies with their own baked-in headline, offer and CTA
 * (docs/build/progress/S7a.md); the five content cards are the theme's own
 * photograph + title + line + angled arrow (restored from 4657b89, S8a). The
 * contract this file holds:
 *
 *  - eleven cards in the alternating order, each a single link (never a
 *    nested control) carrying the angled strap, decorative only;
 *  - the UNAVAILABLE state (every entry's default today: no file on disk
 *    yet) renders the tinted plate with the alt text as a visible caption,
 *    never a broken `<img>`;
 *  - a merchant `image_N`/`link_N`/`alt_N`/`label`/`label_en` field
 *    (`twilight.json`, `home.ox-posters`) overrides the content map, and a
 *    merchant-supplied image is treated as available even before the import
 *    script has ever run;
 *  - the rail primitive (S5a), the `Icon`-drawn nav arrows (S6b) and the
 *    `ox.home.posters_lead` subline (S7d/UX-2026-09-24 P0-11) are untouched.
 */

const liveCategories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { OxPosters } = await import('../../app/components/home/OxPosters');

function data(overrides: Partial<OxBlockData> = {}): OxBlockData {
  return {
    path: 'ox-posters',
    key: 'posters',
    ...HOME_BLOCK_FIELDS['ox-posters'],
    ...overrides,
  } as OxBlockData;
}

beforeEach(() => {
  liveCategories.length = 0;
  Element.prototype.scrollIntoView = vi.fn();
});

const MIXED_ORDER = [
  'inbody-consult',
  'snacks',
  'weekly-picks',
  'strength',
  'bundle-her',
  'cardio',
  'bundle-him',
  'advisory',
  'weight-subscription',
  'branch',
  'bigramy-creatine',
];

const KINDS = MIXED_ORDER.map((_, index) => (index % 2 === 0 ? 'offer' : 'content'));

describe('OxPosters, one rail of both kinds, alternating (S8a)', () => {
  it('interleaves the six offers and the five content cards, offer first, starting with InBody', () => {
    expect(HOME_CAROUSEL.map((entry) => entry.card.slug)).toEqual(MIXED_ORDER);
    expect(HOME_CAROUSEL.map((entry) => entry.kind)).toEqual(KINDS);
    expect(POSTER_CARDS).toHaveLength(6);
    expect(CONTENT_CARDS).toHaveLength(5);
  });

  it('renders all eleven in that order, each kind in its own composition', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const cards = screen.getAllByTestId('ox-poster-card');
    expect(cards.map((card) => card.getAttribute('data-poster'))).toEqual(MIXED_ORDER);
    expect(cards.map((card) => card.getAttribute('data-kind'))).toEqual(KINDS);

    // A content card: its own photograph behind a scrim, the title, the line
    // and the angled arrow face (box 24, glyph 16); no poster placeholder.
    for (const content of CONTENT_CARDS) {
      const card = cards.find((el) => el.getAttribute('data-poster') === content.slug);
      expect(card?.querySelector('.ox-pcard__frame')?.getAttribute('src')).toBe(content.photo);
      expect(card?.querySelector('.ox-pcard__scrim')?.getAttribute('aria-hidden')).toBe('true');
      expect(card?.querySelector('.ox-pcard__title')?.textContent).toBe(ar[content.titleKey]);
      expect(card?.querySelector('.ox-pcard__line')?.textContent).toBe(ar[content.lineKey]);
      const arrow = card?.querySelector('.ox-pcard__arrow');
      expect(arrow?.classList.contains('ox-iconbtn--angled')).toBe(true);
      expect(arrow?.getAttribute('aria-hidden')).toBe('true');
      expect(arrow?.querySelector('svg')?.getAttribute('width')).toBe('16');
      expect(card?.querySelector('.ox-pcard__placeholder')).toBeNull();
    }
    expect(container.querySelectorAll('.ox-pcard--content')).toHaveLength(CONTENT_CARDS.length);
  });

  it('names the branch visit on the advisory card, and links the two literal routes', () => {
    renderWithProviders(<OxPosters data={data()} />);
    const cards = screen.getAllByTestId('ox-poster-card');
    const byy = (slug: string) => cards.find((card) => card.getAttribute('data-poster') === slug);
    expect(byy('advisory')?.textContent).toContain('زيارة للفرع');
    expect(byy('advisory')?.getAttribute('href')).toBe('/services');
    expect(byy('branch')?.getAttribute('href')).toBe('/about');
  });

  it('resolves the type and goal content cards through the shared taxonomy links (a search until live)', () => {
    renderWithProviders(<OxPosters data={data()} />);
    const byy = (slug: string) =>
      screen.getAllByTestId('ox-poster-card').find((card) => card.getAttribute('data-poster') === slug);
    for (const slug of ['snacks', 'strength', 'cardio']) {
      expect(byy(slug)?.getAttribute('href')).toMatch(/^\/search\?q=/);
    }
  });

  it('links the snacks card to the live category once one resolves', async () => {
    liveCategories.push({ id: 9009, name: 'سناكات', url: 'https://optimalx.com.sa/snacks-bars/c9009' });
    renderWithProviders(<OxPosters data={data()} />);
    await waitFor(() => {
      const card = screen
        .getAllByTestId('ox-poster-card')
        .find((el) => el.getAttribute('data-poster') === 'snacks');
      expect(card?.getAttribute('href')).toBe('/snacks-bars/c9009');
    });
  });

  it('keeps the reserved height: both kinds share the 4:5 box, so the offer card still sets the row', () => {
    expect(HOME_BLOCK_HEIGHTS['ox-posters']).toEqual({ mobile: 456, desktop: 477 });
  });
});

describe('OxPosters, six offer posters, unavailable by default (no files on disk yet)', () => {
  it('renders every offer as the tinted placeholder with the alt as a caption', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const offers = screen
      .getAllByTestId('ox-poster-card')
      .filter((card) => card.getAttribute('data-kind') === 'offer');
    expect(offers.map((card) => card.getAttribute('data-poster'))).toEqual(
      POSTER_CARDS.map((card) => card.slug)
    );

    // Every entry is `available: false` today: the placeholder plate, never
    // a broken `<img>`.
    expect(container.querySelectorAll('.ox-pcard__placeholder')).toHaveLength(POSTER_CARDS.length);
    expect(container.querySelectorAll('.ox-pcard__photo')).toHaveLength(0);
    for (const card of POSTER_CARDS) {
      expect(screen.getByText(ar[card.altKey])).toBeTruthy();
    }
  });

  it('carries the angled strap, decorative only, never a nested link or button', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const straps = container.querySelectorAll('.ox-pcard__slash');
    expect(straps).toHaveLength(HOME_CAROUSEL.length);
    straps.forEach((strap) => expect(strap.getAttribute('aria-hidden')).toBe('true'));
    expect(container.querySelectorAll('.ox-pcard button')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard a')).toHaveLength(0);

    const cards = screen.getAllByTestId('ox-poster-card');
    cards.forEach((card) => expect(card.tagName).toBe('A'));
  });

  it('resolves the two static-fallback destinations (weekly-picks to /offers, the bundles to the starter bundle)', () => {
    renderWithProviders(<OxPosters data={data()} />);
    const cards = screen.getAllByTestId('ox-poster-card');
    const byy = (slug: string) => cards.find((card) => card.getAttribute('data-poster') === slug);
    expect(byy('weekly-picks')?.getAttribute('href')).toBe('/offers');
    expect(byy('bundle-her')?.getAttribute('href')).toBe('/p1141798217');
    expect(byy('bundle-him')?.getAttribute('href')).toBe('/p1141798217');
    expect(byy('weight-subscription')?.getAttribute('href')).toBe('/services#plans');
    expect(byy('inbody-consult')?.getAttribute('href')).toBe('/p1051830221');
  });

  it('falls back to a search-free /offers for the creatine poster while the live category has not resolved', () => {
    renderWithProviders(<OxPosters data={data()} />);
    const card = screen
      .getAllByTestId('ox-poster-card')
      .find((el) => el.getAttribute('data-poster') === 'bigramy-creatine');
    expect(card?.getAttribute('href')).toBe('/offers');
  });

  it('links the creatine poster to the live category once one resolves', async () => {
    liveCategories.push({ id: 9002, id_: 9002, name: 'كرياتين', url: 'https://optimalx.com.sa/creatine/c9002' });
    renderWithProviders(<OxPosters data={data()} />);
    await waitFor(() => {
      const card = screen
        .getAllByTestId('ox-poster-card')
        .find((el) => el.getAttribute('data-poster') === 'bigramy-creatine');
      expect(card?.getAttribute('href')).toBe('/creatine/c9002');
    });
  });
});

describe('OxPosters, merchant field overrides (twilight.json home.ox-posters)', () => {
  it('reads image_N/link_N/alt_N first, and treats a merchant image as available before the import script ever runs', () => {
    const { container } = renderWithProviders(
      <OxPosters
        data={data({
          image_1: '/assets/posters/owner-upload.webp',
          link_1: '/p999',
          alt_1: 'نص بديل من لوحة التحكم',
        })}
      />
    );
    const first = screen.getAllByTestId('ox-poster-card')[0];
    expect(first.getAttribute('href')).toBe('/p999');
    expect(first.querySelector('.ox-pcard__placeholder')).toBeNull();
    const img = first.querySelector('.ox-pcard__photo') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/assets/posters/owner-upload.webp');
    expect(img.getAttribute('alt')).toBe('نص بديل من لوحة التحكم');
    expect(container.querySelectorAll('.ox-pcard__placeholder')).toHaveLength(POSTER_CARDS.length - 1);
  });

  it('overrides the section title from label/label_en, per the active locale', () => {
    renderWithProviders(<OxPosters data={data({ label: 'عنوان مخصص' })} />);
    expect(screen.getByRole('heading', { name: 'عنوان مخصص' })).toBeTruthy();
  });

  it('falls back to the theme title when label is empty', () => {
    renderWithProviders(<OxPosters data={data()} />);
    expect(screen.getByRole('heading', { name: ar['ox.home.posters_title'] })).toBeTruthy();
  });
});

describe('OxPosters, the carousel on the rail primitive (S5a) and the sprite icons (S6b)', () => {
  it('carries no native scrollbar contract, the cue and the progress strap', async () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const track = container.querySelector('.ox-posters__track');
    expect(track?.classList.contains('ox-rail__track')).toBe(true);
    expect(track?.getAttribute('role')).toBe('list');
    expect(track?.getAttribute('aria-roledescription')).toBe(ar['ox.listing.featured_carousel_role']);
    const slides = container.querySelectorAll('.ox-posters__slide');
    expect(slides).toHaveLength(HOME_CAROUSEL.length);
    expect(slides[0].getAttribute('aria-roledescription')).toBe(ar['ox.listing.featured_slide_role']);
    expect(slides[0].getAttribute('aria-label')).toBe(
      ar['ox.home.posters_slide_label']
        .replace('{{index}}', '1')
        .replace('{{total}}', String(HOME_CAROUSEL.length))
    );

    const cue = container.querySelector('.ox-rail__cue');
    expect(cue?.getAttribute('aria-label')).toBe(ar['ox.home.posters_next']);
    expect(container.querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
    expect(container.querySelector('.ox-rail__progress')).not.toBeNull();
  });

  it('shows the prev/next pair past three cards, prev disabled at the start, next stepping it forward', async () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const arrows = container.querySelectorAll('.ox-posters__arrow');
    expect(arrows).toHaveLength(2);
    expect((arrows[0] as HTMLButtonElement).disabled).toBe(true);
    expect((arrows[1] as HTMLButtonElement).disabled).toBe(false);
    expect(arrows[0].querySelector('.ox-iconbtn--angled')).not.toBeNull();

    fireEvent.click(arrows[1]);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    await waitFor(() => expect((arrows[0] as HTMLButtonElement).disabled).toBe(false));
  });

  it('loads the first two slides eagerly and the rest lazily (the second offer is the third slide)', () => {
    const { container } = renderWithProviders(<OxPosters data={data({ image_1: '/x.webp', image_2: '/y.webp' })} />);
    const images = container.querySelectorAll('.ox-pcard__photo');
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute('loading')).toBe('eager');
    expect(images[1].getAttribute('loading')).toBe('lazy');
  });
});
