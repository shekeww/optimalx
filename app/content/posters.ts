import type { OxIconName } from '../components/common/Icon';

/**
 * The secondary posters (homepage-scale-spec section 7).
 *
 * The page's rhythm is FULL BLEED against CAROUSEL against GRID, and this is
 * the carousel that sits between the goal row and the second grid. Each card
 * is a photograph with a short line and one action: a product type, a goal, a
 * place, a channel. They are secondary on purpose, because two full stops in
 * a row cancel each other.
 *
 * Structure and locale keys only, the same contract every other content map
 * keeps: no copy lives here, so one Arabic sentence lives in one place and
 * `/en` keeps working (check:strings enforces it).
 *
 * **Every card is a fact the store can stand behind today.** A product type it
 * stocks, a goal it organises the catalogue by, the branch it actually has,
 * the advisory channel it actually runs. None of them claims a campaign, a
 * discount, a rating or a delivery time, so none of them is gated: this row
 * renders in full on the store as it exists this morning.
 *
 * The photographs are the owner's own files. `width` and `height` are the
 * intrinsic pixels of each, written down so the card reserves its box and the
 * row never shifts as the frames arrive.
 */

export interface PosterCard {
  /** Stable key, also the `data-poster` test hook. */
  id: string;
  /** Theme asset path. */
  photo: string;
  /** Intrinsic pixels of the file above. */
  width: number;
  height: number;
  eyebrowKey: string;
  titleKey: string;
  lineKey: string;
  icon: OxIconName;
  /**
   * A goal slug, resolved against the live menu the same way the goal row
   * resolves one, so a goal links to one place on the whole page.
   */
  goalSlug?: string;
  /**
   * A type-category slug, resolved against the live category list and falling
   * back to a search for its own label (PLAN-final C15). The store has zero
   * categories today, so today every one of these is the search.
   */
  categorySlug?: string;
  /** A literal route, for the cards that are not a collection. */
  to?: string;
}

const KEY = 'ox.home.poster';

export const POSTER_CARDS: PosterCard[] = [
  {
    id: 'snacks',
    photo: '/assets/images/cat-snacks.webp',
    width: 900,
    height: 900,
    eyebrowKey: `${KEY}.snacks_eyebrow`,
    titleKey: `${KEY}.snacks_title`,
    lineKey: `${KEY}.snacks_line`,
    icon: 'snacks-bars',
    categorySlug: 'snacks-bars',
  },
  {
    id: 'strength',
    photo: '/assets/images/goal-strength-w.webp',
    width: 712,
    height: 828,
    eyebrowKey: `${KEY}.strength_eyebrow`,
    titleKey: `${KEY}.strength_title`,
    lineKey: `${KEY}.strength_line`,
    icon: 'goal-performance',
    goalSlug: 'goal-performance',
  },
  {
    id: 'cardio',
    photo: '/assets/images/band-cardio.webp',
    width: 1227,
    height: 639,
    eyebrowKey: `${KEY}.cardio_eyebrow`,
    titleKey: `${KEY}.cardio_title`,
    lineKey: `${KEY}.cardio_line`,
    icon: 'goal-energy',
    goalSlug: 'goal-energy',
  },
  {
    id: 'advisory',
    photo: '/assets/images/services-band.jpg',
    width: 1440,
    height: 560,
    eyebrowKey: `${KEY}.advisory_eyebrow`,
    titleKey: `${KEY}.advisory_title`,
    lineKey: `${KEY}.advisory_line`,
    icon: 'written-question',
    to: '/services',
  },
  {
    id: 'branch',
    photo: '/assets/images/about-store.webp',
    width: 1226,
    height: 576,
    eyebrowKey: `${KEY}.branch_eyebrow`,
    titleKey: `${KEY}.branch_title`,
    lineKey: `${KEY}.branch_line`,
    icon: 'branch-visit',
    to: '/about',
  },
];
