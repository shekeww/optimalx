/**
 * The two document-level corrections `app/routes/__root.tsx` applies.
 *
 * They live here rather than in the route file so they can be unit tested:
 * a route module is evaluated by the router plugin, the helpers are not.
 */

/** The shape the engine's root `head` returns (theme-engine chunk-4D44TJ72.js:42). */
export interface TanstackHeadResult {
  meta?: Array<Record<string, unknown>>;
  links?: Array<Record<string, unknown>>;
  styles?: Array<Record<string, unknown>>;
  scripts?: Array<Record<string, unknown>>;
}

/**
 * Drops the site-wide canonical the engine root emits.
 *
 * `rootHead` calls `buildBaseHead(settings, locale)` with no path
 * (theme-engine chunk-QVPMWMPP.js:188), and `buildBaseHead` then sets
 * `canonical` to the bare store origin (chunk-TZ3E5BN4.js:60-64). Every route
 * head adds its own, locale-prefixed canonical (PLAN-final C12), and TanStack
 * concatenates the link arrays of all matched routes, so a page shipped two
 * `<link rel="canonical">`, one of them pointing at the home page.
 *
 * The route-level one is the correct one, so the root's is removed here and
 * every B5 route (and every engine route through `withHead`) supplies the
 * real one.
 */
export function dropBaseCanonical<T extends TanstackHeadResult>(result: T): T {
  const links = result?.links;
  if (!Array.isArray(links)) return result;
  const kept = links.filter((link) => link?.rel !== 'canonical');
  if (kept.length === links.length) return result;
  return { ...result, links: kept };
}

/** The class a store or SDK setting puts on `<body>`; this theme is light only. */
export const DARK_MODE_CLASS = 'color-mode-dark';

/**
 * Removes the dark-mode body class on the client.
 *
 * The live store serves `<body class="... color-mode-dark">`. The theme has
 * one light palette (DIRECTION 2) and no dark token set, so the class only
 * makes the scaffold's own dark rules fight ours. The store setting is left
 * alone; only the class on this document is removed, once after hydration and
 * again whenever something puts it back.
 *
 * Returns a cleanup function, so it can be used straight from an effect.
 */
export function stopDarkMode(doc: Document | undefined = typeof document === 'undefined' ? undefined : document): () => void {
  const body = doc?.body;
  if (!body) return () => {};
  body.classList.remove(DARK_MODE_CLASS);
  const observer =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (body.classList.contains(DARK_MODE_CLASS)) body.classList.remove(DARK_MODE_CLASS);
        });
  observer?.observe(body, { attributes: true, attributeFilter: ['class'] });
  return () => observer?.disconnect();
}
