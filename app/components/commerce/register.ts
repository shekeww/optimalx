/**
 * Registration seam for the commerce batch (B6): the cart hook handlers
 * (`cart:items.end` trust rows, engine-surface C5), the thank-you and account
 * additions and any `registry.override` the commerce pages need. Called once
 * from app/router.tsx before `getRouter()`, next to the home and product
 * registrations, because the engine resolves overrides a single time at first
 * render (theme-engine chunk-UQRLBMIO.js:219-231).
 *
 * P0 ships it as a no-op so router.tsx is not edited again when B6 lands
 * (PLAN-final 2.1, Router seam). B6 owns this file.
 */
export function registerOxCommerceHooks() {
  // Intentionally empty until B6 lands (see the docblock).
}
