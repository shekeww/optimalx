import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import { checkCopy, DIALECT_WORDS } from '../scripts/check-copy.mjs';
import { collectPartials, flatten, parityErrors } from '../scripts/i18n-merge.mjs';

const arEntries = Object.entries(ar as Record<string, string>);
const enEntries = Object.entries(en as Record<string, string>);

const PARTIALS_DIR = path.join('locales', 'partials');
const LANGS = ['ar', 'en'] as const;
type Lang = (typeof LANGS)[number];

/** The two base blocks P0 froze (FINAL-content 9, ox.a11y.* and ox.common.*). */
const P0_KEYS = [
  'ox.a11y.skip',
  'ox.a11y.menu_open',
  'ox.a11y.menu_close',
  'ox.a11y.search_open',
  'ox.a11y.cart_items',
  'ox.a11y.wishlist_toggle',
  'ox.a11y.gallery_next',
  'ox.a11y.gallery_prev',
  'ox.a11y.close_dialog',
  'ox.a11y.loading',
  'ox.a11y.required',
  'ox.common.view_all',
  'ox.common.loading',
  'ox.common.close',
  'ox.common.back',
  'ox.common.next',
  'ox.common.previous',
  'ox.common.save',
  'ox.common.cancel',
  'ox.common.confirm',
  'ox.common.retry',
  'ox.common.sar',
  'ox.common.free',
  'ox.common.new',
  'ox.common.optional',
  'ox.common.learn_more',
  'ox.common.show_more',
  'ox.common.show_less',
];
const FROZEN_PREFIXES = ['ox.a11y.', 'ox.common.'];
const TODO_PREFIX = 'TODO-copy:';

interface PartialFile {
  batch: string;
  lang: Lang;
  file: string;
  text: string;
  flat: Record<string, string>;
}

/** Every `<batch>.<lang>.json` under locales/partials, parsed and flattened. */
function readPartials(): PartialFile[] {
  if (!fs.existsSync(PARTIALS_DIR)) return [];
  const out: PartialFile[] = [];
  for (const name of fs.readdirSync(PARTIALS_DIR).sort()) {
    if (!name.endsWith('.json')) continue;
    const lang = LANGS.find((l) => name.endsWith(`.${l}.json`));
    if (!lang) continue;
    const file = path.join(PARTIALS_DIR, name);
    const text = fs.readFileSync(file, 'utf8');
    out.push({
      batch: name.slice(0, -`.${lang}.json`.length),
      lang,
      file,
      text,
      flat: flatten(JSON.parse(text)) as Record<string, string>,
    });
  }
  return out;
}

const partials = readPartials();
const batches = [...new Set(partials.map((p) => p.batch))];
const byLang = {
  ar: collectPartials(PARTIALS_DIR, 'ar'),
  en: collectPartials(PARTIALS_DIR, 'en'),
};
const base: Record<Lang, Record<string, string>> = { ar, en };

describe('locales', () => {
  it('ar and en declare the same key set', () => {
    const arKeys = arEntries.map(([k]) => k).sort();
    const enKeys = enEntries.map(([k]) => k).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it('declares the B0 scaffolding keys', () => {
    for (const key of [
      'ox.a11y.skip',
      'ox.common.view_all',
      'ox.common.loading',
      'ox.common.close',
      'ox.common.back',
    ]) {
      expect(ar).toHaveProperty(key);
      expect(en).toHaveProperty(key);
    }
  });

  it('declares every ox.a11y.* and ox.common.* key from FINAL-content 9 (P0 base blocks)', () => {
    const missing = P0_KEYS.filter((key) => !(key in ar) || !(key in en));
    expect(missing).toEqual([]);
    const extra = Object.keys(ar).filter(
      (key) => FROZEN_PREFIXES.some((p) => key.startsWith(p)) && !P0_KEYS.includes(key)
    );
    expect(extra).toEqual([]);
  });

  it('has no Arabic diacritics (U+064B-U+0652, U+0670) in any ar value', () => {
    const offenders = arEntries.filter(([, v]) => /[ً-ْٰ]/u.test(v));
    expect(offenders).toEqual([]);
  });

  it('has no em-dash (U+2014) in any value', () => {
    const offenders = [...arEntries, ...enEntries].filter(([, v]) => v.includes('—'));
    expect(offenders).toEqual([]);
  });

  it('has no dialect tokens as whole words in ar values', () => {
    const pattern = new RegExp(`(?<![\\p{L}\\p{M}])(${DIALECT_WORDS.join('|')})(?![\\p{L}\\p{M}])`, 'u');
    const offenders = arEntries.filter(([, v]) => pattern.test(v));
    expect(offenders).toEqual([]);
  });

  it('check-copy reports the same verdict as the tests', () => {
    expect(checkCopy('locales/ar.json', JSON.stringify(ar))).toEqual([]);
    expect(checkCopy('locales/en.json', JSON.stringify(en))).toEqual([]);
  });

  it('check-copy catches each violation class', () => {
    const findings = checkCopy(
      'sample/ar.json',
      JSON.stringify({ a: 'شكراً', b: 'نص — نص', c: 'وش تبي', d: 'موقع نظيف' })
    );
    expect(findings.map((f) => f.rule).sort()).toEqual(['diacritic', 'dialect', 'em-dash']);
  });
});

describe('locale partials (in memory, same rules as the merged files)', () => {
  it('every batch ships an ar and an en partial with the same key set', () => {
    const problems: string[] = [];
    for (const batch of batches) {
      const pair = Object.fromEntries(
        LANGS.map((lang) => [lang, partials.find((p) => p.batch === batch && p.lang === lang)])
      ) as Record<Lang, PartialFile | undefined>;
      for (const lang of LANGS) {
        if (!pair[lang]) problems.push(`${batch}: missing ${batch}.${lang}.json`);
      }
      if (!pair.ar || !pair.en) continue;
      const arKeys = Object.keys(pair.ar.flat).sort();
      const enKeys = Object.keys(pair.en.flat).sort();
      for (const key of arKeys) if (!enKeys.includes(key)) problems.push(`${batch}: "${key}" only in ar`);
      for (const key of enKeys) if (!arKeys.includes(key)) problems.push(`${batch}: "${key}" only in en`);
    }
    expect(problems).toEqual([]);
  });

  it('holds only flat string values under ox.* and never conflicts across batches', () => {
    for (const p of partials) {
      const raw = JSON.parse(p.text) as Record<string, unknown>;
      const nonString = Object.entries(raw).filter(([, v]) => typeof v !== 'string');
      expect(nonString, `${p.file}: nested or non-string values`).toEqual([]);
      const outside = Object.keys(p.flat).filter((k) => !k.startsWith('ox.'));
      expect(outside, `${p.file}: keys outside ox.*`).toEqual([]);
    }
    expect(byLang.ar.errors).toEqual([]);
    expect(byLang.en.errors).toEqual([]);
    expect(parityErrors({ ar: byLang.ar.entries, en: byLang.en.entries })).toEqual([]);
  });

  it('never redefines a base key with a different value, and adds nothing to the frozen P0 blocks', () => {
    const problems: string[] = [];
    for (const p of partials) {
      for (const [key, value] of Object.entries(p.flat)) {
        const existing = base[p.lang][key];
        if (existing !== undefined && existing !== value) {
          problems.push(`${p.file}: "${key}" redefines the base value`);
        }
        if (FROZEN_PREFIXES.some((prefix) => key.startsWith(prefix)) && !P0_KEYS.includes(key)) {
          problems.push(`${p.file}: "${key}" is outside the frozen P0 blocks (ox.a11y.*, ox.common.*)`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('passes the copy lint; TODO-copy placeholders are allowed', () => {
    for (const p of partials) {
      expect(checkCopy(p.file, p.text), p.file).toEqual([]);
    }
    expect(checkCopy('sample/x.ar.json', JSON.stringify({ 'ox.x.y': `${TODO_PREFIX} نص مؤقت` }))).toEqual([]);
  });

  it('a TODO-copy placeholder is a plain prefix, present in both languages of the pair', () => {
    const problems: string[] = [];
    for (const batch of batches) {
      const pair = LANGS.map((lang) => partials.find((p) => p.batch === batch && p.lang === lang));
      if (pair.some((p) => !p)) continue;
      const [arP, enP] = pair as PartialFile[];
      for (const key of Object.keys(arP.flat)) {
        const arTodo = arP.flat[key].startsWith(TODO_PREFIX);
        const enTodo = (enP.flat[key] ?? '').startsWith(TODO_PREFIX);
        if (arTodo !== enTodo) problems.push(`${batch}: "${key}" is TODO-copy in one language only`);
      }
    }
    expect(problems).toEqual([]);
  });
});
