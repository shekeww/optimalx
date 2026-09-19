/**
 * The nutrition table's third column: a nutrient name printed on a label to
 * the locale key of its plain-Arabic explanation.
 *
 * `app/content/glossary.ts` (P1a) owns the thirty terms and their aliases; the
 * match runs against the TRANSLATED alias string, so it works in either
 * language. A label row whose nutrient has no term there renders an empty
 * third cell (P1a records the uncovered list: protein, carbohydrates, fat,
 * sugars, sodium, calories, caffeine, zinc and vitamin C). Nothing is ever
 * invented to fill it, which is the whole point of the column.
 */
import { glossaryForLabel } from '../../../content/glossary';
import type { GlossaryLookup } from './nutritionTable';

export type Translate = (key: string) => string;

/** A lookup bound to the active language's `t`. */
export function createGlossaryLookup(t: Translate | undefined): GlossaryLookup {
  if (!t) return () => null;
  return (nutrientName: string) => glossaryForLabel(nutrientName, t)?.defKey ?? null;
}
