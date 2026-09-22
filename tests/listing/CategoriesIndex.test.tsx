import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { MENU, TAXONOMY, childrenOf } from '../../app/content/taxonomy';

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
      expect(card.querySelector('img')).toBeNull();
      expect(card.querySelector('.ox-cat-card__icon')).not.toBeNull();
    }
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
    expect(protein.querySelector('img')?.getAttribute('src')).toBe('https://cdn.salla.sa/x/protein.jpg');
    // The nested child resolved through the flattened list; its siblings did not.
    const chips = Array.from(protein.querySelectorAll('.ox-cat-card__children a'));
    expect(chips[0].getAttribute('href')).toBe('https://optimalx.com.sa/whey-protein/c9011');
    expect(chips[1].getAttribute('href')).toMatch(/^\/search\?q=/);
    // The other nine roots still fall back.
    expect(container.querySelectorAll('[data-testid="ox-type-card"][data-resolved="false"]')).toHaveLength(9);
    expect(TAXONOMY).toHaveLength(25);
  });
});
