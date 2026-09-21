import { describe, it, expect } from 'vitest';
import { parseFragment } from '../../app/components/product/lib/sanitizeHtml';
import {
  readNutritionTable,
  splitDescription,
} from '../../app/components/product/lib/nutritionTable';
import catalogue from '../fixtures/product/catalogue-descriptions.json';

const PRODUCTS = catalogue as { sku: string; type: string; description_html_ar: string }[];
const whey = PRODUCTS.find((p) => p.sku === 'OX-001')!;

/** Stands in for app/content/glossary.ts until P1a lands it. */
const glossary = (name: string): string | null =>
  name === 'البروتين' ? 'ox.content.glossary.protein' : null;

describe('nutritionTable', () => {
  it('reads the label table of a live product', () => {
    const table = readNutritionTable(parseFragment(whey.description_html_ar));
    expect(table).not.toBeNull();
    expect(table?.headers).toEqual(['الحقائق الغذائية', 'لكل حصة']);
    expect(table?.rows[0]).toMatchObject({ name: 'السعرات الحرارية', perServing: '120' });
    expect(table?.rows.map((row) => row.name)).toContain('البروتين');
  });

  it('fills the third column from the glossary and leaves it null otherwise', () => {
    const table = readNutritionTable(parseFragment(whey.description_html_ar), glossary);
    const protein = table?.rows.find((row) => row.name === 'البروتين');
    const calories = table?.rows.find((row) => row.name === 'السعرات الحرارية');
    expect(protein?.meaningKey).toBe('ox.content.glossary.protein');
    expect(calories?.meaningKey).toBeNull();
  });

  it('returns null when the description has no table', () => {
    expect(readNutritionTable(parseFragment('<p>لا جدول هنا.</p>'))).toBeNull();
  });

  it('skips a row with no nutrient name and keeps a row with no amount', () => {
    const table = readNutritionTable(
      parseFragment('<table><tr><td></td><td>9</td></tr><tr><td>حديد</td></tr></table>')
    );
    expect(table?.rows).toEqual([{ name: 'حديد', perServing: '', meaningKey: null }]);
  });

  it('is immune to markup inside the cells', () => {
    const table = readNutritionTable(
      parseFragment('<table><tr><td><script>x</script><b>زنك</b></td><td>11 ملغ</td></tr></table>')
    );
    expect(table?.rows[0]).toMatchObject({ name: 'زنك', perServing: '11 ملغ' });
  });
});

describe('splitDescription', () => {
  const parts = splitDescription(whey.description_html_ar, glossary);

  it('pulls the spec line, the table, how to use and the warning out of the body', () => {
    expect(parts.specLine?.servings).toBe(73);
    expect(parts.nutrition?.rows.length).toBeGreaterThan(3);
    expect(parts.howToUse.length).toBeGreaterThan(0);
    expect(parts.warning.length).toBeGreaterThan(0);
  });

  it('leaves the prose in the lead and bodyHtml, with nothing else in either', () => {
    expect(parts.lead.length).toBeGreaterThan(0);
    for (const value of [parts.lead, parts.bodyHtml]) {
      expect(value).not.toContain('<table');
      expect(value).not.toContain('الحصص:');
      expect(value).not.toContain('طريقة الاستخدام');
      expect(value).not.toContain('تنبيه');
    }
  });

  it('takes the first prose paragraph as the buy column short description', () => {
    // The lead is plain text, not markup: nothing merchant-authored can reach
    // the DOM through the buy column at all.
    expect(parts.lead).not.toContain('<');
    expect(parts.bodyHtml).not.toContain(parts.lead);
  });

  it('drops the labels from the how-to-use and warning lines', () => {
    expect(parts.howToUse[0].startsWith('طريقة الاستخدام')).toBe(false);
    expect(parts.warning[0].startsWith('تنبيه')).toBe(false);
  });

  it('never lets merchant script reach bodyHtml', () => {
    const hostile = splitDescription(
      '<p>الحصص: 5</p><p>نص<script>alert(1)</script></p><p onclick="x()">مزيد</p>'
    );
    expect(hostile.bodyHtml).not.toContain('script');
    expect(hostile.bodyHtml).not.toContain('onclick');
    expect(hostile.lead).toBe('نص');
    expect(hostile.bodyHtml).toContain('مزيد');
  });

  it('reads the first paragraph as the lead when it is prose, not a spec line', () => {
    const prose = splitDescription('<p>وصف عادي للمنتج.</p>');
    expect(prose.specLine).toBeNull();
    expect(prose.lead).toBe('وصف عادي للمنتج.');
    expect(prose.bodyHtml).toBe('');
  });

  it('handles an empty description without throwing', () => {
    const empty = splitDescription(null);
    expect(empty).toMatchObject({
      specLine: null,
      nutrition: null,
      bodyHtml: '',
      howToUse: [],
      warning: [],
      text: '',
    });
  });

  it('splits every live description without losing the prose', () => {
    const problems: string[] = [];
    for (const product of PRODUCTS) {
      const result = splitDescription(product.description_html_ar);
      if (result.text.length === 0) problems.push(product.sku + ': no text');
      if (result.bodyHtml.indexOf('<script') >= 0) problems.push(product.sku + ': script leaked');
    }
    expect(problems).toEqual([]);
  });
});
