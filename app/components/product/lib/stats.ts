/**
 * The four statistic cells under the product description (design region 21).
 *
 * Every cell is sourced from something the product itself carries. Nothing is
 * averaged, defaulted or inferred from the product name:
 *
 *   pack size  the spec line's size field, else the product's own `weight`
 *              when that carries a unit (a bare number names nothing)
 *   vegan      a real tag on the product, never the word "نباتي" in its name
 *   calories   the label table's calorie row, else the product's `calories`
 *   protein    the label table's protein row
 *
 * A cell with no source is dropped and the survivors re-space, so the row is
 * finished at one, two, three or four cells (target-spec B13 to B15).
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { NutritionTable } from './nutritionTable';
import type { SpecLine } from './specLine';
import { hasTag, VEGAN_TOKENS } from './bandBadges';

export type StatId = 'pack_size' | 'vegan' | 'calories' | 'protein';

export interface StatCell {
  id: StatId;
  /** The figure exactly as the label or the catalogue printed it. */
  value: string | null;
  /** A glyph instead of a figure (the vegan cell). */
  glyph: 'vegan-leaf' | null;
  /** First caption line. */
  labelKey: string;
  /** Second caption line, or null when the caption is one line. */
  subKey: string | null;
  /** The second line is a Latin token and is rendered inside a bidi isolate. */
  subIsLatin: boolean;
}

/** Spec-line labels that carry the package size, in the catalogue's wording. */
export const PACK_SIZE_LABELS = ['حجم العبوة', 'الحجم', 'وزن العبوة', 'الوزن'];

/** Label rows that carry the energy figure. */
export const CALORIE_LABELS = ['السعرات الحرارية', 'السعرات', 'الطاقة'];

/** Spec-line labels for the details panel's ingredients row. */
export const INGREDIENT_LABELS = ['المكونات', 'مكونات'];

/** Spec-line labels for the details panel's country of origin row. */
export const ORIGIN_LABELS = ['بلد المنشأ', 'المنشأ', 'بلد الصنع'];

/** Label rows that carry the protein figure. */
export const PROTEIN_LABELS = ['البروتين', 'بروتين'];

function trimmed(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const out = value.trim();
  return out.length > 0 ? out : null;
}

/**
 * The catalogue's own `weight`, but only when it carries its own unit.
 *
 * Salla's storefront API sends `weight` as a bare numeric string ("0.35",
 * "2.27") and sends no unit field beside it, verified against the live
 * catalogue on 2026-09-19. Printed alone that is not a fact: it is a number
 * the shopper has to guess the unit of, and sitting next to a price on a card
 * it reads as one. Naming a unit we were not given would be inventing it.
 *
 * A merchant who types the unit into the field ("907g", "2 kg", "2.27 كجم")
 * gets it rendered unchanged. A bare number is dropped, and the slot that held
 * it closes, which both the statistic strip and the card are built to survive.
 */
export function unitBearingWeight(value: string | null | undefined): string | null {
  const out = trimmed(value);
  if (out === null) return null;
  // Anything that is not a digit, a separator or Arabic-Indic digits counts as
  // a unit: a letter in either script, a percent sign, a multiplication cross.
  return /[^\s\d.,٠-٩]/u.test(out) ? out : null;
}

/** The first spec-line field whose label is one of `labels`. */
export function specField(spec: SpecLine | null | undefined, labels: readonly string[]): string | null {
  if (!spec) return null;
  for (const field of spec.fields) {
    if (labels.indexOf(field.label) >= 0) return trimmed(field.value);
  }
  return null;
}

/** The first nutrition row whose name starts with one of `labels`. */
export function nutritionValue(
  table: NutritionTable | null | undefined,
  labels: readonly string[]
): string | null {
  if (!table) return null;
  for (const row of table.rows) {
    for (const label of labels) {
      if (row.name.indexOf(label) === 0) return trimmed(row.perServing);
    }
  }
  return null;
}

export interface StatSources {
  product: Product;
  spec: SpecLine | null | undefined;
  nutrition: NutritionTable | null | undefined;
}

/**
 * The cells this product can actually fill, in the design's order (the first
 * cell sits at the inline start, which is the right in Arabic).
 */
export function statCells({ product, spec, nutrition }: StatSources): StatCell[] {
  const cells: StatCell[] = [];

  const packSize = specField(spec, PACK_SIZE_LABELS) ?? unitBearingWeight(product.weight);
  if (packSize) {
    cells.push({
      id: 'pack_size',
      value: packSize,
      glyph: null,
      labelKey: 'ox.pdp.stat_pack_size',
      subKey: null,
      subIsLatin: false,
    });
  }

  if (hasTag(product, VEGAN_TOKENS)) {
    cells.push({
      id: 'vegan',
      value: null,
      glyph: 'vegan-leaf',
      labelKey: 'ox.pdp.stat_vegan',
      subKey: 'ox.pdp.stat_vegan_latin',
      subIsLatin: true,
    });
  }

  const calories =
    nutritionValue(nutrition, CALORIE_LABELS) ??
    (typeof product.calories === 'number' && Number.isFinite(product.calories) && product.calories > 0
      ? String(product.calories)
      : null);
  if (calories) {
    cells.push({
      id: 'calories',
      value: calories,
      glyph: null,
      labelKey: 'ox.pdp.stat_calories',
      subKey: 'ox.pdp.stat_per_serving',
      subIsLatin: false,
    });
  }

  const protein = nutritionValue(nutrition, PROTEIN_LABELS);
  if (protein) {
    cells.push({
      id: 'protein',
      value: protein,
      glyph: null,
      labelKey: 'ox.pdp.stat_protein',
      subKey: 'ox.pdp.stat_per_serving',
      subIsLatin: false,
    });
  }

  return cells;
}
