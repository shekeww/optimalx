import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';

const ar = loadDictionary('ar');

/**
 * The `/brands` index as the 2026-09-23 (late) owner brief rebuilt it: our own
 * composition in the theme's chrome, the letter groups the API itself serves,
 * the X watermark on the page head, the shared brand tile in a 2/3/6-up grid,
 * a letter rail, and the empty state the live store is in today (it has no
 * brands, and the platform answers that request with an HTML error page, so
 * the route degrades the loader failure to an empty group).
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="engine-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { BrandsIndex, letterGroupsOf } = await import('../../app/components/brands/BrandsIndex');

const ORIGIN = 'https://optimalx.com.sa';

function brand(id: string, name: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    name,
    url: `${ORIGIN}/brands/${id}`,
    label: name,
    description: '',
    logo: '',
    status: true,
    ar_char: 'أ',
    en_char: 'A',
    ...extra,
  };
}

function props(overrides: Partial<BrandsPageProps> = {}): BrandsPageProps {
  return {
    page: { title: 'العلامات التجارية', slug: 'brands.index' },
    brands: {
      O: [brand('7', 'Optimum Nutrition', { products_count: 7 })],
      M: [brand('8', 'Myprotein', { products_count: 2 })],
    },
    ...overrides,
  } as BrandsPageProps;
}

describe('letterGroupsOf', () => {
  it('keeps the API letters, in letter order, and drops the empty ones', () => {
    const groups = letterGroupsOf({
      O: [brand('7', 'Optimum Nutrition')],
      A: [],
      M: [brand('8', 'Myprotein')],
    } as never);
    expect(groups.map((group) => group.char)).toEqual(['M', 'O']);
    // The id is the letter's position in the API's own sorted key list, not
    // the rendered group's index: dropping the empty "A" must not renumber
    // the groups that survive it, or a bookmarked fragment would move.
    expect(groups.map((group) => group.id)).toEqual(['brand-letter-1', 'brand-letter-2']);
  });

  it('drops a brand the API returned without a name or a url', () => {
    const groups = letterGroupsOf({
      O: [brand('7', 'Optimum Nutrition'), { ...brand('9', 'No URL'), url: '' }, { id: '10' }],
    } as never);
    expect(groups[0].brands).toHaveLength(1);
  });
});

describe('BrandsIndex', () => {
  it('draws one group per API letter, with the shared plated tile inside it', () => {
    const { container } = renderWithProviders(<BrandsIndex {...props()} />);
    const groups = container.querySelectorAll('.ox-brandhub__group');
    expect(groups).toHaveLength(2);
    // Group keys sorted: M before O.
    expect(groups[0].textContent).toContain('Myprotein');
    expect(container.querySelectorAll('.ox-brand-tile')).toHaveLength(2);
    expect(container.querySelectorAll('.ox-brand-tile__plate')).toHaveLength(2);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('states each brand count from the API only', () => {
    const { container } = renderWithProviders(
      <BrandsIndex {...props({ brands: { O: [brand('7', 'Optimum Nutrition')] } as never })} />
    );
    expect(container.querySelector('.ox-brand-tile__count')).toBeNull();
  });

  it('links the letter rail at the groups it actually rendered', () => {
    const { container } = renderWithProviders(<BrandsIndex {...props()} />);
    const links = Array.from(container.querySelectorAll('.ox-brandhub__letter'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#brand-letter-0',
      '#brand-letter-1',
    ]);
    const ids = Array.from(container.querySelectorAll('.ox-brandhub__group')).map((el) => el.id);
    expect(ids).toEqual(['brand-letter-0', 'brand-letter-1']);
  });

  it('carries the mark as a watermark, drawn from the inlined sprite and hidden from the tree', () => {
    const { container } = renderWithProviders(<BrandsIndex {...props()} />);
    const watermark = container.querySelector('.ox-brandhub__watermark');
    expect(watermark?.classList.contains('ox-x-watermark')).toBe(true);
    expect(watermark?.getAttribute('aria-hidden')).toBe('true');
    expect(watermark?.querySelector('use')?.getAttribute('href')).toBe('#ox-mark');
  });

  it('resolves a platform lookup key into the h1 instead of printing it raw', () => {
    const { container } = renderWithProviders(
      <BrandsIndex {...props({ page: { title: 'common.titles.brands', slug: 'brands.index' } })} />
    );
    expect(container.querySelector('h1')?.textContent).toBe(ar['common.titles.brands']);
  });

  it('renders the empty state, with an h1 and a way out, when the store has no brands', () => {
    const { container } = renderWithProviders(
      <BrandsIndex {...props({ page: { title: '', slug: 'brands.index' }, brands: {} })} />
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')?.textContent).toBe(ar['ox.nav.brands']);
    expect(container.querySelector('.ox-empty')).not.toBeNull();
    expect(container.querySelector('.ox-brandhub__grid')).toBeNull();
    expect(container.querySelector('.ox-brandhub__letters')).toBeNull();
  });

  it('shows a brand logo as its own artwork, never as text', () => {
    renderWithProviders(
      <BrandsIndex
        {...props({
          brands: { O: [brand('7', 'Optimum Nutrition', { logo: `${ORIGIN}/on.png` })] } as never,
        })}
      />
    );
    const logo = screen.getByAltText('Optimum Nutrition') as HTMLImageElement;
    expect(logo.tagName).toBe('IMG');
    expect(logo.getAttribute('src')).toBe(`${ORIGIN}/on.png`);
    // A fixed 3:2 field on a light ground, so the artwork is contained rather
    // than cropped and the box reserves its own height before the file lands.
    expect(logo.closest('.ox-brand-tile__logobox')).not.toBeNull();
    expect(logo.closest('.ox-brand-tile')?.querySelector('.ox-brand-tile__mark')).toBeNull();
  });

  // Optimum Nutrition and Dymatize publish WHITE-only marks. The field
  // changes, never the mark: no inversion, no recolour, no drop of the asset.
  it('puts a white mark on the ink ground when its own row asks for one', () => {
    const { container } = renderWithProviders(
      <BrandsIndex
        {...props({
          brands: {
            O: [
              brand('7', 'Optimum Nutrition', {
                logo: `${ORIGIN}/on-white.svg`,
                logo_ground: 'dark',
              }),
            ],
            M: [brand('8', 'Myprotein', { logo: `${ORIGIN}/mp.png` })],
          } as never,
        })}
      />
    );
    const boxes = Array.from(container.querySelectorAll('.ox-brand-tile__logobox'));
    expect(boxes).toHaveLength(2);
    // Group keys sorted: M (light) before O (dark).
    expect(boxes[0].classList.contains('ox-brand-tile__logobox--dark')).toBe(false);
    expect(boxes[1].classList.contains('ox-brand-tile__logobox--dark')).toBe(true);
    // The artwork itself is untouched: same src, same alt, still contained.
    expect(
      (boxes[1].querySelector('img') as HTMLImageElement).getAttribute('src')
    ).toBe(`${ORIGIN}/on-white.svg`);
  });
});
