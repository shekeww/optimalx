import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { ART_CATEGORY_SLUGS, HOME_TYPE_SLUGS } from '../../app/content/categories';

/**
 * "Browse by type" (owner restyle 2026-09-22, reverting the "shop by need"
 * merge back into two separate sections). The contract enforced here:
 *
 *   1. eight tiles, all coloured, `collagen-beauty` the black emphasis card;
 *   2. the icon renders above the image slot in source order (the owner:
 *      "the icons to be above the images");
 *   3. the image slot is a background, never an `<img>` that can 404;
 *   4. the count only prints on a live, positive `products_count`;
 *   5. a merchant selection overrides the default eight.
 */

const liveCategories: unknown[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => [] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
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
  liveCategories.length = 0;
});

describe('OxCategories, the default eight', () => {
  it('renders the eight type roots, in content-map order, each tile coloured', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    expect(row).toHaveLength(8);
    expect(row.map((tile) => tile.getAttribute('data-category'))).toEqual(HOME_TYPE_SLUGS);
    for (const tile of row) {
      expect(tile.getAttribute('data-tone')).not.toBeNull();
      expect(tile.className).toMatch(/ox-tile--/);
    }
  });

  it('keeps collagen-beauty the one black emphasis card', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    const collagen = row.find((tile) => tile.getAttribute('data-category') === 'collagen-beauty');
    expect(collagen?.getAttribute('data-tone')).toBe('black');
    expect(row.filter((tile) => tile.getAttribute('data-tone') === 'black')).toHaveLength(1);
  });

  it('draws the icon before the image slot in source order (owner: icons above the images)', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    const svg = row[0].querySelector('svg');
    const image = row[0].querySelector('.ox-tile__image');
    expect(svg).not.toBeNull();
    expect(image).not.toBeNull();
    // DOM order is paint/reading order for this non-grid, non-absolute pair.
    const children = Array.from(row[0].children);
    expect(children.indexOf(svg as Element)).toBeLessThan(children.indexOf(image as Element));
  });

  it('never renders an <img> for the image slot: a background only, so a 404 never paints a broken glyph', async () => {
    liveCategories.push({
      id: 1,
      name: 'بروتين',
      url: `/${HOME_TYPE_SLUGS[0]}/c1`,
      products_count: 5,
      image: 'https://cdn.example/protein.jpg',
    });
    renderWithProviders(<OxCategories data={data()} />);
    await tiles();
    await waitFor(() =>
      expect(
        (screen.getAllByTestId('ox-category-tile')[0].querySelector('.ox-tile__image') as HTMLElement)
          .style.backgroundImage
      ).toContain('https://cdn.example/protein.jpg')
    );
    expect(screen.getAllByTestId('ox-category-tile')[0].querySelector('img')).toBeNull();
  });

  it('falls back to the theme custom property when the live category has no image', async () => {
    // `daily-health` (index 7): the other home tile with no curated art, so
    // the live-image background slot still governs it (`creatine`, index 1,
    // now always carries its own curated art regardless of the live image -
    // covered by the art tests below).
    const dailyHealthIndex = HOME_TYPE_SLUGS.indexOf('daily-health');
    liveCategories.push({
      id: 2,
      name: 'الصحة اليومية',
      url: `/${HOME_TYPE_SLUGS[dailyHealthIndex]}/c2`,
      products_count: 3,
      image: null,
    });
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    const image = row[dailyHealthIndex].querySelector('.ox-tile__image') as HTMLElement;
    expect(image.style.backgroundImage).toContain(`--ox-need-image-${HOME_TYPE_SLUGS[dailyHealthIndex]}`);
  });

  it('renders the curated art tile for creatine, and no <img> for protein (no curated art yet)', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    const creatineIndex = HOME_TYPE_SLUGS.indexOf('creatine');
    const proteinIndex = HOME_TYPE_SLUGS.indexOf('protein');
    expect(ART_CATEGORY_SLUGS).toContain('creatine');
    expect(ART_CATEGORY_SLUGS).not.toContain('protein');

    const art = row[creatineIndex].querySelector('.ox-tile__art') as HTMLImageElement;
    expect(art).not.toBeNull();
    expect(art.getAttribute('src')).toBe('/categories/creatine.webp');
    expect(art.getAttribute('loading')).toBe('lazy');
    expect(art.getAttribute('decoding')).toBe('async');
    expect(art.getAttribute('width')).toBe('1024');
    expect(art.getAttribute('height')).toBe('1536');
    expect(art.getAttribute('alt')).toBe('');
    expect(row[creatineIndex].className).toMatch(/ox-tile--art/);

    expect(row[proteinIndex].querySelector('.ox-tile__art')).toBeNull();
    expect(row[proteinIndex].querySelector('.ox-tile__image')).not.toBeNull();
    expect(row[proteinIndex].className).not.toMatch(/ox-tile--art/);
  });

  it('prints the count only on a live, positive products_count', async () => {
    liveCategories.push(
      { id: 1, name: 'بروتين', url: `/${HOME_TYPE_SLUGS[0]}/c1`, products_count: 14, image: null },
      { id: 2, name: 'كرياتين', url: `/${HOME_TYPE_SLUGS[1]}/c2`, products_count: 0, image: null }
    );
    renderWithProviders(<OxCategories data={data()} />);
    await tiles();
    await waitFor(() =>
      expect(
        screen.getAllByTestId('ox-category-tile')[0].querySelector('.ox-tile__count')?.textContent
      ).toContain('14')
    );
    const row = screen.getAllByTestId('ox-category-tile');
    expect(row[1].querySelector('.ox-tile__count')).toBeNull();
    // The tiles the store has not resolved at all carry no count either.
    for (const tile of row.slice(2)) {
      expect(tile.querySelector('.ox-tile__count')).toBeNull();
    }
  });

  it('still links to a search while the store has no categories at all', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    for (const tile of row) {
      expect(tile.getAttribute('href')).toMatch(/^\/search\?q=/);
    }
  });

  it('uses the short taxonomy name, not the live category label', async () => {
    liveCategories.push({
      id: 1,
      name: 'اسم طويل من لوحة التحكم',
      url: `/${HOME_TYPE_SLUGS[0]}/c1`,
      products_count: 5,
      image: null,
    });
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    expect(row[0].textContent).not.toContain('اسم طويل من لوحة التحكم');
  });
});

describe('OxCategories, a merchant selection', () => {
  it('overrides the default eight, in the merchant order', async () => {
    renderWithProviders(
      <OxCategories
        data={data({
          categories: [
            { name: 'C1', url: `/${HOME_TYPE_SLUGS[1]}/c11` },
            { name: 'C2', url: '/whey-protein/c12' },
          ],
        })}
      />
    );
    const row = await tiles();
    expect(row).toHaveLength(2);
    expect(row[0].getAttribute('data-tone')).toBe('ash');
  });

  it('gives an unresolved merchant slug the neutral tint rather than guessing', async () => {
    renderWithProviders(
      <OxCategories
        data={data({ categories: [{ name: 'C4', url: '/nothing-we-know/c14' }] })}
      />
    );
    const row = await tiles();
    expect(row[0].getAttribute('data-tone')).toBe('ash');
  });
});
