import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { POSTER_CARDS } from '../../app/content/posters';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The poster carousel (homepage-scale-spec section 7). Owner review
 * 2026-09-23, item 3: every card carries the same physical top-left/
 * bottom-left corner cut and angled strap `GoalCard` carries (item 2's own
 * `.ox-goal`/`.ox-goal__slash`), the rest of the card unchanged. The
 * contract this file holds is structural — the strap renders once per card,
 * decorative, and the card is still a single link, never a nested control —
 * the geometry itself is a `06-ox` stylesheet concern `check-identity`,
 * `check-rtl` and `docs/build/progress/S3b.md`'s own arithmetic cover.
 */

const goals = [
  { slug: 'goal-performance', label: 'الأداء', to: '/goal-performance/c1', resolved: true, icon: 'goal-energy' as const },
  { slug: 'goal-energy', label: 'الطاقة', to: '/goal-energy/c2', resolved: true, icon: 'goal-energy' as const },
];

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
  matchesSlug: (url: string, slug: string) => typeof url === 'string' && url.includes(slug),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['categories'], queryFn: async () => [] }) } },
}));

const { OxPosters } = await import('../../app/components/home/OxPosters');

function data(): OxBlockData {
  return { path: 'ox-posters', key: 'posters', ...HOME_BLOCK_FIELDS['ox-posters'] } as OxBlockData;
}

describe('OxPosters', () => {
  it('renders one card per POSTER_CARDS entry, each a single link carrying the angled strap', async () => {
    const { container } = renderWithProviders(<OxPosters data={data()} />);
    await waitFor(() => {
      expect(screen.getAllByTestId('ox-poster-card')).toHaveLength(POSTER_CARDS.length);
    });
    const cards = screen.getAllByTestId('ox-poster-card');
    expect(cards.map((card) => card.getAttribute('data-poster'))).toEqual(
      POSTER_CARDS.map((card) => card.id)
    );

    const straps = container.querySelectorAll('.ox-pcard__slash');
    expect(straps).toHaveLength(POSTER_CARDS.length);
    straps.forEach((strap) => {
      expect(strap.getAttribute('aria-hidden')).toBe('true');
    });

    // Decoration only, never a nested interactive control (DIRECTION 9.2,
    // the same rule GoalCard's own slash/cta already hold to).
    expect(container.querySelectorAll('.ox-pcard button')).toHaveLength(0);
    expect(container.querySelectorAll('.ox-pcard a')).toHaveLength(0);
  });
});
