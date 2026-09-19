import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Accordion, type AccordionItem } from '../common/Accordion';
import { SectionHeader } from '../common/SectionHeader';
import { listingFaqItems } from './faq';

export interface CategoryFaqProps {
  /** The page slug; the goal map is consulted first, then the category map. */
  slug?: string;
  /** Anchor for the FAQ heading, so the page can link to it. */
  id?: string;
  className?: string;
}

/**
 * The listing FAQ (DIRECTION 6.3 block 7 and 6.4 block 9): the three pairs the
 * content map carries for this slug, in an accordion. Absent when the map has
 * none, which is the case for every source that is not one of the fifteen
 * categories or six goals.
 *
 * The same rows feed the FAQPage node the route head emits, through
 * `listingFaqItems`.
 */
export function CategoryFaq({ slug, id = 'listing-faq', className }: CategoryFaqProps) {
  const { t } = useTranslation();
  const rows = listingFaqItems(t, slug);
  if (rows.length === 0) return null;

  const items: AccordionItem[] = rows.map((row, index) => ({
    id: `${id}-${index + 1}`,
    title: row.question,
    children: <p className="ox-body">{row.answer}</p>,
  }));

  return (
    <section className={['ox-listing__faq', className].filter(Boolean).join(' ')} aria-labelledby={`${id}-title`}>
      <SectionHeader as="h2" title={t('ox.listing.faq_title')} titleId={`${id}-title`} />
      <Accordion items={items} headingLevel="h3" />
    </section>
  );
}
