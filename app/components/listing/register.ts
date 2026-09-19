/**
 * Registration seam for the listing batch (B4). Called once from
 * app/router.tsx before `getRouter()`, next to the home and product
 * registrations (PLAN-final 2.1, Router seam).
 *
 * It stays a no-op, and that is the finding rather than an omission: B4
 * composes the listing page from the engine's own primitives inside its nine
 * route files (PLAN-final C3) instead of overriding
 * `ProductListing.Component`, so no registry key changes hands and no
 * `product:list.*` handler belongs to the theme. Those four slots are rendered
 * by `ListingPage` in the engine's own positions and left empty for merchant
 * apps, which is what a hook slot is for.
 *
 * The file and its call site stay so that a later batch that does need a
 * listing-level override (a merchant app shim, a promo strip) has one place to
 * add it without editing the router again.
 */
export function registerOxListingHooks() {
  // Intentionally empty: see the docblock. B4 registers nothing.
}
