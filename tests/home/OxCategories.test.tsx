import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
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

  it('draws the 44px glyph on a coloured tile exactly as on a neutral one', async () => {
    renderWithProviders(<OxCategories data={data()} />);
    const row = await tiles();
    for (const tile of [row[0], row[7]]) {
      const svg = tile.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('width')).toBe('44');
      expect(tile.querySelector('img')).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// The colours themselves, read out of the stylesheet and measured.
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '../..');
const TOKENS_CSS = fs.readFileSync(path.join(ROOT, 'app/styles/tokens.css'), 'utf8');
const SHEETS = [
  TOKENS_CSS,
  fs.readFileSync(path.join(ROOT, 'app/styles/06-ox/_b2-home.scss'), 'utf8'),
].join('\n');

/** Every `--name: value` in the source; the last declaration wins. */
function declarations(source: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi)) {
    out.set(match[1], match[2].trim());
  }
  return out;
}

const DECLARED = declarations(SHEETS);
/**
 * The root palette alone. Three of the four tone rules re-point --ox-accent,
 * so asking DECLARED for it returns whichever tone rule was written last
 * rather than the theme's orange, and the one tone that does NOT re-point it
 * would then be measured against a colour it never draws.
 */
const BASE = declarations(TOKENS_CSS);

/** Follow `var(--x)` until a literal hex falls out. */
function hex(name: string, from: Map<string, string> = DECLARED): string {
  let value = from.get(name);
  expect(value, `${name} is not declared`).toBeDefined();
  for (let hop = 0; hop < 8 && value; hop += 1) {
    const alias = /^var\((--[a-z0-9-]+)\)$/i.exec(value.trim());
    if (!alias) break;
    value = DECLARED.get(alias[1]);
  }
  expect(value, `${name} does not resolve to a hex`).toMatch(/^#[0-9a-f]{6}$/i);
  return (value as string).toUpperCase();
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(value: string): number {
  const n = value.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(n.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

interface Tone {
  tone: string;
  ground: string;
  edge: string;
  type: string;
}

const TONES: Tone[] = [
  { tone: 'blue', ground: '--ox-shaker-blue', edge: '--ox-shaker-blue-edge', type: '--ox-paper' },
  { tone: 'green', ground: '--ox-shaker-green', edge: '--ox-shaker-green-edge', type: '--ox-ink' },
  { tone: 'white', ground: '--ox-shaker-white', edge: '--ox-shaker-white-edge', type: '--ox-ink' },
  {
    tone: 'black',
    ground: '--ox-shaker-black',
    edge: '--ox-shaker-black-edge',
    type: '--ox-ink-on-dark',
  },
];

describe('the shaker palette', () => {
  it('declares all eight values, and none of them is invented at the call site', () => {
    for (const { ground, edge } of TONES) {
      expect(hex(ground)).toMatch(/^#[0-9A-F]{6}$/);
      expect(hex(edge)).toMatch(/^#[0-9A-F]{6}$/);
    }
    // Every hex in the tone rules is a var(), never a literal.
    const rules = /\.ox-tile--(?:blue|green|white|black)\s*\{[^}]*\}/g;
    for (const rule of SHEETS.match(rules) ?? []) {
      expect(rule).not.toMatch(/#[0-9a-f]{3,6}/i);
    }
  });

  it('carries its label at 4.5:1 on every tone', () => {
    for (const { tone, ground, type } of TONES) {
      expect(contrast(hex(type), hex(ground)), tone).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('gives every tile a boundary of at least 3:1 against the page', () => {
    const page = hex('--ox-paper');
    for (const { tone, ground, edge } of TONES) {
      const boundary = Math.max(contrast(hex(ground), page), contrast(hex(edge), page));
      expect(boundary, tone).toBeGreaterThanOrEqual(3);
    }
  });

  it('holds the near-white tile with its border, because its ground cannot', () => {
    // The near-white shaker is a step off the page and nothing more, so the
    // tile would be a shape with no edge if the border were decorative.
    expect(contrast(hex('--ox-shaker-white'), hex('--ox-paper'))).toBeLessThan(3);
    expect(contrast(hex('--ox-shaker-white-edge'), hex('--ox-paper'))).toBeGreaterThanOrEqual(3);
  });

  it('never leaves the glyph accent below 3:1 on a coloured ground', () => {
    // Each sprite symbol fills one element with --ox-accent. Orange is 1.35:1
    // on the blue and 1.69:1 on the lime, so those two re-point it. A tone
    // that does not re-point it inherits the root orange, which is why the
    // fallback is read out of tokens.css and not out of the joined sheets.
    const section = /\.ox-tile--(blue|green|white|black)\s*\{([^}]*)\}/g;
    let measured = 0;
    for (const [, tone, body] of SHEETS.matchAll(section)) {
      const accent = /--ox-accent:\s*var\((--[a-z0-9-]+)\)/i.exec(body);
      const ground = hex(`--ox-shaker-${tone}`);
      const drawn = accent ? hex(accent[1]) : hex('--ox-accent', BASE);
      expect(contrast(drawn, ground), tone).toBeGreaterThanOrEqual(3);
      measured += 1;
    }
    expect(measured, 'all four tone rules were found').toBe(4);
  });
});

describe('the tile box', () => {
  it('stays at or above the 150px floor at desktop: colour does not shrink it', () => {
    const section = SHEETS.slice(
      SHEETS.indexOf('// 4. OxCategories and CategoryTile'),
      SHEETS.indexOf('// 5. OxGoals and GoalCard')
    );
    const sizes = [...section.matchAll(/\.ox-tile\s*\{[^}]*?min-block-size:\s*(\d+)px/g)].map(
      (match) => Number(match[1])
    );
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.max(...sizes)).toBeGreaterThanOrEqual(150);
  });
});

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
