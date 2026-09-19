import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { routeTree } from './routeTree.gen';
import { registerOxHomeComponents } from './components/home/register';
import { registerOxProductComponents } from './components/product/register';
import { registerOxListingHooks } from './components/listing/register';
import { registerOxCommerceHooks } from './components/commerce/register';
import { registerHeadHooks } from './components/seo/registerHeadHooks';
import { registerThemeHooks } from './hooks';

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();
// Site-wide Organization + WebSite JSON-LD at head:end.
registerHeadHooks();

// Home blocks (+ reserved heights) and product-level overrides, before the
// first render so the engine's one-time registry lookups see them.
registerOxHomeComponents();
registerOxProductComponents();
// Listing (B4) and commerce (B6) seams: no-ops until those batches land.
registerOxListingHooks();
registerOxCommerceHooks();

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree, {
    defaultPendingMs: 100,
    defaultPendingMinMs: 200,
  });

  // C10 (DIRECTION 7.3): same-document view transitions around the router's
  // DOM commit. The engine's `createRouter` forwards only four options
  // (theme-engine chunk-QVPMWMPP.js:547-555), so the flag is set afterwards
  // through the router's own `update`. Where the API is unsupported the
  // navigation swaps instantly: no polyfill, no library. The root cross-fade,
  // the pinned header and tab bar groups and the reduced-motion opt-out live
  // in `app/styles/06-ox/_b6-commerce.scss`.
  router.update({ defaultViewTransition: true });

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
