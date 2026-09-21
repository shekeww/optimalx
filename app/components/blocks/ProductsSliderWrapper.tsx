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

/** One thing to ask the catalogue for: a source and, where it needs one, its value. */
export interface ProductsSliderQuery {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
}

export interface ProductsSliderWrapperProps {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
  /**
   * Tried in order, only when the source above comes back with nothing. A rail
   * whose primary source is merchant-curated (`related`) can name the honest
   * alternatives here instead of disappearing on a catalogue that has not been
   * curated yet. Leave it unset and the rail keeps its all-or-nothing
   * behaviour, which is what every existing caller relies on.
   */
  fallbacks?: ProductsSliderQuery[];
  /** A product id dropped from the result: a rail never offers the page it is on. */
  exclude?: number | string;
  perPage?: number;
  sort?: string;
  /** Rendered as a SectionHeader above the rail when given. */
  title?: ReactNode;
  eyebrow?: ReactNode;
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
  fallbacks,
  exclude,
  perPage,
  sort,
  title,
  eyebrow,
  viewAll,
  sliderId,
  skeleton,
  className,
}: ProductsSliderWrapperProps) {
  const [isEmpty, setIsEmpty] = useState(false);
  // The params are read inside the loader, so the callback identity stays
  // stable and the web component is not asked to reload on every render.
  const params = useRef({ source, sourceValue, fallbacks, exclude, perPage, sort });
  params.current = { source, sourceValue, fallbacks, exclude, perPage, sort };

  const loader = useCallback(async () => {
    const {
      source: s,
      sourceValue: value,
      fallbacks: rest,
      exclude: skip,
      perPage: size,
      sort: order,
    } = params.current;
    const queries: ProductsSliderQuery[] = [{ source: s, sourceValue: value }, ...(rest ?? [])];
    let last: Awaited<ReturnType<typeof product.list>> | null = null;
    for (const query of queries) {
      const result = await product.list({
        source: query.source,
        ...(query.sourceValue !== undefined ? { sourceValue: query.sourceValue } : {}),
        ...(size !== undefined ? { perPage: size } : {}),
        ...(order !== undefined ? { sort: order } : {}),
      });
      const items =
        skip === undefined
          ? result.items
          : result.items.filter((item) => String(item.id) !== String(skip));
      last = { ...result, items };
      if (items.length > 0) break;
    }
    const final = last ?? { items: [] as Product[] };
    setIsEmpty(final.items.length === 0);
    return final as Awaited<ReturnType<typeof product.list>>;
  }, []);

  if (isEmpty) return null;

  return (
    <div className={['ox-rail', className].filter(Boolean).join(' ')} data-testid="ox-products-slider">
      {title ? (
        <SectionHeader title={title} eyebrow={eyebrow} viewAll={viewAll} />
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
