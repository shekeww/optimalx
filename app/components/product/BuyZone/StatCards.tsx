import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Bdi } from '../../common/Bdi';
import { Icon } from '../../common/Icon';
import type { StatCell } from '../lib/stats';

export interface StatCardsProps {
  cells: StatCell[];
}

/**
 * The statistic row under the short description (design region 21): one strip
 * on the page ground, no fill and no border, cells divided by hairlines.
 *
 * Every figure is transcribed from something the product carries: the pack
 * size from the spec line or the catalogue weight, the calories and the
 * protein from the label table, the vegan cell from a real tag. A cell with no
 * source is dropped and the rest re-space equally with one fewer rule, so the
 * strip is finished at one cell or at four (B13, B14, B15).
 */
export function StatCards({ cells }: StatCardsProps) {
  const { t } = useTranslation();
  if (cells.length === 0) return null;

  return (
    <ul className="ox-stats" data-count={cells.length}>
      {cells.map((cell) => (
        <li className="ox-stats__cell" key={cell.id}>
          <p className="ox-stats__value">
            {cell.glyph ? (
              <Icon name={cell.glyph} size={24} className="ox-stats__glyph" />
            ) : (
              <Bdi>{cell.value}</Bdi>
            )}
          </p>
          <p className="ox-stats__label">
            <span className="ox-stats__label-line">{t(cell.labelKey)}</span>
            {cell.subKey ? (
              <span className="ox-stats__label-line">
                {cell.subIsLatin ? <Bdi>{t(cell.subKey)}</Bdi> : t(cell.subKey)}
              </span>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default StatCards;
