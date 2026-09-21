import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Accordion, type AccordionItem } from '../common/Accordion';
import { SectionHeader } from '../common/SectionHeader';
import { FAQ_TITLE_KEY, HOME_FAQ, PRICE_FAQ } from '../../content/faq';
import { fieldList, rowText, type OxBlockProps } from './defaults';

/**
 * The home FAQ, the page's quiet close (homepage-scale-spec section 11).
 *
 * It used to carry a product rail in a second column, because an earlier
 * reference set one there. The rebuild moved that rail out and made it the
 * second product grid, which is its own section now: the FAQ is the last of
 * the four questions the page answers, "what if I am still not sure", and a
 * merchandising rail inside it made it neither quiet nor a close. The
 * accordion takes the full measure instead, which is also the width its rows
 * want, and the section is the one place on the page that is allowed to be
 * under 320 tall.
 *
 * Five rows, the price question first, because that is the objection a
 * shopper is actually weighing on the home page. The rows come from
 * `content/faq.ts`, which references the goal and category answers by key
 * rather than restating them, so one answer is edited in one place. The price
 * item is mandatory: a merchant who fills the `items` collection gets their
 * own rows and the price row is still prepended. Each row's id is its
 * deep-link fragment (`#faq-price`).
 */
export function OxFaq({ data }: OxBlockProps) {
  const { t } = useTranslation();

  const merchantRows = fieldList(data, 'items')
    .map((row, index) => ({
      id: `faq-custom-${index + 1}`,
      question: rowText(row, 'q'),
      answer: rowText(row, 'a'),
    }))
    .filter((row) => row.question !== '' && row.answer !== '');

  const items: AccordionItem[] =
    merchantRows.length > 0
      ? [
          {
            id: PRICE_FAQ.id,
            title: t(PRICE_FAQ.qKey),
            children: <p className="ox-faq__answer ox-body">{t(PRICE_FAQ.aKey)}</p>,
          },
          ...merchantRows.map((row) => ({
            id: row.id,
            title: row.question,
            children: <p className="ox-faq__answer ox-body">{row.answer}</p>,
          })),
        ]
      : HOME_FAQ.map((item) => ({
          id: item.id,
          title: t(item.qKey),
          children: <p className="ox-faq__answer ox-body">{t(item.aKey)}</p>,
          ...(item.locked ? { locked: true } : {}),
        }));

  return (
    <section className="ox-faq" data-testid="ox-faq">
      <div className="ox-container ox-faq__row">
        <div className="ox-faq__col">
          <SectionHeader title={t(FAQ_TITLE_KEY)} />
          {/* The panel is the design system's unit for a block of structured
              content, and an FAQ is one. On the page ground the rows read as a
              loose list; inside the panel they read as a document. */}
          <div className="ox-panel ox-faq__panel">
            <Accordion items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
