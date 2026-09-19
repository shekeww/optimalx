import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../../common/SectionHeader';
import { Table, TableWrap, type TableColumn } from '../../common/Table';
import type { NutritionRow, NutritionTable as NutritionData } from '../lib/nutritionTable';

export interface NutritionTableProps {
  data: NutritionData | null;
  /** Serving size from the spec line, for the caption line. */
  servingSize?: string | null;
}

/**
 * The label's nutrition facts as our own three-column table (DIRECTION 5.4
 * NutritionTable): nutrient, amount per serving, and the plain-Arabic
 * explanation from the glossary.
 *
 * The third column is dropped entirely when the glossary knows none of the
 * nutrients on this label, and an individual cell is empty when it knows that
 * one. It is never filled with a guess: an invented explanation of a label
 * figure is exactly the claim this page must not make, which is also what the
 * note under the table says.
 *
 * `Table scroll` gives the mobile scroller its `position: relative` wrapper
 * and the sticky first column (P1a).
 */
export function NutritionTable({ data, servingSize }: NutritionTableProps) {
  const { t } = useTranslation();
  if (!data || data.rows.length === 0) return null;
  const hasMeanings = data.rows.some((row) => row.meaningKey !== null);

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
    <section className="ox-nutrition" aria-labelledby="ox-nutrition-title">
      <SectionHeader title={t('ox.pdp.nutrition_title')} titleId="ox-nutrition-title" />
      {servingSize ? (
        <p className="ox-nutrition__caption">{t('ox.card.serving_size', { size: servingSize })}</p>
      ) : null}
      <TableWrap>
        <Table<NutritionRow>
          className="ox-nutrition__table"
          caption={t('ox.pdp.nutrition_title')}
          captionHidden
          columns={columns}
          rows={data.rows}
          rowKey={(row) => row.name}
          scroll
        />
      </TableWrap>
      <p className="ox-nutrition__note">{t('ox.pdp.label_data_note')}</p>
    </section>
  );
}
