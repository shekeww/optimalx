import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));

/** One observer instance per test, so the callback can be fired by hand
 *  (the same convention tests/product/StickyBar.test.tsx uses). */
type Entry = { isIntersecting: boolean; boundingClientRect: { top: number } };
let fire: ((entries: Entry[]) => void) | null = null;
const disconnect = vi.fn();

class MockObserver {
  constructor(callback: (entries: Entry[]) => void) {
    fire = callback;
  }
  observe() {}
  disconnect = disconnect;
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const { VisitStickyBar } = await import('../../app/components/pages/VisitStickyBar');

const t = createT('ar');
// 2026-09-17 is a Thursday.
const THURSDAY_NOON = new Date('2026-09-17T12:00:00');
const HOURS = ['الأحد إلى الخميس: 09:00 - 23:00', 'الجمعة: 16:00 - 23:00'].join('\n');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

function renderBar(now = THURSDAY_NOON) {
  const anchor = document.createElement('div');
  anchor.setAttribute('data-testid', 'test-anchor');
  document.body.appendChild(anchor);
  return renderWithProviders(
    <VisitStickyBar anchorSelector='[data-testid="test-anchor"]' now={now} />
  );
}

describe('VisitStickyBar', () => {
  beforeEach(() => {
    fire = null;
    disconnect.mockClear();
    vi.stubGlobal('IntersectionObserver', MockObserver);
    setSettings({});
  });

  afterEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('starts hidden and adds no body class before the anchor scrolls away', () => {
    const { container } = renderBar();
    expect(container.querySelector('.ox-visit-sticky')?.className).not.toContain('is-visible');
    expect(document.body.classList.contains('ox-sticky-bar')).toBe(false);
  });

  it('appears and sets the shared sticky body class once the anchor leaves the top of the viewport', () => {
    const { container } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    expect(container.querySelector('.ox-visit-sticky')?.className).toContain('is-visible');
    expect(document.body.classList.contains('ox-sticky-bar')).toBe(true);
  });

  it('stays hidden while the anchor is only below the fold', () => {
    const { container } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: 900 } }]));
    expect(container.querySelector('.ox-visit-sticky')?.className).not.toContain('is-visible');
  });

  it('cleans the body class up on unmount', () => {
    const { unmount } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    unmount();
    expect(document.body.classList.contains('ox-sticky-bar')).toBe(false);
    expect(disconnect).toHaveBeenCalled();
  });

  it('carries the catalogue booking verb and links the visit product', () => {
    const { getByText } = renderBar();
    const cta = getByText(t('ox.content.services.visit_cta_short')).closest('a');
    expect(cta?.getAttribute('href')).toBe('/p1051830221');
  });

  it('shows no hours chip while branch_hours is empty', () => {
    const { queryByTestId } = renderBar();
    expect(queryByTestId('ox-visit-sticky-status')).toBeNull();
  });

  it('shows the open chip once branch_hours parses and the clock is inside a row', () => {
    setSettings({ branch_hours: HOURS });
    const { getByTestId } = renderBar(THURSDAY_NOON);
    expect(getByTestId('ox-visit-sticky-status').textContent).toBe(t('ox.blocks.hours.open_now'));
    expect(getByTestId('ox-visit-sticky-status').className).toContain('is-open');
  });

  it('shows the closed chip outside the parsed hours', () => {
    setSettings({ branch_hours: HOURS });
    const midnight = new Date('2026-09-17T02:00:00');
    const { getByTestId } = renderBar(midnight);
    expect(getByTestId('ox-visit-sticky-status').className).toContain('is-closed');
  });
});

describe('VisitStickyBar gated on the visit product existing', () => {
  beforeEach(() => {
    fire = null;
    vi.stubGlobal('IntersectionObserver', MockObserver);
    setSettings({});
  });

  afterEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.doUnmock('../../app/content/salla-ids');
    vi.resetModules();
  });

  it('renders nothing when the visit SKU has no live product path', async () => {
    vi.resetModules();
    vi.doMock('../../app/content/salla-ids', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../../app/content/salla-ids')>();
      return { ...actual, pathForSku: () => undefined };
    });
    const { VisitStickyBar: GatedBar } = await import('../../app/components/pages/VisitStickyBar');
    const { container } = renderWithProviders(
      <GatedBar anchorSelector='[data-testid="test-anchor"]' now={THURSDAY_NOON} />
    );
    expect(container.querySelector('.ox-visit-sticky')).toBeNull();
  });
});
