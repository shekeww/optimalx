import type { ReactNode } from 'react';
import {
  ItemsList,
  type ItemsListMode,
  type ItemsLoaderFn,
  type TFunction as ItemsListTFunction,
} from '@salla.sa/twilight-components-react';
import { ProductCard } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Skeleton, SkeletonBar, SkeletonBlock } from '../common/Skeleton';
import type { TFunction } from './types';

/**
 * The product grid (DIRECTION 6.3 block 5): the native `ItemsList` in button
 * mode, rendering the engine `ProductCard` per item so the theme's
 * `product:card` registry override applies without this file knowing about it
 * (PLAN-final C1 and C3).
 *
 * `mode` is "button" only while there is another page: with no cursor and no
 * items the component would call the loader again on mount, refetching the
 * empty page the route already answered (components-react
 * native/items-list/ItemsList.js, `isLoaderOnlyMode`). `itemsAs` is passed for
 * the record; that package honours it only for the value "Fragment" and
 * renders a div wrapper for every other value (ItemsList.js, the root return).
 */

/** 2 columns at 390, 4 at 1440; each card image is capped at 2x its slot. */
const GRID_IMAGE_SIZES = '(min-width: 1280px) 296px, (min-width: 1024px) 25vw, 45vw';

export interface ProductGridProps {
  products: Product[];
  loader?: ItemsLoaderFn<Product>;
  /** `${source}-${sort}`: the only intentional reset of the accumulated pages. */
  resetKey: string;
  hasMore: boolean;
  pageUrl: string;
  /** Narrower cards when the rail takes 280 of the row. */
  withFilters?: boolean;
  empty?: ReactNode;
  end?: ReactNode;
  ariaLabel?: string;
  t: TFunction;
}

export function ProductGrid({
  products,
  loader,
  resetKey,
  hasMore,
  pageUrl,
  withFilters = false,
  empty,
  end,
  ariaLabel,
  t,
}: ProductGridProps) {
  const mode: ItemsListMode = hasMore ? 'button' : 'static';
  return (
    <ItemsList<Product>
      key={resetKey}
      resetKey={resetKey}
      items={products}
      loader={loader}
      mode={mode}
      pageUrl={pageUrl}
      itemsAs="ul"
      className="ox-listing__list s-products-list"
      itemsClassName={`ox-grid-products${withFilters ? ' ox-grid-products--with-rail' : ''}`}
      skeleton={<ProductCardSkeleton />}
      skeletonType="item"
      skeletonCount={4}
      empty={empty}
      end={end}
      ariaLabel={ariaLabel}
      t={bridgeT(t)}
    >
      {(items) =>
        items.map((item, index) => (
          <ProductCard key={item.id} product={item} index={index} sizes={GRID_IMAGE_SIZES} />
        ))
      }
    </ItemsList>
  );
}

/**
 * `ItemsList` asks for two platform keys by name: the load-more label and the
 * retry label (components-react native/items-list/ItemsList.js). Neither is in
 * this theme's locale files, and the component's own fallbacks are English, so
 * they are bridged to the audited Arabic keys. Every other key passes through
 * untouched.
 */
const ITEMS_LIST_KEYS: Record<string, string> = {
  'common.elements.load_more': 'ox.listing.load_more',
  'common.elements.retry': 'ox.common.retry',
};

function bridgeT(t: TFunction): ItemsListTFunction {
  return (key, fallback) => {
    const mapped = ITEMS_LIST_KEYS[key];
    if (mapped) return t(mapped);
    const value = t(key);
    return value === key && fallback ? fallback : value;
  };
}

/**
 * The card skeleton, box for box (DIRECTION 5.6 "every block has a skeleton
 * whose outer box equals the final block").
 *
 * The rows are the ones `.ox-card-product` reserves in _b3-product.scss: the
 * 1:1 plate capped at 132, then brand 18, name two lines at 40, spec 18,
 * rating 20, price 30 and the 44 action. Padding, gap and radius match the
 * card's as well, so the swap from loading to loaded shifts nothing.
 */
export function ProductCardSkeleton() {
  return (
    <Skeleton className="ox-card-skeleton">
      <SkeletonBlock className="ox-card-skeleton__plate" />
      <SkeletonBar height={18} width="45%" />
      <SkeletonBar height={20} width="92%" />
      <SkeletonBar height={20} width="64%" />
      <SkeletonBar height={18} width="55%" />
      <SkeletonBar height={20} width="38%" />
      <SkeletonBar height={30} width="50%" />
      <SkeletonBlock height={44} />
    </Skeleton>
  );
}
