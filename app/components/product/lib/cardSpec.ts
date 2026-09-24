/**
 * The card's one meta line (`cardSpecLine`, reshaped again on the owner's
 * 2026-09-24 items, S8g and the card-compaction pass): "<type> · <subcategory>"
 * - the product's root TYPE label, then the CHILD's own label after it when
 * the product belongs to one (`productType.ts`, resolved by the card), for
 * a typed product; "باقة · <n> منتجات" for a real bundle, the count only
 * when the API's own member list carries one, else "باقة" alone; or, when no
 * source can type the product at all, the ONE fallback fact (the pack size,
 * else the dosage form) so the row is never empty. The servings count never
 * prints here again (S8g item 1): the PDP keeps its own servings row and
 * supply calculator.
 *
 * The description excerpt this file used to expose (`descriptionExcerpt`,
 * restored on the 2026-09-23 addendum, removed again on the owner's
 * 2026-09-24 review) is retired outright: it repeated the title on the
 * card's own screenshot and the facts line above already carries the type,
 * so a second prose line bought nothing but height. Retired along with its
 * two private helpers (`paragraphTexts`, `firstSentence`) and the
 * `sanitizeHtml`/`parseSpecLineText` imports they alone used, rather than
 * left as dead code nothing calls.
 *
 * No regular expressions, matching the parser this reads from (specLine.ts).
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { SpecLine } from './specLine';
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
 * line, in priority order -
 *
 *  1. a bundle (`typeInfo.kind === 'bundle'`): `ox.card.bundle` alone, or
 *     joined with `ox.card.bundle_count` when `bundleMemberCount` is a real,
 *     positive count the API carried (never invented when it did not);
 *  2. a typed product (`typeInfo.kind === 'type'`): the root's own
 *     `ox.card.type.<root>` label, joined with the child's
 *     `ox.card.type.<child>` label when `typeInfo.child` resolved one;
 *  3. neither: the one fallback fact, the pack size (the spec line's own
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
