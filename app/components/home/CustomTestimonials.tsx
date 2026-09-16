import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';

interface TestimonialItem {
  avatar?: string;
  name?: string;
  text?: string;
  stars?: number;
}

export interface CustomTestimonialsProps {
  data: {
    items: TestimonialItem[];
    position?: number;
    [key: string]: unknown;
  };
}

export const CustomTestimonials = memo(function CustomTestimonials({
  data,
}: CustomTestimonialsProps) {
  const { t } = useTranslation();
  const { items, position = 1 } = data;

  if (!items.length) return null;

  return (
    <>
      <div className="s-reviews-container">
        <div className="s-reviews-header-wrapper">
          <h1 className="s-reviews-header">{t('blocks.home.testimonials', 'Testimonials')}</h1>
        </div>
        <SallaSlider
          id={`custom-testimonials-${position}-slider`}
          centered
          slidesPerView="1"
          type="testimonials"
          className="testimonials-slider s-slider-wrapper"
          controlsOuter
          autoPlay
          sliderConfig={{ watchOverflow: true }}
        >
          <div slot="items">
            {items.map((item, index) => (
              <div
                key={index}
                className="s-reviews-swiper-slide swiper-slide"
                style={{ width: '830px' }}
              >
                <div className="s-reviews-testimonial">
                  <div className="s-reviews-testimonial__inner">
                    <div className="s-reviews-testimonial__avatar">
                      <img
                        src={item.avatar}
                        alt={item.name?.trim() ? item.name : `testimonial-${index}`}
                        width="68"
                        height="68"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="s-reviews-testimonial__text">
                      <p>{item.text}</p>
                      <div className="s-reviews-testimonial__name_wrapper items-center">
                        <div className="s-reviews-testimonial__info">
                          <h2 className="font-bold text-xs xs:text-sm">{item.name}</h2>
                        </div>
                        <div className="s-reviews-testimonial__rating !mx-0">
                          <SallaRatingStars className="flex" size="small" value={item.stars} />
                        </div>
                      </div>
                    </div>
                    <span className="s-reviews-testimonial__icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                      >
                        <path d="M8 12v-5.333c0-0.737-0.596-1.333-1.333-1.333-3.676 0-6.667 2.991-6.667 6.667v8c0 3.676 2.991 6.667 6.667 6.667h1.333c3.676 0 6.667-2.991 6.667-6.667v-1.333c0-3.676-2.991-6.667-6.667-6.667zM12 20c0 2.205-1.795 4-4 4h-1.333c-2.205 0-4-1.795-4-4v-8c0-1.739 1.115-3.221 2.667-3.772v5.105c0 0.737 0.596 1.333 1.333 1.333h1.333c2.205 0 4 1.795 4 4zM25.333 12v-5.333c0-0.737-0.596-1.333-1.333-1.333-3.676 0-6.667 2.991-6.667 6.667v8c0 3.676 2.991 6.667 6.667 6.667h1.333c3.676 0 6.667-2.991 6.667-6.667v-1.333c0-3.676-2.991-6.667-6.667-6.667zM29.333 20c0 2.205-1.795 4-4 4h-1.333c-2.205 0-4-1.795-4-4v-8c0-1.739 1.115-3.221 2.667-3.772v5.105c0 0.737 0.596 1.333 1.333 1.333h1.333c2.205 0 4 1.795 4 4z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SallaSlider>
      </div>
    </>
  );
});
