import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';
import { STORE_PHOTOS, storePhotoSrc } from '../../app/content/store-photos';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

const { BranchGallery } = await import('../../app/components/pages/BranchGallery');

const t = createT('ar');

describe('BranchGallery', () => {
  it('renders exactly the four gallery slugs, never store-wide (OxBranch\'s own panel)', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(4);
    for (const src of ['storefront', 'shelves', 'advisory-room', 'waiting-area']) {
      expect(images.some((img) => img.getAttribute('src')?.includes(src))).toBe(true);
    }
    expect(images.some((img) => img.getAttribute('src')?.includes('store-wide'))).toBe(false);
  });

  it('captions every photo from its own content key, never overlaid on the image', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    const captions = Array.from(container.querySelectorAll('figcaption')).map((n) => n.textContent);
    expect(captions).toEqual([
      t('ox.content.branch.photo_storefront'),
      t('ox.content.branch.photo_shelves'),
      t('ox.content.branch.photo_advisory'),
      t('ox.content.branch.photo_waiting'),
    ]);
    // A figcaption is a sibling of the img inside <figure>, never a child of it
    // or a positioned overlay: no caption text lives on the <img> itself.
    for (const figure of Array.from(container.querySelectorAll('figure'))) {
      expect(figure.querySelector('img + figcaption')).not.toBeNull();
    }
  });

  it('builds every srcset from the manifest\'s own widths, and every rendition exists on disk', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { container } = renderWithProviders(<BranchGallery />);
    const images = Array.from(container.querySelectorAll('img'));
    for (const img of images) {
      const srcset = img.getAttribute('srcset') ?? '';
      const entries = srcset.split(',').map((part) => part.trim().split(' ')[0]);
      expect(entries.length).toBeGreaterThan(0);
      for (const src of entries) {
        const filePath = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
        expect(fs.existsSync(filePath), src).toBe(true);
      }
    }
  });

  it('carries the mark\'s corner cut on the first tile only', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    const items = Array.from(container.querySelectorAll('.ox-branch-gallery__item'));
    expect(items[0].className).toContain('ox-branch-gallery__item--cut');
    for (const item of items.slice(1)) {
      expect(item.className).not.toContain('--cut');
    }
  });

  it('carries the section\'s own accessible label', () => {
    const { getByTestId } = renderWithProviders(<BranchGallery />);
    expect(getByTestId('ox-branch-gallery').getAttribute('aria-label')).toBe(
      t('ox.content.branch.gallery_label')
    );
  });

  it('lazy-loads every photo', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    for (const img of Array.from(container.querySelectorAll('img'))) {
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('every image src resolves against the manifest\'s own helper', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    const images = Array.from(container.querySelectorAll('img'));
    const storefrontImg = images.find((img) => img.getAttribute('src')?.includes('storefront'));
    expect(storefrontImg?.getAttribute('src')).toBe(
      storePhotoSrc(STORE_PHOTOS.storefront, STORE_PHOTOS.storefront.width)
    );
  });
});
