/**
 * The supplement glossary: the thirty terms of FINAL-content 8 plus the eleven
 * label macronutrients B7 added, each with the MSA term, the way people
 * actually search for it, and a one-sentence definition that can be lifted
 * into the nutrition table's third column or a PDP tooltip.
 *
 * Structure and keys only. Matching a nutrient name printed on a label to a
 * term is done at runtime against the TRANSLATED aliases string, so the search
 * tokens live in the locale file with the rest of the copy and this module
 * holds no Arabic at all.
 *
 * Coverage rule (PLAN-final P1a risks): a label row whose nutrient has no term
 * here renders an EMPTY third cell. Nothing is ever invented to fill it.
 */

export interface GlossaryTerm {
  /** Stable id; also the anchor on the glossary page (`#creatine`). */
  id: string;
  termKey: string;
  /** Comma separated search aliases, Arabic and Latin, as one string. */
  aliasesKey: string;
  defKey: string;
}

const KEY = 'ox.content.glossary';

function term(id: string): GlossaryTerm {
  return {
    id,
    termKey: `${KEY}.${id}.term`,
    aliasesKey: `${KEY}.${id}.aliases`,
    defKey: `${KEY}.${id}.def`,
  };
}

/** The thirty terms, in FINAL-content 8 order. */
export const CONTENT_TERM_IDS: string[] = [
  'whey',
  'concentrate',
  'isolate',
  'hydrolysed',
  'casein',
  'plant_protein',
  'mass_gainer',
  'creatine',
  'micronised',
  'loading',
  'pre_workout',
  'stim_free',
  'beta_alanine',
  'citrulline',
  'bcaa',
  'eaa',
  'glutamine',
  'serving',
  'scoop',
  'nutrition_facts',
  'lactose',
  'omega_3',
  'probiotic',
  'vitamin_d3',
  'iu',
  'magnesium',
  'zma',
  'collagen',
  'biotin',
  'electrolytes',
];

/**
 * The macronutrient and micronutrient rows a Saudi supplement label actually
 * prints (B7). Their definitions stay at the level of the label: what the
 * number counts and what it is compared against, never what it does to the
 * body.
 */
export const LABEL_TERM_IDS: string[] = [
  'calories',
  'protein',
  'carbohydrates',
  'sugars',
  'fibre',
  'fat',
  'saturated_fat',
  'sodium',
  'caffeine',
  'zinc',
  'vitamin_c',
];

/** Every term, the FINAL-content 8 set first. */
export const GLOSSARY: GlossaryTerm[] = [...CONTENT_TERM_IDS, ...LABEL_TERM_IDS].map(term);

export const GLOSSARY_PAGE = {
  h1Key: `${KEY}.page_h1`,
  titleKey: `${KEY}.page_title`,
  columnKeys: [`${KEY}.col_term`, `${KEY}.col_aliases`, `${KEY}.col_def`],
  closingKey: `${KEY}.closing`,
} as const;

/**
 * Nutrient names a Saudi supplement label prints that DO have a term here.
 * With the B7 macronutrient set added, the third column now fills on the rows
 * every label carries, so an empty cell is the exception rather than the rule.
 */
export const LABEL_COVERED_TERM_IDS: string[] = [
  'creatine',
  'micronised',
  'bcaa',
  'eaa',
  'glutamine',
  'beta_alanine',
  'citrulline',
  'lactose',
  'omega_3',
  'probiotic',
  'vitamin_d3',
  'iu',
  'magnesium',
  'zma',
  'collagen',
  'biotin',
  'electrolytes',
  'serving',
  'scoop',
  'nutrition_facts',
  ...LABEL_TERM_IDS,
];

/**
 * Label rows this build knowingly leaves without a third-column explanation.
 * They render an empty cell; nothing is invented to fill it.
 */
export const LABEL_UNCOVERED_NUTRIENTS: string[] = [
  'potassium',
  'calcium',
  'cholesterol',
  'iron',
];

const ARABIC_COMMA = String.fromCharCode(0x060c);

/** Normalises a label cell or an alias for comparison. */
export function normaliseTerm(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function glossaryById(id: string | undefined): GlossaryTerm | undefined {
  return GLOSSARY.find((entry) => entry.id === id);
}

/**
 * Finds the term whose aliases contain `label`, using the caller's `t` so the
 * match runs against the active language. Longest alias wins, so "واي معزول"
 * is not shadowed by "واي".
 *
 * @param label  a nutrient name exactly as the label printed it
 * @param t      the `t` from `useTranslation()`
 */
export function glossaryForLabel(
  label: string,
  t: (key: string) => string
): GlossaryTerm | undefined {
  const needle = normaliseTerm(label);
  if (needle.length === 0) return undefined;
  let best: { term: GlossaryTerm; length: number } | undefined;
  for (const entry of GLOSSARY) {
    const aliases = t(entry.aliasesKey);
    if (aliases === entry.aliasesKey) continue;
    for (const raw of aliases.split(ARABIC_COMMA).flatMap((part) => part.split(','))) {
      const alias = normaliseTerm(raw);
      if (alias.length === 0) continue;
      if (needle !== alias && !needle.includes(alias)) continue;
      if (!best || alias.length > best.length) best = { term: entry, length: alias.length };
    }
  }
  return best?.term;
}
