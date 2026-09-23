/**
 * The product TYPE the card's facts line prints (owner item 2026-09-24,
 * docs/build/progress/S8a.md): one of the ten root types of the taxonomy
 * (`app/content/taxonomy.json`; the card prints its short label,
 * `ox.card.type.<key>`), or nothing.
 *
 * The listing payload does not carry `product.category` on this catalogue
 * (docs/build/progress/S5b.md §4.1), so the type is resolved from four
 * sources, first answer wins:
 *
 *  1. `product.category`, when the API carries it: its URL slug, else its
 *     name, mapped to the root type;
 *  2. the category listing the card renders in (`ListingCategoryContext`,
 *     provided by `ListingPage`): a card on a type page knows its type;
 *  3. the theme's own membership: the product's SKU (or its id, through
 *     `salla-ids.ts`) in a root type's `skus` list;
 *  4. a keyword table over the product's name, answering ONLY on an
 *     unambiguous match.
 *
 * A wrong type is worse than none: every source maps to a root type or says
 * nothing, and the keyword step says nothing whenever two types match, a
 * veto word (a bundle, an energy blend) appears, or no word matches.
 */
import { createContext } from 'react';
import type { Product, ProductCategory } from '@salla.sa/twilight-theme-engine/types';
import { SALLA_IDS, type SallaProductRef } from '../../../content/salla-ids';
import { MENU, nodeBySlug } from '../../../content/taxonomy';

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

/** Source 2: the category listing the card renders in. */
export function typeFromListing(categorySlug: string | null | undefined): ProductTypeKey | null {
  return rootTypeOfSlug(categorySlug);
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

const SKU_BY_ID: ReadonlyMap<number, string> = new Map(
  Object.entries(SALLA_IDS as Record<string, SallaProductRef>).map(([sku, ref]) => [ref.id, sku])
);

/** Source 3: the product's SKU (else its id's SKU) in a root type's own list. */
export function typeFromMembership(product: {
  id?: number | string | null;
  sku?: string | null;
}): ProductTypeKey | null {
  const sku = product.sku || SKU_BY_ID.get(Number(product.id)) || null;
  if (!sku) return null;
  const root = MENU.types.find((node) => node.skus.includes(sku));
  return root && isRootType(root.key) ? root.key : null;
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
 * Words that make any keyword answer unsafe: a bundle holds several types,
 * and an "energy" blend is filed under pre-workout by the owner while its
 * name reads amino acids (امينو انرجي). Present, the name says nothing.
 */
const VETO_WORDS: readonly string[] = ['حزمة', 'باقة', 'bundle', 'انرجي', 'energy'];

/** What follows one of these is an add-in ("... مع فيتامين ج"), not the type. */
const ADD_IN_WORDS: readonly string[] = ['مع', 'with'];

/** Attached particles a keyword may carry in front of it ("الواي", "وبروتين"). */
const PREFIXES: readonly string[] = ['', 'ال', 'و', 'وال', 'بال', 'لل'];

/** One spelling for every hamza seat, taa marbuta, alif maqsura; no marks; lower case. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A');
}

function words(text: string): string[] {
  return normalise(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

interface Phrase {
  type: ProductTypeKey | 'veto';
  words: string[];
}

const PHRASES: readonly Phrase[] = [
  ...ROOT_TYPE_KEYS.flatMap((type) => TYPE_KEYWORDS[type].map((keyword) => ({ type, words: words(keyword) }))),
  ...VETO_WORDS.map((keyword) => ({ type: 'veto' as const, words: words(keyword) })),
];

const ADD_INS: ReadonlySet<string> = new Set(ADD_IN_WORDS.map(normalise));

/** The name before its brand (" - Brand") and before any add-in ("مع ..."). */
function headWords(name: string): string[] {
  const brandCut = name.lastIndexOf(' - ');
  const head = words(brandCut > 0 ? name.slice(0, brandCut) : name);
  const addIn = head.findIndex((word) => ADD_INS.has(word));
  return addIn >= 0 ? head.slice(0, addIn) : head;
}

interface Match {
  type: Phrase['type'];
  start: number;
  end: number;
}

function matchesAt(tokens: readonly string[], at: number, phrase: Phrase): boolean {
  const first = tokens[at];
  if (!PREFIXES.some((prefix) => first === prefix + phrase.words[0])) return false;
  return phrase.words.every((word, offset) => offset === 0 || tokens[at + offset] === word);
}

/** Every phrase occurrence, minus any that sits strictly inside a longer one. */
function keywordMatches(tokens: readonly string[]): Match[] {
  const found: Match[] = [];
  for (let at = 0; at < tokens.length; at += 1) {
    for (const phrase of PHRASES) {
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

/** Source 4: the type the name alone names, only when exactly one type matches. */
export function typeFromName(name: string | null | undefined): ProductTypeKey | null {
  if (!name) return null;
  const matches = keywordMatches(headWords(name));
  if (matches.some((match) => match.type === 'veto')) return null;
  const types = new Set(matches.map((match) => match.type));
  if (types.size !== 1) return null;
  const [only] = types;
  return only !== 'veto' ? only : null;
}

/** The product's root type, from the first of the four sources that answers. */
export function productTypeOf(
  product: Pick<Product, 'name'> & {
    id?: number | string | null;
    sku?: string | null;
    category?: Pick<ProductCategory, 'name' | 'url'> | null;
  },
  context: ProductTypeContext = {}
): ProductTypeKey | null {
  return (
    typeFromCategory(product.category) ??
    typeFromListing(context.categorySlug) ??
    typeFromMembership(product) ??
    typeFromName(product.name)
  );
}
