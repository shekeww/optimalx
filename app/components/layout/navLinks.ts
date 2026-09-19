import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { menuSegments, type NavEntry } from '../../content/nav';

/** Every menu item, parents and children, in one list. */
export function flattenMenu(items: readonly MenuItem[] | undefined): MenuItem[] {
  if (!items) return [];
  const out: MenuItem[] = [];
  const walk = (list: readonly MenuItem[]) => {
    for (const item of list) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return out;
}

/**
 * The destination for one navigation entry, or `null` when it has none.
 *
 * Precedence, and the reason for it:
 *
 * 1. A live category whose URL carries the entry's slug. Once the merchant
 *    creates the category, the link follows it without a code change.
 * 2. The entry's standing theme route, which always exists.
 * 3. A search for the entry's own label. This is a real destination showing
 *    real products, and it is the fallback this codebase already uses for the
 *    goal collections rather than shipping a dead URL.
 *
 * An entry with no slug, no route and no label resolves to `null` and the
 * caller drops the row. Nothing ever renders pointing nowhere.
 */
export function resolveNavHref(
  entry: NavEntry,
  label: string,
  items: readonly MenuItem[] | undefined
): string | null {
  if (entry.slug) {
    const match = flattenMenu(items).find(
      (item) => typeof item.url === 'string' && menuSegments(item.url).includes(entry.slug as string)
    );
    if (match?.url) return match.url;
  }
  if (entry.to) return entry.to;
  const query = label.trim();
  if (query) return `/search?q=${encodeURIComponent(query)}`;
  return null;
}
