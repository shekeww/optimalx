/**
 * Locale dictionaries for tests (P0 shared-file protocol).
 *
 * Loads the base `locales/<lang>.json` plus every
 * `locales/partials/<batch>.<lang>.json` into one flat map, so a component
 * under test resolves the same `t('ox.*')` keys it resolves after
 * `pnpm i18n:merge`. The mock mirrors the engine's i18next options
 * (theme-engine chunk-PJWFEMBX.js: keySeparator ".", nsSeparator false,
 * interpolation with double braces, escapeValue false): a missing key returns
 * the key, a string second argument or `defaultValue` is the fallback.
 *
 * `vi.mock` is hoisted, so a test declares the mock itself and points the
 * factory here (tests/setup.tsx is frozen; per-file mocks only):
 *
 *   vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
 *     (await import('../helpers/i18n')).i18nModuleMock('ar')
 *   );
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectPartials, flatten } from '../../scripts/i18n-merge.mjs';

export type Lang = 'ar' | 'en';
export type Dictionary = Record<string, string>;

export const I18N_MODULE = '@salla.sa/twilight-theme-engine/i18n';
/**
 * Vitest rewrites `import.meta.url` to a plain module id, not a file URL, so
 * the URL form is tried first and the runner's working directory (the repo
 * root, per vitest.config.ts) is the fallback.
 */
function repoRoot(): string {
  const url = import.meta.url;
  if (typeof url === 'string' && url.startsWith('file:')) {
    return fileURLToPath(new URL('../../', url));
  }
  return process.cwd();
}

export const REPO_ROOT = repoRoot();
export const LOCALES_DIR = path.join(REPO_ROOT, 'locales');
export const PARTIALS_DIR = path.join(LOCALES_DIR, 'partials');

const cache = new Map<Lang, Dictionary>();

/** Base locale plus every partial for `lang`, flattened to dotted keys. */
export function loadDictionary(lang: Lang): Dictionary {
  const cached = cache.get(lang);
  if (cached) return cached;
  const base = flatten(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${lang}.json`), 'utf8')));
  const dictionary: Dictionary = { ...(base as Dictionary) };
  const { entries } = collectPartials(PARTIALS_DIR, lang) as {
    entries: Map<string, { value: string; file: string }>;
  };
  for (const [key, { value }] of entries) dictionary[key] = value;
  cache.set(lang, dictionary);
  return dictionary;
}

/** Drops the cached dictionaries (for tests that write partial fixtures). */
export function resetDictionaries(): void {
  cache.clear();
}

export type TOptions = { defaultValue?: string; [name: string]: unknown };
export type TFn = (key: string, arg?: string | TOptions) => string;

const OPEN = '{{';
const CLOSE = '}}';

/** i18next-style interpolation with the engine's default double-brace prefix. */
export function interpolate(value: string, options: Record<string, unknown>): string {
  let out = '';
  let rest = value;
  for (;;) {
    const start = rest.indexOf(OPEN);
    if (start < 0) return out + rest;
    const end = rest.indexOf(CLOSE, start + OPEN.length);
    if (end < 0) return out + rest;
    const name = rest.slice(start + OPEN.length, end).trim();
    const replacement = options[name];
    out +=
      rest.slice(0, start) +
      (replacement === undefined ? rest.slice(start, end + CLOSE.length) : String(replacement));
    rest = rest.slice(end + CLOSE.length);
  }
}

/** A `t` bound to the merged dictionary of `lang`. */
export function createT(lang: Lang): TFn {
  const dictionary = loadDictionary(lang);
  return (key, arg) => {
    const options: TOptions = typeof arg === 'object' && arg !== null ? arg : {};
    const fallback = typeof arg === 'string' ? arg : options.defaultValue;
    const raw = dictionary[key];
    if (raw === undefined) return fallback ?? key;
    return interpolate(raw, options);
  };
}

/**
 * Module shape for `vi.mock('@salla.sa/twilight-theme-engine/i18n', ...)`:
 * `useTranslation` plus the locale constants the engine re-exports.
 */
export function i18nModuleMock(lang: Lang = 'ar') {
  const t = createT(lang);
  const isRTL = lang === 'ar';
  const direction: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';
  const languageName = isRTL ? 'العربية' : 'English';
  const value = {
    t,
    i18n: { language: lang, dir: () => direction, t },
    ready: true,
    locale: lang,
    direction,
    isRTL,
    isLTR: !isRTL,
    languageName,
  };
  return {
    useTranslation: () => value,
    FALLBACK_LOCALE: 'ar',
    FALLBACK_DIR: 'rtl',
    FALLBACK_LANGUAGE_NAME: 'العربية',
    RTL_LOCALES: ['ar'],
    SUPPORTED_LOCALES: ['ar', 'en'],
    isLocale: (candidate: unknown) => candidate === 'ar' || candidate === 'en',
  };
}
