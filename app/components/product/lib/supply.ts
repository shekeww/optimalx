/**
 * The supply calculator's arithmetic (DIRECTION 5.4 SupplyCalculator).
 *
 * It describes the package, never a person: "the tub holds N servings, so at
 * D servings a day it lasts floor(N / D) days". There is no recommended dose
 * anywhere in this file, and nothing is computed when the label did not print
 * a servings count.
 */

/** Servings per day the stepper allows (DIRECTION 5.4: 1 to 4). */
export const MIN_DOSE = 1;
export const MAX_DOSE = 4;

/**
 * The dosage forms a package is CONSUMED in, as the catalogue writes them on
 * the spec line's `الشكل` field (UX-2026-09-24 P0-13).
 *
 * The measured defect: a reusable shaker bottle (`الشكل: عبوة`, `الحصص: 1`)
 * was described as lasting one day and running out tomorrow, because the only
 * gate was "the label printed a servings number". A bottle, a gift card, a
 * digital file and a booking are not consumed, so the days-of-supply question
 * is not asked of them at all. The set is the catalogue's own vocabulary
 * (powder, capsules, tablets, softgel, bar, liquid), never a guess: `عبوة`,
 * `خدمة`, `ملف رقمي` and `بطاقة رقمية` are deliberately not in it.
 */
export const CONSUMABLE_FORMS: readonly string[] = [
  'بودرة',
  'كبسولات',
  'أقراص',
  'سوفت جيل',
  'بار',
  'سائل',
];

/** Servings below this describe a package nobody doses: one serving is the thing itself. */
const MIN_SERVINGS = 2;

/**
 * Whether the days-of-supply question means anything for this package: the
 * label printed at least two servings AND the form is one a body consumes.
 * Both, never either.
 */
export function isConsumablePack(
  spec: { servings?: number | null; form?: string | null } | null | undefined
): boolean {
  const servings = spec?.servings;
  if (typeof servings !== 'number' || !Number.isFinite(servings) || servings < MIN_SERVINGS) {
    return false;
  }
  const form = spec?.form?.trim();
  return Boolean(form && CONSUMABLE_FORMS.includes(form));
}

export interface SupplyEstimate {
  /** Whole days the package covers at this dose. */
  days: number;
  /** ISO date (YYYY-MM-DD, Gregorian, Western digits) the package runs out. */
  runOut: string;
}

/** Clamps a stepper value into the allowed dose range. */
export function clampDose(dose: number): number {
  if (!Number.isFinite(dose)) return MIN_DOSE;
  const whole = Math.floor(dose);
  if (whole < MIN_DOSE) return MIN_DOSE;
  if (whole > MAX_DOSE) return MAX_DOSE;
  return whole;
}

/** `YYYY-MM-DD` for a date, in Western digits, without a timezone shift. */
export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dash = String.fromCharCode(45);
  return year + dash + month + dash + day;
}

/**
 * Days of supply and the run-out date, or null when the servings count is
 * missing or the arithmetic would not produce at least one whole day.
 *
 * @param servings servings printed on the label (specLine.servings)
 * @param dose     servings per day the shopper picked
 * @param now      injectable clock, so the test is not time-dependent
 */
export function estimateSupply(
  servings: number | null | undefined,
  dose: number,
  now: Date = new Date()
): SupplyEstimate | null {
  if (typeof servings !== 'number' || !Number.isFinite(servings) || servings <= 0) return null;
  const perDay = clampDose(dose);
  const days = Math.floor(servings / perDay);
  if (days < 1) return null;
  const runOut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  runOut.setDate(runOut.getDate() + days);
  return { days, runOut: toIsoDate(runOut) };
}

/**
 * Whole months between `now` and a `YYYY-MM` expiry, or null when the expiry
 * is missing or unparsable. Used for the "expiry under six months" note; the
 * note never renders on a guess.
 */
export function monthsUntilExpiry(
  expiry: string | null | undefined,
  now: Date = new Date()
): number | null {
  if (!expiry || expiry.length !== 7) return null;
  const year = parseInt(expiry.slice(0, 4), 10);
  const month = parseInt(expiry.slice(5, 7), 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return (year - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
}

