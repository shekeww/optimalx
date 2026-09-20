import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Accordion, type AccordionItem } from '../common/Accordion';
import { SectionHeader } from '../common/SectionHeader';
import { ProductsSliderWrapper } from '../blocks/ProductsSliderWrapper';
import { FAQ_TITLE_KEY, HOME_FAQ, PRICE_FAQ } from '../../content/faq';
import { fieldList, rowText, type OxBlockProps } from './defaults';

/**
 * The home FAQ, and the secondary product rail beside it (homepage-spec
 * section 8).
 *
 * The reference sets a rail and the accordion on one row, and it is the right
 * pairing: the questions a shopper is weighing sit next to something to act
 * on, so the section ends in a product rather than in a list of caveats. The
 * rail lives inside this block rather than beside it because the engine wraps
 * every home block in its own `.s-block`, and two blocks cannot share a row.
 *
 * **The rail is honestly sourced.** It asks for `offers` first, the products
 * that actually carry a discount, and falls back to `latest` when there are
 * none, which is every day until the owner runs a campaign. The heading says
 * neither: it says "browse more", which is true of both and claims nothing
 * about price, popularity or stock. The fallback is what keeps the row from
 * collapsing under the visitor: a rail that renders its heading, finds
 * nothing and then removes itself takes the FAQ column from 40 per cent to
 * 100 per cent while someone is reading it.
 *
 * The sort is price ascending so the two rails on the page are not the same
 * eight products in the same order; the one above is newest first.
 *
 * `.ox-faq__rail:empty` still covers the last case, a store with no
 * catalogue at all, where the wrapper renders null and the accordion takes
 * the row on its own.
 *
 * Five rows, the price question first, because that is the objection a shopper
 * is actually weighing on the home page. The rows come from `content/faq.ts`,
 * which references the goal and category answers by key rather than restating
 * them, so one answer is edited in one place. The price item is mandatory: a
 * merchant who fills the `items` collection gets their own rows and the price
 * row is still prepended. Each row's id is its deep-link fragment
 * (`#faq-price`).
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
        {/* The accordion is first in the DOM, so it takes the reading
            start, which is where the reference puts it; the rail sits on the
            far side. Source order also means the questions are what a screen
            reader reaches first, and they are the reason this section
            exists. */}
        <div className="ox-faq__col">
          <SectionHeader title={t(FAQ_TITLE_KEY)} />
          {/* The panel is the design system's unit for a block of structured
              content, and an FAQ is one. On the page ground the rows read as a
              loose list; inside the panel they read as a document. */}
          <div className="ox-panel ox-faq__panel">
            <Accordion items={items} />
          </div>
        </div>
        <div className="ox-faq__rail">
          <ProductsSliderWrapper
            source="offers"
            fallbacks={[{ source: 'latest' }]}
            sort="priceFromLowToTop"
            perPage={8}
            title={t('ox.home.offers_title')}
            viewAll={{ to: '/latest-products' }}
            sliderId="ox-home-offers"
          />
        </div>
      </div>
    </section>
  );
}
