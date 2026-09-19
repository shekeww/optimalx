/**
 * Weight conversion for `/tools/converter` (DIRECTION 6.18).
 *
 * Pure arithmetic in its own module: no engine import, so the maths can be
 * tested without a DOM or a store, and the page keeps no logic of its own.
 * Weight only. There is deliberately no scoop unit: a scoop is a per-product
 * measure printed on a label, and converting one here would invent a number.
 */

/** Grams per unit. */
export const UNITS = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
} as const;

export type UnitId = keyof typeof UNITS;
export const UNIT_IDS = Object.keys(UNITS) as UnitId[];

/**
 * Converts `value` from one weight unit to another. Returns null for anything
 * that is not a finite, positive number, so a half-typed input shows the hint
 * rather than NaN.
 */
export function convert(value: number, from: UnitId, to: UnitId): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return (value * UNITS[from]) / UNITS[to];
}

/** Up to three decimals, trailing zeros dropped, always Western numerals. */
export function formatAmount(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}
