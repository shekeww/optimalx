import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import {
  product,
  type ProductsListParams,
  type ProductsListSource,
} from '@salla.sa/twilight-theme-engine/api/product';
import { SectionHeader } from '../common/SectionHeader';

/** One thing to ask the catalogue for: a source and, where it needs one, its value. */
export interface ProductsGridQuery {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
}

export interface ProductsGridWrapperProps {
  source: ProductsListSource;
  sourceValue?: ProductsListParams['sourceValue'];
  /**
   * Tried in order when the primary source comes back with nothing, so a
   * grid whose source is a campaign the store is not running falls back to
   * something honest instead of leaving a heading over a hole.
   */
  fallbacks?: ProductsGridQuery[];
  /** How many cards the grid draws. Four across, so a multiple of four. */
  count?: number;
  sort?: string;
  title?: ReactNode;
  eyebrow?: ReactNode;
  viewAll?: { to: string; label?: ReactNode };
  /** Distinct per block: it is the react-query cache key and the DOM id. */
  gridId: string;
  /** Reserved-height placeholder while the first page loads. */
  skeleton?: ReactNode;
  className?: string;
}

/**
 * The home product GRID (homepage-scale-spec sections 4 and 8).
 *
 * The page used to put every product in a rail. A rail is the right shape for
 * a related row at the foot of a product page and the wrong shape for the
 * block whose job is to look like a shop shelf: a rail shows four of eight
 * and hides the rest behind a drag, and the owner's complaint was precisely
 * that nothing on the page reads as a shop. A grid shows eight at once, four
 * across at 1296 with a 16 gap, and the section's own heading carries the
 * route out to the full listing.
 *
 * It is deliberately NOT a second product card. It renders the engine
 * `ProductCard`, so the `product:card` registry override the product batch
 * installed applies here with no import of its own (PLAN-final C1), and the
 * cell is `.ox-grid-products`, the same grid the listing pages use. The one
 * thing the home grid changes is density: `--ox-card-plate-max` is raised so
 * the photograph fills the cell instead of floating in it, which is what
 * `_b2-home.scss` sets on `.ox-grid-products--home`.
 *
 * Empty means absent: no heading, no frame, no "nothing here yet". A store
 * with no catalogue closes the page one section shorter, which is correct.
 */
export function ProductsGridWrapper({
  source,
  sourceValue,
  fallbacks,
  count = 8,
  sort,
  title,
  eyebrow,
  viewAll,
  gridId,
  skeleton,
  className,
}: ProductsGridWrapperProps) {
  const queries = useMemo<ProductsGridQuery[]>(
    () => [{ source, ...(sourceValue !== undefined ? { sourceValue } : {}) }, ...(fallbacks ?? [])],
    [source, sourceValue, fallbacks]
  );

  const { data, isPending } = useQuery({
    queryKey: ['ox', 'home-grid', gridId, queries, count, sort ?? ''],
    queryFn: async (): Promise<Product[]> => {
      for (const query of queries) {
        const result = await product.list({
          source: query.source,
          ...(query.sourceValue !== undefined ? { sourceValue: query.sourceValue } : {}),
          perPage: count,
          ...(sort !== undefined ? { sort } : {}),
        });
        if (result.items.length > 0) return result.items.slice(0, count);
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isPending) return <>{skeleton ?? null}</>;

  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className={['ox-pgrid', className].filter(Boolean).join(' ')} data-testid="ox-products-grid">
      {title ? <SectionHeader title={title} eyebrow={eyebrow} viewAll={viewAll} /> : null}
      <ul className="ox-grid-products ox-grid-products--home" id={gridId}>
        {items.map((item, index) => (
          <li key={item.id ?? index}>
            <ProductCard product={item} index={index} sizes={HOME_GRID_IMAGE_SIZES} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 2 across at 390, 4 from 1024. At 1296 a cell is 312 and its plate is 278,
 * so 312 is the slot the CDN is asked for and a 2x screen gets the 624 step
 * the engine's own srcset ladder carries above it.
 */
export const HOME_GRID_IMAGE_SIZES =
  '(min-width: 1280px) 312px, (min-width: 1024px) 25vw, 45vw';
