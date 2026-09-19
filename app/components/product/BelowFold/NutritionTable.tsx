import { useId, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Table, TableWrap, type TableColumn } from '../../common/Table';
import { PdpIcon } from '../PdpIcon';
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
 * The third column is the glossary's plain-Arabic explanation. It is dropped
 * entirely when the glossary knows none of these nutrients, and an individual
 * cell stays empty when it knows that one: an invented explanation of a label
 * figure is the claim this page must not make.
 */
export function NutritionTable({ data, servingSize }: NutritionTableProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  if (!data || data.rows.length === 0) return null;

  const hasMeanings = data.rows.some((row) => row.meaningKey !== null);
  const hasMore = data.rows.length > VISIBLE_ROWS;
  const rows = hasMore && !open ? data.rows.slice(0, VISIBLE_ROWS) : data.rows;

  const columns: TableColumn<NutritionRow>[] = [
    {
      id: 'nutrient',
      header: t('ox.pdp.nutrition_nutrient'),
      cell: (row) => row.name,
      rowHeader: true,
    },
    {
      id: 'amount',
      header: t('ox.pdp.nutrition_per_serving'),
      cell: (row) => row.perServing,
      numeric: true,
    },
  ];
  if (hasMeanings) {
    columns.push({
      id: 'meaning',
      header: t('ox.pdp.nutrition_meaning'),
      cell: (row) => (row.meaningKey ? t(row.meaningKey) : null),
    });
  }

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
            <PdpIcon name="chevron-down" size={18} />
          </button>
        ) : null}
      </div>

      <div className="ox-nutrition__card" id={bodyId}>
        {servingSize ? (
          <p className="ox-nutrition__caption">{t('ox.card.serving_size', { size: servingSize })}</p>
        ) : null}
        <TableWrap>
          <Table<NutritionRow>
            className="ox-nutrition__table"
            caption={t('ox.pdp.nutrition_title')}
            captionHidden
            columns={columns}
            rows={rows}
            rowKey={(row) => row.name}
            scroll
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
              <PdpIcon name={open ? 'minus' : 'plus'} size={14} />
            </span>
            <span>{t(open ? 'ox.pdp.nutrition_show_less' : 'ox.pdp.nutrition_show_all')}</span>
          </button>
        ) : null}
      </div>

      <p className="ox-nutrition__note">{t('ox.pdp.label_data_note')}</p>
    </section>
  );
}
