import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';
import { BRANCH, BRANCH_LISTING } from '../../app/content/branch';
import { STORE_PHOTOS, storePhotoSrc } from '../../app/content/store-photos';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));

const { BranchGallery } = await import('../../app/components/pages/BranchGallery');

const t = createT('ar');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

describe('BranchGallery', () => {
  it('renders exactly the four gallery slugs, never store-wide (OxBranch\'s own ground)', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(4);
    for (const src of ['storefront', 'shelves', 'advisory-room', 'waiting-area']) {
      expect(images.some((img) => img.getAttribute('src')?.includes(src))).toBe(true);
    }
    expect(images.some((img) => img.getAttribute('src')?.includes('store-wide'))).toBe(false);
  });

  it('carries no figcaption: the overlay statement and line are the link\'s own accessible text', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    expect(container.querySelectorAll('figcaption')).toHaveLength(0);
    const covers = Array.from(container.querySelectorAll('[data-testid="ox-branch-gallery-cover"]'));
    expect(covers).toHaveLength(4);
    for (const cover of covers) {
      expect((cover.textContent ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('carries the same angled cover shape on all four tiles (S9c: no first-tile-only cut)', () => {
    const { container } = renderWithProviders(<BranchGallery />);
    const covers = Array.from(container.querySelectorAll('[data-testid="ox-branch-gallery-cover"]'));
    expect(covers).toHaveLength(4);
    for (const cover of covers) {
      expect(cover.className).toContain('ox-cover');
      expect(cover.className).toContain('ox-cover--tile');
    }
  });

  it('links each cover to its own destination: advisory to the visit product, storefront to the listing directions in a new tab, shelves to the catalogue', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    const advisory = container.querySelector('[data-cover="advisory-room"]');
    expect(advisory?.getAttribute('href')).toContain('/p');

    const storefront = container.querySelector('[data-cover="storefront"]');
    expect(storefront?.getAttribute('href')).toBe(BRANCH_LISTING.directionsUrl);
    expect(storefront?.getAttribute('target')).toBe('_blank');
    expect(storefront?.getAttribute('rel')).toBe('noopener noreferrer');

    const shelves = container.querySelector('[data-cover="shelves"]');
    expect(shelves?.getAttribute('href')).toBe('/categories');

    const waiting = container.querySelector('[data-cover="waiting-area"]');
    expect(waiting?.getAttribute('href')).toBe('/services');
  });

  it('states the statement and line for every cover from its own content key', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    const advisory = container.querySelector('[data-cover="advisory-room"]');
    expect(advisory?.textContent).toContain(t(BRANCH.covers.advisory.statementKey));
    expect(advisory?.textContent).toContain(t(BRANCH.covers.advisory.lineKey));

    const storefront = container.querySelector('[data-cover="storefront"]');
    expect(storefront?.textContent).toContain(t(BRANCH.covers.storefront.statementKey));

    const shelves = container.querySelector('[data-cover="shelves"]');
    expect(shelves?.textContent).toContain(t(BRANCH.covers.shelves.statementKey));
  });

  it('switches the waiting-area cover between the two inbody variants', () => {
    setSettings({});
    const on = renderWithProviders(<BranchGallery />);
    const onCover = on.container.querySelector('[data-cover="waiting-area"]');
    expect(onCover?.textContent).toContain(t(BRANCH.covers.waitingOn.statementKey));
    on.unmount();

    setSettings({ inbody_included: false });
    const off = renderWithProviders(<BranchGallery />);
    const offCover = off.container.querySelector('[data-cover="waiting-area"]');
    expect(offCover?.textContent).toContain(t(BRANCH.covers.waitingOff.statementKey));
  });

  it('builds every srcset from the manifest\'s own widths, and every rendition exists on disk', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    setSettings({});
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

  it('carries the section\'s own accessible label', () => {
    setSettings({});
    const { getByTestId } = renderWithProviders(<BranchGallery />);
    expect(getByTestId('ox-branch-gallery').getAttribute('aria-label')).toBe(
      t('ox.content.branch.gallery_label')
    );
  });

  it('lazy-loads every photo', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    for (const img of Array.from(container.querySelectorAll('img'))) {
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('every image src resolves against the manifest\'s own helper', () => {
    setSettings({});
    const { container } = renderWithProviders(<BranchGallery />);
    const images = Array.from(container.querySelectorAll('img'));
    const storefrontImg = images.find((img) => img.getAttribute('src')?.includes('storefront'));
    expect(storefrontImg?.getAttribute('src')).toBe(
      storePhotoSrc(STORE_PHOTOS.storefront, STORE_PHOTOS.storefront.width)
    );
  });

  // S9h (owner screenshots 2026-09-24): `OxBranch`'s own cover shows the
  // storefront photograph too now, so `BranchPage` drops the gallery's own
  // storefront tile to avoid the identical photograph appearing twice.
  it('drops the storefront tile and grids the remaining three when showStorefront is false', () => {
    setSettings({});
    const { container, getByTestId } = renderWithProviders(<BranchGallery showStorefront={false} />);
    const covers = Array.from(container.querySelectorAll('[data-testid="ox-branch-gallery-cover"]'));
    expect(covers).toHaveLength(3);
    expect(container.querySelector('[data-cover="storefront"]')).toBeNull();
    for (const slug of ['advisory-room', 'waiting-area', 'shelves']) {
      expect(container.querySelector(`[data-cover="${slug}"]`)).not.toBeNull();
    }
    expect(getByTestId('ox-branch-gallery').querySelector('.ox-branch-gallery__list')?.className).toContain(
      'ox-branch-gallery__list--3'
    );
  });

  it('keeps all four tiles, no grid modifier, when showStorefront is left at its default', () => {
    setSettings({});
    const { container, getByTestId } = renderWithProviders(<BranchGallery />);
    expect(container.querySelectorAll('[data-testid="ox-branch-gallery-cover"]')).toHaveLength(4);
    expect(
      getByTestId('ox-branch-gallery').querySelector('.ox-branch-gallery__list')?.className
    ).not.toContain('ox-branch-gallery__list--3');
  });
});
