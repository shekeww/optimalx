import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, createTestQueryClient } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';
import { GOALS } from '../../app/content/goals';

/**
 * "Shop by need" (owner amendment 2026-09-22): one section, two
 * `role="tablist"` panes, replacing the separate goal row and type grid.
 * Structure, count gating, the image-slot fallback chain, the claim
 * mechanism that stops the section rendering twice, and the SSR/loader
 * parity fix (`useTaxonomyLinks.ts`) all land here.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));

const liveCategories: unknown[] = [];
const menuItems: unknown[] = [];
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: {
    queries: { header: () => ({ queryKey: ['menu', 'header'], queryFn: async () => menuItems }) },
  },
}));

/**
 * `useRouter` from `@tanstack/react-router` (`useTaxonomyLinks.ts`'s
 * `useTaxonomyLoaderData`). `undefined` is the value every OTHER component
 * test in this repo effectively gets (none of them render inside a
 * `<RouterProvider>`), so that has to be the default here too - the fix this
 * batch ships is that `useTaxonomyLinks` never THROWS without one.
 */
let routerValue: { state: { matches: { loaderData?: unknown }[] } } | undefined;
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => routerValue,
}));

const { OxNeeds } = await import('../../app/components/home/OxNeeds');

function data(path: keyof typeof HOME_BLOCK_FIELDS, extra: Record<string, unknown> = {}): OxBlockData {
  return { path, key: `t-${path}`, ...HOME_BLOCK_FIELDS[path], ...extra } as OxBlockData;
}

/**
 * `Tabs.tsx` renders BOTH panels at all times (one carries `hidden`, never
 * removed from the DOM - that is how it keeps the inactive pane's content
 * ready for an instant switch), so a bare `getAllByTestId` returns cards from
 * both panes at once. Every query here is scoped to the one panel that is
 * NOT `hidden`, which is also the one a visitor or a screen reader can
 * actually reach.
 */
function visiblePanel(): HTMLElement {
  const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
  expect(panel, 'no visible tabpanel').not.toBeNull();
  return panel as HTMLElement;
}

function cardsIn(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll('[data-testid="ox-need-card"]'));
}

/** Waits for the visible pane's cards, then returns them. */
async function cards(): Promise<HTMLElement[]> {
  await waitFor(() => expect(cardsIn(visiblePanel()).length).toBeGreaterThan(0));
  return cardsIn(visiblePanel());
}

function switchToTypes() {
  fireEvent.click(screen.getAllByRole('tab')[1]);
}

beforeEach(() => {
  liveCategories.length = 0;
  menuItems.length = 0;
  routerValue = undefined;
});

describe('OxNeeds structure', () => {
  it('is a real role="tablist" with two tabs, goals selected by default', async () => {
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    expect(screen.getByRole('tablist')).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('renders the six goal cards by default, in content-map order', async () => {
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    const row = await cards();
    expect(row).toHaveLength(6);
    expect(row.map((card) => card.getAttribute('data-need'))).toEqual(
      GOALS.map((goal) => goal.slug)
    );
  });

  it('switches to the eight type cards on the second tab, protein leading and collagen-beauty the black card', async () => {
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    switchToTypes();
    const row = await waitFor(() => {
      const found = cardsIn(visiblePanel());
      expect(found).toHaveLength(8);
      return found;
    });
    expect(row.map((card) => card.getAttribute('data-need'))).toEqual([
      'protein',
      'creatine',
      'pre-workout',
      'amino-acids',
      'omega-3',
      'vitamins-minerals',
      'collagen-beauty',
      'daily-health',
    ]);
    expect(row[6].className).toContain('ox-need--black');
  });

  it('moves the active tab and the visible panel together on ArrowLeft (RTL "next")', async () => {
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    await waitFor(() => expect(cardsIn(visiblePanel())).toHaveLength(8));
  });

  it('honours a merchant category selection on the legacy ox-categories slot', async () => {
    renderWithProviders(
      <OxNeeds
        data={data('ox-categories', {
          categories: [{ name: 'كرياتين', url: '/creatine/c9002' }],
        })}
      />
    );
    await cards();
    switchToTypes();
    const row = await waitFor(() => {
      const found = cardsIn(visiblePanel());
      expect(found).toHaveLength(1);
      return found;
    });
    expect(row[0].getAttribute('href')).toBe('/creatine/c9002');
  });
});

/** The goal-energy card in the (visible, goals) pane - waits for the LIVE query, not just any render. */
function energyCard(): HTMLElement {
  const found = cardsIn(visiblePanel()).find((card) => card.getAttribute('data-need') === 'goal-energy');
  expect(found, 'goal-energy card not found').toBeDefined();
  return found as HTMLElement;
}

describe('OxNeeds, count gating (claims: never a static figure)', () => {
  it('renders the count only when the live category carries a positive products_count', async () => {
    liveCategories.push({
      id_: 9020,
      url: '/goal-energy/c9020',
      name: 'الطاقة',
      products_count: 6,
    });
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    await waitFor(() =>
      expect(energyCard().querySelector('.ox-need__count')?.textContent).toContain('6')
    );
  });

  it('omits the count row entirely with none, or a zero count', async () => {
    liveCategories.push({ id_: 9020, url: '/goal-energy/c9020', name: 'الطاقة', products_count: 0 });
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    // The URL resolves (the href below settles once the query lands), and the
    // count still never appears - the assertion this test exists for.
    await waitFor(() => expect(energyCard().getAttribute('href')).toBe('/goal-energy/c9020'));
    expect(energyCard().querySelector('.ox-need__count')).toBeNull();
    // The footer still holds the arrow, so the card looks finished either way.
    expect(energyCard().querySelector('.ox-need__arrow')).not.toBeNull();
  });
});

describe('OxNeeds, the image slot', () => {
  it('falls back to the theme custom property when the API has no image', async () => {
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    const image = energyCard().querySelector('.ox-need__image') as HTMLElement;
    expect(image.style.backgroundImage).toContain('var(--ox-need-image-goal-energy');
    expect(image.style.backgroundImage).toContain('none');
  });

  it('uses Category.image when the live category has one', async () => {
    liveCategories.push({
      id_: 9020,
      url: '/goal-energy/c9020',
      name: 'الطاقة',
      image: 'https://cdn.example/energy.jpg',
    });
    renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await cards();
    await waitFor(() => {
      const image = energyCard().querySelector('.ox-need__image') as HTMLElement;
      expect(image.style.backgroundImage).toContain('https://cdn.example/energy.jpg');
    });
  });
});

describe('OxNeeds, the claim that stops the section rendering twice', () => {
  it('renders once when both legacy block keys share one query client (one composition, one page load)', async () => {
    const client = createTestQueryClient();
    const { container: first } = renderWithProviders(<OxNeeds data={data('ox-goals')} />, {
      queryClient: client,
    });
    const { container: second } = renderWithProviders(<OxNeeds data={data('ox-categories')} />, {
      queryClient: client,
    });
    expect(first.querySelector('[data-testid="ox-needs"]')).not.toBeNull();
    expect(second.querySelector('[data-testid="ox-needs"]')).toBeNull();
  });

  it('renders again for a fresh query client (a different request or a later client session)', () => {
    const { container } = renderWithProviders(<OxNeeds data={data('ox-categories')} />, {
      queryClient: createTestQueryClient(),
    });
    expect(container.querySelector('[data-testid="ox-needs"]')).not.toBeNull();
  });
});

describe('OxNeeds, SSR/client parity (owner amendment: "the two designs" bug)', () => {
  /**
   * The bug: the server never prefetched `category.queries.list()` /
   * `menu.queries.header()`, so the SSR html always carried the `/search?q=`
   * fallback and the client's first real render carried the live URL - two
   * different sets of hrefs for the same markup. `useTaxonomyLinks` now reads
   * loader data first (`useTaxonomyLoaderData`, over `useRouter`) and only
   * queries when no loader supplied it. This renders the SAME goal with each
   * source and asserts the href the card carries is identical either way.
   */
  it('renders the identical href from loader data and from the live query', async () => {
    const category = { id_: 9020, url: '/goal-energy/c9020', name: 'الطاقة', products_count: 4 };

    // A: no router (today's plain query path, exercised the same way every
    // other component test in this repo already does).
    liveCategories.push(category);
    const { container: viaQuery } = renderWithProviders(<OxNeeds data={data('ox-goals')} />);
    await waitFor(() =>
      expect(viaQuery.querySelector('[data-need="goal-energy"]')?.getAttribute('href')).toBe(
        '/goal-energy/c9020'
      )
    );

    // B: a route match carrying `taxonomy` loader data, the shape
    // `app/routes/index.tsx`'s loader now returns.
    routerValue = { state: { matches: [{ loaderData: { taxonomy: { categories: [category], menuItems: [] } } }] } };
    const { container: viaLoader } = renderWithProviders(
      <OxNeeds data={data('ox-goals')} />,
      { queryClient: createTestQueryClient() }
    );
    // No `waitFor`: loader data resolves the href on the FIRST render, which
    // is the whole point - it is what an SSR pass with no client JS gets too.
    expect(viaLoader.querySelector('[data-need="goal-energy"]')?.getAttribute('href')).toBe(
      '/goal-energy/c9020'
    );
  });

  it('never issues the live query when loader data already supplied the pair', () => {
    routerValue = {
      state: {
        matches: [{ loaderData: { taxonomy: { categories: [], menuItems: [] } } }],
      },
    };
    const client = createTestQueryClient();
    renderWithProviders(<OxNeeds data={data('ox-goals')} />, { queryClient: client });
    // `enabled: false` still registers the query (react-query always does),
    // but never fetches it: `fetchStatus` stays `'idle'` and no data ever
    // lands, which is the sign the request itself never went out.
    const categoriesState = client.getQueryState(['categories']);
    const menuState = client.getQueryState(['menu', 'header']);
    expect(categoriesState?.fetchStatus).toBe('idle');
    expect(categoriesState?.dataUpdateCount).toBe(0);
    expect(menuState?.fetchStatus).toBe('idle');
    expect(menuState?.dataUpdateCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// The pastel run, read out of the stylesheet and measured against the arrow
// colour (X-IDENTITY-2026-09-22.md §4.6: a graphical object, WCAG 1.4.11's
// 3:1 floor - see docs/build/progress/S2b.md for the same numbers written out).
// ---------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dirname, '../..');
const TOKENS_CSS = fs.readFileSync(path.join(ROOT, 'app/styles/tokens.css'), 'utf8');
const HOME_SCSS = fs.readFileSync(path.join(ROOT, 'app/styles/06-ox/_b2-home.scss'), 'utf8');

function declarations(source: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi)) {
    out.set(match[1], match[2].trim());
  }
  return out;
}

const TOKENS = declarations(TOKENS_CSS);
const NEEDS = declarations(HOME_SCSS);

function hex(name: string, from: Map<string, string>): string {
  let value = from.get(name);
  expect(value, `${name} is not declared`).toBeDefined();
  for (let hop = 0; hop < 8 && value; hop += 1) {
    const alias = /^var\((--[a-z0-9-]+)\)$/i.exec(value.trim());
    if (!alias) break;
    value = TOKENS.get(alias[1]) ?? NEEDS.get(alias[1]);
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

const TINTS = ['peach', 'ash', 'mint', 'sand', 'sky', 'rose', 'violet'];

describe('the pastel run', () => {
  it('declares all seven tints, and none is invented at the call site', () => {
    for (const name of TINTS) {
      expect(hex(`--ox-need-tint-${name}`, NEEDS)).toMatch(/^#[0-9A-F]{6}$/);
    }
    const rules = /\.ox-need--(?:peach|ash|mint|sand|sky|rose|violet)\s*\{[^}]*\}/g;
    for (const rule of HOME_SCSS.match(rules) ?? []) {
      expect(rule).not.toMatch(/#[0-9a-f]{3,6}/i);
    }
  });

  it('clears the 3:1 graphical floor (WCAG 1.4.11) against --ox-accent-dark, the arrow colour', () => {
    const arrow = hex('--ox-accent-dark', TOKENS);
    for (const name of TINTS) {
      const tint = hex(`--ox-need-tint-${name}`, NEEDS);
      expect(contrast(arrow, tint), name).toBeGreaterThanOrEqual(3);
    }
  });
});
