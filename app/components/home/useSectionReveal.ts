import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * The page's one reveal: a short rise and fade, run once per element, driven
 * by a single IntersectionObserver shared by every section on the page.
 *
 * Three properties are what make this safe to put on a commerce page.
 *
 * 1. **It never hides anything the visitor can already see.** The element is
 *    rendered with no `data-reveal` attribute at all, so the SSR HTML and a
 *    client with JavaScript off paint it visible. The attribute is added in a
 *    layout effect, and only when the element is still below the fold at that
 *    moment. Anything on screen at hydration keeps its paint and never
 *    animates, which is also why the hero, the trust strip and the top of the
 *    category row are excluded in practice without being special-cased.
 *
 * 2. **One observer, not one per section.** `useIntersectionOnce` constructs
 *    an observer per element, which is right for a single block and wrong for
 *    nine of them. The observer here is module scope and every section
 *    registers with it; it is created on the first registration and never
 *    torn down, because a page has one of it.
 *
 * 3. **No React state.** Intersecting flips a DOM attribute, so a reveal
 *    costs one attribute write and no render. The transition itself is
 *    declared in `_b2-home.scss` on transform and opacity only, staggered
 *    across siblings by `--stagger-step` times `--i`, and switched off whole
 *    under `prefers-reduced-motion: reduce`.
 */

/** Fires slightly before the element's top edge reaches the viewport floor. */
const ROOT_MARGIN = '0px 0px -8% 0px';

/**
 * How far down the viewport an element has to start before it is allowed to
 * animate. 0.9 rather than 1: an element whose first pixels are already on
 * screen at hydration would otherwise animate its own visible top edge.
 */
const BELOW_FOLD = 0.9;

let observer: IntersectionObserver | null = null;

function reveal(node: Element): void {
  node.setAttribute('data-reveal', 'in');
  observer?.unobserve(node);
}

function sharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: 0 }
  );
  return observer;
}

export interface SectionRevealOptions {
  /** `false` leaves the element alone: it stays painted and never animates. */
  enabled?: boolean;
}

/**
 * Attach the returned ref to the element whose children should rise in. The
 * element must carry `.ox-reveal`; its direct children are what move, and each
 * may set `--i` to take its place in the stagger.
 */
export function useSectionReveal<T extends HTMLElement>({
  enabled = true,
}: SectionRevealOptions = {}): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    // The visitor asked for no motion: leave the element exactly as the server
    // painted it. Checked here rather than through a hook so the element is
    // never armed and then disarmed.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const scope = sharedObserver();
    if (!scope) return;

    if (node.getBoundingClientRect().top < window.innerHeight * BELOW_FOLD) return;

    node.setAttribute('data-reveal', 'ready');
    scope.observe(node);
    return () => scope.unobserve(node);
  }, [enabled]);

  return ref;
}

/** Test seam: drops the module-scope observer between cases. */
export function resetSectionRevealObserver(): void {
  observer?.disconnect();
  observer = null;
}
