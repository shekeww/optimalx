/**
 * The "how to start using your product" block under the native order summary
 * on the thank-you route (FINAL-content 6.4).
 *
 * Structure and keys only. Three general steps render for every order; the
 * type-specific line is picked by the category slug of each item in the order,
 * and an order whose categories are all unknown shows the general steps alone.
 */

const KEY = 'ox.content.thankyou';

export const THANKYOU = {
  titleKey: `${KEY}.title`,
  introKey: `${KEY}.intro`,
  stepKeys: [1, 2, 3].map((n) => `${KEY}.step_${n}`),
  /** One line for every order, whatever it contains. */
  storageKey: `${KEY}.storage`,
  /** Links to the services hub. */
  closingKey: `${KEY}.closing`,
  icon: 'plan',
} as const;

/**
 * Category slug to the one line that category's items get. Several slugs share
 * a line (the three powders, the two vitamin families), which is why this is a
 * map rather than a field on `categories.ts`.
 */
export const THANKYOU_LINE_BY_CATEGORY: Record<string, string> = {
  // The parent protein category shares the powder line: an order tagged only
  // with the parent still gets a usable instruction.
  protein: `${KEY}.line_whey_protein`,
  'whey-protein': `${KEY}.line_whey_protein`,
  'whey-isolate': `${KEY}.line_whey_protein`,
  'plant-protein': `${KEY}.line_whey_protein`,
  casein: `${KEY}.line_casein`,
  'mass-gainer': `${KEY}.line_mass_gainer`,
  creatine: `${KEY}.line_creatine`,
  'pre-workout': `${KEY}.line_pre_workout`,
  'amino-acids': `${KEY}.line_amino_acids`,
  'omega-3': `${KEY}.line_vitamins`,
  'vitamins-minerals': `${KEY}.line_vitamins`,
  'collagen-beauty': `${KEY}.line_collagen_beauty`,
  'daily-health': `${KEY}.line_daily_health`,
  'snacks-bars': `${KEY}.line_snacks_bars`,
  accessories: `${KEY}.line_accessories`,
  services: `${KEY}.line_services`,
  'digital-library': `${KEY}.line_digital_library`,
};

/**
 * The lines an order earns, de-duplicated and in category order, so an order
 * with two whey products shows the whey line once.
 */
export function thankYouLines(categorySlugs: Iterable<string>): string[] {
  const out: string[] = [];
  for (const slug of categorySlugs) {
    const line = THANKYOU_LINE_BY_CATEGORY[slug];
    if (line && !out.includes(line)) out.push(line);
  }
  return out;
}
