import type { ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Icon, type OxIconName } from '../common/Icon';

export interface PosterGlyph {
  icon: OxIconName;
  label: string;
}

export interface PosterProps {
  /** Theme asset path or a merchant upload. */
  photo: string;
  /** Intrinsic pixels of the file: the band reserves its box from them. */
  photoWidth: number;
  photoHeight: number;
  eyebrow?: string;
  /** The one headline. Set at display scale, because this band is a full stop. */
  headline: ReactNode;
  line?: string;
  cta?: { label: string; to: string };
  /**
   * The row of outline glyphs along the floor of the band. Each is a fact,
   * never a benefit: the reference draws four and the claims source allows
   * exactly the kind of statement that survives there.
   */
  glyphs?: PosterGlyph[];
  /** `data-testid` and the `data-poster` hook. */
  id: string;
  className?: string;
}

/** An anchor for an absolute URL, the engine Link for a route. */
function isExternal(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * The full-bleed poster (homepage-scale-spec, "the rhythm to build").
 *
 * **100vw, breaking the container.** That is the whole point of it and it is
 * the single move that undoes the compression the owner described: the page
 * was a column of equal medium card rows inside one 1296 measure, and a
 * retail homepage alternates between three weights with nothing sitting at
 * medium for more than one screen. This is the heavy weight. It is edge to
 * edge, it is 480 at 1280 and 560 from 1440, it carries one photograph, one
 * headline and one action, and it has no margin above or below because its
 * own edges are the separation.
 *
 * It breaks out with `margin-inline: calc(50% - 50vw)` rather than a fixed
 * position or a negative physical margin, so it works inside the engine's
 * `.s-block` wrapper, mirrors with the document, and is contained by
 * `.app-inner { overflow-x: clip }` when the scrollbar gutter is reserved.
 *
 * **Nothing here is boxed.** The certification reference teaches the lesson
 * the owner asked for: a section that is a row of bordered rectangles reads
 * as a template no matter how good the contents are, and a section that is a
 * full-width field of photograph with the content sitting directly on it
 * reads as designed. So there is no card, no border and no shadow in this
 * component. The separations are the bleed, the accent rule under the
 * subline, and one hairline above the glyph row.
 *
 * The photograph is eager only when it is above the fold, which it never is:
 * the hero owns the first screen, so this one is lazy and `decoding="async"`,
 * and the explicit width and height plus the band's own height keep CLS at
 * zero whether or not it has arrived.
 */
export function Poster({
  photo,
  photoWidth,
  photoHeight,
  eyebrow,
  headline,
  line,
  cta,
  glyphs,
  id,
  className,
}: PosterProps) {
  const body = (
    <>
      <img
        className="ox-poster__img"
        src={photo}
        alt=""
        width={photoWidth}
        height={photoHeight}
        loading="lazy"
        decoding="async"
      />
      {/* One flat gradient, never a blur (render budget rule 2). It runs from
          the reading start, because the copy sits there in both directions,
          and it deepens to near-opaque at the floor where the glyph row is. */}
      <span className="ox-poster__scrim" aria-hidden="true" />
      <span className="ox-band__wedge ox-poster__wedge ox-poster__wedge--wide" aria-hidden="true" />
      <span className="ox-band__wedge ox-poster__wedge ox-poster__wedge--thin" aria-hidden="true" />
      <span className="ox-poster__inner ox-container">
        <span className="ox-poster__text">
          {eyebrow ? <span className="ox-poster__eyebrow">{eyebrow}</span> : null}
          <span className="ox-poster__headline ox-display">{headline}</span>
          {line ? <span className="ox-poster__line ox-lead">{line}</span> : null}
          {/* The accent rule under the subline. It draws in from the inline
              start on reveal, on scaleX alone, and is the band's one piece of
              motion. */}
          <span className="ox-poster__rule" aria-hidden="true" />
          {cta ? (
            <span className="ox-poster__cta ox-cta-wedge">
              <span className="ox-poster__cta-label">{cta.label}</span>
              <i className="sicon-keyboard_arrow_right ox-mirror" aria-hidden="true" />
            </span>
          ) : null}
        </span>
        {glyphs && glyphs.length > 0 ? (
          <span className="ox-poster__glyphs">
            {glyphs.map((glyph) => (
              <span className="ox-poster__glyph" key={glyph.label}>
                <Icon name={glyph.icon} size={26} className="ox-poster__glyph-icon" />
                <span className="ox-poster__glyph-label">{glyph.label}</span>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </>
  );

  const classes = ['ox-poster', 'ox-band-dark', className].filter(Boolean).join(' ');

  if (!cta) {
    return (
      <div className={classes} data-testid="ox-poster" data-poster={id}>
        {body}
      </div>
    );
  }

  return isExternal(cta.to) ? (
    <a
      className={classes}
      href={cta.to}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="ox-poster"
      data-poster={id}
    >
      {body}
    </a>
  ) : (
    <Link
      className={classes}
      to={cta.to.startsWith('/') ? cta.to : `/${cta.to}`}
      data-testid="ox-poster"
      data-poster={id}
    >
      {body}
    </Link>
  );
}
