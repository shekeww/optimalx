import { describe, it, expect } from 'vitest';
import {
  LABEL_EXPIRY,
  LABEL_FORM,
  LABEL_REPLY_TIME,
  LABEL_SERVINGS,
  LABEL_SERVING_SIZE,
  isNotApplicable,
  parseSpecLine,
  parseSpecLineText,
} from '../../app/components/product/lib/specLine';
import catalogue from '../fixtures/product/catalogue-descriptions.json';

/** The 47 live products, generated from research/catalogue.json. */
const PRODUCTS = catalogue as { sku: string; type: string; description_html_ar: string }[];

const PHYSICAL_TYPES = ['product', 'food', 'group_products'];

describe('specLine: the 47 catalogue lines', () => {
  it('parses a spec line out of every live product description', () => {
    const missing = PRODUCTS.filter((p) => parseSpecLine(p.description_html_ar) === null);
    expect(missing.map((p) => p.sku)).toEqual([]);
  });

  it('reads servings, serving size, expiry and form on every physical, food and bundle product', () => {
    const problems: string[] = [];
    for (const product of PRODUCTS) {
      if (PHYSICAL_TYPES.indexOf(product.type) < 0) continue;
      const spec = parseSpecLine(product.description_html_ar);
      if (!spec) {
        problems.push(product.sku + ': no spec line');
        continue;
      }
      if (spec.servingsText === null) problems.push(product.sku + ': no ' + LABEL_SERVINGS);
      if (spec.servingSize === null) problems.push(product.sku + ': no ' + LABEL_SERVING_SIZE);
      if (spec.expiryText === null) problems.push(product.sku + ': no ' + LABEL_EXPIRY);
      if (spec.form === null) problems.push(product.sku + ': no ' + LABEL_FORM);
    }
    expect(problems).toEqual([]);
  });

  it('reads OX-001 exactly', () => {
    const product = PRODUCTS.find((p) => p.sku === 'OX-001');
    const spec = parseSpecLine(product?.description_html_ar);
    expect(spec).toMatchObject({
      servings: 73,
      servingsText: '73',
      servingSize: '31 جم',
      expiry: '2028-03',
      expiryText: '2028-03',
      form: 'بودرة',
    });
    expect(spec?.fields).toHaveLength(4);
  });

  it('leaves the expiry null when the label says the field does not apply (OX-036)', () => {
    const product = PRODUCTS.find((p) => p.sku === 'OX-036');
    const spec = parseSpecLine(product?.description_html_ar);
    expect(spec?.expiry).toBeNull();
    expect(isNotApplicable(spec?.expiryText)).toBe(true);
  });

  it('leaves servings null when the value is not a bare count (OX-041 reads "30 يوما")', () => {
    const product = PRODUCTS.find((p) => p.sku === 'OX-041');
    const spec = parseSpecLine(product?.description_html_ar);
    expect(spec?.servingsText).toBe('30 يوما');
    expect(spec?.servings).toBe(30);
  });

  it('keeps the unknown labels of the digital, gift card and service products', () => {
    const digital = parseSpecLine(
      PRODUCTS.find((p) => p.sku === 'OX-042')?.description_html_ar
    );
    expect(digital?.servings).toBeNull();
    expect(digital?.fields.map((f) => f.label)).toContain('الصيغة');

    const service = parseSpecLine(PRODUCTS.find((p) => p.sku === 'OX-045')?.description_html_ar);
    expect(service?.fields.map((f) => f.label)).toContain('المدة');
    expect(service?.fields.map((f) => f.label)).toContain(LABEL_REPLY_TIME);
  });
});

describe('specLine: tolerance and refusal', () => {
  it('returns null when the first paragraph is prose', () => {
    expect(parseSpecLine('<p>بروتين واي سريع الامتصاص.</p><p>الحصص: 10</p>')).toBeNull();
  });

  it('returns null for an empty or missing description', () => {
    expect(parseSpecLine(null)).toBeNull();
    expect(parseSpecLine(undefined)).toBeNull();
    expect(parseSpecLine('')).toBeNull();
    expect(parseSpecLine('<p></p>')).toBeNull();
  });

  it('tolerates extra spacing around the separators', () => {
    const spec = parseSpecLineText('  الحصص :  30   |   الشكل :  كبسولات  ');
    expect(spec?.servings).toBe(30);
    expect(spec?.form).toBe('كبسولات');
  });

  it('accepts a line with only some of the four fields', () => {
    const spec = parseSpecLineText('الحصص: 20');
    expect(spec).toMatchObject({ servings: 20, servingSize: null, expiry: null, form: null });
  });

  it('rejects an expiry that is not exactly YYYY-MM', () => {
    expect(parseSpecLineText('الصلاحية: 2028')?.expiry).toBeNull();
    expect(parseSpecLineText('الصلاحية: 03-2028')?.expiry).toBeNull();
    expect(parseSpecLineText('الصلاحية: 2028-3')?.expiry).toBeNull();
    expect(parseSpecLineText('الصلاحية: 2028-03')?.expiry).toBe('2028-03');
  });

  it('never invents a servings number from a non-numeric value', () => {
    expect(parseSpecLineText('الحصص: غير محدد')?.servings).toBeNull();
  });

  it('strips markup before reading the line', () => {
    const spec = parseSpecLine('<p><strong>الحصص:</strong> 12 | الشكل: بار</p>');
    expect(spec?.servings).toBe(12);
    expect(spec?.form).toBe('بار');
  });
});
