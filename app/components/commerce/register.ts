import { hookRegistry, HookName } from '@salla.sa/twilight-theme-engine/hooks';
import { createElement } from 'react';
import { CartTrust } from './CartTrust';
import { CartHeader } from './CartHeader';
import { BlogIndexHeader } from './BlogIndexHeader';
import { ArticleExtras, ArticleKeyPoints } from './ArticleExtras';

/**
 * Registration seam for the commerce batch (B6). Called once from
 * `app/router.tsx` before `getRouter()`, next to the home, product and
 * listing registrations, because the engine resolves its registries a single
 * time at first render (theme-engine chunk-UQRLBMIO.js:219-231).
 *
 * Five handlers, all in slots the engine already renders:
 *   - `cart:start` (routes/cart.js `CartPageContent`): the cart's visible
 *     title row, under the breadcrumb and above the two columns. The engine's
 *     own `h1.sr-only` is hidden in the stylesheet so the page keeps one h1;
 *   - `cart:items.end` (routes/cart.js `CartPageContent`): the trust block,
 *     after the rows and the offers row, before the summary column;
 *   - `blog:start` (BlogPage-OZTHYA3G.js): the guides index header, the first
 *     child of the article column, under the breadcrumb;
 *   - `blog:single.start` and `blog:single.end` (BlogSinglePage): the key
 *     points panel and the extras under the body.
 *
 * None of those slots is given a context by the engine (HookSlot builds
 * `{...context, twilight}` and the pages pass no `context` prop), so the cart
 * route mounts `CartContextProvider` and the article route mounts
 * `ArticleProvider`; the handlers read those.
 *
 * Registration is idempotent by construction: the module flag keeps a second
 * call (HMR, a test that re-imports) from stacking a second handler on a
 * slot, which would render the block twice.
 */
let registered = false;

export function registerOxCommerceHooks() {
  if (registered) return;
  registered = true;

  hookRegistry.register('cart:start', () => createElement(CartHeader), 50);
  hookRegistry.register(HookName.CART_ITEMS_END, () => createElement(CartTrust), 50);
  hookRegistry.register('blog:start', () => createElement(BlogIndexHeader), 50);
  hookRegistry.register('blog:single.start', () => createElement(ArticleKeyPoints), 50);
  hookRegistry.register('blog:single.end', () => createElement(ArticleExtras), 50);
}

/** Test seam: lets a suite assert the guard by re-running the registration. */
export function resetOxCommerceHooks() {
  registered = false;
}
