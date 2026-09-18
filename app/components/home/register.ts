import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import {
  Brands,
  CustomTestimonials,
  EnhancedSlider,
  MainLinks,
  SliderProductsWithHeader,
  EnhancedSquareBanners,
} from './index';

/**
 * Registers every home block this theme renders (`home:<path>` registry keys)
 * and the render-shell height each block reserves before it mounts, so the
 * lazy wrapper does not collapse and push the page around while a block loads
 * (`registerHomeComponentConfig` -> `estimatedHeight`, theme-engine
 * HomePageRenderer). Called once from app/router.tsx before `getRouter()`.
 */
export function registerOxHomeComponents() {
  registerHomeComponents({
    ...DefaultHomeComponents,
    brands: Brands,
    'enhanced-slider': EnhancedSlider,
    'custom-testimonials': CustomTestimonials,
    'main-links': MainLinks,
    'square-links': MainLinks,
    'slider-products-with-header': SliderProductsWithHeader,
    'enhanced-square-banners': EnhancedSquareBanners,
  });

  registerHomeComponentConfig({
    'enhanced-slider': { height: 'clamp(200px, 42vw, 560px)' },
    'main-links': { height: '200px' },
    'slider-products-with-header': { height: '450px' },
    'enhanced-square-banners': { height: '250px' },
    brands: { height: '200px' },
    'custom-testimonials': { height: '350px' },
  });
}
