/**
 * The card's one meta line (CARD-2026-09-23 section 3.4): servings, then the
 * pack size, joined by the theme's own divider; the dosage form when neither
 * is present; otherwise null, so the row keeps its reserved 18px empty rather
 * than guessing at a fact the product does not carry.
 *
 * No regular expressions, matching the parser this reads from (specLine.ts).
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { SpecLine } from './specLine';
import { specField, unitBearingWeight, PACK_SIZE_LABELS } from './stats';

/** A hair space each side of the divider, so the line breathes without a gap. */
export const DIVIDER =
  String.fromCharCode(0x200a) + String.fromCharCode(124) + String.fromCharCode(0x200a);

export type Translate = (key: string, vars?: Record<string, unknown>) => string;

/**
 * `cardSpecLine(product, spec, t)`: servings text, then the pack size (the
 * spec line's own field, else the product's own unit-bearing weight), joined
 * by `DIVIDER`; the dosage form when the line carries neither; else null.
 *
 * Nothing here is inferred: every piece is either the catalogue's own parsed
 * spec line or the product's own `weight` field, exactly as `stats.ts` and
 * `specLine.ts` already read them for the PDP's own chips.
 */
export function cardSpecLine(
  product: Pick<Product, 'weight'>,
  spec: SpecLine | null | undefined,
  t: Translate
): string | null {
  const servings = spec?.servings != null ? t('ox.card.servings', { n: spec.servings }) : null;
  const pack = specField(spec, PACK_SIZE_LABELS) ?? unitBearingWeight(product.weight);
  const parts = [servings, pack].filter((value): value is string => Boolean(value));
  if (parts.length > 0) return parts.join(DIVIDER);
  if (spec?.form) return spec.form;
  return null;
}
