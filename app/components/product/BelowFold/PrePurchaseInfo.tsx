import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Accordion, type AccordionItem } from '../../common/Accordion';
import { SectionHeader } from '../../common/SectionHeader';
import type { FaqItem } from '../lib/faq';

export interface PrePurchaseInfoProps {
  /** Sentences from the description's "تنبيه" paragraph. */
  warning: string[];
  /** Allergens, storage and the medical line, from `app/content/faq.ts`. */
  rows?: FaqItem[];
}

/**
 * "Before you buy" (DIRECTION 5.4 PrePurchaseInfo).
 *
 * The rows are the content map's (P1a `PDP_INFO_ROWS`: allergens, storage,
 * the medical line), plus the merchant's own warning paragraph from this
 * product's description when it has one. A row whose copy is still a
 * `TODO-copy:` placeholder never reaches the page: `prePurchaseRows` drops it.
 *
 * The medical row is the honesty device: it arrives `locked`, so the
 * primitive renders it as a heading with no control at all rather than a
 * disabled one (DIRECTION 9.2), and its answer key is `ox.pdp.medical_line`,
 * whose wording changes only with the lawyer (open question Q11).
 */
export function PrePurchaseInfo({ warning, rows = [] }: PrePurchaseInfoProps) {
  const { t } = useTranslation();
  const items: AccordionItem[] = [];

  if (warning.length > 0) {
    items.push({
      id: 'pdp-label-warning',
      title: t('ox.pdp.warning'),
      children: (
        <ul className="ox-prepurchase__list">
          {warning.map((line, index) => (
            <li key={String(index) + line.slice(0, 12)}>{line}</li>
          ))}
        </ul>
      ),
    });
  }

  for (const row of rows) {
    items.push({ id: row.id, title: row.question, children: <p>{row.answer}</p> });
  }

  // Always last, always open, never droppable: the mandated medical sentence.
  items.push({
    id: 'pdp-medical',
    title: t('ox.pdp.medical_note'),
    locked: true,
    children: <p className="ox-prepurchase__medical">{t('ox.pdp.medical_line')}</p>,
  });

  return (
    <section className="ox-prepurchase" aria-labelledby="ox-prepurchase-title">
      <SectionHeader title={t('ox.pdp.before_you_buy')} titleId="ox-prepurchase-title" />
      <Accordion items={items} defaultOpen={[items[0].id]} />
    </section>
  );
}
