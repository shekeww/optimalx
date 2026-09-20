import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Every `t('ox.*')` and `t('common.*')` key the theme asks for must exist in
 * both locales.
 *
 * This exists because three of them did not, and it showed. On 2026-09-20 the
 * live homepage printed `ox.home.products_eyebrow`, `ox.home.categories_eyebrow`
 * and `ox.home.faq_eyebrow` as literal text above three section headings, at
 * both widths, because i18next falls back to rendering the key itself when it
 * cannot resolve one. The cause was ordinary: the owner asked for the section
 * sub-headings to go, the copy was deleted from the locale files, and the
 * `eyebrow` prop was left being passed. Nothing failed, nothing warned, and
 * the least premium thing a storefront can do went live.
 *
 * Four more were found in the same sweep, in components that had never been
 * registered and so had never had the chance to print theirs.
 *
 * A grep is the right shape for this. The alternative, rendering every surface
 * and reading the DOM, needs a provider per component and still misses any
 * branch the test data does not reach.
 *
 * Limits, stated so nobody trusts this further than it goes: it only sees keys
 * written as a single-quoted literal directly inside `t(...)`. A key built at
 * runtime, or held in a constant elsewhere, is invisible to it. Those are
 * covered by the content-map tests, which assert their key constants resolve.
 */

const KEY_CALL = /\bt\(\s*'((?:ox|common)\.[A-Za-z0-9_.]+)'/g;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

function load(locale: string): Record<string, string> {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'locales', `${locale}.json`), 'utf8'));
}

describe('locale keys', () => {
  const ar = load('ar');
  const en = load('en');
  const files = sourceFiles(path.join(process.cwd(), 'app'));

  it('finds keys to check, so a broken walker cannot pass silently', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('resolves every literal t() key in app/ against both locales', () => {
    const missing: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      for (const match of src.matchAll(KEY_CALL)) {
        const key = match[1];
        const rel = path.relative(process.cwd(), file).split(path.sep).join('/');
        if (!(key in ar)) missing.push(`${key} (ar) <- ${rel}`);
        if (!(key in en)) missing.push(`${key} (en) <- ${rel}`);
      }
    }
    expect(missing, `unresolved keys would render as literal text:\n${missing.join('\n')}`).toEqual(
      []
    );
  });

  it('keeps the two locales at exact key parity', () => {
    expect(Object.keys(ar).filter((key) => !(key in en))).toEqual([]);
    expect(Object.keys(en).filter((key) => !(key in ar))).toEqual([]);
  });

  it('ships no empty value, which renders as a blank line rather than a key', () => {
    for (const [locale, table] of [
      ['ar', ar],
      ['en', en],
    ] as const) {
      const blank = Object.entries(table)
        .filter(([, value]) => typeof value === 'string' && value.trim() === '')
        .map(([key]) => `${locale}:${key}`);
      expect(blank).toEqual([]);
    }
  });
});

/**
 * The second half of the problem, and the one the grep above cannot see.
 *
 * The content maps do not write their keys as literals inside `t(...)`. They
 * build them (`eyebrowKey: `${KEY}.snacks_eyebrow``) and a component calls
 * `t(card.eyebrowKey)`. The grep sees `t(card.eyebrowKey)` and learns nothing.
 *
 * That gap was not hypothetical. The poster carousel shipped with fifteen
 * unresolved keys and printed every one of them on the page as literal text
 * the moment the block was registered, while the grep test above was passing.
 *
 * So this walks the content modules themselves and resolves every property
 * whose name ends in `Key`, which is the convention those maps already follow.
 */
describe('locale keys built by the content maps', () => {
  const ar = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'locales', 'ar.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'locales', 'en.json'), 'utf8'));

  /** Every string under a `*Key` property, however deeply nested. */
  function collectKeys(node: unknown, out: Set<string>, seen = new Set<unknown>()): Set<string> {
    if (!node || typeof node !== 'object' || seen.has(node)) return out;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const item of node) collectKeys(item, out, seen);
      return out;
    }
    for (const [prop, value] of Object.entries(node as Record<string, unknown>)) {
      if (typeof value === 'string') {
        // `somethingKey` and the SCREAMING_CASE `SOMETHING_KEY` exports alike.
        if (/(Key|_KEY)$/.test(prop) && /^(ox|common)\./.test(value)) out.add(value);
      } else {
        collectKeys(value, out, seen);
      }
    }
    return out;
  }

  it('resolves every *Key the content modules build', async () => {
    const dir = path.join(process.cwd(), 'app', 'content');
    const modules = fs
      .readdirSync(dir)
      .filter((name) => /\.ts$/.test(name))
      .sort();
    expect(modules.length).toBeGreaterThan(5);

    const keys = new Set<string>();
    for (const name of modules) {
      const mod = (await import(`../app/content/${name.replace(/\.ts$/, '')}`)) as Record<
        string,
        unknown
      >;
      collectKeys(mod, keys);
    }
    expect(keys.size).toBeGreaterThan(20);

    const missing = [...keys]
      .filter((key) => !(key in ar) || !(key in en))
      .sort();
    expect(missing, 'content maps build keys that do not resolve: ' + missing.join(', ')).toEqual(
      []
    );
  });
});
