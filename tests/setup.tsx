import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

vi.mock('@salla.sa/twilight-components-react/slider', () => ({
  SallaSlider: ({
    type,
    id,
    centered,
    autoPlay,
    autoplay,
    showControls,
    controlsOuter,
    slidesPerView,
    sliderConfig,
    className,
    children,
    ...props
  }: Record<string, unknown>) => {
    const hasAutoplay = autoplay || autoPlay;
    const attrs: Record<string, string> = {};
    if (type) attrs.type = String(type);
    if (id) attrs.id = String(id);
    if (centered) attrs.centered = 'true';
    if (hasAutoplay) attrs['auto-play'] = 'true';
    if (showControls !== undefined) attrs['show-controls'] = String(showControls);
    if (controlsOuter) attrs['controls-outer'] = 'true';
    if (slidesPerView) attrs['slides-per-view'] = String(slidesPerView);
    if (sliderConfig) attrs['slider-config'] = JSON.stringify(sliderConfig);
    if (className) attrs.class = String(className);
    return React.createElement('salla-slider', { ...attrs, ...props }, children);
  },
}));

vi.mock('@salla.sa/twilight-components-react/rating-stars', () => ({
  SallaRatingStars: ({ value, size, reviews, withLabel, ...props }: Record<string, unknown>) => {
    const attrs: Record<string, string> = {};
    if (value !== undefined) attrs.value = String(value);
    if (size) attrs.size = String(size);
    if (reviews !== undefined) attrs.reviews = String(reviews);
    if (withLabel) attrs['with-label'] = 'true';
    return React.createElement('salla-rating-stars', { ...attrs, ...props });
  },
}));

vi.mock('@salla.sa/twilight-components-react', () => ({
  SallaProductsSlider: ({
    loader,
    children,
    blockTitle,
    sliderProps,
    displayAllUrl,
  }: Record<string, unknown>) => {
    const [items, setItems] = React.useState<unknown[]>([]);
    React.useEffect(() => {
      (loader as () => Promise<{ items: unknown[] }>)().then((result) => {
        setItems(result.items);
      });
    }, [loader]);
    return (
      <div
        data-testid="salla-products-slider"
        data-block-title={blockTitle ?? ''}
        data-slider-id={(sliderProps as Record<string, unknown>)?.id ?? ''}
        data-display-all-url={displayAllUrl ?? ''}
      >
        {items.map((item, index) =>
          (children as (item: unknown, index: number) => React.ReactNode)(item, index)
        )}
      </div>
    );
  },
}));
