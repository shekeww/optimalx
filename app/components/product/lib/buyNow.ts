/**
 * What "اشتري الآن" does (UX-2026-09-24 P0-10).
 *
 * The audit measured the card's buy-now as an `<a href>` to the product page:
 * an accent-filled button that says "buy now" and navigates instead of
 * buying, on all 47 products, because `can_quick_buy` is false on every one
 * of them. The owner's decision is that the label and the angled primary both
 * stay, so the control has to become what it says it is.
 *
 * **It does not add anything to the cart itself.** It clicks Salla's own
 * `salla-add-product-button`, the one already mounted beside it, and waits
 * for that component's own `success` event before moving the shopper. The
 * quantity and the options the shopper chose are therefore exactly what
 * reaches the cart, Salla keeps owning the request, the validation, the
 * loading state and the toast, and nothing here calls a cart endpoint
 * (CLAUDE.md: cart logic stays Salla's; checkout stays Salla's). This is the
 * same proxy `BuyActions` and `StickyBar` already use on the product page,
 * lifted here so the card and the page share one implementation.
 *
 * Failure is explicit and silent-free: on `failed`, or on a component that
 * reports neither event inside the timeout, the shopper is simply not moved
 * and Salla's own error surface is what they see. A buy-now that navigates to
 * an empty cart is worse than one that does nothing.
 */
import { localeSegmentOf } from '../../layout/navLinks';

/**
 * How long to wait for the add button's own `success` before giving up on the
 * redirect. A product with options opens Salla's chooser first, and a shopper
 * reading four flavours takes longer than a network call, so this is generous.
 * On timeout the shopper stays on the page with the item in the cart - the add
 * still happened, only the navigation is skipped.
 */
export const SUCCESS_TIMEOUT_MS = 60_000;

/**
 * The cart URL for the page the shopper is standing on: that page's own
 * locale segment and `/cart`. Reading the served path rather than the active
 * locale is deliberate (see `localeSegmentOf`).
 */
export function cartPathFor(pathname: string): string {
  return `${localeSegmentOf(pathname)}/cart`;
}

/** The cart URL for the current document, or `/cart` outside a browser. */
export function currentCartPath(): string {
  if (typeof window === 'undefined') return '/cart';
  return cartPathFor(window.location.pathname);
}

/**
 * The tag name the SDK defines once its script from cdn.assets.salla.network
 * has loaded and run. Every add control that proxies to it — the card's own
 * themed add button (`AddButton`, `OxProductCard.tsx`) and this file's own
 * `proxyAddToCart` callers — waits on `whenCustomElementReady` below before a
 * click can do anything, because an instance of this tag has no click
 * handler of its own until this exact moment.
 */
export const ADD_BUTTON_TAG = 'salla-add-product-button';

/**
 * How long a queued click waits for the SDK to register `tagName` before the
 * caller gives up and restores its own control, rather than leaving it
 * disabled on a component that may never register at all (a genuinely
 * failed CDN request, an ad blocker). Generous — the SDK script itself can
 * take a few seconds on a slow connection (PDP-ADD-DIAG-2026-09-24.md) — but
 * bounded: "never a silent no-op" cuts both ways, and a spinner stuck
 * forever is its own kind of silence.
 */
export const DEFINE_TIMEOUT_MS = 20_000;

/**
 * Resolves once the SDK has upgraded `tagName` — on the next microtask if it
 * already has, since a tag that is already defined upgrades any connected
 * instance synchronously, both at definition time and on later insertion, so
 * checking `customElements.get` is a sufficient readiness test for an
 * instance already mounted in the tree. Resolves `false` after `timeoutMs`
 * if the tag never defines, and never throws: a browser with no Custom
 * Elements registry, or a `customElements` missing `whenDefined`, resolves
 * `false` immediately rather than blowing up the caller's click handler.
 */
export function whenCustomElementReady(
  tagName: string,
  timeoutMs = DEFINE_TIMEOUT_MS
): Promise<boolean> {
  if (typeof customElements === 'undefined') return Promise.resolve(false);
  if (customElements.get(tagName)) return Promise.resolve(true);
  if (typeof customElements.whenDefined !== 'function') return Promise.resolve(false);
  return Promise.race([
    customElements.whenDefined(tagName).then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);
}

export interface ProxyAddOptions {
  /** Salla's own add button to click. */
  button: Element;
  /** Run once, after the component reports its own success. */
  onSuccess: () => void;
  /** Run on `failed`, on timeout, and after `onSuccess`: clears the caller's latch. */
  onSettled?: () => void;
  timeoutMs?: number;
}

/**
 * Clicks Salla's add button and calls `onSuccess` when, and only when, the
 * component reports that the item went into the cart.
 *
 * Both listeners are `once` and both are removed by `done()`, so a later,
 * unrelated add on the same card can never strand a redirect from an earlier
 * one, and the timeout covers a component that reports neither event.
 */
export function proxyAddToCart({
  button,
  onSuccess,
  onSettled,
  timeoutMs = SUCCESS_TIMEOUT_MS,
}: ProxyAddOptions): void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const done = () => {
    if (timer) clearTimeout(timer);
    button.removeEventListener('success', handleSuccess);
    button.removeEventListener('failed', handleFailed);
    onSettled?.();
  };
  const handleSuccess = () => {
    done();
    onSuccess();
  };
  const handleFailed = () => done();

  button.addEventListener('success', handleSuccess, { once: true });
  button.addEventListener('failed', handleFailed, { once: true });
  timer = setTimeout(done, timeoutMs);

  (button as HTMLElement).click();
}
