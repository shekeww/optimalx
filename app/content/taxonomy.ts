import taxonomyData from './taxonomy.json';
import { categoryBySlug } from './categories';
import { goalBySlug } from './goals';
import type { OxIconName } from '../components/common/Icon';

/**
 * The one content map of the owner's 25-node taxonomy (conductor §4; PLAN-ship
 * Contract A/B): 10 type roots, 5 protein children, 4 utility categories and 6
 * goal collections. Everything the header, the drawer, `/categories` and the
 * listing head region draw from is this file plus `taxonomy.json`.
 *
 * `taxonomy.json` carries the structure (slug, scope, parent, order, SKU
 * membership) because it is read by a plain `JSON.parse` from two places that
 * are not this TypeScript module: `scripts/gen-taxonomy-fixture.mjs` (no
 * bundler) and batch S5's store-write script. This file adds the locale keys,
 * the icon and the lookup functions on top of that shape.
 *
 * Names and copy never live here (Contract A). For the fifteen categories and
 * six goals already covered in `./categories` and `./goals`, this map points
 * at their existing `h1Key`/`titleKey`/`introKey`/`faq` rather than duplicating them,
 * because that copy was already researched and written (PLAN-ship §1 item 3).
 * The four utility categories have no such entry, so their five key kinds are
 * new `ox.tax.*` keys defined here and written in `locales/partials/tax.*`.
 * Every node, covered or new, gains a `nameKey` and a `descriptionKey` under
 * `ox.tax.<key>.name` / `.description`: the short chip/nav label and the meta
 * description neither `categories.ts` nor `goals.ts` carried before.
 */

export type TaxonomyScope = 'type' | 'goal' | 'utility';

export interface TaxonomyFaqItem {
  qKey: string;
  aKey: string;
}

export interface TaxonomyNode {
  key: string;
  slug: string;
  scope: TaxonomyScope;
  parent: string | null;
  order: number;
  icon: OxIconName;
  /** Short label: nav item, drawer row, breadcrumb crumb, chip. */
  nameKey: string;
  h1Key: string;
  titleKey: string;
  descriptionKey: string;
  introKey: string;
  faq: TaxonomyFaqItem[];
  /** Catalogue SKUs in scope, parent categories carrying their children's. */
  skus: string[];
  imageSku?: string;
}

interface RawNode {
  key: string;
  slug: string;
  scope: TaxonomyScope;
  parent: string | null;
  order: number;
  skus: string[];
  image_sku?: string;
}

/**
 * The icon a utility node draws, since none of the four had a category-map
 * entry to inherit one from. Picked from the existing brand/UI sprite
 * (Icon.tsx): a request for a dedicated symbol goes through S2, not a new
 * file added here (owner-checklist, shared-file conflicts table).
 */
const UTILITY_ICON: Record<string, OxIconName> = {
  bundles: 'form',
  services: 'video-consult',
  digital_library: 'plan',
  gift_cards: 'gift',
};

const TAX_KEY = 'ox.tax';

function utilityFaq(key: string): TaxonomyFaqItem[] {
  return [1, 2, 3].map((n) => ({
    qKey: `${TAX_KEY}.${key}.faq_${n}_q`,
    aKey: `${TAX_KEY}.${key}.faq_${n}_a`,
  }));
}

/**
 * The five content key kinds for one raw node, covered nodes pointing at the
 * copy `categories.ts`/`goals.ts` already carry and the four utility nodes
 * getting a full new set under `ox.tax.<key>.*`.
 */
function contentKeysOf(node: RawNode): Pick<TaxonomyNode, 'icon' | 'h1Key' | 'titleKey' | 'introKey' | 'faq'> {
  const covered = categoryBySlug(node.slug) ?? goalBySlug(node.slug);
  if (covered) {
    return {
      icon: covered.icon,
      h1Key: covered.h1Key,
      titleKey: covered.titleKey,
      introKey: covered.introKey,
      faq: covered.faq,
    };
  }
  return {
    icon: UTILITY_ICON[node.key] ?? 'accessories',
    h1Key: `${TAX_KEY}.${node.key}.h1`,
    titleKey: `${TAX_KEY}.${node.key}.title`,
    introKey: `${TAX_KEY}.${node.key}.intro`,
    faq: utilityFaq(node.key),
  };
}

export const TAXONOMY: TaxonomyNode[] = (taxonomyData.nodes as RawNode[])
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((node) => ({
    key: node.key,
    slug: node.slug,
    scope: node.scope,
    parent: node.parent,
    order: node.order,
    nameKey: `${TAX_KEY}.${node.key}.name`,
    descriptionKey: `${TAX_KEY}.${node.key}.description`,
    skus: node.skus,
    imageSku: node.image_sku,
    ...contentKeysOf(node),
  }));

export function nodeBySlug(slug: string | undefined): TaxonomyNode | undefined {
  return TAXONOMY.find((node) => node.slug === slug);
}

/** Direct children of a node slug, in catalogue order (only `protein` has any). */
export function childrenOf(slug: string): TaxonomyNode[] {
  return TAXONOMY.filter((node) => node.parent === slug);
}

/**
 * The three menu groups the header, the drawer and `/categories` are each
 * built from: the ten type roots, the six goals, the four utility categories.
 * Protein's five children are not repeated here; a consumer reaches them
 * through `childrenOf('protein')`.
 */
export const MENU: { types: TaxonomyNode[]; goals: TaxonomyNode[]; utility: TaxonomyNode[] } = {
  types: TAXONOMY.filter((node) => node.scope === 'type' && node.parent === null),
  goals: TAXONOMY.filter((node) => node.scope === 'goal'),
  utility: TAXONOMY.filter((node) => node.scope === 'utility'),
};
