import type { ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';
import { idForSku } from '../../content/salla-ids';
import { SERVICE_PAGES, type ServicePage } from '../../content/services';

/** `Product.price` is `number | string` in the engine types. */
function priceNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export interface ServiceCompareProps {
  /** Overrides the ids resolved from the SKUs, by slug (kitchen sink, tests). */
  productIds?: Record<string, number | undefined>;
  pages?: ServicePage[];
  className?: string;
}

/**
 * The five advisory services side by side, on one scannable grid.
 *
 * The hub gives each service a full section: a heading, a lead, a statistic
 * strip, three panels and a limit line. That is the right depth for the
 * service a visitor has already chosen, and it is the wrong shape for the
 * question they arrive with, which is "which of these five do I want". They
 * had to read five sections and hold four of them in their head.
 *
 * The comparison works because the row set is identical in every column and
 * only the values move: the same four questions, asked of all five services,
 * so the difference between a written question and a video call is one line
 * of reading instead of two screens of scrolling.
 *
 * ## What each row is allowed to be
 *
 * Every value here already exists somewhere on this page. Nothing is written
 * for the table, because a sentence written to fill a comparison cell is a
 * sentence written to win a comparison:
 *
 *  - **how it works** is the service's own subline, the one its section
 *    heading carries;
 *  - **price** is read live from the product behind the service's SKU and
 *    rendered through `useMoney` (`Price`), or the shared free label at zero.
 *    No price is typed anywhere in this file. The nutrition service has no
 *    product of its own, so its price cell is empty rather than borrowed
 *    from the consultation it routes to;
 *  - **what you leave with** is the section's own `outputKey`;
 *  - **changes and cancellation** is the section's own `changeKey`.
 *
 * A service that has no value for a row gets an empty cell. Nothing is
 * filled in with "unlimited", "instant", a tick, or any of the other words a
 * comparison table usually invents, and no row is a claim about a result.
 *
 * ## Structure
 *
 * A real `<table>`, so the relationship between a column and a row is in the
 * accessibility tree rather than implied by position: column headers name the
 * service, row headers name the question. Below the width where five columns
 * fit, the table scrolls sideways with the question column pinned, which is
 * the one column a reader needs while the rest move. The scroller is native
 * scroll snap: no JavaScript runs per frame.
 *
 * Each column header links to the service's own section on this page, so the
 * table is also the fastest route into the detail.
 */
export function ServiceCompare({ productIds, pages = SERVICE_PAGES, className }: ServiceCompareProps) {
  const { t } = useTranslation();

  const ids = pages.map((page) =>
    productIds ? productIds[page.slug] : page.sku ? idForSku(page.sku) : undefined
  );
  // One hook for every column, so the count of hooks never changes with the
  // data. The three channel cards above ask for the same three products, and
  // React Query serves both from one request per id.
  const prices = useQueries({
    queries: ids.map((id) => ({
      ...product.queries.detail(String(id ?? '')),
      enabled: id !== undefined,
    })),
  });

  const amounts = prices.map((result, index) =>
    ids[index] === undefined ? undefined : priceNumber(result.data?.price)
  );

  const rows: { id: string; label: string; cell: (page: ServicePage, index: number) => ReactNode }[] = [
    {
      id: 'how',
      label: t('ox.services.compare_how'),
      cell: (page) => <>{t(page.sublineKey)}</>,
    },
    {
      id: 'price',
      label: t('ox.services.stat_price'),
      cell: (unusedPage, index) => {
        const amount = amounts[index];
        if (amount === undefined) return null;
        return amount === 0 ? (
          <span className="ox-compare__free">{t('ox.common.free')}</span>
        ) : (
          <Price amount={amount} />
        );
      },
    },
    {
      id: 'output',
      label: t('ox.services.output_title'),
      cell: (page) => (page.outputKey ? <>{t(page.outputKey)}</> : null),
    },
    {
      id: 'change',
      label: t('ox.services.stat_change'),
      cell: (page) => (page.changeKey ? <>{t(page.changeKey)}</> : null),
    },
  ];

  return (
    <section
      className={['ox-compare', className].filter(Boolean).join(' ')}
      aria-labelledby="ox-hub-compare"
      data-testid="ox-service-compare"
    >
      <h2 id="ox-hub-compare" className="ox-h2">
        {t('ox.services.compare_title')}
      </h2>

      <div className="ox-compare__scroller">
        <table className="ox-compare__table">
          {/* The section heading names the region; the table needs its own
              name, because a screen reader reaching it in table mode has
              left the heading behind. */}
          <caption className="ox-sr-only">{t('ox.services.compare_title')}</caption>
          <thead>
            <tr>
              <td className="ox-compare__corner" />
              {pages.map((page) => (
                <th key={page.slug} scope="col" className="ox-compare__head">
                  <a className="ox-compare__link" href={`#${page.slug}`}>
                    <Icon name={page.icon} size={24} className="ox-compare__icon" />
                    <span>{t(page.titleKey)}</span>
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-compare-row={row.id}>
                <th scope="row" className="ox-compare__rowhead">
                  {row.label}
                </th>
                {pages.map((page, index) => (
                  <td key={page.slug} className="ox-compare__cell">
                    {row.cell(page, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ServiceCompare;
