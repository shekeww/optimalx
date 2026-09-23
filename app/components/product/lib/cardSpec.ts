/**
 * The card's meta lines. Line 1 (`cardSpecLine`, reshaped again on the
 * owner's 2026-09-24 items, S8g): "<type> · <subcategory>" — the product's
 * root TYPE label, then the CHILD's own label after it when the product
 * belongs to one (`productType.ts`, resolved by the card) — for a typed
 * product; "باقة · <n> منتجات" for a real bundle, the count only when the
 * API's own member list carries one, else "باقة" alone; or, when no source
 * can type the product at all, the ONE fallback fact (the pack size, else
 * the dosage form) so the row is never empty. The servings count never
 * prints here again (S8g item 1): the PDP keeps its own servings row and
 * supply calculator, and the card's universal purchase cue is the
 * free-consultation link under the price, not a count. Line 2
 * (`descriptionExcerpt`, restored on the 2026-09-23 addendum): the first
 * sentence of the description's own prose paragraph.
 *
 * No regular expressions, matching the parser this reads from (specLine.ts).
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { parseFragment, textOf, type OxNode } from './sanitizeHtml';
import { parseSpecLineText, type SpecLine } from './specLine';
import { specField, unitBearingWeight, PACK_SIZE_LABELS } from './stats';
import type { ProductTypeResult } from './productType';

/**
 * A thin space each side of the middle dot (U+2009, U+00B7): wide enough
 * that a digit before it and a digit after it never read as one number (S8a
 * note 3), narrow enough that the line still reads as one.
 */
export const DIVIDER =
  String.fromCharCode(0x2009) + String.fromCharCode(0xb7) + String.fromCharCode(0x2009);

export type Translate = (key: string, vars?: Record<string, unknown>) => string;

/**
 * `cardSpecLine(product, spec, t, typeInfo, bundleMemberCount)`: the facts
 * line, in priority order —
 *
 *  1. a bundle (`typeInfo.kind === 'bundle'`): `ox.card.bundle` alone, or
 *     joined with `ox.card.bundle_count` when `bundleMemberCount` is a real,
 *     positive count the API carried (never invented when it did not);
 *  2. a typed product (`typeInfo.kind === 'type'`): the root's own
 *     `ox.card.type.<root>` label, joined with the child's
 *     `ox.card.type.<child>` label when `typeInfo.child` resolved one;
 *  3. neither: the one fallback fact — the pack size (the spec line's own
 *     field, else the product's own unit-bearing weight), else the dosage
 *     form; null when there is none, so the row keeps its reserved 18px
 *     empty rather than guessing at a fact the product does not carry.
 *
 * Nothing here is inferred: the type/child come from `productType.ts`, which
 * says nothing rather than guess, and the fallback fact is the parsed spec
 * line or the product's own `weight`, exactly as `stats.ts` and
 * `specLine.ts` read them for the PDP.
 */
export function cardSpecLine(
  product: Pick<Product, 'weight'>,
  spec: SpecLine | null | undefined,
  t: Translate,
  typeInfo: ProductTypeResult | null = null,
  bundleMemberCount: number | null = null
): string | null {
  if (typeInfo?.kind === 'bundle') {
    const bundleLabel = t('ox.card.bundle');
    if (bundleMemberCount !== null && bundleMemberCount > 0) {
      return bundleLabel + DIVIDER + t('ox.card.bundle_count', { n: bundleMemberCount });
    }
    return bundleLabel;
  }
  if (typeInfo?.kind === 'type') {
    const rootLabel = t(`ox.card.type.${typeInfo.root}`);
    const childLabel = typeInfo.child ? t(`ox.card.type.${typeInfo.child}`) : null;
    return childLabel ? rootLabel + DIVIDER + childLabel : rootLabel;
  }
  const pack = specField(spec, PACK_SIZE_LABELS) ?? unitBearingWeight(product.weight);
  return pack ?? spec?.form ?? null;
}

/** Every top-level `<p>` node's plain text, depth-first, in source order. */
function paragraphTexts(nodes: readonly OxNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    if (node.tag === 'p') {
      out.push(textOf(node.children));
      continue;
    }
    out.push(...paragraphTexts(node.children));
  }
  return out;
}

/**
 * The first sentence of `text` (through its first `.`, `؟` or `!`), or the
 * whole trimmed text when none of those appear. No regular expressions,
 * matching this file's own convention.
 */
function firstSentence(text: string): string {
  const PERIOD = String.fromCharCode(0x2e);
  const ARABIC_QUESTION = String.fromCharCode(0x61f);
  const BANG = String.fromCharCode(0x21);
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charAt(i);
    if (char === PERIOD || char === ARABIC_QUESTION || char === BANG) {
      return text.slice(0, i + 1).trim();
    }
  }
  return text;
}

/**
 * The description excerpt (coordinator addendum, 2026-09-23): the first
 * sentence of the description's own prose paragraph, stripped of markup.
 *
 * The catalogue's own convention (specLine.ts) puts the spec line in the
 * description's first paragraph; when that first paragraph actually parses
 * as one, the excerpt is the paragraph AFTER it — never the spec line's own
 * label/value pairs, which `cardSpecLine` already owns. When the first
 * paragraph does not parse as a spec line, it IS the prose, and is read
 * directly. Null when the description carries no prose paragraph at all;
 * nothing here invents a sentence the merchant did not write.
 */
export function descriptionExcerpt(descriptionHtml: string | null | undefined): string | null {
  const paragraphs = paragraphTexts(parseFragment(descriptionHtml));
  if (paragraphs.length === 0) return null;
  const firstIsSpecLine = parseSpecLineText(paragraphs[0]) !== null;
  const prose = (firstIsSpecLine ? paragraphs[1] : paragraphs[0]) ?? null;
  if (prose === null) return null;
  const trimmed = prose.trim();
  return trimmed.length > 0 ? firstSentence(trimmed) : null;
}
