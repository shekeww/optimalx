import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../helpers/render';
import { STORE_PHOTOS } from '../../app/content/store-photos';
import type { OxBlockData } from '../../app/components/home/defaults';

/**
 * The home branch block (VISIT-2026-09-24 §4.1): the shared `OxBranch` does
 * the work, this wrapper only fixes the home-only props. This file locks in
 * that wiring: the store-wide photo and the offer line are on, the branch
 * page's own props (`headingLevel="h1"`, no `showOfferLine`) are untouched
 * here because `BranchPage.tsx` is not this batch's file.
 */

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useOpeningHours: () => ({ isOpen: false, isEnabled: false, nextOpen: null, nextOpenFormatted: '' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));

const { OxBranchBlock } = await import('../../app/components/home/OxBranchBlock');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

describe('OxBranchBlock', () => {
  it('passes the store-wide photograph and turns the offer line on', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxBranchBlock data={{ path: 'ox-branch' } as OxBlockData} />);
    expect(container.querySelector('.ox-cover img')?.getAttribute('src')).toBe(
      STORE_PHOTOS['store-wide'].photo
    );
    expect(container.querySelector('.ox-branch__offer')).not.toBeNull();
    expect(container.querySelector('h2')).not.toBeNull();
    // The home-only route to the branch page.
    expect(container.querySelector('.ox-branch__actions a')?.textContent).toBe('احجز زيارتك');
  });
});
