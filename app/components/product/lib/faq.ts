/**
 * The PDP FAQ rows, resolved once and used twice: by the accordion and by the
 * FAQPage node in the route head, so the page and the structured data can
 * never disagree (DIRECTION 5.4 Faq).
 *
 * `app/content/faq.ts` (P1a) owns the structure and the keys, including the
 * mandatory "why you may find a lower price elsewhere" item; the copy lives in
 * `ox.content.faq.*`. This module only resolves those keys through a `t`,
 * which the route head takes from `ctx.i18n` and the component from
 * `useTranslation()`.
 *
 * A row whose answer is still a `TODO-copy:` placeholder, or whose key has no
 * value at all, is dropped: an unfinished sentence must not reach a shopper,
 * and it must certainly not reach a search engine as an answer.
 */
import { PDP_INFO_ROWS, pdpFaq, type FaqItem as FaqSource } from '../../../content/faq';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Always open, no control at all: the medical line (DIRECTION 9.2). */
  locked?: boolean;
}

export type Translate = (key: string) => string;

const TODO_PREFIX = 'TODO-copy:';

/** True when `t` resolved the key to real copy rather than to itself or a stub. */
function resolved(key: string, value: string): boolean {
  return value !== key && value.length > 0 && !value.startsWith(TODO_PREFIX);
}

function translateRows(rows: readonly FaqSource[], t: Translate): FaqItem[] {
  const out: FaqItem[] = [];
  for (const row of rows) {
    const question = t(row.qKey);
    const answer = t(row.aKey);
    if (!resolved(row.qKey, question) || !resolved(row.aKey, answer)) continue;
    out.push({ id: row.id, question, answer, locked: row.locked });
  }
  return out;
}

/**
 * The slug of a category URL (`https://host/<slug>/c123` or `/<slug>/c123`),
 * which is how the content maps are keyed (PLAN-final C15: never by id).
 */
export function categorySlugOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const withoutQuery = url.split('?')[0].split('#')[0];
  const parts = withoutQuery.split('/').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  // The last segment is `c<id>`; the slug is the one before it.
  if (last.charAt(0) !== 'c') return undefined;
  const slug = parts[parts.length - 2];
  return slug && slug.indexOf(':') < 0 ? slug : undefined;
}

/** The FAQ rows for a product, in DIRECTION 5.4 order, already translated. */
export function pdpFaqItems(t: Translate | undefined, categoryUrl?: string): FaqItem[] {
  if (!t) return [];
  return translateRows(pdpFaq(categorySlugOf(categoryUrl)), t);
}

/** The key that carries the mandated medical sentence (FINAL-content 9). */
export const MEDICAL_LINE_KEY = 'ox.pdp.medical_line';

/**
 * The PrePurchaseInfo rows the content map supplies: allergens and storage.
 *
 * The medical row is deliberately NOT among them. The content map points it
 * at `ox.pdp.medical_line` too, but a row is dropped when its question key is
 * still a placeholder, and the mandated sentence may never disappear for that
 * reason. PrePurchaseInfo appends it itself, from keys this batch owns.
 */
export function prePurchaseRows(t: Translate | undefined): FaqItem[] {
  if (!t) return [];
  return translateRows(
    PDP_INFO_ROWS.filter((row) => row.aKey !== MEDICAL_LINE_KEY),
    t
  );
}
