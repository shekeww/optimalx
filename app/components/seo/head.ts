/**
 * URL helpers for head descriptors (canonical, robots) and JSON-LD ids.
 *
 * Locale prefix rule (engine, locale routing): a multilingual store serves
 * every URL under `/{locale}/` (`/` redirects to `/ar/`); a single-language
 * store serves none and redirects `/ar/x` to `/x`. The canonical must equal
 * the served URL (a redirected canonical is a defect), so callers pass the
 * locale only when `store.settings.is_multilingual` is true.
 */

/** `https://host` with no trailing slash. Throws on a malformed URL. */
export function originOf(url: string): string {
  return new URL(url).origin;
}

/** `originOf` for untrusted input: null instead of throwing, for hook guards. */
export function tryOriginOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** The served URL for `path`: origin, the `/{locale}` prefix when given, path. */
export function currentUrl(origin: string, locale: string | null | undefined, path: string): string {
  const base = origin.replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!locale) return `${base}${normalized}`;
  const alreadyPrefixed = normalized === `/${locale}` || normalized.startsWith(`/${locale}/`);
  if (alreadyPrefixed) return `${base}${normalized}`;
  return normalized === '/' ? `${base}/${locale}/` : `${base}/${locale}${normalized}`;
}

/** Canonical href for the served URL: query string and fragment dropped. */
export function canonicalFor(
  origin: string,
  locale: string | null | undefined,
  path: string
): string {
  return currentUrl(origin, locale, path.replace(/[?#].*$/, ''));
}

/** Value for the head `robots` field (`<meta name="robots">`). */
export function robots(noindex: boolean): string {
  return noindex ? 'noindex, follow' : 'index, follow';
}

/** Removes a leading `/{lang}` segment when it is one of the store languages. */
export function stripLocale(path: string, languages: readonly string[]): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const first = normalized.split('/')[1] ?? '';
  if (!first || !languages.includes(first)) return normalized;
  const rest = normalized.slice(first.length + 1);
  return rest === '' ? '/' : rest;
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * hreflang cluster for a multilingual store (head `alternateLanguages`):
 * x-default first (ar when the store has it, else the first language), then
 * one prefix-aware entry per language. Undefined for a single-language store,
 * which gets no cluster at all.
 */
export function hreflangFor(
  origin: string,
  path: string,
  languages: readonly string[]
): HreflangLink[] | undefined {
  if (languages.length < 2) return undefined;
  const clean = stripLocale(path.replace(/[?#].*$/, ''), languages);
  const fallback = languages.includes('ar') ? 'ar' : languages[0];
  return [
    { hreflang: 'x-default', href: currentUrl(origin, fallback, clean) },
    ...languages.map((lang) => ({ hreflang: lang, href: currentUrl(origin, lang, clean) })),
  ];
}
