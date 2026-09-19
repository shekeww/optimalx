import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidElement } from 'react';
import { HOME_BLOCK_HEIGHT_CSS, HOME_BLOCK_PATHS } from '../../app/components/home/defaults';

/**
 * The registry contract (engine chunk-WITIL2MK.js:580-595): a block renders
 * only when `home:<path>` resolves, and it only keeps its box before it mounts
 * when `registerHomeComponentConfig` carries the height.
 */

const registered: Record<string, unknown> = {};
let config: Record<string, { height?: string; className?: unknown; placeholder?: unknown }> = {};

// The engine's product barrel pulls the components-react root, which vitest
// cannot resolve from its dist entry; every block test mocks it the same way.
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: () => null,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useOpeningHours: () => ({ isOpen: false, isEnabled: false, nextOpen: null, nextOpenFormatted: '' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: {}, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => String(value), parse: Number, isValid: () => true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/routes/blog', () => ({
  Blog: { loader: async () => ({ articles: [] }) },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => React.createElement('img', { alt, src }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

vi.mock('@salla.sa/twilight-theme-engine/routes/home', () => ({
  DefaultHomeComponents: { 'products-slider': () => null, testimonial: () => null },
  registerHomeComponents: (map: Record<string, unknown>) => Object.assign(registered, map),
  registerHomeComponentConfig: (next: Record<string, never>) => {
    config = next;
  },
  Home: { id: 'index', Component: () => null },
}));

const { registerOxHomeComponents } = await import('../../app/components/home/register');

beforeEach(() => {
  for (const key of Object.keys(registered)) delete registered[key];
  config = {};
  registerOxHomeComponents();
});

describe('registerOxHomeComponents', () => {
  it('registers the twelve ox blocks', () => {
    for (const path of HOME_BLOCK_PATHS) {
      expect(typeof registered[path], path).toBe('function');
    }
  });

  it('keeps the engine defaults registered underneath', () => {
    expect(registered['products-slider']).toBeDefined();
    expect(registered.testimonial).toBeDefined();
  });

  it('gives every block its DIRECTION 6.2 height, wrapper class and skeleton', () => {
    expect(Object.keys(config)).toEqual([...HOME_BLOCK_PATHS]);
    for (const path of HOME_BLOCK_PATHS) {
      expect(config[path].height, path).toBe(HOME_BLOCK_HEIGHT_CSS[path]);
      expect(config[path].className, path).toBe(`s-block s-block--${path}`);
      expect(isValidElement(config[path].placeholder), path).toBe(true);
    }
  });

  it('is idempotent: calling it twice changes nothing', () => {
    const first = Object.keys(registered).sort();
    registerOxHomeComponents();
    expect(Object.keys(registered).sort()).toEqual(first);
    expect(Object.keys(config)).toEqual([...HOME_BLOCK_PATHS]);
  });
});
