import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { routeTree } from './routeTree.gen';
import { registerOxHomeComponents } from './components/home/register';
import { registerOxProductComponents } from './components/product/register';
import { registerThemeHooks } from './hooks';

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();

// Home blocks (+ reserved heights) and product-level overrides, before the
// first render so the engine's one-time registry lookups see them.
registerOxHomeComponents();
registerOxProductComponents();

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
