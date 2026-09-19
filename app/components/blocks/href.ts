import { isSafeHref } from '../product/lib/sanitizeHtml';

/**
 * Every character that is not a Western digit, dropped. `wa.me` and `tel:`
 * take digits only, and the numbers come from merchant-typed settings that
 * carry spaces, plus signs and brackets.
 */
export function digitsOnly(raw: string): string {
  let out = '';
  for (const char of raw) if (char >= '0' && char <= '9') out += char;
  return out;
}

/**
 * A merchant-typed absolute URL we are willing to put in an href, or an empty
 * string. `isSafeHref` (the product batch's sanitiser, G1-reviewed) rejects
 * every scheme but http and https and every control-character bypass; the
 * second test drops the relative paths and fragments it allows, because a map
 * link is always absolute and off-site.
 */
export function safeExternalUrl(raw: string): string {
  const value = raw.trim();
  if (value.length === 0 || !isSafeHref(value)) return '';
  const scheme = value.slice(0, 8).toLowerCase();
  return scheme.startsWith('http://') || scheme.startsWith('https://') ? value : '';
}
