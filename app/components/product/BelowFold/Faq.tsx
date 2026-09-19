import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Accordion, type AccordionItem } from '../../common/Accordion';
import { SectionHeader } from '../../common/SectionHeader';
import type { FaqItem } from '../lib/faq';

export interface FaqProps {
  items: FaqItem[];
}

/**
 * The PDP FAQ (DIRECTION 5.4 Faq). The same `items` feed the FAQPage JSON-LD
 * in the route head, so the page and the structured data can never disagree.
 *
 * Row ids are `faq-1` upward, so a search result can deep link into one.
 */
export function Faq({ items }: FaqProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  const rows: AccordionItem[] = items.map((item, index) => ({
    id: 'faq-' + (index + 1),
    title: item.question,
    children: <p>{item.answer}</p>,
  }));
  return (
    <section className="ox-pdp-faq" aria-labelledby="ox-faq-title">
      <SectionHeader title={t('ox.pdp.faq')} titleId="ox-faq-title" />
      <Accordion items={rows} defaultOpen={['faq-1']} />
    </section>
  );
}
