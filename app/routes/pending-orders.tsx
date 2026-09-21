import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * `/pending-orders` (PLAN-final 6.3 "Loyalty, testimonials, pending orders").
 *
 * The engine's own `pendingOrdersRedirectLoader` throws
 * `redirect('/${locale}/orders?status=pending')` (chunk-KV5R4LKM.js), and
 * this theme has no `/orders` route: its order history is
 * `/{-$locale}/account/orders`, which is where the generated `/account`
 * layout mounts it. The engine's target therefore 404s, so the redirect is
 * written here instead of imported.
 *
 * The destination is the designed orders page: `AccountShell`, the rail, and
 * the `status=pending` filter the route's own `validateSearch` already reads,
 * so a pending-orders link lands on a finished page rather than a not-found.
 *
 * `// @auto-generated` is deliberately absent: the engine rewrites any route
 * file carrying that marker on the next build (see `app/routes.ts`), which
 * would put the broken target back.
 */
export const Route = createFileRoute('/{-$locale}/pending-orders')({
  loader: ({ params }) => {
    const prefix = params.locale ? `/${params.locale}` : '';
    throw redirect({ href: `${prefix}/account/orders?status=pending` });
  },
});
