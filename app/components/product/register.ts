import { registry } from '@salla.sa/twilight-theme-engine';
import { ProductCard as EngineProductCard } from '@salla.sa/twilight-theme-engine/product';
import { OxProductCard } from './OxProductCard';
import { PdpGallery } from './BuyZone/PdpGallery';

/**
 * Registration seam for the theme's product-level component overrides.
 * Called once from app/router.tsx before `getRouter()`, because the engine
 * resolves both keys inside `useMemo(..., [])` on first render
 * (theme-engine chunk-UQRLBMIO.js:219-231 and :313-317).
 *
 * `product:card` needs two calls, not one (PLAN-final C1). The engine never
 * registers a default under that key, and `registry.override` degrades to a
 * plain `register` when the key is empty (chunk-342EPVXN.js:12-23). The engine
 * card then still sees `getOriginal('product:card') === null` and keeps
 * rendering its own content. Registering the engine card first and overriding
 * it second makes `getOriginal` non-null, which is the switch the engine reads.
 *
 * `product:gallery` resolves differently: the engine takes whatever `resolve`
 * returns unless it is the engine component itself, so one `register` is
 * enough (chunk-UQRLBMIO.js:313-317).
 *
 * Neither OxProductCard nor PdpGallery renders the engine component it
 * replaces; doing so would re-enter the same lookup and recurse.
 */
export function registerOxProductComponents() {
  registry.register('product:card', EngineProductCard);
  registry.override('product:card', OxProductCard);
  registry.register('product:gallery', PdpGallery);
}
