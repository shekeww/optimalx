import { useEffect, useRef, useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine';

export interface RouteAnnouncerProps {
  /** Overrides the live pathname; the tests drive navigation through it. */
  pathname?: string;
  /** The element focus moves to after a navigation. */
  targetId?: string;
}

/**
 * Amendment A6: single-page navigation is silent to assistive technology.
 * After every client navigation this announces the new document title in a
 * polite live region and moves focus to `#main-content`, so a screen reader
 * user hears where they landed and the next Tab starts at the page, not back
 * at the chrome.
 *
 * The first render is not announced: the page was just loaded, and the title
 * has already been read by the browser.
 */
export function RouteAnnouncer({ pathname, targetId = 'main-content' }: RouteAnnouncerProps) {
  const { location } = useTwilight();
  const path = pathname ?? location?.pathname ?? '';
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof document === 'undefined') return;
    const main = document.getElementById(targetId);
    main?.focus?.();
    // The head is committed after the route's own render, so the title is read
    // on the next task rather than in this effect.
    const timer = window.setTimeout(() => setMessage(document.title), 0);
    return () => window.clearTimeout(timer);
  }, [path, targetId]);

  return (
    <div
      className="ox-sr-only"
      aria-live="polite"
      aria-atomic="true"
      data-testid="ox-route-announcer"
    >
      {message}
    </div>
  );
}
