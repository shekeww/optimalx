import ar from '../../../locales/ar.json';
import en from '../../../locales/en.json';

/**
 * Translation lookup for head descriptors.
 *
 * A route's `head` runs outside React, and `TwilightContext`
 * (theme-engine dist/twilight/context.d.ts:29-47) carries the query client,
 * the store settings, the locale, the route id and the location, but no
 * translator: there is no `ctx.i18n`, so a head that calls `ctx.i18n.t(key)`
 * silently falls back to printing the key. That is how the static pages
 * shipped their `<title>` as `ox.services.meta_title`.
 *
 * The theme's own strings live in `locales/*.json`, which the engine's Vite
 * plugin already loads for the runtime `t()`, so importing them here resolves
 * to the same modules rather than a second copy. Only `ox.*` keys are read;
 * anything else belongs to the platform dictionary and is left to the runtime.
 */

const DICTIONARIES: Record<string, Record<string, string>> = {
  ar: ar as Record<string, string>,
  en: en as Record<string, string>,
};

/** The store's default language when a route is served without a prefix. */
export const DEFAULT_LOCALE = 'ar';

/**
 * The string for `key` in `locale`, falling back to Arabic and then to the key
 * itself, which keeps a missing key visible in a test instead of blank in a tab.
 */
export function headString(locale: string | null | undefined, key: string): string {
  const dictionary = (locale && DICTIONARIES[locale]) || DICTIONARIES[DEFAULT_LOCALE];
  const value = dictionary?.[key];
  if (typeof value === 'string' && value.length > 0) return value;
  const fallback = DICTIONARIES[DEFAULT_LOCALE]?.[key];
  return typeof fallback === 'string' && fallback.length > 0 ? fallback : key;
}

/**
 * A `t`-shaped function bound to one locale, for the head builders that pass a
 * translator down to a content map (the FAQ resolvers).
 */
export function headTranslator(locale: string | null | undefined): (key: string) => string {
  return (key: string) => headString(locale, key);
}
