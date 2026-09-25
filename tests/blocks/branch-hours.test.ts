import { describe, it, expect } from 'vitest';
import {
  extractTimes,
  hoursStatus,
  parseBranchHours,
  toSchemaOpeningHours,
  todayRow,
  toWesternDigits,
} from '../../app/content/branch';

const SETTING = [
  'الأحد إلى الخميس: 09:00 - 23:00',
  'الجمعة: 16:00 - 23:00',
  'السبت: 10:00 - 23:00',
].join('\n');

describe('branch hours parsing', () => {
  it('returns nothing for an empty or unset setting', () => {
    expect(parseBranchHours(undefined)).toEqual([]);
    expect(parseBranchHours('')).toEqual([]);
    expect(parseBranchHours('   \n  ')).toEqual([]);
  });

  it('drops a line that carries neither a time pair nor a closed word', () => {
    expect(parseBranchHours('ساعات العمل\nرمضان')).toEqual([]);
  });

  it('parses a weekday range into its days and times', () => {
    const rows = parseBranchHours(SETTING);
    expect(rows).toHaveLength(3);
    expect(rows[0].label).toBe('الأحد إلى الخميس');
    expect(rows[0].days).toEqual([0, 1, 2, 3, 4]);
    expect(rows[0].from).toBe('09:00');
    expect(rows[0].to).toBe('23:00');
    expect(rows[1].days).toEqual([5]);
    expect(rows[2].days).toEqual([6]);
  });

  it('reads a closed day without inventing times', () => {
    const rows = parseBranchHours('الجمعة: مغلق');
    expect(rows[0].closed).toBe(true);
    expect(rows[0].from).toBeUndefined();
  });

  it('normalises Arabic-Indic digits and single-digit hours', () => {
    expect(toWesternDigits('٩:٠٠')).toBe('9:00');
    expect(extractTimes('من 9:00 إلى 23:30')).toEqual(['09:00', '23:30']);
  });

  it('finds the row covering a given weekday', () => {
    const rows = parseBranchHours(SETTING);
    // 2026-09-17 is a Thursday, inside the Sunday-to-Thursday row.
    expect(todayRow(rows, new Date('2026-09-17T12:00:00'))?.label).toBe('الأحد إلى الخميس');
    // 2026-09-18 is a Friday.
    expect(todayRow(rows, new Date('2026-09-18T18:00:00'))?.label).toBe('الجمعة');
  });

  it('reports open, closed and the next opening time', () => {
    const rows = parseBranchHours(SETTING);
    expect(hoursStatus(rows, new Date('2026-09-17T12:00:00')).isOpen).toBe(true);
    const early = hoursStatus(rows, new Date('2026-09-17T07:30:00'));
    expect(early.isOpen).toBe(false);
    expect(early.nextOpen).toBe('09:00');
    const late = hoursStatus(rows, new Date('2026-09-17T23:30:00'));
    expect(late.isOpen).toBe(false);
    expect(late.nextOpen).toBe('16:00');
  });

  it('compresses contiguous days into schema.org openingHours strings', () => {
    expect(toSchemaOpeningHours(parseBranchHours(SETTING))).toEqual([
      'Su-Th 09:00-23:00',
      'Fr 16:00-23:00',
      'Sa 10:00-23:00',
    ]);
  });

  it('accepts a 24:00 close as the end of the day (the store setting, Phase B J-18)', () => {
    const owner = 'السبت إلى الخميس: 9:00 إلى 24:00\nالجمعة: 16:00 إلى 24:00';
    expect(extractTimes('9:00 إلى 24:00')).toEqual(['09:00', '24:00']);
    expect(extractTimes('9:00 إلى 24:30')).toEqual(['09:00']);
    expect(extractTimes('9:00 إلى 25:00')).toEqual(['09:00']);
    const rows = parseBranchHours(owner);
    expect(rows).toHaveLength(2);
    expect(rows[0].days).toEqual([6, 0, 1, 2, 3, 4]);
    expect(rows[0].to).toBe('24:00');
    // 2026-09-17 is a Thursday: open at 23:30, closed at 08:00 with the
    // next opening at 09:00.
    expect(hoursStatus(rows, new Date('2026-09-17T23:30:00')).isOpen).toBe(true);
    const early = hoursStatus(rows, new Date('2026-09-17T08:00:00'));
    expect(early.isOpen).toBe(false);
    expect(early.nextOpen).toBe('09:00');
    expect(toSchemaOpeningHours(rows)).toEqual([
      'Sa 09:00-24:00',
      'Su-Th 09:00-24:00',
      'Fr 16:00-24:00',
    ]);
  });
});
