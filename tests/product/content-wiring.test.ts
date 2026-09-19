import { describe, it, expect } from 'vitest';
import { createT } from './i18n-mock';
import {
  MEDICAL_LINE_KEY,
  categorySlugOf,
  pdpFaqItems,
  prePurchaseRows,
} from '../../app/components/product/lib/faq';
import { createGlossaryLookup } from '../../app/components/product/lib/glossary';
import { splitDescription } from '../../app/components/product/lib/nutritionTable';
import catalogue from '../fixtures/product/catalogue-descriptions.json';

/**
 * B3 reads three P1a content maps: `faq.ts` for the FAQ and the
 * pre-purchase rows, and `glossary.ts` for the nutrition table's third
 * column. These tests hold the seam: what the maps promise, and what the PDP
 * refuses to render when a promise is not yet kept.
 */
const t = createT('ar');
const PRODUCTS = catalogue as { sku: string; description_html_ar: string }[];

describe('category slug extraction (C15: keyed by slug, never by id)', () => {
  it('reads the slug out of a category URL', () => {
    expect(categorySlugOf('https://optimalx.com.sa/whey-protein/c123')).toBe('whey-protein');
    expect(categorySlugOf('/creatine/c9')).toBe('creatine');
  });

  it('returns undefined for anything that is not a category URL', () => {
    expect(categorySlugOf(undefined)).toBeUndefined();
    expect(categorySlugOf('https://optimalx.com.sa/p1996831868')).toBeUndefined();
    expect(categorySlugOf('https://optimalx.com.sa/')).toBeUndefined();
  });
});

describe('PDP FAQ rows', () => {
  it('is empty without a translator, so the head never emits a half-built node', () => {
    expect(pdpFaqItems(undefined)).toEqual([]);
    expect(prePurchaseRows(undefined)).toEqual([]);
  });

  it('renders no TODO-copy placeholder, and carries the mandatory price row B7 delivered', () => {
    // A marked placeholder must never reach a shopper or a crawler; the price
    // item's answer is now written, so the row itself has to be there.
    const rows = pdpFaqItems(t, 'https://optimalx.com.sa/whey-protein/c1');
    expect(rows.every((row) => !row.answer.startsWith('TODO-copy:'))).toBe(true);
    expect(rows.map((row) => row.id)).toContain('faq-price');
  });

  it('resolves the owning category rows when the slug is one the map knows', () => {
    const rows = pdpFaqItems(t, 'https://optimalx.com.sa/whey-protein/c1');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.question.startsWith('ox.')).toBe(false);
      expect(row.answer.startsWith('ox.')).toBe(false);
    }
  });

  it('leaves the mandated medical line out of the droppable rows', () => {
    const rows = prePurchaseRows(t);
    expect(rows.some((row) => row.answer === t(MEDICAL_LINE_KEY))).toBe(false);
  });
});

describe('glossary lookup for the nutrition table', () => {
  const lookup = createGlossaryLookup(t);

  it('returns null for every nutrient without a translator', () => {
    expect(createGlossaryLookup(undefined)('البروتين')).toBeNull();
  });

  it('fills the macronutrient rows B7 added to the glossary', () => {
    for (const name of ['البروتين', 'الكربوهيدرات', 'الدهون', 'السكريات', 'السعرات الحرارية']) {
      const key = lookup(name);
      expect(key, name).not.toBeNull();
      expect(t(key as string).startsWith('ox.'), name).toBe(false);
    }
    // The longer alias wins, so the saturated row is never given the fat line.
    expect(lookup('الدهون المشبعة')).toBe('ox.content.glossary.saturated_fat.def');
  });

  it('fills a row the glossary does cover', () => {
    const creatine = lookup('كرياتين مونوهيدرات');
    expect(creatine).not.toBeNull();
    expect(t(creatine as string).startsWith('ox.')).toBe(false);
  });

  it('never fills a cell for a nutrient it does not know', () => {
    expect(lookup('عنصر غير موجود في المسرد')).toBeNull();
  });

  it('runs over every live label without throwing', () => {
    for (const product of PRODUCTS) {
      const parts = splitDescription(product.description_html_ar, lookup);
      for (const row of parts.nutrition?.rows ?? []) {
        expect(typeof row.name, product.sku).toBe('string');
        if (row.meaningKey !== null) expect(row.meaningKey.startsWith('ox.')).toBe(true);
      }
    }
  });
});
