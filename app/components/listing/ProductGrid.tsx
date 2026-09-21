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
 * The rows are the ones `.ox-card-product` reserves: the 1:1 plate, then the
 * name over two lines at 44, the meta line at 18, the price at 30, the savings
 * line at 18, and the two action rows, the stepper-and-add row at 44 and the
 * buy button at 44.
 *
 * Re-counted when the card was rebuilt. The card lost its brand row, grew its
 * name box from 40 to 44 and gained two rows (the savings line and the buy
 * button); this still described the old shape, so it stood about 48px short of
 * what replaced it and the grid jumped on resolve. That is the same shift the
 * card's own plate rule was changed to prevent in the same commit, which is
 * the sort of thing a skeleton is for.
 */
export function ProductCardSkeleton() {
  return (
    <Skeleton className="ox-card-skeleton">
      <SkeletonBlock className="ox-card-skeleton__plate" />
      <SkeletonBar height={22} width="92%" />
      <SkeletonBar height={22} width="64%" />
      <SkeletonBar height={18} width="55%" />
      <SkeletonBar height={30} width="50%" />
      <SkeletonBar height={18} width="40%" />
      <SkeletonBlock height={44} />
      <SkeletonBlock height={44} />
    </Skeleton>
  );
}
