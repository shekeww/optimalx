import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { CONTENT_CARDS } from '../../app/content/posters';
import { HOME_BLOCK_FIELDS, HOME_BLOCK_HEIGHTS, type OxBlockData } from '../../app/components/home/defaults';

const ar = loadDictionary('ar');

/**
 * The "اكتشف أكثر" carousel. Owner review 2026-09-25: the six offer posters
 * that used to alternate with the content cards moved into "العروض"
 * (`OxProductsSecondary`, tests/home/OxProductsSecondary.test.tsx), so this
 * block is the five content cards alone (restored from 4657b89, S8a), and
 * it moved down the page to close the category rails. The contract this
 * file holds:
 *
 *  - five content cards in the content map's order, each a single link
 *    (never a nested control) with its photograph, title, line and angled
 *    arrow, and no offer poster anywhere in the row;
 *  - `label`/`label_en` override the title; the block carries no offer
 *    fields any more (they moved with the posters);
 *  - the rail primitive (S5a), the `Icon`-drawn nav arrows (S6b) and the
 *    `ox.home.posters_lead` subline are untouched.
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

const CONTENT_ORDER = ['snacks', 'strength', 'cardio', 'advisory', 'branch'];

describe('OxPosters, the five content cards alone (owner review 2026-09-25)', () => {
  it('renders the five content cards in the content map order, and no offer poster', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const cards = screen.getAllByTestId('ox-poster-card');
    expect(CONTENT_CARDS.map((card) => card.slug)).toEqual(CONTENT_ORDER);
    expect(cards.map((card) => card.getAttribute('data-poster'))).toEqual(CONTENT_ORDER);
    expect(cards.map((card) => card.getAttribute('data-kind'))).toEqual(CONTENT_ORDER.map(() => 'content'));
    expect(container.querySelectorAll('[data-kind="offer"]')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard__photo')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard--content')).toHaveLength(CONTENT_CARDS.length);
  });

  it('draws each card as its photograph behind a scrim, the title, the line and the angled arrow', () => {
    renderWithProviders(<OxPosters data={data()} />);
    const cards = screen.getAllByTestId('ox-poster-card');
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
  });

  it('keeps every card one link: no strap, no nested link or button', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    expect(container.querySelectorAll('.ox-pcard__slash')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard button')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard a')).toHaveLength(0);
    screen.getAllByTestId('ox-poster-card').forEach((card) => expect(card.tagName).toBe('A'));
  });

  it('ignores the offer poster fields, which moved to the offers section', () => {
    const { container } = renderWithProviders(
      <OxPosters data={data({ image_1: '/assets/posters/owner-upload.webp', link_1: '/p999' } as Partial<OxBlockData>)} />
    );
    expect(Object.keys(HOME_BLOCK_FIELDS['ox-posters']).sort()).toEqual(['label', 'label_en']);
    expect(container.querySelector('img[src="/assets/posters/owner-upload.webp"]')).toBeNull();
    expect(container.querySelector('a[href="/p999"]')).toBeNull();
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

  it('reserves the height read off the running page (506 at both widths)', () => {
    expect(HOME_BLOCK_HEIGHTS['ox-posters']).toEqual({ mobile: 506, desktop: 506 });
  });
});

describe('OxPosters, the header', () => {
  it('overrides the section title from label/label_en, per the active locale', () => {
    renderWithProviders(<OxPosters data={data({ label: 'عنوان مخصص' })} />);
    expect(screen.getByRole('heading', { name: 'عنوان مخصص' })).toBeTruthy();
  });

  it('falls back to the theme title and carries the lead line', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    expect(screen.getByRole('heading', { name: ar['ox.home.posters_title'] })).toBeTruthy();
    expect(container.querySelector('.ox-sh__subline')?.textContent).toBe(ar['ox.home.posters_lead']);
  });
});

describe('OxPosters, the carousel on the rail primitive (S5a) and the sprite icons (S6b)', () => {
  it('carries no native scrollbar contract, the cue and the progress strap', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const track = container.querySelector('.ox-posters__track');
    expect(track?.classList.contains('ox-rail__track')).toBe(true);
    expect(track?.getAttribute('role')).toBe('list');
    expect(track?.getAttribute('aria-roledescription')).toBe(ar['ox.listing.featured_carousel_role']);
    const slides = container.querySelectorAll('.ox-posters__slide');
    expect(slides).toHaveLength(CONTENT_CARDS.length);
    expect(slides[0].getAttribute('aria-roledescription')).toBe(ar['ox.listing.featured_slide_role']);
    expect(slides[0].getAttribute('aria-label')).toBe(
      ar['ox.home.posters_slide_label']
        .replace('{{index}}', '1')
        .replace('{{total}}', String(CONTENT_CARDS.length))
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

  it('moves the cue one card at a time from where the track is, never through scrollIntoView (review 2026-09-25)', () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    const track = container.querySelector<HTMLUListElement>('.ox-posters__track');
    expect(track).not.toBeNull();
    const scrollBy = vi.fn();
    track!.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
    fireEvent.click(container.querySelector('.ox-posters__rail .ox-rail__cue')!);
    fireEvent.click(container.querySelector('.ox-posters__rail .ox-rail__cue')!);
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
