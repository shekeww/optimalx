import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedSquareBanners } from '../../../app/components/home/EnhancedSquareBanners';

// Mock the sub-path exports
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
    'aria-label': ariaLabel,
    style,
  }: {
    to: string;
    children?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={to} className={className} aria-label={ariaLabel} style={style}>
      {children}
    </a>
  ),
}));

describe('EnhancedSquareBanners', () => {
  const mockBanners = [
    { image: 'banner1.jpg', url: '/url1', title: 'Banner 1', description: 'Desc 1' },
    { image: 'banner2.jpg', url: '/url2', title: 'Banner 2', description: 'Desc 2' },
    { image: 'banner3.jpg', url: '/url3' },
  ];

  it('renders banner items', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: mockBanners }} />);
    const banners = container.querySelectorAll('.banner-entry');
    expect(banners.length).toBe(3);
  });

  it('adds has-overlay class when title exists', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: mockBanners }} />);
    const banner = container.querySelector('.banner-entry');
    expect(banner?.className).toContain('has-overlay');
  });

  it('renders banner title', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: mockBanners }} />);
    const title = container.querySelector('.banner__title');
    expect(title?.textContent).toBe('Banner 1');
  });

  it('uses h-lg-banner class for 3 or fewer banners', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: mockBanners }} />);
    const banner = container.querySelector('.banner-entry');
    expect(banner?.className).toContain('h-lg-banner');
  });

  it('uses h-banner class for more than 3 banners', () => {
    const largeBannerList = [
      ...mockBanners,
      { image: 'banner4.jpg', url: '/url4' },
      { image: 'banner5.jpg', url: '/url5' },
    ];
    const { container } = render(<EnhancedSquareBanners data={{ banners: largeBannerList }} />);
    const banner = container.querySelector('.banner-entry');
    expect(banner?.className).toContain('h-banner');
  });

  it('renders background image on link', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: mockBanners }} />);
    const link = container.querySelector('.banner-entry');
    expect(link?.style.backgroundImage).toContain('banner1.jpg');
    expect(link?.className).toContain('bg-cover');
    expect(link?.className).toContain('bg-center');
  });

  it('returns null when no banners', () => {
    const { container } = render(<EnhancedSquareBanners data={{ banners: [] }} />);
    expect(container.firstChild).toBeNull();
  });
});
