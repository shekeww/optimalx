import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { MENU, TAXONOMY } from '../../app/content/taxonomy';
import { ART_CATEGORY_SLUGS, HOME_TILE_TONES, HOME_TYPE_SLUGS } from '../../app/content/categories';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * `/categories` (PLAN-ship Batch S1 step 6, Accept: "200 with 16 cards").
 *
 * Sixteen cards are the ten type roots and the six goals; the four utility
 * categories are a row of their own. Every link comes from
 * `useTaxonomyLinks`, so the page agrees with the header on where a slug
 * goes: the live category when the store has one, a search until then.
 *
 * Owner review 2026-09-25: the type grid is the HOME grid ("it should have
 * the same exact design of categories section in homepage"). Each type is
 * the home page's own `CategoryTile` in `.ox-cats__grid`, with no meta
 * description and no child chips on the tile.
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
const { OxCategories } = await import('../../app/components/home/OxCategories');
const { createT } = await import('../helpers/i18n');
const t = createT('ar');

const TILE = '[data-testid="ox-category-tile"]';

function typeSection(container: HTMLElement): HTMLElement {
  return container.querySelector('section[aria-labelledby="categories-types-title"]') as HTMLElement;
}

beforeEach(() => {
  liveCategories.length = 0;
});

describe('CategoriesIndex', () => {
  it('renders sixteen cards: the ten type roots then the six goals, in taxonomy order', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    expect(container.querySelectorAll('.ox-cat-index__item')).toHaveLength(16);
    const tiles = container.querySelectorAll(TILE);
    expect(tiles).toHaveLength(10);
    expect(Array.from(tiles).map((tile) => tile.getAttribute('data-category'))).toEqual(
      MENU.types.map((node) => node.slug)
    );
    expect(Array.from(tiles).map((tile) => tile.querySelector('.ox-tile__name')?.textContent)).toEqual(
      MENU.types.map((node) => t(node.nameKey))
    );
    const goalCards = container.querySelectorAll('[data-testid="ox-goal-card"]');
    expect(goalCards).toHaveLength(6);
    expect(Array.from(goalCards).map((card) => card.getAttribute('data-goal'))).toEqual(
      MENU.goals.map((node) => node.slug)
    );
  });

  it('is a page with words: one h1, the breadcrumb, an intro and three labelled sections', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const headings = container.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.tax.index.h1'));
    expect(container.querySelector('[data-testid="engine-breadcrumb"]')?.textContent).toBe(
      t('ox.tax.index.h1')
    );
    expect(container.querySelector('.ox-page-head__lead')?.textContent).toBe(t('ox.tax.index.intro'));
    expect(container.querySelectorAll('section[aria-labelledby] h2')).toHaveLength(3);
    // Every string resolved: no text on the page is still a lookup key.
    expect(container.textContent).not.toMatch(/\box\.[a-z_]+\.[a-z_.]+/);
  });

  it('draws the type grid as the home grid: the home tile, no description, no child chips', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const section = typeSection(container);
    const grid = section.querySelector('ul.ox-cats__grid') as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.getAttribute('role')).toBe('list');
    expect(grid.className).toMatch(/\box-reveal\b/);
    expect(grid.querySelectorAll(`:scope > li > ${TILE}`)).toHaveLength(10);
    // The retired type card and everything it carried under the tile.
    expect(container.querySelector('.ox-cat-card')).toBeNull();
    expect(section.querySelector('.ox-small')).toBeNull();
    expect(section.querySelector('.ox-chip')).toBeNull();
    expect(section.querySelectorAll('a')).toHaveLength(10);
    // The goals sit in the home goals grid.
    expect(container.querySelector('ul.ox-goals__grid.ox-reveal')).not.toBeNull();
  });

  it('renders each home slug exactly as the home grid renders it', async () => {
    const home = renderWithProviders(
      <OxCategories
        data={{ path: 'ox-categories', key: 'cats', ...HOME_BLOCK_FIELDS['ox-categories'] } as OxBlockData}
      />
    );
    await waitFor(() => expect(home.container.querySelectorAll(TILE)).toHaveLength(8));
    const homeTiles = new Map(
      Array.from(home.container.querySelectorAll(TILE)).map((tile) => [tile.getAttribute('data-category'), tile.outerHTML])
    );
    home.unmount();

    const { container } = renderWithProviders(<CategoriesIndex />);
    for (const slug of HOME_TYPE_SLUGS) {
      const tile = container.querySelector(`${TILE}[data-category="${slug}"]`);
      expect(tile?.outerHTML, slug).toBe(homeTiles.get(slug));
    }
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
    const links = Array.from(container.querySelectorAll(`${TILE}, [data-testid="ox-goal-card"], [data-testid="ox-utility-row"]`));
    expect(links).toHaveLength(20);
    for (const link of links) expect(link.getAttribute('href')).toMatch(/^\/search\?q=/);
    for (const tile of container.querySelectorAll(TILE)) {
      expect(tile.querySelector('.ox-tile__icon')).not.toBeNull();
      expect(tile.querySelector('.ox-tile__arrow')).not.toBeNull();
      // Eight of the ten type roots carry the owner's curated art
      // (`ART_CATEGORY_SLUGS`) and render it as the whole tile; the other two
      // render the home tile's tinted variant, whose image slot is a
      // background, never an `<img>`.
      const slug = tile.getAttribute('data-category');
      if (slug && ART_CATEGORY_SLUGS.includes(slug)) {
        expect(tile.querySelector('img.ox-tile__art')).not.toBeNull();
      } else {
        expect(tile.querySelector('img')).toBeNull();
        expect(tile.querySelector('.ox-tile__image')).not.toBeNull();
      }
    }
  });

  it('renders the curated art tile for creatine, and the tinted tile for snacks-bars (no curated art)', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const creatine = container.querySelector(`${TILE}[data-category="creatine"]`) as HTMLElement;
    const snacks = container.querySelector(`${TILE}[data-category="snacks-bars"]`) as HTMLElement;
    expect(ART_CATEGORY_SLUGS).toContain('creatine');
    expect(ART_CATEGORY_SLUGS).not.toContain('snacks-bars');

    const art = creatine.querySelector('.ox-tile__art') as HTMLImageElement;
    expect(art.getAttribute('src')).toBe('/categories/creatine.webp');
    expect(art.getAttribute('alt')).toBe('');
    expect(creatine.className).toMatch(/ox-tile--art/);
    expect(creatine.querySelector('.ox-tile__body .ox-tile__foot')).not.toBeNull();

    expect(snacks.querySelector('.ox-tile__art')).toBeNull();
    expect(snacks.className).not.toMatch(/ox-tile--art/);
    expect(snacks.getAttribute('data-tone')).toBe('ash');
  });

  it('resolves a tile to the live category once one exists, keeping the short name and the art', async () => {
    liveCategories.push({
      id: 9001,
      id_: 9001,
      name: 'بروتين باودر',
      url: 'https://optimalx.com.sa/protein/c9001',
      image: 'https://cdn.salla.sa/x/protein.jpg',
      products_count: 14,
      sub_categories: [
        { id: 9011, id_: 9011, name: 'واي بروتين', url: 'https://optimalx.com.sa/whey-protein/c9011' },
      ],
    });
    const { container } = renderWithProviders(<CategoriesIndex />);
    await waitFor(() =>
      expect(container.querySelector(`${TILE}[data-category="protein"]`)?.getAttribute('href')).toBe(
        '/protein/c9001'
      )
    );
    const protein = container.querySelector(`${TILE}[data-category="protein"]`) as HTMLElement;
    // The home tile's own label: the node's short name, never the live
    // category's longer one.
    expect(protein.querySelector('.ox-tile__name')?.textContent).toBe(t('ox.tax.protein.name'));
    // Curated artwork wins over the live image.
    expect(protein.querySelector('img.ox-tile__art')?.getAttribute('src')).toBe('/categories/protein.webp');
    expect(protein.querySelector('.ox-tile__image')).toBeNull();
    // The children are not on the tile; the protein listing carries them.
    expect(protein.querySelector('.ox-chip')).toBeNull();
    // The other nine roots still fall back.
    const fallbacks = Array.from(container.querySelectorAll(TILE)).filter((tile) =>
      tile.getAttribute('href')?.startsWith('/search?q=')
    );
    expect(fallbacks).toHaveLength(9);
    expect(TAXONOMY).toHaveLength(25);
    // No count ever prints, even on a live, positive products_count.
    expect(protein.textContent).not.toMatch(/14/);
  });

  it('tints every type tile off the same HOME_TILE_TONES map the home grid uses', () => {
    const { container } = renderWithProviders(<CategoriesIndex />);
    const tiles = Array.from(container.querySelectorAll(TILE));
    expect(tiles).toHaveLength(10);
    for (const tile of tiles) {
      const slug = tile.getAttribute('data-category') as string;
      const tone = (HOME_TILE_TONES as Record<string, string>)[slug] ?? 'ash';
      expect(tile.getAttribute('data-tone')).toBe(tone);
      expect(tile.className).toMatch(new RegExp(`\\box-tile--${tone}\\b`));
    }
  });
});
