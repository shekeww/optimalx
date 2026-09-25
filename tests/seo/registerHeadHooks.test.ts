import { describe, expect, it } from 'vitest';
import { hookRegistry } from '@salla.sa/twilight-theme-engine/hooks';
import { registerHeadHooks } from '../../app/components/seo/registerHeadHooks';

/**
 * The site graph must reach the document exactly once (Phase B CEN-26).
 *
 * The reference served the Organization + WebSite + Store graph 14 to 18
 * times per page: the dev server re-evaluates app/router.tsx on every HMR
 * invalidation and each evaluation registered one more `head:end` handler
 * into the engine's singleton registry. A second call must therefore be a
 * no-op, and the registry's own handler count is the only honest witness.
 */
describe('registerHeadHooks', () => {
  it('registers the head:end handler once, however many times it is called', () => {
    const before = hookRegistry.getHandlers('head:end').length;
    registerHeadHooks();
    const afterFirst = hookRegistry.getHandlers('head:end').length;
    registerHeadHooks();
    registerHeadHooks();
    const afterThird = hookRegistry.getHandlers('head:end').length;

    expect(afterFirst).toBe(before + 1);
    expect(afterThird).toBe(afterFirst);
  });
});
