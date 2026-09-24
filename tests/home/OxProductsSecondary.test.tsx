import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import { POSTER_CARDS } from '../../app/content/posters';
import { HOME_BLOCK_FIELDS, HOME_BLOCK_HEIGHTS, type OxBlockData } from '../../app/components/home/defaults';

const ar = loadDictionary('ar');

/**
 * "العروض" (owner review 2026-09-25): ONE section under ONE heading, first a
 * carousel of the six offer posters (moved here from the mixed "اكتشف أكثر"
 * row), then the grid of sale products. The contract this file holds:
 *
 *  - one heading and one "view all" to /offers for the whole section; the
 *    grid carries no heading of its own;
 *  - the six posters in the content map's order, on the rail primitive,
 *    before the grid, each the same `PosterCard` link as on /offers;
 *  - a merchant `image_N`/`link_N`/`alt_N` field overrides the content map
 *    (the fields moved here from `ox-posters`);
 *  - an empty placeholder slot is left out, and with none to show the
 *    carousel is gone while the section keeps its heading and products;
 *  - the `show_offers_nav` gate still removes the whole section.
 */

const themeSettings: Record<string, unknown> = {};
const liveCategories: unknown[] = [];
const productList = vi.fn(async () => ({
  items: [
    { id: 1, name: 'منتج أول' },
    { id: 2, name: 'منتج ثان' },
  ],
  next: null,
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({ product }: { product: { name?: string } }) =>
    React.createElement('article', { 'data-testid': 'engine-product-card' }, product.name),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: (params: unknown) => productList(params as never) },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { OxProductsSecondary } = await import('../../app/components/home/OxProductsSecondary');

function data(overrides: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-products-secondary',
    key: 'offers',
    ...HOME_BLOCK_FIELDS['ox-products-secondary'],
    ...overrides,
  } as OxBlockData;
}

const availability = POSTER_CARDS.map((card) => card.available);

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  liveCategories.length = 0;
  productList.mockClear();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  POSTER_CARDS.forEach((card, index) => {
    card.available = availability[index];
  });
});

function offerCards(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-testid="ox-offers-rail"] [data-testid="ox-poster-card"]'));
}

describe('OxProductsSecondary, one section under one heading', () => {
  it('draws one heading and one view-all for the posters and the grid together', async () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(2));
    const section = screen.getByTestId('ox-products-secondary');
    expect(section.querySelectorAll('h2')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: ar['ox.home.offers_title'] })).toBeTruthy();
    const viewAll = section.querySelectorAll('.ox-sh__link');
    expect(viewAll).toHaveLength(1);
    expect(viewAll[0].getAttribute('href')).toBe('/offers');
    expect(container.querySelector('.ox-pgrid .ox-sh')).toBeNull();
  });

  it('puts the poster carousel between the heading and the product grid', async () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    await waitFor(() => expect(container.querySelector('.ox-pgrid')).not.toBeNull());
    const header = container.querySelector('.ox-sh') as Element;
    const rail = screen.getByTestId('ox-offers-rail');
    const grid = container.querySelector('.ox-pgrid') as Element;
    expect(header.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(rail.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('asks for the offers first, falling back to the latest products, cheapest first', async () => {
    renderWithProviders(<OxProductsSecondary data={data()} />);
    await waitFor(() => expect(productList).toHaveBeenCalled());
    expect(productList.mock.calls[0][0]).toMatchObject({ source: 'offers', sort: 'priceFromLowToTop', perPage: 8 });
  });

  it('removes the whole section, posters included, when the store switches offers off', () => {
    themeSettings.show_offers_nav = false;
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    expect(container.querySelector('[data-testid="ox-products-secondary"]')).toBeNull();
    expect(container.querySelector('[data-testid="ox-offers-rail"]')).toBeNull();
  });

  it('reserves the height read off the running page', () => {
    expect(HOME_BLOCK_HEIGHTS['ox-products-secondary']).toEqual({ mobile: 1315, desktop: 1038 });
  });
});

describe('OxProductsSecondary, the six offer posters', () => {
  it('renders the six posters in the content map order, each its photograph and alt text', () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const cards = offerCards(container);
    expect(cards.map((card) => card.getAttribute('data-poster'))).toEqual(POSTER_CARDS.map((card) => card.slug));
    expect(cards.map((card) => card.getAttribute('data-kind'))).toEqual(POSTER_CARDS.map(() => 'offer'));
    expect(container.querySelectorAll('.ox-pcard--content')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard__placeholder')).toHaveLength(0);
    for (const card of POSTER_CARDS) {
      const img = screen.getByAltText(ar[card.altKey]);
      expect(img.getAttribute('src')).toBe(card.photo);
      expect(img.classList.contains('ox-pcard__photo')).toBe(true);
    }
    cards.forEach((card) => {
      expect(card.tagName).toBe('A');
      expect(card.classList.contains('ox-pcard')).toBe(true);
    });
  });

  it('keeps the poster links (the starter bundle, the plans, the InBody product, /offers)', () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const byy = (slug: string) => offerCards(container).find((card) => card.getAttribute('data-poster') === slug);
    expect(byy('inbody-consult')?.getAttribute('href')).toBe('/p1051830221');
    expect(byy('weekly-picks')?.getAttribute('href')).toBe('/offers');
    expect(byy('bundle-her')?.getAttribute('href')).toBe('/p1141798217');
    expect(byy('bundle-him')?.getAttribute('href')).toBe('/p1141798217');
    expect(byy('weight-subscription')?.getAttribute('href')).toBe('/services#plans');
    expect(byy('bigramy-creatine')?.getAttribute('href')).toBe('/offers');
  });

  it('links the creatine poster to the live category once one resolves', async () => {
    liveCategories.push({ id: 9002, name: 'كرياتين', url: 'https://optimalx.com.sa/creatine/c9002' });
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    await waitFor(() => {
      const card = offerCards(container).find((el) => el.getAttribute('data-poster') === 'bigramy-creatine');
      expect(card?.getAttribute('href')).toBe('/creatine/c9002');
    });
  });

  it('reads image_N/link_N/alt_N first (the fields moved here from ox-posters)', () => {
    expect(Object.keys(HOME_BLOCK_FIELDS['ox-products-secondary'])).toEqual(
      expect.arrayContaining(['title', 'image_1', 'link_1', 'alt_1', 'image_6', 'link_6', 'alt_6'])
    );
    const { container } = renderWithProviders(
      <OxProductsSecondary
        data={data({ image_1: '/assets/posters/owner-upload.webp', link_1: '/p999', alt_1: 'نص بديل من لوحة التحكم' })}
      />
    );
    const first = offerCards(container)[0];
    expect(first.getAttribute('href')).toBe('/p999');
    const img = first.querySelector('.ox-pcard__photo') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/assets/posters/owner-upload.webp');
    expect(img.getAttribute('alt')).toBe('نص بديل من لوحة التحكم');
  });

  it('leaves an empty placeholder out, and keeps a slot the merchant filled', () => {
    POSTER_CARDS[1].available = false;
    POSTER_CARDS[2].available = false;
    const { container } = renderWithProviders(<OxProductsSecondary data={data({ image_3: '/owner-3.webp' })} />);
    const slugs = offerCards(container).map((card) => card.getAttribute('data-poster'));
    expect(slugs).not.toContain('weekly-picks');
    expect(slugs).toContain('bundle-her');
    expect(slugs).toHaveLength(POSTER_CARDS.length - 1);
    expect(container.querySelectorAll('.ox-pcard__placeholder')).toHaveLength(0);
  });

  it('hides the carousel when every poster is an empty placeholder, and keeps the heading and the products', async () => {
    POSTER_CARDS.forEach((card) => {
      card.available = false;
    });
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    expect(container.querySelector('[data-testid="ox-offers-rail"]')).toBeNull();
    expect(container.querySelector('.ox-offers-rail__nav')).toBeNull();
    expect(screen.getByRole('heading', { name: ar['ox.home.offers_title'] })).toBeTruthy();
    await waitFor(() => expect(screen.getAllByTestId('engine-product-card')).toHaveLength(2));
  });
});

describe('OxProductsSecondary, the carousel on the rail primitive', () => {
  it('carries the no-scrollbar track, the slide roles, the cue and the progress strap', () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const rail = screen.getByTestId('ox-offers-rail');
    expect(rail.classList.contains('ox-rail')).toBe(true);
    const track = rail.querySelector('.ox-offers-rail__track');
    expect(track?.classList.contains('ox-rail__track')).toBe(true);
    expect(track?.getAttribute('role')).toBe('list');
    expect(track?.getAttribute('aria-roledescription')).toBe(ar['ox.listing.featured_carousel_role']);
    const slides = container.querySelectorAll('.ox-offers-rail__slide');
    expect(slides).toHaveLength(POSTER_CARDS.length);
    expect(slides[0].getAttribute('aria-label')).toBe(
      ar['ox.home.posters_slide_label'].replace('{{index}}', '1').replace('{{total}}', String(POSTER_CARDS.length))
    );
    expect(rail.querySelector('.ox-rail__cue')?.getAttribute('aria-label')).toBe(ar['ox.home.posters_next']);
    expect(rail.querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
    expect(rail.querySelector('.ox-rail__progress')).not.toBeNull();
  });

  it('shows the prev/next pair in the heading, prev disabled at the start, next stepping it forward', async () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const arrows = container.querySelectorAll('.ox-sh__actions .ox-offers-rail__arrow');
    expect(arrows).toHaveLength(2);
    expect((arrows[0] as HTMLButtonElement).disabled).toBe(true);
    expect((arrows[1] as HTMLButtonElement).disabled).toBe(false);
    expect(arrows[0].querySelector('.ox-iconbtn--angled')).not.toBeNull();
    fireEvent.click(arrows[1]);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    await waitFor(() => expect((arrows[0] as HTMLButtonElement).disabled).toBe(false));
  });

  it('moves the cue one poster at a time from where the track is, never through scrollIntoView (review 2026-09-25)', () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const track = container.querySelector<HTMLUListElement>('.ox-offers-rail__track');
    expect(track).not.toBeNull();
    const scrollBy = vi.fn();
    track!.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
    fireEvent.click(container.querySelector('.ox-offers-rail .ox-rail__cue')!);
    fireEvent.click(container.querySelector('.ox-offers-rail .ox-rail__cue')!);
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('loads the first two posters eagerly and the rest lazily', () => {
    const { container } = renderWithProviders(<OxProductsSecondary data={data()} />);
    const images = container.querySelectorAll('.ox-offers-rail .ox-pcard__photo');
    expect(images).toHaveLength(POSTER_CARDS.length);
    expect(images[0].getAttribute('loading')).toBe('eager');
    expect(images[1].getAttribute('loading')).toBe('eager');
    expect(images[2].getAttribute('loading')).toBe('lazy');
  });
});
