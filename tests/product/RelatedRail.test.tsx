import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('./i18n-mock')).i18nModuleMock('ar')
);

/**
 * The rail the wrapper draws, in the shape the live store actually serves:
 * `.ox-rail` wrapping the component's own nav buttons (which the stylesheet
 * hides) and the initialised Swiper element that carries the instance.
 */
vi.mock('../../app/components/blocks/ProductsSliderWrapper', () => ({
  ProductsSliderWrapper: () => (
    <div className="ox-rail">
      <button type="button" className="s-slider-prev s-slider-nav-arrow swiper-button-disabled" />
      <button type="button" className="s-slider-next s-slider-nav-arrow" />
      <div className="swiper s-slider-container">
        <div className="swiper swiper-initialized swiper-rtl" data-testid="swiper">
          <div className="swiper-wrapper" />
        </div>
      </div>
    </div>
  ),
}));

const { RelatedRail } = await import('../../app/components/product/BelowFold/RelatedRail');
const t = createT('ar');

function mount() {
  const view = renderWithProviders(<RelatedRail productId={1} categoryId={null} />);
  const swiper = { next: 0, prev: 0, slideNext() { this.next += 1; }, slidePrev() { this.prev += 1; } };
  const el = view.container.querySelector('.swiper.swiper-initialized') as HTMLElement & {
    swiper?: unknown;
  };
  el.swiper = swiper;
  const [prevBtn, nextBtn] = [
    view.container.querySelector('.ox-related__arrow:not(.ox-related__arrow--next)'),
    view.container.querySelector('.ox-related__arrow--next'),
  ];
  return { view, swiper, prevBtn: prevBtn as HTMLElement, nextBtn: nextBtn as HTMLElement };
}

describe('RelatedRail arrows', () => {
  it('drives the slider in BOTH directions through the Swiper instance', () => {
    // The component's own `.s-slider-prev` keeps `swiper-button-disabled`
    // after the rail has advanced, so a click on it does nothing and the
    // back arrow was dead on the live store. The instance is direction-aware
    // and is therefore the route the arrows take.
    const { swiper, prevBtn, nextBtn } = mount();
    fireEvent.click(nextBtn);
    expect(swiper.next).toBe(1);
    fireEvent.click(prevBtn);
    expect(swiper.prev).toBe(1);
  });

  it('never clicks a control the slider has disabled', () => {
    const { view, prevBtn } = mount();
    const el = view.container.querySelector('.swiper.swiper-initialized') as HTMLElement & {
      swiper?: unknown;
    };
    el.swiper = undefined;
    const disabled = view.container.querySelector('.s-slider-prev') as HTMLButtonElement;
    const spy = vi.spyOn(disabled, 'click');
    fireEvent.click(prevBtn);
    expect(spy).not.toHaveBeenCalled();
  });

  it('falls back to the component nav when the instance is not exposed', () => {
    const { view, nextBtn } = mount();
    const el = view.container.querySelector('.swiper.swiper-initialized') as HTMLElement & {
      swiper?: unknown;
    };
    el.swiper = undefined;
    const enabled = view.container.querySelector('.s-slider-next') as HTMLButtonElement;
    const spy = vi.spyOn(enabled, 'click');
    fireEvent.click(nextBtn);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('names both arrows for a screen reader and heads the section', () => {
    const { view } = mount();
    expect(view.container.querySelector('.ox-related__title')?.textContent).toBe(
      t('ox.pdp.you_may_like')
    );
    expect(
      view.container.querySelector('.ox-related__arrow')?.getAttribute('aria-label')
    ).toBe(t('ox.pdp.rail_prev'));
    expect(
      view.container.querySelector('.ox-related__arrow--next')?.getAttribute('aria-label')
    ).toBe(t('ox.pdp.rail_next'));
  });
});
