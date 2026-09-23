/**
 * The Al Khalidiyah branch in Madinah (FINAL-content 5, FINAL-claims-source 6).
 *
 * Structure, settings bindings and parsing only: every string a branch surface
 * renders is a `t('ox.content.branch.*')` key. The address, the hours, the map
 * link, the landmark and the two pickup numbers all come from theme settings
 * (twilight.json), never from copy, so a store that has not filled them prints
 * nothing rather than a placeholder.
 *
 * The Arabic tokens below are parser input for the `branch_hours` textarea, not
 * copy, and carry the `ox-allow: arabic-literal` pragma for `check:strings`.
 *
 * This file is the home of the hours parser that
 * `app/components/blocks/contentFallback.ts` was standing in for; the shapes
 * and function names are identical so the blocks can switch their import.
 */

/** JS `Date.getDay()` order: 0 Sunday to 6 Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HoursRow {
  /** The label exactly as the merchant typed it. */
  label: string;
  /** Weekdays the row covers; empty for a seasonal row such as Ramadan. */
  days: Weekday[];
  /** 24h "HH:MM"; absent on a closed row. */
  from?: string;
  to?: string;
  closed: boolean;
}

export interface HoursStatus {
  isOpen: boolean;
  /** "HH:MM" of the next opening, when one is known. */
  nextOpen?: string;
}

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;

/** Arabic-Indic and extended Arabic-Indic digits to Western digits. */
export function toWesternDigits(input: string): string {
  let out = '';
  for (const char of input) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      out += String(code - ARABIC_INDIC_ZERO);
    } else if (code >= EXTENDED_ARABIC_INDIC_ZERO && code <= EXTENDED_ARABIC_INDIC_ZERO + 9) {
      out += String(code - EXTENDED_ARABIC_INDIC_ZERO);
    } else {
      out += char;
    }
  }
  return out;
}

const DAY_TOKENS: Array<{ day: Weekday; tokens: string[] }> = [
  { day: 0, tokens: ['الاحد', 'الأحد', 'احد', 'sunday', 'sun'] }, // ox-allow: arabic-literal parser tokens
  { day: 1, tokens: ['الاثنين', 'الإثنين', 'اثنين', 'monday', 'mon'] }, // ox-allow: arabic-literal parser tokens
  { day: 2, tokens: ['الثلاثاء', 'ثلاثاء', 'tuesday', 'tue'] }, // ox-allow: arabic-literal parser tokens
  { day: 3, tokens: ['الاربعاء', 'الأربعاء', 'اربعاء', 'wednesday', 'wed'] }, // ox-allow: arabic-literal parser tokens
  { day: 4, tokens: ['الخميس', 'خميس', 'thursday', 'thu'] }, // ox-allow: arabic-literal parser tokens
  { day: 5, tokens: ['الجمعة', 'جمعة', 'friday', 'fri'] }, // ox-allow: arabic-literal parser tokens
  { day: 6, tokens: ['السبت', 'سبت', 'saturday', 'sat'] }, // ox-allow: arabic-literal parser tokens
];

const CLOSED_TOKENS = ['مغلق', 'مغلقة', 'اجازة', 'إجازة', 'closed', 'off']; // ox-allow: arabic-literal parser tokens
const RANGE_TOKENS = ['الى', 'إلى', 'حتى', ' to ', '-']; // ox-allow: arabic-literal parser tokens
const LABEL_TRAILERS = [':', '-', ',', ' ', '\t', String.fromCharCode(0x060c)];

/** Schema.org day abbreviations in `Date.getDay()` order. */
export const SCHEMA_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Every "H:MM" / "HH:MM" token in a line, normalised to "HH:MM". */
export function extractTimes(line: string): string[] {
  const text = toWesternDigits(line);
  const out: string[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== ':') continue;
    let start = i;
    while (start > 0 && isDigit(text[start - 1])) start -= 1;
    if (start === i) continue;
    let end = i + 1;
    while (end < text.length && isDigit(text[end])) end += 1;
    if (end - (i + 1) !== 2) continue;
    const hour = Number(text.slice(start, i));
    const minute = Number(text.slice(i + 1, end));
    if (!Number.isFinite(hour) || hour > 23 || minute > 59) continue;
    out.push(`${pad(hour)}:${pad(minute)}`);
    i = end - 1;
  }
  return out;
}

function daysOf(label: string): Weekday[] {
  const text = toWesternDigits(label).toLowerCase();
  const hits: Array<{ day: Weekday; at: number }> = [];
  for (const { day, tokens } of DAY_TOKENS) {
    let best = -1;
    for (const token of tokens) {
      const at = text.indexOf(token);
      if (at >= 0 && (best < 0 || at < best)) best = at;
    }
    if (best >= 0) hits.push({ day, at: best });
  }
  if (hits.length === 0) return [];
  hits.sort((a, b) => a.at - b.at);
  const isRange = hits.length === 2 && RANGE_TOKENS.some((token) => text.includes(token.trim()));
  if (!isRange) return hits.map((hit) => hit.day);
  const days: Weekday[] = [];
  const first = hits[0].day;
  const last = hits[1].day;
  for (let step = 0; step < 7; step += 1) {
    const day = ((first + step) % 7) as Weekday;
    days.push(day);
    if (day === last) break;
  }
  return days;
}

function labelOf(line: string): string {
  const text = toWesternDigits(line);
  let cut = text.length;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== ':') continue;
    let start = i;
    while (start > 0 && isDigit(text[start - 1])) start -= 1;
    if (start !== i) {
      cut = start;
      break;
    }
    // A plain "label: value" colon ends the label too.
    cut = i;
    break;
  }
  let label = line.slice(0, cut);
  while (label.length > 0 && LABEL_TRAILERS.includes(label[label.length - 1])) {
    label = label.slice(0, -1);
  }
  return label.trim();
}

/**
 * Parses the `branch_hours` textarea setting. One row per line, tolerant of a
 * weekday range with a time pair, a single weekday with a time pair, a closed
 * row, and Arabic-Indic digits. A line with neither a time pair nor a closed
 * word is dropped, so a half-typed setting never prints a broken row
 * (FINAL-content 5.3: a default-hours record must not print).
 */
export function parseBranchHours(raw?: string | null): HoursRow[] {
  if (!raw) return [];
  const rows: HoursRow[] = [];
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    const times = extractTimes(line);
    const lower = toWesternDigits(line).toLowerCase();
    const closed = times.length < 2 && CLOSED_TOKENS.some((token) => lower.includes(token));
    if (times.length < 2 && !closed) continue;
    const label = labelOf(line) || line;
    rows.push({
      label,
      days: daysOf(label),
      from: closed ? undefined : times[0],
      to: closed ? undefined : times[1],
      closed,
    });
  }
  return rows;
}

/** The row covering `now`'s weekday, if the table names one. */
export function todayRow(rows: HoursRow[], now: Date): HoursRow | undefined {
  const day = now.getDay() as Weekday;
  return rows.find((row) => row.days.includes(day));
}

function minutesOf(time: string): number {
  const [hour, minute] = time.split(':');
  return Number(hour) * 60 + Number(minute);
}

/**
 * Open or closed from the parsed table alone: the fallback for a store whose
 * `settings.opening_hours` record is empty. A row whose `to` is earlier than
 * its `from` runs past midnight.
 */
export function hoursStatus(rows: HoursRow[], now: Date): HoursStatus {
  const row = todayRow(rows, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (row && !row.closed && row.from && row.to) {
    const from = minutesOf(row.from);
    const to = minutesOf(row.to);
    const isOpen =
      to > from ? nowMinutes >= from && nowMinutes < to : nowMinutes >= from || nowMinutes < to;
    if (isOpen) return { isOpen: true };
    if (nowMinutes < from) return { isOpen: false, nextOpen: row.from };
  }
  for (let step = 1; step <= 7; step += 1) {
    const day = ((now.getDay() + step) % 7) as Weekday;
    const next = rows.find(
      (candidate) => candidate.days.includes(day) && !candidate.closed && candidate.from
    );
    if (next) return { isOpen: false, nextOpen: next.from };
  }
  return { isOpen: false };
}

/** schema.org `openingHours` strings, contiguous weekdays compressed. */
export function toSchemaOpeningHours(rows: HoursRow[]): string[] {
  const out: string[] = [];
  for (const row of rows) {
    if (row.closed || !row.from || !row.to || row.days.length === 0) continue;
    const days = [...row.days];
    let index = 0;
    while (index < days.length) {
      let end = index;
      while (end + 1 < days.length && days[end + 1] === days[end] + 1) end += 1;
      const span =
        end === index
          ? SCHEMA_DAYS[days[index]]
          : `${SCHEMA_DAYS[days[index]]}-${SCHEMA_DAYS[days[end]]}`;
      out.push(`${span} ${row.from}-${row.to}`);
      index = end + 1;
    }
  }
  return out;
}

/** Public branch coordinates (FINAL-claims-source 6). */
export const BRANCH_GEO = { latitude: 24.46276125, longitude: 39.653138015 } as const;

/**
 * Theme setting ids the branch surfaces read. A surface renders the line that
 * depends on a setting only when that setting is non-empty.
 */
export const BRANCH_SETTINGS = {
  address: 'branch_address',
  hours: 'branch_hours',
  mapUrl: 'branch_map_url',
  landmark: 'branch_landmark',
  whatsapp: 'whatsapp_number',
  pickupReadyHours: 'pickup_ready_hours',
  pickupHoldDays: 'pickup_hold_days',
} as const;

const KEY = 'ox.content.branch';

/** Everything a branch surface renders, as locale keys. */
export const BRANCH = {
  /** The listing slug the branch page links its "collect" copy from. */
  slug: 'branch',
  icon: 'branch-visit',
  geo: BRANCH_GEO,
  settings: BRANCH_SETTINGS,
  h1Key: `${KEY}.h1`,
  titleKey: `${KEY}.title`,
  /** Shown only on the home block (amendment A4), never on /branch. */
  eyebrowKey: `${KEY}.eyebrow`,
  introKey: `${KEY}.intro`,
  doTitleKey: `${KEY}.do_title`,
  doList: [1, 2, 3, 4, 5].map((n) => ({
    titleKey: `${KEY}.do_${n}_title`,
    lineKey: `${KEY}.do_${n}_line`,
  })),
  hours: {
    titleKey: `${KEY}.hours_title`,
    columnKeys: [`${KEY}.hours_col_day`, `${KEY}.hours_col_from`, `${KEY}.hours_col_to`],
    todayKey: `${KEY}.hours_today`,
    closedKey: `${KEY}.hours_closed`,
    noteKey: `${KEY}.hours_note`,
    statusOpenKey: `${KEY}.status_open`,
    statusClosedKey: `${KEY}.status_closed`,
    statusNextOpenKey: `${KEY}.status_next_open`,
  },
  pickup: {
    titleKey: `${KEY}.pickup_title`,
    stepKeys: [1, 2, 3, 4].map((n) => `${KEY}.pickup_${n}`),
    lateKey: `${KEY}.pickup_late`,
  },
  whatsapp: {
    ctaKey: `${KEY}.whatsapp_cta`,
    lineKey: `${KEY}.whatsapp_line`,
    prefillKey: `${KEY}.whatsapp_prefill`,
  },
  directionsKey: `${KEY}.directions`,
  mapAltKey: `${KEY}.map_alt`,
  faq: [1, 2, 3].map((n) => ({ qKey: `${KEY}.faq_${n}_q`, aKey: `${KEY}.faq_${n}_a` })),
} as const;

/**
 * The branch's public Google Business Profile (docs/build/VISIT-2026-09-24.md
 * §1, checked 2026-09-24). `BRANCH_GEO` above is the claims-source record and
 * feeds the structured data; this is where Google sends a customer who taps
 * the listing, so navigation links are built from it. The two pins are 30 m
 * apart. No API key is involved in any of these URLs: the listing link opens
 * the profile (with its reviews), the directions link opens turn-by-turn
 * navigation, and the embed link is the keyless map frame that
 * `BranchMap` loads only after a tap.
 */
export const BRANCH_LISTING = {
  latitude: 24.4630382,
  longitude: 39.6533422,
  cid: '2204940348214661233',
  listingUrl: 'https://maps.google.com/?cid=2204940348214661233',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=24.4630382,39.6533422',
  embedUrl: 'https://maps.google.com/maps?q=24.4630382,39.6533422&z=16&hl=ar&output=embed',
} as const;
