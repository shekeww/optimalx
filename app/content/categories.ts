import type { OxIconName } from '../components/common/Icon';

/**
 * The fifteen type categories (FINAL-catalogue A.1, FINAL-content 3): ten root
 * categories and the five protein subcategories.
 *
 * Structure and locale keys only; no copy. Categories key by SLUG, never by id
 * (PLAN-final C15) because the store's categories do not exist yet and their
 * ids are unknown. A listing route reads `params.slug`; a link that cannot be
 * resolved to a live category falls back to a search.
 *
 * The utility categories in FINAL-catalogue A.2 (bundles, services,
 * digital-library, gift-cards) are not here: they hold non-physical product
 * types and have no editorial page of their own.
 */

export interface CategoryFaqItem {
  qKey: string;
  aKey: string;
}

/**
 * The four colours of the owner's own shaker photography (references/shakers.png,
 * sampled 2026-09-20): a strong blue, a bright lime, the translucent near-white
 * and the near-black. Four root categories carry one each on the home grid; every
 * other category draws the neutral card and carries `null`.
 *
 * The tone is a NAME, not a value. The hexes live in one place,
 * app/styles/06-ox/_b2-home.scss section 4, as `--ox-shaker-*`.
 */
export type CategoryTone = 'blue' | 'green' | 'white' | 'black';

export interface CategoryContent {
  slug: string;
  /** Parent category slug, or null for a root category. */
  parent: string | null;
  icon: OxIconName;
  /**
   * The shaker colour this category carries on the home grid, or null for the
   * neutral card. Only a ROOT category may carry one: a subcategory is never a
   * tile on the home page.
   */
  tone: CategoryTone | null;
  /** Short label: nav item, drawer row, breadcrumb crumb, chip (Contract B). */
  nameKey: string;
  h1Key: string;
  /** Meta title, verbatim from the owning keyword cluster. */
  titleKey: string;
  /** Meta description, 120 to 155 characters, answer-first (Contract B). */
  descriptionKey: string;
  /** The home needs-card subline (S2b, 2026-09-22): a claims-clean list of the product types the shelf stocks; only the eight home cards carry one. */
  cardLineKey?: string;
  /** The 60 to 90 word paragraph above the grid. */
  introKey: string;
  /** Filter chip labels, in order. A chip is a label, not a live filter id. */
  chipKeys: string[];
  faq: CategoryFaqItem[];
  /** Three guide slugs (FINAL-content 7.1) for the related-guides row. */
  relatedGuides: string[];
  /** Catalogue SKUs in scope; resolved to ids through ./salla-ids. */
  skus: string[];
}

const KEY = 'ox.content.categories';

function chips(key: string, count: number): string[] {
  return Array.from({ length: count }, (unused, index) => `${KEY}.${key}.chip_${index + 1}`);
}

function faq(key: string): CategoryFaqItem[] {
  return [1, 2, 3].map((n) => ({
    qKey: `${KEY}.${key}.faq_${n}_q`,
    aKey: `${KEY}.${key}.faq_${n}_a`,
  }));
}

function base(
  slug: string,
  key: string,
  parent: string | null,
  icon: OxIconName,
  tone: CategoryTone | null = null
) {
  return {
    slug,
    parent,
    icon,
    tone,
    // Contract B: the taxonomy's name and description keys live in the new
    // `tax.*` partial under the node's own key, never duplicated here or
    // renamed alongside it if `key` ever changes.
    nameKey: `ox.tax.${key}.name`,
    descriptionKey: `ox.tax.${key}.description`,
    h1Key: `${KEY}.${key}.h1`,
    titleKey: `${KEY}.${key}.title`,
    introKey: `${KEY}.${key}.intro`,
    faq: faq(key),
  };
}

export const CATEGORIES: CategoryContent[] = [
  {
    ...base('protein', 'protein', null, 'protein', 'blue'),
    cardLineKey: `${KEY}.protein.card_line`,
    chipKeys: chips('protein', 6),
    relatedGuides: [
      'guides/protein-dose',
      'guides/whey-vs-isolate',
      'guides/is-protein-powder-safe',
    ],
    skus: [
      'OX-001',
      'OX-002',
      'OX-003',
      'OX-004',
      'OX-005',
      'OX-006',
      'OX-007',
      'OX-008',
      'OX-009',
      'OX-010',
      'OX-011',
      'OX-012',
      'OX-013',
      'OX-014',
    ],
  },
  {
    ...base('whey-protein', 'whey_protein', 'protein', 'protein'),
    chipKeys: chips('whey_protein', 4),
    relatedGuides: ['guides/protein-timing', 'guides/protein-dose', 'guides/whey-vs-isolate'],
    skus: ['OX-001', 'OX-002', 'OX-003', 'OX-004'],
  },
  {
    ...base('whey-isolate', 'whey_isolate', 'protein', 'protein'),
    chipKeys: chips('whey_isolate', 4),
    relatedGuides: [
      'guides/whey-vs-isolate',
      'guides/protein-dose',
      'guides/is-protein-powder-safe',
    ],
    skus: ['OX-005', 'OX-006', 'OX-007', 'OX-008'],
  },
  {
    ...base('casein', 'casein', 'protein', 'protein'),
    chipKeys: chips('casein', 3),
    relatedGuides: ['guides/protein-timing', 'guides/whey-vs-isolate', 'guides/protein-dose'],
    skus: ['OX-009', 'OX-010'],
  },
  {
    ...base('plant-protein', 'plant_protein', 'protein', 'protein'),
    chipKeys: chips('plant_protein', 3),
    relatedGuides: [
      'guides/protein-dose',
      'guides/is-protein-powder-safe',
      'guides/supplements-for-beginners',
    ],
    skus: ['OX-011', 'OX-012'],
  },
  {
    ...base('mass-gainer', 'mass_gainer', 'protein', 'protein'),
    chipKeys: chips('mass_gainer', 4),
    relatedGuides: ['guides/mass-gainer-faq', 'guides/protein-dose', 'guides/protein-timing'],
    skus: ['OX-013', 'OX-014'],
  },
  {
    ...base('creatine', 'creatine', null, 'creatine', 'green'),
    cardLineKey: `${KEY}.creatine.card_line`,
    chipKeys: chips('creatine', 3),
    relatedGuides: [
      'guides/how-to-take-creatine',
      'guides/creatine-dose',
      'guides/creatine-benefits-side-effects',
    ],
    skus: ['OX-015', 'OX-016'],
  },
  {
    ...base('pre-workout', 'pre_workout', null, 'pre-workout'),
    cardLineKey: `${KEY}.pre_workout.card_line`,
    chipKeys: chips('pre_workout', 4),
    relatedGuides: [
      'guides/what-is-pre-workout',
      'guides/supplements-for-beginners',
      'guides/creatine-vs-protein',
    ],
    skus: ['OX-017', 'OX-018'],
  },
  {
    ...base('amino-acids', 'amino_acids', null, 'amino-acids'),
    cardLineKey: `${KEY}.amino_acids.card_line`,
    chipKeys: chips('amino_acids', 5),
    relatedGuides: [
      'guides/creatine-vs-protein',
      'guides/protein-dose',
      'guides/supplements-for-beginners',
    ],
    skus: ['OX-019', 'OX-020', 'OX-021'],
  },
  {
    ...base('omega-3', 'omega_3', null, 'omega-3'),
    cardLineKey: `${KEY}.omega_3.card_line`,
    chipKeys: chips('omega_3', 3),
    relatedGuides: [
      'guides/supplements-for-beginners',
      'guides/is-protein-powder-safe',
      'guides/creatine-benefits-side-effects',
    ],
    skus: ['OX-022', 'OX-023'],
  },
  {
    ...base('vitamins-minerals', 'vitamins_minerals', null, 'vitamins-minerals', 'white'),
    cardLineKey: `${KEY}.vitamins_minerals.card_line`,
    chipKeys: chips('vitamins_minerals', 5),
    relatedGuides: [
      'guides/supplements-for-beginners',
      'guides/creatine-for-women',
      'guides/is-protein-powder-safe',
    ],
    skus: ['OX-024', 'OX-025', 'OX-026', 'OX-027', 'OX-028'],
  },
  {
    ...base('collagen-beauty', 'collagen_beauty', null, 'collagen-beauty', 'black'),
    cardLineKey: `${KEY}.collagen_beauty.card_line`,
    chipKeys: chips('collagen_beauty', 4),
    relatedGuides: [
      'guides/creatine-for-women',
      'guides/supplements-for-beginners',
      'guides/is-protein-powder-safe',
    ],
    skus: ['OX-029', 'OX-030', 'OX-031', 'OX-032'],
  },
  {
    ...base('daily-health', 'daily_health', null, 'daily-health'),
    cardLineKey: `${KEY}.daily_health.card_line`,
    chipKeys: chips('daily_health', 3),
    relatedGuides: [
      'guides/supplements-for-beginners',
      'guides/creatine-benefits-side-effects',
      'guides/is-protein-powder-safe',
    ],
    skus: ['OX-033', 'OX-034', 'OX-035'],
  },
  {
    ...base('snacks-bars', 'snacks_bars', null, 'snacks-bars'),
    chipKeys: chips('snacks_bars', 4),
    relatedGuides: ['guides/protein-dose', 'guides/mass-gainer-faq', 'guides/protein-timing'],
    skus: ['OX-037', 'OX-038', 'OX-039', 'OX-040'],
  },
  {
    ...base('accessories', 'accessories', null, 'accessories'),
    chipKeys: chips('accessories', 2),
    relatedGuides: [
      'guides/creatine-dose',
      'guides/protein-dose',
      'guides/supplements-for-beginners',
    ],
    skus: ['OX-036'],
  },
];

/** The fifteen slugs, in catalogue order. */
export const CATEGORY_SLUGS: string[] = CATEGORIES.map((category) => category.slug);

/** The ten root slugs, for the "browse by type" grid. */
export const ROOT_CATEGORY_SLUGS: string[] = CATEGORIES.filter(
  (category) => category.parent === null
).map((category) => category.slug);

/**
 * The four root slugs that carry a shaker colour, in tile order: blue, green,
 * white, black.
 *
 * WHY THESE FOUR. They are the four entries this catalogue can actually stand
 * behind, read off its own shape rather than off a competitor's homepage:
 *
 *   protein            14 SKUs and five subcategories, the deepest shelf in the
 *                      store and the reason most of its guides exist.
 *   creatine           the ingredient this map points at most: five of the
 *                      twelve guide slugs it cites name creatine, where the
 *                      next highest, protein, is named by four.
 *   vitamins-minerals  5 SKUs, and the only one of the four that a shopper who
 *                      never enters a gym starts from.
 *   collagen-beauty    4 SKUs, the second non-gym entry, and the one the
 *                      creatine-for-women guide already writes toward.
 *
 * Two performance entries and two everyday-health entries. Nothing here is a
 * sales claim: no "best selling", no ranking, no figure that is not a count of
 * rows in this file.
 *
 * pre-workout and amino-acids were the near misses, and both are thinner
 * shelves (2 and 3 SKUs) aimed at the same shopper protein and creatine
 * already catch.
 */
export const SHAKER_CATEGORY_SLUGS: string[] = CATEGORIES.filter(
  (category) => category.parent === null && category.tone !== null
).map((category) => category.slug);

/**
 * The eight type roots that carry a home tile and a product rail (S2b's
 * `cardLineKey` run, `OxCategories.tsx`/`OxCategoryRail.tsx`): the ten root
 * categories minus `snacks-bars` and `accessories`, left off so the type
 * grid holds a full row at every breakpoint rather than a half-empty one.
 * The single source both `OxCategories` and the home route's default
 * composition (`defaults.ts`) read, so the two can never list a different
 * eight.
 */
export const HOME_TYPE_SLUGS: string[] = CATEGORIES.filter(
  (category) => Boolean(category.cardLineKey)
).map((category) => category.slug);

/**
 * The pastel tint each type card carries (owner restyle 2026-09-22, the
 * S2b run: seven tints plus the one black emphasis card). A NAME here, never
 * a hex: every value lives once, in `_b2-home.scss` and `_b4-listing.scss`,
 * as `--ox-need-tint-<name>`. Shared by the home grid (`OxCategories.tsx`)
 * and the `/categories` index (`CategoriesIndex.tsx`) so a slug never carries
 * two different colours on two pages. The two root slugs with no home tile
 * (`snacks-bars`, `accessories`) fall back to the neutral `ash` tint at both
 * call sites, since they were never assigned one of their own.
 */
export const HOME_TILE_TONES: Record<string, string> = {
  protein: 'peach',
  creatine: 'ash',
  'pre-workout': 'mint',
  'amino-acids': 'sand',
  'omega-3': 'sky',
  'vitamins-minerals': 'rose',
  'daily-health': 'violet',
  'collagen-beauty': 'black',
};

export function categoryBySlug(slug: string | undefined): CategoryContent | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

/** Direct children of a category slug, in catalogue order. */
export function childrenOf(slug: string): CategoryContent[] {
  return CATEGORIES.filter((category) => category.parent === slug);
}
