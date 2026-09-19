import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';

/**
 * The table behind the branch hours, the nutrition facts, the cart totals and
 * the order details (DIRECTION 5.7 "Table"). Rules `--ox-line-2`, a 44 header
 * row on `--ox-plate-2`, 48 body rows, a 600 first column when it labels the
 * row, numbers end-aligned by column, and no zebra stripes.
 *
 * A table wider than the viewport scrolls inside `TableWrap`, which is
 * `position: relative` (DIRECTION 10.1, the G2 scroller addition) so the sticky
 * first column belongs to the scroller and not to the document.
 */

export interface TableWrapProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** The scroll container. Always wraps a `--scroll` table. */
export function TableWrap({ className, children, ...rest }: TableWrapProps) {
  return (
    <div className={['ox-table-wrap', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export interface TableColumn<Row> {
  /** Stable key; also the cell key. */
  id: string;
  header: ReactNode;
  /** The cell for one row. */
  cell: (row: Row, index: number) => ReactNode;
  /** End-aligned tabular numerals (prices, amounts, counts). */
  numeric?: boolean;
  /** Renders the cell as a `th` with `scope="row"`: the label column. */
  rowHeader?: boolean;
}

export interface TableProps<Row> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  caption?: ReactNode;
  /** Visually hidden caption; still announced. Use when a heading is above. */
  captionHidden?: boolean;
  columns: TableColumn<Row>[];
  rows: Row[];
  /** Key for a row; defaults to its index. */
  rowKey?: (row: Row, index: number) => string;
  /** Marks a row as today, current or selected (the hours table's bold row). */
  rowClassName?: (row: Row, index: number) => string | undefined;
  /** Adds the min-width and sticky first column for a table that must scroll. */
  scroll?: boolean;
  footer?: ReactNode;
}

export function Table<Row>({
  caption,
  captionHidden = false,
  columns,
  rows,
  rowKey,
  rowClassName,
  scroll = false,
  footer,
  className,
  ...rest
}: TableProps<Row>) {
  const classes = ['ox-table', scroll ? 'ox-table--scroll' : null, className]
    .filter(Boolean)
    .join(' ');
  return (
    <table className={classes} {...rest}>
      {caption ? (
        <caption className={captionHidden ? 'ox-sr-only' : undefined}>{caption}</caption>
      ) : null}
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.id}
              scope="col"
              className={column.numeric ? 'ox-table__num' : undefined}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={rowKey ? rowKey(row, index) : String(index)} className={rowClassName?.(row, index)}>
            {columns.map((column) =>
              column.rowHeader ? (
                <th key={column.id} scope="row">
                  {column.cell(row, index)}
                </th>
              ) : (
                <td key={column.id} className={column.numeric ? 'ox-table__num' : undefined}>
                  {column.cell(row, index)}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
      {footer ? <tfoot>{footer}</tfoot> : null}
    </table>
  );
}
