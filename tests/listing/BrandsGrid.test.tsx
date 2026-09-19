import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';

/**
 * The brands index (DIRECTION 6.14) and the state the live store is in today:
 * it has no brands, and the platform answers that request with an HTML error
 * page, so the route degrades the loader failure to an empty group. The page
 * still has to carry an h1 and a way out.
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

const { BrandsGrid } = await import('../../app/components/listing/BrandsGrid');

const ORIGIN = 'https://optimalx.com.sa';

function brand(id: string, name: string, logo?: string) {
  return { id, name, url: `${ORIGIN}/${id}/b${id}`, logo, label: name, description: '', status: true, ar_char: 'أ', en_char: 'A' };
}

function props(overrides: Partial<BrandsPageProps> = {}): BrandsPageProps {
  return {
    page: { title: 'العلامات', slug: 'brands.index' },
    brands: {
      O: [brand('7', 'Optimum Nutrition', `${ORIGIN}/on.png`)],
      M: [brand('8', 'MyProtein', `${ORIGIN}/mp.png`)],
    },
    ...overrides,
  } as BrandsPageProps;
}

describe('BrandsGrid', () => {
  it('flattens the letter groups into one alphabetical grid of tiles', () => {
    const { container } = renderWithProviders(<BrandsGrid {...props()} />);
    const tiles = container.querySelectorAll('.ox-brand-tile');
    expect(tiles).toHaveLength(2);
    // Group keys sorted: M before O.
    expect(tiles[0].textContent).toContain('MyProtein');
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('shows the brand logo as its own artwork, never as text', () => {
    renderWithProviders(<BrandsGrid {...props()} />);
    const logo = screen.getByAltText('Optimum Nutrition') as HTMLImageElement;
    expect(logo.tagName).toBe('IMG');
    expect(logo.getAttribute('src')).toBe(`${ORIGIN}/on.png`);
  });

  it('renders the empty state, with an h1 and a way out, when the store has no brands', () => {
    const { container } = renderWithProviders(
      <BrandsGrid {...props({ page: { title: '', slug: 'brands.index' }, brands: {} })} />
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')?.textContent).toBe('العلامات');
    expect(container.querySelector('.ox-empty')).not.toBeNull();
    expect(container.querySelector('.ox-brands__grid')).toBeNull();
    expect(container.querySelector('.ox-empty__actions a')?.getAttribute('href')).toBe(
      '/latest-products'
    );
  });

  it('drops a brand the API returned without a name or a url', () => {
    const { container } = renderWithProviders(
      <BrandsGrid
        {...props({
          brands: { O: [brand('7', 'Optimum Nutrition'), { ...brand('9', ''), name: '' }] } as never,
        })}
      />
    );
    expect(container.querySelectorAll('.ox-brand-tile')).toHaveLength(1);
  });
});
