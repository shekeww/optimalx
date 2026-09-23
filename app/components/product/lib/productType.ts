/**
 * The product TYPE the card's facts line prints (owner items 2026-09-24,
 * docs/build/progress/S8a.md and S8g.md): `productTypeOf` answers one of
 * three ways —
 *
 *   { kind: 'bundle' }                     a real Salla bundle (S8g item 3)
 *   { kind: 'type', root, child }          one of the ten root types
 *                                          (`app/content/taxonomy.json`), and
 *                                          — when the product belongs to a
 *                                          child category — that child too
 *                                          (S8g item 2)
 *   null                                    no source can say
 *
 * A bundle is `product.type === 'group_products'` (Salla's own bundle type)
 * OR a name that starts with حزمة/باقة/bundle — the S8a keyword veto for
 * those words becomes a positive answer instead of silence, and it is
 * checked FIRST, before any of the four type sources below, so a bundle
 * never also gets typed as one of its own members' types.
 *
 * The ROOT and the CHILD are each resolved the same four-source way, first
 * answer wins:
 *
 *  1. `product.category`, when the API carries it: its URL slug, else its
 *     name, mapped to the root/child;
 *  2. the category listing the card renders in (`ListingCategoryContext`,
 *     provided by `ListingPage`): a card on a type page knows its type;
 *  3. the theme's own membership: the product's SKU (or its id, through
 *     `salla-ids.ts`) in a root's or a child's own `skus` list;
 *  4. a keyword table over the product's name, answering ONLY on an
 *     unambiguous match.
 *
 * A wrong type is worse than none: every source maps to a root/child or says
 * nothing, and the keyword step says nothing whenever two types match, a
 * veto word (an energy blend filed elsewhere) appears, or no word matches.
 */
import { createContext } from 'react';
import type { Product, ProductCategory } from '@salla.sa/twilight-theme-engine/types';
import { SALLA_IDS, type SallaProductRef } from '../../../content/salla-ids';
import { MENU, TAXONOMY, nodeBySlug } from '../../../content/taxonomy';

export const ROOT_TYPE_KEYS = [
  'protein',
  'creatine',
  'pre_workout',
  'amino_acids',
  'omega_3',
  'vitamins_minerals',
  'collagen_beauty',
  'daily_health',
  'snacks_bars',
  'accessories',
] as const;

export type ProductTypeKey = (typeof ROOT_TYPE_KEYS)[number];

/**
 * A taxonomy CHILD's own key ("whey_protein", ...). Loosely typed on
 * purpose: `taxonomy.json` may grow a child under a root other than protein
 * without a code change (S8g item 2, "any other child in taxonomy.json"),
 * and every source below already reads the taxonomy data, not a hardcoded
 * union, to answer one.
 */
export type ChildTypeKey = string;

/** What `productTypeOf` answers: a real bundle, a root (with an optional child), or nothing. */
export type ProductTypeResult =
  | { kind: 'bundle' }
  | { kind: 'type'; root: ProductTypeKey; child: ChildTypeKey | null };

/**
 * The slug of the category listing a card renders in, or null outside one.
 * `ListingPage` provides it around its grid; every other surface (home
 * rails, the PDP's related rail, search) leaves it null.
 */
export const ListingCategoryContext = createContext<string | null>(null);

export interface ProductTypeContext {
  categorySlug?: string | null;
}

function isRootType(key: string): key is ProductTypeKey {
  return (ROOT_TYPE_KEYS as readonly string[]).includes(key);
}

/** A taxonomy slug to its ROOT type key; a goal, a utility or an unknown slug to null. */
function rootTypeOfSlug(slug: string | null | undefined): ProductTypeKey | null {
  const node = nodeBySlug(slug ?? undefined);
  if (!node || node.scope !== 'type') return null;
  const root = node.parent ? nodeBySlug(node.parent) : node;
  return root && isRootType(root.key) ? root.key : null;
}

/** A taxonomy slug to its own CHILD key, only when the slug itself names a child (not a root). */
function childTypeOfSlug(slug: string | null | undefined): ChildTypeKey | null {
  const node = nodeBySlug(slug ?? undefined);
  return node && node.scope === 'type' && node.parent !== null ? node.key : null;
}

/** Source 2: the category listing the card renders in. */
export function typeFromListing(categorySlug: string | null | undefined): ProductTypeKey | null {
  return rootTypeOfSlug(categorySlug);
}

/** Source 2 for the child: the same listing, only when it IS a child listing. */
export function childTypeFromListing(categorySlug: string | null | undefined): ChildTypeKey | null {
  return childTypeOfSlug(categorySlug);
}

/** Source 1: the API's own category, by a URL path segment, else by its name. */
export function typeFromCategory(
  category: Pick<ProductCategory, 'name' | 'url'> | null | undefined
): ProductTypeKey | null {
  if (!category) return null;
  const path = typeof category.url === 'string' ? category.url.replace(/^[a-z]+:\/\/[^/]+/i, '') : '';
  for (const segment of path.split('/')) {
    let decoded = segment;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      // A malformed escape is not a slug; the raw segment still gets its try.
    }
    const fromSlug = rootTypeOfSlug(decoded);
    if (fromSlug) return fromSlug;
  }
  return typeof category.name === 'string' ? typeFromName(category.name) : null;
}

/** Source 1 for the child: the same category, by URL path segment, else by its name. */
export function childTypeFromCategory(
  category: Pick<ProductCategory, 'name' | 'url'> | null | undefined
): ChildTypeKey | null {
  if (!category) return null;
  const path = typeof category.url === 'string' ? category.url.replace(/^[a-z]+:\/\/[^/]+/i, '') : '';
  for (const segment of path.split('/')) {
    let decoded = segment;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      // A malformed escape is not a slug; the raw segment still gets its try.
    }
    const fromSlug = childTypeOfSlug(decoded);
    if (fromSlug) return fromSlug;
  }
  return typeof category.name === 'string' ? childTypeFromName(category.name) : null;
}

const SKU_BY_ID: ReadonlyMap<number, string> = new Map(
  Object.entries(SALLA_IDS as Record<string, SallaProductRef>).map(([sku, ref]) => [ref.id, sku])
);

function skuOf(product: { id?: number | string | null; sku?: string | null }): string | null {
  return product.sku || SKU_BY_ID.get(Number(product.id)) || null;
}

/** Source 3: the product's SKU (else its id's SKU) in a root type's own list. */
export function typeFromMembership(product: {
  id?: number | string | null;
  sku?: string | null;
}): ProductTypeKey | null {
  const sku = skuOf(product);
  if (!sku) return null;
  const root = MENU.types.find((node) => node.skus.includes(sku));
  return root && isRootType(root.key) ? root.key : null;
}

/** Every taxonomy node one level under a root ("whey_protein" under "protein", and so on). */
const CHILD_TYPE_NODES = TAXONOMY.filter((node) => node.scope === 'type' && node.parent !== null);

/** Source 3 for the child: the product's SKU (else its id's SKU) in a child's own list. */
export function childTypeFromMembership(product: {
  id?: number | string | null;
  sku?: string | null;
}): ChildTypeKey | null {
  const sku = skuOf(product);
  if (!sku) return null;
  const node = CHILD_TYPE_NODES.find((candidate) => candidate.skus.includes(sku));
  return node ? node.key : null;
}

// ---------------------------------------------------------------------------
// Source 4: the keyword table
// ---------------------------------------------------------------------------

/**
 * Brand-neutral words and phrases per root type, Arabic and English, written
 * naturally and normalised once below. A phrase is a run of whole words, so
 * "بروتين بار" is a snack that swallows the "بروتين" inside it, while
 * "بار" never matches inside another word.
 */
const TYPE_KEYWORDS: Record<ProductTypeKey, readonly string[]> = {
  protein: ['واي', 'بروتين', 'كازين', 'ايزوليت', 'ماس جينر', 'جينر', 'whey', 'protein', 'casein', 'isolate', 'mass gainer', 'gainer'],
  creatine: ['كرياتين', 'creatine'],
  pre_workout: ['ما قبل التمرين', 'بري ورك', 'بري وورك', 'بري وركاوت', 'بري ووركاوت', 'pre workout', 'preworkout'],
  amino_acids: ['امينو', 'أحماض أمينية', 'أرجينين', 'جلوتامين', 'amino', 'bcaa', 'eaa', 'arginine', 'glutamine'],
  omega_3: ['أوميغا', 'أوميجا', 'زيت السمك', 'omega', 'fish oil'],
  vitamins_minerals: ['فيتامين', 'فيتامينات', 'معادن', 'زنك', 'مغنيسيوم', 'ماغنيسيوم', 'zma', 'multivitamin', 'vitamin', 'vitamins', 'mineral', 'minerals', 'zinc', 'magnesium'],
  collagen_beauty: ['كولاجين', 'بيوتين', 'collagen', 'biotin'],
  daily_health: ['بروبيوتيك', 'إلكتروليت', 'كلوروفيل', 'probiotic', 'probiotics', 'electrolyte', 'electrolytes', 'chlorophyll'],
  snacks_bars: ['سناك', 'سناكس', 'سناكات', 'بار', 'بروتين بار', 'تشيبس', 'بروتين تشيبس', 'زبدة', 'شوفان', 'snack', 'snacks', 'bar', 'bars', 'protein bar', 'protein bars', 'chips', 'protein chips', 'butter', 'peanut butter', 'oats'],
  accessories: ['شيكر', 'إكسسوار', 'إكسسوارات', 'shaker', 'accessory', 'accessories'],
};

/**
 * Brand-neutral words per PROTEIN CHILD (S8g item 2's own list): only the
 * words that name that one subcategory and nothing wider, so "بروتين" alone
 * (which names the whole root) is never a child keyword — a name that says
 * only "بروتين" answers at the root and stays silent at the child, which is
 * the honest answer until the SKU membership or the category names it.
 */
const CHILD_KEYWORDS: Record<string, readonly string[]> = {
  whey_protein: ['واي', 'whey'],
  whey_isolate: ['ايزوليت', 'isolate'],
  casein: ['كازين', 'casein'],
  plant_protein: ['نباتي', 'plant', 'vegan protein'],
  mass_gainer: ['ماس جينر', 'gainer'],
};

/**
 * Words that make any keyword answer unsafe: an "energy" blend is filed
 * under pre-workout by the owner while its name reads amino acids (امينو
 * انرجي). Present, the name says nothing. (A bundle name is no longer a veto
 * here — `productTypeOf` checks for one before this table ever runs, see the
 * file header.)
 */
const VETO_WORDS: readonly string[] = ['انرجي', 'energy'];

/** What follows one of these is an add-in ("... مع فيتامين ج"), not the type. */
const ADD_IN_WORDS: readonly string[] = ['مع', 'with'];

/** Attached particles a keyword may carry in front of it ("الواي", "وبروتين"). */
const PREFIXES: readonly string[] = ['', 'ال', 'و', 'وال', 'بال', 'لل'];

/** One spelling for every hamza seat, taa marbuta, alif maqsura; no marks; lower case. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

function words(text: string): string[] {
  return normalise(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

interface Phrase<T extends string> {
  type: T | 'veto';
  words: string[];
}

interface Match<T extends string> {
  type: T | 'veto';
  start: number;
  end: number;
}

function matchesAt<T extends string>(tokens: readonly string[], at: number, phrase: Phrase<T>): boolean {
  const first = tokens[at];
  if (!PREFIXES.some((prefix) => first === prefix + phrase.words[0])) return false;
  return phrase.words.every((word, offset) => offset === 0 || tokens[at + offset] === word);
}

/** Every phrase occurrence, minus any that sits strictly inside a longer one. */
function keywordMatches<T extends string>(tokens: readonly string[], phrases: readonly Phrase<T>[]): Match<T>[] {
  const found: Match<T>[] = [];
  for (let at = 0; at < tokens.length; at += 1) {
    for (const phrase of phrases) {
      if (phrase.words.length === 0 || !matchesAt(tokens, at, phrase)) continue;
      found.push({ type: phrase.type, start: at, end: at + phrase.words.length });
    }
  }
  return found.filter(
    (match) =>
      !found.some(
        (other) =>
          other.start <= match.start &&
          match.end <= other.end &&
          other.end - other.start > match.end - match.start
      )
  );
}

/** Every keyword of a type map, plus the veto words, as matchable phrases. */
function buildPhrases<T extends string>(keywordsByType: Record<T, readonly string[]>): Phrase<T>[] {
  return [
    ...(Object.keys(keywordsByType) as T[]).flatMap((type) =>
      keywordsByType[type].map((keyword) => ({ type, words: words(keyword) }))
    ),
    ...VETO_WORDS.map((keyword) => ({ type: 'veto' as const, words: words(keyword) })),
  ];
}

/** The name before its brand (" - Brand") and before any add-in ("مع ..."). */
function headWords(name: string): string[] {
  const brandCut = name.lastIndexOf(' - ');
  const head = words(brandCut > 0 ? name.slice(0, brandCut) : name);
  const addIn = head.findIndex((word) => ADD_IN_WORDS.map(normalise).includes(word));
  return addIn >= 0 ? head.slice(0, addIn) : head;
}

/** The one type a name unambiguously names: no match, two matches or a veto word all answer null. */
function uniqueKeywordType<T extends string>(name: string, phrases: readonly Phrase<T>[]): T | null {
  const matches = keywordMatches(headWords(name), phrases);
  if (matches.some((match) => match.type === 'veto')) return null;
  const types = new Set(matches.map((match) => match.type));
  if (types.size !== 1) return null;
  const [only] = types;
  return only !== 'veto' ? (only as T) : null;
}

const ROOT_PHRASES: readonly Phrase<ProductTypeKey>[] = buildPhrases(TYPE_KEYWORDS);
const CHILD_PHRASES: readonly Phrase<string>[] = buildPhrases(CHILD_KEYWORDS);

/** Source 4: the type the name alone names, only when exactly one type matches. */
export function typeFromName(name: string | null | undefined): ProductTypeKey | null {
  if (!name) return null;
  return uniqueKeywordType(name, ROOT_PHRASES);
}

/** Source 4 for the child: the same name, over the five protein-child keywords only. */
export function childTypeFromName(name: string | null | undefined): ChildTypeKey | null {
  if (!name) return null;
  return uniqueKeywordType(name, CHILD_PHRASES);
}

// ---------------------------------------------------------------------------
// The bundle check, and the two public entry points
// ---------------------------------------------------------------------------

/**
 * A bundle name only as its very first word, the same convention the
 * catalogue itself uses ("حزمة البداية", "باقة ..."). Normalised once
 * (`normalise`, not the raw literal), the same way every keyword above is,
 * so the taa marbuta in "حزمة" matches the ه the first word is normalised
 * to before the comparison ever runs.
 */
const BUNDLE_NAME_WORDS: readonly string[] = ['حزمة', 'باقة', 'bundle'].map(normalise);

/**
 * Whether a product IS a bundle (S9d): the one predicate every rail, grid and
 * listing filters on to keep a bundle out of a product list, and the same
 * check `productTypeOf` runs first, below. `type === 'group_products'`
 * Salla's own bundle type) or a name that starts with حزمة/باقة/bundle, the
 * catalogue's own convention for one the API has not flagged that way yet.
 */
export function isBundleProduct(product: { type?: string | null; name?: string | null }): boolean {
  if (product.type === 'group_products') return true;
  const [first] = words(product.name ?? '');
  return first !== undefined && BUNDLE_NAME_WORDS.includes(first);
}

/** Whether a resolved child key genuinely sits under the resolved root ("never guess wrong"). */
function childBelongsToRoot(child: ChildTypeKey, root: ProductTypeKey): boolean {
  const node = CHILD_TYPE_NODES.find((candidate) => candidate.key === child);
  const parent = node?.parent ? nodeBySlug(node.parent) : undefined;
  return parent?.key === root;
}

/**
 * The product's own child, from the first of the four sources that answers,
 * kept ONLY when it genuinely sits under the already-resolved root: a
 * category override that names a different root (a test fixture, or a
 * miscategorised product) must never pair with a child from a stale SKU or
 * name match under the OLD root.
 */
function childTypeOf(
  product: Pick<Product, 'name'> & {
    id?: number | string | null;
    sku?: string | null;
    category?: Pick<ProductCategory, 'name' | 'url'> | null;
  },
  context: ProductTypeContext,
  root: ProductTypeKey
): ChildTypeKey | null {
  const child =
    childTypeFromCategory(product.category) ??
    childTypeFromListing(context.categorySlug) ??
    childTypeFromMembership(product) ??
    childTypeFromName(product.name);
  return child !== null && childBelongsToRoot(child, root) ? child : null;
}

/**
 * The product's type: a bundle, a root (with an optional child), or nothing
 * — see the file header for the full rule.
 */
export function productTypeOf(
  product: Pick<Product, 'name'> & {
    id?: number | string | null;
    sku?: string | null;
    type?: string | null;
    category?: Pick<ProductCategory, 'name' | 'url'> | null;
  },
  context: ProductTypeContext = {}
): ProductTypeResult | null {
  if (isBundleProduct(product)) return { kind: 'bundle' };
  const root =
    typeFromCategory(product.category) ??
    typeFromListing(context.categorySlug) ??
    typeFromMembership(product) ??
    typeFromName(product.name);
  if (root === null) return null;
  return { kind: 'type', root, child: childTypeOf(product, context, root) };
}
