import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The first row of every type and goal category listing (owner amendment
 * 2026-09-22, "New: S2d"): a horizontal snap scroller of featured products,
 * hidden below two products, `role="list"`, keyboard reachable through the
 * card's own link, and priced through `Price` rather than a hand-formatted
 * number.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
// Mirrors the engine's own SAR rendering (tests/common/primitives.test.tsx).
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: number | string | undefined) =>
      React.createElement(
        React.Fragment,
        null,
        Number(amount ?? 0).toFixed(2),
        React.createElement('i', { className: 'sicon-sar', 'aria-hidden': 'true' })
      ),
    parse: (value: string) => Number(value),
    isValid: () => true,
  }),
}));

const { FeaturedRail, featuredProducts } = await import('../../app/components/listing/FeaturedRail');
const { createT } = await import('../helpers/i18n');
const t = createT('ar');

const ORIGIN = 'https://optimalx.com.sa';

function product(id: number, overrides: Record<string, unknown> = {}): Product {
  return {
    id,
    name: `Gold Standard Whey ${id}`,
    url: `${ORIGIN}/p${id}`,
    price: 100,
    sale_price: 0,
    regular_price: 100,
    is_on_sale: false,
    currency: 'SAR',
    image: { url: `${ORIGIN}/img${id}.jpg`, alt: `صورة ${id}` },
    ...overrides,
  } as unknown as Product;
}

describe('FeaturedRail', () => {
  it('renders nothing with an empty product list', () => {
    const { container } = renderWithProviders(<FeaturedRail products={[]} />);
    expect(container.querySelector('.ox-featured')).toBeNull();
  });

  it('hides below two products (a carousel of one is not a carousel)', () => {
    const { container } = renderWithProviders(<FeaturedRail products={[product(1)]} />);
    expect(container.querySelector('.ox-featured')).toBeNull();
  });

  it('renders every card of a six-product list, each priced and linked to its own PDP', () => {
    const products = Array.from({ length: 6 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const items = container.querySelectorAll('.ox-featured__item');
    expect(items).toHaveLength(6);

    const first = items[0].querySelector('.ox-featured__card') as HTMLAnchorElement;
    expect(first.getAttribute('href')).toBe(`${ORIGIN}/p1`);
    expect(first.textContent).toContain('Gold Standard Whey 1');
    // The price renders through `Price` (the mocked `useMoney().format()`
    // output), never a hand-formatted string.
    expect(first.querySelector('.ox-price')?.textContent).toContain('100.00');
    expect(first.textContent).toContain(t('ox.listing.featured_cta'));
  });

  it('is a role="list" of keyboard-reachable links, one CTA per card', () => {
    const products = Array.from({ length: 3 }, (unused, i) => product(i + 1));
    renderWithProviders(<FeaturedRail products={products} />);
    const list = screen.getByRole('list');
    expect(list.className).toContain('ox-featured__row');
    const links = list.querySelectorAll('a.ox-featured__card');
    expect(links).toHaveLength(3);
    for (const link of links) {
      // A native anchor with an href is in the tab order without any extra
      // wiring; focusing it is enough to prove it is keyboard reachable.
      (link as HTMLAnchorElement).focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it('names the section, so the list has an accessible label', () => {
    const products = Array.from({ length: 2 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const section = container.querySelector('.ox-featured') as HTMLElement;
    const heading = container.querySelector('#listing-featured-title');
    expect(section.getAttribute('aria-labelledby')).toBe('listing-featured-title');
    expect(heading?.textContent).toBe(t('ox.listing.featured_title'));
  });
});

describe('featuredProducts', () => {
  it('keeps only the merchant-flagged products when at least one is flagged', () => {
    const products = [
      product(1),
      product(2, { is_featured: true }),
      product(3),
      product(4, { featured: true }),
    ];
    const picked = featuredProducts(products);
    expect(picked.map((p) => p.id)).toEqual([2, 4]);
  });

  it('falls back to the first four to six of the default sort when nothing is flagged', () => {
    const products = Array.from({ length: 8 }, (unused, i) => product(i + 1));
    const picked = featuredProducts(products);
    expect(picked.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('never picks more than the list actually has', () => {
    const products = Array.from({ length: 3 }, (unused, i) => product(i + 1));
    expect(featuredProducts(products)).toHaveLength(3);
  });
});
