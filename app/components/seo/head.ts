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
