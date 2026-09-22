import type { FaqPair } from '../../components/seo/jsonld';
import { categoryBySlug } from '../../content/categories';
import { goalBySlug } from '../../content/goals';
import { nodeBySlug } from '../../content/taxonomy';
import type { TFunction } from './types';

/**
 * The FAQ rows a listing page renders, resolved through the request's own
 * `t`. One function serves both the accordion and the FAQPage node in the
 * route head, so the page and its structured data can never disagree
 * (the PDP uses the same pattern in `product/lib/faq.ts`).
 *
 * The rows come from the audited content maps only. A slug the maps do not
 * know has no FAQ, and none is written here.
 *
 * Three maps, in order: the goal map, the category map, then the taxonomy
 * (S1 step 5). The first two cover the 21 nodes that carried researched copy
 * before the ship program; the taxonomy points at those same keys for them,
 * so the order changes nothing there, and it is what gives the four utility
 * categories (bundles, services, digital library, gift cards) their rows,
 * which live under `ox.tax.<key>.faq_*` and nowhere else.
 */
export function listingFaqItems(t: TFunction | undefined, slug: string | undefined): FaqPair[] {
  if (!t || !slug) return [];
  const goal = goalBySlug(slug);
  const category = categoryBySlug(slug);
  const node = nodeBySlug(slug);
  const rows = goal?.faq ?? category?.faq ?? node?.faq ?? [];
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
