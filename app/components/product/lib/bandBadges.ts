/**
 * The dark band's three circular badges, and the vegan statistic cell, read
 * from the product's own tags (target-spec B16).
 *
 * A badge is a claim about the formula. It renders only when the merchant has
 * tagged the product with it in Salla; it is never inferred from the product
 * name, the brand, the category or the description, because "نباتي" inside a
 * product title is a supplier's marketing word, not a store attestation.
 *
 * The token tables below are matching data, not copy: they are the tag
 * spellings the catalogue actually uses, in both scripts.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';

export type BandBadgeId = 'vegan' | 'low_sugar' | 'gluten_free';

export interface BandBadge {
  id: BandBadgeId;
  glyph: 'vegan-leaf' | 'low-sugar' | 'gluten-free';
  labelKey: string;
  latinKey: string;
}

export const VEGAN_TOKENS = ['نباتي', 'نباتية', 'vegan', 'plant based', 'plant-based'];
export const LOW_SUGAR_TOKENS = ['منخفض السكر', 'قليل السكر', 'خالي من السكر', 'low sugar', 'sugar free', 'sugar-free'];
export const GLUTEN_FREE_TOKENS = ['خالي من الغلوتين', 'خال من الغلوتين', 'بدون غلوتين', 'gluten free', 'gluten-free'];

const BADGES: { badge: BandBadge; tokens: readonly string[] }[] = [
  {
    badge: { id: 'vegan', glyph: 'vegan-leaf', labelKey: 'ox.pdp.stat_vegan', latinKey: 'ox.pdp.stat_vegan_latin' },
    tokens: VEGAN_TOKENS,
  },
  {
    badge: {
      id: 'low_sugar',
      glyph: 'low-sugar',
      labelKey: 'ox.pdp.band_badge_low_sugar',
      latinKey: 'ox.pdp.band_badge_low_sugar_latin',
    },
    tokens: LOW_SUGAR_TOKENS,
  },
  {
    badge: {
      id: 'gluten_free',
      glyph: 'gluten-free',
      labelKey: 'ox.pdp.band_badge_gluten_free',
      latinKey: 'ox.pdp.band_badge_gluten_free_latin',
    },
    tokens: GLUTEN_FREE_TOKENS,
  },
];

/** Lower cased, with runs of whitespace collapsed, so a tag matches by shape. */
function normalise(value: string): string {
  let out = '';
  let space = false;
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charAt(i);
    if (char === ' ' || char === '\t' || char === '\n') {
      space = out.length > 0;
      continue;
    }
    if (space) {
      out += ' ';
      space = false;
    }
    out += char.toLowerCase();
  }
  return out;
}

/** True when one of the product's own tags carries one of `tokens`. */
export function hasTag(product: Pick<Product, 'tags'>, tokens: readonly string[]): boolean {
  const tags = product.tags;
  if (!Array.isArray(tags) || tags.length === 0) return false;
  for (const tag of tags) {
    const name = typeof tag?.name === 'string' ? normalise(tag.name) : '';
    if (name.length === 0) continue;
    for (const token of tokens) {
      if (name.indexOf(normalise(token)) >= 0) return true;
    }
  }
  return false;
}

/** Zero to three badges, in the design's order. */
export function bandBadges(product: Pick<Product, 'tags'>): BandBadge[] {
  const out: BandBadge[] = [];
  for (const entry of BADGES) {
    if (hasTag(product, entry.tokens)) out.push(entry.badge);
  }
  return out;
}
