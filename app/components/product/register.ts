/**
 * Registration seam for the theme's product-level component overrides
 * (`product:card`, later `product:gallery`). Called once from app/router.tsx
 * before `getRouter()`, because the engine resolves the override a single time
 * inside `useMemo(..., [])` (theme-engine chunk-UQRLBMIO.js:219-231).
 *
 * D7 asks for `registry.override('product:card', ProductCard)` (`registry` is
 * exported from the engine root, `dist/index.d.ts`). With engine 1.0.47 that
 * call cannot take effect, and is deliberately not made here:
 *
 * - the engine never registers a default under `product:card`, so `override`
 *   degrades to a plain `register` (chunk-342EPVXN.js:12-23) and the engine
 *   card only swaps when `getOriginal('product:card') !== null` - which stays
 *   null; the override is a silent no-op;
 * - the existing wrapper in ./ProductCard renders the engine `ProductCard`,
 *   the very component that performs the lookup, so the moment an override
 *   did take effect it would recurse on every card.
 *
 * B3 owns the fix: a card that does not render the engine card, registered as
 * `registry.register('product:card', <original>)` followed by
 * `registry.override('product:card', OxProductCard)` from this function.
 */
export function registerOxProductComponents() {
  // Intentionally empty until B3 ships OxProductCard (see the docblock).
}
