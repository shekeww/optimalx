import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

/**
 * Loading placeholders (DIRECTION 5.6, amendment A7).
 *
 * Rules the amendment fixes in place:
 *   - a skeleton's outer box equals the final block's reserved height in both
 *     viewports, so nothing shifts when the data lands (DIRECTION 6 tables);
 *   - block rectangles are static `--ox-plate-2`; only the text bars pulse;
 *   - the 1.2s opacity pulse runs on the ONE root currently in the viewport.
 *     A page that renders six skeletons animates six elements otherwise, and
 *     the render budget (10.1 rule 3) allows none of that.
 *
 * The single-pulse rule is enforced by one module-level IntersectionObserver
 * shared by every mounted root; the class `is-pulsing` moves between roots and
 * no component owns an observer of its own. Reduced motion is handled in CSS
 * (`_primitives.scss` section 15): the bars sit at opacity 0.8 and nothing runs.
 */

const PULSING = 'is-pulsing';

/** Roots currently intersecting the viewport, in mount order. */
const visible = new Set<Element>();
let observer: IntersectionObserver | null = null;
let active: Element | null = null;

/**
 * Gives `is-pulsing` to the first visible root in document order, and takes it
 * from whoever held it. Document order keeps the choice stable while the page
 * scrolls, so the pulse does not jump between blocks.
 */
function refreshActive(): void {
  let next: Element | null = null;
  for (const node of visible) {
    if (!node.isConnected) continue;
    if (!next) {
      next = node;
      continue;
    }
    const position = next.compareDocumentPosition(node);
    if (position & Node.DOCUMENT_POSITION_PRECEDING) next = node;
  }
  if (next === active) return;
  active?.classList.remove(PULSING);
  active = next;
  active?.classList.add(PULSING);
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        refreshActive();
      },
      { rootMargin: '0px', threshold: 0 }
    );
  }
  return observer;
}

/**
 * Ref callback that enrols a skeleton root in the shared observer. Exported so
 * a batch that builds a page-sized skeleton out of raw markup follows the same
 * one-pulse rule instead of adding its own observer.
 */
export function useSkeletonPulse<T extends HTMLElement>(): (node: T | null) => void {
  const current = useRef<T | null>(null);
  useEffect(() => {
    return () => {
      const node = current.current;
      if (!node) return;
      visible.delete(node);
      getObserver()?.unobserve(node);
      if (active === node) {
        active = null;
        refreshActive();
      }
    };
  }, []);
  return useCallback((node: T | null) => {
    const previous = current.current;
    if (previous && previous !== node) {
      visible.delete(previous);
      getObserver()?.unobserve(previous);
      if (active === previous) {
        active = null;
        refreshActive();
      }
    }
    current.current = node;
    if (node) getObserver()?.observe(node);
  }, []);
}

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The block's reserved height; pass the same value the real block occupies. */
  height?: number | string;
  children?: ReactNode;
}

/** A skeleton root. Always `aria-hidden`; the live region is the caller's. */
export function Skeleton({ height, className, style, children, ...rest }: SkeletonProps) {
  const ref = useSkeletonPulse<HTMLDivElement>();
  const classes = ['ox-skel', className].filter(Boolean).join(' ');
  const box: CSSProperties = { ...style };
  if (height !== undefined) box.blockSize = typeof height === 'number' ? `${height}px` : height;
  return (
    <div ref={ref} className={classes} style={box} aria-hidden="true" {...rest}>
      {children}
    </div>
  );
}

interface ShapeProps extends HTMLAttributes<HTMLSpanElement> {
  width?: number | string;
  height?: number | string;
}

function shapeStyle(width?: number | string, height?: number | string, style?: CSSProperties) {
  const box: CSSProperties = { ...style };
  if (width !== undefined) box.inlineSize = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) box.blockSize = typeof height === 'number' ? `${height}px` : height;
  return box;
}

/** A static plate rectangle: an image slot, a card, a map. Never pulses. */
export function SkeletonBlock({ width, height, className, style, ...rest }: ShapeProps) {
  return (
    <span
      className={['ox-skel__block', className].filter(Boolean).join(' ')}
      style={shapeStyle(width ?? '100%', height, style)}
      {...rest}
    />
  );
}

/** A text line, 60 to 90 per cent wide at the line height. Pulses when active. */
export function SkeletonBar({ width = '80%', height, className, style, ...rest }: ShapeProps) {
  return (
    <span
      className={['ox-skel__bar', className].filter(Boolean).join(' ')}
      style={shapeStyle(width, height, style)}
      {...rest}
    />
  );
}

/** An avatar, a thumb or a badge slot. */
export function SkeletonCircle({ width = 40, height, className, style, ...rest }: ShapeProps) {
  return (
    <span
      className={['ox-skel__circle', className].filter(Boolean).join(' ')}
      style={shapeStyle(width, height ?? width, style)}
      {...rest}
    />
  );
}

/** Test seam: drops the shared observer state between test files. */
export function resetSkeletonPulse(): void {
  observer?.disconnect();
  observer = null;
  visible.clear();
  active = null;
}
