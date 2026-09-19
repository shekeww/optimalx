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

  it('leaves the prose in bodyHtml, already sanitised, with nothing else in it', () => {
    expect(parts.bodyHtml).toContain('<p>');
    expect(parts.bodyHtml).not.toContain('<table');
    expect(parts.bodyHtml).not.toContain('الحصص:');
    expect(parts.bodyHtml).not.toContain('طريقة الاستخدام');
    expect(parts.bodyHtml).not.toContain('تنبيه');
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
    expect(hostile.bodyHtml).toContain('نص');
  });

  it('keeps the first paragraph in the body when it is prose, not a spec line', () => {
    const prose = splitDescription('<p>وصف عادي للمنتج.</p>');
    expect(prose.specLine).toBeNull();
    expect(prose.bodyHtml).toContain('وصف عادي للمنتج.');
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
