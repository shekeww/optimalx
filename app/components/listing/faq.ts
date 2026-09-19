import type { FaqPair } from '../../components/seo/jsonld';
import { categoryBySlug } from '../../content/categories';
import { goalBySlug } from '../../content/goals';
import type { TFunction } from './types';

/**
 * The FAQ rows a listing page renders, resolved through the request's own
 * `t`. One function serves both the accordion and the FAQPage node in the
 * route head, so the page and its structured data can never disagree
 * (the PDP uses the same pattern in `product/lib/faq.ts`).
 *
 * The rows come from the audited content maps only. A slug the maps do not
 * know has no FAQ, and none is written here.
 */
export function listingFaqItems(t: TFunction | undefined, slug: string | undefined): FaqPair[] {
  if (!t || !slug) return [];
  const goal = goalBySlug(slug);
  const category = categoryBySlug(slug);
  const rows = goal?.faq ?? category?.faq ?? [];
  return rows
    .map((row) => ({ question: t(row.qKey), answer: t(row.aKey) }))
    .filter(
      (row) =>
        row.question.length > 0 &&
        row.answer.length > 0 &&
        !row.question.startsWith('ox.') &&
        !row.answer.startsWith('ox.')
    );
}
