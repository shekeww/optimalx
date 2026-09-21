import { GOALS } from './goals';
import { CATEGORIES } from './categories';
import { BRANCH } from './branch';

/**
 * The FAQ sets two surfaces share: the home FAQ block (DIRECTION 6.2 row 10)
 * and the PDP's PrePurchaseInfo rows (DIRECTION 5.4).
 *
 * Structure and keys only. Where an answer already exists in the goal or
 * category maps, the home list REFERENCES that key rather than restating the
 * copy, so one answer is edited in one place and the FAQPage JSON-LD that B2
 * and B3 emit never carries two versions of the same sentence.
 */

export interface FaqItem {
  /** Stable id: also the deep-link fragment (`#faq-price`). */
  id: string;
  qKey: string;
  aKey: string;
  /** No control at all; the row is always open (DIRECTION 5.4, 9.2). */
  locked?: boolean;
}

const KEY = 'ox.content.faq';

/** The heading above any FAQ accordion. */
export const FAQ_TITLE_KEY = `${KEY}.home_title`;

/**
 * The one item DIRECTION 5.4 makes mandatory on the PDP and the home FAQ. Its
 * answer is a marked `TODO-copy:` placeholder until the copywriter delivers it
 * (PLAN-final 2.2); it must never name another store.
 */
export const PRICE_FAQ: FaqItem = {
  id: 'faq-price',
  qKey: `${KEY}.price_q`,
  aKey: `${KEY}.price_a`,
};

function goalFaq(slug: string, index: number, id: string): FaqItem {
  const goal = GOALS.find((candidate) => candidate.slug === slug);
  if (!goal) throw new Error(`faq.ts: unknown goal slug ${slug}`);
  const item = goal.faq[index];
  if (!item) throw new Error(`faq.ts: ${slug} has no faq item ${index}`);
  return { id, qKey: item.qKey, aKey: item.aKey };
}

function categoryFaq(slug: string, index: number, id: string): FaqItem {
  const category = CATEGORIES.find((candidate) => candidate.slug === slug);
  if (!category) throw new Error(`faq.ts: unknown category slug ${slug}`);
  const item = category.faq[index];
  if (!item) throw new Error(`faq.ts: ${slug} has no faq item ${index}`);
  return { id, qKey: item.qKey, aKey: item.aKey };
}

/**
 * Five rows on the home page, the price item first because it is the one the
 * shopper is actually weighing. The other four are the questions the catalogue
 * gets most often, reused from the pages that own the answer.
 */
export const HOME_FAQ: FaqItem[] = [
  PRICE_FAQ,
  goalFaq('goal-performance', 0, 'faq-beginner'),
  categoryFaq('protein', 1, 'faq-protein-dose'),
  categoryFaq('creatine', 0, 'faq-creatine-timing'),
  categoryFaq('protein', 2, 'faq-protein-safe'),
];

/**
 * The PDP's PrePurchaseInfo rows (DIRECTION 5.4): allergens, storage, and the
 * medical line, which is locked open and renders `ox.pdp.medical_line`, the
 * verbatim key B3 owns. A product with no allergen data drops that row rather
 * than printing the placeholder.
 */
export const PDP_INFO_ROWS: FaqItem[] = [
  { id: 'pdp-allergens', qKey: `${KEY}.pdp_allergens_q`, aKey: `${KEY}.pdp_allergens_a` },
  { id: 'pdp-storage', qKey: `${KEY}.pdp_storage_q`, aKey: `${KEY}.pdp_storage_a` },
  { id: 'pdp-warning', qKey: `${KEY}.pdp_warning_q`, aKey: 'ox.pdp.medical_line', locked: true },
];

/** The PDP FAQ base: the price item plus the owning category's three. */
export function pdpFaq(categorySlug: string | undefined): FaqItem[] {
  const category = CATEGORIES.find((candidate) => candidate.slug === categorySlug);
  if (!category) return [PRICE_FAQ];
  return [
    PRICE_FAQ,
    ...category.faq.map((item, index) => ({
      id: `faq-${category.slug}-${index + 1}`,
      qKey: item.qKey,
      aKey: item.aKey,
    })),
  ];
}

// ---------------------------------------------------------------------------
// The FAQ page groups
// ---------------------------------------------------------------------------

export interface FaqGroup {
  /** Anchor id, so the strip can deep-link the group. */
  id: string;
  titleKey: string;
  items: FaqItem[];
}

/**
 * The three groups the FAQ page is built from (DIRECTION 6.18, PLAN-final 5.3
 * "FAQ").
 *
 * Not one sentence of this is new. The service answers are the hub's four, the
 * product answers are the home five (which already reference the goal and
 * category maps rather than restating them), and the branch answers are the
 * three on `/branch`. A question is edited in one place and the FAQPage
 * structured data on every surface stays a single version of the same answer.
 *
 * Writing a fresh FAQ here would have meant writing fresh claims, which is
 * exactly what the claims source exists to stop.
 */
export const FAQ_PAGE_GROUPS: FaqGroup[] = [
  {
    id: 'faq-group-service',
    titleKey: 'ox.pages.faq.group_service',
    items: [1, 2, 3, 4].map((n) => ({
      id: `faq-service-${n}`,
      qKey: `ox.services.faq_${n}_q`,
      aKey: `ox.services.faq_${n}_a`,
    })),
  },
  {
    id: 'faq-group-products',
    titleKey: 'ox.pages.faq.group_products',
    items: HOME_FAQ,
  },
  {
    id: 'faq-group-branch',
    titleKey: 'ox.pages.faq.group_branch',
    items: BRANCH.faq.map((row, index) => ({
      id: `faq-branch-${index + 1}`,
      qKey: row.qKey,
      aKey: row.aKey,
    })),
  },
];
