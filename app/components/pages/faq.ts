import type { FaqPair } from '../seo/jsonld';

export interface FaqRowKeys {
  /** Deep-link fragment and accordion row id. */
  id?: string;
  qKey: string;
  aKey: string;
}

export interface ResolvedFaqRow extends FaqPair {
  id: string;
}

/** An i18next `t` narrowed to what a FAQ row needs. */
export type Translate = (key: string, values?: Record<string, unknown>) => string;

const OPEN = '{{';

/**
 * Resolves FAQ rows and drops any whose answer still carries an unresolved
 * placeholder.
 *
 * Several content answers interpolate a theme setting the owner has not
 * filled yet (`{{threshold}}` on the branch price question,
 * `{{PICKUP_HOLD_DAYS}}` on the pickup question). i18next leaves an unknown
 * placeholder in the string, so rendering the row unconditionally would print
 * the token to a shopper and, worse, publish it inside FAQPage structured
 * data. A row whose facts are not all known is simply not asked.
 */
export function resolveFaq(
  t: Translate,
  rows: readonly FaqRowKeys[],
  values: Record<string, unknown> = {}
): ResolvedFaqRow[] {
  const out: ResolvedFaqRow[] = [];
  rows.forEach((row, index) => {
    const question = t(row.qKey, values);
    const answer = t(row.aKey, values);
    if (question.includes(OPEN) || answer.includes(OPEN)) return;
    if (question === row.qKey || answer === row.aKey) return;
    out.push({ id: row.id ?? `faq-${index + 1}`, question, answer });
  });
  return out;
}
