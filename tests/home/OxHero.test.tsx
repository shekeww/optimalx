import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  // The engine Image turns `priority` into eager + fetchpriority=high +
  // decoding=sync (chunk-LKBWIN26.js); the mock exposes what we pass it.
  Image: ({ alt, src, priority, width, height, mobileSrc }: Record<string, unknown>) =>
    React.createElement('img', {
      alt: alt as string,
      src: src as string,
      width: width as number,
      height: height as number,
      'data-priority': String(Boolean(priority)),
      'data-mobile-src': (mobileSrc as string) ?? '',
    }),
}));

const { OxHero, DEFAULT_HERO, DEFAULT_HERO_MOBILE } = await import(
  '../../app/components/home/OxHero'
);

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return { path: 'ox-hero', key: 'hero', ...HOME_BLOCK_FIELDS['ox-hero'], ...extra } as OxBlockData;
}

function stubMatchMedia(matches: (query: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matches(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('OxHero', () => {
  it('makes the keyword eyebrow the page h1 and the headline a paragraph (DIRECTION 5.2, C19)', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const heading = container.querySelectorAll('h1');
    expect(heading).toHaveLength(1);
    expect(heading[0].textContent).toBe('اوبتيمال اكس: متجر مكملات غذائية ورياضية أصلية');
    expect(container.querySelector('.ox-hero__headline')?.tagName).toBe('P');
    expect(container.querySelector('.ox-hero__headline')?.textContent).toBe('ما هدفك اليوم؟');
  });

  it('ships its own photograph, so the first screen is finished with nothing configured', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const photo = screen.getByTestId('ox-hero-default-photo') as HTMLImageElement;
    // Art directed: a 3:4 crop for the full-bleed mobile band, a 3:2 crop for
    // the desktop wedge panel, both theme assets and both decorative.
    expect(photo.getAttribute('src')).toBe(DEFAULT_HERO_MOBILE);
    expect(container.querySelector('source')?.getAttribute('srcset')).toBe(DEFAULT_HERO);
    expect(photo.getAttribute('alt')).toBe('');
    // It is the LCP element whether it came from the theme or the dashboard.
    expect(photo.getAttribute('fetchpriority')).toBe('high');
    expect(photo.getAttribute('loading')).toBe('eager');
    expect(photo.getAttribute('width')).toBe('780');
    expect(photo.getAttribute('height')).toBe('1040');
  });

  it('steps aside the moment the owner uploads their own', () => {
    renderWithProviders(<OxHero data={data({ image: 'https://cdn.example/hero.jpg' })} />);
    expect(screen.queryByTestId('ox-hero-default-photo')).toBeNull();
  });

  it('marks the hero image as the LCP candidate with explicit dimensions', () => {
    renderWithProviders(
      <OxHero data={data({ image: 'https://cdn.example/hero.jpg', mobile_image: 'https://cdn.example/m.jpg' })} />
    );
    const img = screen.getByRole('presentation', { hidden: true }) as HTMLImageElement;
    expect(img.getAttribute('data-priority')).toBe('true');
    expect(img.getAttribute('width')).toBe('835');
    expect(img.getAttribute('height')).toBe('560');
    expect(img.getAttribute('data-mobile-src')).toBe('https://cdn.example/m.jpg');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('sends the primary CTA to the goals block and the secondary to the services page', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const links = container.querySelectorAll('.ox-hero__actions a');
    expect(links[0].getAttribute('href')).toBe('#ox-goals');
    expect(links[0].textContent).toBe('تسوق حسب هدفك');
    expect(links[1].getAttribute('href')).toBe('/services');
  });

  it('prefers the merchant fields over the locale copy', () => {
    const { container } = renderWithProviders(
      <OxHero data={data({ headline: 'عنوان التاجر', primary_url: '/offers' })} />
    );
    expect(container.querySelector('.ox-hero__headline')?.textContent).toBe('عنوان التاجر');
    expect(container.querySelector('.ox-hero__actions a')?.getAttribute('href')).toBe('/offers');
  });

  it('plays the loop only on a wide screen, with the A3 pause control', () => {
    stubMatchMedia((query) => query.includes('min-width: 1024px'));
    const { container } = renderWithProviders(<OxHero data={data({ video_url: 'https://cdn.example/loop.mp4' })} />);
    expect(container.querySelector('video')).not.toBeNull();
    expect(screen.getByTestId('ox-hero-video-toggle').getAttribute('aria-label')).toBe('إيقاف الفيديو');
  });

  it('never loads the loop under reduced motion', () => {
    stubMatchMedia(() => true);
    const { container } = renderWithProviders(<OxHero data={data({ video_url: 'https://cdn.example/loop.mp4' })} />);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByTestId('ox-hero-video-toggle')).toBeNull();
  });

  it('never loads the loop on a narrow screen', () => {
    stubMatchMedia(() => false);
    const { container } = renderWithProviders(<OxHero data={data({ video_url: 'https://cdn.example/loop.mp4' })} />);
    expect(container.querySelector('video')).toBeNull();
  });
});
