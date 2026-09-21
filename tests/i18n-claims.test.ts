import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import { checkClaims, ALLOWLIST } from '../scripts/check-claims.mjs';

/**
 * The claims gate (GOV-013): every string check-claims.mjs can reach, run
 * the same way `node scripts/check-claims.mjs` runs it, must produce no
 * finding outside the reviewed allowlist. This is the regression test for
 * PLAN-ship-2026-09-21.md §2 Batch S4 step 1, and for the two defects that
 * gate exists to catch: the owner's "ليس مضرا" health verdict
 * (`ox.content.categories.protein.faq_3_a`, commit 9d8a70e) and the
 * "بأفضل سعر" price superlative in 14 category and goal titles.
 */

const PARTIALS_DIR = path.join('locales', 'partials');

function isAllowed(f: { key: string; rule: string }) {
  return ALLOWLIST.some((a) => a.key === f.key && a.rule === f.rule);
}

function readPartials() {
  if (!fs.existsSync(PARTIALS_DIR)) return [];
  return fs
    .readdirSync(PARTIALS_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(PARTIALS_DIR, name));
}

describe('claims gate (locales)', () => {
  it('locales/ar.json has no claims finding outside the allowlist', () => {
    const findings = checkClaims('locales/ar.json', JSON.stringify(ar)).filter((f) => !isAllowed(f));
    expect(findings).toEqual([]);
  });

  it('locales/en.json has no claims finding outside the allowlist', () => {
    const findings = checkClaims('locales/en.json', JSON.stringify(en)).filter((f) => !isAllowed(f));
    expect(findings).toEqual([]);
  });

  it('every locales/partials/*.json file has no claims finding outside the allowlist', () => {
    const problems: string[] = [];
    for (const file of readPartials()) {
      const findings = checkClaims(file, fs.readFileSync(file, 'utf8')).filter((f) => !isAllowed(f));
      for (const f of findings) problems.push(`${f.file}:${f.key} [${f.rule}] ${f.match ?? ''}`);
    }
    expect(problems).toEqual([]);
  });

  it('does not regress the owner health-verdict defect (commit 9d8a70e)', () => {
    const value = (ar as Record<string, string>)['ox.content.categories.protein.faq_3_a'];
    expect(value).toBeDefined();
    expect(checkClaims('sample', JSON.stringify({ k: value }))).toEqual([]);
  });

  it('does not regress the "بأفضل سعر" price superlative in the 14 titles', () => {
    const titleKeys = Object.keys(ar as Record<string, string>).filter((k) => k.endsWith('.title'));
    const offenders = titleKeys.filter((k) => (ar as Record<string, string>)[k].includes('بأفضل سعر'));
    expect(offenders).toEqual([]);
  });

  it('every allowlist entry names a real key, in ar or en, with a rule and a reason', () => {
    const problems: string[] = [];
    for (const entry of ALLOWLIST) {
      if (!(entry.key in ar) && !(entry.key in en)) problems.push(`${entry.key}: not a real locale key`);
      if (!entry.rule) problems.push(`${entry.key}: missing rule`);
      if (!entry.reason || entry.reason.trim().length < 10) problems.push(`${entry.key}: missing or too-short reason`);
    }
    expect(problems).toEqual([]);
  });
});

describe('claims gate (rule classes, synthetic)', () => {
  it('catches each Arabic violation class', () => {
    const sample = {
      superlative: 'بأفضل سعر لا يوجد مثله',
      'health-outcome': 'لا، هذا غير مضر بالمرة',
      'professional-title': 'دكتور اوبتيمال يوصي بهذا المنتج',
      'payment-name': 'ادفع عبر تابي الآن',
      'threshold-literal': 'الشحن مجاني فوق 299 ريال',
      'reply-time': 'نرد خلال 24 ساعة على كل سؤال',
      'official-distributor': 'نحن موزعون رسميون معتمدون لهذه العلامة',
      'invented-number': 'أكثر من 5000 عميل راض عنا',
    };
    const findings = checkClaims('sample/ar.json', JSON.stringify(sample));
    const rules = new Set(findings.map((f) => f.rule));
    for (const rule of Object.keys(sample)) expect(rules.has(rule), rule).toBe(true);
  });

  it('catches each English violation class', () => {
    const sample = {
      superlative: 'the best whey protein in the Kingdom',
      'payment-name': 'pay with Apple Pay or Visa',
      'reply-time': 'we reply within 24 hours',
      'invented-number': 'over 5000 happy customers',
    };
    const findings = checkClaims('sample/en.json', JSON.stringify(sample));
    const rules = new Set(findings.map((f) => f.rule));
    for (const rule of Object.keys(sample)) expect(rules.has(rule), rule).toBe(true);
  });

  it('exempts "على مدى" (extent) from the payment-name rule', () => {
    const findings = checkClaims('sample/ar.json', JSON.stringify({ k: 'يمتص الكازين على مدى ساعات' }));
    expect(findings).toEqual([]);
  });

  it('exempts "دفع آمن" (secure checkout) from the health-outcome rule', () => {
    const findings = checkClaims('sample/ar.json', JSON.stringify({ k: 'دفع آمن بجميع الوسائل' }));
    expect(findings).toEqual([]);
  });

  it('exempts a redirect to an outside professional from the professional-title rule', () => {
    const findings = checkClaims(
      'sample/ar.json',
      JSON.stringify({ k: 'للحالات المرضية، راجع طبيبك أو أخصائي التغذية.' })
    );
    expect(findings).toEqual([]);
  });

  it('exempts the templated reply-time form ("{{hours}}") from the reply-time rule', () => {
    const findings = checkClaims('sample/ar.json', JSON.stringify({ k: 'الرد خلال {{hours}} ساعة عمل.' }));
    expect(findings).toEqual([]);
  });
});
