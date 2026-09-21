import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * The claims and design gates B6 can be tested for without a browser
 * (PLAN-final 0.3 and 6.5, `docs/build/research/FINAL-claims-source.md`
 * section 4).
 *
 * Two files are scanned: the batch's own copy, and the batch's own
 * stylesheet. Copy is where a claim gets made, and the stylesheet is where
 * the two design rules that are actually enforceable in text live, the shadow
 * ban and the accent alias.
 */
const PARTIALS = ['locales/partials/b6.ar.json', 'locales/partials/b6.en.json'];
const SHEET = path.join('app', 'styles', '06-ox', '_b6-commerce.scss');

function values(file: string): [string, string][] {
  return Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>);
}

/**
 * Verbatim from section 4 of the claims source. Paraphrasing a banned term
 * into a synonym is the same violation, so the list is copied, never reworded.
 */
const BANNED_AR = [
  'يعالج',
  'يشفي',
  'يقي',
  'يحرق الدهون',
  'يزيد العضلات',
  'مضمون',
  'نتائج خلال',
  'آمن 100%',
  'بدون آثار جانبية',
  'مثبت سريريا',
  'أفضل في السعودية',
  'رقم 1',
  'أخصائي',
  'صيدلي',
  'طبيب',
  'مدرب معتمد',
];

const BANNED_EN = [
  'clinically proven',
  '100% safe',
  'no side effects',
  'guaranteed',
  'results in',
  'best in saudi',
  'number one',
  'cures',
  'treats',
  'prevents',
  'burns fat',
];

/** Retailers the store competes with; supplier brands are allowed. */
const COMPETITORS = ['نهدي', 'nahdi', 'الدواء', 'aldawaa', 'noon', 'نون', 'iherb'];

describe('B6 copy', () => {
  it('makes no treatment, outcome or certification claim', () => {
    const offenders: string[] = [];
    for (const [key, value] of values(PARTIALS[0])) {
      for (const term of BANNED_AR) if (value.includes(term)) offenders.push(`${key}: ${term}`);
    }
    for (const [key, value] of values(PARTIALS[1])) {
      const lower = value.toLowerCase();
      for (const term of BANNED_EN) if (lower.includes(term)) offenders.push(`${key}: ${term}`);
    }
    expect(offenders).toEqual([]);
  });

  it('names no competitor retailer', () => {
    const offenders: string[] = [];
    for (const file of PARTIALS) {
      for (const [key, value] of values(file)) {
        const lower = value.toLowerCase();
        for (const name of COMPETITORS) if (lower.includes(name)) offenders.push(`${key}: ${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * The store has zero orders, zero reviews and no carrier agreement, so every
   * number a commerce string could carry would be invented. The two that are
   * legitimate, the free-shipping threshold and the visitor's own cart count,
   * arrive as interpolations and are stripped before the check.
   */
  it('hardcodes no figure: every number in the copy is an interpolation', () => {
    const offenders: string[] = [];
    for (const file of PARTIALS) {
      for (const [key, value] of values(file)) {
        const stripped = value.replace(/\{\{[^}]+\}\}/g, '');
        if (/[0-9\u0660-\u0669]/.test(stripped)) offenders.push(`${key}: ${value}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('states no delivery window or arrival date', () => {
    const offenders: string[] = [];
    for (const [key, value] of values(PARTIALS[0])) {
      // "خلال N أيام" and "يصل" are the two shapes a delivery promise takes.
      if (/خلال\s+\S+\s*(يوم|أيام|ساعة)/.test(value)) offenders.push(`${key}: ${value}`);
    }
    for (const [key, value] of values(PARTIALS[1])) {
      if (/\barrives?\b|\bdelivered (in|within|by)\b/i.test(value)) offenders.push(`${key}: ${value}`);
    }
    expect(offenders).toEqual([]);
  });

  it('names no payment method in text (the marks are SallaPayments)', () => {
    const offenders: string[] = [];
    const methods = ['mada', 'apple pay', 'visa', 'mastercard', 'tabby', 'tamara', 'stc pay'];
    for (const file of PARTIALS) {
      for (const [key, value] of values(file)) {
        const lower = value.toLowerCase();
        for (const m of methods) if (lower.includes(m)) offenders.push(`${key}: ${m}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('B6 stylesheet', () => {
  const sheet = fs.readFileSync(SHEET, 'utf8');
  /**
   * The header comment quotes the declarations it explains, so the rule scans
   * run against the code with the `//` comments removed.
   */
  const code = sheet
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');

  /**
   * There is not one drop shadow in the approved image. Every `box-shadow` in
   * this file switches one off; a declaration with a real value would put one
   * back (PLAN-final 0.2 point 2).
   */
  it('declares no drop shadow, only the removal of the engine ones', () => {
    const declarations = [...code.matchAll(/box-shadow:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(declarations.length).toBeGreaterThan(0);
    expect(declarations.filter((value) => value !== 'none')).toEqual([]);
  });

  /**
   * `applyTheme()` overwrites `--color-primary` inline on `<html>` from the
   * dashboard after hydration, so a component built against it reverts to the
   * old orange on every load. The theme builds against `--ox-accent`
   * (scratchpad/brand-assets.md).
   */
  it('builds against --ox-accent, never --color-primary', () => {
    expect(code.includes('var(--color-primary')).toBe(false);
  });

  it('carries no em-dash', () => {
    expect(sheet.includes(String.fromCharCode(0x2014))).toBe(false);
  });

  /**
   * Motion on transform and opacity only, never colour (DIRECTION 7.1). A
   * `transition` shorthand naming a colour or `all` is the usual way that
   * rule gets broken.
   */
  it('transitions only transform and opacity', () => {
    const offenders = [...code.matchAll(/transition(?:-property)?:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((value) => value !== 'none')
      .filter((value) => !/^(transform|opacity|grid-template-rows)\b/.test(value));
    expect(offenders).toEqual([]);
  });
});
