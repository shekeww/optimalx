import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedSlider } from '../../../app/components/home/EnhancedSlider';

describe('EnhancedSlider', () => {
  const mockSlides = [
    { image: 'slide1.jpg', title: 'Slide 1', description: 'Description 1' },
    { image: 'slide2.jpg', title: 'Slide 2', description: 'Description 2' },
  ];

  it('renders slider element with correct attributes', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: mockSlides }} />);
    const slider = container.querySelector('salla-slider');
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute('type')).toBe('fullwidth');
  });

  it('renders SallaSlider with correct attributes', () => {
    const { container } = render(
      <EnhancedSlider data={{ slider_banner: mockSlides, position: 1 }} />
    );
    const slider = container.querySelector('salla-slider');
    expect(slider?.getAttribute('id')).toBe('main-slider-1');
    expect(slider?.getAttribute('auto-play')).toBe('true');
    expect(slider?.getAttribute('type')).toBe('fullwidth');
  });

  it('hides controls when single slide', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: [mockSlides[0]] }} />);
    const slider = container.querySelector('salla-slider');
    expect(slider?.getAttribute('show-controls')).toBe('false');
  });

  it('renders slides with overlay background', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: mockSlides }} />);
    const overlay = container.querySelector('.overlay-bg');
    expect(overlay).toBeTruthy();
    expect(overlay?.getAttribute('style')).toContain('background-image');
  });

  it('renders slide title with parallax attribute', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: mockSlides }} />);
    const title = container.querySelector('h2');
    expect(title?.getAttribute('data-swiper-parallax')).toBe('-500');
    expect(title?.textContent).toBe('Slide 1');
  });

  it('renders slide description with parallax attribute', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: mockSlides }} />);
    const desc = container.querySelector('.description');
    expect(desc?.getAttribute('data-swiper-parallax')).toBe('-300');
    expect(desc?.textContent).toBe('Description 1');
  });

  it('returns null when no slides', () => {
    const { container } = render(<EnhancedSlider data={{ slider_banner: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('uses slides property as fallback', () => {
    const { container } = render(<EnhancedSlider data={{ slides: mockSlides }} />);
    expect(container.querySelector('.overlay-bg')).toBeTruthy();
  });
});
