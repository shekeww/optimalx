import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Icon } from '../common/Icon';
import { toInternalPath } from '../layout/navLinks';
import { BandPhoto } from './BandPhoto';

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
 * on top of the artwork. The five content cards the old text-and-photo
 * treatment existed for (a type, two goals, the advisory, the branch) are
 * back beside these in the home rail as `ContentPosterCard` below (owner
 * item 2026-09-24, docs/build/progress/S8a.md); this card is unchanged.
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
    <Link
      to={toInternalPath(to)}
      className="ox-pcard"
      data-testid="ox-poster-card"
      data-poster={slug}
      data-kind="offer"
    >
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

export interface ContentPosterCardProps {
  /** Stable id, also the `data-poster` test hook. */
  slug: string;
  photo: string;
  /** Intrinsic pixels of `photo`, so the frame reserves its box. */
  photoWidth: number;
  photoHeight: number;
  title: string;
  line: string;
  to: string;
}

/**
 * One content card in the home rail (restored from 4657b89, owner item
 * 2026-09-24, docs/build/progress/S8a.md): the theme's own photograph low on
 * the dark ground behind a scrim, a title, one line and the angled arrow,
 * the same box as the offer poster beside it (4:5, sharp corners, the same
 * strap) so the alternating row reads as one set. Its photograph is the
 * theme's own, not artwork of unknown layout, so the diagonal cuts S7a had
 * to drop for the offer posters come back here (`.ox-pcard--content`).
 *
 * The whole card is one link; the arrow is a decorative span face (box 24,
 * glyph 16, the shared `.ox-iconbtn--angled`), never a nested button.
 * `BandPhoto` takes itself out of the tree on a failed load, leaving the
 * finished dark card, never a broken image.
 */
export function ContentPosterCard({
  slug,
  photo,
  photoWidth,
  photoHeight,
  title,
  line,
  to,
}: ContentPosterCardProps) {
  return (
    <Link
      to={toInternalPath(to)}
      className="ox-pcard ox-pcard--content"
      data-testid="ox-poster-card"
      data-poster={slug}
      data-kind="content"
    >
      <BandPhoto src={photo} className="ox-pcard__frame" width={photoWidth} height={photoHeight} />
      <span className="ox-pcard__scrim" aria-hidden="true" />
      <span className="ox-pcard__slash" aria-hidden="true" />
      <span className="ox-pcard__body">
        <span className="ox-pcard__title ox-h3">{title}</span>
        <span className="ox-pcard__line">{line}</span>
        <span className="ox-pcard__arrow ox-iconbtn--angled" aria-hidden="true">
          <Icon name="chevron-end" size={16} />
        </span>
      </span>
    </Link>
  );
}
