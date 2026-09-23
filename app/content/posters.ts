import { pathForSku } from './salla-ids';
import { STORE_PHOTOS } from './store-photos';

/**
 * The home carousel "اكتشف أكثر" and the offers page's poster grid.
 *
 * Two kinds of card (owner items 2026-09-24, S7a then S8a): the six offer
 * posters below, which are ALSO the poster grid at the top of `/offers`
 * (docs/build/progress/S7a.md), and the five content cards further down,
 * restored from 4657b89 (docs/build/progress/S8a.md). The home carousel
 * carries both in one rail, alternating (`HOME_CAROUSEL`).
 *
 * Every offer poster is an IMAGE the owner supplies, not a card this theme
 * composes from copy: the artwork carries its own headline, offer and CTA
 * baked in, so this map holds structure only — where the file lives, what
 * widths exist, where the card links, and the accessible name a screen reader
 * needs since the baked text is pixels, not a DOM node (`altKey`,
 * claims-clean, MSA, never a literal in `app/`).
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
    available: true,
  },
  {
    slug: 'weekly-picks',
    photo: '/assets/posters/weekly-picks.webp',
    srcSet: [450, 720, 1125],
    to: '/offers',
    kind: 'offer',
    altKey: `${KEY}.weekly_picks.alt`,
    available: true,
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
    available: true,
  },
  {
    slug: 'bundle-him',
    photo: '/assets/posters/bundle-him.webp',
    srcSet: [450, 720, 1125],
    // Same rule, same fallback: no "باقة له" product exists either.
    to: pathForSku('OX-041') ?? '/offers',
    kind: 'bundle',
    altKey: `${KEY}.bundle_him.alt`,
    available: true,
  },
  {
    slug: 'weight-subscription',
    photo: '/assets/posters/weight-subscription.webp',
    srcSet: [450, 720, 1125],
    // No subscription/plan product exists in the catalogue today.
    to: '/services#plans',
    kind: 'subscription',
    altKey: `${KEY}.weight_subscription.alt`,
    available: true,
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
    available: true,
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

/**
 * One content card (restored from 4657b89 on the owner's 2026-09-24 item,
 * S8a): a photograph of the theme's own, a title, one line and the angled
 * arrow, composed by this theme rather than baked into an image. Every card
 * is a fact the store stands behind today: a product type it stocks, a goal
 * it organises the catalogue by, the advisory it runs, the branch it has.
 * None claims a campaign, a discount, a rating or a delivery time, so none
 * is gated. Structure and locale keys only; `width`/`height` are each file's
 * intrinsic pixels, measured, so the frame reserves its box.
 */
export interface ContentCardContent {
  /** Stable id, also the `data-poster` test hook (4657b89's own ids). */
  slug: string;
  photo: string;
  width: number;
  height: number;
  titleKey: string;
  lineKey: string;
  /**
   * A type or goal slug from the taxonomy, resolved live through
   * `useTaxonomyLinks().bySlug()` (a live category, else the menu, else the
   * search for its own name), so a goal or a type links to one place on the
   * whole page.
   */
  taxonomySlug?: string;
  /** A literal route, for the cards that are not a collection. */
  to?: string;
}

const CONTENT_KEY = 'ox.home.poster';

export const CONTENT_CARDS: ContentCardContent[] = [
  {
    slug: 'snacks',
    photo: '/assets/images/cat-snacks.webp',
    width: 900,
    height: 900,
    titleKey: `${CONTENT_KEY}.snacks_title`,
    lineKey: `${CONTENT_KEY}.snacks_line`,
    taxonomySlug: 'snacks-bars',
  },
  {
    slug: 'strength',
    photo: '/assets/images/goal-strength-w.webp',
    width: 712,
    height: 828,
    titleKey: `${CONTENT_KEY}.strength_title`,
    lineKey: `${CONTENT_KEY}.strength_line`,
    taxonomySlug: 'goal-performance',
  },
  {
    slug: 'cardio',
    photo: '/assets/images/band-cardio.webp',
    width: 1227,
    height: 639,
    titleKey: `${CONTENT_KEY}.cardio_title`,
    lineKey: `${CONTENT_KEY}.cardio_line`,
    taxonomySlug: 'goal-energy',
  },
  {
    slug: 'advisory',
    photo: '/assets/images/services-band.jpg',
    width: 1580,
    height: 600,
    titleKey: `${CONTENT_KEY}.advisory_title`,
    lineKey: `${CONTENT_KEY}.advisory_line`,
    to: '/services',
  },
  {
    // The real storefront photograph (VISIT-2026-09-24 §4.1), replacing the
    // stock frame: the slot is 309 to 352px, inside the 415px source.
    slug: 'branch',
    photo: STORE_PHOTOS.storefront.photo,
    width: STORE_PHOTOS.storefront.width,
    height: STORE_PHOTOS.storefront.height,
    titleKey: `${CONTENT_KEY}.branch_title`,
    lineKey: `${CONTENT_KEY}.branch_line`,
    to: '/about',
  },
];

/** A content card's destination: its literal route, else its taxonomy link. */
export function contentHref(
  card: ContentCardContent,
  lookup: (slug: string) => PosterCategoryLink | undefined
): string {
  if (card.to) return card.to;
  const link = card.taxonomySlug ? lookup(card.taxonomySlug) : undefined;
  return link?.to ?? '/';
}

export type CarouselEntry =
  | { kind: 'offer'; card: PosterCardContent; /** 1-based, the merchant field suffix. */ offerNumber: number }
  | { kind: 'content'; card: ContentCardContent };

/**
 * Offer, content, offer, content, starting with the first offer (the InBody
 * consultation), until one list runs out; whatever is left of the other
 * follows in its own order. Six offers and five content cards give eleven
 * slides, offers at both ends.
 */
export function interleave(
  offers: readonly PosterCardContent[],
  contents: readonly ContentCardContent[]
): CarouselEntry[] {
  const out: CarouselEntry[] = [];
  const longest = Math.max(offers.length, contents.length);
  for (let i = 0; i < longest; i += 1) {
    if (i < offers.length) out.push({ kind: 'offer', card: offers[i], offerNumber: i + 1 });
    if (i < contents.length) out.push({ kind: 'content', card: contents[i] });
  }
  return out;
}

/** The home carousel's eleven slides, in order. */
export const HOME_CAROUSEL: CarouselEntry[] = interleave(POSTER_CARDS, CONTENT_CARDS);
