/**
 * Bundles and companion sets for the product page.
 *
 * ## What this file is, and what it deliberately is not
 *
 * The store has no bundles today. This map exists so the two surfaces
 * (`BelowFold/Bundle.tsx` and `BelowFold/FrequentlyBought.tsx`) can be built,
 * reviewed and seen working, and so the owner has one obvious place to define
 * a real bundle later. It is NOT a place where a price, a saving, a discount
 * or a shopping statistic is written down.
 *
 * Three rules hold it to that, and every one of them is enforced by the shape
 * of the types rather than by discipline:
 *
 * 1. **No money anywhere in this file.** A bundle is a list of catalogue SKUs.
 *    The components resolve those SKUs to live products through the engine's
 *    own product API and render every amount through `useMoney().format()`.
 *    A total is the sum of prices the store itself returned; nothing here can
 *    contribute a number to it.
 *
 * 2. **The discount is a modelled FIELD whose value is null.** `discount` is
 *    typed, so a real offer has somewhere to live and the row has somewhere to
 *    render it, and it is `null` on every entry below. A bundle therefore
 *    renders today with no saving line at all, because the store has no
 *    saving to state. Salla's own offers engine (`<SallaOffer />`, already on
 *    the page above this) stays the authority for a live promotion; this field
 *    exists for a bundle price the owner sets in the dashboard, not for a
 *    number the theme invents.
 *
 * 3. **The sample data is behind `SHOW_SAMPLE_BUNDLES`, which is `false`.**
 *    With the flag off, `bundlesForProduct` and `companionsForProduct` see
 *    only `REAL_BUNDLES` and `REAL_COMPANION_SETS`, both empty, so both
 *    surfaces render nothing and the product page looks exactly as it does
 *    today. The owner flips the flag to look at the surface, or fills the two
 *    real arrays to ship it.
 *
 * ## Why a bundle must name a Salla product
 *
 * Salla already has the concept: a bundle is a `group_products` product whose
 * `consisted_products` are its members, and the PDP for that product is a real
 * page with a real price and Salla's own add button. `BundleMembers.tsx`
 * already renders that page's contents. So a bundle here is not a parallel
 * system: it is a pointer at that product plus the list of member pages that
 * should offer it. The card's action is the bundle product's own Salla add
 * button, so the cart path is Salla's, unchanged, once.
 *
 * ## Why the companion sets say nothing about customers
 *
 * "Frequently bought together" and "customers also bought" are statements
 * about order data. This store has zero Salla orders, so it may not make them
 * (FINAL-claims-source.md). The heading the surface renders is
 * `ox.pdp.completes_with`, which describes the offer instead of claiming a
 * behaviour, and the sets below are grouped by physical complementarity that
 * anyone can check on the packaging: a powder goes in a shaker, oats and
 * peanut butter go in the same shake, creatine and whey are the two staple
 * powders of the same shelf. No set is derived from a competitor's
 * recommendations, because inferring one would be fabrication.
 */
import { idForSku, type SallaSku } from './salla-ids';

/**
 * The sample-data gate. OFF, and it ships OFF.
 *
 * A visitor must never meet an invented offer presented as real, so nothing
 * below `SAMPLE_*` reaches a storefront until someone changes this line.
 */
export const SHOW_SAMPLE_BUNDLES = false;

/**
 * A bundle discount, modelled and never filled in here.
 *
 * `kind` is the two shapes Salla's own bundle pricing takes; `value` is the
 * number the owner sets. The theme reads it, never writes it, and a `null`
 * discount renders no saving line, no percentage and no was-price.
 */
export interface BundleDiscount {
  kind: 'amount' | 'percentage';
  value: number;
}

export interface OxBundle {
  /** Stable key for React and for tests; not shown to anyone. */
  id: string;
  /** The Salla `group_products` product that IS this bundle. */
  productSku: SallaSku;
  /** What is inside it, in the order the card lists them. */
  memberSkus: SallaSku[];
  /** Which product pages offer it. Defaults to its own members. */
  showOnSkus?: SallaSku[];
  /** Null until a real bundle price exists. See rule 2 in the file header. */
  discount: BundleDiscount | null;
}

export interface CompanionSet {
  id: string;
  /** The product pages this set answers for. */
  anchorSkus: SallaSku[];
  /** What is offered beside the anchor, in display order. */
  companionSkus: SallaSku[];
}

export interface SampleOption {
  /**
   * Overrides `SHOW_SAMPLE_BUNDLES` for one call. Tests and the offline
   * preview pass it; a storefront never does.
   */
  sample?: boolean;
}

/**
 * Real bundles, owner-defined. Empty today, and that emptiness is the whole
 * point: it is what makes the surface absent on the live store.
 */
export const REAL_BUNDLES: OxBundle[] = [];

/** Real companion sets, owner-defined. Empty today, for the same reason. */
export const REAL_COMPANION_SETS: CompanionSet[] = [];

/**
 * The one sample bundle, and it is not made up: OX-041 is a real
 * `group_products` product in the catalogue, and OX-001, OX-015 and OX-028 are
 * exactly the three SKUs its `bundle_items` column lists. So the card shows a
 * bundle that genuinely exists, composed of products that genuinely exist, at
 * prices the store itself returns.
 */
const SAMPLE_BUNDLES: OxBundle[] = [
  {
    id: 'sample-starter',
    productSku: 'OX-041',
    memberSkus: ['OX-001', 'OX-015', 'OX-028'],
    discount: null,
  },
];

/**
 * Sample companion sets.
 *
 * Each one is a physical pairing, not a shopping pattern:
 *
 *   powders   a powder needs something to be mixed in (the shaker), and oats
 *             and peanut butter are the two things people put in the same
 *             shake. Nothing here says the pairing does anything to a body.
 *   creatine  whey and creatine are the two staple powders of the same shelf,
 *             and the shaker mixes both. This is the pairing the brief names.
 *   pre-workout  a drink mix and the bottle it is drunk from, plus the other
 *             tablet that dissolves in the same bottle.
 *
 * The shaker (OX-036) carries a colour option, so its row asks the shopper to
 * choose on its own page rather than joining the combined add; see the
 * component's header for why that is deliberate.
 */
const SAMPLE_COMPANION_SETS: CompanionSet[] = [
  {
    id: 'sample-powders',
    anchorSkus: [
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
    companionSkus: ['OX-036', 'OX-040', 'OX-039'],
  },
  {
    id: 'sample-creatine',
    anchorSkus: ['OX-015', 'OX-016'],
    companionSkus: ['OX-001', 'OX-036'],
  },
  {
    id: 'sample-pre-workout',
    anchorSkus: ['OX-017', 'OX-018'],
    companionSkus: ['OX-036', 'OX-034'],
  },
];

/** SKUs to live product ids, dropping any SKU the id map does not carry. */
export function idsForSkus(skus: readonly SallaSku[]): number[] {
  const out: number[] = [];
  for (const sku of skus) {
    const id = idForSku(sku);
    if (id !== undefined && !out.includes(id)) out.push(id);
  }
  return out;
}

function matchesId(sku: SallaSku, productId: number | string): boolean {
  const id = idForSku(sku);
  return id !== undefined && String(id) === String(productId);
}

/**
 * The bundles a product page may offer.
 *
 * A bundle never appears on its own page: that page is the bundle, and
 * `BundleMembers` already lists what is in it from the API's own
 * `consisted_products`.
 */
export function bundlesForProduct(
  productId: number | string,
  { sample = SHOW_SAMPLE_BUNDLES }: SampleOption = {}
): OxBundle[] {
  const pool = sample ? [...REAL_BUNDLES, ...SAMPLE_BUNDLES] : REAL_BUNDLES;
  return pool.filter((bundle) => {
    if (matchesId(bundle.productSku, productId)) return false;
    const pages = bundle.showOnSkus ?? bundle.memberSkus;
    return pages.some((sku) => matchesId(sku, productId));
  });
}

/**
 * The companion set for a product page, with the page's own product removed
 * so a set can list a SKU that is also an anchor without offering it to
 * itself. Returns null when no set answers, which is every product today.
 */
export function companionsForProduct(
  productId: number | string,
  { sample = SHOW_SAMPLE_BUNDLES }: SampleOption = {}
): CompanionSet | null {
  const pool = sample ? [...REAL_COMPANION_SETS, ...SAMPLE_COMPANION_SETS] : REAL_COMPANION_SETS;
  for (const set of pool) {
    if (!set.anchorSkus.some((sku) => matchesId(sku, productId))) continue;
    const companionSkus = set.companionSkus.filter((sku) => !matchesId(sku, productId));
    if (companionSkus.length > 0) return { ...set, companionSkus };
  }
  return null;
}
