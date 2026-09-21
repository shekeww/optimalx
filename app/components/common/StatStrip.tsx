import type { ReactNode } from 'react';
import { Icon, type OxIconName } from './Icon';

export interface StatCellData {
  id: string;
  /** The figure. Latin text is wrapped in `<Bdi>` at the call site. */
  value?: ReactNode;
  /** Rendered instead of a value when the fact is a mark rather than a number. */
  glyph?: OxIconName;
  label: ReactNode;
  /** Second caption line. */
  sub?: ReactNode;
}

export interface StatStripProps {
  cells: StatCellData[];
  className?: string;
}

/**
 * The statistic strip: cells divided by hairlines, a figure over a two line
 * caption, no fill and no border around the row.
 *
 * `.ox-stats` is declared once in `_b3-product.scss` and is unscoped, so this
 * renders the same strip the product page does. `data-count` is the real
 * number of surviving cells, which is what the stylesheet re-spaces against:
 * the row is finished at one cell and at four, with one fewer rule.
 *
 * **Every cell must be traceable to store data, a theme setting or a content
 * map.** A figure typed to match a mockup is a claims violation, which is why
 * an empty list renders nothing at all instead of a placeholder row: the
 * default render, with every gate off, is the render the design is checked in.
 */
export function StatStrip({ cells, className }: StatStripProps) {
  if (cells.length === 0) return null;

  return (
    <ul
      className={['ox-stats', className].filter(Boolean).join(' ')}
      data-count={cells.length}
      data-testid="ox-stat-strip"
    >
      {cells.map((cell) => (
        <li className="ox-stats__cell" key={cell.id}>
          <p className="ox-stats__value">
            {cell.glyph ? (
              <Icon name={cell.glyph} size={24} className="ox-stats__glyph" />
            ) : (
              cell.value
            )}
          </p>
          <p className="ox-stats__label">
            <span className="ox-stats__label-line">{cell.label}</span>
            {cell.sub ? <span className="ox-stats__label-line">{cell.sub}</span> : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default StatStrip;
