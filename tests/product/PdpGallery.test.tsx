import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: ({ alt, src, className }: Record<string, unknown>) => (
    <img alt={String(alt ?? '')} src={src as string} className={className as string} />
  ),
}));

const { PdpGallery } = await import('../../app/components/product/BuyZone/PdpGallery');

const t = createT('ar');

const product = {
  id: 11,
  image: { url: 'https://cdn.test/plate.jpg', alt: 'Whey' },
  images: [{ url: 'https://cdn.test/plate.jpg', alt: 'Whey' }],
} as never;

describe('PdpGallery', () => {
  it('renders no wishlist heart on the plate (owner review 2026-09-24, item 3)', () => {
    const { container } = renderWithProviders(<PdpGallery product={product} />);
    expect(screen.queryByLabelText(t('ox.a11y.wishlist_toggle'))).toBeNull();
    expect(container.querySelector('.ox-gallery__wish')).toBeNull();
  });

  it('still zooms the plate through the frame button', () => {
    renderWithProviders(<PdpGallery product={product} />);
    const frame = screen.getByLabelText(t('ox.pdp.zoom_label'));
    expect(frame.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(frame);
    expect(frame.getAttribute('aria-pressed')).toBe('true');
  });
});
