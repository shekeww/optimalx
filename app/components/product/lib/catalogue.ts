import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * Live products for a list of catalogue ids, in the order asked for.
 *
 * One request for the whole set through the engine's own `selected` source,
 * which is the same source the curated home rails use.
 *
 * It lives in `lib/` because two below-fold surfaces need it. It used to sit
 * inside `FrequentlyBought.tsx` on the stated grounds that "this batch owns
 * two components and no lib file", which was not true: this directory already
 * held eleven of them, and `Bundle.tsx` was already importing `effectivePrice`
 * from `./lib/claims`. Keeping a hook in a component module meant the whole
 * `FrequentlyBought` render tree had to be loaded to get it, and made the hook
 * untestable on its own.
 */
export function useCatalogueProducts(ids: readonly number[]): Product[] {
  const key = ids.join(',');
  const { data } = useQuery({
    queryKey: ['ox', 'bundle-products', key],
    queryFn: async (): Promise<Product[]> => {
      const result = await productApi.list({
        source: 'selected',
        sourceValue: [...ids],
        perPage: Math.max(ids.length, 1),
      });
      return result.items;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    if (!data || data.length === 0) return [];
    const byId = new Map(data.map((item) => [String(item.id), item]));
    // The order the caller asked for, not the order the API answered in: a
    // bundle's members and a completion row both read as an authored sequence.
    const out: Product[] = [];
    for (const id of ids) {
      const found = byId.get(String(id));
      if (found) out.push(found);
    }
    return out;
    // `key` is the stable identity of `ids`; the array itself is rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key]);
}

/**
 * Whether a product can actually be put in a cart right now.
 *
 * Salla's status union is `'sale' | 'out' | 'out-and-notify' | 'hidden'`, and
 * `is_out_of_stock` is a separate signal that can be set independently. Both
 * have to be consulted: checking only one is how an out-of-stock product ends
 * up rendering a live add button, and how `'out-and-notify'` ends up wired to
 * a notify-me control that the surrounding UI presents as "add to cart".
 */
export function isAddable(item: Product): boolean {
  if (item.is_out_of_stock === true) return false;
  if (item.status === 'out' || item.status === 'out-and-notify' || item.status === 'hidden') {
    return false;
  }
  return true;
}
