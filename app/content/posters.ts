import { pathForSku } from './salla-ids';

/**
 * The six marketing posters (owner brief 2026-09-24): the "تصفح المزيد"/
 * "ابدأ من هنا" carousel on the home page AND the poster grid at the top of
 * `/offers` (docs/build/progress/S7a.md).
 *
 * Every poster is an IMAGE the owner supplies, not a card this theme composes
 * from copy: the artwork carries its own headline, offer and CTA baked in, so
 * this map holds structure only — where the file lives, what widths exist,
 * where the card links, and the accessible name a screen reader needs since
 * the baked text is pixels, not a DOM node (`altKey`, claims-clean, MSA,
 * never a literal in `app/`).
 *
 * `available` starts `false` on every entry: the six files are not on disk
 * yet (the owner drops them into `public/assets/posters/` later).
 * `scripts/posters-import.mjs` is the one writer of this field — it flips a
 * slug's `false` to `true` once it has processed that slug's source image,
 * by a plain string replace against this exact file, so PosterCard renders
 * the tinted plate with the alt as a caption instead of a broken image until
 * then. Do not hand-edit an `available` value; run the import script.
 */

export type PosterKind = 'offer' | 'bundle' | 'subscription';

export interface PosterCardContent {
  /** Stable id, also the `data-poster` test hook and the import script's key. */
  slug: string;
  /** The 1125-wide file `scripts/posters-import.mjs` writes. */
  photo: string;
  /** Widths available at `photo`'s own basename, smallest first. */
  srcSet: readonly number[];
  /** The default destination; a merchant field or `posterHref` may override it. */
  to: string;
  kind: PosterKind;
  altKey: string;
  /**
   * A taxonomy slug to try FIRST, through the live category list
   * (`useTaxonomyLinks`), before falling back to `to`. Only the one poster
   * with no real product to link (the Big Ramy creatine offer, until the
   * catalogue carries one) needs this; every other poster's `to` is already
   * the real destination and needs no runtime resolution.
   */
  categorySlug?: string;
  /** False until `scripts/posters-import.mjs` has processed this slug. */
  available: boolean;
}

const KEY = 'ox.posters';

export const POSTER_CARDS: PosterCardContent[] = [
  {
    slug: 'inbody-consult',
    photo: '/assets/posters/inbody-consult.webp',
    srcSet: [450, 720, 1125],
    to: pathForSku('OX-046') ?? '/services',
    kind: 'offer',
    altKey: `${KEY}.inbody_consult.alt`,
    available: false,
  },
  {
    slug: 'weekly-picks',
    photo: '/assets/posters/weekly-picks.webp',
    srcSet: [450, 720, 1125],
    to: '/offers',
    kind: 'offer',
    altKey: `${KEY}.weekly_picks.alt`,
    available: false,
  },
  {
    slug: 'bundle-her',
    photo: '/assets/posters/bundle-her.webp',
    srcSet: [450, 720, 1125],
    // No "باقة لها"/"حزمة لها" product exists in the catalogue today; the
    // starter bundle (حزمة البداية, OX-041) is the fallback the brief names.
    to: pathForSku('OX-041') ?? '/offers',
    kind: 'bundle',
    altKey: `${KEY}.bundle_her.alt`,
    available: false,
  },
  {
    slug: 'bundle-him',
    photo: '/assets/posters/bundle-him.webp',
    srcSet: [450, 720, 1125],
    // Same rule, same fallback: no "باقة له" product exists either.
    to: pathForSku('OX-041') ?? '/offers',
    kind: 'bundle',
    altKey: `${KEY}.bundle_him.alt`,
    available: false,
  },
  {
    slug: 'weight-subscription',
    photo: '/assets/posters/weight-subscription.webp',
    srcSet: [450, 720, 1125],
    // No subscription/plan product exists in the catalogue today.
    to: '/services#plans',
    kind: 'subscription',
    altKey: `${KEY}.weight_subscription.alt`,
    available: false,
  },
  {
    slug: 'bigramy-creatine',
    photo: '/assets/posters/bigramy-creatine.webp',
    srcSet: [450, 720, 1125],
    // No Big Ramy creatine product exists in the catalogue today; try the
    // creatine type category live (`categorySlug`), else this `to`.
    to: '/offers',
    kind: 'offer',
    altKey: `${KEY}.bigramy_creatine.alt`,
    categorySlug: 'creatine',
    available: false,
  },
];

/** One card's `slug` to its content, or undefined for an unknown slug. */
export function posterCardBySlug(slug: string): PosterCardContent | undefined {
  return POSTER_CARDS.find((card) => card.slug === slug);
}

export type PosterContext = 'home' | 'offers';

/** The shape `useTaxonomyLinks().bySlug()` returns, structurally. */
export interface PosterCategoryLink {
  to: string;
  resolved: boolean;
}

/**
 * The default destination for one poster, before any merchant field override
 * (PLAN: OxPosters/the offers grid both read the merchant field first, this
 * function second).
 *
 * Two cards need more than their own `to`:
 *  - `weekly-picks` points at `/offers` from the home carousel, but at its
 *    own product grid anchor when the card sits ON `/offers` already (a
 *    poster cannot usefully link to the page it is already on). The anchor
 *    is the FULL path, `/offers#offers-grid`, not a bare `#offers-grid`:
 *    `PosterCard` runs every `to` through `toInternalPath()`
 *    (`app/components/layout/navLinks.ts`), which prefixes a bare fragment
 *    with `/` (`#offers-grid` -> `/#offers-grid`) and would have pointed the
 *    card at the HOME route's own hash instead of scrolling the current page
 *    — caught live in `tests/listing/ListingPage.test.tsx`;
 *  - `bigramy-creatine` tries the live `creatine` category first (through
 *    `lookupCategory`, `useTaxonomyLinks`'s own resolver) and only falls back
 *    to its static `to` when that category has not resolved to a real Salla
 *    id yet.
 *
 * A pure function, no hook: both call sites own the hook, this owns the rule.
 */
export function posterHref(
  card: PosterCardContent,
  context: PosterContext,
  lookupCategory: (slug: string) => PosterCategoryLink | undefined
): string {
  if (card.slug === 'weekly-picks' && context === 'offers') return '/offers#offers-grid';
  if (card.categorySlug) {
    const link = lookupCategory(card.categorySlug);
    if (link?.resolved) return link.to;
  }
  return card.to;
}
