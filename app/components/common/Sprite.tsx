// The sprite file is the single source of truth; Vite reads the public file
// at build time through `?raw` (its asset plugin resolves public files for
// raw imports), so the markup is a compile-time string on the server and the
// client alike and no request is made for it.
import spriteMarkup from '/assets/icons/ox-sprite.svg?raw';

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
