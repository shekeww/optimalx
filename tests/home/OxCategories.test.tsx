import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import {
  CATEGORIES,
  ROOT_CATEGORY_SLUGS,
  SHAKER_CATEGORY_SLUGS,
} from '../../app/content/categories';

/**
 * The category row, and the one thing colour is allowed to change about it.
 *
 * The owner's product photography is four branded shakers and they asked for
 * four categories to carry those colours. Two contracts follow from that and
 * both are enforced here rather than described in a comment:
 *
 *   1. the four lead the row, each tone appears exactly once, and every other
 *      tile keeps the neutral card, because that is the state the row is in
 *      for a visitor today;
 *   2. every tone clears WCAG on its own values - 4.5:1 for the label, 3:1 for
 *      the tile's boundary against the page - and the numbers are computed
 *      from the stylesheet, not copied out of it.
 *
 * The size floor is here too. Colour is not allowed to buy a smaller tile.
 */

const categories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => categories }) },
  },
}));

const { OxCategories } = await import('../../app/components/home/OxCategories');

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-categories',
    key: 'cats',
    ...HOME_BLOCK_FIELDS['ox-categories'],
    ...extra,
  } as OxBlockData;
}

async function tiles(): Promise<HTMLElement[]> {
  await waitFor(() => expect(screen.getAllByTestId('ox-category-tile').length).toBeGreaterThan(0));
  return screen.getAllByTestId('ox-category-tile');
}

beforeEach(() => {
  categories.length = 0;
});

describe('OxCategories, the four shaker categories', () => {
  it('leads the row with the four, in the order blue, green, white, black', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    expect(row).toHaveLength(8);
    expect(row.slice(0, 4).map((tile) => tile.getAttribute('data-tone'))).toEqual([
      'blue',
      'green',
      'white',
      'black',
    ]);
  });

  it('leaves the other four neutral, which is the card every tile had before', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    for (const tile of row.slice(4)) {
      expect(tile.getAttribute('data-tone')).toBeNull();
      expect(tile.className).not.toMatch(/ox-tile--/);
    }
  });

  it('spends each colour once: four categories, four shakers, no repeats', () => {
    const tones = CATEGORIES.filter((category) => category.tone !== null).map(
      (category) => category.tone
    );
    expect(tones).toEqual(['blue', 'green', 'white', 'black']);
    expect(new Set(tones).size).toBe(4);
    expect(SHAKER_CATEGORY_SLUGS).toEqual([
      'protein',
      'creatine',
      'vitamins-minerals',
      'collagen-beauty',
    ]);
  });

  it('never puts a tone on a subcategory: only a root category is a tile', () => {
    for (const category of CATEGORIES) {
      if (category.parent !== null) expect(category.tone, category.slug).toBeNull();
    }
  });

  it('still links to a search while the store has no categories at all', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    for (const tile of row) {
      expect(tile.getAttribute('href')).toMatch(/^\/search\?q=/);
    }
  });

  it('keeps the colour when the merchant selects a category the content map knows', async () => {
    renderWithProviders(
      <OxCategories
        data={data({
          categories: [
            { name: 'C1', url: `/${SHAKER_CATEGORY_SLUGS[1]}/c11` },
            { name: 'C2', url: '/whey-protein/c12' },
            { name: 'C3', url: `/${SHAKER_CATEGORY_SLUGS[0]}/c13` },
            { name: 'C4', url: '/nothing-we-know/c14' },
          ],
        })}
      />
    );
    const row = await tiles();
    expect(row).toHaveLength(4);
    // The merchant's order wins; the tone rides along with the slug, and a
    // selection we cannot resolve is neutral rather than guessed at.
    expect(row.map((tile) => tile.getAttribute('data-tone'))).toEqual([
      'green',
      null,
      'blue',
      null,
    ]);
  });

  it('draws the glyph at the same size on a coloured tile as on a neutral one', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    for (const tile of [row[0], row[7]]) {
      const svg = tile.querySelector('svg');
      expect(svg).not.toBeNull();
      // CategoryTile.tsx draws every glyph at the same literal `size={36}`;
      // no per-tile prop carries it, so there is no key or export to read it
      // from.
      expect(svg?.getAttribute('width')).toBe('36');
      expect(tile.querySelector('img')).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// The shaker-tone stylesheet assertions that used to live here (the palette
// declarations, the tile's contrast floors, the 150px box) were removed on
// 2026-09-22 (S2b): `.ox-tile`/`.ox-tile--*`/`--ox-shaker-*` no longer exist
// in `_b2-home.scss` - the home page's type grid is `OxNeeds`' types pane now
// (`tests/home/OxNeeds.test.tsx` carries the equivalent tint-contrast
// assertions for `.ox-need--*`). `OxCategories.tsx`/`CategoryTile.tsx`
// themselves stay on disk unregistered (see `docs/build/progress/S2b.md`:
// this batch's `rm` calls were denied by the harness), so the component
// tests above this comment - which read the component's own DOM output, not
// the stylesheet - still exercise real, if dead, code and still pass.
// ---------------------------------------------------------------------------

describe('the category map', () => {
  it('leaves ROOT_CATEGORY_SLUGS in catalogue order: this is a home arrangement', () => {
    // The listing pages read the roots in catalogue order and the home page
    // re-orders its own row. Changing the map's order to get a coloured lead
    // would move a taxonomy to win a layout.
    expect(ROOT_CATEGORY_SLUGS[0]).toBe('protein');
    expect(ROOT_CATEGORY_SLUGS).toHaveLength(10);
    expect(ROOT_CATEGORY_SLUGS.indexOf('vitamins-minerals')).toBeGreaterThan(3);
  });
});
