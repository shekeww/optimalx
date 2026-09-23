import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The first row of every type and goal category listing (owner amendment
 * 2026-09-22, "New: S2d"; rebuilt into a cover carousel, owner item
 * 2026-09-23): a scroll-snap carousel of featured products, hidden below two
 * products, `role="list"` with carousel/slide `aria-roledescription`s,
 * keyboard reachable through the card's own link and the prev/next buttons,
 * and priced through `Price` rather than a hand-formatted number.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({
    alt,
    src,
    priority,
    className,
  }: {
    alt: string;
    src?: string;
    priority?: boolean;
    className?: string;
  }) => <img alt={alt} src={src} className={className} data-loading={priority ? 'eager' : 'lazy'} />,
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
    // The rail card carries the product's PATH: the API publishes
    // `${ORIGIN}/p1`, and the one link resolution rule drops the origin so the
    // anchor never leaves the build (UX-2026-09-24 P0-14).
    expect(first.getAttribute('href')).toBe('/p1');
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

  it('marks the first two cover images eager and the rest lazy', () => {
    const products = Array.from({ length: 4 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const images = container.querySelectorAll('.ox-featured__img');
    expect(images).toHaveLength(4);
    expect([...images].map((img) => img.getAttribute('data-loading'))).toEqual([
      'eager',
      'eager',
      'lazy',
      'lazy',
    ]);
  });
});

describe('FeaturedRail carousel', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('carries carousel semantics: a roledescription on the row and a position label on every slide', () => {
    const products = Array.from({ length: 3 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const row = container.querySelector('.ox-featured__row') as HTMLElement;
    expect(row.getAttribute('aria-roledescription')).toBe(t('ox.listing.featured_carousel_role'));
    const items = container.querySelectorAll('.ox-featured__item');
    expect(items).toHaveLength(3);
    expect(items[0].getAttribute('aria-roledescription')).toBe(t('ox.listing.featured_slide_role'));
    expect(items[0].getAttribute('aria-label')).toBe(
      t('ox.listing.featured_slide_label', { index: 1, total: 3 })
    );
    expect(items[2].getAttribute('aria-label')).toBe(
      t('ox.listing.featured_slide_label', { index: 3, total: 3 })
    );
  });

  it('hides the prev/next controls once two covers already show everything', () => {
    const products = Array.from({ length: 2 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    expect(container.querySelector('.ox-featured__nav')).toBeNull();
  });

  it('shows prev/next once there are more covers than fit two-up, prev disabled at the start', () => {
    const products = Array.from({ length: 6 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const arrows = container.querySelectorAll('.ox-featured__arrow');
    expect(arrows).toHaveLength(2);
    expect((arrows[0] as HTMLButtonElement).disabled).toBe(true);
    expect((arrows[1] as HTMLButtonElement).disabled).toBe(false);
  });

  it('next scrolls the carousel forward by two covers and re-enables prev', () => {
    const products = Array.from({ length: 6 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const [prev, next] = container.querySelectorAll('.ox-featured__arrow');
    fireEvent.click(next);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect((prev as HTMLButtonElement).disabled).toBe(false);
  });

  it('carries the rail primitive: no native scrollbar contract, the cue and the progress strap', () => {
    const products = Array.from({ length: 6 }, (unused, i) => product(i + 1));
    const { container } = renderWithProviders(<FeaturedRail products={products} />);
    const row = container.querySelector('.ox-featured__row');
    expect(row?.classList.contains('ox-rail__track')).toBe(true);
    const cue = container.querySelector('.ox-rail__cue');
    expect(cue?.getAttribute('aria-label')).toBe(t('ox.listing.featured_next'));
    expect(container.querySelectorAll('.ox-rail__cue-arm')).toHaveLength(2);
    expect(container.querySelector('.ox-rail__progress')).not.toBeNull();
    // The unfilled angled face is a span inside the nav button, never the
    // button itself: a clip-path would clip the focus ring (X-IDENTITY 7.1).
    const arrows = container.querySelectorAll('.ox-featured__arrow');
    expect(arrows[0].querySelector('.ox-iconbtn--angled')).not.toBeNull();
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
