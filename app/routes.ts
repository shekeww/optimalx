/**
 * Custom routes file — extend or override built-in engine routes.
 *
 * The `twilightReact()` plugin auto-discovers this file at build time.
 * Routes defined here are merged with the engine's defaults:
 *   - New paths are added alongside the built-in routes.
 *   - Matching paths override the built-in route for that path.
 *
 * After adding a route here, create the corresponding file in `app/routes/`.
 * Do NOT prefix your custom route file with `// @auto-generated` or the
 * engine will overwrite it on the next build.
 *
 * @example Adding routes
 * ```ts
 * import { route, index } from '@tanstack/virtual-file-routes';
 *
 * export const routes = [
 *   route('/faq', 'faq.tsx'),
 *   route('/contact', 'contact.tsx'),
 *   route('/promotions/$id', 'promotions.$id.tsx'),
 * ];
 * ```
 *
 * @example Overriding a built-in route
 * ```ts
 * import { route } from '@tanstack/virtual-file-routes';
 *
 * export const routes = [
 *   route('/cart', 'custom-cart.tsx'), // replaces the engine's cart route
 * ];
 * ```
 */
import { route } from '@tanstack/virtual-file-routes';

export const routes = [
  // Dev-only component gallery. The component itself renders "Not found."
  // when import.meta.env.DEV is false, so a published build exposes nothing
  // useful even though the path still exists in the route tree.
  route('/kitchen-sink', 'kitchen-sink.tsx'),
  // P0 seam: the page routes B5 fills in (DIRECTION 6.11, 6.12, 6.15, 6.16 and
  // the unit converter). The plugin nests them under `{-$locale}`, so they
  // serve at /ar/services etc.; the engine gives them no RouteId or body class.
  route('/services', 'services.tsx'),
  route('/branch', 'branch.tsx'),
  route('/about', 'about.tsx'),
  route('/contact', 'contact.tsx'),
  route('/tools/converter', 'tools.converter.tsx'),
];
