import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { GOAL_SLUGS } from '../../app/content/goals';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The goal grid and the one entrance animation on the site (DIRECTION 7.2):
 * it runs once, it starts at 30 per cent visibility, and under reduced motion
 * the six cards are simply present.
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

  it('arms and runs the settle once when motion is allowed', () => {
    stubMatchMedia(false);
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    // jsdom has no IntersectionObserver, so the hook resolves immediately:
    // the grid goes straight from armed to running and never back.
    expect(container.querySelector('.ox-goals__grid')?.getAttribute('data-settle')).toBe('running');
  });

  it('never arms the settle under reduced motion (DIRECTION 7.2)', () => {
    stubMatchMedia(true);
    const { container } = renderWithProviders(<OxGoals data={data()} />);
    expect(container.querySelector('.ox-goals__grid')?.getAttribute('data-settle')).toBe('off');
  });
});
