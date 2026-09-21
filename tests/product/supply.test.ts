import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  MAX_DOSE,
  MIN_DOSE,
  clampDose,
  estimateSupply,
  monthsUntilExpiry,
  toIsoDate,
} from '../../app/components/product/lib/supply';
import { effectivePrice } from '../../app/components/product/lib/claims';

/** A fixed clock, so nothing here depends on the day the suite runs. */
const NOW = new Date(2026, 8, 19); // 2026-09-19, local time

describe('supply: days of supply', () => {
  it('divides the label servings by the chosen dose and floors the result', () => {
    expect(estimateSupply(73, 1, NOW)?.days).toBe(73);
    expect(estimateSupply(73, 2, NOW)?.days).toBe(36);
    expect(estimateSupply(73, 3, NOW)?.days).toBe(24);
    expect(estimateSupply(73, 4, NOW)?.days).toBe(18);
  });

  it('dates the run-out from today in the Gregorian calendar with Western digits', () => {
    expect(estimateSupply(30, 1, NOW)?.runOut).toBe('2026-10-19');
    expect(estimateSupply(120, 1, NOW)?.runOut).toBe('2027-01-17');
  });

  it('returns null when the label printed no servings count', () => {
    expect(estimateSupply(null, 1, NOW)).toBeNull();
    expect(estimateSupply(undefined, 1, NOW)).toBeNull();
    expect(estimateSupply(0, 1, NOW)).toBeNull();
  });

  it('returns null rather than reporting zero days', () => {
    expect(estimateSupply(1, 2, NOW)).toBeNull();
  });

  it('clamps the dose to the stepper range instead of trusting the input', () => {
    expect(clampDose(0)).toBe(MIN_DOSE);
    expect(clampDose(-5)).toBe(MIN_DOSE);
    expect(clampDose(9)).toBe(MAX_DOSE);
    expect(clampDose(2.7)).toBe(2);
    expect(clampDose(Number.NaN)).toBe(MIN_DOSE);
    expect(estimateSupply(40, 99, NOW)?.days).toBe(10);
  });

  it('formats a date with padded month and day', () => {
    expect(toIsoDate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
});

describe('supply: expiry proximity', () => {
  it('counts whole months to a YYYY-MM expiry', () => {
    expect(monthsUntilExpiry('2026-09', NOW)).toBe(0);
    expect(monthsUntilExpiry('2027-03', NOW)).toBe(6);
    expect(monthsUntilExpiry('2026-12', NOW)).toBe(3);
    expect(monthsUntilExpiry('2026-06', NOW)).toBe(-3);
  });

  it('returns null for a missing or unparsable expiry', () => {
    expect(monthsUntilExpiry(null, NOW)).toBeNull();
    expect(monthsUntilExpiry('غير منطبق', NOW)).toBeNull();
    expect(monthsUntilExpiry('2026-13', NOW)).toBeNull();
    expect(monthsUntilExpiry('2026', NOW)).toBeNull();
  });
});

describe('there is no price per serving, anywhere', () => {
  /**
   * BUILD.md section 6 is explicit and marks it HARD: "no per-serving pricing
   * anywhere - removed by owner decision. Serving count carries that comparison
   * instead." The claims source repeats it. It had been computed and printed
   * under the price on every product page, so this asserts the helper is gone
   * rather than merely unused, which is what stops it coming back.
   */
  it('exports no helper that could compute one', async () => {
    const supply = await import('../../app/components/product/lib/supply');
    expect(Object.keys(supply)).not.toContain('pricePerServing');
  });

  it('is not rendered by the buy column', () => {
    const source = fs.readFileSync(
      path.join('app', 'components', 'product', 'BuyZone', 'PdpPriceBlock.tsx'),
      'utf8'
    );
    expect(source).not.toContain('pricePerServing');
    expect(source).not.toContain('per_serving');
  });
});

describe('effective price (the API sends sale_price 0 when nothing is discounted)', () => {
  it('shows the regular price for a product that is not on sale', () => {
    // OX-001 live: price 349, regular_price 349, sale_price 0.
    expect(effectivePrice({ is_on_sale: false, price: 349, sale_price: 0, starting_price: null })).toBe(349);
  });

  it('shows the sale price for a product that is on sale', () => {
    expect(effectivePrice({ is_on_sale: true, price: 349, sale_price: 299, starting_price: null })).toBe(299);
  });

  it('prefers the starting price when the product has variants', () => {
    expect(effectivePrice({ is_on_sale: false, price: 349, sale_price: 0, starting_price: 279 })).toBe(279);
  });

  it('parses a string price and gives up on nonsense rather than printing NaN', () => {
    expect(effectivePrice({ is_on_sale: false, price: '349', sale_price: 0, starting_price: null })).toBe(349);
    expect(
      effectivePrice({ is_on_sale: false, price: 'abc', sale_price: 'x', starting_price: null } as never)
    ).toBeUndefined();
  });

  it('treats a free service as free, not as missing', () => {
    expect(effectivePrice({ is_on_sale: false, price: 0, sale_price: 0, starting_price: null })).toBe(0);
  });
});
