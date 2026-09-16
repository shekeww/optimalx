import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CustomTestimonials } from '../../../app/components/home/CustomTestimonials';

vi.mock('@salla.sa/twilight-theme-engine', () => ({
  useTranslation: () => ({
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
    languageName: 'العربية',
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

describe('CustomTestimonials', () => {
  const mockItems = [
    { avatar: 'avatar1.jpg', name: 'John Doe', text: 'Great product!', stars: 5 },
    { avatar: 'avatar2.jpg', name: 'Jane Smith', text: 'Highly recommended', stars: 4 },
  ];

  it('renders SallaSlider with correct attributes', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems, position: 1 }} />);
    const slider = container.querySelector('salla-slider');
    expect(slider?.getAttribute('id')).toBe('custom-testimonials-1-slider');
    expect(slider?.getAttribute('type')).toBe('testimonials');
    expect(slider?.getAttribute('centered')).toBe('true');
    expect(slider?.getAttribute('auto-play')).toBe('true');
  });

  it('renders testimonial items', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems }} />);
    const slides = container.querySelectorAll('.s-reviews-swiper-slide');
    expect(slides.length).toBe(2);
  });

  it('renders testimonial avatar', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems }} />);
    const avatar = container.querySelector('.s-reviews-testimonial__avatar img');
    expect(avatar?.getAttribute('src')).toBe('avatar1.jpg');
    expect(avatar?.getAttribute('loading')).toBe('lazy');
  });

  it('renders testimonial text', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems }} />);
    const text = container.querySelector('.s-reviews-testimonial__text p');
    expect(text?.textContent).toBe('Great product!');
  });

  it('renders testimonial name', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems }} />);
    const name = container.querySelector('.s-reviews-testimonial__info h2');
    expect(name?.textContent).toBe('John Doe');
  });

  it('renders rating stars', () => {
    const { container } = render(<CustomTestimonials data={{ items: mockItems }} />);
    const rating = container.querySelector('salla-rating-stars');
    expect(rating?.getAttribute('value')).toBe('5');
  });

  it('returns null when no items', () => {
    const { container } = render(<CustomTestimonials data={{ items: [] }} />);
    expect(container.firstChild).toBeNull();
  });
});
