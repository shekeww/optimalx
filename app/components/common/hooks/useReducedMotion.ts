import { useMediaQuery } from './useMediaQuery';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * `true` when the visitor asked for reduced motion. CSS handles the static
 * fallbacks (DIRECTION 7.1); components use this only where JS decides
 * whether to start something (the skeleton pulse, the goal-grid settle).
 * `false` on the server and through hydration.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
