import { Link } from '@salla.sa/twilight-theme-engine/common';
import { toInternalPath } from '../layout/navLinks';

export interface PosterCardProps {
  /** Stable id, also the `data-poster` test hook. */
  slug: string;
  /** The 1125-wide file (`scripts/posters-import.mjs`'s own main output). */
  photo: string;
  /** Widths available at `photo`'s own basename, smallest first. */
  srcSet: readonly number[];
  to: string;
  /** The accessible name: the artwork carries no text of the theme's own. */
  alt: string;
  /** False until `scripts/posters-import.mjs` has processed this slug. */
  available: boolean;
  /** `eager` for the home carousel's first two; `lazy` everywhere else. */
  loading: 'eager' | 'lazy';
}

const WEBP_SUFFIX = '.webp';

/** `<slug>.webp` at the largest width, `<slug>-{width}.webp` at every other. */
function posterSrc(photo: string, width: number, maxWidth: number): string {
  if (width === maxWidth) return photo;
  return `${photo.slice(0, -WEBP_SUFFIX.length)}-${width}${WEBP_SUFFIX}`;
}

/** The full `srcset` attribute value for `photo`'s own width family. */
function posterSrcSet(photo: string, widths: readonly number[]): string {
  const maxWidth = Math.max(...widths);
  return widths.map((width) => `${posterSrc(photo, width, maxWidth)} ${width}w`).join(', ');
}

/**
 * The four carousel/grid tiers this card actually renders at
 * (`_b2-home.scss` §17.2's own width table for the home carousel; the offers
 * grid's own 1/2/3-up tiers land inside the same range), approximated rather
 * than measured per breakpoint: `sizes` only has to be close enough to avoid
 * over-fetching, not pixel-exact.
 */
const SIZES = '(min-width: 1280px) 312px, (min-width: 1024px) 309px, (min-width: 768px) 352px, 87vw';

/**
 * One marketing poster (owner brief 2026-09-24): a portrait 4:5 image with
 * its own baked-in headline, offer and CTA, so the whole card is a `<Link>`
 * wrapping an `<img>` — no title, no line, no icon, nothing this theme draws
 * on top of the artwork. This retires the five content-derived posters
 * (a type, a goal, the branch, the advisory band) the old text-and-photo
 * treatment existed for; see docs/build/progress/S7a.md for the six that
 * replace them.
 *
 * THE DIAGONAL CORNER CUTS S3B/S4A GAVE THIS CARD ARE DROPPED HERE, not
 * reduced to a smaller tier. The owner's logo sits at the physical top-left
 * and a vertical tagline at the physical top-right of files that are not on
 * disk yet, and a `clip-path` written today cannot see where either one will
 * actually land in an image dropped in weeks from now. Cutting nothing is the
 * only choice that is provably safe for artwork this theme has not inspected.
 * Sharp corners (`border-radius: 0`) stay: S3b's own sharp-corner reset was
 * never only about the diagonal cut. The angled orange strap stays too (the
 * brief is explicit), rebuilt at the smallest lean/run pair the identity
 * ladder has (40/27, the same "small arm-foot" size `GoalCard`'s own 390
 * tier uses) since there is no clip left to size a strap against, and a
 * small corner accent is the safer bet against artwork this theme has not
 * seen: it decorates a corner rather than laying a long bar across whatever
 * the owner draws there. This is a residual, honest risk, not a solved one —
 * see the progress note for what a real file might still collide with.
 *
 * Until the owner's file lands (`available` false), the card renders the
 * same tinted plate every photo-less card in this theme falls back to, with
 * the alt text itself as a caption, never a broken-image icon: `available` is
 * a build-time fact from the content map (`scripts/posters-import.mjs` flips
 * it), not a runtime `onError` guess.
 */
export function PosterCard({ slug, photo, srcSet, to, alt, available, loading }: PosterCardProps) {
  return (
    <Link to={toInternalPath(to)} className="ox-pcard" data-testid="ox-poster-card" data-poster={slug}>
      {available ? (
        <img
          className="ox-pcard__photo"
          src={photo}
          srcSet={posterSrcSet(photo, srcSet)}
          sizes={SIZES}
          alt={alt}
          width={1125}
          height={1400}
          loading={loading}
          decoding="async"
        />
      ) : (
        <span className="ox-pcard__placeholder">
          <span className="ox-pcard__caption">{alt}</span>
        </span>
      )}
      <span className="ox-pcard__slash" aria-hidden="true" />
    </Link>
  );
}
