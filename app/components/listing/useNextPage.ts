import { useCallback, useEffect, useRef, useState } from 'react';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';

/**
 * The next-page loader `ItemsList` calls in button mode, and the running count
 * of products the visitor has been shown.
 *
 * It reproduces the engine's own loader (theme-engine
 * dist/routes/product-listing.js:329-343): the cursor lives in
 * `pagination.next`, which the API returns either as an opaque token or as a
 * full URL carrying `?cursor=`, and `product.list({ source, sourceValue,
 * cursor, sort })` is the paginated call (engine dist/api/product.d.ts:82).
 * The cursor is kept in a ref, not in state, so returning it never re-renders
 * the grid and never re-creates the callback: `ItemsList` resets its internal
 * items whenever the loader identity changes.
 *
 * The count exists because the API returns no total. DIRECTION 5.3 asks the
 * LoadMore block for "عرض 24 من 96"; the second number is not knowable, so the
 * progress line states only what has been loaded and the header count line is
 * omitted rather than faked (PLAN-final B4).
 */

/** `?cursor=` inside a next-page URL. Built from a string, never a literal. */
const CURSOR_IN_URL = new RegExp('[?&]cursor=([^&]+)');

export interface NextPage {
  /** Passed to `ItemsList` as `loader`. */
  load: () => Promise<{ items: Product[]; next: string | null }>;
  /** Products currently rendered in the grid, first page included. */
  loadedCount: number;
  /** True while there is another page to fetch. */
  hasMore: boolean;
}

export function cursorOf(next: string | null | undefined): string | undefined {
  if (!next) return undefined;
  const match = CURSOR_IN_URL.exec(next);
  return match ? decodeURIComponent(match[1]) : next;
}

export function useNextPage(data: ProductListLoaderData, sort: string): NextPage {
  const { source, products, pagination } = data;
  const firstPageCount = products.length;
  const nextCursorRef = useRef<string | null>(pagination?.next ?? null);
  const [loadedCount, setLoadedCount] = useState(firstPageCount);
  const [hasMore, setHasMore] = useState(Boolean(pagination?.next));

  // A new route payload (sort, filter, or a different source) replaces the
  // first page; the accumulated count and the cursor restart with it.
  useEffect(() => {
    nextCursorRef.current = pagination?.next ?? null;
    setHasMore(Boolean(pagination?.next));
    setLoadedCount(firstPageCount);
  }, [pagination?.next, firstPageCount, source.type, source.value, sort]);

  const load = useCallback(async () => {
    const cursor = cursorOf(nextCursorRef.current);
    const result = await product.list({
      source: source.type,
      ...(source.value !== undefined ? { sourceValue: source.value } : {}),
      ...(cursor !== undefined ? { cursor } : {}),
      sort,
    });
    nextCursorRef.current = result.next ?? null;
    setHasMore(Boolean(result.next));
    setLoadedCount((count) => count + result.items.length);
    return { items: result.items, next: result.next ?? null };
  }, [source.type, source.value, sort]);

  return { load, loadedCount, hasMore };
}
