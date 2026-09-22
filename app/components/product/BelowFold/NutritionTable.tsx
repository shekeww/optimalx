import { useId, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Table, TableWrap, type TableColumn } from '../../common/Table';
import { Icon } from '../../common/Icon';
import type { NutritionRow, NutritionTable as NutritionData } from '../lib/nutritionTable';

export interface NutritionTableProps {
  data: NutritionData | null;
  /** Serving size from the spec line, for the caption line. */
  servingSize?: string | null;
}

/** The design shows six rows; anything past that is behind the disclosure. */
export const VISIBLE_ROWS = 6;

/**
 * The nutrition panel (design region 38), the wide one at the end of the row.
 *
 * Every figure is transcribed by `lib/nutritionTable.ts` from the label the
 * merchant published. Nothing is averaged, defaulted or filled in, which is
 * exactly what the note under the table says, and a nutrient that is not on
 * this product's label has no row here (B23).
 *
 * Claims gate B22: the disclosure exists only when the label carries more
 * rows than the six the panel shows. With six or fewer there is no chevron and
 * no "show all" link, because both would open onto nothing.
 *
 * The glossary's plain-Arabic explanation rides under the nutrient name rather
 * than in a column of its own. It was a third column, and three columns do not
 * fit: the panel is one of three across the row, about 427 wide at 1440, and a
 * sentence of Arabic in its own column pushed the table's minimum width to 560
 * and put a horizontal scrollbar inside a panel. The approved image shows two
 * columns, a label at the inline start and a figure at the end, which is what
 * this now draws at every width. No explanation is lost and none is invented:
 * a nutrient the glossary does not know shows its name alone.
 */
export function NutritionTable({ data, servingSize }: NutritionTableProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  if (!data || data.rows.length === 0) return null;

  const hasMore = data.rows.length > VISIBLE_ROWS;
  const rows = hasMore && !open ? data.rows.slice(0, VISIBLE_ROWS) : data.rows;

  // The approved image gives the table one quiet header row holding the
  // per-serving basis at the inline end, over an empty label column, inside
  // the bordered card. It is the header row, not a paragraph above the table,
  // so the figures keep a column header a screen reader can announce. It is
  // never absent: without a serving size from the spec line it still has to
  // say the figures are per serving, or six bare numbers state nothing.
  //
  // The wording is the panel's own key, not the card's chip. The chip is
  // "الحصة 31 جم", which fits 24px of card but does not say what the column
  // holds; the image writes "لكل حصة (30 جم)", which does, and that is what
  // `ox.pdp.nutrition_per_serving_caption` carries.
  const basis = servingSize
    ? t('ox.pdp.nutrition_per_serving_caption', { size: servingSize })
    : t('ox.pdp.nutrition_per_serving');

  const columns: TableColumn<NutritionRow>[] = [
    {
      id: 'nutrient',
      header: <span className="ox-sr-only">{t('ox.pdp.nutrition_nutrient')}</span>,
      cell: (row) => (
        <>
          <span className="ox-nutrition__name">{row.name}</span>
          {row.meaningKey ? (
            <span className="ox-nutrition__meaning">
              <span className="ox-sr-only">{t('ox.pdp.nutrition_meaning')}</span>{' '}
              {t(row.meaningKey)}
            </span>
          ) : null}
        </>
      ),
      rowHeader: true,
    },
    {
      id: 'amount',
      header: <span className="ox-nutrition__caption">{basis}</span>,
      cell: (row) => row.perServing,
      numeric: true,
    },
  ];

  return (
    <section
      className="ox-panel ox-nutrition"
      id="ox-nutrition"
      aria-labelledby="ox-nutrition-title"
    >
      <div className="ox-panel__head">
        <h2 className="ox-panel__title" id="ox-nutrition-title">
          {t('ox.pdp.nutrition_title')}
        </h2>
        {hasMore ? (
          <button
            type="button"
            className={'ox-nutrition__disc' + (open ? ' is-open' : '')}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={t(open ? 'ox.pdp.nutrition_collapse' : 'ox.pdp.nutrition_show_all')}
          >
            <Icon name="chevron-down" size={18} />
          </button>
        ) : null}
      </div>

      <div className="ox-nutrition__card" id={bodyId}>
        <TableWrap>
          <Table<NutritionRow>
            className="ox-nutrition__table"
            caption={t('ox.pdp.nutrition_title')}
            captionHidden
            columns={columns}
            rows={rows}
            rowKey={(row) => row.name}
          />
        </TableWrap>
        {hasMore ? (
          <button
            type="button"
            className="ox-nutrition__more"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={bodyId}
          >
            <span className="ox-nutrition__more-icon" aria-hidden="true">
              <Icon name={open ? 'minus' : 'plus'} size={14} />
            </span>
            <span>{t(open ? 'ox.pdp.nutrition_show_less' : 'ox.pdp.nutrition_show_all')}</span>
          </button>
        ) : null}
      </div>

      <p className="ox-nutrition__note">{t('ox.pdp.label_data_note')}</p>
    </section>
  );
}
