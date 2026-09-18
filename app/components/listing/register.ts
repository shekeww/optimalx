/**
 * Registration seam for the listing batch (B4): handlers for the four
 * `product:list.*` hook slots the engine listing renders and any
 * `registry.override` the ListingPage needs (PLAN-final C3). Called once from
 * app/router.tsx before `getRouter()`, next to the home and product
 * registrations, because the engine resolves overrides a single time at first
 * render (theme-engine chunk-UQRLBMIO.js:219-231).
 *
 * P0 ships it as a no-op so router.tsx is not edited again when B4 lands
 * (PLAN-final 2.1, Router seam). B4 owns this file.
 */
export function registerOxListingHooks() {
  // Intentionally empty until B4 lands (see the docblock).
}
