/**
 * A `vi.mock` factory for `@salla.sa/twilight-theme-engine/i18n`, built from
 * the real locale files so a component under test resolves the same keys it
 * resolves after `pnpm i18n:merge`.
 *
 * `tests/helpers/i18n.ts` is the shared version, but it resolves the repo root
 * with `fileURLToPath(import.meta.url)`, which throws ERR_INVALID_URL_SCHEME
 * under the jsdom environment this suite runs in (the same reason
 * tests/blocks keeps its own copy). Static JSON imports instead: no fs, no
 * URL, and Vite inlines them.
 *
 *   vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
 *     (await import('./i18n-mock')).i18nModuleMock('ar')
 *   );
 */
import arBase from '../../locales/ar.json';
import enBase from '../../locales/en.json';
import arP1a from '../../locales/partials/p1a.ar.json';
import enP1a from '../../locales/partials/p1a.en.json';
import arB3 from '../../locales/partials/b3.ar.json';
import enB3 from '../../locales/partials/b3.en.json';

export type Lang = 'ar' | 'en';
export type Dictionary = Record<string, string>;

const DICTIONARIES: Record<Lang, Dictionary> = {
  ar: { ...(arBase as Dictionary), ...(arP1a as Dictionary), ...(arB3 as Dictionary) },
  en: { ...(enBase as Dictionary), ...(enP1a as Dictionary), ...(enB3 as Dictionary) },
};

export function dictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

const OPEN = '{{';
const CLOSE = '}}';

/** i18next-style interpolation with the engine's default double braces. */
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

export type TOptions = { defaultValue?: string; [name: string]: unknown };
export type TFn = (key: string, arg?: string | TOptions) => string;

export function createT(lang: Lang): TFn {
  const dict = dictionary(lang);
  return (key, arg) => {
    const options: TOptions = typeof arg === 'object' && arg !== null ? arg : {};
    const fallback = typeof arg === 'string' ? arg : options.defaultValue;
    const raw = dict[key];
    if (raw === undefined) return fallback ?? key;
    return interpolate(raw, options);
  };
}

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
