import React, { createRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span>{String(amount)}</span>,
    parse: Number,
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: ({ alt, src }: Record<string, unknown>) => <img alt={String(alt ?? '')} src={src as string} />,
  Link: ({ to, children }: Record<string, unknown>) => <a href={to as string}>{children as React.ReactNode}</a>,
}));

/** One observer instance per test, so the callback can be fired by hand. */
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

const { StickyBar, STICKY_BODY_CLASS } = await import(
  '../../app/components/product/BuyZone/StickyBar'
);

const product = {
  id: 7,
  name: 'Whey',
  sale_price: 240,
  currency: 'SAR',
  image: { url: 'https://cdn.test/a.jpg' },
  is_out_of_stock: false,
  status: 'sale',
} as never;

function renderBar() {
  const anchor = document.createElement('div');
  document.body.appendChild(anchor);
  const ref = createRef<HTMLElement>();
  (ref as { current: HTMLElement | null }).current = anchor;
  const view = renderWithProviders(<StickyBar product={product} anchorRef={ref} />);
  return { ...view, anchor };
}

describe('StickyBar', () => {
  beforeEach(() => {
    fire = null;
    disconnect.mockClear();
    vi.stubGlobal('IntersectionObserver', MockObserver);
  });

  afterEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('starts hidden and adds no body class before the buy zone scrolls away', () => {
    const { container } = renderBar();
    expect(container.querySelector('.ox-sticky')?.className).not.toContain('is-visible');
    expect(document.body.classList.contains(STICKY_BODY_CLASS)).toBe(false);
  });

  it('appears and sets the body class once the buy zone leaves the top of the viewport', () => {
    const { container } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    expect(container.querySelector('.ox-sticky')?.className).toContain('is-visible');
    expect(document.body.classList.contains(STICKY_BODY_CLASS)).toBe(true);
  });

  it('stays hidden while the buy zone is only below the fold, not above it', () => {
    const { container } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: 900 } }]));
    expect(container.querySelector('.ox-sticky')?.className).not.toContain('is-visible');
    expect(document.body.classList.contains(STICKY_BODY_CLASS)).toBe(false);
  });

  it('removes the body class again when the buy zone comes back', () => {
    renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    act(() => fire?.([{ isIntersecting: true, boundingClientRect: { top: 10 } }]));
    expect(document.body.classList.contains(STICKY_BODY_CLASS)).toBe(false);
  });

  it('cleans the body class up on unmount, so no other route inherits it', () => {
    const { unmount } = renderBar();
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    unmount();
    expect(document.body.classList.contains(STICKY_BODY_CLASS)).toBe(false);
    expect(disconnect).toHaveBeenCalled();
  });

  it('adds through the form button rather than opening a second cart path', () => {
    const { container, anchor } = renderBar();
    const engineButton = document.createElement('salla-add-product-button');
    const clicked = vi.fn();
    engineButton.addEventListener('click', clicked);
    anchor.appendChild(engineButton);
    act(() => fire?.([{ isIntersecting: false, boundingClientRect: { top: -200 } }]));
    (container.querySelector('.ox-sticky__add') as HTMLButtonElement).click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });
});
