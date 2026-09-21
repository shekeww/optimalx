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

