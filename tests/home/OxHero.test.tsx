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
  it('makes the headline the page h1, in two lines with the closing word in accent', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const heading = container.querySelectorAll('h1');
    // Exactly one, and it is the statement the reference draws. The keyword
    // line is no longer an eyebrow above it: the reference has none, it read
    // as a line of meta over the headline, and it stays the engine head's
    // title plus the route's fallback h1 when the hero block is deleted.
    expect(heading).toHaveLength(1);
    expect(heading[0].classList.contains('ox-hero__headline')).toBe(true);
    expect(container.querySelector('.ox-hero__eyebrow')).toBeNull();
    const lines = container.querySelectorAll('.ox-hero__line');
    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toBe('مكملات رياضية، تغذية');
    expect(container.querySelector('.ox-hero__accent')?.textContent).toBe('هدفك.');
  });

  it('sets the Latin lockup under the headline, and steps aside for a merchant subline', () => {
    const plain = renderWithProviders(<OxHero data={data()} />);
    expect(plain.container.querySelector('.ox-hero__latin')?.textContent).toBe(
      'Performance Nutrition & Training'
    );
    plain.unmount();

    const { container } = renderWithProviders(<OxHero data={data({ subline: 'سطر التاجر' })} />);
    expect(container.querySelector('.ox-hero__latin')).toBeNull();
    expect(container.querySelector('.ox-hero__sub')?.textContent).toBe('سطر التاجر');
  });

  it('carries the wedge pair at the band edge and nothing else orange', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    expect(container.querySelectorAll('.ox-band__wedge')).toHaveLength(2);
    expect(container.querySelectorAll('.ox-hero__wedge--wide')).toHaveLength(1);
    expect(container.querySelectorAll('.ox-hero__wedge--thin')).toHaveLength(1);
  });

  it('gives the primary action the brand parallelogram and the secondary the pill', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const links = container.querySelectorAll('.ox-hero__actions a');
    expect(links[0].classList.contains('ox-cta-wedge')).toBe(true);
    expect(links[1].classList.contains('ox-cta-pill')).toBe(true);
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

  it('marks the merchant hero as the LCP candidate and art directs it', () => {
    const { container } = renderWithProviders(
      <OxHero data={data({ image: 'https://cdn.example/hero.jpg', mobile_image: 'https://cdn.example/m.jpg' })} />
    );
    const img = container.querySelector('.ox-hero__frame img') as HTMLImageElement;
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('alt')).toBe('');

    // Both branches are one <picture> now, merchant and theme alike, so the
    // merchant's mobile upload gets real art direction instead of being
    // handed to the engine component as an attribute. That means the <img>
    // carries the PORTRAIT dimensions and the <source> carries the desktop
    // frame, which is what the theme's own default always did. A 1440x560
    // landscape letterboxed into a tall mobile band wastes most of the screen.
    expect(img.getAttribute('src')).toBe('https://cdn.example/m.jpg');
    expect(img.getAttribute('width')).toBe('780');
    expect(img.getAttribute('height')).toBe('1040');
    expect(container.querySelector('.ox-hero__frame source')?.getAttribute('srcset')).toBe(
      'https://cdn.example/hero.jpg'
    );
  });

  it('cycles the photo half, with the first frame server-rendered active', () => {
    const { container } = renderWithProviders(<OxHero data={data()} />);
    const frames = container.querySelectorAll('.ox-hero__frame');
    expect(frames.length).toBeGreaterThan(1);
    // Exactly one frame is active in the server's output, and it is the first,
    // so the hero is finished before any script runs and nothing shifts.
    expect(container.querySelectorAll('.ox-hero__frame[data-active]')).toHaveLength(1);
    expect(frames[0].hasAttribute('data-active')).toBe(true);
    // Only the first frame competes for the connection.
    const imgs = container.querySelectorAll('.ox-hero__frame img');
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs[1].getAttribute('loading')).toBe('lazy');
    expect(imgs[1].hasAttribute('fetchpriority')).toBe(false);
    // One dot per frame, so the rotation can be stopped (WCAG 2.2.2).
    expect(container.querySelectorAll('.ox-hero__dot')).toHaveLength(frames.length);
  });

  it('does not rotate when the merchant supplies a single photograph', () => {
    const { container } = renderWithProviders(
      <OxHero data={data({ image: 'https://cdn.example/hero.jpg' })} />
    );
    expect(container.querySelectorAll('.ox-hero__frame')).toHaveLength(1);
    expect(container.querySelector('.ox-hero__dots')).toBeNull();
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
    // A merchant headline is one string, so it takes no accent word.
    expect(container.querySelector('.ox-hero__accent')).toBeNull();
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
