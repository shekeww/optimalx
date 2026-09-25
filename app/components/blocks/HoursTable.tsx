import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { type HoursRow, hoursStatus, todayRow } from '../../content/branch';
import { Bdi } from '../common/Bdi';

export interface HoursTableProps {
  rows: HoursRow[];
  /**
   * The clock the "today" row and the open/closed chip are read against.
   * A prop so the branch page can pass the store's clock and tests can pin it.
   */
  now?: Date;
  /**
   * Status from the engine `useOpeningHours` when the store carries an
   * `opening_hours` record; without it the chip is computed from the parsed
   * table (PLAN-final P1b risk row).
   */
  status?: { isOpen: boolean; nextOpen?: string };
  /** Renders the prayer note under the table (FINAL-content 5.3). */
  showPrayerNote?: boolean;
  className?: string;
}

/** The weekday names, in `Date.getDay()` order, as locale keys. */
const DAY_KEYS = [
  'ox.blocks.hours.day_0',
  'ox.blocks.hours.day_1',
  'ox.blocks.hours.day_2',
  'ox.blocks.hours.day_3',
  'ox.blocks.hours.day_4',
  'ox.blocks.hours.day_5',
  'ox.blocks.hours.day_6',
] as const;

/**
 * The row's label in the page's own language (Phase B J-09, 2026-09-25):
 * a contiguous run of weekdays prints as "Saturday to Thursday" through
 * `ox.blocks.hours.day_range`, a single day by its name, and anything the
 * parser did not resolve to weekdays (a seasonal row, a list of separate
 * days) exactly as the merchant typed it. The English page used to print
 * the Arabic day words under English column heads.
 */
function rowLabel(
  row: HoursRow,
  t: (key: string, values?: Record<string, string>) => string
): string {
  const { days } = row;
  if (days.length === 0) return row.label;
  if (days.length === 1) return t(DAY_KEYS[days[0]]);
  const contiguous = days.every((day, index) => index === 0 || day === (days[index - 1] + 1) % 7);
  if (!contiguous) return row.label;
  return t('ox.blocks.hours.day_range', {
    from: t(DAY_KEYS[days[0]]),
    to: t(DAY_KEYS[days[days.length - 1]]),
  });
}

/**
 * The branch opening-hours table (DIRECTION 5.2 OxBranch, FINAL-content 5.3).
 * A real `<table>` with `th scope` (DIRECTION 9.2 "lists and tables"); today's
 * row is bold and carries the word "اليوم"; the live chip says open, closed or
 * the next opening time. The caller renders nothing at all when `rows` is
 * empty, which is the FINAL-content 5.3 rule: a default-hours record must not
 * print.
 */
export function HoursTable({ rows, now, status, showPrayerNote = true, className }: HoursTableProps) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;

  const clock = now ?? new Date();
  const today = todayRow(rows, clock);
  const live = status ?? hoursStatus(rows, clock);
  const chipLabel = live.isOpen
    ? t('ox.blocks.hours.open_now')
    : live.nextOpen
      ? t('ox.blocks.hours.opens_at', { time: live.nextOpen })
      : t('ox.blocks.hours.closed_now');
  const label = (key: string, values?: Record<string, string>): string => String(t(key, values));

  return (
    <div className={['ox-hours', className].filter(Boolean).join(' ')}>
      <div className="ox-hours__head">
        <h3 className="ox-hours__title ox-h3">{t('ox.blocks.hours.title')}</h3>
        <span
          className={`ox-hours__status ${live.isOpen ? 'is-open' : 'is-closed'}`}
          data-testid="ox-hours-status"
        >
          {chipLabel}
        </span>
      </div>
      <table className="ox-table ox-hours__table">
        <thead>
          <tr>
            <th scope="col">{t('ox.blocks.hours.day')}</th>
            <th scope="col">{t('ox.blocks.hours.from')}</th>
            <th scope="col">{t('ox.blocks.hours.to')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isToday = today !== undefined && row === today;
            return (
              <tr
                key={`${row.label}-${index}`}
                className={isToday ? 'is-today' : undefined}
                data-testid={isToday ? 'ox-hours-today' : undefined}
              >
                <th scope="row">
                  {rowLabel(row, label)}
                  {isToday ? <span className="ox-hours__today">{t('ox.blocks.hours.today')}</span> : null}
                </th>
                {row.closed || !row.from || !row.to ? (
                  <td colSpan={2}>{t('ox.blocks.hours.closed')}</td>
                ) : (
                  <>
                    <td>
                      <Bdi ltr lang={null}>
                        {row.from}
                      </Bdi>
                    </td>
                    <td>
                      <Bdi ltr lang={null}>
                        {row.to}
                      </Bdi>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {showPrayerNote ? <p className="ox-hours__note ox-small">{t('ox.blocks.hours.prayer_note')}</p> : null}
    </div>
  );
}
