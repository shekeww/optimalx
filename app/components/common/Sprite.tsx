// The sprite file is the single source of truth, inlined at build time
// through `?raw`, so the markup is a compile-time string on the server and
// the client alike and no request is ever made for it.
//
// It lives in app/assets rather than public/ because Salla's SSR runtime is
// workerd, which refuses a root-absolute raw import ("Denied ID
// /assets/icons/ox-sprite.svg?raw") and takes the whole theme down with a 500
// on every route. A relative import from the source tree resolves at build
// time and never reaches the runtime's resolver.
import spriteMarkup from '../../assets/ox-sprite.svg?raw';

/**
 * Inlines the 32-symbol sprite once (OptimalXLayout renders it as the first
 * child of `.app-inner`; the kitchen sink renders its own copy). `<Icon>`
 * references the symbols with `<use href="#ox-{name}">`.
 */
export function Sprite() {
  return (
    <div
      className="ox-sprite"
      aria-hidden="true"
      data-ox-sprite=""
      dangerouslySetInnerHTML={{ __html: spriteMarkup }}
    />
  );
}
