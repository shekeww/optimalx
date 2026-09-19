import { useCallback, useRef, useState, type ReactNode } from 'react';
import { SallaProductsSlider } from '@salla.sa/twilight-components-react';
import { ProductCard } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import {
  product,
  type ProductsListParams,
  type ProductsListSource,
} from '@salla.sa/twilight-theme-engine/api/product';
import { SectionHeader } from '../common/SectionHeader';

export interface ProductsSliderWrapperProps {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
  perPage?: number;
  sort?: string;
  /** Rendered as a SectionHeader above the rail when given. */
  title?: ReactNode;
  eyebrow?: ReactNode;
  descriptor?: ReactNode;
  viewAll?: { to: string; label?: ReactNode };
  /** Distinct per block: the web component keys its Swiper instance off it. */
  sliderId: string;
  /** Reserved-height placeholder while the first page loads. */
  skeleton?: ReactNode;
  className?: string;
}

/**
 * The shared product rail (DIRECTION 5.2 ProductsSliderWrapper).
 *
 * It wraps the native `SallaProductsSlider` (components-react
 * native/salla-products-slider/types.d.ts:5-17: `loader` and a render-prop
 * `children` are both required) and renders the engine `ProductCard` per item,
 * so the `product:card` registry override the product batch installs applies
 * here without this file changing.
 *
 * The root is `position: relative` (render budget 10.1) and the rail hides
 * itself once the loader has come back with nothing, so an empty rail is never
 * painted. Arrows are the web component's own controls, shown from 1024 up by
 * the stylesheet.
 */
export function ProductsSliderWrapper({
  source,
  sourceValue,
  perPage,
  sort,
  title,
  eyebrow,
  descriptor,
  viewAll,
  sliderId,
  skeleton,
  className,
}: ProductsSliderWrapperProps) {
  const [isEmpty, setIsEmpty] = useState(false);
  // The params are read inside the loader, so the callback identity stays
  // stable and the web component is not asked to reload on every render.
  const params = useRef({ source, sourceValue, perPage, sort });
  params.current = { source, sourceValue, perPage, sort };

  const loader = useCallback(async () => {
    const { source: s, sourceValue: value, perPage: size, sort: order } = params.current;
    const result = await product.list({
      source: s,
      ...(value !== undefined ? { sourceValue: value } : {}),
      ...(size !== undefined ? { perPage: size } : {}),
      ...(order !== undefined ? { sort: order } : {}),
    });
    setIsEmpty(result.items.length === 0);
    return result;
  }, []);

  if (isEmpty) return null;

  return (
    <div className={['ox-rail', className].filter(Boolean).join(' ')} data-testid="ox-products-slider">
      {title ? (
        <SectionHeader title={title} eyebrow={eyebrow} descriptor={descriptor} viewAll={viewAll} />
      ) : null}
      <SallaProductsSlider<Product>
        loader={loader}
        sliderProps={{ id: sliderId, showControls: true, controlsOuter: true }}
        className="ox-rail__slider"
        {...(skeleton ? { skeleton } : {})}
      >
        {(item, index) => <ProductCard key={item.id ?? index} product={item} />}
      </SallaProductsSlider>
    </div>
  );
}
