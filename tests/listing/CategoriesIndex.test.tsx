import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { MENU, TAXONOMY, childrenOf } from '../../app/content/taxonomy';
import { ART_CATEGORY_SLUGS, HOME_TILE_TONES } from '../../app/content/categories';

/**
 * `/categories` (PLAN-ship Batch S1 step 6, Accept: "200 with 16 cards").
 *
 * Sixteen cards are the ten type roots and the six goals; the four utility
 * categories are a row of their own. Every link comes from
 * `useTaxonomyLinks`, so the page agrees with the header on where a slug
 * goes: the live category when the store has one, a search until then.
 */

const liveCategories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: ({ page }: { page: { title: string } }) => (
    <nav data-testid="engine-breadcrumb">{page.title}</nav>
  ),
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { CategoriesIndex } = await import('../../app/components/listing/CategoriesIndex');
const { createT } = await import('../helpers/i18n');
const t = createT('ar');

beforeEach(() => {
  liveCategories.length = 0;
});

describe('CategoriesIndex', () => {
  it('renders sixteen cards: the ten type roots then the six goals, in taxonomy order', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    expect(container.querySelectorAll('.ox-cat-index__item')).toHaveLength(16);
    const typeCards = container.querySelectorAll('[data-testid="ox-type-card"]');
    expect(typeCards).toHaveLength(10);
    expect(Array.from(typeCards).map((card) => card.querySelector('.ox-cat-card__name')?.textContent)).toEqual(
      MENU.types.map((node) => t(node.nameKey))
    );
    const goalCards = container.querySelectorAll('[data-testid="ox-goal-card"]');
    expect(goalCards).toHaveLength(6);
    expect(Array.from(goalCards).map((card) => card.getAttribute('data-goal'))).toEqual(
      MENU.goals.map((node) => node.slug)
    );
  });

  it('is a page with words: one h1, the breadcrumb, an intro, and a description per type card', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const headings = container.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.tax.index.h1'));
    expect(container.querySelector('[data-testid="engine-breadcrumb"]')?.textContent).toBe(
      t('ox.tax.index.h1')
    );
    expect(container.querySelector('.ox-page-head__lead')?.textContent).toBe(t('ox.tax.index.intro'));
    const descriptions = container.querySelectorAll('[data-testid="ox-type-card"] .ox-cat-card__desc');
    expect(descriptions).toHaveLength(10);
    // The paragraph is outside the link: the accessible name is the name.
    expect(container.querySelector('.ox-cat-card__link .ox-cat-card__desc')).toBeNull();
    // Three h2 sections, each labelled.
    expect(container.querySelectorAll('section[aria-labelledby] h2')).toHaveLength(3);
    // Every string resolved: no text on the page is still a lookup key. This
    // is the "no raw ox.* keys in the html" half of the Accept curl, pinned
    // here against the real dictionaries so it does not wait for a restart.
    expect(container.textContent).not.toMatch(/\box\.[a-z_]+\.[a-z_.]+/);
  });

  it('nests the five protein children as chips on the protein card, and no chips elsewhere', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const cards = Array.from(container.querySelectorAll('[data-testid="ox-type-card"]'));
    const protein = cards[0];
    const chips = protein.querySelectorAll('.ox-cat-card__children a');
    expect(chips).toHaveLength(5);
    expect(Array.from(chips).map((chip) => chip.textContent)).toEqual(
      childrenOf('protein').map((node) => t(node.nameKey))
    );
    expect(container.querySelectorAll('.ox-cat-card__children')).toHaveLength(1);
  });

  it('lists the four utility categories as a row of their own, with 44px rows', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const rows = container.querySelectorAll('[data-testid="ox-utility-row"]');
    expect(rows).toHaveLength(4);
    expect(Array.from(rows).map((row) => row.querySelector('.ox-cat-index__util-name')?.textContent)).toEqual(
      MENU.utility.map((node) => t(node.nameKey))
    );
    expect(container.querySelectorAll('.ox-cat-index__utility-item')).toHaveLength(4);
  });

  it('links every card to a search for its name until the store has the category', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const links = Array.from(container.querySelectorAll('.ox-cat-card__link, [data-testid="ox-goal-card"], [data-testid="ox-utility-row"]'));
    expect(links).toHaveLength(20);
    for (const link of links) expect(link.getAttribute('href')).toMatch(/^\/search\?q=/);
    for (const card of container.querySelectorAll('[data-testid="ox-type-card"]')) {
      expect(card.getAttribute('data-resolved')).toBe('false');
      expect(card.querySelector('.ox-cat-card__icon')).not.toBeNull();
      // Six of the ten type roots carry the owner's own curated art
      // (`ART_CATEGORY_SLUGS`, S2h 2026-09-23) and render an `<img>` for it;
      // the other four still fall back to the tinted background, no `<img>`.
      const slug = card.getAttribute('data-category');
      if (slug && ART_CATEGORY_SLUGS.includes(slug)) {
        expect(card.querySelector('img')).not.toBeNull();
      } else {
        expect(card.querySelector('img')).toBeNull();
      }
    }
  });

  it('renders the curated art tile for creatine, and no <img> for protein (no curated art yet)', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const creatine = container.querySelector('[data-testid="ox-type-card"][data-category="creatine"]') as HTMLElement;
    const protein = container.querySelector('[data-testid="ox-type-card"][data-category="protein"]') as HTMLElement;
    expect(ART_CATEGORY_SLUGS).toContain('creatine');
    expect(ART_CATEGORY_SLUGS).not.toContain('protein');

    const art = creatine.querySelector('.ox-cat-card__art') as HTMLImageElement;
    expect(art).not.toBeNull();
    expect(art.getAttribute('src')).toBe('/categories/creatine.webp');
    expect(art.getAttribute('loading')).toBe('lazy');
    expect(art.getAttribute('decoding')).toBe('async');
    expect(art.getAttribute('width')).toBe('1024');
    expect(art.getAttribute('height')).toBe('1536');
    expect(art.getAttribute('alt')).toBe('');
    expect(creatine.className).toMatch(/ox-cat-card--art/);

    expect(protein.querySelector('.ox-cat-card__art')).toBeNull();
    expect(protein.querySelector('.ox-cat-card__media')).not.toBeNull();
    expect(protein.className).not.toMatch(/ox-cat-card--art/);
  });

  it('scopes the art card body to its own link, with the frame classes and desc/children as siblings outside it (S2i)', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const creatine = container.querySelector(
      '[data-testid="ox-type-card"][data-category="creatine"]'
    ) as HTMLElement;
    const link = creatine.querySelector('.ox-cat-card__link') as HTMLElement;
    const art = creatine.querySelector('.ox-cat-card__art') as HTMLElement;
    const body = creatine.querySelector('.ox-cat-card__body') as HTMLElement;
    const desc = creatine.querySelector('.ox-cat-card__desc') as HTMLElement;

    // `.ox-cat-card__body` (and its foot, the count + arrow) must sit inside
    // the SAME element the artwork does, `.ox-cat-card__link` - the
    // positioning scope the S2i fix relies on so the foot lands at the
    // bottom of the artwork, not past the description below it.
    expect(link.contains(art)).toBe(true);
    expect(link.contains(body)).toBe(true);
    expect(body.querySelector('.ox-cat-card__foot')).not.toBeNull();
    // The description stays a sibling OUTSIDE the link, same place as the
    // tinted card's own - never nested inside the artwork's positioning
    // scope, and never inside the stretched click target either.
    expect(desc).not.toBeNull();
    expect(link.contains(desc)).toBe(false);
    // The outer card keeps the tinted card's own 1px frame class hook: the
    // same `ox-cat-card` root, carrying `--art` as a modifier, not a
    // replacement.
    expect(creatine.className).toMatch(/\box-cat-card\b/);
  });

  it('resolves a card to the live category, with its image, once one exists', async () => {
    liveCategories.push({
      id: 9001,
      id_: 9001,
      name: 'بروتين',
      url: 'https://optimalx.com.sa/protein/c9001',
      image: 'https://cdn.salla.sa/x/protein.jpg',
      products_count: 14,
      sub_categories: [
        { id: 9011, id_: 9011, name: 'واي بروتين', url: 'https://optimalx.com.sa/whey-protein/c9011' },
      ],
    });
    const { container } = renderWithProviders(<CategoriesIndex />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="ox-type-card"][data-resolved="true"]')).not.toBeNull()
    );
    const protein = container.querySelector('[data-testid="ox-type-card"][data-resolved="true"]') as HTMLElement;
    expect(protein.querySelector('.ox-cat-card__link')?.getAttribute('href')).toBe(
      'https://optimalx.com.sa/protein/c9001'
    );
    // The image slot is a background, never an `<img>` that can 404.
    expect(protein.querySelector('img')).toBeNull();
    const media = protein.querySelector('.ox-cat-card__media') as HTMLElement;
    expect(media.style.backgroundImage).toContain('https://cdn.salla.sa/x/protein.jpg');
    // The nested child resolved through the flattened list; its siblings did not.
    const chips = Array.from(protein.querySelectorAll('.ox-cat-card__children a'));
    expect(chips[0].getAttribute('href')).toBe('https://optimalx.com.sa/whey-protein/c9011');
    expect(chips[1].getAttribute('href')).toMatch(/^\/search\?q=/);
    // The other nine roots still fall back.
    expect(container.querySelectorAll('[data-testid="ox-type-card"][data-resolved="false"]')).toHaveLength(9);
    expect(TAXONOMY).toHaveLength(25);
    // The count only prints on this live, positive products_count.
    expect(protein.querySelector('.ox-cat-card__count')?.textContent).toContain('14');
  });

  it('tints every type card, off the same HOME_TILE_TONES map the home grid uses', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const cards = Array.from(container.querySelectorAll('[data-testid="ox-type-card"]'));
    expect(cards).toHaveLength(10);
    for (const card of cards) {
      const slug = card.getAttribute('data-tone');
      expect(slug).not.toBeNull();
      expect(card.className).toMatch(/ox-cat-card--/);
    }
    const protein = cards.find((card) => card.querySelector('.ox-cat-card__name')?.textContent === t('ox.tax.protein.name'));
    expect(protein?.getAttribute('data-tone')).toBe(HOME_TILE_TONES.protein);
  });

  it('prints no count while the category has not resolved', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    expect(container.querySelectorAll('[data-testid="ox-type-card"] .ox-cat-card__count')).toHaveLength(0);
  });
});
