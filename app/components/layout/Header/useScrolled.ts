import { useEffect, useState } from 'react';

/**
 * True once the document has scrolled past `threshold` pixels. Used for the
 * header's resting-to-raised shadow (DIRECTION 5.1 MainBar: --ox-shadow-1 from
 * 8px). The listener is passive and the state only ever flips twice, so it
 * costs nothing per frame; the shadow itself is not animated (DIRECTION 7.1
 * "not animated, by decision").
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const read = () => {
      const next = window.scrollY > threshold;
      setScrolled((current) => (current === next ? current : next));
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [threshold]);

  return scrolled;
}
