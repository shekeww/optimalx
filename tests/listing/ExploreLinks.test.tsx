import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

/**
 * The compact "explore" block (owner amendment 2026-09-22, "New: S2d"):
 * sibling categories, the goal or type membership, one guide link when the
 * content map has one, and the advisory CTA, every link resolved through
 * `useTaxonomyLinks` the same way `ChildChips` already is.
 */

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
const liveCategories: unknown[] = [];
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: {
    queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => liveCategories }) },
  },
}));

const { ExploreLinks, siblingSlugsOf, goalsIncluding, typesOf } = await import(
  '../../app/components/listing/ExploreLinks'
);
const { nodeBySlug } = await import('../../app/content/taxonomy');
const { createT } = await import('../helpers/i18n');
const t = createT('ar');

beforeEach(() => {
  liveCategories.length = 0;
});

describe('ExploreLinks, pure helpers', () => {
  it('lists a protein child\'s siblings as the other protein children, not the ten roots', () => {
    expect(siblingSlugsOf(nodeBySlug('whey-protein')!)).toEqual([
      'whey-isolate',
      'casein',
      'plant-protein',
      'mass-gainer',
    ]);
  });

  it('lists a root type\'s siblings as the other nine roots', () => {
    const siblings = siblingSlugsOf(nodeBySlug('creatine')!);
    expect(siblings).toHaveLength(9);
    expect(siblings).not.toContain('creatine');
    expect(siblings).toContain('protein');
  });

  it('lists a goal\'s siblings as the other five goals', () => {
    const siblings = siblingSlugsOf(nodeBySlug('goal-energy')!);
    expect(siblings).toHaveLength(5);
    expect(siblings).not.toContain('goal-energy');
  });

  it('finds the goals that route a subNeed at a given type, its groups included', () => {
    expect(goalsIncluding('whey-protein')).toEqual(
      expect.arrayContaining(['goal-performance', 'goal-recovery'])
    );
    expect(goalsIncluding('mass-gainer')).toContain('goal-ideal-weight');
  });

  it('finds the type slugs a goal routes to, without duplicates', () => {
    const types = typesOf('goal-ideal-weight');
    expect(new Set(types).size).toBe(types.length);
    expect(types).toEqual(expect.arrayContaining(['mass-gainer', 'whey-protein', 'creatine']));
  });
});

describe('ExploreLinks, component', () => {
  it('renders nothing for a category the taxonomy does not know', () => {
    const { container } = renderWithProviders(<ExploreLinks node={undefined} />);
    expect(container.querySelector('.ox-explore')).toBeNull();
  });

  it('renders the sibling chips and the advisory CTA to /services before the live category resolves', () => {
    const { container } = renderWithProviders(<ExploreLinks node={nodeBySlug('creatine')} />);
    const siblingsNav = container.querySelectorAll('.ox-explore__nav')[0] as HTMLElement;
    const chips = siblingsNav.querySelectorAll('.ox-explore__list a');
    // Nine siblings, the search fallback until the live query settles.
    expect(chips).toHaveLength(9);
    for (const chip of chips) expect(chip.getAttribute('href')).toMatch(/^\/search\?q=/);

    const foot = container.querySelectorAll('.ox-explore__foot a');
    const advisory = Array.from(foot).find((a) => a.textContent === t('ox.services.title'));
    expect(advisory?.getAttribute('href')).toBe('/services');
  });

  it('resolves a sibling chip to its live category URL once the query settles', async () => {
    liveCategories.push({
      id: 9002,
      id_: 9002,
      name: 'كرياتين',
      url: 'https://optimalx.com.sa/creatine/c9002',
    });
    const { container } = renderWithProviders(<ExploreLinks node={nodeBySlug('protein')} />);
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ox-explore__list a')).map((a) => a.getAttribute('href'))
        // The published URL is absolute; the theme's one link resolution
      // rule drops the origin before it reaches an anchor (P0-14).
    ).toContain('/creatine/c9002')
    );
  });

  it('labels the goal-membership row for a type, and the type-membership row for a goal', () => {
    const { container: typePage } = renderWithProviders(<ExploreLinks node={nodeBySlug('whey-protein')} />);
    const navs = typePage.querySelectorAll('.ox-explore__nav');
    expect(navs[1]?.getAttribute('aria-label')).toBe(t('ox.listing.explore_goals_label'));

    const { container: goalPage } = renderWithProviders(<ExploreLinks node={nodeBySlug('goal-performance')} />);
    const goalNavs = goalPage.querySelectorAll('.ox-explore__nav');
    expect(goalNavs[1]?.getAttribute('aria-label')).toBe(t('ox.listing.explore_types_label'));
  });
});
