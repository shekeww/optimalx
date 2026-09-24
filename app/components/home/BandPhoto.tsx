import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface BandPhotoProps {
  /** A theme asset path from `docs/build/image-brief.md`. */
  src: string;
  className?: string;
  /**
   * Intrinsic pixels of the file. Optional, because most callers lay the
   * frame over a box the stylesheet has already sized; where they are known
   * they are written, so a browser that has not applied the stylesheet yet
   * still reserves the right ratio.
   */
  width?: number;
  height?: number;
  /**
   * Smaller renditions of the same frame, as a `srcset`, where they exist on
   * disk; `sizes` describes the slot they are chosen against and is written
   * only alongside a `srcset`, since it means nothing without one.
   */
  srcSet?: string;
  sizes?: string;
}

/**
 * A decorative photograph layered behind a dark card, which disappears rather
 * than breaking when the file is not there yet.
 *
 * Only six of the sixteen frames the image brief lists have been shot. Every
 * component that names one of the other ten points at a URL that 404s today,
 * and a 404 on a sized `<img>` is not nothing: Chrome paints its broken-image
 * glyph in the corner of the box even when `alt` is empty. Ten of those, one
 * per dark card, is the single worst thing this page could ship.
 *
 * So the element is invisible until it says it loaded, and it takes itself
 * out of the tree the moment it says it failed. The important half of that is
 * the first one, because it needs no JavaScript to be correct: the server's
 * HTML paints nothing, the card's own dark ground shows through, and a
 * visitor with scripting off sees the design's intended state rather than a
 * degraded one. There is no transition on the reveal; a photograph fading in
 * under a heading is motion nobody asked for.
 *
 * `loading="lazy"` rather than a CSS background, which would be simpler and
 * would also never break: these sit below the fold, and six goal frames plus
 * three plan frames fetched eagerly is most of the page's weight spent on
 * decoration.
 */
export function BandPhoto({ src, className, width, height, srcSet, sizes }: BandPhotoProps) {
  const [state, setState] = useState<'pending' | 'ready' | 'failed'>('pending');
  const ref = useRef<HTMLImageElement>(null);

  /**
   * THE RACE THIS CLOSES, which shipped and made every band photograph
   * invisible.
   *
   * The reveal hung on the `load` event alone. These images are in the
   * server's HTML, so the browser frequently finishes decoding one BEFORE
   * React hydrates and attaches the handler. The event has already fired by
   * then, nothing re-fires it, `data-ready` is never written, and the
   * stylesheet holds the frame at `opacity: 0` forever. Measured on the
   * running page 2026-09-20: all four goal frames reported `complete: true`
   * with a real `naturalWidth`, and all four were invisible. The cards looked
   * like flat dark rectangles and read as a design choice.
   *
   * So the mount asks the element what already happened instead of waiting to
   * be told. `naturalWidth` is the part that matters: a `complete` image that
   * FAILED also reports complete, and only a decoded one has intrinsic pixels.
   */
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !node.complete) return;
    setState(node.naturalWidth > 0 ? 'ready' : 'failed');
  }, [src]);

  const onLoad = useCallback(() => setState('ready'), []);
  const onError = useCallback(() => setState('failed'), []);

  if (state === 'failed') return null;
  return (
    <img
      ref={ref}
      className={className}
      src={src}
      {...(srcSet !== undefined ? { srcSet } : {})}
      {...(srcSet !== undefined && sizes !== undefined ? { sizes } : {})}
      alt=""
      loading="lazy"
      decoding="async"
      {...(width !== undefined ? { width } : {})}
      {...(height !== undefined ? { height } : {})}
      {...(state === 'ready' ? { 'data-ready': 'true' } : {})}
      onLoad={onLoad}
      onError={onError}
      data-testid="ox-band-photo"
    />
  );
}
