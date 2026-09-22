import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import fs from 'node:fs';
import path from 'node:path';
import { GOAL_SLUGS, GOAL_PHOTOS } from '../../app/content/goals';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The goal row (homepage-spec section 4): six dark photographic cards, each a
 * whole-card link with the accent slash, a glyph, a name, a line and the
 * outline parallelogram. The row is also the page's largest reveal, and the
 * contract that matters there is that nothing is hidden before the client
 * decides to hide it: the server HTML carries no `data-reveal` at all.
 */

const goals = GOAL_SLUGS.map((slug, index) => ({
  slug,
  label: `هدف ${index + 1}`,
  to: index === 0 ? `/goal/${slug}/c1` : `/search?q=goal-${index}`,
  resolved: index === 0,
  icon: 'goal-energy' as const,
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
vi.mock('../../app/components/layout/Header/useHeaderMenu', () => ({
  useHeaderMenu: () => ({ items: [], isLoading: false, goals }),
}));

const { OxGoals } = await import('../../app/components/home/OxGoals');

function data(): OxBlockData {
  return { path: 'ox-goals', key: 'goals', ...HOME_BLOCK_FIELDS['ox-goals'] } as OxBlockData;
}

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('OxGoals', () => {
  it('renders the six goals as whole-card links, in content-map order', () => {
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    const cards = screen.getAllByTestId('ox-goal-card');
    expect(cards).toHaveLength(6);
    expect(cards.map((card) => card.getAttribute('data-goal'))).toEqual(GOAL_SLUGS);
    expect(container.querySelectorAll('.ox-goal button')).toHaveLength(0);
  });

  it('falls back to a search when the goal category does not exist yet (C15)', () => {
    renderWithProviders(<OxGoals data={data()} />);
    const cards = screen.getAllByTestId('ox-goal-card');
    expect(cards[0].getAttribute('href')).toBe('/goal/goal-energy/c1');
    expect(cards[1].getAttribute('href')).toContain('/search?q=');
  });

  it('is a dark card with a scrim and one accent slash, finished with no photograph', () => {
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    expect(container.querySelectorAll('.ox-goal__scrim')).toHaveLength(6);
    expect(container.querySelectorAll('.ox-goal__slash')).toHaveLength(6);
    // Both are decoration; the label already names the goal.
    expect(container.querySelector('.ox-goal__scrim')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.ox-goal__slash')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('only ever points a card at a frame that exists on disk', () => {
    // This replaced an assertion that all six carried a photograph. They did
    // not: ten of the image brief's sixteen frames were never shot, and a
    // card pointing at a missing one fetched a 404 on every home page load,
    // silently, because `BandPhoto` swallows a broken image. The invariant
    // worth holding is not "six photographs" but "no path that 404s", so the
    // test now reads the filesystem instead of counting.
    for (const [slug, src] of Object.entries(GOAL_PHOTOS)) {
      expect(GOAL_SLUGS, `${slug} is not a goal`).toContain(slug);
      expect(src).toMatch(/^\/assets\/images\/[\w.-]+$/);
      const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
      expect(fs.existsSync(file), `${slug} points at a missing file: ${src}`).toBe(true);
    }

    renderWithProviders(<OxGoals data={data()} />);
    const cards = screen.getAllByTestId('ox-goal-card');
    const sources = cards.map((card) => card.querySelector('img')?.getAttribute('src'));
    const withPhoto = sources.filter(Boolean);
    // Whatever the map holds is what renders, each frame used once, and the
    // cards without one still render: the row is six either way.
    expect(cards).toHaveLength(6);
    expect(withPhoto).toHaveLength(Object.keys(GOAL_PHOTOS).length);
    expect(new Set(withPhoto).size).toBe(withPhoto.length);
  });

  it('gives every card the small outline action, and never a nested control', () => {
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    expect(container.querySelectorAll('.ox-goal__cta')).toHaveLength(6);
    expect(container.querySelectorAll('.ox-goal button')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-goal a')).toHaveLength(0);
  });

  it('carries the anchor the hero CTA scrolls to', () => {
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    expect(container.querySelector('#ox-goals')).not.toBeNull();
  });

  it('gives every card its DOM index, which is the settle delay', () => {
    renderWithProviders(<OxGoals data={data()} />);
    const cards = screen.getAllByTestId('ox-goal-card');
    cards.forEach((card, index) => {
      expect((card as HTMLElement).style.getPropertyValue('--i')).toBe(String(index));
    });
  });

  it('renders the row visible and only ever adds the reveal on the client', () => {
    stubMatchMedia(false);
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    const grid = container.querySelector('.ox-goals__grid');
    // jsdom has no IntersectionObserver, so the hook takes its early return
    // and the row is left exactly as it was painted. That is the guarantee
    // worth asserting: the markup can never ship pre-hidden.
    expect(grid?.classList.contains('ox-reveal')).toBe(true);
    expect(grid?.getAttribute('data-reveal')).toBeNull();
  });

  it('never arms the reveal under reduced motion', () => {
    stubMatchMedia(true);
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    expect(container.querySelector('.ox-goals__grid')?.getAttribute('data-reveal')).toBeNull();
  });

  it('puts the stagger index on the direct children of the reveal', () => {
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    const rows = container.querySelectorAll('.ox-goals__grid > li');
    rows.forEach((row, index) => {
      expect((row as HTMLElement).style.getPropertyValue('--i')).toBe(String(index));
    });
  });
});
