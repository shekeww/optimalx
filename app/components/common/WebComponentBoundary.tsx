import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface WebComponentBoundaryProps {
  children: ReactNode;
  /** Named in the console when something inside throws. */
  label: string;
}

interface State {
  failed: boolean;
}

/**
 * A boundary around raw Salla custom elements.
 *
 * `twilight-components-react` wraps its DEFERRED exports in an error boundary
 * of its own, documented there as preventing "SDK errors from bubbling up to
 * the router's CatchBoundaryImpl which would recreate the entire page tree".
 * Its CORE exports get no such wrapper, and that boundary is not exported for
 * us to reuse, so anything reaching for a Core export has to bring its own.
 *
 * The completion row does reach for one: its add buttons are clipped to a
 * pixel and inert, and the deferred export's IntersectionObserver never fires
 * on an element that size, so the Core export is the only one that hydrates.
 * Without this, a throw inside the element's render or its
 * `disconnectedCallback` (leaving the product page, for instance) would take
 * the whole router tree down and remount the page under the shopper.
 *
 * Failure renders nothing. These elements are invisible proxies: losing one
 * costs the combined add for that row and nothing else on the page.
 */
export class WebComponentBoundary extends Component<WebComponentBoundaryProps, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swallowed on purpose, but never silently: a proxy that stops working is
    // a feature quietly degrading, which is the kind of thing nobody notices
    // until a shopper reports that a button did nothing.
    console.error(`[ox] ${this.props.label} failed and was removed`, error, info.componentStack);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default WebComponentBoundary;
